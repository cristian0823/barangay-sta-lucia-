const fs = require('fs');

// ─── 1. Add cancel notifications to js/app.js ───────────────────────────────
let appJs = fs.readFileSync('js/app.js', 'utf8');

// Add admin notification when user cancels a borrowing
const cancelBorrowOld = `        const { error } = await supabase.from('borrowings').update({ status: 'cancelled' }).eq('id', borrowingId).eq('user_id', user.id);
        if (!error) broadcastSync();
        return { success: !error, message: error ? error.message : 'Request cancelled successfully' };`;

const cancelBorrowNew = `        const { data: brw } = await supabase.from('borrowings').select('equipment_id, quantity, equipment(name)').eq('id', borrowingId).maybeSingle();
        const { error } = await supabase.from('borrowings').update({ status: 'cancelled' }).eq('id', borrowingId).eq('user_id', user.id);
        if (!error) {
            const itemName = brw?.equipment?.name || 'equipment';
            const qty = brw?.quantity || '';
            await addNotification('admin', 'cancel_borrow', \`User cancelled borrowing request for \${qty}x \${itemName}\`);
            broadcastSync();
        }
        return { success: !error, message: error ? error.message : 'Request cancelled successfully' };`;

if (appJs.includes(cancelBorrowOld)) {
    appJs = appJs.replace(cancelBorrowOld, cancelBorrowNew);
    console.log('✅ Added cancel-borrow admin notification to js/app.js');
} else {
    console.warn('⚠️  Could not find cancelBorrowing Supabase update block');
}

// Add admin notification when user cancels a facility booking
const cancelBookOld = `        const { error } = await query;
        if (!error) broadcastSync();
        return { success: !error, message: error ? error.message : 'Booking cancelled' };`;

const cancelBookNew = `        const { data: bk } = await supabase.from('facility_reservations').select('date, time').eq('id', bookingId).maybeSingle();
        const { error } = await query;
        if (!error) {
            await addNotification('admin', 'cancel_booking', \`User cancelled facility reservation on \${bk?.date || ''} at \${bk?.time || ''}\`);
            broadcastSync();
        }
        return { success: !error, message: error ? error.message : 'Booking cancelled' };`;

if (appJs.includes(cancelBookOld)) {
    appJs = appJs.replace(cancelBookOld, cancelBookNew);
    console.log('✅ Added cancel-booking admin notification to js/app.js');
} else {
    console.warn('⚠️  Could not find cancelBooking Supabase update block');
}

fs.writeFileSync('js/app.js', appJs, 'utf8');

// ─── 2. Patch user-portal/js/app.js with same changes ───────────────────────
let userAppJs = fs.readFileSync('user-portal/js/app.js', 'utf8');
if (userAppJs.includes(cancelBorrowOld)) {
    userAppJs = userAppJs.replace(cancelBorrowOld, cancelBorrowNew);
    console.log('✅ Added cancel-borrow notification to user-portal/js/app.js');
}
if (userAppJs.includes(cancelBookOld)) {
    userAppJs = userAppJs.replace(cancelBookOld, cancelBookNew);
    console.log('✅ Added cancel-booking notification to user-portal/js/app.js');
}
fs.writeFileSync('user-portal/js/app.js', userAppJs, 'utf8');

// ─── 3. Patch admin.html ─────────────────────────────────────────────────────
const adminPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminPaths) {
    if (!fs.existsSync(path)) continue;
    let html = fs.readFileSync(path, 'utf8');

    // ── 3a. Add search bar to Concerns section ──────────────────────────────
    const concernFilterOld = `<div class="filter-bar"><span class="filter-label">Filter:</span><select id="concernStatusFilter" onchange="applyConcernFilter()"><option value="all">All Status</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>`;

    const concernFilterNew = `<div class="filter-bar" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
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

    if (html.includes(concernFilterOld)) {
        html = html.replace(concernFilterOld, concernFilterNew);
        console.log(`✅ Added search bar to Concerns in ${path}`);
    } else {
        console.warn(`⚠️  Could not find Concerns filter bar in ${path}`);
    }

    // ── 3b. Add search bar above Manage Users table ─────────────────────────
    const usersTableOld = `                         <div class="section-content">
                             <div class="admin-tables">
                                 <table class="data-table">
                                 <thead>
                                         <tr>
                                             <th>Barangay ID</th>`;

    const usersTableNew = `                         <div class="section-content">
                             <div style="padding:12px 16px 0;">
                                 <div style="position:relative;max-width:360px;">
                                     <i class="bi bi-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:13px;pointer-events:none;"></i>
                                     <input type="text" id="usersSearch" placeholder="Search name, Barangay ID, email..." oninput="renderUsersPg()" style="width:100%;padding:8px 12px 8px 32px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:13px;outline:none;">
                                 </div>
                             </div>
                             <div class="admin-tables">
                                 <table class="data-table">
                                 <thead>
                                         <tr>
                                             <th>Barangay ID</th>`;

    if (html.includes(usersTableOld)) {
        html = html.replace(usersTableOld, usersTableNew);
        console.log(`✅ Added search bar to Manage Users in ${path}`);
    } else {
        console.warn(`⚠️  Could not find users table header in ${path}`);
    }

    // ── 3c. Wire up notification icon for cancel types in the bell renderer ──
    // Find the icon mapping in loadAdminNotifications and add cancel types
    const notifIconOld = `                    const iconMap = {
                        'borrow': '📦',
                        'booking': '📅',
                        'concern': '📢',`;

    const notifIconNew = `                    const iconMap = {
                        'borrow': '📦',
                        'booking': '📅',
                        'concern': '📢',
                        'cancel_borrow': '❌',
                        'cancel_booking': '🚫',`;

    if (html.includes(notifIconOld)) {
        html = html.replace(notifIconOld, notifIconNew);
        console.log(`✅ Added cancel notification icons to bell in ${path}`);
    } else {
        // try without indentation (just in case)
        const altOld = `'borrow': '📦',\n                        'booking': '📅',\n                        'concern': '📢',`;
        if (html.includes(altOld)) {
            html = html.replace(altOld, altOld + `\n                        'cancel_borrow': '❌',\n                        'cancel_booking': '🚫',`);
            console.log(`✅ Added cancel notification icons (alt match) to bell in ${path}`);
        } else {
            console.warn(`⚠️  Could not find iconMap in ${path}`);
        }
    }

    fs.writeFileSync(path, html, 'utf8');
}
console.log('\nDone!');
