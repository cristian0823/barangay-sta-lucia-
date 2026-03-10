const fs = require('fs');

let template = fs.readFileSync('c:/Users/Kael/Documents/barangay-website/admin-new.html', 'utf8');
let settingsSrc = fs.readFileSync('c:/Users/Kael/Documents/barangay-website/admin-settings.html', 'utf8');

let layoutMatch = template.match(/(<!DOCTYPE html>.+?<\/aside>)/s);
let layout = layoutMatch[1];

// Make sidebar menu custom for settings
layout = layout.replace(/<div class="sidebar-title">Menu<\/div>.*?<\/aside>/s,
    `<div class="sidebar-title">Settings Menu</div>
<button class="nav-item active" onclick="showSection('users')" id="usersBtn">
<div class="nav-icon">👥</div><span>User Management</span></button>
<button class="nav-item" onclick="showSection('profile')" id="profileBtn">
<div class="nav-icon">👤</div><span>My Profile</span></button>
<button class="nav-item" onclick="showSection('system')" id="systemBtn">
<div class="nav-icon">📊</div><span>System Info</span></button>
<div style="margin-top:auto; padding-top:20px; border-top:1px solid var(--border);">
<button class="nav-item" onclick="window.location.href='admin-new.html'" style="color: var(--muted);">
<div class="nav-icon" style="background:transparent;">🔙</div><span>Back to Dashboard</span>
</button></div></aside>`);

// Setup page title and header modifications
layout = layout.replace('<title>Admin Dashboard - Barangay Sta. Lucia</title>', '<title>Admin Settings - Barangay Sta. Lucia</title>');
layout = layout.replace(/<button class="btn-dark-toggle.*?<\/button>/s, ''); // ensure no dark mode
layout = layout.replace(/<button class="btn" onclick="window\.location\.href='admin-settings\.html'">.*?<\/button>/, '<button class="btn" onclick="window.location.href=\'admin-new.html\'">🔙 Dashboard</button>');
layout = layout.replace('Admin Dashboard', 'Admin Settings');

// Grab settings contents
let contentMatch = settingsSrc.match(/<!-- ── USER MANAGEMENT ── -->(.+?)<\/div>\s*<!-- end \.main-content -->/s);
let content = contentMatch[1];
content = content.replace(/id="users-section"/, 'id="users-section" class="content-panel active"');
content = content.replace(/id="profile-section" class="hidden"/, 'id="profile-section" class="content-panel"');
content = content.replace(/id="system-section" class="hidden"/, 'id="system-section" class="content-panel"');
content = content.replace(/<div class="page-header">/g, '<div class="panel-header" style="display:flex; gap:16px; align-items:center;">');
content = content.replace(/<div class="page-header-icon">/g, '<div style="font-size:32px;">');
content = content.replace(/<h1>/g, '<h1 style="margin-bottom:0;">');
content = content.replace(/<div class="card">/g, '<div class="section-container">');
content = content.replace(/<div class="card-header">/g, '<div class="section-header">');
content = content.replace(/<div class="card-body">/g, '<div class="section-content">');
content = content.replace(/<table class="data-table">/g, '<table>');
content = content.replace(/<div class="profile-grid">/g, '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">');
content = content.replace(/class="form-group"/g, 'class="mb-4"');
content = content.replace(/class="btn-submit"/g, 'class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md"');
content = content.replace(/class="btn-submit blue"/g, 'class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-md"');
content = content.replace(/class="stats-grid"/g, 'class="stats-grid" style="grid-template-columns: repeat(3, 1fr);"');

let scriptsMatch = settingsSrc.match(/(<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>.+?)<\/body>/s);
let scripts = scriptsMatch[1];
scripts = scripts.replace(/function showSection.*?\}\s*\}/s, `function showSection(section) {
    ['users', 'profile', 'system'].forEach(s => {
        let p = document.getElementById(s + '-section');
        let b = document.getElementById(s + 'Btn');
        if (p) { if(s===section) p.classList.add('active'); else p.classList.remove('active'); }
        if (b) { if(s===section) b.classList.add('active'); else b.classList.remove('active'); }
    });
}`);

let finalHtml = layout + '\n<main class="main-content">\n<div id="toast"></div>\n' + content + '\n</main>\n</div>\n' + scripts + '\n</body>\n</html>';

fs.writeFileSync('c:/Users/Kael/Documents/barangay-website/admin-settings.html', finalHtml);
console.log('Successfully updated settings layout!');
