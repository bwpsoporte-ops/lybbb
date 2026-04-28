'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';

export async function changePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const userId = formData.get('userId') as string;

  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const updatedUserList = await db.update(users)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(users.id, userId))
    .returning();

  if (updatedUserList.length === 0) {
    return { error: 'No se pudo actualizar el usuario' };
  }

  const user = updatedUserList[0];

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

  redirect('/dashboard');
}

export async function createPartner(formData: FormData) {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const tempPassword = formData.get('password') as string;
  const ownerId = formData.get('ownerId') as string;

  const existing = await db.query.users.findFirst({
    where: eq(users.username, username)
  });

  if (existing) {
    return { error: 'El nombre de usuario ya existe' };
  }

  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const newPartnerList = await db.insert(users).values({
    name,
    username,
    passwordHash,
    role: 'PARTNER',
    mustChangePassword: true,
    coupleId: ownerId,
  }).returning();

  const newPartner = newPartnerList[0];

  // Also set the owner's coupleId to the newly created partner
  await db.update(users).set({ coupleId: newPartner.id }).where(eq(users.id, ownerId));

  return { success: true };
}
