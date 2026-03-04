-- Run this in Supabase SQL Editor to fix database access
-- This will disable RLS and allow the app to read/write data

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings DISABLE ROW LEVEL SECURITY;
ALTER TABLE concerns DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, add these policies instead:

-- Users table policies
-- DROP POLICY IF EXISTS "Allow public read" ON users;
-- DROP POLICY IF EXISTS "Allow public insert" ON users;
-- DROP POLICY IF EXISTS "Allow public update" ON users;
-- DROP POLICY IF EXISTS "Allow public delete" ON users;

-- CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON users FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON users FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON users FOR DELETE USING (true);

-- Equipment table policies
-- DROP POLICY IF EXISTS "Allow public read" ON equipment;
-- DROP POLICY IF EXISTS "Allow public insert" ON equipment;
-- DROP POLICY IF EXISTS "Allow public update" ON equipment;
-- DROP POLICY IF EXISTS "Allow public delete" ON equipment;

-- CREATE POLICY "Allow public read" ON equipment FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON equipment FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON equipment FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON equipment FOR DELETE USING (true);

-- Borrowings table policies
-- DROP POLICY IF EXISTS "Allow public read" ON borrowings;
-- DROP POLICY IF EXISTS "Allow public insert" ON borrowings;
-- DROP POLICY IF EXISTS "Allow public update" ON borrowings;
-- DROP POLICY IF EXISTS "Allow public delete" ON borrowings;

-- CREATE POLICY "Allow public read" ON borrowings FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON borrowings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON borrowings FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON borrowings FOR DELETE USING (true);

-- Concerns table policies
-- DROP POLICY IF EXISTS "Allow public read" ON concerns;
-- DROP POLICY IF EXISTS "Allow public insert" ON concerns;
-- DROP POLICY IF EXISTS "Allow public update" ON concerns;
-- DROP POLICY IF EXISTS "Allow public delete" ON concerns;

-- CREATE POLICY "Allow public read" ON concerns FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON concerns FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON concerns FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON concerns FOR DELETE USING (true);

-- Events table policies
-- DROP POLICY IF EXISTS "Allow public read" ON events;
-- DROP POLICY IF EXISTS "Allow public insert" ON events;
-- DROP POLICY IF EXISTS "Allow public update" ON events;
-- DROP POLICY IF EXISTS "Allow public delete" ON events;

-- CREATE POLICY "Allow public read" ON events FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON events FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON events FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON events FOR DELETE USING (true);

-- Court bookings table policies
-- DROP POLICY IF EXISTS "Allow public read" ON court_bookings;
-- DROP POLICY IF EXISTS "Allow public insert" ON court_bookings;
-- DROP POLICY IF EXISTS "Allow public update" ON court_bookings;
-- DROP POLICY IF EXISTS "Allow public delete" ON court_bookings;

-- CREATE POLICY "Allow public read" ON court_bookings FOR SELECT USING (true);
-- CREATE POLICY "Allow public insert" ON court_bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow public update" ON court_bookings FOR UPDATE USING (true);
-- CREATE POLICY "Allow public delete" ON court_bookings FOR DELETE USING (true);

-- Insert default admin if not exists
INSERT INTO users (username, password, full_name, email, role, avatar)
SELECT 'admin', 'admin123', 'Barangay Administrator', 'admin@barangay.gov', 'admin', 'A'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Insert default equipment if not exists
INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Chairs', 150, 150, '🪑', 'Plastic folding chairs'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Chairs');

INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Tables', 3, 3, '🪵', 'Tables (subject for availability)'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Tables');

INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Tents', 5, 5, '⛺', 'Event tents'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Tents');

INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Ladder', 1, 1, '🪜', 'Ladder (Barangay use only)'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Ladder');

INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Microphone', 1, 1, '🎤', 'Microphone (Barangay only)'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Microphone');

INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Speaker', 1, 1, '🔊', 'Speaker (Barangay only)'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Speaker');

INSERT INTO equipment (name, quantity, available, icon, description)
SELECT 'Electric Fan', 5, 5, '🌀', 'Electric Fan (For big events)'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Electric Fan');
