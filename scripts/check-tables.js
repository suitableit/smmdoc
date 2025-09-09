const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Get all table names from the database
    const tables = await prisma.$queryRaw`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      ORDER BY TABLE_NAME
    `;
    
    console.log(`\n📋 Total tables found: ${tables.length}`);
    
    // Filter temp and backup tables
    const tempTables = tables.filter(t => t.TABLE_NAME.startsWith('temp_'));
    const backupTables = tables.filter(t => t.TABLE_NAME.startsWith('backup_'));
    const migrationTables = tables.filter(t => t.TABLE_NAME.includes('migration') || t.TABLE_NAME.includes('_old'));
    
    console.log(`\n🔄 Temp tables found: ${tempTables.length}`);
    if (tempTables.length > 0) {
      tempTables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    }
    
    console.log(`\n💾 Backup tables found: ${backupTables.length}`);
    if (backupTables.length > 0) {
      backupTables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    }
    
    console.log(`\n🔧 Migration-related tables found: ${migrationTables.length}`);
    if (migrationTables.length > 0) {
      migrationTables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    }
    
    // Check for specific recovery tables
    const recoveryTables = [
      'temp_providers',
      'temp_service_provider_mapping', 
      'temp_general_settings_logo',
      'backup_api_providers',
      'backup_service',
      'backup_general_settings'
    ];
    
    console.log('\n🎯 Checking for specific recovery tables:');
    for (const tableName of recoveryTables) {
      const exists = tables.some(t => t.TABLE_NAME === tableName);
      console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
    }
    
    // Show all table names for reference
    console.log('\n📝 All tables in database:');
    tables.forEach((t, index) => {
      console.log(`   ${index + 1}. ${t.TABLE_NAME}`);
    });
    
    console.log('\n✅ Table check completed!');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();