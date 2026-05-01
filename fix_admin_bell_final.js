const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

// Replace the refreshAdminBell function with one that queries actual tables
const oldFn = `            async function refreshAdminBell() {
                const list = document.getElementById('adminBellList');
                const badge = document.getElementById('adminBellBadge');
                if (!list || !badge) return;

                const notifs = await getNotifications('admin');
                const unread = notifs.filter(n => !n.isRead);

                if (unread.length > 0) {
                    badge.style.display = 'flex';
                    badge.textContent = unread.length > 99 ? '99+' : unread.length;
                } else {
                    badge.style.display = 'none';
                }

                if (!notifs || notifs.length === 0) {
                    list.innerHTML = '<div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>No new notifications</div>';
                    return;
                }

                const iconMap = {
                    'borrow':  { icon: '📦', label: 'Equipment Request' },
                    'booking': { icon: '📅', label: 'Facility Reservation' },
                    'concern': { icon: '📢', label: 'Concern Submitted' },
                };

                list.innerHTML = notifs.slice(0, 30).map(n => {
                    const map = iconMap[n.type] || { icon: '🔔', label: 'Notification' };
                    const isUnread = !n.isRead;
                    const timeStr = n.createdAt
                        ? new Date(n.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Just now';
                    return \`<div class="admin-bell-item \${isUnread ? 'is-unread' : ''}" onclick="handleAdminBellClick('\${n.id}', '\${n.type}')">
                        \${isUnread ? '<div class="admin-bell-unread-dot"></div>' : ''}
                        <div class="admin-bell-icon-circle">\${map.icon}</div>
                        <div style="flex:1;min-width:0;padding-right:12px;">
                            <p class="admin-bell-msg">\${n.message || map.label}</p>
                            <div class="admin-bell-time">\${timeStr}</div>
                        </div>
                    </div>\`;
                }).join('');
            }`;

const newFn = `            async function refreshAdminBell() {
                const list = document.getElementById('adminBellList');
                const badge = document.getElementById('adminBellBadge');
                if (!list || !badge) return;

                let items = [];

                try {
                    const supabaseOk = typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable();
                    if (supabaseOk) {
                        // Query all three tables for recent pending activity
                        const [bookingsRes, borrowingsRes, concernsRes] = await Promise.all([
                            supabase.from('facility_reservations').select('id, user_id, date, time, venue_name, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('borrowings').select('id, user_id, equipment, quantity, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('concerns').select('id, user_id, subject, message, created_at').eq('is_read', false).order('created_at', { ascending: false }).limit(20)
                        ]);

                        (bookingsRes.data || []).forEach(b => items.push({
                            id: 'booking_' + b.id,
                            refId: b.id,
                            type: 'booking',
                            icon: '📅',
                            message: 'New facility reservation for ' + (b.venue_name || 'venue') + ' on ' + b.date,
                            createdAt: b.created_at
                        }));
                        (borrowingsRes.data || []).forEach(b => items.push({
                            id: 'borrow_' + b.id,
                            refId: b.id,
                            type: 'borrow',
                            icon: '📦',
                            message: 'Equipment request: ' + b.quantity + 'x ' + b.equipment,
                            createdAt: b.created_at
                        }));
                        (concernsRes.data || []).forEach(c => items.push({
                            id: 'concern_' + c.id,
                            refId: c.id,
                            type: 'concern',
                            icon: '📢',
                            message: 'New concern: ' + (c.subject || c.message || 'Untitled'),
                            createdAt: c.created_at
                        }));
                    } else {
                        // LocalStorage fallback
                        const bookings = (JSON.parse(localStorage.getItem('courtBookings')) || []).filter(b => b.status === 'pending');
                        const borrowings = (JSON.parse(localStorage.getItem('courtBorrowings')) || []).filter(b => b.status === 'pending');
                        const concerns = (JSON.parse(localStorage.getItem('barangayConcerns')) || []).filter(c => !c.isRead);
                        bookings.forEach(b => items.push({ id: 'booking_' + b.id, refId: b.id, type: 'booking', icon: '📅', message: 'Pending facility reservation on ' + b.date, createdAt: b.createdAt }));
                        borrowings.forEach(b => items.push({ id: 'borrow_' + b.id, refId: b.id, type: 'borrow', icon: '📦', message: 'Equipment request: ' + (b.quantity || 1) + 'x ' + b.equipment, createdAt: b.createdAt }));
                        concerns.forEach(c => items.push({ id: 'concern_' + c.id, refId: c.id, type: 'concern', icon: '📢', message: 'New concern: ' + (c.subject || 'Untitled'), createdAt: c.createdAt }));
                    }
                } catch(e) { console.warn('Admin bell error:', e); }

                // Sort newest first
                items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const total = items.length;

                if (total > 0) {
                    badge.style.display = 'flex';
                    badge.textContent = total > 99 ? '99+' : total;
                } else {
                    badge.style.display = 'none';
                }

                if (total === 0) {
                    list.innerHTML = '<div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>No pending actions</div>';
                    return;
                }

                list.innerHTML = items.slice(0, 30).map(n => {
                    const timeStr = n.createdAt
                        ? new Date(n.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Just now';
                    return \`<div class="admin-bell-item is-unread" onclick="handleAdminBellClick('\${n.id}', '\${n.type}')">
                        <div class="admin-bell-icon-circle">\${n.icon}</div>
                        <div style="flex:1;min-width:0;padding-right:12px;">
                            <p class="admin-bell-msg">\${n.message}</p>
                            <div class="admin-bell-time">\${timeStr}</div>
                        </div>
                    </div>\`;
                }).join('');
            }`;

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('const notifs = await getNotifications(\'admin\');')) {
        content = content.replace(oldFn, newFn);
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed admin bell in', file);
    } else {
        console.log('Pattern not found in', file, '- trying alternate match');
        // Try replacing just the function body
        const start = content.indexOf('async function refreshAdminBell()');
        if (start !== -1) {
            // Find the matching closing brace
            let depth = 0, i = start;
            let inFn = false;
            while (i < content.length) {
                if (content[i] === '{') { depth++; inFn = true; }
                if (content[i] === '}') { depth--; }
                if (inFn && depth === 0) { break; }
                i++;
            }
            const oldBlock = content.substring(start, i + 1);
            content = content.replace(oldBlock, newFn.trim());
            fs.writeFileSync(file, content, 'utf8');
            console.log('Fixed (alternate) admin bell in', file);
        }
    }
}
