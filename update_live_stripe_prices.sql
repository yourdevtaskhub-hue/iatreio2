-- Update Stripe Products with LIVE Price IDs
-- Run this in Supabase SQL Editor

-- Map doctors to their live price IDs:
-- Anna Maria Fytrou: price_1SLr7cBYDGzP3ZGswdIz4n6W
-- Eirini Stergiou: price_1SLr7bBYDGzP3ZGsSGQtzqGI
-- Ioanna Pissari: price_1SLr7bBYDGzP3ZGssK9SUNtA
-- Sofia Spyriadou: price_1SLr7bBYDGzP3ZGsYt0pU9u4

-- Update Dr. Άννα Μαρία Φύτρου (Anna Maria Fytrou)
UPDATE public.stripe_products 
SET stripe_price_id = 'price_1SLr7cBYDGzP3ZGswdIz4n6W',
    updated_at = NOW()
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name LIKE '%Άννα%Φύτρου%' OR name LIKE '%Anna%Fytrou%' OR name LIKE '%Anna Maria%');

-- Update Ειρήνη Στεργίου (Eirini Stergiou)
UPDATE public.stripe_products 
SET stripe_price_id = 'price_1SLr7bBYDGzP3ZGsSGQtzqGI',
    updated_at = NOW()
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name LIKE '%Ειρήνη%' OR name LIKE '%Eirini%' OR name LIKE '%Stergiou%');

-- Update Ιωάννα Πισσαρί (Ioanna Pissari)
UPDATE public.stripe_products 
SET stripe_price_id = 'price_1SLr7bBYDGzP3ZGssK9SUNtA',
    updated_at = NOW()
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name LIKE '%Ιωάννα%' OR name LIKE '%Ioanna%' OR name LIKE '%Pissari%');

-- Update Σοφία Σπυριάδου (Sofia Spyriadou)
UPDATE public.stripe_products 
SET stripe_price_id = 'price_1SLr7bBYDGzP3ZGsYt0pU9u4',
    updated_at = NOW()
WHERE doctor_id = (SELECT id FROM public.doctors WHERE name LIKE '%Σοφία%' OR name LIKE '%Sofia%' OR name LIKE '%Spyriadou%');

-- Verify the updates
SELECT 
    d.id as doctor_id,
    d.name as doctor_name,
    sp.stripe_product_id,
    sp.stripe_price_id,
    sp.price_amount_cents,
    sp.updated_at
FROM public.stripe_products sp
JOIN public.doctors d ON sp.doctor_id = d.id
ORDER BY d.name;
