const fs = require('fs');

const bellCSS = `
        /* Admin Notification Bell */
        .admin-bell-btn {
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 12px;
            border: 1.5px solid var(--border, #e2e8f0);
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            color: var(--muted, #6b7280);
            transition: all 0.2s;
        }
        .admin-bell-btn:hover {
            background: var(--green-50, #ecfdf5);
            border-color: var(--green-200, #a7f3d0);
            color: var(--green-dark, #059669);
        }
        [data-theme="dark"] .admin-bell-btn {
            border-color: #2d3148;
            color: #94a3b8;
        }
        [data-theme="dark"] .admin-bell-btn:hover {
            background: #0d2318;
            border-color: #1e5540;
            color: #34d399;
        }
        .admin-bell-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #ef4444;
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            min-width: 18px;
            height: 18px;
            border-radius: 999px;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            line-height: 1;
            border: 2px solid var(--surface, #fff);
        }
        .admin-bell-dropdown {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: 360px;
            max-height: 480px;
            background: var(--surface, #fff);
            border: 1.5px solid var(--border, #e2e8f0);
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            z-index: 9999;
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        [data-theme="dark"] .admin-bell-dropdown {
            background: #1a1d27;
            border-color: #2d3148;
        }
        .admin-bell-dropdown-header {
            padding: 16px 18px 12px;
            border-bottom: 1px solid var(--border, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        [data-theme="dark"] .admin-bell-dropdown-header {
            border-color: #2d3148;
        }
        .admin-bell-dropdown-header span {
            font-weight: 800;
            font-size: 15px;
            color: var(--text, #1e293b);
        }
        [data-theme="dark"] .admin-bell-dropdown-header span {
            color: #e2e8f0;
        }
        .admin-bell-mark-all {
            font-size: 12px;
            color: #059669;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
        }
        .admin-bell-list {
            overflow-y: auto;
            flex: 1;
        }
        .admin-bell-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 14px 18px;
            border-bottom: 1px solid var(--border, #f1f5f9);
            cursor: pointer;
            transition: background 0.15s;
            text-decoration: none;
        }
        .admin-bell-item:hover {
            background: var(--panel-bg, #f8fafc);
        }
        .admin-bell-item.unread {
            background: #f0fdf4;
        }
        [data-theme="dark"] .admin-bell-item.unread {
            background: #0d2318;
        }
        [data-theme="dark"] .admin-bell-item {
            border-color: #2d3148;
        }
        [data-theme="dark"] .admin-bell-item:hover {
            background: #232736;
        }
        .admin-bell-icon-wrap {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
            background: #f1f5f9;
        }
        [data-theme="dark"] .admin-bell-icon-wrap {
            background: #2d3148;
        }
        .admin-bell-icon-wrap.borrow { background: #fffbeb; }
        .admin-bell-icon-wrap.booking { background: #eff6ff; }
        .admin-bell-icon-wrap.concern { background: #fef2f2; }
        [data-theme="dark"] .admin-bell-icon-wrap.borrow { background: #2d2210; }
        [data-theme="dark"] .admin-bell-icon-wrap.booking { background: #0f1e38; }
        [data-theme="dark"] .admin-bell-icon-wrap.concern { background: #2d1010; }
        .admin-bell-content-text {
            font-size: 13px;
            font-weight: 600;
            color: var(--text, #1e293b);
            line-height: 1.4;
        }
        [data-theme="dark"] .admin-bell-content-text { color: #e2e8f0; }
        .admin-bell-time {
            font-size: 11px;
            color: var(--muted, #9ca3af);
            margin-top: 3px;
        }
        .admin-bell-empty {
            padding: 40px 20px;
            text-align: center;
            color: var(--muted, #9ca3af);
            font-size: 13px;
        }
        .admin-bell-unread-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            flex-shrink: 0;
            margin-top: 6px;
        }
`;

