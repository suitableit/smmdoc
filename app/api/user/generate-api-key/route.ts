import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger, getClientIP } from '@/lib/activity-logger';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Please login.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    // Generate a secure API key
    const apiKey = `smm_${crypto.randomBytes(32).toString('hex')}`;

    // Update user with new API key
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { 
        apiKey: apiKey,
        updatedAt: new Date()
      },
      select: {
        id: true,
        apiKey: true,
        updatedAt: true,
      }
    });

    // Log activity for API key generation
    try {
      const username = session.user.username || session.user.email?.split('@')[0] || `user${session.user.id}`;
      const ipAddress = getClientIP(req);
      await ActivityLogger.apiKeyGenerated(
        session.user.id,
        username,
        ipAddress
      );
    } catch (error) {
      console.error('Failed to log API key generation activity:', error);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          apiKey: updatedUser.apiKey,
          createdAt: updatedUser.updatedAt,
          updatedAt: updatedUser.updatedAt,
          id: '1',
          userId: session.user.id
        },
        error: null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('API key generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate API key',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
