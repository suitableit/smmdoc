'use client';
import ButtonLoader from '@/components/button-loader';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import Social from '@/components/social';
import { login } from '@/lib/actions/login';
import {
  signInDefaultValues,
  SignInSchema,
  signInSchema,
} from '@/lib/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaUser, FaLock } from 'react-icons/fa';

export default function SignInForm() {
  const searchParams = useSearchParams();
  const [urlError, setUrlError] = useState(
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Email already in use with different provider!'
      : ''
  );
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  
  const form = useForm<SignInSchema>({
    mode: 'all',
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  });

  const onSubmit: SubmitHandler<SignInSchema> = async (values) => {
    setError('');
    setSuccess('');
    setUrlError('');
    
    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.message) {
            setSuccess(data.message);
          }
          if (data?.twoFactor) {
            setShowTwoFactor(true);
          }
        })
        .catch((err) => {
          setError('An unexpected error occurred. Please try again.');
          console.error('Sign in error:', err);
        });
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Sign In
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center transition-colors duration-200">
          Enter your details below to sign in.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {showTwoFactor ? (
          <div>
            <label htmlFor="code" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
              2FA Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
              </div>
              <input
                type="text"
                id="code"
                placeholder="e.g: 123456"
                disabled={isPending}
                {...form.register('code')}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
            {form.formState.errors.code && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.code.message}</p>
            )}
          </div>
        ) : (
          <>
            <div>
              <label htmlFor="email" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                Username of Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="eg: john"
                  disabled={isPending}
                  {...form.register('email')}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="e.g: ********"
                  disabled={isPending}
                  {...form.register('password')}
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#5F1DE8] focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 transition-colors duration-200"
              />
              <label htmlFor="remember" className="ml-2 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                Remember me
              </label>
            </div>
          </>
        )}

        <FormError message={error || urlError} />
        <FormSuccess message={success} />
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <ButtonLoader />
          ) : showTwoFactor ? (
            'Confirm'
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {!showTwoFactor && (
        <>
          <Social />
          <div className="text-center mt-4">
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
              Lost Your Password?{' '}
              <Link href="/reset-password" className="text-[#5F1DE8] dark:text-[#B131F8] hover:underline transition-colors duration-200">
                Reset now
              </Link>
            </p>
            <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
              New Here?{' '}
              <Link href="/sign-up" className="text-[#5F1DE8] dark:text-[#B131F8] hover:underline transition-colors duration-200">
                Create an account
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}