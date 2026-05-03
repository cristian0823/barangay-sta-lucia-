const https = require('https');

const SUPABASE_HOST = 'cojgsyrnexbwgsfttojq.supabase.co';
const SUPABASE_URL = `https://${SUPABASE_HOST}`;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTg5NTgsImV4cCI6MjA4NzkzNDk1OH0.FbZmFhlPhQyP3_N8nei5rL8W3oYkwup16zEJpG3Kw4E';

function fetchSupabase(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_HOST,
      port: 443,
      path: path,
      method: method,
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data || '[]'));
          } catch(e) {
            resolve(data);
          }
        } else {
          reject(new Error(`API Error: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function fixEquipmentStatus() {
  try {
    console.log('Fetching equipment...');
    const equipment = await fetchSupabase('/rest/v1/equipment?select=*');
    
    console.log('Fetching approved borrow requests...');
    const borrows = await fetchSupabase('/rest/v1/borrowings?status=eq.approved&select=equipment,quantity,status');
    
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
        .filter(b => b.equipment === item.name)
        .reduce((sum, b) => sum + (b.quantity || 1), 0);

      const calculatedAvailable = Math.max(0, item.quantity - broken - disposal - borrowedCount);

      if (item.category !== updatedCategory || item.available !== calculatedAvailable) {
        console.log(`Fixing ${item.name} | category: '${item.category}'->'${updatedCategory}' | available: ${item.available}->${calculatedAvailable} | borrowed: ${borrowedCount}`);
        
        await fetchSupabase(`/rest/v1/equipment?id=eq.${item.id}`, 'PATCH', {
          category: updatedCategory,
          available: calculatedAvailable
        });
      }
    }
    console.log('Status fix completed!');
  } catch(e) {
    console.error('Error:', e);
  }
}

fixEquipmentStatus();
