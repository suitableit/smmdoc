const mysql = require('mysql2/promise');

async function fixServiceTable() {
  let previousConnection, currentConnection;
  
  try {
    console.log('🔄 Fixing Service table and restoring services...');

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

    // Check current Service table structure
    const [serviceColumns] = await currentConnection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'suitabl1_smmdoc' AND TABLE_NAME = 'Service'
    `);
    
    const serviceColumnNames = serviceColumns.map(col => col.COLUMN_NAME);
    console.log('📊 Current Service columns:', serviceColumnNames.join(', '));

    // Add missing columns to Service table
    const missingColumns = [
      'refill BOOLEAN DEFAULT FALSE',
      'cancel BOOLEAN DEFAULT FALSE',
      'refillDays INT',
      'refillDisplay INT',
      'serviceSpeed VARCHAR(191) DEFAULT "medium"',
      'personalizedService BOOLEAN DEFAULT FALSE'
    ];

    for (const column of missingColumns) {
      const columnName = column.split(' ')[0];
      if (!serviceColumnNames.includes(columnName)) {
        try {
          await currentConnection.execute(`ALTER TABLE Service ADD COLUMN ${column}`);
          console.log(`✅ Added column: ${columnName}`);
        } catch (error) {
          console.log(`⚠️ Error adding column ${columnName}: ${error.message}`);
        }
      } else {
        console.log(`✅ Column ${columnName} already exists`);
      }
    }

    // Now restore services
    console.log('\n🔄 Restoring Services...');
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

    // Test service-order relations
    console.log('\n🧪 Testing service-order relations...');
    const [testOrders] = await currentConnection.execute(`
      SELECT o.id, o.serviceId, s.name as serviceName, u.email as userEmail
      FROM NewOrder o
      LEFT JOIN Service s ON o.serviceId = s.id
      LEFT JOIN User u ON o.userId = u.id
      LIMIT 5
    `);

    console.log('📊 Order-Service relations:');
    testOrders.forEach(order => {
      console.log(`   Order #${order.id} -> Service: ${order.serviceName || 'NOT FOUND'} -> User: ${order.userEmail}`);
    });

    // Final summary
    const [serviceCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service');
    const [orderCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM NewOrder');
    const [refillCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM RefillRequest');

    console.log(`\n🎉 Service table fixed and data restored!`);
    console.log(`📊 Summary:`);
    console.log(`   Services: ${serviceCount[0].count}`);
    console.log(`   Orders: ${orderCount[0].count}`);
    console.log(`   Refill Requests: ${refillCount[0].count}`);

    // Test refill request with service names
    console.log('\n🧪 Testing refill request service names...');
    const [refillWithServices] = await currentConnection.execute(`
      SELECT r.id, r.orderId, o.serviceId, s.name as serviceName, u.email as userEmail
      FROM RefillRequest r
      LEFT JOIN NewOrder o ON r.orderId = o.id
      LEFT JOIN Service s ON o.serviceId = s.id
      LEFT JOIN User u ON r.userId = u.id
      LIMIT 3
    `);

    console.log('📊 Refill Request - Service relations:');
    refillWithServices.forEach(refill => {
      console.log(`   Refill ${refill.id} -> Order #${refill.orderId} -> Service: ${refill.serviceName || 'NOT FOUND'} -> User: ${refill.userEmail}`);
    });

    console.log('\n✅ Service names এখন refill requests এ properly display হবে!');

  } catch (error) {
    console.error('❌ Error fixing service table:', error);
  } finally {
    if (previousConnection) await previousConnection.end();
    if (currentConnection) await currentConnection.end();
  }
}

fixServiceTable();
