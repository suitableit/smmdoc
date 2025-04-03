"use server";

import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import bcrypt from "bcryptjs";
import * as z from "zod";
import { db } from "../db";
import { newPasswordSchema } from "../validators/auth.validator";

export const newPasswordValues = async (
  values: z.infer<typeof newPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { success: false, error: "Missing token" };
  }
  const validtedValues = newPasswordSchema.safeParse(values);
  if (!validtedValues.success) {
    return { success: false, error: "Invalid field" };
  }
  const { password } = validtedValues.data;
  const existingToken = await getPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { success: false, error: "Invalid token" };
  }
  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { success: false, error: "Token has expired" };
  }
  const existingUser = await getUserByEmail(existingToken.email);
  if (!existingUser) {
    return { success: false, error: "User does not exist" };
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.user.update({
    where: { email: existingToken.email },
    data: { password: hashedPassword },
  });
  await db.passwordResetToken.delete({ where: { token } });
  return { success: true, error: "", message: "Password updated successfully" };
};
