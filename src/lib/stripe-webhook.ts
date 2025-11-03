import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const stripeSecretKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !stripeSecretKey) {
  throw new Error('Missing environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

export async function handleStripeWebhook(event: any) {
  console.log('🔍 [WEBHOOK] Processing Stripe event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      default:
        console.log(`⚠️ [WEBHOOK] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ [WEBHOOK] Error processing event:', error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log('✅ [WEBHOOK] Checkout session completed:', session.id);
  
  try {
    // Find the payment record by session ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_checkout_session_id', session.id)
      .single();

    if (paymentError || !payment) {
      console.error('❌ [WEBHOOK] Payment not found:', paymentError);
      return;
    }

    console.log('🔍 [WEBHOOK] Found payment record:', payment.id);

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ [WEBHOOK] Failed to update payment:', updateError);
      return;
    }

    console.log('✅ [WEBHOOK] Payment status updated to completed');

    // Detect deposit purchase via concerns marker or empty appointment fields
    const isDeposit = !payment.appointment_date && !payment.appointment_time
      || (typeof session?.metadata?.concerns === 'string' && session.metadata.concerns.startsWith('DEPOSIT_PURCHASE'))
      || (typeof payment?.notes === 'string' && payment.notes.startsWith('DEPOSIT_PURCHASE'))
      || (typeof payment?.concerns === 'string' && payment.concerns.startsWith('DEPOSIT_PURCHASE'));

    if (isDeposit) {
      const marker = (session?.metadata?.concerns || payment?.concerns || '').toString();
      const match = marker.match(/sessions=(\d+)/);
      const sessions = match ? parseInt(match[1], 10) : 0;
      if (sessions > 0) {
        await creditDepositSessions({
          doctorId: payment.doctor_id,
          customerEmail: payment.customer_email,
          sessions
        });
        console.log('✅ [WEBHOOK] Deposit credited:', { doctorId: payment.doctor_id, sessions });
      } else {
        console.warn('⚠️ [WEBHOOK] Deposit marker found but sessions not parsed');
      }
      return;
    }

    // Otherwise create appointment record
    await createAppointment(payment, session);

  } catch (error) {
    console.error('❌ [WEBHOOK] Error in handleCheckoutCompleted:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('✅ [WEBHOOK] Payment intent succeeded:', paymentIntent.id);
  
  try {
    // Find the payment record by payment intent ID
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single();

    if (paymentError || !payment) {
      console.error('❌ [WEBHOOK] Payment not found:', paymentError);
      return;
    }

    console.log('🔍 [WEBHOOK] Found payment record:', payment.id);

    // Update payment status to completed
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ [WEBHOOK] Failed to update payment:', updateError);
      return;
    }

    console.log('✅ [WEBHOOK] Payment status updated to completed');

    // Create appointment record if not exists
    await createAppointment(payment, paymentIntent);

  } catch (error) {
    console.error('❌ [WEBHOOK] Error in handlePaymentSucceeded:', error);
  }
}

async function createAppointment(payment: any, stripeData: any) {
  console.log('🔍 [WEBHOOK] Creating appointment for payment:', payment.id);

  try {
    // Get doctor details
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', payment.doctor_id)
      .single();

    if (doctorError || !doctor) {
      console.error('❌ [WEBHOOK] Doctor not found:', doctorError);
      return;
    }

    // Create appointment record
    const appointmentData = {
      doctor_id: payment.doctor_id,
      parent_name: payment.parent_name,
      parent_email: payment.customer_email,
      appointment_date: payment.appointment_date,
      appointment_time: payment.appointment_time,
      status: 'confirmed',
      payment_id: payment.id,
      notes: `Session with ${doctor.name} - Paid via Stripe`
    };

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ [WEBHOOK] Failed to create appointment:', appointmentError);
      return;
    }

    console.log('✅ [WEBHOOK] Appointment created:', appointment.id);

    // Update payment with appointment ID
    const { error: linkError } = await supabase
      .from('payments')
      .update({ appointment_id: appointment.id })
      .eq('id', payment.id);

    if (linkError) {
      console.error('❌ [WEBHOOK] Failed to link payment to appointment:', linkError);
    } else {
      console.log('✅ [WEBHOOK] Payment linked to appointment');
    }

  } catch (error) {
    console.error('❌ [WEBHOOK] Error creating appointment:', error);
  }
}

async function creditDepositSessions(args: { doctorId: string; customerEmail: string; sessions: number }) {
  try {
    // Ensure row exists per (email, doctor)
    const { data: existing, error: selErr } = await supabase
      .from('session_deposits')
      .select('id, remaining_sessions')
      .eq('customer_email', args.customerEmail)
      .eq('doctor_id', args.doctorId)
      .maybeSingle();

    if (selErr) {
      console.error('❌ [WEBHOOK] Failed to read session_deposits:', selErr);
    }

    if (existing) {
      const { error: updErr } = await supabase
        .from('session_deposits')
        .update({ remaining_sessions: (existing.remaining_sessions || 0) + args.sessions, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (updErr) throw updErr;
    } else {
      const { error: insErr } = await supabase
        .from('session_deposits')
        .insert({
          doctor_id: args.doctorId,
          customer_email: args.customerEmail,
          remaining_sessions: args.sessions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      if (insErr) throw insErr;
    }

    // Optional: add transaction log
    await supabase
      .from('session_deposit_transactions')
      .insert({
        doctor_id: args.doctorId,
        customer_email: args.customerEmail,
        delta_sessions: args.sessions,
        reason: 'purchase',
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('❌ [WEBHOOK] Error crediting deposit sessions:', error);
  }
}
