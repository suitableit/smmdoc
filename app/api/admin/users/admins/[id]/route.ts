import { auth } from '@/auth';
import { ActivityLogger, getClientIP } from '@/lib/activity-logger';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/admin/users/admins/[id] - Delete admin user
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          error: 'Invalid user ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
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

    // Only allow deletion of admin/moderator users
    if (!['admin', 'moderator'].includes(existingUser.role)) {
      return NextResponse.json(
        {
          error: 'This endpoint is only for deleting admin/moderator users',
          success: false,
          data: null
        },
        { status: 403 }
      );
    }

    // Prevent self-deletion
    if (existingUser.id === parseInt(session.user.id)) {
      return NextResponse.json(
        {
          error: 'Cannot delete your own admin account',
          success: false,
          data: null
        },
        { status: 403 }
      );
    }

    // Log the activity before deletion
    try {
      const adminUsername = session.user.username || session.user.email?.split('@')[0] || `admin${session.user.id}`;
      const targetUsername = existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`;
      const clientIP = getClientIP(req);
      
      await ActivityLogger.userDeleted(
        session.user.id,
        adminUsername,
        existingUser.id,
        targetUsername,
        clientIP
      );
    } catch (logError) {
      console.error('Failed to log admin deletion activity:', logError);
    }

    // Soft delete approach - mark user as deleted first, then cleanup
    try {
      // First, mark user as deleted to prevent login
      await db.user.update({
        where: { id: userId },
        data: {
          status: 'deleted',
          email: `deleted_${userId}_${Date.now()}@deleted.com`,
          name: `Deleted Admin ${userId}`,
          username: `deleted_${userId}`,
          // Clear sensitive data
          password: null,
          emailVerified: null,
          image: null,
          balance: 0
        }
      });

      // Then delete sessions to log them out immediately
      await db.session.deleteMany({
        where: { userId: userId }
      });

      // Delete user API keys for security (optional cleanup)
      try {
        await db.apiKey.deleteMany({
          where: { userId: userId }
        });
      } catch (error) {
        console.warn('Could not delete API keys:', error);
      }

      // Delete OAuth accounts (optional cleanup)
      try {
        await db.account.deleteMany({
          where: { userId: userId }
        });
      } catch (error) {
        console.warn('Could not delete OAuth accounts:', error);
      }
    } catch (error) {
      console.error('Error during admin deletion process:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Admin user deleted successfully and sessions invalidated',
      error: null
    });

  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete admin user: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}