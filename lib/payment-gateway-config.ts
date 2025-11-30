import { db } from '@/lib/db';

interface PaymentGatewayConfig {
  gatewayName: string;
  apiKey: string;
  apiUrl: string;
  mode: 'Live' | 'Sandbox';
}

const defaultConfig: PaymentGatewayConfig = {
  gatewayName: 'UddoktaPay',
  apiKey: '',
  apiUrl: '',
  mode: 'Live',
};

let cachedConfig: PaymentGatewayConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  const now = Date.now();
  
  if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const settings = await db.paymentGatewaySettings.findFirst();
    
    if (settings) {
      const mode = (settings.mode as 'Live' | 'Sandbox') || defaultConfig.mode;
      
      cachedConfig = {
        gatewayName: settings.gatewayName || defaultConfig.gatewayName,
        apiKey: mode === 'Live' 
          ? (settings.liveApiKey || '') 
          : (settings.sandboxApiKey || ''),
        apiUrl: mode === 'Live' 
          ? (settings.liveApiUrl || '') 
          : (settings.sandboxApiUrl || ''),
        mode: mode,
      };
    } else {
      cachedConfig = defaultConfig;
    }
    
    cacheTimestamp = now;
    return cachedConfig;
  } catch (error) {
    console.error('Error fetching payment gateway settings:', error);
    return cachedConfig || defaultConfig;
  }
}

/**
 * Get the API key for the payment gateway
 */
export async function getPaymentGatewayApiKey(): Promise<string> {
  const config = await getPaymentGatewayConfig();
  return config.apiKey;
}

/**
 * Get the base URL for the payment gateway API
 */
export async function getPaymentGatewayBaseUrl(): Promise<string> {
  const config = await getPaymentGatewayConfig();
  return config.apiUrl;
}

/**
 * Get the checkout URL for creating payments
 * Constructs the full checkout endpoint URL based on base URL
 */
export async function getPaymentGatewayCheckoutUrl(): Promise<string> {
  const config = await getPaymentGatewayConfig();
  const baseUrl = config.apiUrl.trim();
  
  if (!baseUrl) {
    return 'https://pay.smmdoc.com/api/checkout-v2';
  }
  
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  if (cleanUrl.includes('/checkout-v2')) {
    return cleanUrl;
  }
  
  return `${cleanUrl}/checkout-v2`;
}

/**
 * Get the verify payment URL
 * Constructs the full verify endpoint URL based on base URL
 */
export async function getPaymentGatewayVerifyUrl(): Promise<string> {
  const config = await getPaymentGatewayConfig();
  const baseUrl = config.apiUrl.trim();
  
  if (!baseUrl) {
    return 'https://pay.smmdoc.com/api/verify-payment';
  }
  
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  if (cleanUrl.includes('/verify-payment')) {
    return cleanUrl;
  }
  
  return `${cleanUrl}/verify-payment`;
}

/**
 * Get the gateway name from payment gateway settings
 */
export async function getPaymentGatewayName(): Promise<string> {
  const config = await getPaymentGatewayConfig();
  return config.gatewayName;
}

/**
 * Clear the cached payment gateway config (useful after settings updates)
 */
export function clearPaymentGatewayCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}

