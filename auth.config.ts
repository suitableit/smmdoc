/* eslint-disable @typescript-eslint/no-explicit-any */

import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { getTwoFactorConfirmationByUserId } from './data/two-factor-confirmation';
import { getUserByEmail, getUserById } from './data/user';
import { db } from './lib/db';
import { signInSchema } from './lib/validators/auth.validator';

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validedFields = signInSchema.safeParse(credentials);
        if (validedFields.success) {
          const { email, password } = validedFields.data;
          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
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

      // Todo: Add 2FA check here
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );
        if (!twoFactorConfirmation) return false;
        // delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      // Log successful login for security monitoring
      console.log(`Successful login: ${existingUser.email} (Role: ${existingUser.role})`);

      // Log activity for user login
      try {
        if (existingUser.role === 'admin') {
          await ActivityLogger.adminLogin(existingUser.id, existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`);
        } else {
          await ActivityLogger.login(existingUser.id, existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`);
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
        session.user.role = token.role as Role;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled;
        session.user.currency = token.currency;
        session.user.name = token.name;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.balance = token.balance;
      }
      return session;
    },
    async jwt({ token }: any) {
      if (!token.sub) return token;

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
