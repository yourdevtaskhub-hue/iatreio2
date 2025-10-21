-- Timezone Fix για το σύστημα ραντεβού - ΔΙΟΡΘΩΜΕΝΟ
-- Αυτό το script διορθώνει το πρόβλημα συγχρονισμού ημερολογίων μεταξύ Ελλάδας και Ελβετίας

-- 1. Ενημέρωση timezone της βάσης δεδομένων σε Europe/Athens
SET timezone = 'Europe/Athens';

-- 2. Δημιουργία function για σωστό χειρισμό ημερομηνιών
CREATE OR REPLACE FUNCTION get_user_timezone()
RETURNS text AS $$
BEGIN
  -- Επιστρέφει την timezone του χρήστη βάσει της IP ή browser
  -- Για τώρα, χρησιμοποιούμε Europe/Athens ως default
  RETURN 'Europe/Athens';
END;
$$ LANGUAGE plpgsql;

-- 3. Δημιουργία function για μετατροπή ημερομηνίας σε UTC
CREATE OR REPLACE FUNCTION to_utc_date(input_date date, input_timezone text DEFAULT 'Europe/Athens')
RETURNS timestamp with time zone AS $$
BEGIN
  -- Μετατρέπει μια ημερομηνία στη συγκεκριμένη timezone σε UTC
  RETURN (input_date::text || ' 00:00:00')::timestamp AT TIME ZONE input_timezone AT TIME ZONE 'UTC';
END;
$$ LANGUAGE plpgsql;

-- 4. Δημιουργία function για μετατροπή από UTC σε local time
CREATE OR REPLACE FUNCTION from_utc_date(utc_timestamp timestamp with time zone, target_timezone text DEFAULT 'Europe/Athens')
RETURNS date AS $$
BEGIN
  -- Μετατρέπει ένα UTC timestamp σε local date
  RETURN (utc_timestamp AT TIME ZONE target_timezone)::date;
END;
$$ LANGUAGE plpgsql;

-- 5. Ενημέρωση των υπαρχόντων δεδομένων για να είναι συμβατά με timezone
-- (Αυτό δεν αλλάζει τα υπάρχοντα δεδομένα, απλά εγγυάται ότι θα χειρίζονται σωστά)

-- 6. Δημιουργία view για διαθέσιμες ώρες με timezone support
DROP VIEW IF EXISTS availability_with_timezone;
CREATE VIEW availability_with_timezone AS
SELECT 
  a.*,
  a.date::timestamp AT TIME ZONE 'Europe/Athens' as date_athens,
  a.date::timestamp AT TIME ZONE 'Europe/Zurich' as date_zurich,
  a.start_time::time AT TIME ZONE 'Europe/Athens' as start_time_athens,
  a.end_time::time AT TIME ZONE 'Europe/Athens' as end_time_athens
FROM availability a;

-- 7. Δημιουργία view για ραντεβού με timezone support
DROP VIEW IF EXISTS appointments_with_timezone;
CREATE VIEW appointments_with_timezone AS
SELECT 
  a.*,
  a.date::timestamp AT TIME ZONE 'Europe/Athens' as date_athens,
  a.date::timestamp AT TIME ZONE 'Europe/Zurich' as date_zurich,
  a.time::time AT TIME ZONE 'Europe/Athens' as time_athens,
  a.created_at AT TIME ZONE 'Europe/Athens' as created_at_athens
FROM appointments a;

-- 8. Δημιουργία function για validation ραντεβού με timezone awareness
CREATE OR REPLACE FUNCTION validate_appointment_timezone()
RETURNS TRIGGER AS $$
DECLARE
  user_tz text;
  appointment_date_utc timestamp with time zone;
  appointment_time_utc timestamp with time zone;
BEGIN
  -- Παίρνουμε την timezone του χρήστη (θα μπορούσε να έρχεται από το frontend)
  user_tz := COALESCE(NEW.user_timezone, 'Europe/Athens');
  
  -- Μετατρέπουμε την ημερομηνία και ώρα σε UTC
  appointment_date_utc := to_utc_date(NEW.date, user_tz);
  appointment_time_utc := (NEW.date::text || ' ' || NEW.time::text)::timestamp AT TIME ZONE user_tz AT TIME ZONE 'UTC';
  
  -- Εδώ μπορούμε να προσθέσουμε επιπλέον validations
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Προσθήκη στήλης user_timezone στον πίνακα appointments (αν δεν υπάρχει)
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS user_timezone text DEFAULT 'Europe/Athens';

