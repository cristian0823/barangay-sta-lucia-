const fs = require('fs');
const files = ['admin.html', 'admin-portal/admin.html'];

const OLD_BELL_FN = `            async function refreshAdminBell() {`;

// New version that tracks dismissed IDs in localStorage
const DISMISSED_KEY = 'adminBellDismissed';

const newBellSection = `            // Track which notification IDs have been dismissed by admin
            const ADMIN_BELL_DISMISSED_KEY = 'adminBellDismissed';
            function getAdminDismissed() {
                try { return new Set(JSON.parse(localStorage.getItem(ADMIN_BELL_DISMISSED_KEY)) || []); } catch { return new Set(); }
            }
            function saveAdminDismissed(set) {
                localStorage.setItem(ADMIN_BELL_DISMISSED_KEY, JSON.stringify([...set]));
            }
            function dismissAdminNotif(id) {
                const d = getAdminDismissed();
                d.add(id);
                saveAdminDismissed(d);
                refreshAdminBell();
            }
            function dismissAllAdminNotifs() {
                const d = getAdminDismissed();
                // Add all currently shown ids
                document.querySelectorAll('.admin-bell-item[data-notif-id]').forEach(el => d.add(el.dataset.notifId));
                saveAdminDismissed(d);
                refreshAdminBell();
            }

            async function refreshAdminBell() {`;

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Insert the dismissed helper functions before refreshAdminBell
    if (!content.includes('ADMIN_BELL_DISMISSED_KEY')) {
        content = content.replace(OLD_BELL_FN, newBellSection);
        console.log('Injected dismiss helpers in', file);
    }

    // 2. Inside refreshAdminBell, filter out dismissed items & add data-notif-id + click dismiss
    const OLD_FILTER = `                // Sort newest first
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

    const NEW_FILTER = `                // Sort newest first & filter dismissed
                items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const dismissed = getAdminDismissed();
                const visible = items.filter(n => !dismissed.has(n.id));
                const total = visible.length;

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

                list.innerHTML = visible.slice(0, 30).map(n => {
                    const timeStr = n.createdAt
                        ? new Date(n.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Just now';
                    return \`<div class="admin-bell-item is-unread" data-notif-id="\${n.id}" onclick="handleAdminBellClick('\${n.id}', '\${n.type}')">
                        <div class="admin-bell-icon-circle">\${n.icon}</div>
                        <div style="flex:1;min-width:0;padding-right:12px;">
                            <p class="admin-bell-msg">\${n.message}</p>
                            <div class="admin-bell-time">\${timeStr}</div>
                        </div>
                    </div>\`;
                }).join('');
            }`;

    if (content.includes(OLD_FILTER)) {
        content = content.replace(OLD_FILTER, NEW_FILTER);
        console.log('Updated filter logic in', file);
    } else {
        console.log('Filter pattern not found in', file);
    }

    // 3. Make handleAdminBellClick dismiss on click (decrement badge by 1)
    const OLD_CLICK = `            async function handleAdminBellClick(id, type) {
                await markNotificationAsRead(id);
                document.getElementById('adminBellDropdown').style.display = 'none';`;
    const NEW_CLICK = `            async function handleAdminBellClick(id, type) {
                dismissAdminNotif(id);
                document.getElementById('adminBellDropdown').style.display = 'none';`;

    if (content.includes(OLD_CLICK)) {
        content = content.replace(OLD_CLICK, NEW_CLICK);
        console.log('Updated click handler in', file);
    }

    // 4. Make "Mark all read" call dismissAllAdminNotifs
    const OLD_MARK_ALL = `            async function markAllAdminBellRead() {
                if (typeof markAllNotificationsRead === 'function') {
                    await markAllNotificationsRead('admin');
                }
                refreshAdminBell();
            }`;
    const NEW_MARK_ALL = `            async function markAllAdminBellRead() {
                dismissAllAdminNotifs();
            }`;

    if (content.includes(OLD_MARK_ALL)) {
        content = content.replace(OLD_MARK_ALL, NEW_MARK_ALL);
        console.log('Updated mark-all handler in', file);
    }

    fs.writeFileSync(file, content, 'utf8');
}
