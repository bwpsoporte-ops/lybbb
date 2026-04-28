import { getSession } from '@/lib/session';
import { db } from '@/db';
import { incomes, expenses, creditCards, projects, fixedExpenses, coupleBalances } from '@/db/schema';
import { eq, and, sql, or } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();

  // Fetch incomes
  const dbIncomes = await db.query.incomes.findMany({
    where: and(
      or(eq(incomes.userId, session.id), and(eq(incomes.visibility, 'SHARED'), session.coupleId ? eq(incomes.userId, session.coupleId) : undefined)),
      sql`EXTRACT(MONTH FROM ${incomes.date}) = ${currentMonth}`,
      sql`EXTRACT(YEAR FROM ${incomes.date}) = ${currentYear}`
    )
  });

  const totalIncomes = dbIncomes.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Fetch expenses
  const dbExpenses = await db.query.expenses.findMany({
    where: and(
      or(eq(expenses.userId, session.id), and(eq(expenses.visibility, 'SHARED'), session.coupleId ? eq(expenses.userId, session.coupleId) : undefined)),
      sql`EXTRACT(MONTH FROM ${expenses.date}) = ${currentMonth}`,
      sql`EXTRACT(YEAR FROM ${expenses.date}) = ${currentYear}`
    )
  });

  const personalExpenses = dbExpenses.filter(e => e.visibility === 'PRIVATE' || (e.visibility === 'SHARED' && e.userId === session.id && e.splitType !== 'SPLIT'));
  const totalPersonalExpenses = personalExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const available = totalIncomes - totalPersonalExpenses; // simplified for now

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen financiero de {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-gray-900">L {available.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Ingresos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">L {totalIncomes.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">Gastos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">L {totalPersonalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-medium tracking-tight text-gray-900 mb-4">Últimos Gastos</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {dbExpenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No hay gastos recientes</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {dbExpenses.slice(0, 5).map((expense) => (
                <li key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{expense.category}</p>
                    <p className="text-xs text-gray-500">{expense.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600 text-sm">-L {Number(expense.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
