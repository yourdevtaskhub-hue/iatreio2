// Netlify Function για αποστολή email επιβεβαιώσεως ραντεβού
const { Resend } = require('resend');

// Initialize Resend
// IMPORTANT: RESEND_API_KEY πρέπει να οριστεί στο Netlify Dashboard > Environment variables
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email από το οποίο θα στέλνονται τα emails (από το Resend dashboard)
const FROM_EMAIL = process.env.FROM_EMAIL || 'iatreiodrfytrou@onlineparentteenclinic.com';

exports.handler = async (event) => {
  console.log('📧 [EMAIL] ===== Appointment Confirmation Email Function Called =====');
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (!resend) {
    console.error('❌ [EMAIL] RESEND_API_KEY not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Email service not configured',
        message: 'RESEND_API_KEY environment variable is required'
      })
    };
  }

  try {
    // Parse JSON with proper UTF-8 handling
    // If body is base64 encoded (Netlify sometimes does this), decode it first
    let bodyString = event.body || '{}';
    if (event.isBase64Encoded) {
      bodyString = Buffer.from(bodyString, 'base64').toString('utf8');
    }
    
    const payload = JSON.parse(bodyString);
    console.log('🔍 [EMAIL] Email payload:', JSON.stringify(payload, null, 2));

    const {
      parentEmail,
      parentName,
      appointmentDate,
      appointmentTime,
      doctorName
    } = payload;

    // Ensure doctorName is properly handled
    // If doctorName is corrupted, try to fix encoding issues
    let finalDoctorName = (doctorName && typeof doctorName === 'string') ? doctorName.trim() : 'Δρ. Φύτρου';
    
    // If the name appears to be double-encoded or corrupted, try to fix it
    // Check for common mojibake patterns (Î, Ï,, etc.)
    const hasEncodingIssues = finalDoctorName.includes('Î') || 
                              finalDoctorName.includes('Ï') || 
                              finalDoctorName.includes('') ||
                              finalDoctorName.includes('I+') ||
                              finalDoctorName.includes('IoI');
    
    if (hasEncodingIssues) {
      console.warn('⚠️ [EMAIL] Detected potential encoding issue in doctor name, attempting fix...');
      console.warn('⚠️ [EMAIL] Original name:', finalDoctorName);
      
      try {
        // Method 1: Try latin1 -> utf8 conversion (common double-encoding fix)
        let decoded = Buffer.from(finalDoctorName, 'latin1').toString('utf8');
        if (decoded && !decoded.includes('Î') && !decoded.includes('Ï') && !decoded.includes('')) {
          finalDoctorName = decoded;
          console.log('✅ [EMAIL] Fixed encoding (latin1->utf8), new name:', finalDoctorName);
        } else {
          // Method 2: Try to reconstruct from bytes if it's really corrupted
          // This handles cases where UTF-8 was interpreted as single-byte
          const bytes = Buffer.from(finalDoctorName, 'latin1');
          const reconstructed = bytes.toString('utf8');
          if (reconstructed && reconstructed.length > 0 && !reconstructed.includes('')) {
            finalDoctorName = reconstructed;
            console.log('✅ [EMAIL] Fixed encoding (byte reconstruction), new name:', finalDoctorName);
          }
        }
      } catch (e) {
        console.warn('⚠️ [EMAIL] Could not fix encoding, using original:', e.message);
      }
    }
    
    // Only escape HTML special characters (not Greek letters)
    const escapeHTML = (str) => {
      if (!str) return '';
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    
    const safeDoctorName = escapeHTML(finalDoctorName);
    
    // Log for debugging
    console.log('📧 [EMAIL] Doctor name received (raw):', doctorName);
    console.log('📧 [EMAIL] Doctor name processed:', finalDoctorName);
    console.log('📧 [EMAIL] Doctor name type:', typeof finalDoctorName);
    console.log('📧 [EMAIL] Doctor name length:', finalDoctorName.length);
    if (typeof finalDoctorName === 'string') {
      const utf8Bytes = Buffer.from(finalDoctorName, 'utf8');
      console.log('📧 [EMAIL] Doctor name UTF-8 bytes:', utf8Bytes.toString('hex'));
      console.log('📧 [EMAIL] Doctor name as UTF-8 string:', utf8Bytes.toString('utf8'));
    }

    // Validation
    if (!parentEmail || !appointmentDate || !appointmentTime || !doctorName) {
      console.error('❌ [EMAIL] Missing required fields:', {
        parentEmail: !parentEmail,
        appointmentDate: !appointmentDate,
        appointmentTime: !appointmentTime,
        doctorName: !doctorName
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['parentEmail', 'appointmentDate', 'appointmentTime', 'doctorName']
        })
      };
    }

    // Μορφοποίηση ημερομηνίας (YYYY-MM-DD -> DD/MM/YYYY)
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr + 'T00:00:00');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Μορφοποίηση ώρας (HH:MM -> HH:MM)
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      return timeStr.substring(0, 5); // Παίρνουμε μόνο HH:MM
    };

    const formattedDate = formatDate(appointmentDate);
    const formattedTime = formatTime(appointmentTime);

    // Δημιουργία email body
    const emailBody = `Καλωσορίσατε,

Σας επιβεβαιώνουμε την πληρωμή σας στο Ιατρείο της Δρ. Φύτρου Άννα Μαρία.

Σας περιμένουμε την ${formattedDate} στις ${formattedTime} και σας παρακαλούμε να εγκαταστήσετε τις εφαρμογές Viber και WhatsApp προκειμένου η ειδικός ${finalDoctorName} να επικοινωνήσει μαζί σας.

Μέσα από την πλατφόρμα μας μπορείτε ενημερώνεστε για κάθε νέο του Ιατρείου και να ρυθμίσετε κάθε συνδιαλλαγή σας άμεσα και γρήγορα. 

Στην επιλογή «κατάθεση» του site μπορείτε να προπληρώσετε τις συνεδρίες του μήνα σας με όποια ειδικό συνεργάζεστε.

Ελπίζουμε να έχετε την ιδανικότερη των εμπειριών.

Με εκτίμηση,

Η ομάδα της Δρ. Φύτρου`;

    // Αποστολή email
    console.log('📧 [EMAIL] Sending confirmation email to:', parentEmail);
    console.log('📧 [EMAIL] Final doctor name being sent:', finalDoctorName);
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: parentEmail,
      subject: 'Επιβεβαίωση Κράτησης Ραντεβού - Ιατρείο Δρ. Φύτρου',
      text: emailBody,
      html: `
        <!DOCTYPE html>
        <html lang="el">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6B46C1; margin-bottom: 20px;">Καλωσορίσατε,</h2>
            
            <p>Σας επιβεβαιώνουμε την πληρωμή σας στο <strong>Ιατρείο της Δρ. Φύτρου Άννα Μαρία</strong>.</p>
            
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Ημερομηνία:</strong> ${formattedDate}</p>
              <p style="margin: 5px 0 0 0;"><strong>Ώρα:</strong> ${formattedTime}</p>
              <p style="margin: 5px 0 0 0;"><strong>Ειδικός:</strong> ${safeDoctorName}</p>
            </div>
            
            <p>Σας παρακαλούμε να εγκαταστήσετε τις εφαρμογές <strong>Viber</strong> και <strong>WhatsApp</strong> προκειμένου η ειδικός ${safeDoctorName} να επικοινωνήσει μαζί σας.</p>
            
            <p>Μέσα από την πλατφόρμα μας μπορείτε ενημερώνεστε για κάθε νέο του Ιατρείου και να ρυθμίσετε κάθε συνδιαλλαγή σας άμεσα και γρήγορα.</p>
            
            <p>Στην επιλογή «κατάθεση» του site μπορείτε να προπληρώσετε τις συνεδρίες του μήνα σας με όποια ειδικό συνεργάζεστε.</p>
            
            <p>Ελπίζουμε να έχετε την ιδανικότερη των εμπειριών.</p>
            
            <p style="margin-top: 30px;">Με εκτίμηση,<br><strong>Η ομάδα της Δρ. Φύτρου</strong></p>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ [EMAIL] Failed to send email:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to send email',
          details: error.message || error
        })
      };
    }

    console.log('✅ [EMAIL] Email sent successfully:', data?.id);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        messageId: data?.id,
        message: 'Email sent successfully'
      })
    };

  } catch (error) {
    console.error('❌ [EMAIL] Error in email function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || error.toString()
      })
    };
  }
};

