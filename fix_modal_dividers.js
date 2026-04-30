const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    // 1. Remove dashed dividers
    html = html.replace('<div style="margin:8px 20px 0; border-top:2px dashed var(--border);"></div>', '');
    html = html.replace('<div style="margin:8px 20px 0; border-top:2px dashed var(--border,#e5e7eb);"></div>', '');
    html = html.replace('<div style="margin:8px 20px 0; border-top:2px dashed var(--border,#e5e7eb);"></div>', '');

    // Replace all instances just in case
    html = html.replace(/<div style="margin:8px 20px 0; border-top:2px dashed [^>]+><\/div>/g, '');

    // 2. Remove scrollbars (change overflow-y:auto to overflow:hidden)
    html = html.replace(/overflow-y:auto; overflow-x:hidden;/g, 'overflow:hidden;');
    
    // Also there's one for adminConcernModal that might still be overflow-y:auto
    html = html.replace(/max-height:90vh; overflow-y:auto; display:flex/g, 'max-height:90vh; overflow:hidden; display:flex');

    fs.writeFileSync('admin.html', html);
    console.log('Fixed styling in admin.html');
} catch (e) {
    console.error(e);
}
