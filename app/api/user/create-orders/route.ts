import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }
    
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { addFunds: true }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { categoryId, serviceId, link, qty, price, usdPrice, bdtPrice, currency, avg_time } = body;
    
    // Check if user has enough balance
    const userBalance = user.currency === 'USD' 
      ? user.addFunds[0]?.amount || 0
      : (user.addFunds[0]?.amount || 0) * user.dollarRate;
      
    const orderPrice = user.currency === 'USD' ? usdPrice : bdtPrice;
    
    if (userBalance < orderPrice) {
      return NextResponse.json(
        { success: false, message: 'Insufficient balance', data: null },
        { status: 400 }
      );
    }

    // Create order
    const order = await db.newOrder.create({
      data: {
        categoryId,
        serviceId,
        userId: session.user.id,
        link,
        qty,
        price,
        usdPrice,
        bdtPrice,
        currency,
        avg_time,
        status: 'pending'
      }
    });

    return NextResponse.json(
      { success: true, message: 'Order created successfully', data: order },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error creating order', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 