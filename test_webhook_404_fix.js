// Script για δοκιμή του webhook endpoint με 404 fix
import https from 'https';

async function testWebhookEndpoints() {
  console.log('🔍 [TEST] Testing webhook endpoints for 404 fix...');
  console.log('');

  const endpoints = [
    {
      name: 'Netlify App (.netlify.app)',
      hostname: 'onlineparentteenclinic.netlify.app',
      path: '/.netlify/functions/stripe-webhook'
    },
    {
      name: 'Custom Domain (.com)',
      hostname: 'onlineparentteenclinic.com',
      path: '/.netlify/functions/stripe-webhook'
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`🧪 [TEST] Testing ${endpoint.name}:`);
    console.log(`   URL: https://${endpoint.hostname}${endpoint.path}`);
    
    await testEndpoint(endpoint);
    console.log('');
  }
}

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const testData = {
      id: 'evt_test_404_fix',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_404_fix',
          object: 'checkout.session',
          metadata: {
            doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
            payment_id: 'test-payment-404-fix',
            parent_name: 'Test Parent',
            parent_email: 'test@example.com',
            appointment_date: '2025-10-31',
            appointment_time: '09:00',
            doctor_name: 'Dr. Test Doctor',
            concerns: 'Test concerns',
            amount_cents: '13000'
          }
        }
      }
    };

    const postData = JSON.stringify(testData);
    
    const options = {
      hostname: endpoint.hostname,
      port: 443,
      path: endpoint.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'stripe-signature': 'test-signature'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`   📊 Status: ${res.statusCode}`);
      console.log(`   📊 Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   📊 Response: ${data.substring(0, 200)}...`);
        
        if (res.statusCode === 200) {
          console.log('   ✅ [SUCCESS] Endpoint is accessible');
        } else if (res.statusCode === 400) {
          console.log('   ⚠️ [WARNING] Endpoint accessible but signature verification failed (expected)');
        } else if (res.statusCode === 404) {
          console.log('   ❌ [ERROR] Endpoint not found (404)');
        } else {
          console.log(`   ❌ [ERROR] Endpoint returned ${res.statusCode}`);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ [ERROR] Request failed: ${error.message}`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Test function
async function main() {
  console.log('🚀 [DEBUG] Starting webhook 404 fix test...');
  console.log('');
  
  await testWebhookEndpoints();
  
  console.log('📋 [ANALYSIS]:');
  console.log('1. If .netlify.app returns 200/400: Use .netlify.app in Stripe Dashboard');
  console.log('2. If .com returns 200/400: Use .com in Stripe Dashboard');
  console.log('3. If both return 404: Check Netlify Functions deployment');
  console.log('');
  console.log('🎯 [EXPECTED RESULT]:');
  console.log('- One endpoint should return 200 or 400 (working)');
  console.log('- The other might return 404 (not working)');
  console.log('- Use the working endpoint in Stripe Dashboard');
}

main().catch(console.error);
