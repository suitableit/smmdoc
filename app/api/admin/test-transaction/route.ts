import { auth } from '@/auth';
import { db } from '@/lib/db';
import { convertCurrency, fetchCurrencyData } from '@/lib/currency-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Convert USD to BDT for bdt_amount
    const { currencies } = await fetchCurrencyData();
    const amountBDT = convertCurrency(100.00, 'USD', 'BDT', currencies);

    const testTransaction = await db.addFunds.create({
      data: {
        invoice_id: `TEST-${Date.now()}`,
        usd_amount: 100.00,
        bdt_amount: amountBDT,
        email: 'test@example.com',
        name: 'Test User',
        status: 'Processing',
        admin_status: 'pending',
        payment_gateway: 'UddoktaPay',
        sender_number: '01712345678',
        transaction_id: `TXN-${Date.now()}`,
        userId: session.user.id,
        currency: 'USD',
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test transaction created successfully',
      data: testTransaction,
    });
    
  } catch (error) {
    console.error('Error creating test transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create test transaction', details: String(error) },
      { status: 500 }
    );
  }
}
