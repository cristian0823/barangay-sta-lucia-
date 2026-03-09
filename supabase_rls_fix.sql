-- ============================================================
-- PASTE THIS IN SUPABASE → SQL EDITOR → CLICK "RUN"
-- This fixes ALL permission issues on ALL tables
-- SAFE to run multiple times
-- ============================================================

-- First, disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings DISABLE ROW LEVEL SECURITY;
ALTER TABLE concerns DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log DISABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies
DO $$ 
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- Grant full access to the anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Now re-enable RLS with permissive "allow everything" policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log ENABLE ROW LEVEL SECURITY;

-- Create "allow all" policies for every table
CREATE POLICY "allow_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON equipment FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON borrowings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON concerns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON court_bookings FOR ALL USING (true) WITH CHECK (true);

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'activity_log') THEN
        EXECUTE 'CREATE POLICY "allow_all" ON activity_log FOR ALL USING (true) WITH CHECK (true)';
    END IF;
END $$;

-- Add missing columns if needed
ALTER TABLE concerns ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255);
ALTER TABLE concerns ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE court_bookings ADD COLUMN IF NOT EXISTS admin_comment TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
