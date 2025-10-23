-- Create stripe_products table
CREATE TABLE IF NOT EXISTS public.stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  stripe_product_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  price_amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for stripe_products
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stripe_products
CREATE POLICY "Allow read access to all users" ON public.stripe_products FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access for authenticated users" ON public.stripe_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access for authenticated users" ON public.stripe_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access for authenticated users" ON public.stripe_products FOR DELETE USING (auth.role() = 'authenticated');

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  customer_email TEXT,
  parent_name TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  doctor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Allow read access to all users" ON public.payments FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access for authenticated users" ON public.payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access for authenticated users" ON public.payments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access for authenticated users" ON public.payments FOR DELETE USING (auth.role() = 'authenticated');

-- Set up trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stripe_products_updated_at BEFORE UPDATE ON public.stripe_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial stripe_products records for each doctor
INSERT INTO public.stripe_products (doctor_id, stripe_product_id, stripe_price_id, price_amount_cents, currency)
VALUES 
  ((SELECT id FROM public.doctors WHERE name = 'Dr. Anna Maria Fytrou'), 'prod_THkbc88bG9C1U8', 'price_1SLB6QAwY6mf2WfLSNsHk4ce', 13000, 'eur'),
  ((SELECT id FROM public.doctors WHERE name = 'Ioanna'), 'prod_THkdxRaFgeJ7mp', 'price_1SLB8ZAwY6mf2WfLShw80BtB', 8000, 'eur'),
  ((SELECT id FROM public.doctors WHERE name = 'Sofia'), 'prod_THkg6BB82IExTh', 'price_1SLBAjAwY6mf2WfLV3FDvzg5', 8000, 'eur'),
  ((SELECT id FROM public.doctors WHERE name = 'Eirini'), 'prod_THkh1YK8JpUUfe', 'price_1SLBCNAwY6mf2WfLlFvGS1W1', 11000, 'eur')
ON CONFLICT (stripe_product_id) DO NOTHING;