import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger, getClientIP } from '@/lib/activity-logger';

// PUT /api/admin/users/[id]/status - Update user status
export async function PUT(
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

    const body = await req.json();
    const { status } = body;

    if (!status || !['active', 'suspended', 'banned'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Valid status is required (active, suspended, or banned)',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, role: true, status: true }
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

    // Prevent changing status of admin users
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        {
          error: 'Cannot change status of admin users',
          success: false,
          data: null
        },
        { status: 403 }
      );
    }

    // Update user status and invalidate sessions if suspended or banned
    const updatedUser = await db.$transaction(async (prisma) => {
      // Update user status
      const user = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          updatedAt: true,
        }
      });

      // If user is suspended or banned, invalidate all their sessions
      if (status === 'suspended' || status === 'banned') {
        await prisma.session.deleteMany({
          where: { userId: userId }
        });
      }

      return user;
    });

    // Log the activity
    try {
      const adminUsername = session.user.username || session.user.email?.split('@')[0] || `admin${session.user.id}`;
      const targetUsername = existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`;
      const clientIP = getClientIP(req);
      
      await ActivityLogger.userStatusChanged(
        session.user.id,
        adminUsername,
        existingUser.id,
        targetUsername,
        existingUser.status,
        status,
        clientIP
      );
    } catch (logError) {
      console.error('Failed to log status change activity:', logError);
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User status updated to ${status} successfully${status === 'suspended' || status === 'banned' ? ' and user sessions invalidated' : ''}`,
      error: null
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      {
        error: 'Failed to update status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id]/status - Update user status (alias for PUT)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

// GET /api/admin/users/[id]/status - Get user status
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
        updatedAt: true,
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

    return NextResponse.json({
      success: true,
      data: user,
      error: null
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
