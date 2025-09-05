import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({
        user: null,
        expires: null
      });
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        username: session.user.username,
        isImpersonating: session.user.isImpersonating || false,
        originalAdminId: session.user.originalAdminId || null
      },
      expires: session.expires
    });

  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      {
        user: null,
        expires: null,
        error: 'Session fetch failed'
      },
      { status: 500 }
    );
  }
}

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

    const { image } = await req.json();

    if (image) {
      // Note: NextAuth JWT sessions are immutable during request
      // The image will be updated on next session refresh via jwt callback
      // which fetches fresh user data from database
      console.log('Session update requested for image:', image);
    }

    return NextResponse.json(
      {
        success: true,
        data: { 
          message: 'Session will be updated on next refresh',
          image: image 
        },
        error: null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update session',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
