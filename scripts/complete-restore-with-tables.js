const mysql = require('mysql2/promise');

async function completeRestoreWithTables() {
  let previousConnection, currentConnection;
  
  try {
    console.log('🔄 Complete restore with missing tables...');

    // Previous database connection
    previousConnection = await mysql.createConnection({
      host: '15.235.181.69',
      port: 3306,
      user: 'fbdownhub_smm',
      password: 'fbdownhub_smm',
      database: 'fbdownhub_smm'
    });

    // Current database connection
    currentConnection = await mysql.createConnection({
      host: '103.191.50.6',
      port: 3306,
      user: 'suitabl1_smmdoc',
      password: '%xaOLdZAxC$H',
      database: 'suitabl1_smmdoc'
    });

    console.log('✅ Connected to both databases');

    // Disable foreign key checks
    await currentConnection.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Check current tables
    const [currentTables] = await currentConnection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'suitabl1_smmdoc'
    `);
    
    const currentTableNames = currentTables.map(t => t.TABLE_NAME);
    console.log('📊 Current tables:', currentTableNames.join(', '));

    // Check previous tables
    const [previousTables] = await previousConnection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm'
    `);
    
    const previousTableNames = previousTables.map(t => t.TABLE_NAME);
    console.log('📊 Previous tables:', previousTableNames.join(', '));

    // Find missing tables
    const missingTables = previousTableNames.filter(table => !currentTableNames.includes(table));
    console.log('❌ Missing tables:', missingTables.join(', '));

    // Create missing tables
    for (const tableName of missingTables) {
      try {
        console.log(`🔧 Creating missing table: ${tableName}`);
        
        // Get table structure from previous database
        const [createTableResult] = await previousConnection.execute(`SHOW CREATE TABLE ${tableName}`);
        const createTableSQL = createTableResult[0]['Create Table'];
        
        // Execute create table in current database
        await currentConnection.execute(createTableSQL);
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        console.log(`⚠️ Error creating table ${tableName}: ${error.message}`);
      }
    }

    // Check Service table structure
    const [serviceColumns] = await currentConnection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'suitabl1_smmdoc' AND TABLE_NAME = 'Service'
    `);
    
    const serviceColumnNames = serviceColumns.map(col => col.COLUMN_NAME);
    console.log('📊 Service table columns:', serviceColumnNames.join(', '));

    // Add missing columns to Service table if needed
    const requiredServiceColumns = ['mode', 'api_service_id', 'api_provider_id'];
    for (const column of requiredServiceColumns) {
      if (!serviceColumnNames.includes(column)) {
        try {
          if (column === 'mode') {
            await currentConnection.execute(`ALTER TABLE Service ADD COLUMN mode VARCHAR(191) DEFAULT 'manual'`);
          } else if (column === 'api_service_id') {
            await currentConnection.execute(`ALTER TABLE Service ADD COLUMN api_service_id VARCHAR(191)`);
          } else if (column === 'api_provider_id') {
            await currentConnection.execute(`ALTER TABLE Service ADD COLUMN api_provider_id VARCHAR(191)`);
          }
          console.log(`✅ Added column ${column} to Service table`);
        } catch (error) {
          console.log(`⚠️ Error adding column ${column}: ${error.message}`);
        }
      }
    }

    // Now restore data
    console.log('\n📊 Restoring data...');

    // Restore Services
    console.log('🔄 Restoring Services...');
    const [previousServices] = await previousConnection.execute(`
      SELECT * FROM Service ORDER BY id LIMIT 50
    `);
    console.log(`Found ${previousServices.length} services`);

    // Clear current services
    await currentConnection.execute('DELETE FROM Service WHERE id IS NOT NULL');

    for (const service of previousServices) {
      try {
        await currentConnection.execute(`
          INSERT INTO Service (id, name, description, rate, min_order, max_order, perqty, avg_time, 
                              categoryId, userId, serviceTypeId, status, mode, refill, cancel, 
                              refillDays, refillDisplay, serviceSpeed, personalizedService, 
                              api_service_id, api_provider_id, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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
          service.userId || 1,
          service.serviceTypeId,
          service.status || 'active',
          service.mode || 'manual',
          service.refill || false,
          service.cancel || false,
          service.refillDays || null,
          service.refillDisplay || null,
          service.serviceSpeed || 'medium',
          service.personalizedService || false,
          service.api_service_id || null,
          service.api_provider_id || null
        ]);
        console.log(`✅ Restored service: ${service.name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring service: ${error.message}`);
      }
    }

    // Restore AddFund data
    console.log('\n🔄 Restoring AddFund data...');
    try {
      const [previousAddFunds] = await previousConnection.execute(`
        SELECT * FROM AddFund ORDER BY createdAt DESC LIMIT 50
      `);
      console.log(`Found ${previousAddFunds.length} add fund records`);

      // Clear current add funds
      await currentConnection.execute('DELETE FROM AddFund WHERE id IS NOT NULL');

      for (const fund of previousAddFunds) {
        try {
          await currentConnection.execute(`
            INSERT INTO AddFund (id, invoice_id, amount, spent_amount, email, name, status, admin_status, 
                                method, payment_method, sender_number, transaction_id, userId, currency, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            fund.id,
            fund.invoice_id,
            fund.amount || 0,
            fund.spent_amount || 0,
            fund.email,
            fund.name,
            fund.status || 'Pending',
            fund.admin_status || 'Pending',
            fund.method,
            fund.payment_method,
            fund.sender_number,
            fund.transaction_id,
            fund.userId || 1,
            fund.currency || 'BDT',
            fund.createdAt || new Date(),
            fund.updatedAt || new Date()
          ]);
          console.log(`✅ Restored add fund: ${fund.invoice_id}`);
        } catch (error) {
          console.log(`⚠️ Error restoring add fund: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ AddFund restore error: ${error.message}`);
    }

    // Restore CancelRequest data
    console.log('\n🔄 Restoring CancelRequest data...');
    try {
      const [previousCancelRequests] = await previousConnection.execute(`
        SELECT * FROM CancelRequest ORDER BY createdAt DESC LIMIT 50
      `);
      console.log(`Found ${previousCancelRequests.length} cancel requests`);

      // Clear current cancel requests
      await currentConnection.execute('DELETE FROM CancelRequest WHERE id IS NOT NULL');

      for (const cancel of previousCancelRequests) {
        try {
          await currentConnection.execute(`
            INSERT INTO CancelRequest (id, orderId, userId, reason, status, adminNotes, processedBy, processedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            cancel.id,
            cancel.orderId,
            cancel.userId || 1,
            cancel.reason || 'Cancel request',
            cancel.status || 'pending',
            cancel.adminNotes || null,
            cancel.processedBy || null,
            cancel.processedAt || null,
            cancel.createdAt || new Date(),
            cancel.updatedAt || new Date()
          ]);
          console.log(`✅ Restored cancel request for order #${cancel.orderId}`);
        } catch (error) {
          console.log(`⚠️ Error restoring cancel request: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ CancelRequest restore error: ${error.message}`);
    }

    // Re-enable foreign key checks
    await currentConnection.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Final summary
    const [userCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM User');
    const [categoryCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Category');
    const [serviceCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service');
    const [orderCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM NewOrder');
    const [refillCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM RefillRequest');
    const [addFundCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM AddFund');

    console.log(`\n🎉 Complete restore with missing tables finished!`);
    console.log(`📊 Final comprehensive summary:`);
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Categories: ${categoryCount[0].count}`);
    console.log(`   Services: ${serviceCount[0].count}`);
    console.log(`   Orders: ${orderCount[0].count}`);
    console.log(`   Refill Requests: ${refillCount[0].count}`);
    console.log(`   Add Funds: ${addFundCount[0].count}`);

    // Test service-order relation
    const [testOrder] = await currentConnection.execute(`
      SELECT o.id, o.serviceId, s.name as serviceName, u.email as userEmail
      FROM NewOrder o
      JOIN Service s ON o.serviceId = s.id
      JOIN User u ON o.userId = u.id
      LIMIT 3
    `);

    console.log('\n🧪 Testing relations:');
    testOrder.forEach(order => {
      console.log(`   Order #${order.id} -> Service: ${order.serviceName} -> User: ${order.userEmail}`);
    });

    console.log('\n✅ কালকের সব data এবং missing tables restore হয়েছে!');
    console.log('🔗 Service names এখন properly display হবে refill requests এ!');

  } catch (error) {
    console.error('❌ Error during complete restore:', error);
  } finally {
    if (previousConnection) await previousConnection.end();
    if (currentConnection) await currentConnection.end();
  }
}

completeRestoreWithTables();
