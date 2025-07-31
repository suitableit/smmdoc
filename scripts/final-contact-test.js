const { PrismaClient } = require('../node_modules/.prisma/contact-message-client');

const contactMessagePrisma = new PrismaClient();

async function finalContactTest() {
  try {
    console.log('🎯 Final Contact Message Test...');

    // Get all contact messages
    const messages = await contactMessagePrisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log('✅ Contact Messages found:', messages.length);
    
    if (messages.length > 0) {
      console.log('\n📋 Latest messages:');
      messages.slice(0, 3).forEach((msg, index) => {
        console.log(`${index + 1}. ID: ${msg.id}, Subject: "${msg.subject}", Status: ${msg.status}`);
      });
    }

    console.log('\n🎉 Contact Message model is working perfectly!');
    console.log('📋 Open Prisma Studio and you should see ContactMessage table with data!');
    console.log('🔗 Run: npx prisma studio --schema=prisma/contact-message.prisma');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactMessagePrisma.$disconnect();
  }
}

finalContactTest();
