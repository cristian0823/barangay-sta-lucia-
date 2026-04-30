const fs = require('fs');

const cssBlock = `
    /* ── Admin Notification Bell CSS (Matches User Portal) ── */
    .admin-bell-dropdown {
        position: absolute;
        top: calc(100% + 14px);
        right: -8px;
        width: 350px;
        max-height: 480px;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        z-index: 99999;
        display: none;
        flex-direction: column;
    }
    [data-theme="dark"] .admin-bell-dropdown {
        background: #1e293b;
        border-color: #334155;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .admin-bell-pointer {
        position: absolute;
        top: -7px;
        right: 18px;
        width: 14px;
        height: 14px;
        background: #ffffff;
        border-left: 1px solid #e5e7eb;
        border-top: 1px solid #e5e7eb;
        transform: rotate(45deg);
        z-index: 1;
    }
    [data-theme="dark"] .admin-bell-pointer {
        background: #1e293b;
        border-color: #334155;
    }
    .admin-bell-inner {
        position: relative;
        z-index: 2;
        background: inherit;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        max-height: 100%;
    }
    .admin-bell-header {
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f9fafb;
    }
    [data-theme="dark"] .admin-bell-header {
        background: rgba(15,23,42,0.5);
        border-color: #334155;
    }
    .admin-bell-header h3 {
        font-weight: 700;
        font-size: 15px;
        color: #1f2937;
        margin: 0;
    }
    [data-theme="dark"] .admin-bell-header h3 {
        color: #f1f5f9;
    }
    .admin-bell-markall {
        font-size: 12px;
        color: #059669;
        font-weight: 600;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .admin-bell-markall:hover { text-decoration: underline; }
    
    .admin-bell-list {
        max-height: 380px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }
    .admin-bell-empty {
        padding: 40px 20px;
        text-align: center;
        color: #9ca3af;
        font-size: 13px;
    }
    .admin-bell-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        transition: background 0.15s;
        position: relative;
    }
    .admin-bell-item:hover { background: #f9fafb; }
    .admin-bell-item.is-unread { background: #f0fdf4; }
    [data-theme="dark"] .admin-bell-item { border-color: #334155; }
    [data-theme="dark"] .admin-bell-item:hover { background: #0f172a; }
    [data-theme="dark"] .admin-bell-item.is-unread { background: #0d2318; }
    
    .admin-bell-icon-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #f3f4f6;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    }
    [data-theme="dark"] .admin-bell-icon-circle { background: #334155; }
    
    .admin-bell-msg {
        font-size: 13px;
        font-weight: 500;
        color: #1f2937;
        line-height: 1.4;
        margin: 0 0 2px 0;
    }
    [data-theme="dark"] .admin-bell-msg { color: #e2e8f0; }
    
    .admin-bell-time {
        font-size: 11px;
        color: #9ca3af;
    }
    
    .admin-bell-footer {
        padding: 10px 16px;
        background: #f9fafb;
        border-top: 1px solid #f3f4f6;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        cursor: pointer;
        transition: background 0.15s;
    }
    .admin-bell-footer:hover { background: #f3f4f6; }
    [data-theme="dark"] .admin-bell-footer {
        background: rgba(15,23,42,0.5);
        border-color: #334155;
        color: #94a3b8;
    }
    [data-theme="dark"] .admin-bell-footer:hover { background: #0f172a; }
    
    .admin-bell-unread-dot {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
    }
    /* ── End Admin Bell CSS ── */
`;

const htmlBlock = `<div class="admin-bell-dropdown" id="adminBellDropdown" onclick="event.stopPropagation()">
                        <div class="admin-bell-pointer"></div>
                        <div class="admin-bell-inner">
                            <div class="admin-bell-header">
                                <h3>Notifications</h3>
                                <button class="admin-bell-markall" onclick="markAllAdminBellRead(); event.stopPropagation();">
                                    <i class="bi bi-check-all"></i> Mark all read
                                </button>
                            </div>
                            <div class="admin-bell-list" id="adminBellList">
                                <div class="admin-bell-empty">
                                    <i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>
                                    No new notifications
                                </div>
                            </div>
                            <div class="admin-bell-footer" onclick="switchSection('audit-log'); document.getElementById('adminBellDropdown').style.display='none';">
                                See all activity in Audit Log
                            </div>
                        </div>
                    </div>`;

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Inject the CSS right before </style>
    if (!content.includes('admin-bell-pointer')) {
        content = content.replace('</style>', cssBlock + '\n</style>');
    } else {
        // If it exists, replace it
        content = content.replace(/\/\* ── Admin Notification Bell CSS[\s\S]*?── End Admin Bell CSS ── \*\//, cssBlock.trim());
    }

    // 2. Replace the entire ugly inline-styled dropdown with the clean HTML
    const dropdownRegex = /<div id="adminBellDropdown"[^>]*class="admin-bell-panel"[\s\S]*?See all activity in Audit Log\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
    
    // Fallback regex if the previous replace left it slightly different
    const fallbackRegex = /<div id="adminBellDropdown"[\s\S]*?See all activity in Audit Log\s*<\/div>\s*<\/div>\s*<\/div>/;

    if (dropdownRegex.test(content)) {
        content = content.replace(dropdownRegex, htmlBlock);
        console.log('Replaced HTML using primary regex in', path);
    } else if (fallbackRegex.test(content)) {
        content = content.replace(fallbackRegex, htmlBlock);
        console.log('Replaced HTML using fallback regex in', path);
    } else {
        console.log('Could not find dropdown to replace in', path);
    }
    
    // Fix button ID if needed
    const oldBtn = `style="position:relative;width:38px;height:38px;border-radius:12px;border:2px solid #e5e7eb;background:#f9fafb;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px;color:#4b5563;transition:all 0.2s;flex-shrink:0;"`;
    const newBtn = `class="admin-bell-btn-style" style="position:relative;width:38px;height:38px;border-radius:12px;border:2px solid #e5e7eb;background:var(--bg-card,#f9fafb);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:17px;color:var(--text-main,#4b5563);transition:all 0.2s;flex-shrink:0;"`;
    content = content.replace(oldBtn, newBtn);

    fs.writeFileSync(path, content, 'utf8');
}
