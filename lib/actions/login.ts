'use server';
import * as z from 'zod';

import { auth, signIn } from '@/auth';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { getUserByEmail } from '@/data/user';
import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { db } from '../db';
import { sendMail } from '../nodemailer';
import { generateTwoFactorToken, generateVerificationToken } from '../tokens';
import { signInSchema } from '../validators/auth.validator';

export const login = async (values: z.infer<typeof signInSchema>) => {
  const validedFields = signInSchema.safeParse(values);
  if (!validedFields.success) {
    return { success: false, error: 'Invalid Fields!' };
  }
  const { email, password, code } = validedFields.data;
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.password || !existingUser.email) {
    return { success: false, error: 'User does not exist!' };
  }

  // check password
  const passwordsMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordsMatch) {
    return { success: false, error: 'Invalid Credentials!' };
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
    await signIn('credentials', { email, password });
    return { success: true, message: 'Logged in!' };
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
