-- ============================================================
-- VERIFICATION QUERIES FOR APPOINTMENT STATUS MIGRATION
-- ============================================================
-- Run these queries to verify the migration succeeded
-- Run them BEFORE and AFTER migration for comparison
-- ============================================================

-- ============================================================
-- QUERY 1: Overall status count and distribution
-- ============================================================
SELECT 
  COUNT(*) as total_appointments,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as null_status,
  COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked_count,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'available' THEN 1 END) as available_count,
  COUNT(CASE WHEN status NOT IN ('booked', 'cancelled', 'pending', 'available') AND status IS NOT NULL THEN 1 END) as invalid_status
FROM public.appointments;

-- ============================================================
-- QUERY 2: Status distribution grouped (debug view)
-- ============================================================
SELECT 
  COALESCE(status, 'NULL') as status_value,
  COUNT(*) as count
FROM public.appointments
GROUP BY status
ORDER BY count DESC;

-- ============================================================
-- QUERY 3: Check for constraint violations (should be empty)
-- ============================================================
SELECT 
  id, doctor_id, date, time, status, created_at
FROM public.appointments
WHERE status NOT IN ('booked', 'cancelled', 'pending', 'available')
  AND status IS NOT NULL
ORDER BY created_at DESC;

-- ============================================================
-- QUERY 4: Check for potential double-bookings (should be empty)
-- ============================================================
-- This query finds slots that have multiple 'booked' entries
-- or multiple NULL entries (which treat as booked)
-- ============================================================
SELECT 
  doctor_id, date, time,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as appointment_ids,
  STRING_AGG(status, ', ') as statuses
FROM public.appointments
WHERE status = 'booked' OR status IS NULL
GROUP BY doctor_id, date, time
HAVING COUNT(*) > 1
ORDER BY date DESC, time DESC;

-- ============================================================
-- QUERY 5: Sample 20 recent appointments with full details
-- ============================================================
SELECT 
  id,
  doctor_id,
  date,
  time,
  duration_minutes,
  parent_name,
  email,
  status,
  user_timezone,
  created_at,
  created_at AT TIME ZONE 'Europe/Athens' as created_at_athens,
  created_at AT TIME ZONE 'Europe/Zurich' as created_at_zurich
FROM public.appointments
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================
-- QUERY 6: Index verification (check if indexes exist)
-- ============================================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'appointments'
ORDER BY indexname;

-- ============================================================
-- QUERY 7: Check for slow queries (appointments without status in WHERE)
-- ============================================================
-- This helps identify queries that might still be using old logic
-- Run a sample to see current patterns
-- ============================================================
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'booked' THEN 1 END) as explicitly_booked,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as implicitly_booked_null,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
  COUNT(CASE WHEN status IN ('booked', NULL) OR status IS NULL THEN 1 END) as available_for_rebooking
FROM public.appointments;

-- ============================================================
-- QUERY 8: Timeline analysis (when appointments were made/cancelled)
-- ============================================================
SELECT 
  DATE_TRUNC('day', created_at AT TIME ZONE 'Europe/Athens') as day_athens,
  COUNT(*) as total_created,
  COUNT(CASE WHEN status = 'booked' THEN 1 END) as status_booked,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as status_cancelled,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as status_null
FROM public.appointments
GROUP BY DATE_TRUNC('day', created_at AT TIME ZONE 'Europe/Athens')
ORDER BY day_athens DESC
LIMIT 30;

-- ============================================================
-- QUERY 9: Doctor-wise appointment status breakdown
-- ============================================================
SELECT 
  d.name as doctor_name,
  COUNT(a.id) as total_appointments,
  COUNT(CASE WHEN a.status = 'booked' OR a.status IS NULL THEN 1 END) as active_bookings,
  COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_bookings,
  COUNT(CASE WHEN a.status IS NULL THEN 1 END) as null_status_count
FROM public.doctors d
LEFT JOIN public.appointments a ON d.id = a.doctor_id
GROUP BY d.id, d.name
ORDER BY total_appointments DESC;

-- ============================================================
-- QUERY 10: Constraint and index verification
-- ============================================================
SELECT 
  constraint_name,
  constraint_type,
  is_deferrable,
  initially_deferred
FROM information_schema.table_constraints
WHERE table_name = 'appointments'
ORDER BY constraint_type;
