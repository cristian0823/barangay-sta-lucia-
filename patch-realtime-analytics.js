const fs = require('fs');
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

function fix(name, oldStr, newStr) {
    const idx = a.indexOf(oldStr);
    if (idx === -1) { console.log('MISS:', name); return; }
    a = a.substring(0, idx) + newStr + a.substring(idx + oldStr.length);
    console.log('OK:', name);
}

// ── FIX 1: Remove "Submitted" from the Update Status & Respond panel ─────────
fix('remove-submitted-status-panel',
    `                                <option value="open">Submitted</option>\n                                <option value="in-progress">In Progress</option>`,
    `                                <option value="in-progress">In Progress</option>`
);

// ── FIX 2: Remove "Submitted" from the concerns filter dropdown ───────────────
fix('remove-submitted-filter',
    `                                <option value="Submitted">Submitted</option>\n                                <option value="In Progress">In Progress</option>`,
    `                                <option value="In Progress">In Progress</option>`
);

// ── FIX 3: Add loadAnalytics() to borrowings realtime handler ─────────────────
fix('realtime-borrowings-analytics',
    `                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'facility_reservations' }`,
    `                            if (typeof loadActivityLog === 'function') loadActivityLog();
                            if (typeof loadAnalytics === 'function') loadAnalytics();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'facility_reservations' }`
);

// ── FIX 4: Add loadAnalytics() + loadMultipurposeBookings() to facility_reservations handler ──
fix('realtime-facility-analytics',
    `                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'concerns' }`,
    `                            if (typeof loadActivityLog === 'function') loadActivityLog();
                            if (typeof loadMultipurposeBookings === 'function') loadMultipurposeBookings();
                            if (typeof loadAnalytics === 'function') loadAnalytics();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'concerns' }`
);

// ── FIX 5: Add loadAnalytics() to concerns realtime handler ──────────────────
fix('realtime-concerns-analytics',
    `                            if (typeof loadActivityLog === 'function') loadActivityLog();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications' }`,
    `                            if (typeof loadActivityLog === 'function') loadActivityLog();
                            if (typeof loadAnalytics === 'function') loadAnalytics();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications' }`
);

// ── FIX 6: Add users + residents table listeners ──────────────────────────────
fix('realtime-add-users-listener',
    `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {`,
    `                        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
                            console.log('[Admin Realtime] users:', payload.eventType);
                            if (typeof loadUsers === 'function') loadUsers();
                            if (typeof loadOverview === 'function') loadOverview();
                            if (typeof loadStats === 'function') loadStats();
                        })
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {`
);

// ── FIX 7: Add audit_log + security_log listeners ────────────────────────────
fix('realtime-add-audit-listeners',
    `                        .subscribe((status) => {`,
    `                        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, payload => {
                            console.log('[Admin Realtime] audit_log:', payload.eventType);
                            if (typeof loadAuditLog === 'function') loadAuditLog();
                        })
                        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'security_log' }, payload => {
                            console.log('[Admin Realtime] security_log:', payload.eventType);
                            if (typeof loadSecurityLog === 'function') loadSecurityLog();
                        })
                        .subscribe((status) => {`
);

fs.writeFileSync('admin-portal/admin.html', a);
console.log('admin.html done');
