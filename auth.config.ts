
import { user_role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

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
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials): Promise<any> {
        const validedFields = signInSchema.safeParse(credentials);
        if (validedFields.success) {
          const { email, password } = validedFields.data;

          const isEmail = email.includes('@');

          const user = isEmail
            ? await getUserByEmail(email)
            : await getUserByUsername(email);

          if (!user || !user.password) return null;

          if (password && password.startsWith('VERIFICATION_TOKEN:')) {
            const verificationCode = password.replace('VERIFICATION_TOKEN:', '');
            const { getVerificationTokenByToken } = await import('./data/verification-token');
            const verificationToken = await getVerificationTokenByToken(verificationCode);
            
            if (verificationToken && 
                verificationToken.email === user.email && 
                new Date(verificationToken.expires) > new Date()) {
              return user;
            }
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, request }: any) {

      if (account?.provider !== 'credentials') return true;
      const existingUser = await getUserById(user.id);
      if (!existingUser) return false;

      if (existingUser.status === 'banned') {
        console.log(`Blocked login attempt for banned user: ${existingUser.email}`);
        return false;
      }

      if (existingUser.status === 'suspended') {
        console.log(`Blocked login attempt for suspended user: ${existingUser.email}`);
        return false;
      }















      console.log(`Successful login: ${existingUser.email} (Role: ${existingUser.role})`);

      try {
        const username = existingUser.username || existingUser.email?.split('@')[0] || `user${existingUser.id}`;


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

        const numericId = parseInt(token.sub);
        if (!isNaN(numericId)) {
          session.user.id = numericId;
        } else {

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

        session.user.isImpersonating = token.isImpersonating || false;
        session.user.originalAdminId = token.originalAdminId || null;
      }
      return session;
    },
    async jwt({ token, req }: any) {
      if (!token.sub) return token;





      const impersonatedUserId = null;
      const originalAdminId = null;

      if (impersonatedUserId && originalAdminId) {

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

      token.isImpersonating = false;
      token.originalAdminId = null;

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
        if (token.email) {
          let existingUser = await getUserByEmail(token.email);
          if (!existingUser) {
            const created = await db.users.create({
              data: {
                email: token.email,
                name: token.name || token.email.split('@')[0],
                image: token.picture || null,
                username: token.email.split('@')[0],
                role: 'user',
                status: 'active',
              },
            });
            existingUser = created as any;
          }
          token.sub = existingUser.id;
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
      
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-error",
  },
  trustHost: true,
} satisfies NextAuthConfig;
