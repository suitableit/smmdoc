// app/api/uddoktapay/route.ts

import { auth } from '@/auth';
import { ActivityLogger } from '@/lib/activity-logger';
import {
  convertCurrency,
  convertToUSD,
  fetchCurrencyData,
} from '@/lib/currency-utils';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// CORS middleware for handling preflight requests
export async function OPTIONS(req: NextRequest) {
  // Get the origin from request headers or default to NEXT_PUBLIC_APP_URL
  const requestOrigin =
    req.headers.get('origin') ||
    process.env.NEXT_PUBLIC_APP_URL ||
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
    // Authenticate the user
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

    // Parse the request body
    const body = await req.json();
    console.log('Request body:', body);

    // Validate required fields
    if (!body.amount || !body.phone) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate a unique invoice ID and order ID
    const invoice_id = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order_id = `ORD-${Date.now()}`;

    // Get currency data for conversion
    const { currencies } = await fetchCurrencyData();

    // Parse the amount value and currency
    const amount = parseFloat(body.amount);
    const currency = body.currency || 'BDT'; // Default to BDT if not specified

    // Log the amount for debugging
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

    // Convert amount to USD for storage (base currency)
    const amountUSD = convertToUSD(amount, currency, currencies);

    // For payment gateway, we need BDT amount (UddoktaPay works with BDT)
    const amountBDT =
      currency === 'BDT'
        ? amount
        : convertCurrency(amount, currency, 'BDT', currencies);

    console.log('Currency conversion:', {
      original: amount,
      currency: currency,
      amountUSD: amountUSD,
      amountBDT: amountBDT,
    });

    // Create a payment record in the database
    try {
      const payment = await db.addFund.create({
        data: {
          invoice_id,
          amount: amountUSD, // Store USD amount as base currency
          original_amount: amount, // Store original amount in user's currency
          spent_amount: 0,
          fee: 0,
          email: session.user.email || '',
          name: session.user.name || '',
          status: 'Processing', // Initial status
          admin_status: 'pending', // Set admin status to pending
          order_id,
          method: body.method || 'uddoktapay',
          sender_number: body.phone, // Store phone number
          userId: session.user.id,
          currency: currency, // Store original currency for reference
        },
      });

      console.log('Payment record created:', payment);

      // Log activity for payment creation
      try {
        const username =
          session.user.username ||
          session.user.email?.split('@')[0] ||
          `user${session.user.id}`;
        await ActivityLogger.fundAdded(
          session.user.id,
          username,
          amountUSD, // Log USD amount
          'USD',
          'uddoktapay'
        );
      } catch (error) {
        console.error('Failed to log payment creation activity:', error);
      }

      // Get API key and app URL from environment variables
      const apiKey = process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      // Create payment data object according to UddoktaPay documentation
      // UddoktaPay requires BDT amount
      const paymentData = {
        full_name: session.user.name || 'User',
        email: session.user.email || 'user@example.com',
        amount: Math.round(amountBDT).toString(), // Use BDT amount for payment gateway
        phone: body.phone,
        metadata: {
          user_id: session.user.id,
          order_id: order_id,
          original_currency: currency,
          original_amount: amount,
          usd_amount: amountUSD,
        },
        redirect_url: `${appUrl}/payment/success?invoice_id=${invoice_id}&amount=${Math.round(
          amountBDT
        )}`,
        cancel_url: `${appUrl}/transactions?status=cancelled`,
        webhook_url: `${appUrl}/api/payment/webhook`,
      };

      console.log(
        'Payment data being sent:',
        JSON.stringify(paymentData, null, 2)
      );

      if (!apiKey) {
        return NextResponse.json(
          { error: 'Payment gateway API key not configured' },
          { status: 500, headers: corsHeaders }
        );
      }

      try {
        // Make API request to UddoktaPay Live with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('https://pay.smmdoc.com/api/checkout-v2', {
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
            redirect_url: `${appUrl}/payment/success?invoice_id=${invoice_id}&amount=${Math.round(
              amountBDT
            )}`,
            return_type: 'GET',
            cancel_url: `${appUrl}/transactions?status=cancelled`,
            webhook_url: `${appUrl}/api/payment/webhook`,
          }),
        });

        // Clear timeout
        clearTimeout(timeoutId);

        // Get response as text first for better debugging
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        // Try to parse the response as JSON
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
              order_id: order_id,
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

        // Clear timeout if it exists
        let timeoutId: NodeJS.Timeout | null = null;
        if (timeoutId) clearTimeout(timeoutId);

        // Check if it's a timeout error
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
