
    (function() {
        function _getUser() {
            try {
                var u = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
                return u ? JSON.parse(u) : null;
            } catch(e) { return null; }
        }
        var user = _getUser();
        if (!user) {
            window.location.replace('login.html');
        } else if (user.role === 'admin') {
            // Admins should not be here — send to admin dashboard
            window.location.replace('admin.html');
        } else {
            // Valid user — reveal the page immediately
            document.getElementById('auth-guard-style').textContent = '';
        }
    })();
    

tailwind.config = { darkMode: ['class', '[data-theme="dark"]'] }

        // Modal Handlers for Edit Functionality
        let allMyBorrowingsCache = [];
        let allMyConcernsCache = [];
        let allMyBookingsCache = [];

        async function fetchEditRecords() {
            allMyBorrowingsCache = await getMyBorrowings();
            allMyConcernsCache = await getMyConcerns();
            allMyBookingsCache = await getCourtBookings();
        }

        async function openEditBorrowingModal(id) {
            await fetchEditRecords();
            const record = allMyBorrowingsCache.find(b => b.id === id);
            if (!record) return showToast('Record not found', 'error');

            document.getElementById('editBorrowingId').value = record.id;
            document.getElementById('editBorrowingItemName').value = record.equipment;
            document.getElementById('editBorrowingQty').value = record.quantity;
            document.getElementById('editBorrowingStartDate').value = record.borrowDate;
            document.getElementById('editBorrowingEndDate').value = record.returnDate;
            
            let purpose = record.purpose || '';
            const pMatch = purpose.match(/Purpose:\s*(.*)\s*\| Borrower:/);
            if (pMatch) purpose = pMatch[1].trim();
            document.getElementById('editBorrowingPurpose').value = purpose;

            document.getElementById('editBorrowingModal').classList.remove('hidden');
        }

        function closeEditBorrowingModal() { document.getElementById('editBorrowingModal').classList.add('hidden'); }

        document.getElementById('editBorrowingForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editBorrowingId').value);
            const rawPurpose = document.getElementById('editBorrowingPurpose').value;
            const record = allMyBorrowingsCache.find(b => b.id === id);
            let finalPurpose = rawPurpose;
            if (record && record.purpose) {
                if (record.purpose.includes('Purpose: ') && record.purpose.includes(' | Borrower:')) {
                    finalPurpose = record.purpose.replace(/Purpose:\s*(.*)\s*\|\s*Borrower:/, `Purpose: ${rawPurpose} | Borrower:`);
                }
            }

            const updates = {
                quantity: parseInt(document.getElementById('editBorrowingQty').value),
                borrowDate: document.getElementById('editBorrowingStartDate').value,
                returnDate: document.getElementById('editBorrowingEndDate').value,
                purpose: finalPurpose
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            
            const res = await updateBorrowingRequest(id, updates);
            if (res.success) { showToast(res.message, 'success'); closeEditBorrowingModal(); loadMyBorrowingsList(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            
            btn.disabled = false; btn.innerHTML = 'Save Changes';
        });

        async function openEditConcernModal(id) {
            await fetchEditRecords();
            const record = allMyConcernsCache.find(c => c.id === id);
            if (!record) return showToast('Record not found', 'error');

            document.getElementById('editConcernId').value = record.id;
            document.getElementById('editConcernTitle').value = record.title;
            document.getElementById('editConcernCategory').value = record.category;
            document.getElementById('editConcernAddress').value = record.address;
            
            let description = record.description || '';
            if (description.includes('[ATTACHED_IMAGE_DATA]')) {
                description = description.split('[ATTACHED_IMAGE_DATA]')[0].trim();
            }
            document.getElementById('editConcernDescription').value = description;

            document.getElementById('editConcernModal').classList.remove('hidden');
        }

        function closeEditConcernModal() { document.getElementById('editConcernModal').classList.add('hidden'); }

        document.getElementById('editConcernForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editConcernId').value);
            const updates = {
                title: document.getElementById('editConcernTitle').value,
                category: document.getElementById('editConcernCategory').value,
                address: document.getElementById('editConcernAddress').value,
                description: document.getElementById('editConcernDescription').value
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            
            const res = await updateConcernRequest(id, updates);
            if (res.success) { showToast(res.message, 'success'); closeEditConcernModal(); loadConcernsView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            
            btn.disabled = false; btn.innerHTML = 'Save Changes';
        });

        async function openEditCourtBookingModal(id) {
            await fetchEditRecords();
            const record = allMyBookingsCache.find(b => b.id === id);
            if (!record) return showToast('Record not found', 'error');

            document.getElementById('editCourtBookingId').value = record.id;
            
            const d = new Date(record.date);
            const dateInput = document.getElementById('editCourtDate');
            dateInput.value = record.date; // set YYYY-MM-DD
            dateInput.min = new Date().toLocaleDateString('en-CA'); // enforce future date

            const venue = record.venue || (record.venueName && record.venueName.includes('Multi-Purpose') ? 'multipurpose' : 'basketball');
            // Remove emojis internally just in case UI had them previously
            document.getElementById('editCourtVenue').value = venue.replace(/[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF\u200D]+/g, '').trim();

            const stSelect = document.getElementById('editCourtStartTime');
            const etSelect = document.getElementById('editCourtEndTime');
            stSelect.innerHTML = ''; etSelect.innerHTML = '';
            for (let i = 8; i <= 21; i++) {
                let h12 = i > 12 ? i - 12 : i;
                let ampm = i >= 12 ? 'PM' : 'AM';
                let timeStr = `${h12}:00 ${ampm}`;
                stSelect.add(new Option(timeStr, timeStr));
                etSelect.add(new Option(timeStr, timeStr));
                
                if (i !== 21) {
                    timeStr = `${h12}:30 ${ampm}`;
                    stSelect.add(new Option(timeStr, timeStr));
                    etSelect.add(new Option(timeStr, timeStr));
                }
            }

            let tRange = record.timeRange || record.time; 
            if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
            const parts = tRange.split(' – ').map(s => s.trim());
            stSelect.value = parts[0];
            if (parts[1]) etSelect.value = parts[1];

            document.getElementById('editCourtPurpose').value = record.purpose || '';

            document.getElementById('editCourtBookingModal').classList.remove('hidden');
        }

        function closeEditCourtBookingModal() { document.getElementById('editCourtBookingModal').classList.add('hidden'); }

        document.getElementById('editCourtBookingForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editCourtBookingId').value);
            const updates = {
                date: document.getElementById('editCourtDate').value,
                venue: document.getElementById('editCourtVenue').value,
                time: document.getElementById('editCourtStartTime').value,
                end_time: document.getElementById('editCourtEndTime').value,
                purpose: document.getElementById('editCourtPurpose').value
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            
            const res = await updateCourtBooking(id, updates);
            if (res.success) { showToast(res.message, 'success'); closeEditCourtBookingModal(); loadBookingView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            
            btn.disabled = false; btn.innerHTML = 'Save Changes';
        });
    











        // RBAC: Residents only — admins are redirected to admin.html
        if (!requireUser()) { throw new Error('RBAC redirect'); }
        const user = getCurrentUser();
        window.user = user; // expose globally so checkPendingNotifications can access window.user.id

        // ── Suspension Guard: check live DB on every dashboard load ──────────
        (async () => {
            try {
                if (typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable()) {
                    const { data: liveUser } = await supabase
                        .from('users')
                        .select('suspended_until')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (liveUser && liveUser.suspended_until && new Date(liveUser.suspended_until) > new Date()) {
                        const retryDate = new Date(liveUser.suspended_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                        localStorage.removeItem('currentUser');
                        sessionStorage.removeItem('currentUser');
                        window.location.href = `login.html?suspended=1&until=${encodeURIComponent(retryDate)}`;
                    }
                }
            } catch(e) { console.warn('Suspension check failed:', e); }
        })();
        // ─────────────────────────────────────────────────────────────────────

        document.getElementById('sidebarUserName').textContent = user.fullName || user.name || user.username || user.email.split('@')[0];
        document.getElementById('welcomeName').textContent = user.fullName || user.name || user.username || user.email.split('@')[0];
        document.getElementById('userInitial').textContent = (user.fullName || user.name || user.username || user.email)[0].toUpperCase();

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

        // Live clock + date for welcome banner
        function updateDashboardClock() {
            const now = new Date();
            const clockEl = document.getElementById('dashboardClock');
            const dateEl = document.getElementById('welcomeDateStr');
            if (clockEl) {
                const h = now.getHours(), m = now.getMinutes();
                const ampm = h >= 12 ? 'PM' : 'AM';
                const hh = ((h % 12) || 12).toString().padStart(2, '0');
                const mm = m.toString().padStart(2, '0');
                clockEl.textContent = hh + ':' + mm + ' ' + ampm;
            }
            if (dateEl) {
                const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                dateEl.textContent = days[now.getDay()] + ', ' + months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
            }
        }
        updateDashboardClock();
        setInterval(updateDashboardClock, 30000);

        // Panel routing
        function showPanel(panelId) {
            document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

            const p = document.getElementById('panel-' + panelId);
            if (p) p.classList.add('active');

            const navLink = document.getElementById('nav-' + panelId);
            if (navLink) navLink.classList.add('active');

            const tabBtn = document.getElementById('tab-' + panelId);
            if (tabBtn) tabBtn.classList.add('active');

            // Scroll to top of main content area on every panel switch
            const mainEl = document.querySelector('.main-content');
            if (mainEl) mainEl.scrollTop = 0;
            window.scrollTo(0, 0);

            if (panelId === 'history') loadHistoryView();
            if (panelId === 'profile') loadProfilePanel();

            switch (panelId) {
                case 'dashboard': loadDashboardStats(); break;
                case 'equipment': loadEquipmentView(); break;
                case 'concerns': loadConcernsView(); break;
                case 'booking': loadBookingView(); break;
                case 'events': loadEventsView(); break;
                case 'settings': loadSettingsView(); break;
            }
        }


        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });

        // ==========================================
        // GLOBAL VARIABLES
        // ==========================================
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let selectedDate = null;
        let currentEquipId = null;
        let selectedVenue = 'basketball';
        let borrowStartDate = null;
        let borrowReturnDate = null;
        let borrowDateSelectingStart = true;
        let allEquipmentList = [];

        // Toast
        function openSuccessModal(title, msg) {
            document.getElementById('successModalTitle').innerText = title;
            document.getElementById('successModalMessage').innerText = msg;
            const modal = document.getElementById('successModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeSuccessModal() {
            const modal = document.getElementById('successModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        function showToast(message, type = 'success') {
            let toast = document.getElementById('toast');
            if (!toast) { toast = document.createElement('div'); toast.id = 'toast'; document.body.appendChild(toast); }
            const colors = { success: 'bg-emerald-500', error: 'bg-red-500' };
            toast.className = 'fixed bottom-4 right-4 ' + (colors[type] || 'bg-gray-800') + ' text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 z-[9999] opacity-0 transform translate-y-10';
            toast.textContent = message;
            void toast.offsetWidth;
            toast.classList.remove('opacity-0', 'translate-y-10');
            toast.classList.add('opacity-100', 'translate-y-0');
            setTimeout(() => { toast.classList.remove('opacity-100', 'translate-y-0'); toast.classList.add('opacity-0', 'translate-y-10'); }, 3000);
        }

        // ==========================================
        // 1. DASHBOARD STATS
        // ==========================================
        async function loadDashboardStats() {
            try {
                const eqReqs = await getMyBorrowings();
                const activeEq = eqReqs ? eqReqs.filter(b => b.status === 'pending' || b.status === 'approved').length : 0;
                document.getElementById('stat-equipment').textContent = activeEq;
                const equEl = document.getElementById('dash-statEquip');
                if (equEl) equEl.textContent = activeEq;

                const concerns = await getMyConcerns();
                const pendingConcerns = concerns ? concerns.filter(c => c.status === 'pending').length : 0;
                document.getElementById('stat-concerns').textContent = pendingConcerns;
                const conEl = document.getElementById('dash-statConcerns');
                if (conEl) conEl.textContent = pendingConcerns;

                const bookingsRaw = await getCourtBookings();
                // Resolve real Supabase ID to prevent type mismatch (string vs integer)
                let resolvedStatUid = String(user.id);
                try {
                    const { data: uRowStat } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
                    if (uRowStat) resolvedStatUid = String(uRowStat.id);
                } catch(_) {}
                const myBookings = bookingsRaw ? bookingsRaw.filter(b =>
                    (String(b.user_id) === resolvedStatUid || String(b.userId) === resolvedStatUid) &&
                    (b.status === 'pending' || b.status === 'approved' || b.status === 'booked')
                ) : [];
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const upcomingCount = myBookings.filter(b => new Date(b.date) >= today).length;
                document.getElementById('stat-bookings').textContent = upcomingCount;
                const booEl = document.getElementById('dash-statBookings');
                if (booEl) booEl.textContent = upcomingCount;

                // Check for generic notifications (Facebook style)
                await pollBellNotifications();
                // Check for event conflict notifications
                await checkConflictNotifications();
            } catch (e) { console.error("Error loading stats", e); }
        }

        // ==========================================
        // FACEBOOK-STYLE NOTIFICATION LOGIC
        // ==========================================
        async function pollBellNotifications() {
            if (!user || typeof getUserNotifications !== 'function') return;
            try {
                // Resolve real Supabase integer ID, then cast to String to match TEXT column in user_notifications
                let resolvedNotifId = String(user.id);
                try {
                    const { data: uRowN } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
                    if (uRowN) resolvedNotifId = String(uRowN.id);
                } catch(_) {}
                const notifs = await getUserNotifications(resolvedNotifId);
                renderBellNotifications(notifs);
            } catch (e) { console.error('Error polling bell notifications:', e); }
        }
        
        // Auto-poll every 15 seconds
        setInterval(pollBellNotifications, 15000);

        
            function toggleProfileDropdown(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('profileDropdownContainer');
                if (dropdown) dropdown.classList.toggle('hidden');
                
                // Hide Bell if open
                const bell = document.getElementById('bellDropdownContainer');
                if (bell && !bell.classList.contains('hidden')) bell.classList.add('hidden');
            }
            function toggleMobileProfileDropdown(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('mobileProfileDropdownContainer');
                if (dropdown) dropdown.classList.toggle('hidden');
                const bell = document.getElementById('bellDropdownContainer');
                if (bell && !bell.classList.contains('hidden')) bell.classList.add('hidden');
            }
            document.addEventListener('click', () => {
                const pd = document.getElementById('profileDropdownContainer');
                if (pd) pd.classList.add('hidden');
                const mpd = document.getElementById('mobileProfileDropdownContainer');
                if (mpd) mpd.classList.add('hidden');
                const bd = document.getElementById('bellDropdownContainer');
                if (bd) bd.classList.add('hidden');
            });
            
            document.addEventListener('DOMContentLoaded', () => {
                const spForm = document.getElementById('standaloneProfileForm');
                if (spForm) {
                    spForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        const origBtn = btn.innerHTML;
                        btn.innerHTML = 'Saving...'; btn.disabled = true;
                        try {
                            const { data, error } = await _supabase.from('profiles').update({
                                full_name: document.getElementById('p-fullName').value,
                                contact_number: document.getElementById('p-phone').value,
                                address: document.getElementById('p-address').value
                            }).eq('id', getCurrentUser().id);

                            if (error) throw error;
                            
                            const user = getCurrentUser();
                            user.fullName = document.getElementById('p-fullName').value;
                            user.contactNumber = document.getElementById('p-phone').value;
                            user.address = document.getElementById('p-address').value;
                            localStorage.setItem('barangay_user', JSON.stringify(user));
                            
                            showAlert('Profile updated successfully!', 'success');
                            
                            document.getElementById('sidebarUserName').textContent = user.fullName;
                            const mobileName = document.getElementById('mobileUserName');
                            if (mobileName) mobileName.textContent = user.fullName;
                        } catch(err) {
                            showAlert(err.message, 'error');
                        } finally {
                            btn.innerHTML = origBtn; btn.disabled = false;
                        }
                    });
                }
            });

            function toggleBellDropdown(e) {
            const container = document.getElementById('bellDropdownContainer');
            if (container) {
                if (container.classList.contains('hidden')) {
                    container.classList.remove('hidden');
                    container.classList.add('flex');
                } else {
                    container.classList.add('hidden');
                    container.classList.remove('flex');
                }
            }
            if (e) e.stopPropagation();
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            const container = document.getElementById('bellDropdownContainer');
            const desktopBellBtn = document.getElementById('desktopBellBtn');
            const mobileBellBtn = document.querySelector('.mobile-header-btn[title="Notifications"]');
            
            if (container && !container.classList.contains('hidden')) {
                if (!container.contains(e.target) && 
                    (!desktopBellBtn || !desktopBellBtn.contains(e.target)) && 
                    (!mobileBellBtn || !mobileBellBtn.contains(e.target))) {
                    container.classList.add('hidden');
                    container.classList.remove('flex');
                }
            }
        });

        function renderBellNotifications(notifs) {
            window.currentBellNotifs = notifs;
            const listEl = document.getElementById('bellDropdownList');
            const emptyEl = document.getElementById('bellEmptyState');
            const desktopBadge = document.getElementById('bellBadgeDesktop');
            const mobileBadge = document.getElementById('bellBadgeMobile');

            if (!listEl || !emptyEl || !desktopBadge || !mobileBadge) return;

            // Clear existing list except the empty state element
            Array.from(listEl.children).forEach(child => {
                if (child.id !== 'bellEmptyState') child.remove();
            });

            if (!notifs || notifs.length === 0) {
                emptyEl.classList.remove('hidden');
                desktopBadge.classList.add('hidden');
                mobileBadge.classList.add('hidden');
                return;
            }

            const unreadCount = notifs.filter(n => !n.isRead).length;

            if (unreadCount > 0) {
                desktopBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                mobileBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                desktopBadge.classList.remove('hidden');
                mobileBadge.classList.remove('hidden');
            } else {
                desktopBadge.classList.add('hidden');
                mobileBadge.classList.add('hidden');
            }

            emptyEl.classList.add('hidden');

            notifs.forEach(n => {
                const isUnread = !n.isRead;
                const containerCss = isUnread 
                    ? "px-4 py-3 border-b border-gray-100 flex items-start gap-3 bg-emerald-50/50 hover:bg-emerald-100/50 cursor-pointer transition dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 relative" 
                    : "px-4 py-3 border-b border-gray-100 flex items-start gap-3 bg-white hover:bg-gray-50 cursor-pointer transition dark:bg-slate-900/50 dark:border-slate-700 dark:hover:bg-slate-800 relative";

                const titleCss = isUnread 
                    ? "font-bold text-[13px] text-gray-800 dark:text-gray-100 cursor-pointer" 
                    : "font-medium text-[13px] text-gray-600 dark:text-gray-300 cursor-pointer";
                
                const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now';

                let iconHtml = '<i class="bi bi-bell-fill"></i>';
                if (n.type === 'booking_approved') iconHtml = '📅';
                if (n.type === 'booking_rejected') iconHtml = '❌';
                if (n.type === 'concern_resolved') iconHtml = '✅';
                if (n.type === 'equipment_approved') iconHtml = '📦';
                if (n.type === 'booking_cancelled' || n.type === 'event_conflict') iconHtml = '⚠️';
                if (n.type === 'event_added') iconHtml = '🎉';

                const html = `
                    <div class="${containerCss}" onclick="handleBellClick('${n.id}')">
                        ${isUnread ? '<div class="absolute w-2 h-2 rounded-full bg-emerald-500 top-4 right-4"></div>' : ''}
                        <div class="text-xl bg-gray-100 dark:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                            ${iconHtml}
                        </div>
                        <div class="flex-1 min-w-0 pr-4 cursor-pointer">
                            <p class="${titleCss}">${n.message}</p>
                            <span class="text-[11px] font-semibold text-emerald-600 mt-1 block cursor-pointer">${timeStr}</span>
                        </div>
                    </div>
                `;
                listEl.insertAdjacentHTML('beforeend', html);
            });
        }

        async function handleBellClick(notifId) {
            // Find notification details
            const notif = (window.currentBellNotifs || []).find(n => String(n.id) === String(notifId));
            if (notif) {
                const modal = document.getElementById('bellDetailsModal');
                const titleEl = document.getElementById('bdModalTitle');
                const msgEl = document.getElementById('bdModalMsg');
                const iconEl = document.getElementById('bdModalIcon');
                if (modal && titleEl && msgEl && iconEl) {
                    let iconHtml = '<i class="bi bi-bell-fill"></i>', titleText = 'Notification';
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
        }

        window.markAllBellNotificationsRead = async () => {
            if (typeof markAllUserNotificationsRead === 'function') {
                await markAllUserNotificationsRead(user.id);
                pollBellNotifications();
            }
        };

        // ==========================================
        // BOOKING CONFLICT NOTIFICATION FLOW
        // ==========================================
        let _activeConflictNotif = null;

        async function checkConflictNotifications() {
            try {
                if (typeof getPendingCancellationNotifications !== 'function') return;
                const notifs = await getPendingCancellationNotifications(user.id);
                
                const eqNotifs = notifs.filter(n => n.type === 'equipment_approved');
                if (eqNotifs.length > 0) {
                    _activeConflictNotif = eqNotifs[0];
                    const modal = document.getElementById('successModal');
                    if (modal) {
                         document.getElementById('successModalTitle').textContent = 'Request Approved!';
                         document.getElementById('successModalMessage').textContent = _activeConflictNotif.message;
                         
                         const okBtn = modal.querySelector('button');
                         if (okBtn) okBtn.setAttribute('onclick', 'dismissEquipmentNotification()');
                         
                         modal.classList.remove('hidden');
                         modal.classList.add('flex');
                    }
                    return;
                }

                // booking_cancelled is handled exclusively by checkPendingNotifications to avoid duplicate popups
                const conflicts = notifs.filter(n => n.type === 'event_conflict');
                if (conflicts.length === 0) return;
                _activeConflictNotif = conflicts[0];
                const meta = _activeConflictNotif.meta || {};
                const msgEl = document.getElementById('conflictNotifMsg');
                if (msgEl) msgEl.textContent = _activeConflictNotif.message ||
                    `Your court booking on ${meta.date || 'a scheduled date'} was cancelled due to an official event: "${meta.event_title || 'Barangay Event'}". Please reschedule.`;
                const modal = document.getElementById('conflictNotifModal');
                if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            } catch(err) { console.warn('Conflict notification check failed:', err); }
        }

        function handleConflictReschedule() {
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
        }

        async function dismissEquipmentNotification() {
            const modal = document.getElementById('successModal');
            if (modal) { 
                modal.classList.add('hidden'); 
                modal.classList.remove('flex'); 
                const okBtn = modal.querySelector('button');
                if (okBtn) okBtn.setAttribute('onclick', 'closeSuccessModal()');
            }
            
            if (_activeConflictNotif && typeof markUserNotificationAsRead === 'function') {
                await markUserNotificationAsRead(_activeConflictNotif.id);
            }
            
            _activeConflictNotif = null;
            checkConflictNotifications(); // check for more notifications
        }

        function handleConflictCancel() {
            // Step 1: Close choice modal, show confirmation dialog
            const choiceModal = document.getElementById('conflictNotifModal');
            if (choiceModal) { choiceModal.classList.add('hidden'); choiceModal.classList.remove('flex'); }
            const confirmModal = document.getElementById('conflictConfirmModal');
            if (confirmModal) { confirmModal.classList.remove('hidden'); confirmModal.classList.add('flex'); }
        }

        async function confirmCancelBooking() {
            const confirmModal = document.getElementById('conflictConfirmModal');
            if (confirmModal) { confirmModal.classList.add('hidden'); confirmModal.classList.remove('flex'); }
            if (!_activeConflictNotif) return;
            const meta = _activeConflictNotif.meta || {};
            const bookingId = meta.booking_id;
            
            // Completely delete the booking so it is entirely wiped from the system
            if (bookingId && typeof deleteCourtBooking === 'function') {
                const res = await deleteCourtBooking(bookingId);
                // We ignore 'not found' errors since the admin might have already deleted it natively
            }
            
            if (typeof markUserNotificationAsRead === 'function') {
                await markUserNotificationAsRead(_activeConflictNotif.id);
            }
            _activeConflictNotif = null;
            showToast('Your booking has been cancelled.', 'success');
            await loadBookingView();
            await loadDashboardStats();
        }

        function backToConflictChoice() {
            // Step: "No" on confirmation <i class="bi bi-arrow-right"></i> go back to Reschedule/Cancel choice
            const confirmModal = document.getElementById('conflictConfirmModal');
            if (confirmModal) { confirmModal.classList.add('hidden'); confirmModal.classList.remove('flex'); }
            const choiceModal = document.getElementById('conflictNotifModal');
            if (choiceModal) { choiceModal.classList.remove('hidden'); choiceModal.classList.add('flex'); }
        }

        // ==========================================
        // 2. EQUIPMENT VIEW
        // ==========================================
        function renderEquipmentGrid(list) {
            const grid = document.getElementById('equipmentGrid');
            if (!list || list.length === 0) { grid.innerHTML = '<p class="text-gray-500 italic col-span-2">No equipment found.</p>'; return; }
            grid.innerHTML = list.map(item => {
                // Sanity check
                item.available = Math.min(item.available || 0, item.quantity || 1);
                const pct = Math.min(100, Math.round((item.available / item.quantity) * 100));
                let color = 'bg-emerald-500', statusColor = 'text-emerald-600', statusBg = 'bg-emerald-50', statusIcon = '✓';
                if (pct < 50) { color = 'bg-amber-500'; statusColor = 'text-amber-600'; statusBg = 'bg-amber-50'; statusIcon = '⚠'; }
                if (pct < 25) { color = 'bg-red-500'; statusColor = 'text-red-600'; statusBg = 'bg-red-50'; statusIcon = '✕'; }
                const ok = item.available > 0;
                let actionBtn = '';
                if (item.isLocked) {
                    actionBtn = '<button disabled class="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold rounded-xl shadow-inner cursor-not-allowed flex justify-center items-center gap-2"><i class="bi bi-lock-fill"></i> System Locked</button>';
                } else if (ok) {
                    actionBtn = '<button onclick="openBorrowModalWithEquip(' + item.id + ')" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition transform hover:-translate-y-1 shadow-md cursor-pointer border-none flex justify-center items-center gap-2"><i class="bi bi-pencil-square"></i> Request to Borrow</button>';
                } else {
                    actionBtn = '<div class="w-full py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 text-center flex justify-center items-center gap-2"><i class="bi bi-exclamation-circle-fill"></i> Out of stock</div>';
                }

                const pendingBadge = (item.pending && item.pending > 0)
                    ? '<div class="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></span><span class="text-xs font-semibold text-amber-700">⏳ ' + item.pending + ' unit' + (item.pending > 1 ? 's' : '') + ' pending</span></div>'
                    : '';

                const imageName = item.name ? item.name.toLowerCase().replace(/\s+/g, '-') + '.jpg' : 'BARANGAY SUN LOGO.jpg';

                return `<div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                    <!-- Image Header -->
                    <div class="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                        <img src="${imageName}" alt="${item.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='../BARANGAY SUN LOGO.jpg'; this.onerror=null;">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div class="absolute top-3 right-3">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}">${statusIcon} ${item.available} Available</span>
                        </div>
                        ${item.isLocked ? '<div class="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md flex items-center gap-1"><i class="bi bi-lock-fill"></i> Locked</div>' : ''}
                        <div class="absolute bottom-3 left-4 right-4">
                            <h4 class="font-extrabold text-xl text-white leading-tight drop-shadow-md">${item.name}</h4>
                            <p class="text-xs text-gray-200 font-medium drop-shadow-md">${item.category || 'General Equipment'}</p>
                        </div>
                    </div>
                    
                    <!-- Details Section -->
                    <div class="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Availability</span>
                                <span class="text-xs font-bold ${statusColor}">${pct}%</span>
                            </div>
                            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                                <div class="${color} h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                            </div>
                            ${pendingBadge}
                        </div>
                        
                        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            ${actionBtn}
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        async function loadEquipmentView() {
            console.log('[DEBUG] loadEquipmentView called');
            try {
                const list = await getEquipment();
                console.log('[DEBUG] getEquipment returned:', list);
                allEquipmentList = list;
                renderEquipmentGrid(list);
                loadMyBorrowingsList();
            } catch(err) {
                console.error('[DEBUG] loadEquipmentView error:', err);
            }
        }

        // ── Equipment Search Filter ──────────────────────────────
        function filterEquipmentGrid() {
            const query = (document.getElementById('equipmentSearchInput')?.value || '').toLowerCase().trim();
            const grid  = document.getElementById('equipmentGrid');
            const empty = document.getElementById('equipmentSearchEmpty');
            if (!grid) return;

            const cards = grid.children;
            let visible = 0;
            Array.from(cards).forEach(card => {
                const text = card.textContent.toLowerCase();
                const show = !query || text.includes(query);
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (empty) empty.style.display = (visible === 0 && query) ? 'block' : 'none';
        }

        // ── Borrowing History Search Filter ─────────────────────
        function filterBorrowingsList() {
            const query = (document.getElementById('borrowingSearchInput')?.value || '').toLowerCase().trim();
            const list  = document.getElementById('myBorrowingsList');
            const empty = document.getElementById('borrowingSearchEmpty');
            if (!list) return;

            // Notice: The container might have only the empty state `<p>` element initially.
            const cards = list.querySelectorAll('.group'); // Only filter actual cards
            if (cards.length === 0) return;

            let visible = 0;
            Array.from(cards).forEach(card => {
                const text = card.textContent.toLowerCase();
                const show = !query || text.includes(query);
                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });
            if (empty) empty.style.display = (visible === 0 && query) ? 'block' : 'none';
        }

        function getEquipmentIcon(name) {
            // Exact same icon map as Admin Inventory
            const EQUIP_ICON_MAP = {
                'Chairs':      { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><rect x="6" y="2" width="12" height="10" rx="1.5"/><rect x="4" y="13" width="16" height="3" rx="1.5"/><rect x="6" y="17" width="3" height="5" rx="1"/><rect x="15" y="17" width="3" height="5" rx="1"/></svg>`, cls: 'eq-Chairs' },
                'Tables':      { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#059669"><rect x="1" y="7" width="22" height="3" rx="1.5"/><rect x="3" y="10" width="2.5" height="10" rx="1.25"/><rect x="18.5" y="10" width="2.5" height="10" rx="1.25"/><rect x="5" y="10" width="14" height="1.5" rx="0.75"/></svg>`, cls: 'eq-Tables' },
                'Tents':       { html: `<i class="bi bi-house-door-fill" style="font-size:20px;color:#d97706;"></i>`, cls: 'eq-Tents' },
                'Ladder':      { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#d97706"><rect x="5" y="1" width="2.5" height="22" rx="1.25"/><rect x="16.5" y="1" width="2.5" height="22" rx="1.25"/><rect x="5" y="4" width="14" height="2" rx="1"/><rect x="5" y="10" width="14" height="2" rx="1"/><rect x="5" y="16" width="14" height="2" rx="1"/></svg>`, cls: 'eq-Ladder' },
                'Microphone':  { html: `<i class="bi bi-mic-fill" style="font-size:20px;color:#dc2626;"></i>`, cls: 'eq-Microphone' },
                'Speaker':     { html: `<i class="bi bi-speaker-fill" style="font-size:20px;color:#7c3aed;"></i>`, cls: 'eq-Speaker' },
                'Electric Fan':{ html: `<i class="bi bi-fan" style="font-size:20px;color:#3b82f6;"></i>`, cls: 'eq-Fan' }
            };
            const entry = name ? EQUIP_ICON_MAP[name.trim()] : null;
            const iconHtml = entry ? entry.html : `<i class="bi bi-box-seam-fill" style="font-size:20px;color:#059669;"></i>`;
            const iconCls  = entry ? entry.cls  : 'eq-Default';
            return `<div class="eq-icon ${iconCls}">${iconHtml}</div>`;
        }


        async function loadMyBorrowingsList() {
            // Ensure equipment list is loaded so icons work correctly
            if (!allEquipmentList || allEquipmentList.length === 0) {
                try { allEquipmentList = await getEquipment(); } catch(e) { /* continue with keyword fallback */ }
            }
            const list = await getMyBorrowings();
            const container = document.getElementById('myBorrowingsList');
            if (!list || list.length === 0) {
                container.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-center col-span-full"><div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4"><i class="bi bi-box-seam"></i></div><p class="text-gray-500 font-medium">No borrowing history yet</p></div>';
                return;
            }
            const sorted = [...list].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            container.innerHTML = sorted.map(b => {
                let statusBadge = '', statusBorder = 'border-emerald-200';
                if (b.status === 'pending') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>Pending</span>'; statusBorder = 'border-amber-200'; }
                if (b.status === 'approved') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Approved</span>'; statusBorder = 'border-emerald-200'; }
                if (b.status === 'rejected') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>'; statusBorder = 'border-red-200'; }
                if (b.status === 'returned') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Returned</span>'; statusBorder = 'border-blue-200'; }
                const rejectionMsg = (b.status === 'rejected' && b.rejection_reason) ? '<div class="mt-3 text-xs bg-red-50 p-3 rounded-lg border border-red-100"><strong class="text-red-700">Reason:</strong> <span class="text-red-600">' + b.rejection_reason + '</span></div>' : '';
                const equipIcon = getEquipmentIcon(b.equipment);
                return '<div class="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ' + statusBorder + ' shadow-sm hover:shadow-md transition-all duration-300">' +
                    '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div class="flex items-start gap-4">' + equipIcon + 
                    '<div><h4 class="font-bold text-lg text-gray-800 dark:text-white">' + b.equipment + '</h4><p class="text-sm text-gray-500 font-medium">Quantity: <span class="text-emerald-600 font-bold">x' + b.quantity + '</span></p></div></div>' +
                    '<div class="flex flex-col items-end gap-2">' + statusBadge + '<div class="text-xs text-gray-400 flex items-center gap-1">📅 ' + formatDate(b.borrowDate) + ' <i class="bi bi-arrow-right"></i> ' + formatDate(b.returnDate) + '</div></div></div>' +
                    rejectionMsg +
                    (b.status === 'pending' ? '<div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"><p class="text-xs text-amber-600 font-medium flex items-center gap-1">⏳ Waiting for approval</p><div class="flex gap-2"><button onclick="cancelEqRequest(' + b.id + ')" class="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Cancel</button></div></div>' : '') +
                    '</div>';
            }).join('');
        }

        // ==========================================
        // BORROW MODAL LOGIC
        // ==========================================
        /* Duplicate openBorrowModalWithEquip removed */

        function openBorrowModal() { showToast('Please click Borrow on a specific equipment card', 'error'); }
        function closeBorrowModal() { document.getElementById('borrowModal').classList.add('hidden'); borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true; }

        // Submit button validation
        function updateBorrowSubmitButton() {
            const btn = document.getElementById('submitBorrowBtn');
            const qty = parseInt(document.getElementById('borrowQty').value);
            const purpose = document.getElementById('borrowPurpose').value;
            const name = document.getElementById('borrowerFullName').value;
            const contact = document.getElementById('borrowerContact').value;
            btn.disabled = !(borrowStartDate && borrowReturnDate && qty > 0 && purpose.trim() !== '' && name.trim() !== '' && contact.trim() !== '');
        }
        document.getElementById('borrowQty')?.addEventListener('input', updateBorrowSubmitButton);
        document.getElementById('borrowPurpose')?.addEventListener('input', updateBorrowSubmitButton);
        document.getElementById('borrowerFullName')?.addEventListener('input', updateBorrowSubmitButton);
        document.getElementById('borrowerContact')?.addEventListener('input', updateBorrowSubmitButton);

        function updateBorrowDateDisplays() {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            const bDisp = document.getElementById('borrowDateDisplay');
            const rDisp = document.getElementById('returnDateDisplay');
            const dpStartDay = document.getElementById('dispStartDateDay');
            const dpStartMonth = document.getElementById('dispStartDateMonth');
            const dpReturnDay = document.getElementById('dispReturnDateDay');
            const dpReturnMonth = document.getElementById('dispReturnDateMonth');
            const durText = document.getElementById('borrowDuration');
            const rangeDisplay = document.getElementById('dateRangeDisplay');

            if (borrowStartDate) {
                const d = new Date(borrowStartDate);
                if (bDisp) {
                    bDisp.innerHTML = '<div class="text-lg font-bold text-emerald-700">' + fullMonths[d.getMonth()] + ' ' + d.getDate() + '</div><div class="text-xs text-emerald-500">' + d.getFullYear() + '</div>';
                    bDisp.classList.add('border-emerald-400', 'bg-emerald-100');
                }
                if (dpStartDay) { dpStartDay.textContent = d.getDate(); dpStartMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                if (rangeDisplay) rangeDisplay.textContent = 'Now select a return date from the calendar';
            } else {
                if (bDisp) {
                    bDisp.innerHTML = '<div class="text-lg font-bold text-emerald-700">Select date</div><div class="text-xs text-emerald-500">from calendar</div>';
                    bDisp.classList.remove('border-emerald-400', 'bg-emerald-100');
                }
                if (dpStartDay) { dpStartDay.textContent = '--'; dpStartMonth.textContent = 'Select date'; }
                if (rangeDisplay) rangeDisplay.textContent = 'Please select your borrowing dates from the calendar';
            }
            if (borrowReturnDate) {
                const d = new Date(borrowReturnDate);
                if (rDisp) {
                    rDisp.innerHTML = '<div class="text-lg font-bold text-teal-700">' + fullMonths[d.getMonth()] + ' ' + d.getDate() + '</div><div class="text-xs text-teal-500">' + d.getFullYear() + '</div>';
                    rDisp.classList.add('border-teal-400', 'bg-teal-100');
                }
                if (dpReturnDay) { dpReturnDay.textContent = d.getDate(); dpReturnMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                const start = new Date(borrowStartDate);
                const diffDays = Math.ceil(Math.abs(d - start) / (1000*60*60*24)) + 1;
                if (durText) durText.textContent = diffDays + (diffDays > 1 ? ' days' : ' day');
                if (rangeDisplay) rangeDisplay.innerHTML = '<span class="text-emerald-600">📅 ' + fullMonths[start.getMonth()] + ' ' + start.getDate() + ' <i class="bi bi-arrow-right"></i> ' + fullMonths[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</span> <span class="ml-2 px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">' + diffDays + ' day' + (diffDays > 1 ? 's' : '') + '</span>';
            } else {
                if (rDisp) {
                    rDisp.innerHTML = '<div class="text-lg font-bold text-teal-700">Select date</div><div class="text-xs text-teal-500">from calendar</div>';
                    rDisp.classList.remove('border-teal-400', 'bg-teal-100');
                }
                if (dpReturnDay) { dpReturnDay.textContent = '--'; dpReturnMonth.textContent = 'Select date'; if (durText) durText.textContent = '0 days'; }
            }
        }

        function renderBorrowCalendar() {
            const grid = document.getElementById('borrowCalendarGrid');
            const monthTitle = document.getElementById('borrowMonthTitle');
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            monthTitle.textContent = months[currentMonth] + ' ' + currentYear;
            grid.innerHTML = '';
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = new Date(); today.setHours(0,0,0,0);
            for (let i = 0; i < firstDay; i++) { grid.appendChild(document.createElement('div')); }
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                const dateObj = new Date(currentYear, currentMonth, day);
                const dayDiv = document.createElement('div');
                dayDiv.className = 'p-2.5 rounded-lg text-center cursor-pointer font-bold text-sm transition transform hover:scale-105 ';
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                if (dateObj < today) {
                    dayDiv.style.cssText = isDark
                        ? 'background:#374151;color:#6b7280;cursor:not-allowed;'
                        : 'background:#f3f4f6;color:#9ca3af;cursor:not-allowed;';
                } else {
                    dayDiv.style.cssText = isDark
                        ? 'background:#374151;color:#34d399;border:1px solid #4b5563;cursor:pointer;'
                        : 'background:#ecfdf5;color:#047857;border:1px solid #d1fae5;cursor:pointer;';
                    dayDiv.onmouseenter = () => { if(!['borrowStartDate','borrowReturnDate'].some(k=>window[k]===dateStr)) dayDiv.style.background = isDark ? '#4b5563' : '#a7f3d0'; };
                    dayDiv.onmouseleave = () => { if(!['borrowStartDate','borrowReturnDate'].some(k=>window[k]===dateStr)) dayDiv.style.background = isDark ? '#374151' : '#ecfdf5'; };
                    dayDiv.onclick = () => selectBorrowDate(dateStr);
                }
                if (dateObj.getTime() === today.getTime()) { dayDiv.style.outline = '2px solid #10b981'; dayDiv.style.outlineOffset = '2px'; }
                if (borrowStartDate === dateStr) { dayDiv.style.cssText = 'background:#10b981;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(16,185,129,0.4);outline:2px solid #6ee7b7;outline-offset:0;'; }
                if (borrowReturnDate === dateStr) { dayDiv.style.cssText = 'background:#0d9488;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(13,148,136,0.4);outline:2px solid #5eead4;outline-offset:0;'; }
                if (borrowStartDate && borrowReturnDate) {
                    const start = new Date(borrowStartDate); const end = new Date(borrowReturnDate);
                    if (dateObj > start && dateObj < end) { dayDiv.style.background = isDark ? '#064e3b' : '#d1fae5'; dayDiv.style.color = isDark ? '#6ee7b7' : '#065f46'; }
                }
                dayDiv.textContent = day;
                grid.appendChild(dayDiv);

            }
        }

        function selectBorrowDate(dateStr) {
            const today = new Date(); today.setHours(0,0,0,0);
            if (new Date(dateStr) < today) return showToast('Cannot select past dates', 'error');
            if (borrowDateSelectingStart) {
                borrowStartDate = dateStr; borrowReturnDate = null; borrowDateSelectingStart = false;
                showToast('Now select the return date', 'success');
            } else {
                if (new Date(dateStr) < new Date(borrowStartDate)) return showToast('Return date must be after borrow date', 'error');
                
                const diffTime = Math.abs(new Date(dateStr) - new Date(borrowStartDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    return showToast('You can only borrow equipment for a maximum of 7 days (1 week).', 'error');
                }
                
                borrowReturnDate = dateStr; borrowDateSelectingStart = true;
            }
            updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton();
        }

        function changeBorrowMonth(delta) {
            currentMonth += delta;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            renderBorrowCalendar();
        }

        // Borrow Form Submission
        document.getElementById('borrowForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            const equipId = parseInt(document.getElementById('borrowEquipmentId').value);
            const qty = parseInt(document.getElementById('borrowQty').value);
            const purposeStr = document.getElementById('borrowPurpose').value;
            const fullName = document.getElementById('borrowerFullName').value;
            const contact = document.getElementById('borrowerContact').value;
            const address = document.getElementById('borrowerAddress').value;
            
            const borrowTime = document.getElementById('borrowTime').value;
            const returnTime = document.getElementById('returnTime').value;
            
            const borrowDate = borrowStartDate;
            const returnDate = borrowReturnDate;
            
            if (!equipId) return showToast('Please select an equipment item', 'error');
            if (!borrowDate || !returnDate) return showToast('Please select both dates', 'error');
            if (!borrowTime || !returnTime) return showToast('Please select the pickup and return times', 'error');

            const diffTime = Math.abs(new Date(returnDate) - new Date(borrowDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 7) {
                return showToast('You can only borrow equipment for a maximum of 7 days (1 week).', 'error');
            }
            
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Submitting...';
            
            // Format time string for 12-hour AM/PM purely for readability in logs
            const formatTime = (time24h) => {
                let [h, m] = time24h.split(':');
                h = parseInt(h);
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${m} ${ampm}`;
            };
            
            const fullPurpose = `[Time: ${formatTime(borrowTime)} to ${formatTime(returnTime)}] | Purpose: ${purposeStr} | Borrower: ${fullName} | Contact: ${contact} | Address: ${address}`;
            const result = await borrowEquipment(equipId, qty, borrowDate, returnDate, fullPurpose);
            
            if (result.success) { 
                showToast('✅ ' + result.message, 'success'); 
                closeBorrowModal(); 
                await loadEquipmentView(); 
                await loadDashboardStats(); 
            } else { 
                showToast(result.message, 'error'); 
            }
            btn.disabled = false; btn.innerHTML = '✅ Submit Borrow Request';
        });

        /* cancelEqRequest moved down */

        // ==========================================
        // 3. CONCERNS
        // ==========================================
        async function loadConcernsView() {
            const concerns = await getMyConcerns();
            const container = document.getElementById('myConcernsList');

            if (!concerns || concerns.length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have not submitted any concerns yet.</p>';
                return;
            }
            const sorted = [...concerns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = sorted.map(c => {
                let statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">⏳ Pending</span>';
                if (c.status === 'in-progress') statusBadge = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">🔄 In Progress</span>';
                if (c.status === 'resolved') statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">✅ Resolved</span>';
                if (c.status === 'rejected') statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">❌ Rejected</span>';
                
                let actualDescription = c.description || 'No description provided';
                let attachedImageHtml = '';
                
                if (actualDescription.includes('[ATTACHED_IMAGE_DATA]')) {
                    const parts = actualDescription.split('[ATTACHED_IMAGE_DATA]');
                    actualDescription = parts[0].replace(/Usern/g, '').trim();
                    const b64 = parts[1].replace(/Usern/g, '').trim();
                    attachedImageHtml = '<div class="mt-3"><img src="' + b64 + '" class="max-h-24 rounded-lg border shadow-sm object-cover" style="border-color: var(--border-color);" alt="Attached photo"></div>';
                }

                return '<div class="p-4 rounded-xl border hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex flex-col h-full" style="border-color: var(--border-color);">' +
                    '<div class="flex justify-between items-start mb-2">' +
                    '<h4 class="font-bold text-base line-clamp-1" style="color: var(--text-main);">' + c.title + '</h4>' +
                    statusBadge +
                    '</div>' +
                    '<p class="text-xs opacity-80 mb-2 flex-grow" style="color: var(--text-main);">' + actualDescription + '</p>' +
                    attachedImageHtml + 
                    '<div class="flex items-center justify-between mt-3 pt-3 border-t" style="border-color: var(--border-color);">' +
                    '<div class="flex items-center gap-3 text-xs mt-1" style="color: var(--text-muted);"><span class="bg-gray-100 px-2 py-0.5 rounded">' + c.category + '</span><span>📅 ' + formatDate(c.createdAt) + '</span></div>' +
                    (c.status === 'pending' ? '<div class="flex gap-2"><button onclick="openEditConcernModal(' + c.id + ')" class="text-xs text-blue-500 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">✏️ Edit</button><button onclick="deleteMyConcern(' + c.id + ')" class="text-xs text-red-500 hover:text-red-700 font-semibold bg-red-50 px-2 py-1 rounded">Delete</button></div>' : '') +
                    '</div>' +
                    (c.response ? '<div class="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg mt-3"><p class="text-xs font-bold text-emerald-700 mb-1">🏛️ Admin Response:</p><p class="text-sm text-emerald-800">' + c.response + '</p></div>' : '') +
                    '</div>';
            }).join('');
        }

        // ==========================================
        // HISTORY / ACTIVITY PANEL LOGIC
        // ==========================================
        async function openBorrowModalWithEquip(equipId) {
            const list = await getEquipment();
            const item = list.find(e => e.id === equipId);
            if (!item) return;
            
            document.getElementById('borrowModalTitle').innerHTML = item.name;
            
            const imageName = item.name ? item.name.toLowerCase().replace(/\s+/g, '-') + '.jpg' : 'BARANGAY SUN LOGO.jpg';
            document.getElementById('borrowModalImage').src = imageName;
            
            const badge = document.getElementById('borrowModalStockBadge');
            if (badge) {
                badge.innerHTML = `${item.available} Available`;
                badge.className = item.available > 0 ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-emerald-500/90 text-white backdrop-blur-md' : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-red-500/90 text-white backdrop-blur-md';
            }

            document.getElementById('borrowEquipmentId').value = equipId;
            document.getElementById('borrowEquipmentName').value = item.name;
            document.getElementById('borrowQty').max = item.available;
            document.getElementById('borrowQty').value = 1;
            
            const helpEl = document.getElementById('borrowMaxHelp');
            if(helpEl) helpEl.innerHTML = '📦 Max: ' + item.available + ' units available';
            
            // Show pending notice if applicable
            if (item.pending && item.pending > 0 && helpEl) {
                helpEl.innerHTML += ' <br><span style="color:#b45309;font-size:11px;font-weight:600;">⚠️ ' + item.pending + ' unit(s) pending from other users</span>';
            }

            document.getElementById('borrowPurpose').value = '';
            document.getElementById('borrowerFullName').value = user.name || '';
            document.getElementById('borrowerContact').value = '';
            document.getElementById('borrowerAddress').value = user.address || '';
            document.getElementById('borrowTime').value = '';
            document.getElementById('returnTime').value = '';
            
            initBorrowCalendar();
            document.getElementById('borrowModal').classList.remove('hidden');
        }

        document.getElementById('concernForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]'); 
            btn.disabled = true; 
            btn.innerHTML = 'Submitting...';

            const category = document.getElementById('concernCategory').value;
            const title = document.getElementById('concernTitle').value;
            const desc = document.getElementById('concernDescription').value;
            const loc = document.getElementById('concernLocation').value;
            const imageInput = document.getElementById('concernImage');
            
            let imageFile = null;

            if (imageInput.files.length > 0) {
                imageFile = imageInput.files[0];
            }

            btn.innerHTML = 'Saving Report...';
            const res = await submitConcern(category, title, desc, loc, imageFile);
            
            if (res.success) { 
                showToast('Concern successfully reported!', 'success'); 
                this.reset(); 
                clearImagePreview();
                await loadConcernsView(); 
                await loadDashboardStats(); 
                if (typeof loadHistoryView === 'function') await loadHistoryView();
            } else { 
                showToast(res.message, 'error'); 
            }
            
            btn.disabled = false; 
            btn.innerHTML = 'Submit Report <i class="bi bi-arrow-right"></i>';
        });

        // Image Preview Logic
        document.getElementById('concernImage')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const container = document.getElementById('imagePreviewContainer');
            const img = document.getElementById('concernImagePreview');
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    img.src = e.target.result;
                    container.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                clearImagePreview();
            }
        });

        function clearImagePreview() {
            document.getElementById('concernImage').value = '';
            document.getElementById('imagePreviewContainer').classList.add('hidden');
            document.getElementById('concernImagePreview').src = '';
        }

        async function deleteMyConcern(id) {
            if (!await showConfirmModal("Delete this concern?", "Delete Concern", "Yes, Delete", "Cancel", "danger")) return;
            const res = await deleteConcern(id);
            if (res.success) { showToast('Concern deleted'); loadConcernsView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
        }

        // ==========================================
        // 4. BOOKING
        // ==========================================
        function switchVenue(venue) {
            selectedVenue = venue;
            
            const activeClass = 'px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-md transition-all border-none cursor-pointer transform hover:scale-105 active:scale-95';
            const inactiveClass = 'px-6 py-2.5 rounded-xl font-bold text-sm bg-transparent transition-all border-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800';

            document.getElementById('sel-basketball').className = venue === 'basketball' ? activeClass : inactiveClass;
            document.getElementById('sel-multipurpose').className = venue === 'multipurpose' ? activeClass : inactiveClass;
            
            document.getElementById('sel-basketball').style.color = venue === 'basketball' ? '' : 'var(--text-muted)';
            document.getElementById('sel-multipurpose').style.color = venue === 'multipurpose' ? '' : 'var(--text-muted)';
            // Update panel title dynamically
            const titleEl = document.getElementById('bookingPanelTitle');
            const subtitleEl = document.getElementById('bookingPanelSubtitle');
            if (venue === 'basketball') {
                if (titleEl) titleEl.innerHTML = '<i class="bi bi-calendar-check-fill mr-2"></i>Court Reservation';
                if (subtitleEl) subtitleEl.textContent = 'Reserve the barangay basketball court.';
            } else {
                if (titleEl) titleEl.innerHTML = '🏢 Hall Reservation';
                if (subtitleEl) subtitleEl.textContent = 'Reserve the barangay multi-purpose hall.';
            }
            if (document.getElementById('bookingVenueInput')) document.getElementById('bookingVenueInput').value = venue;
            loadBookingView();
        }

        async function changeBookingMonth(delta) { currentMonth += delta; if (currentMonth > 11) { currentMonth = 0; currentYear++; } else if (currentMonth < 0) { currentMonth = 11; currentYear--; } await loadBookingView(); }

        async function loadBookingView() {
            const grid = document.getElementById('bookingCalendarGrid');
            const monthTitle = document.getElementById('calendarMonthTitle');
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            monthTitle.textContent = months[currentMonth] + ' ' + currentYear;
            const bookings = await getCourtBookings(); const events = await getEvents();
            const approvedEvents = events.filter(e => e.status === 'approved');
            const todayDateStr = new Date().toLocaleDateString('en-CA');
            const eventDates = {}; 
            // Filter events: skip past dates. For today, also skip events whose end time has already passed.
            const nowForCalendar = new Date();
            approvedEvents.filter(e => {
                if (e.date < todayDateStr) return false;
                if (e.date === todayDateStr) {
                    const endTimeStr = e.end_time || e.time;
                    if (endTimeStr) {
                        const [h, m] = endTimeStr.split(':').map(Number);
                        const eventEnd = new Date();
                        eventEnd.setHours(h, m, 0, 0);
                        if (eventEnd < nowForCalendar) return false; // already over
                    }
                }
                return true;
            }).forEach(e => { eventDates[e.date] = e; });


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
            const venueBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' && b.status !== 'completed' && b.venue === selectedVenue);
            const bookedDates = venueBookings.map(b => b.date);
            grid.innerHTML = '';
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = new Date(); today.setHours(0,0,0,0);
            for (let i = 0; i < firstDay; i++) { grid.appendChild(document.createElement('div')); }
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = currentYear + '-' + String(currentMonth+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
                const dateObj = new Date(currentYear, currentMonth, day);
                const hasEvent = eventDates[dateStr];
                const dayDiv = document.createElement('div');
                
                // Base classes
                dayDiv.className = 'p-3 rounded-lg text-center font-bold text-sm transition transform ';
                
                if (dateObj < today) { 
                    dayDiv.className += 'bg-gray-100 text-gray-400 cursor-not-allowed'; 
                }
                else if (hasEvent) { 
                    // Official Events — solid violet. User can still book outside event time slots.
                    dayDiv.className += 'bg-purple-600 text-white border-2 border-purple-700 cursor-pointer hover:bg-purple-700 hover:scale-105'; 
                    dayDiv.title = 'Brgy Event: ' + hasEvent.title + '. Click to view schedule & book available slots.'; 
                    dayDiv.onclick = () => openDaySchedulePopup(dateStr);
                }
                else if (bookedDates.includes(dateStr)) { 
                    dayDiv.className += 'bg-red-600 text-white border-2 border-red-700 cursor-pointer hover:bg-red-700 hover:scale-105 shadow-md'; 
                    dayDiv.title = 'Has Bookings. Click to see schedule.';
                    dayDiv.onclick = () => openDaySchedulePopup(dateStr);
                }
                else { 
                    dayDiv.className += 'bg-emerald-50 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 cursor-pointer hover:scale-105'; 
                    dayDiv.onclick = () => openDaySchedulePopup(dateStr);
                }
                
                if (dateObj.getTime() === today.getTime() && !selectedDate) { 
                    dayDiv.className += ' ring-2 ring-emerald-500 ring-offset-2'; 
                }
                
                if (selectedDate === dateStr && !hasEvent) { 
                    dayDiv.className = 'p-3 rounded-lg text-center cursor-pointer font-bold text-sm bg-emerald-600 text-white shadow-md hover:scale-105 transition transform'; 
                }
                
                dayDiv.textContent = day;
                grid.appendChild(dayDiv);
            }
            const myContainer = document.getElementById('myReservationsList');
            
            // Resolve real Supabase ID to handle type mismatches (string vs integer)
            let resolvedBookingUid = String(user.id);
            try {
                const { data: uRow } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
                if (uRow) resolvedBookingUid = String(uRow.id);
            } catch(_) {}

            // Match both Supabase (user_id) and localStorage (userId) formats
            const myBookings = bookings.filter(b =>
                String(b.user_id) === resolvedBookingUid || String(b.userId) === resolvedBookingUid
            );
            const activeBookings = myBookings.filter(b => b.status === 'pending' || b.status === 'approved');

            // Render Active
            if (activeBookings.length === 0) { 
                myContainer.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have no active reservations.</p>'; 
            } else {
                activeBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
                myContainer.innerHTML = activeBookings.map(b => {
                    const statusClass = b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
                    const statusText = b.status.charAt(0).toUpperCase() + b.status.slice(1);
                    return '<div class="border rounded-xl p-4 shadow-sm" style="background-color: var(--panel-bg); border-color: var(--border-color);">' +
                        '<div class="flex justify-between mb-2 border-b pb-2" style="border-color: var(--border-color);"><h4 class="font-bold" style="color: var(--text-main);">📅 ' + formatDate(b.date) + '</h4><span class="px-2 py-0.5 rounded text-xs font-bold ' + statusClass + '">' + statusText + '</span></div>' +
                        '<p class="text-xs mb-1" style="color: var(--text-muted);">⏰ ' + b.time + '</p>' +
                        '<p class="text-xs italic" style="color: var(--text-muted);">Purpose: ' + (b.purpose || '') + '</p>' +
                        '<div class="mt-3 flex gap-2 flex-col">' +
                        '<button onclick="cancelMyReservation(' + b.id + ')" class="w-full py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition">Cancel Reservation</button>' +
                        '</div></div>';
                }).join('');
            }
        }

        // Duplicate loadDashboardStats block removed to prevent overriding the main implementation.

        // selectBookingDate is replaced by openDaySchedulePopup below
        async function selectBookingDate(dateStr) {
            return openDaySchedulePopup(dateStr);
        }

        // ==========================================
        // DAY SCHEDULE POPUP SYSTEM
        // ==========================================
        let _dsCurrentDate = null;
        let _dsCurrentVenue = null;

        function fmt12(slot) {
            // Convert "HH:MM" 24h string to "H:MM AM/PM"
            if (!slot) return '';
            if (slot.toUpperCase().includes('M')) return slot;
            let h = parseInt(slot.split(':')[0]);
            let m = slot.split(':')[1] || '00';
            let ampm = h >= 12 ? 'PM' : 'AM';
            let h12 = h % 12; if (h12 === 0) h12 = 12;
            return `${h12}:${m} ${ampm}`;
        }

        async function openDaySchedulePopup(dateStr) {
            const today = new Date(); today.setHours(0,0,0,0);
            if (new Date(dateStr) < today) return showToast('Cannot select past dates', 'error');

            _dsCurrentDate = dateStr;
            _dsCurrentVenue = selectedVenue;

            const venueLabel = selectedVenue === 'basketball' ? '<i class="bi bi-dribbble mr-2"></i>Basketball Court' : '<i class="bi bi-building mr-2"></i>Multi-Purpose Hall';
            const d = new Date(dateStr + 'T00:00:00');
            const dateFmt = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

            document.getElementById('dsModalDate').textContent = dateFmt;
            document.getElementById('dsModalVenue').textContent = venueLabel;
            document.getElementById('dsDate').value = dateStr;
            document.getElementById('dsVenue').value = selectedVenue;
            document.getElementById('dsName').value = user.name || '';

            if (window.pendingRescheduleData) {
                const m = window.pendingRescheduleData;
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>🔄 Confirm Reschedule</span>';
                openDsBookingModal(); // auto open
                
                document.getElementById('dsPurpose').value = "Rescheduled: " + (m.event_title || ""); 
                
                let banner = document.getElementById('dsRescheduleBanner');
                if(!banner) {
                    banner = document.createElement('div');
                    banner.id = 'dsRescheduleBanner';
                    banner.className = 'bg-blue-50 text-blue-800 p-3 rounded-lg mb-4 text-sm font-bold border border-blue-200';
                    document.getElementById('dsBookingForm').prepend(banner);
                }
                banner.innerHTML = `🔄 Rescheduling Mode Active:<br><span class="text-xs font-normal text-blue-700">Original Time: ${m.original_time}. Review time and confirm.</span>`;
                banner.classList.remove('hidden');
            } else {
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>＋ Add Facility Reservation</span>';
                let banner = document.getElementById('dsRescheduleBanner');
                if(banner) banner.classList.add('hidden');
            }

            // Show modal
            const modal = document.getElementById('dayScheduleModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');

            await refreshDsSchedule(dateStr, selectedVenue);

            // Show event notice banner if there's an official event on this day (and it hasn't ended yet)
            const nowMs = Date.now();
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            const evForDay = (await getEvents()).filter(ev => {
                if (ev.date !== dateStr || ev.status !== 'approved') return false;
                // If selected date is today, hide events whose end time has already passed
                if (isToday) {
                    const endTimeStr = ev.end_time || ev.time;
                    if (endTimeStr) {
                        const [h, m] = endTimeStr.split(':').map(Number);
                        const eventEnd = new Date();
                        eventEnd.setHours(h, m, 0, 0);
                        if (eventEnd < new Date()) return false; // event already over
                    }
                }
                return true;
            });
            let eventNoticeBanner = document.getElementById('dsEventNoticeBanner');
            if (!eventNoticeBanner) {
                eventNoticeBanner = document.createElement('div');
                eventNoticeBanner.id = 'dsEventNoticeBanner';
                // Insert before the schedule list
                const scheduleList = document.getElementById('dsScheduleList');
                if (scheduleList) scheduleList.parentNode.insertBefore(eventNoticeBanner, scheduleList);
            }
            if (evForDay.length > 0) {
                const evNames = evForDay.map(ev => {
                    const timeRange = ev.end_time ? `${fmt12(ev.time)} – ${fmt12(ev.end_time)}` : fmt12(ev.time);
                    return `<strong>${ev.title}</strong> <span style="opacity:0.85;">(${timeRange})</span>`;
                }).join('<br>');
                eventNoticeBanner.innerHTML = `<div style="background:linear-gradient(135deg,#6d28d9,#7c3aed);color:#fff;border-radius:12px;padding:12px 14px;margin-bottom:12px;font-size:12px;line-height:1.6;">
                    <div style="font-size:14px;font-weight:800;margin-bottom:4px;">🎉 Official Barangay Event</div>
                    ${evNames}
                    <div style="margin-top:6px;font-size:11px;opacity:0.85;">⚠️ Time slots during this event are blocked. You may still book slots outside these hours.</div>
                </div>`;
                eventNoticeBanner.style.display = 'block';
            } else {
                eventNoticeBanner.style.display = 'none';
            }

            // Show 'Add Booking' button — admins set up exact time blocks, so users CAN book outside event hours.
            // The time selects will show event slots as (Unavailable) so users pick only open slots.
            const toggleBtn = document.getElementById('dsToggleFormBtn');
            if (toggleBtn) toggleBtn.style.display = '';
        }

        async function refreshDsSchedule(dateStr, venue) {
            const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
            const [allBookings, allEvents] = await Promise.all([getCourtBookings(), getEvents()]);

            const dayBookings = allBookings.filter(b =>
                b.date === dateStr &&
                b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' &&
                (b.venue === venue || b.venueName === venueLabel)
            );
            const isToday2 = dateStr === new Date().toISOString().slice(0, 10);
            const dayEvents = allEvents.filter(e => {
                if (e.date !== dateStr || e.status !== 'approved') return false;
                // If selected date is today, hide events whose end time has already passed
                if (isToday2) {
                    const endTimeStr = e.end_time || e.time;
                    if (endTimeStr) {
                        const [h, m] = endTimeStr.split(':').map(Number);
                        const eventEnd = new Date();
                        eventEnd.setHours(h, m, 0, 0);
                        if (eventEnd < new Date()) return false;
                    }
                }
                return true;
            });

            const list = document.getElementById('dsScheduleList');
            const empty = document.getElementById('dsEmptyState');

            const entries = [];

            dayBookings.forEach(b => {
                const timeStr = b.time + (b.end_time ? ' – ' + b.end_time : '');
                entries.push({ type: 'booking', timeStr, label: b.userName || b.username || 'Resident', purpose: b.purpose || '' });
            });
            dayEvents.forEach(e => {
                const timeStr = fmt12(e.time) + (e.end_time ? ' – ' + fmt12(e.end_time) : '');
                const venueEvLabel = (e.venue === 'multipurpose' || (e.location && e.location.includes('Multi-Purpose'))) ? '<i class="bi bi-building mr-2"></i>Multi-Purpose Hall' : '<i class="bi bi-dribbble mr-2"></i>Basketball Court';
                entries.push({ type: 'event', timeStr, label: e.title, purpose: (e.organizer ? 'By ' + e.organizer + ' · ' : '') + venueEvLabel });
            });

            if (entries.length === 0) {
                list.innerHTML = '';
                empty.classList.remove('hidden');
            } else {
                empty.classList.add('hidden');
                list.innerHTML = entries.map(en => {
                    const isBk = en.type === 'booking';
                    const bg = isBk ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200';
                    const dot = isBk ? '🔴' : '🟣';
                    const nameColor = isBk ? 'text-red-700' : 'text-purple-700';
                    return `<div class="flex items-start gap-3 p-3 rounded-xl border ${bg}">
                        <span class="text-lg leading-none mt-0.5">${dot}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold ${nameColor} truncate">${en.timeStr}</p>
                            <p class="text-xs text-gray-600 font-semibold truncate">${en.label}</p>
                            ${en.purpose ? `<p class="text-xs text-gray-400 italic truncate">${en.purpose}</p>` : ''}
                        </div>
                    </div>`;
                }).join('');
            }

            // Regenerate time selects
            await fillDsTimeSelects(dateStr, venue, allBookings, allEvents);
        }

        async function fillDsTimeSelects(dateStr, venue, allBookings, allEvents) {
            const startSel = document.getElementById('dsStartTime');
            const endSel = document.getElementById('dsEndTime');
            startSel.innerHTML = '<option value=""></option>';
            endSel.innerHTML = '<option value=""></option>';

            const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
            const currentDay = String(now.getDate()).padStart(2, '0');
            const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;
            const isToday = (todayStr === dateStr);
            const currentMins = now.getHours() * 60 + now.getMinutes();

            const slots = [];
            for (let i = 6; i <= 22; i++) {
                slots.push(`${String(i).padStart(2,'0')}:00`);
                if (i !== 22) slots.push(`${String(i).padStart(2,'0')}:30`);
            }

            slots.forEach(slot => {
                const sMin = timeToMinutes(slot);
                const eMin = sMin + 30;

                // Skip past time slots if the selected date is today
                if (isToday && sMin < currentMins) return;

                let taken = false;

                for (const b of allBookings) {
                    if (b.date === dateStr && b.status !== 'rejected' && b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' &&
                        (b.venue === venue || b.venueName === venueLabel)) {
                        let tRange = b.timeRange || b.time;
                        if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
                        let [st, et] = tRange.split('–').map(s => s.trim());
                        if (!et) et = st;
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

                const label = fmt12(slot) + (taken ? ' (Unavailable)' : '');
                const o1 = new Option(label, fmt12(slot)); if (taken) o1.disabled = true;
                const o2 = new Option(label, fmt12(slot)); if (taken) o2.disabled = true;
                startSel.appendChild(o1);
                endSel.appendChild(o2);
            });
        }

        function closeDayScheduleModal() {
            const modal = document.getElementById('dayScheduleModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.getElementById('dsBookingForm').reset();
            // Hide event notice banner
            const banner = document.getElementById('dsEventNoticeBanner');
            if (banner) banner.style.display = 'none';
            if (window.pendingRescheduleData) {
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>🔄 Confirm Reschedule</span>';
            } else {
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>＋ Add Facility Reservation</span>';
            }
        }

        function openDsBookingModal() {
            const modal = document.getElementById('dsBookingModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeDsBookingModal() {
            const modal = document.getElementById('dsBookingModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        async function submitDsBooking(e) {
            e.preventDefault();
            const btn = document.getElementById('dsSubmitBtn');
            btn.disabled = true; btn.innerHTML = 'Processing...';

            const date = document.getElementById('dsDate').value;
            const venue = document.getElementById('dsVenue').value;
            const startTime = document.getElementById('dsStartTime').value;
            const endTime = document.getElementById('dsEndTime').value;
            const name = document.getElementById('dsName').value;
            const purpose = document.getElementById('dsPurpose').value;

            let result;

            if (window.pendingRescheduleData) {
                // Since the original was completely deleted, rescheduling is submitting a fresh booking
                result = await bookCourt({
                    user_id: user.id,
                    username: name,
                    date,
                    time: startTime,
                    end_time: endTime,
                    venue,
                    venueName: venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall',
                    purpose,
                    status: 'pending'
                });
                if (result.success) {
                    window.pendingRescheduleData = null;
                    let banner = document.getElementById('dsRescheduleBanner');
                    if(banner) banner.classList.add('hidden');
                    openSuccessModal('Success!', 'Your booking has been successfully rescheduled.');
                }
            } else {
                result = await bookCourt({
                    user_id: user.id,
                    username: name,
                    date,
                    time: startTime,
                    end_time: endTime,
                    venue,
                    venueName: venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall',
                    purpose,
                    status: 'pending'
                });
                if (result.success) openSuccessModal('Success!', 'Your court booking has been successfully submitted.');
            }

            btn.disabled = false; btn.innerHTML = '✅ Confirm Reservation';

            if (result.success) {
                document.getElementById('dsPurpose').value = '';
                document.getElementById('dsStartTime').value = '';
                document.getElementById('dsEndTime').value = '';
                closeDsBookingModal();
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>＋ Add Facility Reservation</span>';
                await refreshDsSchedule(date, venue);
                await loadBookingView();
                await loadDashboardStats();
            } else {
                showToast(result.message, 'error');
            }
        }

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
            if (!await showConfirmModal(`Are you sure you want to cancel this reservation? (${cancelledCount}/3 cancellations used in 24h)`, 'Cancel Reservation', 'Yes, Cancel', 'No', 'warning')) return;
            const res = await cancelCourtBooking(id);
            if (res.success) {
                recordCancellation();
                showToast(`Reservation cancelled (${cancelledCount + 1}/3 cancellations used).`, 'success');
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
            if (!await showConfirmModal(`Cancel this equipment request? (${cancelledCount}/3 cancellations used in 24h)`, 'Cancel Request', 'Yes, Cancel', 'No', 'warning')) return;
            const res = await cancelBorrowingRequest(id);
            if (res.success) {
                recordCancellation();
                showToast(`Equipment request cancelled (${cancelledCount + 1}/3 cancellations used).`, 'success');
                await loadMyBorrowingsList();
                await loadDashboardStats();
            } else {
                showToast(res.message, 'error');
            }
        }

        // ==========================================
        // 5. EVENTS
        // ==========================================
        async function loadEventsView() {
            const container = document.getElementById('upcomingEventsContainer');
            const eventsRaw = await getEvents();
            const events = eventsRaw.filter(e => e.status === 'approved');
            const now = new Date();
            const todayStr = now.toLocaleDateString('en-CA');
            const nowMins = now.getHours() * 60 + now.getMinutes();
            function _parseTimeMins(t) {
                if (!t) return null;
                const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
                const m12 = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (m24) return parseInt(m24[1]) * 60 + parseInt(m24[2]);
                if (m12) { let h = parseInt(m12[1]); const m = parseInt(m12[2]); if (m12[3].toUpperCase()==='PM'&&h<12) h+=12; if (m12[3].toUpperCase()==='AM'&&h===12) h=0; return h*60+m; }
                return null;
            }
            const upcoming = events.filter(e => {
                if (!e.date) return false;
                if (e.date > todayStr) return true;
                if (e.date < todayStr) return false;
                // Today — only show if end_time hasn't passed
                const endMins = _parseTimeMins(e.end_time || e.endTime);
                if (endMins === null) return true;
                return nowMins < endMins;
            });
            if (upcoming.length === 0) { container.innerHTML = '<div class="col-span-full py-10 text-center"><p class="text-gray-500">No upcoming events.</p></div>'; return; }
            upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            container.innerHTML = upcoming.map(e => {
                const timeStr = e.end_time ? fmt12(e.time) + ' - ' + fmt12(e.end_time) : fmt12(e.time);
                return '<div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform transition hover:-translate-y-1 hover:shadow-2xl">' +
                    '<div class="flex justify-between items-start mb-4"><span class="bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">Official Event</span></div>' +
                    '<h3 class="text-2xl font-black mb-1 line-clamp-2">' + e.title + '</h3>' +
                    '<p class="text-indigo-100 font-medium mb-4 text-sm flex items-center gap-1">📍 ' + e.location + '</p>' +
                    '<div class="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20">' +
                    '<div class="flex items-center gap-2 mb-2"><span class="font-bold">' + formatDate(e.date) + '</span></div>' +
                    '<div class="flex items-center gap-2 mb-2"><span class="font-bold">' + timeStr + '</span></div>' +
                    '<div class="flex items-center gap-2' + (e.capacity || e.description ? ' mb-2' : '') + '"><span class="text-sm">By ' + e.organizer + '</span></div>' +
                    (e.capacity ? '<div class="flex items-center gap-2 mb-2"><span class="text-sm font-bold text-indigo-100">👥 Capacity: ' + e.capacity + ' max</span></div>' : '') +
                    ''  +
                    '</div></div>';
            }).join('');
        }

        // Auto-remove expired events every 60 seconds
        setInterval(loadEventsView, 60000);


        // ==========================================
        // 5.5 MY HISTORY
        // ==========================================
        let allHistoryData = [];
        let currentPageHistory = 1;
        const HISTORY_PER_PAGE = 6;

        function renderHistory() {
            const container = document.getElementById('unifiedHistoryList');
            const filterEl = document.getElementById('historyFilter');
            const filterVal = filterEl ? filterEl.value.toLowerCase() : 'all';
            
            let filtered = allHistoryData;
            if (filterVal !== 'all') {
                filtered = allHistoryData.filter(a => a.type.toLowerCase() === filterVal);
            }

            const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PER_PAGE));
            if (currentPageHistory > totalPages) currentPageHistory = totalPages;
            
            const startIdx = (currentPageHistory - 1) * HISTORY_PER_PAGE;
            const currentItems = filtered.slice(startIdx, startIdx + HISTORY_PER_PAGE);

            if (filtered.length === 0) { 
                container.innerHTML = '<p class="text-gray-500 italic text-[15px] font-bold mt-4 col-span-full text-center">No activity history found matching the filter.</p>'; 
            } else {
                container.innerHTML = currentItems.map(a => {
                    const displayStatus = a.status === 'completed' ? 'Completed'
                        : a.status === 'cancelled_by_admin' ? 'Cancelled by Admin'
                        : a.status === 'cancelled' ? 'Cancelled'
                        : a.status === 'approved' ? 'Approved'
                        : a.status === 'resolved' ? 'Resolved'
                        : a.status === 'rejected' ? 'Rejected'
                        : a.status || 'Pending';
                    const statusColor = (a.status === 'approved' || a.status === 'resolved' || a.status === 'completed')
                        ? 'text-green-600 bg-green-50'
                        : (a.status === 'rejected' || a.status === 'cancelled' || a.status === 'cancelled_by_admin')
                        ? 'text-red-600 bg-red-50'
                        : 'text-orange-600 bg-orange-50';
                    return `
<div class="group relative flex items-start gap-4 p-5 rounded-2xl border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800/70 border-gray-100 dark:border-slate-700 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-700 ease-in-out pointer-events-none"></div>
    <div class="${a.colorClass} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-sm shrink-0 transition-transform group-hover:scale-110">
        ${a.icon}
    </div>
    <div class="flex-1 w-full flex flex-col justify-center">
        <div class="flex justify-between items-start gap-3 w-full">
            <h4 class="font-extrabold text-gray-900 dark:text-white text-[15px] leading-snug">${a.title}</h4>
            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50 backdrop-blur-md ${statusColor} shrink-0">${displayStatus}</span>
        </div>
        <div class="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400 font-semibold w-full">
            <span class="bg-gray-100 dark:bg-slate-700/80 px-2.5 py-1 rounded-md text-[11px] shadow-sm flex items-center gap-1">
                📌 ${a.type}
            </span>
            <span class="flex items-center gap-1.5">
                <i class="bi bi-clock"></i>
                ${isNaN(a.date.getTime())?'Unknown Date':a.date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})+' at '+a.date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </span>
        </div>
    </div>
</div>`;
                }).join('');
            }

            const info = document.getElementById('historyPaginationInfo');
            if(info) info.textContent = `Page ${currentPageHistory} of ${totalPages}`;
            
            const prevBtn = document.querySelector('button[onclick="prevPageHistory()"]');
            const nextBtn = document.querySelector('button[onclick="nextPageHistory()"]');
            if(prevBtn) prevBtn.disabled = currentPageHistory === 1;
            if(nextBtn) nextBtn.disabled = currentPageHistory === totalPages;
        }

        function prevPageHistory() {
            if(currentPageHistory > 1) { currentPageHistory--; renderHistory(); }
        }
        function nextPageHistory() {
            const filterEl = document.getElementById('historyFilter');
            const filterVal = filterEl ? filterEl.value.toLowerCase() : 'all';
            const filtered = filterVal === 'all' ? allHistoryData : allHistoryData.filter(a => a.type.toLowerCase() === filterVal);
            const totalPages = Math.ceil(filtered.length / HISTORY_PER_PAGE);
            if(currentPageHistory < totalPages) { currentPageHistory++; renderHistory(); }
        }

        async function loadHistoryView() {
            const container = document.getElementById('unifiedHistoryList');
            container.innerHTML = '';
            try {
                const results = await Promise.allSettled([
                    typeof getMyBorrowings === 'function' ? getMyBorrowings() : Promise.resolve([]),
                    typeof getMyConcerns === 'function' ? getMyConcerns() : Promise.resolve([]),
                    (async () => {
                        if (typeof getCourtBookings === 'function') {
                            const bookings = await getCourtBookings();
                            // Resolve real Supabase ID and use string comparison to handle type mismatches
                            let resolvedUid = String(user.id);
                            try {
                                const { data: uRow } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
                                if (uRow) resolvedUid = String(uRow.id);
                            } catch(_) {}
                            return bookings.filter(b =>
                                String(b.user_id) === resolvedUid || String(b.userId) === resolvedUid
                            );
                        }
                        return [];
                    })()
                ]);
                const bor = results[0].status === 'fulfilled' ? (results[0].value || []) : [];
                const con = results[1].status === 'fulfilled' ? (results[1].value || []) : [];
                const boo = results[2].status === 'fulfilled' ? (results[2].value || []) : [];
                
                let all = [];
                bor.forEach(b => all.push({ type: 'Borrowing', title: `Borrowed: ${b.equipment_name || 'Equipment'} (x${b.quantity})`, date: new Date(b.created_at || b.date_requested), status: b.status, icon: '📦', colorClass: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-400' }));
                con.forEach(c => all.push({ type: 'Concern', title: `Reported: ${c.title || c.category}`, date: new Date(c.created_at), status: c.status, icon: '💬', colorClass: 'bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400' }));
                boo.forEach(b => all.push({ type: 'Facility Reservation', title: `Booked: ${b.venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall'}`, date: new Date(b.created_at || (b.date + 'T' + b.time)), status: b.status, icon: '📅', colorClass: 'bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-400' }));
                all.sort((a,b) => b.date - a.date);
                allHistoryData = all;
                currentPageHistory = 1;
                renderHistory();
            } catch(e) { console.error(e); container.innerHTML = '<p class="text-red-500 text-sm">Error loading history.</p>'; }
        }

        // ==========================================
        // 6. SETTINGS PANEL
        // ==========================================
        function showSettingsTab(tab) {
            ['profile','password','security','account'].forEach(t => {
                document.getElementById('stab-content-' + t).classList.add('hidden');
                const btn = document.getElementById('stab-' + t);
                if (btn) {
                    btn.style.background = 'var(--panel-bg)';
                    btn.style.color = 'var(--text-muted)';
                    btn.style.borderColor = 'var(--border-color)';
                }
            });
            document.getElementById('stab-content-' + tab).classList.remove('hidden');
            const activeBtn = document.getElementById('stab-' + tab);
            if (activeBtn) {
                activeBtn.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                activeBtn.style.color = '#fff';
                activeBtn.style.borderColor = '#10b981';
            }
            if (tab === 'security') loadDashboardTOTPStatus();
        }

                async function fetchFullProfileData() {
            try {
                const { data, error } = await supabase.from('users').select('*').eq('username', user.username).maybeSingle();
                if (data) {
                    user.email = data.email || '';
                    user.phone = data.phone || data.contact_number || '';
                    user.address = data.address || '';
                    user.name = data.full_name || data.fullName || data.name || '';
                    window.user = user;
                }
            } catch(e) { console.error('Error hydrating user details', e); }
        }

        async function loadProfilePanel() {
            await fetchFullProfileData();
            if (document.getElementById('p-fullName')) document.getElementById('p-fullName').value = user.name || '';
            if (document.getElementById('p-email')) document.getElementById('p-email').value = user.email || '';
            if (document.getElementById('p-phone')) document.getElementById('p-phone').value = user.phone || '';
            if (document.getElementById('p-address')) document.getElementById('p-address').value = user.address || '';
        }

async function loadSettingsView() {
            // Fill profile fields
            document.getElementById('s-fullName').value = user.full_name || user.fullName || user.name || '';
            document.getElementById('s-email').value = user.email || '';
            document.getElementById('s-username').value = user.username || '';
            document.getElementById('s-phone').value = user.contact_number || user.phone || '';
            document.getElementById('s-address').value = user.address || '';
            if (user.createdAt) document.getElementById('s-memberSince').textContent = new Date(user.createdAt).toLocaleDateString();
            // Load stats
            try {
                if (typeof getUserStats === 'function') {
                    const stats = await getUserStats(user.id);
                    if (stats) {
                        document.getElementById('s-statRequests').textContent = stats.totalBorrowings || 0;
                        document.getElementById('s-statConcerns').textContent = stats.totalConcerns || 0;
                        document.getElementById('s-statBookings').textContent = stats.totalBookings || 0;
                        document.getElementById('s-statApproved').textContent = stats.approvedBorrowings || 0;
                    }
                }
            } catch(e) { console.error('Settings stats error', e); }
        }

        document.getElementById('settingsProfileForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            const result = await updateUserProfile({
                fullName: document.getElementById('s-fullName').value.trim(),
                email: document.getElementById('s-email').value.trim(),
                phone: document.getElementById('s-phone').value.trim(),
                address: document.getElementById('s-address').value.trim()
            });
            btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-circle mr-2"></i>Save Changes';
            showToast(result.message, result.success ? 'success' : 'error');
        });

        document.getElementById('settingsPasswordForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const np = document.getElementById('s-newPassword').value;
            const cp = document.getElementById('s-confirmPassword').value;
            if (np !== cp) return showToast('Passwords do not match', 'error');
            if (np.length < 6) return showToast('Password must be at least 6 characters', 'error');
            const result = await changePassword(document.getElementById('s-currentPassword').value, np);
            showToast(result.message, result.success ? 'success' : 'error');
            if (result.success) this.reset();
        });

        async function deleteSettingsAccount() {
            if (!await showConfirmModal('Are you sure you want to delete your account? This cannot be undone.', 'Delete Account', 'Proceed', 'Cancel', 'danger')) return;
            if (!await showConfirmModal('Final warning: all your data will be permanently deleted.', 'Final Warning', 'Yes, Delete Completely', 'Cancel', 'danger')) return;
            if (typeof window.deleteUser === 'function') await window.deleteUser(user.id);
            else await supabase.from('users').delete().eq('id', user.id);
            logoutUser();
        }

        // ── Google Authenticator (2FA) in Settings ────────────────
        async function loadDashboardTOTPStatus() {
            const actionsEl = document.getElementById('s-totpActions');
            const statusText = document.getElementById('s-totpStatusText');
            const statusBadge = document.getElementById('s-totpStatusBadge');
            if (!actionsEl) return;
            actionsEl.innerHTML = '';

            try {
                const info = await fetchUserTOTPInfo(user.id);
                if (info.totp_enabled) {
                    statusText.textContent = 'Enabled';
                    statusBadge.style.cssText = 'padding:4px 12px;background:#d1fae5;color:#065f46;border-radius:20px;font-size:12px;font-weight:700;';
                    statusBadge.textContent = '✅ Active';
                    actionsEl.innerHTML = `<button onclick="disableDashboardTOTP()" style="padding:12px 24px;border-radius:12px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:#fee2e2;color:#b91c1c;border:1.5px solid #fecaca;transition:all 0.2s;">🛡️ Disable Google Authenticator</button>`;
                } else {
                    statusText.textContent = 'Not Enabled';
                    statusBadge.style.cssText = 'padding:4px 12px;background:#f3f4f6;color:#6b7280;border-radius:20px;font-size:12px;font-weight:700;';
                    statusBadge.textContent = 'Not Set Up';
                    actionsEl.innerHTML = `<a href="setup-totp.html" style="display:inline-block;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;box-shadow:0 4px 12px rgba(99,102,241,0.3);transition:all 0.2s;">🔐 Enable Google Authenticator</a>`;
                }
            } catch(e) {
                actionsEl.innerHTML = '<p style="color:#ef4444;font-size:13px;">Failed to load 2FA status.</p>';
            }
        }

        async function disableDashboardTOTP() {
            if (!await showConfirmModal('Are you sure you want to disable Google Authenticator? Your account will be less secure.', 'Disable 2FA', 'Yes, Disable', 'Cancel', 'warning')) return;
            const result = await disableTOTPInDB(user.id);
            showToast(result.success ? 'Google Authenticator disabled.' : 'Failed: ' + result.message, result.success ? 'success' : 'error');
            if (result.success) await loadDashboardTOTPStatus();
        }

        // Initialize — auto-complete expired bookings first so UI is clean
        if (typeof autoCompleteExpiredBookings === 'function') {
            autoCompleteExpiredBookings(); // fire-and-forget, don't block UI
        }

        showPanel('dashboard');
        loadHistoryView();
        checkPendingNotifications();

        // Real-time synchronization for events
        if (typeof subscribeToEvents === 'function') {
            subscribeToEvents(() => {
                // If a new event is scheduled or changed, re-fetch and re-render
                loadEventsView();
                loadBookingView();
                loadDashboardStats();
            });
        }

        // Cross-tab synchronization — listen for admin changes from other tabs
        if (typeof appSyncChannel !== 'undefined') {
            const syncHandler = async (event) => {
                if ((event.data && event.data.type === 'SYNC_NEEDED') || event.type === 'barangay_sync_needed') {
                    await loadBookingView();
                    await loadEventsView();
                    await loadDashboardStats();
                    if (typeof loadMyBorrowingsList === 'function') await loadMyBorrowingsList();
                    if (typeof loadEquipmentView === 'function') await loadEquipmentView();
                    if (typeof loadConcernsView === 'function') await loadConcernsView();
                    if (typeof renderUserNotifications === 'function') await renderUserNotifications();
                }
            };
            appSyncChannel.addEventListener('message', syncHandler);
            window.addEventListener('barangay_sync_needed', syncHandler);
        }

        // ==========================================
        // CANCELLATION NOTIFICATIONS
        // ==========================================
        let userCancellationNotifications = [];
        let curCancelNotif = null;

        async function checkPendingNotifications() {
            if (!window.user) return;
            try {
                // Read directly from court_bookings - bypasses user_notifications table issues
                const allBookings = await getCourtBookings();
                const uid = String(window.user.id);
                const cancelledByAdmin = allBookings.filter(b =>
                    (String(b.user_id) === uid || String(b.userId) === uid) &&
                    b.status === 'cancelled_by_admin'
                );
                if (cancelledByAdmin.length === 0) return;

                // Build notification objects from the cancelled bookings
                userCancellationNotifications = cancelledByAdmin.map(b => {
                    const eventName = b.admin_comment || b.adminComment || 'a Barangay Event';
                    const timeStr = b.timeRange || b.time || '';
                    const parsedTime = timeStr.includes(' | ') ? timeStr.split(' | ')[1] : timeStr;
                    return {
                        id: b.id,
                        type: 'booking_cancelled',
                        isBookingRecord: true, // flag so we handle dismiss differently
                        message: `Your court booking on ${b.date}${parsedTime ? ' at ' + parsedTime : ''} has been cancelled due to: "${eventName}". Please reschedule or cancel completely.`,
                        meta: { booking_id: b.id, date: b.date, venue: b.venueName || b.venue, original_time: parsedTime, event_title: eventName }
                    };
                });
                showNextNotification();
            } catch(e) {
                console.warn('checkPendingNotifications error:', e);
            }
        }

        function showNextNotification() {
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
        }

        // ONE-CLICK DISMISSAL
        async function confirmCancelCompletely() {
            if (!curCancelNotif) return;
            const cancelBtn = document.getElementById('rcmCancelBtn');
            if (cancelBtn) { cancelBtn.disabled = true; cancelBtn.textContent = 'Processing...'; }
            
            const bookingId = curCancelNotif.meta && curCancelNotif.meta.booking_id;
            if (bookingId) {
                // Mark as fully cancelled (removes from popup list + active bookings)
                if (typeof cancelCourtBooking === 'function') {
                    await cancelCourtBooking(bookingId);
                } else {
                    await deleteCourtBooking(bookingId);
                }
            }
            
            if (cancelBtn) { cancelBtn.disabled = false; cancelBtn.textContent = 'Cancel Completely'; }
            showToast('Booking cancelled.', 'success');
            
            const rcm = document.getElementById('rescheduleCancelModal');
            if (rcm) { rcm.classList.add('hidden'); rcm.classList.remove('flex'); }
            
            userCancellationNotifications.shift();
            curCancelNotif = null;
            await loadBookingView();
            await loadDashboardStats();
            showNextNotification();
        }

        async function handleReschedule() {
            if (!curCancelNotif) return;
            const btn = document.getElementById('rcmRescheduleBtn');
            if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }
            
            await markUserNotificationAsRead(curCancelNotif.id);
            if (btn) { btn.disabled = false; btn.innerHTML = '📅 Reschedule'; }
            
            const venueMeta = (curCancelNotif.meta && curCancelNotif.meta.venue) ? curCancelNotif.meta.venue : '';
            const venueKey = venueMeta.includes('Multi') ? 'multipurpose' : 'basketball';
            
            window.pendingRescheduleData = curCancelNotif.meta;
            userCancellationNotifications.shift();
            
            const modal = document.getElementById('rescheduleCancelModal');
            if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
            
            // Immediately navigate the user directly to the booking calendar
            showPanel('booking');
            switchVenue(venueKey);
            
            setTimeout(() => {
                showToast('Reschedule Mode: Please pick a new date on the calendar.', 'info');
            }, 300);
            
            showNextNotification();
        }

        // Trigger on load
        setTimeout(checkPendingNotifications, 500);

        // Real-time live flow: Wait for new notifications immediately
        document.addEventListener('DOMContentLoaded', async () => {
            if (typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable()) {
                supabase
                    .channel('live-notifications')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {
                        const newR = payload.new;
                        if (!window.user || !newR) return;
                        // Match by user_id (handle int vs string)
                        if (String(newR.user_id) !== String(window.user.id)) return;

                        // Route by type
                        const type = newR.type || '';
                        const msg  = newR.message || '';

                        pollBellNotifications();

                        if (type === 'booking_cancelled') {
                            checkPendingNotifications();
                        } else if (type === 'booking_approved') {
                            showNotifToast('✅ Booking Approved', msg, 'success');
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'booking_rejected') {
                            showNotifToast('❌ Booking Rejected', msg, 'error');
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'equipment_approved') {
                            showNotifToast('✅ Equipment Request Approved', msg, 'success');
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'equipment_rejected') {
                            showNotifToast('❌ Equipment Request Rejected', msg, 'error');
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'event_added') {
                            showNotifToast('📢 New Barangay Event', msg, 'info');
                            loadEventsView && loadEventsView();
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'event_cancelled') {
                            showNotifToast('🚫 Event Cancelled', msg, 'warning');
                            loadEventsView && loadEventsView();
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        }
                    })
                    .subscribe();
            }
        });

        // Premium notification toast for real-time alerts
        function showNotifToast(title, message, kind = 'info') {
            // Remove any existing notif toast first
            const existing = document.getElementById('notifToastPopup');
            if (existing) existing.remove();

            const colors = {
                success: { bg: '#d1fae5', border: '#10b981', icon: '✅', text: '#065f46', progress: '#10b981' },
                error:   { bg: '#fee2e2', border: '#ef4444', icon: '❌', text: '#991b1b', progress: '#ef4444' },
                info:    { bg: '#dbeafe', border: '#3b82f6', icon: '📢', text: '#1e40af', progress: '#3b82f6' },
                warning: { bg: '#fef3c7', border: '#f59e0b', icon: '⚠️', text: '#92400e', progress: '#f59e0b' }
            };
            const c = colors[kind] || colors.info;

            const toast = document.createElement('div');
            toast.id = 'notifToastPopup';
            toast.style.cssText = `
                position:fixed; top:20px; right:20px; z-index:99999;
                max-width:360px; width:calc(100vw - 40px);
                background:${c.bg}; border:1.5px solid ${c.border};
                border-radius:16px; padding:16px 20px; box-shadow:0 8px 32px rgba(0,0,0,0.15);
                display:flex; flex-direction:column; gap:8px;
                animation: slideInRight 0.35s cubic-bezier(.22,1,.36,1);
            `;
            toast.innerHTML = `
                <style>
                @keyframes slideInRight { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
                @keyframes shrinkWidth   { from { width:100%; } to { width:0%; } }
                </style>
                <div style="display:flex;align-items:flex-start;gap:12px;">
                    <span style="font-size:22px;line-height:1;flex-shrink:0;">${c.icon}</span>
                    <div style="flex:1;min-width:0;">
                        <p style="margin:0 0 4px;font-size:13px;font-weight:800;color:${c.text};">${title}</p>
                        <p style="margin:0;font-size:12px;color:${c.text};opacity:0.85;line-height:1.4;">${message}</p>
                    </div>
                    <button onclick="document.getElementById('notifToastPopup').remove()"
                        style="background:none;border:none;cursor:pointer;font-size:16px;color:${c.text};opacity:0.6;line-height:1;flex-shrink:0;">✕</button>
                </div>
                <div style="background:rgba(0,0,0,0.1);border-radius:4px;overflow:hidden;height:3px;">
                    <div style="height:100%;background:${c.progress};animation:shrinkWidth 5s linear forwards;"></div>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => { if (toast.isConnected) toast.remove(); }, 5200);
        }

    