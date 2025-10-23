-- Debug script to check doctor IDs and stripe_products data

-- Check all doctors
SELECT id, name FROM public.doctors ORDER BY name;

-- Check stripe_products data
SELECT 
    sp.id,
    sp.doctor_id,
    d.name as doctor_name,
    sp.stripe_product_id,
    sp.stripe_price_id,
    sp.price_amount_cents
FROM public.stripe_products sp
JOIN public.doctors d ON sp.doctor_id = d.id
ORDER BY d.name;

-- Check if there are any constraint violations
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass;
