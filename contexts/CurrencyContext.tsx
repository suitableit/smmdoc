// contexts/CurrencyContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type CurrencyContextType = {
  currency: 'USD' | 'BDT';
  setCurrency: (currency: 'USD' | 'BDT') => Promise<void>;
  rate: number | null;
  isLoading: boolean;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'BDT',
  setCurrency: async () => {},
  rate: null,
  isLoading: true,
});

export function CurrencyProvider({
  children,
  serverCurrency,
}: {
  children: React.ReactNode;
  serverCurrency?: 'USD' | 'BDT';
}) {
  const [currency, setCurrencyState] = useState<'USD' | 'BDT'>(
    serverCurrency || 'BDT'
  );
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/exchange-rate');
        const data = await response.json();
        setRate(data.rate || 121.52); // Fallback to 121.52 if API fails
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setRate(121.52); // Fallback rate
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

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rate, isLoading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
