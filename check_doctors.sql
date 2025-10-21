-- Έλεγχος αν υπάρχουν οι γιατροί στη βάση δεδομένων
-- Εκτελέστε αυτό στο Supabase SQL Editor

-- 1. Έλεγχος όλων των γιατρών
SELECT id, name, specialty, active FROM doctors ORDER BY name;

-- 2. Έλεγχος συγκεκριμένων γιατρών
SELECT id, name, specialty, active FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
ORDER BY name;

-- 3. Έλεγχος ραντεβού ανά γιατρό
SELECT 
  d.name as doctor_name,
  d.id as doctor_id,
  COUNT(a.id) as total_appointments
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
WHERE d.name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
GROUP BY d.id, d.name
ORDER BY d.name;

-- 4. Αν δεν υπάρχουν γιατροί, προσθέστε τους:
-- INSERT INTO doctors (name, specialty, active) VALUES 
-- ('Ειρήνη Στεργίου', 'Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true),
-- ('Ιωάννα Πισσάρη', 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true),
-- ('Σοφία Σπυριάδου', 'Κλινική Παιδοψυχολόγος & Ψυχοθεραπεύτρια', true);
