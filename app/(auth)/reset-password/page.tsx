import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import ResetForm from "./reset-password";

// Check if password reset is enabled
async function checkPasswordResetEnabled() {
  const userSettings = await db.userSettings.findFirst();
  return userSettings?.resetPasswordEnabled ?? true;
}

export default async function page() {
  const isPasswordResetEnabled = await checkPasswordResetEnabled();

  if (!isPasswordResetEnabled) {
    redirect('/sign-in?message=password-reset-disabled');
  }

  return (
    <div className="w-full max-w-xl mx-auto py-[60px]">
      <ResetForm />
    </div>
  );
}