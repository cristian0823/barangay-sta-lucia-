const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Add CSS for the button into the existing CSS block
    const btnCss = `
    .admin-bell-btn {
        position: relative;
        width: 36px;
        height: 36px;
        border-radius: 50%; /* Make it a circle to match the moon button perfectly */
        border: 1px solid var(--border, #e5e7eb);
        background: var(--surface, #ffffff);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: var(--muted, #6b7280);
        transition: all 0.2s;
        flex-shrink: 0;
        padding: 0;
        margin: 0;
    }
    .admin-bell-btn:hover {
        background: #f9fafb;
    }
    [data-theme="dark"] .admin-bell-btn {
        background: transparent;
        border-color: #2d3148;
        color: #94a3b8;
    }
    [data-theme="dark"] .admin-bell-btn:hover {
        background: #1e2a1a;
        border-color: #1e5540;
        color: #34d399;
    }
    /* ── End Admin Bell CSS ── */`;

    if (content.includes('/* ── End Admin Bell CSS ── */')) {
        content = content.replace('/* ── End Admin Bell CSS ── */', btnCss);
    }
    
    // Replace the ugly inline styled button with the clean class
    const oldBtnRegex = /<button onclick="toggleAdminBell\(event\)" id="adminBellBtn" title="Notifications"[\s\S]*?<i class="bi bi-bell-fill"><\/i>/;
    
    // In case there is an old button with inline styles
    const oldBtnFallbackRegex = /<button onclick="toggleAdminBell\(event\)" id="adminBellBtn"[^>]*>[\s\S]*?<i class="bi bi-bell-fill"><\/i>/;

    const newBtn = `<button onclick="toggleAdminBell(event)" id="adminBellBtn" title="Notifications" class="admin-bell-btn">\n                        <i class="bi bi-bell-fill"></i>`;

    if (oldBtnRegex.test(content)) {
        content = content.replace(oldBtnRegex, newBtn);
        console.log('Replaced button with class in', path);
    } else if (oldBtnFallbackRegex.test(content)) {
        content = content.replace(oldBtnFallbackRegex, newBtn);
        console.log('Replaced button using fallback in', path);
    } else {
        console.log('Could not find button to replace in', path);
    }

    fs.writeFileSync(path, content, 'utf8');
}
