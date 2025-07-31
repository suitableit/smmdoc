const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createContactMessagesTable() {
  try {
    console.log('🔧 Creating contact_messages table for Prisma Studio...');

    // Create contact_messages table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id int NOT NULL AUTO_INCREMENT,
        userId int NOT NULL,
        subject varchar(191) NOT NULL,
        message text NOT NULL,
        status varchar(191) NOT NULL DEFAULT 'Unread',
        categoryId int NOT NULL,
        attachments text,
        adminReply text,
        repliedAt datetime(3),
        repliedBy int,
        createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY contact_messages_userId_idx (userId),
        KEY contact_messages_categoryId_idx (categoryId),
        KEY contact_messages_status_idx (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    console.log('✅ contact_messages table created successfully!');

    // Insert some test data
    console.log('📝 Inserting test data...');
    await prisma.$executeRaw`
      INSERT INTO contact_messages (userId, subject, message, categoryId, status, createdAt, updatedAt)
      VALUES 
      (1, 'Test Message 1', 'This is a test contact message for Prisma Studio.', 30, 'Unread', NOW(), NOW()),
      (1, 'Test Message 2', 'Another test message to show in Prisma Studio.', 31, 'Read', NOW(), NOW()),
      (1, 'Test Message 3', 'Third test message with reply.', 32, 'Replied', NOW(), NOW())
    `;

    console.log('✅ Test data inserted successfully!');

    // Test the table
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM contact_messages`;
    console.log('✅ Table test successful. Total messages:', count[0].count);

    console.log('\n🎉 Contact messages table setup completed!');
    console.log('📋 Now open Prisma Studio and refresh - you should see ContactMessage table with data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createContactMessagesTable();
