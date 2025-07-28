import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/lib/activity-logger';
import bcrypt from 'bcryptjs';

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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          error: 'Current password and new password are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error: 'New password must be at least 6 characters long',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get user with current password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        email: true,
        username: true
      }
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          error: 'User not found or no password set',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        {
          error: 'Current password is incorrect',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await db.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Log activity for password change
    try {
      const username = user.username || user.email?.split('@')[0] || `user${user.id}`;
      await ActivityLogger.passwordChanged(
        session.user.id,
        username
      );
    } catch (error) {
      console.error('Failed to log password change activity:', error);
    }

    return NextResponse.json(
      {
        success: true,
        data: { message: 'Password changed successfully' },
        error: null
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      {
        error: 'Failed to change password',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
