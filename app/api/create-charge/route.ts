// app/api/uddoktapay/route.ts

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);
    const paymentData = {
      full_name: 'John Doe',
      email: 'userEmail@gmail.com',
      amount: '100',
      metadata: { user_id: '10', order_id: '50' },
      redirect_url: '/transactions/success',
      cancel_url: '/transactions/cancel',
      webhook_url: '/ipn',
    };

    const response = await fetch(
      'https://sandbox.uddoktapay.com/api/checkout-v2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'RT-UDDOKTAPAY-API-KEY': '982d381360a69d419689740d9f2e26ce36fb7a50',
        },
        body: JSON.stringify(paymentData),
      }
    );

    const data = await response.json();
    if (data.status) {
      return NextResponse.json({ payment_url: data.payment_url });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
