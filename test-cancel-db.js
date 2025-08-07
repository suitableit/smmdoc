const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test CancelRequest table
    const cancelRequests = await prisma.cancelRequest.findMany({
      take: 5,
      include: {
        order: {
          include: {
            service: true,
            category: true
          }
        },
        user: true
      }
    });
    
    console.log('✅ CancelRequest table exists');
    console.log(`Found ${cancelRequests.length} cancel requests`);
    
    if (cancelRequests.length > 0) {
      console.log('Sample cancel request:');
      console.log(JSON.stringify(cancelRequests[0], null, 2));
    } else {
      console.log('No cancel requests found in database');
    }
    
    // Test if we can create a test record (we won't actually create it)
    console.log('\nTesting table structure...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cancelrequest' 
      ORDER BY ordinal_position;
    `;
    
    console.log('CancelRequest table columns:');
    console.table(tableInfo);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();