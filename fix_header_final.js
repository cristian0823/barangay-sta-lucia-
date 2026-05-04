const fs = require('fs');

const files = ['admin.html', 'admin-portal/admin.html'];

// The clean, correct header HTML
const cleanHeader = `<header class="dashboard-header">
            <div class="dashboard-nav">
                <!-- Mobile hamburger -->
                <button class="hamburger-btn" onclick="openMobileSidebar()" aria-label="Menu">
                    <span></span><span></span><span></span>
                </button>
                <div class="dashboard-logo">
                    <img src="BARANGAY%20SUN%20LOGO.jpg" alt="Barangay Logo" class="logo-image">
                    <div style="display:flex;flex-direction:column;line-height:1.2;">
                        <span id="adminMobileName" style="font-size:14px;font-weight:800;color:inherit;">Admin</span>
                        <span style="font-size:10px;opacity:0.6;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Admin Portal</span>
                    </div>
                </div>
            </div>
            <!-- RIGHT SIDE: all pushed to far right via margin-left:auto -->
            <div class="user-menu" style="display:flex; align-items:center; gap:12px; margin-left:auto;">
                <div class="user-info" style="text-align:right;">
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
                    <div class="admin-bell-dropdown" id="adminBellDropdown">
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

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');

    // Find start of header
    const headerStart = content.indexOf('<header class="dashboard-header">');
    // Find end of header - need to find the matching </header>
    const headerEnd = content.indexOf('</header>', headerStart) + 9;

    if (headerStart === -1 || headerEnd === 8) {
        console.log('Header not found in', file);
        continue;
    }

    content = content.substring(0, headerStart) + cleanHeader + content.substring(headerEnd);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed header in', file);
}
