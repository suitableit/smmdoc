import { auth } from '@/auth';
import { db } from '@/lib/db';
import { convertCurrency, fetchCurrencyData } from '@/lib/currency-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { invoice_id, amount, phone } = body;
    
    if (!invoice_id || !amount) {
      return NextResponse.json(
        { error: 'Invoice ID and amount are required' },
        { status: 400 }
      );
    }
    
    const existingPayment = await db.addFunds.findUnique({
      where: { invoice_id }
    });
    
    if (existingPayment) {
      return NextResponse.json(
        { error: 'Test payment with this invoice ID already exists' },
        { status: 400 }
      );
    }
    
    let testUser = await db.users.findFirst({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      testUser = await db.users.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'test123',
          role: 'user',
          emailVerified: new Date(),
        }
      });
    }
    
    const { currencies } = await fetchCurrencyData();
    const amountUSD = parseFloat(amount.toString());
    const amountBDT = convertCurrency(amountUSD, 'USD', 'BDT', currencies);

    const testPayment = await db.addFunds.create({
      data: {
        invoice_id,
        usd_amount: amountUSD,
        bdt_amount: amountBDT,
        userId: testUser.id,
        status: 'Processing',
        admin_status: 'pending',
        payment_gateway: 'UddoktaPay',
        phone_number: phone,
        email: testUser.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    console.log('Test payment created:', testPayment);
    
    return NextResponse.json({
      success: true,
      message: 'Test payment created successfully',
      data: {
        invoice_id: testPayment.invoice_id,
        amount: testPayment.usd_amount,
        userId: testPayment.userId,
        status: testPayment.status
      }
    });
    
  } catch (error) {
    console.error('Error creating test payment:', error);
    return NextResponse.json(
      { error: 'Failed to create test payment', details: String(error) },
      { status: 500 }
    );
  }
}
