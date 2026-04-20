const fs = require('fs');
let lines = fs.readFileSync('user-dashboard.html', 'utf8').split('\n');
lines[3349] = "                        const msg  = newR.message || '';";
lines[3350] = "";
lines[3351] = "                        pollBellNotifications();";
lines[3352] = "";
lines[3353] = "                        if (type === 'booking_cancelled') {";
fs.writeFileSync('user-dashboard.html', lines.join('\n'));
