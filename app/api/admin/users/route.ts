/* eslint-disable @typescript-eslint/no-explicit-any */
import { requireAdmin } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const session = await requireAdmin();

    console.log(`Admin users API accessed by: ${session.user.email}`);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || 'user'; // Default to user role

    // Build where clause
    const whereClause: any = {
      // Exclude deleted users by default
      status: { not: 'deleted' }
    };

    // Filter by role - handle multiple roles
    if (role && role !== 'all') {
      // Check if role contains multiple values (comma-separated)
      if (role.includes(',')) {
        const roles = role.split(',').map((r: string) => r.trim());
        // Validate all roles are valid enum values and cast to proper enum type
        const validRoles = roles.filter((r: string) => ['user', 'admin', 'moderator'].includes(r)) as ('user' | 'admin' | 'moderator')[];
        if (validRoles.length > 0) {
          whereClause.role = { in: validRoles };
        }
      } else {
        // Single role
        if (['user', 'admin', 'moderator'].includes(role)) {
          whereClause.role = role as 'user' | 'admin' | 'moderator';
        }
      }
    }

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'deleted') {
        // If specifically requesting deleted users, override the default filter
        whereClause.status = 'deleted';
      } else {
        // For other statuses, combine with not deleted filter
        whereClause.status = { not: 'deleted', equals: status };
      }
    }

    // Search functionality
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { id: { contains: search } },
      ];
    }

    // Get total count for pagination
    const total = await db.user.count({ where: whereClause });

    // Get users with pagination
    const users = await db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        balance: true,
        total_spent: true,
        total_deposit: true,
        currency: true,
        dollarRate: true,
        role: true,
        status: true,
        suspendedUntil: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        servicesDiscount: true,
        specialPricing: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get order counts for each user
    const usersWithOrderCounts = await Promise.all(
      users.map(async (user) => {
        const orderCount = await db.newOrder.count({
          where: { userId: user.id }
        });
        return {
          ...user,
          totalOrders: orderCount,
        };
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
    };

    return NextResponse.json({
      success: true,
      data: usersWithOrderCounts,
      pagination,
      error: null
    });

  } catch (error: any) {
    console.error('Error in admin users API:', error);

    // Handle authentication errors
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    if (error.message === 'Admin access required') {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Admin access required'
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
}
