/* eslint-disable @typescript-eslint/no-explicit-any */
import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getUserById } from "./data/user";
import { db } from "./lib/db";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: "/sign-in",
    error: "/sign-error",
  },
  events: {
    async linkAccount({ user }: any) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }: any) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") return true;
      const existingUser = await getUserById(user.id);
      if (!existingUser || !existingUser.emailVerified) return false;
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
      return true;
    },
    async session({ token, session }: any) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as Role;
      }
      return session;
    },
    async jwt({ token }: any) {
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
