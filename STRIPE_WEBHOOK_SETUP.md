# Stripe Webhook Setup - ΚΡΙΣΙΜΟ!

## 🚨 **Το Πρόβλημα**
Η πληρωμή γίνεται επιτυχώς αλλά το webhook δεν καλείται, οπότε:
- Δεν δημιουργείται appointment
- Δεν κλειδώνεται η ώρα
- Το σύστημα δεν ενημερώνεται

## 🔧 **Λύση - Stripe Dashboard Configuration**

### 1. **Πήγαινε στο Stripe Dashboard**
- Άνοιξε το [Stripe Dashboard](https://dashboard.stripe.com)
- Πήγαινε στο **Developers** → **Webhooks**

### 2. **Δημιούργησε Νέο Webhook**
- Κάνε κλικ **"Add endpoint"**
- **Endpoint URL**: `https://onlineparentteenclinic.netlify.app/.netlify/functions/stripe-webhook`
- **Events to send**: Επίλεξε **"checkout.session.completed"**

### 3. **Αντιγράψε το Webhook Secret**
- Αφού δημιουργηθεί το webhook, αντιγράψε το **Signing secret**
- Πήγαινε στο Netlify Dashboard → Environment Variables
- Ενημέρωσε το `STRIPE_WEBHOOK_SECRET` με το νέο secret

## 🔍 **Debugging Steps**

### 1. **Έλεγχος Netlify Functions Logs**
- Netlify Dashboard → Functions → stripe-webhook → Logs
- Ψάξε για τα logs που πρόσθεσα:
  - `🔍 [DEBUG] Stripe Webhook received`
  - `✅ [SUCCESS] Webhook signature verified`
  - `🔍 [DEBUG] Processing checkout session completed`

### 2. **Έλεγχος Stripe Dashboard**
- Stripe Dashboard → Webhooks → [Το webhook σου]
- Έλεγξε τα **Recent deliveries**
- Δες αν υπάρχουν failed attempts

### 3. **Test Webhook Endpoint**
```bash
node debug_webhook.js
```

## 📋 **Αναμενόμενα Logs**

Μετά τη ρύθμιση του webhook, θα πρέπει να δεις:

```
🔍 [DEBUG] Stripe Webhook received: POST
🔍 [DEBUG] Event headers: {...}
✅ [SUCCESS] Webhook signature verified successfully
✅ [SUCCESS] Webhook signature verified. Event type: checkout.session.completed
🔍 [DEBUG] Processing checkout session completed: cs_test_...
🔍 [DEBUG] Session metadata: {...}
🔍 [DEBUG] Updating payment status...
✅ [SUCCESS] Payment status updated
🔍 [DEBUG] Creating appointment...
✅ [SUCCESS] Payment ... and Appointment ... completed successfully.
```

## ⚠️ **Σημαντικά**

- **Χωρίς webhook ρύθμιση** = Δεν λειτουργεί το σύστημα
- **Λάθος webhook secret** = Signature verification fails
- **Λάθος endpoint URL** = Webhook δεν φτάνει στο Netlify

## 🎯 **Αποτέλεσμα**

Μετά τη σωστή ρύθμιση:
- ✅ **Webhook καλείται** όταν ολοκληρώνεται η πληρωμή
- ✅ **Appointment δημιουργείται** αυτόματα
- ✅ **Slot κλειδώνεται** για την ώρα
- ✅ **Σύστημα ενημερώνεται** σωστά

**Αυτό είναι το κλειδί για να λειτουργήσει το σύστημα!** 🔑
