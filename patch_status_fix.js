require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://xczkymrtnjziboktqmbq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseKey) {
  console.log('Error: Missing SUPABASE_KEY in environment or .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEquipmentStatus() {
  console.log('Fetching equipment...');
  const { data: equipment, error: eqError } = await supabase.from('equipment').select('*');
  if (eqError) {
    console.error('Error fetching equipment:', eqError);
    return;
  }

  console.log('Fetching approved borrow requests...');
  const { data: borrows, error: bwError } = await supabase.from('borrow_requests')
    .select('equipment_id, equipment_name, quantity, status')
    .eq('status', 'approved');

  if (bwError) {
    console.error('Error fetching borrow requests:', bwError);
    return;
  }

  for (const item of equipment) {
    let broken = item.broken || 0;
    let disposal = 0;

    // Convert legacy category strings to 0
    let updatedCategory = item.category;
    if (['Under Repair', 'For Disposal', 'Available', 'In Use'].includes(item.category)) {
      updatedCategory = '0';
    } else {
      disposal = parseInt(item.category) || 0;
    }

    // Calculate borrowed amount
    const borrowedCount = borrows
      .filter(b => (b.equipment_id === item.id) || (b.equipment_name === item.name && !b.equipment_id))
      .reduce((sum, b) => sum + (b.quantity || 1), 0);

    const calculatedAvailable = Math.max(0, item.quantity - broken - disposal - borrowedCount);

    if (item.category !== updatedCategory || item.available !== calculatedAvailable) {
      console.log(`Fixing ${item.name} | category: '${item.category}'->'${updatedCategory}' | available: ${item.available}->${calculatedAvailable} | borrowed: ${borrowedCount}`);
      
      const { error: updateErr } = await supabase.from('equipment')
        .update({ category: updatedCategory, available: calculatedAvailable })
        .eq('id', item.id);
        
      if (updateErr) {
         console.error(`Failed to update ${item.name}:`, updateErr);
      }
    }
  }

  console.log('Status fix completed!');
}

fixEquipmentStatus();
