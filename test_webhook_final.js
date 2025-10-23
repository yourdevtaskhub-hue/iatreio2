// Final webhook test with correct column names
import https from 'https';

async function testWebhookFinal() {
  console.log('🚀 [FINAL TEST] Testing webhook with correct column names...');
  console.log('');

  // Test data με σωστά column names
  const testData = {
    id: 'evt_test_final',
    object: 'event',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_final',
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
          payment_id: 'test-payment-final',
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
      'stripe-signature': 'test-signature'
    }
  };

  console.log('🔍 [TEST] Sending to:', `https://${options.hostname}${options.path}`);
  console.log('🔍 [TEST] Test data:', JSON.stringify(testData, null, 2));
  console.log('');

  const req = https.request(options, (res) => {
    console.log(`📊 [RESULT] Status: ${res.statusCode}`);
    console.log(`📊 [RESULT] Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 [RESULT] Response: ${data}`);
      console.log('');
      
      if (res.statusCode === 200) {
        console.log('✅ [SUCCESS] Webhook endpoint is working perfectly');
        console.log('🔍 [DEBUG] Check Netlify Functions logs for stripe-webhook');
      } else if (res.statusCode === 400) {
        console.log('⚠️ [WARNING] Webhook endpoint accessible but signature verification failed (expected)');
        console.log('🔍 [DEBUG] This is normal - the webhook is working but needs proper Stripe signature');
      } else if (res.statusCode === 500) {
        console.log('❌ [ERROR] Webhook endpoint error - check Netlify logs');
        console.log('🔍 [DEBUG] Check Netlify Functions logs for detailed error information');
      } else {
        console.log(`❌ [ERROR] Webhook endpoint returned ${res.statusCode}`);
        console.log('🔍 [DEBUG] Check if the URL is correct');
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
  console.log('🚀 [DEBUG] Starting final webhook test...');
  console.log('');
  
  await testWebhookFinal();
  
  console.log('');
  console.log('📋 [NEXT STEPS]:');
  console.log('1. Check Netlify Functions logs for stripe-webhook');
  console.log('2. Check Supabase logs for appointment creation');
  console.log('3. Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('4. Test with real Stripe events');
  console.log('');
  console.log('🎯 [EXPECTED RESULTS]:');
  console.log('- Status 200: Webhook endpoint is working perfectly');
  console.log('- Status 400: Webhook endpoint is working but signature verification failed (normal for test)');
  console.log('- Status 500: Webhook endpoint error (check Netlify logs)');
  console.log('- Status 404: Webhook endpoint not found (check URL)');
  console.log('');
  console.log('🔍 [DEBUGGING]:');
  console.log('- Check Netlify Functions logs for detailed error information');
  console.log('- Check Supabase logs for database errors');
  console.log('- Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('- Check if webhook secret is correct');
  console.log('- Check if endpoint URL is correct');
}

main().catch(console.error);
