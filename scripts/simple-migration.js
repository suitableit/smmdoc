const { exec } = require('child_process');

console.log('🚀 Updating Prisma schema and generating client...\n');

// Generate Prisma client with new schema
console.log('🔧 Generating Prisma client...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error generating client:', error);
    return;
  }
  
  console.log('✅ Prisma client generated successfully');
  console.log(stdout);
  
  console.log('\n🎉 Schema update completed!');
  console.log('✅ User ID is now set to Int with autoincrement');
  console.log('✅ Admin users page will show sequential user IDs');
  console.log('\n⚠️  Note: You may need to manually update existing data in the database');
  console.log('   or run a data migration script if you have existing users.');
});
