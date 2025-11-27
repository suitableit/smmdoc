import { db } from '@/lib/db';

/**
 * Update affiliate commission status based on order status
 * - If order is cancelled: commission status = 'cancelled'
 * - If order is completed: commission status = 'approved' and add earnings
 */
export async function updateAffiliateCommissionForOrder(
  orderId: number,
  orderStatus: string,
  prisma?: any
): Promise<void> {
  try {
    const dbClient = prisma || db;
    
    const commission = await dbClient.affiliateCommissions.findFirst({
      where: { orderId: orderId },
      include: {
        affiliate: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    if (!commission || !commission.affiliate || commission.affiliate.status !== 'active') {
      return;
    }

    // Handle cancelled orders
    if (orderStatus === 'cancelled' && commission.status === 'pending') {
      await dbClient.affiliateCommissions.update({
        where: { id: commission.id },
        data: {
          status: 'cancelled',
          updatedAt: new Date(),
        }
      });
      console.log(`Affiliate commission ${commission.id} marked as cancelled for order ${orderId}`);
    }
    // Handle completed orders
    else if (orderStatus === 'completed') {
      // Only update if commission is still pending (to avoid double-counting earnings)
      if (commission.status === 'pending') {
        // Update commission to approved
        await dbClient.affiliateCommissions.update({
          where: { id: commission.id },
          data: {
            status: 'approved',
            updatedAt: new Date(),
          }
        });

        // Add earnings to affiliate
        await dbClient.affiliates.update({
          where: { id: commission.affiliateId },
          data: {
            totalEarnings: {
              increment: commission.commissionAmount
            },
            availableEarnings: {
              increment: commission.commissionAmount
            },
            updatedAt: new Date(),
          }
        });

        console.log(`Affiliate commission ${commission.id} approved and $${commission.commissionAmount.toFixed(2)} added to affiliate ${commission.affiliateId} earnings for completed order ${orderId}`);
      } else if (commission.status !== 'approved') {
        // If commission is not pending and not already approved, just update status (don't add earnings again)
        await dbClient.affiliateCommissions.update({
          where: { id: commission.id },
          data: {
            status: 'approved',
            updatedAt: new Date(),
          }
        });
        console.log(`Affiliate commission ${commission.id} status updated to approved for completed order ${orderId} (earnings already added)`);
      }
    }
  } catch (error) {
    console.error('Error updating affiliate commission status:', error);
    // Don't throw - this is a side effect that shouldn't fail the main operation
  }
}

