# 🧪 ΔΗΜΙΟΥΡΓΙΑ TEST PRODUCT €1 ΓΙΑ LIVE TESTING

## 📋 **Βήμα προς Βήμα Οδηγία:**

---

## 1️⃣ **Πήγαινε στο Stripe Dashboard**

1. **URL:** https://dashboard.stripe.com
2. **Login** με τα credentials σου
3. **Επιβεβαίωσε:** Είσαι σε **Live Mode**

---

## 2️⃣ **Δημιούργησε Test Doctor στο Stripe**

1. **Πήγαινε σε:** Product catalog → Products
2. **Κάνε κλικ** στο "Add product"
3. **Συμπλήρωσε:**
   - **Name:** "Test €1 Session - Live Mode Verification"
   - **Description:** "Test payment for live mode verification - €1"
4. **Κάνε κλικ** στο "Create product"

---

## 3️⃣ **Δημιούργησε Price (€1.00)**

1. **Στο product που μόλις δημιούργησες**
2. **Κάνε κλικ** στο "Add another price"
3. **Συμπλήρωσε:**
   - **Pricing model:** Standard pricing
   - **Price:** 1.00
   - **Currency:** EUR
   - **Billing period:** One time
4. **Κάνε κλικ** στο "Save price"

---

## 4️⃣ **Αντέγραψε το Price ID**

1. **Από το product page:**
   - Θα δεις: **"Default price"** = `price_...`
2. **Αντέγραψε** το Price ID (ξεκινάει με `price_`)

---

## 5️⃣ **Ενημέρωσε τη Βάση**

**Εκτέλεσε στο Supabase SQL Editor:**

```sql
-- Βρες το doctor ID για τον test doctor
-- (Αν δεν υπάρχει, δημιούργησε έναν test doctor)

-- Ενημέρωσε το stripe_products table με το €1 price
UPDATE stripe_products 
SET stripe_price_id = 'price_YOUR_1_EURO_PRICE_ID_HERE'
WHERE doctor_id = (SELECT id FROM doctors WHERE name = 'Test Doctor');
```

**Ή αν θέλεις να δημιουργήσεις καινούργια εγγραφή:**

```sql
-- Δημιούργησε test doctor αν δεν υπάρχει
INSERT INTO doctors (name, specialty, active)
VALUES ('Test Doctor', 'Test Specialist', true)
ON CONFLICT DO NOTHING;

-- Δημιούργησε stripe_product για test doctor
INSERT INTO stripe_products (doctor_id, stripe_product_id, stripe_price_id, price_amount_cents, currency)
VALUES 
  ((SELECT id FROM doctors WHERE name = 'Test Doctor'), 
   'prod_YOUR_PRODUCT_ID',
   'price_YOUR_PRICE_ID',
   100, -- €1.00 = 100 cents
   'eur')
ON CONFLICT DO NOTHING;
```

---

## 6️⃣ **Test το Payment**

1. **Πήγαινε στο:** https://perentteenonlineclinic.com
2. **Επίλεξε** τον "Test Doctor"
3. **Κάνε booking** με πραγματική κάρτα
4. **Πληρώσε** €1.00
5. **Επιβεβαίωσε** στο Stripe Dashboard

---

## ✅ **Επιτυχημένη Επιβεβαίωση:**

### **Αν Βλέπεις:**
- ✅ Payment €1.00 στο Stripe Dashboard
- ✅ Status = Succeeded
- ✅ Payment στην βάση με status = 'completed'
- ✅ Appointment στην βάση

### **Τότε:**
🎉 **Το σύστημα λειτουργεί 100% με πραγματικές πληρωμές!**

---

## 🚨 **Σημαντικά:**

### **💰 Μόνο €1**
- Αυτό είναι το φθηνότερο package
- Μόνο για test verification
- Θα χρεωθεί η κάρτα σου

### **🔒 Security**
- Χρησιμοποίησε πραγματική κάρτα
- Ελέγχε το Stripe Dashboard
- Verify το payment record

---

## 🎉 **Ready for Production!**

**Μετά το successful test, μπορείς να κάνεις full production!**
