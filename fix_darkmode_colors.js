const fs = require('fs');

const adminPaths = ['admin.html', 'admin-portal/admin.html'];
const userPaths = ['user-dashboard.html', 'user-portal/user-dashboard.html'];

const replacements = [
    // Fix hardcoded dark gray text in admin stat cards and glance list to use css variables so dark mode works
    ['color:#334155;', 'color:var(--text);'],
    ['color:#64748b;', 'color:var(--muted);'],
    ['color:#94a3b8;', 'color:var(--muted);'],
    ['border-left:4px solid #94a3b8;', 'border-left:4px solid var(--muted);'],
    ['background:#f8fafc;border:1px solid #e2e8f0;', 'background:var(--input-bg);border:1px solid var(--border);'],
    ['background:#f1f5f9;', 'background:var(--input-bg);'],
    ['border:1px solid #e2e8f0;', 'border:1px solid var(--border);'],
];

for (const path of [...adminPaths, ...userPaths]) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');
    let count = 0;
    for (const [from, to] of replacements) {
        let parts = content.split(from);
        if (parts.length > 1) {
            content = parts.join(to);
            count += parts.length - 1;
        }
    }
    fs.writeFileSync(path, content, 'utf8');
    console.log(`Updated ${count} colors in ${path}`);
}
