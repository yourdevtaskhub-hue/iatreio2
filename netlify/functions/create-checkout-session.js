// Netlify Function for Stripe Checkout Session Creation
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

// Initialize Stripe
// IMPORTANT: STRIPE_SECRET_KEY must be set in Netlify Dashboard > Environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vdrmgzoupwyisiyrnjdi.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcm1nem91cHd5aXNpeXJuamRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUzMDAxNiwiZXhwIjoyMDc1MTA2MDE2fQ.uH3E-xqFmKkMF6Uul3jaSHTqloqklWDg7KaIAMxq_CQ'
);

exports.handler = async (event, context) => {
  // Enable CORS (support both localhost and production)
  const origin = event.headers.origin || event.headers.Origin || '*';
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://parentteenonlineclinic.com',
    'https://www.parentteenonlineclinic.com'
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
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
      priceId,
      sessionsCount: sessionsCountFromBody // Optional: passed explicitly for deposit purchases
    } = body;

    console.log('🔍 [DEBUG] Raw request body:', JSON.stringify(body, null, 2));
    console.log('🔍 [DEBUG] Parsed request data:', {
      doctorId, 
      doctorName, 
      parentName, 
      parentEmail, 
      appointmentDate, 
      appointmentTime, 
      concerns,
      amountCents, 
      priceId,
      sessionsCountFromBody,
      amountCentsType: typeof amountCents,
      amountCentsValue: amountCents
    });

    // Check if this is a deposit purchase
    const isDeposit = (typeof concerns === 'string') && concerns.startsWith('DEPOSIT_PURCHASE');
    // Also check if appointment date/time are empty (deposit indicator)
    const isDepositByEmptyFields = (!appointmentDate || appointmentDate === '') && (!appointmentTime || appointmentTime === '');
    const finalIsDeposit = isDeposit || isDepositByEmptyFields;
    
    // Extract sessions count for deposit purchases
    // Priority: 1) Explicit sessionsCount from body, 2) Extract from concerns, 3) null
    let sessionsCount = null;
    
    console.log('🔍 [DEBUG] === SESSIONS COUNT EXTRACTION ===');
    console.log('🔍 [DEBUG] sessionsCountFromBody:', sessionsCountFromBody, 'type:', typeof sessionsCountFromBody);
    console.log('🔍 [DEBUG] concerns:', concerns, 'type:', typeof concerns);
    console.log('🔍 [DEBUG] finalIsDeposit:', finalIsDeposit);
    
    if (finalIsDeposit) {
      // First, try to use the explicitly passed sessionsCount from request body
      if (sessionsCountFromBody !== null && sessionsCountFromBody !== undefined) {
        const parsed = typeof sessionsCountFromBody === 'string' ? parseInt(sessionsCountFromBody, 10) : sessionsCountFromBody;
        if (!isNaN(parsed) && parsed > 0) {
          sessionsCount = parsed;
          console.log('✅ [SUCCESS] Using sessions count from request body:', sessionsCount);
        } else {
          console.warn('⚠️ [WARNING] sessionsCountFromBody is invalid:', sessionsCountFromBody);
        }
      }
      
      // Fallback: try to extract from concerns field (format: DEPOSIT_PURCHASE sessions=X)
      if (!sessionsCount && typeof concerns === 'string' && concerns.includes('sessions=')) {
        const sessionsMatch = concerns.match(/sessions=(\d+)/);
        if (sessionsMatch && sessionsMatch[1]) {
          sessionsCount = parseInt(sessionsMatch[1], 10);
          console.log('✅ [SUCCESS] Extracted sessions count from concerns:', sessionsCount);
        } else {
          console.warn('⚠️ [WARNING] Could not extract sessions from concerns:', concerns);
        }
      }
      
      if (!sessionsCount) {
        console.error('❌ [ERROR] Could not determine sessions count! Will use generic description.');
        console.error('❌ [ERROR] sessionsCountFromBody:', sessionsCountFromBody);
        console.error('❌ [ERROR] concerns:', concerns);
      } else {
        console.log('✅ [SUCCESS] Final sessionsCount:', sessionsCount);
      }
    }
    
    console.log('🔍 [DEBUG] === END SESSIONS COUNT EXTRACTION ===');
    console.log('🔍 [DEBUG] Deposit detection:', {
      isDeposit,
      isDepositByEmptyFields,
      finalIsDeposit,
      concerns,
      appointmentDate,
      appointmentTime,
      priceId,
      sessionsCount: sessionsCount || 'NOT EXTRACTED - THIS IS THE PROBLEM!'
    });

    // Validate required fields
    // CRITICAL: For deposits, we allow empty appointmentDate/Time and null priceId
    const missing = [];
    if (!doctorId) missing.push('doctorId');
    if (!doctorName) missing.push('doctorName');
    if (!parentName) missing.push('parentName');
    if (!parentEmail) missing.push('parentEmail');
    if (!amountCents || amountCents === 0) missing.push('amountCents');
    
    // Only require appointmentDate/Time and priceId if NOT a deposit
    if (!finalIsDeposit) {
      if (!appointmentDate || appointmentDate === '') missing.push('appointmentDate');
      if (!appointmentTime || appointmentTime === '') missing.push('appointmentTime');
      if (!priceId) missing.push('priceId');
    }
    // For deposits, priceId can be null - that's OK!
    
    if (missing.length > 0) {
      console.error('❌ [ERROR] Missing required fields:', missing);
      console.error('❌ [ERROR] Full validation context:', {
        isDeposit: finalIsDeposit,
        hasDoctorId: !!doctorId,
        hasDoctorName: !!doctorName,
        hasParentName: !!parentName,
        hasParentEmail: !!parentEmail,
        hasAmountCents: !!amountCents && amountCents !== 0,
        hasAppointmentDate: !!appointmentDate && appointmentDate !== '',
        hasAppointmentTime: !!appointmentTime && appointmentTime !== '',
        hasPriceId: !!priceId,
        priceIdValue: priceId
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields for checkout session.', 
          missing, 
          received: body,
          isDeposit: finalIsDeposit,
          validationContext: {
            hasDoctorId: !!doctorId,
            hasDoctorName: !!doctorName,
            hasParentName: !!parentName,
            hasParentEmail: !!parentEmail,
            hasAmountCents: !!amountCents && amountCents !== 0,
            hasAppointmentDate: !!appointmentDate && appointmentDate !== '',
            hasAppointmentTime: !!appointmentTime && appointmentTime !== '',
            hasPriceId: !!priceId,
            priceIdValue: priceId
          }
        }),
      };
    }
    
    console.log('✅ [SUCCESS] All validation passed. isDeposit:', finalIsDeposit);

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
        appointment_date: finalIsDeposit ? null : (appointmentDate || null),
        appointment_time: finalIsDeposit ? null : (appointmentTime || null),
        doctor_name: doctorName
        // Note: 'concerns' field is stored in Stripe metadata, not in payments table
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
    console.log('🔍 [DEBUG] isDeposit:', isDeposit);
    console.log('🔍 [DEBUG] amountCents:', amountCents);
    console.log('🔍 [DEBUG] priceId:', priceId);
    console.log('🔍 [DEBUG] Stripe key mode:', process.env.STRIPE_SECRET_KEY ? (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST') : 'FALLBACK');
    
    // CRITICAL: Always use price_data for live mode to avoid test price issues
    // Test prices don't exist in live Stripe account, so we must use dynamic pricing
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    // Check if using live mode (based on environment variable only)
    const isLiveMode = stripeSecretKey.startsWith('sk_live_');
    const isTestPrice = priceId && (priceId.includes('test') || !priceId.match(/^price_[a-zA-Z0-9]{24,}$/));
    
    console.log('🔍 [DEBUG] Stripe secret key check:', {
      keyExists: !!process.env.STRIPE_SECRET_KEY,
      envKeyPrefix: stripeSecretKey.substring(0, 10) + '...',
      isLiveMode,
      isTestPrice,
      priceId
    });
    
    // In live mode, ALWAYS use price_data (dynamic pricing) to avoid "No such price" errors
    // This is the only safe way when test prices are stored in database but we use live keys
    // FORCE price_data if we're in live mode OR if it's a deposit purchase
    let shouldUsePriceData = isDeposit || isLiveMode;
    
    if (isLiveMode && !isDeposit) {
      console.warn('⚠️ [WARNING] Live mode detected - FORCING price_data (dynamic pricing) instead of priceId to avoid test price conflicts');
      shouldUsePriceData = true; // Force price_data in live mode
    }
    
    // Safety check: if no priceId or if test price detected, use price_data
    if (!shouldUsePriceData && (!priceId || isTestPrice)) {
      console.warn('⚠️ [WARNING] No priceId or test price detected - using price_data');
      shouldUsePriceData = true;
    }
    
    console.log('🔍 [DEBUG] Final decision:', {
      shouldUsePriceData,
      isDeposit,
      isLiveMode,
      willUsePriceData: shouldUsePriceData
    });
    
    // Build description with extensive logging
    let description = '';
    console.log('🔍 [DEBUG] === BUILDING DESCRIPTION ===');
    console.log('🔍 [DEBUG] finalIsDeposit:', finalIsDeposit);
    console.log('🔍 [DEBUG] sessionsCount:', sessionsCount, 'type:', typeof sessionsCount);
    console.log('🔍 [DEBUG] sessionsCount > 0?:', sessionsCount && sessionsCount > 0);
    
    if (finalIsDeposit) {
      if (sessionsCount && sessionsCount > 0 && !isNaN(sessionsCount)) {
        description = `${sessionsCount} συνεδρίες`;
        console.log('✅ [SUCCESS] Using sessions count in description:', description);
      } else {
        description = 'Προπληρωμένες συνεδρίες';
        console.warn('⚠️ [WARNING] Using generic description because sessionsCount is invalid:', sessionsCount);
      }
    } else {
      description = `Συνεδρία ${appointmentDate} ${appointmentTime}`;
      console.log('🔍 [DEBUG] Using appointment description for regular booking');
    }
    
    console.log('🔍 [DEBUG] Final description:', description);
    console.log('🔍 [DEBUG] === END BUILDING DESCRIPTION ===');
    
    const lineItem = shouldUsePriceData
      ? {
          price_data: {
            currency: 'eur',
            unit_amount: amountCents,
            product_data: { 
              name: finalIsDeposit ? `Deposit συνεδριών — ${doctorName}` : `Ραντεβού με ${doctorName}`,
              description: description
            },
          },
          quantity: 1,
        }
      : {
          price: priceId,
          quantity: 1,
        };

    console.log('🔍 [DEBUG] === FINAL LINE ITEM ===');
    console.log('🔍 [DEBUG] Line item:', JSON.stringify(lineItem, null, 2));
    console.log('🔍 [DEBUG] Description in line item:', lineItem.price_data?.product_data?.description);
    console.log('🔍 [DEBUG] === END FINAL LINE ITEM ===');

    let session;
    try {
      const sessionData = {
        payment_method_types: ['card'],
        line_items: [ lineItem ],
        mode: 'payment',
        success_url: `${event.headers.origin || 'https://parentteenonlineclinic.com'}/payment-success?session_id={CHECKOUT_SESSION_ID}&payment_id=${paymentData.id}`,
        cancel_url: `${event.headers.origin || 'https://parentteenonlineclinic.com'}/contact?status=cancelled`,
        customer_email: parentEmail,
        metadata: {
          doctor_id: doctorId,
          payment_id: paymentData.id,
          parent_name: parentName,
          parent_email: parentEmail,
          appointment_date: isDeposit ? '' : appointmentDate,
          appointment_time: isDeposit ? '' : appointmentTime,
          doctor_name: doctorName,
          concerns: concerns || '',
          amount_cents: amountCents.toString(),
          sessions_count: sessionsCount ? sessionsCount.toString() : '',
        },
      };
      console.log('🔍 [DEBUG] Session data:', JSON.stringify(sessionData, null, 2));
      session = await stripe.checkout.sessions.create(sessionData);
    } catch (e) {
      console.error('❌ [ERROR] Stripe session create failed:', e);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'stripe_session_failed', message: e.message }) };
    }

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
    console.error('❌ [ERROR] Error stack:', error.stack);
    console.error('❌ [ERROR] Error details:', JSON.stringify(error, null, 2));
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'checkout_session_creation_failed',
        message: error.message || 'Unknown error',
        details: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
    };
  }
};
