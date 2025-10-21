-- Απλός καθαρισμός διπλών εγγραφών γιατρών
-- Εκτελέστε αυτό στο Supabase SQL Editor

-- 1. Έλεγχος διπλών εγγραφών
SELECT name, COUNT(*) as count 
FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
GROUP BY name 
HAVING COUNT(*) > 1;

-- 2. Διαγραφή διπλών εγγραφών (διαγράφουμε την δεύτερη)
DELETE FROM doctors 
WHERE id IN (
  SELECT id FROM (
    SELECT id, name,
           ROW_NUMBER() OVER (PARTITION BY TRIM(name) ORDER BY id) as rn
    FROM doctors 
    WHERE name IN ('Ειρήνη Στεργίου', 'Ειρήνη Στεργίου ', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
  ) ranked
  WHERE rn > 1
);

-- 3. Ενημέρωση ονομάτων (αφαίρεση κενών στο τέλος)
UPDATE doctors 
SET name = TRIM(name)
WHERE name LIKE '% ';

-- 4. Έλεγχος αποτελέσματος
SELECT id, name, specialty, active FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
ORDER BY name;

-- 5. Έλεγχος ραντεβού ανά γιατρό
SELECT 
  d.name as doctor_name,
  d.id as doctor_id,
  COUNT(a.id) as total_appointments
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
WHERE d.name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
GROUP BY d.id, d.name
ORDER BY d.name;
