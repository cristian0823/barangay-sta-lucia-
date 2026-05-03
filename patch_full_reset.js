const https = require('https');

const SUPABASE_HOST = 'cojgsyrnexbwgsfttojq.supabase.co';
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
        try { resolve(JSON.parse(data || '[]')); } catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fullReset() {
  try {
    console.log('Fetching all equipment...');
    const equipment = await fetchSupabase('/rest/v1/equipment?select=*');

    console.log('Fetching approved borrows...');
    const borrows = await fetchSupabase('/rest/v1/borrowings?status=eq.approved&select=equipment,quantity');

    for (const item of equipment) {
      // Fix legacy string categories to numeric '0'
      let fixedCategory = item.category;
      let disposal = 0;
      if (['Under Repair', 'For Disposal', 'Available', 'In Use', 'General'].includes(item.category)) {
        fixedCategory = '0';
        disposal = 0;
      } else {
        disposal = parseInt(item.category) || 0;
        fixedCategory = String(disposal);
      }

      let broken = item.broken || 0;

      // Cap broken to not exceed quantity
      if (broken > item.quantity) {
        console.log(`  Capping broken for ${item.name}: ${broken} -> ${item.quantity}`);
        broken = item.quantity;
      }

      // Cap disposal too
      if (broken + disposal > item.quantity) {
        disposal = Math.max(0, item.quantity - broken);
        fixedCategory = String(disposal);
      }

      // Active borrows
      const borrowedCount = borrows
        .filter(b => b.equipment === item.name)
        .reduce((sum, b) => sum + (b.quantity || 1), 0);

      const correctAvailable = Math.max(0, item.quantity - broken - disposal - borrowedCount);

      const needsFix = item.category !== fixedCategory
                    || item.available !== correctAvailable
                    || item.broken !== broken;

      if (needsFix) {
        console.log(`Fixing "${item.name}" | broken: ${item.broken}->${broken} | disposal: ${parseInt(item.category)||0}->${disposal} | available: ${item.available}->${correctAvailable} | borrowed: ${borrowedCount}`);
        await fetchSupabase(`/rest/v1/equipment?id=eq.${item.id}`, 'PATCH', {
          broken: broken,
          category: fixedCategory,
          available: correctAvailable
        });
      } else {
        console.log(`OK "${item.name}" — no changes needed`);
      }
    }
    console.log('\nFull reset completed!');
  } catch(e) {
    console.error('Error:', e.message || e);
  }
}

fullReset();
