# Webhook Debug Checklist - ΚΡΙΣΙΜΟ!

## 🚨 **Το Πρόβλημα**
Το `create-checkout-session` λειτουργεί κανονικά αλλά το `stripe-webhook` δεν καλείται, οπότε δεν δημιουργείται appointment.

## 🔍 **Debugging Steps**

### 1. **Έλεγχος Stripe Dashboard**
Πήγαινε στο [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**

**Ελέγξε:**
- ✅ **Endpoint URL**: `https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook`
- ✅ **Events**: `checkout.session.completed`
- ✅ **Status**: Active
- ✅ **Recent deliveries**: Υπάρχουν attempts;

### 2. **Έλεγχος Netlify Function Logs**
- Netlify Dashboard → Functions → stripe-webhook → Logs
- **Αν δεν υπάρχουν logs** = Το webhook δεν καλείται
- **Αν υπάρχουν logs** = Το webhook καλείται αλλά αποτυγχάνει

### 3. **Έλεγχος URL Format**
**Σωστό URL:**
```
https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook
```

**Λάθος URLs:**
```
https://onlineparentteenclinic.com/.netlify/functions/stripe-webhook  ❌
https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook/  ❌
```

### 4. **Test Webhook Manually**
Στο Stripe Dashboard → Webhooks → [Το webhook σου] → **Send test event**
- Επίλεξε `checkout.session.completed`
- Κάνε κλικ **"Send test event"**
- Έλεγξε τα Netlify logs

## 🛠️ **Πιθανές Λύσεις**

### **Λύση 1: Διόρθωση URL**
Αν το URL είναι λάθος στο Stripe Dashboard:
1. Πήγαινε στο Stripe Dashboard → Webhooks
2. Κάνε κλικ στο webhook σου
3. **Edit destination**
4. Άλλαξε το URL σε: `https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook`
5. **Save**

### **Λύση 2: Δημιουργία Νέου Webhook**
Αν το webhook δεν λειτουργεί:
1. **Delete** το παλιό webhook
2. **Create new webhook**
3. **Endpoint URL**: `https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook`
4. **Events**: `checkout.session.completed`
5. **Copy** το νέο signing secret
6. **Update** το `STRIPE_WEBHOOK_SECRET` στο Netlify

### **Λύση 3: Έλεγχος Environment Variables**
Στο Netlify Dashboard → Environment Variables:
- `STRIPE_WEBHOOK_SECRET` = [Το σωστό secret από το Stripe]
- `STRIPE_SECRET_KEY` = sk_test_...
- `SUPABASE_URL` = https://vdrmgzoupwyisiyrnjdi.supabase.co
- `SUPABASE_SERVICE_KEY` = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

## 📊 **Αναμενόμενα Logs**

**Στο Netlify Functions → stripe-webhook → Logs:**
```
🔍 [DEBUG] Stripe Webhook received: POST
🔍 [DEBUG] Event headers: {...}
✅ [SUCCESS] Webhook signature verified successfully
🔍 [DEBUG] Processing checkout session completed: cs_test_...
🔍 [DEBUG] Session metadata: {...}
🔍 [DEBUG] Updating payment status...
✅ [SUCCESS] Payment status updated
🔍 [DEBUG] Creating appointment...
✅ [SUCCESS] Appointment created: ...
```

## 🎯 **Αποτέλεσμα**

Μετά τη διόρθωση:
- ✅ **Webhook καλείται** όταν ολοκληρώνεται η πληρωμή
- ✅ **Appointment δημιουργείται** στη βάση δεδομένων
- ✅ **Slot κλειδώνεται** για την ώρα
- ✅ **Σύστημα ενημερώνεται** σωστά

**Το κλειδί είναι το σωστό webhook URL!** 🔑
