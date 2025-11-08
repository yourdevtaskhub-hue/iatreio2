const { createClient } = require('@supabase/supabase-js');

let supabase;

const getSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('missing_supabase_env');
  }

  if (!supabase) {
    supabase = createClient(url, serviceKey);
  }

  return supabase;
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://onlineparentteenclinic.com',
  'https://www.onlineparentteenclinic.com'
];

exports.handler = async (event) => {
  console.log('🚀 [BOOK_DEPOSIT] ===== Netlify function invoked =====');
  console.log('🔍 [BOOK_DEPOSIT] Incoming HTTP method:', event?.httpMethod);
  console.log('🔍 [BOOK_DEPOSIT] Incoming headers snapshot:', JSON.stringify({
    origin: event?.headers?.origin || event?.headers?.Origin,
    referer: event?.headers?.referer,
    userAgent: event?.headers?.['user-agent'],
    requestId: event?.headers?.['x-nf-request-id']
  }, null, 2));
  console.log('🔍 [BOOK_DEPOSIT] Raw body length:', event?.body ? event.body.length : 0);
  console.log('🔍 [BOOK_DEPOSIT] Request timestamp:', new Date().toISOString());

  const origin = event.headers.origin || event.headers.Origin || '*';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('ℹ️ [BOOK_DEPOSIT] OPTIONS preflight detected. Returning early.');
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    console.warn('⚠️ [BOOK_DEPOSIT] Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const supabaseClient = getSupabaseClient();
    console.log('✅ [BOOK_DEPOSIT] Supabase client initialised');

    const payload = JSON.parse(event.body || '{}');
    console.log('🔍 [BOOK_DEPOSIT] Parsed payload:', JSON.stringify(payload, null, 2));

    const {
      doctorId,
      doctorName,
      appointmentDate,
      appointmentTime,
      parentName,
      parentEmail,
      phone,
      concerns
    } = payload;

    const missing = [];
    if (!doctorId) missing.push('doctorId');
    if (!doctorName) missing.push('doctorName');
    if (!appointmentDate) missing.push('appointmentDate');
    if (!appointmentTime) missing.push('appointmentTime');
    if (!parentName) missing.push('parentName');
    if (!parentEmail) missing.push('parentEmail');

    if (missing.length > 0) {
      console.warn('⚠️ [BOOK_DEPOSIT] Missing required fields detected:', missing);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'missing_fields',
          message: 'Λείπουν απαραίτητα πεδία.',
          missing
        })
      };
    }

    console.log('🔍 [BOOK_DEPOSIT] Fetching deposit row για', { doctorId, parentEmail });
    const { data: depositRow, error: depositError } = await supabaseClient
      .from('session_deposits')
      .select('id, remaining_sessions')
      .eq('customer_email', parentEmail)
      .eq('doctor_id', doctorId)
      .maybeSingle();

    if (depositError) {
      console.error('❌ [ERROR] Failed to fetch deposit:', depositError);
      console.error('❌ [ERROR] Deposit fetch context:', { doctorId, parentEmail });
      throw depositError;
    }

    console.log('🔍 [BOOK_DEPOSIT] Deposit query result:', depositRow);

    if (!depositRow || Number(depositRow.remaining_sessions) <= 0) {
      console.warn('⚠️ [BOOK_DEPOSIT] Insufficient sessions – remaining:', depositRow?.remaining_sessions);
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'insufficient_sessions',
          message: 'Δεν υπάρχουν διαθέσιμες συνεδρίες στο deposit για τον συγκεκριμένο γιατρό.'
        })
      };
    }

    console.log('🔍 [BOOK_DEPOSIT] Checking for existing appointment conflict', {
      doctorId,
      appointmentDate,
      appointmentTime
    });

    const { data: existingAppointment, error: existingAppointmentError } = await supabaseClient
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('date', appointmentDate)
      .eq('time', appointmentTime)
      .maybeSingle();

    if (existingAppointmentError) {
      console.error('❌ [ERROR] Existing appointment lookup failed:', existingAppointmentError);
      throw existingAppointmentError;
    }

    if (existingAppointment) {
      console.warn('⚠️ [BOOK_DEPOSIT] Slot already booked:', existingAppointment);
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'slot_unavailable',
          message: 'Η ώρα που επιλέξατε δεν είναι πλέον διαθέσιμη.'
        })
      };
    }

    console.log('🔍 [BOOK_DEPOSIT] Creating appointment εγγραφή...');
    const { data: appointmentData, error: appointmentError } = await supabaseClient
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        date: appointmentDate,
        time: appointmentTime,
        duration_minutes: 30,
        parent_name: parentName,
        email: parentEmail,
        phone: phone || null,
        concerns: concerns || ''
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ [ERROR] Failed to create appointment:', appointmentError);
      console.error('❌ [ERROR] Appointment create payload:', {
        doctor_id: doctorId,
        date: appointmentDate,
        time: appointmentTime,
        parent_name: parentName,
        email: parentEmail
      });
      throw appointmentError;
    }

    console.log('✅ [BOOK_DEPOSIT] Appointment created successfully:', appointmentData);

    const { error: txError } = await supabaseClient
      .from('session_deposit_transactions')
      .insert({
        customer_email: parentEmail,
        doctor_id: doctorId,
        delta_sessions: -1,
        reason: 'redeem',
        metadata: {
          appointment_id: appointmentData.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          doctor_name: doctorName
        }
      });

    if (txError) {
      console.error('❌ [ERROR] Failed to record deposit transaction:', txError);
      console.error('❌ [ERROR] Transaction payload που απέτυχε:', {
        customer_email: parentEmail,
        doctor_id: doctorId,
        appointment_id: appointmentData?.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      });
      await supabaseClient.from('appointments').delete().eq('id', appointmentData.id);
      if (txError.code === '22003') {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            error: 'insufficient_sessions',
            message: 'Το υπόλοιπο deposit δεν επαρκεί για την κράτηση.'
          })
        };
      }
      throw txError;
    }

    console.log('✅ [BOOK_DEPOSIT] Deposit transaction καταχωρήθηκε επιτυχώς για appointment', appointmentData.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        appointmentId: appointmentData.id,
        message: 'Η κράτηση ολοκληρώθηκε με επιτυχία.'
      })
    };
  } catch (error) {
    if (error && error.message === 'missing_supabase_env') {
      console.error('❌ [ERROR] Missing SUPABASE_URL / SUPABASE_SERVICE_KEY environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'configuration_error',
          message: 'Οι περιβαλλοντικές μεταβλητές SUPABASE_URL και SUPABASE_SERVICE_KEY δεν έχουν οριστεί στο Netlify.'
        })
      };
    }

    console.error('❌ [ERROR] Deposit booking failed:', error);
    console.error('❌ [ERROR] Stack trace:', error?.stack);
    console.error('❌ [ERROR] Additional context:', {
      errorName: error?.name,
      errorCode: error?.code,
      errorDetails: error?.details,
      payloadAttempted: event?.body
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'internal_error',
        message: 'Κάτι πήγε στραβά κατά την κράτηση. Παρακαλώ προσπαθήστε ξανά αργότερα.',
        details: error?.message || error?.toString?.()
      })
    };
  }
};

