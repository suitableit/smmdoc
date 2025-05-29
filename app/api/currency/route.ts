// app/api/currency/route.ts
import { currentUser } from '@/lib/actions/auth';
import { updateUserCurrency } from '@/lib/actions/currency';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { currency } = await req.json();
  if (currency !== 'USD' && currency !== 'BDT') {
    return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
  }

  const success = await updateUserCurrency(currency);
  if (!success) {
    return NextResponse.json(
      { error: 'Failed to update currency' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
