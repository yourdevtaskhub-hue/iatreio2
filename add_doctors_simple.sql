-- Απλή προσθήκη των 3 γιατρών στη βάση δεδομένων
-- Αντίγραψε και επικόλλησε αυτές τις εντολές στο SQL Editor του Supabase

-- 1. Έλεγχος αν υπάρχουν ήδη οι γιατροί
SELECT name FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου');

-- 2. Προσθήκη των γιατρών (εκτελέστε μόνο αν δεν υπάρχουν)
INSERT INTO doctors (name, specialty, active) VALUES 
('Ειρήνη Στεργίου', 'Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true),
('Ιωάννα Πισσάρη', 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true),
('Σοφία Σπυριάδου', 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true);

-- 3. Έλεγχος ότι προστέθηκαν σωστά
SELECT id, name, specialty, active FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
ORDER BY name;

-- 4. Έλεγχος ραντεβού ανά γιατρό
SELECT 
  d.name as doctor_name,
  COUNT(a.id) as total_appointments
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
WHERE d.name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
GROUP BY d.id, d.name
ORDER BY d.name;
