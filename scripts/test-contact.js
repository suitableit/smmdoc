const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testContact() {
  try {
    console.log('🧪 Testing Contact System...');

    // Test contact models
    console.log('\n📋 Available models:');
    const models = Object.keys(prisma).filter(key => key.toLowerCase().includes('contact'));
    console.log('Contact models:', models);

    // Test ContactMsg model
    if (prisma.contactMsg) {
      console.log('\n✅ ContactMsg model found!');
      const messages = await prisma.contactMsg.findMany();
      console.log('Contact messages count:', messages.length);
    } else if (prisma.contactMessage) {
      console.log('\n✅ ContactMessage model found!');
      const messages = await prisma.contactMessage.findMany();
      console.log('Contact messages count:', messages.length);
    } else {
      console.log('\n❌ Contact message model not found');
    }

    // Test ContactCategory
    const categories = await prisma.contactCategory.findMany();
    console.log('\n📂 Contact categories:', categories.length);

    // Test ContactSettings
    const settings = await prisma.contactSettings.findMany();
    console.log('⚙️ Contact settings:', settings.length);

    console.log('\n🎉 Contact system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContact();
