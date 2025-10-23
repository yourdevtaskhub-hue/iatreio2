// Express Server for Stripe Integration
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vdrmgzoupwyisiyrnjdi.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'your-service-key-here'
);

app.use(cors());
app.use(express.json());

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { doctorId, doctorName, parentName, parentEmail, appointmentDate, appointmentTime, concerns, amountCents, priceId } = req.body;

    console.log('🔍 [DEBUG] Creating Stripe Checkout Session...', {
      doctorId, doctorName, parentName, parentEmail, appointmentDate, appointmentTime, amountCents, priceId
    });

    // Create payment record in database
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
      throw new Error(`Failed to create pending payment record: ${paymentError?.message || 'Unknown error'}`);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentData.id}`,
      cancel_url: `${req.headers.origin}/contact?status=cancelled`,
      customer_email: parentEmail,
      metadata: {
        doctor_id: doctorId,
        payment_id: paymentData.id,
        parent_name: parentName,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        doctor_name: doctorName,
        concerns: concerns,
        amount_cents: amountCents.toString(),
      },
    });

    console.log('✅ [SUCCESS] Stripe Checkout Session created:', session.id);

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('❌ [ERROR] Stripe Checkout Session creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe Webhook Event Received:', event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSession = event.data.object;
      console.log('Checkout Session Completed:', checkoutSession.id);

      const { doctor_id, payment_id, parent_name, parent_email, appointment_date, appointment_time, doctor_name, concerns, amount_cents } = checkoutSession.metadata || {};

      try {
        // Update payment status
        const { error: updatePaymentError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            stripe_checkout_session_id: checkoutSession.id,
          })
          .eq('id', payment_id);

        if (updatePaymentError) {
          console.error('Error updating payment record:', updatePaymentError);
          throw updatePaymentError;
        }

        // Create appointment
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .insert({
            doctor_id: doctor_id,
            date: appointment_date,
            time: appointment_time,
            duration_minutes: 30,
            parent_name: parent_name,
            email: parent_email,
            concerns: concerns,
            payment_status: 'completed',
          })
          .select()
          .single();

        if (appointmentError) {
          console.error('Error creating appointment:', appointmentError);
          throw appointmentError;
        }

        console.log(`Payment ${payment_id} and Appointment ${appointmentData.id} completed successfully.`);

      } catch (dbError) {
        console.error('Database update failed for checkout.session.completed:', dbError);
        return res.status(500).json({ error: 'Database update failed' });
      }
      break;

    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
