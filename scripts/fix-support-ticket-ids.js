const fs = require('fs');

const filePath = 'app/(protected)/support-tickets/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all string IDs with number IDs
content = content.replace(/id: '(\d+)'/g, 'id: $1');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all ticket IDs in ${filePath}`);
