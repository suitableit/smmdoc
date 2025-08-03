const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files in dynamic directories
function findAllDynamicRoutes() {
  const pattern = 'app/**/\\[*\\]/**/route.ts';
  return glob.sync(pattern, { cwd: process.cwd() });
}

// Fix a single route file
function fixRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix params type in function signatures
  const functionRegex = /(export\s+async\s+function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^)]*,\s*)\{\s*params\s*\}:\s*\{\s*params:\s*\{([^}]+)\}\s*\}/g;

  let match;
  while ((match = functionRegex.exec(content)) !== null) {
    const replacement = `${match[1]}{ params }: { params: Promise<{${match[2]}}> }`;
    content = content.replace(match[0], replacement);
    modified = true;
  }

  // Fix params destructuring
  const destructureRegex = /const\s*\{\s*([^}]+)\s*\}\s*=\s*params;/g;
  if (destructureRegex.test(content)) {
    content = content.replace(destructureRegex, 'const { $1 } = await params;');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  Skipped: ${filePath}`);
    return false;
  }
}

// Main execution
console.log('🔍 Finding all dynamic route files...');
const routeFiles = findAllDynamicRoutes();

console.log(`📁 Found ${routeFiles.length} dynamic route files:`);
routeFiles.forEach(file => console.log(`   - ${file}`));

console.log('\n🔧 Fixing params types...');
let fixedCount = 0;
routeFiles.forEach(file => {
  if (fixRouteFile(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Completed! Fixed ${fixedCount} out of ${routeFiles.length} files.`);
