import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// POST /api/user/affiliate/join - Join affiliate program
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 }
      );
    }

    // Check if affiliate system is enabled
    const moduleSettings = await db.moduleSettings.findFirst();
    const affiliateSystemEnabled = moduleSettings?.affiliateSystemEnabled ?? false;

    if (!affiliateSystemEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: 'Affiliate system is currently disabled',
          data: null,
        },
        { status: 403 }
      );
    }

    const userId = parseInt(session.user.id);

    // Check if user is already an affiliate
    const existingAffiliate = await db.affiliates.findUnique({
      where: { userId }
    });

    if (existingAffiliate) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are already part of the affiliate program',
          data: existingAffiliate,
        },
        { status: 400 }
      );
    }

    // Generate unique referral code
    const generateReferralCode = async (): Promise<string> => {
      const baseCode = `REF${userId}${Date.now().toString().slice(-4)}`;
      const existingCode = await db.affiliates.findUnique({
        where: { referralCode: baseCode }
      });
      
      if (existingCode) {
        return generateReferralCode(); // Recursive call if code exists
      }
      
      return baseCode;
    };

    const referralCode = await generateReferralCode();
    const commissionRate = moduleSettings?.commissionRate ?? 5;

    // Create affiliate record
    const affiliate = await db.affiliates.create({
      data: {
        userId,
        referralCode,
        commissionRate,
        status: 'active',
        updatedAt: new Date()
      }
    });

    console.log(`User ${session.user.email} joined affiliate program with code ${referralCode}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the affiliate program',
      data: {
        referralCode: affiliate.referralCode,
        commissionRate: affiliate.commissionRate,
        status: affiliate.status
      },
    });

  } catch (error) {
    console.error('Error joining affiliate program:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to join affiliate program: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
      },
      { status: 500 }
    );
  }
}
