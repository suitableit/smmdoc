const fs = require('fs');
const path = require('path');

// Function to recursively find all route.ts files in [id] directories
function findDynamicRoutes(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Check if directory name contains brackets (dynamic route)
        if (item.includes('[') && item.includes(']')) {
          const routeFile = path.join(fullPath, 'route.ts');
          if (fs.existsSync(routeFile)) {
            files.push(routeFile);
          }
        }
        traverse(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Function to fix params type in route files
function fixParamsType(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix all HTTP method params type declarations
  const methodRegex = /(export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*[^,]*,\s*)\{\s*params\s*\}:\s*\{\s*params:\s*\{\s*([^}]+)\s*\}\s*\}/g;
  if (methodRegex.test(content)) {
    content = content.replace(methodRegex, '$1{ params }: { params: Promise<{ $3 }> }');
    modified = true;
  }

  // Fix params destructuring
  const paramDestructureRegex = /const\s*\{\s*([^}]+)\s*\}\s*=\s*params;/g;
  if (paramDestructureRegex.test(content)) {
    content = content.replace(paramDestructureRegex, 'const { $1 } = await params;');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
  } else {
    console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
  }
}

// Main execution
const appDir = path.join(__dirname, '..', 'app');
const dynamicRoutes = findDynamicRoutes(appDir);

console.log(`Found ${dynamicRoutes.length} dynamic route files:`);
dynamicRoutes.forEach(route => console.log(`  - ${route}`));

console.log('\nFixing params types...');
dynamicRoutes.forEach(fixParamsType);

console.log('\n🎉 Dynamic routes fix completed!');
