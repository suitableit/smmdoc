import { currentUser } from '@/lib/actions/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // Here you would typically fetch real data from the database
    // This is a mock implementation
    const stats = {
      visits: 0,
      registrations: 0,
      referrals: 0,
      conversionRate: '0.00%',
      totalEarnings: '$0.00',
      availableEarnings: '$0.00',
      commissionRate: '1%',
      minimumPayout: '$100.00'
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('[AFFILIATE_STATS_ERROR]', error);
    return new NextResponse(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
    });
  }
} 