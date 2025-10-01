import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Create a test transaction with phone number
    const testTransaction = await db.addFund.create({
      data: {
        invoice_id: `TEST-${Date.now()}`,
        amount: 100.00,
        spent_amount: 0,
        fee: 0,
        email: 'test@example.com',
        name: 'Test User',
        status: 'Processing',
        admin_status: 'pending',
        order_id: `TEST-ORDER-${Date.now()}`,
        method: 'uddoktapay',
        sender_number: '01712345678', // Test phone number
        transaction_id: `TXN-${Date.now()}`,
        userId: session.user.id, // Use current admin user for testing
        currency: 'BDT', // Test transaction in BDT
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Test transaction created successfully',
      data: testTransaction,
    });
    
  } catch (error) {
    console.error('Error creating test transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create test transaction', details: String(error) },
      { status: 500 }
    );
  }
}
