const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testReturn() {
    console.log("Checking Chairs available count...");
    const { data: eq1 } = await supabase.from('equipment').select('id, available').eq('name', 'Chairs').single();
    console.log(`Chairs BEFORE: ${eq1.available}`);

    // Return borrowing ID 39
    console.log("Returning borrowing 39 (5 chairs)...");
    const { data, error } = await supabase.rpc('return_equipment_request', { borrowing_id: 39, admin_user_id: 1 });
    console.log("RPC Data:", data);
    console.log("RPC Error:", error);

    const { data: eq2 } = await supabase.from('equipment').select('available').eq('name', 'Chairs').single();
    console.log(`Chairs AFTER: ${eq2.available}`);
}
testReturn();
