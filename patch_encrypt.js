const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'admin-portal', 'admin.html');
let content = fs.readFileSync(file, 'utf8');

// ── 1. Remove the "Encrypt Records" button ───────────────────────────────────
const btnOld = `\r\n                                <button class="btn btn-small" style="background:#7c3aed;color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;" onclick="openEncryptMigrateModal()">&#128272; Encrypt Records</button>`;
if (content.includes(btnOld)) {
    content = content.replace(btnOld, '');
    console.log('✅ Step 1: Button removed');
} else {
    console.log('❌ Step 1: Button NOT found — check exact content');
}

// ── 2. Remove the encrypt modal HTML block ───────────────────────────────────
const modalStart = `\r\n                    <!-- ENCRYPT RECORDS MIGRATION MODAL -->`;
const modalEnd = `\r\n                    <!-- BATCH UPLOAD MODAL -->`;
const si = content.indexOf(modalStart);
const ei = content.indexOf(modalEnd);
if (si !== -1 && ei !== -1 && si < ei) {
    content = content.slice(0, si) + '\r\n' + content.slice(ei);
    console.log('✅ Step 2: Modal removed');
} else {
    console.log('❌ Step 2: Modal markers not found', si, ei);
}

// ── 3. Replace old encrypt functions with silent version ─────────────────────
const funcStart = `             function openEncryptMigrateModal() {`;
const funcEnd   = `             async function submitBatchUpload() {`;
const fi = content.indexOf(funcStart);
const fei = content.indexOf(funcEnd);
if (fi !== -1 && fei !== -1 && fi < fei) {
    const silentFunc = `             // Silent background encryption — runs automatically on admin load.
             // Detects plaintext email/phone/barangay_id and encrypts them. Safe to re-run.
             async function silentEncryptMigration() {
                 try {
                     const supabaseAvail = await isSupabaseAvailable();
                     if (!supabaseAvail) return;
                     const { data: users, error } = await supabase.from('users').select('id, email, phone, barangay_id');
                     if (error || !users) return;
                     let encrypted = 0;
                     for (const u of users) {
                         const updates = {};
                         if (u.email && !u.email.startsWith('ENC:'))              updates.email       = await encryptData(u.email);
                         if (u.phone && !u.phone.startsWith('ENC:'))              updates.phone       = await encryptData(u.phone);
                         if (u.barangay_id && !u.barangay_id.startsWith('ENC:')) updates.barangay_id = await encryptData(u.barangay_id);
                         if (Object.keys(updates).length > 0) {
                             await supabase.from('users').update(updates).eq('id', u.id);
                             encrypted++;
                         }
                     }
                     if (encrypted > 0) {
                         console.log('[Security] Auto-encrypted ' + encrypted + ' plaintext record(s).');
                         await logActivity('Auto Data Encryption', 'System encrypted ' + encrypted + ' plaintext user record(s).');
                     }
                 } catch(e) {
                     console.warn('[Security] Background encryption skipped:', e.message);
                 }
             }

             async function submitBatchUpload() {`;
    content = content.slice(0, fi) + silentFunc + content.slice(fei + funcEnd.length);
    console.log('✅ Step 3: Old encrypt functions replaced with silent version');
} else {
    console.log('❌ Step 3: Function markers not found', fi, fei);
}

// ── 4. Add auto-call in DOMContentLoaded ────────────────────────────────────
const statsLine = `                await loadSystemStatsForProfile();\r\n`;
const statsReplacement = `                await loadSystemStatsForProfile();\r\n\r\n                // Auto-encrypt any plaintext user records silently in the background\r\n                setTimeout(() => silentEncryptMigration(), 3000);\r\n`;
const firstOccurrence = content.indexOf(statsLine);
if (firstOccurrence !== -1) {
    content = content.slice(0, firstOccurrence) + statsReplacement + content.slice(firstOccurrence + statsLine.length);
    console.log('✅ Step 4: Auto-call added in DOMContentLoaded');
} else {
    console.log('❌ Step 4: loadSystemStatsForProfile line not found');
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ File written successfully');
