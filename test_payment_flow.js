// Script για δοκιμή του payment flow
console.log('🚀 [TEST] Testing Payment Flow...');
console.log('');

console.log('📋 [CHECKLIST] Βήματα για πλήρη δοκιμή:');
console.log('');

console.log('1. ✅ Stripe Webhook ρυθμισμένο:');
console.log('   - Endpoint: https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook');
console.log('   - Event: checkout.session.completed');
console.log('   - Secret: whsec_0idYvHmURXcSL9x8zaYUnMjmXJ6a54Yc');
console.log('');

console.log('2. ✅ Netlify Environment Variables:');
console.log('   - STRIPE_WEBHOOK_SECRET: whsec_0idYvHmURXcSL9x8zaYUnMjmXJ6a54Yc');
console.log('   - STRIPE_SECRET_KEY: sk_test_...');
console.log('   - SUPABASE_URL: https://vdrmgzoupwyisiyrnjdi.supabase.co');
console.log('   - SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
console.log('');

console.log('3. 🔄 Git Push & Deploy:');
console.log('   git add .');
console.log('   git commit -m "Fix webhook with correct secret"');
console.log('   git push');
console.log('');

console.log('4. 🧪 Δοκιμαστική Πληρωμή:');
console.log('   - Πήγαινε στο https://onlineparentteenclinic.netlify.app');
console.log('   - Κάνε κράτηση ραντεβού');
console.log('   - Χρησιμοποίησε test card: 4242 4242 4242 4242');
console.log('   - Ολοκλήρωσε την πληρωμή');
console.log('');

console.log('5. 📊 Έλεγχος Logs:');
console.log('   - Netlify Dashboard → Functions → stripe-webhook → Logs');
console.log('   - Ψάξε για: "Stripe Webhook received"');
console.log('   - Ψάξε για: "Processing checkout session completed"');
console.log('   - Ψάξε για: "Appointment created"');
console.log('');

console.log('6. 🗄️ Έλεγχος Database:');
console.log('   - Supabase Dashboard → SQL Editor');
console.log('   - Εκτέλεσε: check_appointments.sql');
console.log('   - Έλεγξε αν δημιουργήθηκε appointment');
console.log('   - Έλεγξε αν κλειδώθηκε η ώρα');
console.log('');

console.log('🎯 Αναμενόμενα Αποτελέσματα:');
console.log('✅ Webhook καλείται όταν ολοκληρώνεται η πληρωμή');
console.log('✅ Appointment δημιουργείται στη βάση δεδομένων');
console.log('✅ Payment status ενημερώνεται σε "completed"');
console.log('✅ Slot κλειδώνεται για την ώρα');
console.log('✅ Σύστημα ενημερώνεται σωστά');
console.log('');

console.log('🚨 Αν δεν λειτουργεί:');
console.log('1. Έλεγξε τα Netlify Function logs');
console.log('2. Έλεγξε το Stripe Dashboard → Webhooks → Recent deliveries');
console.log('3. Έλεγξε αν το webhook secret είναι σωστό');
console.log('4. Έλεγξε αν το endpoint URL είναι σωστό');
console.log('');

console.log('🎉 Το σύστημα είναι έτοιμο για δοκιμή!');
