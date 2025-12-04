// Netlify Function για αποστολή email ειδοποίησης στον γιατρό για νέα κράτηση
const { Resend } = require('resend');

// Initialize Resend
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Email από το οποίο θα στέλνονται τα emails
const FROM_EMAIL = process.env.FROM_EMAIL || 'iatreiodrfytrou@onlineparentteenclinic.com';

// Mapping γιατρών με emails
const DOCTOR_EMAILS = {
  'Ιωάννα Πισσάρη': 'ioannapissari@outlook.com',
  'Ioanna Pissari': 'ioannapissari@outlook.com',
  'Σοφία Σπυριάδου': 'sofiasprd@icloud.com',
  'Sofia Spyriadou': 'sofiasprd@icloud.com',
  'Ειρήνη Στεργίου': 'eirini.ster88@gmail.com',
  'Eirini Stergiou': 'eirini.ster88@gmail.com',
  // Dr. Φύτρου - όλες οι παραλλαγές
  'Dr. Άννα Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Dr. Anna-Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Dr. Anna Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Δρ. Άννα Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Δρ. Άννα-Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Anna-Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Anna Maria Fytrou': 'iatreiodrfytrou@gmail.com',
  'Άννα Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com',
  'Άννα-Μαρία Φύτρου': 'iatreiodrfytrou@gmail.com'
};

// Helper function για format ημερομηνίας
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
}

// Helper function για format ώρας
function formatTime(timeString) {
  if (!timeString) return '';
  // Αν είναι ήδη σε format HH:MM, επιστρέφει το ίδιο
  if (timeString.includes(':')) {
    return timeString.substring(0, 5); // Πρώτα 5 χαρακτήρες (HH:MM)
  }
  return timeString;
}

exports.handler = async (event) => {
  console.log('📧 [DOCTOR_EMAIL] ===== Doctor Notification Email Function Called =====');
  
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
    console.error('❌ [DOCTOR_EMAIL] RESEND_API_KEY not configured');
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
    let bodyString = event.body || '{}';
    if (event.isBase64Encoded) {
      bodyString = Buffer.from(bodyString, 'base64').toString('utf8');
    }
    
    const payload = JSON.parse(bodyString);
    console.log('🔍 [DOCTOR_EMAIL] Email payload:', JSON.stringify(payload, null, 2));

    const {
      doctorName,
      doctorId,
      appointmentDate,
      appointmentTime,
      parentName,
      parentEmail,
      parentPhone,
      childAge,
      concerns,
      specialty,
      thematology,
      urgency,
      isFirstSession
    } = payload;

    // Ελέγχουμε αν υπάρχει email για τον γιατρό
    // Κάνουμε trim και normalize το όνομα για να ταιριάξει
    const normalizedDoctorName = doctorName ? doctorName.trim() : '';
    console.log(`🔍 [DOCTOR_EMAIL] Looking up email for doctor: "${normalizedDoctorName}"`);
    let doctorEmail = DOCTOR_EMAILS[normalizedDoctorName];
    
    // Αν δεν βρέθηκε, δοκιμάζουμε case-insensitive search
    if (!doctorEmail && normalizedDoctorName) {
      const lowerName = normalizedDoctorName.toLowerCase();
      for (const [key, email] of Object.entries(DOCTOR_EMAILS)) {
        if (key.toLowerCase() === lowerName) {
          doctorEmail = email;
          console.log(`✅ [DOCTOR_EMAIL] Found email via case-insensitive match: ${key} -> ${email}`);
          break;
        }
      }
    }
    
    // Αν ακόμα δεν βρέθηκε, δοκιμάζουμε partial match για όλους τους γιατρούς
    if (!doctorEmail && normalizedDoctorName) {
      const nameLower = normalizedDoctorName.toLowerCase();
      
      // Partial match για Dr. Φύτρου
      if (nameLower.includes('fytrou') || nameLower.includes('φύτρου') || 
          (nameLower.includes('anna') && nameLower.includes('maria')) ||
          (nameLower.includes('άννα') && nameLower.includes('μαρία'))) {
        doctorEmail = DOCTOR_EMAILS['Dr. Άννα Μαρία Φύτρου'] || 
                      DOCTOR_EMAILS['Dr. Anna-Maria Fytrou'] ||
                      DOCTOR_EMAILS['Δρ. Άννα Μαρία Φύτρου'] ||
                      'iatreiodrfytrou@gmail.com';
        console.log(`✅ [DOCTOR_EMAIL] Found email via partial match for Dr. Fytrou: ${doctorEmail}`);
      }
      // Partial match για Ιωάννα Πισσάρη
      else if (nameLower.includes('pissari') || nameLower.includes('πισσάρη') || 
               nameLower.includes('ioanna') || nameLower.includes('ιωάννα')) {
        doctorEmail = 'ioannapissari@outlook.com';
        console.log(`✅ [DOCTOR_EMAIL] Found email via partial match for Ioanna Pissari: ${doctorEmail}`);
      }
      // Partial match για Σοφία Σπυριάδου
      else if (nameLower.includes('spyriadou') || nameLower.includes('σπυριάδου') || 
               nameLower.includes('sofia') || nameLower.includes('σοφία')) {
        doctorEmail = 'sofiasprd@icloud.com';
        console.log(`✅ [DOCTOR_EMAIL] Found email via partial match for Sofia Spyriadou: ${doctorEmail}`);
      }
      // Partial match για Ειρήνη Στεργίου
      else if (nameLower.includes('stergiou') || nameLower.includes('στεργίου') || 
               nameLower.includes('eirini') || nameLower.includes('ειρήνη')) {
        doctorEmail = 'eirini.ster88@gmail.com';
        console.log(`✅ [DOCTOR_EMAIL] Found email via partial match for Eirini Stergiou: ${doctorEmail}`);
      }
    }
    
    if (!doctorEmail) {
      console.error(`❌ [DOCTOR_EMAIL] No email configured for doctor: "${normalizedDoctorName}"`);
      console.error(`❌ [DOCTOR_EMAIL] Available doctor names: ${Object.keys(DOCTOR_EMAILS).join(', ')}`);
      console.error(`❌ [DOCTOR_EMAIL] Doctor ID: ${doctorId}`);
      // Αντί να skip, θα στέλνουμε σε ένα default email για debugging
      // Αλλά πρώτα ας δοκιμάσουμε να πάρουμε το email από το doctorId αν είναι διαθέσιμο
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'No email configured for this doctor',
          doctorName: normalizedDoctorName,
          doctorId: doctorId,
          skipped: true
        })
      };
    }
    
    console.log(`✅ [DOCTOR_EMAIL] Sending email to: ${doctorEmail} for doctor: ${normalizedDoctorName}`);

    const formattedDate = formatDate(appointmentDate);
    const formattedTime = formatTime(appointmentTime);

    // HTML email template
    const htmlContent = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Νέα Κράτηση Ραντεβού</title>
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
    <h2 style="color: #6B46C1; margin-bottom: 20px;">Νέα Κράτηση Ραντεβού</h2>
    
    <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #4B5563; margin-top: 0;">Στοιχεία Ραντεβού</h3>
      <p style="margin: 5px 0;"><strong>Ημερομηνία:</strong> ${formattedDate}</p>
      <p style="margin: 5px 0;"><strong>Ώρα:</strong> ${formattedTime}</p>
    </div>
    
    <div style="background-color: #EFF6FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #4B5563; margin-top: 0;">Στοιχεία Γονέα</h3>
      <p style="margin: 5px 0;"><strong>Όνομα:</strong> ${parentName || '—'}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${parentEmail || '—'}</p>
      ${parentPhone ? `<p style="margin: 5px 0;"><strong>Τηλέφωνο:</strong> ${parentPhone}</p>` : ''}
      ${childAge ? `<p style="margin: 5px 0;"><strong>Ηλικία Παιδιού:</strong> ${childAge}</p>` : ''}
    </div>
    
    ${specialty || thematology || urgency !== undefined || isFirstSession !== undefined ? `
    <div style="background-color: #F0FDF4; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #4B5563; margin-top: 0;">Συμπληρωμένες Πληροφορίες</h3>
      ${specialty ? `<p style="margin: 5px 0;"><strong>Ειδικότητα:</strong> ${specialty}</p>` : ''}
      ${thematology ? `<p style="margin: 5px 0;"><strong>Θεματολογία:</strong> ${thematology}</p>` : ''}
      ${urgency !== undefined ? `<p style="margin: 5px 0;"><strong>Επείγον:</strong> ${urgency || 'Όχι'}</p>` : ''}
      ${isFirstSession !== undefined ? `<p style="margin: 5px 0;"><strong>Πρώτη Συνεδρία:</strong> ${isFirstSession ? 'Ναι' : 'Όχι'}</p>` : ''}
    </div>
    ` : ''}
    
    ${concerns ? `
    <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #4B5563; margin-top: 0;">Σύντομη Περιγραφή Ανησυχιών</h3>
      <p style="margin: 0; white-space: pre-wrap;">${concerns}</p>
    </div>
    ` : ''}
    
    ${(() => {
      let panelUrl = '';
      if (doctorName === 'Ιωάννα Πισσάρη' || doctorName === 'Ioanna Pissari') {
        panelUrl = 'https://onlineparentteenclinic.com/ioanna';
      } else if (doctorName === 'Σοφία Σπυριάδου' || doctorName === 'Sofia Spyriadou') {
        panelUrl = 'https://onlineparentteenclinic.com/sofia';
      } else if (doctorName === 'Ειρήνη Στεργίου' || doctorName === 'Eirini Stergiou') {
        panelUrl = 'https://onlineparentteenclinic.com/eirini';
      } else {
        // Check for Dr. Fytrou variations
        const nameLower = (doctorName || '').toLowerCase();
        if (nameLower.includes('fytrou') || nameLower.includes('φύτρου') || 
            (nameLower.includes('anna') && nameLower.includes('maria')) ||
            (nameLower.includes('άννα') && nameLower.includes('μαρία'))) {
          panelUrl = 'https://onlineparentteenclinic.com/anna';
        }
      }
      return panelUrl ? `<p style="margin-top: 30px; color: #6B7280; font-size: 14px;">Μπορείτε να δείτε όλες τις κρατήσεις σας στο <a href="${panelUrl}" style="color: #6B46C1;">Doctor Panel</a>.</p>` : '';
    })()}
  </div>
