const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTransactionStatus() {
  try {
    console.log('🔍 Checking transaction status values in database...\n');
    
    // Get all unique status values
    const statusValues = await prisma.addFund.findMany({
      select: {
        id: true,
        status: true,
        admin_status: true,
        amount: true,
        method: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('📊 Recent 10 transactions:');
    console.log('ID | Status | Admin Status | Amount | Method | Created');
    console.log('---|--------|--------------|--------|--------|--------');
    
    statusValues.forEach(transaction => {
      console.log(`${transaction.id} | ${transaction.status || 'NULL'} | ${transaction.admin_status || 'NULL'} | ${transaction.amount} | ${transaction.method || 'NULL'} | ${transaction.createdAt.toISOString().split('T')[0]}`);
    });

    // Get unique status values
    const uniqueStatuses = await prisma.addFund.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const uniqueAdminStatuses = await prisma.addFund.groupBy({
      by: ['admin_status'],
      _count: {
        admin_status: true
      }
    });

    console.log('\n📈 Status distribution:');
    uniqueStatuses.forEach(item => {
      console.log(`Status "${item.status}": ${item._count.status} transactions`);
    });

    console.log('\n📈 Admin Status distribution:');
    uniqueAdminStatuses.forEach(item => {
      console.log(`Admin Status "${item.admin_status}": ${item._count.admin_status} transactions`);
    });

  } catch (error) {
    console.error('❌ Error checking transaction status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactionStatus();
