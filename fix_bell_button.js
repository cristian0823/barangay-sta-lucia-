const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Fix the bell button to match user portal exactly - hidden badge by default, same rounded style
    const oldBell = `<button class="admin-bell-btn" onclick="toggleAdminBell(event)" title="Notifications" id="adminBellBtn">
                        <i class="bi bi-bell-fill"></i>
                        <span class="admin-bell-badge" id="adminBellBadge">0</span>
                    </button>`;

    const newBell = `<button onclick="toggleAdminBell(event)" id="adminBellBtn" title="Notifications"
                        style="position:relative;width:38px;height:38px;border-radius:12px;border:2px solid #e5e7eb;background:#f9fafb;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px;color:#4b5563;transition:all 0.2s;flex-shrink:0;">
                        <i class="bi bi-bell-fill"></i>
                        <span id="adminBellBadge"
                            style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;min-width:18px;height:18px;border-radius:999px;display:none;align-items:center;justify-content:center;padding:0 4px;line-height:1;border:2px solid #fff;">0</span>
                    </button>`;

    content = content.replace(oldBell, newBell);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed bell button in', path);
}
