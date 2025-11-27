import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Process affiliate referral when a new user registers
 * This function checks for affiliate cookies and creates referral records
 * Only counts the first registration from a unique browser/IP combination
 */
export async function processAffiliateReferral(userId: number, requestHeaders?: Headers): Promise<void> {
  try {
    // Check for affiliate referral cookie
    const cookieStore = await cookies();
    const affiliateCookie = cookieStore.get('affiliate_referral');
    const affiliateMetaCookie = cookieStore.get('affiliate_referral_meta');

    if (!affiliateCookie || !userId) {
      console.log('No affiliate cookie found or no user ID for referral processing');
      return;
    }

    const cookieValue = affiliateCookie.value;
    const [affiliateIdStr, referralCode] = cookieValue.split(':');
    const affiliateId = parseInt(affiliateIdStr);

    if (!affiliateId || isNaN(affiliateId)) {
      console.log('Invalid affiliate ID from cookie:', affiliateIdStr);
      return;
    }

    // Get IP and User-Agent for unique browser fingerprint
    let ip = '';
    let ua = '';
    
    if (requestHeaders) {
      const xff = requestHeaders.get('x-forwarded-for') || '';
      ip = xff.split(',')[0].trim() || '';
      ua = requestHeaders.get('user-agent') || '';
    } else if (affiliateMetaCookie) {
      try {
        const meta = JSON.parse(decodeURIComponent(affiliateMetaCookie.value));
        ip = meta.ip || '';
        ua = meta.ua || '';
      } catch (e) {
        console.error('Error parsing affiliate meta cookie:', e);
      }
    }

    // Create unique browser fingerprint for registration tracking
    const registrationFingerprint = crypto
      .createHash('sha256')
      .update(`${ip}:${ua}:${affiliateId}:registration`)
      .digest('hex')
      .substring(0, 16);

    // Check if this browser has already registered (prevent multiple registrations from same browser)
    const registrationCookie = cookieStore.get(`affiliate_registration_${affiliateId}`);
    const hasRegisteredBefore = registrationCookie && registrationCookie.value === registrationFingerprint;

    if (hasRegisteredBefore) {
      console.log('Registration already counted for this browser/IP combination. Skipping referral.');
      return;
    }

    console.log('Processing referral for affiliate:', affiliateId, 'referralCode:', referralCode, 'userId:', userId);

    // Verify the affiliate exists and is active
    const affiliate = await db.affiliates.findUnique({
      where: { id: affiliateId }
    });

    if (!affiliate || affiliate.status !== 'active' || affiliate.referralCode !== referralCode) {
      console.log('Affiliate not found or not active:', {
        affiliate: !!affiliate,
        status: affiliate?.status,
        codeMatch: affiliate?.referralCode === referralCode
      });
      return;
    }

    // Parse metadata if available
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (affiliateMetaCookie) {
      try {
        const meta = JSON.parse(decodeURIComponent(affiliateMetaCookie.value));
        ipAddress = meta.ip || null;
        userAgent = meta.ua || null;
      } catch (e) {
        console.error('Error parsing affiliate meta cookie:', e);
      }
    }

    // Create referral record (using transaction to ensure atomicity)
    let referralCreated = false;
    await db.$transaction(async (tx) => {
      // Check if referral already exists (prevent duplicates by user ID)
      const existingReferral = await tx.affiliateReferrals.findUnique({
        where: { referredUserId: userId }
      });

      if (!existingReferral) {
        console.log('Creating new referral record and incrementing count');

        // Create the referral record
        await tx.affiliateReferrals.create({
          data: {
            affiliateId,
            referredUserId: userId,
            ipAddress,
            userAgent,
          },
        });

        // Increment totalReferrals count
        const updated = await tx.affiliates.update({
          where: { id: affiliateId },
          data: {
            totalReferrals: {
              increment: 1
            },
            updatedAt: new Date(),
          },
        });

        console.log('Referral created successfully. New totalReferrals count:', updated.totalReferrals);
        referralCreated = true;
      } else {
        console.log('Referral already exists for user:', userId);
      }
    });
    
    // Set registration cookie after successful referral creation to prevent multiple registrations from same browser
    // This must be done outside the transaction and only if a new referral was created
    if (referralCreated) {
      try {
        const registrationExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        cookieStore.set(`affiliate_registration_${affiliateId}`, registrationFingerprint, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          expires: registrationExpires,
          path: '/',
        });
        console.log('Registration cookie set to prevent duplicate registrations from same browser');
      } catch (cookieError) {
        console.error('Error setting registration cookie:', cookieError);
        // Don't fail if cookie setting fails
      }
    }
  } catch (error) {
    // Log error but don't fail registration
    console.error('Error processing affiliate referral:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  }
}
