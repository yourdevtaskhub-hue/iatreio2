-- Πολύ απλός καθαρισμός διπλών εγγραφών
-- Εκτελέστε αυτό στο Supabase SQL Editor

-- 1. Έλεγχος διπλών εγγραφών
SELECT name, COUNT(*) as count 
FROM doctors 
WHERE name IN ('Ειρήνη Στεργίου', 'Ιωάννα Πισσάρη', 'Σοφία Σπυριάδου')
GROUP BY name 
HAVING COUNT(*) > 1;

-- 2. Διαγραφή της δεύτερης εγγραφής της Ειρήνης (με το μεγαλύτερο ID)
DELETE FROM doctors 
WHERE name = 'Ειρήνη Στεργίου' 
AND id = 'f2f115c8-981b-40e0-8a54-230976e29330';

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
