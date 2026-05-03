const fs = require('fs');

// 1. Fix user-portal/user-dashboard.html
let userHtml = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// Fix image cropping in equipment grid
userHtml = userHtml.replace('class="w-full h-full object-cover object-center bg-white', 'class="w-full h-full object-contain object-center bg-white');

// Fix garbled calendar emoji in My Borrowings
userHtml = userHtml.replace(/Ã°Å¸â€œâ€¦ /g, '&#128197; ');

// Fix garbled hourglass emoji in My Borrowings pending status
userHtml = userHtml.replace(/Ã¢Â Â³ /g, '&#8987; ');

// Add a script at the end of loadEquipment to reload when tab gets focus
if (!userHtml.includes("window.addEventListener('focus', function() {")) {
    userHtml = userHtml.replace(
        "window.initUserDashboard = initUserDashboard;",
        `
        // Auto-refresh equipment list when user returns to the tab (if they are on the Equipment page)
        window.addEventListener('focus', function() {
            if (document.getElementById('equipment') && document.getElementById('equipment').classList.contains('active-section')) {
                console.log('Tab focused, silently refreshing equipment...');
                loadEquipment();
            }
        });
        
        window.initUserDashboard = initUserDashboard;`
    );
}

fs.writeFileSync('user-portal/user-dashboard.html', userHtml);
console.log('user-dashboard.html patched successfully.');

// 2. Fix admin-portal/admin.html
let adminHtml = fs.readFileSync('admin-portal/admin.html', 'utf8');

// Add scrolling to modal content
if (!adminHtml.includes('max-height: 90vh;')) {
    adminHtml = adminHtml.replace(
        /\.modal-content\s*\{\s*background:\s*#fff;\s*border:\s*1\.5px solid var\(--green-200\);\s*border-radius:\s*22px;\s*padding:\s*34px;\s*width:\s*100%;\s*max-width:\s*500px;\s*box-shadow:\s*0 20px 60px rgba\(0, 0, 0, 0\.15\);\s*animation:\s*modalIn 0\.25s ease;\s*\}/,
        `.modal-content {\n            background: #fff;\n            border: 1.5px solid var(--green-200);\n            border-radius: 22px;\n            padding: 34px;\n            width: 100%;\n            max-width: 500px;\n            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);\n            animation: modalIn 0.25s ease;\n            max-height: 90vh;\n            overflow-y: auto;\n        }`
    );
}

fs.writeFileSync('admin-portal/admin.html', adminHtml);
console.log('admin.html patched successfully.');
