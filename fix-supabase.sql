-- ============================================================
-- BARANGAY MANAGEMENT SYSTEM - SUPABASE SETUP SCRIPT
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- ─── 1. Disable RLS on all tables so anon key can read/write ───────────────
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS borrowings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS concerns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS court_bookings DISABLE ROW LEVEL SECURITY;

-- ─── 2. Create tables if they don't exist ──────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    avatar VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    available INTEGER NOT NULL,
    broken INTEGER DEFAULT 0,
    icon VARCHAR(50),
    description TEXT,
    is_archived BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS borrowings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    equipment VARCHAR(255),
    quantity INTEGER NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    purpose TEXT
);

CREATE TABLE IF NOT EXISTS concerns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    category VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    response TEXT,
    assigned_to VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50),
    end_time VARCHAR(50),
    location VARCHAR(255),
    organizer VARCHAR(255),
    status VARCHAR(50) DEFAULT 'approved'
);

CREATE TABLE IF NOT EXISTS court_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    end_time VARCHAR(100),
    purpose TEXT,
    venue_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    admin_comment TEXT
);

-- ─── 3. Activity Log table (NEW) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    admin_username VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE IF EXISTS activity_log DISABLE ROW LEVEL SECURITY;

-- ─── 4. Default Admins and User Accounts ──────────────────────────────────
-- Insert admin1 (main admin) if not exists
INSERT INTO users (username, password, full_name, email, role, avatar)
VALUES ('admin1', 'admin123', 'Barangay Administrator', 'admin1@barangay.gov', 'admin', 'A')
ON CONFLICT DO NOTHING;

-- Insert admin2 (second admin) if not exists
INSERT INTO users (username, password, full_name, email, role, avatar)
VALUES ('admin2', 'admin123', 'Barangay Admin 2', 'admin2@barangay.gov', 'admin', 'B')
ON CONFLICT DO NOTHING;

-- Also keep old 'admin' account for backward compatibility
INSERT INTO users (username, password, full_name, email, role, avatar)
VALUES ('admin', 'admin123', 'Barangay Administrator', 'admin@barangay.gov', 'admin', 'A')
ON CONFLICT DO NOTHING;

-- ─── 5. Default Equipment ─────────────────────────────────────────────────
INSERT INTO equipment (name, quantity, available, icon, description) 
SELECT * FROM (VALUES
    ('Chairs', 150, 150, '🪑', 'Plastic folding chairs'),
    ('Tables', 3, 3, '🪵', 'Tables (subject for availability)'),
    ('Tents', 5, 5, '⛺', 'Event tents'),
    ('Ladder', 1, 1, '🪜', 'Ladder (Barangay use only)'),
    ('Microphone', 1, 1, '🎤', 'Microphone (Barangay only)'),
    ('Speaker', 1, 1, '🔊', 'Speaker (Barangay only)'),
    ('Electric Fan', 5, 5, '🌀', 'Electric Fan (For big events)')
) AS v(name, quantity, available, icon, description)
WHERE NOT EXISTS (SELECT 1 FROM equipment LIMIT 1);

-- ─── 6. Grant usage to anon role ──────────────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Done! ✅
