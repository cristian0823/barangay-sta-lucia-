const fs = require('fs');

const bellJS = `
            // ==========================================
            // ADMIN BELL NOTIFICATIONS
            // ==========================================
            function toggleAdminBell(e) {
                if (e) e.stopPropagation();
                const drop = document.getElementById('adminBellDropdown');
                if (!drop) return;
                const isOpen = drop.style.display === 'flex';
                drop.style.display = isOpen ? 'none' : 'flex';
                if (!isOpen) refreshAdminBell();
            }

            document.addEventListener('click', function(e) {
                const drop = document.getElementById('adminBellDropdown');
                const wrap = document.getElementById('adminBellWrapper');
                if (drop && wrap && drop.style.display === 'flex' && !wrap.contains(e.target)) {
                    drop.style.display = 'none';
                }
            });

            async function refreshAdminBell() {
                const list = document.getElementById('adminBellList');
                const badge = document.getElementById('adminBellBadge');
                if (!list || !badge) return;

                try {
                    const notifs = await getNotifications('admin');
                    const unread = (notifs || []).filter(n => !n.isRead);

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
                        return '<div class="admin-bell-item ' + (isUnread ? 'is-unread' : '') + '" onclick="handleAdminBellClick(\\''+n.id+'\\', \\''+n.type+'\\')"><' +
                            (isUnread ? 'div class="admin-bell-unread-dot"></div><' : '') +
                            'div class="admin-bell-icon-circle">' + map.icon + '</div>' +
                            '<div style="flex:1;min-width:0;padding-right:12px;">' +
                            '<p class="admin-bell-msg">' + (n.message || map.label) + '</p>' +
                            '<div class="admin-bell-time">' + timeStr + '</div>' +
                            '</div></div>';
                    }).join('');
                } catch(err) {
                    console.warn('refreshAdminBell error:', err);
                }
            }

            async function handleAdminBellClick(id, type) {
                if (typeof markNotificationAsRead === 'function') await markNotificationAsRead(id);
                document.getElementById('adminBellDropdown').style.display = 'none';
                const sectionMap = { 'borrow': 'requests', 'booking': 'court-bookings', 'concern': 'concerns' };
                const target = sectionMap[type];
                if (target) {
                    const btn = document.querySelector('.sidebar-btn[onclick*="' + target + '"]');
                    if (typeof switchSection === 'function') switchSection(target, btn);
                }
                refreshAdminBell();
            }

            async function markAllAdminBellRead() {
                if (typeof markAllNotificationsRead === 'function') {
                    await markAllNotificationsRead('admin');
                }
                refreshAdminBell();
            }

            // Refresh bell every 30 seconds
            setInterval(refreshAdminBell, 30000);
`;

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Remove any existing admin bell JS to avoid duplicates
    content = content.replace(/\/\/ ={10,}\s*\n\s*\/\/ ADMIN BELL NOTIFICATIONS[\s\S]*?setInterval\(refreshAdminBell, 30000\);\n/g, '');

    // Inject bell JS right before the closing </script> of the main script block
    // Find the last </script> before </body>
    const anchor = '// ==========================================\n            // ADMIN NOTIFICATIONS';
    if (content.includes(anchor)) {
        content = content.replace(anchor, bellJS + '\n            // ==========================================\n            // ADMIN NOTIFICATIONS');
    } else {
        // Fallback: inject before the very last </script>
        const lastScript = content.lastIndexOf('</script>');
        content = content.slice(0, lastScript) + bellJS + '\n        ' + content.slice(lastScript);
    }

    // Also make sure refreshAdminBell is called on init
    if (!content.includes('refreshAdminBell();')) {
        content = content.replace('loadAdminNotifications();', 'loadAdminNotifications();\n                refreshAdminBell();');
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log('Injected bell JS into', path);
}
