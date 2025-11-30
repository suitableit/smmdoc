
import { auth } from '@/auth';
import { ActivityLogger } from '@/lib/activity-logger';
import {
  convertCurrency,
  convertToUSD,
  fetchCurrencyData,
} from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  const requestOrigin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000';

  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': requestOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const body = await req.json();
    console.log('Request body:', body);

    if (!body.amount || !body.phone) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const invoice_id = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { currencies } = await fetchCurrencyData();

    const amount = parseFloat(body.amount);
    const currency = body.currency || 'USD';

    console.log(
      'Parsed amount:',
      amount,
      'Currency:',
      currency,
      'Type:',
      typeof amount
    );

    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400, headers: corsHeaders }
      );
    }

    const amountUSD = convertToUSD(amount, currency, currencies);
    const amountBDT = currency === 'BDT' 
      ? amount 
      : convertCurrency(amountUSD, 'USD', 'BDT', currencies);

    console.log('Currency conversion:', {
      original: amount,
      currency: currency,
      amountUSD: amountUSD,
      amountBDT: amountBDT,
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
          adminStatus: 'pending',
          paymentGateway: body.method || 'UddoktaPay',
          phoneNumber: body.phone,
          userId: session.user.id,
          currency: currency,
        },
      });

      console.log('Payment record created:', payment);

      try {
        const username =
          session.user.username ||
          session.user.email?.split('@')[0] ||
          `user${session.user.id}`;
        await ActivityLogger.fundAdded(
          session.user.id,
          username,
          amountUSD,
          'USD',
          'UddoktaPay'
        );
      } catch (error) {
        console.error('Failed to log payment creation activity:', error);
      }

      const { getPaymentGatewayApiKey, getPaymentGatewayCheckoutUrl } = await import('@/lib/payment-gateway-config');
      const apiKey = await getPaymentGatewayApiKey();
      const checkoutUrl = await getPaymentGatewayCheckoutUrl();
      
      const requestOrigin = req.headers.get('origin') || 
                           req.headers.get('referer')?.split('/').slice(0, 3).join('/');
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.NEXTAUTH_URL || 
                     requestOrigin ||
                     'http://localhost:3000';
      
      console.log('App URL determined:', appUrl, {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        requestOrigin: requestOrigin
      });

      const paymentAmount = convertCurrency(amountUSD, 'USD', 'BDT', currencies);
      
      const paymentData = {
        full_name: session.user.name || 'User',
        email: session.user.email || 'user@example.com',
        amount: Math.round(paymentAmount).toString(),
        phone: body.phone,
        metadata: {
          user_id: session.user.id,
          invoice_id: invoice_id,
          original_currency: currency,
          charged_amount: amountBDT,
          usd_amount: amountUSD,
        },
        redirect_url: `${appUrl}/transactions?payment=success&invoice_id=${invoice_id}`,
        cancel_url: `${appUrl}/transactions?payment=cancelled`,
        webhook_url: `${appUrl}/api/payment/webhook`,
      };

      console.log(
        'Payment data being sent:',
        JSON.stringify(paymentData, null, 2)
      );

      if (!apiKey) {
        return NextResponse.json(
          { error: 'Payment gateway API key not configured. Please configure it in admin settings.' },
          { status: 500, headers: corsHeaders }
        );
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(checkoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'RT-UDDOKTAPAY-API-KEY': apiKey,
          },
          signal: controller.signal,
          body: JSON.stringify({
            full_name: paymentData.full_name,
            email: paymentData.email,
            amount: paymentData.amount,
            phone: paymentData.phone,
            metadata: paymentData.metadata,
            redirect_url: `${appUrl}/transactions?payment=success&invoice_id=${invoice_id}`,
            return_type: 'GET',
            cancel_url: `${appUrl}/transactions?payment=cancelled`,
            webhook_url: `${appUrl}/api/payment/webhook`,
          }),
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response as JSON:', e);
          return NextResponse.json(
            { error: 'Invalid response from payment gateway' },
            { status: 500, headers: corsHeaders }
          );
        }

        console.log('Parsed response data:', data);

        if (data.status) {
          return NextResponse.json(
            {
              payment_url: data.payment_url,
              invoice_id: invoice_id,
            },
            { status: 200, headers: corsHeaders }
          );
        } else {
          return NextResponse.json(
            { error: data.message || 'Payment initialization failed' },
            { status: 400, headers: corsHeaders }
          );
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);

        let timeoutId: NodeJS.Timeout | null = null;
        if (timeoutId) clearTimeout(timeoutId);

        if ((fetchError as any)?.name === 'AbortError') {
          return NextResponse.json(
            { error: 'Payment gateway timeout. Please try again.' },
            { status: 408, headers: corsHeaders }
          );
        }

        return NextResponse.json(
          { error: 'Network error when connecting to payment gateway' },
          { status: 500, headers: corsHeaders }
        );
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Database operation failed', details: String(dbError) },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
