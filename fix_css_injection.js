const fs = require('fs');

const cssBlock = `
    <style>
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
    </style>
`;

const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // Remove the CSS from the auth-guard-style block where it was accidentally injected
    const authGuardRegex = /<style id="auth-guard-style">body \{ visibility: hidden !important; \}[\s\S]*?── End Admin Bell CSS ── \*\/\n<\/style>/;
    if (authGuardRegex.test(content)) {
        content = content.replace(authGuardRegex, '<style id="auth-guard-style">body { visibility: hidden !important; }</style>');
        console.log('Cleaned up auth-guard block in', path);
    }
    
    // Check if the CSS is already injected properly before </head>
    if (content.includes('/* ── Admin Notification Bell CSS (Matches User Portal) ── */')) {
        // If it's somewhere else, remove it first
        const orphanedCssRegex = /\/\* ── Admin Notification Bell CSS[\s\S]*?── End Admin Bell CSS ── \*\//g;
        content = content.replace(orphanedCssRegex, '');
        // Remove empty style tags left over
        content = content.replace(/<style>\s*<\/style>/g, '');
    }

    // Now inject it cleanly RIGHT BEFORE </head>
    content = content.replace('</head>', cssBlock + '\n</head>');
    console.log('Injected CSS before </head> in', path);

    fs.writeFileSync(path, content, 'utf8');
}
