const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSenderNumbers() {
  try {
    console.log('Checking AddFund records with sender_number field...');
    
    // Get total count
    const totalCount = await prisma.addFund.count();
    console.log(`Total AddFund records: ${totalCount}`);
    
    // Get records with null or empty sender_number
    const nullSenderNumbers = await prisma.addFund.count({
      where: {
        OR: [
          { sender_number: null },
          { sender_number: '' }
        ]
      }
    });
    console.log(`Records with null/empty sender_number: ${nullSenderNumbers}`);
    
    // Get records with valid sender_number
    const validSenderNumbers = await prisma.addFund.count({
      where: {
        AND: [
          { sender_number: { not: null } },
          { sender_number: { not: '' } }
        ]
      }
    });
    console.log(`Records with valid sender_number: ${validSenderNumbers}`);
    
    // Get some sample records
    const sampleRecords = await prisma.addFund.findMany({
      take: 5,
      select: {
        id: true,
        invoice_id: true,
        sender_number: true,
        method: true,
        payment_method: true,
        amount: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\nSample records:');
    console.table(sampleRecords);
    
  } catch (error) {
    console.error('Error checking sender numbers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSenderNumbers();