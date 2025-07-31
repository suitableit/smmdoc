const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createContactMessagesTable() {
  try {
    console.log('🔧 Creating contact_messages table...');

    // Drop table if exists
    await prisma.$executeRaw`DROP TABLE IF EXISTS contact_messages`;

    // Create contact_messages table without foreign keys first
    await prisma.$executeRaw`
      CREATE TABLE contact_messages (
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

    // Test the table
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM contact_messages`;
    console.log('✅ Table test successful:', count);

  } catch (error) {
    console.error('❌ Error creating contact_messages table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createContactMessagesTable();
