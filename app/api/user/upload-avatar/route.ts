import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ActivityLogger } from '@/lib/activity-logger';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Please login.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file uploaded',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File size too large. Maximum size is 5MB.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `avatar_${session.user.id}_${timestamp}.${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user profile with new image path
    const imagePath = `/uploads/avatars/${filename}`;
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: { 
        image: imagePath,
        updatedAt: new Date()
      },
      select: {
        id: true,
        image: true,
        updatedAt: true,
      }
    });

    // Log activity for profile picture update
    try {
      const username = session.user.username || session.user.email?.split('@')[0] || `user${session.user.id}`;
      await ActivityLogger.profileUpdated(
        session.user.id,
        username,
        'profile picture'
      );
    } catch {
      console.error('Failed to log profile picture update activity');
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          image: updatedUser.image,
          updatedAt: updatedUser.updatedAt
        },
        error: null
      },
      { status: 200 }
    );

  } catch {
    console.error('Profile picture upload error');
    return NextResponse.json(
      {
        error: 'Failed to upload profile picture',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
