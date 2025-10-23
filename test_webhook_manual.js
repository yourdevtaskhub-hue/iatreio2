// Manual test για το webhook endpoint
import https from 'https';

async function testWebhookManually() {
  console.log('🔍 [TEST] Testing webhook endpoint manually...');
  console.log('');

  // Test data που προσομοιώνει ένα πραγματικό Stripe event
  const testData = {
    id: 'evt_test_manual_debug',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_manual_debug',
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
          payment_id: 'test-payment-manual-debug',
          parent_name: 'Test Parent',
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
    hostname: 'onlineparentteenclinic.com',
    port: 443,
    path: '/.netlify/functions/stripe-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'stripe-signature': 'test-signature' // Αυτό θα αποτύχει αλλά θα δούμε αν το endpoint λειτουργεί
    }
  };

  console.log('🔍 [TEST] Sending test webhook to:', `https://${options.hostname}${options.path}`);
  console.log('🔍 [TEST] Test data:', JSON.stringify(testData, null, 2));
  console.log('');

  const req = https.request(options, (res) => {
    console.log(`📊 [TEST] Response Status: ${res.statusCode}`);
    console.log(`📊 [TEST] Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 [TEST] Response Body:`, data);
      console.log('');
      
      if (res.statusCode === 200) {
        console.log('✅ [SUCCESS] Webhook endpoint is accessible');
        console.log('🔍 [DEBUG] Check Netlify Functions logs for stripe-webhook');
      } else if (res.statusCode === 400) {
        console.log('⚠️ [WARNING] Webhook endpoint accessible but signature verification failed (expected)');
        console.log('🔍 [DEBUG] This is normal - the webhook is working but needs proper Stripe signature');
      } else {
        console.log('❌ [ERROR] Webhook endpoint returned error');
        console.log('🔍 [DEBUG] Check if the URL is correct in Stripe Dashboard');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ [ERROR] Request failed:', error.message);
    console.log('🔍 [DEBUG] Check if the domain is correct');
  });

  req.write(postData);
  req.end();
}

// Test function
async function main() {
  console.log('🚀 [DEBUG] Starting manual webhook test...');
  console.log('');
  
  await testWebhookManually();
  
  console.log('');
  console.log('📋 [NEXT STEPS]:');
  console.log('1. Check Netlify Functions logs for stripe-webhook');
  console.log('2. Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('3. Check if webhook secret is correct');
  console.log('4. Check if endpoint URL is correct');
  console.log('');
  console.log('🎯 [EXPECTED]:');
  console.log('- Status 200: Webhook endpoint is working');
  console.log('- Status 400: Webhook endpoint is working but signature verification failed (normal)');
  console.log('- Status 404: Webhook endpoint not found (check URL)');
  console.log('- Status 500: Webhook endpoint error (check logs)');
}

main().catch(console.error);
