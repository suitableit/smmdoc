const fs = require('fs');
const glob = require('glob');

// Find all TypeScript/TSX files that might have ID issues
const files = glob.sync('app/**/*.{ts,tsx}', { cwd: process.cwd() });

console.log(`🔧 Fixing ID types in ${files.length} files...`);

let fixedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix string IDs to numeric IDs
  const fixes = [
    // Fix pt_ prefixed IDs (post tags)
    { pattern: /id: 'pt_\d+'/g, replacement: (match, offset, string) => {
      const num = match.match(/\d+/)[0];
      return `id: ${parseInt(num)}`;
    }},
    // Fix pc_ prefixed IDs (post categories) 
    { pattern: /id: 'pc_\d+'/g, replacement: (match, offset, string) => {
      const num = match.match(/\d+/)[0];
      return `id: ${parseInt(num)}`;
    }},
    // Fix comparisons with string IDs
    { pattern: /=== 'pt_\d+'/g, replacement: (match) => {
      const num = match.match(/\d+/)[0];
      return `=== ${parseInt(num)}`;
    }},
    { pattern: /!== 'pt_\d+'/g, replacement: (match) => {
      const num = match.match(/\d+/)[0];
      return `!== ${parseInt(num)}`;
    }},
    { pattern: /=== 'pc_\d+'/g, replacement: (match) => {
      const num = match.match(/\d+/)[0];
      return `=== ${parseInt(num)}`;
    }},
    { pattern: /!== 'pc_\d+'/g, replacement: (match) => {
      const num = match.match(/\d+/)[0];
      return `!== ${parseInt(num)}`;
    }},
  ];

  fixes.forEach(fix => {
    if (fix.pattern.test(content)) {
      content = content.replace(fix.pattern, fix.replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ID types in ${fixedCount} files!`);
