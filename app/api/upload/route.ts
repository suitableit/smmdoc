import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.formData();
    const files = data.getAll('files') as File[];
    const singleFile = data.get('file') as File;
    const uploadType = data.get('uploadType') as string || data.get('type') as string; // Get upload type (general, avatar, admin_uploads, etc.)

    // Handle both single file and multiple files
    const filesToProcess = files.length > 0 ? files : (singleFile ? [singleFile] : []);
    
    if (filesToProcess.length === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type based on upload type
    let allowedTypes: string[];
    let maxSize: number;
    
    if (uploadType === 'uploads') {
      // For user ticket attachments - only images and PDFs
      allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf'
      ];
      maxSize = 3 * 1024 * 1024; // 3MB for user ticket attachments
    } else if (uploadType === 'admin_uploads') {
      // For admin ticket attachments - only images and PDFs
      allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf'
      ];
      maxSize = 10 * 1024 * 1024; // 10MB for admin ticket attachments
    } else {
      // For general uploads (avatars, logos, etc.) - only images
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      maxSize = 5 * 1024 * 1024; // 5MB for images
    }

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

    // Process all files
    const uploadedFiles = [];
    
    for (const file of filesToProcess) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Only ${(uploadType === 'uploads' || uploadType === 'admin_uploads') ? 'images and PDF files' : 'images'} are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.floor(maxSize / (1024 * 1024));
        return NextResponse.json(
          { error: `File ${file.name} is too large. Maximum ${maxSizeMB}MB allowed.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate encrypted filename
      const fileExtension = path.extname(file.name);
      const randomBytes = crypto.randomBytes(16).toString('hex');
      const timestamp = Date.now().toString();
      const hash = crypto.createHash('sha256').update(`${file.name}${timestamp}${randomBytes}`).digest('hex');
      const encryptedFilename = `${hash.substring(0, 16)}${fileExtension}`;
      const filepath = path.join(uploadsDir, encryptedFilename);

      // Write file
      await writeFile(filepath, buffer);

      // Store file info
      uploadedFiles.push({
        originalName: file.name,
        encryptedName: encryptedFilename,
        fileUrl: `/${uploadSubDir}/${encryptedFilename}`,
        fileSize: file.size,
        mimeType: file.type
      });
    }

    // Return response based on single or multiple files
    if (filesToProcess.length === 1) {
      const fileInfo = uploadedFiles[0];
      return NextResponse.json({
        success: true,
        fileUrl: fileInfo.fileUrl,
        filePath: fileInfo.fileUrl,
        originalName: fileInfo.originalName,
        encryptedName: fileInfo.encryptedName,
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType,
        message: 'File uploaded successfully'
      });
    } else {
      return NextResponse.json({
        success: true,
        files: uploadedFiles,
        filePaths: uploadedFiles.map(f => f.fileUrl),
        message: `${uploadedFiles.length} files uploaded successfully`
      });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
