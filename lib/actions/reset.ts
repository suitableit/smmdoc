"use server";

import { getUserByEmail } from "@/data/user";
import * as z from "zod";
import { sendMail } from "../nodemailer";
import { generatePasswordResetToken } from "../tokens";
import { resetSchema } from "../validators/auth.validator";

export const resetPassword = async (values: z.infer<typeof resetSchema>) => {
  const validatedFields = resetSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid field" };
  }
  const { email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return { success: false, error: "Email does not exist!" };
  }
  // Todo: generate token and send email
  const resetPasswordToken = await generatePasswordResetToken(email);
  await sendMail({
    sendTo: email,
    subject: "Reset Password",
    html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${resetPasswordToken.token}">Click here to reset your password</a>`,
  });
  return {
    success: true,
    error: "",
    message: "Reset password link email sent",
  };
};
