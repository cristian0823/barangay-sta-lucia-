const fs = require('fs');

// ============================================================
// PATCH user-dashboard.html
// ============================================================
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Rename "Booking Conflict" -> "Reservation Cancelled" in orange popup
html = html.replace(
    '>Booking Conflict</h3>',
    '>Reservation Cancelled</h3>'
);

// 2. Remove description from Events panel render (line 3037 area)
html = html.replace(
    `(e.description ? '<div class="mt-3 text-sm bg-black/20 p-3 rounded-lg italic shadow-inner border border-white/10">💬 ' + (typeof window.escapeHtml === 'function' ? escapeHtml(e.description) : e.description) + '</div>' : '') +`,
    `''  +`
);

// 3. Suppress the dark rescheduleCancelModal — route showNextNotification to use conflictNotifModal instead
// Replace showNextNotification to show orange conflictNotifModal with proper data
html = html.replace(
    `        function showNextNotification() {
            const modal = document.getElementById('rescheduleCancelModal');
            if (!modal) return;
            if (userCancellationNotifications.length === 0) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                return;
            }
            curCancelNotif = userCancellationNotifications[0];
            const msgEl = document.getElementById('rcmMessage');
            if (msgEl) msgEl.textContent = curCancelNotif.message;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }`,
    `        function showNextNotification() {
            // Route to the orange Reservation Cancelled popup instead of the dark modal
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

// 4. Wire handleConflictReschedule to also handle curCancelNotif reschedule
// Find existing handleConflictReschedule and add curCancelNotif handling
html = html.replace(
    `        function handleConflictReschedule() {
            // Close the conflict modal
            const modal = document.getElementById('conflictNotifModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
            
            // Save metadata for 1-click reschedule auto-fill
            if (_activeConflictNotif && _activeConflictNotif.meta) {
                 window.pendingRescheduleData = _activeConflictNotif.meta;
                 console.log("Reschedule Data Saved:", window.pendingRescheduleData);
            }
            
            // Mark as read
            if (_activeConflictNotif && typeof markUserNotificationAsRead === 'function') {
                markUserNotificationAsRead(_activeConflictNotif.id);
            }
            _activeConflictNotif = null;
            
            // Navigate to booking panel
            showPanel('booking');
            showToast('Please pick a new date to reschedule your booking.', 'success');
        }`,
    `        function handleConflictReschedule() {
            // Close the conflict modal
            const modal = document.getElementById('conflictNotifModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
            
            const notif = _activeConflictNotif || curCancelNotif;
            if (notif && notif.meta) {
                window.pendingRescheduleData = notif.meta;
                const venueMeta = (notif.meta && notif.meta.venue) ? notif.meta.venue : '';
                const venueKey = venueMeta.includes('Multi') ? 'multipurpose' : 'basketball';
                if (typeof markUserNotificationAsRead === 'function') markUserNotificationAsRead(notif.id);
                _activeConflictNotif = null;
                if (userCancellationNotifications.length > 0) userCancellationNotifications.shift();
                curCancelNotif = null;
                showPanel('booking');
                if (typeof switchVenue === 'function') switchVenue(venueKey);
                setTimeout(() => showToast('Reschedule Mode: Please pick a new date on the calendar.', 'info'), 300);
            } else {
                if (typeof markUserNotificationAsRead === 'function' && _activeConflictNotif) markUserNotificationAsRead(_activeConflictNotif.id);
                _activeConflictNotif = null;
                showPanel('booking');
                showToast('Please pick a new date to reschedule your booking.', 'success');
            }
        }`
);

// 5. Wire handleConflictCancel to also handle curCancelNotif cancellation
html = html.replace(
    `        async function handleConflictCancel() {`,
    `        async function handleConflictCancel() {
            const orangeModal = document.getElementById('conflictNotifModal');
            if (orangeModal) { orangeModal.classList.add('hidden'); orangeModal.classList.remove('flex'); }
            // If this was a curCancelNotif, cancel the booking
            if (curCancelNotif && curCancelNotif.meta && curCancelNotif.meta.booking_id) {
                if (typeof cancelCourtBooking === 'function') await cancelCourtBooking(curCancelNotif.meta.booking_id);
                if (typeof markUserNotificationAsRead === 'function') markUserNotificationAsRead(curCancelNotif.id);
                if (userCancellationNotifications.length > 0) userCancellationNotifications.shift();
                curCancelNotif = null;
                _activeConflictNotif = null;
                showToast('Reservation cancelled.', 'success');
                await loadBookingView();
                return;
            }
            // original flow below`
);

fs.writeFileSync('user-dashboard.html', html);
console.log('Patched user-dashboard.html');

// ============================================================
// PATCH admin.html
// ============================================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// 1. Add Capacity and Organizer fields to Cancel All modal
const massCancelFormTarget = `                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Event Name *</label>
                    <input type="text" id="amcEventName" required placeholder="e.g. Barangay Fiesta, Basketball Tournament..."
                        style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Reason / Details *</label>
                    <textarea id="amcReason" rows="3" required placeholder="e.g. Court will be used for the Barangay Fiesta celebration..."
                        style="width:100%; padding:12px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; resize:vertical; box-sizing:border-box; outline:none;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'"></textarea>
                </div>`;

const massCancelFormReplacement = `                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Event Name *</label>
                    <input type="text" id="amcEventName" required placeholder="e.g. Barangay Fiesta, Basketball Tournament..."
                        style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                </div>
                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Organizer *</label>
                    <input type="text" id="amcOrganizer" required placeholder="e.g. Barangay Council"
                        style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                </div>
                <div style="margin-bottom:14px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Capacity (max attendees)</label>
                    <input type="number" id="amcCapacity" placeholder="e.g. 100" min="0"
                        style="width:100%; padding:11px 14px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block; font-size:12px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Reason / Details *</label>
                    <textarea id="amcReason" rows="3" required placeholder="e.g. Court will be used for the Barangay Fiesta celebration..."
                        style="width:100%; padding:12px; border:1.5px solid #d1d5db; border-radius:10px; font-size:14px; font-family:inherit; resize:vertical; box-sizing:border-box; outline:none;"
                        onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#d1d5db'"></textarea>
                </div>`;

adminHtml = adminHtml.replace(massCancelFormTarget, massCancelFormReplacement);

// 2. Update confirmAdminMassCancel to use amcOrganizer and amcCapacity and NOT save description to event
adminHtml = adminHtml.replace(
    `                if (!eventName || !reason) {
                    showAlert('Please provide both the Event Name and Reason.', 'error');
                    return;
                }`,
    `                const organizer = document.getElementById('amcOrganizer') ? document.getElementById('amcOrganizer').value.trim() : 'Barangay Council';
                const capacity = document.getElementById('amcCapacity') ? parseInt(document.getElementById('amcCapacity').value || '0', 10) : 0;
                if (!eventName || !reason || !organizer) {
                    showAlert('Please provide Event Name, Organizer, and Reason.', 'error');
                    return;
                }`
);

// 3. Update the newEvent object to use organizer, capacity (NO description stored in event)
adminHtml = adminHtml.replace(
    `                    const newEvent = {
                        title: eventName,
                        date: adminSelectedDate,
                        time: '07:00',
                        start_time: '07:00',
                        end_time: '22:00',
                        organizer: 'Barangay Council',
                        location: 'Basketball Court',
                        status: 'approved',
                        created_at: new Date().toISOString()
                    };`,
    `                    const newEvent = {
                        title: eventName,
                        date: adminSelectedDate,
                        time: '07:00',
                        start_time: '07:00',
                        end_time: '22:00',
                        organizer: organizer || 'Barangay Council',
                        location: 'Basketball Court',
                        capacity: capacity || 0,
                        description: '',
                        status: 'approved',
                        created_at: new Date().toISOString()
                    };`
);

// 4. After cancel all, close modal and show simple success, skip opening event form
adminHtml = adminHtml.replace(
    `                    // 4. Close modal and open Add Event form directly so admin can finalize event details
                    document.getElementById('adminMassCancelModal').style.display = 'none';
                    await renderAdminCalendar();

                    // Open the day schedule popup and show the Add Event form with pre-filled name
                    if (typeof openAdminDaySchedulePopup === 'function') {
                        await openAdminDaySchedulePopup(adminSelectedDate, 'basketball');
                    } else {
                        // Fallback: open adsEventModal directly
                        const modal = document.getElementById('adminDayScheduleModal');
                        if (modal) modal.style.display = 'flex';
                    }
                    // Pre-fill and show the event form
                    setTimeout(() => {
                        if (typeof openAdsEventModal === 'function') openAdsEventModal();
                        const titleEl = document.getElementById('adsEventTitle');
                        if (titleEl) titleEl.value = eventName;
                        const descEl = document.getElementById('adsEventDescription');
                        if (descEl) descEl.value = reason;
                    }, 300);`,
    `                    // 4. Close modal and show success
                    document.getElementById('adminMassCancelModal').style.display = 'none';
                    // Clear form
                    ['amcEventName','amcOrganizer','amcCapacity','amcReason'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
                    const successModal = document.getElementById('adminEventSuccessModal');
                    if (successModal) {
                        successModal.querySelector('h3').textContent = 'All Reservations Cancelled!';
                        successModal.querySelector('p').textContent = \`All bookings on \${adminSelectedDate} were cancelled, users were notified, and the event "\${eventName}" was added to block this day.\`;
                        successModal.style.display = 'flex';
                    }
                    await renderAdminCalendar();`
);

fs.writeFileSync('admin.html', adminHtml);
console.log('Patched admin.html');
console.log('All patches done!');
