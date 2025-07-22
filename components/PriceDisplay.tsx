// components/PriceDisplay.tsx
'use client';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatPrice } from '@/lib/utils';

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
  const { currency, availableCurrencies, isLoading } = useCurrency();

  if (isLoading || !availableCurrencies.length) {
    return <Skeleton className={`h-6 w-20 ${className}`} />;
  }

  // Get currency data from available currencies
  const currentCurrencyData = availableCurrencies.find(c => c.code === currency);
  const originalCurrencyData = availableCurrencies.find(c => c.code === originalCurrency);

  if (!currentCurrencyData || !originalCurrencyData) {
    // Fallback display
    return (
      <span className={className}>
        {originalCurrency === 'USD' ? '$' : '৳'}{formatPrice(amount, 4)}
      </span>
    );
  }

  let displayAmount = amount;
  let displayCurrency = originalCurrency;
  let displaySymbol = originalCurrencyData.symbol;

  // Convert if currencies are different
  if (currency !== originalCurrency) {
    // Convert using database rates
    if (originalCurrency === 'USD') {
      // USD to other currency
      displayAmount = amount * Number(currentCurrencyData.rate);
    } else if (currency === 'USD') {
      // Other currency to USD
      displayAmount = amount / Number(originalCurrencyData.rate);
    } else {
      // Between two non-USD currencies (via USD)
      const usdAmount = amount / Number(originalCurrencyData.rate);
      displayAmount = usdAmount * Number(currentCurrencyData.rate);
    }
    displayCurrency = currency;
    displaySymbol = currentCurrencyData.symbol;
  }

  return (
    <span className={className}>
      {displaySymbol}{formatPrice(displayAmount, 4)}
    </span>
  );
}
