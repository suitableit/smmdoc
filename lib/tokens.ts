import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { getVerificationTokenByEmail } from "@/data/verification-token";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";

export const generateTwoFactorToken = async (email: string) => {
  const token = crypto.randomInt(100_000, 1000_000).toString();
  const expires = new Date(new Date().getTime() + 1000 * 60 * 5); // 5 minutes
  const existingToken = await getTwoFactorTokenByEmail(email);
  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }
  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      token,
      email,
      expires,
    },
  });
  return twoFactorToken;
};

export const generatePasswordResetToken = async (email: string) => {
  // Check user settings for reset link limit
  const userSettings = await db.userSettings.findFirst();
  const resetLinkMax = userSettings?.resetLinkMax || 3;

  // Check how many reset tokens were created today for this email
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayResetCount = await db.passwordResetToken.count({
    where: {
      email,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (todayResetCount >= resetLinkMax) {
    throw new Error(`You have reached the maximum number of password reset attempts (${resetLinkMax}) for today. Please try again tomorrow.`);
  }

  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours

  // Don't delete existing token, just create a new one (for limit tracking)
  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      token,
      email,
      expires,
    },
  });
  return passwordResetToken;
};

export const generateVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24 hours
  const existingToken = await getVerificationTokenByEmail(email);
  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }
  const verificationToken = await db.verificationToken.create({
    data: {
      token,
      email,
      expires,
    },
  });
  return verificationToken;
};
