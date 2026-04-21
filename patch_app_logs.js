const fs = require('fs');
let code = fs.readFileSync('js/app.js', 'utf8');

// Strip the legacy logActivity function specifically
// The old one looks like: async function logActivity(action, details, severity = 'info') { ... }
const oldLogPrefix = `async function logActivity(action, details, severity = 'info') {`;
const idx = code.indexOf(oldLogPrefix);
if (idx !== -1) {
    // Find the matching closing brace
    let braceCount = 0;
    let endIndex = -1;
    let started = false;
    for (let i = idx; i < code.length; i++) {
        if (code[i] === '{') {
            braceCount++;
            started = true;
        } else if (code[i] === '}') {
            braceCount--;
        }
        if (started && braceCount === 0) {
            endIndex = i;
            break;
        }
    }
    if (endIndex !== -1) {
        code = code.substring(0, idx) + '/* old logActivity removed */' + code.substring(endIndex + 1);
        console.log('Successfully stripped old logActivity');
    }
} else {
    // Fallback if the signature is slightly different
    console.log('Could not strictly match async function logActivity(...');
}

// Ensure LOCAL_SECURITY_LOG_KEY and LOCAL_AUDIT_LOG_KEY
code = code.replace(/const LOCAL_ACTIVITY_LOG_KEY = 'barangay_local_activity_log';/g, 
    "const LOCAL_AUDIT_LOG_KEY = 'barangay_local_audit_log';\nconst LOCAL_SECURITY_LOG_KEY = 'barangay_local_security_log';");

const newLogs = `
window.logAudit = async function(entityType, entityId, action, details) {
    // Local fallback
    const logs = JSON.parse(localStorage.getItem(LOCAL_AUDIT_LOG_KEY)) || [];
    logs.push({
        id: Date.now(), user_id: (getCurrentUser() || {}).id || null,
        entity_type: entityType, entity_id: entityId, action: action, details: details,
        created_at: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_AUDIT_LOG_KEY, JSON.stringify(logs));

    try {
        const u = getCurrentUser() || {};
        if (window.supabase) {
            await supabase.from('audit_log').insert([{
                user_id: u.id || null,
                entity_type: entityType || 'System',
                entity_id: entityId,
                action: action,
                details: details
            }]);
        }
    } catch(e) { console.error('logAudit failed', e); }
};

window.logSecurity = async function(eventType, authMethod, severity, details, targetUsername = null) {
    let ip = 'Unknown';
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;
    } catch(e) {}

    // Local fallback
    const logs = JSON.parse(localStorage.getItem(LOCAL_SECURITY_LOG_KEY)) || [];
    logs.push({
        id: Date.now(), user_id: (getCurrentUser() || {}).id || null,
        target_username: targetUsername, event_type: eventType, auth_method: authMethod, 
        severity: severity, ip_address: ip, device_info: navigator.userAgent, details: details,
        created_at: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_SECURITY_LOG_KEY, JSON.stringify(logs));

    try {
        const u = getCurrentUser() || {};
        const device = navigator.userAgent;

        if (window.supabase) {
            await supabase.from('security_log').insert([{
                user_id: u.id || null,
                target_username: targetUsername || u.username || null,
                event_type: eventType,
                auth_method: authMethod || 'System',
                severity: severity,
                ip_address: ip,
                device_info: device,
                details: details
            }]);
        }
    } catch(e) { console.error('logSecurity failed', e); }
};

window.logActivity = async function(action, details, severity = 'info') {
    // Migration wrapper
    const actStr = action || '';
    const isSecurity = /Login|Logout|User|Password|OTP|Suspend|Role|Admin|Account/i.test(actStr);
    
    if (isSecurity) {
        let evType = actStr.includes('OTP') ? 'OtpVerified' : actStr.includes('Login') ? 'LoginSuccess' : actStr;
        let authMethod = actStr.includes('OTP') ? 'OTP' : actStr.includes('Login') || actStr.includes('Password') ? 'Password' : 'N/A';
        await window.logSecurity(evType, authMethod, severity, details);
    } else {
        await window.logAudit(actStr, null, 'UPDATE', details);
    }
};
`;

const initIndex = code.indexOf('// --- Core Initialization ---');
if (initIndex !== -1) {
    code = code.substring(0, initIndex) + newLogs + '\n\n' + code.substring(initIndex);
} else {
    // Just put it at the very top
    code = newLogs + '\n\n' + code;
}

// 2. Fix the getLogs and exportData hooks
code = code.replace(/await supabase\.from\('activity_log'\)\.select\('\*'\)/g, 
    "await supabase.from('audit_log').select('*'); const {data:s_data} = await supabase.from('security_log').select('*')");

fs.writeFileSync('js/app.js', code);
console.log('js/app.js heavily patched for unified Log Splitting');
