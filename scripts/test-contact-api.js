const { contactDB } = require('../lib/contact-db');

async function testContactAPI() {
  try {
    console.log('🧪 Testing Contact API Methods...\n');

    // Test getting contact messages
    console.log('📋 Testing getContactMessages...');
    const messages = await contactDB.getContactMessages({
      limit: 5,
      offset: 0
    });
    console.log(`✅ Found ${messages.length} messages`);
    if (messages.length > 0) {
      console.log('📄 Sample message:', {
        id: messages[0].id,
        subject: messages[0].subject,
        status: messages[0].status,
        user: messages[0].user?.username || 'No user',
        category: messages[0].category?.name || 'No category',
        fullMessage: messages[0]
      });
    }

    // Test counting messages
    console.log('\n📊 Testing countContactMessages...');
    const totalCount = await contactDB.countContactMessages({});
    const unreadCount = await contactDB.countContactMessages({ status: ['Unread'] });
    const readCount = await contactDB.countContactMessages({ status: ['Read'] });
    const repliedCount = await contactDB.countContactMessages({ status: ['Replied'] });

    console.log('✅ Message counts:', {
      total: totalCount,
      unread: unreadCount,
      read: readCount,
      replied: repliedCount
    });

    // Test getting categories
    console.log('\n📂 Testing getContactCategories...');
    const categories = await contactDB.getContactCategories();
    console.log(`✅ Found ${categories.length} categories`);
    categories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`);
    });

    console.log('\n🎉 All contact API methods working!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testContactAPI();
