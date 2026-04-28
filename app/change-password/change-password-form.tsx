'use client';

import { changePassword } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState } from 'react';

export function ChangePasswordForm({ userId }: { userId: string }) {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    formData.append('userId', userId);
    return await changePassword(formData);
  }, { error: '' });

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="password">Nueva Contraseña</Label>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          required 
          placeholder="••••••••" 
          className="rounded-xl h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
        <Input 
          id="confirmPassword" 
          name="confirmPassword" 
          type="password" 
          required 
          placeholder="••••••••" 
          className="rounded-xl h-12"
        />
      </div>
      {state?.error && (
        <p className="text-red-500 text-sm">{state.error}</p>
      )}
      <Button 
        type="submit" 
        disabled={isPending} 
        className="w-full rounded-xl h-12 bg-gray-900 text-white hover:bg-gray-800"
      >
        {isPending ? 'Actualizando...' : 'Actualizar y Continuar'}
      </Button>
    </form>
  );
}
