# 🔐 Netlify Environment Variables Setup

## ⚠️ IMPORTANT: Environment Variables Required

Για να λειτουργήσουν τα Stripe functions, **ΠΡΕΠΕΙ** να ορίσεις τα environment variables στο Netlify Dashboard.

## 📋 Βήματα:

### 1. Πήγαινε στο Netlify Dashboard
- https://app.netlify.com
- Επίλεξε το site σου
- **Site settings** → **Environment variables**

### 2. Πρόσθεσε τα εξής Environment Variables:

#### Required Variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` (Live Secret Key - βρες στο Stripe Dashboard) | Stripe Live Secret Key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (Webhook Secret - βρες στο Stripe Dashboard) | Stripe Webhook Secret |
| `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Project URL |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...` (Service Role Key - βρες στο Supabase Dashboard) | Supabase Service Role Key |

**⚠️ ΣΗΜΕΙΩΣΗ:** Μην commit-άρεις τα actual values! Βρες τα από τα dashboards και πρόσθεσε τα μόνο στο Netlify Dashboard.

### 3. Scope (Production, Deploy previews, Branch deploys)
- Επίλεξε **"All scopes"** για όλα τα variables
- Ή τουλάχιστον **"Production"**

### 4. Redeploy
Αφού προσθέσεις τα variables:
- **Deploys** → **Trigger deploy** → **Deploy site**

## ✅ Έλεγχος

Μετά το deploy, δοκίμασε:
1. Μεμονωμένο ραντεβού → Stripe Checkout
2. Προπληρωμένες συνεδρίες → Stripe Checkout

Αν δεις errors, ελέγξω τα Netlify Function logs:
- **Functions** → **View function logs**

## 🔒 Security Note

⚠️ **ΜΗΝ** commit-άρεις secrets στο git!
- Τα secrets πρέπει να είναι **ΜΟΝΟ** στο Netlify Dashboard
- Το repository δεν πρέπει να περιέχει hardcoded keys
