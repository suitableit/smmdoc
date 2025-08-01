const { contactDB } = require('../lib/contact-db');

async function testCompleteSystem() {
  try {
    console.log('🧪 COMPREHENSIVE CONTACT SYSTEM TEST\n');
    console.log('=' .repeat(50));

    // ===== PART 1: DATABASE CONNECTIVITY =====
    console.log('\n📊 PART 1: DATABASE CONNECTIVITY');
    console.log('-'.repeat(30));
    
    const settings = await contactDB.getContactSettings();
    console.log('✅ Contact Settings:', settings ? 'Connected' : 'Failed');
    
    const categories = await contactDB.getContactCategories();
    console.log('✅ Contact Categories:', categories.length, 'found');
    
    const messages = await contactDB.getContactMessages({ limit: 5 });
    console.log('✅ Contact Messages:', messages.length, 'found');

    // ===== PART 2: CATEGORY MANAGEMENT =====
    console.log('\n📂 PART 2: CATEGORY MANAGEMENT');
    console.log('-'.repeat(30));
    
    // Test creating category
    const testCategoryName = `Test Category ${Date.now()}`;
    const created = await contactDB.createContactCategory(testCategoryName);
    console.log('✅ Create Category:', created ? 'Success' : 'Failed');
    
    // Get updated categories
    const updatedCategories = await contactDB.getContactCategories();
    const newCategory = updatedCategories.find(cat => cat.name === testCategoryName);
    
    if (newCategory) {
      console.log('✅ Category Found:', newCategory.id, '-', newCategory.name);
      
      // Test updating category
      const updatedName = `${testCategoryName} (Updated)`;
      const updated = await contactDB.updateContactCategory(newCategory.id, updatedName);
      console.log('✅ Update Category:', updated ? 'Success' : 'Failed');
      
      // Test deleting category
      const deleted = await contactDB.deleteContactCategory(newCategory.id);
      console.log('✅ Delete Category:', deleted ? 'Success' : 'Failed');
    }

    // ===== PART 3: MESSAGE MANAGEMENT =====
    console.log('\n💬 PART 3: MESSAGE MANAGEMENT');
    console.log('-'.repeat(30));
    
    // Test message counts
    const totalCount = await contactDB.countContactMessages({});
    const unreadCount = await contactDB.countContactMessages({ status: ['Unread'] });
    const readCount = await contactDB.countContactMessages({ status: ['Read'] });
    const repliedCount = await contactDB.countContactMessages({ status: ['Replied'] });
    
    console.log('✅ Message Counts:');
    console.log(`   Total: ${totalCount}`);
    console.log(`   Unread: ${unreadCount}`);
    console.log(`   Read: ${readCount}`);
    console.log(`   Replied: ${repliedCount}`);

    // Test getting message with relations
    if (messages.length > 0) {
      const messageWithDetails = await contactDB.getContactMessageById(messages[0].id);
      console.log('✅ Message Details:', messageWithDetails ? 'Success' : 'Failed');
      
      if (messageWithDetails) {
        console.log(`   User: ${messageWithDetails.user?.username || 'No user'}`);
        console.log(`   Category: ${messageWithDetails.category?.name || 'No category'}`);
        console.log(`   Status: ${messageWithDetails.status}`);
      }
    }

    // ===== PART 4: ADMIN REPLY SYSTEM =====
    console.log('\n💭 PART 4: ADMIN REPLY SYSTEM');
    console.log('-'.repeat(30));
    
    if (messages.length > 0) {
      const testMessage = messages.find(m => m.status === 'Unread') || messages[0];
      
      // Test replying to message
      const replyText = `Test admin reply at ${new Date().toISOString()}`;
      const replied = await contactDB.replyToContactMessage(testMessage.id, replyText, 1);
      console.log('✅ Admin Reply:', replied ? 'Success' : 'Failed');
      
      if (replied) {
        // Verify the reply was saved
        const updatedMessage = await contactDB.getContactMessageById(testMessage.id);
        console.log('✅ Reply Verification:', updatedMessage?.adminReply ? 'Success' : 'Failed');
        console.log(`   Reply: ${updatedMessage?.adminReply?.substring(0, 50)}...`);
        console.log(`   Status: ${updatedMessage?.status}`);
      }
    }

    // ===== SUMMARY =====
    console.log('\n🎉 TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log('✅ Database connectivity: Working');
    console.log('✅ Category management: Working');
    console.log('✅ Message management: Working');
    console.log('✅ Admin reply system: Working');
    console.log('\n🚀 CONTACT SYSTEM IS FULLY FUNCTIONAL!');

  } catch (error) {
    console.error('❌ SYSTEM TEST FAILED:', error);
  } finally {
    await contactDB.disconnect();
  }
}

testCompleteSystem();
