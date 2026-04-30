const fs = require('fs');

const adminHtmlPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminHtmlPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    const regex = /async function handleAdminBellClick[\s\S]*?async function markAllAdminBellRead\(\) \{[\s\S]*?\}\s*window\.toggleAdminBell = function\(e\) \{[\s\S]*?\};/g;

    const newCode = `async function handleAdminBellClick(type) {
                document.getElementById('adminBellDropdown').style.display = 'none';
                const sectionMap = { 'borrow': 'requests', 'booking': 'court-bookings', 'concern': 'concerns' };
                const target = sectionMap[type];
                if (target) {
                    const btn = document.querySelector('.sidebar-btn[onclick*="' + target + '"]');
                    if (typeof switchSection === 'function') switchSection(target, btn);
                }
            }

            async function markAllAdminBellRead() {
                localStorage.setItem('last_admin_bell_view', Date.now().toString());
                refreshAdminBell();
            }

            window.toggleAdminBell = function(e) {
                if (e) e.stopPropagation();
                const dropdown = document.getElementById('adminBellDropdown');
                if (dropdown.style.display === 'flex') {
                    dropdown.style.display = 'none';
                } else {
                    document.querySelectorAll('.dropdown-menu').forEach(el => el.style.display = 'none');
                    dropdown.style.display = 'flex';
                    // Mark as read when opened
                    localStorage.setItem('last_admin_bell_view', Date.now().toString());
                    // Clear badge immediately
                    const badge = document.getElementById('adminBellBadge');
                    if (badge) badge.style.display = 'none';
                    // Re-render to remove dots
                    setTimeout(refreshAdminBell, 500);
                }
            };`;

    if (regex.test(content)) {
        content = content.replace(regex, newCode);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated bell handlers in", path);
    } else {
        console.log("Could not find regex in", path);
    }
}
