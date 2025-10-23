// Comprehensive webhook test script
import https from 'https';

async function testWebhookComprehensive() {
  console.log('🚀 [COMPREHENSIVE TEST] Starting comprehensive webhook testing...');
  console.log('');

  const tests = [
    {
      name: 'Test 1: Basic Webhook Endpoint',
      description: 'Test if webhook endpoint is accessible',
      testData: {
        id: 'evt_test_basic',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_basic',
            object: 'checkout.session',
            amount_total: 13000,
            currency: 'eur',
            customer_email: 'test@example.com',
            metadata: {
              doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
              payment_id: 'test-payment-basic',
              parent_name: 'Test Parent',
              appointment_date: '2025-10-31',
              appointment_time: '09:00',
              doctor_name: 'Dr. Test Doctor',
              concerns: 'Test concerns',
              amount_cents: '13000'
            }
          }
        }
      }
    },
    {
      name: 'Test 2: Missing Parent Email',
      description: 'Test webhook with missing parent_email in metadata',
      testData: {
        id: 'evt_test_missing_email',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_missing_email',
            object: 'checkout.session',
            amount_total: 13000,
            currency: 'eur',
            customer_email: 'test@example.com',
            customer_details: {
              email: 'test@example.com',
              name: 'Test Parent'
            },
            metadata: {
              doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
              payment_id: 'test-payment-missing-email',
              parent_name: 'Test Parent',
              appointment_date: '2025-10-31',
              appointment_time: '09:00',
              doctor_name: 'Dr. Test Doctor',
              concerns: 'Test concerns',
              amount_cents: '13000'
            }
          }
        }
      }
    },
    {
      name: 'Test 3: Complete Session Data',
      description: 'Test webhook with complete session data',
      testData: {
        id: 'evt_test_complete',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_complete',
            object: 'checkout.session',
            amount_total: 13000,
            currency: 'eur',
            customer_email: 'test@example.com',
            customer_details: {
              email: 'test@example.com',
              name: 'Test Parent'
            },
            metadata: {
              doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
              payment_id: 'test-payment-complete',
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
      }
    }
  ];

  for (const test of tests) {
    console.log(`🧪 [TEST] ${test.name}`);
    console.log(`📝 [DESCRIPTION] ${test.description}`);
    console.log('');
    
    await runTest(test);
    console.log('');
  }

  console.log('📋 [SUMMARY] All tests completed');
  console.log('');
  console.log('🎯 [NEXT STEPS]:');
  console.log('1. Check Netlify Functions logs for stripe-webhook');
  console.log('2. Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('3. Check if webhook secret is correct');
  console.log('4. Check if endpoint URL is correct');
  console.log('5. Test with real Stripe events');
}

async function runTest(test) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(test.testData);
    
    const options = {
      hostname: 'onlineparentteenclinic.com',
      port: 443,
      path: '/.netlify/functions/stripe-webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'stripe-signature': 'test-signature'
      }
    };

    console.log(`🔍 [TEST] Sending to: https://${options.hostname}${options.path}`);
    console.log(`🔍 [TEST] Test data: ${JSON.stringify(test.testData, null, 2)}`);
    
    const req = https.request(options, (res) => {
      console.log(`📊 [RESULT] Status: ${res.statusCode}`);
      console.log(`📊 [RESULT] Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 [RESULT] Response: ${data}`);
        
        if (res.statusCode === 200) {
          console.log('✅ [SUCCESS] Webhook endpoint is accessible');
        } else if (res.statusCode === 400) {
          console.log('⚠️ [WARNING] Webhook endpoint accessible but signature verification failed (expected)');
        } else if (res.statusCode === 500) {
          console.log('❌ [ERROR] Webhook endpoint error - check logs');
        } else {
          console.log(`❌ [ERROR] Webhook endpoint returned ${res.statusCode}`);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ [ERROR] Request failed: ${error.message}`);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

// Test function
async function main() {
  console.log('🚀 [DEBUG] Starting comprehensive webhook testing...');
  console.log('');
  
  await testWebhookComprehensive();
  
  console.log('');
  console.log('🎯 [EXPECTED RESULTS]:');
  console.log('- Status 200: Webhook endpoint is working perfectly');
  console.log('- Status 400: Webhook endpoint is working but signature verification failed (normal for test)');
  console.log('- Status 500: Webhook endpoint error (check Netlify logs)');
  console.log('- Status 404: Webhook endpoint not found (check URL)');
  console.log('');
  console.log('🔍 [DEBUGGING]:');
  console.log('- Check Netlify Functions logs for detailed error information');
  console.log('- Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('- Check if webhook secret is correct');
  console.log('- Check if endpoint URL is correct');
}

main().catch(console.error);
