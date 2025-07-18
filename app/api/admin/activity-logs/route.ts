import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const searchBy = searchParams.get('searchBy') || 'all';
    const action = searchParams.get('action') || '';
    const userId = searchParams.get('userId') || '';

    const offset = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search functionality
    if (search) {
      switch (searchBy) {
        case 'username':
          where.username = {
            contains: search,
            mode: 'insensitive'
          };
          break;
        case 'details':
          where.details = {
            contains: search,
            mode: 'insensitive'
          };
          break;
        case 'ip_address':
          where.ipAddress = {
            contains: search,
            mode: 'insensitive'
          };
          break;
        case 'all':
        default:
          where.OR = [
            {
              username: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              details: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              ipAddress: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              action: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ];
          break;
      }
    }

    // Filter by action
    if (action) {
      where.action = action;
    }

    // Filter by user ID
    if (userId) {
      const userIdInt = parseInt(userId);
      if (!isNaN(userIdInt)) {
        where.userId = userIdInt;
      }
    }

    // Get total count
    const totalCount = await db.activityLog.count({ where });

    // Get activity logs
    const activityLogs = await db.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit,
    });

    // Transform data for frontend
    const transformedLogs = activityLogs.map((log, index) => ({
      id: log.id.toString(),
      slNo: offset + index + 1,
      username: log.username || log.user?.username || 'Unknown',
      details: log.details,
      ipAddress: log.ipAddress || 'Unknown',
      history: log.createdAt.toISOString(),
      action: log.action,
      userAgent: log.userAgent,
      metadata: log.metadata,
      user: log.user
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: transformedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch activity logs: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE - Bulk delete activity logs
export async function DELETE(request: NextRequest) {
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

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          error: 'Activity log IDs are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Convert string IDs to integers
    const logIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (logIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Valid activity log IDs are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Delete activity logs
    const deleteResult = await db.activityLog.deleteMany({
      where: {
        id: {
          in: logIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} activity log(s)`,
      data: {
        deletedCount: deleteResult.count
      },
      error: null
    });

  } catch (error) {
    console.error('Error deleting activity logs:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete activity logs: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
