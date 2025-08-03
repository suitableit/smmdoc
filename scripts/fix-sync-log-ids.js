const fs = require('fs');

const filePath = 'app/(protected)/admin/services/sync-logs/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all string IDs with numeric IDs
let idCounter = 1;
content = content.replace(/id: 'log_\d+'/g, () => {
  return `id: ${idCounter++}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all sync log IDs in ${filePath}`);
