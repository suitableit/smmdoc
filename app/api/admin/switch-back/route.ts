import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const originalAdminId = cookieStore.get('original-admin-id')?.value;
    const impersonatedUserId = cookieStore.get('impersonated-user-id')?.value;

    if (!originalAdminId || !impersonatedUserId) {
      return NextResponse.json(
        { success: false, error: 'No active user switching session found' },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Switched back to admin account'
    });

    // Clear the impersonation cookies
    response.cookies.set('impersonated-user-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    response.cookies.set('original-admin-id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Switch back error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}