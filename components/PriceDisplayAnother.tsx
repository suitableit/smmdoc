// components/PriceDisplay.tsx
'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Fragment } from 'react';

interface PriceDisplayProps {
  amount: number;
  originalCurrency: 'USD' | 'BDT';
  className?: string;
}

export function PriceDisplayAnother({
  amount,
  originalCurrency,
  className,
}: PriceDisplayProps) {
  const { currency, rate, isLoading } = useCurrency();

  if (isLoading || rate === null) {
    return <Skeleton className={`h-6 w-20 ${className}`} />;
  }

  let displayAmount = originalCurrency === 'USD' ? amount : amount * rate;
  let displayCurrency = originalCurrency;

  if (currency !== originalCurrency) {
    displayAmount = originalCurrency === 'USD' ? amount * rate : amount / rate;
    displayCurrency = currency;
  }

  return (
    <Fragment>
      {displayCurrency === 'USD' ? '$' : '৳'} {displayAmount.toFixed(4)}
    </Fragment>
  );
}
