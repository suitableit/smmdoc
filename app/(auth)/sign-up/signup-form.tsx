'use client';
import ButtonLoader from '@/components/button-loader';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import Social from '@/components/social';
import { register } from '@/lib/actions/register';
import {
  signUpDefaultValues,
  signUpSchema,
  SignUpSchema,
} from '@/lib/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  
  const form = useForm<SignUpSchema>({
    mode: 'all',
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues,
  });

  const onSubmit: SubmitHandler<SignUpSchema> = async (values) => {
    setError('');
    setSuccess('');
    
    startTransition(() => {
      register(values)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.message) {
            setSuccess(data.message);
          }
        })
        .catch((err) => {
          setError('An unexpected error occurred. Please try again.');
          console.error('Sign up error:', err);
        });
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm w-full p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-200">
          Sign Up
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center transition-colors duration-200">
          Enter your details below to sign up.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="text"
              id="username"
              placeholder="eg: john"
              disabled={isPending}
              {...form.register('username')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
            Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="eg: John Doe"
              disabled={isPending}
              {...form.register('name')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="email"
              id="email"
              placeholder="eg: mail@email.com"
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

        <div>
          <label htmlFor="confirmPassword" className="block text-lg text-gray-900 dark:text-white font-medium mb-2 transition-colors duration-200">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-colors duration-200" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              placeholder="e.g: ********"
              disabled={isPending}
              {...form.register('confirmPassword')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] dark:focus:ring-[#B131F8] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? <ButtonLoader /> : 'Sign Up'}
        </button>
      </form>

      <Social />
      <div className="text-center mt-4">
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[#5F1DE8] dark:text-[#B131F8] hover:underline transition-colors duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}