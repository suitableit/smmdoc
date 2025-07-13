const mysql = require('mysql2/promise');

async function migrateToIntIds() {
  console.log('🔄 Starting migration from String IDs to Int IDs...\n');

  try {
    // Create direct MySQL connection
    const connection = await mysql.createConnection({
      host: '15.235.181.69',
      port: 3306,
      user: 'fbdownhub_smm',
      password: 'fbdownhub_smm',
      database: 'fbdownhub_smm'
    });

    console.log('✅ Connected to MySQL database\n');

    // Step 1: Get all users ordered by creation date
    console.log('📋 Step 1: Getting all users...');
    const [users] = await connection.execute(`
      SELECT id, createdAt, email, username 
      FROM User 
      ORDER BY createdAt ASC
    `);

    console.log(`Found ${users.length} users to migrate`);

    // Step 2: Create mapping of old string ID to new int ID
    const userIdMapping = {};
    users.forEach((user, index) => {
      userIdMapping[user.id] = index + 1; // Start from 1
      console.log(`  ${user.id} -> ${index + 1} (${user.email || user.username || 'No identifier'})`);
    });

    // Step 3: Disable foreign key checks
    console.log('\n🔧 Step 3: Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Step 4: Create new User table with INT ID
    console.log('\n🏗️  Step 4: Creating new User table...');

    await connection.execute('DROP TABLE IF EXISTS User_new');
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
        status VARCHAR(191) DEFAULT 'active',
        apiKey VARCHAR(191) UNIQUE,
        isTwoFactorEnabled BOOLEAN DEFAULT FALSE,
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        lastLoginAt DATETIME(3)
      )
    `);

    // Step 5: Insert users with new sequential IDs
    console.log('\n📝 Step 5: Migrating user data...');

    for (const user of users) {
      const newId = userIdMapping[user.id];

      // Get full user data
      const [fullUserData] = await connection.execute(`
        SELECT * FROM User WHERE id = ?
      `, [user.id]);

      const fullUser = fullUserData[0];

      await connection.execute(`
        INSERT INTO User_new (
          id, username, name, password, email, role, emailVerified, image,
          currency, dollarRate, balance, total_deposit, total_spent,
          servicesDiscount, specialPricing, status, apiKey, isTwoFactorEnabled,
          createdAt, updatedAt, lastLoginAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newId,
        fullUser.username || null,
        fullUser.name || null,
        fullUser.password || null,
        fullUser.email || null,
        fullUser.role || 'user',
        fullUser.emailVerified || null,
        fullUser.image || null,
        fullUser.currency || 'USD',
        fullUser.dollarRate || 121.45,
        fullUser.balance || 0,
        fullUser.total_deposit || 0,
        fullUser.total_spent || 0,
        fullUser.servicesDiscount || 0,
        fullUser.specialPricing || false,
        fullUser.status || 'active',
        fullUser.apiKey || null,
        fullUser.isTwoFactorEnabled || false,
        fullUser.createdAt,
        fullUser.updatedAt,
        fullUser.lastLoginAt || null
      ]);

      console.log(`  ✅ Migrated user ${newId}: ${fullUser.email || fullUser.username || 'No identifier'}`);
    }

    // Step 6: Update related tables
    console.log('\n🔗 Step 6: Updating related tables...');

    // Update AddFund table
    console.log('  Updating AddFund table...');
    const [addFunds] = await connection.execute('SELECT id, userId FROM AddFund');
    for (const fund of addFunds) {
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
        const [records] = await connection.execute(`SELECT id, userId FROM ${tableName}`);

        for (const record of records) {
          const newUserId = userIdMapping[record.userId];
          if (newUserId) {
            await connection.execute(`UPDATE ${tableName} SET userId = ? WHERE id = ?`, [newUserId, record.id]);
          }
        }
      } catch (error) {
        console.log(`    ⚠️ Could not update ${tableName}: ${error.message}`);
      }
    }

    // Step 7: Replace old User table
    console.log('\n🔄 Step 7: Replacing User table...');
    await connection.execute('DROP TABLE User');
    await connection.execute('RENAME TABLE User_new TO User');

    // Step 8: Re-enable foreign key checks
    console.log('\n🔧 Step 8: Re-enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n🎉 Migration completed successfully!');
    console.log(`✅ Migrated ${users.length} users to sequential integer IDs`);

    await connection.end();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateToIntIds()
  .then(() => {
    console.log('\n✅ User ID migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
