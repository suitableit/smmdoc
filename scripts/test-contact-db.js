const { contactDB } = require('../lib/contact-db');

async function testContactDB() {
  try {
    console.log('🧪 Testing Contact DB...');

    // Test contact settings
    console.log('\n1️⃣ Testing contact settings...');
    const settings = await contactDB.getContactSettings();
    console.log('✅ Contact settings:', settings ? 'Found' : 'Not found');

    // Test contact categories
    console.log('\n2️⃣ Testing contact categories...');
    const categories = await contactDB.getContactCategories();
    console.log('✅ Contact categories count:', categories.length);

    // Test contact messages
    console.log('\n3️⃣ Testing contact messages...');
    const messages = await contactDB.getContactMessages();
    console.log('✅ Contact messages count:', messages.length);

    console.log('\n🎉 Contact DB test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testContactDB();
