/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'ZodError' && 'errors' in error) {
      // Handle Zod validation errors
      const fieldErrors = (error as any).errors.map((err: any) => err.message);
      return fieldErrors.join('. ');
    }

    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;

      if (prismaError.code === 'P2002') {
        const field = extractFieldName(prismaError.meta?.target);
        return `${capitalize(field)} already exists.`;
      }

      if (prismaError.code === 'P2025') {
        const cause = prismaError.meta?.cause || 'Record';
        return `${capitalize(cause)} not found.`;
      }
    }

    if (error.name === 'PrismaClientInitializationError') {
      return 'Database connection failed. Please check your database configuration.';
    }

    // if (error instanceof AxiosError) {
    //   return `HTTP Request Failed: ${
    //     error.response?.data?.message || error.message
    //   }`;
    // }

    return error.message; // Generic JavaScript error
  }

  return typeof error === 'string' ? error : JSON.stringify(error);
}

export function handleError(error: unknown): string {
  const formattedErrorMessage = formatError(error);
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error);
    console.error('Error in production mode:', error);
  } else {
    console.error('Error in development mode:', error);
  }
  return formattedErrorMessage;
}

// Helper function to clean field names (e.g., "User_email_key" → "Email")
function extractFieldName(target: any): string {
  if (!target) return 'Field';
  if (Array.isArray(target)) target = target[0];

  return (
    target
      .replace(/^(.*?)(_key)?$/, '$1')
      .split('_')
      .pop() || 'Field'
  );
}

// Helper function to capitalize field names
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
