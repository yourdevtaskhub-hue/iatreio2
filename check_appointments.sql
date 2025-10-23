-- Έλεγχος ραντεβού στη βάση δεδομένων
-- Αντίγραψε και επικόλλησε αυτές τις εντολές στο SQL Editor του Supabase

-- 1. Έλεγχος όλων των ραντεβού
SELECT 
  id,
  doctor_id,
  date,
  time,
  parent_name,
  email,
  created_at
FROM appointments 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Έλεγχος πληρωμών
SELECT 
  id,
  doctor_id,
  amount_cents,
  currency,
  status,
  customer_email,
  parent_name,
  appointment_date,
  appointment_time,
  stripe_checkout_session_id,
  created_at
FROM payments 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Έλεγχος διαθεσιμότητας για συγκεκριμένη ημερομηνία
SELECT 
  doctor_id,
  date,
  start_time,
  end_time,
  increment_minutes
FROM availability 
WHERE date = '2025-10-31'
ORDER BY doctor_id, start_time;

-- 4. Έλεγχος κλειδωμένων slots για συγκεκριμένη ημερομηνία
SELECT 
  doctor_id,
  date,
  time,
  parent_name
FROM appointments 
WHERE date = '2025-10-31'
ORDER BY doctor_id, time;
