// Netlify Function for Stripe Webhook
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SEsJ3AwY6mf2WfLrr3Tjc1Hbb6bR49JI9zC0HiHCGTkH8x8vsVlwwnhqIa2YcPKaIbu2yHq5TW8xHH7VY00wffc00XP4PZdP8', {
  apiVersion: '2024-06-20',
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vdrmgzoupwyisiyrnjdi.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ'
);

exports.handler = async (event, context) => {
  console.log('🚀 [WEBHOOK] ===== STRIPE WEBHOOK CALLED =====');
  console.log('🔍 [DEBUG] Stripe Webhook received:', event.httpMethod);
  console.log('🔍 [DEBUG] Event headers:', JSON.stringify(event.headers, null, 2));
  console.log('🔍 [DEBUG] Event body length:', event.body ? event.body.length : 0);
  console.log('🔍 [DEBUG] Context:', JSON.stringify(context, null, 2));
  console.log('🔍 [DEBUG] Full event:', JSON.stringify(event, null, 2));
  console.log('🔍 [DEBUG] Environment variables:');
  console.log('  - STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET');
  console.log('  - STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
  console.log('  - SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('  - SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET');
  console.log('🔍 [DEBUG] Request timestamp:', new Date().toISOString());
  console.log('🔍 [DEBUG] Request ID:', event.headers['x-nf-request-id'] || 'N/A');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ [ERROR] Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_0idYvHmURXcSL9x8zaYUnMjmXJ6a54Yc';

    console.log('🔍 [DEBUG] Verifying webhook signature...');
    console.log('🔍 [DEBUG] Signature:', sig);
    console.log('🔍 [DEBUG] Webhook secret:', webhookSecret ? 'SET' : 'NOT SET');
    console.log('🔍 [DEBUG] Event body type:', typeof event.body);
    console.log('🔍 [DEBUG] Event body preview:', event.body ? event.body.substring(0, 200) + '...' : 'NO BODY');

    let event_data;
    try {
      event_data = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
      console.log('✅ [SUCCESS] Webhook signature verified successfully');
    } catch (err) {
      console.error('❌ [ERROR] Webhook signature verification failed:', err.message);
      console.error('❌ [ERROR] Full error:', JSON.stringify(err, null, 2));
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      };
    }

    console.log('✅ [SUCCESS] Webhook signature verified. Event type:', event_data.type);

    // Handle the event
    switch (event_data.type) {
      case 'checkout.session.completed':
        console.log('🔍 [DEBUG] About to call handleCheckoutSessionCompleted...');
        await handleCheckoutSessionCompleted(event_data.data.object);
        console.log('🔍 [DEBUG] handleCheckoutSessionCompleted completed successfully');
        break;
      default:
        console.warn(`⚠️ [WARNING] Unhandled event type: ${event_data.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('❌ [ERROR] Webhook processing failed:', error);
    console.error('❌ [ERROR] Error stack:', error.stack);
    console.error('❌ [ERROR] Error message:', error.message);
    console.error('❌ [ERROR] Error name:', error.name);
    console.error('❌ [ERROR] Full error object:', JSON.stringify(error, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};

async function handleCheckoutSessionCompleted(session) {
  console.log('🔍 [DEBUG] Processing checkout session completed:', session.id);
  console.log('🔍 [DEBUG] Full session object:', JSON.stringify(session, null, 2));
  console.log('🔍 [DEBUG] Session metadata exists:', !!session.metadata);
  console.log('🔍 [DEBUG] Session customer_details exists:', !!session.customer_details);
  console.log('🔍 [DEBUG] Session customer_email exists:', !!session.customer_email);

  const {
    doctor_id,
    payment_id,
    parent_name,
    appointment_date,
    appointment_time,
    doctor_name,
    concerns,
    amount_cents
  } = session.metadata || {};

  // Get parent_email from multiple sources with fallback
  const parent_email = session.metadata?.parent_email || 
                      session.customer_details?.email || 
                      session.customer_email;

  console.log('🔍 [DEBUG] Session metadata:', {
    doctor_id,
    payment_id,
    parent_name,
    parent_email,
    appointment_date,
    appointment_time,
    doctor_name,
    concerns,
    amount_cents
  });

  console.log('🔍 [DEBUG] Email sources:', {
    'metadata.parent_email': session.metadata?.parent_email,
    'customer_details.email': session.customer_details?.email,
    'customer_email': session.customer_email,
    'final_parent_email': parent_email
  });

  // Validate required metadata
  if (!doctor_id || !payment_id || !parent_name || !parent_email || !appointment_date || !appointment_time) {
    console.error('❌ [ERROR] Missing required metadata in session');
    console.error('❌ [ERROR] Missing fields:', {
      doctor_id: !doctor_id,
      payment_id: !payment_id,
      parent_name: !parent_name,
      parent_email: !parent_email,
      appointment_date: !appointment_date,
      appointment_time: !appointment_time
    });
    throw new Error('Missing required metadata in session');
  }

  console.log('✅ [SUCCESS] All required metadata validated successfully');

  try {
    // Update payment status
    console.log('🔍 [DEBUG] Updating payment status...');
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_checkout_session_id: session.id,
      })
      .eq('id', payment_id);

    if (updatePaymentError) {
      console.error('❌ [ERROR] Error updating payment record:', updatePaymentError);
      throw updatePaymentError;
    }

    console.log('✅ [SUCCESS] Payment status updated');

    // Create appointment
    console.log('🔍 [DEBUG] Creating appointment...');
    console.log('🔍 [DEBUG] Appointment data:', {
      doctor_id,
      appointment_date,
      appointment_time,
      parent_name,
      parent_email,
      concerns,
      payment_id
    });

    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctor_id,
        date: appointment_date,
        time: appointment_time,
        duration_minutes: 30,
        parent_name: parent_name,
        email: parent_email,
        concerns: concerns || ''
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ [ERROR] Error creating appointment:', appointmentError);
      console.error('❌ [ERROR] Full error details:', JSON.stringify(appointmentError, null, 2));
      throw appointmentError;
    }

    console.log(`✅ [SUCCESS] Payment ${payment_id} and Appointment ${appointmentData.id} completed successfully.`);
    console.log('🔍 [DEBUG] Created appointment:', JSON.stringify(appointmentData, null, 2));
    console.log('🎉 [SUCCESS] ===== WEBHOOK PROCESSING COMPLETED SUCCESSFULLY =====');

  } catch (dbError) {
    console.error('❌ [ERROR] Database update failed for checkout.session.completed:', dbError);
    throw dbError;
  }
}
