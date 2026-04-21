const fs = require('fs');

let schema = fs.readFileSync('supabase_schema.sql', 'utf8');

// 1. Replace the CREATE TABLE activity_log with the two new tables
const createActivityRegex = /CREATE TABLE IF NOT EXISTS activity_log \([\s\S]*?\);/;
const replaceCreate = `CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    action VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS security_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_username VARCHAR(255),
    event_type VARCHAR(100),
    auth_method VARCHAR(50),
    severity VARCHAR(50),
    ip_address VARCHAR(100),
    device_info TEXT,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);`;

if (createActivityRegex.test(schema)) {
    schema = schema.replace(createActivityRegex, replaceCreate);
} else {
    console.log("Could not find the CREATE TABLE activity_log statement.");
}

// 2. Remove ALTER TABLE activity_log lines that are present (if any)
schema = schema.replace(/ALTER TABLE activity_log.*\n?/g, '');

// 3. Remove Activity Log DROP POLICY lines
const dropPolicyRegex = /-- Activity Log[\s\S]*?-- User Notifications/;
const replaceDropPolicy = `-- Audit Log
DROP POLICY IF EXISTS "Enable read access for all users" ON audit_log;
DROP POLICY IF EXISTS "Enable insert for all users" ON audit_log;
DROP POLICY IF EXISTS "Enable update for all users" ON audit_log;
DROP POLICY IF EXISTS "Enable delete for all users" ON audit_log;

-- Security Log
DROP POLICY IF EXISTS "Enable read access for all users" ON security_log;
DROP POLICY IF EXISTS "Enable insert for all users" ON security_log;
DROP POLICY IF EXISTS "Enable update for all users" ON security_log;
DROP POLICY IF EXISTS "Enable delete for all users" ON security_log;

-- User Notifications`;

if (dropPolicyRegex.test(schema)) {
    schema = schema.replace(dropPolicyRegex, replaceDropPolicy);
}

// 4. Activity Log CREATE POLICY replacements
const createPolicyRegex = /-- Activity Log[\s\S]*?-- User Notifications/; // Wait, these are lower down
const regexes = [
    /CREATE POLICY "Enable read access for all users" ON activity_log.*?;/g,
    /CREATE POLICY "Enable insert for all users" ON activity_log.*?;/g,
    /CREATE POLICY "Enable update for all users" ON activity_log.*?;/g,
    /CREATE POLICY "Enable delete for all users" ON activity_log.*?;/g,
    /CREATE POLICY "Enable write access for admins" ON activity_log.*?;/g
];
regexes.forEach(r => schema = schema.replace(r, ''));

// Add the new policies at the end of Step 4 policy creations
const endOfStep4Regex = /-- ==========================================================\s+-- STEP 5/;
const newPolicies = `-- Audit Log
CREATE POLICY "Enable read access for all users" ON audit_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON audit_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON audit_log FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON audit_log FOR DELETE USING (true);

-- Security Log
CREATE POLICY "Enable read access for all users" ON security_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON security_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON security_log FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON security_log FOR DELETE USING (true);

-- ==========================================================
-- STEP 5`;

if (endOfStep4Regex.test(schema)) {
    schema = schema.replace(endOfStep4Regex, newPolicies);
}

// Write back
fs.writeFileSync('supabase_schema.sql', schema);
console.log('supabase_schema.sql updated successfully.');
