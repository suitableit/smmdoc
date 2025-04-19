// components/PriceDisplay.tsx
'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceDisplayProps {
  amount: number;
  originalCurrency: 'USD' | 'BDT';
  className?: string;
}

export function PriceDisplay({
  amount,
  originalCurrency,
  className,
}: PriceDisplayProps) {
  const { currency, rate, isLoading } = useCurrency();

  if (isLoading || rate === null) {
    return <Skeleton className={`h-6 w-20 ${className}`} />;
  }

  let displayAmount = amount;
  let displayCurrency = originalCurrency;

  if (currency !== originalCurrency) {
    displayAmount = originalCurrency === 'USD' ? amount * rate : amount / rate;
    displayCurrency = currency;
  }

  return (
    <span className={className}>
      {displayCurrency === 'USD' ? '$' : '৳'} {displayAmount.toFixed(2)}
    </span>
  );
}
