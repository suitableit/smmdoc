/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { FormError } from '@/components/form-error';
import { FormSuccess } from '@/components/form-success';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
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
      <Card className="w-[400px] text-center p-2">
        <CardHeader>Confirm your verification</CardHeader>
        <CardContent>
          <FormError message="Missing token" />
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant={'destructive'} className="animate-pulse">
            <Link href="/sign-in">Go back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );

  return (
    <Card className="w-[400px] text-center p-2">
      <CardHeader>Confirm your verification</CardHeader>
      <CardContent>{!error && !success && <BeatLoader />}</CardContent>
      <CardDescription>
        {!success && <FormError message={error} />}
        <FormSuccess message={success} />
      </CardDescription>
      <CardFooter className="flex justify-center">
        <Button asChild variant={'destructive'} className="animate-pulse">
          <Link href="/sign-in">Go back to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
