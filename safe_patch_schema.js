const fs = require('fs');
let schema = fs.readFileSync('supabase_schema.sql', 'utf8');

const targetStr = `-- STEP 1: CREATE TABLES\n-- ============================================================`;

if (schema.includes(targetStr)) {
    const replaceStr = `${targetStr}\n\n-- Drop legacy activity log for the v1.2 audit & security split\nDROP TABLE IF EXISTS activity_log CASCADE;`;
    
    // Only patch if not already patched
    if (!schema.includes('DROP TABLE IF EXISTS activity_log CASCADE')) {
        schema = schema.replace(targetStr, replaceStr);
        fs.writeFileSync('supabase_schema.sql', schema);
        console.log('Successfully injected DROP TABLE activity_log into supabase schema.');
    } else {
        console.log('Schema already includes the DROP statement.');
    }
} else {
    console.log('Target string not found, cannot safely patch.');
}
