const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Currently: dropdown right:-12px, pointer right:23px
    // Changing to: dropdown right:0, pointer right:11px
    
    // We also want to apply dark mode styles to the dropdown so it looks exactly like the dark mode in user portal.
    // The screenshot shows the dropdown is dark but not styled perfectly (it has a white border and light background inside?).
    // Actually, looking at the screenshot, the dropdown in dark mode has a dark background but still a light border, or maybe it just lacks the dark mode CSS classes.
    // Let's use CSS variables or directly inject dark mode support for the dropdown via a class.
    
    // First, let's fix the inline positioning:
    const oldDropdown = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 12px);right:-12px;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);z-index:99999;flex-direction:column;overflow:visible;">
                        <div style="position:absolute;top:-8px;right:23px;width:16px;height:16px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg);z-index:1;"></div>`;

    const newDropdown = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 14px);right:0;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);z-index:99999;flex-direction:column;overflow:visible;" class="admin-bell-panel">
                        <div style="position:absolute;top:-8px;right:11px;width:16px;height:16px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg);z-index:1;" class="admin-bell-pointer"></div>`;

    if (content.includes(oldDropdown)) {
        content = content.replace(oldDropdown, newDropdown);
        console.log('Fixed alignment in', path);
    } else {
        console.log('Could not find old dropdown exactly in', path);
    }

    fs.writeFileSync(path, content, 'utf8');
}
