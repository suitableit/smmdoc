"use server";
import * as z from "zod";

import { signIn } from "@/auth";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getUserByEmail } from "@/data/user";
import { AuthError } from "next-auth";
import { db } from "../db";
import { sendMail } from "../nodemailer";
import { generateTwoFactorToken, generateVerificationToken } from "../tokens";
import { signInSchema } from "../validators/auth.validator";

export const login = async (values: z.infer<typeof signInSchema>) => {
  const validedFields = signInSchema.safeParse(values);
  if (!validedFields.success) {
    return { success: false, error: "Invalid Fields!" };
  }
  const { email, password, code } = validedFields.data;
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.password || !existingUser.email) {
    return { success: false, error: "User does not exist!" };
  }
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    // Todo send verification email token
    await sendMail({
      sendTo: existingUser.email,
      subject: "Email Verification",
      html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken?.token}">Click here to verify your email</a>`,
    });
    return { success: true, message: "Confirmation email sent!" };
  }

  // Todo: Add 2FA check here
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return { success: false, error: "Invalid 2FA Code!" };
      }
      if (twoFactorToken.token !== code) {
        return { success: false, error: "Invalid 2FA Code!" };
      }
      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { success: false, error: "2FA Code has expired!" };
      }
      // delete two factor token after use
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });
      const existingConfirmationToken = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );
      if (existingConfirmationToken) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmationToken.id },
        });
      }
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendMail({
        sendTo: existingUser.email,
        subject: "2FA Code",
        html: `<p>2FA Code: ${twoFactorToken?.token}</p>`,
      });
      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", { email, password });
    return { success: true, message: "Logged in!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid Credentials!" };
        default:
          return { success: false, error: "Something went wrong!" };
      }
    }
    throw error;
  }
};
