import nodemailer, { Transporter } from "nodemailer";
import { createEmailTransporter, getFromEmailAddress } from './email-config';

interface MailOptions {
  sendTo: string;
  subject: string;
  html: string;
}

// Send mail function with type safety and better error handling
export const sendMail = async ({
  sendTo,
  subject,
  html,
}: MailOptions): Promise<boolean> => {
  try {
    // Create transporter using database settings
    const transporter = await createEmailTransporter();
    
    if (!transporter) {
      console.error("❌ Email transporter not available. Please configure email settings in admin panel.");
      return false;
    }

    // Get from email address from database
    const fromEmail = await getFromEmailAddress();
    
    if (!fromEmail) {
      console.error("❌ From email address not configured. Please configure email settings in admin panel.");
      return false;
    }
    
    await transporter.sendMail({
      from: `"SMMDOC" <${fromEmail}>`,
      to: sendTo,
      subject: subject,
      html: html,
    });
    
    console.log(`✅ Email sent successfully to: ${sendTo}`);
    return true;
  } catch (error) {
    // Type assertion for error handling
    const emailError = error as any;
    
    console.error("❌ Error in sending mail:", {
      code: emailError.code || 'UNKNOWN',
      message: emailError.message || 'Unknown error occurred',
      to: sendTo,
      subject: subject
    });
    
    // Log specific authentication errors
    if (emailError.code === 'EAUTH') {
      console.error("🔐 Authentication failed. Please check:");
      console.error("- SMTP username is correct in admin email settings");
      console.error("- SMTP password is valid in admin email settings");
      console.error("- SMTP settings are correct for your email provider");
    }
    
    return false;
  }
};

// Send verification email function
export const sendVerificationEmail = async (
  email: string,
  token: string,
  userName?: string
): Promise<boolean> => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;
  const name = userName || 'User';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification - SMMDOC</h2>
      <p>Hello ${name},</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>Best regards,<br>SMMDOC Team</p>
    </div>
  `;

  return await sendMail({
    sendTo: email,
    subject: 'Verify Your Email - SMMDOC',
    html: html,
  });
};

// Send password reset email function
export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  userName?: string
): Promise<boolean> => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  const name = userName || 'User';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset - SMMDOC</h2>
      <p>Hello ${name},</p>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>SMMDOC Team</p>
    </div>
  `;

  return await sendMail({
    sendTo: email,
    subject: 'Password Reset - SMMDOC',
    html: html,
  });
};
