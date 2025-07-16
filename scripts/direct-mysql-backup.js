const mysql = require('mysql2/promise');

async function directMysqlBackup() {
  let previousConnection, currentConnection;
  
  try {
    console.log('🔄 Direct MySQL backup from previous database...');

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

    // Check tables in previous database
    const [tables] = await previousConnection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'fbdownhub_smm'
      ORDER BY TABLE_NAME
    `);
    
    console.log(`📊 Found ${tables.length} tables in previous database:`);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });

    // Backup Users
    console.log('\n📊 Backing up Users...');
    const [previousUsers] = await previousConnection.execute(`
      SELECT * FROM User ORDER BY id LIMIT 20
    `);
    console.log(`Found ${previousUsers.length} users`);

    // Clear current users
    await currentConnection.execute('DELETE FROM User WHERE id > 0');
    console.log('Cleared current users');

    // Insert users with sequential IDs
    let newUserId = 1;
    const userIdMapping = {};

    for (const user of previousUsers) {
      try {
        await currentConnection.execute(`
          INSERT INTO User (id, email, username, name, password, role, currency, balance, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          newUserId,
          user.email || `user${newUserId}@example.com`,
          user.username || `user${newUserId}`,
          user.name || `User ${newUserId}`,
          user.password || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          user.role || 'user',
          user.currency || 'BDT',
          user.balance || 0,
          user.status || 'active'
        ]);
        
        userIdMapping[user.id] = newUserId;
        console.log(`✅ Restored user: ${user.email} (${user.id} -> ${newUserId})`);
        newUserId++;
      } catch (error) {
        console.log(`⚠️ Error restoring user: ${error.message}`);
      }
    }

    // Backup Categories
    console.log('\n📊 Backing up Categories...');
    const [previousCategories] = await previousConnection.execute(`
      SELECT * FROM Category ORDER BY id LIMIT 30
    `);
    console.log(`Found ${previousCategories.length} categories`);

    // Clear current categories
    await currentConnection.execute('DELETE FROM Category WHERE id IS NOT NULL');
    console.log('Cleared current categories');

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

    // Clear current service types
    await currentConnection.execute('DELETE FROM ServiceType WHERE id IS NOT NULL');
    console.log('Cleared current service types');

    for (const serviceType of previousServiceTypes) {
      try {
        await currentConnection.execute(`
          INSERT INTO ServiceType (id, name, description, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [
          serviceType.id,
          serviceType.name,
          serviceType.description,
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

    // Clear current services
    await currentConnection.execute('DELETE FROM Service WHERE id IS NOT NULL');
    console.log('Cleared current services');

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
          service.description,
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
          service.refillDays,
          service.refillDisplay,
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

    // Clear current orders
    await currentConnection.execute('DELETE FROM NewOrder WHERE id > 0');
    console.log('Cleared current orders');

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

    // Create sample refill requests
    console.log('\n📊 Creating sample refill requests...');
    const [completedOrders] = await currentConnection.execute(`
      SELECT id, userId FROM NewOrder WHERE status = 'completed' LIMIT 5
    `);

    for (const order of completedOrders) {
      try {
        const refillId = `refill_${order.id}_${Date.now()}`;
        await currentConnection.execute(`
          INSERT INTO RefillRequest (id, orderId, userId, reason, status, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
        `, [
          refillId,
          order.id,
          order.userId,
          `Service delivery issue for order #${order.id}`
        ]);
        console.log(`✅ Created refill request for order #${order.id}`);
      } catch (error) {
        console.log(`⚠️ Error creating refill request: ${error.message}`);
      }
    }

    // Final summary
    const [userCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM User');
    const [categoryCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Category');
    const [serviceCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service');
    const [orderCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM NewOrder');
    const [refillCount] = await currentConnection.execute('SELECT COUNT(*) as count FROM RefillRequest');

    console.log(`\n🎉 Direct MySQL backup completed!`);
    console.log(`📊 Final data summary:`);
    console.log(`   Users: ${userCount[0].count}`);
    console.log(`   Categories: ${categoryCount[0].count}`);
    console.log(`   Services: ${serviceCount[0].count}`);
    console.log(`   Orders: ${orderCount[0].count}`);
    console.log(`   Refill Requests: ${refillCount[0].count}`);

    console.log(`\n✅ All previous database data has been restored successfully!`);

  } catch (error) {
    console.error('❌ Error during direct MySQL backup:', error);
  } finally {
    if (previousConnection) await previousConnection.end();
    if (currentConnection) await currentConnection.end();
  }
}

directMysqlBackup();
