require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const rawHtml = require('fs').readFileSync('js/crypto-utils.js', 'utf8');

const urlMatch = rawHtml.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = rawHtml.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);

if (!urlMatch || !keyMatch) { console.log('url/key not found'); process.exit(0); }

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
    const { data: users, error } = await supabase.from('users').select('*');
    console.log("USERS:", users);
}
check();
