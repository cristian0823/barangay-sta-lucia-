const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const HEADERS = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E',
    'Content-Type': 'application/json'
};

async function fixnulls() {
    // get all equipments
    let res = await fetch(`${SUPABASE_URL}/rest/v1/equipment?select=*`, { headers: HEADERS });
    let equipments = await res.json();
    let eqMap = {};
    for (let eq of equipments) eqMap[eq.name] = eq.id;

    // get all borrowings where equipment_id is null
    res = await fetch(`${SUPABASE_URL}/rest/v1/borrowings?equipment_id=is.null&select=*`, { headers: HEADERS });
    let borrowings = await res.json();
    
    for (let b of borrowings) {
        if (eqMap[b.equipment]) {
            console.log(`Patching borrowing ${b.id} with equipment_id ${eqMap[b.equipment]}`);
            await fetch(`${SUPABASE_URL}/rest/v1/borrowings?id=eq.${b.id}`, {
                method: 'PATCH',
                headers: HEADERS,
                body: JSON.stringify({ equipment_id: eqMap[b.equipment] })
            });
        }
    }
    console.log('Done');
}
fixnulls().catch(console.error);
