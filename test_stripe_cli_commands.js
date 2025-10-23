// Script για δοκιμή Stripe CLI commands
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testStripeCLICommands() {
  console.log('🚀 [STRIPE CLI TEST] Testing Stripe CLI commands...');
  console.log('');

  const commands = [
    {
      name: 'Stripe CLI Version',
      command: 'stripe --version',
      description: 'Check Stripe CLI version'
    },
    {
      name: 'Stripe Login Status',
      command: 'stripe config --list',
      description: 'Check if Stripe CLI is logged in'
    },
    {
      name: 'Test Webhook Endpoint',
      command: 'stripe listen --forward-to https://onlineparentteenclinic.com/.netlify/functions/stripe-webhook',
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
    console.log(`📝 [DESCRIPTION] ${cmd.description}`);
    console.log(`🔍 [COMMAND] ${cmd.command}`);
    console.log('');
    
    try {
      const { stdout, stderr } = await execAsync(cmd.command, { timeout: 10000 });
      console.log(`✅ [SUCCESS] Command executed successfully`);
      console.log(`📊 [OUTPUT] ${stdout}`);
      if (stderr) {
        console.log(`⚠️ [WARNING] ${stderr}`);
      }
    } catch (error) {
      console.log(`❌ [ERROR] Command failed: ${error.message}`);
      if (error.stdout) {
        console.log(`📊 [STDOUT] ${error.stdout}`);
      }
      if (error.stderr) {
        console.log(`📊 [STDERR] ${error.stderr}`);
      }
    }
    console.log('');
  }

  console.log('📋 [MANUAL STEPS]:');
  console.log('1. Run: stripe listen --forward-to https://onlineparentteenclinic.com/.netlify/functions/stripe-webhook');
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
  console.log('- If 404 error: Use .com domain');
  console.log('- If signature error: Check webhook secret');
  console.log('- If database error: Check Supabase connection');
}

testStripeCLICommands().catch(console.error);
