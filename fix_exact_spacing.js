const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Remove the bad margins I added
    content = content.replace(
        '<div style="position:relative;display:flex;align-items:center;margin-left:8px;" id="adminBellWrapper">',
        '<div style="position:relative;display:flex;align-items:center;" id="adminBellWrapper">'
    );
    content = content.replace(
        '<button class="admin-dark-toggle dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Dark Mode" id="adminDarkBtn" style="margin-right: 8px;"></button>',
        '<button class="admin-dark-toggle dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Dark Mode" id="adminDarkBtn"></button>'
    );
    
    // Ensure the main gap is exactly 16px (gap-4 in tailwind)
    content = content.replace(
        '<div class="user-menu" style="display:flex; align-items:center; gap:12px;">',
        '<div class="user-menu" style="display:flex; align-items:center; gap:16px;">'
    );

    // 2. Make BOTH the Bell and the Moon button identical to the User Portal (38px, rounded-12px, border-2px)
    
    // Fix Bell Button CSS
    const oldBellCssRegex = /\.admin-bell-btn\s*\{[\s\S]*?flex-shrink:\s*0;\s*padding:\s*0;\s*margin:\s*0;\s*\}/;
    const newBellCss = `.admin-bell-btn {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        border: 2px solid var(--border, #e5e7eb);
        background: var(--surface, #ffffff);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        color: var(--muted, #6b7280);
        transition: all 0.2s;
        flex-shrink: 0;
        padding: 0;
        margin: 0;
    }`;
    if (oldBellCssRegex.test(content)) {
        content = content.replace(oldBellCssRegex, newBellCss);
    }

    // Fix Dark Mode Button CSS
    const oldMoonCssRegex = /\.admin-dark-toggle\s*\{[\s\S]*?color:\s*var\(--muted\);\s*\}/;
    const newMoonCss = `.admin-dark-toggle {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition);
        color: var(--muted);
    }`;
    if (oldMoonCssRegex.test(content)) {
        content = content.replace(oldMoonCssRegex, newMoonCss);
    }
    
    // Adjust Dark Mode Toggle dark theme borders to match bell button
    content = content.replace(
        /\[data-theme="dark"\] \.admin-dark-toggle \{\s*border-color: #2d3148; color: #94a3b8;\s*\}/g,
        `[data-theme="dark"] .admin-dark-toggle { border-color: #2d3148; color: #94a3b8; background: transparent; }`
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed styling in', path);
}
