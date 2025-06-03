import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, data: null, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    const userDetails = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        image: true,
        currency: true,
        balance: true,
        total_deposit: true,
        total_spent: true,
        createdAt: true,
        emailVerified: true,
        isTwoFactorEnabled: true,
        // নিরাপত্তার জন্য পাসওয়ার্ড অন্তর্ভুক্ত করা হচ্ছে না
      }
    });
    
    if (!userDetails) {
      return NextResponse.json(
        { success: false, data: null, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: userDetails, error: null },
      { status: 200 }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, data: null, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}