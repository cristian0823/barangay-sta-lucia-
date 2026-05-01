const fs = require('fs');
const files = ['admin.html', 'admin-portal/admin.html'];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Move the badge OUTSIDE the button (so it can be positioned absolutely over the button)
    const OLD_BTN = `<button class="admin-bell-btn" onclick="toggleAdminBell(event)" title="Notifications" id="adminBellBtn">
                        <i class="bi bi-bell-fill"></i>
                        <span class="admin-bell-badge" id="adminBellBadge">0</span>
                    </button>`;
    const NEW_BTN = `<button class="admin-bell-btn" onclick="toggleAdminBell(event)" title="Notifications" id="adminBellBtn">
                        <i class="bi bi-bell-fill"></i>
                    </button>
                    <span class="admin-bell-badge" id="adminBellBadge" style="display:none;position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px;line-height:1;border:2px solid #fff;pointer-events:none;z-index:10;"></span>`;

    if (content.includes('<span class="admin-bell-badge" id="adminBellBadge">0</span>')) {
        content = content.replace(OLD_BTN, NEW_BTN);
        console.log('Moved badge outside button in', file);
    } else {
        console.log('Button pattern not found in', file);
    }

    // 2. Find and update the CSS for .admin-bell-badge to remove the old inline style
    // Search for any existing .admin-bell-badge CSS and replace it
    const OLD_CSS_PATTERN = /\.admin-bell-badge\s*\{[^}]*\}/g;
    const NEW_CSS = `.admin-bell-badge {
        display: none;
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 50%;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        line-height: 1;
        border: 2px solid #fff;
        pointer-events: none;
        z-index: 10;
    }`;

    if (OLD_CSS_PATTERN.test(content)) {
        content = content.replace(/\.admin-bell-badge\s*\{[^}]*\}/g, NEW_CSS);
        console.log('Updated badge CSS in', file);
    } else {
        // Inject CSS before closing </style> near the bell CSS block
        const bellCSSEnd = content.indexOf('/* ── End Admin Bell CSS ── */');
        if (bellCSSEnd !== -1) {
            content = content.substring(0, bellCSSEnd) + NEW_CSS + '\n    ' + content.substring(bellCSSEnd);
            console.log('Injected badge CSS in', file);
        }
    }

    // 3. Fix refreshAdminBell to use display:'flex' for showing badge
    content = content.replace(
        `badge.style.display = 'flex';`,
        `badge.style.display = 'flex';`
    );

    fs.writeFileSync(file, content, 'utf8');
}
