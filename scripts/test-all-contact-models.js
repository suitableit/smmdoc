const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAllContactModels() {
  try {
    console.log('🧪 Testing All Contact Models in Main Prisma...');

    // Test ContactSettings
    console.log('\n⚙️ Testing ContactSettings...');
    try {
      const settings = await prisma.contactSettings.findMany();
      console.log('✅ ContactSettings working! Count:', settings.length);
      if (settings.length > 0) {
        console.log('   Settings:', {
          id: settings[0].id,
          enabled: settings[0].contactSystemEnabled,
          maxPending: settings[0].maxPendingContacts
        });
      }
    } catch (error) {
      console.log('❌ ContactSettings error:', error.message);
    }

    // Test ContactCategory
    console.log('\n📂 Testing ContactCategory...');
    try {
      const categories = await prisma.contactCategory.findMany();
      console.log('✅ ContactCategory working! Count:', categories.length);
      if (categories.length > 0) {
        console.log('   Categories:');
        categories.forEach((cat, index) => {
          console.log(`   ${index + 1}. ${cat.name} (ID: ${cat.id})`);
        });
      }
    } catch (error) {
      console.log('❌ ContactCategory error:', error.message);
    }

    // Test contact_messages
    console.log('\n💬 Testing contact_messages...');
    try {
      const messages = await prisma.contact_messages.findMany({
        orderBy: { createdAt: 'desc' }
      });
      console.log('✅ contact_messages working! Count:', messages.length);
      if (messages.length > 0) {
        console.log('   Messages:');
        messages.slice(0, 3).forEach((msg, index) => {
          console.log(`   ${index + 1}. "${msg.subject}" - ${msg.status} (ID: ${msg.id})`);
        });
      }
    } catch (error) {
      console.log('❌ contact_messages error:', error.message);
    }

    // Create a test contact message with valid categoryId
    console.log('\n📝 Creating test contact message...');
    try {
      const categories = await prisma.contactCategory.findMany();
      if (categories.length > 0) {
        const testMessage = await prisma.contact_messages.create({
          data: {
            userId: 1,
            subject: 'Test Message from Main Prisma',
            message: 'This is a test message created from main Prisma client.',
            categoryId: categories[0].id,
            status: 'Unread'
          }
        });
        console.log('✅ Test message created! ID:', testMessage.id);
      }
    } catch (error) {
      console.log('❌ Create message error:', error.message);
    }

    console.log('\n🎉 Contact models test completed!');
    console.log('📋 Now open Main Prisma Studio - all contact tables should show with data!');
    console.log('🔗 Run: npx prisma studio');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllContactModels();
