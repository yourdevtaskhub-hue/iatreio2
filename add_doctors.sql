-- Προσθήκη των 3 γιατρών στη βάση δεδομένων
-- Αντίγραψε και επικόλλησε αυτές τις εντολές στο SQL Editor του Supabase

-- 1. Δημιουργία unique constraint για το όνομα (αν δεν υπάρχει)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_doctor_name'
    ) THEN
        ALTER TABLE doctors ADD CONSTRAINT unique_doctor_name UNIQUE (name);
    END IF;
END $$;

-- 2. Προσθήκη των γιατρών (αν δεν υπάρχουν ήδη)
INSERT INTO doctors (name, specialty, active) VALUES 
('Ειρήνη Στεργίου', 'Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true),
('Ιωάννα Πισσάρη', 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true),
('Σοφία Σπυριάδου', 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true)
ON CONFLICT (name) DO NOTHING;

-- 2. Έλεγχος ότι προστέθηκαν σωστά
SELECT id, name, specialty, active FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
ORDER BY name;

-- 3. Έλεγχος ραντεβού ανά γιατρό
SELECT 
  d.name as doctor_name,
  COUNT(a.id) as total_appointments
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
WHERE d.name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
GROUP BY d.id, d.name
ORDER BY d.name;

-- 4. Έλεγχος κριτικών ανά γιατρό (αν υπάρχει στήλη doctor_id στον πίνακα reviews)
-- SELECT 
--   d.name as doctor_name,
--   COUNT(r.id) as total_reviews
-- FROM doctors d
-- LEFT JOIN reviews r ON d.id = r.doctor_id
-- WHERE d.name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
-- GROUP BY d.id, d.name
-- ORDER BY d.name;
