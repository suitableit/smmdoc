/* eslint-disable @typescript-eslint/no-explicit-any */

import { user_role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
// import { cookies } from 'next/headers'; // Removed to fix edge runtime error
import { getTwoFactorConfirmationByUserId } from './data/two-factor-confirmation';
import { getUserByEmail, getUserById, getUserByUsername } from './data/user';
import { ActivityLogger } from './lib/activity-logger';
import { db } from './lib/db';
import { signInSchema } from './lib/validators/auth.validator';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials): Promise<any> {
        const validedFields = signInSchema.safeParse(credentials);
        if (validedFields.success) {
          const { email, password } = validedFields.data;

          // Check if input is email or username
          const isEmail = email.includes('@');

          const user = isEmail
            ? await getUserByEmail(email)
            : await getUserByUsername(email);

          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, request }: any) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;
      const existingUser = await getUserById(user.id);
      if (!existingUser) return false;

      // Check if user account is active
      if (existingUser.status === 'banned') {
        console.log(`Blocked login attempt for banned user: ${existingUser.email}`);
        return false;
      }

      if (existingUser.status === 'suspended') {
        console.log(`Blocked login attempt for suspended user: ${existingUser.email}`);
        return false;
      }

      // Temporarily allow sign-in without email verification for development
      // TODO: Re-enable email verification requirement in production
      // if (!existingUser.emailVerified) return false;

      // Todo: Add 2FA check here - COMMENTED OUT FOR DIRECT LOGIN
      // if (existingUser.isTwoFactorEnabled) {
      //   const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
      //     existingUser.id.toString()
      //   );
      //   if (!twoFactorConfirmation) return false;
      //   // delete two factor confirmation for next sign in
      //   await db.twoFactorConfirmation.delete({
      //     where: { id: twoFactorConfirmation.id },
      //   });
      // }

      // Log successful login for security monitoring
      console.log(`Successful login: ${existingUser.email} (Role: ${existingUser.role})`);

      // Log activity for user login
      try {
        const username = existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`;
        // Note: IP address will be logged separately in login action
        
        if (existingUser.role === 'admin') {
          await ActivityLogger.adminLogin(existingUser.id, username, 'unknown');
        } else {
          await ActivityLogger.login(existingUser.id, username, 'unknown');
        }
      } catch (error) {
        console.error('Failed to log activity:', error);
      }

      return true;
    },

    async session({ token, session }: any) {
      if (token.sub && session.user) {
        // Convert string ID to number if needed
        const numericId = parseInt(token.sub);
        if (!isNaN(numericId)) {
          session.user.id = numericId;
        } else {
          // For old string IDs, user needs to re-login
          session.user.id = null;
        }
      }
      if (token.role && session.user) {
        session.user.role = token.role as user_role;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.currency = token.currency;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.balance = token.balance;
        session.user.image = token.image;
        
        // Handle impersonation
        session.user.isImpersonating = token.isImpersonating || false;
        session.user.originalAdminId = token.originalAdminId || null;
      }
      return session;
    },
    async jwt({ token, req }: any) {
      if (!token.sub) return token;

      // Check for impersonation cookies using Next.js cookies() function
      // Temporarily disabled to fix edge runtime error
      // const cookieStore = await cookies();
      // const impersonatedUserId = cookieStore.get('impersonated-user-id')?.value;
      // const originalAdminId = cookieStore.get('original-admin-id')?.value;
      const impersonatedUserId = null;
      const originalAdminId = null;



      if (impersonatedUserId && originalAdminId) {
        // User is being impersonated
        const impersonatedUser = await getUserById(parseInt(impersonatedUserId));
        if (impersonatedUser) {
          token.sub = impersonatedUser.id;
          token.role = impersonatedUser.role;
          token.isTwoFactorEnabled = impersonatedUser.isTwoFactorEnabled;
          token.currency = impersonatedUser.currency;
          token.name = impersonatedUser.name;
          token.username = impersonatedUser.username;
          token.email = impersonatedUser.email;
          token.balance = impersonatedUser.balance;
          token.image = impersonatedUser.image;
          token.isImpersonating = true;
          token.originalAdminId = parseInt(originalAdminId);
          return token;
        }
      }

      // Normal user session (not impersonating)
      token.isImpersonating = false;
      token.originalAdminId = null;

      // Convert string ID to number if needed
      const numericId = parseInt(token.sub);
      if (!isNaN(numericId)) {
        token.sub = numericId;
        const existingUser = await getUserById(numericId);
        if (!existingUser) return token;
        token.role = existingUser.role;
        token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
        token.currency = existingUser.currency;
        token.name = existingUser.name;
        token.username = existingUser.username;
        token.email = existingUser.email;
        token.balance = existingUser.balance;
        token.image = existingUser.image;
      } else {
        // For old string IDs, try to get user by email as fallback
        if (token.email) {
          const existingUser = await getUserByEmail(token.email);
          if (existingUser) {
            token.sub = existingUser.id; // Update to new numeric ID
            token.role = existingUser.role;
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
            token.currency = existingUser.currency;
            token.name = existingUser.name;
            token.username = existingUser.username;
            token.email = existingUser.email;
            token.balance = existingUser.balance;
            token.image = existingUser.image;
          }
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-error",
  },
} satisfies NextAuthConfig;
