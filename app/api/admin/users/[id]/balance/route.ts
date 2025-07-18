import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/users/[id]/balance - Update user balance
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
    const { balance, action } = body; // action can be 'set', 'add', or 'subtract'

    if (balance === undefined || isNaN(parseFloat(balance))) {
      return NextResponse.json(
        {
          error: 'Valid balance amount is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true, username: true }
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

    let newBalance: number;
    const amount = parseFloat(balance);

    switch (action) {
      case 'add':
        newBalance = (existingUser.balance || 0) + amount;
        break;
      case 'subtract':
        newBalance = (existingUser.balance || 0) - amount;
        if (newBalance < 0) newBalance = 0; // Prevent negative balance
        break;
      case 'set':
      default:
        newBalance = amount;
        break;
    }

    // Update user balance
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { balance: newBalance },
      select: {
        id: true,
        username: true,
        balance: true,
        currency: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User balance ${action === 'add' ? 'increased' : action === 'subtract' ? 'decreased' : 'updated'} successfully`,
      error: null
    });

  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json(
      {
        error: 'Failed to update balance: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id]/balance - Get user balance
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
        balance: true,
        currency: true,
        total_deposit: true,
        total_spent: true,
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
    console.error('Error fetching user balance:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch balance: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
