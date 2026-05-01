// ── Barangay Sta. Lucia — Supabase Backup Script ──
// Exports all tables to JSON files in the backups/ folder.

const https = require('https');
const fs = require('fs');
const path = require('path');

// ── CONFIG — update these with your Supabase project details ──
const SUPABASE_URL = 'https://cojgsyrnexbwgsfttojq.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvamdzeXJuZXhid2dzZnR0b2pxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM1ODk1OCwiZXhwIjoyMDg3OTM0OTU4fQ.RDsTgA7ZHU2OcQ4ZHk1X8SHwftMDQOG-L9eE2r2KIl4'; // ← PASTE YOUR SERVICE ROLE KEY HERE (Settings > API > service_role)

const TABLES = [
  'users',
  'equipment',
  'borrowings',
  'facility_reservations',
  'concerns',
  'events',
  'audit_log',
  'security_log',
  'user_notifications'
];

const BACKUP_DIR = path.join(__dirname);
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
const BACKUP_FILE = path.join(BACKUP_DIR, `barangay_backup_${TIMESTAMP}.json`);

if (!SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Please paste your SERVICE_ROLE_KEY in the script.');
  console.error('   Go to: Supabase Dashboard → Settings → API → service_role (secret)');
  process.exit(1);
}

function fetchTable(table) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    const options = {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.code) {
            console.warn(`  ⚠️  ${table}: ${parsed.message || 'skipped'}`);
            resolve({ table, rows: [], count: 0 });
          } else {
            const rows = Array.isArray(parsed) ? parsed : [];
            console.log(`  ✅ ${table}: ${rows.length} rows`);
            resolve({ table, rows, count: rows.length });
          }
        } catch (e) {
          console.warn(`  ⚠️  ${table}: parse error`);
          resolve({ table, rows: [], count: 0 });
        }
      });
    }).on('error', (e) => {
      console.warn(`  ⚠️  ${table}: ${e.message}`);
      resolve({ table, rows: [], count: 0 });
    });
  });
}

async function runBackup() {
  console.log('');
  console.log('🔄 Barangay Sta. Lucia — Database Backup');
  console.log('==========================================');
  console.log(`📅 Timestamp : ${new Date().toLocaleString()}`);
  console.log(`📁 Output    : ${BACKUP_FILE}`);
  console.log('');
  console.log('📦 Exporting tables...');

  const results = {};
  let totalRows = 0;

  for (const table of TABLES) {
    const { rows, count } = await fetchTable(table);
    results[table] = rows;
    totalRows += count;
  }

  const backup = {
    metadata: {
      project: 'Barangay Sta. Lucia Management System',
      supabase_url: SUPABASE_URL,
      timestamp: new Date().toISOString(),
      total_rows: totalRows,
      tables: TABLES,
    },
    data: results,
  };

  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2), 'utf8');

  console.log('');
  console.log('==========================================');
  console.log(`✅ Backup complete! ${totalRows} total rows saved.`);
  console.log(`📄 File: ${BACKUP_FILE}`);
  console.log('');
}

runBackup().catch(console.error);
