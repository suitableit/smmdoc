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
import SelectMe from '@/components/ui/select';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import {
  addFundDefaultValues,
  addFundSchema,
  AddFundSchema,
} from '@/lib/validators/user/addFundValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FaExchangeAlt } from 'react-icons/fa';

export function AddFundForm() {
  const user = useCurrentUser();
  const userId = user?.id || '';
  const [isPending, startTransition] = useTransition();
  const { currency: globalCurrency, rate: globalRate } = useCurrency();

  // Replace your local currency state with the global one
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'BDT'>(
    globalCurrency
  );

  // Use the global rate instead of local rate fetching
  const rate = globalRate;

  // Update your currency toggle to sync with global currency
  const toggleCurrency = () => {
    const newCurrency = activeCurrency === 'USD' ? 'BDT' : 'USD';
    setActiveCurrency(newCurrency);
  };
  // const { isLoading: rateLoading } = useExchangeRate();
  const [totalAmount, setTotalAmount] = useState<{
    amount: number;
    currency: 'USD' | 'BDT';
  }>({
    amount: 0,
    currency: 'BDT',
  });

  const form = useForm<AddFundSchema>({
    mode: 'all',
    resolver: zodResolver(addFundSchema),
    defaultValues: addFundDefaultValues,
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
    } else {
      const usdValue = numericValue / rate;
      setTotalAmount({
        amount: numericValue,
        currency: 'BDT',
      });
    }
  };

  const handleBDTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!rate) return;
    const bdtValue = parseFloat(e.target.value) || 0;
    const usdValue = bdtValue / rate;

    form.setValue('amountUSD', usdValue.toFixed(2), {
      shouldValidate: true,
    });

    calculateTotalAmount(e.target.value);
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

    calculateTotalAmount(e.target.value);
  };

  const onSubmit: SubmitHandler<AddFundSchema> = async (values) => {
    startTransition(async () => {
      const formValues = {
        ...values,
        amount: values.amountBDT,
        userId,
        totalAmount: totalAmount.amount,
        totalCurrency: totalAmount.currency,
      };

      const res = await axiosInstance.post('/api/create-charge', formValues);
      if (res.status) {
        window.location.href = res.data.payment_url;
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
                    <SelectMe {...field} disabled={isPending}>
                      <option value="uddoktapay">Uddokta Pay (Online)</option>
                    </SelectMe>
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
