// Real Stripe Checkout Integration
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

const getStripe = () => {
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51SEsIvBYDGzP3ZGsOqisKJa1bpEL8PF28o1HxpQUopzi9immZjglcyJRBNY655enURhZIYjrEsuEjIWxEucAyf4300PN51sYmy';
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

    // Check if this is a deposit purchase (no appointment date/time or concerns contains DEPOSIT_PURCHASE)
    const isDepositPurchase = (!data.appointmentDate && !data.appointmentTime) || 
                              (typeof data.concerns === 'string' && data.concerns.startsWith('DEPOSIT_PURCHASE'));
    
    // Get Stripe Price ID from database (only for regular appointments, not deposits)
    let stripePriceId: string | null = null;
    if (!isDepositPurchase) {
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

      stripePriceId = stripeProduct.stripe_price_id;
      console.log('✅ [SUCCESS] Stripe product found:', stripePriceId);
    } else {
      console.log('🔍 [DEBUG] Deposit purchase detected - skipping priceId fetch');
    }

    // Create payment record in database
    // Note: 'concerns' field is stored in Stripe metadata, not in payments table
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        doctor_id: data.doctorId,
        amount_cents: data.amountCents,
        currency: 'eur',
        status: 'pending',
        customer_email: data.parentEmail,
        parent_name: data.parentName,
        appointment_date: isDepositPurchase ? null : data.appointmentDate,
        appointment_time: isDepositPurchase ? null : data.appointmentTime,
        doctor_name: data.doctorName,
        // concerns field is not in payments table - it's stored in Stripe metadata
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
      // Determine Functions base URL
      const envBase = (import.meta as any).env?.VITE_NETLIFY_FUNCTIONS_BASE as string | undefined;
      const prodBaseDefault = 'https://perentteenonlineclinic.com/.netlify/functions';
      // Add local Netlify Dev default (8888) so localhost works 100%
      const localNetlifyDefault = 'http://localhost:8888/.netlify/functions';
      const bases = [
        '/.netlify/functions',        // Vite proxy (if configured)
        localNetlifyDefault,          // Netlify Dev default port
        envBase || prodBaseDefault    // Env override or production
      ];

      let response: Response | null = null;
      let lastError: any = null;
      let lastErrorResponse: Response | null = null;
      
      for (const base of bases) {
        const url = `${base.replace(/\/$/, '')}/create-checkout-session`;
        console.log('🔍 [DEBUG] Calling Netlify Function:', url);
        try {
          const requestBody = {
            doctorId: data.doctorId,
            doctorName: data.doctorName,
            parentName: data.parentName,
            parentEmail: data.parentEmail,
            appointmentDate: data.appointmentDate || '',
            appointmentTime: data.appointmentTime || '',
            concerns: data.concerns || '',
            amountCents: data.amountCents,
            priceId: stripePriceId || null // null for deposits
          };
          console.log('🔍 [DEBUG] Request body to Netlify Function:', JSON.stringify(requestBody, null, 2));
          const r = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          });
          
          console.log('🔍 [DEBUG] Response status:', r.status, r.statusText);
          console.log('🔍 [DEBUG] Response ok:', r.ok);
          
          if (r.ok) { 
            response = r; 
            break; 
          }
          
          // Save error response for detailed logging
          lastErrorResponse = r;
          lastError = new Error(`Server error: ${r.status}`);
        } catch (e) {
          console.error('❌ [ERROR] Fetch exception:', e);
          lastError = e;
        }
      }

      if (!response && lastErrorResponse) {
        // Try to get error details from the failed response
        try {
          const errorText = await lastErrorResponse.clone().text();
          console.error('❌ [ERROR] Raw error response:', errorText);
          
          let errorJson = null;
          try {
            errorJson = JSON.parse(errorText);
            console.error('❌ [ERROR] Parsed error JSON:', errorJson);
          } catch {
            console.error('❌ [ERROR] Response is not JSON');
          }
          
          const errorMessage = errorJson?.error || errorJson?.message || errorJson?.details || errorText || `Server error: ${lastErrorResponse.status}`;
          console.error('❌ [ERROR] Complete error details:', {
            status: lastErrorResponse.status,
            statusText: lastErrorResponse.statusText,
            body: errorText,
            parsed: errorJson,
            finalMessage: errorMessage
          });
          throw new Error(errorMessage);
        } catch (parseError) {
          console.error('❌ [ERROR] Failed to parse error:', parseError);
          throw lastError || new Error(`Failed to reach checkout function (${lastErrorResponse?.status || 'unknown'})`);
        }
      }

      if (!response) {
        console.error('❌ [ERROR] Failed to call any functions base:', lastError);
        throw lastError || new Error('Failed to reach checkout function');
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
