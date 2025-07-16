// app/api/currencies/enabled/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET - Load only enabled currencies from database (public access for header)
export async function GET() {
  try {
    // Get enabled currencies from database
    const enabledCurrencies = await db.currency.findMany({
      where: {
        enabled: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    // If no currencies in database, seed with defaults
    if (enabledCurrencies.length === 0) {
      const defaultCurrencies = [
        {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          rate: 1.0000,
          enabled: true,
        },
        {
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          rate: 0.8500,
          enabled: true,
        },
        {
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          rate: 0.7300,
          enabled: true,
        },
        {
          code: 'BDT',
          name: 'Bangladeshi Taka',
          symbol: '৳',
          rate: 110.0000,
          enabled: true,
        },
        {
          code: 'USDT',
          name: 'Tether USD',
          symbol: '₮',
          rate: 1.0000,
          enabled: true,
        },
      ];

      // Seed default currencies using upsert to avoid duplicates
      for (const currency of defaultCurrencies) {
        await db.currency.upsert({
          where: { code: currency.code },
          update: {
            name: currency.name,
            symbol: currency.symbol,
            rate: currency.rate,
            enabled: currency.enabled
          },
          create: currency
        });
      }

      // Return seeded currencies
      const seededCurrencies = await db.currency.findMany({
        where: { enabled: true },
        orderBy: { code: 'asc' }
      });

      const formattedSeeded = seededCurrencies.map(currency => ({
        ...currency,
        rate: Number(currency.rate)
      }));

      return NextResponse.json({
        success: true,
        currencies: formattedSeeded
      });
    }

    // Convert Decimal to number for JSON serialization
    const formattedCurrencies = enabledCurrencies.map(currency => ({
      ...currency,
      rate: Number(currency.rate)
    }));

    return NextResponse.json({
      success: true,
      currencies: formattedCurrencies
    });

  } catch (error) {
    console.error('Error loading enabled currencies:', error);

    // Return fallback currencies if database fails
    const fallbackCurrencies = [
      { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000, enabled: true },
      { id: 5, code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 110.0000, enabled: true },
      { id: 6, code: 'USDT', name: 'Tether USD', symbol: '₮', rate: 1.0000, enabled: true },
    ];

    return NextResponse.json({
      success: true,
      currencies: fallbackCurrencies
    });
  }
}
