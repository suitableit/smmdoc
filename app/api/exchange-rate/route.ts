/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/exchange-rate/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use your preferred exchange rate API
    const response = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD'
    );
    const data = await response.json();
    return NextResponse.json({ rate: data.rates.BDT });
  } catch (error) {
    return NextResponse.json({ rate: 84.5 }, { status: 200 }); // Fallback rate
  }
}
