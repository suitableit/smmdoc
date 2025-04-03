"use server";

import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { db } from "../db";

export const verificationConfirm = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { success: false, error: "Invalid token" };
  }
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { success: false, error: "Token has expired" };
  }
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { success: false, error: "User not found" };
  }
  await db.user.update({
    where: { id: existingUser.id },
    data: { emailVerified: new Date(), email: existingToken.email },
  });
  await db.verificationToken.delete({ where: { id: existingToken.id } });
  return { success: true, error: "", message: "Email verified" };
};
