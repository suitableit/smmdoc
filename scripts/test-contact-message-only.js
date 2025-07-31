const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testContactMessageOnly() {
  try {
    console.log('🧪 Testing ContactMessage in Main Prisma...');

    // Check if ContactMessage model exists
    if (prisma.contactMessage) {
      console.log('✅ ContactMessage model found in main schema!');
      
      try {
        const messages = await prisma.contactMessage.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        
        console.log('✅ Contact messages count:', messages.length);
        
        if (messages.length > 0) {
          console.log('\n📋 Latest messages:');
          messages.forEach((msg, index) => {
            console.log(`${index + 1}. ID: ${msg.id}, Subject: "${msg.subject}", Status: ${msg.status}`);
          });
        }
        
        console.log('\n🎉 ContactMessage model is working in main Prisma!');
        console.log('📋 Now open main Prisma Studio - ContactMessage table should be visible!');
        
      } catch (error) {
        console.error('❌ Error accessing ContactMessage:', error.message);
      }
      
    } else {
      console.log('❌ ContactMessage model not found in main schema');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContactMessageOnly();
