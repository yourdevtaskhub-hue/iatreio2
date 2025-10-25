-- Quick fix for waiting_list table - add doctor_id column
-- Run this in Supabase SQL Editor

-- Add doctor_id column to waiting_list table
ALTER TABLE waiting_list 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_waiting_list_doctor_id ON waiting_list(doctor_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'waiting_list' 
ORDER BY ordinal_position;
