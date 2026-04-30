const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// Find and replace showNextNotification using regex
html = html.replace(
    /function showNextNotification\(\) \{[\s\S]*?modal\.classList\.add\('flex'\);\s*\}/,
    `function showNextNotification() {
            // Always use the orange Reservation Cancelled popup - hide dark modal permanently
            const darkModal = document.getElementById('rescheduleCancelModal');
            if (darkModal) { darkModal.classList.add('hidden'); darkModal.classList.remove('flex'); }
            if (userCancellationNotifications.length === 0) return;
            curCancelNotif = userCancellationNotifications[0];
            _activeConflictNotif = curCancelNotif;
            const msgEl = document.getElementById('conflictNotifMsg');
            if (msgEl) msgEl.textContent = curCancelNotif.message;
            const orangeModal = document.getElementById('conflictNotifModal');
            if (orangeModal) { orangeModal.classList.remove('hidden'); orangeModal.classList.add('flex'); }
        }`
);

// Also make the dark rescheduleCancelModal hidden by default in the HTML
// It already has 'hidden' class so just ensure it never gets shown by patching any remaining show calls
html = html.replace(
    /document\.getElementById\('rescheduleCancelModal'\)\.classList\.remove\('hidden'\)/g,
    `document.getElementById('rescheduleCancelModal').classList.add('hidden') // blocked`
);

fs.writeFileSync('user-dashboard.html', html);
console.log('Fixed showNextNotification!');
