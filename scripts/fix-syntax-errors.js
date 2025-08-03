const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all route.ts files
function findAllRouteFiles() {
  return glob.sync('app/**/route.ts', { cwd: process.cwd() });
}

// Fix syntax errors in route files
function fixSyntaxErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix missing closing bracket in Promise type
  const brokenPromiseRegex = /Promise<\{\s*([^}]+)\s*>\s*}/g;
  if (brokenPromiseRegex.test(content)) {
    content = content.replace(brokenPromiseRegex, 'Promise<{ $1 }>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed syntax in: ${filePath}`);
    return true;
  }
  return false;
}

// Main execution
console.log('🔍 Finding all route files...');
const routeFiles = findAllRouteFiles();

console.log(`📁 Found ${routeFiles.length} route files`);

console.log('\n🔧 Fixing syntax errors...');
let fixedCount = 0;
routeFiles.forEach(file => {
  if (fixSyntaxErrors(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed syntax errors in ${fixedCount} files.`);
