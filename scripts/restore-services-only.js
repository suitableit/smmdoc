const mysql = require('mysql2/promise');

async function restoreServicesOnly() {
  let previousConnection, currentConnection;
  
  try {
    console.log('🔄 Restoring services only...');

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

    // Check Service table structure in current database
    const [serviceColumns] = await currentConnection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'suitabl1_smmdoc' AND TABLE_NAME = 'Service'
    `);
    
    const serviceColumnNames = serviceColumns.map(col => col.COLUMN_NAME);
    console.log('📊 Current Service table columns:', serviceColumnNames.join(', '));

    // Backup Services
    console.log('\n📊 Backing up Services...');
    const [previousServices] = await previousConnection.execute(`
      SELECT * FROM Service ORDER BY id LIMIT 50
    `);
    console.log(`Found ${previousServices.length} services`);

    // Clear current services
    await currentConnection.execute('DELETE FROM Service WHERE id IS NOT NULL');
    console.log('Cleared current services');

    for (const service of previousServices) {
      try {
        // Insert without 'mode' column
        await currentConnection.execute(`
          INSERT INTO Service (id, name, description, rate, min_order, max_order, perqty, avg_time, 
                              categoryId, userId, serviceTypeId, status, refill, cancel, 
                              refillDays, refillDisplay, serviceSpeed, personalizedService, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
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

    // Final summary
    const [serviceCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service');
    console.log(`\n🎉 Services restored successfully!`);
    console.log(`📊 Total services: ${serviceCount[0].count}`);

    // Test service-order relation
    const [testOrder] = await currentConnection.execute(`
      SELECT o.id, o.serviceId, s.name as serviceName
      FROM NewOrder o
      JOIN Service s ON o.serviceId = s.id
      LIMIT 3
    `);

    console.log('\n🧪 Testing service-order relations:');
    testOrder.forEach(order => {
      console.log(`   Order #${order.id} -> Service: ${order.serviceName}`);
    });

    console.log('\n✅ Service names will now display properly in refill requests!');

  } catch (error) {
    console.error('❌ Error restoring services:', error);
  } finally {
    if (previousConnection) await previousConnection.end();
    if (currentConnection) await currentConnection.end();
  }
}

restoreServicesOnly();
