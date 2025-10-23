// Script για δοκιμή πραγματικού Stripe webhook
import https from 'https';

async function testRealStripeWebhook() {
  console.log('🚀 [REAL STRIPE TEST] Testing with real Stripe webhook data...');
  console.log('');

  // Πραγματικό Stripe event data από τα logs
  const realStripeEvent = {
    id: 'evt_1SLDMWAwY6mf2WfL05TKZ574',
    object: 'event',
    api_version: '2025-09-30.clover',
    created: 1761183044,
    data: {
      object: {
        id: 'cs_test_a1KRb7lY8skicRS8Ed0nk1x9LBDaQfSkG6oV2ILb7sgOKPQFlJVBi3YxVt',
        object: 'checkout.session',
        amount_subtotal: 13000,
        amount_total: 13000,
        currency: 'eur',
        customer_email: 'xsiwzos@gmail.com',
        customer_details: {
          address: {
            city: null,
            country: 'GR',
            line1: null,
            line2: null,
            postal_code: null,
            state: null
          },
          business_name: null,
          email: 'xsiwzos@gmail.com',
          individual_name: null,
          name: 'fffeeew',
          phone: null,
          tax_exempt: 'none',
          tax_ids: []
        },
        metadata: {
          concerns: '',
          parent_name: 'ffff',
          payment_id: 'e0a5edbd-a9d7-44d7-b1ca-ed99bbf5926e',
          doctor_id: '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
          appointment_time: '09:00',
          amount_cents: '13000',
          appointment_date: '2025-10-31',
          doctor_name: 'Dr. Άννα Μαρία Φύτρου'
        },
        mode: 'payment',
        payment_intent: 'pi_3SLDMVAwY6mf2WfL0mcdPC6F',
        payment_method_types: ['card'],
        payment_status: 'paid',
        status: 'complete',
        success_url: 'https://perentteenonlineclinic.com/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=e0a5edbd-a9d7-44d7-b1ca-ed99bbf5926e',
        total_details: {
          amount_discount: 0,
          amount_shipping: 0,
          amount_tax: 0
        }
      }
    },
    livemode: false,
    pending_webhooks: 2,
    request: {
      id: null,
      idempotency_key: null
    },
    type: 'checkout.session.completed'
  };

  const postData = JSON.stringify(realStripeEvent);
  
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

  console.log('🔍 [TEST] Sending real Stripe event to:', `https://${options.hostname}${options.path}`);
  console.log('🔍 [TEST] Event ID:', realStripeEvent.id);
  console.log('🔍 [TEST] Session ID:', realStripeEvent.data.object.id);
  console.log('🔍 [TEST] Customer Email:', realStripeEvent.data.object.customer_email);
  console.log('🔍 [TEST] Payment Status:', realStripeEvent.data.object.payment_status);
  console.log('🔍 [TEST] Metadata:', JSON.stringify(realStripeEvent.data.object.metadata, null, 2));
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
  console.log('🚀 [DEBUG] Starting real Stripe webhook test...');
  console.log('');
  
  await testRealStripeWebhook();
  
  console.log('');
  console.log('📋 [NEXT STEPS]:');
  console.log('1. Check Netlify Functions logs for stripe-webhook');
  console.log('2. Verify Stripe webhook configuration in Stripe Dashboard');
  console.log('3. Check if webhook secret is correct');
  console.log('4. Check if endpoint URL is correct');
  console.log('5. Test with real Stripe events');
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
