import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Require user authentication
    const session = await requireAuth();

    console.log(`User current API accessed by: ${session.user.email}`);

    const userId = session.user.id;

    try {
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
    } catch (dbError) {
      console.error('Database error in /api/user/current:', dbError);

      // Return session data as fallback
      return NextResponse.json(
        {
          success: true,
          data: {
            id: session.user.id,
            name: session.user.name || null,
            username: session.user.username || null,
            email: session.user.email || null,
            role: session.user.role || 'user',
            image: session.user.image || null,
            currency: session.user.currency || 'USD',
            balance: session.user.balance || 0,
            total_deposit: 0,
            total_spent: 0,
            createdAt: new Date(),
            emailVerified: null,
            isTwoFactorEnabled: session.user.isTwoFactorEnabled || false,
          },
          error: null
        },
        { status: 200 }
      );
    }
    
  } catch (error: any) {
    console.error('Error in user current API:', error);

    // Handle authentication errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, data: null, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, data: null, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}