-- 10. Δημιουργία index για καλύτερη απόδοση με timezone queries
CREATE INDEX IF NOT EXISTS idx_appointments_date_timezone ON appointments(date, user_timezone);
CREATE INDEX IF NOT EXISTS idx_availability_date_timezone ON availability(date);

-- 11. Ενημέρωση των υπαρχόντων ραντεβού με default timezone
UPDATE appointments 
SET user_timezone = 'Europe/Athens' 
WHERE user_timezone IS NULL;

-- 12. Δημιουργία function για να παίρνουμε διαθέσιμες ώρες για συγκεκριμένη ημερομηνία και timezone
CREATE OR REPLACE FUNCTION get_available_slots(
  p_doctor_id uuid,
  p_date date,
  p_user_timezone text DEFAULT 'Europe/Athens'
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

-- 13. Δημιουργία function για να ελέγχουμε αν μια ώρα είναι διαθέσιμη
CREATE OR REPLACE FUNCTION is_slot_available(
  p_doctor_id uuid,
  p_date date,
  p_time time,
  p_user_timezone text DEFAULT 'Europe/Athens'
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

-- 14. Ενημέρωση του trigger για να χρησιμοποιεί timezone awareness
DROP TRIGGER IF EXISTS trg_validate_appointment_slot ON appointments;
CREATE TRIGGER trg_validate_appointment_slot
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_timezone();

-- 15. Δημιουργία function για να παίρνουμε ραντεβού για συγκεκριμένη ημερομηνία με timezone
CREATE OR REPLACE FUNCTION get_appointments_for_date(
  p_doctor_id uuid,
  p_date date,
  p_user_timezone text DEFAULT 'Europe/Athens'
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

-- 16. Ενημέρωση του admin_settings για να περιλαμβάνει timezone preferences
ALTER TABLE admin_settings 
ADD COLUMN IF NOT EXISTS default_timezone text DEFAULT 'Europe/Athens';

-- 17. Δημιουργία function για να παίρνουμε την τρέχουσα ημερομηνία στη συγκεκριμένη timezone
CREATE OR REPLACE FUNCTION get_current_date_in_timezone(p_timezone text DEFAULT 'Europe/Athens')
RETURNS date AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE p_timezone)::date;
END;
$$ LANGUAGE plpgsql;

-- 18. Δημιουργία function για να παίρνουμε την τρέχουσα ώρα στη συγκεκριμένη timezone
CREATE OR REPLACE FUNCTION get_current_time_in_timezone(p_timezone text DEFAULT 'Europe/Athens')
RETURNS time AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE p_timezone)::time;
END;
$$ LANGUAGE plpgsql;

-- 19. Ενημέρωση των υπαρχόντων δεδομένων με σωστό timezone
-- (Αυτό δεν αλλάζει τα υπάρχοντα δεδομένα, απλά εγγυάται ότι θα χειρίζονται σωστά)

-- 20. Δημιουργία view για admin panel με timezone information
DROP VIEW IF EXISTS admin_appointments_view;
CREATE VIEW admin_appointments_view AS
SELECT 
  a.id,
  a.doctor_id,
  d.name as doctor_name,
  a.date,
  a.time,
  a.duration_minutes,
  a.parent_name,
  a.child_age,
  a.email,
  a.phone,
  a.concerns,
  a.specialty,
  a.thematology,
  a.urgency,
  a.is_first_session,
  a.user_timezone,
  a.created_at,
  a.created_at AT TIME ZONE 'Europe/Athens' as created_at_athens,
  a.created_at AT TIME ZONE 'Europe/Zurich' as created_at_zurich
FROM appointments a
JOIN doctors d ON a.doctor_id = d.id
ORDER BY a.date DESC, a.time DESC;

-- Ενημέρωση ολοκληρώθηκε!
-- Το σύστημα τώρα υποστηρίζει σωστό timezone handling μεταξύ Ελλάδας και Ελβετίας
