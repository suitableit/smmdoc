const { PrismaClient } = require('@prisma/client');

// Previous database connection
const previousDb = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://fbdownhub_smm:fbdownhub_smm@15.235.181.69:3306/fbdownhub_smm"
    }
  }
});

// Current database connection
const currentDb = new PrismaClient({
  datasources: {
    db: {
      url: "mysql://suitabl1_smmdoc:%xaOLdZAxC$H@103.191.50.6:3306/suitabl1_smmdoc"
    }
  }
});

async function backupFromPreviousDb() {
  try {
    console.log('🔄 Backing up data from previous database...');
    console.log('📍 Source: mysql://fbdownhub_smm:***@15.235.181.69:3306/fbdownhub_smm');
    console.log('📍 Target: mysql://suitabl1_smmdoc:***@103.191.50.6:3306/suitabl1_smmdoc');

    // Test previous database connection
    await previousDb.$connect();
    console.log('✅ Connected to previous database');

    // Test current database connection
    await currentDb.$connect();
    console.log('✅ Connected to current database');

    // Step 1: Backup Users from previous database
    console.log('\n📊 Backing up Users...');
    const previousUsers = await previousDb.$queryRaw`
      SELECT * FROM User ORDER BY id LIMIT 50
    `;
    console.log(`Found ${previousUsers.length} users in previous database`);

    // Clear current users (except admin)
    await currentDb.$executeRaw`DELETE FROM User WHERE id > 2`;
    console.log('Cleared current users (keeping admin)');

    // Insert users with ID mapping
    const userIdMapping = {};
    let newUserId = 1;

    for (const user of previousUsers) {
      try {
        const newUser = await currentDb.user.create({
          data: {
            id: newUserId,
            email: user.email || `user${newUserId}@example.com`,
            username: user.username || `user${newUserId}`,
            name: user.name || `User ${newUserId}`,
            password: user.password || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            role: user.role || 'user',
            currency: user.currency || 'BDT',
            balance: user.balance || 0,
            status: user.status || 'active'
          }
        });
        
        userIdMapping[user.id] = newUserId;
        console.log(`✅ Restored user: ${newUser.email} (${user.id} -> ${newUserId})`);
        newUserId++;
      } catch (error) {
        console.log(`⚠️ Error restoring user ${user.id}: ${error.message}`);
      }
    }

    // Step 2: Backup Categories
    console.log('\n📊 Backing up Categories...');
    const previousCategories = await previousDb.$queryRaw`
      SELECT * FROM Category ORDER BY id LIMIT 50
    `;
    console.log(`Found ${previousCategories.length} categories in previous database`);

    // Clear current categories
    await currentDb.$executeRaw`DELETE FROM Category`;
    console.log('Cleared current categories');

    for (const category of previousCategories) {
      try {
        const mappedUserId = userIdMapping[category.userId] || 1;
        
        const newCategory = await currentDb.category.create({
          data: {
            id: category.id,
            category_name: category.category_name,
            status: category.status || 'active',
            userId: mappedUserId,
            position: category.position || 'bottom',
            hideCategory: category.hideCategory || 'no'
          }
        });
        console.log(`✅ Restored category: ${newCategory.category_name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring category ${category.id}: ${error.message}`);
      }
    }

    // Step 3: Backup ServiceTypes
    console.log('\n📊 Backing up ServiceTypes...');
    const previousServiceTypes = await previousDb.$queryRaw`
      SELECT * FROM ServiceType ORDER BY id LIMIT 20
    `;
    console.log(`Found ${previousServiceTypes.length} service types in previous database`);

    // Clear current service types
    await currentDb.$executeRaw`DELETE FROM ServiceType`;
    console.log('Cleared current service types');

    for (const serviceType of previousServiceTypes) {
      try {
        const newServiceType = await currentDb.serviceType.create({
          data: {
            id: serviceType.id,
            name: serviceType.name,
            description: serviceType.description,
            status: serviceType.status || 'active'
          }
        });
        console.log(`✅ Restored service type: ${newServiceType.name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring service type ${serviceType.id}: ${error.message}`);
      }
    }

    // Step 4: Backup Services
    console.log('\n📊 Backing up Services...');
    const previousServices = await previousDb.$queryRaw`
      SELECT * FROM Service ORDER BY id LIMIT 100
    `;
    console.log(`Found ${previousServices.length} services in previous database`);

    // Clear current services
    await currentDb.$executeRaw`DELETE FROM Service`;
    console.log('Cleared current services');

    for (const service of previousServices) {
      try {
        const mappedUserId = userIdMapping[service.userId] || 1;
        
        const newService = await currentDb.service.create({
          data: {
            id: service.id,
            name: service.name,
            description: service.description,
            rate: service.rate || 0,
            min_order: service.min_order || 1,
            max_order: service.max_order || 1000,
            perqty: service.perqty || 1000,
            avg_time: service.avg_time || '1-24 hours',
            categoryId: service.categoryId,
            userId: mappedUserId,
            serviceTypeId: service.serviceTypeId,
            status: service.status || 'active',
            mode: service.mode || 'manual',
            refill: service.refill || false,
            cancel: service.cancel || false,
            refillDays: service.refillDays,
            refillDisplay: service.refillDisplay,
            serviceSpeed: service.serviceSpeed || 'medium',
            personalizedService: service.personalizedService || false
          }
        });
        console.log(`✅ Restored service: ${newService.name}`);
      } catch (error) {
        console.log(`⚠️ Error restoring service ${service.id}: ${error.message}`);
      }
    }

    // Step 5: Backup Orders
    console.log('\n📊 Backing up Orders...');
    const previousOrders = await previousDb.$queryRaw`
      SELECT * FROM NewOrder ORDER BY id DESC LIMIT 200
    `;
    console.log(`Found ${previousOrders.length} orders in previous database`);

    // Clear current orders
    await currentDb.$executeRaw`DELETE FROM NewOrder`;
    console.log('Cleared current orders');

    for (const order of previousOrders) {
      try {
        const mappedUserId = userIdMapping[order.userId] || 1;
        
        const newOrder = await currentDb.newOrder.create({
          data: {
            id: order.id,
            userId: mappedUserId,
            serviceId: order.serviceId,
            categoryId: order.categoryId,
            link: order.link || '',
            qty: order.qty || 0,
            price: order.price || 0,
            charge: order.charge || 0,
            profit: order.profit || 0,
            avg_time: order.avg_time || '1-24 hours',
            status: order.status || 'pending',
            remains: order.remains || 0,
            startCount: order.startCount || 0,
            bdtPrice: order.bdtPrice || 0,
            currency: order.currency || 'BDT',
            usdPrice: order.usdPrice || 0
          }
        });
        console.log(`✅ Restored order #${newOrder.id}: ${newOrder.status}`);
      } catch (error) {
        console.log(`⚠️ Error restoring order ${order.id}: ${error.message}`);
      }
    }

    // Step 6: Backup RefillRequests
    console.log('\n📊 Backing up RefillRequests...');
    try {
      const previousRefillRequests = await previousDb.$queryRaw`
        SELECT * FROM RefillRequest ORDER BY createdAt DESC LIMIT 50
      `;
      console.log(`Found ${previousRefillRequests.length} refill requests in previous database`);

      // Clear current refill requests
      await currentDb.$executeRaw`DELETE FROM RefillRequest`;
      console.log('Cleared current refill requests');

      for (const refill of previousRefillRequests) {
        try {
          const mappedUserId = userIdMapping[refill.userId] || 1;
          
          const newRefillRequest = await currentDb.refillRequest.create({
            data: {
              id: refill.id,
              orderId: refill.orderId,
              userId: mappedUserId,
              reason: refill.reason || 'Service issue',
              status: refill.status || 'pending',
              adminNotes: refill.adminNotes,
              processedBy: refill.processedBy ? userIdMapping[refill.processedBy] : null,
              processedAt: refill.processedAt
            }
          });
          console.log(`✅ Restored refill request for order #${newRefillRequest.orderId}`);
        } catch (error) {
          console.log(`⚠️ Error restoring refill request ${refill.id}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`⚠️ RefillRequest table might not exist in previous database: ${error.message}`);
    }

    // Final summary
    const finalUsers = await currentDb.user.count();
    const finalCategories = await currentDb.category.count();
    const finalServices = await currentDb.service.count();
    const finalOrders = await currentDb.newOrder.count();
    const finalRefillRequests = await currentDb.refillRequest.count();

    console.log(`\n🎉 Data backup and restore completed!`);
    console.log(`📊 Restored data summary:`);
    console.log(`   Users: ${finalUsers}`);
    console.log(`   Categories: ${finalCategories}`);
    console.log(`   Services: ${finalServices}`);
    console.log(`   Orders: ${finalOrders}`);
    console.log(`   Refill Requests: ${finalRefillRequests}`);

    console.log(`\n✅ All previous database data has been restored!`);

  } catch (error) {
    console.error('❌ Error during backup and restore:', error);
  } finally {
    await previousDb.$disconnect();
    await currentDb.$disconnect();
  }
}

backupFromPreviousDb();
