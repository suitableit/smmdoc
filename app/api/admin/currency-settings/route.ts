import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Default currency settings
const defaultCurrencySettings = {
  defaultCurrency: 'USD',
  displayDecimals: 2,
  currencyPosition: 'left',
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

// Default currencies to seed database
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
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    rate: 150.0000,
    enabled: false,
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

// GET - Load currency settings and currencies from database
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get currency settings (create if not exists)
    let currencySettings = await db.currencySettings.findFirst();
    if (!currencySettings) {
      currencySettings = await db.currencySettings.create({
        data: defaultCurrencySettings
      });
    }

    // Get all currencies (seed if empty)
    let currencies = await db.currency.findMany({
      orderBy: { code: 'asc' }
    });

    if (currencies.length === 0) {
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
      currencies = await db.currency.findMany({
        orderBy: { code: 'asc' }
      });
    }

    // Convert Decimal to number for JSON serialization
    const formattedCurrencies = currencies.map(currency => ({
      ...currency,
      rate: Number(currency.rate)
    }));

    return NextResponse.json({
      success: true,
      currencySettings: {
        defaultCurrency: currencySettings.defaultCurrency,
        displayDecimals: currencySettings.displayDecimals,
        currencyPosition: currencySettings.currencyPosition,
        thousandsSeparator: currencySettings.thousandsSeparator,
        decimalSeparator: currencySettings.decimalSeparator,
      },
      currencies: formattedCurrencies
    });

  } catch (error) {
    console.error('Error loading currency settings:', error);
    return NextResponse.json(
      { error: 'Failed to load currency settings' },
      { status: 500 }
    );
  }
}

// POST - Save currency settings and currencies to database
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currencySettings, currencies } = await request.json();

    // Update currency settings
    if (currencySettings) {
      await db.currencySettings.upsert({
        where: { id: 1 },
        update: currencySettings,
        create: { id: 1, ...currencySettings }
      });
    }

    // Update currencies
    if (currencies && Array.isArray(currencies)) {
      for (const currency of currencies) {
        await db.currency.upsert({
          where: { code: currency.code },
          update: {
            name: currency.name,
            symbol: currency.symbol,
            rate: currency.rate,
            enabled: currency.enabled
          },
          create: {
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            rate: currency.rate,
            enabled: currency.enabled
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Currency settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving currency settings:', error);
    return NextResponse.json(
      { error: 'Failed to save currency settings' },
      { status: 500 }
    );
  }
}
