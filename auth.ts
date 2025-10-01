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
  events: {
    async linkAccount({ user }: any) {
      // Convert string ID to number if needed
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      if (!isNaN(userId)) {
        // Check if this is a new user (balance is 0 and total_deposit is 0)
        const existingUser = await db.user.findUnique({
          where: { id: userId },
          select: { balance: true, total_deposit: true }
        });

        // Check user settings for free balance and email confirmation
        const userSettings = await db.userSettings.findFirst();
        let initialBalance = 0;

        if (userSettings?.userFreeBalanceEnabled && userSettings?.freeAmount > 0) {
          initialBalance = userSettings.freeAmount;
        }

        // Check if email confirmation is enabled
        const emailConfirmationEnabled = userSettings?.emailConfirmationEnabled ?? true;

        // Update user with email verification and free balance if applicable
        const updateData: {
          emailVerified?: Date;
          balance?: number;
          total_deposit?: number;
        } = {};

        // Only set emailVerified if email confirmation is enabled (OAuth users are auto-verified)
        if (emailConfirmationEnabled) {
          updateData.emailVerified = new Date();
        } else {
          // If email confirmation is disabled, still verify OAuth users
          updateData.emailVerified = new Date();
        }

        if (existingUser && existingUser.balance === 0 && existingUser.total_deposit === 0 && initialBalance > 0) {
          updateData.balance = initialBalance;
          updateData.total_deposit = initialBalance;
        }

        await db.user.update({
          where: { id: userId },
          data: updateData,
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
