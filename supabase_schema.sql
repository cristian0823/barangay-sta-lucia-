-- ============================================================
-- Barangay Website — Supabase Schema (Full Setup)
-- Run this script in your Supabase Dashboard → SQL Editor
-- It is SAFE to run multiple times — uses IF NOT EXISTS
-- ============================================================

-- 1. Users Table (Custom Authentication)
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

-- Insert default admin (skip if already exists)
INSERT INTO users (username, password, full_name, email, role, avatar)
VALUES ('admin', 'admin123', 'Barangay Administrator', 'admin@barangay.gov', 'admin', 'A')
ON CONFLICT (username) DO NOTHING;

-- 2. Equipment Table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    available INTEGER NOT NULL,
    icon VARCHAR(50),
    description TEXT
);

-- Insert default equipment (skip if already exists)
INSERT INTO equipment (name, quantity, available, icon, description) VALUES
('Chairs', 150, 150, '🪑', 'Plastic folding chairs'),
('Tables', 3, 3, '🪵', 'Tables (subject for availability)'),
('Tents', 5, 5, '⛺', 'Event tents'),
('Ladder', 1, 1, '🪜', 'Ladder (Barangay use only)'),
('Microphone', 1, 1, '🎤', 'Microphone (Barangay only)'),
('Speaker', 1, 1, '🔊', 'Speaker (Barangay only)'),
('Electric Fan', 5, 5, '🌀', 'Electric Fan (For big events)')
ON CONFLICT DO NOTHING;

-- 3. Borrowings Table
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

-- 4. Concerns Table
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
    response TEXT
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME,
    location VARCHAR(255),
    organizer VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending'
);

-- 6. Court Bookings Table
CREATE TABLE IF NOT EXISTS court_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    username VARCHAR(255),
    date DATE NOT NULL,
    time VARCHAR(100) NOT NULL,
    end_time VARCHAR(100),
    venue VARCHAR(100),
    venue_name VARCHAR(255),
    purpose TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_comment TEXT
);

-- ============================================================
-- PATCH: Add any missing columns to existing live databases
-- These are 100% safe to run even if columns already exist
-- ============================================================
ALTER TABLE court_bookings ADD COLUMN IF NOT EXISTS end_time VARCHAR(100);
ALTER TABLE court_bookings ADD COLUMN IF NOT EXISTS venue VARCHAR(100);
ALTER TABLE court_bookings ADD COLUMN IF NOT EXISTS username VARCHAR(255);
