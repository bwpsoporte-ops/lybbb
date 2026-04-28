'use client';

import { createPartner } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

export function CreatePartnerForm({ ownerId }: { ownerId: string }) {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    formData.append('ownerId', ownerId);
    return await createPartner(formData);
  }, null);

  useEffect(() => {
    if (state?.success) {
      toast.success('Usuario pareja creado con éxito');
      // reload to reflect changes
      window.location.reload();
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input id="name" name="name" required placeholder="Ej: Maria Lopez" className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Nombre de Usuario</Label>
        <Input id="username" name="username" required placeholder="Ej: maria95" className="rounded-xl" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña Temporal</Label>
        <Input id="password" name="password" type="password" required placeholder="••••••••" className="rounded-xl" />
      </div>
      {state?.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} className="rounded-xl bg-gray-900 text-white hover:bg-gray-800">
        {isPending ? 'Creando...' : 'Crear Usuario'}
      </Button>
    </form>
  );
}
