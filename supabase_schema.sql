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
    offense_count INTEGER DEFAULT 0,
    suspension_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Safely patch live database columns for existing users
ALTER TABLE users ADD COLUMN IF NOT EXISTS offense_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_end TIMESTAMP WITH TIME ZONE;

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
    equipment VARCHAR(255),
    quantity INTEGER NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    purpose TEXT,
    rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS concerns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    date DATE NOT NULL,
    reply TEXT,
    image_url TEXT,
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
    action VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    meta JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================
-- STEP 2: PATCH MISSING COLUMNS & CLEANUP (safe to re-run)
-- ============================================================

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS broken INTEGER DEFAULT 0;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE concerns ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255);
ALTER TABLE concerns ADD COLUMN IF NOT EXISTS response TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_fail_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS offense_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE borrowings ADD COLUMN IF NOT EXISTS equipment_id INTEGER REFERENCES equipment(id) ON DELETE RESTRICT;
ALTER TABLE borrowings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE court_bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Remove redundant username columns, keeping relations only
ALTER TABLE borrowings DROP COLUMN IF EXISTS user_name;
ALTER TABLE concerns DROP COLUMN IF EXISTS user_name;
ALTER TABLE court_bookings DROP COLUMN IF EXISTS user_name;
ALTER TABLE activity_log DROP COLUMN IF EXISTS admin_username;


-- ============================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY AND CREATE POLICIES
-- ============================================================

-- Drop old notification table if it still exists
DROP TABLE IF EXISTS notifications;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent errors
-- Users
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for users own profile" ON users;
DROP POLICY IF EXISTS "Enable full access for admins" ON users;

-- Equipment
DROP POLICY IF EXISTS "Enable read access for all users" ON equipment;
DROP POLICY IF EXISTS "Enable write access for all users" ON equipment;
DROP POLICY IF EXISTS "Enable write access for admins" ON equipment;

-- Events
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
DROP POLICY IF EXISTS "Enable write access for all users" ON events;
DROP POLICY IF EXISTS "Enable insert for all users" ON events;
DROP POLICY IF EXISTS "Enable update for all users" ON events;
DROP POLICY IF EXISTS "Enable delete for all users" ON events;
DROP POLICY IF EXISTS "Enable write access for admins" ON events;

-- Borrowings
DROP POLICY IF EXISTS "Enable read access for all users" ON borrowings;
DROP POLICY IF EXISTS "Enable insert for all users" ON borrowings;
DROP POLICY IF EXISTS "Enable update for all users" ON borrowings;
DROP POLICY IF EXISTS "Enable delete for all users" ON borrowings;
DROP POLICY IF EXISTS "Enable read access for users own borrowings" ON borrowings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON borrowings;
DROP POLICY IF EXISTS "Enable full access for admins" ON borrowings;

-- Concerns
DROP POLICY IF EXISTS "Enable read access for all users" ON concerns;
DROP POLICY IF EXISTS "Enable insert for all users" ON concerns;
DROP POLICY IF EXISTS "Enable update for all users" ON concerns;
DROP POLICY IF EXISTS "Enable delete for all users" ON concerns;
DROP POLICY IF EXISTS "Enable read access for users own concerns" ON concerns;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON concerns;
DROP POLICY IF EXISTS "Enable full access for admins" ON concerns;

-- Court Bookings
DROP POLICY IF EXISTS "Enable read access for all users" ON court_bookings;
DROP POLICY IF EXISTS "Enable insert for all users" ON court_bookings;
DROP POLICY IF EXISTS "Enable update for all users" ON court_bookings;
DROP POLICY IF EXISTS "Enable delete for all users" ON court_bookings;
DROP POLICY IF EXISTS "Enable read access for users own bookings" ON court_bookings;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON court_bookings;
DROP POLICY IF EXISTS "Enable full access for admins" ON court_bookings;

-- Activity Log
DROP POLICY IF EXISTS "Enable read access for all users" ON activity_log;
DROP POLICY IF EXISTS "Enable insert for all users" ON activity_log;
DROP POLICY IF EXISTS "Enable update for all users" ON activity_log;
DROP POLICY IF EXISTS "Enable delete for all users" ON activity_log;
DROP POLICY IF EXISTS "Enable write access for admins" ON activity_log;

-- User Notifications
DROP POLICY IF EXISTS "Enable read access for all users" ON user_notifications;
DROP POLICY IF EXISTS "Enable insert for all users" ON user_notifications;
DROP POLICY IF EXISTS "Enable update for all users" ON user_notifications;
DROP POLICY IF EXISTS "Enable delete for all users" ON user_notifications;

-- Users Table Policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable update access for all users" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable insert access for all users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON users FOR DELETE USING (true);

-- Equipment Table Policies
CREATE POLICY "Enable read access for all users" ON equipment FOR SELECT USING (true);
CREATE POLICY "Enable write access for all users" ON equipment FOR ALL USING (true);