const bellHTML = `
            <!-- Admin Notification Bell -->
            <div style="position:relative;" id="adminBellWrapper">
                <button class="admin-bell-btn" onclick="toggleAdminBell(event)" title="Notifications" id="adminBellBtn">
                    <i class="bi bi-bell-fill"></i>
                    <span class="admin-bell-badge" id="adminBellBadge">0</span>
                </button>
                <div class="admin-bell-dropdown" id="adminBellDropdown">
                    <div class="admin-bell-dropdown-header">
                        <span><i class="bi bi-bell-fill" style="color:#10b981;margin-right:6px;"></i>Notifications</span>
                        <button class="admin-bell-mark-all" onclick="markAllAdminBellRead()">Mark all read</button>
                    </div>
                    <div class="admin-bell-list" id="adminBellList">
                        <div class="admin-bell-empty">No new notifications</div>
                    </div>
                </div>
            </div>`;

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

                const notifs = await getNotifications('admin');
                const unread = notifs.filter(n => !n.isRead);

                // Badge
                if (unread.length > 0) {
                    badge.style.display = 'flex';
                    badge.textContent = unread.length > 99 ? '99+' : unread.length;
                } else {
                    badge.style.display = 'none';
                }

                if (!notifs || notifs.length === 0) {
                    list.innerHTML = '<div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:28px;display:block;margin-bottom:8px;"></i>No notifications yet</div>';
                    return;
                }

                const iconMap = {
                    'borrow': { icon: '<i class="bi bi-box-fill" style="color:#f59e0b;"></i>', cls: 'borrow', label: 'Equipment Request' },
                    'booking': { icon: '<i class="bi bi-calendar-check-fill" style="color:#3b82f6;"></i>', cls: 'booking', label: 'Facility Reservation' },
                    'concern': { icon: '<i class="bi bi-megaphone-fill" style="color:#ef4444;"></i>', cls: 'concern', label: 'Concern Submitted' },
                };

                list.innerHTML = notifs.slice(0, 30).map(n => {
                    const map = iconMap[n.type] || { icon: '<i class="bi bi-bell-fill" style="color:#6b7280;"></i>', cls: '', label: 'Notification' };
                    const isUnread = !n.isRead;
                    const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';
                    return \`<div class="admin-bell-item \${isUnread ? 'unread' : ''}" onclick="handleAdminBellClick('\${n.id}', '\${n.type}')">
                        <div class="admin-bell-icon-wrap \${map.cls}">\${map.icon}</div>
                        <div style="flex:1;min-width:0;">
                            <div class="admin-bell-content-text">\${n.message || map.label}</div>
                            <div class="admin-bell-time">\${timeStr}</div>
                        </div>
                        \${isUnread ? '<div class="admin-bell-unread-dot"></div>' : ''}
                    </div>\`;
                }).join('');
            }

            async function handleAdminBellClick(id, type) {
                await markNotificationAsRead(id);
                document.getElementById('adminBellDropdown').style.display = 'none';
                const sectionMap = { 'borrow': 'requests', 'booking': 'court-bookings', 'concern': 'concerns' };
                const target = sectionMap[type];
                if (target) {
                    const btn = document.querySelector(\`.sidebar-btn[onclick*="\${target}"]\`);
                    switchSection(target, btn);
                }
                refreshAdminBell();
            }

            async function markAllAdminBellRead() {
                if (typeof markAllNotificationsRead === 'function') {
                    await markAllNotificationsRead('admin');
                }
                refreshAdminBell();
            }

            // Poll every 30 seconds
            setInterval(refreshAdminBell, 30000);
`;

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    try {
        let content = fs.readFileSync(path, 'utf8');

        // 1. Inject CSS before </style>
        if (!content.includes('Admin Notification Bell')) {
            content = content.replace('</style>\n    <link rel="icon"', bellCSS + '\n    </style>\n    <link rel="icon"');
        }

        // 2. Inject bell HTML before the dark mode button in the user-menu
        const darkTogglePattern = '<button class="admin-dark-toggle dark-mode-toggle"';
        if (!content.includes('adminBellWrapper') && content.includes(darkTogglePattern)) {
            content = content.replace(darkTogglePattern, bellHTML + '\n                ' + darkTogglePattern);
        }

        // 3. Inject JS before the closing </script> of the first script block after </body>
        // Actually inject right before loadAdminNotifications call at init
        if (!content.includes('toggleAdminBell')) {
            const initAnchor = 'loadAdminNotifications();';
            content = content.replace(initAnchor, initAnchor + '\n                refreshAdminBell();');
            content = content.replace('// ==========================================\n            // ADMIN NOTIFICATIONS', bellJS + '\n            // ==========================================\n            // ADMIN NOTIFICATIONS');
        }

        fs.writeFileSync(path, content, 'utf8');
        console.log('Patched', path);
    } catch (e) {
        console.error('Error in', path, e.message);
    }
}
