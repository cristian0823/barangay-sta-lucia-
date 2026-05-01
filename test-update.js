const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';

async function test() {
    try {
        console.log("Fetching Chairs...");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/equipment?select=*&name=eq.Chairs`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const data = await res.json();
        console.log("Chairs:", data);
        
        if (data && data.length > 0) {
            const id = data[0].id;
            const available = data[0].available;
            console.log(`Trying to update Chairs (ID: ${id}) available to ${available - 1}...`);
            const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/equipment?id=eq.${id}`, {
                method: 'PATCH',
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({ available: available - 1 })
            });
            const updateData = await updateRes.json();
            console.log("Update result:", updateData);
        }
    } catch(e) { console.error(e); }
}
test();
