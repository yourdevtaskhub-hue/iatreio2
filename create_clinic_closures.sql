-- New table: clinic_closures
-- This script ONLY adds new objects; it does not modify existing schema.

-- Table
CREATE TABLE IF NOT EXISTS clinic_closures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NULL REFERENCES doctors(id) ON DELETE SET NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple check to ensure date_to >= date_from
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'clinic_closures_date_range_check'
  ) THEN
    ALTER TABLE clinic_closures
      ADD CONSTRAINT clinic_closures_date_range_check
      CHECK (date_to >= date_from);
  END IF;
END $$;

-- Indexes for fast lookups per doctor and date intervals
CREATE INDEX IF NOT EXISTS idx_clinic_closures_doctor ON clinic_closures(doctor_id);
CREATE INDEX IF NOT EXISTS idx_clinic_closures_dates ON clinic_closures(date_from, date_to);

-- RLS
ALTER TABLE clinic_closures ENABLE ROW LEVEL SECURITY;

-- Public can read closures (needed by public booking calendar)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clinic_closures' AND policyname = 'Public can read clinic_closures'
  ) THEN
    CREATE POLICY "Public can read clinic_closures" ON clinic_closures
      FOR SELECT USING (true);
  END IF;
END $$;

-- Admin full access (service role)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'clinic_closures' AND policyname = 'Admin manage clinic_closures'
  ) THEN
    CREATE POLICY "Admin manage clinic_closures" ON clinic_closures FOR ALL USING (true);
  END IF;
END $$;


