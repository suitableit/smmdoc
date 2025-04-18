'use client';
import ButtonLoader from '@/components/button-loader';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { PasswordInput } from '@/components/password-input';
import Social from '@/components/social';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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

export default function SignInForm() {
  const searchParams = useSearchParams();
  let urlError =
    searchParams.get('error') === 'OAuthAccountNotLinked'
      ? 'Email already in use with different provider!'
      : '';
  const [showTwoFactor, setShowTwoFactor] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const form = useForm<SignInSchema>({
    mode: 'all',
    resolver: zodResolver(signInSchema),
    defaultValues: signInDefaultValues,
  });
  const onSubmit: SubmitHandler<SignInSchema> = async (values) => {
    setError('');
    setSuccess('');
    urlError = '';
    startTransition(() => {
      login(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.message) {
          setSuccess(data.message);
        }
        if (data?.twoFactor) {
          setShowTwoFactor(true);
        }
      });
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {showTwoFactor && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>2FA Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g: 123456"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage className="-mt-3" />
              </FormItem>
            )}
          />
        )}
        {!showTwoFactor && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="eg: smm@gmail.com"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="e.g: ********"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />
          </>
        )}
        <FormError message={error || urlError} />
        <FormSuccess message={success} />
        <Button
          disabled={isPending}
          className="w-full inline-flex items-center cursor-pointer"
          type="submit"
        >
          {isPending ? <ButtonLoader /> : showTwoFactor ? 'Confirm' : 'Sign In'}
        </Button>
      </form>
      <Social />
      <div className="text-center grid grid-cols-1 pt-2 gap-2">
        <p className="text-sm">
          Forgot your password?{' '}
          <Link
            href="/reset-password"
            className="text-blue-500 hover:text-blue-700"
          >
            Forgot Password
          </Link>
        </p>
        <p className="text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-blue-500  hover:text-blue-700">
            Sign Up
          </Link>
        </p>
      </div>
    </Form>
  );
}
