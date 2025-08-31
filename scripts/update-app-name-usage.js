const fs = require('fs');
const path = require('path');

// Files that need to be updated (from the search results)
const filesToUpdate = [
  'app/(protected)/admin/users/logs/page.tsx',
  'app/(protected)/admin/settings/providers/page.tsx',
  'app/(protected)/admin/settings/custom-codes/page.tsx',
  'app/(protected)/services/favorite-services/page.tsx',
  'app/(protected)/affiliate/activate/page.tsx',
  'app/(protected)/transfer-funds/page.tsx',
  'app/(protected)/support-tickets/[id]/page.tsx',
  'app/(protected)/admin/services/bulk-modify/page.tsx',
  'app/(protected)/admin/settings/integrations/page.tsx',
  'app/(protected)/admin/services/update-price/page.tsx',
  'app/(protected)/admin/tickets/page.tsx',
  'app/(protected)/admin/users/moderators/page.tsx',
  'app/(protected)/child-panel/page.tsx',
  'app/(protected)/contact-support/page.tsx',
  'app/(protected)/admin/services/sync-logs/page.tsx',
  'app/(protected)/admin/blogs/new-post/page.tsx',
  'app/(protected)/my-orders/page.tsx',
  'app/(protected)/admin/blogs/tags/page.tsx',
  'app/(protected)/admin/contact-messages/page.tsx',
  'app/(protected)/services/updates/page.tsx',
  'app/(protected)/terms/page.tsx',
  'app/(protected)/new-order/page.tsx',
  'app/(protected)/admin/orders/refill-requests/page.tsx',
  'app/(protected)/admin/settings/notifications/page.tsx',
  'app/(protected)/transactions/page.tsx',
  'app/(protected)/affiliate/page.tsx',
  'app/(protected)/add-funds/addFunds.tsx',
  'app/(protected)/admin/blogs/categories/page.tsx',
  'app/(protected)/admin/affiliates/page.tsx',
  'app/(protected)/admin/orders/cancel-requests/page.tsx',
  'app/(protected)/affiliate/payment-methods/page.tsx',
  'app/(protected)/support-tickets/page.tsx',
  'app/(protected)/admin/tickets/[id]/page.tsx',
  'app/(protected)/mass-orders/page.tsx',
  'app/(protected)/admin/users/page.tsx',
  'app/(protected)/support-tickets/history/page.tsx',
  'app/(protected)/admin/contact-messages/[id]/page.tsx',
  'app/(protected)/admin/page.tsx',
  'app/(protected)/admin/transactions/page.tsx',
  'app/(protected)/admin/blogs/page.tsx',
  'app/(protected)/admin/blogs/[id]/page.tsx',
  'app/(protected)/admin/orders/page.tsx',
  'app/(protected)/faqs/page.tsx',
  'app/(protected)/admin/settings/email/page.tsx',
  'app/(protected)/admin/services/types/page.tsx',
  'app/(protected)/account-settings/page.tsx',
  'app/payment/pending/page.tsx',
  'app/(protected)/admin/services/import/page.tsx',
  'app/(protected)/api/page.tsx',
  'app/(protected)/services/page.tsx',
  'app/(protected)/admin/services/page.tsx',
  'app/(protected)/admin/announcements/page.tsx',
  'app/(protected)/admin/settings/currency/page.tsx',
  'app/(protected)/admin/users/admins/page.tsx',
  'app/payment/success/page.tsx',
  'app/(protected)/admin/child-panels/page.tsx'
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Check if file already uses the new pattern
  if (content.includes('useAppNameWithFallback') || content.includes('setPageTitle')) {
    console.log(`File already updated: ${filePath}`);
    return;
  }

  // Add imports if APP_NAME is imported
  if (content.includes("import { APP_NAME }")) {
    content = content.replace(
      /import { APP_NAME } from '@\/lib\/constants';/,
      "import { useAppNameWithFallback } from '@/contexts/AppNameContext';\nimport { setPageTitle } from '@/lib/utils/set-page-title';"
    );
    modified = true;
  } else if (content.includes("from '@/lib/constants'")) {
    // Handle cases where APP_NAME is imported with other constants
    content = content.replace(
      /(import {[^}]*), APP_NAME([^}]*} from '@\/lib\/constants';)/,
      "$1$2\nimport { useAppNameWithFallback } from '@/contexts/AppNameContext';\nimport { setPageTitle } from '@/lib/utils/set-page-title';"
    );
    modified = true;
  }

  // Find and replace document.title patterns
  const titleRegex = /document\.title = `([^`]+) — \$\{APP_NAME\}`;/g;
  let match;
  const replacements = [];
  
  while ((match = titleRegex.exec(content)) !== null) {
    const pageTitle = match[1];
    replacements.push({
      original: match[0],
      pageTitle: pageTitle
    });
  }

  if (replacements.length > 0) {
    // Add useAppNameWithFallback hook
    const componentMatch = content.match(/(const \w+Page = \(\) => {|export default function \w+\(\) {)/)
    if (componentMatch) {
      const insertPoint = content.indexOf(componentMatch[0]) + componentMatch[0].length;
      content = content.slice(0, insertPoint) + 
        "\n  const { appName } = useAppNameWithFallback();\n" +
        content.slice(insertPoint);
      modified = true;
    }

    // Replace document.title assignments
    replacements.forEach(replacement => {
      const newCode = `setPageTitle('${replacement.pageTitle}', appName);`;
      content = content.replace(replacement.original, newCode);
      modified = true;
    });
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Update all files
console.log('Starting batch update of APP_NAME usage...');
filesToUpdate.forEach(updateFile);
console.log('Batch update completed!');