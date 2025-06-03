// contexts/CurrencyContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type CurrencyContextType = {
  currency: 'USD' | 'BDT';
  setCurrency: (currency: 'USD' | 'BDT') => Promise<void>;
  rate: number | null;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number) => number;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: async () => {},
  rate: null,
  isLoading: true,
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  convertAmount: (amount: number) => amount,
});

export function CurrencyProvider({
  children,
  serverCurrency,
}: {
  children: React.ReactNode;
  serverCurrency?: 'USD' | 'BDT';
}) {
  const [currency, setCurrencyState] = useState<'USD' | 'BDT'>(
    serverCurrency || 'USD'
  );
  const [rate, setRate] = useState<number | null>(121.45);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/exchange-rate', { 
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const data = await response.json();
        setRate(data.rate || 121.45); // Fallback rate if rate is not in response
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setRate(121.45); // Fallback rate
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, []);

  const setCurrency = async (newCurrency: 'USD' | 'BDT') => {
    try {
      // Update server preference if user is authenticated
      const response = await fetch('/api/currency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency: newCurrency }),
      });

      if (response.ok) {
        setCurrencyState(newCurrency);
        localStorage.setItem('currency', newCurrency);
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (currency === 'BDT' && rate) {
      const amountInBDT = amount * rate;
      return `৳${amountInBDT.toFixed(2)}`;
    } else {
      return `$${amount.toFixed(2)}`;
    }
  };

  const convertAmount = (amount: number): number => {
    if (currency === 'BDT' && rate) {
      return amount * rate;
    }
    return amount;
  };

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rate, isLoading, formatCurrency, convertAmount }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
