const fs = require('fs');

const paths = ['admin.html', 'admin-portal/admin.html'];

for (const path of paths) {
    if (!fs.existsSync(path)) continue;
    let html = fs.readFileSync(path, 'utf8');
    let changes = 0;

    // ── 1. Add search bar to Concerns section ──────────────────────────────────
    const concernOld = `<div class="filter-bar"><span class="filter-label">Filter:</span><select id="concernStatusFilter" onchange="applyConcernFilter()"><option value="all">All Status</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>`;
    const concernNew = `<div class="filter-bar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                                <span class="filter-label">Filter:</span>
                                <select id="concernStatusFilter" onchange="applyConcernFilter()">
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <div style="position:relative;flex:1;min-width:180px;">
                                    <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                                    <input type="text" id="concernSearch" placeholder="Search citizen or concern..." oninput="applyConcernFilter()" style="width:100%;padding:7px 12px 7px 32px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;outline:none;">
                                </div>
                            </div>`;
    if (html.includes(concernOld)) {
        html = html.replace(concernOld, concernNew);
        changes++;
        console.log(`  ✅ [${path}] Added search bar to Concerns`);
    } else {
        // Try if it was already patched (already has concernSearch)
        if (html.includes('id="concernSearch"')) {
            console.log(`  ℹ️  [${path}] Concerns search already added`);
        } else {
            console.warn(`  ⚠️  [${path}] Could not find Concerns filter bar`);
        }
    }

    // ── 2. Add search bar above Manage Users table ─────────────────────────────
    if (!html.includes('id="usersSearch"')) {
        // Find the exact section-content div before the admin-tables for users
        const usersTableOld = `<div class="section-content">
                             <div class="admin-tables">
                                 <table class="data-table">
                                 <thead>
                                         <tr>
                                             <th>Barangay ID</th>`;
        const usersTableNew = `<div class="section-content">
                             <div style="padding:12px 16px 4px;">
                                 <div style="position:relative;max-width:380px;">
                                     <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                                     <input type="text" id="usersSearch" placeholder="Search name, Barangay ID, email..." oninput="loadUsers()" style="width:100%;padding:8px 12px 8px 32px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;outline:none;">
                                 </div>
                             </div>
                             <div class="admin-tables">
                                 <table class="data-table">
                                 <thead>
                                         <tr>
                                             <th>Barangay ID</th>`;
        if (html.includes(usersTableOld)) {
            html = html.replace(usersTableOld, usersTableNew);
            changes++;
            console.log(`  ✅ [${path}] Added search bar to Manage Users`);
        } else {
            console.warn(`  ⚠️  [${path}] Could not find users table header — trying alternate`);
        }
    } else {
        console.log(`  ℹ️  [${path}] Users search already added`);
    }

    // ── 3. Wire up search text into applyConcernFilter ─────────────────────────
    const concernFilterLogicOld = `let list = _pgConcernFilter==='all' ? [..._pgConcernsList] : _pgConcernsList.filter(c=>c.status===_pgConcernFilter);`;
    const concernFilterLogicNew = `const _q = (document.getElementById('concernSearch')?.value || '').toLowerCase();
                let list = _pgConcernFilter==='all' ? [..._pgConcernsList] : _pgConcernsList.filter(c=>c.status===_pgConcernFilter);
                if (_q) list = list.filter(c => (c.full_name||c.userName||c.username||'').toLowerCase().includes(_q) || (c.title||c.description||'').toLowerCase().includes(_q));`;
    if (html.includes(concernFilterLogicOld) && !html.includes('concernSearch')?.valueOf()) {
        html = html.replace(concernFilterLogicOld, concernFilterLogicNew);
        changes++;
        console.log(`  ✅ [${path}] Wired Concerns search filter`);
    } else if (html.includes('_q = (document.getElementById')) {
        console.log(`  ℹ️  [${path}] Concerns search filter already wired`);
    } else {
        // Replace it regardless if old string found
        if (html.includes(concernFilterLogicOld)) {
            html = html.replace(concernFilterLogicOld, concernFilterLogicNew);
            changes++;
            console.log(`  ✅ [${path}] Wired Concerns search filter (forced)`);
        } else {
            console.warn(`  ⚠️  [${path}] Could not wire concern search filter`);
        }
    }

    // ── 4. Wire search into loadUsers ──────────────────────────────────────────
    const loadUsersOld = `                let users = await getAllUsers();
                users = users.filter(u => u.role !== 'admin');

                if (users.length === 0) {`;
    const loadUsersNew = `                let users = await getAllUsers();
                users = users.filter(u => u.role !== 'admin');

                // Apply search filter
                const _usersQ = (document.getElementById('usersSearch')?.value || '').toLowerCase();
                if (_usersQ) {
                    users = users.filter(u => {
                        const name = (u.fullName || u.full_name || u.username || '').toLowerCase();
                        const bid = (u.barangay_id || '').toLowerCase();
                        const email = (u.email || '').toLowerCase();
                        const phone = (u.phone || u.contact_number || '').toLowerCase();
                        return name.includes(_usersQ) || bid.includes(_usersQ) || email.includes(_usersQ) || phone.includes(_usersQ);
                    });
                }

                if (users.length === 0) {`;
    if (html.includes(loadUsersOld)) {
        html = html.replace(loadUsersOld, loadUsersNew);
        changes++;
        console.log(`  ✅ [${path}] Wired Users search filter in loadUsers`);
    } else if (html.includes('_usersQ')) {
        console.log(`  ℹ️  [${path}] Users search filter already wired`);
    } else {
        console.warn(`  ⚠️  [${path}] Could not wire users search filter`);
    }

    if (changes > 0) {
        fs.writeFileSync(path, html, 'utf8');
        console.log(`  💾 [${path}] Saved (${changes} changes)\n`);
    } else {
        console.log(`  ℹ️  [${path}] No changes needed\n`);
    }
}

// ── 5. Also apply cancel notification to user-portal/js/app.js ────────────────
const userAppPaths = ['user-portal/js/app.js', 'admin-portal/js/app.js'];
for (const p of userAppPaths) {
    if (!fs.existsSync(p)) continue;
    let js = fs.readFileSync(p, 'utf8');
    const cancelOld = `        // Removed restore reserved stock
        await supabase.from('borrowings').update({status: 'cancelled'}).eq('id', borrowingId);
        await logActivity('Borrow Cancelled', \`User cancelled their request for \${borrowing.quantity}x \${borrowing.equipment}\`);
        return { success: true, message: 'Request cancelled successfully' };`;
    const cancelNew = `        // Removed restore reserved stock
        await supabase.from('borrowings').update({status: 'cancelled'}).eq('id', borrowingId);
        await addNotification('admin', 'cancel_borrow', \`User cancelled borrowing request for \${borrowing.quantity}x \${borrowing.equipment}\`);
        await logActivity('Borrow Cancelled', \`User cancelled their request for \${borrowing.quantity}x \${borrowing.equipment}\`);
        if (typeof broadcastSync === 'function') broadcastSync();
        return { success: true, message: 'Request cancelled successfully' };`;
    if (js.includes(cancelOld)) {
        js = js.replace(cancelOld, cancelNew);
        fs.writeFileSync(p, js, 'utf8');
        console.log(`✅ [${p}] Added cancel notification`);
    } else if (js.includes('cancel_borrow')) {
        console.log(`ℹ️  [${p}] Cancel notification already added`);
    } else {
        console.warn(`⚠️  [${p}] Could not patch cancel notification`);
    }
}

console.log('\n✅ All done!');
