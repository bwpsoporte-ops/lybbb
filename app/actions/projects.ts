'use server';

import { db } from '@/db';
import { projects } from '@/db/schema';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createProject(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('No session');

  const name = formData.get('name') as string;
  const targetAmount = formData.get('targetAmount') as string;
  const targetDate = formData.get('targetDate') as string;
  const visibility = formData.get('visibility') as string;
  
  await db.insert(projects).values({
    userId: session.id,
    name,
    targetAmount,
    targetDate,
    currentAmount: '0',
    visibility,
  });

  revalidatePath('/projects');
  return { success: true };
}
