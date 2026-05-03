const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// ─── FIX 1: Fix user_id mismatch + add concern handlers in the realtime channel ───
// Replace the entire user_notifications .on() block
const oldNotifBlock = `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {\r\n                        const newR = payload.new;\r\n                        if (!window.user || !newR) return;\r\n                        // Match by user_id (handle int vs string)\r\n                        if (String(newR.user_id) !== String(window.user.id)) return;\r\n\r\n                        // Route by type\r\n                        const type = newR.type || '';\r\n                        const msg  = newR.message || '';\r\n\r\n                        pollBellNotifications();\r\n\r\n                        if (type === 'booking_cancelled') {\r\n                            checkPendingNotifications();\r\n                        } else if (type === 'booking_approved') {\r\n                            showNotifToast('\u2705 Booking Approved', msg, 'success');\r\n                            loadBookingView && loadBookingView();\r\n                            loadDashboardStats && loadDashboardStats();\r\n                        } else if (type === 'booking_rejected') {\r\n                            showNotifToast('\u274c Booking Rejected', msg, 'error');\r\n                            loadBookingView && loadBookingView();\r\n                            loadDashboardStats && loadDashboardStats();\r\n                        } else if (type === 'equipment_approved') {\r\n                            showNotifToast('\u2705 Equipment Request Approved', msg, 'success');\r\n                            loadDashboardStats && loadDashboardStats();\r\n                        } else if (type === 'equipment_rejected') {\r\n                            showNotifToast('\u274c Equipment Request Rejected', msg, 'error');\r\n                            loadDashboardStats && loadDashboardStats();\r\n                        } else if (type === 'event_added') {\r\n                            showNotifToast('\ud83d\udce2 New Barangay Event', msg, 'info');\r\n                            loadEventsView && loadEventsView();\r\n                            loadBookingView && loadBookingView();\r\n                            loadDashboardStats && loadDashboardStats();\r\n                        } else if (type === 'event_cancelled') {\r\n                            showNotifToast('\ud83d\udeab Event Cancelled', msg, 'warning');\r\n                            loadEventsView && loadEventsView();\r\n                            loadBookingView && loadBookingView();\r\n                            loadDashboardStats && loadDashboardStats();\r\n                        }\r\n                    })`;

const newNotifBlock = `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {
                        const newR = payload.new;
                        if (!window.user || !newR) return;
                        // Match by user_id — check both session id AND resolved Supabase integer id
                        const matchesUser = String(newR.user_id) === String(window.user.id)
                            || (window._resolvedUserId && String(newR.user_id) === String(window._resolvedUserId));
                        if (!matchesUser) return;

                        // Route by type
                        const type = newR.type || '';
                        const msg  = newR.message || '';

                        // Always refresh bell immediately
                        pollBellNotifications();

                        if (type === 'booking_cancelled') {
                            checkPendingNotifications();
                        } else if (type === 'booking_approved') {
                            showNotifToast('✅ Booking Approved', msg, 'success');
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'booking_rejected') {
                            showNotifToast('❌ Booking Rejected', msg, 'error');
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'equipment_approved') {
                            showNotifToast('✅ Equipment Request Approved', msg, 'success');
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'equipment_rejected') {
                            showNotifToast('❌ Equipment Request Rejected', msg, 'error');
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'concern_in_progress') {
                            showNotifToast('🔧 Concern In Progress', msg, 'info');
                            loadConcernsView && loadConcernsView();
                            loadHistoryView && loadHistoryView();
                        } else if (type === 'concern_resolved') {
                            showNotifToast('✅ Concern Resolved', msg, 'success');
                            loadConcernsView && loadConcernsView();
                            loadHistoryView && loadHistoryView();
                        } else if (type === 'event_added') {
                            showNotifToast('📢 New Barangay Event', msg, 'info');
                            loadEventsView && loadEventsView();
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'event_cancelled') {
                            showNotifToast('🚫 Event Cancelled', msg, 'warning');
                            loadEventsView && loadEventsView();
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        }
                    })
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'concerns' }, payload => {
                        // Realtime concerns update — refresh report history for this user
                        const updated = payload.new;
                        if (!window.user || !updated) return;
                        const matchesUser = String(updated.user_id) === String(window.user.id)
                            || (window._resolvedUserId && String(updated.user_id) === String(window._resolvedUserId));
                        if (!matchesUser) return;
                        // Refresh history + concerns view silently
                        if (typeof loadConcernsView === 'function') loadConcernsView();
                        if (typeof loadHistoryView === 'function') loadHistoryView();
                    })`;

if (txt.includes(oldNotifBlock)) {
    txt = txt.replace(oldNotifBlock, newNotifBlock);
    console.log('✅ Replaced notification block');
} else {
    console.log('❌ Could not find notification block — trying normalized...');
    const norm = txt.replace(/\r\n/g, '\n');
    const normOld = oldNotifBlock.replace(/\r\n/g, '\n');
    if (norm.includes(normOld)) {
        txt = norm.replace(normOld, newNotifBlock);
        console.log('✅ Replaced after normalizing');
    } else {
        console.log('❌ Still not found');
        process.exit(1);
    }
}

// ─── FIX 2: Cache the resolved Supabase ID into window._resolvedUserId ───
// In pollBellNotifications, after resolving, store it globally
const oldPoll = `const notifs = await getUserNotifications(resolvedNotifId);
                renderBellNotifications(notifs);`;
const newPoll = `window._resolvedUserId = resolvedNotifId; // Cache for realtime matching
                const notifs = await getUserNotifications(resolvedNotifId);
                renderBellNotifications(notifs);`;

if (txt.includes(oldPoll)) {
    txt = txt.replace(oldPoll, newPoll);
    console.log('✅ Added _resolvedUserId cache');
} else {
    console.log('⚠️  Could not patch pollBellNotifications cache (non-critical)');
}

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Done writing file');
