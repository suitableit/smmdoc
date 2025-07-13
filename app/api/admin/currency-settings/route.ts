import { auth } from '@/auth';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'currency-settings.json');
const CURRENCIES_FILE = path.join(DATA_DIR, 'currencies.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Default currency data
const defaultCurrencies = [
  {
    id: 1,
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1.0000,
    enabled: true,
  },
  {
    id: 2,
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.8500,
    enabled: true,
  },
  {
    id: 3,
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rate: 0.7300,
    enabled: true,
  },
  {
    id: 4,
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    rate: 150.0000,
    enabled: false,
  },
  {
    id: 5,
    code: 'BDT',
    name: 'Bangladeshi Taka',
    symbol: '৳',
    rate: 110.0000,
    enabled: true,
  },
];

const defaultCurrencySettings = {
  defaultCurrency: 'USD',
  displayDecimals: 2,
  currencyPosition: 'left',
  thousandsSeparator: ',',
  decimalSeparator: '.',
};

// Load data from file or return default
function loadSettings() {
  ensureDataDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultCurrencySettings;
}

function loadCurrencies() {
  ensureDataDir();
  try {
    if (fs.existsSync(CURRENCIES_FILE)) {
      const data = fs.readFileSync(CURRENCIES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading currencies:', error);
  }
  return defaultCurrencies;
}

// Save data to file
function saveSettings(settings: any) {
  ensureDataDir();
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

function saveCurrencies(currencies: any[]) {
  ensureDataDir();
  try {
    fs.writeFileSync(CURRENCIES_FILE, JSON.stringify(currencies, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving currencies:', error);
    return false;
  }
}

// GET - Load currency settings and currencies
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currencySettings = loadSettings();
    const currencies = loadCurrencies();

    return NextResponse.json({
      success: true,
      currencySettings,
      currencies
    });

  } catch (error) {
    console.error('Error loading currency settings:', error);
    return NextResponse.json(
      { error: 'Failed to load currency settings' },
      { status: 500 }
    );
  }
}

// POST - Save currency settings and currencies
export async function POST(request: any) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currencySettings, currencies } = await request.json();

    // Save to files
    const settingsSaved = saveSettings(currencySettings);
    const currenciesSaved = saveCurrencies(currencies);

    if (settingsSaved && currenciesSaved) {
      return NextResponse.json({
        success: true,
        message: 'Currency settings saved successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save some settings' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error saving currency settings:', error);
    return NextResponse.json(
      { error: 'Failed to save currency settings' },
      { status: 500 }
    );
  }
}