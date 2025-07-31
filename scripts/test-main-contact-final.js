const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMainContactFinal() {
  try {
    console.log('🧪 Testing Main Prisma Contact Models...');

    // Test contact_messages model (ContactMessage)
    if (prisma.contact_messages) {
      console.log('\n✅ contact_messages model found in main schema!');
      const messages = await prisma.contact_messages.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      
      console.log('Contact messages count:', messages.length);
      
      if (messages.length > 0) {
        console.log('\n📋 Latest messages:');
        messages.forEach((msg, index) => {
          console.log(`${index + 1}. ID: ${msg.id}, Subject: "${msg.subject}", Status: ${msg.status}`);
        });
      }
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

    console.log('\n🎉 Main Prisma contact test completed successfully!');
    console.log('📋 Now open main Prisma Studio - contact_messages table should be visible!');
    console.log('🔗 Run: npx prisma studio');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMainContactFinal();
