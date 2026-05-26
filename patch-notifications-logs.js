const fs = require('fs');

function fix(file, name, oldStr, newStr) {
    let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const idx = c.indexOf(oldStr);
    if (idx === -1) { console.log('MISS:', name, 'in', file); return; }
    c = c.substring(0, idx) + newStr + c.substring(idx + oldStr.length);
    fs.writeFileSync(file, c);
    console.log('OK:', name);
}

const UAP = 'user-portal/js/app.js';
const AAP = 'admin-portal/js/app.js';
const AD  = 'admin-portal/admin.html';

// ════════════════════════════════════════════════════════════
// BUG #1a — bookCourt: change status to 'pending' + store venue field
// The bell queries facility_reservations WHERE status='pending'.
// Previously the insert used status='approved', so nothing ever appeared.
// ════════════════════════════════════════════════════════════
fix(UAP, 'bug1a-bookCourt-pending-with-venue',
`            const { error } = await supabase.from('facility_reservations').insert([{
                user_id: resolvedUserId,
                date: bookingData.date,
                time: combinedTime,
                purpose: bookingData.purpose || '',
                status: bookingData.status || 'approved'
            }]);`,
`            const { error } = await supabase.from('facility_reservations').insert([{
                user_id: resolvedUserId,
                date: bookingData.date,
                time: combinedTime,
                venue: venue,
                purpose: bookingData.purpose || '',
                status: 'pending'
            }]);`
);

// ════════════════════════════════════════════════════════════
// BUG #1b — refreshAdminBell: drop embedded-resource join syntax
// The users(full_name, barangay_id) join requires a FK relationship
// defined in Supabase schema. If the FK is missing on concerns or
// facility_reservations, the query silently returns nothing for that
// table. Replace with a separate batch user-name lookup instead.
// ════════════════════════════════════════════════════════════
fix(AD, 'bug1b-bell-remove-fk-join',
`                        // Query all three tables with user join for resident names
                        const [bookingsRes, borrowingsRes, concernsRes] = await Promise.all([
                            supabase.from('facility_reservations').select('id, user_id, date, time, venue, created_at, status, users(full_name, barangay_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('borrowings').select('id, user_id, equipment, quantity, borrow_date, return_date, created_at, status, users(full_name, barangay_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('concerns').select('id, user_id, title, category, description, created_at, status, users(full_name, barangay_id)').eq('status', 'pending').order('created_at', { ascending: false }).limit(20)
                        ]);

                        (bookingsRes.data || []).forEach(b => {
                            const bName = b.users ? (b.users.full_name || 'Resident') : 'Resident';`,
`                        // Query all three tables — no embedded join to avoid FK dependency
                        const [bookingsRes, borrowingsRes, concernsRes] = await Promise.all([
                            supabase.from('facility_reservations').select('id, user_id, date, time, venue, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('borrowings').select('id, user_id, equipment, quantity, borrow_date, return_date, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('concerns').select('id, user_id, title, category, description, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20)
                        ]);

                        // Batch-fetch resident names — avoids FK join requirement per table
                        const _bellUids = [...new Set([
                            ...(bookingsRes.data||[]).map(r=>r.user_id),
                            ...(borrowingsRes.data||[]).map(r=>r.user_id),
                            ...(concernsRes.data||[]).map(r=>r.user_id)
                        ].filter(Boolean))];
                        const _bellNameMap = {};
                        if (_bellUids.length) {
                            const { data: uList } = await supabase.from('users').select('id, full_name, barangay_id').in('id', _bellUids);
                            if (uList) uList.forEach(u => { _bellNameMap[String(u.id)] = u.full_name || u.barangay_id || 'Resident'; });
                        }
                        const _bellName = id => id ? (_bellNameMap[String(id)] || 'Resident') : 'Resident';

                        (bookingsRes.data || []).forEach(b => {
                            const bName = _bellName(b.user_id);`
);

// Fix the venue/time display for bookings (parse time field which is "Venue | HH:MM – HH:MM")
fix(AD, 'bug1b-bell-booking-time-parse',
`                            const venue = b.venue || 'Facility';
                            const dateStr = b.date ? new Date(b.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
                            items.push({ id: 'booking_' + b.id, refId: b.id, type: 'booking',
                                icon: '<i class="bi bi-building"></i>', iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.12)',
                                title: 'New Facility Reservation',
                                message: bName + ' — ' + venue + (dateStr ? ' on ' + dateStr : '') + (b.time ? ' at ' + b.time : ''),`,
`                            const venueStr = b.venue || (b.time ? b.time.split('|')[0].trim() : 'Facility');
                            const timeSlot = b.time && b.time.includes('|') ? b.time.split('|').slice(1).join('|').trim() : (b.time || '');
                            const dateStr = b.date ? new Date(b.date+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
                            items.push({ id: 'booking_' + b.id, refId: b.id, type: 'booking',
                                icon: '<i class="bi bi-building"></i>', iconColor: '#16a34a', iconBg: 'rgba(22,163,74,0.12)',
                                title: 'New Facility Reservation',
                                message: bName + ' — ' + venueStr + (dateStr ? ' on ' + dateStr : '') + (timeSlot ? ' at ' + timeSlot : ''),`
);

