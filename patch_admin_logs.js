const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Sidebar Replacements
// Replace Activity Log sidebar link with new Security grouping
const sidebarOldLink = `<button class="sidebar-btn" onclick="switchSection('activity-log', this)">
                    <span class="sidebar-icon">📋</span>
                    Activity Log
                </button>`;

const sidebarReportLink = `<button class="sidebar-btn" onclick="switchSection('reports', this)">
                    <span class="sidebar-icon">📊</span>
                    Reports
                </button>`;

const sidebarSecGroup = `
                <span class="left-sidebar-label" style="margin-top:12px;">SECURITY</span>
                <button class="sidebar-btn" onclick="switchSection('audit-log', this)">
                    <span class="sidebar-icon">🧾</span>
                    Audit Log
                </button>
                <button class="sidebar-btn" onclick="switchSection('security-log', this)">
                    <span class="sidebar-icon">🛡️</span>
                    Security Log
                </button>
`;

if (html.includes(sidebarOldLink)) {
    // We will drop Activity Log sidebar link entirely, and replace reports by putting the new group under reports
    html = html.replace(sidebarOldLink, sidebarSecGroup);
} else {
    // Fallback if formatting differs
    html = html.replace(/(<button class="sidebar-btn" onclick="switchSection\('activity-log', this\)">[\s\S]*?<\/button>)/, sidebarSecGroup);
}

// 2. Add the UI sections
// Look for id="activity-log-section" and completely replace the whole section div
const activityRegex = /<div class="section hidden" id="activity-log-section">[\s\S]*?<!-- End of Activity Log Section -->/;
const fallbackRegex = /<div class="section hidden" id="activity-log-section">[\s\S]*?(?=<div class="section hidden" id="profile-section">)/;

const newSections = `
<div class="section hidden" id="audit-log-section">
    <div class="section-header">
        <div>
            <h2>🧾 Audit Log</h2>
            <p>System operational tracking for reservations, requests, and concerns.</p>
        </div>
        <button onclick="exportAuditLog()" class="premium-btn primary">
            <i class="bi bi-download"></i> Export CSV
        </button>
    </div>
    <div class="premium-card">
        <div class="table-responsive">
            <table class="data-table" id="auditLogTable">
                <thead>
                    <tr>
                        <th>TIMESTAMP</th>
                        <th>USER</th>
                        <th>ACTION</th>
                        <th>ENTITY</th>
                        <th>DETAILS</th>
                    </tr>
                </thead>
                <tbody id="auditList">
                    <!-- Loaded dynamically -->
                </tbody>
            </table>
        </div>
    </div>
</div>
<!-- End Audit Log Section -->

<div class="section hidden" id="security-log-section">
    <div class="section-header">
        <div>
            <h2>🛡️ Security Log</h2>
            <p>Authentication, access control, and anomaly monitoring.</p>
        </div>
        <button onclick="exportSecurityLog()" class="premium-btn primary">
            <i class="bi bi-download"></i> Export CSV
        </button>
    </div>
    
    <div style="background:#fff; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); overflow:hidden;">
        <div style="overflow-x:auto;">
            <table style="width:100%; text-align:left; border-collapse:collapse; min-width:900px;" id="securityLogTable">
                <thead style="background:#f8fafc; text-transform:uppercase; font-size:11px; font-weight:800; color:#64748b; letter-spacing:0.5px;">
                    <tr>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0; width:40px;"></th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0; min-width:110px;">TIMESTAMP</th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0;">EMAIL / USER</th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0;">EVENT</th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0;">AUTH</th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0;">IP ADDRESS</th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0;">DEVICE</th>
                        <th style="padding:16px 12px; border-bottom:1px solid #e2e8f0;">DETAILS</th>
                    </tr>
                </thead>
                <tbody id="securityList" style="background:#fff;">
                    <!-- Loaded dynamically -->
                </tbody>
            </table>
        </div>
    </div>
</div>
<!-- End Security Log Section -->
`;

if (html.match(activityRegex)) {
    html = html.replace(activityRegex, newSections);
} else if (html.match(fallbackRegex)) {
    html = html.replace(fallbackRegex, newSections + '\n');
}

