const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0, 80))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}

// Fix: the showAlert success line has extra whitespace before sidebarUserName line
rep(
    "showAlert('Profile updated successfully!', 'success');\n                            \n                            document.getElementById('sidebarUserName').textContent = user.fullName;",
    "showAlert('Profile updated successfully!', 'success');\n\n                            // Track edit count\n                            const _now = new Date();\n                            const _mk = _now.getFullYear() + '-' + (_now.getMonth() + 1);\n                            const _qr = localStorage.getItem('profileEditQuota');\n                            let _q = _qr ? JSON.parse(_qr) : {};\n                            const _used = (_q.month === _mk) ? (_q.count || 0) : 0;\n                            localStorage.setItem('profileEditQuota', JSON.stringify({ month: _mk, count: _used + 1 }));\n                            _updateProfileQuotaUI();\n\n                            document.getElementById('sidebarUserName').textContent = user.fullName;"
);

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
