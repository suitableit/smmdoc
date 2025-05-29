// app/api/exchange-rate/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use your preferred exchange rate API
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json({ rate: data.rates.BDT || 121.45 });
  } catch (error) {
    console.error('Error fetching exchange rate:', error); // Debugging line
    // Return fallback rate with success status to prevent further errors
    return NextResponse.json({ rate: 121.45, error: true }, { status: 200 });
  }
}
