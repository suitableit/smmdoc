import { auth } from '@/auth';
import { ActivityLogger, getClientIP } from '@/lib/activity-logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user) {
      // Log logout activity before signing out
      try {
        const username = session.user.username || session.user.email?.split('@')[0] || `user${session.user.id}`;
        const ipAddress = getClientIP(request);
        
        if (session.user.role === 'admin') {
          await ActivityLogger.adminLogout(session.user.id, username, ipAddress);
        } else {
          await ActivityLogger.logout(session.user.id, username, ipAddress);
        }
      } catch (error) {
        console.error('Failed to log logout activity:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logout activity logged successfully'
    });

  } catch (error) {
    console.error('Error in logout API:', error);
    return NextResponse.json(
      {
        error: 'Failed to log logout activity',
        success: false
      },
      { status: 500 }
    );
  }
}
