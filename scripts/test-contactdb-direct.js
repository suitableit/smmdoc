const { contactDB } = require('../lib/contact-db');

async function testContactDBDirect() {
  try {
    console.log('🧪 Testing ContactDB directly...\n');

    // Test getting contact messages
    console.log('📋 Testing getContactMessages...');
    const messages = await contactDB.getContactMessages({
      limit: 2,
      offset: 0
    });
    
    console.log(`✅ Found ${messages.length} messages`);
    
    if (messages.length > 0) {
      console.log('📄 First message structure:');
      console.log(JSON.stringify(messages[0], null, 2));
    }

    console.log('\n🎉 ContactDB test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testContactDBDirect();
