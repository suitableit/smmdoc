import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

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
      // Update session user image
      if (session.user) {
        session.user.image = image;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Session updated successfully' },
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
