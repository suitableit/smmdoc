import { auth } from '@/auth';
import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Generate a secure API key
function generateApiKey(): string {
  return randomBytes(32).toString('hex');
}

// POST /api/admin/users/[id]/api-key - Generate new API key for user
export async function POST(
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

    const { id  } = await params;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, username: true, apiKey: true }
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

    // Generate new API key
    const newApiKey = generateApiKey();

    // Update user with new API key
    const updatedUser = await db.user.update({
      where: { id: Number(id) },
      data: { apiKey: newApiKey },
      select: {
        id: true,
        username: true,
        email: true,
        apiKey: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'New API key generated successfully',
      error: null
    });

  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate API key: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]/api-key - Remove API key for user
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

    const { id  } = await params;

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: Number(id) },
      select: { id: true, username: true, apiKey: true }
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

    // Remove API key
    const updatedUser = await db.user.update({
      where: { id: Number(id) },
      data: { apiKey: null },
      select: {
        id: true,
        username: true,
        email: true,
        apiKey: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'API key removed successfully',
      error: null
    });

  } catch (error) {
    console.error('Error removing API key:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove API key: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/users/[id]/api-key - Get user API key status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string   }> }
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

    const { id  } = await params;

    const user = await db.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        username: true,
        email: true,
        apiKey: true,
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

    // Return user data with masked API key for security
    const responseData = {
      ...user,
      apiKey: user.apiKey ? `${user.apiKey.substring(0, 8)}...${user.apiKey.substring(user.apiKey.length - 8)}` : null,
      hasApiKey: !!user.apiKey
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      error: null
    });

  } catch (error) {
    console.error('Error fetching user API key:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch API key: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
