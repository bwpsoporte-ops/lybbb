'use client';

import { loginUser } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState, useEffect } from 'react';

const initialState = {
  error: '',
};

export function LoginForm() {
  // Using useActionState from react 19
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await loginUser(formData);
  }, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input 
          id="username" 
          name="username" 
          type="text" 
          required 
          placeholder="Ej: bryan" 
          className="rounded-xl h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input 
          id="password" 
          name="password" 
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
        {isPending ? 'Iniciando...' : 'Ingresar'}
      </Button>
    </form>
  );
}
