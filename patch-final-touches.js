const fs = require('fs');

// ============================================================
// PATCH admin.html
// Remove "End Time" from Cancel All form
// ============================================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// Remove amcEndTime HTML
adminHtml = adminHtml.replace(
    /<div style="flex:1;">\s*<label[^>]*>End Time \*\<\/label>[\s\S]*?<\/div>/,
    ''
);

// Update confirmAdminMassCancel to remove amcEndTime validation
adminHtml = adminHtml.replace(
    /const amcEndTime = document\.getElementById\('amcEndTime'\) \? document\.getElementById\('amcEndTime'\)\.value : '22:00';/,
    `const amcEndTime = '22:00';`
);
adminHtml = adminHtml.replace(
    /if \(\!eventName \|\| \!reason \|\| \!organizer \|\| \!amcStartTime \|\| \!amcEndTime\) \{/,
    `if (!eventName || !reason || !organizer || !amcStartTime) {`
);

fs.writeFileSync('admin.html', adminHtml);
console.log('Patched admin.html - Removed End Time');

// ============================================================
// PATCH user-dashboard.html
// 1. Solid Red calendar dates for user bookings
// 2. Bell Notification Popup
// ============================================================
let userHtml = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Red Calendar dates
userHtml = userHtml.replace(
    /dayDiv\.className \+\= 'bg-red-100 text-red-700 border-2 border-red-300 cursor-pointer hover:bg-red-200 hover:scale-105';/,
    `dayDiv.className += 'bg-red-600 text-white border-2 border-red-700 cursor-pointer hover:bg-red-700 hover:scale-105 shadow-md';`
);

// 2. Add window.currentBellNotifs
userHtml = userHtml.replace(
    /function renderBellNotifications\(notifs\) \{/,
    `function renderBellNotifications(notifs) {\n            window.currentBellNotifs = notifs;`
);

// 3. Update handleBellClick to show modal
userHtml = userHtml.replace(
    /async function handleBellClick\(notifId\) \{[\s\S]*?pollBellNotifications\(\);[\s\S]*?\}/,
    `async function handleBellClick(notifId) {
            // Find notification details
            const notif = (window.currentBellNotifs || []).find(n => String(n.id) === String(notifId));
            if (notif) {
                const modal = document.getElementById('bellDetailsModal');
                const titleEl = document.getElementById('bdModalTitle');
                const msgEl = document.getElementById('bdModalMsg');
                const iconEl = document.getElementById('bdModalIcon');
                if (modal && titleEl && msgEl && iconEl) {
                    let iconHtml = '🔔', titleText = 'Notification';
                    if (notif.type === 'booking_approved') { iconHtml = '📅'; titleText = 'Reservation Approved'; }
                    if (notif.type === 'booking_rejected') { iconHtml = '❌'; titleText = 'Reservation Rejected'; }
                    if (notif.type === 'concern_resolved') { iconHtml = '✅'; titleText = 'Concern Resolved'; }
                    if (notif.type === 'equipment_approved') { iconHtml = '📦'; titleText = 'Equipment Request'; }
                    if (notif.type === 'booking_cancelled' || notif.type === 'event_conflict') { iconHtml = '⚠️'; titleText = 'Reservation Cancelled'; }
                    if (notif.type === 'event_added' || notif.type === 'event_cancelled') { iconHtml = '🎉'; titleText = 'Barangay Event'; }
                    
                    iconEl.innerHTML = iconHtml;
                    titleEl.textContent = titleText;
                    msgEl.textContent = notif.message;
                    
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            }

            if (typeof markUserNotificationAsRead === 'function') {
                await markUserNotificationAsRead(notifId);
                pollBellNotifications(); 
            }
        }`
);

// 4. Inject Bell Details Modal HTML
const bellModalHtml = `
    <!-- ========== BELL DETAILS MODAL ========== -->
    <div id="bellDetailsModal" class="hidden fixed inset-0 z-[12000] items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl flex flex-col overflow-hidden transform transition-all relative">
            <button onclick="document.getElementById('bellDetailsModal').classList.add('hidden'); document.getElementById('bellDetailsModal').classList.remove('flex');" 
                    class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition cursor-pointer z-10 bg-transparent border-none text-2xl font-bold leading-none">
                &times;
            </button>
            <div class="p-6 text-center pt-8">
                <div id="bdModalIcon" class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    🔔
                </div>
                <h3 id="bdModalTitle" class="text-xl font-bold text-gray-900 dark:text-white mb-3">Notification</h3>
                <p id="bdModalMsg" class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"></p>
            </div>
            <div class="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
                <button onclick="document.getElementById('bellDetailsModal').classList.add('hidden'); document.getElementById('bellDetailsModal').classList.remove('flex');" 
                        class="w-full py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold rounded-xl transition cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    </div>
    <!-- ========================================== -->
`;

userHtml = userHtml.replace('</body>', bellModalHtml + '\n</body>');

fs.writeFileSync('user-dashboard.html', userHtml);
console.log('Patched user-dashboard.html - Added Bell Modal, Red Calendar');
