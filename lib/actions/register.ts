"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";

import { getUserByEmail } from "@/data/user";
import { db } from "../db";
import { sendMail } from "../nodemailer";
import { generateVerificationToken } from "../tokens";
import { signUpSchema } from "../validators/auth.validator";

export const register = async (values: z.infer<typeof signUpSchema>) => {
  console.log('Received values:', values);
  
  // Add confirmPassword if it doesn't exist
  if (!values.confirmPassword && values.password) {
    values = { ...values, confirmPassword: values.password };
    console.log('Added confirmPassword:', values);
  }
  
  const validatedFields = signUpSchema.safeParse(values);
  console.log('Validation result:', validatedFields);
  
  if (!validatedFields.success) {
    console.log('Validation errors:', validatedFields.error.format());
    return { success: false, error: "Invalid fields" };
  }
  const { username, name, email, password, confirmPassword } = validatedFields.data;
  
  // Check if passwords match
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: "User already exists" };
  }
  await db.user.create({
    data: {
      username,
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
  return { success: true, error: "", message: "Registration successful! Please check your email for verification link. You must verify your email before logging in." };
};
