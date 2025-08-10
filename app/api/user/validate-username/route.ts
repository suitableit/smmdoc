import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Validation
    if (!username) {
      return NextResponse.json(
        {
          error: 'Username is required',
          success: false,
          valid: false
        },
        { status: 400 }
      );
    }

    // Check if username is too short
    if (username.length < 3) {
      return NextResponse.json(
        {
          error: 'Username must be at least 3 characters long',
          success: false,
          valid: false
        },
        { status: 400 }
      );
    }

    // Check if username contains only allowed characters
    const usernameRegex = /^[a-z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error: 'Username can only contain lowercase letters, numbers, dots (.) and underscores (_)',
          success: false,
          valid: false
        },
        { status: 400 }
      );
    }

    // Check if username exists in database
    const existingUser = await db.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: 'Username not found!',
          success: false,
          valid: false
        },
        { status: 404 }
      );
    }

    // Username is valid and exists
    return NextResponse.json(
      {
        message: 'Username is valid.',
        success: true,
        valid: true,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          username: existingUser.username,
          email: existingUser.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error validating username:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate username',
        success: false,
        valid: false 
      },
      { status: 500 }
    );
  }
}