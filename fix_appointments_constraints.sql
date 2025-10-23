-- Fix appointments table constraints

-- 1. Drop the duration_minutes check constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_duration_minutes_check;

-- 2. Add a new duration_minutes check constraint that allows 30 minutes
ALTER TABLE appointments ADD CONSTRAINT appointments_duration_minutes_check 
CHECK (duration_minutes = 30);

-- 3. Fix the foreign key constraint to CASCADE instead of SET NULL
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;

ALTER TABLE appointments ADD CONSTRAINT appointments_doctor_id_fkey 
FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE;

-- 4. Check the current constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass;

-- 5. Test inserting an appointment
INSERT INTO appointments (
    doctor_id,
    date,
    time,
    duration_minutes,
    parent_name,
    email,
    concerns,
    payment_id
) VALUES (
    '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
    '2025-10-31',
    '09:00',
    30,
    'Test Parent',
    'test@example.com',
    'Test concerns',
    'test-payment-123'
);

-- 6. Check if the appointment was created
SELECT * FROM appointments WHERE payment_id = 'test-payment-123';

-- 7. Clean up test data
DELETE FROM appointments WHERE payment_id = 'test-payment-123';
