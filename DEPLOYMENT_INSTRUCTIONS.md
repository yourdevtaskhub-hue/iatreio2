# 🚀 Manual Deployment Instructions

## 📋 **Production Deployment Checklist**

### **1. Environment Setup**

#### **Frontend (.env.local)**
```bash
VITE_SUPABASE_URL=https://vdrmgzoupwyisiyrnjdi.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
VITE_FRONTEND_URL=https://onlineparentteenclinic.com
```

#### **Server (server.env)**
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
SUPABASE_URL=https://vdrmgzoupwyisiyrnjdi.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_key_here
FRONTEND_URL=https://onlineparentteenclinic.com
```

### **2. Build & Deploy Frontend**

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Upload dist/ folder to your web server
# Point domain to the dist/ folder
```

### **3. Deploy Express Server**

```bash
# Install server dependencies
npm install express cors stripe @supabase/supabase-js

# Start server
node server.js
```

### **4. Stripe Webhook Setup**

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**: `https://onlineparentteenclinic.com/api/stripe-webhook`
3. **Events**: `checkout.session.completed`, `payment_intent.succeeded`
4. **Copy webhook secret** to server.env

### **5. Database Setup**

Run these SQL scripts in Supabase:
- `database_setup_stripe.sql`
- `fix_stripe_products.sql`
- `fix_payments_table.sql`
- `fix_rls_policies.sql`

### **6. Test Everything**

1. **Frontend**: Visit `https://onlineparentteenclinic.com`
2. **Contact Form**: Fill out appointment form
3. **Stripe Payment**: Complete test payment
4. **Check Database**: Verify payment and appointment records
5. **Webhook**: Check server logs for webhook events

### **7. Go Live!**

1. **Switch Stripe to Live Mode**
2. **Update environment variables with live keys**
3. **Test with real payment (small amount)**
4. **Monitor for 24 hours**

---

## 🔧 **Files to Deploy**

### **Frontend Files:**
- `dist/` folder (after `npm run build`)
- `.env.local` with production keys

### **Server Files:**
- `server.js`
- `server.env` with production keys
- `package.json` (server dependencies)

### **Database:**
- Run all SQL scripts in Supabase
- Verify RLS policies are enabled

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **CORS errors**: Check server CORS settings
2. **Webhook not working**: Verify endpoint URL and secret
3. **Database errors**: Check RLS policies
4. **Payment not completing**: Check Stripe logs

### **Debug Steps:**
1. Check browser console for errors
2. Check server logs for webhook events
3. Check Stripe Dashboard for payment status
4. Check Supabase for database records

---

## 📞 **Support**

If you need help:
- Check server logs
- Check Stripe Dashboard
- Check Supabase Dashboard
- Verify all environment variables are set