-- ============================================================
-- BARANGAY WEBSITE — Supabase Migration Script
-- Run this in your Supabase Dashboard → SQL Editor
-- ============================================================

-- Add end_time column to court_bookings (if missing)
ALTER TABLE court_bookings
ADD COLUMN IF NOT EXISTS end_time VARCHAR(100);

-- Add venue column to court_bookings (if missing — separate from venue_name)
ALTER TABLE court_bookings
ADD COLUMN IF NOT EXISTS venue VARCHAR(100);

-- Ensure username column exists (some older setups used user_name only)
ALTER TABLE court_bookings
ADD COLUMN IF NOT EXISTS username VARCHAR(255);

-- Verify the final structure (optional — run to check)
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'court_bookings';
