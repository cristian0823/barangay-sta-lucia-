const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';

async function test() {
    try {
        console.log("Checking notifications table...");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications?select=*&limit=5&order=created_at.desc`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await res.json();
        console.log("Notifications:", data);

        console.log("Checking equipment table...");
        const res2 = await fetch(`${SUPABASE_URL}/rest/v1/equipment?select=*&limit=5`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data2 = await res2.json();
        console.log("Equipment:", data2);
    } catch(e) { console.error(e); }
}
test();
