const fs = require('fs');
const glob = require('glob');

// Find all TSX files that might have form errors
const files = glob.sync('app/**/*.tsx', { cwd: process.cwd() });

console.log(`🔧 Fixing form error types in ${files.length} files...`);

let fixedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix form error message patterns
  const fixes = [
    // Fix basic form error messages
    {
      pattern: /\{form\.formState\.errors\.(\w+)\.message\}/g,
      replacement: '{form.formState.errors.$1.message as string}'
    },
    // Fix conditional form error messages
    {
      pattern: /\{form\.formState\.errors\.(\w+) && \(\s*<p[^>]*>\s*\{form\.formState\.errors\.\1\.message\}/g,
      replacement: '{form.formState.errors.$1?.message && (\n                <p className="text-red-500 dark:text-red-400 text-sm mt-1 transition-colors duration-200">\n                  {form.formState.errors.$1.message as string}'
    }
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

console.log(`\n🎉 Fixed form errors in ${fixedCount} files!`);
