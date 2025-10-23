# 🎯 **Ολοκληρωμένος Οδηγός Ενσωμάτωσης Stripe**

## 📋 **Επισκόπηση**

Αυτός ο οδηγός σας καθοδηγεί βήμα-βήμα για την πλήρη ενσωμάτωση πληρωμών Stripe στον ιστότοπό σας, με πραγματικά δεδομένα και όχι προσομοιώσεις.

---

## 🚀 **ΒΗΜΑ 1: Stripe Account Setup**

### 1.1 Δημιουργία Stripe Account
1. **Πήγαινε στο [stripe.com](https://stripe.com)**
2. **Κάνε εγγραφή** με τα στοιχεία του business σου
3. **Επιβεβαίωσε το email** σου
4. **Συμπλήρωσε τις επιπλέον πληροφορίες**

### 1.2 Λήψη API Keys
1. **Dashboard** → **Developers** → **API keys**
2. **Αντιγράφεις:**
   - **Publishable key** (ξεκινάει με `pk_test_`)
   - **Secret key** (ξεκινάει με `sk_test_`)

### 1.3 Environment Variables
Δημιούργησε `.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🛍️ **ΒΗΜΑ 2: Stripe Products Setup**

### 2.1 Δημιουργία Products στο Stripe Dashboard

**Για Dr. Anna Maria Fytrou:**
- Name: `Session with Dr. Anna Maria Fytrou`
- Price: `€130.00`
- Currency: `EUR`

**Για Ioanna:**
- Name: `Session with Ioanna`
- Price: `€80.00`
- Currency: `EUR`

**Για Sofia:**
- Name: `Session with Sofia`
- Price: `€80.00`
- Currency: `EUR`

**Για Eirini:**
- Name: `Session with Eirini`
- Price: `€110.00`
- Currency: `EUR`

### 2.2 Database Setup
Εκτέλεσε το SQL script `database_setup_stripe.sql` στο Supabase:

```sql
-- Create stripe_products table
CREATE TABLE IF NOT EXISTS stripe_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_name VARCHAR(255) NOT NULL,
    stripe_product_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
    price_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'eur',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_session_id VARCHAR(255) UNIQUE,
    doctor_id UUID REFERENCES doctors(id),
    doctor_name VARCHAR(255) NOT NULL,
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'eur',
    status VARCHAR(50) NOT NULL,
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    appointment_date DATE,
    appointment_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.3 Ενημέρωση Database με Stripe IDs
```sql
UPDATE stripe_products 
SET stripe_product_id = 'prod_your_actual_id', 
    stripe_price_id = 'price_your_actual_id' 
WHERE doctor_name = 'Dr. Anna Maria Fytrou';
```

---

## 🔧 **ΒΗΜΑ 3: Backend Integration**

### 3.1 API Endpoints
Τα παρακάτω endpoints έχουν δημιουργηθεί:

- **`/api/create-checkout-session`** - Δημιουργία Stripe Checkout
- **`/api/stripe-webhook`** - Επεξεργασία webhooks

### 3.2 Webhook Configuration
1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint:** `https://your-domain.com/api/stripe-webhook`
3. **Events:** `checkout.session.completed`, `payment_intent.succeeded`

---

## 🎨 **ΒΗΜΑ 4: Frontend Integration**

### 4.1 Contact Form Updates
Το Contact Form τώρα:
- ✅ Εμφανίζει Stripe Checkout modal
- ✅ Δεν κάνει προσομοίωση πληρωμής
- ✅ Ανακατευθύνει στο Stripe Checkout

### 4.2 New Components
- **`StripeCheckout.tsx`** - Stripe Checkout component
- **`payment-success.tsx`** - Success page
- **`usePayments.ts`** - Hook για payments data

---

## 👩‍⚕️ **ΒΗΜΑ 5: Doctor Wallets**

### 5.1 Real-time Data
Τα Doctor Panels τώρα εμφανίζουν:
- ✅ Πραγματικά έσοδα από Stripe
- ✅ Στατιστικά συνεδριών
- ✅ Ιστορικό πληρωμών
- ✅ Real-time ενημερώσεις

### 5.2 Admin Wallet
Το Admin Panel έχει νέο tab "Το Ταμείο μου" με:
- ✅ Συνολικά έσοδα όλων των γιατρών
- ✅ Στατιστικά ανά μήνα
- ✅ Λίστα όλων των πληρωμών

---

## 🧪 **ΒΗΜΑ 6: Testing**

### 6.1 Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### 6.2 Testing Checklist
- [ ] Contact Form → Stripe Checkout
- [ ] Successful payment → Database update
- [ ] Doctor Panel → Real payment data
- [ ] Admin Panel → Wallet statistics
- [ ] Webhook processing
- [ ] Email confirmations

---

## 🚀 **ΒΗΜΑ 7: Deployment**

### 7.1 Environment Variables (Production)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
```

### 7.2 Webhook URL (Production)
```
https://your-domain.com/api/stripe-webhook
```

### 7.3 Database Migration
1. Εκτέλεσε `database_setup_stripe.sql`
2. Ενημέρωσε τα Stripe IDs με τα production values
3. Δοκίμασε με test payments

---

## 🔒 **ΒΗΜΑ 8: Security & Best Practices**

### 8.1 Security Checklist
- [ ] Environment variables σε `.env.local`
- [ ] Webhook signature verification
- [ ] HTTPS για production
- [ ] Rate limiting για API endpoints

### 8.2 Monitoring
- **Stripe Dashboard** → **Payments** για monitoring
- **Supabase Dashboard** → **Logs** για debugging
- **Webhook logs** στο Stripe Dashboard

---

## 📞 **ΒΗΜΑ 9: Go Live**

### 9.1 Pre-Launch Checklist
- [ ] Test με real test cards
- [ ] Verify webhook functionality
- [ ] Check email notifications
- [ ] Test doctor panels
- [ ] Verify admin wallet

### 9.2 Launch Steps
1. **Switch to Live Mode** στο Stripe
2. **Update environment variables**
3. **Test με real payment**
4. **Monitor για 24 ώρες**

---

## 🆘 **Troubleshooting**

### Common Issues
1. **Webhook not working:** Check URL και signature
2. **Payment not recorded:** Check webhook events
3. **Doctor panel empty:** Check database connections
4. **Environment variables:** Verify `.env.local` file

### Support
- **Stripe Documentation:** https://stripe.com/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Check logs:** Browser console και server logs

---

## 🎉 **Ολοκλήρωση**

Μετά την ολοκλήρωση όλων των βημάτων, θα έχεις:

✅ **Πλήρη Stripe integration**
✅ **Real-time payment processing**
✅ **Doctor wallets με πραγματικά δεδομένα**
✅ **Admin wallet για όλους τους γιατρούς**
✅ **Secure payment handling**
✅ **Professional user experience**

**Καλή τύχη με την ενσωμάτωση! 🚀**
