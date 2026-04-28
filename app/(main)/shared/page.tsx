import { getSession } from '@/lib/session';
import { db } from '@/db';
import { coupleBalances, expenses, users } from '@/db/schema';
import { eq, or, desc, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SharedPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!session.coupleId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Finanzas Compartidas</h1>
        <p className="text-gray-500">No tienes una pareja vinculada a tu cuenta. Entra a Configuración para crear un usuario de pareja.</p>
      </div>
    );
  }

  // Get all PENDING balances involving this user and their partner
  const pendingBalances = await db.query.coupleBalances.findMany({
    where: and(
      eq(coupleBalances.status, 'PENDING'),
      or(
        and(eq(coupleBalances.payerId, session.id), eq(coupleBalances.owerId, session.coupleId)),
        and(eq(coupleBalances.owerId, session.id), eq(coupleBalances.payerId, session.coupleId))
      )
    ),
    with: {
      expense: true,
      payer: true,
      ower: true,
    },
    orderBy: [desc(coupleBalances.createdAt)]
  });

  // Calculate net balance
  let iOwe = 0;
  let partnerOwes = 0;

  pendingBalances.forEach(b => {
    const amt = Number(b.amount);
    if (b.owerId === session.id) {
      iOwe += amt;
    } else {
      partnerOwes += amt;
    }
  });

  const netBalance = partnerOwes - iOwe; // positive = I am owed, negative = I owe

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Balance de Pareja</h1>
        <p className="text-gray-500 mt-1">Saldos pendientes y gastos compartidos</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-none shadow-sm bg-red-50 text-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Debo pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">L {iOwe.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-sm bg-green-50 text-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Me deben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">L {partnerOwes.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-gray-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Balance Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {netBalance > 0 ? '+' : ''}L {netBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {netBalance > 0 ? 'A favor tuyo' : netBalance < 0 ? 'En contra tuya' : 'Todo al día'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-medium">Gastos Pendientes de Saldar</h2>
        </div>
        {pendingBalances.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay gastos pendientes</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pendingBalances.map(balance => {
              const imPayer = balance.payerId === session.id;
              return (
                <div key={balance.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50">
                  <div>
                    <h3 className="font-medium text-gray-900">{balance.expense?.type || 'Gasto Compartido'}</h3>
                    <p className="text-sm text-gray-500">
                      Total: L {Number(balance.expense?.amount || 0).toFixed(2)} • {new Date(balance.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {imPayer ? 'Tu pareja te debe' : 'Tú debes'}
                      </p>
                      <p className={`font-semibold ${imPayer ? 'text-green-600' : 'text-red-600'}`}>
                        L {Number(balance.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
