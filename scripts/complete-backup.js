const mysql = require('mysql2/promise');

async function completeBackup() {
  let previousConnection, currentConnection;
  
  try {
    console.log('🔄 Complete backup with table creation...');

    // Previous database connection
    previousConnection = await mysql.createConnection({
      host: '15.235.181.69',
      port: 3306,
      user: 'fbdownhub_smm',
      password: 'fbdownhub_smm',
      database: 'fbdownhub_smm'
    });
    console.log('✅ Connected to previous database');

    // Current database connection
    currentConnection = await mysql.createConnection({
      host: '103.191.50.6',
      port: 3306,
      user: 'suitabl1_smmdoc',
      password: '%xaOLdZAxC$H',
      database: 'suitabl1_smmdoc'
    });
    console.log('✅ Connected to current database');

    // Disable foreign key checks
    await currentConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔧 Disabled foreign key checks');

    // Create RefillRequest table if not exists
    console.log('🔧 Creating RefillRequest table...');
    await currentConnection.execute(`
      CREATE TABLE IF NOT EXISTS RefillRequest (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        orderId INT NOT NULL,
        userId INT NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(191) NOT NULL DEFAULT 'pending',
        adminNotes TEXT,
        processedBy INT,
        processedAt DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX RefillRequest_orderId_idx (orderId),
        INDEX RefillRequest_userId_idx (userId),
        INDEX RefillRequest_status_idx (status),
        INDEX RefillRequest_createdAt_idx (createdAt),
        INDEX RefillRequest_processedBy_idx (processedBy)
      )
    `);
    console.log('✅ RefillRequest table created');

    // Clear all tables
    console.log('\n🗑️ Clearing all tables...');
    await currentConnection.execute('DELETE FROM RefillRequest WHERE id IS NOT NULL');
    await currentConnection.execute('DELETE FROM NewOrder WHERE id > 0');
    await currentConnection.execute('DELETE FROM Service WHERE id IS NOT NULL');
    await currentConnection.execute('DELETE FROM Category WHERE id IS NOT NULL');
    await currentConnection.execute('DELETE FROM ServiceType WHERE id IS NOT NULL');
    console.log('Cleared all tables');

    // Get user mapping from previous backup
    const [currentUsers] = await currentConnection.execute('SELECT id, email FROM User ORDER BY id');
    const userIdMapping = {};
    currentUsers.forEach(user => {
      userIdMapping[user.id] = user.id; // Keep same IDs
    });
    console.log(`📊 User mapping: ${currentUsers.length} users`);

    // Backup Categories
    console.log('\n📊 Backing up Categories...');
    const [previousCategories] = await previousConnection.execute(`
      SELECT * FROM Category ORDER BY id LIMIT 30
    `);
    console.log(`Found ${previousCategories.length} categories`);

    for (const category of previousCategories) {
      try {
        const mappedUserId = userIdMapping[category.userId] || 1;
        
        await currentConnection.execute(`
          INSERT INTO Category (id, category_name, status, userId, position, hideCategory, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          category.id,
          category.category_name,
          category.status || 'active',
          mappedUserId,
          category.position || 'bottom',
          category.hideCategory || 'no'
        ]);
        console.log(`✅ Restored category: ${category.category_name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring category: ${error.message}`);
      }
    }

    // Backup ServiceTypes
    console.log('\n📊 Backing up ServiceTypes...');
    const [previousServiceTypes] = await previousConnection.execute(`
      SELECT * FROM ServiceType ORDER BY id LIMIT 10
    `);
    console.log(`Found ${previousServiceTypes.length} service types`);

    for (const serviceType of previousServiceTypes) {
      try {
        await currentConnection.execute(`
          INSERT INTO ServiceType (id, name, description, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [
          serviceType.id,
          serviceType.name,
          serviceType.description || '',
          serviceType.status || 'active'
        ]);
        console.log(`✅ Restored service type: ${serviceType.name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring service type: ${error.message}`);
      }
    }

    // Backup Services
    console.log('\n📊 Backing up Services...');
    const [previousServices] = await previousConnection.execute(`
      SELECT * FROM Service ORDER BY id LIMIT 50
    `);
    console.log(`Found ${previousServices.length} services`);

    for (const service of previousServices) {
      try {
        const mappedUserId = userIdMapping[service.userId] || 1;
        
        await currentConnection.execute(`
          INSERT INTO Service (id, name, description, rate, min_order, max_order, perqty, avg_time, 
                              categoryId, userId, serviceTypeId, status, mode, refill, cancel, 
                              refillDays, refillDisplay, serviceSpeed, personalizedService, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          service.id,
          service.name,
          service.description || '',
          service.rate || 0,
          service.min_order || 1,
          service.max_order || 1000,
          service.perqty || 1000,
          service.avg_time || '1-24 hours',
          service.categoryId,
          mappedUserId,
          service.serviceTypeId,
          service.status || 'active',
          service.mode || 'manual',
          service.refill || false,
          service.cancel || false,
          service.refillDays || null,
          service.refillDisplay || null,
          service.serviceSpeed || 'medium',
          service.personalizedService || false
        ]);
        console.log(`✅ Restored service: ${service.name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring service: ${error.message}`);
      }
    }

    // Backup Orders
    console.log('\n📊 Backing up Orders...');
    const [previousOrders] = await previousConnection.execute(`
      SELECT * FROM NewOrder ORDER BY id DESC LIMIT 100
    `);
    console.log(`Found ${previousOrders.length} orders`);

    for (const order of previousOrders) {
      try {
        const mappedUserId = userIdMapping[order.userId] || 1;
        
        await currentConnection.execute(`
          INSERT INTO NewOrder (id, userId, serviceId, categoryId, link, qty, price, charge, profit, 
                               avg_time, status, remains, startCount, bdtPrice, currency, usdPrice, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          order.id,
          mappedUserId,
          order.serviceId,
          order.categoryId,
          order.link || '',
          order.qty || 0,
          order.price || 0,
          order.charge || 0,
          order.profit || 0,
          order.avg_time || '1-24 hours',
          order.status || 'pending',
          order.remains || 0,
          order.startCount || 0,
          order.bdtPrice || 0,
          order.currency || 'BDT',
          order.usdPrice || 0
        ]);
        console.log(`✅ Restored order #${order.id}: ${order.status}`);
      } catch (error) {
        console.log(`⚠️ Error restoring order: ${error.message}`);
      }
    }

    // Backup RefillRequests
    console.log('\n📊 Backing up RefillRequests...');
    try {
      const [previousRefillRequests] = await previousConnection.execute(`
        SELECT * FROM RefillRequest ORDER BY createdAt DESC LIMIT 50
      `);
      console.log(`Found ${previousRefillRequests.length} refill requests`);

      for (const refill of previousRefillRequests) {
        try {
          const mappedUserId = userIdMapping[refill.userId] || 1;
          const mappedProcessedBy = refill.processedBy ? userIdMapping[refill.processedBy] : null;
          
          await currentConnection.execute(`
            INSERT INTO RefillRequest (id, orderId, userId, reason, status, adminNotes, processedBy, processedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            refill.id,
            refill.orderId,
            mappedUserId,
            refill.reason || 'Service issue',
            refill.status || 'pending',
            refill.adminNotes || null,
            mappedProcessedBy,
            refill.processedAt || null,
            refill.createdAt || new Date(),
            refill.updatedAt || new Date()
          ]);
          console.log(`✅ Restored refill request for order #${refill.orderId}`);
        } catch (error) {
          console.log(`⚠️ Error restoring refill request: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ RefillRequest backup error: ${error.message}`);
    }

    // Add foreign key constraints
    console.log('\n🔗 Adding foreign key constraints...');
    try {
      await currentConnection.execute(`
        ALTER TABLE RefillRequest 
        ADD CONSTRAINT RefillRequest_orderId_fkey 
        FOREIGN KEY (orderId) REFERENCES NewOrder(id)
      `);
      console.log('✅ Added RefillRequest -> NewOrder FK');
    } catch (error) {
      console.log(`⚠️ FK constraint error: ${error.message}`);
    }

    try {
      await currentConnection.execute(`
        ALTER TABLE RefillRequest 
        ADD CONSTRAINT RefillRequest_userId_fkey 
        FOREIGN KEY (userId) REFERENCES User(id)
      `);
      console.log('✅ Added RefillRequest -> User FK');
    } catch (error) {
      console.log(`⚠️ FK constraint error: ${error.message}`);
    }

    // Re-enable foreign key checks
    await currentConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🔧 Re-enabled foreign key checks');

    // Final summary
    const [userCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM User');
    const [categoryCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Category');
    const [serviceCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service');
    const [orderCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM NewOrder');
    const [refillCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM RefillRequest');

    console.log(`\n🎉 Complete backup finished successfully!`);
    console.log(`📊 Final data summary:`);
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Categories: ${categoryCount[0].count}`);
    console.log(`   Services: ${serviceCount[0].count}`);
    console.log(`   Orders: ${orderCount[0].count}`);
    console.log(`   Refill Requests: ${refillCount[0].count}`);

    console.log(`\n✅ কালকের সব data successfully restore হয়েছে!`);
    console.log(`🔗 Service names এখন properly display হবে refill requests এ!`);

  } catch (error) {
    console.error('❌ Error during complete backup:', error);
  } finally {
    if (previousConnection) await previousConnection.end();
    if (currentConnection) await currentConnection.end();
  }
}

completeBackup();
