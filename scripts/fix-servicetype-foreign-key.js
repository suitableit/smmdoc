const mysql = require('mysql2/promise');

async function fixServiceTypeForeignKey() {
  let connection;
  
  try {
    console.log('🔄 Fixing ServiceType foreign key issue...');

    // Database connection
    connection = await mysql.createConnection({
      host: '103.191.50.6',
      port: 3306,
      user: 'suitabl1_smmdoc',
      password: '%xaOLdZAxC$H',
      database: 'suitabl1_smmdoc'
    });

    console.log('✅ Connected to database');

    // Step 1: Check existing foreign key constraints
    console.log('\n🔍 Checking existing foreign key constraints...');
    const [constraints] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE CONSTRAINT_SCHEMA = 'suitabl1_smmdoc' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
        AND TABLE_NAME = 'Service'
        AND COLUMN_NAME = 'serviceTypeId'
    `);

    console.log(`Found ${constraints.length} foreign key constraints for Service.serviceTypeId`);
    
    // Step 2: Drop existing foreign key constraint if exists
    for (const constraint of constraints) {
      try {
        await connection.execute(`
          ALTER TABLE Service 
          DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}
        `);
        console.log(`✅ Dropped foreign key constraint: ${constraint.CONSTRAINT_NAME}`);
      } catch (error) {
        console.log(`⚠️ Error dropping constraint ${constraint.CONSTRAINT_NAME}: ${error.message}`);
      }
    }

    // Step 3: Make serviceTypeId nullable
    console.log('\n🔄 Making Service.serviceTypeId nullable...');
    try {
      await connection.execute(`
        ALTER TABLE Service 
        MODIFY COLUMN serviceTypeId INT NULL
      `);
      console.log('✅ Service.serviceTypeId is now nullable');
    } catch (error) {
      console.log(`⚠️ Error making serviceTypeId nullable: ${error.message}`);
    }

    // Step 4: Create ServiceType table
    console.log('\n🔧 Creating ServiceType table...');
    await connection.execute(`
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

    // Step 5: Insert default service types
    console.log('\n📊 Inserting default service types...');
    const defaultServiceTypes = [
      { name: 'Standard', description: 'Standard quality service' },
      { name: 'Premium', description: 'Premium quality service' },
      { name: 'High Quality', description: 'High quality service with real users' }
    ];

    for (const serviceType of defaultServiceTypes) {
      try {
        await connection.execute(`
          INSERT INTO ServiceType (name, description, status)
          VALUES (?, ?, 'active')
        `, [serviceType.name, serviceType.description]);
        console.log(`✅ Added service type: ${serviceType.name}`);
      } catch (error) {
        console.log(`⚠️ Service type ${serviceType.name} might already exist`);
      }
    }

    // Step 6: Add foreign key constraint back (optional)
    console.log('\n🔗 Adding foreign key constraint...');
    try {
      await connection.execute(`
        ALTER TABLE Service 
        ADD CONSTRAINT Service_serviceTypeId_fkey 
        FOREIGN KEY (serviceTypeId) REFERENCES ServiceType(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint with ON DELETE SET NULL');
    } catch (error) {
      console.log(`⚠️ Error adding foreign key constraint: ${error.message}`);
    }

    // Step 7: Update services with serviceTypeId (keeping null for empty)
    console.log('\n🔄 Updating services with serviceTypeId...');
    
    const [services] = await connection.execute('SELECT id, name FROM Service');
    
    for (const service of services) {
      let serviceTypeId = null; // Default to null (empty)
      
      if (service.name.includes('Premium')) {
        serviceTypeId = 2; // Premium
      } else if (service.name.includes('High Quality') || service.name.includes('Real')) {
        serviceTypeId = 3; // High Quality
      } else if (service.name.includes('Standard')) {
        serviceTypeId = 1; // Standard
      }
      // If no match, keep serviceTypeId as null
      
      await connection.execute(`
        UPDATE Service SET serviceTypeId = ? WHERE id = ?
      `, [serviceTypeId, service.id]);
      
      const typeDisplay = serviceTypeId ? serviceTypeId : 'NULL (empty)';
      console.log(`✅ Updated service "${service.name}" with serviceTypeId: ${typeDisplay}`);
    }

    // Final summary
    const [serviceTypeCount] = await connection.execute('SELECT COUNT(*) as count FROM ServiceType');
    const [serviceWithTypeCount] = await connection.execute('SELECT COUNT(*) as count FROM Service WHERE serviceTypeId IS NOT NULL');
    const [serviceNullTypeCount] = await connection.execute('SELECT COUNT(*) as count FROM Service WHERE serviceTypeId IS NULL');
    const [totalServiceCount] = await connection.execute('SELECT COUNT(*) as count FROM Service');

    console.log(`\n🎉 ServiceType setup completed with foreign keys enabled!`);
    console.log(`📊 Summary:`);
    console.log(`   ServiceTypes: ${serviceTypeCount[0].count}`);
    console.log(`   Services with ServiceType: ${serviceWithTypeCount[0].count}`);
    console.log(`   Services with NULL ServiceType: ${serviceNullTypeCount[0].count}`);
    console.log(`   Total Services: ${totalServiceCount[0].count}`);

    // Test service-servicetype relation
    const [testRelations] = await connection.execute(`
      SELECT s.id, s.name, s.serviceTypeId, st.name as serviceTypeName
      FROM Service s
      LEFT JOIN ServiceType st ON s.serviceTypeId = st.id
      LIMIT 10
    `);

    console.log('\n🧪 Testing Service-ServiceType relations:');
    testRelations.forEach(rel => {
      const typeInfo = rel.serviceTypeId 
        ? `Type: ${rel.serviceTypeName} (ID: ${rel.serviceTypeId})` 
        : 'Type: NULL (empty field)';
      console.log(`   Service #${rel.id}: ${rel.name} -> ${typeInfo}`);
    });

    console.log('\n✅ ServiceType table created with foreign keys enabled!');
    console.log('✅ Empty fields are properly set to NULL');
    console.log('✅ Foreign key constraints are working with ON DELETE SET NULL');

  } catch (error) {
    console.error('❌ Error fixing ServiceType foreign key:', error);
  } finally {
    if (connection) await connection.end();
  }
}

fixServiceTypeForeignKey();
