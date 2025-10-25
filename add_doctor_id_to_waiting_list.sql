-- Migration script to add doctor_id column to waiting_list table
-- Run this in your Supabase SQL editor

-- Add doctor_id column to waiting_list table
ALTER TABLE waiting_list 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_waiting_list_doctor_id ON waiting_list(doctor_id);

-- Update existing records if needed (optional - only if you have existing data)
-- UPDATE waiting_list SET doctor_id = (SELECT id FROM doctors LIMIT 1) WHERE doctor_id IS NULL;
