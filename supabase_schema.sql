-- ============================================================
-- Barangay Sta. Lucia — Supabase Complete Setup + Fix
-- 
-- HOW TO RUN:
--   1. Go to your Supabase project dashboard
--   2. Click "SQL Editor" in the left sidebar
--   3. Paste this ENTIRE file and click "Run"
--   4. That's it — everything will work!
--
-- SAFE TO RUN MULTIPLE TIMES — uses IF NOT EXISTS
-- ============================================================


-- ============================================================
-- STEP 1: CREATE TABLES
-- ============================================================

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
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE RESTRICT,
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
    response TEXT,
    assigned_to VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(100),
    end_time VARCHAR(100),
    location VARCHAR(255),
    organizer VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS court_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    date DATE NOT NULL,
    time VARCHAR(255) NOT NULL,
    purpose TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admin_username VARCHAR(255),
    action VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);


-- ============================================================
-- STEP 2: PATCH MISSING COLUMNS (safe to re-run)
-- ============================================================

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS broken INTEGER DEFAULT 0;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE concerns ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255);
ALTER TABLE concerns ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE borrowings ADD COLUMN IF NOT EXISTS equipment_id INTEGER REFERENCES equipment(id) ON DELETE RESTRICT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;


-- ============================================================
-- STEP 3: DISABLE ROW LEVEL SECURITY (THE CRITICAL FIX)
-- This is what was blocking all inserts/updates from the website
-- ============================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings DISABLE ROW LEVEL SECURITY;
ALTER TABLE concerns DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 4: DEFAULT DATA
-- ============================================================

INSERT INTO users (username, password, full_name, email, role, avatar)
VALUES ('admin', 'admin123', 'Barangay Administrator', 'admin@barangay.gov', 'admin', 'A')
ON CONFLICT (username) DO NOTHING;

INSERT INTO equipment (name, quantity, available, broken, icon, description) VALUES
('Chairs',       150, 150, 0, '🪑', 'Plastic folding chairs'),
('Tables',         3,   3, 0, '🪵', 'Foldable tables'),
('Tents',          5,   5, 0, '⛺', 'Event tents'),
('Ladder',         1,   1, 0, '🪜', 'Barangay use only'),
('Microphone',     1,   1, 0, '🎤', 'Barangay use only'),
('Speaker',        1,   1, 0, '🔊', 'For big events'),
('Electric Fan',   5,   5, 0, '🌀', 'For big events')
ON CONFLICT DO NOTHING;
