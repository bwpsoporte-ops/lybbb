'use server';

import { db } from '@/db';
import { creditCards } from '@/db/schema';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createCard(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('No session');

  const bank = formData.get('bank') as string;
  const name = formData.get('name') as string;
  const lastFour = formData.get('lastFour') as string;
  const creditLimit = formData.get('creditLimit') as string;
  const balance = formData.get('balance') as string;
  const cutDate = formData.get('cutDate') as string;
  const dueDate = formData.get('dueDate') as string;
  const visibility = formData.get('visibility') as string;
  
  await db.insert(creditCards).values({
    userId: session.id,
    bank,
    name,
    lastFour,
    creditLimit,
    balance: balance || '0',
    cutDate,
    dueDate,
    visibility,
  });

  revalidatePath('/cards');
  return { success: true };
}
