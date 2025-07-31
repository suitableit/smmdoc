const { PrismaClient } = require('../node_modules/.prisma/contact-message-client');

const contactMessagePrisma = new PrismaClient();

async function testContactMessage() {
  try {
    console.log('🧪 Testing Contact Message Model...');

    // Test ContactMessage model
    console.log('\n📋 Testing ContactMessage model...');
    const messages = await contactMessagePrisma.contactMessage.findMany();
    console.log('✅ ContactMessage model works! Messages count:', messages.length);

    // Create a test message
    console.log('\n📝 Creating test contact message...');
    const testMessage = await contactMessagePrisma.contactMessage.create({
      data: {
        userId: 1,
        subject: 'Test Message from Contact Message Schema',
        message: 'This is a test message created using contact-message.prisma file.',
        categoryId: 30, // Using existing category ID
        status: 'Unread'
      }
    });
    console.log('✅ Test message created with ID:', testMessage.id);

    // Get all messages again
    const allMessages = await contactMessagePrisma.contactMessage.findMany();
    console.log('✅ Total messages now:', allMessages.length);

    console.log('\n🎉 Contact Message test completed successfully!');
    console.log('📋 Now check Prisma Studio - ContactMessage table should show data!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactMessagePrisma.$disconnect();
  }
}

testContactMessage();
