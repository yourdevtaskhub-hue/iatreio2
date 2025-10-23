// Script για debugging του webhook
const https = require('https');

// Test webhook endpoint
async function testWebhookEndpoint() {
  console.log('🔍 [DEBUG] Testing webhook endpoint...');
  
  const testData = {
    id: 'evt_test_debug',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_debug_123',
        object: 'checkout.session',
        amount_total: 13000,
        currency: 'eur',
        customer_email: 'test@example.com',
        metadata: {
          doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
          payment_id: 'test-payment-123',
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
    hostname: 'onlineparentteenclinic.netlify.app',
    port: 443,
    path: '/.netlify/functions/stripe-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'stripe-signature': 'test-signature' // Αυτό θα αποτύχει αλλά θα δούμε αν το endpoint λειτουργεί
    }
  };

  console.log('🔍 [DEBUG] Sending test webhook to:', `https://${options.hostname}${options.path}`);

  const req = https.request(options, (res) => {
    console.log(`📊 [DEBUG] Response Status: ${res.statusCode}`);
    console.log(`📊 [DEBUG] Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 [DEBUG] Response Body:`, data);
      
      if (res.statusCode === 200) {
        console.log('✅ [SUCCESS] Webhook endpoint is accessible');
      } else {
        console.log('❌ [ERROR] Webhook endpoint returned error');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ [ERROR] Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

// Test function
async function main() {
  console.log('🚀 [DEBUG] Starting webhook debugging...');
  console.log('🔍 [DEBUG] This will test if the webhook endpoint is accessible');
  
  await testWebhookEndpoint();
  
  console.log('\n📋 [DEBUG] Next steps:');
  console.log('1. Check Netlify Functions logs for stripe-webhook');
  console.log('2. Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('3. Check if webhook secret is correct');
}

main().catch(console.error);
