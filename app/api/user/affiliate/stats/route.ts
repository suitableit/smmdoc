import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const moduleSettings = await db.moduleSettings.findFirst();
    const affiliateSystemEnabled = moduleSettings?.affiliateSystemEnabled ?? false;

    if (!affiliateSystemEnabled) {
      return NextResponse.json({
        success: true,
        data: {
          visits: 0,
          registrations: 0,
          referrals: 0,
          conversionRate: '0.00%',
          totalEarnings: '$0.00',
          availableEarnings: '$0.00',
          commissionRate: '0%',
          minimumPayout: '$0.00',
          isAffiliate: false,
          message: 'Affiliate system is currently disabled'
        }
      });
    }

    const userId = parseInt(session.user.id);

    const affiliate = await db.affiliates.findUnique({
      where: { userId },
      include: {
        referrals: true,
        commissions: {
          where: { status: 'approved' }
        }
      }
    });

    if (!affiliate) {
      return NextResponse.json({
        success: true,
        data: {
          visits: 0,
          registrations: 0,
          referrals: 0,
          conversionRate: '0.00%',
          totalEarnings: '$0.00',
          availableEarnings: '$0.00',
          commissionRate: `${moduleSettings?.commissionRate ?? 5}%`,
          minimumPayout: `$${moduleSettings?.minimumPayout ?? 10}.00`,
          isAffiliate: false,
          referralCode: null
        }
      });
    }

    const totalCommissions = affiliate.commissions.reduce((sum, commission) => sum + commission.commissionAmount, 0);
    const conversionRate = affiliate.totalVisits > 0 ? ((affiliate.totalReferrals / affiliate.totalVisits) * 100).toFixed(2) : '0.00';

    const stats = {
      visits: affiliate.totalVisits,
      registrations: affiliate.totalReferrals,
      referrals: affiliate.totalReferrals,
      conversionRate: `${conversionRate}%`,
      totalEarnings: `$${affiliate.totalEarnings.toFixed(2)}`,
      availableEarnings: `$${affiliate.availableEarnings.toFixed(2)}`,
      commissionRate: `${affiliate.commissionRate}%`,
      minimumPayout: `$${moduleSettings?.minimumPayout ?? 10}.00`,
      isAffiliate: true,
      referralCode: affiliate.referralCode,
      status: affiliate.status
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
