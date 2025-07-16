import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/users/[id]/discount - Update user services discount
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
    const { discount } = body;

    if (discount === undefined || isNaN(parseFloat(discount))) {
      return NextResponse.json(
        {
          error: 'Valid discount percentage is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    const discountValue = parseFloat(discount);

    // Validate discount range (0-100%)
    if (discountValue < 0 || discountValue > 100) {
      return NextResponse.json(
        {
          error: 'Discount must be between 0 and 100 percent',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, servicesDiscount: true }
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

    // Update user services discount
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { servicesDiscount: discountValue },
      select: {
        id: true,
        username: true,
        email: true,
        servicesDiscount: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User services discount updated to ${discountValue}% successfully`,
      error: null
    });

  } catch (error) {
    console.error('Error updating user discount:', error);
    return NextResponse.json(
      {
        error: 'Failed to update discount: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id]/discount - Get user discount
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
        servicesDiscount: true,
        specialPricing: true,
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
    console.error('Error fetching user discount:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch discount: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
