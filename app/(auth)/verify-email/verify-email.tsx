/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { verificationConfirm } from '@/lib/actions/verification';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';

export default function VerifyEmail() {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
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
      <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
        <div className="mb-6">
          <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
            Confirm your verification
          </h2>
          <p className="text-gray-600 text-center">
            Verification token is required.
          </p>
        </div>
        
        <div className="space-y-5 text-center">
          <FormError message="Missing token" />
          
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 animate-pulse">
            <Link href="/sign-in" className="block w-full h-full">
              Go back to sign in
            </Link>
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-gray-600">
            Need help?{' '}
            <Link href="/support" className="text-purple-600 hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    );

  return (
    <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
          Confirm your verification
        </h2>
        <p className="text-gray-600 text-center">
          {!error && !success && "We are verifying your email. This may take a moment..."}
          {success && "Your email has been verified. You can now sign in to your account."}
          {error && "There was an issue verifying your email."}
        </p>
      </div>
      
      <div className="space-y-5 text-center">
        {!error && !success && (
          <div className="flex justify-center py-4">
            <BeatLoader color="#9333ea" />
          </div>
        )}
        
        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}
        
        <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300 animate-pulse">
          <Link href="/sign-in" className="block w-full h-full">
            Go back to sign in
          </Link>
        </button>
      </div>

      <div className="text-center mt-4">
        <p className="text-gray-600">
          Need help?{' '}
          <Link href="https://wa.me/+8801723139610" target="_blank" className="text-purple-600 hover:underline">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}