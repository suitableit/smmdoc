import { PrismaClient } from '@prisma/client';
import nodemailer, { Transporter } from 'nodemailer';

const prisma = new PrismaClient();

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Fetches email configuration from database
 * @returns EmailConfig object or null if not configured
 */
export async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    const emailSettings = await prisma.emailSettings.findFirst({
      orderBy: { updated_at: 'desc' }
    });

    if (!emailSettings || !emailSettings.smtp_host || !emailSettings.smtp_username) {
      console.warn('Email settings not configured in database');
      return null;
    }

    return {
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: emailSettings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: emailSettings.smtp_username,
        pass: emailSettings.smtp_password,
      },
      from: emailSettings.email || emailSettings.smtp_username,
    };
  } catch (error) {
    console.error('Error fetching email configuration from database:', error);
    return null;
  }
}

/**
 * Creates a nodemailer transporter using database email settings
 * @returns Transporter instance or null if configuration is not available
 */
export async function createEmailTransporter(): Promise<Transporter | null> {
  const config = await getEmailConfig();
  
  if (!config) {
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
      tls: {
        rejectUnauthorized: false,
      },
      // Connection pooling options
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5,
    });

    // Verify the transporter
    await transporter.verify();
    console.log('✅ Email transporter created and verified successfully');
    
    return transporter;
  } catch (error) {
    console.error('❌ Error creating email transporter:', error);
    return null;
  }
}

/**
 * Gets the "from" email address from database settings
 * @returns from email address or null if not configured
 */
export async function getFromEmailAddress(): Promise<string | null> {
  const config = await getEmailConfig();
  return config ? config.from : null;
}