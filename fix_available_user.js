const fs = require('fs');

const appPaths = ['user-portal/js/app.js'];

for (const p of appPaths) {
    try {
        let content = fs.readFileSync(p, 'utf8');
        content = content.replace(
            'available: Math.min(item.available || 0, item.quantity || 0),',
            'available: Math.max(0, (item.quantity || 0) - (item.broken || 0)), // Date-based logic requires available to reflect total physical stock'
        );
        fs.writeFileSync(p, content, 'utf8');
        console.log('Patched', p);
    } catch (e) {
        console.error(e);
    }
}
