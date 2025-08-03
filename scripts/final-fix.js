const fs = require('fs');
const glob = require('glob');

// Find all route.ts files
const routeFiles = glob.sync('app/**/route.ts', { cwd: process.cwd() });

console.log(`🔧 Fixing ${routeFiles.length} route files...`);

let fixedCount = 0;

routeFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix broken Promise types
  const fixes = [
    // Fix missing closing bracket and brace
    [/\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*([^}]+)\s*>\s*$/gm, '{ params }: { params: Promise<{ $1 }> }'],
    [/\{\s*params\s*\}:\s*\{\s*params:\s*Promise<\{\s*([^}]+)\s*\}>\s*$/gm, '{ params }: { params: Promise<{ $1 }> }'],
    [/Promise<\{\s*([^}]+)\s*>\s*$/gm, 'Promise<{ $1 }>'],
    [/Promise<\{\s*([^}]+)\s*\}>\s*$/gm, 'Promise<{ $1 }>'],
  ];

  fixes.forEach(([regex, replacement]) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files!`);
