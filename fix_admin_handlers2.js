const fs = require('fs');

const adminHtmlPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminHtmlPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    // Replace toggleAdminBell
    const regexToggle = /function toggleAdminBell\(e\) \{[\s\S]*?if \(!isOpen\) refreshAdminBell\(\);\s*\}/g;
    const newToggle = `function toggleAdminBell(e) {
                if (e) e.stopPropagation();
                const drop = document.getElementById('adminBellDropdown');
                if (!drop) return;
                const isOpen = drop.style.display === 'flex';
                drop.style.display = isOpen ? 'none' : 'flex';
                if (!isOpen) {
                    localStorage.setItem('last_admin_bell_view', Date.now().toString());
                    const badge = document.getElementById('adminBellBadge');
                    if (badge) badge.style.display = 'none';
                    setTimeout(refreshAdminBell, 500);
                }
            }`;

    // Replace handleAdminBellClick and markAllAdminBellRead
    const regexHandlers = /async function handleAdminBellClick\(id, type\) \{[\s\S]*?refreshAdminBell\(\);\s*\}/g;
    const newHandlers = `async function handleAdminBellClick(type) {
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
            }`;

    let updated = false;
    if (regexToggle.test(content)) {
        content = content.replace(regexToggle, newToggle);
        updated = true;
    }
    if (regexHandlers.test(content)) {
        content = content.replace(regexHandlers, newHandlers);
        updated = true;
    }
    
    if (updated) {
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated bell handlers in", path);
    }
}
