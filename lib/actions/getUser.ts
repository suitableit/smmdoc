/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { auth } from '@/auth';
import { db } from '../db';

// get full user details from db and set in redux store
export const getUserDetails = async () => {
  const session = await auth();
  const id = session?.user?.id;

  const userDetails = await db.user.findUnique({
    where: { id },
    include: {
      addFunds: true,
    },
  });

  if (userDetails) {
    const { password, ...safeUserDetails } = userDetails;
    return safeUserDetails;
  }

  return null;
};
