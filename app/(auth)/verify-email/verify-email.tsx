
'use client';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { verificationConfirm } from '@/lib/actions/verification';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function VerifyEmail() {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  const verifying = useRef(false);

  const verifyEmail = useCallback(async () => {
    if (verifying.current) return;
    if (!token) {
      setError('Missing token');
      return;
    }
    verifying.current = true;
    try {
      const data = await verificationConfirm(token);
      setError(data.error);
      setSuccess(data.message);
    } catch (error) {
      setError('An error occurred');
    } finally {
      verifying.current = false;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [verifyEmail, token]);

  if (!token)
    return (
      <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
        <div className="mb-6">
          <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
            Confirm your verification
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center transition-colors duration-200">
            Verification token is required.
          </p>
        </div>

        <div className="space-y-5 text-center">
          <FormError message="Missing token" />

          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg dark:shadow-lg dark:shadow-red-500/20 hover:dark:shadow-red-500/30 transition-all duration-300 animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed">
            <Link href="/sign-in" className="block w-full h-full">
              Go back to sign in
            </Link>
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
            Need help?{' '}
            <Link
              href="/support"
              className="text-[var(--primary)] dark:text-[var(--secondary)] hover:underline transition-colors duration-200"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Confirm your verification
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center transition-colors duration-200">
          {!error &&
            !success &&
            'We are verifying your email. This may take a moment...'}
          {success &&
            'Your email has been verified. You can now sign in to your account.'}
          {error && 'There was an issue verifying your email.'}
        </p>
      </div>

      <div className="space-y-5 text-center">
        {!error && !success && (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-2xl text-[var(--primary)] dark:text-[var(--secondary)]" />
          </div>
        )}

        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}

        <button className="w-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 animate-pulse hover:animate-none disabled:opacity-50 disabled:cursor-not-allowed">
          <Link href="/sign-in" className="block w-full h-full">
            Go back to sign in
          </Link>
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          Need help?{' '}
          <Link
            href="https://wa.me/+8801723139610"
            target="_blank"
            className="text-[var(--primary)] dark:text-[var(--secondary)] hover:underline transition-colors duration-200"
          >
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
