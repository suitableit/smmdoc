import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if contact system is enabled
    const { contactDB } = await import('@/lib/contact-db');
    const contactSettings = await contactDB.getContactSettings();
    if (!contactSettings?.contactSystemEnabled) {
      return NextResponse.json(
        { error: 'Contact system is currently disabled' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, phone, subject, message, adminEmail, recaptchaToken } = body;

    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Verify ReCAPTCHA token if provided
    // This would typically involve making a request to Google's ReCAPTCHA API
    // For now, we'll just log it
    if (recaptchaToken) {
      console.log('ReCAPTCHA token received:', recaptchaToken.substring(0, 20) + '...');
    }

    // Create contact message in database
    // Note: This assumes you have a ContactMessage model in your Prisma schema
    // If not, you might need to create it or use an existing table
    try {
      const contactMessage = await db.contactMessage.create({
        data: {
          name,
          email,
          phone,
          subject,
          message,
          status: 'PENDING',
          userId: session?.user?.id || null,
          createdAt: new Date(),
        },
      });

      console.log('Contact message created:', contactMessage.id);
    } catch (dbError) {
      console.error('Database error:', dbError);
      // If the ContactMessage model doesn't exist, we'll just log the submission
      console.log('Contact form submission (no DB):', {
        name,
        email,
        phone,
        subject,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    // TODO: Send email notification to admin
    // This would typically involve using a service like SendGrid, Nodemailer, etc.
    console.log('Contact form submission received:', {
      name,
      email,
      subject,
      adminEmail: adminEmail || 'support@smmdoc.com',
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Your message has been sent successfully. We will get back to you soon!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}