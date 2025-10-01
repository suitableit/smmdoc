import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Server-side currency conversion function
function serverConvertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  currencies: Array<{ code: string; rate: number }>
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  console.log('Server currency conversion debug:', {
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

  console.log('Server conversion result:', { original: amount, converted: convertedAmount });
  return convertedAmount;
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Test Balance API Called ===');
    
    const session = await auth();
    console.log('Session:', session ? 'Found' : 'Not found');

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      console.log('Unauthorized access');
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { username, amount, action, adminCurrency } = body;

    // Validation
    if (!username || !amount || !action) {
      console.log('Missing required fields');
      return NextResponse.json(
        {
          error: 'Username, amount, and action are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      console.log('Invalid amount');
      return NextResponse.json(
        {
          error: 'Amount must be greater than 0',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Find user by username
    console.log('Searching for user:', username);
    const user = await db.user.findFirst({
      where: {
        username: username
      },
      select: {
        id: true,
        username: true,
        email: true,
        balance: true,
        currency: true,
        dollarRate: true
      }
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        {
          error: 'User not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    console.log('User found:', user);

    // Get currency rates from database
    const currenciesFromDb = await db.currency.findMany({
      where: { enabled: true }
    });

    // Convert Decimal to number for currency conversion
    const currencies = currenciesFromDb.map(currency => ({
      ...currency,
      rate: Number(currency.rate)
    }));

    // Convert admin currency to BDT using proper conversion logic
    let amountToAdd: number;

    console.log('Currency conversion debug:', {
      adminCurrency,
      amount,
      availableCurrencies: currencies.map(c => ({ code: c.code, rate: c.rate }))
    });

    if (adminCurrency === 'BDT') {
      // Admin using BDT - direct amount
      amountToAdd = amount;
    } else {
      // Convert admin currency to BDT using dynamic rates
      amountToAdd = serverConvertCurrency(amount, adminCurrency, 'BDT', currencies);
      console.log('Converted amount:', { original: amount, converted: amountToAdd });
    }

    console.log('Amount to add/deduct:', amountToAdd);

    // Check if deducting more than available balance
    if (action === 'deduct' && user.balance < amountToAdd) {
      console.log('Insufficient balance');
      return NextResponse.json(
        {
          error: `Insufficient balance. User has ৳${user.balance.toFixed(2)}, trying to deduct ৳${amountToAdd.toFixed(2)}`,
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Update user balance
    console.log('Updating user balance...');
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        balance: action === 'add'
          ? { increment: amountToAdd }
          : { decrement: amountToAdd },
      }
    });

    console.log('Balance updated successfully');

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'add' ? 'added' : 'deducted'} balance`,
      data: {
        userId: user.id,
        username: user.username,
        previousBalance: user.balance,
        newBalance: updatedUser.balance,
        amount: amount,
        amountAdded: amountToAdd,
        adminCurrency: adminCurrency,
        action: action
      }
    });

  } catch (error) {
    console.error('Error in test balance API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user balance: ' + (error instanceof Error ? error.message : String(error)),
        success: false,
        data: null 
      },
      { status: 500 }
    );
  }
}
