-- Εντολές για το Supabase SQL Editor
-- Αντίγραψε και επικόλλησε αυτές τις εντολές στο SQL Editor του Supabase

-- 1. Προσθήκη νέων στηλών στον πίνακα appointments
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS specialty VARCHAR(255),
ADD COLUMN IF NOT EXISTS thematology VARCHAR(255),
ADD COLUMN IF NOT EXISTS urgency VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_first_session BOOLEAN DEFAULT false;

-- 2. Ενημέρωση υπάρχοντος ραντεβού με default τιμές
UPDATE appointments 
SET 
  specialty = 'Παιδοψυχίατρος',
  thematology = 'firstSession',
  urgency = 'normal',
  is_first_session = true
WHERE specialty IS NULL;

-- 3. Δημιουργία indexes για καλύτερη απόδοση
CREATE INDEX IF NOT EXISTS idx_appointments_specialty ON appointments(specialty);
CREATE INDEX IF NOT EXISTS idx_appointments_thematology ON appointments(thematology);
CREATE INDEX IF NOT EXISTS idx_appointments_urgency ON appointments(urgency);

-- 4. Έλεγχος αποτελέσματος
SELECT 
  id,
  doctor_id,
  date,
  time,
  parent_name,
  email,
  specialty,
  thematology,
  urgency,
  is_first_session,
  concerns
FROM appointments 
ORDER BY created_at DESC;
