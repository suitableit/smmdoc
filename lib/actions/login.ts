'use server';
import { headers } from 'next/headers';
import * as z from 'zod';

import { auth, signIn } from '@/auth';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { getUserByEmail, getUserByUsername } from '@/data/user';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { ActivityLogger } from '../activity-logger';
import { db } from '../db';
import { sendMail } from '../nodemailer';
import { DEFAULT_SIGN_IN_REDIRECT } from '../routes';
import { generateTwoFactorToken, generateVerificationToken } from '../tokens';
import { signInSchema } from '../validators/auth.validator';

export const login = async (values: z.infer<typeof signInSchema>) => {
  const validedFields = signInSchema.safeParse(values);
  if (!validedFields.success) {
    return { success: false, error: 'Invalid Fields!' };
  }
  const { email, password, code } = validedFields.data;

  // Check if input is email or username
  const isEmail = email.includes('@');

  const existingUser = isEmail
    ? await getUserByEmail(email)
    : await getUserByUsername(email);
  if (!existingUser || !existingUser.password || !existingUser.email) {
    return { success: false, error: 'User does not exist!' };
  }

  // check password
  const passwordsMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordsMatch) {
    return { success: false, error: 'Invalid Credentials!' };
  }

  // Check user status
  if (existingUser.status === 'banned') {
    return { success: false, error: "You're banned from our platform! Please contact support." };
  }

  if (existingUser.status === 'suspended') {
    return { success: false, error: "You're suspended from our platform! Please contact support." };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    // Todo send verification email token
    await sendMail({
      sendTo: existingUser.email,
      subject: 'Email Verification',
      html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken?.token}">Click here to verify your email</a>`,
    });
    return { success: true, message: 'Confirmation email sent!' };
  }

  // Todo: Add 2FA check here
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return { success: false, error: 'Invalid 2FA Code!' };
      }
      if (twoFactorToken.token !== code) {
        return { success: false, error: 'Invalid 2FA Code!' };
      }
      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { success: false, error: '2FA Code has expired!' };
      }
      // delete two factor token after use
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });
      const existingConfirmationToken = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );
      if (existingConfirmationToken) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmationToken.id },
        });
      }
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendMail({
        sendTo: existingUser.email,
        subject: '2FA Code',
        html: `<p>2FA Code: ${twoFactorToken?.token}</p>`,
      });
      return { twoFactor: true };
    }
  }

  try {
    // Check if user is admin
    const isAdmin = existingUser.role === 'admin';
    
    // Determine the redirect URL based on user role
    const redirectUrl = isAdmin ? '/admin' : DEFAULT_SIGN_IN_REDIRECT;
      
    console.log('User role:', existingUser.role);
    console.log('Is admin:', isAdmin);
    console.log('Redirect URL:', redirectUrl);
    
    // Don't redirect here, instead return auth result and redirect URL
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false
    });
    
    console.log('SignIn result:', JSON.stringify(signInResult, null, 2));
    
    // After successful sign-in, check if user is admin again
    const session = await auth();
    console.log('Session after sign-in:', JSON.stringify({
      id: session?.user?.id,
      name: session?.user?.name,
      email: session?.user?.email,
      role: session?.user?.role
    }, null, 2));

    // Log successful login activity with IP address
    try {
      const headersList = headers();
      const clientIP = headersList.get('x-client-ip') || 
                      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      headersList.get('x-real-ip') || 
                      'unknown';
      
      const username = existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`;
      
      if (isAdmin) {
        await ActivityLogger.adminLogin(existingUser.id, username, clientIP);
      } else {
        await ActivityLogger.login(existingUser.id, username, clientIP);
      }
    } catch (logError) {
      console.error('Failed to log login activity:', logError);
      // Don't fail the login if activity logging fails
    }

    return {
      success: true,
      message: 'Logged in successfully!',
      redirectTo: redirectUrl,
      isAdmin: isAdmin
    };
  } catch (error) {
    console.error('Login error details:', error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid Credentials!' };
        case 'CallbackRouteError':
          return { success: false, error: 'Authentication callback error. Please try again.' };
        case 'AccessDenied':
          return { success: false, error: 'Access denied. Please verify your email or contact support.' };
        default:
          console.error('Unknown AuthError type:', error.type);
          return { success: false, error: `Authentication error: ${error.type}` };
      }
    }
    console.error('Non-AuthError during login:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
};

// two factor on off
export const toggleTwoFactor = async (toggle: boolean) => {
  const session = await auth();
  if (!session?.user.id) {
    return { success: false, error: 'User not found!' };
  }
  const user = await getUserByEmail(session.user.email as string);
  if (!user) {
    return { success: false, error: 'User not found!' };
  }
  // toggle true or false
  await db.user.update({
    where: { id: user.id },
    data: {
      isTwoFactorEnabled: toggle,
    },
  });
  // this is use in future
  // if (toggle === true) {
  //   // send email with 2fa code
  //   const twoFactorToken = await generateTwoFactorToken(user.email as string);
  //   await sendMail({
  //     sendTo: user.email as string,
  //     subject: '2FA Code',
  //     html: `<p>2FA Code: ${twoFactorToken?.token}</p>`,
  //   });
  // }
  return { success: true, message: 'Two factor authentication updated!' };
};

// Admin login specific function 
export const adminLogin = async (values: z.infer<typeof signInSchema>) => {
  const validedFields = signInSchema.safeParse(values);
  if (!validedFields.success) {
    return { success: false, error: 'Invalid Fields!' };
  }
  
  const { email, password } = validedFields.data;
  const existingUser = await getUserByEmail(email);
  
  if (!existingUser || !existingUser.password || !existingUser.email) {
    return { success: false, error: 'User does not exist!' };
  }
  
  // Check if user is admin
  if (existingUser.role !== 'admin') {
    return { success: false, error: 'Access denied. Admin login only.' };
  }

  // Check password
  const passwordsMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordsMatch) {
    return { success: false, error: 'Invalid Credentials!' };
  }

  // Check user status (even for admins)
  if (existingUser.status === 'banned') {
    return { success: false, error: "You're banned from our platform! Please contact support." };
  }

  if (existingUser.status === 'suspended') {
    return { success: false, error: "You're suspended from our platform! Please contact support." };
  }

  try {
    console.log('Admin login attempt for user:', email);
    
    // Sign in without redirect
    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false
    });
    
    console.log('Admin login result:', JSON.stringify(signInResult, null, 2));
    
    // Verify session has admin role
    const session = await auth();
    console.log('Admin session after sign-in:', JSON.stringify({
      id: session?.user?.id,
      name: session?.user?.name,
      email: session?.user?.email,
      role: session?.user?.role
    }, null, 2));
    
    // Log admin login activity with IP address
    try {
      const headersList = headers();
      const clientIP = headersList.get('x-client-ip') || 
                      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      headersList.get('x-real-ip') || 
                      'unknown';
      
      const username = existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`;
      await ActivityLogger.adminLogin(existingUser.id, username, clientIP);
    } catch (logError) {
      console.error('Failed to log admin login activity:', logError);
      // Don't fail the login if activity logging fails
    }
    
    return { 
      success: true, 
      message: 'Admin logged in successfully!', 
      redirectTo: '/admin',
      isAdmin: true
    };
  } catch (error) {
    console.error('Admin login error details:', error);
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid Admin Credentials!' };
        default:
          console.error('Unknown AuthError type:', error.type);
          return { success: false, error: `Authentication error: ${error.type}` };
      }
    }
    console.error('Non-AuthError during admin login:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
};
