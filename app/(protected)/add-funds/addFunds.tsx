'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import axiosInstance from '@/lib/axiosInstance';
import { useAppNameWithFallback } from '@/contexts/AppNameContext';
import { setPageTitle } from '@/lib/utils/set-page-title';
import {
    addFundDefaultValues,
    addFundSchema,
    AddFundSchema,
} from '@/lib/validators/user/addFundValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
    FaCalculator,
    FaCheckCircle,
    FaCreditCard,
    FaExchangeAlt,
    FaShieldAlt,
    FaTimes,
    FaWallet,
} from 'react-icons/fa';

const Toast = ({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'pending';
  onClose: () => void;
}) => (
  <div
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg backdrop-blur-sm border ${
      type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : type === 'error'
        ? 'bg-red-50 border-red-200 text-red-800'
        : type === 'info'
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' && <FaCheckCircle className="w-4 h-4" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 p-1 hover:bg-black/10 rounded">
        <FaTimes className="w-3 h-3" />
      </button>
    </div>
  </div>
);

export function AddFundForm() {
  const user = useCurrentUser();
  const { appName } = useAppNameWithFallback();
  const [isPending, startTransition] = useTransition();
  const { currency: globalCurrency, rate: globalRate } = useCurrency();
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'pending';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPageTitle('Add Funds', appName);
  }, [appName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' | 'pending' = 'success'
  ) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'BDT'>(
    globalCurrency === 'USD' ? 'USD' : 'BDT'
  );

  const form = useForm<AddFundSchema>({
    mode: 'all',
    resolver: zodResolver(addFundSchema),
    defaultValues: addFundDefaultValues,
  });

  useEffect(() => {
    const newCurrency = (globalCurrency === 'USD' || globalCurrency === 'BDT') ? globalCurrency : 'BDT';
    setActiveCurrency(newCurrency);

    form.setValue('amountUSD', '0', { shouldValidate: true });
    form.setValue('amountBDT', '0', { shouldValidate: true });
    form.setValue('amountBDTConverted', '0', { shouldValidate: true });
    setTotalAmount({
      amount: 0,
      currency: newCurrency,
    });
  }, [globalCurrency, form, user]);

  const rate = globalRate;

  const toggleCurrency = () => {
    const newCurrency = activeCurrency === 'USD' ? 'BDT' : 'USD';
    setActiveCurrency(newCurrency);

    form.setValue('amountUSD', '0', { shouldValidate: true });
    form.setValue('amountBDT', '0', { shouldValidate: true });
    form.setValue('amountBDTConverted', '0', { shouldValidate: true });
    form.setValue('amount', '0', { shouldValidate: true });

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

  const handleUSDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentRate = rate || 120;
    const usdValue = parseFloat(e.target.value) || 0;
    const bdtValue = usdValue * currentRate;

    form.setValue('amountUSD', e.target.value, { shouldValidate: true });
    form.setValue('amountBDT', bdtValue.toFixed(2), { shouldValidate: true });
    form.setValue('amountBDTConverted', bdtValue.toFixed(2), {
      shouldValidate: true,
    });
    form.setValue('amount', bdtValue.toFixed(2), { shouldValidate: true });

    setTotalAmount({
      amount: bdtValue,
      currency: 'BDT',
    });
  };

  const handleBDTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentRate = rate || 120;
    const bdtValue = parseFloat(e.target.value) || 0;
    const usdValue = bdtValue / currentRate;

    form.setValue('amountBDT', e.target.value, { shouldValidate: true });
    form.setValue('amountUSD', usdValue.toFixed(2), { shouldValidate: true });
    form.setValue('amount', bdtValue.toFixed(2), { shouldValidate: true });

    setTotalAmount({
      amount: bdtValue,
      currency: 'BDT',
    });
  };

  const onSubmit: SubmitHandler<AddFundSchema> = async (values) => {
    startTransition(async () => {
      try {
        const currentRate = rate || 120;
        const amountInBDT =
          activeCurrency === 'USD'
            ? parseFloat(values.amountUSD || '0') * currentRate
            : parseFloat(values.amountBDT || '0');

        if (!user?.name || !user?.email || !values.phone || amountInBDT <= 0) {
          showToast('Please fill in all required information', 'error');
          return;
        }

        const minAmount = 10;
        const finalAmount = Math.round(amountInBDT);
        if (finalAmount < minAmount) {
          showToast(`Minimum amount must be ${minAmount} BDT`, 'error');
          return;
        }

        const cleanedPhone = values.phone.replace(/\D/g, '');
        if (!cleanedPhone || cleanedPhone.length < 10) {
          showToast('Please enter a valid phone number', 'error');
          return;
        }

        const amountValue = activeCurrency === 'USD' 
          ? parseFloat(values.amountUSD || '0')
          : parseFloat(values.amountBDT || '0');

        if (isNaN(amountValue) || amountValue <= 0) {
          showToast('Please enter a valid amount', 'error');
          return;
        }

        const formValues = {
          method: 'UddoktaPay',
          amount: amountValue.toString(),
          currency: activeCurrency,
          userId: user?.id,
          full_Name: user?.name || 'John Doe',
          email: user?.email || 'customer@example.com',
          phone: cleanedPhone,
        };

        showToast('Payment processing...', 'pending');

        console.log('Sending payment request:', formValues);

        const res = await axiosInstance.post(
          '/api/payment/create-charge',
          formValues
        );

        if (res.data?.error) {
          console.error('Payment API error:', res.data);
          showToast('Payment processing failed. Please try again.', 'error');
          return;
        }

        if (res.data && res.data.payment_url) {
          if (res.data.order_id) {
            localStorage.setItem('order_id', res.data.order_id);
          }

          if (res.data.invoice_id) {
            const paymentSession = {
              invoice_id: res.data.invoice_id,
              amount: finalAmount.toString(),
              user_id: user?.id,
              phone: values.phone.replace(/\D/g, ''),
              timestamp: Date.now(),
            };
            localStorage.setItem(
              'uddoktapay_session',
              JSON.stringify(paymentSession)
            );
          }

          showToast('Redirecting to payment page...', 'success');

          setTimeout(() => {
            const paymentUrl = new URL(res.data.payment_url);
            paymentUrl.searchParams.set('invoice_id', res.data.invoice_id);
            window.location.href = paymentUrl.toString();
          }, 500);
        } else {
          showToast('Payment processing failed. Please try again.', 'error');
        }
      } catch (error: any) {
        console.error('Payment error:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
        });
        showToast('Payment processing failed. Please try again.', 'error');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card card-padding">
            <div className="space-y-6">
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  padding: '20px',
                }}
              >
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <div className="h-5 w-32 gradient-shimmer rounded" />
                  <div className="h-6 w-32 gradient-shimmer rounded-full" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="form-group">
                    <div className="h-4 w-24 gradient-shimmer rounded mb-2" />
                    <div className="h-10 w-full gradient-shimmer rounded-lg" />
                  </div>
                  <div className="flex justify-center">
                    <div className="h-12 w-40 gradient-shimmer rounded-lg" />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="h-4 w-32 gradient-shimmer rounded mb-2" />
                  <div className="h-10 w-full gradient-shimmer rounded-lg" />
                </div>
              </div>
              <div className="form-group">
                <div className="h-10 w-full gradient-shimmer rounded-lg" />
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="h-4 w-24 gradient-shimmer rounded" />
                  <div className="h-8 w-32 gradient-shimmer rounded" />
                </div>
                <div className="h-4 w-24 gradient-shimmer rounded" />
              </div>
              <div className="h-14 w-full gradient-shimmer rounded-lg" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaCreditCard />
                </div>
                <h3 className="card-title">Secure Payment</h3>
              </div>
              <p className="text-sm text-gray-600">
                SSL encrypted transactions with UddoktaPay
              </p>
            </div>
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaShieldAlt />
                </div>
                <h3 className="card-title">100% Safe</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your financial data is protected
              </p>
            </div>
            <div className="card card-padding">
              <div className="card-header">
                <div className="card-icon">
                  <FaWallet />
                </div>
                <h3 className="card-title">Instant Credit</h3>
              </div>
              <p className="text-sm text-gray-600">
                Funds added immediately after payment
              </p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {toastMessage && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage(null)}
          />
        )}
      <div className="card card-padding">
        <div className="space-y-6">
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              padding: '20px',
            }}
          >
            <div className="flex flex-wrap items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">
                <FaCalculator className="inline mr-2" />
                Amount Details
              </h4>
              <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full border mt-2 sm:mt-0 mx-auto sm:mx-0">
                Rate: 1 USD = {rate || 120} BDT
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {activeCurrency === 'USD' ? (
                <div className="form-group">
                  <label className="form-label">Amount (USD)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isPending}
                      value={form.watch('amountUSD') || ''}
                      onChange={handleUSDChange}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">
                      $
                    </span>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Amount (BDT)</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0.00"
                      className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isPending}
                      value={form.watch('amountBDT') || ''}
                      onChange={handleBDTChange}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">
                      ৳
                    </span>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={toggleCurrency}
                  className="btn btn-secondary h-12 px-6 flex items-center gap-2"
                  disabled={isPending}
                  title={`Switch to ${
                    activeCurrency === 'USD' ? 'BDT' : 'USD'
                  }`}
                >
                  <FaExchangeAlt className="text-blue-600" />
                  <span className="text-sm font-semibold">
                    Switch to {activeCurrency === 'USD' ? 'BDT' : 'USD'}
                  </span>
                </button>
              </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2 font-medium">
                Converted Amount
              </div>
              {activeCurrency === 'USD' ? (
                <div className="relative">
                  <input
                    type="text"
                    className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled
                    placeholder="0.00 BDT"
                    value={form.watch('amountBDTConverted') || '0.00'}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">
                    ৳
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    className="form-field w-full pl-10 pr-4 py-3 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    disabled
                    placeholder="0.00 USD"
                    value={form.watch('amountUSD') || '0.00'}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-bold">
                    $
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <input
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className="form-field w-full px-4 py-3 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:focus:ring-[var(--secondary)] focus:border-transparent shadow-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              disabled={isPending}
              value={form.watch('phone') || ''}
              onChange={(e) =>
                form.setValue('phone', e.target.value, { shouldValidate: true })
              }
            />
            {form.formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {totalAmount.amount.toFixed(2)} {totalAmount.currency}
              </span>
            </div>
            {totalAmount.currency === 'BDT' && (
              <div className="text-sm text-gray-600">
                ≈ ${(totalAmount.amount / (rate || 120)).toFixed(2)} USD
              </div>
            )}
            {totalAmount.currency === 'USD' && (
              <div className="text-sm text-gray-600">
                ≈ ৳{(totalAmount.amount * (rate || 120)).toFixed(2)} BDT
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending || !form.formState.isValid}
            className="btn btn-primary w-full h-14 text-lg font-bold"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FaWallet />
                Add Funds
              </div>
            )}
          </button>
        </div>
      </div>
      <div className="space-y-6">
        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaCreditCard />
            </div>
            <h3 className="card-title">Secure Payment</h3>
          </div>
          <p className="text-sm text-gray-600">
            SSL encrypted transactions with UddoktaPay
          </p>
        </div>
        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaShieldAlt />
            </div>
            <h3 className="card-title">100% Safe</h3>
          </div>
          <p className="text-sm text-gray-600">
            Your financial data is protected
          </p>
        </div>
        <div className="card card-padding">
          <div className="card-header">
            <div className="card-icon">
              <FaWallet />
            </div>
            <h3 className="card-title">Instant Credit</h3>
          </div>
          <p className="text-sm text-gray-600">
            Funds added immediately after payment
          </p>
        </div>
      </div>
    </div>
  );
}
