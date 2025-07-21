// lib/currency-utils.ts
'use client';

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  enabled: boolean;
}

export interface CurrencySettings {
  id: number;
  defaultCurrency: string;
  displayDecimals: number;
  currencyPosition: 'left' | 'right' | 'left_space' | 'right_space';
  thousandsSeparator: string;
  decimalSeparator: string;
}

// Cache for currency data
let currencyCache: {
  currencies: Currency[];
  settings: CurrencySettings;
  lastFetch: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch currency data from admin settings
export async function fetchCurrencyData(): Promise<{
  currencies: Currency[];
  settings: CurrencySettings;
}> {
  // Check cache first
  if (currencyCache && Date.now() - currencyCache.lastFetch < CACHE_DURATION) {
    return {
      currencies: currencyCache.currencies,
      settings: currencyCache.settings,
    };
  }

  try {
    // Fetch enabled currencies
    const currenciesResponse = await fetch('/api/currencies/enabled');
    const currenciesData = await currenciesResponse.json();

    // Fetch currency settings
    const settingsResponse = await fetch('/api/admin/currency-settings');
    const settingsData = await settingsResponse.json();

    const currencies = currenciesData.success ? currenciesData.currencies : [];
    const settings = settingsData.success ? settingsData.currencySettings : {
      id: 1,
      defaultCurrency: 'USD',
      displayDecimals: 2,
      currencyPosition: 'left' as const,
      thousandsSeparator: ',',
      decimalSeparator: '.',
    };

    // Update cache
    currencyCache = {
      currencies,
      settings,
      lastFetch: Date.now(),
    };

    return { currencies, settings };
  } catch (error) {
    console.error('Error fetching currency data:', error);
    
    // Return fallback data
    const fallbackCurrencies: Currency[] = [
      { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000, enabled: true },
      { id: 5, code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 110.0000, enabled: true },
      { id: 6, code: 'USDT', name: 'Tether USD', symbol: '₮', rate: 1.0000, enabled: true },
    ];

    const fallbackSettings: CurrencySettings = {
      id: 1,
      defaultCurrency: 'USD',
      displayDecimals: 2,
      currencyPosition: 'left',
      thousandsSeparator: ',',
      decimalSeparator: '.',
    };

    return {
      currencies: fallbackCurrencies,
      settings: fallbackSettings,
    };
  }
}

// Format currency amount using admin settings
export function formatCurrencyAmount(
  amount: number,
  currencyCode: string,
  currencies: Currency[],
  settings: CurrencySettings
): string {
  const currency = currencies.find(c => c.code === currencyCode);
  if (!currency) {
    return `${amount.toFixed(2)}`;
  }

  const { symbol } = currency;
  const { displayDecimals, currencyPosition, thousandsSeparator, decimalSeparator } = settings;

  // Format number with separators
  const parts = amount.toFixed(displayDecimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  const formattedAmount = parts.join(decimalSeparator);

  // Apply currency position
  switch (currencyPosition) {
    case 'left':
      return `${symbol}${formattedAmount}`;
    case 'right':
      return `${formattedAmount}${symbol}`;
    case 'left_space':
      return `${symbol} ${formattedAmount}`;
    case 'right_space':
      return `${formattedAmount} ${symbol}`;
    default:
      return `${symbol}${formattedAmount}`;
  }
}

// Convert amount between currencies
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  currencies: Currency[]
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  if (!fromCurrencyData || !toCurrencyData) {
    return amount;
  }

  // Convert to USD first (base currency)
  const usdAmount = fromCurrencyData.code === 'USD' ? amount : amount / fromCurrencyData.rate;
  
  // Convert from USD to target currency
  const convertedAmount = toCurrencyData.code === 'USD' ? usdAmount : usdAmount * toCurrencyData.rate;

  return convertedAmount;
}

// Get currency by code
export function getCurrencyByCode(code: string, currencies: Currency[]): Currency | null {
  return currencies.find(c => c.code === code) || null;
}

// Clear currency cache (useful when admin updates settings)
export function clearCurrencyCache(): void {
  currencyCache = null;
}
