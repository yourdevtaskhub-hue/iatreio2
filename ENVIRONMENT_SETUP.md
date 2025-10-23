# Environment Variables Setup

## Προαπαιτούμενα

Για να λειτουργήσει η εφαρμογή, χρειάζεστε τα ακόλουθα environment variables:

## 1. Stripe Configuration

1. Πηγαίνετε στο [Stripe Dashboard](https://dashboard.stripe.com/)
2. Στο Developer > API Keys, αντιγράψτε:
   - **Secret Key** (ξεκινάει με `sk_test_` για test mode)
   - **Webhook Secret** (από Webhooks section)

## 2. Supabase Configuration

1. Πηγαίνετε στο [Supabase Dashboard](https://supabase.com/dashboard)
2. Επιλέξτε το project σας
3. Πηγαίνετε στο Settings > API
4. Αντιγράψτε:
   - **Project URL**
   - **Service Role Key** (secret)

## 3. Environment Files Setup

### Για Development:
1. Αντιγράψτε το `env.example` σε `.env`
2. Συμπληρώστε τις πραγματικές τιμές:

```bash
cp env.example .env
```

### Για Production:
1. Ρυθμίστε τα environment variables στο deployment platform σας
2. Χρησιμοποιήστε production Stripe keys (ξεκινάνε με `sk_live_`)

## 4. Required Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_actual_service_key_here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 5. Security Notes

- **ΜΗΝ** κάνετε commit τα πραγματικά API keys στο Git
- Χρησιμοποιήστε πάντα environment variables
- Το `.env` αρχείο είναι ήδη στο `.gitignore`
- Για production, χρησιμοποιήστε secure secret management

## 6. Verification

Για να ελέγξετε ότι όλα λειτουργούν:

1. Ξεκινήστε τον server: `npm run dev`
2. Ελέγξτε τα logs για errors
3. Δοκιμάστε να δημιουργήσετε ένα checkout session
