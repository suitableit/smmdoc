import { auth } from '@/auth';
import { requireAdmin } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users/[id] - Get specific user details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin authentication
    const session = await requireAdmin();

    console.log(`Admin user details API accessed by: ${session.user.email}`);

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
        name: true,
        balance: true,
        total_spent: true,
        total_deposit: true,
        currency: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        servicesDiscount: true,
        specialPricing: true,
        apiKey: true,
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

    // Get user's order count
    const orderCount = await db.order.count({
      where: { userId: user.id }
    });

    const userData = {
      ...user,
      totalOrders: orderCount,
    };

    return NextResponse.json({
      success: true,
      data: userData,
      error: null
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user details
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
    const { username, name, email, balance, emailVerified, password, role, status } = body;

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

    // Check for unique constraint violations before updating
    if (username !== undefined && username !== existingUser.username) {
      const usernameExists = await db.user.findUnique({
        where: { username: username },
        select: { id: true }
      });

      if (usernameExists && usernameExists.id !== userId) {
        return NextResponse.json(
          {
            error: 'Username is already taken by another user',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
    }

    if (email !== undefined && email !== existingUser.email) {
      const emailExists = await db.user.findUnique({
        where: { email: email },
        select: { id: true }
      });

      if (emailExists && emailExists.id !== userId) {
        return NextResponse.json(
          {
            error: 'Email is already taken by another user',
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (username !== undefined) updateData.username = username;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (balance !== undefined) updateData.balance = parseFloat(balance);
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
    // Handle password update if provided
    if (password && password.trim()) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        balance: true,
        role: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
      error: null
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user details (alias for PUT)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(req, { params });
}

// DELETE /api/admin/users/[id] - Delete user
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

    // Prevent deleting admin users
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        {
          error: 'Cannot delete admin users',
          success: false,
          data: null
        },
        { status: 403 }
      );
    }

    // Delete user and all related data
    await db.$transaction(async (prisma) => {
      // First, delete all user sessions to log them out immediately
      await prisma.session.deleteMany({
        where: { userId: userId }
      });

      // Delete related data that has RESTRICT constraints
      // Delete refill requests first (they reference orders)
      await prisma.refillRequest.deleteMany({
        where: { userId: userId }
      });

      // Delete cancel requests
      await prisma.cancelRequest.deleteMany({
        where: { userId: userId }
      });

      // Delete orders
      await prisma.newOrder.deleteMany({
        where: { userId: userId }
      });

      // Delete add funds
      await prisma.addFund.deleteMany({
        where: { userId: userId }
      });

      // Delete favorite categories
      await prisma.favrouteCat.deleteMany({
        where: { userId: userId }
      });

      // Delete API keys
      await prisma.apiKey.deleteMany({
        where: { userId: userId }
      });

      // Delete account (OAuth accounts)
      await prisma.account.deleteMany({
        where: { userId: userId }
      });

      // Finally delete the user (this will cascade delete other records like categories, services, etc.)
      await prisma.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: 'User deleted successfully and sessions invalidated',
      error: null
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
