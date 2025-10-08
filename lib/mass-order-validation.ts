/**
 * Mass Order Validation Utilities
 * Provides parsing, validation, and pricing calculation for mass orders
 */

import axiosInstance from './axiosInstance';
import { convertCurrency, formatCurrencyAmount } from './currency-utils';

export interface ParsedOrder {
  lineNumber: number;
  serviceId: string;
  link: string;
  quantity: number;
  valid: boolean;
  errors: string[];
  service?: ServiceDetails;
  price?: number;
  priceInUserCurrency?: number;
}

export interface ServiceDetails {
  id: number;
  name: string;
  rate: number;
  min_order: number;
  max_order: number;
  categoryId: string;
  status: string;
}

export interface ValidationResult {
  orders: ParsedOrder[];
  validOrders: ParsedOrder[];
  invalidOrders: ParsedOrder[];
  totalCost: number;
  totalCostInUserCurrency: number;
  currency: string;
  currencyRate: number;
}

/**
 * Parse mass order input from textarea
 * Format: service_id|link|quantity (one per line)
 */
export function parseMassOrderInput(input: string): ParsedOrder[] {
  if (!input.trim()) return [];

  return input
    .split('\n')
    .map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      const parts = trimmedLine.split('|').map(p => p.trim());
      
      return {
        lineNumber: index + 1,
        serviceId: parts[0] || '',
        link: parts[1] || '',
        quantity: parseInt(parts[2]) || 0,
        valid: false,
        errors: []
      };
    })
    .filter(Boolean) as ParsedOrder[];
}

/**
 * Validate a single order line
 */
async function validateOrder(
  order: ParsedOrder,
  userCurrency: string,
  availableCurrencies: Array<{ code: string; rate: number; symbol: string; name: string }>
): Promise<ParsedOrder> {
  const errors: string[] = [];

  // Validate format
  if (!order.serviceId) {
    errors.push('Service ID is required');
  }

  if (!order.link) {
    errors.push('Link is required');
  }

  if (!order.quantity || order.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  // Validate link format
  if (order.link && !order.link.startsWith('http')) {
    errors.push('Link must start with http or https');
  }

  // If basic validation fails, return early
  if (errors.length > 0) {
    return {
      ...order,
      valid: false,
      errors
    };
  }

  try {
    // Fetch service details
    const serviceResponse = await axiosInstance.get(
      `/api/user/services/serviceById?svId=${order.serviceId}`
    );

    const service = serviceResponse.data.data;

    if (!service) {
      errors.push(`Service ${order.serviceId} not found`);
      return {
        ...order,
        valid: false,
        errors
      };
    }

    if (service.status !== 'active') {
      errors.push(`Service ${order.serviceId} is not active`);
      return {
        ...order,
        valid: false,
        errors,
        service
      };
    }

    // Validate quantity limits
    if (order.quantity < service.min_order) {
      errors.push(`Minimum quantity is ${service.min_order}`);
    }

    if (order.quantity > service.max_order) {
      errors.push(`Maximum quantity is ${service.max_order}`);
    }

    // Calculate price
    const price = (service.rate * order.quantity) / 1000;
    const priceInUserCurrency = convertCurrency(price, 'USD', userCurrency, availableCurrencies);

    return {
      ...order,
      valid: errors.length === 0,
      errors,
      service,
      price,
      priceInUserCurrency
    };
  } catch {
      errors.push(`Failed to validate service ${order.serviceId}`);
      return {
        ...order,
        valid: false,
        errors
      };
    }
}

/**
 * Validate all orders in the mass order input
 */
export async function validateMassOrders(
  input: string,
  userCurrency: string,
  availableCurrencies: Array<{ code: string; rate: number; symbol: string; name: string }>
): Promise<ValidationResult> {
  const parsedOrders = parseMassOrderInput(input);
  
  if (parsedOrders.length === 0) {
    return {
      orders: [],
      validOrders: [],
      invalidOrders: [],
      totalCost: 0,
      totalCostInUserCurrency: 0,
      currency: userCurrency,
      currencyRate: 1
    };
  }

  // Validate all orders in parallel
  const validatedOrders = await Promise.all(
    parsedOrders.map(order => validateOrder(order, userCurrency, availableCurrencies))
  );

  const validOrders = validatedOrders.filter(order => order.valid);
  const invalidOrders = validatedOrders.filter(order => !order.valid);

  // Calculate total costs
  const totalCost = validOrders.reduce((sum, order) => sum + (order.price || 0), 0);
  const totalCostInUserCurrency = validOrders.reduce((sum, order) => sum + (order.priceInUserCurrency || 0), 0);

  return {
    orders: validatedOrders,
    validOrders,
    invalidOrders,
    totalCost,
    totalCostInUserCurrency,
    currency: userCurrency,
    currencyRate: availableCurrencies.find(c => c.code === userCurrency)?.rate || 1
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string[] {
  const errors: string[] = [];
  
  result.invalidOrders.forEach((orderResult) => {
    if (orderResult.errors.length > 0) {
      errors.push(`Line ${orderResult.lineNumber}: ${orderResult.errors.join(', ')}`);
    }
  });
  
  return errors;
}

/**
 * Check if user has sufficient balance
 */
export function checkSufficientBalance(
  validationResult: ValidationResult,
  userBalance: number,
  availableCurrencies: Array<{ code: string; rate: number; symbol: string; name: string }> = [],
  currencySettings: { format: string; decimals: number; decimal_separator: string; thousand_separator: string; symbol_position: string } | null = null
): {
  sufficient: boolean;
  required: number;
  available: number;
  message?: string;
} {
  const required = validationResult.totalCostInUserCurrency;
  const available = userBalance;
  const sufficient = available >= required;

  // Format currency amounts with proper settings
  const formatAmount = (amount: number, currency: string) => {
    if (currencySettings && availableCurrencies.length > 0) {
      return formatCurrencyAmount(amount, currency, availableCurrencies, currencySettings);
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  return {
    sufficient,
    required,
    available,
    message: sufficient ? undefined : `Insufficient balance. Available: ${formatAmount(available, validationResult.currency)}, Required: ${formatAmount(required, validationResult.currency)}`
  };
}

/**
 * Convert validated orders to API format
 */
export function convertToApiFormat(
  validationResult: ValidationResult,
  batchId: string
): Array<{
  service_id: number;
  link: string;
  quantity: number;
  batch_id?: string;
}> {
  return validationResult.validOrders.map(order => ({
    service_id: parseInt(order.serviceId),
    link: order.link,
    quantity: order.quantity,
    batch_id: batchId
  }));
}