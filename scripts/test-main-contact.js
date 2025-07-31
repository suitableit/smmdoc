const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMainContact() {
  try {
    console.log('🧪 Testing Main Prisma Contact Models...');

    // Check available models
    console.log('\n📋 Available models:');
    const models = Object.keys(prisma).filter(key => key.toLowerCase().includes('contact'));
    console.log('Contact models:', models);

    // Test ContactMessage model
    if (prisma.contactMessage) {
      console.log('\n✅ ContactMessage model found in main schema!');
      const messages = await prisma.contactMessage.findMany();
      console.log('Contact messages count:', messages.length);
      
      if (messages.length > 0) {
        console.log('Latest message:', {
          id: messages[0].id,
          subject: messages[0].subject,
          status: messages[0].status
        });
      }
    } else {
      console.log('\n❌ ContactMessage model not found in main schema');
    }

    // Test ContactSettings
    if (prisma.contactSettings) {
      console.log('\n✅ ContactSettings model found!');
      const settings = await prisma.contactSettings.findMany();
      console.log('Contact settings count:', settings.length);
    }

    // Test ContactCategory
    if (prisma.contactCategory) {
      console.log('\n✅ ContactCategory model found!');
      const categories = await prisma.contactCategory.findMany();
      console.log('Contact categories count:', categories.length);
    }

    console.log('\n🎉 Main Prisma contact test completed!');
    console.log('📋 Now open main Prisma Studio - ContactMessage should be visible!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMainContact();
