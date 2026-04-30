const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    try {
        let content = fs.readFileSync(path, 'utf8');
        
        // We will replace `if (typeof loadOverview === 'function') loadOverview();` 
        // with `if (typeof loadOverview === 'function') loadOverview();\n                            if (typeof loadAdminNotifications === 'function') loadAdminNotifications();`
        // But only in the tables we care about. Actually, adding it everywhere in `initAdminRealtime` is perfectly fine.
        
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes("if (typeof loadOverview === 'function') loadOverview();") && lines[i-1] && lines[i-1].includes('postgres_changes')) {
                // Check if the next line already has loadAdminNotifications
                if (!lines[i+1].includes('loadAdminNotifications')) {
                    lines[i] = lines[i] + "\n                            if (typeof loadAdminNotifications === 'function') loadAdminNotifications();";
                }
            }
        }
        
        fs.writeFileSync(path, lines.join('\n'), 'utf8');
        console.log('Patched', path);
    } catch (e) {
        console.error(e);
    }
}
