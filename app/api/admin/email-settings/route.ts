import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get email settings from database
    const emailSettings = await prisma.emailSettings.findFirst();
    
    return NextResponse.json({
      success: true,
      data: emailSettings || {
        email: '',
        smtp_username: '',
        smtp_password: '',
        smtp_host: '',
        smtp_port: 587,
        smtp_protocol: 'tls'
      }
    });
    
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { email, smtp_username, smtp_password, smtp_host, smtp_port, smtp_protocol } = body;

    // Validate required fields
    if (!email || !smtp_username || !smtp_password || !smtp_host || !smtp_port) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Update or create email settings
    const emailSettings = await prisma.emailSettings.upsert({
      where: { id: 1 },
      update: {
        email,
        smtp_username,
        smtp_password,
        smtp_host,
        smtp_port: parseInt(smtp_port),
        smtp_protocol: smtp_protocol || 'tls',
        updated_at: new Date()
      },
      create: {
        id: 1,
        email,
        smtp_username,
        smtp_password,
        smtp_host,
        smtp_port: parseInt(smtp_port),
        smtp_protocol: smtp_protocol || 'tls',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email settings saved successfully',
      data: emailSettings
    });
    
  } catch (error) {
    console.error('Error saving email settings:', error);
    return NextResponse.json(
      { error: 'Failed to save email settings' },
      { status: 500 }
    );
  }
}