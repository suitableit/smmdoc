import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get all users for debugging
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
      take: 20, // Limit to first 20 users
    });
    
    return NextResponse.json({
      total: users.length,
      users,
    });
    
  } catch (error) {
    console.error('Error fetching users for debug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
