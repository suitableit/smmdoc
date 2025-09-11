// Test the sync API endpoint using curl
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testSync() {
  try {
    console.log('Testing sync API endpoint...');
    
    const curlCommand = `curl -X POST http://localhost:3000/api/admin/providers/sync -H "Content-Type: application/json" -d "{\"syncType\":\"all\",\"profitMargin\":20}" -w "\nHTTP_STATUS:%{http_code}\n" -s`;
    
    const { stdout, stderr } = await execPromise(curlCommand);
    
    if (stderr) {
      console.error('❌ Error:', stderr);
      return;
    }
    
    const lines = stdout.trim().split('\n');
    const statusLine = lines.find(line => line.startsWith('HTTP_STATUS:'));
    const status = statusLine ? statusLine.split(':')[1] : 'unknown';
    const responseBody = lines.filter(line => !line.startsWith('HTTP_STATUS:')).join('\n');
    
    console.log('Response Status:', status);
    console.log('Response Body:', responseBody);
    
    if (status === '401') {
      console.log('\n✅ Expected: Authentication required (this is correct behavior)');
    } else if (status === '200') {
      console.log('\n✅ Success: Sync completed successfully');
    } else {
       console.log('\n❌ Unexpected response status');
     }
     
   } catch (error) {
     console.error('❌ Error testing sync:', error.message);
   }
 }

testSync();