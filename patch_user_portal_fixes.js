const fs = require('fs');
let html = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Fix 1: Replace garbled statusIcon characters with safe ASCII/HTML alternatives
// The line with corrupted characters for the equipment grid statusIcon
const lines = html.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("statusIcon = '") && lines[i].includes('bg-emerald-50')) {
        console.log('Found statusIcon line at:', i + 1);
        console.log('Old:', lines[i]);
        lines[i] = lines[i].replace(/statusIcon = '[^']*'/, "statusIcon = '&#10003;'");
        console.log('New:', lines[i]);
    }
    if (lines[i].includes("statusIcon = '") && lines[i].includes('bg-amber-50')) {
        console.log('Found amber statusIcon at:', i + 1);
        lines[i] = lines[i].replace(/statusIcon = '[^']*'/, "statusIcon = '&#9888;'");
    }
    if (lines[i].includes("statusIcon = '") && lines[i].includes('bg-red-50')) {
        lines[i] = lines[i].replace(/statusIcon = '[^']*'/, "statusIcon = '&#10005;'");
    }
}
html = lines.join('\n');

// Fix 2: Auto-fill Full Name and Contact Number from the user session
html = html.replace(
    "document.getElementById('borrowerFullName').value = user.name || '';",
    "document.getElementById('borrowerFullName').value = user.fullName || user.full_name || user.name || user.username || '';"
);
html = html.replace(
    "document.getElementById('borrowerContact').value = '';",
    "document.getElementById('borrowerContact').value = user.contactNumber || user.contact_number || user.phone || '';"
);

fs.writeFileSync('user-portal/user-dashboard.html', html);

console.log('Has HTML entity check:', html.includes('&#10003;'));
console.log('Has fullName autofill:', html.includes('user.fullName || user.full_name'));
console.log('Has contact autofill:', html.includes('user.contactNumber || user.contact_number'));
