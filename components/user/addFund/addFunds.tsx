/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import {
    addFundDefaultValues,
    addFundSchema,
    AddFundSchema,
} from '@/lib/validators/user/addFundValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaExchangeAlt } from 'react-icons/fa';
import { toast } from 'sonner';

export function AddFundForm() {
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();
  const { currency: globalCurrency, rate: globalRate } = useCurrency();

  // Replace your local currency state with the global one
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'BDT'>(
    globalCurrency
  );
  const form = useForm<AddFundSchema>({
    mode: 'all',
    resolver: zodResolver(addFundSchema),
    defaultValues: addFundDefaultValues,
  });
  // change active currency based on global currency real-time
  useEffect(() => {
    setActiveCurrency(globalCurrency);
    // also update toggle currency button
    const newCurrency = globalCurrency === user?.currency ? 'USD' : 'BDT';
    setActiveCurrency(newCurrency);
    // reset form values based on new currency
    form.setValue('amountUSD', '0', { shouldValidate: true });
    form.setValue('amountBDT', '0', { shouldValidate: true });
    form.setValue('amountBDTConverted', '0', { shouldValidate: true });
    setTotalAmount({
      amount: 0,
      currency: newCurrency,
    });
  }, [globalCurrency, form, user]);

  // Use the global rate instead of local rate fetching
  const rate = globalRate;

  // Update your currency toggle to sync with global currency
  const toggleCurrency = () => {
    const newCurrency = activeCurrency === 'USD' ? 'BDT' : 'USD';
    setActiveCurrency(newCurrency);
    
    // Reset form values based on new currency
    form.setValue('amountUSD', '0', { shouldValidate: true });
    form.setValue('amountBDT', '0', { shouldValidate: true });
    form.setValue('amountBDTConverted', '0', { shouldValidate: true });
    form.setValue('amount', '0', { shouldValidate: true });
    
    // Always set the total amount in BDT for payment processing
    setTotalAmount({
      amount: 0,
      currency: 'BDT',
    });
  };
  const [totalAmount, setTotalAmount] = useState<{
    amount: number;
    currency: 'USD' | 'BDT';
  }>({
    amount: 0,
    currency: 'BDT',
  });

  const calculateTotalAmount = (value: string) => {
    if (!rate) return;

    const numericValue = parseFloat(value) || 0;

    if (activeCurrency === 'USD') {
      const bdtValue = numericValue * rate;
      setTotalAmount({
        amount: bdtValue,
        currency: 'BDT',
      });
      // Update the form values
      form.setValue('amount', bdtValue.toString(), {
        shouldValidate: true,
      });
    } else {
      setTotalAmount({
        amount: numericValue,
        currency: 'BDT',
      });
      // Update the form values
      form.setValue('amount', numericValue.toString(), {
        shouldValidate: true,
      });
    }
  };

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!rate) return;
    const usdValue = parseFloat(e.target.value) || 0;
    const bdtValue = usdValue * rate;

    form.setValue('amountBDT', bdtValue.toFixed(2), {
      shouldValidate: true,
    });
    form.setValue('amountBDTConverted', bdtValue.toFixed(2), {
      shouldValidate: true,
    });
    form.setValue('amount', bdtValue.toFixed(2), {
      // Update the amount field
      shouldValidate: true,
    });

    // Update total amount state
    setTotalAmount({
      amount: bdtValue,
      currency: 'BDT'
    });
  };

  const handleBDTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!rate) return;
    const bdtValue = parseFloat(e.target.value) || 0;
    const usdValue = bdtValue / rate;

    form.setValue('amountUSD', usdValue.toFixed(2), {
      shouldValidate: true,
    });
    form.setValue('amount', bdtValue.toFixed(2), {
      // Update the amount field
      shouldValidate: true,
    });

    // Update total amount state
    setTotalAmount({
      amount: bdtValue,
      currency: 'BDT'
    });
  };
  
  // Handle form submission
  const onSubmit: SubmitHandler<AddFundSchema> = async (values) => {
    startTransition(async () => {
      try {
        // Calculate the amount in BDT regardless of active currency
        const amountInBDT =
          activeCurrency === 'USD'
            ? parseFloat(values.amountUSD || '0') * (rate ?? 1)
            : parseFloat(values.amountBDT || '0');

        // Ensure we have all required fields
        if (!user?.name || !user?.email || !values.phone || amountInBDT <= 0) {
          toast.error('সকল প্রয়োজনীয় তথ্য পূরণ করুন');
          return;
        }

        // Ensure minimum amount is at least 10 BDT
        const minAmount = 10;
        const finalAmount = Math.round(amountInBDT);
        if (finalAmount < minAmount) {
          toast.error(`সর্বনিম্ন পরিমাণ ${minAmount} BDT হতে হবে`);
          return;
        }

        // Create payment data
        const formValues = {
          method: 'uddoktapay', // Fixed method name
          amount: finalAmount.toString(), // Round to avoid decimal issues
          userId: user?.id,
          full_Name: user?.name || 'John Doe', // Fallback name
          email: user?.email || 'customer@example.com', // Fallback email
          phone: values.phone.replace(/\D/g, ''), // Remove non-digit characters
        };
        
        toast.loading('পেমেন্ট প্রসেস চলছে...');
        
        // Send to our new payment API endpoint
        const res = await axiosInstance.post(
          '/api/payment/create-charge',
          formValues
        );
        
        if (res.data && res.data.payment_url) {
          // Store order ID in localStorage for later retrieval
          if (res.data.order_id) {
            localStorage.setItem('order_id', res.data.order_id);
          }
          
          // Store invoice ID in localStorage
          if (res.data.invoice_id) {
            localStorage.setItem('invoice_id', res.data.invoice_id);
            // Also store the amount for reference
            localStorage.setItem('payment_amount', finalAmount.toString());
            console.log('Stored invoice ID in localStorage:', res.data.invoice_id);
          }
          
          toast.dismiss();
          toast.success('Redirecting to payment page...');

          // Add a small delay before redirecting to ensure localStorage is updated
          setTimeout(() => {
            // Redirect to the payment gateway with invoice_id as parameter
            const paymentUrl = new URL(res.data.payment_url);
            paymentUrl.searchParams.set('invoice_id', res.data.invoice_id);
            window.location.href = paymentUrl.toString();
          }, 500);
        } else {
          toast.dismiss();
          toast.error('Payment processing failed. Please try again.  ');
          console.error('Invalid response from payment gateway');
        }
      } catch (error) {
        toast.dismiss();
        toast.error('Payment processing failed. Please try again.');
        console.error('Payment error:', error);
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-10 p-4 shadow-md bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle>Add Funds</CardTitle>
        <CardDescription>
          Fill in the details to add funds to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Method</FormLabel>
                  <FormControl>
                    <select
                      className="w-full h-10 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                      {...field}
                      disabled={isPending}
                    >
                      <option value="uddoktapay">
                        UddoktaPay (Online Payment Gateway)
                      </option>
                    </select>
                  </FormControl>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />

            <div className="flex flex-col lg:flex-row gap-3 items-end">
              {activeCurrency === 'USD' ? (
                <FormField
                  control={form.control}
                  name="amountUSD"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Amount, USD</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter USD amount"
                          className="input"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => {
                            field.onChange(e);
                            handleUSDChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="-mt-3" />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="amountBDT"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Amount, BDT</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter BDT amount"
                          className="input"
                          {...field}
                          disabled={isPending}
                          onChange={(e) => {
                            field.onChange(e);
                            handleBDTChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="-mt-3" />
                    </FormItem>
                  )}
                />
              )}

              <button
                type="button"
                onClick={toggleCurrency}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={isPending}
                title={`Switch to ${activeCurrency === 'USD' ? 'BDT' : 'USD'}`}
              >
                <FaExchangeAlt className="text-gray-500 dark:text-gray-400" />
              </button>

              {activeCurrency === 'USD' ? (
                <FormField
                  control={form.control}
                  name="amountBDTConverted"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Converted Amount, BDT</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="input"
                          {...field}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="amountUSD"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Converted Amount, USD</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          className="input"
                          {...field}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Phone Number"
                      className="input"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="-mt-3" />
                </FormItem>
              )}
            />

            {/* Total Amount Display */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">
                  {totalAmount.amount.toFixed(2)} {totalAmount.currency}
                </span>
              </div>
              {totalAmount.currency === 'BDT' && rate && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  ≈ {(totalAmount.amount / rate).toFixed(2)} USD
                </div>
              )}
              {totalAmount.currency === 'USD' && rate && (
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  ≈ {(totalAmount.amount * rate).toFixed(2)} BDT
                </div>
              )}
            </div>
            <Button
              disabled={isPending}
              className="w-full inline-flex items-center cursor-pointer"
              type="submit"
            >
              {isPending ? <ButtonLoader /> : 'Add Funds'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
