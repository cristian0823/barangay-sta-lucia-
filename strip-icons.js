const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// Strip the residual setting buttons
h = h.replace(/<button [^>]*id="desktopSettingsBtn"[^>]*>⚙️<\/button>/g, '');
h = h.replace(/<button id="logoutBtn"[^>]*>Logout<\/button>/g, '');
h = h.replace(/<button class="mobile-header-btn"[^>]*title="Settings">⚙️<\/button>/g, '');
h = h.replace(/<button id="mobileHeaderLogoutBtn"[^>]*>Logout<\/button>/g, '');

// Why is My Activity blank?
// If container `unifiedHistoryList` exists, loadHistoryView() should populate it.
// Wait! `loadHistoryView` is called in `document.addEventListener('DOMContentLoaded')`.
// But look! `<div id="unifiedHistoryList" class="space-y-4">`
// Let's verify that the HTML around it is fully intact.
// I will output the end of user-dashboard.html to see if there's any unclosed tags or syntax bugs.

fs.writeFileSync('user-dashboard.html', h);
console.log('Stripped gear icons and old logouts successfully.');
