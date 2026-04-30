const fs = require('fs');

// ============================================================
// PATCH 1: user-dashboard.html
// - Auto-mark past bookings as 'completed' in Supabase when loading
// - Hide past time slots from schedule list when today
// ============================================================
let userHtml = fs.readFileSync('user-dashboard.html', 'utf8');

// PATCH 1a: After loadBookingView fetches bookings, auto-complete past ones
// Find the line that filters venueBookings and add auto-complete logic before it
const autoCompleteCode = `
            // Auto-mark past approved/pending bookings as completed
            (async () => {
                const now = new Date();
                const todayStr = now.toLocaleDateString('en-CA');
                const available = typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable();
                for (const b of bookings) {
                    if (b.status !== 'approved' && b.status !== 'pending') continue;
                    const bookingDate = b.date;
                    const endTimeStr = b.end_time || '';
                    if (!endTimeStr) continue;
                    let isPast = false;
                    if (bookingDate < todayStr) {
                        isPast = true;
                    } else if (bookingDate === todayStr) {
                        const [h, m] = endTimeStr.split(':').map(Number);
                        const endDt = new Date(); endDt.setHours(h, m, 0, 0);
                        if (endDt < now) isPast = true;
                    }
                    if (isPast) {
                        if (available) {
                            await supabase.from('facility_reservations').update({ status: 'completed' }).eq('id', b.id).in('status', ['pending','approved']);
                        }
                    }
                }
            })();
`;

const autoCompleteTarget = `            const venueBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' && b.status !== 'completed' && b.venue === selectedVenue);`;
userHtml = userHtml.replace(autoCompleteTarget, autoCompleteCode + autoCompleteTarget);

// PATCH 1b: In refreshDsSchedule, filter out past time-slot bookings for today
const pastFilterTarget = `            const dayBookings = allBookings.filter(b =>
                b.date === dateStr &&
                b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' &&
                (b.venue === venue || b.venueName === venueLabel)
            );
            const isToday2 = dateStr === new Date().toISOString().slice(0, 10);`;

const pastFilterReplacement = `            const now2 = new Date();
            const todayStr2 = now2.toISOString().slice(0, 10);
            const dayBookings = allBookings.filter(b => {
                if (b.date !== dateStr) return false;
                if (b.status === 'cancelled' || b.status === 'cancelled_by_admin' || b.status === 'rejected') return false;
                if (!(b.venue === venue || b.venueName === venueLabel)) return false;
                // Hide completed/past bookings from today's schedule list
                if (b.date === todayStr2 && b.end_time) {
                    const [h, m] = b.end_time.split(':').map(Number);
                    const endDt = new Date(); endDt.setHours(h, m, 0, 0);
                    if (endDt < now2) return false;
                }
                return true;
            });
            const isToday2 = dateStr === now2.toISOString().slice(0, 10);`;

userHtml = userHtml.replace(pastFilterTarget, pastFilterReplacement);

fs.writeFileSync('user-dashboard.html', userHtml);
console.log('Patched user-dashboard.html');

// ============================================================
// PATCH 2: admin.html
// - Cancel All → immediately block whole day (event 7am-10pm) + show Add Event form
// - Admin time slot selects already mark user-booked slots as Unavailable (existing code at line 7143-7152 handles this)
// - Also filter past time-slot bookings from admin schedule list for today
// ============================================================
let adminHtml = fs.readFileSync('admin.html', 'utf8');

// PATCH 2a: Change confirmAdminMassCancel to immediately block the day
// and open the Add Event form afterward instead of showing success modal
const massCancelSuccess = `                    // 4. Success cleanup
                    document.getElementById('adminMassCancelModal').style.display = 'none';
                    const successModal = document.getElementById('adminEventSuccessModal');
                    if (successModal) {
                        successModal.querySelector('h3').textContent = 'Bookings Cancelled!';
                        successModal.querySelector('p').textContent = \`All bookings were removed, users were notified, and the event "\${eventName}" was scheduled.\`;
                        successModal.style.display = 'flex';
                    }

                    await renderAdminCalendar();`;

const massCancelSuccessReplacement = `                    // 4. Close modal and open Add Event form directly so admin can finalize event details
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
                    }, 300);`;

adminHtml = adminHtml.replace(massCancelSuccess, massCancelSuccessReplacement);

// PATCH 2b: In refreshAdminDaySchedule, filter out past time-slot bookings for today
const adminDayBookingsFilter = `                const dayBookings = allBookings.filter(b =>
                    b.date === dateStr &&
                    b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' &&
                    (b.venue === venue || b.venueName === venueLabel)
                );
                const dayEvents = allEvents.filter(e => e.date === dateStr && e.status === 'approved');`;

const adminDayBookingsFilterReplacement = `                const adminNow = new Date();
                const adminTodayStr = adminNow.toISOString().slice(0, 10);
                const dayBookings = allBookings.filter(b => {
                    if (b.date !== dateStr) return false;
                    if (b.status === 'cancelled' || b.status === 'cancelled_by_admin' || b.status === 'rejected') return false;
                    if (!(b.venue === venue || b.venueName === venueLabel)) return false;
                    // Hide past end-time bookings for today from schedule list
                    if (b.date === adminTodayStr && b.end_time) {
                        const [h, m] = b.end_time.split(':').map(Number);
                        const endDt = new Date(); endDt.setHours(h, m, 0, 0);
                        if (endDt < adminNow) return false;
                    }
                    return true;
                });
                const dayEvents = allEvents.filter(e => e.date === dateStr && e.status === 'approved');`;

adminHtml = adminHtml.replace(adminDayBookingsFilter, adminDayBookingsFilterReplacement);

// PATCH 2c: In fillAdsTimeSelects, mark user-booked times as cancelled_by_admin as well
// Also ensure 'completed' bookings are excluded from blocking admin
const adminTimeTakenCheck = `                    for (const b of allBookings) {
                        if (b.date === dateStr && b.status !== 'rejected' && b.status !== 'cancelled' &&
                            (b.venue === venue || b.venueName === venueLabel)) {`;

const adminTimeTakenCheckReplacement = `                    for (const b of allBookings) {
                        if (b.date === dateStr && b.status !== 'rejected' && b.status !== 'cancelled' &&
                            b.status !== 'cancelled_by_admin' && b.status !== 'completed' &&
                            (b.venue === venue || b.venueName === venueLabel)) {`;

adminHtml = adminHtml.replace(adminTimeTakenCheck, adminTimeTakenCheckReplacement);

fs.writeFileSync('admin.html', adminHtml);
console.log('Patched admin.html');
console.log('All patches applied!');
