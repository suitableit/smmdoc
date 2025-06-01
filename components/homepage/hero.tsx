'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useTransition } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { login } from '@/lib/actions/login';
import {
  signInDefaultValues,
  SignInSchema,
  signInSchema,
} from '@/lib/validators/auth.validator';
import ButtonLoader from '@/components/button-loader';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { DEFAULT_SIGN_IN_REDIRECT } from "@/lib/routes";
import { signIn } from "next-auth/react";

const HeroSection: React.FC = () => {
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
          console.error('Login error:', err);
        });
    });
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: DEFAULT_SIGN_IN_REDIRECT });
  };

  return (
    <section className="flex justify-center items-center pt-[120px] pb-[60px] bg-cover bg-top bg-no-repeat bg-white dark:bg-[#0d0712] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-x-20 items-center">
          {/* Left side */}
          <div>
            <div className="text-center lg:text-left">
              <h1
                className="text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 dark:text-white leading-tight transition-colors duration-200"
                data-aos="fade-down"
                data-aos-duration="500"
              >
                <span className="text-[#5F1DE8] dark:text-[#B131F8]">SMMDOC - #1</span> <br />
                Cheap SMM Panel
              </h1>
              <p
                className="text-lg mb-6 leading-7 text-gray-600 dark:text-gray-300 w-4/5 lg:w-full mx-auto lg:mx-0 transition-colors duration-200"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                Boost your online presence today with our Cheap SMM Panel – the ultimate solution for social media success! Smmdoc is a SMM Panel with more then 3 years on the market and 21 Orders processed successfully until now!
              </p>
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white px-7 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center space-x-2 hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 mb-4 hover:-translate-y-1"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                <span>Sign Up Now</span>
              </Link>
              
              {/* Users count section */}
              <div 
                className="flex items-center gap-3 justify-center lg:justify-start mt-4"
                data-aos="fade-up"
                data-aos-duration="1200"
              >
                <Image
                  src="/smmgen-users.webp"
                  alt="SMMGen Users"
                  width={60}
                  height={40}
                  className="rounded"
                />
                <div className="text-gray-600 dark:text-gray-300 font-semibold text-base transition-colors duration-200">
                  <span className="text-[#5F1DE8] dark:text-[#B131F8] font-bold transition-colors duration-200">30,175</span>+ Users using our services.
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Login Card */}
          <div
            className="flex justify-center"
            data-aos="fade-down"
            data-aos-duration="500"
          >
            <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                  Login to <span className="text-[#5F1DE8] dark:text-[#B131F8] transition-colors duration-200">SMMDOC.</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
                  New Here? <Link href="/sign-up" className="text-[#5F1DE8] dark:text-[#B131F8] font-bold hover:underline transition-colors duration-200">Create an account.</Link>
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
                          placeholder="Username or Email"
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
                          placeholder="Password"
                          disabled={isPending}
                          {...form.register('password')}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                        />
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
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
                      <Link
                        href="/reset-password"
                        className="text-[#5F1DE8] dark:text-[#B131F8] hover:underline transition-colors duration-200"
                      >
                        Forget Password?
                      </Link>
                    </div>
                  </>
                )}

                <FormError message={error || urlError} />
                <FormSuccess message={success} />
                
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <ButtonLoader />
                  ) : showTwoFactor ? (
                    'Confirm'
                  ) : (
                    'Login to Dashboard'
                  )}
                </button>
              </form>

              {/* Google Sign-in Button - Replacing Social component */}
              {!showTwoFactor && (
                <div className="mt-4">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                        or
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-600/50 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="flex-shrink-0"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}

              {!showTwoFactor && (
                <div className="text-center mt-4">
                  {/* Removed Lost Your Password section */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;