const fs = require('fs');

const filePath = 'app/(protected)/admin/services/import/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all string IDs with numeric IDs
let idCounter = 1;
content = content.replace(/id: 'cat_\d+'/g, () => {
  return `id: ${idCounter++}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all category IDs in ${filePath}`);
