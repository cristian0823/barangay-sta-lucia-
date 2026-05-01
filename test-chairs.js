const fs = require('fs');

async function testFlow() {
    const js = fs.readFileSync('js/app.js', 'utf8');
    const { createClient } = require('@supabase/supabase-js');
    const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log("Checking Chairs available count...");
    const { data: eq1 } = await supabase.from('equipment').select('id, available, quantity').eq('name', 'Chairs').single();
    console.log(`Chairs BEFORE: available=${eq1.available}, quantity=${eq1.quantity}`);

    console.log("Fetching borrowings...");
    const { data: borrowings } = await supabase.from('borrowings').select('id, equipment, quantity, status').eq('equipment', 'Chairs');
    console.log("Borrowings:", borrowings.filter(b => b.status === 'approved' || b.status === 'pending'));

}
testFlow();
