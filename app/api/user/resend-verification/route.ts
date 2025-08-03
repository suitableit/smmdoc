import { auth } from '@/auth';
import { ActivityLogger } from '@/lib/activity-logger';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/nodemailer';
import { generateVerificationToken } from '@/lib/tokens';
import { NextResponse } from 'next/server';

export async function POST() {
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

    // Get user details
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    if (!user.email) {
      return NextResponse.json(
        {
          error: 'No email address found for this user',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email is already verified',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = await generateVerificationToken(user.email);

    if (!verificationToken) {
      return NextResponse.json(
        {
          error: 'Failed to generate verification token',
          success: false,
          data: null
        },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send verification email',
          success: false,
          data: null
        },
        { status: 500 }
      );
    }

    // Log activity for verification email resend
    try {
      const username = user.username || user.email?.split('@')[0] || `user${user.id}`;
      await ActivityLogger.profileUpdated(
        session.user.id,
        username,
        'verification_email_resent'
      );
    } catch (error) {
      console.error('Failed to log verification email activity:', error);
    }

    return NextResponse.json(
      {
        success: true,
        data: { 
          message: 'Verification email sent successfully',
          email: user.email
        },
        error: null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Resend verification email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to resend verification email',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
