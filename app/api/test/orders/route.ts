import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const orderCount = await db.newOrder.count();
    console.log('Total orders in database:', orderCount);
    
    // Get first few orders
    const orders = await db.newOrder.findMany({
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log('Sample orders:', orders);
    
    return NextResponse.json({
      success: true,
      data: {
        totalOrders: orderCount,
        sampleOrders: orders
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
