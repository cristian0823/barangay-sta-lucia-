const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    const { data } = await supabase.from('borrowings').select('*').eq('equipment', 'Chairs');
    console.log(data);
}
test();
