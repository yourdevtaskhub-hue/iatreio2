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
  console.log('🔍 [DEBUG] Stripe Webhook received:', event.httpMethod);
  console.log('🔍 [DEBUG] Event headers:', JSON.stringify(event.headers, null, 2));
  console.log('🔍 [DEBUG] Event body length:', event.body ? event.body.length : 0);
  console.log('🔍 [DEBUG] Full event:', JSON.stringify(event, null, 2));

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
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_7j2pwxIom2pTU84KLRUi0UqQln5IctLf';

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
        await handleCheckoutSessionCompleted(event_data.data.object);
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};

async function handleCheckoutSessionCompleted(session) {
  console.log('🔍 [DEBUG] Processing checkout session completed:', session.id);
  console.log('🔍 [DEBUG] Full session object:', JSON.stringify(session, null, 2));

  const {
    doctor_id,
    payment_id,
    parent_name,
    parent_email,
    appointment_date,
    appointment_time,
    doctor_name,
    concerns,
    amount_cents
  } = session.metadata || {};

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

  // Validate required metadata
  if (!doctor_id || !payment_id || !parent_name || !parent_email || !appointment_date || !appointment_time) {
    console.error('❌ [ERROR] Missing required metadata in session');
    throw new Error('Missing required metadata in session');
  }

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
        concerns: concerns || '',
        payment_id: payment_id
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

  } catch (dbError) {
    console.error('❌ [ERROR] Database update failed for checkout.session.completed:', dbError);
    throw dbError;
  }
}
