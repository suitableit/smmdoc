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
import Social from '@/components/social';

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

  return (
    <section className="flex justify-center items-center pt-[120px] pb-[60px] bg-cover bg-top bg-no-repeat">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 2xl:gap-x-20 items-center">
          {/* Left side */}
          <div>
            <div className="text-center lg:text-left">
              <h1
                className="text-5xl lg:text-6xl font-extrabold mb-4 text-gray-900 leading-tight"
                data-aos="fade-down"
                data-aos-duration="500"
              >
                <span className="text-purple-600">SMMDOC - #1</span> <br />
                Cheap SMM Panel
              </h1>
              <p
                className="text-lg mb-6 leading-7 text-gray-600 w-4/5 lg:w-full mx-auto lg:mx-0"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                Boost your online presence today with our Cheap SMM Panel – the ultimate solution for social media success! Smmdoc is a SMM Panel with more then 3 years on the market and 21 Orders processed successfully until now!
              </p>
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-7 py-4 rounded-lg text-lg font-semibold inline-flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 mb-4"
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
                <div className="text-gray-600 font-semibold text-base">
                  <span className="text-purple-600 font-bold">30,175</span>+ Users using our services
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
            <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Login to <span className="text-purple-600">SMMDOC.</span>
                </h2>
                <p className="text-gray-600">
                  New Here? <Link href="/sign-up" className="text-purple-600 font-bold hover:underline">Create an account.</Link>
                </p>
              </div>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {showTwoFactor ? (
                  <div>
                    <label htmlFor="code" className="block text-lg text-gray-900 font-medium mb-2">
                      2FA Code
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        id="code"
                        placeholder="e.g: 123456"
                        disabled={isPending}
                        {...form.register('code')}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                      />
                    </div>
                    {form.formState.errors.code && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.code.message}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="email" className="block text-lg text-gray-900 font-medium mb-2">
                        Username of Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="w-5 h-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          placeholder="Username or Email"
                          disabled={isPending}
                          {...form.register('email')}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                        />
                      </div>
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-lg text-gray-900 font-medium mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="w-5 h-5 text-gray-500" />
                        </div>
                        <input
                          type="password"
                          id="password"
                          placeholder="Password"
                          disabled={isPending}
                          {...form.register('password')}
                          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
                        />
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 text-gray-700">
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
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300"
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

              {!showTwoFactor && (
                <>
                  <Social />
                  <div className="text-center mt-4">
                    <p className="text-gray-600">
                      Lost Your Password?{' '}
                      <Link href="/reset-password" className="text-purple-600 hover:underline">
                        Reset now
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;