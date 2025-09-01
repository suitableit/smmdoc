import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

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
    const { to, subject, message } = body;
    
    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields (to, subject, message) are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }
    
    // Get SMTP settings from database
    const emailSettings = await prisma.emailSettings.findFirst();
    
    if (!emailSettings || !emailSettings.smtp_host || !emailSettings.smtp_username) {
      return NextResponse.json(
        { error: 'SMTP settings not configured. Please configure SMTP settings first.' },
        { status: 400 }
      );
    }

    // Create transporter with database SMTP settings
    const transporter = nodemailer.createTransport({
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: emailSettings.smtp_protocol === 'ssl', // true for SSL, false for TLS/STARTTLS
      auth: {
        user: emailSettings.smtp_username,
        pass: emailSettings.smtp_password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Send test email
    try {
      await transporter.sendMail({
         from: `"SMMDOC Test" <${emailSettings.email || emailSettings.smtp_username}>`,
         to: to,
         subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Test Email</h2>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>This is a test email sent from your SMTP configuration.</strong></p>
            </div>
            <div style="margin: 20px 0;">
              <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
              <p style="color: #555; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>Sent at: ${new Date().toLocaleString()}</p>
            <p>From: ${session.user.email || 'Admin'}</p>
          </div>
        </div>
      `
       });

      console.log(`✅ Test email sent successfully to ${to}`);
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        data: {
          recipient: to,
          subject: subject,
          sentAt: new Date().toISOString()
        }
      });
    } catch (emailError: any) {
      console.error('❌ Error sending test email:', {
        code: emailError.code || 'UNKNOWN',
        message: emailError.message || 'Unknown error occurred',
        to: to,
        subject: subject
      });
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to send test email. Please check your SMTP settings.';
      
      if (emailError.code === 'EAUTH') {
        errorMessage = 'SMTP Authentication failed. Please check your username and password.';
      } else if (emailError.code === 'ECONNECTION') {
        errorMessage = 'Cannot connect to SMTP server. Please check your host and port settings.';
      } else if (emailError.code === 'ETIMEDOUT') {
        errorMessage = 'Connection timeout. Please check your SMTP server settings.';
      } else if (emailError.message) {
        errorMessage = `SMTP Error: ${emailError.message}`;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: String(error) },
      { status: 500 }
    );
  }
}