const fs = require('fs');

const filePath = 'app/(protected)/transactions/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace invoice IDs with numbers
content = content.replace(/invoice_id: 'INV-(\d+)'/g, 'invoice_id: $1');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all invoice IDs in ${filePath}`);
