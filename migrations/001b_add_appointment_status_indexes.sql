-- ============================================================
-- PRODUCTION-SAFE MIGRATION: Add indexes for status field
-- ============================================================
-- This script can now run in a transaction using regular CREATE INDEX
-- (not CONCURRENT, which cannot run in transactions)
--
-- Note on performance:
-- - Regular CREATE INDEX will briefly lock the table (< 1 second for small tables)
-- - Since your appointments table is small (2 rows), this is safe
-- - For very large production tables, use CONCURRENT outside of a transaction
--
-- Prerequisites:
-- ✓ Run 001_add_appointment_status_safe.sql first
-- ✓ Verify that migration succeeded (0 NULL statuses)
-- ✓ Then run THIS script
-- ============================================================

-- ============================================================
-- Step 1: Status filtering index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_status
  ON public.appointments (status);

-- ============================================================
-- Step 2: Doctor + Date + Time + Status index (for availability queries)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_time_status
  ON public.appointments (doctor_id, date, time, status);

-- ============================================================
-- Step 3: Unique index to prevent double-booking
-- ============================================================
-- Partial unique index: Only enforces uniqueness on booked/NULL slots
-- Cancelled and pending slots are NOT under this constraint,
-- allowing them to be re-used by new bookings
CREATE UNIQUE INDEX IF NOT EXISTS unique_doctor_slot_booked
  ON public.appointments (doctor_id, date, time)
  WHERE (status = 'booked' OR status IS NULL);

-- ============================================================
-- Verification
-- ============================================================
-- After all 3 indexes are created, verify with:
--
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- WHERE tablename = 'appointments'
-- ORDER BY indexname;
--
-- Expected result: 3 rows
--   - idx_appointments_status
--   - idx_appointments_doctor_date_time_status
--   - unique_doctor_slot_booked
-- ============================================================
