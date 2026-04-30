const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    try {
        let content = fs.readFileSync(path, 'utf8');
        
        if (!content.includes("table: 'notifications'")) {
            const hook = ".on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, payload => {";
            const replacement = `.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, payload => {
                            if (payload.new && payload.new.user_id === 'admin') {
                                if (typeof loadAdminNotifications === 'function') loadAdminNotifications();
                            }
                        })
                        ` + hook;
            content = content.replace(hook, replacement);
            fs.writeFileSync(path, content, 'utf8');
            console.log('Added notifications watcher to', path);
        }
    } catch (e) {
        console.error(e);
    }
}
