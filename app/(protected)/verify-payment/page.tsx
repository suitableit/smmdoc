'use client';

import ButtonLoader from '@/components/button-loader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Form schema for transaction verification
const verifyFormSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  responseType: z.enum(['Pending', 'Success', 'Failed']),
});

type VerifyFormValues = z.infer<typeof verifyFormSchema>;

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams?.get('invoice_id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentLogo, setPaymentLogo] = useState('/nagad.svg'); // Default logo
  const [paymentAmount, setPaymentAmount] = useState<string>('0.00');

  // Form with default values
  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      transactionId: '',
      phoneNumber: '',
      responseType: 'Pending',
    },
  });

  useEffect(() => {
    // Get the payment amount from localStorage or query params
    const amount =
      searchParams?.get('amount') ||
      localStorage.getItem('payment_amount') ||
      '0.00';
    setPaymentAmount(amount);

    // Get payment method from localStorage or query params
    const method =
      searchParams?.get('method') ||
      localStorage.getItem('payment_method') ||
      'nagad';

    // Set logo based on payment method
    switch (method.toLowerCase()) {
      case 'bkash':
        setPaymentLogo('/bkash.svg');
        break;
      case 'rocket':
        setPaymentLogo('/rocket.svg');
        break;
      case 'nagad':
        setPaymentLogo('/nagad.svg');
        break;
      case 'upay':
        setPaymentLogo('/upay.svg');
        break;
      default:
        setPaymentLogo('/nagad.svg');
    }
  }, [searchParams]);

  const onSubmit = async (values: VerifyFormValues) => {
    setIsSubmitting(true);

    try {
      // In a real app, this would send the data to your backend
      // which would then verify with the payment gateway
      toast.loading('Verifying transaction...');

      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate response based on form selection
      if (values.responseType === 'Success') {
        // If user chose "Success" in the demo form
        toast.dismiss();
        toast.success('Transaction verified successfully!');

        // Redirect to success page
        router.push(
          `/transactions/success?invoice_id=${invoiceId || 'INV-DEMO'}`
        );
      } else if (values.responseType === 'Pending') {
        // Pending response
        toast.dismiss();
        toast.info('Transaction is pending verification');

        // Here you would normally wait for admin approval
        // For demo, we'll redirect to transactions page with a pending status
        router.push('/transactions?status=pending');
      } else {
        // Failed response
        toast.dismiss();
        toast.error('Transaction verification failed');

        // Redirect to transactions with error status
        router.push('/transactions?status=failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.dismiss();
      toast.error('An error occurred during verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          {paymentLogo && (
            <div className="mx-auto mb-4 w-20 h-20 relative">
              <Image
                src={paymentLogo}
                alt="Payment Method"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <CardTitle>UddoktaPay Sandbox</CardTitle>
          <CardDescription className="mt-2">
            <div className="flex justify-between items-center">
              <span>Invoice ID:</span>
              <span className="font-medium">
                {invoiceId || 'TQhUr5BeNsMc9bBaDXF9'}
              </span>
            </div>
          </CardDescription>
          <div className="mt-2 text-2xl font-bold">BDT {paymentAmount}</div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Transaction ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Transaction ID"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Phone Number"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responseType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Type</FormLabel>
                    <FormControl>
                      <select
                        className="w-full h-10 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        {...field}
                        disabled={isSubmitting}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Success">Success</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? <ButtonLoader /> : 'VERIFY'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
