import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { creditCards } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCardForm } from './card-form';

export default async function CardsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const myCards = await db.query.creditCards.findMany({
    where: or(
      eq(creditCards.userId, session.id),
      and(eq(creditCards.visibility, 'SHARED'), session.coupleId ? eq(creditCards.userId, session.coupleId) : undefined)
    ),
    orderBy: (cards, { desc }) => [desc(cards.createdAt)]
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Tarjetas de Crédito</h1>
        <p className="text-gray-500 mt-1">Controla tus límites, saldos y fechas de pago</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border-r border-gray-100 pr-8">
          <Card className="rounded-2xl border-none shadow-sm sticky top-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">Nueva Tarjeta</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <CreditCardForm coupleActive={!!session.coupleId} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
             {myCards.length === 0 ? (
               <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                 No tienes tarjetas registradas.
               </div>
             ) : (
                myCards.map(card => {
                  const available = Number(card.creditLimit) - Number(card.balance);
                  const usagePercentage = (Number(card.balance) / Number(card.creditLimit)) * 100;
                  
                  return (
                    <div key={card.id} className="bg-gray-900 text-white rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-56">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         {/* decorative circle */}
                         <div className="w-24 h-24 rounded-full border-4 border-white"></div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-300 text-sm">{card.bank}</p>
                            <p className="font-semibold text-lg">{card.name}</p>
                          </div>
                          {card.visibility === 'SHARED' && (
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Compartida</span>
                          )}
                        </div>
                        <p className="mt-4 font-mono tracking-widest text-gray-400">**** **** **** {card.lastFour}</p>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-gray-400">Saldo Actual</p>
                            <p className="font-medium">L {Number(card.balance).toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Disponible</p>
                            <p className="font-medium">L {available.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {/* usage bar */}
                        <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${usagePercentage > 80 ? 'bg-red-500' : 'bg-gray-300'}`} 
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
