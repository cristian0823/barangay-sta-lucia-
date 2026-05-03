const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');
txt = txt.replace(
    "status: 'pending'\r\n                });\r\n                if (result.success) {\r\n                    window.pendingRescheduleData = null;",
    "status: 'pending',\r\n                    isReschedule: true,\r\n                    originalDate: window.pendingRescheduleData.date || 'unknown'\r\n                });\r\n                if (result.success) {\r\n                    window.pendingRescheduleData = null;"
);
fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('done');
