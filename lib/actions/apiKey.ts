'use server';

import { auth } from '@/auth';
import { db } from '../db';

export const generateApiKeys = async () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const generateApiKey = () =>
    Array.from(
      { length: 32 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  const apiKey = generateApiKey();
  const session = await auth();
  // store the api key in the database
  const existingApiKey = await db.apiKey.findFirst({
    where: {
      userId: session?.user.id,
    },
  });
  if (existingApiKey) {
    await db.apiKey.update({
      where: { id: existingApiKey.id },
      data: { key: apiKey, createdAt: new Date() },
    });
  } else {
    await db.apiKey.create({
      data: {
        userId: parseInt(session?.user.id || '0'),
        key: apiKey,
      },
    });
  }
  return { success: true, message: 'apiKey generate success!' };
};

// get api key
export const getApiKey = async () => {
  const session = await auth();
  const apiKey = await db.apiKey.findFirst({
    where: {
      userId: session?.user.id,
    },
  });
  if (!apiKey) {
    return { success: false, error: 'API Key not found!' };
  }
  return { success: true, data: apiKey };
};
