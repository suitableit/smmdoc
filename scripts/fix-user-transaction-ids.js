const fs = require('fs');

const filePath = 'app/(protected)/transactions/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace transaction IDs with numbers
content = content.replace(/id: 'tx-(\d+)'/g, 'id: $1');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all transaction IDs in ${filePath}`);
