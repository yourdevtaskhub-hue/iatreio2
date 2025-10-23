-- Update Stripe Products with actual IDs from Stripe Dashboard
-- Run this in Supabase SQL Editor

-- Update Dr. Anna Maria Fytrou
UPDATE public.stripe_products 
SET stripe_product_id = 'prod_THkbc88bG9C1U8', 
    stripe_price_id = 'price_1SLB6QAwY6mf2WfLSNsHk4ce' 
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name = 'Dr. Anna Maria Fytrou');

-- Update Ioanna
UPDATE public.stripe_products 
SET stripe_product_id = 'prod_THkdxRaFgeJ7mp', 
    stripe_price_id = 'price_1SLB8ZAwY6mf2WfLShw80BtB' 
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name = 'Ioanna');

-- Update Sofia
UPDATE public.stripe_products 
SET stripe_product_id = 'prod_THkg6BB82IExTh', 
    stripe_price_id = 'price_1SLBAjAwY6mf2WfLV3FDvzg5' 
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name = 'Sofia');

-- Update Eirini
UPDATE public.stripe_products 
SET stripe_product_id = 'prod_THkh1YK8JpUUfe', 
    stripe_price_id = 'price_1SLBCNAwY6mf2WfLlFvGS1W1' 
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name = 'Eirini');

-- Verify the updates
SELECT 
    d.name as doctor_name,
    sp.stripe_product_id,
    sp.stripe_price_id,
    sp.price_amount_cents
FROM public.stripe_products sp
JOIN public.doctors d ON sp.doctor_id = d.id
ORDER BY d.name;
