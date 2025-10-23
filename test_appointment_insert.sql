-- Test inserting an appointment with correct schema
INSERT INTO appointments (
    doctor_id,
    date,
    time,
    duration_minutes,
    parent_name,
    email,
    concerns
) VALUES (
    '6e4c30d9-d295-467f-be3c-86a0c2aa70e9',
    '2025-10-31',
    '09:00',
    30,
    'Test Parent',
    'test@example.com',
    'Test concerns'
);

-- Check if the appointment was created
SELECT * FROM appointments WHERE email = 'test@example.com' ORDER BY created_at DESC LIMIT 1;

-- Clean up test data
DELETE FROM appointments WHERE email = 'test@example.com';
