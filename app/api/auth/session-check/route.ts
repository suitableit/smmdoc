import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/auth/session-check - Check if current session is valid
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({
        valid: false,
        session: null
      });
    }

    // Check user status in database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        status: true,
        role: true,
        email: true,
        name: true
      }
    });

    // If user not found or suspended/banned, session is invalid
    if (!user || user.status === 'suspended' || user.status === 'banned') {
      return NextResponse.json({
        valid: false,
        session: null,
        reason: user ? `User is ${user.status}` : 'User not found'
      });
    }

    return NextResponse.json({
      valid: true,
      session: {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          name: session.user.name,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({
      valid: false,
      session: null,
      error: 'Session check failed'
    });
  }
}
