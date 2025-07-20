import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = new URL(req.url).searchParams;
    const query = searchParams.get('q') || '';
    
    if (!query) {
      return NextResponse.json({
        users: [],
      });
    }

    console.log(`Searching for users with query: "${query}"`);
    
    // Search users by name, email, username or ID
    const users = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
          { username: { contains: query } },
          ...(isNaN(parseInt(query)) ? [] : [{ id: parseInt(query) }]),
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
      },
      take: 10, // Limit results
    });

    console.log(`Search query: "${query}", Found ${users.length} users:`, users);

    return NextResponse.json({
      users,
    });
    
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 