import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Correct currency rates (USD as base currency)
const CORRECT_RATES = {
  USD: 1.0000,      // Base currency
  BDT: 110.0000,    // 1 USD = 110 BDT
  XCD: 2.7000,      // 1 USD = 2.7 XCD
  USDT: 1.0000,     // 1 USD = 1 USDT
  EUR: 0.8500,      // 1 USD = 0.85 EUR
  GBP: 0.7300,      // 1 USD = 0.73 GBP
  JPY: 150.0000,    // 1 USD = 150 JPY
  CAD: 1.3500,      // 1 USD = 1.35 CAD
  AUD: 1.5000,      // 1 USD = 1.50 AUD
};

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Fixing currency rates manually...');

    const updatedCurrencies = [];

    // Update each currency rate
    for (const [currencyCode, correctRate] of Object.entries(CORRECT_RATES)) {
      try {
        // Check if currency exists
        const existingCurrency = await db.currency.findUnique({
          where: { code: currencyCode }
        });

        if (existingCurrency) {
          // Update existing currency
          await db.currency.update({
            where: { code: currencyCode },
            data: { rate: correctRate },
          });

          updatedCurrencies.push({
            code: currencyCode,
            oldRate: Number(existingCurrency.rate),
            newRate: correctRate,
            action: 'updated'
          });

          console.log(`✅ ${currencyCode}: ${Number(existingCurrency.rate)} → ${correctRate}`);
        } else {
          console.log(`⚠️ Currency ${currencyCode} not found in database`);
        }
      } catch (err) {
        console.error(`❌ Error updating ${currencyCode}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Currency rates fixed successfully',
      data: {
        updatedCurrencies,
        totalUpdated: updatedCurrencies.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error fixing currency rates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fix currency rates',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET method to check current rates
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currencies = await db.currency.findMany({
      orderBy: { code: 'asc' }
    });

    const comparison = currencies.map(currency => ({
      code: currency.code,
      currentRate: Number(currency.rate),
      correctRate: CORRECT_RATES[currency.code as keyof typeof CORRECT_RATES] || 'N/A',
      needsUpdate: CORRECT_RATES[currency.code as keyof typeof CORRECT_RATES] 
        ? Number(currency.rate) !== CORRECT_RATES[currency.code as keyof typeof CORRECT_RATES]
        : false
    }));

    return NextResponse.json({
      success: true,
      data: {
        currencies: comparison,
        needsUpdate: comparison.filter(c => c.needsUpdate).length
      }
    });

  } catch (error) {
    console.error('Error checking currency rates:', error);
    return NextResponse.json(
      { error: 'Failed to check currency rates' },
      { status: 500 }
    );
  }
}