// 3. Inject the data hydration JS
const jsRegex = /async function loadActivityLog\(\) \{[\s\S]*?\}(?=\s*async function loadSystemStats)/;
const newJs = `
async function loadAuditLog() {
    try {
        const { data: audits, error } = await supabase.from('audit_log').select('*, users(id, fullName, username)').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        
        const list = document.getElementById('auditList');
        if (!audits || audits.length === 0) {
            list.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-4">No audit logs found</td></tr>';
            return;
        }

        list.innerHTML = audits.map(a => {
            const date = new Date(a.created_at);
            const userStr = a.users ? (a.users.fullName || a.users.username) : 'System';
            return \`
                <tr>
                    <td><div class="font-bold">\${date.toLocaleDateString()}</div><div class="text-xs text-gray-500">\${date.toLocaleTimeString()}</div></td>
                    <td>\${userStr}</td>
                    <td><span class="badge" style="background:#e0e7ff; color:#3730a3;">\${a.action}</span></td>
                    <td class="font-medium text-gray-700">\${a.entity_type} \${a.entity_id ? '#' + a.entity_id : ''}</td>
                    <td class="text-sm text-gray-600">\${a.details || ''}</td>
                </tr>
            \`;
        }).join('');
    } catch(e) { console.error(e); }
}

async function loadSecurityLog() {
    try {
        const { data: secs, error } = await supabase.from('security_log').select('*, users(id, fullName, email, username)').order('created_at', { ascending: false }).limit(200);
        if (error) throw error;
        
        const list = document.getElementById('securityList');
        if (!secs || secs.length === 0) {
            list.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-4">No security logs found</td></tr>';
            return;
        }

        list.innerHTML = secs.map(s => {
            const date = new Date(s.created_at);
            
            // Name/Email resolution
            const uName = s.users && s.users.fullName ? s.users.fullName : (s.target_username || 'System Administrator');
            const uMail = s.users && s.users.email ? s.users.email : (s.users && s.users.username ? s.users.username : 'admin@barangay.system');
            
            // Parsing Event Badges and Colors natively aligning with User Image Request
            const ev = s.event_type || 'Unknown';
            let bdgStyle = 'background:#e2e8f0; color:#475569;';
            let bgRow = '';
            let lineLeft = '';
            let icon = '';
            let ipColor = '#64748b'; // default greyish for normal
            
            // Critical/Warning parsing
            if (s.severity === 'critical' || s.severity === 'warning' || ev.includes('Fail') || ev.includes('NewIp') || ev.includes('Suspend')) {
                bgRow = 'background:rgba(239,68,68,0.04);';
                lineLeft = 'border-left:4px solid #ef4444;';
                icon = '<span style="color:#ef4444; font-size:16px;">⚠️</span>';
                bdgStyle = 'background:#fee2e2; color:#dc2626; border:1px solid #fecaca;';
                ipColor = '#ef4444'; // align to the picture's red IP for alerts
            } else if (ev.includes('Success') || ev.includes('Verified')) {
                bdgStyle = 'background:#d1fae5; color:#059669; border:1px solid #a7f3d0;';
                ipColor = '#ec4899'; // pinkish red like picture? Wait, the pic showed light green for Success, red for NewIp, blue for requested.
            } else if (ev.includes('Request')) {
                bdgStyle = 'background:#dbeafe; color:#2563eb; border:1px solid #bfdbfe;';
            }
            
            const badge = \`<span style="\${bdgStyle} font-size:11px; font-weight:700; padding:4px 10px; border-radius:12px;">\${ev}</span>\`;

            // Truncate Device for clean aesthetics
            let deviceShort = s.device_info ? (s.device_info.length > 40 ? s.device_info.substring(0,37) + '...' : s.device_info) : '—';
            
            return \`
                <tr style="border-bottom:1px solid #f1f5f9; \${bgRow}">
                    <td style="\${lineLeft} padding:14px 12px; text-align:center;">\${icon}</td>
                    <td style="padding:14px 12px;">
                        <div style="font-size:13px; font-weight:700; color:#1e293b;">\${date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</div>
                        <div style="font-size:11px; color:#64748b; margin-top:2px;">\${date.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit', second:'2-digit'})}</div>
                    </td>
                    <td style="padding:14px 12px;">
                        <div style="font-size:13px; font-weight:700; color:#334155;">\${uName}</div>
                        <div style="font-size:12px; color:#94a3b8; margin-top:1px;">\${uMail}</div>
                    </td>
                    <td style="padding:14px 12px;">\${badge}</td>
                    <td style="padding:14px 12px; font-size:13px; font-weight:600; color:#475569;">\${s.auth_method || 'System'}</td>
                    <td style="padding:14px 12px; font-size:12px; font-weight:600; color:\${ipColor}; font-family:monospace;">\${s.ip_address || '—'}</td>
                    <td style="padding:14px 12px; font-size:11px; color:#94a3b8;" title="\${s.device_info}">\${deviceShort}</td>
                    <td style="padding:14px 12px; font-size:12px; color:#64748b; line-height:1.4;">\${s.details || '—'}</td>
                </tr>
            \`;
        }).join('');
    } catch(e) { console.error(e); }
}

async function exportAuditLog() {
    exportToCSV('audit_log', 'audit_log_report');
}
async function exportSecurityLog() {
    exportToCSV('security_log', 'security_log_report');
}
`;

if (html.match(jsRegex)) {
    html = html.replace(jsRegex, newJs);
} else {
    // If it's not found cleanly, append it before the end of scripts.
    html = html.replace('// --- Load Dashboard Data ---', newJs + '\n// --- Load Dashboard Data ---');
}

// Ensure the section refresh logic works
html = html.replace(/case 'activity-log':[\s\S]*?break;/, `case 'audit-log':\nawait loadAuditLog();\nbreak;\ncase 'security-log':\nawait loadSecurityLog();\nbreak;`);

fs.writeFileSync('admin.html', html);
console.log('admin.html updated successfully with Security and Audit Log tabs');
