const fs = require('fs');
const path = require('path');

// List of files that might have ID conversion issues
const filesToCheck = [
  'app/api/user/services/favorite-status/route.ts',
  'app/api/user/services/favorites/route.ts',
  'app/api/user/services/route.ts',
  'app/api/user/orders/route.ts',
  'app/api/user/balance/route.ts',
  'app/api/transactions/route.ts',
  'app/api/admin/users/stats/route.ts',
  'lib/actions/getUser.ts'
];

function fixIdConversions() {
  console.log('🔧 Fixing remaining ID conversion issues...\n');

  filesToCheck.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Common patterns to fix
      const fixes = [
        // Fix userId parameter conversion
        {
          pattern: /const userId = searchParams\.get\('userId'\);/g,
          replacement: `const userIdParam = searchParams.get('userId');
  const userId = userIdParam ? parseInt(userIdParam) : null;`
        },
        // Fix where clauses with string IDs
        {
          pattern: /where: \{ userId \}/g,
          replacement: 'where: { userId: userId }'
        },
        // Fix session.user.id usage
        {
          pattern: /session\.user\.id/g,
          replacement: 'session.user.id'
        }
      ];

      fixes.forEach(fix => {
        if (fix.pattern.test(content)) {
          content = content.replace(fix.pattern, fix.replacement);
          modified = true;
        }
      });

      // Add validation for converted IDs
      if (content.includes('parseInt(userIdParam)') && !content.includes('isNaN(userId)')) {
        content = content.replace(
          'const userId = userIdParam ? parseInt(userIdParam) : null;',
          `const userId = userIdParam ? parseInt(userIdParam) : null;
  
  if (userIdParam && isNaN(userId)) {
    return NextResponse.json(
      { error: 'Invalid user ID format' },
      { status: 400 }
    );
  }`
        );
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
      } else {
        console.log(`✓ No changes needed: ${filePath}`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  });

  console.log('\n🎉 ID conversion fixes completed!');
}

// Run the fixes
fixIdConversions();
