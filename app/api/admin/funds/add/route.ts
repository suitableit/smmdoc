import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { userId, amountUSD, amountBDT, note, status } = body;
    
    if (!userId || !amountUSD || !amountBDT) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Generate unique invoice ID
    const invoiceId = `ADMIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create the fund record
    const addFund = await db.addFund.create({
      data: {
        invoice_id: invoiceId,
        amount: parseFloat(amountUSD),
        spent_amount: 0,
        email: user.email || '',
        name: user.name || '',
        status: status || 'COMPLETED',
        method: 'admin',
        payment_method: 'admin',
        transaction_id: `ADMIN-${Date.now()}`,
        order_id: `ADMIN-${Date.now()}`,
        date: new Date(),
        userId: userId,
        currency: 'USD', // Admin added funds are in USD
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Funds added successfully',
      data: addFund,
    });
    
  } catch (error) {
    console.error('Error adding funds:', error);
    return NextResponse.json(
      { error: 'Failed to add funds' },
      { status: 500 }
    );
  }
} 