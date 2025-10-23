-- Check appointments table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Check if appointments table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'appointments'
) as table_exists;

-- Check appointments table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- Check recent appointments
SELECT * FROM appointments ORDER BY created_at DESC LIMIT 5;

-- Check if there are any constraints
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'appointments'::regclass;
