const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

// The NEW replacement CSS - matches user portal bell design
const newBellCSS = `
        /* ── Admin Notification Bell (matches user portal design) ── */
        .admin-bell-btn {
            position: relative;
            width: 38px;
            height: 38px;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
            background: #f9fafb;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            color: #4b5563;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        .admin-bell-btn:hover {
            background: #ecfdf5;
            border-color: #6ee7b7;
            color: #059669;
        }
        [data-theme="dark"] .admin-bell-btn {
            background: #1e293b;
            border-color: #334155;
            color: #94a3b8;
        }
        [data-theme="dark"] .admin-bell-btn:hover {
            background: #0d2318;
            border-color: #34d399;
            color: #34d399;
        }
        .admin-bell-badge {
            position: absolute;
            top: -6px;
            right: -6px;
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
            border: 2px solid #fff;
        }
        [data-theme="dark"] .admin-bell-badge {
            border-color: #1a1d27;
        }
        /* Dropdown - positioned fixed from top header */
        .admin-bell-dropdown {
            position: fixed;
            top: 64px;
            right: 20px;
            width: 350px;
            max-height: 480px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.18);
            z-index: 99999;
            display: none;
            flex-direction: column;
            overflow: hidden;
        }
        [data-theme="dark"] .admin-bell-dropdown {
            background: #1e293b;
            border-color: #334155;
        }
        /* Arrow pointer on dropdown */
        .admin-bell-dropdown::before {
            content: '';
            position: absolute;
            top: -8px;
            right: 80px;
            width: 16px;
            height: 16px;
            background: #fff;
            border-left: 1px solid #e5e7eb;
            border-top: 1px solid #e5e7eb;
            transform: rotate(45deg);
            z-index: 1;
        }
        [data-theme="dark"] .admin-bell-dropdown::before {
            background: #1e293b;
            border-color: #334155;
        }
        .admin-bell-header {
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f9fafb;
            position: relative;
            z-index: 2;
        }
        [data-theme="dark"] .admin-bell-header {
            background: rgba(15,23,42,0.5);
            border-color: #334155;
        }
        .admin-bell-header h3 {
            font-weight: 700;
            font-size: 15px;
            color: #1f2937;
            margin: 0;
        }
        [data-theme="dark"] .admin-bell-header h3 { color: #f1f5f9; }
        .admin-bell-markall {
            font-size: 12px;
            color: #059669;
            font-weight: 600;
            background: none;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .admin-bell-markall:hover { text-decoration: underline; }
        .admin-bell-list {
            max-height: 380px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 2;
        }
        .admin-bell-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px 16px;
            border-bottom: 1px solid #f3f4f6;
            cursor: pointer;
            transition: background 0.15s;
            position: relative;
        }
        .admin-bell-item:hover { background: #f9fafb; }
        .admin-bell-item.is-unread { background: #f0fdf4; }
        [data-theme="dark"] .admin-bell-item { border-color: #334155; }
        [data-theme="dark"] .admin-bell-item:hover { background: #0f172a; }
        [data-theme="dark"] .admin-bell-item.is-unread { background: #0d2318; }
        .admin-bell-unread-dot {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
        }
        .admin-bell-icon-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }
        [data-theme="dark"] .admin-bell-icon-circle { background: #334155; }
        .admin-bell-msg {
            font-size: 13px;
            font-weight: 500;
            color: #1f2937;
            line-height: 1.4;
            margin: 0 0 2px 0;
        }
        [data-theme="dark"] .admin-bell-msg { color: #e2e8f0; }
        .admin-bell-time {
            font-size: 11px;
            color: #9ca3af;
        }
        .admin-bell-footer {
            padding: 10px 16px;
            background: #f9fafb;
            border-top: 1px solid #f3f4f6;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            cursor: pointer;
            transition: background 0.15s;
            position: relative;
            z-index: 2;
        }
        .admin-bell-footer:hover { background: #f3f4f6; }
        [data-theme="dark"] .admin-bell-footer {
            background: rgba(15,23,42,0.5);
            border-color: #334155;
            color: #94a3b8;
        }
        [data-theme="dark"] .admin-bell-footer:hover { background: #0f172a; }
        .admin-bell-empty {
            padding: 40px 20px;
            text-align: center;
            color: #9ca3af;
            font-size: 13px;
        }
`;

const newBellHTML = `
            <!-- Admin Notification Bell -->
            <div style="position:relative;display:flex;align-items:center;" id="adminBellWrapper">
                <button class="admin-bell-btn" onclick="toggleAdminBell(event)" title="Notifications" id="adminBellBtn">
                    <i class="bi bi-bell-fill"></i>
                    <span class="admin-bell-badge" id="adminBellBadge">0</span>
                </button>
                <div class="admin-bell-dropdown" id="adminBellDropdown">
                    <div class="admin-bell-header">
                        <h3>Notifications</h3>
                        <button class="admin-bell-markall" onclick="markAllAdminBellRead(); event.stopPropagation();">
                            <i class="bi bi-check-all"></i> Mark all read
                        </button>
                    </div>
                    <div class="admin-bell-list" id="adminBellList" onclick="event.stopPropagation()">
                        <div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>No new notifications</div>
                    </div>
                    <div class="admin-bell-footer" onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';">
                        See all activity in Audit Log
                    </div>
                </div>
            </div>`;

const newBellJS = `
            // ==========================================
            // ADMIN BELL NOTIFICATIONS (matches user portal design)
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

            setInterval(refreshAdminBell, 30000);
`;

for (const path of files) {
    try {
        let content = fs.readFileSync(path, 'utf8');

        // 1. Remove old bell CSS and replace with new
        content = content.replace(/\/\* Admin Notification Bell \*\/[\s\S]*?\.admin-bell-empty \{[\s\S]*?\}/g, '');
        // Remove old bell CSS (matches user portal design) block
        content = content.replace(/\/\* ── Admin Notification Bell \(matches user portal design\) ── \*\/[\s\S]*?\.admin-bell-empty \{[\s\S]*?\}/g, '');

        // 2. Inject new CSS before </style>
        const styleEnd = '</style>\n    <link rel="icon"';
        if (!content.includes('admin-bell-footer')) {
            content = content.replace(styleEnd, newBellCSS + '\n    </style>\n    <link rel="icon"');
        }

        // 3. Replace old bell HTML block
        const oldBellPattern = /<!-- Admin Notification Bell -->[\s\S]*?<\/div>\s*\n\s*<\/div>/;
        if (content.match(oldBellPattern)) {
            content = content.replace(oldBellPattern, newBellHTML.trim());
        }

        // 4. Replace old JS block
        const oldJSPattern = /\/\/ ==========================================\s*\n\s*\/\/ ADMIN BELL NOTIFICATIONS[\s\S]*?setInterval\(refreshAdminBell, 30000\);/;
        if (content.match(oldJSPattern)) {
            content = content.replace(oldJSPattern, newBellJS.trim());
        } else if (!content.includes('toggleAdminBell')) {
            // inject before the closing script
            content = content.replace(
                '// ==========================================\n            // ADMIN NOTIFICATIONS',
                newBellJS + '\n            // ==========================================\n            // ADMIN NOTIFICATIONS'
            );
        }

        fs.writeFileSync(path, content, 'utf8');
        console.log('Rebuilt admin bell for', path);
    } catch (e) {
        console.error('Error:', path, e.message);
    }
}
