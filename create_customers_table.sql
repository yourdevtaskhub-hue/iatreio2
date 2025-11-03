-- Δημιουργία πίνακα πελατών (customers) συνδεδεμένου με Supabase Auth
-- Ο πίνακας αυτός αποθηκεύει επιπλέον πληροφορίες για τους πελάτες πέρα από τα βασικά auth

-- Ενεργοποίηση extension αν δεν υπάρχει
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Δημιουργία πίνακα customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Δημιουργία index για γρηγορότερη αναζήτηση
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Ενεργοποίηση Row Level Security (RLS)
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policy: Οι πελάτες μπορούν να βλέπουν μόνο το δικό τους προφίλ
DROP POLICY IF EXISTS "Customers are viewable by owner" ON public.customers;
CREATE POLICY "Customers are viewable by owner"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Οι πελάτες μπορούν να δημιουργούν το δικό τους προφίλ
DROP POLICY IF EXISTS "Customers can insert their own profile" ON public.customers;
CREATE POLICY "Customers can insert their own profile"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Οι πελάτες μπορούν να ενημερώνουν μόνο το δικό τους προφίλ
DROP POLICY IF EXISTS "Customers can update their own profile" ON public.customers;
CREATE POLICY "Customers can update their own profile"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

-- Function για αυτόματη ενημέρωση του updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger για ενημέρωση updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.customers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function για αυτόματη δημιουργία customer record μετά το signup
-- (Θα μπορούσε να καλείται από trigger, αλλά είναι πιο ασφαλές να γίνεται από την εφαρμογή)
-- Για τώρα θα το χειριζόμαστε από το frontend/backend
