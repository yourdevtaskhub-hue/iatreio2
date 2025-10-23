// Real Stripe Checkout Integration
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const getStripe = () => {
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SEsJ3AwY6mf2WfLpG6PMz85IPezplnfRTBF3Mut9RYlOHr3mBNGPwTlak7EIeIwbErE0gE8Vfldrj21QbELSIQN00hKOtZJc0';
  return loadStripe(stripePublishableKey);
};

export interface CreateCheckoutSessionData {
  doctorId: string;
  doctorName: string;
  parentName: string;
  parentEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  concerns: string;
  amountCents: number;
}

export const createRealStripeCheckout = async (data: CreateCheckoutSessionData) => {
  try {
    console.log('🔍 [DEBUG] Creating REAL Stripe Checkout Session...');

    // Get Stripe Price ID from database
    const { data: stripeProduct, error: productError } = await supabase
      .from('stripe_products')
      .select('stripe_price_id')
      .eq('doctor_id', data.doctorId)
      .single();

    if (productError || !stripeProduct) {
      throw new Error('Stripe product not found for the selected doctor.');
    }

    // Create payment record in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        doctor_id: data.doctorId,
        amount_cents: data.amountCents,
        currency: 'eur',
        status: 'pending',
        customer_email: data.parentEmail,
        parent_name: data.parentName,
        appointment_date: data.appointmentDate,
        appointment_time: data.appointmentTime,
        doctor_name: data.doctorName,
      })
      .select()
      .single();

    if (paymentError || !paymentData) {
      throw new Error(`Failed to create pending payment record: ${paymentError?.message || 'Unknown error'}`);
    }

    console.log('✅ [SUCCESS] Payment record created:', paymentData.id);

    // Create Stripe Checkout Session via server
    console.log('🔍 [DEBUG] Creating Stripe Checkout Session via server...');
    
    try {
      const response = await fetch('http://localhost:3001/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: data.doctorId,
          doctorName: data.doctorName,
          parentName: data.parentName,
          parentEmail: data.parentEmail,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          concerns: data.concerns || '',
          amountCents: data.amountCents,
          priceId: stripeProduct.stripe_price_id
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const { sessionId } = await response.json();
      console.log('✅ [SUCCESS] Checkout session created:', sessionId);

      // Show confirmation and redirect
      const confirmed = confirm(`Πληρωμή δημιουργήθηκε επιτυχώς!\n\nΓιατρός: ${data.doctorName}\nΠοσό: €${(data.amountCents / 100).toFixed(2)}\n\nΘέλετε να μεταφερθείτε στο Stripe Checkout για πληρωμή;`);

      if (confirmed) {
        // Redirect to Stripe Checkout
        const stripe = await getStripe();
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: sessionId
          });

          if (error) {
            console.error('❌ [ERROR] Stripe redirect failed:', error);
            throw error;
          }
        }
      }

      return {
        sessionId: sessionId,
        paymentId: paymentData.id,
        success: true
      };
    } catch (error) {
      console.error('❌ [ERROR] Failed to create checkout session:', error);
      throw error;
    }

  } catch (error: any) {
    console.error('❌ [ERROR] Real Stripe checkout failed:', error);
    throw new Error(error.message || 'Failed to create Stripe checkout');
  }
};
