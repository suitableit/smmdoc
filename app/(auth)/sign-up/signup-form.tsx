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
    <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
          Sign Up
        </h2>
        <p className="text-gray-600 text-center">
          Enter your details below to sign up.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-lg text-gray-900 font-medium mb-2">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              id="username"
              placeholder="eg: john"
              disabled={isPending}
              {...form.register('username')}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-lg text-gray-900 font-medium mb-2">
            Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              id="name"
              placeholder="eg: John Doe"
              disabled={isPending}
              {...form.register('name')}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>
          {form.formState.errors.name && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-lg text-gray-900 font-medium mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="email"
              id="email"
              placeholder="eg: mail@email.com"
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
              placeholder="e.g: ********"
              disabled={isPending}
              {...form.register('password')}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-lg text-gray-900 font-medium mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              placeholder="e.g: ********"
              disabled={isPending}
              {...form.register('confirmPassword')}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300"
        >
          {isPending ? <ButtonLoader /> : 'Sign Up'}
        </button>
      </form>

      <Social />
      <div className="text-center mt-4">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-purple-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}