'use server';

import { db } from '@/db';
import { incomes } from '@/db/schema';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createIncome(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('No session');

  const type = formData.get('type') as string;
  const amount = formData.get('amount') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const visibility = formData.get('visibility') as string;
  
  await db.insert(incomes).values({
    userId: session.id,
    type,
    amount,
    description,
    date,
    visibility,
  });

  revalidatePath('/incomes');
  return { success: true };
}
