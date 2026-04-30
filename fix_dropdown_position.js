const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

// The dropdown needs position:absolute, z-index, and proper sizing
// We'll apply it all via inline style so it can never be overridden by missing CSS

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Replace the dropdown div with fully inline-styled version
    const oldDropdown = `<div class="admin-bell-dropdown" id="adminBellDropdown" style="display:none;">`;
    const newDropdown = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 10px);right:0;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.18);z-index:99999;flex-direction:column;overflow:hidden;">`;

    if (content.includes(oldDropdown)) {
        content = content.replace(oldDropdown, newDropdown);
        console.log('Replaced dropdown in', path);
    } else {
        console.log('Old dropdown not found in', path, '- trying regex...');
        content = content.replace(
            /id="adminBellDropdown"[^>]*>/,
            `id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 10px);right:0;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.18);z-index:99999;flex-direction:column;overflow:hidden;">`
        );
        console.log('Applied regex replacement in', path);
    }

    // Also fix the header to be inline-styled so it shows properly
    content = content.replace(
        '<div class="admin-bell-header">',
        '<div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;background:#f9fafb;">'
    );

    // Fix bell list
    content = content.replace(
        '<div class="admin-bell-list" id="adminBellList" onclick="event.stopPropagation()">',
        '<div id="adminBellList" onclick="event.stopPropagation()" style="max-height:380px;overflow-y:auto;display:flex;flex-direction:column;">'
    );

    // Fix bell header h3
    content = content.replace(
        '<h3>Notifications</h3>',
        '<h3 style="font-weight:700;font-size:15px;color:#1f2937;margin:0;">Notifications</h3>'
    );

    // Fix markall button
    content = content.replace(
        '<button class="admin-bell-markall" onclick="markAllAdminBellRead(); event.stopPropagation();">',
        '<button onclick="markAllAdminBellRead(); event.stopPropagation();" style="font-size:12px;color:#059669;font-weight:600;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:4px;">'
    );

    // Fix footer
    content = content.replace(
        `<div class="admin-bell-footer" onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';">`,
        `<div onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';" style="padding:10px 16px;background:#f9fafb;border-top:1px solid #f3f4f6;text-align:center;font-size:12px;font-weight:600;color:#6b7280;cursor:pointer;">`
    );

    // Fix empty state
    content = content.replace(
        '<div class="admin-bell-empty">',
        '<div style="padding:40px 20px;text-align:center;color:#9ca3af;font-size:13px;">'
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('Done:', path);
}