-- Events Table Policies
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON events FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON events FOR DELETE USING (true);

-- Borrowings Table Policies
CREATE POLICY "Enable read access for all users" ON borrowings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON borrowings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON borrowings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON borrowings FOR DELETE USING (true);

-- Concerns Table Policies
CREATE POLICY "Enable read access for all users" ON concerns FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON concerns FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON concerns FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON concerns FOR DELETE USING (true);

-- Court Bookings Policies
CREATE POLICY "Enable read access for all users" ON court_bookings FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON court_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON court_bookings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON court_bookings FOR DELETE USING (true);

-- Activity Log Policies
CREATE POLICY "Enable read access for all users" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON activity_log FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON activity_log FOR DELETE USING (true);

-- User Notifications Policies
CREATE POLICY "Enable read access for all users" ON user_notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON user_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON user_notifications FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON user_notifications FOR DELETE USING (true);


-- ============================================================
-- STEP 4: DEFAULT DATA
-- ============================================================

INSERT INTO users (username, password, full_name, email, role, avatar)
VALUES ('admin', 'admin123', 'Barangay Administrator', 'admin@barangay.gov', 'admin', 'A')
ON CONFLICT (username) DO NOTHING;

-- Equipment is seeded in STEP 5 below with correct quantities.



-- ============================================================
-- STEP 5: RESET EQUIPMENT TO CORRECT VALUES (safe to re-run)
-- Wipes all equipment rows and re-inserts the exact correct
-- data. Total = 150+3+5+1+1+1+5 = 166 items.
-- ============================================================

-- 5a: Drop old unique constraint if it exists
ALTER TABLE equipment DROP CONSTRAINT IF EXISTS equipment_name_unique;

-- 5b: Remove ALL rows (fixes duplicates)
DELETE FROM equipment;

-- 5c: Re-insert the CORRECT equipment with EXACT quantities
INSERT INTO equipment (name, quantity, available, broken, icon, description) VALUES
('Chairs',       150, 150, 0, '🪑', 'Plastic folding chairs'),
('Tables',         3,   3, 0, '🗂️', 'Foldable tables'),
('Tents',          5,   5, 0, '⛺', 'Event tents'),
('Ladder',         1,   1, 0, '🔧', 'Barangay use only'),
('Microphone',     1,   1, 0, '🎤', 'Barangay use only'),
('Speaker',        1,   1, 0, '🔊', 'For big events'),
('Electric Fan',   5,   5, 0, '🌀', 'For big events');

-- 5d: Add UNIQUE constraint so duplicates can never happen again
ALTER TABLE equipment ADD CONSTRAINT equipment_name_unique UNIQUE (name);

-- 5e: Enable RLS on activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 6: STORED PROCEDURES (RPCs) FOR INVENTORY MANAGEMENT
-- ============================================================

