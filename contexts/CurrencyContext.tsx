// contexts/CurrencyContext.tsx
'use client';

import {
    clearCurrencyCache,
    convertCurrency,
    Currency,
    CurrencySettings,
    fetchCurrencyData,
    formatCurrencyAmount
} from '@/lib/currency-utils';
import { createContext, useContext, useEffect, useState } from 'react';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => Promise<void>;
  rate: number | null;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency?: string, toCurrency?: string) => number;
  availableCurrencies: Currency[];
  currentCurrencyData: Currency | null;
  currencySettings: CurrencySettings | null;
  refreshCurrencyData: () => Promise<void>;
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
  currencySettings: null,
  refreshCurrencyData: async () => {},
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
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings | null>(null);

  // Load currency data from admin settings
  const loadCurrencyData = async () => {
    try {
      setIsLoading(true);
      const { currencies, settings } = await fetchCurrencyData();
      setAvailableCurrencies(currencies);
      setCurrencySettings(settings);
    } catch (error) {
      console.error('Error loading currency data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh currency data function
  const refreshCurrencyData = async () => {
    clearCurrencyCache();
    await loadCurrencyData();

    // Force re-render by updating state
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  };

  useEffect(() => {
    loadCurrencyData();
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

      // Calculate USD to BDT rate for add funds page
      const usdData = availableCurrencies.find(c => c.code === 'USD');
      const bdtData = availableCurrencies.find(c => c.code === 'BDT');

      if (usdData && bdtData) {
        // USD to BDT conversion rate
        const usdToBdtRate = Number(bdtData.rate) / Number(usdData.rate);
        setRate(usdToBdtRate);
      } else if (currencyData) {
        setRate(currencyData.rate);
      }
    }
  }, [currency, availableCurrencies]);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        setIsLoading(true);

        // First try to get BDT rate from database currencies
        if (availableCurrencies.length > 0) {
          const bdtData = availableCurrencies.find(c => c.code === 'BDT');
          if (bdtData) {
            setRate(Number(bdtData.rate));
            setIsLoading(false);
            return;
          }
        }

        // Fallback to external API if database rate not available
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
        setRate(data.rate || 120); // Use 120 as fallback (database BDT rate)
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        setRate(120); // Use database BDT rate as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, [availableCurrencies]);

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
    if (!currentCurrencyData || !currencySettings) {
      return `$${amount.toFixed(2)}`;
    }

    // Convert amount to selected currency
    const convertedAmount = convertCurrency(amount, 'BDT', currentCurrencyData.code, availableCurrencies);

    // Format using admin settings
    return formatCurrencyAmount(convertedAmount, currentCurrencyData.code, availableCurrencies, currencySettings);
  };

  const convertAmount = (amount: number, fromCurrency?: string, toCurrency?: string): number => {
    if (!fromCurrency || !toCurrency) {
      return amount;
    }
    return convertCurrency(amount, fromCurrency, toCurrency, availableCurrencies);
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
          currentCurrencyData: null,
          currencySettings: null,
          refreshCurrencyData
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
        currentCurrencyData,
        currencySettings,
        refreshCurrencyData
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
