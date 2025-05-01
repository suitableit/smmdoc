// app/api/uddoktapay/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const orderId = Math.floor(Date.now() / 1000);
  try {
    const body = await req.json();
    const paymentData = {
      full_name: body?.full_Name,
      email: body?.email,
      amount: body?.totalAmount,
      phone: body?.phone,
      metadata: {
        user_id: body?.userId,
        order_id: orderId,
        method: body?.method,
        amount: body?.amount,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/cancel`,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook`,
    };

    const response = await fetch('https://pay.smmdoc.com/api/checkout-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'RT-UDDOKTAPAY-API-KEY':
          process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY || '',
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    console.log('Payment response:', data);
    if (data.status) {
      return NextResponse.json(
        { payment_url: data.payment_url, order_id: orderId },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
