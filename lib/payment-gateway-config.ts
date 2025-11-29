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
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

/**
 * Get payment gateway settings from database with caching
 */
export async function getPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedConfig;
  }

  try {
    const settings = await db.paymentGatewaySettings.findFirst();
    
    if (settings) {
      const mode = (settings.mode as 'Live' | 'Sandbox') || defaultConfig.mode;
      
      // Use the appropriate credentials based on the active mode
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
      // Return default if no settings found
      cachedConfig = defaultConfig;
    }
    
    cacheTimestamp = now;
    return cachedConfig;
  } catch (error) {
    console.error('Error fetching payment gateway settings:', error);
    // Return cached config or default on error
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
    return 'https://pay.smmdoc.com/api/checkout-v2'; // Fallback default
  }
  
  // Remove trailing slash if present
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  // If baseUrl already contains /checkout-v2, return as is
  if (cleanUrl.includes('/checkout-v2')) {
    return cleanUrl;
  }
  
  // Otherwise, append /checkout-v2
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
    return 'https://pay.smmdoc.com/api/verify-payment'; // Fallback default
  }
  
  // Remove trailing slash if present
  const cleanUrl = baseUrl.replace(/\/$/, '');
  
  // If baseUrl already contains /verify-payment, return as is
  if (cleanUrl.includes('/verify-payment')) {
    return cleanUrl;
  }
  
  // Otherwise, append /verify-payment
  return `${cleanUrl}/verify-payment`;
}

/**
 * Clear the cached payment gateway config (useful after settings updates)
 */
export function clearPaymentGatewayCache(): void {
  cachedConfig = null;
  cacheTimestamp = 0;
}

