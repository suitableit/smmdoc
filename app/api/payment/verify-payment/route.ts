import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const seacrchParams = new URL(req.url).searchParams;
    const invoiceId = seacrchParams.get('invoice_id');
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }
    // Check if the payment already exists in the database
    const existingPayment = await db.addFund.findFirst({
      where: {
        invoice_id: invoiceId,
      },
    });
    if (existingPayment) {
      return NextResponse.json(
        { message: 'Payment already verified' },
        { status: 200 }
      );
    }
    const response = await fetch('https://pay.smmdoc.com/api/verify-payment', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'RT-UDDOKTAPAY-API-KEY':
          process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        invoice_id: invoiceId,
      }),
    });
    const data = await response.json();
    console.log('Payment verification response:', data);
    if (data?.status === 'COMPLETED') {
      const payment = {
        invoice_id: data.invoice_id,
        amount: parseFloat(data.amount),
        spent_amount: 0, // Initialize spent_amount to 0
        email: data.email,
        method: data.metadata.method,
        name: data.full_name,
        status: data.status,
        order_id: String(data.metadata.order_id),
        transaction_id: data.transaction_id,
        payment_method: data.payment_method,
        sender_number: data.sender_number,
        date: new Date(data.date),
        user: {
          connect: { id: data.metadata.user_id },
        },
      };
      await db.addFund.create({
        data: payment,
      });
    }
    return NextResponse.json(
      { status: data.status, message: 'Payment verification successful' },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
