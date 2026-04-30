const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Fix admin-bell-btn Dark Mode styles to match user portal (solid background, not transparent)
    content = content.replace(
        /\[data-theme="dark"\] \.admin-bell-btn \{\s*background: transparent;\s*border-color: #2d3148;\s*color: #94a3b8;\s*\}/g,
        `[data-theme="dark"] .admin-bell-btn {\n        background: #1e293b;\n        border-color: #334155;\n        color: #cbd5e1;\n    }`
    );

    // Also fix hover
    content = content.replace(
        /\[data-theme="dark"\] \.admin-bell-btn:hover \{\s*background: #1e2a1a;\s*border-color: #1e5540;\s*color: #34d399;\s*\}/g,
        `[data-theme="dark"] .admin-bell-btn:hover {\n        background: #334155;\n        border-color: #475569;\n        color: #f1f5f9;\n    }`
    );

    // 2. Fix admin-dark-toggle Dark Mode styles to match user portal
    content = content.replace(
        /\[data-theme="dark"\] \.admin-dark-toggle \{\s*border-color: #2d3148; color: #94a3b8; background: transparent;\s*\}/g,
        `[data-theme="dark"] .admin-dark-toggle { border-color: #334155; color: #cbd5e1; background: #1e293b; }`
    );
    
    // Also fix hover for dark mode toggle if it exists
    content = content.replace(
        /\[data-theme="dark"\] \.admin-dark-toggle:hover \{\s*background: #1e2a1a; border-color: #1e5540; color: #34d399;\s*\}/g,
        `[data-theme="dark"] .admin-dark-toggle:hover { background: #334155; border-color: #475569; color: #f1f5f9; }`
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed button solid styling in', path);
}
