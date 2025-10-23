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
    console.log('🔍 [DEBUG] Input data:', {
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      parentName: data.parentName,
      parentEmail: data.parentEmail,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      amountCents: data.amountCents
    });

    // Get Stripe Price ID from database
    console.log('🔍 [DEBUG] Fetching Stripe product for doctor:', data.doctorId);
    const { data: stripeProduct, error: productError } = await supabase
      .from('stripe_products')
      .select('stripe_price_id')
      .eq('doctor_id', data.doctorId)
      .single();

    if (productError || !stripeProduct) {
      console.error('❌ [ERROR] Stripe product not found:', productError);
      throw new Error('Stripe product not found for the selected doctor.');
    }

    console.log('✅ [SUCCESS] Stripe product found:', stripeProduct.stripe_price_id);

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

    // Create Stripe Checkout Session via Netlify Function
    console.log('🔍 [DEBUG] Creating Stripe Checkout Session via Netlify Function...');
    
    try {
      // Use Netlify Function endpoint instead of localhost
      const netlifyFunctionUrl = '/.netlify/functions/create-checkout-session';
      console.log('🔍 [DEBUG] Calling Netlify Function:', netlifyFunctionUrl);
      
      const response = await fetch(netlifyFunctionUrl, {
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
        const errorText = await response.text();
        console.error('❌ [ERROR] Server response not OK:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('🔍 [DEBUG] Response data:', responseData);
      
      const { sessionId, checkoutUrl } = responseData;
      console.log('✅ [SUCCESS] Checkout session created:', sessionId);

      // Redirect directly to Stripe Checkout without confirmation
      console.log('🔍 [DEBUG] Redirecting to Stripe Checkout...');
      
      if (checkoutUrl) {
        console.log('🔍 [DEBUG] Using Stripe checkout URL:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        // Fallback: construct the URL manually
        const fallbackUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
        console.log('🔍 [DEBUG] Using fallback URL:', fallbackUrl);
        window.location.href = fallbackUrl;
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
