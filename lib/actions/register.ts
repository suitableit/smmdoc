"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";

import { getUserByEmail } from "@/data/user";
import { db } from "../db";
import { sendMail } from "../nodemailer";
import { generateVerificationToken } from "../tokens";
import { signUpSchema } from "../validators/auth.validator";

export const register = async (values: z.infer<typeof signUpSchema>) => {
  const validatedFields = signUpSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }
  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: "User already exists" };
  }
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  // Todo send verification email token
  await sendMail({
    sendTo: email,
    subject: "Email Verification",
    html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken?.token}">Click here to verify your email</a>`,
  });
  return { success: true, error: "", message: "Confirmation email sent" };
};
