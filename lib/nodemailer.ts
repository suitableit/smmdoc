import nodemailer, { Transporter } from "nodemailer";

interface MailOptions {
  sendTo: string;
  subject: string;
  html: string;
}

// Create the transporter with proper type annotations
const transporter: Transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send mail function with type safety
export const sendMail = async ({
  sendTo,
  subject,
  html,
}: MailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: `"SMMDOC" <${process.env.EMAIL_FROM}>`,
      to: sendTo,
      subject: subject,
      html: html,
    });
    return true;
  } catch (error) {
    console.error("Error in sending mail:", error);
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
