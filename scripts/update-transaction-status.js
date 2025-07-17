const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTransactionStatus() {
  try {
    console.log('🔄 Updating transaction status values...\n');
    
    // Update Approved -> Success
    const approvedUpdate = await prisma.addFund.updateMany({
      where: {
        admin_status: 'Approved'
      },
      data: {
        admin_status: 'Success',
        status: 'Success'
      }
    });
    console.log(`✅ Updated ${approvedUpdate.count} "Approved" transactions to "Success"`);

    // Update Rejected -> Cancelled
    const rejectedUpdate = await prisma.addFund.updateMany({
      where: {
        admin_status: 'Rejected'
      },
      data: {
        admin_status: 'Cancelled',
        status: 'Cancelled'
      }
    });
    console.log(`✅ Updated ${rejectedUpdate.count} "Rejected" transactions to "Cancelled"`);

    // Update Completed -> Success (for admin_status)
    const completedUpdate = await prisma.addFund.updateMany({
      where: {
        OR: [
          { admin_status: 'Completed' },
          { status: 'Completed' }
        ]
      },
      data: {
        admin_status: 'Success',
        status: 'Success'
      }
    });
    console.log(`✅ Updated ${completedUpdate.count} "Completed" transactions to "Success"`);

    // Update Failed -> Cancelled (for failed transactions)
    const failedUpdate = await prisma.addFund.updateMany({
      where: {
        OR: [
          { admin_status: 'Failed' },
          { status: 'Failed' }
        ]
      },
      data: {
        admin_status: 'Cancelled',
        status: 'Cancelled'
      }
    });
    console.log(`✅ Updated ${failedUpdate.count} "Failed" transactions to "Cancelled"`);

    // Update Processing -> Pending (for admin_status)
    const processingUpdate = await prisma.addFund.updateMany({
      where: {
        admin_status: 'Processing'
      },
      data: {
        admin_status: 'Pending'
      }
    });
    console.log(`✅ Updated ${processingUpdate.count} "Processing" admin_status to "Pending"`);

    console.log('\n🎉 Transaction status update completed!');
    
    // Verify the changes
    console.log('\n🔍 Verifying updated status distribution...');
    
    const uniqueAdminStatuses = await prisma.addFund.groupBy({
      by: ['admin_status'],
      _count: {
        admin_status: true
      }
    });

    console.log('\n📈 New Admin Status distribution:');
    uniqueAdminStatuses.forEach(item => {
      console.log(`Admin Status "${item.admin_status}": ${item._count.admin_status} transactions`);
    });

  } catch (error) {
    console.error('❌ Error updating transaction status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTransactionStatus();
