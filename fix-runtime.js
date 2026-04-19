const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Fix gear icon removal (desktop)
let gear1 = h.indexOf('id="desktopSettingsBtn"');
while(gear1 !== -1) {
    let start = h.lastIndexOf('<button', gear1);
    let end = h.indexOf('</button>', gear1) + 9;
    if (start !== -1 && end > start) {
        h = h.substring(0, start) + h.substring(end);
    }
    gear1 = h.indexOf('id="desktopSettingsBtn"');
}

// 2. Fix gear icon removal (mobile)
// We look for title="Settings">⚙️</button>
let gearStr = 'title="Settings">⚙️</button>';
let gear2 = h.indexOf(gearStr);
while(gear2 !== -1) {
    let start = h.lastIndexOf('<button', gear2);
    let end = gear2 + gearStr.length;
    if (start !== -1 && end > start) {
        h = h.substring(0, start) + h.substring(end);
    }
    gear2 = h.indexOf(gearStr);
}

// 3. Fix TypeError on missing elements in JS
h = h.replace("document.getElementById('logoutBtn').addEventListener", "document.getElementById('logoutBtn')?.addEventListener");
h = h.replace("document.getElementById('mobileLogoutBtn')?.addEventListener", "document.getElementById('mobileLogoutBtn')?.addEventListener"); // Already has optional chaining, safe
// Wait, looking at grep earlier, line 2513, 4061, 4075 had errors without optional chaining.
h = h.replace("document.getElementById('settingsProfileForm').addEventListener", "document.getElementById('settingsProfileForm')?.addEventListener");
h = h.replace("document.getElementById('settingsPasswordForm').addEventListener", "document.getElementById('settingsPasswordForm')?.addEventListener");

// Also check any other potential addEventListener that could throw on a removed settings element
// "submit" listeners and "click"
h = h.replace(/document\.getElementById\('([^']+)'\)\.addEventListener\('submit'/g, "document.getElementById('$1')?.addEventListener('submit'");
h = h.replace(/document\.getElementById\('([^']+)'\)\.addEventListener\('click'/g, "document.getElementById('$1')?.addEventListener('click'");

fs.writeFileSync('user-dashboard.html', h);
console.log('Fixed syntax errors and removed gear icons properly.');
