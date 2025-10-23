-- Fix payments table by dropping and recreating with correct structure

-- Step 1: Drop the existing payments table
-- CASCADE will also drop any dependent objects (e.g., foreign key constraints)
DROP TABLE IF EXISTS public.payments CASCADE;

-- Step 2: Recreate payments table with correct structure
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  customer_email TEXT, -- Ensure this column exists
  parent_name TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  doctor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security (RLS) for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for payments
-- Allow inserts from all users (frontend)
CREATE POLICY "Allow insert for all users" ON public.payments
FOR INSERT WITH CHECK (TRUE);

-- Allow updates from all users (webhook)
CREATE POLICY "Allow update for all users" ON public.payments
FOR UPDATE USING (TRUE);

-- Allow read access to all users
CREATE POLICY "Allow read access to all users" ON public.payments FOR SELECT USING (TRUE);

-- Allow delete access for authenticated users (for security)
CREATE POLICY "Allow delete access for authenticated users" ON public.payments FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Set up trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'payments' AND table_schema = 'public'
ORDER BY ordinal_position;
