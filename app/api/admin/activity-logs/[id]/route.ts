import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/admin/activity-logs/[id] - Delete specific activity log
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
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json(
        {
          error: 'Invalid activity log ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if activity log exists
    const existingLog = await db.activitylog.findUnique({
      where: { id: logId }
    });

    if (!existingLog) {
      return NextResponse.json(
        {
          error: 'Activity log not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Delete the activity log
    await db.activitylog.delete({
      where: { id: logId }
    });

    return NextResponse.json({
      success: true,
      message: 'Activity log deleted successfully',
      data: null,
      error: null
    });

  } catch (error) {
    console.error('Error deleting activity log:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete activity log: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/activity-logs/[id] - Get specific activity log
export async function GET(
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
    const logId = parseInt(id);

    if (isNaN(logId)) {
      return NextResponse.json(
        {
          error: 'Invalid activity log ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get activity log with user details
    const activityLog = await db.activitylog.findUnique({
      where: { id: logId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!activityLog) {
      return NextResponse.json(
        {
          error: 'Activity log not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedLog = {
      id: activityLog.id.toString(),
      username: activityLog.username || activityLog.user?.username || 'Unknown',
      details: activityLog.details,
      ipAddress: activityLog.ipAddress || 'Unknown',
      history: activityLog.createdAt.toISOString(),
      action: activityLog.action,
      userAgent: activityLog.userAgent,
      metadata: activityLog.metadata,
      user: activityLog.user
    };

    return NextResponse.json({
      success: true,
      data: transformedLog,
      error: null
    });

  } catch (error) {
    console.error('Error fetching activity log:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activity log: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
