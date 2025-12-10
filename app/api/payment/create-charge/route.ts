
import { auth } from '@/auth';
import { ActivityLogger } from '@/lib/activity-logger';
import {
  convertCurrency,
  convertToUSD,
  fetchCurrencyData,
} from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { getPaymentGatewayName } from '@/lib/payment-gateway-config';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  const requestOrigin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    '*';

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

    const gatewayName = await getPaymentGatewayName();

    try {
      const username =
        session.user.username ||
        session.user.email?.split('@')[0] ||
        `user${session.user.id}`;
      try {
        await ActivityLogger.fundAdded(
          session.user.id,
          username,
          amountUSD,
          'USD',
          gatewayName
        );
      } catch (error) {
        console.error('Failed to log payment creation activity:', error);
      }

      const { getPaymentGatewayApiKey, getPaymentGatewayCheckoutUrl } = await import('@/lib/payment-gateway-config');
      const apiKey = await getPaymentGatewayApiKey();
      const checkoutUrl = await getPaymentGatewayCheckoutUrl();
      
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
      
      if (!appUrl) {
        return NextResponse.json(
          { error: 'NEXT_PUBLIC_APP_URL or NEXTAUTH_URL environment variable is required' },
          { status: 500, headers: corsHeaders }
        );
      }
      
      console.log('App URL determined:', appUrl);

      const paymentAmount = convertCurrency(amountUSD, 'USD', 'BDT', currencies);
      
      const paymentData = {
        full_name: session.user.name || 'User',
        email: session.user.email || 'user@example.com',
        amount: Math.round(paymentAmount).toString(),
        phone: body.phone,
        metadata: {
          user_id: session.user.id,
          original_currency: currency,
          charged_amount: amountBDT,
          usd_amount: amountUSD,
        },
        redirect_url: `${appUrl}/transactions?payment=success`,
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
            redirect_url: paymentData.redirect_url,
            return_type: 'GET',
            cancel_url: paymentData.cancel_url,
            webhook_url: paymentData.webhook_url,
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
      console.log('Response status check:', {
        hasStatus: !!data.status,
        statusValue: data.status,
        hasInvoiceId: !!(data.invoice_id || data.invoiceId),
        invoiceId: data.invoice_id || data.invoiceId,
        hasPaymentUrl: !!data.payment_url,
        allKeys: Object.keys(data),
      });

        if (data.status || data.payment_url) {
          let gatewayInvoiceId: string | null = null;
          
          if (data.payment_url) {
            console.log('=== Extracting invoice_id from payment_url ===');
            console.log('Payment URL:', data.payment_url);
            try {
              const url = new URL(data.payment_url);
              console.log('Parsed URL components:', {
                hostname: url.hostname,
                pathname: url.pathname,
                search: url.search,
              });
              
              const pathParts = url.pathname.split('/').filter(part => part.length > 0);
              console.log('Path parts:', pathParts);
              
              const paymentIndex = pathParts.findIndex(part => part === 'payment');
              console.log('Payment index in path:', paymentIndex);
              
              if (paymentIndex >= 0 && paymentIndex < pathParts.length - 1) {
                gatewayInvoiceId = pathParts[paymentIndex + 1];
                console.log(`✓ SUCCESS: Extracted invoice_id from payment_url path: ${gatewayInvoiceId}`);
              } else {
                if (pathParts.length > 0) {
                  gatewayInvoiceId = pathParts[pathParts.length - 1];
                  console.log(`✓ SUCCESS: Extracted invoice_id from payment_url (last segment): ${gatewayInvoiceId}`);
                } else {
                  console.warn('⚠ No path parts found in payment_url');
                }
              }
              
              if (!gatewayInvoiceId) {
                gatewayInvoiceId = url.searchParams.get('invoice_id') || 
                                   url.searchParams.get('invoiceId') ||
                                   url.searchParams.get('invoice');
                if (gatewayInvoiceId) {
                  console.log(`✓ SUCCESS: Extracted invoice_id from query params: ${gatewayInvoiceId}`);
                }
              }
            } catch (urlError) {
              console.error('✗ ERROR: Failed to parse payment_url:', urlError);
              console.error('Payment URL that failed:', data.payment_url);
            }
          } else {
            console.warn('⚠ No payment_url in gateway response');
          }
          
          console.log('Final extracted gatewayInvoiceId:', gatewayInvoiceId);
          
          if (!gatewayInvoiceId) {
            gatewayInvoiceId = data.invoice_id || data.invoiceId || data.invoice || 
                              data.id || data.payment_id || data.order_id || null;
          }
          
          if (!gatewayInvoiceId) {
            console.error('Could not extract invoice_id from payment_url:', {
              paymentUrl: data.payment_url,
              response: data,
              allKeys: Object.keys(data),
            });
            return NextResponse.json(
              {
                error: 'Gateway did not return invoice_id in payment_url',
                details: 'Unable to extract invoice_id from payment gateway response. Please try again.',
                gatewayResponse: data
              },
              { status: 500, headers: corsHeaders }
            );
          }

          try {
            const tenSecondsAgo = new Date(Date.now() - 10000);
            const recentPayment = await db.addFunds.findFirst({
              where: {
                userId: session.user.id,
                usdAmount: amountUSD,
                senderNumber: body.phone,
                createdAt: {
                  gte: tenSecondsAgo,
                },
                status: 'Processing',
              },
              orderBy: {
                createdAt: 'desc',
              },
            });

            if (recentPayment) {
              console.log('Duplicate payment attempt detected:', {
                userId: session.user.id,
                amount: amountUSD,
                existingInvoiceId: recentPayment.invoiceId,
                timeDiff: Date.now() - recentPayment.createdAt.getTime(),
              });
              return NextResponse.json(
                { 
                  error: 'Duplicate payment request detected. Please wait a moment and try again.',
                },
                { status: 429, headers: corsHeaders }
              );
            }

            const payment = await db.addFunds.create({
              data: {
                invoiceId: gatewayInvoiceId,
                usdAmount: amountUSD,
                amount: amountBDT,
                email: session.user.email || '',
                name: session.user.name || '',
                status: 'Processing',
                paymentGateway: gatewayName,
                senderNumber: body.phone,
                userId: session.user.id,
                currency: currency,
              },
            });

            console.log(`✓ Payment record created with gateway invoice_id: ${gatewayInvoiceId}`);
            
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
                gatewayName
              );
            } catch (error) {
              console.error('Failed to log payment creation activity:', error);
            }
          } catch (createError: any) {
            console.error('Error creating payment record:', createError);
            
            if (createError.code === 'P2002') {
              return NextResponse.json(
                { error: 'Invoice ID already exists. Please try again.' },
                { status: 409, headers: corsHeaders }
              );
            }
            
            return NextResponse.json(
              { error: 'Failed to create payment record', details: String(createError) },
              { status: 500, headers: corsHeaders }
            );
          }
          
          return NextResponse.json(
            {
              payment_url: data.payment_url,
              invoice_id: gatewayInvoiceId,
            },
            { status: 200, headers: corsHeaders }
          );
        } else {
          console.error('Gateway returned error or missing status:', {
            status: data.status,
            message: data.message,
            error: data.error,
            fullResponse: data,
          });
          return NextResponse.json(
            { 
              error: data.message || data.error || 'Payment initialization failed',
              details: 'The payment gateway rejected the request. Please check your payment details and try again.',
              gatewayResponse: data
            },
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
    } catch (paymentError) {
      console.error('Payment gateway error:', paymentError);
      return NextResponse.json(
        { error: 'Payment gateway operation failed', details: String(paymentError) },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (error: any) {
    console.error('Error creating payment:', error);
    
    if (error?.message === 'DUPLICATE_PAYMENT') {
      return NextResponse.json(
        { 
          error: 'Duplicate payment request detected. Please wait a moment and try again.',
        },
        { status: 429, headers: corsHeaders }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create payment', details: String(error) },
      { status: 500, headers: corsHeaders }
    );
  }
}
