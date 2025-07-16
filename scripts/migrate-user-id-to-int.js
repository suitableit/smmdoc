const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');

const prisma = new PrismaClient();

async function migrateUserIdToInt() {
  console.log('🔄 Starting User ID migration from String to Int...\n');

  try {
    // Create direct MySQL connection for raw SQL operations
    const connection = await mysql.createConnection({
      host: '15.235.181.69',
      port: 3306,
      user: 'fbdownhub_smm',
      password: 'fbdownhub_smm',
      database: 'fbdownhub_smm'
    });

    console.log('✅ Connected to MySQL database\n');

    // Step 1: Create a mapping table for old string IDs to new int IDs
    console.log('📋 Step 1: Creating user ID mapping...');
    
    // Get all users ordered by creation date
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, createdAt: true, email: true }
    });

    console.log(`Found ${users.length} users to migrate`);

    // Create mapping of old string ID to new int ID
    const userIdMapping = {};
    users.forEach((user, index) => {
      userIdMapping[user.id] = index + 1; // Start from 1
      console.log(`  ${user.id} -> ${index + 1} (${user.email || 'No email'})`);
    });

    // Step 2: Disable foreign key checks
    console.log('\n🔧 Step 2: Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Step 3: Create new User table with INT ID
    console.log('\n🏗️  Step 3: Creating new User table structure...');
    
    await connection.execute(`
      CREATE TABLE User_new (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(191) UNIQUE,
        name VARCHAR(191),
        password VARCHAR(191),
        email VARCHAR(191) UNIQUE,
        role ENUM('user', 'admin') DEFAULT 'user',
        emailVerified DATETIME(3),
        image VARCHAR(191),
        currency VARCHAR(191) DEFAULT 'USD',
        dollarRate DOUBLE DEFAULT 121.45,
        balance DOUBLE DEFAULT 0,
        total_deposit DOUBLE DEFAULT 0,
        total_spent DOUBLE DEFAULT 0,
        servicesDiscount DOUBLE DEFAULT 0,
        specialPricing BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
        apiKey VARCHAR(191),
        isTwoFactorEnabled BOOLEAN DEFAULT FALSE,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        lastLoginAt DATETIME(3)
      )
    `);

    // Step 4: Insert users with new sequential IDs
    console.log('\n📝 Step 4: Migrating user data...');
    
    for (const user of users) {
      const newId = userIdMapping[user.id];
      
      // Get full user data
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      await connection.execute(`
        INSERT INTO User_new (
          id, username, name, password, email, role, emailVerified, image,
          currency, dollarRate, balance, total_deposit, total_spent,
          servicesDiscount, specialPricing, status, apiKey, isTwoFactorEnabled,
          createdAt, updatedAt, lastLoginAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newId,
        fullUser.username,
        fullUser.name,
        fullUser.password,
        fullUser.email,
        fullUser.role,
        fullUser.emailVerified,
        fullUser.image,
        fullUser.currency,
        fullUser.dollarRate,
        fullUser.balance,
        fullUser.total_deposit || 0,
        fullUser.total_spent || 0,
        fullUser.servicesDiscount || 0,
        fullUser.specialPricing || false,
        fullUser.status || 'active',
        fullUser.apiKey,
        fullUser.isTwoFactorEnabled,
        fullUser.createdAt,
        fullUser.updatedAt,
        fullUser.lastLoginAt
      ]);

      console.log(`  ✅ Migrated user ${newId}: ${fullUser.email || fullUser.username || 'No identifier'}`);
    }

    // Step 5: Update related tables
    console.log('\n🔗 Step 5: Updating related tables...');

    // Update AddFund table
    console.log('  Updating AddFund table...');
    const addFunds = await connection.execute('SELECT id, userId FROM AddFund');
    for (const fund of addFunds[0]) {
      const newUserId = userIdMapping[fund.userId];
      if (newUserId) {
        await connection.execute('UPDATE AddFund SET userId = ? WHERE id = ?', [newUserId, fund.id]);
      }
    }

    // Update other tables with userId references
    const tablesToUpdate = [
      'Account', 'Session', 'TwoFactorConfirmation', 'ApiKey',
      'Category', 'FavrouteCat', 'FavoriteService', 'Service',
      'NewOrder', 'RefillRequest', 'CancelRequest'
    ];

    for (const tableName of tablesToUpdate) {
      try {
        console.log(`  Updating ${tableName} table...`);
        const records = await connection.execute(`SELECT id, userId FROM ${tableName}`);
        
        for (const record of records[0]) {
          const newUserId = userIdMapping[record.userId];
          if (newUserId) {
            await connection.execute(`UPDATE ${tableName} SET userId = ? WHERE id = ?`, [newUserId, record.id]);
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Could not update ${tableName}: ${error.message}`);
      }
    }

    // Step 6: Replace old User table
    console.log('\n🔄 Step 6: Replacing User table...');
    await connection.execute('DROP TABLE User');
    await connection.execute('RENAME TABLE User_new TO User');

    // Step 7: Re-enable foreign key checks
    console.log('\n🔧 Step 7: Re-enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n🎉 Migration completed successfully!');
    console.log(`✅ Migrated ${users.length} users to sequential integer IDs`);

    await connection.end();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateUserIdToInt()
  .then(() => {
    console.log('\n✅ User ID migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
