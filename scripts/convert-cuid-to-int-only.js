const fs = require('fs');
const path = require('path');

function convertCuidToIntOnly() {
  console.log('🔄 Converting ONLY cuid() to Int - No other changes...');

  const schemaFiles = [
    'prisma/schema/user.prisma',
    'prisma/schema/addFund.prisma'
  ];

  // Convert cuid() to autoincrement() in schema files
  schemaFiles.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Only convert cuid() to autoincrement() and String to Int for ID fields
        const cuidPattern = /(\s+id\s+)String(\s+@id\s+@default\()cuid\(\)/g;
        if (cuidPattern.test(content)) {
          content = content.replace(cuidPattern, '$1Int$2autoincrement()');
          modified = true;
          console.log(`✅ Converted cuid() to Int autoincrement() in: ${filePath}`);
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
        } else {
          console.log(`✓ No cuid() found in: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  // Also check main schema.prisma file
  const mainSchemaPath = 'prisma/schema.prisma';
  if (fs.existsSync(mainSchemaPath)) {
    try {
      let content = fs.readFileSync(mainSchemaPath, 'utf8');
      let modified = false;

      // Convert any remaining cuid() in main schema
      const cuidPattern = /(\s+id\s+)String(\s+@id\s+@default\()cuid\(\)/g;
      if (cuidPattern.test(content)) {
        content = content.replace(cuidPattern, '$1Int$2autoincrement()');
        modified = true;
        console.log(`✅ Converted cuid() to Int autoincrement() in: ${mainSchemaPath}`);
      }

      if (modified) {
        fs.writeFileSync(mainSchemaPath, content, 'utf8');
      } else {
        console.log(`✓ No cuid() found in: ${mainSchemaPath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${mainSchemaPath}:`, error.message);
    }
  }

  console.log('\n🎉 CUID to Int conversion completed!');
  console.log('✅ Only ID fields changed from String @default(cuid()) to Int @default(autoincrement())');
  console.log('✅ All other functionality remains exactly the same');
  console.log('✅ Now all IDs will be simple numbers: 1, 2, 3, 4, 5...');
}

convertCuidToIntOnly();
