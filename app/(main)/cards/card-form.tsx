'use client';

import { createCard } from '@/app/actions/cards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState, useState } from 'react';
import { toast } from 'sonner';

export function CreditCardForm({ coupleActive }: { coupleActive: boolean }) {
  const [visibility, setVisibility] = useState('PRIVATE');
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    formData.append('visibility', visibility);
    const res = await createCard(formData);
    if (res.success) {
        toast.success('Tarjeta guardada');
        (document.getElementById('card-form') as HTMLFormElement)?.reset();
    }
    return res;
  }, null);

  return (
    <form id="card-form" action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bank">Banco</Label>
        <Input id="bank" name="bank" required placeholder="Ej: BAC" className="rounded-xl h-12" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre / Alias</Label>
        <Input id="name" name="name" required placeholder="Ej: Platinum" className="rounded-xl h-12" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastFour">Últimos 4 Dígitos</Label>
        <Input id="lastFour" name="lastFour" required placeholder="1234" maxLength={4} className="rounded-xl h-12 font-mono" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creditLimit">Límite de Crédito (L)</Label>
        <Input id="creditLimit" name="creditLimit" type="number" step="0.01" required placeholder="0.00" className="rounded-xl h-12" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="balance">Saldo Actual (L)</Label>
        <Input id="balance" name="balance" type="number" step="0.01" defaultValue="0" className="rounded-xl h-12" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cutDate">Corte</Label>
          <Input id="cutDate" name="cutDate" type="date" required className="rounded-xl h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Pago</Label>
          <Input id="dueDate" name="dueDate" type="date" required className="rounded-xl h-12" />
        </div>
      </div>

      {coupleActive && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <Label>Visibilidad</Label>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant={visibility === 'PRIVATE' ? 'default' : 'outline'}
              className="flex-1 rounded-xl"
              onClick={() => setVisibility('PRIVATE')}
            >
              Privado
            </Button>
            <Button 
              type="button" 
              variant={visibility === 'SHARED' ? 'default' : 'outline'}
              className="flex-1 rounded-xl"
              onClick={() => setVisibility('SHARED')}
            >
              Compartido
            </Button>
          </div>
        </div>
      )}

      {(state as any)?.error && (
        <p className="text-red-500 text-sm">{(state as any).error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full rounded-xl h-12 bg-gray-900 text-white hover:bg-gray-800">
        {isPending ? 'Guardando...' : 'Guardar Tarjeta'}
      </Button>
    </form>
  );
}
