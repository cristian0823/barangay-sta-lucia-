
            if (!requireAuth()) window.location.href = 'login.html';
            if (!requireAdmin()) window.location.href = 'home.html';

            document.addEventListener('DOMContentLoaded', async function () {
                const user = getCurrentUser();
                document.getElementById('userName').textContent = user.fullName;
                document.getElementById('userAvatar').textContent = user.avatar;
                
                // Run clock immediately  before any awaits
                initWelcomeClock();
                
                // Auto-complete any expired bookings before rendering
                if (typeof autoCompleteExpiredBookings === 'function') await autoCompleteExpiredBookings();

                await loadOverview();
                await loadCourtBookings();
                await loadRequests();
                await loadConcerns();
                await loadEvents();
                await loadEquipment();
                await renderAdminCalendar();
                await loadAdminNotifications();
                
                await loadSystemStatsForProfile();

                // Cross-tab synchronization
                if (typeof appSyncChannel !== 'undefined') {
                    appSyncChannel.addEventListener('message', async (event) => {
                        if (event.data && event.data.type === 'SYNC_NEEDED') {
                            await loadOverview();
                            await loadCourtBookings();
                            await loadEvents();
                            await renderAdminCalendar();
                            const dayModal = document.getElementById('adminDayScheduleModal');
                            if (dayModal && dayModal.style.display !== 'none') {
                                const dateStr = document.getElementById('adsDate').value;
                                const venue = document.getElementById('adsVenue').value;
                                if (dateStr) refreshAdminDaySchedule(dateStr, venue);
                            }
                        }
                    });
                }

                // Profile form
                document.getElementById('profileForm')?.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    const fullName = document.getElementById('fullName').value.trim();
                    const email = document.getElementById('email').value.trim();
                    if (!fullName || !email) { showAlert('Please fill in all fields', 'error'); return; }
                    const result = await updateUserProfile({ fullName, email });
                    showAlert(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        document.getElementById('userName').textContent = fullName;
                        document.getElementById('userAvatar').textContent = fullName.charAt(0).toUpperCase();
                    }
                });

                // Password form
                document.getElementById('passwordForm')?.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    const currentPassword = document.getElementById('currentPassword').value;
                    const newPassword = document.getElementById('newPassword').value;
                    const confirmPassword = document.getElementById('confirmPassword').value;
                    if (!currentPassword || !newPassword || !confirmPassword) { showAlert('Please fill in all password fields', 'error'); return; }
                    if (newPassword !== confirmPassword) { showAlert('New passwords do not match', 'error'); return; }
                    if (newPassword.length < 6) { showAlert('Password must be at least 6 characters', 'error'); return; }
                    const result = await changePassword(currentPassword, newPassword);
                    showAlert(result.message, result.success ? 'success' : 'error');
                    if (result.success) document.getElementById('passwordForm').reset();
                });
            });

            async function loadSystemStatsForProfile() {
                const [users, equipment, borrowings, bookings] = await Promise.all([
                    getAllUsers(), getEquipment(), getAllBorrowings(), getCourtBookings()
                ]);
                document.getElementById('statTotalUsers').textContent = users.length;
                document.getElementById('statRegularUsers').textContent = users.filter(u => u.role === 'user').length;
                document.getElementById('statAdmins').textContent = users.filter(u => u.role === 'admin').length;
                document.getElementById('statEquipmentAdminInfo').textContent = equipment.length;
                document.getElementById('statPendingAdminInfo').textContent = borrowings.filter(b => b.status === 'pending').length;
                document.getElementById('statBookingsAdminInfo').textContent = bookings.filter(b => b.status === 'pending' || b.status === 'approved').length;
                document.getElementById('lastUpdatedInfo').textContent = new Date().toLocaleString();

                const currentUser = getCurrentUser();
                if (currentUser) {
                    document.getElementById('fullName').value = currentUser.fullName || '';
                    document.getElementById('email').value = currentUser.email || '';
                    document.getElementById('username').value = currentUser.username || '';
                }
            }

            // Admin Calendar Variables
            let adminCalendarMonth = new Date().getMonth();
            let adminCalendarYear = new Date().getFullYear();
            let adminSelectedDate = null;

            // Venue selection
            function adminSelectVenue(venue) {
                document.getElementById('adminSelectedVenue').value = venue;
                const basketballBtn = document.getElementById('admin-venue-basketball');
                const multipurposeBtn = document.getElementById('admin-venue-multipurpose');
                const venueDisplay = document.getElementById('adminVenueDisplay');

                if (venue === 'basketball') {
                    basketballBtn.style.cssText = 'padding:10px 24px;border-radius:50px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.3s ease;background:linear-gradient(135deg,#10b981,#059669);color:#fff;box-shadow:0 4px 12px rgba(16,185,129,0.3);';
                    multipurposeBtn.style.cssText = 'padding:10px 24px;border-radius:50px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.3s ease;background:transparent;color:#64748b;';
                    venueDisplay.innerHTML = ' Basketball Court';
                    venueDisplay.style.cssText = 'background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;color:#065f46;padding:12px 20px;border-radius:12px;margin-bottom:20px;text-align:center;font-weight:700;font-size:13px;letter-spacing:0.03em;';
                } else {
                    basketballBtn.style.cssText = 'padding:10px 24px;border-radius:50px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.3s ease;background:transparent;color:#64748b;';
                    multipurposeBtn.style.cssText = 'padding:10px 24px;border-radius:50px;border:none;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.3s ease;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;box-shadow:0 4px 12px rgba(59,130,246,0.3);';
                    venueDisplay.innerHTML = ' Multi-Purpose Hall';
                    venueDisplay.style.cssText = 'background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #bfdbfe;color:#1e3a8a;padding:12px 20px;border-radius:12px;margin-bottom:20px;text-align:center;font-weight:700;font-size:13px;letter-spacing:0.03em;';
                }
                renderAdminCalendar();
            }



            function adminShowBookingForm() {
                const eventForm = document.getElementById('adminSidebarEventForm');
                if (eventForm) eventForm.style.display = 'none';
                document.getElementById('adminBookingForm').style.display = 'block';
                document.getElementById('adminBookingDate').value = adminSelectedDate || '';
            }

            function adminHideBookingForm() {
                document.getElementById('adminBookingForm').style.display = 'none';
                document.getElementById('adminBookingForm').reset();
            }

            function adminShowEventForm() {
                const bookingForm = document.getElementById('adminBookingForm');
                if (bookingForm) bookingForm.style.display = 'none';
                document.getElementById('adminSidebarEventForm').style.display = 'block';
                document.getElementById('adminSidebarEventDate').value = adminSelectedDate || '';
            }

            function adminHideEventForm() {
                document.getElementById('adminSidebarEventForm').style.display = 'none';
                document.getElementById('adminSidebarEventForm').reset();
            }

            document.getElementById('adminSidebarEventForm')?.addEventListener('submit', async function (e) {
                e.preventDefault();
                const venue = document.getElementById('adminSelectedVenue').value;
                const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
                const venueName = venueLabel + ', Barangay Sta. Lucia';

                const eventData = {
                    title: document.getElementById('adminSidebarEventTitle').value,
                    date: document.getElementById('adminSidebarEventDate').value,
                    time: document.getElementById('adminSidebarEventTime').value,
                    end_time: document.getElementById('adminSidebarEventEndTime').value,
                    location: venueName,
                    organizer: document.getElementById('adminSidebarEventOrganizer').value,
                    description: (document.getElementById('adminSidebarEventDesc') || {}).value || '',
                    capacity: parseInt((document.getElementById('adminSidebarEventCapacity') || {}).value || '0') || 0,
                    status: 'approved'
                };

                const result = await createEvent(eventData);
                const msgBox = document.getElementById('adminBookingMessage');
                msgBox.innerHTML = result.success
                    ? '<div class="bg-green-100 text-green-700 p-3 rounded"> Event Created</div>'
                    : '<div class="bg-red-100 text-red-700 p-3 rounded"> ' + result.message + '</div>';

                if (result.success) {
                    adminHideEventForm();
                    await renderAdminCalendar();
                    if (typeof loadEvents === 'function') await loadEvents();

                    // Broadcast email to all residents about the new event
                    try {
                        broadcastEmailToAllResidents(
                            ` New Barangay Event: ${eventData.title}`,
                            `A new barangay event has been scheduled.`,
                            ` ${eventData.location || 'Barangay Sta. Lucia'} |  ${eventData.date}${eventData.time ? ' at ' + eventData.time : ''}${eventData.description ? ' | ' + eventData.description : ''}`
                        );
                    } catch(e) { console.warn('broadcast email failed', e); }

                    // --- Check for conflicting bookings and show warning ---
                    try {
                        const allBookings = await getCourtBookings();
                        const conflicting = allBookings.filter(b =>
                            b.date === eventData.date &&
                            b.status !== 'cancelled' && b.status !== 'rejected' && b.status !== 'admin_cancelled' &&
                            (b.venue === venue || (b.venueName || '').includes(venueLabel))
                        );

                        if (conflicting.length > 0) {
                            let warningHtml = `<div style="margin-top:16px;background:#fffbeb;border:1.5px solid #fde68a;border-radius:14px;padding:16px;">
                                <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:8px;">  ${conflicting.length} existing booking(s) conflict with this event:</div>
                                <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">`;
                            conflicting.forEach(b => {
                                warningHtml += `<div style="font-size:12px;background:#fff;border:1px solid #fde68a;border-radius:8px;padding:8px 10px;color:#78350f;">
                                     <strong>${b.userName || 'Resident'}</strong>  ${b.timeRange || b.time}
                                </div>`;
                            });
                            warningHtml += `</div>
                                <button id="notifyConflictBtn" onclick="notifyConflictingUsers(${JSON.stringify(conflicting).replace(/"/g, '&quot;')}, '${eventData.title.replace(/'/g, "\\'")}')"
                                    style="width:100%;padding:10px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">
                                     Notify All Affected Users
                                </button>
                            </div>`;
                            msgBox.innerHTML += warningHtml;
                        }
                    } catch(err) { console.warn('Conflict check failed:', err); }
                }
            });

            async function notifyConflictingUsers(bookings, eventTitle) {
                const btn = document.getElementById('notifyConflictBtn');
                if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
                try {
                    const available = await isSupabaseAvailable();
                    if (!available) { showAlert('Supabase required to send notifications', 'error'); return; }
                    for (const b of bookings) {
                        const uid = b.userId || b.user_id;
                        if (!uid) continue;
                        
                        // 1. Fully delete the conflicting reservation from the database so it disappears completely
                        await supabase.from('facility_reservations').delete().eq('id', b.id);
                        
                        // 2. Insert notification so the user gets the popup
                        await supabase.from('user_notifications').insert([{
                            user_id: uid,
                            type: 'booking_cancelled',
                            message: `Your Court Reservation on ${b.date} at ${b.venueName || b.venue || 'the venue'} has been cancelled due to an official event: "${eventTitle}". Please reschedule.`,
                            meta: { booking_id: b.id, date: b.date, venue: b.venueName || b.venue, original_time: b.timeRange || b.time || '', event_title: eventTitle },
                            is_read: false
                        }]);
                    }
                    if (btn) { btn.textContent = ' Cancelled & Notified!'; btn.style.background = '#16a34a'; }
                    await logActivity('Event Conflict Managed', `Cancelled and notified ${bookings.length} user(s) due to conflict with event: ${eventTitle}`);
                    
                    // Re-render calendar so the deleted bookings disappear instantly
                    await renderAdminCalendar();
                } catch(err) {
                    if (btn) { btn.textContent = ' Failed'; btn.disabled = false; }
                    console.error('Notify error:', err);
                }
            }

            // Handle admin booking form
            document.getElementById('adminBookingForm')?.addEventListener('submit', async function (e) {
                e.preventDefault();
                const venue = document.getElementById('adminSelectedVenue').value;
                const venueName = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';

                const bookingData = {
                    date: document.getElementById('adminBookingDate').value,
                    time: document.getElementById('adminBookingTime').value,
                    end_time: document.getElementById('adminBookingEndTime').value,
                    purpose: document.getElementById('adminBookingPurpose').value,
                    venue: venue,
                    venueName: venueName
                };

                const result = await bookCourt(bookingData);
                document.getElementById('adminBookingMessage').innerHTML = result.success
                    ? '<div class="bg-green-100 text-green-700 p-3 rounded"> ' + result.message + '</div>'
                    : '<div class="bg-red-100 text-red-700 p-3 rounded"> ' + result.message + '</div>';

                if (result.success) {
                    adminHideBookingForm();
                    await renderAdminCalendar();
                }
            });

            async function renderAdminCalendar() {
                const grid = document.getElementById('adminCalendarGrid');
                const monthTitle = document.getElementById('adminCalendarMonth');
                if (!grid || !monthTitle) return;

                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                monthTitle.textContent = `${months[adminCalendarMonth]} ${adminCalendarYear}`;

                grid.innerHTML = Array(35).fill('<div style="height:50px;border-radius:6px;background:#f1f5f9;animation:pulse 1.5s ease-in-out infinite;"></div>').join('');

                // Fetch data safely
                let eventDates = {}, bookingDates = {};
                let allEvents = [], allBookings = [];
                try {
                    const [_e, _b] = await Promise.all([getEvents(), getCourtBookings()]);
                    allEvents = _e;
                    allBookings = _b;
                    const selectedVenue = (document.getElementById('adminSelectedVenue') || {}).value || 'basketball';
                    
                    // Helper to check if time has passed
                    function isBookingTimePassed(dateStr, timeStr) {
                        const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
                        if (dateStr < todayStr) return true;
                        if (dateStr > todayStr) return false;
                        if (!timeStr) return false;
                        let endTimeStr = timeStr;
                        if (timeStr.includes('-')) {
                            endTimeStr = timeStr.split('-')[1].trim();
                        }
                        const match = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                        if (!match) return false;
                        let h = parseInt(match[1]);
                        let m = parseInt(match[2]);
                        if (match[3].toUpperCase() === 'PM' && h < 12) h += 12;
                        if (match[3].toUpperCase() === 'AM' && h === 12) h = 0;
                        const now = new Date();
                        if (now.getHours() > h) return true;
                        if (now.getHours() === h && now.getMinutes() >= m) return true;
                        return false;
                    }

                    // For EVENTS: only hide if the date is strictly BEFORE today (not time-based)
                    // This ensures today's events always show as violet on the calendar
                    const todayStr = new Date().toLocaleDateString('en-CA');
                    _e.filter(e => e.status === 'approved' && e.date >= todayStr).forEach(e => {
                        eventDates[e.date] = eventDates[e.date] || [];
                        eventDates[e.date].push(e);
                    });
                    // For BOOKINGS: still use time-based check (hide once the slot is over)
                    _b.filter(b => (b.status === 'approved' || b.status === 'pending') && b.venue === selectedVenue && !isBookingTimePassed(b.date, b.time)).forEach(b => {
                        bookingDates[b.date] = bookingDates[b.date] || [];
                        bookingDates[b.date].push(b);
                    });
                } catch (err) {
                    console.warn('Calendar data fetch failed:', err);
                }

                grid.innerHTML = '';

                const firstDay = new Date(adminCalendarYear, adminCalendarMonth, 1).getDay();
                const daysInMonth = new Date(adminCalendarYear, adminCalendarMonth + 1, 0).getDate();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Empty spacer cells
                for (let i = 0; i < firstDay; i++) {
                    const empty = document.createElement('div');
                    grid.appendChild(empty);
                }

                // Day tiles
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${adminCalendarYear}-${String(adminCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dateObj = new Date(adminCalendarYear, adminCalendarMonth, day);

                    const hasEvents = eventDates[dateStr] && eventDates[dateStr].length > 0;
                    const hasBookings = bookingDates[dateStr] && bookingDates[dateStr].length > 0;
                    const isSelected = adminSelectedDate === dateStr;
                    const isToday = dateObj.getTime() === today.getTime();
                    const isPast = dateObj < today;

                    const dayEl = document.createElement('div');
                    dayEl.style.cssText = 'height:50px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;transition:all 0.15s;text-align:center;';

                    let baseClass = '';

                    if (isPast) {
                        baseClass = 'cal-box-past';
                    } else if (hasEvents) {
                        baseClass = 'cal-box-event';
                        dayEl.style.cursor = 'pointer';
                    } else if (hasBookings) {
                        baseClass = 'cal-box-booked';
                        dayEl.style.cursor = 'pointer';
                    } else {
                        baseClass = 'cal-box-available';
                        dayEl.style.cursor = 'pointer';
                    }

                    if (isSelected) {
                        baseClass += ' cal-box-selected';
                    } else if (isToday) {
                        baseClass += ' cal-box-today';
                    }

                    dayEl.className = baseClass;
                    dayEl.textContent = day;

                    if (hasEvents) {
                        dayEl.title = eventDates[dateStr].map(e => {
                            const time = e.end_time ? `${adminFmt12(e.time)} - ${adminFmt12(e.end_time)}` : (e.endTime ? `${adminFmt12(e.time)} - ${adminFmt12(e.endTime)}` : adminFmt12(e.time));
                            return `[${time}] ${e.title}`;
                        }).join('\n');
                        dayEl.onclick = () => adminSelectDate(dateStr);
                    } else if (hasBookings) {
                        dayEl.title = bookingDates[dateStr].map(b => {
                            const time = b.time;
                            const purp = b.purpose || b.venueName || b.venue;
                            return `[${time}] ${purp}`;
                        }).join('\n');
                        dayEl.onclick = () => adminSelectDate(dateStr);
                    } else {
                        dayEl.onclick = () => adminSelectDate(dateStr);
                        dayEl.onmouseover = () => { dayEl.style.opacity = '0.8'; };
                        dayEl.onmouseout = () => { dayEl.style.opacity = '1'; };
                    }

                    grid.appendChild(dayEl);
                }

                // Sort and display all upcoming bookings/events in the right panel
                const rightList = document.getElementById('adminAllBookingsList');
                if (rightList) {
                    const venue = (document.getElementById('adminSelectedVenue') || {}).value || 'basketball';
                    const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
                    const todayStr = `${adminCalendarYear}-${String(adminCalendarMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    
                    const upcomingBooks = allBookings.filter(b => b.date >= todayStr && (b.status === 'approved' || b.status === 'pending') && (b.venue === venue || b.venueName === venueLabel) && !isBookingTimePassed(b.date, b.time));
                    const upcomingEvents = allEvents.filter(e => e.date >= todayStr && e.status === 'approved' && !isBookingTimePassed(e.date, e.time || e.endTime));

                    const combined = [];
                    upcomingBooks.forEach(b => combined.push({ type: 'booking', date: b.date, time: b.time, label: b.userName || 'Resident', sub: b.venueName || b.venue }));
                    upcomingEvents.forEach(e => combined.push({ type: 'event', date: e.date, time: e.time, label: e.title, sub: 'Official Event' }));

                    // Helper for sorting
                    function _timeToMins(t) {
                        if (!t) return 0;
                        const parts = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
                        if (!parts) return 0;
                        let h = parseInt(parts[1], 10);
                        let m = parseInt(parts[2], 10);
                        if (parts[3].toUpperCase() === 'PM' && h < 12) h += 12;
                        if (parts[3].toUpperCase() === 'AM' && h === 12) h = 0;
                        return h * 60 + m;
                    }

                    combined.sort((a, b) => {
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return _timeToMins(a.time) - _timeToMins(b.time);
                    });

                    if (combined.length === 0) {
                        rightList.innerHTML = `<div style="text-align:center;padding:32px 16px;">
                            <div style="font-size:40px;margin-bottom:12px;"></div>
                            <p style="color:var(--text, #1e293b);font-weight:700;font-size:14px;margin:0 0 4px;">All Clear!</p>
                            <p style="color:var(--muted, #94a3b8);font-size:13px;margin:0;">No bookings or events scheduled yet.</p>
                        </div>`;
                    } else {
                        rightList.innerHTML = combined.map(item => {
                            const isEv = item.type === 'event';
                            const dot = isEv ? '' : '';
                            const dateFmt = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            return `<div style="background:var(--panel-bg, #f8fafc);border:1px solid var(--border, #e2e8f0);border-radius:12px;padding:12px;display:flex;gap:12px;align-items:flex-start;">
                                <div style="font-size:16px;line-height:1;margin-top:2px;">${dot}</div>
                                <div>
                                    <div style="font-size:13px;font-weight:700;color:var(--text, #0f172a);margin-bottom:2px;">${item.label}</div>
                                    <div style="font-size:12px;color:var(--muted, #64748b);margin-bottom:4px;">${item.sub}</div>
                                    <div style="font-weight:700;font-size:11px;color:${isEv ? '#a855f7' : '#ef4444'};">${dateFmt}  ${item.time}</div>
                                </div>
                            </div>`;
                        }).join('');
                    }
                }
            }

            function adminSelectDate(dateStr) {
                adminSelectedDate = dateStr;
                renderAdminCalendar();

                // Format and display date for modal
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = new Date(dateStr).toLocaleDateString('en-US', options);

                const actionModal = document.getElementById('adminEventActionModal');
                const actionModalText = document.getElementById('actionModalDateText');
                if(actionModal && actionModalText) {
                    actionModalText.textContent = formattedDate;
                    actionModal.style.display = 'flex';
                }
            }

            function openAdminMassCancelModal() {
                const dayModal = document.getElementById('adminDayScheduleModal');
                if (dayModal) dayModal.style.display = 'none';

                const massCancelModal = document.getElementById('adminMassCancelModal');
                if (massCancelModal) {
                    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                    const formattedDate = new Date(adminSelectedDate).toLocaleDateString('en-US', options);
                    
                    document.getElementById('amcDateText').textContent = formattedDate;
                    document.getElementById('amcEventName').value = '';
                    document.getElementById('amcReason').value = '';
                    
                    massCancelModal.style.display = 'flex';
                }
            }

            async function confirmAdminMassCancel() {
                const eventName = document.getElementById('amcEventName').value.trim();
                const reason = document.getElementById('amcReason').value.trim();
                const btn = document.getElementById('amcConfirmBtn');

                if (!eventName || !reason) {
                    showAlert('Please provide both the Event Name and Reason.', 'error');
                    return;
                }

                btn.disabled = true;
                btn.textContent = 'Cancelling...';

                try {
                    // 1. Fetch using standard global getter to ensure we match what UI sees
                    const allBookings = await getCourtBookings();
                    const dayBookings = allBookings.filter(b => b.date === adminSelectedDate && (b.status === 'approved' || b.status === 'pending'));
                    
                    // 2. Insert the Sudden Event to block the calendar going forward
                    const available = await isSupabaseAvailable();
                    const newEvent = {
                        title: eventName,
                        date: adminSelectedDate,
                        time: '07:00',
                        start_time: '07:00',
                        end_time: '22:00',
                        organizer: 'Barangay Council',
                        location: 'Basketball Court',
                        status: 'approved',
                        created_at: new Date().toISOString()
                    };
                    
                    if (available) {
                        await supabase.from('events').insert([newEvent]);
                        // Broadcast event notification to ALL registered residents
                        try {
                            const { data: allUsers } = await supabase.from('users').select('id').eq('role', 'user');
                            if (allUsers && allUsers.length > 0) {
                                const notifPayloads = allUsers.map(u => ({
                                    user_id: u.id,
                                    type: 'event_added',
                                    message: ` New Barangay Event: "${eventName}" on ${new Date(adminSelectedDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. Court Reservations on this day have been cancelled.`,
                                    meta: { event_title: eventName, date: adminSelectedDate },
                                    is_read: false
                                }));
                                await supabase.from('user_notifications').insert(notifPayloads);
                            }
                        } catch(notifErr) { console.warn('Sudden event notification error:', notifErr); }
                    } else {
                        const evtList = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
                        newEvent.id = Date.now();
                        evtList.push(newEvent);
                        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(evtList));
                    }

                    // 3. For each active booking, soft delete it to bypass RLS DELETE blockers
                    if (dayBookings && dayBookings.length > 0) {
                        for (const b of dayBookings) {
                            const uid = b.userId || b.user_id;
                            
                            // Soft-delete using update since RLS blocks physical admin deletion
                            // Store event name in admin_comment so user dashboard popup can read it
                            if (available) {
                                await supabase.from('facility_reservations').update({ 
                                    status: 'cancelled_by_admin',
                                    admin_comment: eventName
                                }).eq('id', b.id);
                            } else {
                                let localBk = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
                                const idx = localBk.findIndex(x => x.id === b.id);
                                if (idx > -1) {
                                    localBk[idx].status = 'cancelled_by_admin';
                                    localBk[idx].admin_comment = eventName;
                                    localBk[idx].adminComment = eventName;
                                    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(localBk));
                                }
                            }
                            
                            // Dispatch user_notification to trigger the popup logic
                            if (uid) {
                                const notifMsg = `Your Court Reservation on ${b.date} at ${b.venueName || b.venue || 'the venue'} has been cancelled due to a sudden event: "${eventName}". Reason: ${reason} Please choose to reschedule or cancel completely.`;
                                const notifMeta = { booking_id: b.id, date: b.date, venue: b.venueName || b.venue, original_time: b.timeRange || b.time || '', event_title: eventName };
                                if (available) {
                                    await supabase.from('user_notifications').insert([{
                                        user_id: uid,
                                        type: 'booking_cancelled',
                                        message: notifMsg,
                                        meta: notifMeta,
                                        is_read: false
                                    }]);
                                } else {
                                    const localNotifs = JSON.parse(localStorage.getItem('barangay_local_notifications')) || [];
                                    localNotifs.unshift({
                                        id: Date.now() + Math.random(),
                                        userId: String(uid),
                                        type: 'booking_cancelled',
                                        message: notifMsg,
                                        meta: notifMeta,
                                        isRead: false,
                                        createdAt: new Date().toISOString()
                                    });
                                    localStorage.setItem('barangay_local_notifications', JSON.stringify(localNotifs));
                                }
                            }
                        }
                    }

                    await logActivity('Mass Booking Cancelled', `Cancelled ${dayBookings.length} bookings on ${adminSelectedDate} for event: ${eventName}`);

                    // 4. Success cleanup
                    document.getElementById('adminMassCancelModal').style.display = 'none';
                    const successModal = document.getElementById('adminEventSuccessModal');
                    if (successModal) {
                        successModal.querySelector('h3').textContent = 'Bookings Cancelled!';
                        successModal.querySelector('p').textContent = `All bookings were removed, users were notified, and the event "${eventName}" was scheduled.`;
                        successModal.style.display = 'flex';
                    }

                    await renderAdminCalendar();

                } catch (err) {
                    console.error('Mass Cancel Error:', err);
                    showAlert('Failed to cancel bookings. Check console.', 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Cancel All';
                }
            }

            function openAdminCancelBookingsEventFlow() {
                document.getElementById('adminEventActionModal').style.display = 'none';
                
                const modal = document.getElementById('adminDayScheduleModal');
                const formWrap = document.getElementById('adsEventFormWrap');
                const form = document.getElementById('adsEventForm');
                const btn = document.getElementById('adsToggleFormBtn');
                
                if (modal) modal.style.display = 'flex';
                if (form) form.dataset.massCancel = 'true';
                if (formWrap) formWrap.style.display = 'block';
                if (btn) btn.innerHTML = '<span> Hide Form (Cancelling Bookings)</span>';
                
                const dateInput = document.getElementById('adsDate');
                if (dateInput) dateInput.value = adminSelectedDate;
                
                if (typeof refreshAdminDaySchedule === 'function') {
                    refreshAdminDaySchedule(adminSelectedDate, (document.getElementById('adminSelectedVenue') || {}).value || 'basketball');
                }
            }

            function openAdminJustAddEventFlow() {
                document.getElementById('adminEventActionModal').style.display = 'none';
                
                const modal = document.getElementById('adminDayScheduleModal');
                const formWrap = document.getElementById('adsEventFormWrap');
                const form = document.getElementById('adsEventForm');
                const btn = document.getElementById('adsToggleFormBtn');
                
                if (modal) modal.style.display = 'flex';
                if (form) form.dataset.massCancel = 'false';
                if (formWrap) formWrap.style.display = 'block';
                if (btn) btn.innerHTML = '<span> Hide Form</span>';
                
                const dateInput = document.getElementById('adsDate');
                if (dateInput) dateInput.value = adminSelectedDate;
                
                if (typeof refreshAdminDaySchedule === 'function') {
                    refreshAdminDaySchedule(adminSelectedDate, (document.getElementById('adminSelectedVenue') || {}).value || 'basketball');
                }
            }

            function adminHideEventForm() {
                adminSelectedDate = null;
                renderAdminCalendar();
                const emptyState = document.getElementById('adminEventEmptyState');
                const form = document.getElementById('adminSidebarEventForm');
                if (emptyState && form) {
                    emptyState.style.display = 'flex';
                    form.style.display = 'none';
                    form.reset();
                }
            }

            window.jumpToToday = async function() {
                const now = new Date();
                adminCalendarMonth = now.getMonth();
                adminCalendarYear = now.getFullYear();
                await renderAdminCalendar();
            }

            async function changeAdminMonth(delta) {
                adminCalendarMonth += delta;
                if (adminCalendarMonth > 11) {
                    adminCalendarMonth = 0;
                    adminCalendarYear++;
                } else if (adminCalendarMonth < 0) {
                    adminCalendarMonth = 11;
                    adminCalendarYear--;
                }
                await renderAdminCalendar();
            }

            function switchSection(section, btn) {
                document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
                if (btn) btn.classList.add('active');
                const allSections = ['overview', 'court-bookings', 'multipurpose-bookings', 'requests', 'concerns', 'events', 'equipment', 'users', 'reports', 'audit-log', 'security-log', 'profile', 'system'];
                allSections.forEach(s => {
                    const el = document.getElementById(s + '-section');
                    if (el) el.style.display = 'none';
                });
                var targetSection = document.getElementById(section + '-section');
                if (targetSection) targetSection.style.display = 'block';
                // Auto-load section data on switch
                if (section === 'audit-log', 'security-log') loadActivityLog();
                if (section === 'reports') loadSimpleReport();
                if (section === 'users') loadUsers();
                if (section === 'equipment') loadEquipment();
                if (section === 'requests') loadRequests();
                if (section === 'concerns') loadConcerns();
                if (section === 'court-bookings') {
                    loadAdminBookings();
                    startBookingPolling();
                } else if (section === 'multipurpose-bookings') {
                    loadMultipurposeBookings();
                    startBookingPolling();
                } else {
                    stopBookingPolling();
                }
                if (section === 'events') { renderAdminCalendar(); }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            async function loadStats() {
                const [borrowings, concerns, events, bookings, users] = await Promise.all([
                    getAllBorrowings(),
                    getAllConcerns(),
                    getEvents(),
                    getCourtBookings(),
                    getAllUsers()
                ]);

                const pendingReqs = borrowings.filter(b => b.status === 'pending');
                const pendingCons = concerns.filter(c => c.status === 'pending');
                const upcomingEvts = events.filter(e => e.status === 'approved').length;
                const totalBookings = bookings.filter(b => b.status === 'pending' || b.status === 'approved').length;

                document.getElementById('pendingRequests').textContent = pendingReqs.length;
                document.getElementById('pendingConcerns').textContent = pendingCons.length;
                document.getElementById('upcomingEvents').textContent = totalBookings;
                document.getElementById('totalUsers').textContent = users.filter(u => u.role !== 'admin').length;

                const badge = document.getElementById('notificationBadge');
                const total = pendingReqs.length + pendingCons.length;
                badge.setAttribute('data-count', total);
                badge.style.display = total > 0 ? 'flex' : 'none';

                // Populate Dropdown
                populateNotificationDropdown(pendingReqs, pendingCons);
            }

            function toggleNotificationDropdown(e) {
                if (e) e.stopPropagation();
                const dropdown = document.getElementById('notificationDropdown');

                if (dropdown.style.display === 'flex') {
                    dropdown.style.display = 'none';
                } else {
                    dropdown.style.display = 'flex';
                }
            }

            // Close notification dropdown when clicking outside
            document.addEventListener('click', function (event) {
                const dropdown = document.getElementById('notificationDropdown');
                const badge = document.getElementById('notificationBadge');
                if (dropdown && dropdown.style.display === 'flex') {
                    if (!dropdown.contains(event.target) && event.target !== badge && !badge.contains(event.target)) {
                        dropdown.style.display = 'none';
                    }
                }
            });

            function populateNotificationDropdown(pendingReqs, pendingCons) {
                const body = document.getElementById('notificationDropdownBody');
                if (!body) return;

                let notifications = [];

                pendingReqs.forEach(req => {
                    const date = new Date(req.created_at || req.createdAt || new Date());
                    notifications.push({
                        type: 'request',
                        icon: '',
                        title: `New Borrowing Request`,
                        detail: `${req.userName || req.user_name || 'Resident'} requested ${req.quantity}x ${req.equipment}`,
                        time: date,
                        action: () => switchSection('requests', document.querySelectorAll('.sidebar-btn')[2])
                    });
                });

                pendingCons.forEach(con => {
                    const date = new Date(con.createdAt || new Date());
                    notifications.push({
                        type: 'concern',
                        icon: '',
                        title: `New Citizen Concern`,
                        detail: `[${con.category}] ${con.title}`,
                        time: date,
                        action: () => switchSection('concerns', document.querySelectorAll('.sidebar-btn')[3])
                    });
                });

                // Sort by newest first
                notifications.sort((a, b) => b.time - a.time);

                if (notifications.length === 0) {
                    body.innerHTML = `
                        <div class="notification-dropdown-empty">
                            <span style="font-size:24px;"></span>
                            <span>No new notifications</span>
                        </div>
                    `;
                    return;
                }

                body.innerHTML = notifications.map(n => `
                    <div class="notification-item unread" onclick="handleNotificationClick(event, ${notifications.indexOf(n)})">
                        <div class="notif-icon-wrap ${n.type}">${n.icon}</div>
                        <div class="notif-content">
                            <span class="notif-title">${n.title}</span>
                            <span style="font-size:12px;color:var(--text);">${n.detail}</span>
                            <span class="notif-time">${getTimeAgo(n.time)}</span>
                        </div>
                    </div>
                `).join('');

                // Store actions temporarily (hacky but works for vanilla JS without heavy scoping)
                window._currentNotificationActions = notifications.map(n => n.action);
            }

            window.handleNotificationClick = function (e, index) {
                e.stopPropagation();
                document.getElementById('notificationDropdown').style.display = 'none';
                if (window._currentNotificationActions && window._currentNotificationActions[index]) {
                    window._currentNotificationActions[index]();
                }
            };

            function getTimeAgo(date) {
                const seconds = Math.floor((new Date() - date) / 1000);
                if (seconds < 60) return 'Just now';
                const minutes = Math.floor(seconds / 60);
                if (minutes < 60) return minutes + 'm ago';
                const hours = Math.floor(minutes / 60);
                if (hours < 24) return hours + 'h ago';
                const days = Math.floor(hours / 24);
                return days + 'd ago';
            }

            //  Activity Log Filter State 
            let _allActivityLogs = [];


            // ═══ PAGINATION ENGINE ══════════════════════════════════════════
            const PG_SIZE = 8;
            let _pgUsersPage = 1, _pgUsersList = [];
            let _pgConcernsPage = 1, _pgConcernsList = [], _pgConcernFilter = 'all';
            let _pgReqPage = 1, _pgReqList = [];
            let _pgCourtPage = 1, _pgCourtList = [];
            let _pgMpPage = 1, _pgMpList = [];
            let _pgActivityPage = 1;

            function renderPg(containerId, total, perPage, page, cbName) {
                const el = document.getElementById(containerId);
                if (!el) return;
                const totalPages = Math.ceil(total / perPage);
                if (totalPages <= 1) { el.style.display = 'none'; return; }
                el.style.display = 'flex';
                const s = (page - 1) * perPage + 1;
                const e = Math.min(page * perPage, total);
                let btns = '';
                for (let p = 1; p <= totalPages; p++) {
                    if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - page) > 1) {
                        if (p === 3 || p === totalPages - 2) btns += '<span style="color:var(--muted,#9ca3af);padding:0 4px;">…</span>';
                        continue;
                    }
                    btns += '<button class="pg-btn' + (p === page ? ' pg-active' : '') + '" onclick="' + cbName + '(' + p + ')">' + p + '</button>';
                }
                el.innerHTML = '<span class="pg-info">Showing ' + s + '–' + e + ' of ' + total + '</span>'
                    + '<div class="pg-btns"><button class="pg-btn" onclick="' + cbName + '(' + (page - 1) + ')"' + (page <= 1 ? ' disabled' : '') + '>‹</button>' + btns + '<button class="pg-btn" onclick="' + cbName + '(' + (page + 1) + ')"' + (page >= totalPages ? ' disabled' : '') + '>›</button></div>';
            }

            // ── Users ─────────────────────────────────────────────────────────
            function gotoUsersPage(p) { _pgUsersPage = p; renderUsersPagePg(); }
            function renderUsersPagePg() {
                const tbody = document.getElementById('usersTable');
                const empty = document.getElementById('noUsers');
                if (!tbody) return;
                if (!_pgUsersList.length) { tbody.innerHTML = ''; if(empty) empty.style.display='block'; const pg=document.getElementById('usersPg'); if(pg) pg.style.display='none'; return; }
                if(empty) empty.style.display='none';
                const slice = _pgUsersList.slice((_pgUsersPage-1)*PG_SIZE, _pgUsersPage*PG_SIZE);
                tbody.innerHTML = slice.map(u => {
                    const n = u.fullName||u.full_name||u.username||'';
                    const ph = u.phone||u.contact_number||u.contactNumber||'';
                    return '<tr><td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">'+(u.barangay_id||'')+'</td>'
                        +'<td style="white-space:nowrap;"><strong>'+n+'</strong></td>'
                        +'<td style="font-size:13px;">'+ph+'</td>'
                        +'<td style="font-size:13px;color:#6b7280;">'+(u.email||'')+'</td>'
                        +'<td style="font-size:12px;">'+(u.address||'')+'</td></tr>';
                }).join('');
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');
            }

            // ── Concerns ─────────────────────────────────────────────────────
            function applyConcernFilter() { _pgConcernFilter = document.getElementById('concernStatusFilter')?.value||'all'; _pgConcernsPage=1; renderConcernsPg(); }
            function gotoConcernsPage(p) { _pgConcernsPage = p; renderConcernsPg(); }
            function renderConcernsPg() {
                const tbody = document.getElementById('concernsTable');
                if (!tbody) return;
                const sc = { open:{bg:'#fef9c3',c:'#854d0e'}, 'in-progress':{bg:'#dbeafe',c:'#1e40af'}, 'in_progress':{bg:'#dbeafe',c:'#1e40af'}, resolved:{bg:'#dcfce7',c:'#166534'}, closed:{bg:'#f1f5f9',c:'#475569'} };
                let list = _pgConcernFilter==='all' ? [..._pgConcernsList] : _pgConcernsList.filter(c=>c.status===_pgConcernFilter);
                if (!list.length) { tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af;">No concerns found</td></tr>'; const pg=document.getElementById('concernsPg'); if(pg) pg.style.display='none'; return; }
                const slice = list.slice((_pgConcernsPage-1)*PG_SIZE, _pgConcernsPage*PG_SIZE);
                tbody.innerHTML = slice.map(c => {
                    const s = sc[c.status]||{bg:'#f1f5f9',c:'#374151'};
                    const badge='<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:'+s.bg+';color:'+s.c+';">'+(c.status||'')+'</span>';
                    const dt = c.createdAt||c.created_at ? new Date(c.createdAt||c.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '';
                    const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '';
                    const dot = !c.adminRead ? '<span style="display:inline-block;width:8px;height:8px;background:#ef4444;border-radius:50%;margin-right:5px;vertical-align:middle;"></span>' : '';
                    const resp = c.response ? '<div style="margin-top:3px;font-size:11px;color:#059669;font-style:italic;">✓ Replied</div>' : '';
                    const img = (c.description&&c.description.includes('[ATTACHED_IMAGE_DATA]'))||c.imageUrl ? '<span style="margin-left:5px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:20px;font-weight:700;">📷 Photo</span>' : '';
                    return '<tr data-cid="'+c.id+'" onclick="openConcernRespond('+c.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'rgba(16,185,129,0.06)\'" onmouseout="this.style.background=\'\'">'
                        +'<td><div style="line-height:1.3;">'+dot+'<strong>'+(c.userName||'')+'</strong><br><small style="color:#6b7280;font-size:11px;">'+dt+'</small></div></td>'
                        +'<td style="font-size:12px;color:#6b7280;">'+(c.address||'')+'</td>'
                        +'<td>'+(c.category||'')+'</td>'
                        +'<td>'+(c.title||'')+resp+img+'</td>'
                        +'<td style="font-size:12px;">'+date+'</td>'
                        +'<td>'+badge+'</td>'
                        +'<td><button class="btn btn-small btn-primary" onclick="event.stopPropagation();openConcernRespond('+c.id+')">Respond</button></td>'
                        +'</tr>';
                }).join('');
                renderPg('concernsPg', list.length, PG_SIZE, _pgConcernsPage, 'gotoConcernsPage');
            }

            // ── Equipment Requests ────────────────────────────────────────────
            function gotoRequestsPage(p) { _pgReqPage=p; renderReqPg(); }
            function renderReqPg() {
                const tbody = document.getElementById('requestsTable');
                const noEl = document.getElementById('noRequests');
                if (!tbody) return;
                if (!_pgReqList.length) { tbody.innerHTML=''; if(noEl) noEl.style.display='block'; const pg=document.getElementById('requestsPg'); if(pg) pg.style.display='none'; return; }
                if(noEl) noEl.style.display='none';
                const slice = _pgReqList.slice((_pgReqPage-1)*PG_SIZE, _pgReqPage*PG_SIZE);
                tbody.innerHTML = slice.map(b => {
                    const dt = b.created_at||b.createdAt ? new Date(b.created_at||b.createdAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : 'Unknown';
                    const rd = '<div style="line-height:1.2;"><strong>'+(b.userName||b.user_name||'')+'</strong><br><small style="color:#6b7280;font-size:11px;">'+dt+'</small></div>';
                    return '<tr data-req-id="'+b.id+'" onclick="openRequestRespond('+b.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'rgba(16,185,129,0.06)\'" onmouseout="this.style.background=\'\'">'
                        +'<td>'+rd+'</td>'
                        +'<td><strong style="color:var(--text);">'+(b.equipment||'')+'</strong></td>'
                        +'<td style="font-weight:bold;color:var(--text);">'+(b.quantity||1)+'</td>'
                        +'<td style="white-space:nowrap;color:var(--muted);">'+(b.borrowDate||'')+'<br>to '+(b.returnDate||'')+'</td>'
                        +'<td style="color:var(--text);">'+(b.purpose||'')+'</td>'
                        +'<td>'+getStatusBadge(b.status)+'</td></tr>';
                }).join('');
                renderPg('requestsPg', _pgReqList.length, PG_SIZE, _pgReqPage, 'gotoRequestsPage');
            }

            // ── Court Bookings ────────────────────────────────────────────────
            function gotoCourtPage(p) { _pgCourtPage=p; renderCourtPg(); }
            function renderCourtPg() {
                const tbody = document.getElementById('courtBookingsTable');
                const empty = document.getElementById('noCourtBookings');
                if (!tbody) return;
                if (!_pgCourtList.length) { tbody.innerHTML=''; if(empty) empty.style.display='block'; const pg=document.getElementById('courtBookingsPg'); if(pg) pg.style.display='none'; return; }
                if(empty) empty.style.display='none';
                const sC = { pending:{bg:'#fef9c3',c:'#854d0e'}, approved:{bg:'#dcfce7',c:'#166534'}, booked:{bg:'#dcfce7',c:'#166534'}, rejected:{bg:'#fee2e2',c:'#991b1b'}, cancelled:{bg:'#f1f5f9',c:'#475569'} };
                const slice = _pgCourtList.slice((_pgCourtPage-1)*PG_SIZE, _pgCourtPage*PG_SIZE);
                tbody.innerHTML = slice.map(b => {
                    const s = sC[b.status]||{bg:'#f1f5f9',c:'#374151'};
                    const badge='<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:'+s.bg+';color:'+s.c+';">'+b.status+'</span>';
                    const dt = b.created_at||b.createdAt ? new Date(b.created_at||b.createdAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '';
                    return '<tr data-bid="'+b.id+'" onclick="openBookingRespond('+b.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'rgba(16,185,129,0.06)\'" onmouseout="this.style.background=\'\'">'
                        +'<td>'+(b.userName||b.user_name||b.username||'')+'</td>'
                        +'<td>'+(b.venueName||b.venue_name||(b.venue==='basketball'?'Basketball Court':'Multi-Purpose Hall')||'')+'</td>'
                        +'<td>'+(b.date||'')+'</td>'
                        +'<td style="font-size:12px;">'+(b.timeRange||b.time||'')+'</td>'
                        +'<td style="font-size:12px;">'+(b.purpose||'')+'</td>'
                        +'<td>'+badge+'</td>'
                        +'<td style="font-size:12px;">'+dt+'</td></tr>';
                }).join('');
                renderPg('courtBookingsPg', _pgCourtList.length, PG_SIZE, _pgCourtPage, 'gotoCourtPage');
            }

            // ── Multi-Purpose ─────────────────────────────────────────────────
            function gotoMpPage(p) { _pgMpPage=p; renderMpPg(); }
            function renderMpPg() {
                const tbody = document.getElementById('multipurposeBookingsTable');
                const empty = document.getElementById('noMultipurposeBookings');
                if (!tbody) return;
                if (!_pgMpList.length) { tbody.innerHTML=''; if(empty) empty.style.display='block'; const pg=document.getElementById('multipurposePg'); if(pg) pg.style.display='none'; return; }
                if(empty) empty.style.display='none';
                const sC = { pending:{bg:'#fef9c3',c:'#854d0e'}, approved:{bg:'#dcfce7',c:'#166534'}, booked:{bg:'#dcfce7',c:'#166534'}, rejected:{bg:'#fee2e2',c:'#991b1b'}, cancelled:{bg:'#f1f5f9',c:'#475569'} };
                const slice = _pgMpList.slice((_pgMpPage-1)*PG_SIZE, _pgMpPage*PG_SIZE);
                tbody.innerHTML = slice.map(b => {
                    const s = sC[b.status]||{bg:'#f1f5f9',c:'#374151'};
                    const badge='<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:'+s.bg+';color:'+s.c+';">'+b.status+'</span>';
                    const nm=b.userName||b.user_name||b.username||'Unknown';
                    const dt=b.created_at||b.createdAt ? new Date(b.created_at||b.createdAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : '';
                    const rd='<div style="line-height:1.2;"><strong>'+nm+'</strong><br><small style="color:#6b7280;font-size:11px;">'+dt+'</small></div>';
                    return '<tr data-bid="'+b.id+'" onclick="openBookingRespond('+b.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'rgba(16,185,129,0.06)\'" onmouseout="this.style.background=\'\'">'
                        +'<td>'+rd+'</td>'
                        +'<td style="color:var(--text);">'+(b.date||'')+'</td>'
                        +'<td style="color:var(--text);">'+(b.timeRange||b.time||'')+'</td>'
                        +'<td style="color:var(--text);">'+(b.purpose||'')+'</td>'
                        +'<td>'+badge+'</td></tr>';
                }).join('');
                renderPg('multipurposePg', _pgMpList.length, PG_SIZE, _pgMpPage, 'gotoMpPage');
            }

            // ── Activity Log ──────────────────────────────────────────────────
            function gotoActivityPage(p) { _pgActivityPage=p; renderActivityTable(); }

            let _activeLogFilter = 'all';

            const LOG_FILTER_KEYWORDS = {
                inventory: ['Inventory Update', 'Equipment Added', 'Equipment'],
                requests: ['Borrow Request', 'Borrow Approved', 'Borrow Rejected', 'Borrow Returned', 'Borrow Cancelled'],
                bookings: ['Court Reservation'],
                concerns: ['Concern Submitted', 'Concern Updated', 'Concern Deleted'],
            };

            function setLogFilter(filter) {
                _activeLogFilter = filter;
                ['all', 'inventory', 'requests', 'bookings', 'concerns'].forEach(f => {
                    const btn = document.getElementById('logFilter-' + f);
                    if (!btn) return;
                    if (f === filter) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                renderActivityTable();
            }

            function clearLogFilters() {
                const searchInput = document.getElementById('logSearchInput');
                if (searchInput) searchInput.value = '';
                setLogFilter('all');
            }

            function renderActivityTable() {
                const tbody = document.getElementById('activityLogTable');
                const emptyState = document.getElementById('noActivityLog');
                const search = (document.getElementById('logSearchInput')?.value || '').toLowerCase();

                let filtered = _allActivityLogs;

                if (_activeLogFilter !== 'all') {
                    const kws = LOG_FILTER_KEYWORDS[_activeLogFilter] || [];
                    filtered = filtered.filter(log => kws.some(kw => log.action.includes(kw)));
                }

                if (search) {
                    filtered = filtered.filter(log =>
                        (log.action || '').toLowerCase().includes(search) ||
                        (log.details || '').toLowerCase().includes(search) ||
                        (log.adminUsername || '').toLowerCase().includes(search)
                    );
                }

                if (filtered.length === 0) {
                    tbody.innerHTML = '';
                    if (emptyState) emptyState.style.display = 'block';
                    return;
                }
                if (emptyState) emptyState.style.display = 'none';

                const _pgActivityTotal = filtered.length;
                filtered = filtered.slice((_pgActivityPage-1)*PG_SIZE, _pgActivityPage*PG_SIZE);
                tbody.innerHTML = filtered.map(log => {
                    const dt = new Date(log.createdAt);
                    const dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                    let badgeClass = 'badge-muted';
                    if (log.action.includes('Deleted') || log.action.includes('Rejected') || log.action.includes('Cancelled')) {
                        badgeClass = 'badge-danger';
                    } else if (log.action.includes('Submitted') || log.action.includes('Approved') || log.action.includes('Returned') || log.action.includes('Confirmed') || log.action.includes('Registered')) {
                        badgeClass = 'badge-success';
                    } else if (log.action.includes('Updated') || log.action.includes('Inventory')) {
                        badgeClass = 'badge-primary';
                    } else if (log.action.includes('Request') || log.action.includes('Booking')) {
                        badgeClass = 'badge-warning';
                    }

                    return `<tr>
                        <td data-label="Date & Time"><div class="date-cell"><span class="date-main">${dateStr}</span><span class="time-sub">${timeStr}</span></div></td>
                        <td data-label="User / Admin" style="text-align:center;"><div style="display:flex;align-items:center;justify-content:center;gap:8px;"><div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${(log.adminUsername||'S').charAt(0).toUpperCase()}</div><strong style="font-size:13px;">${log.adminUsername || 'System'}</strong></div></td>
                        <td data-label="Action" style="text-align: center;"><span class="status-badge ${badgeClass}">${log.action}</span></td>
                        <td data-label="Details" style="text-align: right; max-width:320px;font-size:12px;color:#6b7280;">${log.details || ''}</td>
                    </tr>`;
                }).join('');
                renderPg('activityLogPg', (_pgActivityTotal||0), PG_SIZE, _pgActivityPage, 'gotoActivityPage');
            }

            async function loadActivityLog() {
                const tbody = document.getElementById('activityLogTable');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#9ca3af;">Loading...</td></tr>';
                try {
                    _allActivityLogs = await getActivityLog();
                    renderActivityTable();
                } catch (err) {
                    console.error('Error loading activity log:', err);
                    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#ef4444;">Error loading logs</td></tr>';
                }
            }

            async function loadUsers() {
                const tbody = document.getElementById('usersTable');
                const emptyState = document.getElementById('noUsers');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#9ca3af;">Loading...</td></tr>';
                let users = await getAllUsers();
                users = users.filter(u => u.role !== 'admin');

                if (users.length === 0) {
                    tbody.innerHTML = '';
                    if (emptyState) emptyState.style.display = 'block';
                    return;
                }
                if (emptyState) emptyState.style.display = 'none';
                _pgUsersList = users;
                _pgUsersPage = 1;
                tbody.innerHTML = users.map(u => {
                    const isSuspended = u.suspended_until && new Date(u.suspended_until) > new Date();
                    const statusBadge = isSuspended
                        ? '<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;">Suspended</span>'
                        : '<span style="background:#d1fae5;color:#059669;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;">Active</span>';
                    const displayName = u.fullName || u.full_name || u.username;
                    const phone = u.phone || u.contact_number || u.contactNumber || '';
                    const address = u.address || '';
                    return `<tr>
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">${u.barangay_id || ''}</td>
                        <td style="white-space:nowrap;"><strong>${displayName}</strong></td>
                        <td style="font-size:13px;">${phone}</td>
                        <td style="font-size:13px;color:#6b7280;">${u.email || ''}</td>
                        <td style="font-size:12px;">${address}</td>
                    </tr>`;
                }).join('');
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');
            }

            //  BATCH UPLOAD FUNCTIONS 
            let _batchRows = [];

            function handleBatchFileDrop(e) {
                const file = e.dataTransfer.files[0];
                if (file) previewBatchFile(file);
            }

            function normalizeHeaders(headers) {
                const map = {};
                headers.forEach((h, i) => {
                    const key = h.trim().toLowerCase().replace(/\s+/g, '_');
                    // Accept common variations
                    if (key === 'barangay_id' || key === 'brgy_id' || key === 'id') map.barangay_id = i;
                    else if (key === 'full_name' || key === 'fullname' || key === 'name') map.full_name = i;
                    else if (key === 'email' || key === 'email_address') map.email = i;
                    else if (key === 'phone' || key === 'contact' || key === 'mobile' || key === 'phone_number') map.phone = i;
                    else if (key === 'address' || key === 'home_address') map.address = i;
                });
                return map;
            }

            function renderBatchPreview(rows) {
                _batchRows = rows;
                const previewBody = document.getElementById('batchPreviewRows');
                previewBody.innerHTML = rows.map(r => `<tr>
                    <td style="font-size:12px;">${r.barangay_id || ''}</td>
                    <td style="font-size:12px;">${r.full_name || ''}</td>
                    <td style="font-size:12px;">${r.email || ''}</td>
                    <td style="font-size:12px;">${r.phone || ''}</td>
                    <td style="font-size:12px;">${r.address || ''}</td>
                </tr>`).join('');
                document.getElementById('batchPreview').style.display = rows.length > 0 ? 'block' : 'none';
                document.getElementById('batchRowCount').textContent = `(${rows.length} residents)`;
                document.getElementById('batchUploadBtn').disabled = rows.length === 0;
                document.getElementById('batchUploadResult').style.display = 'none';
            }

            function previewBatchFile(file) {
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                        const ws = wb.Sheets[wb.SheetNames[0]];
                        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                        
                        if (raw.length < 2) { 
                            showAlert('File is empty or has no data rows beneath the headers.', 'error'); 
                            return; 
                        }
                        
                        const headers = raw[0].map(h => String(h));
                        const colMap = normalizeHeaders(headers);
                        
                        if (colMap.barangay_id === undefined) {
                            showAlert('Error: Missing required column "barangay_id" or "Barangay ID".', 'error');
                            return;
                        }
                        if (colMap.full_name === undefined) {
                            showAlert('Error: Missing required column "full_name" or "Full Name".', 'error');
                            return;
                        }

                        const rows = [];
                        for (let i = 1; i < raw.length; i++) {
                            const cells = raw[i];
                            if (!cells || cells.length === 0 || cells.every(c => c === '')) continue;
                            
                            const bId = String(cells[colMap.barangay_id] ?? '').trim();
                            const fname = String(cells[colMap.full_name] ?? '').trim();
                            
                            if (!bId && !fname) continue;

                            rows.push({
                                barangay_id: bId,
                                full_name:   fname,
                                email:       colMap.email !== undefined ? String(cells[colMap.email] ?? '').trim() : '',
                                phone:       colMap.phone !== undefined ? String(cells[colMap.phone] ?? '').trim() : '',
                                address:     colMap.address !== undefined ? String(cells[colMap.address] ?? '').trim() : ''
                            });
                        }
                        
                        if (rows.length === 0) {
                            showAlert('No valid data rows found. Check your file format.', 'warning');
                            return;
                        }
                        
                        renderBatchPreview(rows);
                    } catch(err) { 
                        showAlert('Failed to read file: ' + err.message, 'error'); 
                    }
                };
                reader.readAsArrayBuffer(file);
            }

            // Keep legacy name working (used by ondrop)
            function previewBatchCSV(file) { previewBatchFile(file); }

            async function submitBatchUpload() {
                if (_batchRows.length === 0) return;
                const btn = document.getElementById('batchUploadBtn');
                const resultBox = document.getElementById('batchUploadResult');
                btn.disabled = true;
                btn.textContent = 'Uploading...';
                try {
                    const supabaseAvail = await isSupabaseAvailable();
                    let inserted = 0, skipped = 0;
                    for (const row of _batchRows) {
                        if (!row.barangay_id || !row.full_name) { skipped++; continue; }
                        const payload = {
                            barangay_id: row.barangay_id,
                            full_name: row.full_name,
                            username: row.barangay_id,
                            email: row.email || null,
                            phone: row.phone || null,
                            address: row.address || null,
                            role: 'user',
                            password: 'resident_no_pwd'
                        };
                        if (supabaseAvail) {
                            const { error } = await supabase.from('users').upsert([payload], { onConflict: 'barangay_id' });
                            if (!error) inserted++; else skipped++;
                        } else {
                            const localUsers = JSON.parse(localStorage.getItem('barangay_users') || '[]');
                            const exists = localUsers.find(u => u.barangay_id === row.barangay_id);
                            if (!exists) { localUsers.push({...payload, id: Date.now() + Math.random()}); localStorage.setItem('barangay_users', JSON.stringify(localUsers)); inserted++; }
                            else skipped++;
                        }
                    }
                    resultBox.style.display = 'block';
                    resultBox.style.background = '#f0fdf4';
                    resultBox.style.color = '#16a34a';
                    resultBox.style.border = '1px solid #bbf7d0';
                    resultBox.textContent = ` Done! ${inserted} resident(s) uploaded. ${skipped > 0 ? skipped + ' skipped (duplicate or missing data).' : ''}`;
                    btn.textContent = 'Upload Residents';
                    logActivity('Batch Upload', `Admin uploaded ${inserted} residents via CSV.`);
                    setTimeout(() => { 
                        loadUsers(); 
                        document.getElementById('batchUploadModal').classList.remove('active');
                        resetBatchUpload();
                    }, 2000);
                } catch(err) {
                    resultBox.style.display = 'block';
                    resultBox.style.background = '#fef2f2';
                    resultBox.style.color = '#dc2626';
                    resultBox.style.border = '1px solid #fecaca';
                    resultBox.textContent = ' Upload failed: ' + err.message;
                    btn.disabled = false;
                    btn.textContent = 'Upload Residents';
                }
            }

            function resetBatchUpload() {
                _batchRows = [];
                document.getElementById('batchPreview').style.display = 'none';
                document.getElementById('batchUploadResult').style.display = 'none';
                document.getElementById('batchUploadBtn').disabled = true;
                document.getElementById('batchFileInput').value = '';
                document.getElementById('batchUploadBtn').textContent = 'Upload Residents';
            }


            function openSuspendModal(userId, username, offenseCount) {
                currentSuspendUserId = userId;
                document.getElementById('suspendModalUsername').textContent = username;
                document.getElementById('suspendModalOffensesCount').textContent = offenseCount || 0;
                
                const selectElement = document.getElementById('suspendPenaltyTier');
                let value = parseInt(offenseCount || 0) + 1;
                if (value > 4) value = 4;
                selectElement.value = value;
                
                document.getElementById('adminSuspendUserModal').style.display = 'flex';
            }

            function closeSuspendModal() {
                currentSuspendUserId = null;
                document.getElementById('adminSuspendUserModal').style.display = 'none';
            }

            async function confirmSuspendUser() {
                if (!currentSuspendUserId) return;
                const tier = document.getElementById('suspendPenaltyTier').value;
                let days = 0;
                if (tier == "1") days = 7;
                else if (tier == "2") days = 14;
                else if (tier == "3") days = 30;
                else if (tier == "4") {
                    closeSuspendModal();
                    await adminDeleteUserConfirm(currentSuspendUserId, document.getElementById('suspendModalUsername').textContent);
                    return;
                }
                
                document.getElementById('adminSuspendUserModal').style.display = 'none';
                const result = await suspendUser(currentSuspendUserId, days);
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    loadUsers(); 
                }
            }

            async function liftSuspension(userId, username) {
                if (!await showConfirmModal(`Remove the suspension for "${username}"? They will be able to log in immediately.`, 'Lift Suspension', 'Yes, Lift Ban', 'Cancel', 'info')) return;
                try {
                    const { error } = await supabase
                        .from('users')
                        .update({ suspended_until: null })
                        .eq('id', userId);
                    if (error) throw error;
                    await logActivity('Suspension Lifted', `Admin lifted suspension for user: ${username}`);
                    showAlert(`Suspension for "${username}" has been removed.`, 'success');
                    loadUsers();
                } catch (err) {
                    showAlert('Failed to lift suspension: ' + err.message, 'error');
                }
            }

            async function adminDeleteUserConfirm(userId, username) {
                if (!await showConfirmModal(`Delete user "${username}"? This cannot be undone.`, "Delete User", "Yes, Delete", "Cancel", "danger")) return;
                const result = await deleteUser(userId);
                showAlert(result.message, result.success ? 'success' : 'error');
                if (result.success) { loadUsers(); loadStats(); }
            }

            async function openUserProfileModal(userId) {
                const users = await getAllUsers();
                const u = users.find(x => x.id === userId);
                if (!u) return;

                document.getElementById('upmName').textContent = u.fullName || u.username || 'Unknown';
                document.getElementById('upmEmail').textContent = u.email || 'No email provided';
                document.getElementById('upmPhone').textContent = u.contact_number || u.phone || 'No phone provided';
                document.getElementById('upmAddress').textContent = u.address || 'No address provided';
                document.getElementById('upmRole').textContent = u.role.charAt(0).toUpperCase() + u.role.slice(1);
                document.getElementById('upmJoined').textContent = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown';

                document.getElementById('adminUserProfileModal').style.display = 'flex';
            }



            //  Instant row-update helpers (no full table reload) 
            function _buildStatusBadge(status, colorsMap) {
                const sc = colorsMap[status] || { bg: '#f1f5f9', color: '#374151' };
                return `<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${sc.bg};color:${sc.color};">${status}</span>`;
            }
            function _updateReqRow(id, newStatus) {
                const row = document.querySelector(`tr[data-req-id="${id}"]`);
                if (!row) return;
                const cells = row.querySelectorAll('td');
                const colors = { pending:{bg:'#fef9c3',color:'#854d0e'}, approved:{bg:'#dcfce7',color:'#166534'}, rejected:{bg:'#fee2e2',color:'#991b1b'}, returned:{bg:'#f1f5f9',color:'#374151'}, cancelled:{bg:'#f1f5f9',color:'#475569'} };
                if (cells[5]) cells[5].innerHTML = _buildStatusBadge(newStatus, colors);
                if (cells[6]) {
                    if (newStatus === 'approved') {
                        cells[6].innerHTML = `<button onclick="returnRequest(${id})" style="padding:6px 12px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;"> Returned</button>`;
                    } else {
                        cells[6].innerHTML = '<span style="font-size:12px;color:#9ca3af;padding:6px 0;"></span>';
                    }
                }
            }
            function _updateBookingRow(id, newStatus, reason) {
                const row = document.querySelector(`tr[data-bid="${id}"]`);
                if (!row) return;
                const cells = row.querySelectorAll('td');
                const colors = { pending:{bg:'#fef9c3',color:'#854d0e'}, approved:{bg:'#dcfce7',color:'#166534'}, booked:{bg:'#dcfce7',color:'#166534'}, rejected:{bg:'#fee2e2',color:'#991b1b'}, cancelled:{bg:'#f1f5f9',color:'#475569'} };
                if (cells[5]) cells[5].innerHTML = _buildStatusBadge(newStatus, colors);
                if (reason && cells[4] && !cells[4].innerHTML.includes('Admin:')) {
                    cells[4].innerHTML += `<div style="margin-top:4px;font-size:11px;color:#6b7280;font-style:italic;">Admin: ${reason}</div>`;
                }
                if (cells[6]) cells[6].innerHTML = '<span style="font-size:12px;color:#9ca3af;"></span>';
            }
            function _updateConcernRow(id, newStatus, assignee, hasResponse) {
                const row = document.querySelector(`tr[data-cid="${id}"]`);
                if (!row) return;
                const cells = row.querySelectorAll('td');
                const colors = { pending:{bg:'#fef9c3',color:'#854d0e'}, 'in-progress':{bg:'#dbeafe',color:'#1e40af'}, resolved:{bg:'#dcfce7',color:'#166534'}, closed:{bg:'#f1f5f9',color:'#475569'} };
                if (cells[6]) cells[6].innerHTML = _buildStatusBadge(newStatus, colors);
                if (cells[4] && assignee) cells[4].textContent = assignee;
                if (cells[3] && hasResponse && !cells[3].querySelector('.replied-note')) {
                    cells[3].insertAdjacentHTML('beforeend', '<div class="replied-note" style="margin-top:4px;font-size:11px;color:#059669;font-style:italic;"> Replied</div>');
                }
            }
            // 

            async function loadRequests() {
                const borrowings = await getAllBorrowings();
                const container = document.getElementById('requestsTable');
                const noRequests = document.getElementById('noRequests');

                if (borrowings.length === 0) {
                    container.innerHTML = '';
                    noRequests.style.display = 'block';
                    return;
                }

                noRequests.style.display = 'none';

                // Pending first, then oldest within same status (FCFS)
                const _reqStatusPriority = s => s === 'pending' ? 0 : 1;
                borrowings.sort((a, b) => {
                    const sp = _reqStatusPriority(a.status) - _reqStatusPriority(b.status);
                    if (sp !== 0) return sp;
                    return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
                });

                _allAdminRequestsList = borrowings;
                _pgReqList = borrowings;
                _pgReqPage = 1;
                container.innerHTML = borrowings.map(b => {
                    const submittedAt = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : 'Unknown';
                    const residentDisplay = `<div style="line-height:1.2;"><strong>${b.userName}</strong><br><small style="color:#6b7280;font-size:11px;">${submittedAt}</small></div>`;
                    return `
                <tr data-req-id="${b.id}" onclick="openRequestRespond(${b.id})" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(16,185,129,0.06)'" onmouseout="this.style.background=''">
                    <td>${residentDisplay}</td>
                    <td><strong style="color:var(--text);">${b.equipment}</strong></td>
                    <td style="font-weight:bold;color:var(--text);">${b.quantity}</td>
                    <td style="white-space: nowrap;color:var(--muted);">${b.borrowDate}<br>to ${b.returnDate}</td>
                    <td style="color:var(--text);">${b.purpose}</td>
                    <td>${getStatusBadge(b.status)}</td>
                </tr>
            `}).join('');
                renderPg('requestsPg', _pgReqList.length, PG_SIZE, _pgReqPage, 'gotoRequestsPage');
            }

            async function loadCourtBookings() {
                const bookings = await getCourtBookings();
                const container = document.getElementById('courtBookingsList');
                const noBookings = document.getElementById('noCourtBookings');

                if (bookings.length === 0) {
                    container.innerHTML = '';
                    noBookings.style.display = 'block';
                    return;
                }

                noBookings.style.display = 'none';

                // Sort oldest first (First Come First Serve)
                bookings.sort((a, b) => new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0));

                container.innerHTML = bookings.map(booking => {
                    const statusClass = booking.status === 'cancelled' || booking.status === 'cancelled_by_admin'
                        ? 'status-rejected'
                        : booking.status === 'approved'
                            ? 'status-approved'
                            : booking.status === 'completed'
                                ? 'status-resolved'
                                : 'status-pending';
                    const statusText = booking.status === 'cancelled' || booking.status === 'cancelled_by_admin'
                        ? 'Cancelled'
                        : booking.status === 'approved'
                            ? 'Approved'
                            : booking.status === 'completed'
                                ? ' Completed'
                                : 'Pending';

                    return `
                    <div class="court-booking-card">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                            <div>
                                <h4 style="margin: 0; color: var(--dark); font-size: 16px; font-weight: 700;"> ${formatDate(booking.date)}</h4>
                                <p style="margin: 6px 0 0; color: var(--gray); font-size: 14px;"> ${booking.time}</p>
                                <p style="margin: 6px 0 0; color: var(--primary); font-size: 14px; font-weight: 600;">${booking.venueName || 'Basketball Court'}</p>
                            </div>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div style="margin-bottom: 12px;">
                            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong> Resident:</strong> ${booking.userName}</p>
                            <p style="margin: 4px 0; color: #555; font-size: 14px;"><strong> Purpose:</strong> ${booking.purpose}</p>
                        </div>
                        
                        ${booking.adminComment ? `
                            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 10px; border-radius: 4px; margin-bottom: 12px;">
                                <p style="margin: 0; color: #92400e; font-size: 13px;"><strong> Admin Reply:</strong> ${booking.adminComment}</p>
                            </div>
                        ` : ''}
                        
                        ${booking.replies && booking.replies.length > 0 ? `
                            <div style="margin-bottom: 12px;">
                                <p style="margin: 0 0 8px; color: #555; font-size: 13px; font-weight: 600;"> Replies:</p>
                                ${booking.replies.map(reply => `
                                    <div style="background: #f9fafb; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
                                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666; margin-bottom: 4px;">
                                            <span> ${reply.userName}</span>
                                            <span>${formatDate(reply.createdAt)}</span>
                                        </div>
                                        <p style="margin: 0; font-size: 13px; color: #333;">${reply.text}</p>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                        
                        ${booking.status !== 'cancelled' && booking.status !== 'rejected' ? `
                            <div style="margin-bottom: 16px;">
                                <label style="display: block; margin-bottom: 8px; font-size: 13px; color: var(--gray); font-weight: 600;"> Send Reply / Explanation:</label>
                                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                    <input type="text" 
                                        id="adminComment-${booking.id}" 
                                        placeholder="Reply to user (e.g., unexpected event)..." 
                                        value="${booking.adminComment || ''}"
                                        style="flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-width: 200px; outline: none; transition: border-color 0.2s;"
                                        onfocus="this.style.borderColor='var(--primary)'"
                                        onblur="this.style.borderColor='#e2e8f0'">
                                </div>
                            </div>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                                ${booking.status === 'pending' ? `
                                <button onclick="handleApproveCourtBooking(${booking.id})" 
                                    class="btn btn-small" style="background: #10b981; border: none; color: white;">
                                     Approve
                                </button>
                                ` : ''}
                                <button onclick="addAdminCommentToBooking(${booking.id})" 
                                    class="btn btn-small" style="background: #f59e0b; border: none; color: white;">
                                     Reply
                                </button>
                                <button onclick="cancelCourtBookingAdmin(${booking.id})" 
                                    class="btn btn-small btn-danger" style="background: #ef4444; border-color: #ef4444; color: white;">
                                     Cancel Booking
                                </button>
                                <button onclick="deleteCourtBooking(${booking.id})" 
                                    class="btn btn-small" style="background: #dc2626; border-color: #dc2626; color: white;">
                                     Delete
                                </button>
                            </div>
                        ` : `
                            <div style="text-align: center;">
                                <button onclick="restoreCourtBooking(${booking.id})" 
                                    class="btn btn-small" style="background: #22c55e; border-color: #22c55e; color: white;">
                                     Restore Booking
                                </button>
                            </div>
                        `}
                    </div>
                `;
                }).join('');
            }

            async function addAdminCommentToBooking(bookingId) {
                const commentInput = document.getElementById(`adminComment-${bookingId}`);
                const comment = commentInput.value.trim();

                if (!comment) {
                    showAlert('Please enter a reply message', 'error');
                    return;
                }

                const result = await addAdminComment(bookingId, comment);
                if (result.success) {
                    showAlert('Reply sent to user', 'success');
                    await loadCourtBookings();
                } else {
                    showAlert(result.message, 'error');
                }
            }

            async function handleApproveCourtBooking(bookingId) {
                const result = await approveCourtBooking(bookingId);
                if (result.success) {
                    showAlert('Court Reservation approved', 'success');
                    // Send targeted email to the resident
                    try {
                        const bookings = await getCourtBookings();
                        const b = bookings.find(x => x.id === bookingId);
                        if (b) {
                            const userInfo = b.user || {};
                            const email = userInfo.email || b.email;
                            const name = userInfo.full_name || userInfo.fullName || b.userName || 'Resident';
                            if (email) {
                                await sendEmailNotification({
                                    to_email: email, name,
                                    title: 'Court Reservation Approved ',
                                    message: `Good news! Your Court Reservation has been APPROVED.`,
                                    details: `Venue: ${b.venueName || b.venue || 'Court'} | Date: ${b.date} | Time: ${b.time || ''}`
                                });
                            }
                        }
                    } catch(e) { console.warn('email notify failed', e); }
                    await loadCourtBookings();
                    await loadStats();
                } else {
                    showAlert(result.message, 'error');
                }
            }

            async function handleRejectCourtBooking(bookingId) {
                const commentInput = document.getElementById(`adminComment-${bookingId}`);
                const comment = commentInput ? commentInput.value.trim() : '';
                if (comment) { await addAdminComment(bookingId, comment); }

                const result = await rejectCourtBooking(bookingId);
                if (result.success) {
                    showAlert('Court Reservation rejected', 'success');
                    // Send targeted email to the resident
                    try {
                        const bookings = await getCourtBookings();
                        const b = bookings.find(x => x.id === bookingId);
                        if (b) {
                            const userInfo = b.user || {};
                            const email = userInfo.email || b.email;
                            const name = userInfo.full_name || userInfo.fullName || b.userName || 'Resident';
                            if (email) {
                                await sendEmailNotification({
                                    to_email: email, name,
                                    title: 'Court Reservation Update  Œ',
                                    message: `We regret to inform you that your Court Reservation has been REJECTED.`,
                                    details: `Venue: ${b.venueName || b.venue || 'Court'} | Date: ${b.date}${comment ? ' | Reason: ' + comment : ''}`
                                });
                            }
                        }
                    } catch(e) { console.warn('email notify failed', e); }
                    await loadCourtBookings();
                    await loadStats();
                } else {
                    showAlert(result.message, 'error');
                }
            }

            async function restoreCourtBooking(bookingId) {
                const result = await updateCourtBookingStatus(bookingId, 'booked');
                if (result.success) {
                    showAlert('Court Reservation restored', 'success');
                    await loadCourtBookings();
                    await loadStats();
                } else {
                    showAlert(result.message, 'error');
                }
            }

            async function cancelCourtBookingAdmin(bookingId) {
                if (await showConfirmModal('Are you sure you want to cancel this Court Reservation?', 'Cancel Booking', 'Yes, Cancel', 'No', 'warning')) {
                    const result = await cancelCourtBooking(bookingId);
                    if (result.success) {
                        showAlert('Booking cancelled', 'success');
                        await loadCourtBookings();
                    } else {
                        showAlert(result.message, 'error');
                    }
                }
            }

            async function deleteCourtBooking(bookingId) {
                if (await showConfirmModal('Are you sure you want to permanently delete this Court Reservation?', 'Delete Booking', 'Yes, Delete', 'Cancel', 'danger')) {
                    const result = await (typeof window.deleteBooking === 'function' ? window.deleteBooking(bookingId) : supabase.from('facility_reservations').delete().eq('id', bookingId));
                    if (result.success || !result.error) {
                        showAlert('Court Reservation deleted', 'success');
                        await loadCourtBookings();
                        await loadStats();
                    } else {
                        showAlert(result.message || result.error.message, 'error');
                    }
                }
            }

            async function deleteConcernAdmin(concernId) {
                if (await showConfirmModal('Are you sure you want to permanently delete this concern?', 'Delete Concern', 'Yes, Delete', 'Cancel', 'danger')) {
                    if (typeof window.deleteConcern === 'function') {
                        const result = await window.deleteConcern(concernId);
                        if (result.success) {
                            showAlert('Concern deleted', 'success');
                            await loadConcerns();
                            await loadStats();
                        } else {
                            showAlert(result.message, 'error');
                        }
                    } else {
                        await supabase.from('concerns').delete().eq('id', concernId);
                        showAlert('Concern deleted', 'success');
                        await loadConcerns();
                        await loadStats();
                    }
                }
            }

            async function approveRequest(id) {
                if (await showConfirmModal('Approve this request?', 'Approve Request', 'Approve', 'Cancel', 'info')) {
                    const result = await approveEquipmentRequest(id);
                    if (result && result.success) {
                        showAlert('Request approved', 'success');
                        _updateReqRow(id, 'approved');
                        loadStats();
                    } else if (result) {
                        showAlert(result.message || 'Error approving request', 'error');
                    }
                }
            }

            let _currentRejectEqId = null;

            function rejectRequest(id) {
                _currentRejectEqId = id;
                document.getElementById('rejectEqReasonText').value = '';
                document.getElementById('rejectEqModal').style.display = 'flex';
            }

            function closeRejectEqModal() {
                document.getElementById('rejectEqModal').style.display = 'none';
                _currentRejectEqId = null;
            }

            async function confirmRejectEq(btnElem) {
                const reason = document.getElementById('rejectEqReasonText').value.trim();
                let eventBtn = btnElem || (window.event ? window.event.currentTarget : null);
                
                if (!reason) {
                    showAlert('Please enter a reason for rejection.', 'error');
                    return;
                }
                
                if (eventBtn) {
                    eventBtn.disabled = true;
                    eventBtn.textContent = 'Processing...';
                }

                const rejEqId = _currentRejectEqId;
                const result = await rejectEquipmentRequest(rejEqId, reason);
                
                if (eventBtn) {
                    eventBtn.disabled = false;
                    eventBtn.textContent = 'Reject';
                }
                if (result && result.success) {
                    showAlert('Request rejected', 'success');
                    closeRejectEqModal();
                    _updateReqRow(rejEqId, 'rejected');
                    loadStats();
                } else if (result) {
                    showAlert(result.message || 'Error rejecting request', 'error');
                }
            }

            async function returnRequest(id) {
                if (await showConfirmModal('Mark this equipment as returned?', 'Return Equipment', 'Yes, Returned', 'Cancel', 'info')) {
                    const result = await returnEquipmentRequest(id);
                    if (result && result.success) {
                        showAlert('Equipment marked as returned', 'success');
                        _updateReqRow(id, 'returned');
                        loadStats();
                    } else if (result) {
                        showAlert(result.message || 'Error returning equipment', 'error');
                    }
                }
            }

            async function openConcernModal(concernId) {
                const concerns = await getAllConcerns();
                const concern = concerns.find(c => c.id === concernId);
                if (concern) {
                    document.getElementById('concernId').value = concernId;
                    document.getElementById('concernAssignee').value = concern.assignedTo || '';
                    document.getElementById('concernStatus').value = concern.status;
                    document.getElementById('concernResponse').value = concern.response || '';
                    document.getElementById('concernDetails').innerHTML = `
                    <div class="concern-details">
                        <p><strong>Category:</strong> ${concern.category}</p>
                        <p><strong>Title:</strong> ${concern.title}</p>
                        <p><strong>Address:</strong> ${concern.address || 'N/A'}</p>
                        <p><strong>Description:</strong> ${concern.description}</p>
                        <p><strong>Submitted by:</strong> ${concern.userName}</p>
                    </div>
                `;
                    document.getElementById('concernModal').classList.add('active');
                    history.pushState({ modal: 'concernModal' }, '', '#concernModal');
                }
            }

            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function (e) {
                    if (e.target === this) closeModal(this.id);
                });
            });

            document.getElementById('concernResponseForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const success = await updateConcernStatus(
                    parseInt(document.getElementById('concernId').value),
                    document.getElementById('concernStatus').value,
                    document.getElementById('concernResponse').value,
                    document.getElementById('concernAssignee').value
                );
                if (success) {
                    showAlert('Response submitted', 'success');
                    closeModal('concernModal');
                    await loadStats();
                    await loadConcerns();
                }
            });

            function adminFmt12(timeStr) {
                if (!timeStr || timeStr.includes('M')) return timeStr;
                const [h, m] = timeStr.split(':');
                const hour = parseInt(h);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const h12 = hour % 12 || 12;
                return `${h12}:${m} ${ampm}`;
            }

            async function loadEvents() {
                const events = await getEvents();
                const container = document.getElementById('eventsList');

                if (events.length === 0) {
                    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon"></div><p>No events</p></div>';
                    return;
                }

                container.innerHTML = events.map(e => `
                <div class="event-item">
                    <div class="event-info">
                        <h4>${e.title}</h4>
                        <p>${e.location}</p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="event-time">${e.date} - ${adminFmt12(e.time)}${e.end_time ? ' to ' + adminFmt12(e.end_time) : ''}</div>
                        ${e.status === 'pending' ? `
                            <button class="btn btn-smaller btn-primary" onclick="approveEvent(${e.id})">Approve</button>
                            <button class="btn btn-smaller btn-danger" onclick="handleDeleteEvent(${e.id})">Delete</button>
                        ` : `
                            ${getStatusBadge(e.status)}
                            <button class="btn btn-smaller btn-secondary" onclick="openEditEventModal(${e.id})" style="margin-left: 8px;">Edit</button>
                            <button class="btn btn-smaller btn-danger" onclick="handleDeleteEvent(${e.id})" style="margin-left: 4px;">Delete</button>
                        `}
                    </div>
                </div>
            `).join('');
            }

            function openEventModal() {
                document.getElementById('eventForm').reset();
                document.getElementById('eventDate').min = new Date().toISOString().split('T')[0];
                document.getElementById('eventModal').classList.add('active');
                history.pushState({ modal: 'eventModal' }, '', '#eventModal');
            }

            window.handleAdminEventSubmit = async function (e) {
                e.preventDefault();
                const formObj = document.getElementById('eventForm');
                const btn = formObj.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = 'Saving...';

                const result = await createEvent({
                    title: document.getElementById('eventTitle').value,
                    date: document.getElementById('eventDate').value,
                    time: document.getElementById('eventTime').value,
                    end_time: document.getElementById('eventEndTime').value,
                    location: document.getElementById('eventLocation').value,
                    organizer: document.getElementById('eventOrganizer').value,
                    description: document.getElementById('eventDescription').value || '',
                    capacity: parseInt(document.getElementById('eventCapacity').value || '0') || 0
                });

                btn.disabled = false;
                btn.innerHTML = originalText;

                if (result.success) {
                    // Show custom success modal
                    document.getElementById('adminEventSuccessModal').style.display = 'flex';
                    formObj.reset();
                    closeModal('eventModal');
                    if (typeof loadEvents === 'function') await loadEvents();
                    // Load overview if exists
                    if (typeof loadOverview === 'function') await loadOverview();
                    if (typeof renderAdminCalendar === 'function') await renderAdminCalendar();
                } else {
                    showAlert('Error: ' + result.message, 'error');
                }
            };

            async function openEditEventModal(eventId) {
                const events = await getEvents();
                const event = events.find(e => e.id === eventId);
                if (event) {
                    document.getElementById('editEventId').value = eventId;
                    document.getElementById('editEventTitle').value = event.title;
                    document.getElementById('editEventDate').value = event.date;
                    document.getElementById('editEventTime').value = event.time;
                    document.getElementById('editEventEndTime').value = event.end_time || '';
                    document.getElementById('editEventLocation').value = event.location || '';
                    document.getElementById('editEventDescription').value = event.description || '';
                    document.getElementById('editEventCapacity').value = event.capacity || 0;
                    document.getElementById('editEventOrganizer').value = event.organizer || '';

                    document.getElementById('editEventModal').classList.add('active');
                    history.pushState({ modal: 'editEventModal' }, '', '#editEventModal');
                }
            }

            document.getElementById('editEventForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = 'Saving...';

                const eventId = parseInt(document.getElementById('editEventId').value);
                const result = await editEvent(eventId, {
                    title: document.getElementById('editEventTitle').value,
                    date: document.getElementById('editEventDate').value,
                    time: document.getElementById('editEventTime').value,
                    end_time: document.getElementById('editEventEndTime').value,
                    location: document.getElementById('editEventLocation').value,
                    description: document.getElementById('editEventDescription').value || '',
                    capacity: parseInt(document.getElementById('editEventCapacity').value || '0') || 0,
                    organizer: document.getElementById('editEventOrganizer').value
                });

                btn.disabled = false;
                btn.innerHTML = originalText;

                if (result.success !== false) {
                    showAlert('Event updated successfully', 'success');
                    closeModal('editEventModal');
                    await loadEvents();
                } else {
                    showAlert(result.message || 'Error updating event', 'error');
                }
            });

            async function approveEvent(id) {
                if (await updateEventStatus(id, 'approved')) {
                    showAlert('Event approved', 'success');
                    await loadStats();
                    await loadEvents();
                }
            }

            async function handleDeleteEvent(id) {
                if (await showConfirmModal('Delete this event?', 'Delete Event', 'Yes, Delete', 'Cancel', 'danger')) {
                    const result = await deleteEvent(id);
                    if (result.success !== false) { // Handle both explicit false and undefined success cases
                        showAlert('Event deleted', 'success');
                        await loadEvents();
                    } else {
                        showAlert(result.message || 'Failed to delete event', 'error');
                    }
                }
            }

            async function loadEquipment() {
                // Bootstrap Icon map by equipment name
                const EQUIP_ICON_MAP = {
                    'Chairs': { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><rect x="6" y="2" width="12" height="10" rx="1.5"/><rect x="4" y="13" width="16" height="3" rx="1.5"/><rect x="6" y="17" width="3" height="5" rx="1"/><rect x="15" y="17" width="3" height="5" rx="1"/></svg>`, cls: 'eq-Chairs' },
                    'Tables': { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><rect x="1" y="7" width="22" height="3" rx="1.5"/><rect x="3" y="10" width="2.5" height="10" rx="1.25"/><rect x="18.5" y="10" width="2.5" height="10" rx="1.25"/><rect x="5" y="10" width="14" height="1.5" rx="0.75"/></svg>`, cls: 'eq-Tables' },
                    'Tents': { html: `<i class="bi bi-house-door-fill" style="font-size:20px;color:#d97706;"></i>`, cls: 'eq-Tents' },
                    'Ladder': { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#d97706"><rect x="5" y="1" width="2.5" height="22" rx="1.25"/><rect x="16.5" y="1" width="2.5" height="22" rx="1.25"/><rect x="5" y="4" width="14" height="2" rx="1"/><rect x="5" y="10" width="14" height="2" rx="1"/><rect x="5" y="16" width="14" height="2" rx="1"/></svg>`, cls: 'eq-Ladder' },
                    'Microphone': { html: `<i class="bi bi-mic-fill" style="font-size:20px;color:#dc2626;"></i>`, cls: 'eq-Microphone' },
                    'Speaker': { html: `<i class="bi bi-speaker-fill" style="font-size:20px;color:#7c3aed;"></i>`, cls: 'eq-Speaker' },
                    'Electric Fan': { html: `<i class="bi bi-fan" style="font-size:20px;color:#3b82f6;"></i>`, cls: 'eq-Fan' }
                };

                const equipment = await getEquipment();
                const container = document.getElementById('equipmentTable');
                container.innerHTML = equipment.map(e => {
                    e.available = Math.min(e.available || 0, e.quantity || 1);
                    const broken = e.broken || 0;
                    const inUse = Math.max(0, e.quantity - e.available - broken);
                    let statusBadge;
                    if (e.isArchived) {
                        statusBadge = '<span class="status-badge" style="background:#f3f4f6;color:#374151;border:1px solid #d1d5db;"> Archived</span>';
                    } else if (broken > 0 && e.available === 0) {
                        statusBadge = '<span class="status-badge" style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;"> Under Repair</span>';
                    } else if (broken > 0) {
                        statusBadge = '<span class="status-badge" style="background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;"> Partial/Repair</span>';
                    } else if (e.available === 0) {
                        statusBadge = '<span class="status-badge status-borrowed"> In Use</span>';
                    } else if (inUse > 0) {
                        statusBadge = '<span class="status-badge status-pending"> Partially Used</span>';
                    } else {
                        statusBadge = '<span class="status-badge status-approved"> Available</span>';
                    }
                    const iconDef = EQUIP_ICON_MAP[e.name];
                    const iconHtml = iconDef ? iconDef.html : (e.icon || '');
                    const iconCls = iconDef ? iconDef.cls : 'eq-Default';
                    return `
                <tr style="${e.isArchived ? 'opacity: 0.6;' : ''}">
                    <td>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div class="eq-icon ${iconCls}">${iconHtml}</div>
                            <div>
                                <strong style="font-size:14px;color:var(--text);">${e.name}</strong>
                                ${e.description ? `<br><span style="font-size:12px;color:#9ca3af;">${e.description}</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td style="text-align: center;">${e.quantity}</td>
                    <td style="text-align: center; font-weight:700;color:#16a34a;">${e.available}</td>
                    <td style="text-align: center; color:${broken > 0 ? '#c2410c' : '#9ca3af'};font-weight:${broken > 0 ? '700' : '400'}">${broken}</td>
                    <td style="text-align: center;">${statusBadge}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-smaller btn-light" onclick="openEditEquipmentModal(${e.id})">Edit</button>
                    </td>
                </tr>`;
                }).join('');
            }

            function openAddEquipmentModal() {
                document.getElementById('addEquipmentForm').reset();
                document.getElementById('addEquipmentModal').classList.add('active');
                history.pushState({ modal: 'addEquipmentModal' }, '', '#addEquipmentModal');
            }

            document.getElementById('addEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = 'Saving...';

                const result = await addEquipment({
                    name: document.getElementById('equipName').value,
                    icon: document.getElementById('equipIcon').value,
                    description: document.getElementById('equipDesc').value,
                    quantity: parseInt(document.getElementById('equipQuantity').value),
                    available: parseInt(document.getElementById('equipQuantity').value),
                    broken: 0,
                    is_archived: false
                });

                btn.disabled = false;
                btn.innerHTML = originalText;

                if (result.success) {
                    showAlert('Equipment added', 'success');
                    closeModal('addEquipmentModal');
                    await loadEquipment();
                } else {
                    showAlert(result.message, 'error');
                }
            });

            async function openEditEquipmentModal(id) {
                const equipmentList = await getEquipment();
                const equipment = equipmentList.find(e => e.id === id);
                if (!equipment) return;
                document.getElementById('editEquipId').value = equipment.id;
                document.getElementById('editEquipName').value = equipment.name;
                document.getElementById('editEquipIcon').value = equipment.icon;
                document.getElementById('editEquipDesc').value = equipment.description || '';
                document.getElementById('editEquipQuantity').value = equipment.quantity;
                document.getElementById('editEquipBroken').value = equipment.broken || 0;
                document.getElementById('editEquipArchived').checked = equipment.isArchived || false;

                document.getElementById('editEquipmentModal').classList.add('active');
                history.pushState({ modal: 'editEquipmentModal' }, '', '#editEquipmentModal');
            }

            document.getElementById('editEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = 'Saving...';

                const id = parseInt(document.getElementById('editEquipId').value);
                const updates = {
                    name: document.getElementById('editEquipName').value,
                    icon: document.getElementById('editEquipIcon').value,
                    description: document.getElementById('editEquipDesc').value,
                    quantity: parseInt(document.getElementById('editEquipQuantity').value),
                    broken: parseInt(document.getElementById('editEquipBroken').value),
                    isArchived: document.getElementById('editEquipArchived').checked
                };

                const result = await updateEquipment(id, updates);

                btn.disabled = false;
                btn.innerHTML = originalText;

                if (result.success) {
                    showAlert('Equipment updated', 'success');
                    closeModal('editEquipmentModal');
                    await loadEquipment();
                } else {
                    showAlert(result.message, 'error');
                }
            });

            function closeModal(modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.remove('active');
                    if (window.location.hash === '#' + modalId) {
                        history.back();
                    }
                }
            }

            window.addEventListener('popstate', function () {
                document.querySelectorAll('.modal').forEach(modal => {
                    if ('#' + modal.id !== window.location.hash) {
                        modal.classList.remove('active');
                    }
                });
                if (window.location.hash && document.getElementById(window.location.hash.substring(1))) {
                    document.getElementById(window.location.hash.substring(1)).classList.add('active');
                }
            });

            // ==========================================
            // REPORT GENERATION & EXPORT
            // ==========================================

            function downloadCSV(csv, filename) {
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (navigator.msSaveBlob) {
                    navigator.msSaveBlob(blob, filename);
                } else {
                    link.href = URL.createObjectURL(blob);
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }

            function convertToCSV(array) {
                if (array.length === 0) return '';
                const headers = Object.keys(array[0]).join(',');
                const rows = array.map(obj =>
                    Object.values(obj).map(val => {
                        const str = String(val === null || val === undefined ? '' : val);
                        return '"' + str.replace(/"/g, '""') + '"';
                    }).join(',')
                ).join('\\n');
                return headers + '\\n' + rows;
            }

            async function generateEquipmentCSV() {
                const eqData = await getEquipment();
                const data = eqData.map(e => ({
                    ID: e.id,
                    Name: e.name,
                    Total_Quantity: e.quantity,
                    Available: e.available,
                    Under_Repair: e.broken || 0,
                    Archived: e.isArchived ? 'Yes' : 'No'
                }));
                downloadCSV(convertToCSV(data), 'equipment_report.csv');
                showAlert('Equipment CSV Exported', 'success');
            }

            async function generateBookingsCSV() {
                const cbData = await getCourtBookings();
                const data = cbData.map(b => ({
                    ID: b.id,
                    Resident: b.userName,
                    Venue: b.venueName || b.venue,
                    Date: b.date,
                    Time: b.time + (b.end_time ? ' - ' + b.end_time : ''),
                    Purpose: b.purpose,
                    Status: b.status
                }));
                downloadCSV(convertToCSV(data), 'facility_reservations_report.csv');
                showAlert('Reservations CSV Exported', 'success');
            }

            async function generateConcernsCSV() {
                const coData = await getAllConcerns();
                const data = coData.map(c => ({
                    ID: c.id,
                    Resident: c.userName,
                    Address: c.address,
                    Category: c.category,
                    Title: c.title,
                    Assigned_To: c.assignedTo || 'Unassigned',
                    Date: c.createdAt,
                    Status: c.status
                }));
                downloadCSV(convertToCSV(data), 'concerns_report.csv');
                showAlert('Concerns CSV Exported', 'success');
            }

            async function printReport(title, dataPromise, keysToInclude) {
                // Open window synchronously to avoid browser popup blockers
                const printWindow = window.open('', '', 'height=600,width=800');
                if (printWindow) {
                    printWindow.document.write(`<html><head><title>Loading Report...</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#6b7280;}</style></head><body><h2>Preparing report data, please wait...</h2></body></html>`);
                    printWindow.document.close();
                } else {
                    showAlert("Popup blocked! Please allow popups for this site to print reports.", "error");
                    return;
                }

                try {
                    const rawData = await dataPromise;
                    if (!rawData || rawData.length === 0) {
                        printWindow.document.body.innerHTML = "<h2>No data available to print.</h2><p>This window will close automatically.</p>";
                        setTimeout(() => printWindow.close(), 2500);
                        return;
                    }
                    
                    // Filter keys
                    const printableData = rawData.map(item => {
                        let obj = {};
                        keysToInclude.forEach(key => obj[key.toUpperCase()] = item[key] || '');
                        return obj;
                    });

                    const headers = Object.keys(printableData[0]);

                    let printContents = `
                    <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h2 { text-align: center; color: #047857; margin-bottom: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
                            th { background-color: #f0fdf4; color: #1a2e1f; }
                            @media print {
                                button { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <h2>${title}</h2>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                        <hr/>
                        <table>
                            <thead>
                                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                            </thead>
                            <tbody>
                                ${printableData.map(row => `
                                    <tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <script>
                            window.onload = function() { window.print(); window.close(); }
                        <\/script>
                    </body>
                    </html>
                    `;

                    printWindow.document.open();
                    printWindow.document.write(printContents);
                    printWindow.document.close();
                } catch (err) {
                    console.error(err);
                    printWindow.document.body.innerHTML = "<h2>Error generating report.</h2>";
                }
            }

            //  Mobile Sidebar 
            function openMobileSidebar() {
                document.getElementById('mobileSidebar').classList.add('open');
                document.getElementById('sidebarOverlay').classList.add('active');
                document.body.style.overflow = 'hidden';
            }
            function closeMobileSidebar() {
                document.getElementById('mobileSidebar').classList.remove('open');
                document.getElementById('sidebarOverlay').classList.remove('active');
                document.body.style.overflow = '';
            }
            function mobileSwitchSection(section) {
                closeMobileSidebar();
                const btns = document.querySelectorAll('#mobileSidebarNav button');
                btns.forEach(b => b.classList.remove('active'));
                const sectionMap = { 
                    'court-bookings': 0, 
                    'multipurpose-bookings': 1, 
                    'requests': 2, 
                    'concerns': 3, 
                    'events': 4, 
                    'equipment': 5, 
                    'reports': 6, 
                    'audit-log', 'security-log': 7 
                };
                if (sectionMap[section] !== undefined) btns[sectionMap[section]]?.classList.add('active');
                switchSection(section, null);
            }

            async function printEquipmentReport() {
                const data = await getEquipment();
                const rows = data.map(e => {
                    const broken = e.broken || 0;
                    const status = e.isArchived ? 'Archived' : broken > 0 && e.available === 0 ? 'Under Repair' : e.available === 0 ? 'In Use' : broken > 0 ? 'Partial/Repair' : 'Available';
                    return `<tr><td>${e.icon} ${e.name}</td><td>${e.quantity}</td><td>${e.available}</td><td>${broken}</td><td><strong>${status}</strong></td><td>${e.description || ''}</td></tr>`;
                }).join('');
                openPrintWindow('Barangay Sta. Lucia  Equipment & Asset Report',
                    `<table><thead><tr><th>Equipment</th><th>Total</th><th>Available</th><th>Under Repair</th><th>Status</th><th>Description</th></tr></thead><tbody>${rows}</tbody></table>`);
            }

            async function printBookingsReport() {
                const data = await getCourtBookings();
                const rows = data.map(b => `<tr><td>${b.userName}</td><td>${b.venueName || b.venue || 'N/A'}</td><td>${b.date}</td><td>${adminFmt12(b.time)}${b.end_time ? '  ' + adminFmt12(b.end_time) : ''}</td><td>${b.purpose}</td><td><strong>${b.status}</strong></td></tr>`).join('');
                openPrintWindow('Barangay Sta. Lucia  Facility Reservations Report',
                    `<table><thead><tr><th>Resident</th><th>Venue</th><th>Date</th><th>Time</th><th>Purpose</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
            }

            async function printConcernsReport() {
                const data = await getAllConcerns();
                const rows = data.map(c => `<tr><td>${c.userName}</td><td>${c.address || 'N/A'}</td><td>${c.category}</td><td>${c.title}</td><td>${c.assignedTo || 'Unassigned'}</td><td>${new Date(c.createdAt).toLocaleDateString()}</td><td><strong>${c.status}</strong></td></tr>`).join('');
                openPrintWindow('Barangay Sta. Lucia  Citizen Complaints Report',
                    `<table><thead><tr><th>Resident</th><th>Address</th><th>Category</th><th>Title</th><th>Assigned To</th><th>Date</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
            }

            async function printBorrowingsReport() {
                const data = await getAllBorrowings();
                const rows = data.map(b => `<tr><td>${b.userName}</td><td>${b.equipment}</td><td>${b.quantity}</td><td>${b.borrowDate}</td><td>${b.returnDate}</td><td>${b.purpose}</td><td><strong>${b.status}</strong></td></tr>`).join('');
                openPrintWindow('Barangay Sta. Lucia  Equipment Borrowings Report',
                    `<table><thead><tr><th>Resident</th><th>Equipment</th><th>Qty</th><th>Borrow Date</th><th>Return Date</th><th>Purpose</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
            }

            async function generateBorrowingsCSV() {
                const data = await getAllBorrowings();
                const rows = data.map(b => ({ Resident: b.userName, Equipment: b.equipment, Quantity: b.quantity, Borrow_Date: b.borrowDate, Return_Date: b.returnDate, Purpose: b.purpose, Status: b.status }));
                downloadCSV(convertToCSV(rows), 'borrowings_report.csv');
                showAlert('Borrowings CSV Exported', 'success');
            }

            function openPrintWindow(title, tableHtml) {
                const w = window.open('', '', 'height=700,width=1000');
                w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
                body{font-family:Arial,sans-serif;padding:24px;color:#111;}
                h2{text-align:center;color:#047857;margin-bottom:4px;}
                p.meta{text-align:center;color:#6b7280;font-size:13px;margin-bottom:20px;}
                table{width:100%;border-collapse:collapse;font-size:13px;}
                th{background:#f0fdf4;color:#047857;padding:10px;border:1px solid #d1fae5;text-align:left;}
                td{padding:9px 10px;border:1px solid #e5e7eb;vertical-align:top;}
                tr:nth-child(even)td{background:#f9fafb;}
                @media print{button{display:none;}}
            </style></head><body>
            <h2>${title}</h2>
            <p class="meta">Barangay Sta. Lucia, Novaliches, Quezon City &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
            <hr/>${tableHtml}
            <script>window.onload=function(){window.print();}<\/script>
            </body></html>`);
                w.document.close();
            }

            // ==========================================
            // Court Reservations ADMIN MANAGEMENT
            // ==========================================

            //  Live Polling for booking sections 
            let _bookingPollInterval = null;

            function startBookingPolling() {
                stopBookingPolling(); // clear any existing
                _bookingPollInterval = setInterval(() => {
                    const courtVisible   = document.getElementById('court-bookings-section')?.style.display !== 'none';
                    const mpVisible      = document.getElementById('multipurpose-bookings-section')?.style.display !== 'none';
                    if (courtVisible)  loadAdminBookings();
                    if (mpVisible)     loadMultipurposeBookings();
                }, 15000); // every 15 seconds
            }

            function stopBookingPolling() {
                if (_bookingPollInterval) {
                    clearInterval(_bookingPollInterval);
                    _bookingPollInterval = null;
                }
            }
            // 

            let _rejectBookingId = null;

            let _cbTabFilter = 'All';
            function setCourtBookingTab(tab, btn) {
                _cbTabFilter = tab;
                document.querySelectorAll('.cb-tab-btn').forEach(b => {
                    b.style.background = 'var(--bg)';
                    b.style.color = 'var(--text)';
                    b.style.border = '1px solid var(--border)';
                });
                btn.style.background = 'var(--primary)';
                btn.style.color = '#fff';
                btn.style.border = 'none';
                loadAdminBookings();
            }

            let _mpTabFilter = 'All';
            function setMpBookingTab(tab, btn) {
                _mpTabFilter = tab;
                document.querySelectorAll('.mp-tab-btn').forEach(b => {
                    b.style.background = 'var(--bg)';
                    b.style.color = 'var(--text)';
                    b.style.border = '1px solid var(--border)';
                });
                btn.style.background = 'var(--primary)';
                btn.style.color = '#fff';
                btn.style.border = 'none';
                loadMultipurposeBookings();
            }

            async function loadMultipurposeBookings() {
                const tbody = document.getElementById('multipurposeBookingsTable');
                const empty = document.getElementById('noMultipurposeBookings');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:24px;color:#6b7280;">Loading...</td></tr>';

                let allBookings = await getCourtBookings();
                _allAdminBookingsList = allBookings;

                // Auto-remove past bookings from display
                const now = new Date();
                const currentIsoDate = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
                const currentMins = now.getHours() * 60 + now.getMinutes();
                allBookings = allBookings.filter(b => {
                    if (!b.date) return true;
                    if (b.date < currentIsoDate) return false;
                    if (b.date === currentIsoDate) {
                        try {
                            const timeStr = b.timeRange || b.time || '';
                            let parts = timeStr.split(' to ');
                            if(parts.length === 1) parts = timeStr.split('');
                            if(parts.length === 1) parts = timeStr.split('-');
                            let endStr = parts[parts.length - 1].trim();
                            if(typeof timeToMinutes === 'function' && endStr) {
                                let endMins = timeToMinutes(endStr);
                                if(endMins && endMins < currentMins) return false;
                            }
                        } catch(e) {}
                    }
                    return true;
                });

                let mpBookings = allBookings.filter(b =>
                    b.venue === 'multipurpose' ||
                    (b.venueName && b.venueName.toLowerCase().includes('multi'))
                );
                
                // Sort oldest first (First Come First Serve)
                mpBookings.sort((a, b) => new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0));

                // Apply Tab Filter
                if (_mpTabFilter !== 'All') {
                    if (_mpTabFilter === 'Cancelled') {
                        mpBookings = mpBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');
                    } else {
                        mpBookings = mpBookings.filter(b => b.status === _mpTabFilter.toLowerCase());
                    }
                }

                // Apply Search
                const searchTxt = (document.getElementById('mpBookingSearch')?.value || '').toLowerCase();
                if (searchTxt) {
                    mpBookings = mpBookings.filter(b => {
                        const name = (b.userName || b.user_name || b.username || '').toLowerCase();
                        return name.includes(searchTxt);
                    });
                }

                if (!mpBookings.length) {
                    tbody.innerHTML = '';
                    empty.style.display = 'block';
                    return;
                }
                empty.style.display = 'none';

                const statusColors = { pending: { bg: '#fef9c3', color: '#854d0e' }, approved: { bg: '#dcfce7', color: '#166534' }, booked: { bg: '#dcfce7', color: '#166534' }, rejected: { bg: '#fee2e2', color: '#991b1b' }, cancelled: { bg: '#f1f5f9', color: '#475569' } };
                _pgMpList = mpBookings;
                _pgMpPage = 1;
                tbody.innerHTML = mpBookings.map(b => {
                    const sc = statusColors[b.status] || { bg: '#f1f5f9', color: '#374151' };
                    const statusBadge = `<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${sc.bg};color:${sc.color};">${b.status}</span>`;
                    const timeStr = b.timeRange || b.time || '';
                    const residentName = b.userName || b.user_name || b.username || 'Unknown';
                    const submittedAt = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : 'Unknown';
                    const residentDisplay = `<div style="line-height:1.2;"><strong>${residentName}</strong><br><small style="color:#6b7280;font-size:11px;">${submittedAt}</small></div>`;

                    return `<tr data-bid="${b.id}" onclick="openBookingRespond(${b.id})" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(16,185,129,0.06)'" onmouseout="this.style.background=''">
                        <td>${residentDisplay}</td>
                        <td style="color:var(--text);">${b.date}</td>
                        <td style="color:var(--text);">${timeStr}</td>
                        <td style="color:var(--text);">${b.purpose || ''}</td>
                        <td>${statusBadge}</td>
                    </tr>`;
                }).join('');
                renderPg('multipurposePg', _pgMpList.length, PG_SIZE, _pgMpPage, 'gotoMpPage');
            }

            async function loadAdminBookings() {
                const tbody = document.getElementById('courtBookingsTable');
                const empty = document.getElementById('noCourtBookings');
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:#6b7280;">Loading...</td></tr>';

                let allBookings = await getCourtBookings();
                _allAdminBookingsList = allBookings;

                // Auto-remove past bookings from display
                const now = new Date();
                const currentIsoDate = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
                const currentMins = now.getHours() * 60 + now.getMinutes();
                allBookings = allBookings.filter(b => {
                    if (!b.date) return true;
                    if (b.date < currentIsoDate) return false;
                    if (b.date === currentIsoDate) {
                        try {
                            const timeStr = b.timeRange || b.time || '';
                            let parts = timeStr.split(' to ');
                            if(parts.length === 1) parts = timeStr.split('');
                            if(parts.length === 1) parts = timeStr.split('-');
                            let endStr = parts[parts.length - 1].trim();
                            if(typeof timeToMinutes === 'function' && endStr) {
                                let endMins = timeToMinutes(endStr);
                                if(endMins && endMins < currentMins) return false;
                            }
                        } catch(e) {}
                    }
                    return true;
                });

                // Filter to COURT / BASKETBALL only
                allBookings = allBookings.filter(b =>
                    b.venue === 'basketball' ||
                    b.venue === 'court' ||
                    (b.venueName && (
                        b.venueName.toLowerCase().includes('basketball') ||
                        b.venueName.toLowerCase().includes('court')
                    )) ||
                    // Include entries where venue is not explicitly multipurpose
                    (!b.venue && !b.venueName) ||
                    (b.venue && !b.venue.toLowerCase().includes('multi') && !b.venue.toLowerCase().includes('multipurpose') && b.venue !== 'hall')
                ).filter(b => !(
                    (b.venue && (b.venue.toLowerCase().includes('multi') || b.venue === 'hall')) ||
                    (b.venueName && b.venueName.toLowerCase().includes('multi'))
                ));

                // Pending first, then oldest within same status (FCFS)
                const _bookStatusPriority = s => (s === 'pending' || s === 'booked') ? 0 : 1;
                allBookings.sort((a, b) => {
                    const sp = _bookStatusPriority(a.status) - _bookStatusPriority(b.status);
                    if (sp !== 0) return sp;
                    return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
                });

                // Apply Tab Filter
                if (_cbTabFilter !== 'All') {
                    if (_cbTabFilter === 'Cancelled') {
                        allBookings = allBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected');
                    } else {
                        allBookings = allBookings.filter(b => b.status === _cbTabFilter.toLowerCase());
                    }
                }

                // Apply Search
                const searchTxt = (document.getElementById('courtBookingSearch')?.value || '').toLowerCase();
                if (searchTxt) {
                    allBookings = allBookings.filter(b => {
                        const name = (b.userName || b.user_name || b.username || '').toLowerCase();
                        return name.includes(searchTxt);
                    });
                }

                if (!allBookings.length) {
                    tbody.innerHTML = '';
                    empty.style.display = 'block';
                    return;
                }
                empty.style.display = 'none';

                _pgCourtList = allBookings;
                _pgCourtPage = 1;
                tbody.innerHTML = allBookings.map(b => {
                    const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        approved: { bg: '#dcfce7', color: '#166534' },
                        booked: { bg: '#dcfce7', color: '#166534' },
                        rejected: { bg: '#fee2e2', color: '#991b1b' },
                        cancelled: { bg: '#f1f5f9', color: '#475569' }
                    };
                    const sc = statusColors[b.status] || { bg: '#f1f5f9', color: '#374151' };
                    const statusBadge = `<span style="padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; background:${sc.bg}; color:${sc.color};">${b.status}</span>`;

                    const venue = b.venueName || '';
                    const timeStr = b.timeRange || b.time || '';

                    const residentName = b.userName || b.user_name || b.username || 'Unknown';
                    const submittedAt = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : 'Unknown';
                    const residentDisplay = `<div style="line-height:1.2;"><strong>${residentName}</strong><br><small style="color:#6b7280;font-size:11px;">${submittedAt}</small></div>`;

                    const adminComment = b.admin_comment ? `<div style="margin-top:4px;font-size:11px;color:#6b7280;font-style:italic;">Admin: ${b.admin_comment}</div>` : '';

                    return `<tr data-bid="${b.id}" onclick="openBookingRespond(${b.id})" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(16,185,129,0.06)'" onmouseout="this.style.background=''">
                    <td>${residentDisplay}</td>
                    <td style="color:var(--text);">${venue}</td>
                    <td style="color:var(--text);">${b.date}</td>
                    <td style="color:var(--text);">${timeStr}</td>
                    <td style="color:var(--text);">${b.purpose || ''}${adminComment}</td>
                    <td>${statusBadge}</td>
                </tr>`;
                }).join('');
            }

            async function approveAdminBooking(bookingId) {
                if (!await showConfirmModal('Approve this booking?', 'Approve Reservation', 'Approve', 'Cancel', 'info')) return;
                try {
                    const { error } = await supabase.from('facility_reservations')
                        .update({ status: 'approved', admin_comment: null })
                        .eq('id', bookingId);
                    if (error) throw error;
                    showAlert('Booking approved!', 'success');
                    _updateBookingRow(bookingId, 'approved');
                } catch (e) {
                    showAlert('Error: ' + e.message, 'error');
                }
            }

            function openRejectModal(bookingId) {
                _rejectBookingId = bookingId;
                document.getElementById('rejectReasonText').value = '';
                const modal = document.getElementById('rejectReasonModal');
                modal.style.display = 'flex';
            }

            function closeRejectModal() {
                document.getElementById('rejectReasonModal').style.display = 'none';
                _rejectBookingId = null;
            }

            async function confirmReject() {
                const reason = document.getElementById('rejectReasonText').value.trim();
                if (!reason) {
                    showAlert('Please enter a reason for rejection.', 'error');
                    return;
                }
                try {
                    const { error } = await supabase.from('facility_reservations')
                        .update({ status: 'rejected', admin_comment: reason })
                        .eq('id', _rejectBookingId);
                    if (error) throw error;
                    const _rejBid = _rejectBookingId;
                    closeRejectModal();
                    showAlert('Booking rejected.', 'success');
                    _updateBookingRow(_rejBid, 'rejected', reason);
                } catch (e) {
                    showAlert('Error: ' + e.message, 'error');
                }
            }
            //  WELCOME CLOCK & GREETING 
            function initWelcomeClock() {
                const greetEl = document.getElementById('welcomeGreeting');
                const dateEl = document.getElementById('welcomeDateStr');
                const timeEl = document.getElementById('welcomeTime');
                const today = document.getElementById('todayDate');
                function tick() {
                    const now = new Date();
                    const h = now.getHours();
                    const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
                    const user = getCurrentUser();
                    const name = user?.fullName || user?.username || 'Admin';
                    if (greetEl) greetEl.textContent = greet + ', ' + name;
                    const ds = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                    if (dateEl) dateEl.textContent = ds;
                    if (today) today.textContent = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                }
                tick();
                setInterval(tick, 1000);
            }

            async function loadOverview() {
                const [users, borrowings, bookings, concerns, events] = await Promise.all([
                    getAllUsers(), getAllBorrowings(), getCourtBookings(), getAllConcerns(), getEvents()
                ]);

                const pendingReqs = borrowings.filter(b => b.status === 'pending').length;
                const pendingCons = concerns.filter(c => c.status === 'pending').length;
                const activeBooks = bookings.filter(b => b.status === 'pending' || b.status === 'approved').length;
                const activeEvents = events.filter(e => e.status === 'approved').length;

                const el = (id) => document.getElementById(id);
                if (el('pendingRequests')) el('pendingRequests').textContent = pendingReqs;
                if (el('pendingConcerns')) el('pendingConcerns').textContent = pendingCons;
                if (el('upcomingEvents')) el('upcomingEvents').textContent = activeBooks;
                if (el('totalUsers')) el('totalUsers').textContent = users.filter(u => u.role !== 'admin').length;

                // Glance row
                if (el('glancePendingReqs')) el('glancePendingReqs').textContent = pendingReqs + ' pending';
                if (el('glancePendingCons')) el('glancePendingCons').textContent = pendingCons + ' open';
                if (el('glanceBookings')) el('glanceBookings').textContent = activeBooks + ' active';
                if (el('glanceUsers')) el('glanceUsers').textContent = users.filter(u => u.role !== 'admin').length + ' total';

                // Recent Activity Feed
                const feed = document.getElementById('overviewActivityFeed');
                if (feed) {
                    try {
                        const logs = await getActivityLog();
                        const recent = logs.slice(0, 5);
                        const actionIcons = {
                            'Login': '', 'Borrow Request': '', 'Borrow Approved': '',
                            'Borrow Rejected': '', 'Borrow Returned': '', 'Borrow Cancelled': '',
                            'Court Reservation Submitted': '', 'Booking Approved': '', 'Booking Rejected': '',
                            'Concern Submitted': '', 'Concern Updated': '', 'Event Created': '',
                            'Equipment Added': '', 'Inventory Update': '', 'User Registered': '',
                            'User Deleted': ''
                        };
                        if (recent.length === 0) {
                            feed.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px;">No activity yet.</div>';
                        } else {
                            feed.innerHTML = recent.map(log => {
                                const icon = actionIcons[log.action] || '📝';
                                return `<div class="feed-item" style="padding:10px 0;border-bottom:1px solid #f1f5f9;display:flex;align-items:flex-start;gap:12px;">
                                    <div style="font-size:18px;">${icon}</div>
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:#1a2e1f;">${log.action}</div>
                                        <div style="font-size:12px;color:#6b7280;margin-top:2px;">${log.details}</div>
                                        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${new Date(log.created_at).toLocaleDateString()} ${new Date(log.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                                    </div>
                                </div>`;
                            }).join('');
                        }
                    } catch (e) {
                        feed.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;font-size:13px;">Error loading feed</div>';
                    }
                }
            }

            let _allReportTransactions = [];
            let _reportPage = 1;
            const REPORT_PAGE_SIZE = 15;

            async function loadSimpleReport() {
                const tbody = document.getElementById('simpleReportTable');
                const noData = document.getElementById('noSimpleReport');
                if (!tbody) return;

                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">Loading...</td></tr>';
                noData.style.display = 'none';

                try {
                    const [borrowings, concerns, bookings] = await Promise.all([
                        getAllBorrowings(),
                        getAllConcerns(),
                        getCourtBookings()
                    ]);

                    let transactions = [];

                    borrowings.forEach(b => {
                        transactions.push({
                            date: new Date(b.created_at || new Date()),
                            type: ' Equipment Borrowing',
                            typeKey: 'Equipment',
                            user: b.userName || b.user_name || 'Resident',
                            details: `Requested ${b.quantity}x ${b.equipment} for ${b.purpose || 'general use'}.`,
                            status: b.status,
                            actionClick: `openRequestRespond(${b.id})`
                        });
                    });

                    concerns.forEach(c => {
                        transactions.push({
                            date: new Date(c.createdAt || c.created_at || new Date()),
                            type: ' Citizen Concern',
                            typeKey: 'Concern',
                            user: c.userName || 'Resident',
                            details: `Reported [${c.category}] - ${c.title}.`,
                            status: c.status,
                            actionClick: `openConcernRespond(${c.id})`
                        });
                    });

                    bookings.forEach(b => {
                        transactions.push({
                            date: new Date(b.createdAt || b.created_at || new Date()),
                            type: ' Court Reservation',
                            typeKey: 'Reservation',
                            user: b.userName || b.user_name || 'Resident',
                            details: `Reserved ${b.venueName || 'Court'} on ${b.date} at ${b.time} for ${b.purpose}.`,
                            status: b.status,
                            actionClick: `openBookingRespond(${b.id})`
                        });
                    });

                    transactions.sort((a, b) => b.date - a.date);
                    _allReportTransactions = transactions;
                    _reportPage = 1;
                    applyReportFilters();

                } catch (e) {
                    console.error('Error loading report:', e);
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:red;">Failed to load report</td></tr>';
                }
            }

            function applyReportFilters() {
                const dateFrom = document.getElementById('reportDateFrom')?.value;
                const dateTo = document.getElementById('reportDateTo')?.value;
                const typeF = document.getElementById('reportTypeFilter')?.value || '';
                const statusF = document.getElementById('reportStatusFilter')?.value || '';

                let filtered = _allReportTransactions.filter(t => {
                    if (typeF && !t.typeKey.includes(typeF)) return false;
                    if (statusF && t.status !== statusF) return false;
                    if (dateFrom && t.date < new Date(dateFrom)) return false;
                    if (dateTo && t.date > new Date(dateTo + 'T23:59:59')) return false;
                    return true;
                });

                renderReportPage(filtered, 1);
            }

            function resetReportFilters() {
                const ids = ['reportDateFrom', 'reportDateTo', 'reportTypeFilter', 'reportStatusFilter'];
                ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
                renderReportPage(_allReportTransactions, 1);
            }

            function changeReportPage(dir) {
                const dateFrom = document.getElementById('reportDateFrom')?.value;
                const dateTo = document.getElementById('reportDateTo')?.value;
                const typeF = document.getElementById('reportTypeFilter')?.value || '';
                const statusF = document.getElementById('reportStatusFilter')?.value || '';
                let filtered = _allReportTransactions.filter(t => {
                    if (typeF && !t.typeKey.includes(typeF)) return false;
                    if (statusF && t.status !== statusF) return false;
                    if (dateFrom && t.date < new Date(dateFrom)) return false;
                    if (dateTo && t.date > new Date(dateTo + 'T23:59:59')) return false;
                    return true;
                });
                renderReportPage(filtered, _reportPage + dir);
            }

            function renderReportPage(transactions, page) {
                const tbody = document.getElementById('simpleReportTable');
                const noData = document.getElementById('noSimpleReport');
                const total = transactions.length;
                const totalPages = Math.max(1, Math.ceil(total / REPORT_PAGE_SIZE));
                page = Math.max(1, Math.min(page, totalPages));
                _reportPage = page;
                const start = (page - 1) * REPORT_PAGE_SIZE;
                const slice = transactions.slice(start, start + REPORT_PAGE_SIZE);
                if (total === 0) {
                    tbody.innerHTML = '';
                    noData.style.display = 'block';
                } else {
                    noData.style.display = 'none';
                    tbody.innerHTML = slice.map(t => {
                        return '<tr onclick="' + t.actionClick + '" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'rgba(16,185,129,0.06)\'" onmouseout="this.style.background=\'\'"><td width="15%" style="color:var(--muted,#6b7280); font-size:13px;">' + t.date.toLocaleDateString() + ' <span style="font-size:11px;">' + t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</span></td><td width="20%"><strong>' + t.type + '</strong></td><td width="20%">' + t.user + '</td><td width="30%" style="font-size:13px;">' + t.details + '</td><td width="15%">' + getStatusBadge(t.status) + '</td></tr>';
                    }).join('');
                }
                const info = document.getElementById('reportPageInfo');
                const prevBtn = document.getElementById('reportPrevBtn');
                const nextBtn = document.getElementById('reportNextBtn');
                if (info) info.textContent = total > 0 ? 'Showing ' + (start + 1) + '-' + Math.min(start + REPORT_PAGE_SIZE, total) + ' of ' + total + ' records' : '';
                if (prevBtn) prevBtn.disabled = page <= 1;
                if (nextBtn) nextBtn.disabled = page >= totalPages;
            }

            // PLACEHOLDER_ADMIN_NOTIF
            // ==========================================
            // ADMIN NOTIFICATIONS
            // ==========================================
            async function loadAdminNotifications() {
                const notifications = await getNotifications('admin');
                const badge = document.getElementById('notificationBadge');
                const body = document.getElementById('notificationDropdownBody');

                if (!badge || !body) return;

                const unreadCount = notifications.filter(n => !n.isRead).length;
                badge.setAttribute('data-count', unreadCount);

                // Always show the notification bell so they can click it even if 0 unread
                badge.style.display = 'block';

                // Hide the pseudo-element counter if 0 unread
                if (unreadCount === 0) {
                    badge.classList.add('no-count');
                } else {
                    badge.classList.remove('no-count');
                }

                if (notifications.length === 0) {
                    body.innerHTML = `
                        <div class="notification-dropdown-empty">
                            <span style="font-size:24px;"></span>
                            <span>No new notifications</span>
                        </div>
                    `;
                    return;
                }

                body.innerHTML = notifications.map(notif => {
                    const iconClass = notif.type === 'concern' ? 'concern' : notif.type === 'borrow' ? 'request' : 'booking';
                    const icon = notif.type === 'concern' ? '' : notif.type === 'borrow' ? '' : '';

                    const timeAgo = formatTimeAgoAdmin(notif.created_at || notif.createdAt);
                    const unreadClass = notif.isRead ? '' : 'unread';

                    return `
                        <a href="javascript:void(0)" class="notification-item ${unreadClass}" onclick="handleNotificationClick('${notif.id}', '${notif.type}', event)">
                            <div class="notif-icon-wrap ${iconClass}">${icon}</div>
                            <div class="notif-content">
                                <span class="notif-title">${notif.message}</span>
                                <span class="notif-time">${timeAgo}</span>
                            </div>
                        </a>
                    `;
                }).join('');
            }

            function formatTimeAgoAdmin(dateStr) {
                if (!dateStr) return 'Just now';
                const date = new Date(dateStr);
                const seconds = Math.floor((new Date() - date) / 1000);

                let interval = seconds / 31536000;
                if (interval > 1) return Math.floor(interval) + " years ago";
                interval = seconds / 2592000;
                if (interval > 1) return Math.floor(interval) + " months ago";
                interval = seconds / 86400;
                if (interval > 1) return Math.floor(interval) + " days ago";
                interval = seconds / 3600;
                if (interval > 1) return Math.floor(interval) + " hours ago";
                interval = seconds / 60;
                if (interval > 1) return Math.floor(interval) + " mins ago";
                return Math.floor(seconds) + " seconds ago";
            }

            async function handleNotificationClick(id, type, event) {
                event.preventDefault();
                await markNotificationAsRead(id);
                document.getElementById('notificationDropdown').style.display = 'none';

                const sectionMap = {
                    'borrow': 'requests',
                    'concern': 'concerns',
                    'booking': 'court-bookings'
                };

                const sectionId = sectionMap[type] || 'overview';
                switchSection(sectionId, null);
                await loadAdminNotifications();
            }

            window.toggleNotificationDropdown = function (event) {
                const dropdown = document.getElementById('notificationDropdown');
                if (dropdown.style.display === 'flex') {
                    dropdown.style.display = 'none';
                } else {
                    dropdown.style.display = 'flex';
                }
                event.stopPropagation();
            };

            // Close dropdown when clicking outside
            document.addEventListener('click', function (event) {
                const dropdown = document.getElementById('notificationDropdown');
                const badge = document.getElementById('notificationBadge');
                if (dropdown && badge && dropdown.style.display === 'flex') {
                    if (!dropdown.contains(event.target) && !badge.contains(event.target)) {
                        dropdown.style.display = 'none';
                    }
                }
            });


            window.changeAdminMonth = function (delta) {
                adminCalendarMonth += delta;
                if (adminCalendarMonth > 11) { adminCalendarMonth = 0; adminCalendarYear++; }
                else if (adminCalendarMonth < 0) { adminCalendarMonth = 11; adminCalendarYear--; }
                renderAdminCalendar();
            };

            window.adminSelectVenue = function (venue) {
                document.getElementById('adminSelectedVenue').value = venue;
                document.getElementById('admin-venue-basketball').style.background = venue === 'basketball' ? 'linear-gradient(135deg,#10b981,#059669)' : 'transparent';
                document.getElementById('admin-venue-basketball').style.color = venue === 'basketball' ? '#fff' : '#64748b';

                document.getElementById('admin-venue-multipurpose').style.background = venue === 'multipurpose' ? 'linear-gradient(135deg,#10b981,#059669)' : 'transparent';
                document.getElementById('admin-venue-multipurpose').style.color = venue === 'multipurpose' ? '#fff' : '#64748b';

                renderAdminCalendar();
                if (adminSelectedDate) adminSelectDate(adminSelectedDate); // Refresh slots
            };

            // =====================================================
            // ADMIN DAY SCHEDULE POPUP SYSTEM
            // =====================================================

            function adminFmt12(slot) {
                if (!slot) return '';
                if (slot.toUpperCase().includes('M')) return slot;
                let h = parseInt(slot.split(':')[0]);
                let m = slot.split(':')[1] || '00';
                let ampm = h >= 12 ? 'PM' : 'AM';
                let h12 = h % 12; if (h12 === 0) h12 = 12;
                return `${h12}:${m} ${ampm}`;
            }

            window.adminSelectDate = async function (dateStr) {
                adminSelectedDate = dateStr;
                renderAdminCalendar();
                await openAdminDayPopup(dateStr);
            };

            async function openAdminDayPopup(dateStr) {
                const venue = document.getElementById('adminSelectedVenue').value;
                const venueLabel = venue === 'basketball' ? ' Basketball Court' : ' Multi-Purpose Hall';
                const d = new Date(dateStr + 'T00:00:00');
                const dateFmt = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

                document.getElementById('adsDayTitle').textContent = dateFmt;
                document.getElementById('adsDayVenue').textContent = venueLabel;
                document.getElementById('adsDate').value = dateStr;
                document.getElementById('adsVenue').value = venue;

                const modal = document.getElementById('adminDayScheduleModal');
                modal.style.display = 'flex';

                // form will be visible in its separate modal


                await refreshAdminDaySchedule(dateStr, venue);
            }

            async function refreshAdminDaySchedule(dateStr, venue) {
                const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
                const [allBookings, allEvents] = await Promise.all([getCourtBookings(), getEvents()]);

                const dayBookings = allBookings.filter(b =>
                    b.date === dateStr &&
                    b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' &&
                    (b.venue === venue || b.venueName === venueLabel)
                );
                const dayEvents = allEvents.filter(e => e.date === dateStr && e.status === 'approved');

                const list = document.getElementById('adsScheduleList');
                const empty = document.getElementById('adsEmptyState');

                const entries = [];
                dayBookings.forEach(b => {
                    const timeStr = adminFmt12(b.time) + (b.end_time ? '  ' + adminFmt12(b.end_time) : '');
                    entries.push({ type: 'booking', id: b.id, timeStr, label: b.userName || b.username || 'Resident', sub: b.purpose || '' });
                });
                dayEvents.forEach(e => {
                    const timeStr = adminFmt12(e.time) + (e.end_time ? '  ' + adminFmt12(e.end_time) : '');
                    entries.push({ type: 'event', id: e.id, timeStr, label: e.title, sub: e.organizer ? 'By ' + e.organizer : '' });
                });

                if (entries.length === 0) {
                    list.innerHTML = '';
                    empty.style.display = 'block';
                } else {
                    empty.style.display = 'none';
                    list.innerHTML = entries.map(en => {
                        const isBk = en.type === 'booking';
                        const bg = isBk ? '#fef2f2' : '#f5f3ff';
                        const border = isBk ? '#fca5a5' : '#c4b5fd';
                        const dot = isBk ? '' : '';
                        const clr = isBk ? '#b91c1c' : '#6d28d9';
                        const removeFn = isBk ? `adminRemoveBooking(${en.id})` : `adminRemoveEvent(${en.id})`;
                        return `<div style="display:flex;align-items:flex-start;gap:12px;padding:12px;border-radius:12px;border:1.5px solid ${border};background:${bg};margin-bottom:8px;">
                            <span style="font-size:18px;line-height:1;margin-top:2px;">${dot}</span>
                            <div style="flex:1;min-width:0;">
                                <p style="margin:0;font-size:13px;font-weight:800;color:${clr};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${en.timeStr}</p>
                                <p style="margin:0;font-size:12px;font-weight:600;color:#374151;">${en.label}</p>
                                ${en.sub ? `<p style="margin:0;font-size:11px;color:#9ca3af;font-style:italic;">${en.sub}</p>` : ''}
                            </div>
                            <button onclick="${removeFn}" style="flex-shrink:0;padding:4px 10px;border-radius:8px;border:1.5px solid #e5e7eb;background:#fff;font-size:11px;font-weight:700;color:#ef4444;cursor:pointer;"> Remove</button>
                        </div>`;
                    }).join('');
                }

                // Show or hide mass cancel button
                const cancelMassBtn = document.getElementById('adsCancelMassBtn');
                if (cancelMassBtn) {
                    cancelMassBtn.style.display = dayBookings.length > 0 ? 'flex' : 'none';
                }

                // Fill Add Event time selects
                await fillAdsTimeSelects(dateStr, venue, allBookings, allEvents);
            }

            async function fillAdsTimeSelects(dateStr, venue, allBookings, allEvents) {
                const startSel = document.getElementById('adsStartTime');
                const endSel = document.getElementById('adsEndTime');
                if (!startSel || !endSel) return;
                startSel.innerHTML = '<option value=""></option>';
                endSel.innerHTML = '<option value=""></option>';

                const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
                const slots = [];
                for (let i = 6; i <= 22; i++) {
                    slots.push(`${String(i).padStart(2, '0')}:00`);
                    if (i !== 22) slots.push(`${String(i).padStart(2, '0')}:30`);
                }

                slots.forEach(slot => {
                    const sMin = timeToMinutes(slot);
                    const eMin = sMin + 30;
                    let taken = false;
                    for (const b of allBookings) {
                        if (b.date === dateStr && b.status !== 'rejected' && b.status !== 'cancelled' &&
                            (b.venue === venue || b.venueName === venueLabel)) {
                            let tRange = b.timeRange || b.time;
                            if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
                            // Split on ' - ' separator (e.g. "10:00 AM - 12:00 PM")
                            const rangeParts = tRange.split(' - ').map(s => s.trim());
                            const st = rangeParts[0], et = rangeParts[1] || rangeParts[0];
                            if (sMin < timeToMinutes(et) && eMin > timeToMinutes(st)) taken = true;
                        }
                    }
                    for (const e of allEvents) {
                        if (e.date === dateStr && e.status === 'approved') {
                            const es = timeToMinutes(e.time);
                            let ee = timeToMinutes(e.end_time || e.time);
                            if (e.title && e.title.toLowerCase().includes('cleanup')) ee += 30;
                            if (sMin < ee && eMin > es) taken = true;
                        }
                    }

                    const label = adminFmt12(slot) + (taken ? ' (Unavailable)' : '');
                    const o1 = new Option(label, slot); if (taken) o1.disabled = true;
                    const o2 = new Option(label, slot); if (taken) o2.disabled = true;
                    startSel.appendChild(o1);
                    endSel.appendChild(o2);
                });
            }

            window.adminRemoveBooking = async function (id) {
                if (!await showConfirmModal('Remove this booking?', 'Remove Booking', 'Yes, Remove', 'Cancel', 'danger')) return;
                const res = await cancelCourtBooking(id);
                if (res.success) {
                    showAlert('Booking removed.', 'success');
                    const dateStr = document.getElementById('adsDate').value;
                    const venue = document.getElementById('adsVenue').value;
                    await refreshAdminDaySchedule(dateStr, venue);
                    renderAdminCalendar();
                } else { showAlert('Error: ' + res.message, 'error'); }
            };

            window.adminRemoveEvent = async function (id) {
                if (!await showConfirmModal('Delete this event?', 'Delete Event', 'Yes, Delete', 'Cancel', 'danger')) return;
                const res = await deleteEvent(id);
                if (res.success) {
                    showAlert('Event removed.', 'success');
                    const dateStr = document.getElementById('adsDate').value;
                    const venue = document.getElementById('adsVenue').value;
                    await refreshAdminDaySchedule(dateStr, venue);
                    renderAdminCalendar();
                } else { showAlert('Error: ' + res.message, 'error'); }
            };

            window.closeAdminDayPopup = function () {
                document.getElementById('adminDayScheduleModal').style.display = 'none';
                const form = document.getElementById('adsEventForm');
                if (form) form.reset();
                adminSelectedDate = null;
                renderAdminCalendar();
            };

            window.openAdsEventModal = function () {
                // Capture current date/venue before opening the modal
                const allDateEls = document.querySelectorAll('#adsDate');
                const allVenueEls = document.querySelectorAll('#adsVenue');
                window._adsCurrentDate = allDateEls[0] ? allDateEls[0].value : '';
                window._adsCurrentVenue = allVenueEls[0] ? allVenueEls[0].value : '';
                document.getElementById('adsEventModal').style.display = 'flex';
            };

            window.closeAdsEventModal = function () {
                document.getElementById('adsEventModal').style.display = 'none';
            };


            window.handleAdsEventSubmit = async function (e) {
                e.preventDefault();
                const formObj = document.getElementById('adsEventForm');
                const btn = formObj.querySelector('button[type="submit"]');
                btn.disabled = true; btn.textContent = 'Scheduling...';

                const dateStr = window._adsCurrentDate || document.getElementById('adsDate').value;
                const venue = window._adsCurrentVenue || document.getElementById('adsVenue').value;

                // Guard: ensure we have a date and venue
                if (!dateStr || !venue) {
                    btn.disabled = false; btn.textContent = ' Schedule Event';
                    showAlert('Could not determine the date or venue. Please close and re-open the day schedule, then try again.', 'error');
                    return;
                }

                const startTime = document.getElementById('adsStartTime').value;
                const rawEndTime = document.getElementById('adsEndTime').value;

                if (!startTime || !rawEndTime) {
                    btn.disabled = false; btn.textContent = ' Schedule Event';
                    showAlert('Please select both a start time and an end time.', 'error');
                    return;
                }

                let endT = rawEndTime;
                const cleanupMins = parseInt(document.getElementById('adsCleanupTime').value || '0', 10);
                
                if (cleanupMins > 0 && endT) {
                    // Handle both 24h format "HH:MM" (from selects) and "H:MM AM/PM" (legacy)
                    const match24h = endT.match(/^(\d{1,2}):(\d{2})$/);
                    const match12h = endT.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    let totalMins = 0;
                    if (match24h) {
                        totalMins = parseInt(match24h[1], 10) * 60 + parseInt(match24h[2], 10) + cleanupMins;
                        let newH = Math.floor(totalMins / 60) % 24;
                        const newM = totalMins % 60;
                        endT = `${String(newH).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
                    } else if (match12h) {
                        let h = parseInt(match12h[1], 10);
                        let m = parseInt(match12h[2], 10);
                        const ampm = match12h[3];
                        if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
                        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
                        totalMins = h * 60 + m + cleanupMins;
                        let newH = Math.floor(totalMins / 60) % 24;
                        const newM = totalMins % 60;
                        const newAmpm = newH >= 12 ? 'PM' : 'AM';
                        let dispH = newH % 12;
                        if (dispH === 0) dispH = 12;
                        endT = `${dispH}:${newM.toString().padStart(2, '0')} ${newAmpm}`;
                    }
                }

                const title = document.getElementById('adsEventTitle').value.trim();
                const eventData = {
                    title: title + (cleanupMins > 0 ? ` (+${cleanupMins}m cleanup)` : ''),
                    date: dateStr,
                    time: startTime,
                    end_time: endT,
                    organizer: document.getElementById('adsOrganizer').value,
                    location: venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall',
                    description: document.getElementById('adsEventDescription') ? document.getElementById('adsEventDescription').value : '',
                    capacity: document.getElementById('adsEventCapacity') ? parseInt(document.getElementById('adsEventCapacity').value || '0', 10) : 0,
                    status: 'approved'
                };

                const massCancel = formObj.dataset.massCancel === 'true';
                const result = await createEvent(eventData, massCancel);
                btn.disabled = false; btn.textContent = ' Schedule Event';

                if (result.success) {
                    // Close the form modal first
                    closeAdsEventModal();
                    // Show custom success modal
                    document.getElementById('adminEventSuccessModal').style.display = 'flex';
                    formObj.reset();
                    await refreshAdminDaySchedule(dateStr, venue);
                    if (typeof renderAdminCalendar === 'function') renderAdminCalendar();
                    if (typeof loadOverview === 'function') await loadOverview();
                    if (typeof loadEvents === 'function') await loadEvents();
                } else {
                    showAlert('Error: ' + result.message, 'error');
                }
            };

            // Initialize on load
            document.addEventListener('DOMContentLoaded', () => {
                // Populate admin name next to logo from registered account
                const adminUser = getCurrentUser();
                if (adminUser) {
                    const adminNameEl = document.getElementById('adminMobileName');
                    if (adminNameEl) adminNameEl.textContent = adminUser.fullName || adminUser.name || adminUser.username || 'Admin';
                    const userNameEl = document.getElementById('userName');
                    if (userNameEl && userNameEl.textContent === 'Administrator') {
                        userNameEl.textContent = adminUser.fullName || adminUser.name || adminUser.username || 'Administrator';
                    }
                    const avatarEl = document.getElementById('userAvatar');
                    if (avatarEl) avatarEl.textContent = (adminUser.fullName || adminUser.name || adminUser.username || 'A')[0].toUpperCase();
                }
                initWelcomeClock();
                loadOverview();
                loadAdminNotifications();
                renderAdminCalendar();
                if (typeof initInactivityTimer === 'function') initInactivityTimer();
            });

            // ==========================================
            // CONCERNS ADMIN MANAGEMENT
            // ==========================================

            var _currentConcernId = null;
            var _allAdminConcerns = [];
            var _allAdminBookingsList = [];
            var _allAdminRequestsList = [];

            async function loadConcerns() {
                const tbody = document.getElementById('concernsTable');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;color:#6b7280;">Loading...</td></tr>';

                try {
                    const concerns = await getAllConcerns();
                    _allAdminConcerns = concerns;

                    if (!concerns.length) {
                        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af;"> No concerns submitted yet</td></tr>';
                        return;
                    }

                    // Sort: unread first, then by date (oldest first for FCFS)
                    concerns.sort((a, b) => {
                        const aUnread = a.is_read === false ? 0 : 1;
                        const bUnread = b.is_read === false ? 0 : 1;
                        if (aUnread !== bUnread) return aUnread - bUnread;
                        return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
                    });

                    const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        'in_progress': { bg: '#dbeafe', color: '#1e40af' },
                        'in-progress': { bg: '#dbeafe', color: '#1e40af' },
                        resolved: { bg: '#dcfce7', color: '#166534' },
                        closed: { bg: '#f1f5f9', color: '#475569' }
                    };

                    _pgConcernsList = concerns;
                    _pgConcernsPage = 1;
                    tbody.innerHTML = concerns.map(c => {
                        const sc = statusColors[c.status] || { bg: '#f1f5f9', color: '#374151' };
                        const badge = `<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${sc.bg};color:${sc.color};">${c.status}</span>`;
                        const submittedAt = c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : '';
                        const residentDisplay = `<div style="line-height:1.2;"><strong>${c.userName || ''}</strong><br><small style="color:#6b7280;font-size:11px;">${submittedAt}</small></div>`;
                        const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                        const responseNote = c.response ? `<div style="margin-top:4px;font-size:11px;color:#059669;font-style:italic;"> Replied</div>` : '';
                        const hasImage = c.description && c.description.includes('[ATTACHED_IMAGE_DATA]') || c.imageUrl;
                        const imgBadge = hasImage ? `<span style="margin-left:6px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 7px;border-radius:20px;font-weight:700;"> Photo</span>` : '';
                        return `<tr data-cid="${c.id}" onclick="openConcernRespond(${c.id})" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(16,185,129,0.06)'" onmouseout="this.style.background=''">
                        <td>${residentDisplay}</td>
                        <td>${c.address || ''}</td>
                        <td>${c.category || ''}</td>
                        <td>${c.title || ''}${responseNote}${imgBadge}</td>
                        <td>${date}</td>
                    </tr>`;
                    }).join('');
                    renderConcernsPg();
                } catch (e) {
                    console.error("loadConcerns crash:", e);
                    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:#ef4444;font-weight:bold;">  Error loading concerns:<br/><span style="font-size:12px;font-weight:normal;">${e.message}</span></td></tr>`;
                }
            }

            function openConcernRespond(concernId) {
                _currentConcernId = concernId;
                const concern = _allAdminConcerns.find(c => c.id === concernId);
                // Auto mark as read when opened
                if (concern && concern.is_read === false) {
                    if (typeof supabase !== "undefined") supabase.from("concerns").update({is_read: true}).eq("id", concernId).then();
                    concern.is_read = true;
                }
                
                // Update header subtitle
                const headerSub = document.getElementById('adminConcernHeaderSub');
                if (headerSub && concern) {
                    headerSub.textContent = `${concern.userName || 'Resident'}  ${concern.category || ''}  ${concern.status}`;
                }

                const detailsDiv = document.getElementById('adminConcernDetailsDiv');
                if (detailsDiv && concern) {
                    let actualDesc = concern.description || 'No description provided.';
                    let imageUrl = concern.imageUrl || null;
                    
                    if (actualDesc.includes('[ATTACHED_IMAGE_DATA]')) {
                        const parts = actualDesc.split('[ATTACHED_IMAGE_DATA]');
                        actualDesc = parts[0].trim();
                        imageUrl = parts[1].trim();
                    }

                    const submittedAt = concern.createdAt || concern.created_at
                        ? new Date(concern.createdAt || concern.created_at).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'})
                        : '';

                    let html = `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                            <div style="background:var(--panel-bg);border-radius:10px;padding:12px;border:1px solid var(--border);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Citizen</p>
                                <p style="margin:0;font-size:14px;font-weight:700;color:var(--text);">${concern.userName || ''}</p>
                            </div>
                            <div style="background:var(--panel-bg);border-radius:10px;padding:12px;border:1px solid var(--border);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Address</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:var(--text);">${concern.address || ''}</p>
                            </div>
                            <div style="background:var(--panel-bg);border-radius:10px;padding:12px;border:1px solid var(--border);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Category</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:var(--text);">${concern.category || ''}</p>
                            </div>
                            <div style="background:var(--panel-bg);border-radius:10px;padding:12px;border:1px solid var(--border);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Date Submitted</p>
                                <p style="margin:0;font-size:13px;font-weight:600;color:var(--text);">${submittedAt}</p>
                            </div>
                        </div>
                        <div style="margin-bottom:16px;background:var(--panel-bg);border-radius:10px;padding:14px;border:1px solid var(--border);">
                            <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Title</p>
                            <p style="margin:0;font-size:15px;font-weight:700;color:var(--text);">${concern.title || ''}</p>
                        </div>
                        <div style="margin-bottom:16px;background:var(--panel-bg);border-radius:10px;padding:14px;border:1px solid var(--border);">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Description / Reason</p>
                            <p style="margin:0;font-size:14px;color:var(--text);line-height:1.6;">${actualDesc || 'No description provided.'}</p>
                        </div>
                    `;
                    if (imageUrl) {
                        html += `
                            <div style="margin-bottom:16px;">
                                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;"> Attached Photo</p>
                                <div onclick="openAdminImageLightbox('${imageUrl}')" style="display:block;cursor:pointer;">
                                    <img src="${imageUrl}" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;border:1.5px solid #e5e7eb;display:block;transition:opacity 0.2s;" alt="Concern attachment" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'" />
                                </div>
                                <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;text-align:center;">Click image to open full size</p>
                            </div>
                        `;
                    }
                    detailsDiv.innerHTML = html;
                }

                // Pre-populate response textarea with existing response
                const _rt = document.getElementById('adminConcernResponseText');
                if (_rt) _rt.value = (concern && concern.response) ? concern.response : '';
                document.getElementById('adminConcernModal').style.display = 'flex';
            }

            function closeAdminConcernModal() {
                document.getElementById('adminConcernModal').style.display = 'none';
                _currentConcernId = null;
            }

            async function submitAdminConcernResponse(newStatus) {
                const concernId = _currentConcernId;
                const responseText = (document.getElementById('adminConcernResponseText') || {}).value || '';
                if (!concernId) return;
                try {
                    const updateData = { status: newStatus };
                    if (responseText.trim()) updateData.response = responseText.trim();
                    const supabaseAvail = await isSupabaseAvailable();
                    if (supabaseAvail) {
                        await supabase.from('concerns').update(updateData).eq('id', concernId);
                    }
                    const c = _allAdminConcerns.find(function(x){ return x.id === concernId; });
                    if (c) { c.status = newStatus; if (responseText.trim()) c.response = responseText.trim(); }
                    await logActivity('Concern Responded', 'Admin responded to concern #' + concernId + ' (Status: ' + newStatus + ')');
                    showAlert('Concern marked as ' + newStatus + '.', 'success');
                    closeAdminConcernModal();
                    loadConcerns();
                } catch(err) {
                    console.error('Concern respond error:', err);
                    showAlert('Failed to submit response. Please try again.', 'error');
                }
            }

            function openBookingRespond(bookingId) {
                const booking = _allAdminBookingsList.find(b => b.id === bookingId);
                if (!booking) return;

                const headerSub = document.getElementById('adminBookingHeaderSub');
                if (headerSub) {
                    headerSub.textContent = `${booking.userName || 'Resident'}  ${booking.venueName || booking.venue || 'Facility'}  ${booking.status}`;
                }

                const detailsDiv = document.getElementById('adminBookingDetailsDiv');
                if (detailsDiv) {
                    const submittedAt = booking.created_at || booking.createdAt 
                        ? new Date(booking.created_at || booking.createdAt).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'})
                        : '-';
                    const timeStr = booking.timeRange || booking.time || '-';
                    const adminCommentHtml = booking.admin_comment 
                        ? `<div style="margin-top:16px;background:#fffbeb;border-radius:10px;padding:14px;border:1px solid #fde68a;">
                               <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Admin Reply</p>
                               <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">${booking.admin_comment}</p>
                           </div>` : '';

                    detailsDiv.innerHTML = `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Citizen</p>
                                <p style="margin:0;font-size:14px;font-weight:700;color:var(--text,#111);">${booking.userName || '-'}</p>
                            </div>
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Facility</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:var(--text);">${booking.venueName || booking.venue || '-'}</p>
                            </div>
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Date & Time</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:var(--text);">${booking.date} <br> ${timeStr}</p>
                            </div>
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Processed</p>
                                <p style="margin:0;font-size:13px;font-weight:600;color:var(--text);">${submittedAt}</p>
                            </div>
                        </div>
                        <div style="margin-bottom:16px;background:var(--panel-bg,#f9fafb); border-radius:10px; padding:14px; border:1px solid var(--border,#e5e7eb);">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Purpose</p>
                            <p style="margin:0;font-size:14px;color:var(--text);line-height:1.6;">${booking.purpose || 'No description provided.'}</p>
                        </div>
                        ${adminCommentHtml}
                    `;
                }

                const actionsDiv = document.getElementById('adminBookingActionsDiv');
                if (actionsDiv) {
                    const isPending = booking.status === 'pending' || booking.status === 'booked';
                    if (isPending) {
                        actionsDiv.innerHTML = `
                            <button onclick="approveAdminBooking(${booking.id}); closeAdminBookingModal();" style="flex:1;padding:12px;background:#059669;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;"> Approve Reservation</button>
                            <button onclick="openRejectModal(${booking.id}); closeAdminBookingModal();" style="flex:1;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;"> Reject Reservation</button>
                        `;
                    } else {
                        actionsDiv.innerHTML = `
                            <p style="width:100%;font-size:13px;color:var(--muted);margin-bottom:16px;text-align:center;">This reservation has already been completely processed.</p>
                            <button type="button" onclick="closeAdminBookingModal()" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:12px;font-weight:600;cursor:pointer;background:var(--panel-bg);color:var(--text);font-family:inherit;font-size:14px;">Close</button>
                        `;
                    }
                }
                document.getElementById('adminBookingModal').style.display = 'flex';
            }

            function closeAdminBookingModal() {
                document.getElementById('adminBookingModal').style.display = 'none';
            }

            function openRequestRespond(reqId) {
                const req = _allAdminRequestsList.find(r => r.id === reqId);
                if (!req) return;

                const headerSub = document.getElementById('adminRequestHeaderSub');
                if (headerSub) {
                    headerSub.textContent = `${req.userName || 'Resident'}  ${req.equipment || 'Item'}  ${req.status}`;
                }

                const detailsDiv = document.getElementById('adminRequestDetailsDiv');
                if (detailsDiv) {
                    const submittedAt = req.created_at || req.createdAt 
                        ? new Date(req.created_at || req.createdAt).toLocaleString('en-US', {month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'})
                        : '-';
                    detailsDiv.innerHTML = `
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Resident</p>
                                <p style="margin:0;font-size:14px;font-weight:700;color:var(--text,#111);">${req.userName || '-'}</p>
                            </div>
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Item & Quantity</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:var(--text);">${req.equipment} (x${req.quantity})</p>
                            </div>
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Duration</p>
                                <p style="margin:0;font-size:14px;font-weight:600;color:var(--text);">${req.borrowDate} <br>to ${req.returnDate}</p>
                            </div>
                            <div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border,#e5e7eb);">
                                <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Requested</p>
                                <p style="margin:0;font-size:13px;font-weight:600;color:var(--text);">${submittedAt}</p>
                            </div>
                        </div>
                        <div style="margin-bottom:16px;background:var(--panel-bg,#f9fafb); border-radius:10px; padding:14px; border:1px solid var(--border,#e5e7eb);">
                            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:var(--muted,#9ca3af);text-transform:uppercase;letter-spacing:0.5px;">Purpose</p>
                            <p style="margin:0;font-size:14px;color:var(--text);line-height:1.6;">${req.purpose || 'No purpose provided.'}</p>
                        </div>
                    `;
                }

                const actionsDiv = document.getElementById('adminRequestActionsDiv');
                if (actionsDiv) {
                    if (req.status === 'pending') {
                        actionsDiv.innerHTML = `
                            <button onclick="approveRequest(${req.id}); closeAdminRequestModal();" style="flex:1;padding:12px;background:#059669;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;"> Approve Details</button>
                            <button onclick="rejectRequest(${req.id}); closeAdminRequestModal();" style="flex:1;padding:12px;background:#ef4444;color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;"> Reject</button>
                        `;
                    } else if (req.status === 'approved') {
                        actionsDiv.innerHTML = `
                            <button onclick="returnRequest(${req.id}); closeAdminRequestModal();" style="flex:1;padding:12px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;"> Mark as Returned</button>
                        `;
                    } else {
                        actionsDiv.innerHTML = `
                            <p style="width:100%;font-size:13px;color:var(--muted);margin-bottom:16px;text-align:center;">This request has already been ${req.status}.</p>
                            <button type="button" onclick="closeAdminRequestModal()" style="width:100%;padding:12px;border:1.5px solid var(--border);border-radius:12px;font-weight:600;cursor:pointer;background:var(--panel-bg);color:var(--text);font-family:inherit;font-size:14px;">Close</button>
                        `;
                    }
                }
                document.getElementById('adminRequestModal').style.display = 'flex';
            }

            function closeAdminRequestModal() {
                document.getElementById('adminRequestModal').style.display = 'none';
            }

            async function markConcernResolved(id) {
                const concern = _allAdminConcerns.find(c => c.id === id);
                if (!concern) return;

                const confirmed = await showConfirmModal(
                    'Are you sure you want to mark this concern as resolved?',
                    'Mark as Resolved',
                    'Yes, Resolve',
                    'Cancel',
                    'warning'
                );
                if (!confirmed) return;

                const ok = await updateConcernStatus(id, 'resolved', concern.response, concern.assignedTo);
                if (ok) {
                    showAlert('Concern marked as resolved!', 'success');
                    await loadConcerns();
                } else {
                    showAlert('Error resolving concern', 'error');
                }
            }

            // DOMContentLoaded for other potential form listeners goes here if needed.

        