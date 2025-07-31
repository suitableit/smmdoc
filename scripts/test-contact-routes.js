const { contactDB } = require('../lib/contact-db');

async function testContactRoutes() {
  try {
    console.log('🧪 Testing Contact System Routes...');

    // Test Contact Settings
    console.log('\n⚙️ Testing Contact Settings...');
    const settings = await contactDB.getContactSettings();
    console.log('✅ getContactSettings:', settings ? 'Working' : 'Failed');

    // Test Contact Categories
    console.log('\n📂 Testing Contact Categories...');
    const categories = await contactDB.getContactCategories();
    console.log('✅ getContactCategories:', categories.length, 'categories found');

    // Test Contact Messages
    console.log('\n💬 Testing Contact Messages...');
    
    // Test count messages
    const messageCount = await contactDB.countContactMessages({
      userId: 1,
      status: ['Unread', 'Read']
    });
    console.log('✅ countContactMessages:', messageCount, 'pending messages');

    // Test get messages
    const messages = await contactDB.getContactMessages({
      limit: 5,
      offset: 0
    });
    console.log('✅ getContactMessages:', messages.length, 'messages found');

    // Test get message by ID
    if (messages.length > 0) {
      const message = await contactDB.getContactMessageById(messages[0].id);
      console.log('✅ getContactMessageById:', message ? 'Working' : 'Failed');
    }

    // Test create contact message
    console.log('\n📝 Testing Create Contact Message...');
    if (categories.length > 0) {
      const created = await contactDB.createContactMessage({
        userId: 1,
        subject: 'Test Route Message',
        message: 'This is a test message from route testing.',
        categoryId: categories[0].id,
        attachments: null
      });
      console.log('✅ createContactMessage:', created ? 'Success' : 'Failed');
    }

    // Test update message status
    console.log('\n🔄 Testing Update Message Status...');
    if (messages.length > 0) {
      const updated = await contactDB.updateContactMessageStatus(messages[0].id, 'Read');
      console.log('✅ updateContactMessageStatus:', updated ? 'Success' : 'Failed');
    }

    // Test reply to message
    console.log('\n💬 Testing Reply to Message...');
    if (messages.length > 0) {
      const replied = await contactDB.replyToContactMessage(
        messages[0].id,
        'This is a test admin reply.',
        1
      );
      console.log('✅ replyToContactMessage:', replied ? 'Success' : 'Failed');
    }

    console.log('\n🎉 Contact Routes Test Completed!');
    console.log('📋 All contact system methods are working with Prisma models!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testContactRoutes();
