
'use client';
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
    return <span className={`inline-block h-6 w-20 bg-accent animate-pulse rounded-md ${className}`} />;
  }
  const currentCurrencyData = availableCurrencies.find(c => c.code === currency);
  const originalCurrencyData = availableCurrencies.find(c => c.code === originalCurrency);

  if (!currentCurrencyData || !originalCurrencyData) {
    return (
      <span className={className}>
        {originalCurrency === 'USD' ? '$' : '৳'}{formatPrice(amount, 2)}
      </span>
    );
  }

  let displayAmount = amount;
  let displayCurrency: 'USD' | 'BDT' = originalCurrency;
  let displaySymbol = originalCurrencyData.symbol;
  if (currency !== originalCurrency) {
    if (originalCurrency === 'USD') {
      displayAmount = amount * Number(currentCurrencyData.rate);
    } else if (currency === 'USD') {
      displayAmount = amount / Number(originalCurrencyData.rate);
    } else {
      const usdAmount = amount / Number(originalCurrencyData.rate);
      displayAmount = usdAmount * Number(currentCurrencyData.rate);
    }
    displayCurrency = currency as 'USD' | 'BDT';
    displaySymbol = currentCurrencyData.symbol;
  }

  return (
    <span className={className}>
      {displaySymbol}{formatPrice(displayAmount, 2)}
    </span>
  );
}
