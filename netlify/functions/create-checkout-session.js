// Netlify Function for Stripe Checkout Session Creation
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
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    console.log('🔍 [DEBUG] Netlify Function: Creating Stripe Checkout Session...');
    
    const body = JSON.parse(event.body);
    const { 
      doctorId, 
      doctorName, 
      parentName, 
      parentEmail, 
      appointmentDate, 
      appointmentTime, 
      concerns, 
      amountCents, 
      priceId 
    } = body;

    console.log('🔍 [DEBUG] Request data:', {
      doctorId, 
      doctorName, 
      parentName, 
      parentEmail, 
      appointmentDate, 
      appointmentTime, 
      amountCents, 
      priceId
    });

    // Validate required fields
    if (!doctorId || !doctorName || !parentName || !parentEmail || !appointmentDate || !appointmentTime || !amountCents || !priceId) {
      console.error('❌ [ERROR] Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields for checkout session.' }),
      };
    }

    // Create payment record in database
    console.log('🔍 [DEBUG] Creating payment record in database...');
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        doctor_id: doctorId,
        amount_cents: amountCents,
        currency: 'eur',
        status: 'pending',
        customer_email: parentEmail,
        parent_name: parentName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_name: doctorName,
      })
      .select()
      .single();

    if (paymentError || !paymentData) {
      console.error('❌ [ERROR] Failed to create payment record:', paymentError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `Failed to create pending payment record: ${paymentError?.message || 'Unknown error'}` 
        }),
      };
    }

    console.log('✅ [SUCCESS] Payment record created:', paymentData.id);

    // Create Stripe Checkout Session
    console.log('🔍 [DEBUG] Creating Stripe Checkout Session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${event.headers.origin || 'https://your-site.netlify.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentData.id}`,
      cancel_url: `${event.headers.origin || 'https://your-site.netlify.app'}/contact?status=cancelled`,
      customer_email: parentEmail,
      metadata: {
        doctor_id: doctorId,
        payment_id: paymentData.id,
        parent_name: parentName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_name: doctorName,
        concerns: concerns || '',
        amount_cents: amountCents.toString(),
      },
    });

    console.log('✅ [SUCCESS] Stripe Checkout Session created:', session.id);
    console.log('🔍 [DEBUG] Session URL:', session.url);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        sessionId: session.id,
        checkoutUrl: session.url 
      }),
    };

  } catch (error) {
    console.error('❌ [ERROR] Stripe Checkout Session creation failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
