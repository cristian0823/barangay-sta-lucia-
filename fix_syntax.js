const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

const target = `            // ── CLEAR LOG FUNCTIONS ──
                _allSecurityLogs = [];
                renderSecurityLog();
                if (typeof showAlert === 'function') showAlert('Security log cleared and account lockouts reset.', 'success');
            }`;

txt = txt.replace(target, '            // ── CLEAR LOG FUNCTIONS ──');

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Done!');
