const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// ── 1. Add search bar to Manage Users ─────────────────────────────────────────
if (!html.includes('id="usersSearch"')) {
    const usersSectionStart = html.indexOf('id="users-section"');
    if (usersSectionStart === -1) { console.error('users-section not found'); process.exit(1); }

    // Find first <div class="admin-tables"> after users-section
    const needle = `<div class="admin-tables">`;
    let idx = html.indexOf(needle, usersSectionStart);
    if (idx === -1) { console.error('admin-tables not found after users-section'); process.exit(1); }

    const searchBarHtml = `<div style="padding:12px 16px 4px;"><div style="position:relative;max-width:380px;"><i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i><input type="text" id="usersSearch" placeholder="Search name, Barangay ID, email..." oninput="loadUsers()" style="width:100%;padding:8px 12px 8px 32px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;outline:none;"></div></div>\n                            `;

    html = html.substring(0, idx) + searchBarHtml + html.substring(idx);
    console.log('✅ Added usersSearch bar');
} else {
    console.log('ℹ️  usersSearch already exists');
}

// ── 2. Wire search filter into loadUsers ──────────────────────────────────────
const filterTarget = `users = users.filter(u => u.role !== 'admin');`;
const filterReplacement = `users = users.filter(u => u.role !== 'admin');

                // Search filter
                const _usersQ = (document.getElementById('usersSearch')?.value || '').toLowerCase();
                if (_usersQ) {
                    users = users.filter(u => {
                        const n = (u.fullName||u.full_name||u.username||'').toLowerCase();
                        const b = (u.barangay_id||'').toLowerCase();
                        const e = (u.email||'').toLowerCase();
                        const p = (u.phone||u.contact_number||'').toLowerCase();
                        return n.includes(_usersQ)||b.includes(_usersQ)||e.includes(_usersQ)||p.includes(_usersQ);
                    });
                }`;

if (!html.includes('_usersQ')) {
    // Only replace the first occurrence (inside loadUsers)
    const luIdx = html.indexOf('async function loadUsers()');
    if (luIdx === -1) { console.error('loadUsers not found'); process.exit(1); }
    const afterLu = html.indexOf(filterTarget, luIdx);
    if (afterLu === -1) { console.error('filter target not found in loadUsers'); process.exit(1); }
    html = html.substring(0, afterLu) + filterReplacement + html.substring(afterLu + filterTarget.length);
    console.log('✅ Wired loadUsers search filter');
} else {
    console.log('ℹ️  loadUsers search filter already wired');
}

fs.writeFileSync('admin.html', html, 'utf8');
console.log('💾 admin.html saved');

// ── 3. Mirror to admin-portal/admin.html ──────────────────────────────────────
fs.copyFileSync('admin.html', 'admin-portal/admin.html');
console.log('💾 admin-portal/admin.html synced');