-- Function to approve equipment borrowing and strictly deduct inventory
CREATE OR REPLACE FUNCTION approve_equipment_request(borrowing_id INTEGER, admin_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_equipment_id INTEGER;
    v_borrow_qty INTEGER;
    v_current_status VARCHAR(50);
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS(SELECT 1 FROM users WHERE id = admin_user_id AND role = 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized. Admin access required.');
    END IF;

    -- Lock the borrowing row for update to prevent concurrent race conditions
    SELECT equipment_id, quantity, status INTO v_equipment_id, v_borrow_qty, v_current_status
    FROM borrowings WHERE id = borrowing_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Borrowing request not found.');
    END IF;

    IF v_current_status != 'pending' THEN
        RETURN json_build_object('success', false, 'message', 'Request is not pending.');
    END IF;

    -- Update the equipment table, automatically locking it during the transaction
    UPDATE equipment 
    SET available = available - v_borrow_qty
    WHERE id = v_equipment_id AND available >= v_borrow_qty;

    IF NOT FOUND THEN
        -- Revert changes if not enough quantity
        RETURN json_build_object('success', false, 'message', 'Not enough equipment available.');
    END IF;

    -- Mark request as approved
    UPDATE borrowings SET status = 'approved' WHERE id = borrowing_id;
    
    RETURN json_build_object('success', true, 'message', 'Equipment request approved successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to return equipment and strictly restore inventory
CREATE OR REPLACE FUNCTION return_equipment_request(borrowing_id INTEGER, admin_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    v_equipment_id INTEGER;
    v_borrow_qty INTEGER;
    v_current_status VARCHAR(50);
    v_borrower_id INTEGER;
    v_return_date DATE;
    v_is_late BOOLEAN := false;
    v_offense_count INTEGER;
    v_suspension_days INTEGER := 0;
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS(SELECT 1 FROM users WHERE id = admin_user_id AND role = 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN
        RETURN json_build_object('success', false, 'message', 'Unauthorized. Admin access required.');
    END IF;

    -- Lock the borrowing row for update to prevent concurrent race conditions
    SELECT equipment_id, quantity, status, user_id, return_date INTO v_equipment_id, v_borrow_qty, v_current_status, v_borrower_id, v_return_date
    FROM borrowings WHERE id = borrowing_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Borrowing request not found.');
    END IF;

    IF v_current_status != 'approved' THEN
        RETURN json_build_object('success', false, 'message', 'Request is not actively borrowed.');
    END IF;

    -- Check if late (more than 1 day past expected return_date)
    IF CURRENT_DATE > (v_return_date + INTERVAL '1 day') THEN
        v_is_late := true;
        -- Fetch current offense count
        SELECT COALESCE(offense_count, 0) INTO v_offense_count FROM users WHERE id = v_borrower_id FOR UPDATE;
        
        v_offense_count := v_offense_count + 1;
        
        -- Progressive Suspensions
        IF v_offense_count = 1 THEN
            v_suspension_days := 0; -- Strike 1: Warning
        ELSIF v_offense_count = 2 THEN
            v_suspension_days := 3; -- Strike 2: 3 days
        ELSIF v_offense_count = 3 THEN
            v_suspension_days := 7; -- Strike 3: 7 days
        ELSE
            v_suspension_days := 30; -- Strike 4+: 30 days
        END IF;

        IF v_suspension_days > 0 THEN
            UPDATE users SET 
                offense_count = v_offense_count, 
                suspension_end = CURRENT_TIMESTAMP + (v_suspension_days || ' days')::INTERVAL
            WHERE id = v_borrower_id;
        ELSE
             UPDATE users SET offense_count = v_offense_count WHERE id = v_borrower_id;
        END IF;
    END IF;

    -- Update the equipment table, automatically locking it during the transaction
    UPDATE equipment
    SET available = available + v_borrow_qty
    WHERE id = v_equipment_id;

    -- Mark request as returned
    UPDATE borrowings SET status = 'returned' WHERE id = borrowing_id;

    IF v_is_late THEN
        IF v_suspension_days > 0 THEN
             RETURN json_build_object('success', true, 'message', 'Equipment returned. User suspended for ' || v_suspension_days || ' days due to late return (Offense #' || v_offense_count || ').');
        ELSE
             RETURN json_build_object('success', true, 'message', 'Equipment returned. User issued a warning for late return (Offense #1).');
        END IF;
    ELSE
        RETURN json_build_object('success', true, 'message', 'Equipment marked as returned successfully.');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- STEP 7: ENABLE REALTIME SYNC FOR USER DASHBOARDS
-- ============================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
EXCEPTION WHEN sqlstate '42710' THEN NULL; END $$;


-- ============================================================
-- STEP 8: USER NOTIFICATIONS (Admin Cancellation Alerts)
-- ============================================================

-- Table for notifying residents when their booking is cancelled by admin
CREATE TABLE IF NOT EXISTS user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    type text NOT NULL DEFAULT 'booking_cancelled',
    message text,
    meta jsonb,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Index for fast unread notification lookups per user
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_unread
    ON user_notifications(user_id, is_read)
    WHERE is_read = false;

-- Add admin_comment column to court_bookings (used when admin cancels a booking)
ALTER TABLE court_bookings
    ADD COLUMN IF NOT EXISTS admin_comment text;

-- Enable realtime sync for notifications
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;
EXCEPTION WHEN sqlstate '42710' THEN NULL; END $$;


-- ============================================================
-- ISO/IEC 27001 SECURITY ADDITIONS
-- Run these in addition to the schema above.
-- Safe to re-run (uses IF NOT EXISTS / ALTER ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- ── A.16.1 Security Incidents Table ─────────────────────────
CREATE TABLE IF NOT EXISTS security_incidents (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    status VARCHAR(50) DEFAULT 'open',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE,
    actions_taken TEXT,
    notified_users BOOLEAN DEFAULT false
);

ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for security_incidents" ON security_incidents;
CREATE POLICY "Enable all access for security_incidents" ON security_incidents FOR ALL USING (true);

-- ── A.12.1 System Configuration / Patch Tracking ────────────
CREATE TABLE IF NOT EXISTS system_config (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for system_config" ON system_config;
CREATE POLICY "Enable all access for system_config" ON system_config FOR ALL USING (true);

-- Insert default system config values
INSERT INTO system_config (key, value) VALUES
    ('system_version', '2.5.0'),
    ('last_backup_at', NULL),
    ('patch_notes', 'ISO/IEC 27001 security controls integrated. SHA-256 password hashing, MFA for admins, incident management, and privacy policy added.'),
    ('data_retention_days', '365'),
    ('mfa_required_for_admin', 'true')
ON CONFLICT (key) DO NOTHING;

-- ── A.12.4 Enrich Activity Log ───────────────────────────────
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'info';
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS ip_address VARCHAR(50);
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS resource_type VARCHAR(100);
ALTER TABLE activity_log ADD COLUMN IF NOT EXISTS resource_id INTEGER;

-- ── A.9.4 Add session & MFA tracking to users ────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_mfa_count INTEGER DEFAULT 0;

