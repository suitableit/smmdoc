const fs = require('fs');

const filePath = 'app/(protected)/admin/blogs/categories/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all string IDs with numeric IDs
let idCounter = 1;
content = content.replace(/id: 'pc_\d+'/g, () => {
  return `id: ${idCounter++}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all category IDs in ${filePath}`);
