# 🎯 Manual Stripe Setup Guide

## Step 1: Create Stripe Products Manually

1. **Go to Stripe Dashboard** → **Products** → **Add Product**

2. **For Dr. Anna Maria Fytrou:**
   - Name: `Session with Dr. Anna Maria Fytrou`
   - Description: `Session with Dr. Anna Maria Fytrou - Child and Adolescent Psychiatrist & Psychotherapist`
   - Price: `€130.00`
   - Currency: `EUR`
   - **Save the Product ID and Price ID**

3. **For Ioanna:**
   - Name: `Session with Ioanna`
   - Description: `Session with Ioanna - Child Psychologist & Psychotherapist`
   - Price: `€80.00`
   - Currency: `EUR`
   - **Save the Product ID and Price ID**

4. **For Sofia:**
   - Name: `Session with Sofia`
   - Description: `Session with Sofia - Child Psychologist & Psychotherapist`
   - Price: `€80.00`
   - Currency: `EUR`
   - **Save the Product ID and Price ID**

5. **For Eirini:**
   - Name: `Session with Eirini`
   - Description: `Session with Eirini - Clinical Child Psychologist & Psychotherapist`
   - Price: `€110.00`
   - Currency: `EUR`
   - **Save the Product ID and Price ID**

## Step 2: Update Database

Run the SQL script `database_setup_stripe.sql` in your Supabase SQL editor, then update the placeholder values with your actual Stripe IDs:

```sql
UPDATE stripe_products 
SET stripe_product_id = 'your_actual_product_id', 
    stripe_price_id = 'your_actual_price_id' 
WHERE doctor_name = 'Dr. Anna Maria Fytrou';

UPDATE stripe_products 
SET stripe_product_id = 'your_actual_product_id', 
    stripe_price_id = 'your_actual_price_id' 
WHERE doctor_name = 'Ioanna';

UPDATE stripe_products 
SET stripe_product_id = 'your_actual_product_id', 
    stripe_price_id = 'your_actual_price_id' 
WHERE doctor_name = 'Sofia';

UPDATE stripe_products 
SET stripe_product_id = 'your_actual_product_id', 
    stripe_price_id = 'your_actual_price_id' 
WHERE doctor_name = 'Eirini';
```

## Step 3: Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Replace with your actual Stripe keys from the Dashboard → API Keys section.
