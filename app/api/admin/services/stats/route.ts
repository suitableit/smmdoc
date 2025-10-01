import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total services count
    const totalServices = await db.service.count();
    
    // Get active services count
    const activeServices = await db.service.count({
      where: { status: 'active' }
    });
    
    // Get inactive services count
    const inactiveServices = await db.service.count({
      where: { status: 'inactive' }
    });
    
    // Get popular services (services with most orders)
    const popularServices = await db.service.count({
      where: {
        newOrders: {
          some: {}
        }
      }
    });
    
    // Get recently added services (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyAdded = await db.service.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        data: {
          totalServices,
          activeServices,
          inactiveServices,
          popularServices,
          recentlyAdded
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching service stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        data: {
          totalServices: 0,
          activeServices: 0,
          inactiveServices: 0,
          popularServices: 0,
          recentlyAdded: 0
        }
      },
      { status: 500 }
    );
  }
}