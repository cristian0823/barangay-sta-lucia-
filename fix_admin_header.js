const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

const correctUserMenu = `            <div class="user-menu" style="display:flex; align-items:center; gap:12px;">
                <div class="user-info">
                    <span class="user-name" id="userName">Administrator</span>
                    <span class="user-role">Official</span>
                </div>
                <div class="user-avatar" id="userAvatar">A</div>
                <!-- Admin Notification Bell -->
                <div style="position:relative;display:flex;align-items:center;" id="adminBellWrapper">
                    <button class="admin-bell-btn" onclick="toggleAdminBell(event)" title="Notifications" id="adminBellBtn">
                        <i class="bi bi-bell-fill"></i>
                        <span class="admin-bell-badge" id="adminBellBadge">0</span>
                    </button>
                    <div class="admin-bell-dropdown" id="adminBellDropdown" style="display:none;">
                        <div class="admin-bell-header">
                            <h3>Notifications</h3>
                            <button class="admin-bell-markall" onclick="markAllAdminBellRead(); event.stopPropagation();">
                                <i class="bi bi-check-all"></i> Mark all read
                            </button>
                        </div>
                        <div class="admin-bell-list" id="adminBellList" onclick="event.stopPropagation()">
                            <div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>No new notifications</div>
                        </div>
                        <div class="admin-bell-footer" onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';">
                            See all activity in Audit Log
                        </div>
                    </div>
                </div>
                <button class="admin-dark-toggle dark-mode-toggle" onclick="toggleDarkMode()" title="Toggle Dark Mode" id="adminDarkBtn"></button>
                <a href="admin-settings.html" class="logout-btn" style="text-decoration:none; display:flex; align-items:center; gap:6px;">Settings</a>
                <button class="logout-btn" onclick="logoutUser()">Logout</button>
            </div>
        </header>`;

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Find the user-menu div and everything up to </header> and replace it
    // This regex matches from the user-menu opening div to </header>
    const regex = /<div class="user-menu"[\s\S]*?<\/header>/;
    
    if (regex.test(content)) {
        content = content.replace(regex, correctUserMenu);
        fs.writeFileSync(path, content, 'utf8');
        console.log('Fixed header in', path);
    } else {
        console.log('Pattern not found in', path);
    }
}
