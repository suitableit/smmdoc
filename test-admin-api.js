// Test admin API functionality
const { PrismaClient } = require('@prisma/client');

// Since we can't import TS modules directly, let's test the raw SQL queries
async function testAdminAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing Admin Contact Messages API Logic...');
    console.log('===============================================');
    
    // Test the same SQL query used in contact-db.ts
    console.log('\n1. Testing raw SQL query (same as contactDB.getContactMessages)...');
    
    const query = `
      SELECT
        cm.*,
        u.username,
        u.email,
        cc.name as categoryName,
        ru.username as repliedByUsername
      FROM contact_messages cm
      LEFT JOIN user u ON cm.userId = u.id
      LEFT JOIN contact_categories cc ON cm.categoryId = cc.id
      LEFT JOIN user ru ON cm.repliedBy = ru.id
      WHERE 1=1
      ORDER BY cm.createdAt DESC
      LIMIT 10
    `;
    
    const messages = await prisma.$queryRawUnsafe(query);
    console.log('Total messages returned:', messages.length);
    
    if (messages.length > 0) {
      console.log('\n2. Sample message structure:');
      console.log(JSON.stringify(messages[0], null, 2));
      
      console.log('\n3. All messages summary:');
      messages.forEach((msg, index) => {
        console.log(`${index + 1}. ID: ${msg.id}, User: ${msg.username || 'Unknown'}, Subject: ${msg.subject}, Status: ${msg.status}`);
      });
    }
    
    // Test message counts
    console.log('\n4. Testing message counts...');
    const totalCount = await prisma.contact_messages.count();
    const unreadCount = await prisma.contact_messages.count({ where: { status: 'Unread' } });
    const readCount = await prisma.contact_messages.count({ where: { status: 'Read' } });
    const repliedCount = await prisma.contact_messages.count({ where: { status: 'Replied' } });
    
    console.log('Counts:', {
      total: totalCount,
      unread: unreadCount,
      read: readCount,
      replied: repliedCount
    });
    
    // Test with status filter
    console.log('\n5. Testing with status filter (Unread)...');
    const unreadQuery = `
      SELECT
        cm.*,
        u.username,
        u.email,
        cc.name as categoryName
      FROM contact_messages cm
      LEFT JOIN user u ON cm.userId = u.id
      LEFT JOIN contact_categories cc ON cm.categoryId = cc.id
      WHERE cm.status = 'Unread'
      ORDER BY cm.createdAt DESC
      LIMIT 5
    `;
    
    const unreadMessages = await prisma.$queryRawUnsafe(unreadQuery);
    console.log('Unread messages:', unreadMessages.length);
    
    if (unreadMessages.length > 0) {
      unreadMessages.forEach((msg, index) => {
        console.log(`${index + 1}. ID: ${msg.id}, Subject: ${msg.subject}, Status: ${msg.status}`);
      });
    }
    
    // Test if user table has proper data
    console.log('\n6. Testing user table join...');
    const userCheck = await prisma.$queryRawUnsafe(`
      SELECT u.id, u.username, u.email 
      FROM user u 
      WHERE u.id IN (SELECT DISTINCT userId FROM contact_messages) 
      LIMIT 5
    `);
    console.log('Users who sent messages:', userCheck.length);
    if (userCheck.length > 0) {
      console.table(userCheck);
    }
    
  } catch (error) {
    console.error('❌ Error testing admin API:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAPI();