# 📧 Email Επιβεβαίωσης Ραντεβού - Οδηγίες Ρύθμισης

## Περιγραφή
Το σύστημα στέλνει αυτόματα email επιβεβαιώσεως στον χρήστη όταν:
1. Ολοκληρώνεται πληρωμή μέσω Stripe (από αρχική σελίδα ή user panel)
2. Γίνεται κράτηση ραντεβού με deposit (από user panel)

## Ρύθμιση Resend API

### 1. Δημιουργία Λογαριασμού Resend
1. Επισκεφτείτε το [Resend.com](https://resend.com)
2. Δημιουργήστε δωρεάν λογαριασμό
3. Επαληθεύστε το email σας

### 2. Λήψη API Key
1. Στο Resend Dashboard, πηγαίνετε στο **API Keys**
2. Κάντε κλικ **Create API Key**
3. Δώστε όνομα (π.χ. "Netlify Functions")
4. Αντιγράψτε το API Key (θα εμφανιστεί μόνο μία φορά!)

### 3. Επαλήθευση Email Address
Για να στέλνετε από το email του ιατρείου (`iatreiodrfytrou@gmail.com`):
1. Στο Resend Dashboard, πηγαίνετε στο **Emails** (ή **Domains**)
2. Κάντε κλικ **Add Email** (ή **Add Domain** αν θέλετε να χρησιμοποιήσετε custom domain)
3. Προσθέστε το email `iatreiodrfytrou@gmail.com`
4. Ελέγξτε το inbox του Gmail για email επαλήθευσης από το Resend
5. Κάντε κλικ στο link επαλήθευσης

**Εναλλακτικά - Domain Verification (Συνιστάται):**
Αν θέλετε να χρησιμοποιήσετε custom domain (π.χ. `onlineparentteenclinic.com`):
1. Στο Resend Dashboard, πηγαίνετε στο **Domains**
2. Κάντε κλικ **Add Domain**
3. Προσθέστε το domain σας
4. Προσθέστε τα DNS records που σας δίνει το Resend στο DNS provider σας
5. Περιμένετε την επαλήθευση (μπορεί να πάρει λίγες ώρες)

### 4. Environment Variables στο Netlify
1. Πηγαίνετε στο Netlify Dashboard → Site Settings → Environment Variables
2. Προσθέστε τα παρακάτω:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx  (το API key από το Resend)
FROM_EMAIL=iatreiodrfytrou@onlineparentteenclinic.com  (ή άλλο verified email του domain)
```

**Σημαντικό:** 
- **Δεν χρειάζεται** να προσθέσετε email στο Resend Dashboard. Μόλις το domain είναι verified, μπορείτε να στέλνετε από οποιαδήποτε διεύθυνση του domain (π.χ. `iatreiodrfytrou@onlineparentteenclinic.com`).
- **Για SPF (Enable Sending):** Χρειάζονται **ΚΑΙ τα δύο** records:
  - MX record: Name `send`, Value `feedback-smtp.eu-west-1.amazonses.com`, Priority `10`
  - TXT record: Name `send`, Value `v=spf1 include:amazonses.com ~all`
- Αν θέλετε να λαμβάνετε απαντήσεις, ρυθμίστε email forwarding (Netlify → Email forwarding) προς το Gmail σας.

### 5. Deploy
Μετά την προσθήκη των environment variables:
1. Κάντε `git push` για να trigger-άρετε νέο deploy
2. Το Netlify θα κάνει αυτόματα redeploy

## Δοκιμή

### Local Testing
```bash
# Εγκατάσταση dependencies
npm install

# Τρέξτε Netlify Dev
npm run dev:full

# Σε άλλο terminal, δοκιμάστε το email function:
curl -X POST http://localhost:8888/.netlify/functions/send-appointment-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "parentEmail": "test@example.com",
    "parentName": "Test User",
    "appointmentDate": "2024-12-25",
    "appointmentTime": "10:00",
    "doctorName": "Δρ. Φύτρου"
  }'
```

### Production Testing
1. Κάντε μια πραγματική κράτηση ραντεβού
2. Ελέγξτε τα logs στο Netlify Functions → stripe-webhook ή book-appointment-with-deposit
3. Θα πρέπει να δείτε: `✅ [EMAIL] Confirmation email sent successfully`

## Μήνυμα Email

Το email που στέλνεται περιέχει:
- Επιβεβαίωση πληρωμής
- Ημερομηνία και ώρα ραντεβού
- Όνομα ειδικού
- Οδηγίες για Viber/WhatsApp
- Πληροφορίες για την πλατφόρμα

## Troubleshooting

### Email δεν στέλνεται
1. Ελέγξτε τα logs στο Netlify Functions
2. Βεβαιωθείτε ότι το `RESEND_API_KEY` είναι σωστό
3. Ελέγξτε ότι το `FROM_EMAIL` είναι valid

### "Email service not configured"
- Το `RESEND_API_KEY` δεν είναι ορισμένο στο Netlify
- Προσθέστε το στο Environment Variables

### "Failed to send email"
- Ελέγξτε το Resend Dashboard για error details
- Βεβαιωθείτε ότι το email address (`iatreiodrfytrou@gmail.com`) είναι verified στο Resend
- Αν χρησιμοποιείτε custom domain, βεβαιωθείτε ότι είναι verified

## Αρχεία που Τροποποιήθηκαν

1. `netlify/functions/send-appointment-confirmation.js` - Email function
2. `netlify/functions/stripe-webhook.js` - Προσθήκη email call μετά από πληρωμή
3. `netlify/functions/book-appointment-with-deposit.js` - Προσθήκη email call μετά από deposit booking
4. `package.json` - Προσθήκη `resend` dependency

## Σημειώσεις

- Το email αποστολή είναι **non-blocking** - αν αποτύχει, δεν επηρεάζει την κράτηση
- Τα errors καταγράφονται στα logs για debugging
- Το Resend έχει δωρεάν tier με 3,000 emails/μήνα

