// app/api/uddoktapay/route.ts

import { auth } from '@/auth';
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

    // Parse the amount value
    let amount = parseFloat(body.amount);

    // Log the amount for debugging
    console.log('Parsed amount:', amount, 'Type:', typeof amount);

    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Ensure the amount is an integer
    amount = Math.round(amount);

    // Create a payment record in the database
    try {
      const payment = await db.addFund.create({
        data: {
          invoice_id,
          amount: amount,
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
          currency: 'BDT', // Store currency as BDT since amounts are in BDT
        },
      });

      console.log('Payment record created:', payment);

      // Log activity for payment creation
      try {
        const username = session.user.username || session.user.email?.split('@')[0] || `user${session.user.id}`;
        await ActivityLogger.fundAdded(
          session.user.id,
          username,
          amount,
          'BDT',
          'uddoktapay'
        );
      } catch (error) {
        console.error('Failed to log payment creation activity:', error);
      }

      // Create payment data object according to UddoktaPay documentation
      const paymentData = {
        full_name: session.user.name || 'User',
        email: session.user.email || 'user@example.com',
        amount: amount.toString(),
        phone: body.phone,
        metadata: {
          user_id: session.user.id,
          order_id: order_id,
        },
        redirect_url: `http://localhost:3000/payment/uddoktapay-verify?invoice_id=${invoice_id}&amount=${amount}`,
        cancel_url: `http://localhost:3000/transactions?status=cancelled`,
        webhook_url: `http://localhost:3000/api/payment/webhook`,
      };

      console.log(
        'Payment data being sent:',
        JSON.stringify(paymentData, null, 2)
      );

      // Get API key from environment variables
      const apiKey =
        process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY ||
        '982d381360a69d419689740d9f2e26ce36fb7a50'; // Fallback for testing

      try {
        // Make API request to UddoktaPay
        const response = await fetch(
          'https://sandbox.uddoktapay.com/api/checkout-v2',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'RT-UDDOKTAPAY-API-KEY': apiKey,
            },
            body: JSON.stringify(paymentData),
          }
        );

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
