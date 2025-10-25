-- Δημιουργία πίνακα waiting_list για αποθήκευση αιτημάτων λίστας αναμονής
CREATE TABLE IF NOT EXISTS waiting_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  preferred_date DATE,
  preferred_time TIME,
  message TEXT,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add doctor_id column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'waiting_list' AND column_name = 'doctor_id') THEN
        ALTER TABLE waiting_list ADD COLUMN doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Δημιουργία index για γρήγορη αναζήτηση
CREATE INDEX IF NOT EXISTS idx_waiting_list_created_at ON waiting_list(created_at);
CREATE INDEX IF NOT EXISTS idx_waiting_list_email ON waiting_list(email);
CREATE INDEX IF NOT EXISTS idx_waiting_list_doctor_id ON waiting_list(doctor_id);

-- Δημιουργία function για ενημέρωση updated_at
CREATE OR REPLACE FUNCTION update_waiting_list_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Καθαρισμός αν υπάρχει ήδη το trigger (idempotent)
DROP TRIGGER IF EXISTS update_waiting_list_updated_at ON waiting_list;
CREATE TRIGGER update_waiting_list_updated_at 
    BEFORE UPDATE ON waiting_list 
    FOR EACH ROW 
    EXECUTE FUNCTION update_waiting_list_updated_at_column();

-- Ρύθμιση RLS (Row Level Security)
ALTER TABLE waiting_list ENABLE ROW LEVEL SECURITY;

-- Policy για εισαγωγή νέων waiting list entries (δημόσια)
DROP POLICY IF EXISTS "Public can insert waiting list entries" ON waiting_list;
CREATE POLICY "Public can insert waiting list entries" ON waiting_list
    FOR INSERT WITH CHECK (true);

-- Policy για διαχείριση waiting list (μόνο admin)
DROP POLICY IF EXISTS "Admin can manage all waiting list entries" ON waiting_list;
CREATE POLICY "Admin can manage all waiting list entries" ON waiting_list
    FOR ALL USING (true);