</body>
</html>`;

    // Plain text version
    const textContent = `Νέα Κράτηση Ραντεβού

Στοιχεία Ραντεβού:
- Ημερομηνία: ${formattedDate}
- Ώρα: ${formattedTime}

Στοιχεία Γονέα:
- Όνομα: ${parentName || '—'}
- Email: ${parentEmail || '—'}
${parentPhone ? `- Τηλέφωνο: ${parentPhone}` : ''}
${childAge ? `- Ηλικία Παιδιού: ${childAge}` : ''}

${specialty || thematology || urgency !== undefined || isFirstSession !== undefined ? `Συμπληρωμένες Πληροφορίες:
${specialty ? `- Ειδικότητα: ${specialty}` : ''}
${thematology ? `- Θεματολογία: ${thematology}` : ''}
${urgency !== undefined ? `- Επείγον: ${urgency || 'Όχι'}` : ''}
${isFirstSession !== undefined ? `- Πρώτη Συνεδρία: ${isFirstSession ? 'Ναι' : 'Όχι'}` : ''}
` : ''}
${concerns ? `Σύντομη Περιγραφή Ανησυχιών:
${concerns}
` : ''}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: doctorEmail,
      subject: `Νέα Κράτηση Ραντεβού - ${formattedDate} ${formattedTime}`,
      text: textContent,
      html: htmlContent
    });

    if (error) {
      console.error('❌ [DOCTOR_EMAIL] Failed to send email:', error);
      throw error;
    }

    console.log('✅ [DOCTOR_EMAIL] Doctor notification email sent successfully:', data);
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
    console.error('❌ [DOCTOR_EMAIL] Error sending doctor notification email:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        message: error?.message || 'Unknown error'
      })
    };
  }
};

