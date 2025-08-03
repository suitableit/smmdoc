'use server';

import { auth } from '@/auth';
import { getUserById } from '@/data/user';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { PasswordForm } from '../validators/auth.validator';

export const changePassword = async (values: PasswordForm) => {
  const { currentPass, newPass, confirmNewPass } = values;
  if (!currentPass || !newPass || !confirmNewPass) {
    return { success: false, error: 'All fields are required!' };
  }
  if (newPass !== confirmNewPass) {
    return { success: false, error: 'Passwords do not match!' };
  }
  if (currentPass === newPass) {
    return {
      success: false,
      error: 'New password cannot be the same as current password!',
    };
  }
  const session = await auth();
  const user = await getUserById(session?.user.id || '0');
  if (!user) {
    return { success: false, error: 'User not found!' };
  }
  const isPasswordValid = await bcrypt.compare(
    currentPass,
    user?.password as string
  );
  if (!isPasswordValid) {
    return { success: false, error: 'Current password is incorrect!' };
  }
  const hashedPassword = await bcrypt.hash(newPass, 10);
  await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
  return { success: true, message: 'Password changed successfully!' };
};
