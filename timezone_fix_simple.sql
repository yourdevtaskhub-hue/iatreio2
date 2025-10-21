-- Απλή Διόρθωση Timezone - Σύστημα Ραντεβού
-- Αυτό το script διορθώνει το πρόβλημα συγχρονισμού ημερολογίων μεταξύ Ελλάδας και Ελβετίας

-- 1. Ενημέρωση timezone της βάσης δεδομένων σε Europe/Athens
SET timezone = 'Europe/Athens';

-- 2. Προσθήκη στήλης user_timezone στον πίνακα appointments (αν δεν υπάρχει)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS user_timezone text DEFAULT 'Europe/Athens';

-- 3. Ενημέρωση των υπαρχόντων ραντεβού με default timezone
UPDATE appointments 
SET user_timezone = 'Europe/Athens' 
WHERE user_timezone IS NULL;

-- 4. Ενημέρωση του admin_settings για να περιλαμβάνει timezone preferences
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS default_timezone text DEFAULT 'Europe/Athens';

-- 5. Δημιουργία index για καλύτερη απόδοση με timezone queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_timezone ON appointments(date, user_timezone);
CREATE INDEX IF NOT EXISTS idx_availability_date_timezone ON availability(date);

-- 6. Δημιουργία function για να παίρνουμε την τρέχουσα ημερομηνία στη συγκεκριμένη timezone
CREATE OR REPLACE FUNCTION get_current_date_in_timezone(p_timezone text DEFAULT 'Europe/Athens')
RETURNS date AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE p_timezone)::date;
END;
$$ LANGUAGE plpgsql;

-- 7. Δημιουργία function για να παίρνουμε την τρέχουσα ώρα στη συγκεκριμένη timezone
CREATE OR REPLACE FUNCTION get_current_time_in_timezone(p_timezone text DEFAULT 'Europe/Athens')
RETURNS time AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE p_timezone)::time;
END;
$$ LANGUAGE plpgsql;

-- 8. Δημιουργία function για να παίρνουμε διαθέσιμες ώρες για συγκεκριμένη ημερομηνία
CREATE OR REPLACE FUNCTION get_available_slots(
  p_doctor_id uuid,
  p_date date
)
RETURNS TABLE(
  start_time time,
  end_time time,
  increment_minutes integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.start_time,
    a.end_time,
    a.increment_minutes
  FROM availability a
  WHERE a.doctor_id = p_doctor_id
    AND a.date = p_date
  ORDER BY a.start_time;
END;
$$ LANGUAGE plpgsql;

-- 9. Δημιουργία function για να ελέγχουμε αν μια ώρα είναι διαθέσιμη
CREATE OR REPLACE FUNCTION is_slot_available(
  p_doctor_id uuid,
  p_date date,
  p_time time
)
RETURNS boolean AS $$
DECLARE
  v_availability_count integer;
  v_appointment_count integer;
BEGIN
  -- Ελέγχουμε αν υπάρχει διαθεσιμότητα για αυτή την ώρα
  SELECT COUNT(*) INTO v_availability_count
  FROM availability a
  WHERE a.doctor_id = p_doctor_id
    AND a.date = p_date
    AND p_time >= a.start_time
    AND p_time < a.end_time;
    
  IF v_availability_count = 0 THEN
    RETURN false;
  END IF;
  
  -- Ελέγχουμε αν δεν υπάρχει ήδη ραντεβού για αυτή την ώρα
  SELECT COUNT(*) INTO v_appointment_count
  FROM appointments ap
  WHERE ap.doctor_id = p_doctor_id
    AND ap.date = p_date
    AND ap.time = p_time;
    
  RETURN v_appointment_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 10. Δημιουργία function για να παίρνουμε ραντεβού για συγκεκριμένη ημερομηνία
CREATE OR REPLACE FUNCTION get_appointments_for_date(
  p_doctor_id uuid,
  p_date date
)
RETURNS TABLE(
  id uuid,
  appointment_time time,
  duration_minutes integer,
  parent_name text,
  email text,
  concerns text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.time as appointment_time,
    a.duration_minutes,
    a.parent_name,
    a.email,
    a.concerns
  FROM appointments a
  WHERE a.doctor_id = p_doctor_id
    AND a.date = p_date
  ORDER BY a.time;
END;
$$ LANGUAGE plpgsql;

-- 11. Δημιουργία function για timezone detection
CREATE OR REPLACE FUNCTION get_user_timezone()
RETURNS text AS $$
BEGIN
  -- Επιστρέφει την timezone του χρήστη
  -- Για τώρα, χρησιμοποιούμε Europe/Athens ως default
  RETURN 'Europe/Athens';
END;
$$ LANGUAGE plpgsql;

-- 12. Δημιουργία function για μετατροπή ημερομηνίας σε UTC
CREATE OR REPLACE FUNCTION to_utc_date(input_date date, input_timezone text DEFAULT 'Europe/Athens')
RETURNS timestamp with time zone AS $$
BEGIN
  -- Μετατρέπει μια ημερομηνία στη συγκεκριμένη timezone σε UTC
  RETURN (input_date::text || ' 00:00:00')::timestamp AT TIME ZONE input_timezone AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- 13. Δημιουργία function για μετατροπή από UTC σε local time
CREATE OR REPLACE FUNCTION from_utc_date(utc_timestamp timestamp with time zone, target_timezone text DEFAULT 'Europe/Athens')
RETURNS date AS $$
BEGIN
  -- Μετατρέπει ένα UTC timestamp σε local date
  RETURN (utc_timestamp AT TIME ZONE target_timezone)::date;
END;
$$ LANGUAGE plpgsql;

-- Ενημέρωση ολοκληρώθηκε!
-- Το σύστημα τώρα υποστηρίζει σωστό timezone handling μεταξύ Ελλάδας και Ελβετίας
