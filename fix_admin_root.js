
const fs = require('fs');

function fixGarbledInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Direct string replacements for exact known patterns from previous fixes
    const replacements = [
        ['\u00c3\u0192\u00c2\u00a2\u00c3\u2026\u00c2\u00a1\u00c3\u00a2\u00e2\u20ac\u017e\u00c2\u00a2\u00c3\u0192\u00c2\u00af\u00c3\u201a\u00c2\u00b8\u00c3\u201a\u00c2\u00a0', '<i class="bi bi-gear-fill"></i>'],
        ['\u00c3\u0192\u00c2\u00b0\u00c3\u2026\u00c2\u00b8\u00c3\u2026\u00c2\u00a1\u00c3\u201a\u00c2\u00aa', '<i class="bi bi-box-arrow-right"></i>'],
        ['\u00c3\u0192\u00c2\u00a2\u00c3\u2026\u00e2\u20ac\u0153\u00c3\u00a2\u00e2\u201a\u00ac\u00c5\u201e Replied', '<i class="bi bi-check-circle-fill"></i> Replied'],
        ['\u00c3\u0192\u00c2\u00b0\u00c3\u2026\u00c2\u00b8\u00c3\u00a2\u00e2\u201a\u00ac\u00c5\u201e\u00c3\u201a\u00c2\u00b7 Photo', '<i class="bi bi-image-fill"></i> Photo'],
        ['Authentication & session events \u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u00e2\u20ac\u201d\u00c2\u00a0 OWASP', 'Authentication &amp; session events &mdash; OWASP']
    ];

    for (const [search, replace] of replacements) {
        if (html.includes(search)) {
            html = html.split(search).join(replace);
            changed = true;
        }
    }

    // Line-by-line replacements for the rest
    const lines = html.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('roleLabel = role === \'admin\' ?')) {
            lines[i] = `                    const roleLabel = role === 'admin' ? '<i class="bi bi-shield-lock-fill"></i> Admin' : role === 'user' ? '<i class="bi bi-person-fill"></i> User' : '<i class="bi bi-question-circle"></i> Unknown';\r`;
            changed = true;
        }
        if (line.includes('Details') && line.includes('N/A') || line.includes('s.details ||')) {
            lines[i] = lines[i].replace(/\|\| '[^']+'/, "|| 'N/A'");
            changed = true;
        }
        if (line.includes('pg-btn')) {
            lines[i] = lines[i].replace(/>Ã[^\x00-\x7F]*(?=<\/but)/g, '>&lsaquo;');
            lines[i] = lines[i].replace(/(?<=\">)Ã[^\x00-\x7F]+(?=<\/but)/g, '>&rsaquo;');
            changed = true;
        }
        if (line.includes('Facility Reservation Update')) {
            lines[i] = lines[i].replace(/Facility Reservation Update\s+[^\x00-\x7E'",]+/g, 'Facility Reservation Update');
            changed = true;
        }
        if (line.includes('\'Under Repair\':') && line.includes('icon:')) {
            lines[i] = `                'Under Repair':           { bg:'#fef3c7', color:'#92400e', icon:'<i class="bi bi-tools"></i>' },\r`;
            changed = true;
        }
        if (line.includes('\'Repaired\':') && line.includes('icon:')) {
            lines[i] = `                'Repaired':               { bg:'#d1fae5', color:'#065f46', icon:'<i class="bi bi-check-circle-fill"></i>' },\r`;
            changed = true;
        }
        if (line.includes('\'For Disposal\':') && line.includes('icon:')) {
            lines[i] = `                'For Disposal':           { bg:'#fee2e2', color:'#991b1b', icon:'<i class="bi bi-trash3-fill"></i>' },\r`;
            changed = true;
        }
        if (line.includes('\'Recovered from Disposal\':') && line.includes('icon:')) {
            lines[i] = `                'Recovered from Disposal':{ bg:'#dbeafe', color:'#1e40af', icon:'<i class="bi bi-arrow-counterclockwise"></i>' },\r`;
            changed = true;
        }
        if (line.includes('id="sqf_logins"')) {
            lines[i] = `                                <button onclick="setSecQuickFilter('logins')" id="sqf_logins" style="padding: 7px 18px; border-radius: 20px; border: 2px solid #10b981; background: #10b981; color: white; font-weight: 700; font-size: 13px; cursor: pointer;">🔵 Login Events</button>\r`;
            changed = true;
        }
        if (line.includes('id="sqf_all"')) {
            lines[i] = `                                <button onclick="setSecQuickFilter('all')" id="sqf_all" style="padding: 7px 18px; border-radius: 20px; border: 2px solid var(--border); background: transparent; color: var(--text); font-weight: 600; font-size: 13px; cursor: pointer;">📋 All Events</button>\r`;
            changed = true;
        }
        if (line.includes('id="sqf_failed"')) {
            lines[i] = `                                <button onclick="setSecQuickFilter('failed')" id="sqf_failed" style="padding: 7px 18px; border-radius: 20px; border: 2px solid var(--border); background: transparent; color: var(--text); font-weight: 600; font-size: 13px; cursor: pointer;">❌ Failed Only</button>\r`;
            changed = true;
        }
        if (line.includes('id="sqf_anomaly"')) {
            lines[i] = `                                <button onclick="setSecQuickFilter('anomaly')" id="sqf_anomaly" style="padding: 7px 18px; border-radius: 20px; border: 2px solid var(--border); background: transparent; color: var(--text); font-weight: 600; font-size: 13px; cursor: pointer;">⚠️ Anomalies</button>\r`;
            changed = true;
        }
        if (line.includes('id="maintenanceLogToggle"')) {
            lines[i] = `                    <button class="btn btn-small btn-light" onclick="toggleMaintenanceLog()" id="maintenanceLogToggle"><i class="bi bi-clipboard2-pulse"></i> Maintenance Log</button>\r`;
            changed = true;
        }
        
        // --- Admin notifications fix ---
        if (line.includes('const icon = notif.type ===')) {
            lines[i] = `                    let icon = '';\r
                    if (notif.type === 'concern') icon = '<i class="bi bi-megaphone-fill"></i>';\r
                    else if (notif.type === 'borrow') icon = '<i class="bi bi-box-seam"></i>';\r
                    else if (notif.type === 'booking') icon = '<i class="bi bi-calendar-check-fill"></i>';\r`;
            changed = true;
        }

        // Notification pushes in admin
        if (line.includes('message: \'New facility reservation on \'')) {
            lines[i] = line.replace(/icon: '[^']+'/, "icon: '<i class=\"bi bi-calendar-check-fill\"></i>'");
            changed = true;
        }
        if (line.includes('message: \'Equipment request: \'')) {
            lines[i] = line.replace(/icon: '[^']+'/, "icon: '<i class=\"bi bi-box-seam\"></i>'");
            changed = true;
        }
        if (line.includes('message: \'New concern: \'')) {
            lines[i] = line.replace(/icon: '[^']+'/, "icon: '<i class=\"bi bi-megaphone-fill\"></i>'");
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('Fixed garbled text in', filePath);
    }
}

fixGarbledInFile('admin.html');
fixGarbledInFile('admin-portal/admin.html');
