import { Role } from '@prisma/client';
import { DefaultSession } from 'next-auth';

export type ExtendedUser = DefaultSession['user'] & {
  role: Role;
  isTwoFactorEnabled: boolean;
  id: string;
  email: string;
  name: string;
  currency: string;
  username?: string;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}
