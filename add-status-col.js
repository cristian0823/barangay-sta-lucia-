const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function addStatusColumn() {
    const { error } = await supabase.rpc('run_sql', {
        query: `ALTER TABLE equipment ADD COLUMN status text DEFAULT 'Available';`
    });

    if (error) {
        console.error('Error adding column:', error.message);
        // Fallback: use a raw pg query if rpc run_sql doesn't exist
    } else {
        console.log('Successfully added status column to equipment table!');
    }
}

addStatusColumn();
