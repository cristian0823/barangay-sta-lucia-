const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const js = fs.readFileSync('js/supabase-config.js', 'utf8');
const urlMatch = js.match(/const\s+supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
const keyMatch = js.match(/const\s+supabaseAnonKey\s*=\s*['"]([^'"]+)['"]/);

if(urlMatch && keyMatch) {
    const supabase = createClient(urlMatch[1], keyMatch[1]);
    supabase.from('notifications').select('*').then(res => {
        if(res.error) console.error(res.error);
        else console.log(JSON.stringify(res.data.slice(0, 5), null, 2));
    });
} else {
    console.log('not found');
}
