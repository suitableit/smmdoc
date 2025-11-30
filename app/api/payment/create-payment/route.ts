import { auth } from '@/auth';
import { db } from '@/lib/db';
import { convertCurrency, fetchCurrencyData } from '@/lib/currency-utils';
import { getPaymentGatewayName } from '@/lib/payment-gateway-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);

    if (!body.amount || !body.phone) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400 }
      );
    }

    const invoice_id = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const amountUSD = parseFloat(body.amount);

    const { currencies } = await fetchCurrencyData();
    const amountBDT = convertCurrency(amountUSD, 'USD', 'BDT', currencies);

    const gatewayName = await getPaymentGatewayName();

    console.log('Creating payment record with:', {
      invoice_id,
      amount: amountUSD,
      email: session.user.email,
      name: session.user.name,
      status: 'Processing',
      gatewayName: gatewayName,
      userId: session.user.id,
    });

    try {
      const payment = await db.addFunds.create({
        data: {
          invoiceId: invoice_id,
          usdAmount: amountUSD,
          bdtAmount: amountBDT,
          email: session.user.email || '',
          name: session.user.name || '',
          status: 'Processing',
          paymentGateway: gatewayName,
          userId: session.user.id,
          currency: 'USD',
        },
      });

      console.log('Payment record created:', payment);

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
      
      if (!appUrl) {
        return NextResponse.json(
          { error: 'NEXT_PUBLIC_APP_URL or NEXTAUTH_URL environment variable is required' },
          { status: 500 }
        );
      }
      
      console.log('App URL determined:', appUrl);

      const success_url = body.success_url || `${appUrl}/transactions?payment=success&invoice_id=${invoice_id}`;
      const cancel_url =
        body.cancel_url || `${appUrl}/transactions?payment=cancelled`;

      const { getPaymentGatewayCheckoutUrl } = await import('@/lib/payment-gateway-config');
      const checkoutUrl = await getPaymentGatewayCheckoutUrl();

      const payment_url = `${checkoutUrl}?invoice_id=${invoice_id}&amount=${
        body.amount
      }&full_name=${encodeURIComponent(
        session.user.name || 'User'
      )}&email=${encodeURIComponent(
        session.user.email || 'user@example.com'
      )}&metadata=${encodeURIComponent(
        JSON.stringify({ invoice_id })
      )}&redirect_url=${encodeURIComponent(success_url)}`;

      console.log('Payment URLs:', { success_url, cancel_url, payment_url });

      return NextResponse.json({
        invoice_id: payment.invoiceId,
        payment_url,
        success_url,
        cancel_url,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: String(error) },
      { status: 500 }
    );
  }
}
