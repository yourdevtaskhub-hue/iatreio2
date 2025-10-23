// Script για δοκιμή Stripe CLI commands
const { exec } = require('child_process');

async function testStripeCLI() {
  console.log('🚀 [STRIPE CLI] Testing Stripe CLI commands...');
  console.log('');

  const commands = [
    {
      name: 'Stripe Login Status',
      command: 'stripe config --list',
      description: 'Check if Stripe CLI is logged in'
    },
    {
      name: 'Test Webhook Endpoint',
      command: 'stripe listen --forward-to https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook',
      description: 'Listen for webhook events and forward to endpoint'
    },
    {
      name: 'Trigger Test Event',
      command: 'stripe trigger checkout.session.completed',
      description: 'Trigger a test checkout.session.completed event'
    }
  ];

  for (const cmd of commands) {
    console.log(`🧪 [TEST] ${cmd.name}:`);
    console.log(`   Command: ${cmd.command}`);
    console.log(`   Description: ${cmd.description}`);
    console.log('');
  }

  console.log('📋 [MANUAL STEPS]:');
  console.log('1. Run: stripe listen --forward-to https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook');
  console.log('2. In another terminal, run: stripe trigger checkout.session.completed');
  console.log('3. Check Netlify Functions logs for stripe-webhook');
  console.log('4. Verify appointment creation in Supabase');
  console.log('');

  console.log('🎯 [EXPECTED RESULT]:');
  console.log('- Stripe CLI should forward events to Netlify Function');
  console.log('- Netlify Function should process the event');
  console.log('- Appointment should be created in database');
  console.log('- Slot should be locked for the time');
  console.log('');

  console.log('🔍 [DEBUGGING]:');
  console.log('- If webhook not received: Check URL in Stripe CLI');
  console.log('- If 404 error: Use .netlify.app domain');
  console.log('- If signature error: Check webhook secret');
  console.log('- If database error: Check Supabase connection');
}

testStripeCLI().catch(console.error);
