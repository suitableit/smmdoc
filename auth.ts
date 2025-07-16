/* eslint-disable @typescript-eslint/no-explicit-any */
import authConfig from '@/auth.config';
import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth from 'next-auth';
import { db } from './lib/db';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/sign-in',
    error: '/sign-error',
  },
  events: {
    async linkAccount({ user }: any) {
      // Convert string ID to number if needed
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      if (!isNaN(userId)) {
        await db.user.update({
          where: { id: userId },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
