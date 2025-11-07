const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://parentteenonlineclinic.com',
  'https://www.parentteenonlineclinic.com'
];

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '*';
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';

  const headers = {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
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

    const { data: depositRow, error: depositError } = await supabase
      .from('session_deposits')
      .select('id, remaining_sessions')
      .eq('customer_email', parentEmail)
      .eq('doctor_id', doctorId)
      .maybeSingle();

    if (depositError) {
      console.error('❌ [ERROR] Failed to fetch deposit:', depositError);
      throw depositError;
    }

    if (!depositRow || Number(depositRow.remaining_sessions) <= 0) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'insufficient_sessions',
          message: 'Δεν υπάρχουν διαθέσιμες συνεδρίες στο deposit για τον συγκεκριμένο γιατρό.'
        })
      };
    }

    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('date', appointmentDate)
      .eq('time', appointmentTime)
      .maybeSingle();

    if (existingAppointment) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: 'slot_unavailable',
          message: 'Η ώρα που επιλέξατε δεν είναι πλέον διαθέσιμη.'
        })
      };
    }

    const { data: appointmentData, error: appointmentError } = await supabase
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
      throw appointmentError;
    }

    const { error: txError } = await supabase
      .from('session_deposit_transactions')
      .insert({
        customer_email: parentEmail,
        doctor_id: doctorId,
        delta_sessions: -1,
        reason: 'booking',
        metadata: {
          appointment_id: appointmentData.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          doctor_name: doctorName
        }
      });

    if (txError) {
      console.error('❌ [ERROR] Failed to record deposit transaction:', txError);
      await supabase.from('appointments').delete().eq('id', appointmentData.id);
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
    console.error('❌ [ERROR] Deposit booking failed:', error);
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

