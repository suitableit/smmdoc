'use client';
import ButtonLoader from '@/components/button-loader';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { newPasswordValues } from '@/lib/actions/newPassword';
import {
  newPasswordDefaultValues,
  newPasswordSchema,
  NewPasswordSchema,
} from '@/lib/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaLock } from 'react-icons/fa';

export default function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  
  const form = useForm<NewPasswordSchema>({
    mode: 'all',
    resolver: zodResolver(newPasswordSchema),
    defaultValues: newPasswordDefaultValues,
  });

  const onSubmit: SubmitHandler<NewPasswordSchema> = async (values) => {
    setError('');
    setSuccess('');
    
    startTransition(() => {
      newPasswordValues(values, token)
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
          console.error('New password error:', err);
        });
    });
  };

  return (
    <div className="bg-white w-full p-8 rounded-2xl shadow-lg border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl text-center font-bold text-gray-900 mb-2">
          New Password
        </h2>
        <p className="text-gray-600 text-center">
          Enter your new password.
        </p>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-lg text-gray-900 font-medium mb-2">
            New Password
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

        <FormError message={error} />
        <FormSuccess message={success} />
        
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-300"
        >
          {isPending ? <ButtonLoader /> : 'Reset Password'}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-gray-600">
          Remember your password?{' '}
          <Link href="/sign-in" className="text-purple-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}