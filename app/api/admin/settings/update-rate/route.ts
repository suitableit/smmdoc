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
    const { dollarRate } = body;
    
    if (!dollarRate || isNaN(dollarRate)) {
      return NextResponse.json(
        { error: 'Invalid dollar rate' },
        { status: 400 }
      );
    }
    
    // Update all users' dollar rate
    await db.user.updateMany({
      data: {
        dollarRate: parseFloat(dollarRate),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Dollar rate updated successfully',
    });
    
  } catch (error) {
    console.error('Error updating dollar rate:', error);
    return NextResponse.json(
      { error: 'Failed to update dollar rate' },
      { status: 500 }
    );
  }
} 