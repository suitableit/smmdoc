const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupContactTables() {
  try {
    console.log('🔧 Setting up contact system tables...\n');

    // Create tables using raw SQL
    console.log('📋 Creating contact_settings table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`contact_settings\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`contactSystemEnabled\` boolean NOT NULL DEFAULT true,
        \`maxPendingContacts\` int NOT NULL DEFAULT 3,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('📋 Creating contact_categories table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`contact_categories\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(191) NOT NULL,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`contact_categories_name_key\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('📋 Creating contact_messages table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS \`contact_messages\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`subject\` varchar(191) NOT NULL,
        \`message\` text NOT NULL,
        \`status\` varchar(191) NOT NULL DEFAULT 'Unread',
        \`categoryId\` int NOT NULL,
        \`attachments\` text,
        \`adminReply\` text,
        \`repliedAt\` datetime(3),
        \`repliedBy\` int,
        \`createdAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`contact_messages_userId_idx\` (\`userId\`),
        KEY \`contact_messages_categoryId_idx\` (\`categoryId\`),
        KEY \`contact_messages_status_idx\` (\`status\`),
        CONSTRAINT \`contact_messages_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`contact_messages_categoryId_fkey\` FOREIGN KEY (\`categoryId\`) REFERENCES \`contact_categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT \`contact_messages_repliedBy_fkey\` FOREIGN KEY (\`repliedBy\`) REFERENCES \`User\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    console.log('✅ Tables created successfully!\n');

    // Insert default settings
    console.log('📋 Inserting default contact settings...');
    await prisma.$executeRaw`
      INSERT IGNORE INTO \`contact_settings\` (\`contactSystemEnabled\`, \`maxPendingContacts\`) 
      VALUES (true, 3);
    `;

    // Insert default categories
    console.log('📋 Inserting default contact categories...');
    const categories = [
      'General Inquiry',
      'Business Partnership', 
      'Media & Press',
      'Technical Support',
      'Billing & Payments',
      'Order Issues',
      'Account Management',
      'API & Integration',
      'Other'
    ];

    for (const category of categories) {
      await prisma.$executeRaw`
        INSERT IGNORE INTO \`contact_categories\` (\`name\`) VALUES (${category});
      `;
    }

    console.log('✅ Default data inserted successfully!\n');

    // Verify setup
    console.log('📋 Verifying setup...');
    
    const settingsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM contact_settings`;
    const categoriesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM contact_categories`;
    
    console.log(`   - Contact Settings: ${settingsCount[0].count} record(s)`);
    console.log(`   - Contact Categories: ${categoriesCount[0].count} record(s)`);

    console.log('\n🎉 Contact system setup completed successfully!');
    console.log('\n📝 Available Features:');
    console.log('   ✅ Contact form submission');
    console.log('   ✅ Admin contact management');
    console.log('   ✅ Contact settings configuration');
    console.log('   ✅ Dynamic categories management');
    console.log('   ✅ Message status tracking');
    console.log('   ✅ File attachments support');

  } catch (error) {
    console.error('❌ Error setting up contact tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupContactTables();
