const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// Find where "document.getElementById('userInitial').textContent = " exactly is.
const targetStartStr = `document.getElementById('userInitial').textContent = (user.fullName || user.name || user.username || user.email)[0].toUpperCase();`;

const injection = `
        const mobileAvatar = document.getElementById('mobileHeaderAvatar');
        if (mobileAvatar) mobileAvatar.textContent = (user.fullName || user.name || user.username || user.email)[0].toUpperCase();
        const mobileNameEl = document.getElementById('mobileUserName');
        if (mobileNameEl) mobileNameEl.textContent = user.fullName || user.name || user.username || user.email.split('@')[0];

        // Autofill forms with user data
        setTimeout(() => {
            const autofill = [
                { id: 'borrowerFullName', val: user.fullName || user.name || user.username },
                { id: 'borrowerContact', val: user.phone || user.contact_number || user.contactNumber || '' },
                { id: 'borrowerAddress', val: user.address || '' },
                { id: 'dsName', val: user.fullName || user.name || user.username }
            ];
            autofill.forEach(f => {
                const el = document.getElementById(f.id);
                if (el && f.val) el.value = f.val;
            });
        }, 100);
`;

// Replace everything between targetStartStr and "// Live clock"
let parts = html.split(targetStartStr);
if (parts.length > 1) {
    let remainder = parts[1];
    let clockIndex = remainder.indexOf('// Live clock');
    if (clockIndex !== -1) {
        remainder = remainder.substring(clockIndex);
        html = parts[0] + targetStartStr + "\n" + injection + "\n        " + remainder;
        fs.writeFileSync('user-dashboard.html', html);
        console.log("Fixed!");
    } else {
        console.log("Could not find // Live clock");
    }
} else {
    console.log("Could not find targetStartStr");
}
