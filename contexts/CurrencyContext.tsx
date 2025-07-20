// contexts/CurrencyContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Currency = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  enabled: boolean;
};

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  rate: number | null;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number) => number;
  availableCurrencies: Currency[];
  currentCurrencyData: Currency | null;
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: async () => {},
  rate: null,
  isLoading: true,
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
  convertAmount: (amount: number) => amount,
  availableCurrencies: [],
  currentCurrencyData: null,
});

export function CurrencyProvider({
  children,
  serverCurrency,
}: {
  children: React.ReactNode;
  serverCurrency?: string;
}) {
  const [currency, setCurrencyState] = useState<string>(
    serverCurrency || 'USD'
  );
  const [rate, setRate] = useState<number | null>(121.45);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>([]);
  const [currentCurrencyData, setCurrentCurrencyData] = useState<Currency | null>(null);

  // Load available currencies from admin settings
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch('/api/currencies/enabled');
        if (response.ok) {
          const data = await response.json();
          setAvailableCurrencies(data.currencies || []);
        }
      } catch (error) {
        console.error('Error loading currencies:', error);
        // Fallback to default currencies
        setAvailableCurrencies([
          { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000, enabled: true },
          { id: 5, code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 110.0000, enabled: true },
          { id: 6, code: 'USDT', name: 'Tether USD', symbol: '₮', rate: 1.0000, enabled: true },
        ]);
      }
    };

    fetchCurrencies();
  }, []);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    // Load currency from localStorage only on client side
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('currency') as string | null;
      if (savedCurrency && !serverCurrency) {
        setCurrencyState(savedCurrency);
      }
    }
  }, [serverCurrency]);

  // Update current currency data when currency or available currencies change
  useEffect(() => {
    if (availableCurrencies.length > 0) {
      const currencyData = availableCurrencies.find(c => c.code === currency);
      setCurrentCurrencyData(currencyData || null);

      // Update rate based on current currency
      if (currencyData) {
        setRate(currencyData.rate);
      }
    }
  }, [currency, availableCurrencies]);

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

  const setCurrency = async (newCurrency: string) => {
    try {
      // Check if currency is available
      const isAvailable = availableCurrencies.some(c => c.code === newCurrency);
      if (!isAvailable) {
        console.error('Currency not available:', newCurrency);
        return;
      }

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
        if (typeof window !== 'undefined') {
          localStorage.setItem('currency', newCurrency);
        }
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    if (!currentCurrencyData) {
      return `$${amount.toFixed(2)}`;
    }

    // Database balance is stored in BDT, so we need to convert properly
    let convertedAmount = amount;

    if (currentCurrencyData.code === 'BDT') {
      // If showing BDT, use the amount as is (already in BDT)
      convertedAmount = amount;
    } else if (currentCurrencyData.code === 'USD') {
      // If showing USD, convert from BDT to USD using dynamic rate from admin settings
      const bdtCurrency = availableCurrencies.find(c => c.code === 'BDT');
      const bdtToUsdRate = bdtCurrency?.rate || 121; // Use admin set rate or fallback
      convertedAmount = amount / bdtToUsdRate;
    } else {
      // For other currencies, convert from BDT using dynamic rates
      const bdtCurrency = availableCurrencies.find(c => c.code === 'BDT');
      const bdtToUsdRate = bdtCurrency?.rate || 121;
      const usdAmount = amount / bdtToUsdRate;
      convertedAmount = usdAmount * currentCurrencyData.rate;
    }

    return `${currentCurrencyData.symbol}${convertedAmount.toFixed(2)}`;
  };

  const convertAmount = (amount: number): number => {
    if (!currentCurrencyData) {
      return amount;
    }
    return amount * currentCurrencyData.rate;
  };

  // Prevent hydration mismatch by not rendering until client is ready
  if (!isClient) {
    return (
      <CurrencyContext.Provider
        value={{
          currency: serverCurrency || 'USD',
          setCurrency,
          rate,
          isLoading: true,
          formatCurrency,
          convertAmount,
          availableCurrencies: [],
          currentCurrencyData: null
        }}
      >
        {children}
      </CurrencyContext.Provider>
    );
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rate,
        isLoading,
        formatCurrency,
        convertAmount,
        availableCurrencies,
        currentCurrencyData
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
