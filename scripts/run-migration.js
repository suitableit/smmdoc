const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting database migration process...\n');

// Step 1: Generate Prisma migration
console.log('📝 Step 1: Generating Prisma migration...');
exec('npx prisma migrate dev --name user-id-to-int --create-only', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating migration:', error);
    return;
  }
  
  console.log('✅ Migration files generated');
  console.log(stdout);
  
  // Step 2: Run custom migration script
  console.log('\n🔄 Step 2: Running custom data migration...');
  exec('node scripts/migrate-user-id-to-int.js', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error running custom migration:', error);
      return;
    }
    
    console.log('✅ Custom migration completed');
    console.log(stdout);
    
    // Step 3: Apply Prisma migration
    console.log('\n📋 Step 3: Applying Prisma migration...');
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error applying migration:', error);
        return;
      }
      
      console.log('✅ Prisma migration applied');
      console.log(stdout);
      
      // Step 4: Generate Prisma client
      console.log('\n🔧 Step 4: Generating Prisma client...');
      exec('npx prisma generate', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error generating client:', error);
          return;
        }
        
        console.log('✅ Prisma client generated');
        console.log(stdout);
        
        console.log('\n🎉 Migration process completed successfully!');
        console.log('✅ User IDs are now sequential integers (1, 2, 3...)');
        console.log('✅ All related tables have been updated');
        console.log('✅ Admin users page will now show proper user IDs');
      });
    });
  });
});
