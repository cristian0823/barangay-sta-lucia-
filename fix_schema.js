const fs = require('fs');
let c = fs.readFileSync('supabase_schema.sql', 'utf8');
const p1 = c.indexOf('-- Drop existing policies if any to prevent errors');
const p2 = c.indexOf('-- Users Table Policies');

const db = `-- Drop existing policies if any to prevent errors
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
DROP POLICY IF EXISTS "Enable delete for all users" ON user_notifications;`;

if(p1 > -1 && p2 > -1) {
    c = c.substring(0, p1) + db + '\n\n' + c.substring(p2);
    fs.writeFileSync('supabase_schema.sql', c);
    console.log("Success");
} else {
    console.log("Not found", p1, p2);
}
