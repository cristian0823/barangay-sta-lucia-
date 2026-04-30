const fs = require('fs');
const file = 'user-portal/user-dashboard.html';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
        function checkCancellationLimit() {
            const cancelLog = JSON.parse(localStorage.getItem('cancel_timestamps') || '[]');
            const now = Date.now();
            return cancelLog.filter(t => now - t < 24 * 60 * 60 * 1000).length;
        }

        function recordCancellation() {
            const cancelLog = JSON.parse(localStorage.getItem('cancel_timestamps') || '[]');
            const now = Date.now();
            const recentCancels = cancelLog.filter(t => now - t < 24 * 60 * 60 * 1000);
            recentCancels.push(now);
            localStorage.setItem('cancel_timestamps', JSON.stringify(recentCancels));
        }

        async function cancelMyReservation(id) {
            const cancelledCount = checkCancellationLimit();
            if (cancelledCount >= 3) {
                showToast('You have reached the 3-cancellation limit in 24 hours. You cannot cancel until tomorrow.', 'error');
                return;
            }
            if (!await showConfirmModal(\`Are you sure you want to cancel this reservation? (\${cancelledCount}/3 cancellations used in 24h)\`, 'Cancel Reservation', 'Yes, Cancel', 'No', 'warning')) return;
            const res = await cancelCourtBooking(id);
            if (res.success) {
                recordCancellation();
                showToast(\`Reservation cancelled (\${cancelledCount + 1}/3 cancellations used).\`, 'success');
                await loadBookingView();
                await loadDashboardStats();
            } else {
                showToast(res.message, 'error');
            }
        }

        async function cancelEqRequest(id) {
            const cancelledCount = checkCancellationLimit();
            if (cancelledCount >= 3) {
                showToast('You have reached the 3-cancellation limit in 24 hours. You cannot cancel until tomorrow.', 'error');
                return;
            }
            if (!await showConfirmModal(\`Cancel this equipment request? (\${cancelledCount}/3 cancellations used in 24h)\`, 'Cancel Request', 'Yes, Cancel', 'No', 'warning')) return;
            const res = await cancelBorrowingRequest(id);
            if (res.success) {
                recordCancellation();
                showToast(\`Equipment request cancelled (\${cancelledCount + 1}/3 cancellations used).\`, 'success');
                await loadMyBorrowingsList();
                await loadDashboardStats();
            } else {
                showToast(res.message, 'error');
            }
        }
`;

const matchRegex = /async function cancelMyReservation\(id\)\s*\{[\s\S]*?async function cancelEqRequest\(id\)\s*\{[\s\S]*?showToast\(res\.message, 'error'\);\s*\}\s*\}/;

if (matchRegex.test(content)) {
    content = content.replace(matchRegex, replacement.trim());
    
    // Also remove the first duplicate cancelEqRequest around line 2398
    const dupRegex = /async function cancelEqRequest\(id\)\s*\{\s*if \(\!await showConfirmModal[\s\S]*?showToast\(res\.message, 'error'\);\s*\}/;
    content = content.replace(dupRegex, '/* cancelEqRequest moved down */');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success");
} else {
    console.log("Could not match the function blocks.");
}
