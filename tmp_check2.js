const fs = require('fs');
const content = fs.readFileSync('js/supabase-config.js', 'utf8');
const urlMatch = content.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = content.match(/SUPABASE_ANON_KEY\s*=\s*['"]([^'"]+)['"]/);
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(urlMatch[1], keyMatch[1]);
async function run() {
    const { data: notifs } = await supabase.from('user_notifications').select('*').order('created_at', { ascending: false }).limit(10);
    console.log("Latest Notifs:", notifs);
}
run();
