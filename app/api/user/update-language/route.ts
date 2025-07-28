import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/lib/activity-logger';

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

    const body = await req.json();
    const { language } = body;

    if (!language) {
      return NextResponse.json(
        {
          error: 'Language is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Validate language
    const allowedLanguages = ['en', 'bn', 'ar', 'es', 'fr', 'hi'];
    if (!allowedLanguages.includes(language)) {
      return NextResponse.json(
        {
          error: 'Invalid language selection',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: session.user.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: 'User not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Update user language
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { 
        language: language,
        updatedAt: new Date()
      },
      select: {
        id: true,
        language: true,
        updatedAt: true,
      }
    });

    // Log activity for language update
    try {
      const username = session.user.username || session.user.email?.split('@')[0] || `user${session.user.id}`;
      await ActivityLogger.profileUpdated(
        session.user.id,
        username,
        'language'
      );
    } catch (error) {
      console.error('Failed to log language update activity:', error);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          language: updatedUser.language,
          updatedAt: updatedUser.updatedAt
        },
        error: null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Language update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update language',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
