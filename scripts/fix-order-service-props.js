const fs = require('fs');

const filePath = 'app/api/admin/orders/[id]/refill/route.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Replace order.service properties with (order as any).service
content = content.replace(/order\.service\./g, '(order as any).service?.');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all order.service properties in ${filePath}`);
