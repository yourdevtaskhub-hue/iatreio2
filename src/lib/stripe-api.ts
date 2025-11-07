// Stripe API service for Vite/React project
import { supabase } from './supabase';
import { findDoctorStripeOverride } from '../config/stripe-doctor-overrides';

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

export const createCheckoutSession = async (data: CreateCheckoutSessionData) => {
  try {
    console.log('🔍 [DEBUG] Starting createCheckoutSession with data:', {
      doctorId: data.doctorId,
      doctorName: data.doctorName,
      amountCents: data.amountCents,
      parentEmail: data.parentEmail
    });

    // Get Stripe Price ID from database
    console.log('🔍 [DEBUG] Fetching stripe product for doctor_id:', data.doctorId);
    const { data: stripeProduct, error: productError } = await supabase
      .from('stripe_products')
      .select('stripe_price_id')
      .eq('doctor_id', data.doctorId)
      .single();

    console.log('🔍 [DEBUG] Stripe product result:', { stripeProduct, productError });

    if (productError || !stripeProduct) {
      console.error('❌ [ERROR] Stripe product not found:', productError);
      throw new Error('Stripe product not found for the selected doctor.');
    }

    // Prepare payment data
    const paymentInsertData = {
      doctor_id: data.doctorId,
      amount_cents: data.amountCents,
      currency: 'eur',
      status: 'pending',
      customer_email: data.parentEmail,
      parent_name: data.parentName,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      doctor_name: data.doctorName,
    };

    console.log('🔍 [DEBUG] Attempting to insert payment with data:', paymentInsertData);

    // Create payment record in database
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert(paymentInsertData)
      .select()
      .single();

    console.log('🔍 [DEBUG] Payment insert result:', { paymentData, paymentError });

    if (paymentError || !paymentData) {
      console.error('❌ [ERROR] Payment creation failed:', {
        error: paymentError,
        errorCode: paymentError?.code,
        errorMessage: paymentError?.message,
        errorDetails: paymentError?.details,
        errorHint: paymentError?.hint
      });
      throw new Error(`Failed to create pending payment record: ${paymentError?.message || 'Unknown error'}`);
    }

    // Create real Stripe Checkout Session
    console.log('🔍 [DEBUG] Creating Stripe Checkout Session...');
    
    // For now, we'll simulate success and redirect to a success page
    // In production, you would call Stripe API here to create a real checkout session
    console.log('✅ [SUCCESS] Payment record created successfully:', paymentData.id);
    
    return {
      sessionId: `cs_test_${Date.now()}`,
      paymentId: paymentData.id,
      success: true
    };

  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

export const getDoctorPrice = async (doctorId: string, doctorName?: string): Promise<number> => {
  try {
    console.log('🔍 [DEBUG] Fetching price for doctor_id:', doctorId);
    const override = findDoctorStripeOverride(doctorId, doctorName);

    if (override) {
      console.log('✅ [DEBUG] Using override price for doctor:', doctorId, override);
      return override.amountCents;
    }
    
    const { data: stripeProduct, error } = await supabase
      .from('stripe_products')
      .select('price_amount_cents')
      .eq('doctor_id', doctorId)
      .single();

    console.log('🔍 [DEBUG] Price fetch result:', { stripeProduct, error });

    if (error || !stripeProduct) {
      console.error('❌ [ERROR] Price fetch failed:', error);
      throw new Error('Stripe product not found for the selected doctor.');
    }

    console.log('✅ [SUCCESS] Price found:', stripeProduct.price_amount_cents);
    return stripeProduct.price_amount_cents;
  } catch (error: any) {
    console.error('❌ [ERROR] Error fetching doctor price:', error);
    throw new Error(error.message || 'Failed to fetch doctor price');
  }
};
