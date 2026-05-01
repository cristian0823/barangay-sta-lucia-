const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// Replace all --qa-color:var(--muted) with --qa-color:var(--green-xl)
html = html.replace(/--qa-color:\s*var\(--muted\)/g, '--qa-color:var(--green-xl)');

// Replace stat-icon color:var(--muted) with color:var(--green-xl)
html = html.replace(/class="stat-icon"([^>]+?)color:\s*var\(--muted\)/g, 'class="stat-icon"$1color:var(--green-xl)');

fs.writeFileSync('admin.html', html, 'utf8');
fs.copyFileSync('admin.html', 'admin-portal/admin.html');
console.log('✅ Applied green icons to all overview cards.');
