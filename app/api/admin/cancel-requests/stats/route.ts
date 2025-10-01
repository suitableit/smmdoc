import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/admin/cancel-requests/stats - Get cancel request statistics
export async function GET() {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
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

    console.log('Admin cancel requests stats API called');

    // Get total requests count using raw SQL since Prisma model might not be available
    const totalRequestsResult = await db.$queryRaw`
      SELECT COUNT(*) as count FROM cancel_requests
    ` as { count: bigint }[];
    const totalRequests = Number(totalRequestsResult[0]?.count || 0);

    // Get status breakdown using raw SQL
    const statusBreakdownResult = await db.$queryRaw`
      SELECT status, COUNT(*) as count
      FROM cancel_requests
      GROUP BY status
    ` as { status: string; count: bigint }[];

    // Convert to object format
    const statusCounts = statusBreakdownResult.reduce((acc: Record<string, number>, item) => {
      acc[item.status] = Number(item.count);
      return acc;
    }, {});

    // Get total refund amount (approved requests only) using raw SQL
    const totalRefundResult = await db.$queryRaw`
      SELECT SUM(refundAmount) as total
      FROM cancel_requests
      WHERE status = 'approved' AND refundAmount IS NOT NULL
    ` as { total: number | null }[];
    const totalRefundAmount = Number(totalRefundResult[0]?.total || 0);

    // Get today's requests count using raw SQL
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRequestsResult = await db.$queryRaw`
      SELECT COUNT(*) as count
      FROM cancel_requests
      WHERE createdAt >= ${today} AND createdAt < ${tomorrow}
    ` as { count: bigint }[];
    const todayRequests = Number(todayRequestsResult[0]?.count || 0);

    const stats = {
      totalRequests,
      pendingRequests: statusCounts.pending || 0,
      approvedRequests: statusCounts.approved || 0,
      declinedRequests: statusCounts.declined || 0,
      totalRefundAmount,
      todayRequests,
      statusBreakdown: statusCounts
    };

    console.log('Stats calculated:', stats);

    return NextResponse.json({
      success: true,
      data: stats,
      error: null
    });

  } catch (err) {
    console.error('Error fetching cancel request stats:', err);

    // Return default stats if database query fails
    const defaultStats = {
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      declinedRequests: 0,
      totalRefundAmount: 0,
      todayRequests: 0,
      statusBreakdown: {}
    };

    return NextResponse.json({
      success: true,
      data: defaultStats,
      error: null
    });
  }
}
