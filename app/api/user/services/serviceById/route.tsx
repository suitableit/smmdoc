/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('svId') || '';
    const result = await db.service.findFirst({
      where: { id: id },
    });
    return NextResponse.json(
      {
        error: null,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'An error occurred while fetching the service.',
        data: null,
      },
      { status: 500 }
    );
  }
}
