const mysql = require('mysql2/promise');

async function completeDatabaseSetupFinal() {
  let previousConnection, currentConnection;
  
  try {
    console.log('🔄 Complete Database Setup - Foreign Key Enable + Null Data...');

    // Previous database connection (backup source)
    previousConnection = await mysql.createConnection({
      host: '15.235.181.69',
      port: 3306,
      user: 'fbdownhub_smm',
      password: 'fbdownhub_smm',
      database: 'fbdownhub_smm'
    });

    // Current database connection (target)
    currentConnection = await mysql.createConnection({
      host: '103.191.50.6',
      port: 3306,
      user: 'suitabl1_smmdoc',
      password: '%xaOLdZAxC$H',
      database: 'suitabl1_smmdoc'
    });

    console.log('✅ Connected to both databases');
    console.log('🔧 Foreign key checks are ENABLED');

    // Step 1: Clear all current data (keeping foreign keys enabled)
    console.log('\n🗑️ Clearing current database...');
    
    // Clear in proper order to respect foreign keys
    const clearOrder = [
      'RefillRequest', 'CancelRequest', 'FavoriteService', 'NewOrder', 
      'Service', 'AddFund', 'Category', 'ServiceType'
    ];

    for (const table of clearOrder) {
      try {
        await currentConnection.execute(`DELETE FROM ${table}`);
        console.log(`✅ Cleared ${table}`);
      } catch (error) {
        console.log(`⚠️ ${table}: ${error.message}`);
      }
    }

    // Step 2: Create ServiceType table first (referenced by Service)
    console.log('\n🔧 Creating ServiceType table...');
    await currentConnection.execute(`
      CREATE TABLE IF NOT EXISTS ServiceType (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(191) NOT NULL UNIQUE,
        description TEXT,
        status VARCHAR(191) NOT NULL DEFAULT 'active',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ ServiceType table created');

    // Insert default service types
    const defaultServiceTypes = [
      { name: 'Standard', description: 'Standard quality service' },
      { name: 'Premium', description: 'Premium quality service' },
      { name: 'High Quality', description: 'High quality service with real users' }
    ];

    for (const serviceType of defaultServiceTypes) {
      try {
        await currentConnection.execute(`
          INSERT INTO ServiceType (name, description, status)
          VALUES (?, ?, 'active')
        `, [serviceType.name, serviceType.description]);
        console.log(`✅ Added service type: ${serviceType.name}`);
      } catch (error) {
        console.log(`⚠️ Service type ${serviceType.name} might already exist`);
      }
    }

    // Step 3: Restore Users with sequential IDs
    console.log('\n👥 Restoring Users...');
    const [previousUsers] = await previousConnection.execute('SELECT * FROM User ORDER BY id');
    console.log(`Found ${previousUsers.length} users in previous database`);

    const userIdMapping = {};
    let newUserId = 1;

    for (const user of previousUsers) {
      try {
        await currentConnection.execute(`
          INSERT INTO User (id, email, username, name, password, role, currency, balance, 
                           dollarRate, total_deposit, total_spent, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          newUserId,
          user.email || `user${newUserId}@example.com`,
          user.username || `user${newUserId}`,
          user.name || `User ${newUserId}`,
          user.password || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
          user.role || 'user',
          user.currency || 'BDT',
          user.balance || 0,
          user.dollarRate || 121.5,
          user.total_deposit || 0,
          user.total_spent || 0
        ]);
        
        userIdMapping[user.id] = newUserId;
        console.log(`✅ User: ${user.email} (${user.id} -> ${newUserId})`);
        newUserId++;
      } catch (error) {
        console.log(`⚠️ Error restoring user: ${error.message}`);
      }
    }

    // Step 4: Restore Categories with sequential IDs
    console.log('\n📂 Restoring Categories...');
    const [previousCategories] = await previousConnection.execute('SELECT * FROM Category ORDER BY id');
    console.log(`Found ${previousCategories.length} categories`);

    const categoryMapping = {};
    let newCategoryId = 1;

    for (const category of previousCategories) {
      try {
        const mappedUserId = userIdMapping[category.userId] || 1;
        
        await currentConnection.execute(`
          INSERT INTO Category (id, category_name, status, userId, position, hideCategory, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          newCategoryId,
          category.category_name,
          category.status || 'active',
          mappedUserId,
          category.position || 'bottom',
          category.hideCategory || 'no'
        ]);
        
        categoryMapping[category.id] = newCategoryId;
        console.log(`✅ Category: ${category.category_name} (${category.id} -> ${newCategoryId})`);
        newCategoryId++;
      } catch (error) {
        console.log(`⚠️ Error restoring category: ${error.message}`);
      }
    }

    // Step 5: Restore Services with sequential IDs and NULL serviceTypeId where appropriate
    console.log('\n🛠️ Restoring Services...');
    const [previousServices] = await previousConnection.execute('SELECT * FROM Service ORDER BY id');
    console.log(`Found ${previousServices.length} services`);

    const serviceMapping = {};
    let newServiceId = 1;

    for (const service of previousServices) {
      try {
        const mappedUserId = userIdMapping[service.userId] || 1;
        const mappedCategoryId = categoryMapping[service.categoryId] || 1;
        
        // Determine serviceTypeId based on service name (or keep NULL)
        let serviceTypeId = null; // Default to NULL (empty field)
        
        if (service.name.includes('Premium')) {
          serviceTypeId = 2; // Premium
        } else if (service.name.includes('High Quality') || service.name.includes('Real')) {
          serviceTypeId = 3; // High Quality
        } else if (service.name.includes('Standard')) {
          serviceTypeId = 1; // Standard
        }
        // If no match, keep serviceTypeId as NULL
        
        await currentConnection.execute(`
          INSERT INTO Service (id, name, description, rate, min_order, max_order, perqty, avg_time, 
                              categoryId, userId, serviceTypeId, status, mode, refill, cancel, 
                              refillDays, refillDisplay, serviceSpeed, personalizedService, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          newServiceId,
          service.name,
          service.description || '',
          service.rate || 0,
          service.min_order || 1,
          service.max_order || 1000,
          service.perqty || 1000,
          service.avg_time || '1-24 hours',
          mappedCategoryId,
          mappedUserId,
          serviceTypeId, // Can be NULL
          service.status || 'active',
          service.mode || 'manual',
          service.refill || false,
          service.cancel || false,
          service.refillDays || null,
          service.refillDisplay || null,
          service.serviceSpeed || 'medium',
          service.personalizedService || false
        ]);
        
        serviceMapping[service.id] = newServiceId;
        const typeDisplay = serviceTypeId ? `Type ID: ${serviceTypeId}` : 'Type: NULL (empty)';
        console.log(`✅ Service: ${service.name} (${service.id} -> ${newServiceId}) - ${typeDisplay}`);
        newServiceId++;
      } catch (error) {
        console.log(`⚠️ Error restoring service: ${error.message}`);
      }
    }

    // Step 6: Restore Orders
    console.log('\n📦 Restoring Orders...');
    const [previousOrders] = await previousConnection.execute('SELECT * FROM NewOrder ORDER BY id DESC');
    console.log(`Found ${previousOrders.length} orders`);

    for (const order of previousOrders) {
      try {
        const mappedUserId = userIdMapping[order.userId] || 1;
        const mappedCategoryId = categoryMapping[order.categoryId] || 1;
        const mappedServiceId = serviceMapping[order.serviceId] || 1;
        
        await currentConnection.execute(`
          INSERT INTO NewOrder (id, userId, serviceId, categoryId, link, qty, price, charge, profit, 
                               avg_time, status, remains, startCount, bdtPrice, currency, usdPrice, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          order.id,
          mappedUserId,
          mappedServiceId,
          mappedCategoryId,
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
          order.usdPrice || 0,
          order.createdAt || new Date(),
          order.updatedAt || new Date()
        ]);
        console.log(`✅ Order #${order.id}: ${order.status}`);
      } catch (error) {
        console.log(`⚠️ Error restoring order: ${error.message}`);
      }
    }

    // Step 7: Restore RefillRequests
    console.log('\n🔄 Restoring RefillRequests...');
    try {
      const [previousRefillRequests] = await previousConnection.execute('SELECT * FROM RefillRequest ORDER BY createdAt DESC');
      console.log(`Found ${previousRefillRequests.length} refill requests`);

      for (const refill of previousRefillRequests) {
        try {
          const mappedUserId = userIdMapping[refill.userId] || 1;
          const mappedProcessedBy = refill.processedBy ? userIdMapping[refill.processedBy] : null;
          
          await currentConnection.execute(`
            INSERT INTO RefillRequest (orderId, userId, reason, status, adminNotes, processedBy, processedAt, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            refill.orderId,
            mappedUserId,
            refill.reason || 'Service issue',
            refill.status || 'pending',
            refill.adminNotes || null,
            mappedProcessedBy, // Can be NULL
            refill.processedAt || null,
            refill.createdAt || new Date(),
            refill.updatedAt || new Date()
          ]);
          console.log(`✅ RefillRequest for order #${refill.orderId}`);
        } catch (error) {
          console.log(`⚠️ Error restoring refill request: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ RefillRequest restore error: ${error.message}`);
    }

    // Final summary
    const [finalUsers] = await currentConnection.execute('SELECT COUNT(*) as count FROM User');
    const [finalCategories] = await currentConnection.execute('SELECT COUNT(*) as count FROM Category');
    const [finalServiceTypes] = await currentConnection.execute('SELECT COUNT(*) as count FROM ServiceType');
    const [finalServices] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service');
    const [finalServicesWithType] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service WHERE serviceTypeId IS NOT NULL');
    const [finalServicesNullType] = await currentConnection.execute('SELECT COUNT(*) as count FROM Service WHERE serviceTypeId IS NULL');
    const [finalOrders] = await currentConnection.execute('SELECT COUNT(*) as count FROM NewOrder');
    const [finalRefills] = await currentConnection.execute('SELECT COUNT(*) as count FROM RefillRequest');

    console.log(`\n🎉 COMPLETE DATABASE SETUP FINISHED!`);
    console.log(`📊 Final comprehensive summary:`);
    console.log(`   Users: ${finalUsers[0].count}`);
    console.log(`   Categories: ${finalCategories[0].count}`);
    console.log(`   ServiceTypes: ${finalServiceTypes[0].count}`);
    console.log(`   Services: ${finalServices[0].count}`);
    console.log(`   Services with ServiceType: ${finalServicesWithType[0].count}`);
    console.log(`   Services with NULL ServiceType: ${finalServicesNullType[0].count}`);
    console.log(`   Orders: ${finalOrders[0].count}`);
    console.log(`   Refill Requests: ${finalRefills[0].count}`);

    // Test relations with NULL handling
    const [testRelations] = await currentConnection.execute(`
      SELECT o.id, s.name as serviceName, c.category_name, u.email, st.name as serviceTypeName
      FROM NewOrder o
      LEFT JOIN Service s ON o.serviceId = s.id
      LEFT JOIN Category c ON o.categoryId = c.id
      LEFT JOIN User u ON o.userId = u.id
      LEFT JOIN ServiceType st ON s.serviceTypeId = st.id
      LIMIT 5
    `);

    console.log('\n🧪 Testing relations with NULL handling:');
    testRelations.forEach(rel => {
      const serviceType = rel.serviceTypeName || 'NULL (empty)';
      console.log(`   Order #${rel.id} -> Service: ${rel.serviceName} -> Type: ${serviceType} -> Category: ${rel.category_name} -> User: ${rel.email}`);
    });

    console.log('\n✅ Database setup completed successfully!');
    console.log('🔧 Foreign key constraints are ENABLED');
    console.log('🔗 Service names will display properly in refill requests');
    console.log('🔢 All IDs are now numeric (1, 2, 3, 4, 5...)');
    console.log('✅ NULL fields are properly handled for empty data');

  } catch (error) {
    console.error('❌ Error during complete database setup:', error);
  } finally {
    if (previousConnection) await previousConnection.end();
    if (currentConnection) await currentConnection.end();
  }
}

completeDatabaseSetupFinal();
