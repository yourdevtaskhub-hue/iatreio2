-- SQL script to create test accounts for timezone integration tests
-- Run this before executing the test suite

-- Create test doctor account (Zurich timezone)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'doctor_zurich@test.local',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create test patient account (Athens timezone)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'patient_athens@test.local',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create second test patient for concurrency tests
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'patient2@test.local',
  crypt('test123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create test doctor record
INSERT INTO doctors (id, name, specialty, active)
SELECT 
  gen_random_uuid(),
  'Test Doctor Zurich',
  'Test Specialty',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM doctors WHERE name = 'Test Doctor Zurich'
);

-- Update appointments table to ensure user_timezone column exists
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS user_timezone text DEFAULT 'Europe/Athens';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_timezone 
ON appointments(user_timezone);

-- Note: You may need to adjust the table names and structure
-- based on your actual database schema

