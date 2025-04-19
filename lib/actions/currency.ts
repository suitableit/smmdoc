'use server';
import { auth } from '@/auth';
import { getUserById } from '@/data/user';
import { db } from '@/lib/db';

export async function getUserCurrency() {
  const session = await auth();
  const user = await getUserById(session?.user?.id as string);
  if (!user) return 'BDT';
  return user.currency as 'USD' | 'BDT';
}

export async function updateUserCurrency(currency: 'USD' | 'BDT') {
  const session = await auth();
  if (!session) return false;

  await db.user.update({
    where: { id: session?.user?.id },
    data: { currency },
  });

  return true;
}
