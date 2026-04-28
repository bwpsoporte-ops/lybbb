import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { expenses } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { ExpenseForm } from './expense-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ExpensesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const myExpenses = await db.query.expenses.findMany({
    where: or(
      eq(expenses.userId, session.id),
      and(eq(expenses.visibility, 'SHARED'), session.coupleId ? eq(expenses.userId, session.coupleId) : undefined)
    ),
    orderBy: (expenses, { desc }) => [desc(expenses.createdAt)]
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Gastos</h1>
        <p className="text-gray-500 mt-1">Registra y administra tus gastos y los de tu pareja</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 border-r border-gray-100 pr-8">
          <Card className="rounded-2xl border-none shadow-sm sticky top-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">Nuevo Gasto</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ExpenseForm coupleActive={!!session.coupleId} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             {myExpenses.length === 0 ? (
               <div className="p-8 text-center text-gray-500">No tienes gastos registrados.</div>
             ) : (
                <div className="divide-y divide-gray-50">
                  {myExpenses.map(expense => (
                    <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                      <div>
                        <p className="font-medium text-gray-900">{expense.category}</p>
                        <p className="text-sm text-gray-500">{expense.type} • {expense.paymentMethod} {expense.visibility === 'SHARED' && ' • Compartido'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">-L {Number(expense.amount).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
}
