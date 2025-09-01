import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const uploadType = data.get('type') as string; // Get upload type (general, avatar, etc.)

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine upload directory based on type
    let uploadSubDir = 'uploads'; // default
    if (uploadType === 'general') {
      uploadSubDir = 'general';
    }

    // Create upload directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', uploadSubDir);
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Generate encrypted filename
    const fileExtension = path.extname(file.name);
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();
    const hash = crypto.createHash('sha256').update(`${file.name}${timestamp}${randomBytes}`).digest('hex');
    const filename = `${hash.substring(0, 16)}${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    await writeFile(filepath, buffer);

    // Return the public URL
    const fileUrl = `/${uploadSubDir}/${filename}`;

    return NextResponse.json({
      success: true,
      fileUrl: fileUrl,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
