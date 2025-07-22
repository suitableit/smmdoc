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
    
    // Use transaction to create fund record and update user balance
    const result = await db.$transaction(async (prisma) => {
      // Create the fund record
      const addFund = await prisma.addFund.create({
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

      // Update user balance (USD amount)
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          balance: { increment: parseFloat(amountUSD) }, // Legacy field
          balanceUSD: { increment: parseFloat(amountUSD) }, // New USD balance field
        }
      });

      return { addFund, updatedUser };
    });
    
    // Log activity for fund addition
    try {
      const username = user.username || user.email?.split('@')[0] || `user${user.id}`;
      await ActivityLogger.fundAdded(
        user.id,
        username,
        parseFloat(amountUSD),
        'USD',
        'admin'
      );
    } catch (error) {
      console.error('Failed to log fund addition activity:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Funds added successfully',
      data: result.addFund,
    });
    
  } catch (error) {
    console.error('Error adding funds:', error);
    return NextResponse.json(
      { error: 'Failed to add funds' },
      { status: 500 }
    );
  }
} 