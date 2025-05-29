'use client';

import { useCurrency as useContextCurrency } from '@/contexts/CurrencyContext';

export default function useCurrency() {
  return useContextCurrency();
} 