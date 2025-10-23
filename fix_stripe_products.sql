-- Fix stripe_products table by dropping and recreating with correct structure

-- Step 1: Drop the existing stripe_products table
DROP TABLE IF EXISTS public.stripe_products CASCADE;

-- Step 2: Recreate stripe_products table with correct structure
CREATE TABLE public.stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  stripe_product_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL UNIQUE,
  price_amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Enable Row Level Security (RLS) for stripe_products
ALTER TABLE public.stripe_products ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for stripe_products
CREATE POLICY "Allow read access to all users" ON public.stripe_products FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert access for authenticated users" ON public.stripe_products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow update access for authenticated users" ON public.stripe_products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow delete access for authenticated users" ON public.stripe_products FOR DELETE USING (auth.role() = 'authenticated');

-- Step 5: Insert the correct Stripe data for each doctor
INSERT INTO public.stripe_products (doctor_id, stripe_product_id, stripe_price_id, price_amount_cents, currency)
VALUES 
  ((SELECT id FROM public.doctors WHERE name = 'Dr. Άννα Μαρία Φύτρου'), 'prod_THkbc88bG9C1U8', 'price_1SLB6QAwY6mf2WfLSNsHk4ce', 13000, 'eur'),
  ((SELECT id FROM public.doctors WHERE name = 'Ιωάννα Πισσάρη'), 'prod_THkdxRaFgeJ7mp', 'price_1SLB8ZAwY6mf2WfLShw80BtB', 8000, 'eur'),
  ((SELECT id FROM public.doctors WHERE name = 'Σοφία Σπυριάδου'), 'prod_THkg6BB82IExTh', 'price_1SLBAjAwY6mf2WfLV3FDvzg5', 8000, 'eur'),
  ((SELECT id FROM public.doctors WHERE name = 'Ειρήνη Στεργίου'), 'prod_THkh1YK8JpUUfe', 'price_1SLBCNAwY6mf2WfLlFvGS1W1', 11000, 'eur')
ON CONFLICT (stripe_product_id) DO NOTHING;

-- Step 6: Verify the data was inserted correctly
SELECT 
    d.name as doctor_name,
    sp.stripe_product_id,
    sp.stripe_price_id,
    sp.price_amount_cents
FROM public.stripe_products sp
JOIN public.doctors d ON sp.doctor_id = d.id
ORDER BY d.name;
