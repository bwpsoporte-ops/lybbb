'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Se requieren usuario y contraseña' };
  }

  const user = await db.query.users.findFirst({
    where: (u) => eq(u.username, username),
  });

  if (!user) {
    return { error: 'Usuario no encontrado' };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return { error: 'Contraseña incorrecta' };
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    coupleId: user.coupleId,
    mustChangePassword: user.mustChangePassword,
  };

  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  if (user.mustChangePassword) {
    redirect('/change-password');
  }

  redirect('/dashboard');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}
