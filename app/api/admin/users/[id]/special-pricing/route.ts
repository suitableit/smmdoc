import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/users/[id]/special-pricing - Update user special pricing
export async function PUT(
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

    const body = await req.json();
    const { specialPricing } = body;

    if (typeof specialPricing !== 'boolean') {
      return NextResponse.json(
        {
          error: 'Valid special pricing value is required (true or false)',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, specialPricing: true }
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

    // Update user special pricing
    const updatedUser = await db.user.update({
      where: { id },
      data: { specialPricing },
      select: {
        id: true,
        username: true,
        email: true,
        specialPricing: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User special pricing ${specialPricing ? 'enabled' : 'disabled'} successfully`,
      error: null
    });

  } catch (error) {
    console.error('Error updating user special pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to update special pricing: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/special-pricing - Reset special pricing (set to false)
export async function DELETE(
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

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id },
      select: { id: true, username: true, specialPricing: true }
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

    // Reset special pricing to false
    const updatedUser = await db.user.update({
      where: { id },
      data: { specialPricing: false },
      select: {
        id: true,
        username: true,
        email: true,
        specialPricing: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User special pricing reset successfully',
      error: null
    });

  } catch (error) {
    console.error('Error resetting user special pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to reset special pricing: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id]/special-pricing - Get user special pricing status
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

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        specialPricing: true,
        servicesDiscount: true,
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
    console.error('Error fetching user special pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch special pricing: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
