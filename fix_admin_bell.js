const fs = require('fs');

const adminHtmlPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminHtmlPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    // Regex to match the entire refreshAdminBell function
    const regex = /async function refreshAdminBell\(\) \{[\s\S]*?async function handleAdminBellClick/g;

    const newRefreshAdminBell = `async function refreshAdminBell() {
                const list = document.getElementById('adminBellList');
                const badge = document.getElementById('adminBellBadge');
                if (!list || !badge) return;

                try {
                    const supabaseAvailable = await isSupabaseAvailable();
                    let auditLogs = [];
                    
                    if (supabaseAvailable) {
                        const { data, error } = await supabase
                            .from('audit_log')
                            .select('*')
                            .in('action', ['Concern Submitted', 'Borrow Request', 'Court Reservation Submitted'])
                            .order('created_at', { ascending: false })
                            .limit(20);
                        if (!error && data) auditLogs = data;
                    } else {
                        const localLogs = JSON.parse(localStorage.getItem('barangay_audit_log')) || [];
                        auditLogs = localLogs
                            .filter(l => ['Concern Submitted', 'Borrow Request', 'Court Reservation Submitted'].includes(l.action))
                            .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
                            .slice(0, 20);
                    }

                    const lastViewed = localStorage.getItem('last_admin_bell_view') || 0;
                    const unread = auditLogs.filter(n => new Date(n.created_at || n.timestamp).getTime() > parseInt(lastViewed));

                    if (unread.length > 0) {
                        badge.style.display = 'flex';
                        badge.textContent = unread.length > 99 ? '99+' : unread.length;
                    } else {
                        badge.style.display = 'none';
                    }

                    if (!auditLogs || auditLogs.length === 0) {
                        list.innerHTML = '<div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>No new activities</div>';
                        return;
                    }

                    const iconMap = {
                        'Borrow Request':  { icon: '\uD83D\uDCE6', label: 'Equipment Request' },
                        'Court Reservation Submitted': { icon: '\uD83D\uDDD3\uFE0F', label: 'Facility Reservation' },
                        'Concern Submitted': { icon: '\u26A0\uFE0F', label: 'Concern Submitted' },
                    };

                    list.innerHTML = auditLogs.map(n => {
                        const map = iconMap[n.action] || { icon: '\uD83D\uDD14', label: 'Activity' };
                        const isUnread = new Date(n.created_at || n.timestamp).getTime() > parseInt(lastViewed);
                        const timeStr = (n.created_at || n.timestamp)
                            ? new Date(n.created_at || n.timestamp).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Just now';
                            
                        let typeStr = 'borrow';
                        if (n.action === 'Court Reservation Submitted') typeStr = 'booking';
                        if (n.action === 'Concern Submitted') typeStr = 'concern';

                        return '<div class="admin-bell-item ' + (isUnread ? 'is-unread' : '') + '" onclick="handleAdminBellClick(\\'' + typeStr + '\\')"><' +
                            (isUnread ? 'div class="admin-bell-unread-dot"></div><' : '') +
                            'div class="admin-bell-icon-circle">' + map.icon + '</div>' +
                            '<div style="flex:1;min-width:0;padding-right:12px;">' +
                            '<p class="admin-bell-msg">' + (n.details || map.label) + '</p>' +
                            '<div class="admin-bell-time">' + timeStr + '</div>' +
                            '</div></div>';
                    }).join('');
                } catch(err) {
                    console.warn('refreshAdminBell error:', err);
                }
            }

            async function handleAdminBellClick`;

    if (regex.test(content)) {
        content = content.replace(regex, newRefreshAdminBell);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated refreshAdminBell to use audit_log in", path);
    } else {
        console.log("Could not find regex in", path);
    }
}