// Fix borrowings forEach (remove b.users reference)
fix(AD, 'bug1b-bell-borrowings-name',
`                        (borrowingsRes.data || []).forEach(b => {
                            const rName = b.users ? (b.users.full_name || 'Resident') : 'Resident';`,
`                        (borrowingsRes.data || []).forEach(b => {
                            const rName = _bellName(b.user_id);`
);

// Fix concerns forEach (remove c.users reference)
fix(AD, 'bug1b-bell-concerns-name',
`                        (concernsRes.data || []).forEach(c => {
                            const cName = c.users ? (c.users.full_name || 'Resident') : 'Resident';`,
`                        (concernsRes.data || []).forEach(c => {
                            const cName = _bellName(c.user_id);`
);

// ════════════════════════════════════════════════════════════
// BUG #2a — cancelCourtBooking: add audit log entry
// Previously only sent admin notification; resident action was not logged.
// ════════════════════════════════════════════════════════════
fix(UAP, 'bug2a-cancelCourtBooking-logActivity',
`        if (!error) {
            await addNotification('admin', 'cancel_booking', \`User cancelled facility reservation on \${bk?.date || ''} at \${bk?.time || ''}\`);
            broadcastSync();
        }
        return { success: !error, message: error ? error.message : 'Booking cancelled' };`,
`        if (!error) {
            const _cxBid = user.barangay_id || user.username || '';
            const _cxLabel = (user.fullName || user.full_name || user.username || 'Resident') + (_cxBid ? ' (' + _cxBid + ')' : '');
            await logActivity('Facility Reservation Cancelled', _cxLabel + ' cancelled their reservation on ' + (bk?.date || '') + (bk?.time ? ' at ' + bk.time : ''));
            await addNotification('admin', 'cancel_booking', \`User cancelled facility reservation on \${bk?.date || ''} at \${bk?.time || ''}\`);
            broadcastSync();
        }
        return { success: !error, message: error ? error.message : 'Booking cancelled' };`
);

// ════════════════════════════════════════════════════════════
// BUG #2b — updateUserProfile: add audit log entry
// Profile updates were not logged at all.
// ════════════════════════════════════════════════════════════
fix(UAP, 'bug2b-updateUserProfile-logActivity',
`    // Also update window.user which is often used in the UI
    if (window.user) {
        window.user = updatedUser;
    }

    return { success: true, message: 'Profile updated successfully' };
}`,
`    // Also update window.user which is often used in the UI
    if (window.user) {
        window.user = updatedUser;
    }

    const _upBid = user.barangay_id || user.username || '';
    const _upLabel = (user.fullName || user.full_name || user.username || 'Resident') + (_upBid ? ' (' + _upBid + ')' : '');
    await logActivity('Profile Updated', _upLabel + ' updated their profile (' + Object.keys(updates).join(', ') + ').');
    return { success: true, message: 'Profile updated successfully' };
}`
);

// ════════════════════════════════════════════════════════════
// BUG #2c — logoutUser: also write to audit_log (not just security_log)
// Logout was written to security_log only; it now also appears in audit log.
// ════════════════════════════════════════════════════════════
fix(UAP, 'bug2c-logout-also-audit',
`        if (_curr) {
            const logType = 'Logout';
            const logDetails = \`\${_curr.username || _curr.fullName || 'System'} logged out\`;
            await window.logSecurity(logType, 'N/A', 'info', logDetails, _curr.username || null);
        }`,
`        if (_curr) {
            const _loBid = _curr.barangay_id || _curr.username || 'System';
            const _loLabel = (_curr.fullName || _curr.full_name || _loBid) + ' (' + _loBid + ')';
            const logDetails = _loLabel + ' logged out';
            await window.logSecurity('Logout', 'N/A', 'info', logDetails, _loBid);
            await window.logAudit('Auth', null, 'Logout', logDetails);
        }`
);

// ════════════════════════════════════════════════════════════
// BUG #2d — admin-portal logActivity: action param was 'UPDATE' for all
// non-security events — should be the actual action name (actStr) so
// renderAuditLog can match labels and filters correctly.
// ════════════════════════════════════════════════════════════
fix(AAP, 'bug2d-admin-logActivity-action-param',
`    } else {
        await window.logAudit(actStr, null, 'UPDATE', details);
    }`,
`    } else {
        await window.logAudit(actStr, null, actStr, details);
    }`
);

console.log('\nAll done.');
