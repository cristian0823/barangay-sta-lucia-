const fs = require('fs');

// ============================================================
// PATCH admin.html
// Fix adminRemoveEvent string quotes so it handles UUIDs properly
// ============================================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');

adminHtml = adminHtml.replace(
    /const removeFn = isBk \? \`adminRemoveBooking\(\$\{en\.id\}\)\` : \`adminRemoveEvent\(\$\{en\.id\}\)\`;/,
    `const removeFn = isBk ? \`adminRemoveBooking('\${en.id}')\` : \`adminRemoveEvent('\${en.id}')\`;`
);

fs.writeFileSync('admin.html', adminHtml);
console.log('Fixed quotes in admin.html');

// ============================================================
// PATCH js/app.js
// Fix deleteEvent cache so calendar updates immediately
// ============================================================
let appJs = fs.readFileSync('js/app.js', 'utf8');

appJs = appJs.replace(
    `        if (!error) {
            await logActivity('Event Deleted', \`Deleted event ID: \${eventId}\`);`,
    `        if (!error) {
            if (typeof window._eventsCache !== 'undefined') window._eventsCache = null;
            if (typeof window._eventsCacheTime !== 'undefined') window._eventsCacheTime = null;
            await logActivity('Event Deleted', \`Deleted event ID: \${eventId}\`);`
);

fs.writeFileSync('js/app.js', appJs);
console.log('Fixed cache in deleteEvent');
