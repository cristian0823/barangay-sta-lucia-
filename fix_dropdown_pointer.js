const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Make it look exactly like the user dashboard dropdown
    const oldDropdown = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 10px);right:-10px;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.18);z-index:99999;flex-direction:column;overflow:visible;">
                        <div style="position:absolute;top:-6px;right:22px;width:12px;height:12px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg);z-index:1;"></div>
                        <div style="position:relative;z-index:2;background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;max-height:100%;">`;

    const newDropdown = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 12px);right:-12px;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);z-index:99999;flex-direction:column;overflow:visible;">
                        <div style="position:absolute;top:-8px;right:23px;width:16px;height:16px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg);z-index:1;"></div>
                        <div style="position:relative;z-index:2;background:#fff;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;max-height:100%;">`;

    if (content.includes(oldDropdown)) {
        content = content.replace(oldDropdown, newDropdown);
        console.log('Fixed dropdown container in', path);
    } else {
        console.log('Dropdown not found in', path);
    }
    
    // Fix header background to match user dashboard (bg-gray-50)
    const oldHeader = `<div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;background:#f9fafb;">`;
    const newHeader = `<div style="padding:12px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;background:#f9fafb;border-top-left-radius:12px;border-top-right-radius:12px;">`;
    content = content.replace(oldHeader, newHeader);

    fs.writeFileSync(path, content, 'utf8');
}
