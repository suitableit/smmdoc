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

    // Use support email from Email Settings, fallback to SMTP username
    const supportEmail = emailSettings.email || emailSettings.smtp_username;

    return {
      host: emailSettings.smtp_host,
      port: emailSettings.smtp_port,
      secure: emailSettings.smtp_port === 465, // true for 465, false for other ports
      auth: {
        user: emailSettings.smtp_username,
        pass: emailSettings.smtp_password,
      },
      from: supportEmail,
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
      // Connection timeout settings
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
      // Only add DKIM if private key is provided
      ...(process.env.DKIM_PRIVATE_KEY && {
        dkim: {
          domainName: config.from.split('@')[1] || config.host,
          keySelector: 'default',
          privateKey: process.env.DKIM_PRIVATE_KEY,
        }
      }),
    });

    // Verify the transporter
    console.log('🔍 Attempting to verify transporter...');
    try {
      await transporter.verify();
      console.log('Email transporter created and verified successfully');
    } catch (verifyError) {
      console.warn('Transporter verification failed, but continuing anyway:', (verifyError as Error).message);
      console.log('Transporter created without verification');
    }
    
    return transporter;
  } catch (error) {
    const err = error as Error & { code?: string; command?: string; response?: string; responseCode?: number };
    console.error('Error creating email transporter:', err.message);
    console.error('Full error details:', {
      name: err.name,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode
    });
    return null;
  }
}

/**
 * Gets the "from" email address from General Settings (Administration Email Address)
 * @returns from email address or null if not configured
 */
export async function getFromEmailAddress(): Promise<string | null> {
  try {
    // Use Support Email Address from Email Settings
    const emailSettings = await prisma.emailSettings.findFirst({
      orderBy: { updated_at: 'desc' }
    });
    
    if (emailSettings?.email) {
      return emailSettings.email;
    }
    
    // Fallback to SMTP username if support email not set
    return emailSettings?.smtp_username || null;
  } catch (error) {
    console.error('Error fetching support email from Email Settings:', error);
    return null;
  }
}