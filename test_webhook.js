// Script για δοκιμή του webhook endpoint
const https = require('https');

// Test data για webhook
const testWebhookData = {
  id: 'evt_test_webhook',
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123456789',
      object: 'checkout.session',
      amount_total: 13000,
      currency: 'eur',
      customer_email: 'test@example.com',
      metadata: {
        doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
        payment_id: 'test-payment-id',
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

// Test function
async function testWebhook() {
  console.log('🔍 [TEST] Testing webhook endpoint...');
  
  const postData = JSON.stringify(testWebhookData);
  
  const options = {
    hostname: 'your-site.netlify.app', // Αλλάξε αυτό με το σωστό domain
    port: 443,
    path: '/.netlify/functions/stripe-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'stripe-signature': 'test-signature' // Αυτό θα αποτύχει αλλά θα δούμε αν το endpoint λειτουργεί
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📊 [TEST] Status: ${res.statusCode}`);
    console.log(`📊 [TEST] Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 [TEST] Response:`, data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ [TEST] Error:', error);
  });

  req.write(postData);
  req.end();
}

// Εκτέλεση test
testWebhook();
