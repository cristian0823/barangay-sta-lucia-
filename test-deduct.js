const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testApprove() {
    try {
        console.log("Checking Chairs available count...");
        const { data: eq1 } = await supabase.from('equipment').select('id, available').eq('name', 'Chairs').single();
        console.log(`Chairs BEFORE: ${eq1.available}`);

        console.log("Creating a pending borrowing for 5 Chairs...");
        const { data: borrow, error: err1 } = await supabase.from('borrowings').insert([{
            user_id: 1, // admin
            equipment: 'Chairs',
            equipment_id: eq1.id,
            quantity: 5,
            borrow_date: new Date().toISOString(),
            return_date: new Date(Date.now() + 86400000).toISOString(),
            purpose: 'Test Deduction',
            status: 'pending'
        }]).select('id').single();
        
        if (err1) { console.error("Insert error:", err1); return; }
        
        const borrowingId = borrow.id;
        console.log(`Created borrowing ID: ${borrowingId}`);

        // Simulate approveEquipmentRequest
        console.log("Approving borrowing...");
        const { data: rec2 } = await supabase.from('borrowings').select('equipment, quantity').eq('id', borrowingId).maybeSingle();
        if (rec2 && rec2.equipment && rec2.quantity) {
            const { data: eqItem } = await supabase.from('equipment').select('id, available, quantity').eq('name', rec2.equipment).maybeSingle();
            if (eqItem) {
                const newAvail = Math.max(0, eqItem.available - rec2.quantity);
                await supabase.from('equipment').update({ available: newAvail }).eq('id', eqItem.id);
                console.log(`Updated equipment available to: ${newAvail}`);
            }
        }
        await supabase.from('borrowings').update({ status: 'approved' }).eq('id', borrowingId);

        console.log("Checking Chairs available count again...");
        const { data: eq2 } = await supabase.from('equipment').select('available').eq('name', 'Chairs').single();
        console.log(`Chairs AFTER: ${eq2.available}`);
    } catch(e) { console.error(e); }
}
testApprove();
