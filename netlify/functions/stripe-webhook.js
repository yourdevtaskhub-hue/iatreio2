// Netlify Function for Stripe Webhook
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
  console.log('🚀 [WEBHOOK] ===== STRIPE WEBHOOK CALLED =====');
  console.log('🔍 [DEBUG] Stripe Webhook received:', event.httpMethod);
  console.log('🔍 [DEBUG] Event headers:', JSON.stringify(event.headers, null, 2));
  console.log('🔍 [DEBUG] Event body length:', event.body ? event.body.length : 0);
  console.log('🔍 [DEBUG] Context:', JSON.stringify(context, null, 2));
  console.log('🔍 [DEBUG] Full event:', JSON.stringify(event, null, 2));
  console.log('🔍 [DEBUG] Environment variables:');
  console.log('  - STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET');
  console.log('  - STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET');
  console.log('  - SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('  - SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET');
  console.log('🔍 [DEBUG] Request timestamp:', new Date().toISOString());
  console.log('🔍 [DEBUG] Request ID:', event.headers['x-nf-request-id'] || 'N/A');
  console.log('🔍 [DEBUG] Raw body preview (first 500 chars):', event.body ? event.body.substring(0, 500) : 'NO BODY');
  console.log('🔍 [DEBUG] isBase64Encoded flag:', event.isBase64Encoded);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('❌ [ERROR] Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_0idYvHmURXcSL9x8zaYUnMjmXJ6a54Yc';

    console.log('🔍 [DEBUG] Verifying webhook signature...');
    console.log('🔍 [DEBUG] Signature:', sig);
    console.log('🔍 [DEBUG] Webhook secret:', webhookSecret ? 'SET' : 'NOT SET');
    console.log('🔍 [DEBUG] Event body type:', typeof event.body);
    console.log('🔍 [DEBUG] Event body preview:', event.body ? event.body.substring(0, 200) + '...' : 'NO BODY');

    let event_data;
    try {
      event_data = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
      console.log('✅ [SUCCESS] Webhook signature verified successfully');
    } catch (err) {
      console.error('❌ [ERROR] Webhook signature verification failed:', err.message);
      console.error('❌ [ERROR] Full error:', JSON.stringify(err, null, 2));
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
      };
    }

    console.log('✅ [SUCCESS] Webhook signature verified. Event type:', event_data.type);

    // Handle the event
    switch (event_data.type) {
      case 'checkout.session.completed':
        console.log('🔍 [DEBUG] About to call handleCheckoutSessionCompleted...');
        await handleCheckoutSessionCompleted(event_data.data.object);
        console.log('🔍 [DEBUG] handleCheckoutSessionCompleted completed successfully');
        break;
      default:
        console.warn(`⚠️ [WARNING] Unhandled event type: ${event_data.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('❌ [ERROR] Webhook processing failed:', error);
    console.error('❌ [ERROR] Error stack:', error.stack);
    console.error('❌ [ERROR] Error message:', error.message);
    console.error('❌ [ERROR] Error name:', error.name);
    console.error('❌ [ERROR] Full error object:', JSON.stringify(error, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};

async function handleCheckoutSessionCompleted(session) {
  console.log('🔍 [DEBUG] Processing checkout session completed:', session.id);
  console.log('🔍 [DEBUG] Full session object:', JSON.stringify(session, null, 2));
  console.log('🔍 [DEBUG] Session metadata exists:', !!session.metadata);
  console.log('🔍 [DEBUG] Session customer_details exists:', !!session.customer_details);
  console.log('🔍 [DEBUG] Session customer_email exists:', !!session.customer_email);
  console.log('🔍 [DEBUG] Session payment status:', session.payment_status);
  console.log('🔍 [DEBUG] Session amount_total:', session.amount_total);
  console.log('🔍 [DEBUG] Session currency:', session.currency);

  const {
    doctor_id,
    payment_id,
    parent_name,
    appointment_date,
    appointment_time,
    doctor_name,
    concerns,
    amount_cents
  } = session.metadata || {};

  // Get parent_email from multiple sources with fallback
  const parent_email = session.metadata?.parent_email || 
                      session.customer_details?.email || 
                      session.customer_email;

  console.log('🔍 [DEBUG] Session metadata:', {
    doctor_id,
    payment_id,
    parent_name,
    parent_email,
    appointment_date,
    appointment_time,
    doctor_name,
    concerns,
    amount_cents
  });

  console.log('🔍 [DEBUG] Email sources:', {
    'metadata.parent_email': session.metadata?.parent_email,
    'customer_details.email': session.customer_details?.email,
    'customer_email': session.customer_email,
    'final_parent_email': parent_email
  });

  console.log('🔍 [DEBUG] Stripe line items presence:', {
    lineItems: session?.line_items ? 'ATTACHED' : 'NOT PROVIDED',
    totalDetails: session?.total_details || 'N/A'
  });

  const concernsString = typeof concerns === 'string' ? concerns : '';
  const isDepositPurchase = concernsString.startsWith('DEPOSIT_PURCHASE');
  const isManualDeposit = concernsString.startsWith('MANUAL_DEPOSIT') || !!session.metadata?.manual_deposit_data;
  const metadataSessionsCount = session.metadata?.sessions_count
    ? parseInt(session.metadata.sessions_count, 10)
    : null;
  const scheduleDetailsFromMetadata = (() => {
    const raw = session.metadata?.schedule_details_json;
    if (!raw || typeof raw !== 'string') return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && typeof item === 'object');
    } catch (error) {
      console.warn('⚠️ [WARNING] Failed to parse schedule_details_json metadata:', error);
      return [];
    }
  })();

  const inferredDepositFromMetadata = !appointment_date && !appointment_time && (!!metadataSessionsCount || scheduleDetailsFromMetadata.length > 0);
  const isDeposit = isDepositPurchase || isManualDeposit || inferredDepositFromMetadata;

  console.log('🔍 [DEBUG] Deposit detection inside webhook:', {
    isDeposit,
    isDepositPurchase,
    isManualDeposit,
    inferredDepositFromMetadata,
    metadataSessionsCount,
    scheduleDetailsFromMetadataCount: scheduleDetailsFromMetadata.length,
    concerns,
    appointment_date,
    appointment_time
  });

  // Validate required metadata (για deposit δεν απαιτείται appointment)
  if (!doctor_id || !payment_id || !parent_name || !parent_email || (!isDeposit && (!appointment_date || !appointment_time))) {
    console.error('❌ [ERROR] Missing required metadata in session');
    console.error('❌ [ERROR] Missing fields:', {
      doctor_id: !doctor_id,
      payment_id: !payment_id,
      parent_name: !parent_name,
      parent_email: !parent_email,
      appointment_date: !appointment_date,
      appointment_time: !appointment_time
    });
    throw new Error('Missing required metadata in session');
  }

  console.log('✅ [SUCCESS] All required metadata validated successfully');

  try {
    // Update payment status
    console.log('🔍 [DEBUG] Updating payment status...');
    console.log('🔍 [DEBUG] Payment update payload:', {
      payment_id,
      sessionId: session.id,
      status: session.payment_status,
      amount_total: session.amount_total,
      amount_subtotal: session.amount_subtotal
    });
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_checkout_session_id: session.id,
      })
      .eq('id', payment_id);

    if (updatePaymentError) {
      console.error('❌ [ERROR] Error updating payment record:', updatePaymentError);
      console.error('❌ [ERROR] Payment update filter context:', { payment_id });
      throw updatePaymentError;
    }

    console.log('✅ [SUCCESS] Payment status updated');

    // Αν είναι αγορά deposit: πίστωση υπολοίπου και όχι δημιουργία ραντεβού
    if (isDeposit) {
      // Αν είναι manual deposit, δημιουργία του manual_deposit_requests μετά την επιτυχή πληρωμή
      if (isManualDeposit) {
        console.log('🔍 [DEBUG] Manual deposit detected, creating manual_deposit_request...');
        
        // Διάβασμα manual deposit data από metadata
        const manualDepositDataStr = session.metadata?.manual_deposit_data;
        if (!manualDepositDataStr) {
          console.warn('⚠️ [WARNING] Manual deposit detected but no manual_deposit_data in metadata');
          console.log('✅ [SUCCESS] Manual deposit processed (no data to insert)');
          return;
        }

        let manualDepositData;
        try {
          manualDepositData = JSON.parse(manualDepositDataStr);
        } catch (parseError) {
          console.error('❌ [ERROR] Failed to parse manual_deposit_data:', parseError);
          throw parseError;
        }

        console.log('🔍 [DEBUG] Manual deposit data:', JSON.stringify(manualDepositData, null, 2));

        // Δημιουργία manual_deposit_request με status 'completed' απευθείας
        const { data: insertedManualDeposit, error: manualDepositInsertError } = await supabase
          .from('manual_deposit_requests')
          .insert({
            doctor_id: manualDepositData.doctorId,
            doctor_name: manualDepositData.doctorName,
            session_count: manualDepositData.sessionCount,
            appointment_date: manualDepositData.appointmentDate,
            appointment_time: null,
            parent_name: manualDepositData.parentName,
            parent_email: manualDepositData.parentEmail,
            parent_phone: manualDepositData.parentPhone,
            amount_cents: manualDepositData.amountCents,
            notes: manualDepositData.notes,
            status: 'completed',
            payment_id: payment_id,
            error_message: null,
            user_timezone: manualDepositData.userTimezone || null // Προσθήκη user_timezone
          })
          .select()
          .single();

        if (manualDepositInsertError) {
          console.error('❌ [ERROR] Failed to create manual_deposit_request:', manualDepositInsertError);
          throw manualDepositInsertError;
        } else {
          console.log('✅ [SUCCESS] Manual deposit request created with status completed:', insertedManualDeposit.id);
          
          // Για manual deposits, δημιουργούμε session_deposit_transactions για να ενημερωθεί το wallet
          if (manualDepositData.sessionCount > 0) {
            const { error: txErr } = await supabase
              .from('session_deposit_transactions')
              .insert({
                customer_email: manualDepositData.parentEmail,
                doctor_id: manualDepositData.doctorId,
                delta_sessions: manualDepositData.sessionCount,
                reason: 'purchase',
                payment_id: payment_id,
                metadata: { stripe_session_id: session.id, is_manual_deposit: true }
              });
            if (txErr) {
              console.error('❌ [ERROR] Failed to create session_deposit_transaction:', txErr);
              throw txErr;
            }
            console.log('✅ [SUCCESS] Manual deposit transaction recorded:', {
              customer_email: manualDepositData.parentEmail,
              doctor_id: manualDepositData.doctorId,
              delta_sessions: manualDepositData.sessionCount,
              payment_id
            });
          }

          // Αποστολή email επιβεβαιώσεως για manual deposit
          // Χρησιμοποιούμε την ημερομηνία από το manualDepositData.appointmentDate
          if (manualDepositData.appointmentDate) {
            console.log('📧 [EMAIL] Sending confirmation email for manual deposit...');
            try {
              // Parse την ημερομηνία/ώρα από το appointmentDate
              // Format: "DD/MM/YYYY HH:MM", "DD.MM.YY HH:MM", "DD/MM/YYYY", "YYYY-MM-DD HH:MM", etc.
              let emailDate = '';
              let emailTime = '';
              
              const dateTimeStr = manualDepositData.appointmentDate.trim();
              if (dateTimeStr) {
                // Αν περιέχει space, έχει και ώρα
                if (dateTimeStr.includes(' ')) {
                  const parts = dateTimeStr.split(' ');
                  const datePart = parts[0];
                  emailTime = parts[1] || '';
                  
                  // Αν η ημερομηνία είναι DD/MM/YYYY ή DD.MM.YY, μετατρέπουμε σε YYYY-MM-DD
                  if (datePart.includes('/')) {
                    const [day, month, year] = datePart.split('/');
                    // Αν το year είναι 2 ψηφία, προσθέτουμε 20
                    const fullYear = year.length === 2 ? `20${year}` : year;
                    emailDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  } else if (datePart.includes('.')) {
                    const [day, month, year] = datePart.split('.');
                    // Αν το year είναι 2 ψηφία, προσθέτουμε 20
                    const fullYear = year.length === 2 ? `20${year}` : year;
                    emailDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  } else {
                    emailDate = datePart;
                  }
                } else {
                  // Μόνο ημερομηνία, χωρίς ώρα
                  if (dateTimeStr.includes('/')) {
                    const [day, month, year] = dateTimeStr.split('/');
                    const fullYear = year.length === 2 ? `20${year}` : year;
                    emailDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  } else if (dateTimeStr.includes('.')) {
                    const [day, month, year] = dateTimeStr.split('.');
                    const fullYear = year.length === 2 ? `20${year}` : year;
                    emailDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  } else {
                    emailDate = dateTimeStr;
                  }
                  emailTime = '';
                }
              }

              console.log('📧 [EMAIL] Parsed date/time for manual deposit:', { emailDate, emailTime, original: dateTimeStr });

              // Fetch doctor name from database to ensure correct encoding
              let finalDoctorName = manualDepositData.doctorName;
              if (manualDepositData.doctorId) {
                const { data: doctorData, error: doctorError } = await supabase
                  .from('doctors')
                  .select('name')
                  .eq('id', manualDepositData.doctorId)
                  .single();
                
                if (!doctorError && doctorData && doctorData.name) {
                  finalDoctorName = doctorData.name;
                  console.log('📧 [EMAIL] Using doctor name from database:', finalDoctorName);
                }
              }

              await sendAppointmentConfirmationEmail({
                parentEmail: manualDepositData.parentEmail,
                parentName: manualDepositData.parentName,
                appointmentDate: emailDate,
                appointmentTime: emailTime,
                doctorName: finalDoctorName
              });
              console.log('✅ [EMAIL] Confirmation email sent successfully for manual deposit');
            } catch (emailError) {
              // Μη blocking error - απλά log
              console.warn('⚠️ [WARNING] Failed to send confirmation email for manual deposit (non-blocking):', emailError);
            }
          } else {
            console.log('ℹ️ [INFO] No appointment date in manual deposit, skipping email');
          }
        }

        console.log('✅ [SUCCESS] Manual deposit purchase credited');
        return;
      }

      // Κανονικό deposit (όχι manual)
      let sessions = Number.isFinite(metadataSessionsCount) && metadataSessionsCount > 0 ? metadataSessionsCount : 0;

      if (!sessions) {
        const sessionsMatch = concernsString.match(/sessions=(\d+)/);
        if (sessionsMatch) {
          const parsed = parseInt(sessionsMatch[1], 10);
          if (!Number.isNaN(parsed) && parsed > 0) {
            sessions = parsed;
          }
        }
      }

      if (!sessions && scheduleDetailsFromMetadata.length > 0) {
        sessions = scheduleDetailsFromMetadata.length;
      }

      console.log('🔍 [DEBUG] Deposit purchase detected. Extracted sessions:', sessions);
      console.log('🔍 [DEBUG] Deposit payment metadata snapshot:', {
        payment_id,
        parent_email,
        doctor_id,
        concerns
      });

      if (sessions > 0) {
        // Καταγραφή κίνησης (trigger ενημερώνει υπόλοιπο)
        const { error: txErr } = await supabase
          .from('session_deposit_transactions')
          .insert({
            customer_email: parent_email,
            doctor_id: doctor_id,
            delta_sessions: sessions,
            reason: 'purchase',
            payment_id: payment_id,
            metadata: { stripe_session_id: session.id }
          });
        if (txErr) throw txErr;
        console.log('✅ [SUCCESS] Deposit transaction recorded:', {
          customer_email: parent_email,
          doctor_id,
          delta_sessions: sessions,
          payment_id
        });
      } else {
        console.warn('⚠️ [WARNING] Deposit purchase without sessions credit (sessions <= 0). Check metadata/concerns format.', {
          metadataSessionsCount,
          scheduleDetailsFromMetadataCount: scheduleDetailsFromMetadata.length,
          concerns: concernsString
        });
      }

      console.log('✅ [SUCCESS] Deposit purchase credited');
      return;
    }

    // Create appointment
    console.log('🔍 [DEBUG] Creating appointment...');
    console.log('🔍 [DEBUG] Appointment data:', {
      doctor_id,
      appointment_date,
      appointment_time,
      parent_name,
      parent_email,
      concerns,
      payment_id
    });
    console.log('🔍 [DEBUG] Checking for existing appointment conflicts before inserting...');
    // Safe check: find any booked appointment at this slot (status='booked' or IS NULL for legacy)
    const { data: existingAppointments, error: existingErr } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('doctor_id', doctor_id)
      .eq('date', appointment_date)
      .eq('time', appointment_time);

    if (existingErr) {
      console.error('❌ [ERROR] Failed to check existing appointment before insert:', existingErr);
      throw existingErr;
    }

    // Filter for booked slots (status='booked' or NULL for legacy backward compatibility)
    const existing = (existingAppointments || []).find(
      (apt) => apt.status === 'booked' || apt.status === null
    );

    if (existing) {
      console.warn('⚠️ [WARNING] Appointment slot already exists. Will skip creation and log payment linkage.', existing);
      console.warn('⚠️ [WARNING] Consider investigating double webhook delivery.');
      return;
    }

    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctor_id,
        date: appointment_date,
        time: appointment_time,
        duration_minutes: 30,
        parent_name: parent_name,
        email: parent_email,
        concerns: concerns || '',
        status: 'booked'
      })
      .select()
      .single();

    if (appointmentError) {
      console.error('❌ [ERROR] Error creating appointment:', appointmentError);
      console.error('❌ [ERROR] Full error details:', JSON.stringify(appointmentError, null, 2));
      throw appointmentError;
    }

    console.log(`✅ [SUCCESS] Payment ${payment_id} and Appointment ${appointmentData.id} completed successfully.`);
    console.log('🔍 [DEBUG] Created appointment:', JSON.stringify(appointmentData, null, 2));
    console.log('🎉 [SUCCESS] ===== WEBHOOK PROCESSING COMPLETED SUCCESSFULLY =====');

    // Fetch doctor name from database to ensure correct encoding (για χρήση και στα δύο emails)
    let finalDoctorName = doctor_name || '';
    console.log('📧 [EMAIL] Initial doctor name from metadata:', finalDoctorName);
    
    // Πάντα προσπαθούμε να πάρουμε το όνομα από τη βάση αν έχουμε doctor_id
    if (doctor_id) {
      try {
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('name')
          .eq('id', doctor_id)
          .single();
        
        if (!doctorError && doctorData && doctorData.name) {
          finalDoctorName = doctorData.name;
          console.log('✅ [EMAIL] Using doctor name from database:', finalDoctorName);
        } else {
          console.warn('⚠️ [EMAIL] Could not fetch doctor name from database:', doctorError);
          if (!finalDoctorName) {
            finalDoctorName = doctor_name || 'Unknown Doctor';
            console.warn('⚠️ [EMAIL] Using metadata doctor name as fallback:', finalDoctorName);
          }
        }
      } catch (fetchError) {
        console.error('❌ [EMAIL] Error fetching doctor name:', fetchError);
        if (!finalDoctorName) {
          finalDoctorName = doctor_name || 'Unknown Doctor';
          console.warn('⚠️ [EMAIL] Using metadata doctor name as fallback after error:', finalDoctorName);
        }
      }
    } else {
      console.warn('⚠️ [EMAIL] No doctor_id provided, using metadata doctor_name:', finalDoctorName);
      if (!finalDoctorName) {
        finalDoctorName = 'Unknown Doctor';
        console.error('❌ [EMAIL] No doctor name available from metadata or database!');
      }
    }
    
    console.log('📧 [EMAIL] Final doctor name to use:', finalDoctorName);

    // Αποστολή email επιβεβαιώσεως
    console.log('📧 [EMAIL] Sending appointment confirmation email...');
    try {
      await sendAppointmentConfirmationEmail({
        parentEmail: parent_email,
        parentName: parent_name,
        appointmentDate: appointment_date,
        appointmentTime: appointment_time,
        doctorName: finalDoctorName
      });
      console.log('✅ [EMAIL] Confirmation email sent successfully');
    } catch (emailError) {
      // Μη blocking error - απλά log
      console.warn('⚠️ [WARNING] Failed to send confirmation email (non-blocking):', emailError);
    }

    // Αποστολή email ειδοποίησης στον γιατρό
    console.log('📧 [DOCTOR_EMAIL] Sending doctor notification email...');
    try {
      // Fetch appointment data με όλα τα στοιχεία
      const { data: fullAppointmentData, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentData.id)
        .single();
      
      if (!fetchError && fullAppointmentData) {
        await sendDoctorNotificationEmail({
          doctorName: finalDoctorName,
          doctorId: doctor_id,
          appointmentDate: appointment_date,
          appointmentTime: appointment_time,
          parentName: parent_name,
          parentEmail: parent_email,
          parentPhone: fullAppointmentData.phone || null,
          childAge: fullAppointmentData.child_age || null,
          concerns: fullAppointmentData.concerns || concerns || '',
          specialty: fullAppointmentData.specialty || null,
          thematology: fullAppointmentData.thematology || null,
          urgency: fullAppointmentData.urgency || null,
          isFirstSession: fullAppointmentData.is_first_session || null
        });
        console.log('✅ [DOCTOR_EMAIL] Doctor notification email sent successfully');
      } else {
        // Fallback αν δεν μπορούμε να πάρουμε full data
        await sendDoctorNotificationEmail({
          doctorName: finalDoctorName,
          doctorId: doctor_id,
          appointmentDate: appointment_date,
          appointmentTime: appointment_time,
          parentName: parent_name,
          parentEmail: parent_email,
          parentPhone: null,
          childAge: null,
          concerns: concerns || '',
          specialty: null,
          thematology: null,
          urgency: null,
          isFirstSession: null
        });
        console.log('✅ [DOCTOR_EMAIL] Doctor notification email sent successfully (with limited data)');
      }
    } catch (doctorEmailError) {
      // Μη blocking error - απλά log
      console.warn('⚠️ [WARNING] Failed to send doctor notification email (non-blocking):', doctorEmailError);
    }

    console.log('🔍 [DEBUG] Triggering post-processing audit log entry...');
    try {
      const { error: auditError } = await supabase
        .from('webhook_audit_log')
        .insert({
          stripe_event_id: session.id,
          payment_id,
          doctor_id,
          parent_email,
          is_deposit: isDeposit,
          status: 'completed',
          payload_snapshot: session
        });

      if (auditError) {
        console.warn('⚠️ [WARNING] Failed to write webhook audit log (non-blocking):', auditError);
      } else {
        console.log('✅ [SUCCESS] Webhook audit log entry stored');
      }
    } catch (auditUnexpectedError) {
      console.warn('⚠️ [WARNING] Unexpected exception during audit log insertion (ignored):', auditUnexpectedError);
    }

  } catch (dbError) {
    console.error('❌ [ERROR] Database update failed for checkout.session.completed:', dbError);
    console.error('❌ [ERROR] Stack trace:', dbError?.stack);
    console.error('❌ [ERROR] Error details object:', JSON.stringify(dbError, null, 2));
    throw dbError;
  }
}

// Helper function για αποστολή email επιβεβαιώσεως
async function sendAppointmentConfirmationEmail({ parentEmail, parentName, appointmentDate, appointmentTime, doctorName }) {
  try {
    // Προσδιορισμός base URL για Netlify Functions
    const functionsBase = process.env.NETLIFY_FUNCTIONS_BASE || 
                         process.env.URL ? `${process.env.URL}/.netlify/functions` : 
                         'https://onlineparentteenclinic.com/.netlify/functions';
    
    const emailUrl = `${functionsBase}/send-appointment-confirmation`;
    
    console.log('📧 [EMAIL] Calling email function:', emailUrl);
    
    const response = await fetch(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parentEmail,
        parentName: parentName || '',
        appointmentDate,
        appointmentTime,
        doctorName
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Email function returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📧 [EMAIL] Email function response:', result);
    return result;
  } catch (error) {
    console.error('❌ [EMAIL] Error calling email function:', error);
    throw error;
  }
}

// Helper function για αποστολή email ειδοποίησης στον γιατρό
async function sendDoctorNotificationEmail({ doctorName, doctorId, appointmentDate, appointmentTime, parentName, parentEmail, parentPhone, childAge, concerns, specialty, thematology, urgency, isFirstSession }) {
  try {
    // Προσδιορισμός base URL για Netlify Functions
    const functionsBase = process.env.NETLIFY_FUNCTIONS_BASE || 
                         process.env.URL ? `${process.env.URL}/.netlify/functions` : 
                         'https://onlineparentteenclinic.com/.netlify/functions';
    
    const emailUrl = `${functionsBase}/send-doctor-notification`;
    
    console.log('📧 [DOCTOR_EMAIL] Calling doctor notification function:', emailUrl);
    
    const response = await fetch(emailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorName,
        doctorId,
        appointmentDate,
        appointmentTime,
        parentName: parentName || '',
        parentEmail,
        parentPhone: parentPhone || null,
        childAge: childAge || null,
        concerns: concerns || '',
        specialty: specialty || null,
        thematology: thematology || null,
        urgency: urgency || null,
        isFirstSession: isFirstSession !== undefined ? isFirstSession : null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Doctor notification function returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('📧 [DOCTOR_EMAIL] Doctor notification function response:', result);
    return result;
  } catch (error) {
    console.error('❌ [DOCTOR_EMAIL] Error calling doctor notification function:', error);
    throw error;
  }
}
