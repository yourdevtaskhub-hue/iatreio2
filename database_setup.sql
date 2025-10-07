-- Δημιουργία πίνακα reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  session_topic VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Δημιουργία index για γρήγορη αναζήτηση
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Δημιουργία function για ενημέρωση updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Καθαρισμός αν υπάρχει ήδη το trigger (idempotent)
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Ρύθμιση RLS (Row Level Security)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy για ανάγνωση approved reviews (δημόσια)
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
CREATE POLICY "Public can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

-- Policy για εισαγωγή νέων reviews (δημόσια)
DROP POLICY IF EXISTS "Public can insert reviews" ON reviews;
CREATE POLICY "Public can insert reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Policy για διαχείριση reviews (μόνο admin - θα χρειαστεί authentication)
DROP POLICY IF EXISTS "Admin can manage all reviews" ON reviews;
CREATE POLICY "Admin can manage all reviews" ON reviews
    FOR ALL USING (true);

-- =======================
-- Πίνακες για Ραντεβού
-- =======================

-- Γιατροί
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true
);

-- Διαθεσιμότητες
CREATE TABLE IF NOT EXISTS availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  increment_minutes INTEGER NOT NULL CHECK (increment_minutes IN (30,60))
);

-- Ραντεβού
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes IN (30,60)),
  parent_name VARCHAR(255) NOT NULL,
  child_age VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  concerns TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ρυθμίσεις Admin (global toggle για κλείδωμα μισάωρου)
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  lock_half_hour BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO admin_settings (id, lock_half_hour)
  VALUES (1, true)
  ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_availability_doctor_date ON availability(doctor_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_time ON appointments(doctor_id, date, time);
-- Αφαίρεση διπλοεγγραφών πριν τον unique index (κρατάμε την πρώτη εγγραφή ανά κλειδί)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY doctor_id, date, "time" ORDER BY created_at, id) AS rn
  FROM appointments
)
DELETE FROM appointments a
USING ranked r
WHERE a.id = r.id AND r.rn > 1;

-- Εγγύηση ότι δεν μπορεί να υπάρξει δεύτερη κράτηση στο ίδιο (γιατρός, ημερομηνία, ώρα)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'uniq_appointments_doctor_date_time'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX uniq_appointments_doctor_date_time ON appointments(doctor_id, date, "time")';
  END IF;
END $$;

-- ===== Validation: Επιτρέπουμε insert ραντεβού μόνο για πραγματικά διαθέσιμα slots =====
CREATE OR REPLACE FUNCTION validate_appointment_slot()
RETURNS TRIGGER AS $$
DECLARE
  avail RECORD;
  inc INT;
  mm INT;
  start_min INT;
  diff INT;
  lock_all_hour BOOLEAN;
  other_time TIME;
  other_exists INT;
BEGIN
  -- Βρες μια γραμμή διαθεσιμότητας που να καλύπτει το slot
  SELECT a.* INTO avail
  FROM availability a
  WHERE a.doctor_id = NEW.doctor_id
    AND a.date = NEW.date
    AND NEW.time >= a.start_time
    AND NEW.time < a.end_time
  ORDER BY a.start_time
  LIMIT 1;

  IF avail IS NULL THEN
    RAISE EXCEPTION 'No availability for doctor %, date %, time %', NEW.doctor_id, NEW.date, NEW.time USING ERRCODE = '23514';
  END IF;

  inc := avail.increment_minutes;
  mm := EXTRACT(MINUTE FROM NEW.time);
  start_min := EXTRACT(MINUTE FROM avail.start_time);
  diff := (mm - start_min);
  IF (diff % inc) <> 0 THEN
    RAISE EXCEPTION 'Time % is not aligned to increment %', NEW.time, inc USING ERRCODE = '23514';
  END IF;

  -- Ρύθμιση κλειδώματος μισάωρου
  SELECT lock_half_hour INTO lock_all_hour FROM admin_settings WHERE id = 1;
  IF COALESCE(lock_all_hour, TRUE) THEN
    IF mm = 0 THEN
      other_time := (DATE_TRUNC('hour', NEW.time) + INTERVAL '30 minutes')::time;
    ELSE
      other_time := (DATE_TRUNC('hour', NEW.time))::time;
    END IF;
    SELECT COUNT(*) INTO other_exists FROM appointments
      WHERE doctor_id = NEW.doctor_id AND date = NEW.date AND "time" = other_time;
    IF other_exists > 0 THEN
      RAISE EXCEPTION 'Half-hour lock active; other half already booked' USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_appointment_slot ON appointments;
CREATE TRIGGER trg_validate_appointment_slot
  BEFORE INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION validate_appointment_slot();

-- ===== Validation: Απαγόρευση επικάλυψης availability ίδιου γιατρού/ημέρας =====
CREATE OR REPLACE FUNCTION validate_availability_overlap()
RETURNS TRIGGER AS $$
DECLARE cnt INT; BEGIN
  SELECT COUNT(*) INTO cnt FROM availability
  WHERE doctor_id = NEW.doctor_id AND date = NEW.date
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    AND NOT (NEW.end_time <= start_time OR NEW.start_time >= end_time);
  IF cnt > 0 THEN
    RAISE EXCEPTION 'Overlapping availability exists for this doctor/date' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_availability_overlap ON availability;
CREATE TRIGGER trg_validate_availability_overlap
  BEFORE INSERT OR UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION validate_availability_overlap();

-- RLS Policies
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Δημόσια ανάγνωση διαθεσιμοτήτων και γιατρών
DROP POLICY IF EXISTS "Public can read doctors" ON doctors;
CREATE POLICY "Public can read doctors" ON doctors
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can read availability" ON availability;
CREATE POLICY "Public can read availability" ON availability
  FOR SELECT USING (true);

-- Δημόσια εισαγωγή ραντεβού (μελλοντικά μπορείτε να περιορίσετε με RPC)
DROP POLICY IF EXISTS "Public can insert appointments" ON appointments;
CREATE POLICY "Public can insert appointments" ON appointments
  FOR INSERT WITH CHECK (true);

-- Δημόσια ανάγνωση ραντεβού δεν επιτρέπεται
DROP POLICY IF EXISTS "No select appointments" ON appointments;
CREATE POLICY "No select appointments" ON appointments
  FOR SELECT USING (false);

-- Admin πλήρη πρόσβαση (με service key)
DROP POLICY IF EXISTS "Admin manage doctors" ON doctors;
CREATE POLICY "Admin manage doctors" ON doctors FOR ALL USING (true);
DROP POLICY IF EXISTS "Admin manage availability" ON availability;
CREATE POLICY "Admin manage availability" ON availability FOR ALL USING (true);
DROP POLICY IF EXISTS "Admin manage appointments" ON appointments;
CREATE POLICY "Admin manage appointments" ON appointments FOR ALL USING (true);
DROP POLICY IF EXISTS "Admin manage settings" ON admin_settings;
CREATE POLICY "Admin manage settings" ON admin_settings FOR ALL USING (true);