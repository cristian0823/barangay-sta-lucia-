const fs = require('fs');

// ─── FIX 1: approveEquipmentRequest — deduct inventory on approval ────────────
{
    const appJsPath = 'js/app.js';
    let content = fs.readFileSync(appJsPath, 'utf8');

    const oldApprove = `        // Stock already deducted on request submit - just update status
        const { error } = await supabase.from('borrowings').update({ status: 'approved' }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };`;

    const newApprove = `        // Deduct equipment inventory on approval
        const { data: rec2 } = await supabase.from('borrowings').select('equipment, quantity').eq('id', borrowingId).maybeSingle();
        if (rec2 && rec2.equipment && rec2.quantity) {
            const { data: eqItem } = await supabase.from('equipment').select('id, available').eq('name', rec2.equipment).maybeSingle();
            if (eqItem && eqItem.available >= rec2.quantity) {
                await supabase.from('equipment').update({ available: eqItem.available - rec2.quantity }).eq('id', eqItem.id);
            }
        }
        const { error } = await supabase.from('borrowings').update({ status: 'approved' }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };`;

    if (content.includes(oldApprove)) {
        content = content.replace(oldApprove, newApprove);
        fs.writeFileSync(appJsPath, content, 'utf8');
        console.log('✅ Fixed inventory deduction in approveEquipmentRequest');
    } else {
        console.log('⚠️  Could not find approveEquipmentRequest target in app.js');
    }
}

// ─── FIX 2: returnRequest — restore inventory when returned ──────────────────
{
    const appJsPath = 'js/app.js';
    let content = fs.readFileSync(appJsPath, 'utf8');

    // Find where returnBorrowing / markAsReturned updates status to 'returned'
    const oldReturn = `        const { error } = await supabase.from('borrowings').update({ status: 'returned' }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };`;
    const newReturn = `        // Restore equipment inventory on return
        const { data: retRec } = await supabase.from('borrowings').select('equipment, quantity').eq('id', borrowingId).maybeSingle();
        if (retRec && retRec.equipment && retRec.quantity) {
            const { data: retEq } = await supabase.from('equipment').select('id, available, quantity').eq('name', retRec.equipment).maybeSingle();
            if (retEq) {
                const restored = Math.min(retEq.quantity, retEq.available + retRec.quantity);
                await supabase.from('equipment').update({ available: restored }).eq('id', retEq.id);
            }
        }
        const { error } = await supabase.from('borrowings').update({ status: 'returned' }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };`;

    if (content.includes(oldReturn)) {
        content = content.replace(oldReturn, newReturn);
        fs.writeFileSync(appJsPath, content, 'utf8');
        console.log('✅ Fixed inventory restoration in returnBorrowing');
    } else {
        console.log('⚠️  Could not find return borrowing target in app.js');
    }
}

// ─── FIX 3: admin.html — always reload requests+overview regardless of tab ──
const adminPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    // Fix realtime borrowings handler — always load requests + overview
    const oldBorrowHandler = `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowings' }, payload => {
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadAdminNotifications === 'function') loadAdminNotifications();
                            if (typeof loadStats === 'function') loadStats();
                            if (document.getElementById('requests-section')?.style.display !== 'none' && typeof loadRequests === 'function') loadRequests();
                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })`;

    const newBorrowHandler = `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowings' }, payload => {
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadRequests === 'function') loadRequests();
                            if (typeof loadEquipment === 'function') loadEquipment();
                            if (typeof refreshAdminBell === 'function') refreshAdminBell();
                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })`;

    if (content.includes(oldBorrowHandler)) {
        content = content.replace(oldBorrowHandler, newBorrowHandler);
        console.log('✅ Fixed borrowings realtime handler in', path);
    } else {
        console.log('⚠️  Could not find borrowings realtime handler in', path);
    }

    // Fix realtime concerns handler — always load concerns + overview
    const oldConcernHandler = `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'concerns' }, payload => {
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadAdminNotifications === 'function') loadAdminNotifications();
                            if (typeof loadStats === 'function') loadStats();
                            if (document.getElementById('concerns-section')?.style.display !== 'none' && typeof loadConcerns === 'function') loadConcerns();
                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })`;

    const newConcernHandler = `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'concerns' }, payload => {
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadConcerns === 'function') loadConcerns();
                            if (typeof refreshAdminBell === 'function') refreshAdminBell();
                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })`;

    if (content.includes(oldConcernHandler)) {
        content = content.replace(oldConcernHandler, newConcernHandler);
        console.log('✅ Fixed concerns realtime handler in', path);
    } else {
        console.log('⚠️  Could not find concerns realtime handler in', path);
    }

    // Fix realtime facility_reservations handler
    const oldBookingHandler = `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'facility_reservations' }, payload => {
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadAdminNotifications === 'function') loadAdminNotifications();
                            if (typeof loadStats === 'function') loadStats();
                            if (document.getElementById('court-bookings-section')?.style.display !== 'none' && typeof loadCourtBookings === 'function') loadCourtBookings();
                                                        if (typeof loadActivityLog === 'function') loadActivityLog();
                        })`;

    const newBookingHandler = `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'facility_reservations' }, payload => {
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadCourtBookings === 'function') loadCourtBookings();
                            if (typeof loadAdminBookings === 'function') loadAdminBookings();
                            if (typeof refreshAdminBell === 'function') refreshAdminBell();
                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })`;

    if (content.includes(oldBookingHandler)) {
        content = content.replace(oldBookingHandler, newBookingHandler);
        console.log('✅ Fixed facility_reservations realtime handler in', path);
    } else {
        console.log('⚠️  Could not find facility_reservations realtime handler in', path);
    }

    // Fix audit_log realtime subscription — add it if missing
    if (!content.includes("table: 'audit_log'")) {
        const oldSubscribe = `.subscribe();
                }
            }`;
        const newSubscribe = `                        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, payload => {
                            if (typeof loadActivityLog === 'function') loadActivityLog();
                            if (typeof refreshAdminBell === 'function') refreshAdminBell();
                        })
                        .subscribe();
                }
            }`;
        if (content.includes(oldSubscribe)) {
            content = content.replace(oldSubscribe, newSubscribe);
            console.log('✅ Added audit_log realtime handler in', path);
        }
    }

    fs.writeFileSync(path, content, 'utf8');
}
