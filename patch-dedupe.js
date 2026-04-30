const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// Fix 1: In checkConflictNotifications, remove booking_cancelled from the filter
// so it doesn't show the orange popup for the same booking that checkPendingNotifications handles
html = html.replace(
    `// Also check event_conflict for legacy, but primarily booking_cancelled\n                const conflicts = notifs.filter(n => n.type === 'booking_cancelled' || n.type === 'event_conflict');`,
    `// booking_cancelled is handled exclusively by checkPendingNotifications to avoid duplicate popups\n                const conflicts = notifs.filter(n => n.type === 'event_conflict');`
);

// Fallback: try CRLF version
html = html.replace(
    "// Also check event_conflict for legacy, but primarily booking_cancelled\r\n                const conflicts = notifs.filter(n => n.type === 'booking_cancelled' || n.type === 'event_conflict');",
    "// booking_cancelled is handled exclusively by checkPendingNotifications to avoid duplicate popups\r\n                const conflicts = notifs.filter(n => n.type === 'event_conflict');"
);

fs.writeFileSync('user-dashboard.html', html);
console.log('Fixed duplicate popup!');
// Verify
const check = fs.readFileSync('user-dashboard.html', 'utf8');
if (check.includes("booking_cancelled' || n.type === 'event_conflict")) {
    console.log('WARNING: old filter still present!');
} else {
    console.log('Verified: booking_cancelled removed from conflict filter OK');
}
