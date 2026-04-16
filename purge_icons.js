const fs = require('fs');

function processFile(filename) {
    if (!fs.existsSync(filename)) return;
    let html = fs.readFileSync(filename, 'utf8');

    // 1. Remove Sidebar Icons
    // <span class="nav-icon-box">...</span> or <div class="nav-icon-box">...</div>
    html = html.replace(/<(span|div)\s+class="nav-icon-box"[^>]*>.*?<\/\1>/gi, '');

    // 2. Remove Stat Icons
    // <div class="stat-icon"...>...</div> or <div class="user-stat-icon"...>...</div>
    html = html.replace(/<div\s+class="(user-)?stat-icon"[^>]*>.*?<\/div>/gi, '');

    // 3. Remove Quick Action Icons
    // <div class="qa-icon"...>...</div> or <span class="uqa-icon"...>...</span>
    html = html.replace(/<(div|span)\s+class="(u)?qa-icon"[^>]*>.*?<\/\1>/gi, '');

    // 4. Remove Mobile Bottom Nav Tab Icons
    // <span class="tab-icon">...</span>
    html = html.replace(/<span\s+class="tab-icon"[^>]*>.*?<\/span>/gi, '');

    // 5. CSS adjustments for better typography-only layout
    // For admin.html: make sidebar text bolder or slightly larger if needed
    // Actually, simply adding a subtle left-indicator on active looks premium
    if (filename === 'admin.html') {
        // Just let it be, the padding and active state backgrounds do the job well without icons.
        // We'll enforce text alignment slightly just in case.
        html = html.replace(/\.sidebar-btn\s*\{/, '.sidebar-btn {\n            justify-content: flex-start;\n            font-weight: 600;\n            padding-left: 20px;');
    }
    if (filename === 'user-dashboard.html') {
        html = html.replace(/\.nav-item\s*\{/, '.nav-item {\n            justify-content: flex-start;\n            font-weight: 600;\n            padding-left: 20px;');
    }

    fs.writeFileSync(filename, html);
    console.log(filename + ' processed.');
}

processFile('admin.html');
processFile('user-dashboard.html');
