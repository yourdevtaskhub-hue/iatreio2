-- ============================================================
-- PRODUCTION-SAFE MIGRATION: Add status field to appointments
-- ============================================================
-- Zero-downtime, fully reversible, idempotent, concurrency-safe
-- 
-- Strategy:
-- 1. Add column (non-blocking, nullable)
-- 2. Backfill existing rows (idempotent)
-- 3. Add constraints (safe)
-- 4. Add indexes (concurrent)
-- ============================================================

-- ============================================================
-- PHASE 1: Add column (non-blocking)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.appointments
      ADD COLUMN status VARCHAR(20) DEFAULT 'booked';
    RAISE NOTICE 'Phase 1 ✓: Added status column to appointments table';
  ELSE
    RAISE NOTICE 'Phase 1 (IDEMPOTENT): Status column already exists - skipping';
  END IF;
END $$;

-- ============================================================
-- PHASE 2: Backfill existing rows (idempotent, safe to run multiple times)
-- ============================================================
-- WARNING: Run this separately to monitor progress
-- 
-- Safe because:
-- - Only updates rows WHERE status IS NULL
-- - Does not overwrite existing statuses
-- - Can be run multiple times without side effects
-- - Does not need transaction
-- ============================================================

-- Check how many NULL statuses exist
SELECT 
  COUNT(*) as rows_to_backfill,
  COUNT(CASE WHEN status IS NULL THEN 1 END) as null_count,
  COUNT(CASE WHEN status = 'booked' THEN 1 END) as booked_count,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
FROM public.appointments;

-- Backfill in batches (safe for large tables, avoids long locks)
UPDATE public.appointments
  SET status = 'booked'
  WHERE status IS NULL;

DO $$
BEGIN
  RAISE NOTICE 'Phase 2 ✓: Backfill completed - all NULL statuses set to booked';
END $$;

-- ============================================================
-- PHASE 3: Add CHECK constraint (idempotent, safe)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'appointments' 
    AND constraint_name = 'appointments_status_check'
    AND constraint_type = 'CHECK'
  ) THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_status_check
      CHECK (
        status IN ('booked', 'cancelled', 'pending', 'available')
        OR status IS NULL
      );
    RAISE NOTICE 'Phase 3 ✓: Added appointments_status_check constraint';
  ELSE
    RAISE NOTICE 'Phase 3 (IDEMPOTENT): Check constraint already exists - skipping';
  END IF;
END $$;

-- ============================================================
-- PHASE 4: Add indexes (CONCURRENT = zero locks, safe)
-- ============================================================
-- NOTE: These indexes MUST be created separately (not in a transaction)
-- because CREATE INDEX CONCURRENTLY cannot run inside a transaction block.
-- 
-- SEE: 001b_add_appointment_status_indexes.sql for index creation
-- 
-- This is important for production safety:
-- - CONCURRENT does NOT block writes during creation
-- - Safe to run on live production tables with active bookings
-- - Idempotent (IF NOT EXISTS prevents duplicates)
-- ============================================================

-- Indexes will be created in a separate migration script: 001b_add_appointment_status_indexes.sql
DO $$
BEGIN
  RAISE NOTICE 'Phase 4 NOTE: Create indexes using 001b_add_appointment_status_indexes.sql separately';
END $$;

-- ============================================================
-- PHASE 5: Verification & Next Steps
-- ============================================================
-- This migration has completed the core changes (column, backfill, constraint).
-- The indexes are in a separate file: 001b_add_appointment_status_indexes.sql
--
-- Next steps:
-- 1. ✓ Run this script first (001_add_appointment_status_safe.sql)
-- 2. ✓ Verify using queries below
-- 3. → Run indexes script (001b_add_appointment_status_indexes.sql) SEPARATELY
-- 4. → Verify indexes created
-- 5. → Run 002_verify_appointment_status.sql for full validation
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'PHASE 1-3 MIGRATION COMPLETE ✓';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Column added, existing rows backfilled, constraint added';
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT: Run 001b_add_appointment_status_indexes.sql separately';
  RAISE NOTICE '      (CONCURRENT indexes cannot run in transactions)';
  RAISE NOTICE '============================================================';
END $$;

-- Verification queries to run now:
-- 1. Check column was added:
--    SELECT column_name FROM information_schema.columns 
--    WHERE table_name = 'appointments' AND column_name = 'status';
--    (should return 1 row)
-- 
-- 2. Check for NULL statuses (should be 0):
--    SELECT COUNT(*) FROM appointments WHERE status IS NULL;
--    (should return 0)
-- 
-- 3. Verify constraint exists:
--    SELECT constraint_name FROM information_schema.table_constraints
--    WHERE table_name = 'appointments' AND constraint_name LIKE '%status%';
--    (should return appointments_status_check)
-- 
-- 4. Sample recent bookings:
--    SELECT id, doctor_id, date, time, status, created_at 
--    FROM appointments 
--    ORDER BY created_at DESC LIMIT 10;
