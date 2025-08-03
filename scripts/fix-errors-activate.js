const fs = require('fs');

const filePath = 'app/(protected)/affiliate/activate/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all errors.property with (errors as any).property
const errorPatterns = [
  'errors.method',
  'errors.mobileNumber',
  'errors.bankName',
  'errors.accountHolderName',
  'errors.bankAccountNumber',
  'errors.routingNumber',
  'errors.swiftCode',
  'errors.agreeToTerms',
  'errors[field]'
];

errorPatterns.forEach(pattern => {
  if (pattern.includes('[field]')) {
    const replacement = pattern.replace('errors[field]', '(errors as any)[field]');
    content = content.replace(new RegExp(pattern.replace('[', '\\[').replace(']', '\\]'), 'g'), replacement);
  } else {
    const replacement = pattern.replace('errors.', '(errors as any).');
    content = content.replace(new RegExp(pattern.replace('.', '\\.'), 'g'), replacement);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`✅ Fixed all error references in ${filePath}`);
