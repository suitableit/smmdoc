const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupContactMessages() {
  try {
    console.log('🔧 Setting up contact_messages table...');

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

    // Test the table
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM contact_messages`;
    console.log('✅ Table test successful:', count);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupContactMessages();
