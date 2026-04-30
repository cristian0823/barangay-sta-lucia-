const fs = require('fs');

const adminHtmlPaths = ['admin.html', 'admin-portal/admin.html'];

for (const path of adminHtmlPaths) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');

    // Add loadUsers and refreshAdminBell inside the syncHandler block
    const regex = /if \(typeof loadConcerns === 'function'\) await loadConcerns\(\);\s*if \(typeof loadAdminNotifications === 'function'\) await loadAdminNotifications\(\);/g;
    
    if (regex.test(content)) {
        content = content.replace(regex, 
            `if (typeof loadConcerns === 'function') await loadConcerns();
                            if (typeof loadAdminNotifications === 'function') await loadAdminNotifications();
                            if (typeof loadUsers === 'function') await loadUsers();
                            if (typeof loadAuditLog === 'function') await loadAuditLog();
                            if (typeof refreshAdminBell === 'function') await refreshAdminBell();`);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Updated syncHandler in", path);
    } else {
        console.log("Could not find regex in", path);
    }
}
