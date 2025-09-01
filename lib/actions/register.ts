"use server";
import bcrypt from "bcryptjs";
import * as z from "zod";

import { getUserByEmail } from "@/data/user";
import { db } from "../db";
import { sendMail } from "../nodemailer";
import { generateVerificationToken } from "../tokens";
import { signUpSchema } from "../validators/auth.validator";
import { verifyReCAPTCHA, getReCAPTCHASettings } from "../recaptcha";

export const register = async (values: z.infer<typeof signUpSchema> & { recaptchaToken?: string }) => {
  console.log('Received values:', values);
  
  // Add confirmPassword if it doesn't exist
  if (!values.confirmPassword && values.password) {
    values = { ...values, confirmPassword: values.password };
    console.log('Added confirmPassword:', values);
  }
  
  // Verify reCAPTCHA if enabled and token provided
  const recaptchaSettings = await getReCAPTCHASettings();
  if (recaptchaSettings && recaptchaSettings.enabledForms?.signUp) {
    if (!values.recaptchaToken) {
      return { success: false, error: "reCAPTCHA verification is required" };
    }

    const recaptchaResult = await verifyReCAPTCHA(
      values.recaptchaToken,
      recaptchaSettings.secretKey,
      recaptchaSettings.version === 'v3' ? 'signup' : undefined,
      recaptchaSettings.version === 'v3' ? recaptchaSettings.threshold : undefined
    );

    if (!recaptchaResult.success) {
      return { success: false, error: recaptchaResult.error || "reCAPTCHA verification failed" };
    }
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

  // Check if email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: "Email already exists" };
  }

  // Check if username already exists
  const existingUsername = await db.user.findUnique({
    where: { username: username }
  });
  if (existingUsername) {
    return { success: false, error: "Username is already exist" };
  }
  try {
    // Check user settings for free balance and email confirmation
    const userSettings = await db.userSettings.findFirst();
    let initialBalance = 0;

    if (userSettings?.userFreeBalanceEnabled && userSettings?.freeAmount > 0) {
      initialBalance = userSettings.freeAmount;
    }

    // Check if email confirmation is enabled
    const emailConfirmationEnabled = userSettings?.emailConfirmationEnabled ?? true;

    await db.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        balance: initialBalance,
        total_deposit: initialBalance, // If free balance is given, count it as deposit
        emailVerified: emailConfirmationEnabled ? null : new Date(), // Auto-verify if email confirmation is disabled
      },
    });

    // Only send verification email if email confirmation is enabled
    if (emailConfirmationEnabled) {
      const verificationToken = await generateVerificationToken(email);
      await sendMail({
        sendTo: email,
        subject: "Email Verification",
        html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken?.token}">Click here to verify your email</a>`,
      });
    }

    // Create appropriate success message based on settings
    let successMessage = "Registration successful!";

    if (initialBalance > 0) {
      successMessage += ` You have received $${initialBalance} as welcome bonus.`;
    }

    if (emailConfirmationEnabled) {
      successMessage += " Please check your email for verification link. You must verify your email before logging in.";
    } else {
      successMessage += " You can now log in to your account.";
    }

    return { success: true, error: "", message: successMessage };
  } catch (error) {
    console.error('Database error during user creation:', error);
    return { success: false, error: "Failed to create user account. Please try again." };
  }
};
