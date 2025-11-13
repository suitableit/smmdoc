import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

const FALLBACK_RATES = {
  USD: 1.0000,
  EUR: 0.8500,
  GBP: 0.7300,
  BDT: 110.0000,
  XCD: 2.7000,
  USDT: 1.0000,
  JPY: 150.0000,
  CAD: 1.3500,
  AUD: 1.5000,
};

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting automatic currency rate update...');

    let realTimeRates = null;
    try {
      const response = await fetch(EXCHANGE_API_URL, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        realTimeRates = data.rates;
        console.log('✅ Real-time rates fetched successfully');
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch real-time rates, using fallback rates');
    }

    const currencies = await db.currencies.findMany();
    
    if (currencies.length === 0) {
      return NextResponse.json({ 
        error: 'No currencies found in database' 
      }, { status: 404 });
    }

    const updatedCurrencies = [];

    for (const currency of currencies) {
      let newRate = FALLBACK_RATES[currency.code as keyof typeof FALLBACK_RATES] || 1.0000;

      if (realTimeRates && realTimeRates[currency.code]) {
        if (currency.code === 'BDT') {
          newRate = realTimeRates[currency.code];
        } else if (currency.code === 'USD') {
          newRate = 1.0000;
        } else {
          newRate = realTimeRates[currency.code];
        }
      }

      const updatedCurrency = await db.currencies.update({
        where: { code: currency.code },
        data: { rate: newRate },
      });

      updatedCurrencies.push({
        code: currency.code,
        oldRate: Number(currency.rate),
        newRate: Number(updatedCurrency.rate),
        source: realTimeRates ? 'API' : 'Fallback'
      });

      console.log(`💱 ${currency.code}: ${Number(currency.rate)} → ${newRate} (${realTimeRates ? 'API' : 'Fallback'})`);
    }

    return NextResponse.json({
      success: true,
      message: 'Currency rates updated successfully',
      data: {
        updatedCurrencies,
        source: realTimeRates ? 'Real-time API' : 'Fallback rates',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error updating currency rates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update currency rates',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currencies = await db.currencies.findMany({
      orderBy: { code: 'asc' }
    });

    const formattedCurrencies = currencies.map(currency => ({
      ...currency,
      rate: Number(currency.rate)
    }));

    return NextResponse.json({
      success: true,
      data: formattedCurrencies
    });

  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}
