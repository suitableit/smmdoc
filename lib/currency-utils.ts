// lib/currency-utils.ts

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

  console.log('Currency conversion debug:', {
    amount,
    fromCurrency,
    toCurrency,
    fromCurrencyData: fromCurrencyData ? { code: fromCurrencyData.code, rate: fromCurrencyData.rate } : null,
    toCurrencyData: toCurrencyData ? { code: toCurrencyData.code, rate: toCurrencyData.rate } : null
  });

  if (!fromCurrencyData || !toCurrencyData) {
    console.warn('Currency not found, returning original amount');
    return amount;
  }

  // Convert using rates (USD is base currency with rate 1.0000)
  let convertedAmount: number;

  if (fromCurrency === 'USD') {
    // From USD to other currency
    convertedAmount = amount * Number(toCurrencyData.rate);
  } else if (toCurrency === 'USD') {
    // From other currency to USD
    convertedAmount = amount / Number(fromCurrencyData.rate);
  } else {
    // Between two non-USD currencies (via USD)
    const usdAmount = amount / Number(fromCurrencyData.rate);
    convertedAmount = usdAmount * Number(toCurrencyData.rate);
  }

  console.log('Conversion result:', { original: amount, converted: convertedAmount });
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

// ===== MULTI-CURRENCY STORAGE FUNCTIONS =====

/**
 * Convert amount from any currency to USD (base currency)
 */
export function convertToUSD(
  amount: number,
  fromCurrency: string,
  currencies: Currency[]
): number {
  if (fromCurrency === 'USD') {
    return amount;
  }

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  if (!fromCurrencyData) {
    console.warn(`Currency ${fromCurrency} not found, treating as USD`);
    return amount;
  }

  // Convert to USD by dividing by the rate
  return amount / Number(fromCurrencyData.rate);
}

/**
 * Convert amount from USD to target currency
 */
export function convertFromUSD(
  amountUSD: number,
  toCurrency: string,
  currencies: Currency[]
): number {
  if (toCurrency === 'USD') {
    return amountUSD;
  }

  const toCurrencyData = currencies.find(c => c.code === toCurrency);
  if (!toCurrencyData) {
    console.warn(`Currency ${toCurrency} not found, returning USD amount`);
    return amountUSD;
  }

  // Convert from USD by multiplying by the rate
  return amountUSD * Number(toCurrencyData.rate);
}

/**
 * Format currency with proper conversion and display
 */
export async function formatCurrencyWithConversion(
  amountUSD: number,
  displayCurrency: string,
  showOriginalUSD: boolean = false
): Promise<string> {
  try {
    const { currencies, settings } = await fetchCurrencyData();

    // Convert USD amount to display currency
    const convertedAmount = convertFromUSD(amountUSD, displayCurrency, currencies);

    // Format the converted amount
    const formattedAmount = formatCurrencyAmount(convertedAmount, displayCurrency, currencies, settings);

    if (showOriginalUSD && displayCurrency !== 'USD') {
      const formattedUSD = formatCurrencyAmount(amountUSD, 'USD', currencies, settings);
      return `${formattedAmount} (${formattedUSD})`;
    }

    return formattedAmount;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `$${amountUSD.toFixed(2)}`;
  }
}

/**
 * Get exchange rate between two currencies
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  currencies: Currency[]
): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  if (!fromCurrencyData || !toCurrencyData) {
    return 1;
  }

  if (fromCurrency === 'USD') {
    return Number(toCurrencyData.rate);
  } else if (toCurrency === 'USD') {
    return 1 / Number(fromCurrencyData.rate);
  } else {
    // Cross rate via USD
    return Number(toCurrencyData.rate) / Number(fromCurrencyData.rate);
  }
}
