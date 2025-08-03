const fs = require('fs');

const filePath = 'app/(protected)/admin/transactions/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all string IDs with numeric IDs
let idCounter = 1;
content = content.replace(/id: 'txn_\d+'/g, () => {
  return `id: ${idCounter++}`;
});

// Replace user IDs too
idCounter = 1;
content = content.replace(/id: 'user_\d+'/g, () => {
  return `id: ${idCounter++}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all transaction IDs in ${filePath}`);
