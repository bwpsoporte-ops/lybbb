'use client';

import { createExpense } from '@/app/actions/expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function ExpenseForm({ coupleActive }: { coupleActive: boolean }) {
  const [visibility, setVisibility] = useState('PRIVATE');
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    formData.append('visibility', visibility);
    const res = await createExpense(formData);
    if (res.success) {
        toast.success('Gasto guardado correctamente');
        (document.getElementById('expense-form') as HTMLFormElement)?.reset();
    }
    return res;
  }, null);

  const categories = [
    'Comida', 'Transporte', 'Casa', 'Universidad', 'Carro', 'Salud', 
    'Deudas', 'Tarjeta', 'Entretenimiento', 'Restaurantes', 
    'Servicios del hogar', 'Supermercado', 'Ropa', 'Educación', 'Emergencias', 'Otro'
  ];

  return (
    <form id="expense-form" action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select name="category" required defaultValue="Comida">
          <SelectTrigger className="rounded-xl h-12">
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Descripción Corta</Label>
        <Input id="type" name="type" required placeholder="Ej: Pizza Hut" className="rounded-xl h-12" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto (L)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0.00" className="rounded-xl h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="rounded-xl h-12" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Método de Pago</Label>
        <Select name="paymentMethod" required defaultValue="Tarjeta">
          <SelectTrigger className="rounded-xl h-12">
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Efectivo">Efectivo</SelectItem>
            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
            <SelectItem value="Transferencia">Transferencia</SelectItem>
            <SelectItem value="Banco">Banco</SelectItem>
            <SelectItem value="Otro">Otro</SelectItem>
          </SelectContent>
        </Select>
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

      {visibility === 'SHARED' && (
        <div className="space-y-2 p-4 bg-gray-50 rounded-xl">
          <Label htmlFor="splitType">División</Label>
          <Select name="splitType" defaultValue="50/50">
            <SelectTrigger className="rounded-xl bg-white">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50/50">50 / 50</SelectItem>
              <SelectItem value="70/30">70 / 30 (Yo pago 70%)</SelectItem>
              <SelectItem value="30/70">30 / 70 (Yo pago 30%)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">El sistema creará una deuda interna según esta división.</p>
        </div>
      )}

      {(state as any)?.error && (
        <p className="text-red-500 text-sm">{(state as any).error}</p>
      )}

      <Button type="submit" disabled={isPending} className="w-full rounded-xl h-12 bg-gray-900 text-white hover:bg-gray-800">
        {isPending ? 'Guardando...' : 'Guardar Gasto'}
      </Button>
    </form>
  );
}
