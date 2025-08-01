const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRawSQL() {
  try {
    console.log('🔍 Testing raw SQL query...\n');
    
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
      WHERE cm.id = 12
    `;

    const result = await prisma.$queryRawUnsafe(query);
    console.log('📄 Raw SQL result:', result[0]);
    
    // Test with a different message that has user data
    const query2 = `
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
      WHERE cm.id = 1
    `;

    const result2 = await prisma.$queryRawUnsafe(query2);
    console.log('📄 Raw SQL result for message 1:', result2[0]);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRawSQL();
