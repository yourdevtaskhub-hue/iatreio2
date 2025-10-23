import { NextApiRequest, NextApiResponse } from 'next';
import { stripe } from '../../lib/stripe-server';
import { supabaseAdmin } from '../../lib/supabase';
import Stripe from 'stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    // Verify webhook signature
    const body = await getRawBody(req);
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);

  const {
    doctorId,
    doctorName,
    parentName,
    parentEmail,
    appointmentDate,
    appointmentTime,
    concerns
  } = session.metadata || {};

  if (!doctorId || !doctorName || !parentName || !parentEmail) {
    console.error('Missing required metadata in session');
    return;
  }

  try {
    // Create appointment in database
    const { error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        date: appointmentDate,
        time: appointmentTime,
        duration_minutes: 30,
        parent_name: parentName,
        email: parentEmail,
        concerns: concerns || '',
        specialty: 'Session',
        thematology: 'Session',
        urgency: 'routine',
        is_first_session: true
      });

    if (appointmentError) {
      console.error('Error creating appointment:', appointmentError);
      return;
    }

    // Create payment record
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_session_id: session.id,
        doctor_id: doctorId,
        doctor_name: doctorName,
        amount_cents: session.amount_total || 0,
        currency: session.currency || 'eur',
        status: 'completed',
        parent_name: parentName,
        parent_email: parentEmail,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      });

    if (paymentError) {
      console.error('Error creating payment record:', paymentError);
      return;
    }

    console.log('Successfully processed payment and created appointment');
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  // Additional logic if needed when payment is confirmed
}

// Helper function to get raw body
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}
