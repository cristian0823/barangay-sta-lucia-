const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Increase the gap on user-menu to 16px so elements aren't cramped
    const oldMenu = `<div class="user-menu" style="display:flex; align-items:center; gap:12px;">`;
    const newMenu = `<div class="user-menu" style="display:flex; align-items:center; gap:16px;">`;
    
    if (content.includes(oldMenu)) {
        content = content.replace(oldMenu, newMenu);
    }
    
    // 2. Add extra margin to separate the Avatar from the Icons, and the Icons from the Settings
    // Find the adminBellWrapper and add a left margin of 8px
    const oldBellWrapper = `<div style="position:relative;display:flex;align-items:center;" id="adminBellWrapper">`;
    const newBellWrapper = `<div style="position:relative;display:flex;align-items:center;margin-left:8px;" id="adminBellWrapper">`;
    if (content.includes(oldBellWrapper)) {
        content = content.replace(oldBellWrapper, newBellWrapper);
    }
    
    // Find the adminDarkBtn and add a right margin of 8px to push the settings button further away
    const oldDarkBtn = `<button class="admin-dark-toggle dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Dark Mode" id="adminDarkBtn"></button>`;
    const newDarkBtn = `<button class="admin-dark-toggle dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Dark Mode" id="adminDarkBtn" style="margin-right: 8px;"></button>`;
    if (content.includes(oldDarkBtn)) {
        content = content.replace(oldDarkBtn, newDarkBtn);
    }

    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed alignment in', path);
}
