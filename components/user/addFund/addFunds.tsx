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
import { FaExchangeAlt, FaWallet } from 'react-icons/fa';
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
          
          // Store payment session in localStorage for fallback
          if (res.data.invoice_id) {
            const paymentSession = {
              invoice_id: res.data.invoice_id,
              amount: finalAmount.toString(),
              user_id: user?.id,
              timestamp: Date.now()
            };
            localStorage.setItem('uddoktapay_session', JSON.stringify(paymentSession));
            console.log('Stored payment session:', paymentSession);
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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-2xl p-6 shadow-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2 drop-shadow-sm text-gray-900 dark:text-white">Add Funds</h1>
        <p className="text-gray-700 dark:text-white/90 drop-shadow-sm">Choose your preferred currency and amount to add to your account</p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/2 to-secondary/2"></div>
        <CardHeader className="pb-4 relative z-10">
          <CardTitle className="text-xl text-foreground font-semibold">Payment Details</CardTitle>
          <CardDescription className="text-muted-foreground">
            Fill in the details to add funds to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Payment Method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">Payment Method</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <select
                          className="w-full h-12 border border-border/30 rounded-xl px-4 bg-background/80 backdrop-blur-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl hover:bg-background/90"
                          {...field}
                          disabled={isPending}
                        >
                          <option value="uddoktapay">
                            UddoktaPay (Online Payment Gateway)
                          </option>
                        </select>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />

              {/* Amount Section */}
              <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-4 space-y-4 border border-border/30 shadow-inner backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-secondary/3"></div>
                <div className="flex items-center justify-between relative z-10">
                  <h3 className="font-semibold text-foreground">Amount Details</h3>
                  <div className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                    Rate: 1 USD = {rate} BDT
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
                  {activeCurrency === 'USD' ? (
                    <FormField
                      control={form.control}
                      name="amountUSD"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">Amount (USD)</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="h-12 pl-8 bg-background/80 backdrop-blur-sm border-border/30 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl rounded-xl group-hover:bg-background/90"
                                {...field}
                                disabled={isPending}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleUSDChange(e);
                                }}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-semibold text-sm">$</span>
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"></div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormField
                      control={form.control}
                      name="amountBDT"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground">Amount (BDT)</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Input
                                type="number"
                                placeholder="0.00"
                                className="h-12 pl-8 bg-background/80 backdrop-blur-sm border-border/30 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl rounded-xl group-hover:bg-background/90"
                                {...field}
                                disabled={isPending}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleBDTChange(e);
                                }}
                              />
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-semibold text-sm">৳</span>
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"></div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-destructive text-xs" />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Currency Toggle */}
                  <div className="flex items-end relative z-10">
                    <button
                      type="button"
                      onClick={toggleCurrency}
                      className="h-12 px-4 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border border-primary/30 rounded-xl transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl backdrop-blur-sm relative overflow-hidden"
                      disabled={isPending}
                      title={`Switch to ${activeCurrency === 'USD' ? 'BDT' : 'USD'}`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <FaExchangeAlt className="text-primary group-hover:rotate-180 transition-transform duration-300 relative z-10" />
                      <span className="ml-2 text-sm font-semibold text-primary relative z-10">
                        {activeCurrency === 'USD' ? 'BDT' : 'USD'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Converted Amount Display */}
                <div className="bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/30 shadow-lg backdrop-blur-sm relative overflow-hidden p-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                  <div className="relative z-10">
                    <div className="text-sm text-muted-foreground mb-2 font-medium">Converted Amount</div>
                    {activeCurrency === 'USD' ? (
                      <FormField
                        control={form.control}
                        name="amountBDTConverted"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="text"
                                  className="h-10 pl-8 bg-background/80 border border-border/30 text-primary font-bold"
                                  {...field}
                                  disabled
                                  placeholder="0.00 BDT"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm font-bold">৳</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={form.control}
                        name="amountUSD"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="text"
                                  className="h-10 pl-8 bg-background/80 border border-border/30 text-primary font-bold"
                                  {...field}
                                  disabled
                                  placeholder="0.00 USD"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm font-bold">$</span>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="relative z-10">
                    <FormLabel className="text-sm font-medium text-foreground">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type="tel"
                          placeholder="Enter your phone number"
                          className="h-12 bg-background/80 backdrop-blur-sm border-border/30 focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl rounded-xl group-hover:bg-background/90"
                          {...field}
                          disabled={isPending}
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 pointer-events-none"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-destructive text-xs" />
                  </FormItem>
                )}
              />

              {/* Total Amount Summary */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20 shadow-xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="relative z-10 flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-foreground">Total Amount:</span>
                  <span className="text-xl font-bold text-primary bg-background/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    {totalAmount.amount.toFixed(2)} {totalAmount.currency}
                  </span>
                </div>
                {totalAmount.currency === 'BDT' && rate && (
                  <div className="text-sm text-muted-foreground relative z-10">
                    ≈ ${(totalAmount.amount / rate).toFixed(2)} USD
                  </div>
                )}
                {totalAmount.currency === 'USD' && rate && (
                  <div className="text-sm text-muted-foreground relative z-10">
                    ≈ ৳{(totalAmount.amount * rate).toFixed(2)} BDT
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                className="w-full h-14 bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black dark:text-white font-bold transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl rounded-xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaWallet className="text-lg" />
                      Add Funds
                    </div>
                  )}
                </div>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
