
        // RBAC: Residents only  admins are redirected to admin.html
        if (!requireUser()) { throw new Error('RBAC redirect'); }
        const user = getCurrentUser();
        window.user = user; // expose globally so checkPendingNotifications can access window.user.id

        // ¢â€â‚¬ Suspension Guard: check live DB on every dashboard load ¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬
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
        // ¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬

        document.getElementById('sidebarUserName').textContent = user.fullName || user.name || user.username || user.email.split('@')[0];
        document.getElementById('welcomeName').textContent = user.fullName || user.name || user.username || user.email.split('@')[0];
        document.getElementById('userInitial').textContent = (user.fullName || user.name || user.username || user.email)[0].toUpperCase();

        // Set dashboard greeting and date (no clock)
        (function() {
            const now = new Date();
            const hr = now.getHours();
            const period = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
            const greetEl = document.getElementById('dashGreeting');
            if (greetEl) { const nameSpan = greetEl.querySelector('#welcomeName'); if (greetEl.childNodes[0]) greetEl.childNodes[0].textContent = period + ', '; }
            const dateEl = document.getElementById('dashDate');
            if (dateEl) dateEl.textContent = now.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        })();

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
        
        // ---- Concerns tab switcher ----
        function switchConcernTab(tab) {
            const formPane    = document.getElementById('concern-tab-form');
            const historyPane = document.getElementById('concern-tab-history');
            const btnForm     = document.getElementById('tab-btn-concern-form');
            const btnHistory  = document.getElementById('tab-btn-concern-history');
            if (!formPane) return;
            const ACTIVE   = {background:'#1e3a5f', color:'#fff', borderColor:'#1e3a5f'};
            const INACTIVE = {background:'transparent', color:'#1e3a5f', borderColor:'#1e3a5f'};
            if (tab === 'form') {
                formPane.style.display = ''; historyPane.style.display = 'none';
                Object.assign(btnForm.style, ACTIVE); Object.assign(btnHistory.style, INACTIVE);
            } else {
                formPane.style.display = 'none'; historyPane.style.display = '';
                Object.assign(btnHistory.style, ACTIVE); Object.assign(btnForm.style, INACTIVE);
            }
        }

        // ---- Booking tab switcher ----
        function switchBookingTab(tab) {
            const calPane     = document.getElementById('booking-tab-calendar');
            const historyPane = document.getElementById('booking-tab-history');
            const btnCal      = document.getElementById('tab-btn-booking-calendar');
            const btnHistory  = document.getElementById('tab-btn-booking-history');
            if (!calPane) return;
            const ACTIVE   = {background:'#1e3a5f', color:'#fff', borderColor:'#1e3a5f'};
            const INACTIVE = {background:'#fff', color:'#1e3a5f', borderColor:'#1e3a5f'};
            const venueRow = document.getElementById('venueToggleRow');
            if (tab === 'calendar') {
                calPane.style.display = ''; historyPane.style.display = 'none';
                Object.assign(btnCal.style, ACTIVE); Object.assign(btnHistory.style, INACTIVE);
                if (venueRow) venueRow.style.display = '';
            } else {
                calPane.style.display = 'none'; historyPane.style.display = '';
                Object.assign(btnHistory.style, ACTIVE); Object.assign(btnCal.style, INACTIVE);
                if (venueRow) venueRow.style.display = 'none';
                loadMyReservations && loadMyReservations();
            }
        }

        // ---- Equipment tab switcher ----
        function switchEquipTab(tab) {
            const catalogPane = document.getElementById('equip-tab-catalog');
            const historyPane = document.getElementById('equip-tab-history');
            const btnCatalog  = document.getElementById('tab-btn-catalog');
            const btnHistory  = document.getElementById('tab-btn-history');
            if (!catalogPane || !historyPane) return;
            if (tab === 'catalog') {
                catalogPane.style.display = '';
                historyPane.style.display = 'none';
                btnCatalog.style.background = '#1e3a5f'; btnCatalog.style.color = '#fff'; btnCatalog.style.borderColor = '#1e3a5f';
                btnHistory.style.background = '#fff'; btnHistory.style.color = '#1e3a5f'; btnHistory.style.borderColor = '#1e3a5f';
            } else {
                catalogPane.style.display = 'none';
                historyPane.style.display = '';
                btnHistory.style.background = '#1e3a5f'; btnHistory.style.color = '#fff'; btnHistory.style.borderColor = '#1e3a5f';
                btnCatalog.style.background = '#fff'; btnCatalog.style.color = '#1e3a5f'; btnCatalog.style.borderColor = '#1e3a5f';
                loadMyBorrowingsList();
            }
        }
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
                case 'dashboard': loadDashboardStats(); setTimeout(loadDashboardExtras, 200); break;
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
        let currentBorrowPurpose = null;
        let allEquipmentList = [];
        const BUROL_EXCLUDED = ['microphone', 'speaker', 'ladder', 'electric fan', 'fan'];
        const ALL_BORROW_ITEMS = ['Chair', 'Table', 'Tent', 'Microphone', 'Speaker', 'Electric Fan', 'Ladder'];
        const PICKUP_ONLY_ITEMS = ['table', 'tent'];

        // Global delivery state (loaded from settings table)
        window._globalDeliveryEnabled = true;
        async function loadGlobalDeliveryState() {
            try {
                if (!window.supabase) return;
                const { data } = await window.supabase.from('settings').select('value').eq('key', 'delivery_available').maybeSingle();
                window._globalDeliveryEnabled = data ? data.value !== 'false' : true;
            } catch(e) { window._globalDeliveryEnabled = true; }
        }

        function _itemDeliveryAllowed(item) {
            // Per-item only check (no global — global checked in updateDeliveryOptions)
            if (item && typeof item === 'object' && item.can_deliver !== undefined && item.can_deliver !== null) {
                return !!item.can_deliver;
            }
            const lower = (typeof item === 'string' ? item : (item && item.name) || '').toLowerCase();
            return !PICKUP_ONLY_ITEMS.some(kw => lower.includes(kw));
        }
        const _BTN_BASE = 'display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;border-radius:14px;cursor:pointer;font-family:inherit;width:100%;';
        const _BTN_ACTIVE   = _BTN_BASE + 'border:2px solid #0f1f3d;background:#1e3a5f;box-shadow:0 4px 14px rgba(30,58,95,.35);';
        const _BTN_INACTIVE = _BTN_BASE + 'border:2px solid #e2e8f0;background:#f8fafc;box-shadow:none;';

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
            const colors = { success: 'bg-slate-500', error: 'bg-red-500' };
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
                document.getElementById('stat-equipment').setAttribute('data-target', activeEq);
                document.getElementById('stat-equipment').textContent = activeEq;
                const equEl = document.getElementById('dash-statEquip');
                if (equEl) equEl.textContent = activeEq;

                const concerns = await getMyConcerns();
                const pendingConcerns = concerns ? concerns.filter(c => c.status === 'pending').length : 0;
                document.getElementById('stat-concerns').setAttribute('data-target', pendingConcerns);
                document.getElementById('stat-concerns').textContent = pendingConcerns;
                const conEl = document.getElementById('dash-statConcerns');
                if (conEl) conEl.textContent = pendingConcerns;

                const bookingsRaw = await getCourtBookings();
                // Resolve real Supabase ID to prevent type mismatch (string vs integer)
                let resolvedStatUid = String(user.id);
                try {
                    const _bidStat = user.barangay_id || user.username;
                    const { data: uRowStat } = await supabase.from('users').select('id').eq('barangay_id', _bidStat).maybeSingle();
                    if (uRowStat) resolvedStatUid = String(uRowStat.id);
                } catch(_) {}
                const myBookings = bookingsRaw ? bookingsRaw.filter(b =>
                    (String(b.user_id) === resolvedStatUid || String(b.userId) === resolvedStatUid) &&
                    (b.status === 'pending' || b.status === 'approved' || b.status === 'booked')
                ) : [];
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const upcomingCount = myBookings.filter(b => new Date(b.date) >= today).length;
                document.getElementById('stat-bookings').setAttribute('data-target', upcomingCount);
                document.getElementById('stat-bookings').textContent = upcomingCount;
                const booEl = document.getElementById('dash-statBookings');
                if (booEl) booEl.textContent = upcomingCount;

                // All-time total requests (borrowings + concerns + bookings)
                const totalReq = (eqReqs ? eqReqs.length : 0) + (concerns ? concerns.length : 0) + (bookingsRaw ? bookingsRaw.filter(b => String(b.user_id) === resolvedStatUid || String(b.userId) === resolvedStatUid).length : 0);
                const totEl = document.getElementById('stat-totalreq');
                if (totEl) { totEl.setAttribute('data-target', totalReq); totEl.textContent = totalReq; }

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
                    const _bidNotif = user.barangay_id || user.username;
                    const { data: uRowN } = await supabase.from('users').select('id').eq('barangay_id', _bidNotif).maybeSingle();
                    if (uRowN) resolvedNotifId = String(uRowN.id);
                } catch(_) {}
                window._resolvedUserId = resolvedNotifId; // Cache for realtime matching
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
                function _updateProfileQuotaUI() {
                    const now = new Date();
                    const monthKey = now.getFullYear() + '-' + (now.getMonth() + 1);
                    const quotaRaw = localStorage.getItem('profileEditQuota');
                    let quota = quotaRaw ? JSON.parse(quotaRaw) : {};
                    const used = (quota.month === monthKey) ? (quota.count || 0) : 0;
                    const remaining = Math.max(0, 2 - used);
                    const el = document.getElementById('profileEditQuota');
                    const btn = document.getElementById('profileSaveBtn');
                    if (el) {
                        if (remaining === 0) {
                            el.textContent = 'Edit limit reached for this month (0 edits remaining).';
                            el.style.color = '#dc2626';
                        } else {
                            el.textContent = remaining + ' profile edit' + (remaining === 1 ? '' : 's') + ' remaining this month.';
                            el.style.color = remaining === 1 ? '#d97706' : '#6b7280';
                        }
                    }
                    if (btn) btn.disabled = remaining === 0;
                }
                const spForm = document.getElementById('standaloneProfileForm');
                if (spForm) {
                    _updateProfileQuotaUI();
                    spForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        // ── 2-edits-per-month guard ──────────────────────
                        const now = new Date();
                        const monthKey = now.getFullYear() + '-' + (now.getMonth() + 1);
                        const quotaRaw = localStorage.getItem('profileEditQuota');
                        let quota = quotaRaw ? JSON.parse(quotaRaw) : {};
                        const usedThisMonth = (quota.month === monthKey) ? (quota.count || 0) : 0;
                        if (usedThisMonth >= 2) {
                            showAlert('You have reached the limit of 2 profile edits for this month. Changes are locked until next month.', 'error');
                            return;
                        }
                        const btn = e.target.querySelector('button[type="submit"]');
                        const origBtn = btn.innerHTML;
                        btn.innerHTML = 'Saving...'; btn.disabled = true;
                        try {
                            const payload = {
                                fullName: document.getElementById('p-fullName').value,
                                email: document.getElementById('p-email').value,
                                phone: document.getElementById('p-phone').value,
                                address: document.getElementById('p-address').value
                            };
                            
                            if (typeof updateUserProfile === 'function') {
                                const result = await updateUserProfile(payload);
                                if (!result.success) throw new Error(result.message);
                            } else {
                                throw new Error("Update function not found");
                            }
                            
                            const user = getCurrentUser();
                            user.fullName = payload.fullName;
                            user.email = payload.email;
                            user.contactNumber = payload.phone;
                            user.address = payload.address;
                            localStorage.setItem('barangay_user', JSON.stringify(user));
                            
                            showAlert('Profile updated successfully!', 'success');

                            // Track edit count
                            const _now = new Date();
                            const _mk = _now.getFullYear() + '-' + (_now.getMonth() + 1);
                            const _qr = localStorage.getItem('profileEditQuota');
                            let _q = _qr ? JSON.parse(_qr) : {};
                            const _used = (_q.month === _mk) ? (_q.count || 0) : 0;
                            localStorage.setItem('profileEditQuota', JSON.stringify({ month: _mk, count: _used + 1 }));
                            _updateProfileQuotaUI();

                            document.getElementById('sidebarUserName').textContent = user.fullName;
                            const mobileName = document.getElementById('mobileUserName');
                            if (mobileName) mobileName.textContent = user.fullName;
                        } catch(err) {
                            showAlert(err.message || "An error occurred", 'error');
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
                    ? "px-4 py-3 border-b border-gray-100 flex items-start gap-3 bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer transition dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 relative" 
                    : "px-4 py-3 border-b border-gray-100 flex items-start gap-3 bg-white hover:bg-gray-50 cursor-pointer transition dark:bg-slate-900/50 dark:border-slate-700 dark:hover:bg-slate-800 relative";

                const titleCss = isUnread 
                    ? "font-bold text-[13px] text-gray-800 dark:text-gray-100 cursor-pointer" 
                    : "font-medium text-[13px] text-gray-600 dark:text-gray-300 cursor-pointer";
                
                const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now';

                let iconBg = '#f1f5f9', iconColor = '#64748b';
                let iconHtml = '<i class="bi bi-bell-fill"></i>';
                if (n.type === 'booking_approved' || n.type === 'equipment_approved' || n.type === 'concern_resolved') { iconHtml = '<i class="bi bi-check-circle-fill"></i>'; iconBg = '#dcfce7'; iconColor = '#16a34a'; }
                else if (n.type === 'booking_rejected' || n.type === 'equipment_rejected' || n.type === 'concern_rejected') { iconHtml = '<i class="bi bi-x-circle-fill"></i>'; iconBg = '#fee2e2'; iconColor = '#dc2626'; }
                else if (n.type === 'concern_in_progress') { iconHtml = '<i class="bi bi-arrow-repeat"></i>'; iconBg = '#dbeafe'; iconColor = '#2563eb'; }
                else if (n.type === 'booking_cancelled' || n.type === 'event_conflict') { iconHtml = '<i class="bi bi-calendar-x-fill"></i>'; iconBg = '#fef3c7'; iconColor = '#d97706'; }
                else if (n.type === 'event_added') { iconHtml = '<i class="bi bi-calendar-event-fill"></i>'; iconBg = '#dbeafe'; iconColor = '#2563eb'; }

                const html = `
                    <div class="${containerCss}" onclick="handleBellClick('${n.id}')">
                        ${isUnread ? '<div class="absolute w-2 h-2 rounded-full bg-slate-500 top-4 right-4"></div>' : ''}
                        <div style="width:38px;height:38px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;font-size:18px;color:${iconColor};flex-shrink:0;">
                            ${iconHtml}
                        </div>
                        <div class="flex-1 min-w-0 pr-4 cursor-pointer">
                            <p class="${titleCss}">${n.message}</p>
                            <span class="text-[11px] font-semibold text-slate-700 mt-1 block cursor-pointer">${timeStr}</span>
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
                    if (notif.type === 'booking_approved') { iconHtml = '&#128197;'; titleText = 'Reservation Approved'; }
                    if (notif.type === 'booking_rejected') { iconHtml = '&#10060;'; titleText = 'Reservation Rejected'; }
                    if (notif.type === 'concern_resolved') { iconHtml = ''; titleText = 'Concern Resolved'; }
                    if (notif.type === 'concern_in_progress') { iconHtml = '&#128296;'; titleText = 'Concern In Progress'; }
                    if (notif.type === 'concern_rejected') { iconHtml = '&#10060;'; titleText = 'Concern Rejected'; }
                    if (notif.type === 'equipment_approved') { iconHtml = '&#128230;'; titleText = 'Equipment Request'; }
                    if (notif.type === 'booking_cancelled' || notif.type === 'event_conflict') { iconHtml = '¸Â'; titleText = 'Reservation Cancelled'; }
                    if (notif.type === 'event_added' || notif.type === 'event_cancelled') { iconHtml = '&#127881;'; titleText = 'Barangay Event'; }
                    if (notif.type === 'inventory') {
                        const msg = (notif.message || '').toLowerCase();
                        if (msg.includes('under repair')) { iconHtml = '&#128295;'; titleText = 'Items Under Repair'; }
                        else if (msg.includes('repaired')) { iconHtml = '&#9989;'; titleText = 'Items Repaired'; }
                        else if (msg.includes('disposal')) { iconHtml = '&#128465;'; titleText = 'Items For Disposal'; }
                        else if (msg.includes('recovered')) { iconHtml = '&#9989;'; titleText = 'Items Recovered'; }
                        else if (msg.includes('added') || msg.includes('new equipment')) { iconHtml = '&#128230;'; titleText = 'New Inventory'; }
                        else { iconHtml = '&#128230;'; titleText = 'Inventory Update'; }
                    }
                    
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
        async function renderEquipmentGrid(list) {
            const grid = document.getElementById('equipmentGrid');
            if (!list || list.length === 0) { grid.innerHTML = '<p class="text-gray-500 italic col-span-2">No equipment found.</p>'; return; }
            
            const nextAvailMap = {};
            try {
                await Promise.all(list.map(async item => {
                    if (item.available <= 0) {
                        nextAvailMap[item.id] = await getNextAvailableDate(item.id, 1);
                    }
                }));
            } catch(e) {
                console.warn('getNextAvailableDate failed:', e);
            }

            grid.innerHTML = list.map(item => {
                // Sanity check
                item.available = Math.min(item.available || 0, item.quantity || 1);
                const pct = item.quantity > 0 ? Math.min(100, Math.round((item.available / item.quantity) * 100)) : 0;
                let color, statusColor, statusBg, statusIcon;
                if (pct === 0)       { color = 'bg-gray-400';   statusColor = 'text-gray-500';   statusBg = 'bg-gray-50';   statusIcon = '<i class="bi bi-x-circle-fill"></i>'; }
                else if (pct < 40)   { color = 'bg-red-500';    statusColor = 'text-red-600';    statusBg = 'bg-red-50';    statusIcon = '<i class="bi bi-exclamation-triangle-fill"></i>'; }
                else if (pct < 75)   { color = 'bg-amber-400';  statusColor = 'text-amber-600';  statusBg = 'bg-amber-50';  statusIcon = '<i class="bi bi-dash-circle-fill"></i>'; }
                else                 { color = 'bg-green-500';  statusColor = 'text-green-600';  statusBg = 'bg-green-50';  statusIcon = '<i class="bi bi-check-circle-fill"></i>'; }
                const ok = item.available > 0;
                const disposal = parseInt(item.category) || 0;
                const broken = item.broken || 0;
                let statusText = item.available + ' Available';
                
                let detailsArr = [];
                if (broken > 0) detailsArr.push(broken + ' Under Repair');
                if (disposal > 0) detailsArr.push(disposal + ' For Disposal');
                
                if (!ok) {
                    if (detailsArr.length > 0) {
                        statusText = '0 Available';
                    } else {
                        statusText = 'Out of Stock';
                    }
                    statusIcon = '<i class="bi bi-x-circle-fill"></i>';
                }
                
                let extraBadges = '';
                if (broken > 0) {
                    extraBadges += '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-amber-500/90 text-white"><i class="bi bi-wrench"></i> ' + broken + ' Repair</span> ';
                }
                if (disposal > 0) {
                    extraBadges += '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-red-600/90 text-white"><i class="bi bi-trash-fill"></i> ' + disposal + ' Disposal</span>';
                }
                const nextAvail = nextAvailMap[item.id];
                let actionBtn = '';
                if (item.isLocked) {
                    actionBtn = '<button disabled class="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold rounded-xl shadow-inner cursor-not-allowed flex justify-center items-center gap-2"><i class="bi bi-lock-fill"></i> System Locked</button>';
                } else if (ok) {
                    actionBtn = `
                        <div class="equip-borrow-btn-container" data-id="${item.id}">
                            <button onclick="openBorrowModalWithEquip(${item.id})" class="equip-borrow-btn w-full py-3 text-sm font-bold rounded-xl transition transform hover:-translate-y-1 shadow-md cursor-pointer border-none flex justify-center items-center gap-2" style="background:#2563eb;color:#fff;"><i class="bi bi-pencil-square"></i> Request to Borrow</button>
                            <button disabled class="equip-closed-msg hidden w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 font-bold rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm cursor-not-allowed flex flex-col justify-center items-center gap-0.5">
                                <div class="text-[13px] text-gray-700 dark:text-gray-200 flex items-center gap-1.5"><i class="bi bi-clock-fill"></i> Borrowing Closed</div>
                                <div class="text-[11px] font-medium text-gray-500 dark:text-gray-400">Opens <span class="eq-open-txt"></span> to <span class="eq-close-txt"></span></div>
                            </button>
                        </div>
                    `;
                } else {
                    const nextLabel = nextAvail ? ' · Available ' + nextAvail.formatted : '';
                    actionBtn = '<div class="flex flex-col items-center gap-2 w-full">' +
                        '<button onclick="openBorrowModalWithEquip(' + item.id + ')" ' +
                        'class="w-full py-3 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition transform hover:-translate-y-1 shadow-md cursor-pointer border-none flex justify-center items-center gap-2"><i class="bi bi-calendar-range"></i> Request for other dates</button>' +
                        '</div>';
                }

                const pendingBadge = '';

                const imageSrc = item.image_url ? item.image_url : '../barangay-sun-logo.jpg';

                return `<div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col">
                    <!-- Image Header -->
                    <div class="relative h-44 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                        <img src="${imageSrc}" alt="${item.name}" class="w-full h-full object-contain object-center bg-white dark:bg-gray-800 transition-transform duration-500 group-hover:scale-110" onerror="this.src='../barangay-sun-logo.jpg'; this.onerror=null;">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div class="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${ok ? 'bg-slate-500/90 text-white' : 'bg-red-500/90 text-white'}">${statusIcon} ${statusText}</span>
                            ${extraBadges}
                        </div>
                        ${item.isLocked ? '<div class="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md flex items-center gap-1"><i class="bi bi-lock-fill"></i> Locked</div>' : ''}
                        <div class="absolute bottom-3 left-4 right-4">
                            <h4 class="font-extrabold text-xl text-white leading-tight drop-shadow-md">${item.name}</h4>
                            <p class="text-xs text-gray-200 font-medium drop-shadow-md line-clamp-2">${item.description || 'No description available'}</p>
                        </div>
                    </div>
                    
                    <!-- Details Section -->
                    <div class="p-4 flex flex-col">
                        <div class="mb-3">
                            <div class="flex justify-between items-center mb-1.5">
                                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Availability</span>
                                <span class="text-xs font-bold ${statusColor}">${item.available} of ${item.quantity} available${pct === 0 ? ' · <span style=\'background:#e5e7eb;color:#6b7280;font-size:10px;padding:1px 7px;border-radius:20px;font-weight:700;\'>Out of Stock</span>' : ''}</span>
                            </div>
                            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div class="${color} h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                            </div>
                        </div>
                        <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
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
                await renderEquipmentGrid(list);
                loadMyBorrowingsList();
            } catch(err) {
                console.error('[DEBUG] loadEquipmentView error:', err);
            }
        }
        
        async function handleJoinWaitlist(equipmentId, equipmentName) {
            const result = await joinEquipmentWaitlist(equipmentId, equipmentName);
            showToast(result.message, result.success ? 'success' : 'error');
        }

        // ¢â€â‚¬ Equipment Search Filter ¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬
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

        // ¢â€â‚¬ Borrowing History Search Filter ¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬
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
                'Chairs':      { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#0f1f3d"><rect x="6" y="2" width="12" height="10" rx="1.5"/><rect x="4" y="13" width="16" height="3" rx="1.5"/><rect x="6" y="17" width="3" height="5" rx="1"/><rect x="15" y="17" width="3" height="5" rx="1"/></svg>`, cls: 'eq-Chairs' },
                'Tables':      { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#0f1f3d"><rect x="1" y="7" width="22" height="3" rx="1.5"/><rect x="3" y="10" width="2.5" height="10" rx="1.25"/><rect x="18.5" y="10" width="2.5" height="10" rx="1.25"/><rect x="5" y="10" width="14" height="1.5" rx="0.75"/></svg>`, cls: 'eq-Tables' },
                'Tents':       { html: `<i class="bi bi-house-door-fill" style="font-size:20px;color:#d97706;"></i>`, cls: 'eq-Tents' },
                'Ladder':      { html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#d97706"><rect x="5" y="1" width="2.5" height="22" rx="1.25"/><rect x="16.5" y="1" width="2.5" height="22" rx="1.25"/><rect x="5" y="4" width="14" height="2" rx="1"/><rect x="5" y="10" width="14" height="2" rx="1"/><rect x="5" y="16" width="14" height="2" rx="1"/></svg>`, cls: 'eq-Ladder' },
                'Microphone':  { html: `<i class="bi bi-mic-fill" style="font-size:20px;color:#dc2626;"></i>`, cls: 'eq-Microphone' },
                'Speaker':     { html: `<i class="bi bi-speaker-fill" style="font-size:20px;color:#7c3aed;"></i>`, cls: 'eq-Speaker' },
                'Electric Fan':{ html: `<i class="bi bi-fan" style="font-size:20px;color:#3b82f6;"></i>`, cls: 'eq-Fan' }
            };
            const entry = name ? EQUIP_ICON_MAP[name.trim()] : null;
            const iconHtml = entry ? entry.html : `<i class="bi bi-box-seam-fill" style="font-size:20px;color:#0f1f3d;"></i>`;
            const iconCls  = entry ? entry.cls  : 'eq-Default';
            return `<div class="eq-icon ${iconCls}">${iconHtml}</div>`;
        }


        let _borrowingsAllSorted = [];
        let _borrowingsCurrentPage = 1;
        const _BORROWINGS_PER_PAGE = 6;

        async function loadMyBorrowingsList() {
            if (!allEquipmentList || allEquipmentList.length === 0) {
                try { allEquipmentList = await getEquipment(); } catch(e) { /* continue with keyword fallback */ }
            }
            const list = await getMyBorrowings();
            const container = document.getElementById('myBorrowingsList');
            if (!list || list.length === 0) {
                container.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-center col-span-full"><div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4"><i class="bi bi-box-seam"></i></div><p class="text-gray-500 font-medium">No borrowing history yet</p></div>';
                const pgr = document.getElementById('borrowingPaginationRow'); if (pgr) pgr.innerHTML = '';
                return;
            }
            _borrowingsAllSorted = [...list].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            _borrowingsCurrentPage = 1;
            _renderBorrowingsPage();
        }

        function _renderBorrowingsPage() {
            const container = document.getElementById('myBorrowingsList');
            const pgContainer = document.getElementById('borrowingPaginationRow');
            if (!_borrowingsAllSorted || _borrowingsAllSorted.length === 0) return;
            const total = _borrowingsAllSorted.length;
            const totalPages = Math.ceil(total / _BORROWINGS_PER_PAGE);
            if (_borrowingsCurrentPage > totalPages) _borrowingsCurrentPage = totalPages;
            const start = (_borrowingsCurrentPage - 1) * _BORROWINGS_PER_PAGE;
            const sorted = _borrowingsAllSorted.slice(start, start + _BORROWINGS_PER_PAGE);
            _borrowingsMap = {};
            sorted.forEach(b => { _borrowingsMap[b.id] = b; });
            container.innerHTML = sorted.map(b => {
                let statusBadge = '', statusBorder = 'border-slate-200';
                if (b.status === 'pending') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>Pending</span>'; statusBorder = 'border-amber-200'; }
                if (b.status === 'approved') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-50 text-slate-700"><span class="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>Approved</span>'; statusBorder = 'border-slate-200'; }
                if (b.status === 'rejected') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>'; statusBorder = 'border-red-200'; }
                if (b.status === 'returned') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Returned</span>'; statusBorder = 'border-blue-200'; }
                const rejectionMsg = (b.status === 'rejected' && b.rejection_reason) ? '<div class="mt-3 text-xs bg-red-50 p-3 rounded-lg border border-red-100"><strong class="text-red-700">Reason:</strong> <span class="text-red-600">' + b.rejection_reason + '</span></div>' : '';
                let deliveryBadge = '';
                if (b.purpose) {
                    const dm = b.purpose.match(/\| Delivery:\s*([^|]+)/);
                    if (dm) {
                        const isDelivery = dm[1].trim().toLowerCase().startsWith('delivery');
                        deliveryBadge = isDelivery
                            ? '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;margin-top:4px;">&#128666; Delivery</span>'
                            : '<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:#f4f6f9;color:#166534;border:1px solid #dce5f5;margin-top:4px;">&#127963; Pickup</span>';
                    }
                }
                const equipItem = (typeof allEquipmentList !== 'undefined' && allEquipmentList) ? allEquipmentList.find(e => e.name === b.equipment) : null;
                const equipIcon = (equipItem && equipItem.image_url) 
                    ? `<img src="${equipItem.image_url}" alt="${b.equipment}" style="width:48px;height:48px;border-radius:12px;object-fit:cover;border:1px solid var(--border-color);flex-shrink:0;background:var(--panel-bg);">` 
                    : getEquipmentIcon(b.equipment);
                return '<div class="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ' + statusBorder + ' shadow-sm hover:shadow-md transition-all duration-300" style="cursor:pointer;" onclick="openEquipDetail(' + b.id + ')">' +
                    '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div class="flex items-start gap-4">' + equipIcon +
                    '<div><h4 class="font-bold text-lg text-gray-800 dark:text-white">' + b.equipment + '</h4><p class="text-sm text-gray-500 font-medium">Quantity: <span class="text-slate-700 font-bold">x' + b.quantity + '</span></p>' + deliveryBadge + '</div></div>' +
                    '<div class="flex flex-col items-end gap-2">' + statusBadge + '<div class="text-xs text-gray-400 flex items-center gap-1">&#128197; ' + formatDate(b.borrowDate) + ' <i class="bi bi-arrow-right"></i> ' + formatDate(b.returnDate) + '</div></div></div>' +
                    rejectionMsg +
                    (b.status === 'pending' ? '<div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"><p class="text-xs text-amber-600 font-medium flex items-center gap-1"><i class="bi bi-clock"></i> Waiting for approval</p><div class="flex gap-2"><button onclick="event.stopPropagation();cancelEqRequest(' + b.id + ')" style="padding:6px 16px;border-radius:8px;border:1.5px solid #2563eb;background:#fff;color:#2563eb;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;" onmouseover="this.style.background=\'#eff6ff\'" onmouseout="this.style.background=\'#fff\'">Cancel</button></div></div>' : '') +
                    '<div style="position:absolute;bottom:10px;right:14px;font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;">View details <i class="bi bi-arrow-right"></i></div>' +
                    '</div>';
            }).join('');
            // Render pagination
            if (!pgContainer) return;
            if (total <= _BORROWINGS_PER_PAGE) { pgContainer.innerHTML = ''; return; }
            const btns = [];
            btns.push('<button onclick="_borrowingsCurrentPage>1&&(_borrowingsCurrentPage--,_renderBorrowingsPage())" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border-color);background:var(--input-bg);color:var(--text-muted);font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;'
                + (_borrowingsCurrentPage===1?'opacity:0.4;pointer-events:none;':'')+'">&#8592;</button>');
            const range = 2;
            for (let p = 1; p <= totalPages; p++) {
                if (p === 1 || p === totalPages || (p >= _borrowingsCurrentPage - range && p <= _borrowingsCurrentPage + range)) {
                    const isActive = p === _borrowingsCurrentPage;
                    btns.push('<button onclick="_borrowingsCurrentPage='+p+';_renderBorrowingsPage()" style="width:36px;height:36px;border-radius:8px;border:1.5px solid '+(isActive?'#1e3a5f':'var(--border-color)')+';background:'+(isActive?'#1e3a5f':'var(--input-bg)')+';color:'+(isActive?'#fff':'var(--text-muted)')+';font-size:13px;font-weight:'+(isActive?'800':'600')+';cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">'+p+'</button>');
                } else if (p === _borrowingsCurrentPage - range - 1 || p === _borrowingsCurrentPage + range + 1) {
                    btns.push('<span style="padding:0 4px;color:var(--text-muted);font-size:13px;">...</span>');
                }
            }
            btns.push('<button onclick="_borrowingsCurrentPage<'+totalPages+'&&(_borrowingsCurrentPage++,_renderBorrowingsPage())" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border-color);background:var(--input-bg);color:var(--text-muted);font-size:14px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;'
                + (_borrowingsCurrentPage===totalPages?'opacity:0.4;pointer-events:none;':'')+'">&#8594;</button>');
            pgContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border-color);margin-top:8px;">'
                + '<span style="font-size:12px;color:var(--text-muted);margin-right:6px;">'+(((_borrowingsCurrentPage-1)*_BORROWINGS_PER_PAGE)+1)+'-'+Math.min(_borrowingsCurrentPage*_BORROWINGS_PER_PAGE,total)+' of '+total+'</span>'
                + btns.join('')
                + '</div>';
        }

        // ==========================================
        // BORROW MODAL LOGIC
        // ==========================================
        /* Duplicate openBorrowModalWithEquip removed */

        function openBorrowModal() { showToast('Please click Borrow on a specific equipment card', 'error'); }
        function closeBorrowModal() {
            document.getElementById('borrowModal').classList.add('hidden');
            borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true;
            currentBorrowPurpose = null;
            const body = document.getElementById('borrowFormBody');
            if (body) body.style.display = 'none';
            const evBtn = document.getElementById('purposeBtnEvent');
            const buBtn = document.getElementById('purposeBtnBurol');
            _setPurposeBtnStyle(evBtn, false);
            _setPurposeBtnStyle(buBtn, false);
            const dr = document.getElementById('borrowDurationRules'); if (dr) dr.innerHTML = '';
            const ai = document.getElementById('availableItemsForPurpose'); if (ai) ai.innerHTML = '';
            // Reset delivery method
            const _dp = document.getElementById('deliveryPickup'); if (_dp) _dp.checked = false;
            const _dd = document.getElementById('deliveryDelivery'); if (_dd) _dd.checked = false;
            const _pbl = document.getElementById('deliveryPickupLabel'); if (_pbl) _pbl.style.border = '2px solid #e2e8f0';
            const _dtl = document.getElementById('deliveryToAddrLabel'); if (_dtl) { _dtl.style.border = '2px solid #e2e8f0'; _dtl.style.display = 'flex'; }
            const _pon = document.getElementById('deliveryPickupOnlyNotice'); if (_pon) _pon.style.display = 'none';
            updateBorrowLockState();
            window._borrowTermsAgreed = false;
            const _sbtn = document.getElementById('submitBorrowBtn');
            if (_sbtn) { _sbtn.innerHTML = 'Submit Borrow Request'; _sbtn.style.background = ''; }
            const _bdr = document.getElementById('borrowDetailsReveal'); if (_bdr) _bdr.style.display = 'none';
        }

        // Submit button validation
        function validateBorrowTime() {
            const eqOpen = 8, eqClose = 17;
            const errMsg = 'Must be between 8:00 AM and 5:00 PM (operating hours)';
            const bInput = document.getElementById('borrowTime');
            const rInput = document.getElementById('returnTime');
            const bEl = document.getElementById('borrowTimeError');
            const bVal = bInput ? bInput.value : '';
            if (bEl) {
                if (!bVal) {
                    bEl.style.display = 'none';
                } else {
                    const bH = parseInt(bVal.split(':')[0]);
                    const bInvalid = bH < eqOpen || bH >= eqClose;
                    bEl.textContent = errMsg;
                    bEl.style.display = bInvalid ? 'block' : 'none';
                    // Always sync return time to match borrow time
                    if (!bInvalid && rInput) {
                        rInput.value = bVal;
                        validateReturnTime();
                    }
                }
            }
            updateBorrowSubmitButton();
        }

        function validateReturnTime() {
            const eqOpen = 8, eqClose = 17;
            const errMsg = 'Must be between 8:00 AM and 5:00 PM (operating hours)';
            const rInput = document.getElementById('returnTime');
            const rEl = document.getElementById('returnTimeError');
            const rVal = rInput ? rInput.value : '';
            if (rEl) {
                if (!rVal) {
                    rEl.style.display = 'none';
                } else {
                    const rH = parseInt(rVal.split(':')[0]);
                    const rInvalid = rH < eqOpen || rH >= eqClose;
                    rEl.textContent = errMsg;
                    rEl.style.display = rInvalid ? 'block' : 'none';
                }
            }
            updateBorrowSubmitButton();
        }

        function updateBorrowSubmitButton() {
            const btn = document.getElementById('submitBorrowBtn');
            if (!btn) return;
            const qty = parseInt(document.getElementById('borrowQty').value);
            const purpose = document.getElementById('borrowPurpose').value;
            const name = document.getElementById('borrowerFullName').value;
            const contact = document.getElementById('borrowerContact').value;
            const bTimeErr = document.getElementById('borrowTimeError');
            const rTimeErr = document.getElementById('returnTimeError');
            const timesValid = !(bTimeErr && bTimeErr.style.display === 'block') && !(rTimeErr && rTimeErr.style.display === 'block');
            const deliveryPickup = document.getElementById('deliveryPickup');
            const deliveryDelivery = document.getElementById('deliveryDelivery');
            const deliveryMethodSelected = (deliveryPickup && deliveryPickup.checked) || (deliveryDelivery && deliveryDelivery.checked);
            btn.disabled = !(currentBorrowPurpose && borrowStartDate && borrowReturnDate && qty > 0 && purpose.trim() !== '' && name.trim() !== '' && contact.trim() !== '' && timesValid && deliveryMethodSelected);
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
                    bDisp.innerHTML = '<div class="text-lg font-bold text-slate-700">' + fullMonths[d.getMonth()] + ' ' + d.getDate() + '</div><div class="text-xs text-slate-600">' + d.getFullYear() + '</div>';
                    bDisp.classList.add('border-slate-400', 'bg-slate-100');
                }
                if (dpStartDay) { dpStartDay.textContent = d.getDate(); dpStartMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                if (rangeDisplay) rangeDisplay.textContent = 'Now select a return date from the calendar';
            } else {
                if (bDisp) {
                    bDisp.innerHTML = '<div class="text-lg font-bold text-slate-700">Select date</div><div class="text-xs text-slate-600">from calendar</div>';
                    bDisp.classList.remove('border-slate-400', 'bg-slate-100');
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
                if (rangeDisplay) rangeDisplay.innerHTML = '<span class="text-slate-700">&#128197; ' + fullMonths[start.getMonth()] + ' ' + start.getDate() + ' <i class="bi bi-arrow-right"></i> ' + fullMonths[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</span> <span class="ml-2 px-2 py-1 bg-slate-500 text-white rounded-lg text-xs font-bold">' + diffDays + ' day' + (diffDays > 1 ? 's' : '') + '</span>';
            } else {
                if (rDisp) {
                    rDisp.innerHTML = '<div class="text-lg font-bold text-teal-700">Select date</div><div class="text-xs text-teal-500">from calendar</div>';
                    rDisp.classList.remove('border-teal-400', 'bg-teal-100');
                }
                if (dpReturnDay) { dpReturnDay.textContent = '--'; dpReturnMonth.textContent = 'Select date'; if (durText) durText.textContent = '0 days'; }
            }
        }

        function renderBorrowAlerts() {
            const container = document.getElementById('borrowModalAlerts');
            if (!container) return;
            container.innerHTML = '';
            
            const bookings = window.activeBorrowingsForModal || [];
            const equip = window.currentEquipmentItem || { quantity: 1, broken: 0, name: 'items' };
            const totalStock = equip.quantity - (equip.broken || 0);
            
            const todayStr = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
            const checkStart = borrowStartDate ? borrowStartDate : todayStr;
            const checkEnd = borrowReturnDate ? borrowReturnDate : checkStart;
            
            let minAvail = totalStock;
            let startD = new Date(checkStart);
            let endD = new Date(checkEnd);
            
            for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
                const checkStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                let borrowedCount = 0;
                bookings.forEach(b => {
                    const bStart = b.borrow_date.split('T')[0];
                    const bEnd   = b.return_date.split('T')[0];
                    if (checkStr >= bStart && checkStr <= bEnd) {
                        borrowedCount += parseInt(b.quantity);
                    }
                });
                const avail = totalStock - borrowedCount;
                if (avail < minAvail) minAvail = avail;
            }
            
            // Dynamic Header Badge Update
            const badge = document.getElementById('borrowModalStockBadge');
            if (badge) {
                badge.innerHTML = `${minAvail} Available`;
                badge.className = minAvail > 0 
                    ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-slate-500/90 text-white backdrop-blur-md' 
                    : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-red-500/90 text-white backdrop-blur-md';
            }
            
            if (minAvail <= 0) {
                let nextAvailableDate = null;
                for (let i = 1; i <= 90; i++) {
                    const checkDate = new Date();
                    checkDate.setDate(checkDate.getDate() + i);
                    const checkStr = checkDate.getFullYear() + '-' + String(checkDate.getMonth() + 1).padStart(2, '0') + '-' + String(checkDate.getDate()).padStart(2, '0');
                    let bCount = 0;
                    bookings.forEach(b => {
                        const bStart = b.borrow_date.split('T')[0];
                        const bEnd   = b.return_date.split('T')[0];
                        if (checkStr >= bStart && checkStr <= bEnd) {
                            bCount += parseInt(b.quantity);
                        }
                    });
                    if (bCount < totalStock) {
                        nextAvailableDate = checkDate;
                        break;
                    }
                }
                
                const itemName = equip.name ? equip.name.toLowerCase() : 'items';
                
                let html = `
                <div class="bg-orange-50 dark:bg-[#2a1a14] border border-orange-200 dark:border-orange-900/50 rounded-2xl p-4 flex gap-4 text-orange-900 dark:text-orange-200 shadow-sm relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                    <div class="mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400">
                        <i class="bi bi-x-circle-fill"></i>
                    </div>
                    <div>
                        <h6 class="font-bold text-sm mb-1">All ${totalStock} ${itemName} are currently borrowed</h6>
                        <p class="text-xs leading-relaxed opacity-90">Don't worry — this doesn't mean you can't borrow them. Someone else is using all ${totalStock} ${itemName} right now, but <strong>they'll be returned soon.</strong> You can still request ${itemName} for a different date — just pick when you need them from the calendar below and we'll reserve them for you.</p>
                    </div>
                </div>
                `;
                
                if (nextAvailableDate) {
                    const nextDateFormatted = nextAvailableDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const nextMonth = nextAvailableDate.getMonth();
                    const nextYear = nextAvailableDate.getFullYear();
                    
                    html += `
                    <div class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 text-slate-900 dark:text-slate-200 shadow-sm relative overflow-hidden mt-1">
                        <div class="absolute left-0 top-0 bottom-0 w-1 bg-slate-500"></div>
                        <div class="flex items-center gap-3">
                            <div class="ml-1 shrink-0 flex items-center justify-center text-slate-700 dark:text-slate-400">
                                <i class="bi bi-clock-history"></i>
                            </div>
                            <p class="text-xs font-medium"><strong>${totalStock} ${itemName}</strong> will be fully free starting <strong>${nextDateFormatted}</strong> — tap to jump there</p>
                        </div>
                        <button type="button" onclick="jumpToDate(${nextYear}, ${nextMonth})" class="shrink-0 px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-200 bg-white dark:bg-[#1a3326] hover:bg-slate-50 dark:hover:bg-[#204030] text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-sm cursor-pointer">Show me</button>
                    </div>
                    `;
                }
                container.innerHTML = html;
            }
        }
        
        function jumpToDate(year, month) {
            currentYear = year;
            currentMonth = month;
            renderBorrowCalendar();
        }

        function renderExistingBookings() {
            const container = document.getElementById('existingBookingsContainer');
            if (!container) return;
            const bookings = window.activeBorrowingsForModal || [];
            if (bookings.length === 0) {
                container.innerHTML = '<p class="text-xs text-gray-400 italic">No existing bookings.</p>';
                return;
            }
            const currentUserId = getCurrentUser().id;
            let html = '';
            bookings.forEach(b => {
                const isYou = String(b.user_id) === String(currentUserId);
                const name = isYou ? 'You' : (b.users ? b.users.full_name || b.users.username : 'User');
                const [startM, startD] = b.borrow_date.split('T')[0].split('-').slice(1);
                const [endM, endD] = b.return_date.split('T')[0].split('-').slice(1);
                const dateRange = parseInt(startM) + '/' + parseInt(startD) + ' - ' + parseInt(endM) + '/' + parseInt(endD);
                
                html += `
                <div class="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded-lg border border-gray-100 dark:border-gray-600 shadow-sm">
                    <div>
                        <div class="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            ${name} ${isYou ? '<span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-500 text-white font-bold">You</span>' : ''}
                        </div>
                        <div class="text-[10px] text-gray-500 dark:text-gray-400">${dateRange}</div>
                    </div>
                    <div class="text-xs font-extrabold text-orange-600 dark:text-orange-400">${b.quantity} items</div>
                </div>`;
            });
            container.innerHTML = html;
        }

        function selectDeliveryMethod(method) {
            const pickupRadio = document.getElementById('deliveryPickup');
            const deliveryRadio = document.getElementById('deliveryDelivery');
            const addrField = document.getElementById('deliveryAddressField');
            const pickupLabel = document.getElementById('deliveryPickupLabel');
            const deliveryLabel = document.getElementById('deliveryToAddrLabel');
            if (pickupRadio) pickupRadio.checked = method === 'pickup';
            if (deliveryRadio) deliveryRadio.checked = method === 'delivery';
            const active = '2px solid #1e3a5f', inactive = '2px solid #e2e8f0';
            if (pickupLabel) pickupLabel.style.border = method === 'pickup' ? active : inactive;
            if (deliveryLabel) deliveryLabel.style.border = method === 'delivery' ? active : inactive;
            updateBorrowSubmitButton();
        }

        function updateDeliveryOptions(itemOrName) {
            const globalOff = window._globalDeliveryEnabled === false;
            const perItemAllowed = _itemDeliveryAllowed(itemOrName);
            const allowed = !globalOff && perItemAllowed;
            const deliveryLabel = document.getElementById('deliveryToAddrLabel');
            const notice = document.getElementById('deliveryPickupOnlyNotice');
            const pickupRadio = document.getElementById('deliveryPickup');
            const deliveryRadio = document.getElementById('deliveryDelivery');
            const pickupLabel = document.getElementById('deliveryPickupLabel');
            if (pickupRadio) pickupRadio.checked = false;
            if (deliveryRadio) deliveryRadio.checked = false;
            if (deliveryLabel) { deliveryLabel.style.display = allowed ? 'flex' : 'none'; deliveryLabel.style.border = '2px solid #e2e8f0'; }
            if (notice) {
                if (globalOff) {
                    notice.innerHTML = '⚠️ <strong>Delivery is currently unavailable.</strong> Pickup only at this time.';
                    notice.style.display = 'block';
                } else if (!perItemAllowed) {
                    notice.innerHTML = '⚠️ This item is <strong>Pickup only</strong> — large/heavy items cannot be delivered.';
                    notice.style.display = 'block';
                } else {
                    notice.style.display = 'none';
                }
            }
            if (pickupLabel) pickupLabel.style.border = '2px solid #e2e8f0';
            if (!allowed) { if (pickupRadio) pickupRadio.checked = true; if (pickupLabel) pickupLabel.style.border = '2px solid #1e3a5f'; }
        }

        function itemAllowsBurol(itemName) {
            const lower = (itemName || '').toLowerCase();
            return !BUROL_EXCLUDED.some(kw => lower.includes(kw));
        }

        function _setPurposeBtnStyle(btn, active) {
            if (!btn || btn.style.display === 'none') return;
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (active) {
                btn.style.cssText = _BTN_ACTIVE;
            } else {
                btn.style.cssText = _BTN_BASE + (isDark
                    ? 'border:2px solid #1e3a6b;background:#0f1f3d;box-shadow:none;'
                    : 'border:2px solid #e2e8f0;background:#f8fafc;box-shadow:none;');
            }
            const nameEl = btn.querySelector('span:nth-child(2)');
            const subEl  = btn.querySelector('span:nth-child(3)');
            if (nameEl) nameEl.style.color = active ? '#fff' : (isDark ? '#f1f5f9' : '#0a1628');
            if (subEl)  subEl.style.color  = active ? 'rgba(255,255,255,.8)' : '#94a3b8';
        }

        function selectBorrowPurpose(purpose) {
            currentBorrowPurpose = purpose;
            _setPurposeBtnStyle(document.getElementById('purposeBtnEvent'), purpose === 'event');
            _setPurposeBtnStyle(document.getElementById('purposeBtnBurol'), purpose === 'burol');
            const body = document.getElementById('borrowFormBody');
            if (body) { body.style.display = 'block'; body.style.visibility = 'visible'; }
            borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true;
            const _bdrSel = document.getElementById('borrowDetailsReveal'); if (_bdrSel) _bdrSel.style.display = 'none';
            updateBorrowDurationRules();
            renderAvailableItemsForPurpose(purpose);
            updateBorrowDateDisplays();
            renderBorrowCalendar();
            updateBorrowSubmitButton();
        }

        function updateBorrowDurationRules() {
            const el = document.getElementById('borrowDurationRules');
            if (!el) return;
            if (!currentBorrowPurpose) { el.innerHTML = ''; return; }
            if (currentBorrowPurpose === 'event') {
                el.innerHTML = '<div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:10px 12px;margin-bottom:8px;font-size:12px;color:#0f766e;">&#128203; <strong>Personal Events:</strong> Pick up on your event day, return the next day at the same time. <strong>(1-day borrowing period)</strong></div><div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:7px 10px;font-size:11px;color:#92400e;font-weight:600;">&#9888; Maximum borrow period is 3 days.</div>';
            } else {
                el.innerHTML = '<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 12px;margin-bottom:8px;font-size:12px;color:#92400e;">&#128203; <strong>Funeral Viewing:</strong> Click your start date, then click your return date.</div><div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:7px 10px;font-size:11px;color:#92400e;font-weight:600;">&#9888; Maximum borrow period is 3 days.</div>';
            }
        }

        function renderAvailableItemsForPurpose(purpose) {
            const el = document.getElementById('availableItemsForPurpose');
            if (el) el.innerHTML = '';
            return; // chips removed
            const label = purpose === 'event' ? 'EVENT' : 'FUNERAL VIEWING';
            const chips = ALL_BORROW_ITEMS.map(name => {
                const excluded = !itemAllowsBurol(name);
                const available = purpose === 'event' || !excluded;
                if (available) {
                    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#e8edf5;color:#065f46;border:1px solid #1e3a5f;margin:2px;">' + name + '</span>';
                } else {
                    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;text-decoration:line-through;opacity:.7;margin:2px;">' + name + '</span>';
                }
            }).join('');
            el.innerHTML = '<div style="margin-bottom:4px;"><div style="font-size:10px;font-weight:700;color:#64748b;letter-spacing:.08em;margin-bottom:6px;">AVAILABLE FOR ' + label + '</div><div>' + chips + '</div></div>';
        }

        function renderBorrowCalendar() {
            const grid = document.getElementById('borrowCalendarGrid');
            const monthTitle = document.getElementById('borrowMonthTitle');
            const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            monthTitle.textContent = months[currentMonth] + ' ' + currentYear;
            // Update rule badge
            const _crb = document.getElementById('calRuleBadge');
            if (_crb) {
                if (currentBorrowPurpose === 'event') {
                    _crb.style.cssText = 'display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:.05em;background:#e8edf5;color:#1e3a5f;border:1px solid #1e3a5f;';
                    _crb.textContent = 'Next-day return';
                } else if (currentBorrowPurpose === 'burol') {
                    _crb.style.cssText = 'display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:.05em;background:#fef3c7;color:#92400e;border:1px solid #fde68a;';
                    _crb.textContent = 'Max 7 days';
                } else {
                    _crb.style.display = 'none';
                }
            }
            grid.innerHTML = '';
            // Gate calendar until purpose selected
            if (!currentBorrowPurpose) {
                grid.innerHTML = '<div style="grid-column:span 7;text-align:center;padding:32px 16px;color:#94a3b8;font-size:13px;font-weight:600;">&#128073; Select your purpose above to continue</div>';
                return;
            }
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const today = new Date(); today.setHours(0,0,0,0);
            
            const bookings = window.activeBorrowingsForModal || [];
            const equip = window.currentEquipmentItem || { quantity: 1, broken: 0 };
            const totalStock = equip.quantity - (equip.broken || 0);

            for (let i = 0; i < firstDay; i++) { grid.appendChild(document.createElement('div')); }
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                const dateObj = new Date(currentYear, currentMonth, day);
                const dayDiv = document.createElement('div');
                dayDiv.className = 'p-2.5 rounded-lg text-center font-bold text-sm transition transform ';
                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                
                let borrowedCount = 0;
                bookings.forEach(b => {
                    const bStart = b.borrow_date.split('T')[0];
                    const bEnd   = b.return_date.split('T')[0];
                    if (dateStr >= bStart && dateStr <= bEnd) {
                        borrowedCount += parseInt(b.quantity);
                    }
                });
                
                const isFullyBooked = borrowedCount >= totalStock;
                const isPartiallyBooked = borrowedCount > 0 && borrowedCount < totalStock;

                if (dateObj < today) {
                    dayDiv.style.cssText = isDark
                        ? 'background:#374151;color:#6b7280;cursor:not-allowed;'
                        : 'background:#f3f4f6;color:#9ca3af;cursor:not-allowed;';
                } else if (isFullyBooked) {
                    dayDiv.style.cssText = isDark
                        ? 'background:#ef4444;color:#fff;cursor:not-allowed;opacity:0.8;'
                        : 'background:#ef4444;color:#fff;cursor:not-allowed;opacity:0.9;';
                    dayDiv.title = "Fully Booked";
                } else {
                    let baseBg = isDark ? '#374151' : '#f0f4ff';
                    let baseColor = isDark ? '#1e3a5f' : '#0f1f3d';
                    let baseBorder = '1px solid #1e3a5f';
                    let hoverBg = isDark ? '#4b5563' : '#a7f3d0';
                    
                    if (isPartiallyBooked) {
                        baseBg = isDark ? '#ea580c' : '#f97316';
                        baseColor = '#fff';
                        baseBorder = 'none';
                        hoverBg = isDark ? '#c2410c' : '#ea580c';
                        dayDiv.title = `Partially booked (${totalStock - borrowedCount} left)`;
                    } else {
                        dayDiv.title = `${totalStock} available`;
                    }
                    
                    dayDiv.style.cssText = `background:${baseBg};color:${baseColor};border:${baseBorder};cursor:pointer;`;
                    dayDiv.className += 'hover:scale-105';
                    
                    dayDiv.onmouseenter = () => { if(!['borrowStartDate','borrowReturnDate'].some(k=>window[k]===dateStr)) dayDiv.style.background = hoverBg; };
                    dayDiv.onmouseleave = () => { if(!['borrowStartDate','borrowReturnDate'].some(k=>window[k]===dateStr)) dayDiv.style.background = baseBg; };
                    dayDiv.onclick = () => selectBorrowDate(dateStr, totalStock - borrowedCount);
                }
                
                if (dateObj.getTime() === today.getTime() && !isFullyBooked) { dayDiv.style.outline = '2px solid #1e3a5f'; dayDiv.style.outlineOffset = '2px'; }
                if (borrowStartDate === dateStr) { dayDiv.style.cssText = 'background:#1e3a5f;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(30,58,95,0.4);outline:2px solid #1e3a5f;outline-offset:0;'; }
                if (borrowReturnDate === dateStr) { dayDiv.style.cssText = 'background:#0d9488;color:#fff;cursor:pointer;box-shadow:0 2px 8px rgba(13,148,136,0.4);outline:2px solid #5eead4;outline-offset:0;'; }
                if (borrowStartDate && borrowReturnDate) {
                    const start = new Date(borrowStartDate); const end = new Date(borrowReturnDate);
                    if (dateObj > start && dateObj < end) { dayDiv.style.background = isDark ? '#0f1f3d' : '#e8edf5'; dayDiv.style.color = '#1e3a5f'; }
                }
                dayDiv.textContent = day;
                grid.appendChild(dayDiv);
            }
        }

        function selectBorrowDate(dateStr, currentAvailable = null) {
            if (!currentBorrowPurpose) return showToast('Please select a purpose first.', 'info');
            // Lock: ignore all clicks once both dates are chosen
            if (borrowStartDate && borrowReturnDate) return;

            const today = new Date(); today.setHours(0,0,0,0);
            if (new Date(dateStr) < today) return showToast('Cannot select past dates', 'error');

            const bookings = window.activeBorrowingsForModal || [];
            const equip = window.currentEquipmentItem || { quantity: 1, broken: 0 };
            const totalStock = equip.quantity - (equip.broken || 0);

            if (borrowDateSelectingStart) {
                if (currentAvailable !== null && currentAvailable <= 0) return showToast('This date is fully booked.', 'error');
                if (currentBorrowPurpose === 'event') {
                    // Event: borrow day selected, return = next day
                    const nd = new Date(dateStr); nd.setDate(nd.getDate() + 1);
                    const nextDayStr = nd.getFullYear() + '-' + String(nd.getMonth()+1).padStart(2,'0') + '-' + String(nd.getDate()).padStart(2,'0');
                    borrowStartDate = dateStr; borrowReturnDate = nextDayStr; borrowDateSelectingStart = true;
                    updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                    updateBorrowLockState();
                    const _bdrEv = document.getElementById('borrowDetailsReveal'); if (_bdrEv) _bdrEv.style.display = 'block';
                    return;
                }
                // Funeral Viewing: first click = start date only; wait for second click for return date
                borrowStartDate = dateStr; borrowReturnDate = null; borrowDateSelectingStart = false;
                const _rdEl = document.getElementById('dateRangeDisplay');
                if (_rdEl) { _rdEl.textContent = 'Now click your return date (max 3 days from start date).'; _rdEl.style.fontWeight = ''; _rdEl.style.background = ''; }
                updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                updateBorrowLockState();
            } else {
                if (new Date(dateStr) <= new Date(borrowStartDate)) return showToast('Return date must be after borrow date', 'error');

                const diffTime = Math.abs(new Date(dateStr) - new Date(borrowStartDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 2) {
                    return showToast('Maximum borrow period is 3 days. Please choose a closer return date.', 'error');
                }
                
                // Check all days in range for minimum availability
                let minAvail = totalStock;
                let startD = new Date(borrowStartDate);
                let endD = new Date(dateStr);
                
                for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
                    const checkStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                    let borrowedCount = 0;
                    bookings.forEach(b => {
                        const bStart = b.borrow_date.split('T')[0];
                        const bEnd   = b.return_date.split('T')[0];
                        if (checkStr >= bStart && checkStr <= bEnd) {
                            borrowedCount += parseInt(b.quantity);
                        }
                    });
                    const avail = totalStock - borrowedCount;
                    if (avail < minAvail) minAvail = avail;
                }
                
                if (minAvail <= 0) {
                    return showToast('Your selected range includes fully booked dates. Please choose another range.', 'error');
                }
                
                // Update Max Qty allowed
                const qtyInput = document.getElementById('borrowQty');
                if (qtyInput) {
                    qtyInput.max = minAvail;
                    if (parseInt(qtyInput.value) > minAvail) qtyInput.value = minAvail;
                }
                const helpEl = document.getElementById('borrowMaxHelp');
                if (helpEl) helpEl.innerHTML = '&#128230; Max: ' + minAvail + (minAvail === 1 ? ' unit available' : ' units available on selected dates');

                borrowReturnDate = dateStr; borrowDateSelectingStart = true;
                const _bdrBu = document.getElementById('borrowDetailsReveal'); if (_bdrBu) _bdrBu.style.display = 'block';
            }
            updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
            updateBorrowLockState();
        }

        function updateBorrowLockState() {
            const btn = document.getElementById('clearBorrowDatesBtn');
            const rangeDisplay = document.getElementById('dateRangeDisplay');
            const isLocked = !!(borrowStartDate && borrowReturnDate);
            if (btn) btn.style.display = isLocked ? 'flex' : 'none';
            if (rangeDisplay && isLocked) {
                rangeDisplay.style.fontWeight = '700';
                rangeDisplay.style.background = 'rgba(30,58,95,0.1)';
            } else if (rangeDisplay) {
                rangeDisplay.style.fontWeight = '';
                rangeDisplay.style.background = '';
            }
        }

        async function clearBorrowDates() {
            const confirmed = await showConfirmModal(
                'Clear your selected dates? You will need to pick new borrow and return dates.',
                'Clear Dates',
                '🗑 Yes, Clear',
                'Cancel',
                'warning'
            );
            if (!confirmed) return;
            borrowStartDate = null;
            borrowReturnDate = null;
            borrowDateSelectingStart = true;
            const _bdrClr = document.getElementById('borrowDetailsReveal'); if (_bdrClr) _bdrClr.style.display = 'none';
            updateBorrowDateDisplays();
            renderBorrowCalendar();
            updateBorrowSubmitButton();
            renderBorrowAlerts();
            updateBorrowLockState();
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
            if (window._borrowTermsAgreed) {
                await _doSubmitBorrowRequest();
            } else {
                await showBorrowTermsModal();
            }
        });

        async function _doSubmitBorrowRequest() {
            const equipId = parseInt(document.getElementById('borrowEquipmentId').value);
            const qty = parseInt(document.getElementById('borrowQty').value);
            const purposeTypeLabel = currentBorrowPurpose === 'burol' ? 'Funeral Viewing' : 'Personal Events';
            const purposeStr = '[' + purposeTypeLabel + '] ' + document.getElementById('borrowPurpose').value;
            const fullName = document.getElementById('borrowerFullName').value;
            const contact = document.getElementById('borrowerContact').value;
            const address = document.getElementById('borrowerAddress').value;
            if (!/^\d{11}$/.test(contact)) return showToast('Please enter a valid 11-digit phone number.', 'error');

            const borrowTime = document.getElementById('borrowTime').value;
            const returnTime = document.getElementById('returnTime').value;
            
            const borrowDate = borrowStartDate;
            const returnDate = borrowReturnDate;
            
            if (!equipId) return showToast('Please select an equipment item', 'error');
            if (!borrowDate || !returnDate) return showToast('Please select both dates', 'error');
            if (!borrowTime || !returnTime) return showToast('Please select the pickup and return times', 'error');

            const eqOpen = 8, eqClose = 17;

            const bHour = parseInt(borrowTime.split(':')[0]);
            const rHour = parseInt(returnTime.split(':')[0]);

            if (bHour < eqOpen || bHour >= eqClose) return showToast('Pickup time must be between 8:00 AM and 5:00 PM.', 'error');
            if (rHour < eqOpen || rHour >= eqClose) return showToast('Return time must be between 8:00 AM and 5:00 PM.', 'error');


            const diffTime = Math.abs(new Date(returnDate) - new Date(borrowDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 7) {
                return showToast('You can only borrow equipment for a maximum of 7 days (1 week).', 'error');
            }
            
            const btn = document.getElementById('submitBorrowBtn');
            btn.disabled = true; btn.innerHTML = 'Submitting...';
            
            // Format time string for 12-hour AM/PM purely for readability in logs
            const formatTime = (time24h) => {
                let [h, m] = time24h.split(':');
                h = parseInt(h);
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${m} ${ampm}`;
            };
            
            const _delPickup = document.getElementById('deliveryPickup');
            const _delDelivery = document.getElementById('deliveryDelivery');
            const _isDelivery = _delDelivery && _delDelivery.checked;
            const deliveryStr = _isDelivery ? 'Delivery to ' + address : 'Pickup at Barangay Hall';
            const fullPurpose = `[Time: ${formatTime(borrowTime)} to ${formatTime(returnTime)}] | Purpose: ${purposeStr} | Borrower: ${fullName} | Contact: ${contact} | Address: ${address} | Delivery: ${deliveryStr}`;
            const result = await borrowEquipment(equipId, qty, borrowDate, returnDate, fullPurpose);
            
            if (result.success) { 
                showToast(' ' + result.message, 'success'); 
                closeBorrowModal(); 
                await loadEquipmentView(); 
                await loadDashboardStats(); 
            } else { 
                showToast(result.message, 'error'); 
            }
            btn.disabled = false; btn.innerHTML = '<i class="bi bi-send-fill" style="margin-right:6px;"></i>Submit Borrow Request';
        }

        /* cancelEqRequest moved down */

        // ==========================================
        // 3. CONCERNS
        // ==========================================
        function _parseConcernResponse(response) {
            if (!response) return { reply: null, log: [] };
            if (typeof response === 'string' && response.trim().startsWith('{')) {
                try { const p = JSON.parse(response); return { reply: p.reply || null, log: Array.isArray(p.log) ? p.log : [] }; } catch(e) {}
            }
            return { reply: response, log: [] };
        }

        function _concernStatusLabel(status) {
            if (!status || status === 'pending' || status === 'open') return 'Submitted';
            if (status === 'in-progress' || status === 'in_progress') return 'In Progress';
            if (status === 'resolved' || status === 'closed') return 'Resolved';
            if (status === 'rejected') return 'Rejected';
            return status;
        }

        function _concernStatusBadge(status) {
            const label = _concernStatusLabel(status);
            const styles = {
                'Submitted':   'background:#fef3c7;color:#92400e;border:1px solid #fde68a;',
                'In Progress': 'background:#dbeafe;color:#1e40af;border:1px solid #bfdbfe;',
                'Resolved':    'background:#e8edf5;color:#065f46;border:1px solid #1e3a5f;',
                'Rejected':    'background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;',
            };
            const s = styles[label] || 'background:#f1f5f9;color:#374151;border:1px solid #e2e8f0;';
            const icons = { 'Submitted':'&#128221;', 'In Progress':'&#128260;', 'Resolved':'&#10003;', 'Rejected':'&#10060;' };
            return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;' + s + '">' + (icons[label]||'') + ' ' + label + '</span>';
        }

        let _concernsCurrentPage = 1;
        const _CONCERNS_PER_PAGE = 2;
        let _concernsAllSorted = [];

        async function loadConcernsView(page) {
            if (page === undefined) {
                // Fresh load: fetch data and reset to page 1
                const concerns = await getMyConcerns();
                _concernsAllSorted = concerns ? [...concerns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
                _concernsCurrentPage = 1;
            } else {
                _concernsCurrentPage = page;
            }
            _renderConcernsPage();
        }

        function _renderConcernsPage() {
            const container = document.getElementById('myConcernsList');
            const pgContainer = document.getElementById('concernsPaginationRow');
            container.className = 'flex flex-col gap-4';
            if (!_concernsAllSorted || _concernsAllSorted.length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic py-4">You have not submitted any concerns yet.</p>';
                if (pgContainer) pgContainer.innerHTML = '';
                return;
            }
            const total = _concernsAllSorted.length;
            const totalPages = Math.ceil(total / _CONCERNS_PER_PAGE);
            const start = (_concernsCurrentPage - 1) * _CONCERNS_PER_PAGE;
            const pageItems = _concernsAllSorted.slice(start, start + _CONCERNS_PER_PAGE);
            const fmtTs = ts => ts ? new Date(ts).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}) : '—';

            container.innerHTML = pageItems.map(c => {
                const parsed = _parseConcernResponse(c.response);
                const statusLabel = _concernStatusLabel(c.status);
                const isPending = !c.status || c.status === 'pending' || c.status === 'open';
                let actualDescription = c.description || 'No description provided';
                let attachedImageHtml = '';
                if (actualDescription.includes('[ATTACHED_IMAGE_DATA]')) {
                    const parts = actualDescription.split('[ATTACHED_IMAGE_DATA]');
                    actualDescription = parts[0].replace(/Usern/g, '').trim();
                    const b64 = parts[1].replace(/Usern/g, '').trim();
                    attachedImageHtml = '<div style="margin:10px 0 4px;"><img src="'+b64+'" style="max-height:120px;border-radius:10px;border:1px solid var(--border-color);object-fit:cover;" alt="Attached photo"></div>';
                }

                // STATUS TIMELINE
                const steps = ['Submitted', 'In Progress', statusLabel === 'Rejected' ? 'Rejected' : 'Resolved'];
                const activeIdx = Math.max(0, steps.indexOf(statusLabel));
                let inProgressTs = '', finalTs = '';
                parsed.log.forEach(e => {
                    if (e.action === 'status_changed') {
                        const lbl = _concernStatusLabel(e.status);
                        if (lbl === 'In Progress') inProgressTs = fmtTs(e.timestamp);
                        if (lbl === 'Resolved' || lbl === 'Rejected') finalTs = fmtTs(e.timestamp);
                    }
                });
                const stepTs = [fmtTs(c.createdAt), inProgressTs||'—', finalTs||'—'];
                const stepColors = {active:{ 0:'#1e3a5f', 1:'#1e3a5f', 2: statusLabel==='Rejected'?'#ef4444':'#1e3a5f' }};
                const stepsHtml = steps.map((step, i) => {
                    const done = i < activeIdx;
                    const active = i === activeIdx;
                    const notReached = i > activeIdx;
                    const col = done ? '#1e3a5f' : (active ? (stepColors.active[i]||'#1e3a5f') : 'transparent');
                    const border = done ? '#1e3a5f' : (active ? (stepColors.active[i]||'#1e3a5f') : 'var(--border-color)');
                    const icon = done ? '&#10003;' : (active && i === 0 ? '&#10003;' : active ? '&#9679;' : '');
                    const textCol = done ? '#1e3a5f' : (active ? (stepColors.active[i]||'#1e3a5f') : 'var(--text-muted)');
                    return '<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:0;">'
                        + '<div style="width:30px;height:30px;border-radius:50%;background:'+col+';border:2px solid '+border+';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:'+(notReached?'var(--text-muted)':'#fff')+';z-index:1;flex-shrink:0;">'+icon+'</div>'
                        + '<div style="font-size:11px;font-weight:700;color:'+textCol+';margin-top:6px;text-align:center;white-space:nowrap;">'+step+'</div>'
                        + '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;text-align:center;">'+stepTs[i]+'</div>'
                        + '</div>';
                });
                const line1 = activeIdx >= 1 ? 'background:linear-gradient(90deg,#1e3a5f,'+stepColors.active[1]+')' : 'background:var(--border-color)';
                const line2 = activeIdx >= 2 ? 'background:linear-gradient(90deg,'+stepColors.active[1]+','+(statusLabel==='Rejected'?'#ef4444':'#1e3a5f')+')' : 'background:var(--border-color)';
                const timelineHtml = '<div style="margin:14px 0 10px;padding:14px 16px;background:var(--input-bg);border-radius:12px;border:1px solid var(--border-color);">'
                    + '<div style="font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;">Status Timeline</div>'
                    + '<div style="display:flex;align-items:flex-start;position:relative;">'
                    + stepsHtml[0]
                    + '<div style="flex:1;height:2px;'+line1+';margin-top:14px;"></div>'
                    + stepsHtml[1]
                    + '<div style="flex:1;height:2px;'+line2+';margin-top:14px;"></div>'
                    + stepsHtml[2]
                    + '</div></div>';

                // ACTIVITY LOG
                const logItems = [{dot:'#1e3a5f', title:'Concern submitted', desc:'Citizen submitted the concern via Resident Portal.', ts: fmtTs(c.createdAt)}];
                parsed.log.forEach(entry => {
                    if (entry.action === 'status_changed') {
                        const lbl = _concernStatusLabel(entry.status);
                        const dot = lbl==='Resolved'?'#16a34a':lbl==='Rejected'?'#ef4444':'#f59e0b';
                        logItems.push({dot, title:'Status updated to '+lbl, desc:(entry.by?'Updated by '+entry.by+'.':'Status changed.'), ts:fmtTs(entry.timestamp)});
                    }
                    if (entry.action === 'replied') logItems.push({dot:'#3b82f6', title:'Admin replied', desc:'A response was sent to your concern.', ts:fmtTs(entry.timestamp)});
                });
                const activityHtml = '<div style="margin-bottom:12px;">'
                    + '<div style="font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px;">Activity Log</div>'
                    + logItems.map((item, idx) =>
                        '<div style="display:flex;gap:12px;align-items:flex-start;padding:9px 0;'+(idx<logItems.length-1?'border-bottom:1px solid var(--border-color);':'')+'">'
                        + '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">'
                        + '<div style="width:10px;height:10px;border-radius:50%;background:'+item.dot+';box-shadow:0 0 6px '+item.dot+'55;margin-top:2px;flex-shrink:0;"></div>'
                        + (idx<logItems.length-1?'<div style="width:1px;flex:1;min-height:14px;background:var(--border-color);margin-top:4px;"></div>':'')
                        + '</div>'
                        + '<div style="flex:1;">'
                        + '<div style="font-size:12px;font-weight:700;color:var(--text-main);">'+item.title+'</div>'
                        + '<div style="font-size:11px;color:var(--text-muted);margin-top:1px;">'+item.desc+'</div>'
                        + '<div style="font-size:10px;color:var(--text-muted);margin-top:2px;">'+item.ts+'</div>'
                        + '</div></div>'
                    ).join('')
                    + '</div>';

                // Admin reply box
                const lastReply = parsed.log.filter(e=>e.action==='replied').slice(-1)[0];
                const replyHtml = parsed.reply
                    ? '<div style="background:rgba(30,58,95,0.08);border:1px solid rgba(245,166,35,0.25);border-radius:12px;padding:14px;">'
                        + '<div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1e3a5f;margin-bottom:8px;">Admin reply</div>'
                        + '<p style="margin:0 0 8px;font-size:13px;color:var(--text-main);line-height:1.6;">'+parsed.reply+'</p>'
                        + (lastReply ? '<div style="font-size:11px;color:var(--text-muted);">'+(lastReply.by||'Admin')+' &middot; '+fmtTs(lastReply.timestamp)+'</div>' : '')
                        + '</div>'
                    : '';

                const statusBadge = _concernStatusBadge(c.status);
                const repliedBadge = parsed.reply
                    ? '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:rgba(30,58,95,0.1);color:#1e3a5f;border:1px solid rgba(30,58,95,0.25);">&#10003; Replied</span>'
                    : '';

                return '<div style="background:var(--card-bg,var(--input-bg));border:1px solid var(--border-color);border-radius:16px;padding:18px;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 4px 20px rgba(0,0,0,0.1)\'" onmouseout="this.style.boxShadow=\'none\'">'
                    + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:6px;">'
                    + '<h4 style="margin:0;font-size:15px;font-weight:800;color:var(--text-main);line-height:1.3;">'+c.title+'</h4>'
                    + '<div style="display:flex;gap:5px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;margin-top:2px;">'+statusBadge+repliedBadge+'</div>'
                    + '</div>'
                    + '<p style="margin:0 0 8px;font-size:12px;color:var(--text-muted);">'+c.category+' &middot; '+(c.address||'')+' &middot; Submitted '+fmtTs(c.createdAt)+'</p>'
                    + '<p style="margin:0;font-size:13px;color:var(--text-main);line-height:1.5;opacity:0.85;">'+actualDescription+'</p>'
                    + attachedImageHtml
                    + timelineHtml
                    + activityHtml
                    + replyHtml
                    + (isPending ? '<div style="display:flex;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color);">'
                        + '<button onclick="openEditConcernModal('+c.id+')" style="padding:7px 18px;border-radius:9px;background:rgba(59,130,246,0.12);color:#3b82f6;border:1px solid rgba(59,130,246,0.25);font-size:12px;font-weight:700;cursor:pointer;">Edit</button>'
                        + '<button onclick="deleteMyConcern('+c.id+')" style="padding:7px 18px;border-radius:9px;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.25);font-size:12px;font-weight:700;cursor:pointer;">Delete</button>'
                        + '</div>' : '')
                    + '</div>';
            }).join('');

            // Render pagination
            if (pgContainer) {
                if (totalPages <= 1) { pgContainer.innerHTML = ''; return; }
                const btns = [];
                // Prev button
                btns.push('<button onclick="_renderConcernsPage && ((_concernsCurrentPage>1)&&(_concernsCurrentPage--,_renderConcernsPage()))" style="padding:6px 14px;border-radius:8px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-muted);font-size:13px;font-weight:600;cursor:pointer;'
                    + (_concernsCurrentPage===1?'opacity:0.4;pointer-events:none;':'')+'">&#8592; Prev</button>');
                // Page buttons (show max 5 around current)
                const range = 2;
                for (let p = 1; p <= totalPages; p++) {
                    if (p === 1 || p === totalPages || (p >= _concernsCurrentPage - range && p <= _concernsCurrentPage + range)) {
                        const isActive = p === _concernsCurrentPage;
                        btns.push('<button onclick="loadConcernsView('+p+')" style="padding:6px 12px;border-radius:8px;border:1px solid '+(isActive?'#1e3a5f':'var(--border-color)')+';background:'+(isActive?'#1e3a5f':'var(--input-bg)')+';color:'+(isActive?'#fff':'var(--text-muted)')+';font-size:13px;font-weight:'+(isActive?'800':'600')+';cursor:pointer;min-width:36px;">'+p+'</button>');
                    } else if (p === _concernsCurrentPage - range - 1 || p === _concernsCurrentPage + range + 1) {
                        btns.push('<span style="padding:6px 4px;color:var(--text-muted);font-size:13px;">...</span>');
                    }
                }
                // Next button
                btns.push('<button onclick="_renderConcernsPage && ((_concernsCurrentPage<'+totalPages+')&&(_concernsCurrentPage++,_renderConcernsPage()))" style="padding:6px 14px;border-radius:8px;border:1px solid var(--border-color);background:var(--input-bg);color:var(--text-muted);font-size:13px;font-weight:600;cursor:pointer;'
                    + (_concernsCurrentPage===totalPages?'opacity:0.4;pointer-events:none;':'')+'">Next &#8594;</button>');
                pgContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border-color);margin-top:8px;">'
                    + '<span style="font-size:12px;color:var(--text-muted);margin-right:8px;">Showing '+(((_concernsCurrentPage-1)*_CONCERNS_PER_PAGE)+1)+'-'+Math.min(_concernsCurrentPage*_CONCERNS_PER_PAGE,total)+' of '+total+'</span>'
                    + btns.join('')
                    + '</div>';
            }
        }

        // ==========================================
        // HISTORY / ACTIVITY PANEL LOGIC
        // ==========================================
        async function openBorrowModalWithEquip(equipId) {
            await loadGlobalDeliveryState();
            const list = await getEquipment();
            const item = list.find(e => e.id === equipId);
            if (!item) return;

            // Reset purpose state for fresh modal
            currentBorrowPurpose = null;
            borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true;
            const _body = document.getElementById('borrowFormBody');
            if (_body) _body.style.display = 'none';
            const _evBtn = document.getElementById('purposeBtnEvent');
            const _buBtn = document.getElementById('purposeBtnBurol');
            _setPurposeBtnStyle(_evBtn, false);
            // Show/hide Burol button based on item
            if (_buBtn) {
                if (itemAllowsBurol(item.name)) {
                    _buBtn.style.display = 'flex';
                    _setPurposeBtnStyle(_buBtn, false);
                    document.getElementById('purposeBtnGrid').style.gridTemplateColumns = '1fr 1fr';
                } else {
                    _buBtn.style.display = 'none';
                    document.getElementById('purposeBtnGrid').style.gridTemplateColumns = '1fr';
                }
            }
            const _dr = document.getElementById('borrowDurationRules'); if (_dr) _dr.innerHTML = '';
            const _ai = document.getElementById('availableItemsForPurpose'); if (_ai) _ai.innerHTML = '';

            document.getElementById('borrowModalTitle').innerHTML = item.name;
            updateDeliveryOptions(item);
            
            const imageSrc = item.image_url ? item.image_url : '../barangay-sun-logo.jpg';
            document.getElementById('borrowModalImage').src = imageSrc;
            
            const badge = document.getElementById('borrowModalStockBadge');
            if (badge) {
                badge.innerHTML = `${item.available} Available`;
                badge.className = item.available > 0 ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-slate-500/90 text-white backdrop-blur-md' : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-red-500/90 text-white backdrop-blur-md';
            }

            document.getElementById('borrowEquipmentId').value = equipId;
            document.getElementById('borrowEquipmentName').value = item.name;
            document.getElementById('borrowQty').max = item.available;
            document.getElementById('borrowQty').value = 1;
            
            const helpEl = document.getElementById('borrowMaxHelp');
            if(helpEl) helpEl.innerHTML = '&#128230; Max: ' + item.available + (item.available === 1 ? ' unit available' : ' units available');
            
            // Show pending notice if applicable
            if (item.pending && item.pending > 0 && helpEl) {
                helpEl.innerHTML += ' <br><span style="color:#b45309;font-size:11px;font-weight:600;">&#9888;&#65039; ' + item.pending + ' unit(s) pending from other users</span>';
            }

            document.getElementById('borrowPurpose').value = '';
            document.getElementById('borrowerFullName').value = user.fullName || user.full_name || user.name || user.username || '';
            document.getElementById('borrowerContact').value = user.contactNumber || user.contact_number || user.phone || '';
            document.getElementById('borrowerAddress').value = user.address || '';
            document.getElementById('borrowTime').value = '';
            document.getElementById('returnTime').value = '';
            const _bte = document.getElementById('borrowTimeError'); if (_bte) _bte.style.display = 'none';
            const _rte = document.getElementById('returnTimeError'); if (_rte) _rte.style.display = 'none';
            
            // Store global context and fetch active bookings
            window.currentEquipmentItem = item;
            window.activeBorrowingsForModal = [];
            
            try {
                const supabaseAvailable = await isSupabaseAvailable();
                if (supabaseAvailable) {
                    const { data: bookings } = await supabase
                        .from('borrowings')
                        .select('quantity, borrow_date, return_date, status, user_id, users(full_name, username)')
                        .eq('equipment_id', equipId)
                        .in('status', ['approved', 'pending']);
                    window.activeBorrowingsForModal = bookings || [];
                } else {
                    const borrowings = JSON.parse(localStorage.getItem('barangay_local_borrowings')) || [];
                    window.activeBorrowingsForModal = borrowings.filter(b => b.equipment_id == equipId && (b.status === 'approved' || b.status === 'pending')).map(b => ({
                        quantity: b.quantity,
                        borrow_date: b.borrowDate || b.borrow_date,
                        return_date: b.returnDate || b.return_date,
                        status: b.status,
                        user_id: b.userId || b.user_id,
                        users: { full_name: 'Local User' }
                    }));
                }
            } catch(e) {
                console.error('Error fetching bookings:', e);
            }
            
            renderBorrowAlerts();
            renderExistingBookings();
            selectBorrowPurpose('event');
            updateDeliveryOptions(item);
            updateBorrowLockState();
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
            if (!category) { showToast('Please select a category.', 'error'); btn.disabled = false; btn.innerHTML = 'Submit Report <i class="bi bi-arrow-right"></i>'; return; }
            const imageInput = document.getElementById('concernImage');
            
            let imageFile = null;

            if (imageInput.files.length > 0) {
                imageFile = imageInput.files[0];
            } else {
                showToast('Please attach a photo to support your concern.', 'error');
                btn.disabled = false;
                btn.innerHTML = 'Submit Report <i class="bi bi-arrow-right"></i>';
                return;
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
            const bball = document.getElementById('sel-basketball');
            const multi = document.getElementById('sel-multipurpose');
            if (venue === 'basketball') {
                bball.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#fff;background:#1e3a5f;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
                multi.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#1e3a5f;background:#fff;border:1.5px solid #1e3a5f;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
            } else {
                multi.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#fff;background:#1e3a5f;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
                bball.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#1e3a5f;background:#fff;border:1.5px solid #1e3a5f;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
            }
            // Update panel title dynamically
            const titleEl = document.getElementById('bookingPanelTitle');
            const subtitleEl = document.getElementById('bookingPanelSubtitle');
            if (venue === 'basketball') {
                if (titleEl) titleEl.innerHTML = '<i class="bi bi-calendar-check-fill mr-2"></i>Court Reservation';
                if (subtitleEl) subtitleEl.textContent = 'Reserve the barangay basketball court.';
            } else {
                if (titleEl) titleEl.innerHTML = '<i class="bi bi-building mr-2"></i>Hall Reservation';
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
                
                // Cell base — matches admin calendar style
                dayDiv.style.cssText = 'min-height:64px;border-radius:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:6px 3px 4px;transition:all 0.15s;overflow:hidden;border:0.5px solid #e2e8f0;';

                const isPast = dateObj < today;
                const isToday = dateObj.getTime() === today.getTime();

                if (isPast) {
                    dayDiv.style.background = '#FAFAFA';
                    dayDiv.style.color = '#9CA3AF';
                    dayDiv.style.cursor = 'default';
                } else {
                    dayDiv.style.background = '#fff';
                    dayDiv.style.color = '#1A1A2E';
                    dayDiv.style.cursor = 'pointer';
                    if (hasEvent) {
                        dayDiv.title = 'Brgy Event: ' + hasEvent.title + '. Click to view schedule & book available slots.';
                        dayDiv.onclick = () => openDaySchedulePopup(dateStr);
                    } else if (bookedDates.includes(dateStr)) {
                        dayDiv.title = 'Has Bookings. Click to see schedule.';
                        dayDiv.onclick = () => openDaySchedulePopup(dateStr);
                    } else {
                        dayDiv.onclick = () => openDaySchedulePopup(dateStr);
                    }
                }

                if (isToday && !selectedDate) {
                    dayDiv.style.outline = '3px solid #1A3A6B';
                    dayDiv.style.outlineOffset = '-2px';
                }
                if (selectedDate === dateStr) {
                    dayDiv.style.outline = '3px solid #1e3a5f';
                    dayDiv.style.outlineOffset = '-2px';
                }

                // Day number element
                const numEl = document.createElement('div');
                if (isToday && !selectedDate) {
                    numEl.style.cssText = 'width:22px;height:22px;background:#1A3A6B;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;';
                } else {
                    numEl.style.cssText = 'font-size:13px;font-weight:700;line-height:1;';
                }
                numEl.textContent = day;
                dayDiv.appendChild(numEl);

                // Indicator pills (event or booked)
                if (!isPast && hasEvent) {
                    const pill = document.createElement('div');
                    pill.style.cssText = 'font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;white-space:nowrap;max-width:96%;overflow:hidden;text-overflow:ellipsis;margin-top:3px;background:#1A3A6B;color:#fff;';
                    pill.textContent = hasEvent.title || 'Brgy Event';
                    dayDiv.appendChild(pill);
                } else if (!isPast && bookedDates.includes(dateStr)) {
                    const pill = document.createElement('div');
                    pill.style.cssText = 'font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;white-space:nowrap;max-width:96%;overflow:hidden;text-overflow:ellipsis;margin-top:3px;background:#1A3A6B;color:#fff;';
                    pill.textContent = 'Booked';
                    dayDiv.appendChild(pill);
                }

                grid.appendChild(dayDiv);
            }
            const myContainer = document.getElementById('myReservationsList');
            
            // Resolve real Supabase ID to handle type mismatches (string vs integer)
            let resolvedBookingUid = String(user.id);
            try {
                const _bidBook = user.barangay_id || user.username;
                const { data: uRow } = await supabase.from('users').select('id').eq('barangay_id', _bidBook).maybeSingle();
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
                    const statusClass = b.status === 'approved' ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-800';
                    const statusText = b.status.charAt(0).toUpperCase() + b.status.slice(1);
                    return '<div class="border rounded-xl p-4 shadow-sm" style="background-color: var(--panel-bg); border-color: var(--border-color);">' +
                        '<div class="flex justify-between mb-2 border-b pb-2" style="border-color: var(--border-color);"><h4 class="font-bold" style="color: var(--text-main);">&#128197; ' + formatDate(b.date) + '</h4><span class="px-2 py-0.5 rounded text-xs font-bold ' + statusClass + '">' + statusText + '</span></div>' +
                        '<p class="text-xs mb-1" style="color: var(--text-muted);"> ' + b.time + '</p>' +
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

            const venueLabel = selectedVenue === 'basketball' ? '&#127936; Basketball Court' : '&#127970; Multi-Purpose Hall';
            const d = new Date(dateStr + 'T00:00:00');
            const dateFmt = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

            document.getElementById('dsModalDate').textContent = dateFmt;
            document.getElementById('dsModalVenue').innerHTML = venueLabel;
            document.getElementById('dsDate').value = dateStr;
            document.getElementById('dsVenue').value = selectedVenue;
            document.getElementById('dsName').value = user.name || '';

            if (window.pendingRescheduleData) {
                const m = window.pendingRescheduleData;
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>&#128260; Confirm Reschedule</span>';
                openDsBookingModal(); // auto open
                
                document.getElementById('dsPurpose').value = "Rescheduled: " + (m.event_title || ""); 
                
                let banner = document.getElementById('dsRescheduleBanner');
                if(!banner) {
                    banner = document.createElement('div');
                    banner.id = 'dsRescheduleBanner';
                    banner.className = 'bg-slate-50 text-slate-800 p-3 rounded-lg mb-4 text-sm font-bold border border-slate-200';
                    document.getElementById('dsBookingForm').prepend(banner);
                }
                banner.innerHTML = `&#128260; Rescheduling Mode Active:<br><span class="text-xs font-normal text-slate-700">Original Time: ${m.original_time}. Review time and confirm.</span>`;
                banner.classList.remove('hidden');
            } else {
                document.getElementById('dsToggleFormBtn').innerHTML = '<span> Add Facility Reservation</span>';
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
                    const timeRange = ev.end_time ? `${fmt12(ev.time)} - ${fmt12(ev.end_time)}` : fmt12(ev.time);
                    return `<strong>${ev.title}</strong> <span style="opacity:0.85;">(${timeRange})</span>`;
                }).join('<br>');
                eventNoticeBanner.innerHTML = `<div style="background:linear-gradient(135deg,#1e3a5f,#0f1f3d);color:#fff;border-radius:12px;padding:12px 14px;margin-bottom:12px;font-size:12px;line-height:1.6;">
                    <div style="font-size:14px;font-weight:800;margin-bottom:4px;">&#127881; Official Barangay Event</div>
                    ${evNames}
                    <div style="margin-top:6px;font-size:11px;opacity:0.85;">¸Â Time slots during this event are blocked. You may still book slots outside these hours.</div>
                </div>`;
                eventNoticeBanner.style.display = 'block';
            } else {
                eventNoticeBanner.style.display = 'none';
            }

            // Show 'Add Booking' button  but HIDE it if the day is fully admin-blocked
            const toggleBtn = document.getElementById('dsToggleFormBtn');

            // Detect if any event blocks the entire day (admin mass-cancel creates a full-day event)
            // A full-day block: event with end_time === '22:00' and time <= '07:00', or title contains admin keywords
            const isFullyBlocked = evForDay.some(ev => {
                const startM = timeToMinutes(ev.time || '07:00');
                const endM = timeToMinutes(ev.end_time || ev.time || '22:00');
                return (endM - startM) >= 600; // 10+ hours = full day block
            });

            // Also remove existing blocked notice if present
            let blockedNotice = document.getElementById('dsFullDayBlockedNotice');
            if (!blockedNotice) {
                blockedNotice = document.createElement('div');
                blockedNotice.id = 'dsFullDayBlockedNotice';
                const formWrap = document.getElementById('dsFormWrap') || toggleBtn?.parentNode;
                if (formWrap) formWrap.insertBefore(blockedNotice, formWrap.firstChild);
                else if (toggleBtn) toggleBtn.parentNode.insertBefore(blockedNotice, toggleBtn);
            }

            if (isFullyBlocked && !window.pendingRescheduleData) {
                // Hide the add reservation button
                if (toggleBtn) toggleBtn.style.display = 'none';
                // Hide form if it's open
                const formWrap = document.getElementById('dsFormWrap');
                if (formWrap) formWrap.style.display = 'none';
                // Show blocked notice
                const blockedEvent = evForDay.find(ev => {
                    const endM = timeToMinutes(ev.end_time || ev.time || '22:00');
                    const startM = timeToMinutes(ev.time || '07:00');
                    return (endM - startM) >= 600;
                });
                blockedNotice.innerHTML = `<div style="background:linear-gradient(135deg,#0f1f3d,#0f1f3d);color:#fff;border-radius:12px;padding:14px 16px;margin-bottom:12px;text-align:center;">
                    <div style="font-size:16px;font-weight:800;margin-bottom:6px;"> This Day is Fully Reserved by the Barangay</div>
                    <div style="font-size:12px;opacity:0.85;">${blockedEvent ? '"' + blockedEvent.title + '"' : 'A Barangay event'} has been scheduled for this entire day.</div>
                    <div style="font-size:11px;opacity:0.7;margin-top:4px;">No facility reservations can be made on this date. Please choose another date.</div>
                </div>`;
                blockedNotice.style.display = 'block';
            } else {
                blockedNotice.style.display = 'none';
                if (toggleBtn) toggleBtn.style.display = '';
            }
        }

        async function refreshDsSchedule(dateStr, venue) {
            const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
            const [allBookings, allEvents] = await Promise.all([getCourtBookings(), getEvents()]);

            const dayBookings = allBookings.filter(b =>
                b.date === dateStr &&
                b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'rejected' && b.status !== 'admin_cancelled' && b.status !== 'completed' &&
                (b.venue === venue || b.venueName === venueLabel)
            );
            const isToday2 = dateStr === new Date().toISOString().slice(0, 10);
            const dayEvents = allEvents.filter(e => {
                if (e.date !== dateStr || e.status !== 'approved') return false;
                // Venue filter: match events to the currently-viewed facility
                const isMultiVenue = e.venue === 'multipurpose' || (e.location && (e.location.toLowerCase().includes('multi') || e.location.toLowerCase().includes('hall')));
                if (venue === 'basketball' && isMultiVenue) return false;
                if (venue === 'multipurpose' && !isMultiVenue) return false;
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
                const timeStr = b.time + (b.end_time ? ' - ' + b.end_time : '');
                entries.push({ type: 'booking', timeStr, label: b.userName || b.username || 'Resident', purpose: b.purpose || '' });
            });
            dayEvents.forEach(e => {
                const timeStr = fmt12(e.time) + (e.end_time ? ' - ' + fmt12(e.end_time) : '');
                const venueEvLabel = (e.venue === 'multipurpose' || (e.location && e.location.includes('Multi-Purpose'))) ? '&#127970; Multi-Purpose Hall' : '&#127936; Basketball Court';
                entries.push({ type: 'event', timeStr, label: e.title, purpose: (e.organizer ? 'By ' + e.organizer + '  ' : '') + venueEvLabel });
            });

            if (entries.length === 0) {
                list.innerHTML = '';
                empty.classList.remove('hidden');
            } else {
                empty.classList.add('hidden');
                list.innerHTML = entries.map(en => {
                    const isBk = en.type === 'booking';
                    const bg = isBk ? 'bg-red-50 border-red-200' : (venue === 'basketball' ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200');
                    const dot = isBk ? '' : '';
                    const nameColor = isBk ? 'text-red-700' : (venue === 'basketball' ? 'text-green-700' : 'text-slate-700');
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

            let openHour = 6;
            let closeHour = 21;
            try {
                const ls = JSON.parse(localStorage.getItem('brgy_operating_hours') || '{}');
                if (ls.facility_open_hour != null) openHour = parseInt(ls.facility_open_hour);
                if (ls.facility_close_hour != null) closeHour = parseInt(ls.facility_close_hour);
            } catch(e) {}

            const slots = [];
            for (let i = openHour; i <= closeHour; i++) {
                slots.push(`${String(i).padStart(2,'0')}:00`);
                if (i !== closeHour) slots.push(`${String(i).padStart(2,'0')}:30`);
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
                        let [st, et] = tRange.split('-').map(s => s.trim());
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
                document.getElementById('dsToggleFormBtn').innerHTML = '<span>&#128260; Confirm Reschedule</span>';
            } else {
                document.getElementById('dsToggleFormBtn').innerHTML = '<span> Add Facility Reservation</span>';
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

            let facOpen = 6, facClose = 21;
            try {
                const ls = JSON.parse(localStorage.getItem('brgy_operating_hours') || '{}');
                if (ls.facility_open_hour != null) facOpen = parseInt(ls.facility_open_hour);
                if (ls.facility_close_hour != null) facClose = parseInt(ls.facility_close_hour);
            } catch(err) {}

            const phtHour = parseInt(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour12: false, hour: 'numeric' }));
            if (phtHour < facOpen || phtHour >= facClose) {
                const fmtH = (h) => h % 12 === 0 ? 12 + (h >= 12 ? ' PM' : ' AM') : (h % 12) + (h >= 12 ? ' PM' : ' AM');
                return showToast(`Reservations are currently closed. Available from ${fmtH(facOpen)} to ${fmtH(facClose)}.`, 'error');
            }

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
                    status: 'pending',
                    isReschedule: true,
                    originalDate: window.pendingRescheduleData.date || 'unknown'
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

            btn.disabled = false; btn.innerHTML = ' Confirm Reservation';

            if (result.success) {
                document.getElementById('dsPurpose').value = '';
                document.getElementById('dsStartTime').value = '';
                document.getElementById('dsEndTime').value = '';
                closeDsBookingModal();
                document.getElementById('dsToggleFormBtn').innerHTML = '<span> Add Facility Reservation</span>';
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
        // EQUIPMENT DETAIL MODAL
        let _borrowingsMap = {};

        function openEquipDetail(id) {
            const b = _borrowingsMap[id];
            if (!b) return;
            const imgWrap = document.getElementById('edm-img-wrap');
            const equipItem = (typeof allEquipmentList !== 'undefined' && allEquipmentList) ? allEquipmentList.find(e => e.name === b.equipment) : null;
            if (equipItem && equipItem.image_url) {
                imgWrap.innerHTML = '<img src="' + equipItem.image_url + '" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">';
            } else {
                imgWrap.innerHTML = '<i class="bi bi-box-seam" style="font-size:26px;color:#fff;"></i>';
            }
            document.getElementById('edm-name').textContent = b.equipment;
            const statusStyles = {
                pending:  { bg: 'rgba(254,243,199,0.9)', color: '#92400e', dot: '#f59e0b', label: 'Pending' },
                approved: { bg: 'rgba(219,234,254,0.9)', color: '#1d4ed8', dot: '#3b82f6', label: 'Approved' },
                rejected: { bg: 'rgba(254,226,226,0.9)', color: '#dc2626', dot: '#ef4444', label: 'Rejected' },
                returned: { bg: 'rgba(255,255,255,0.2)',  color: '#fff',    dot: 'rgba(255,255,255,0.8)', label: 'Returned' }
            };
            const ss = statusStyles[b.status] || statusStyles.pending;
            document.getElementById('edm-status-badge').innerHTML = '<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;background:' + ss.bg + ';color:' + ss.color + ';font-size:12px;font-weight:700;"><span style="width:6px;height:6px;border-radius:50%;background:' + ss.dot + ';flex-shrink:0;"></span>' + ss.label + '</span>';
            document.getElementById('edm-borrow-date').textContent = formatDate(b.borrowDate);
            document.getElementById('edm-return-date').textContent = formatDate(b.returnDate);
            document.getElementById('edm-qty').textContent = 'x' + b.quantity;
            let method = 'Pickup';
            if (b.purpose) { const dm = b.purpose.match(/\|\s*Delivery:\s*([^|]+)/i); if (dm && dm[1].trim().toLowerCase().startsWith('delivery')) method = 'Delivery'; }
            document.getElementById('edm-method').textContent = method;
            let purposeText = b.purpose ? b.purpose.replace(/\s*\|.*$/, '').trim() : '';
            document.getElementById('edm-purpose').textContent = purposeText || 'No purpose specified';
            const rejBox = document.getElementById('edm-rejection-box');
            if (b.status === 'rejected' && b.rejection_reason) {
                document.getElementById('edm-rejection-text').textContent = b.rejection_reason;
                rejBox.style.display = '';
            } else { rejBox.style.display = 'none'; }
            const cancelBtn = document.getElementById('edm-cancel-btn');
            if (b.status === 'pending') {
                cancelBtn.style.display = '';
                cancelBtn.onclick = function() { closeEquipDetail(); cancelEqRequest(b.id); };
            } else { cancelBtn.style.display = 'none'; }
            const modal = document.getElementById('equipDetailModal');
            modal.style.display = 'flex';
        }

        function closeEquipDetail() {
            document.getElementById('equipDetailModal').style.display = 'none';
        }

        // ==========================================
        // DASHBOARD EXTRAS: Activity Feed, Announcements, Count-up, Profile Card
        async function loadDashboardExtras() {
            const user = getCurrentUser();
            if (!user) return;

            // Profile mini-card
            const fullName = user.fullName || user.full_name || user.username || 'Resident';
            const initials = fullName.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
            const nameEl = document.getElementById('dashProfileName');
            const avatarEl = document.getElementById('dashAvatarCircle');
            const barEl = document.getElementById('dashProfileBar');
            const pctEl = document.getElementById('dashProfilePct');
            const wNameEl = document.getElementById('welcomeName');
            if (nameEl) nameEl.textContent = fullName;
            if (avatarEl) avatarEl.textContent = initials;
            if (wNameEl) wNameEl.textContent = fullName.split(' ')[0];
            const pct = user.profile_picture ? 90 : user.phone ? 70 : 50;
            if (barEl) barEl.style.width = pct + '%';
            if (pctEl) pctEl.textContent = 'Profile ' + pct + '%';

            // Count-up animation on stat cards
            function animateCount(el, target) {
                if (!el || isNaN(target)) return;
                const duration = 900; const start = Date.now();
                const tick = () => {
                    const elapsed = Date.now() - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.setAttribute('data-target', target);
                };
                requestAnimationFrame(tick);
            }
            ['stat-equipment','stat-concerns','stat-bookings','stat-totalreq'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const t = parseInt(el.getAttribute('data-target') || el.textContent) || 0;
                    if (t > 0) animateCount(el, t);
                }
            });

            // Activity feed
            try {
                const feedEl = document.getElementById('dashActivityFeed');
                if (feedEl && window.supabase) {
                    const [brRes, conRes, facRes] = await Promise.all([
                        supabase.from('borrowings').select('id,equipment,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(3),
                        supabase.from('concerns').select('id,title,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(2),
                        supabase.from('facility_reservations').select('id,venue,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(2)
                    ]);
                    const all = [
                        ...(brRes.data||[]).map(r=>({type:'borrow',icon:'bi-box-seam',desc:r.equipment||'Equipment',status:r.status,date:r.created_at})),
                        ...(conRes.data||[]).map(r=>({type:'concern',icon:'bi-megaphone',desc:r.title||'Concern',status:r.status,date:r.created_at})),
                        ...(facRes.data||[]).map(r=>({type:'booking',icon:'bi-calendar-check',desc:(r.venue||'Facility')+' Reservation',status:r.status,date:r.created_at}))
                    ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
                    if (!all.length) {
                        feedEl.innerHTML = '<div style="padding:36px 24px;text-align:center;"><div style="width:52px;height:52px;background:rgba(30,58,95,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class=\"bi bi-inbox\" style=\"font-size:22px;color:#1e3a5f;\"></i></div><div style=\"font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;\">No recent activity</div><div style=\"font-size:12px;color:#94a3b8;\">Your borrowings and concerns will appear here</div></div>';
                    } else {
                        const statusBadge = (s) => {
                            const st = (s||'pending').toLowerCase().replace(/_/g,'-');
                            if (st==='approved' || st==='resolved') return 'background:#dcfce7;color:#16a34a';
                            if (st==='rejected') return 'background:#fee2e2;color:#dc2626';
                            if (st==='cancelled') return 'background:#f1f5f9;color:#64748b';
                            if (st==='returned') return 'background:#dbeafe;color:#2563eb';
                            if (st==='in-progress' || st==='in_progress') return 'background:#dbeafe;color:#1d4ed8';
                            return 'background:#fef9c3;color:#ca8a04';
                        };
                        feedEl.innerHTML = all.map(a => {
                            const d = new Date(a.date).toLocaleDateString('en-US',{month:'short',day:'numeric'});
                            const badgeStyle = statusBadge(a.status);
                            return '<div class="activity-row" style="padding:11px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;">' +
                                '<div style="width:38px;height:38px;border-radius:50%;background:rgba(30,58,95,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi ' + a.icon + '" style="color:#1e3a5f;font-size:16px;"></i></div>' +
                                '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#0f2952;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + a.desc + '</div>' +
                                '<div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + d + '</div></div>' +
                                '<span style="font-size:11px;font-weight:600;' + badgeStyle + ';padding:3px 12px;border-radius:999px;white-space:nowrap;text-transform:capitalize;">' + (a.status||'pending').replace(/_/g,' ') + '</span></div>';
                        }).join('');
                    }
                }
            } catch(e) { console.warn('activity feed error', e); }

            // Announcements (events)
            try {
                const annEl = document.getElementById('dashAnnouncements');
                if (annEl && window.supabase) {
                    const _annToday = new Date().toISOString().split('T')[0];
                    const { data: evs } = await supabase.from('events').select('id,title,date,category,status').gte('date', _annToday).order('date',{ascending:true}).limit(3);
                    if (!evs || !evs.length) {
                        annEl.innerHTML = '<div style="padding:36px 24px;text-align:center;"><div style="width:52px;height:52px;background:rgba(30,58,95,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class=\"bi bi-megaphone-fill\" style=\"font-size:22px;color:#1e3a5f;\"></i></div><div style=\"font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;\">No upcoming announcements</div><div style=\"font-size:12px;color:#94a3b8;\">Check back later for barangay updates</div></div>';
                    } else {
                        const catColor = {'Sports':'#2563eb','Community':'#16a34a','Health':'#dc2626','Others':'#64748b'};
                        annEl.innerHTML = evs.map(e => {
                            const d = new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
                            const cc = catColor[e.category] || '#64748b';
                            return '<div style="padding:12px 20px;border-bottom:1px solid #f8fafc;">' +
                                '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">' +
                                '<div style="font-size:13px;font-weight:600;color:#1e3a5f;">' + (e.title||'Event') + '</div>' +
                                '<span style="font-size:10px;font-weight:700;background:' + cc + '20;color:' + cc + ';padding:2px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0;">' + (e.category||'Event') + '</span></div>' +
                                '<div style="font-size:11px;color:#94a3b8;margin-top:3px;display:flex;align-items:center;gap:4px;"><i class="bi bi-calendar3"></i> ' + d + '</div></div>';
                        }).join('');
                    }
                }
            } catch(e) { console.warn('announcements error', e); }

            // Barangay Events in dashboard
            try {
                const evSecEl = document.getElementById('dashEventsSection');
                if (evSecEl && window.supabase) {
                    const today = new Date().toISOString().split('T')[0];
                    const { data: evList } = await window.supabase
                        .from('events')
                        .select('id,title,date,time,end_time,category,description,location')
                        .gte('date', today)
                        .order('date', { ascending: true })
                        .limit(4);
                    if (!evList || !evList.length) {
                        evSecEl.innerHTML = '<div style="padding:36px 24px;text-align:center;background:#f0f7ff;margin:12px 16px;border-radius:12px;"><div style="width:52px;height:52px;background:rgba(30,58,95,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class=\"bi bi-calendar3\" style=\"font-size:22px;color:#1e3a5f;\"></i></div><div style=\"font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;\">No upcoming events at this time</div><div style=\"font-size:12px;color:#94a3b8;\">Check back later for new barangay events</div></div>';
                    } else {
                        const catColors = { Sports:'#2563eb', Community:'#16a34a', Health:'#dc2626', Others:'#64748b' };
                        evSecEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:16px;">' +
                            evList.map(ev => {
                                const d = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) : '—';
                                const cc = catColors[ev.category] || '#64748b';
                                const timeStr = ev.time ? fmt12(ev.time) + (ev.end_time ? ' – ' + fmt12(ev.end_time) : '') : '';
                                return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;border-top:3px solid ' + cc + ';">' +
                                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
                                    '<span style="font-size:10px;font-weight:700;background:' + cc + '20;color:' + cc + ';padding:2px 8px;border-radius:20px;">' + (ev.category||'Event') + '</span>' +
                                    '</div>' +
                                    '<div style="font-size:13px;font-weight:700;color:#0f2952;margin-bottom:6px;line-height:1.3;">' + (ev.title||'Event') + '</div>' +
                                    '<div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px;"><i class=\"bi bi-calendar3\"></i> ' + d + '</div>' +
                                    (timeStr ? '<div style=\"font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;margin-top:2px;\"><i class=\"bi bi-clock\"></i> ' + timeStr + '</div>' : '') +
                                    '</div>';
                            }).join('') +
                            '</div>';
                    }
                }
            } catch(e) { console.warn('events section error', e); }
        }

        // ==========================================
        // 5. EVENTS
        // ==========================================
        let _eventsAllUpcoming = [];
        let _eventsCurrentCategory = 'all';
        let _eventsCurrentPage = 1;
        const _EVENTS_PER_PAGE = 6;

        function _parseTimeMins(t) {
            if (!t) return null;
            const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
            const m12 = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (m24) return parseInt(m24[1]) * 60 + parseInt(m24[2]);
            if (m12) { let h = parseInt(m12[1]); const m = parseInt(m12[2]); if (m12[3].toUpperCase()==='PM'&&h<12) h+=12; if (m12[3].toUpperCase()==='AM'&&h===12) h=0; return h*60+m; }
            return null;
        }

        function filterEventsCategory(cat) {
            _eventsCurrentCategory = cat;
            _eventsCurrentPage = 1;
            document.querySelectorAll('.evcat-btn').forEach(btn => {
                const isActive = btn.id === 'evcat-' + cat;
                btn.style.background = isActive ? '#1e3a5f' : '#fff';
                btn.style.borderColor = isActive ? '#1e3a5f' : '#e2e8f0';
                btn.style.color = isActive ? '#fff' : '#64748b';
            });
            _renderEventsPage();
        }

        function _renderEventsPage() {
            const container = document.getElementById('upcomingEventsContainer');
            const pgContainer = document.getElementById('eventsPaginationRow');
            const filtered = _eventsCurrentCategory === 'all'
                ? _eventsAllUpcoming
                : _eventsAllUpcoming.filter(e => (e.category||'').toLowerCase() === _eventsCurrentCategory);

            if (filtered.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;">'
                    + '<div style="width:72px;height:72px;background:rgba(30,58,95,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px;">'
                    + '<i class="bi bi-calendar-x" style="color:#1e3a5f;"></i></div>'
                    + '<p style="font-size:16px;font-weight:700;color:#0f1f3d;margin:0 0 6px;">No events found</p>'
                    + '<p style="font-size:13px;color:#94a3b8;margin:0;">No upcoming events in this category.</p></div>';
                if (pgContainer) pgContainer.innerHTML = '';
                return;
            }

            const total = filtered.length;
            const totalPages = Math.ceil(total / _EVENTS_PER_PAGE);
            if (_eventsCurrentPage > totalPages) _eventsCurrentPage = totalPages;
            const pageItems = filtered.slice((_eventsCurrentPage - 1) * _EVENTS_PER_PAGE, _eventsCurrentPage * _EVENTS_PER_PAGE);

            const catColors = { sports:'#2563eb', community:'#16a34a', health:'#dc2626', others:'#7c3aed' };
            const catIcons = { sports:'bi-dribbble', community:'bi-people-fill', health:'bi-heart-pulse-fill', others:'bi-star-fill' };

            container.innerHTML = pageItems.map(e => {
                const timeStr = e.end_time ? fmt12(e.time) + ' – ' + fmt12(e.end_time) : fmt12(e.time);
                const cat = (e.category||'').toLowerCase();
                const catColor = catColors[cat] || '#1e3a5f';
                const catIcon = catIcons[cat] || 'bi-calendar-event-fill';
                const catLabel = e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Event';
                return '<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:18px;overflow:hidden;box-shadow:0 2px 12px rgba(15,31,61,0.06);transition:all 0.25s;" '
                    + ''
                    + '>'
                    + '<div style="height:6px;background:' + catColor + ';"></div>'
                    + '<div style="padding:18px 20px;">'
                    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">'
                    + '<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:' + catColor + '18;color:' + catColor + ';border:1px solid ' + catColor + '33;">'
                    + '<i class="bi ' + catIcon + '"></i> ' + catLabel + '</span>'
                    + '<span style="font-size:11px;font-weight:700;color:#94a3b8;">' + formatDate(e.date) + '</span>'
                    + '</div>'
                    + '<h3 style="font-size:15px;font-weight:800;color:#0f1f3d;margin:0 0 6px;line-height:1.3;">' + e.title + '</h3>'
                    + '<p style="font-size:12px;color:#64748b;margin:0 0 12px;display:flex;align-items:center;gap:5px;">'
                    + '<i class="bi bi-geo-alt-fill" style="color:' + catColor + ';"></i>' + e.location + '</p>'
                    + '<div style="display:flex;flex-direction:column;gap:5px;padding:10px 12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">'
                    + '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#475569;"><i class="bi bi-clock" style="color:#1e3a5f;"></i>' + timeStr + '</div>'
                    + '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#475569;"><i class="bi bi-person-fill" style="color:#1e3a5f;"></i>By ' + e.organizer + '</div>'
                    + (e.capacity ? '<div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#475569;"><i class="bi bi-people" style="color:#1e3a5f;"></i>Capacity: ' + e.capacity + '</div>' : '')
                    + '</div>'
                    + '</div></div>';
            }).join('');

            // Pagination
            if (!pgContainer) return;
            if (totalPages <= 1) { pgContainer.innerHTML = ''; return; }
            const btns = [];
            btns.push('<button onclick="_eventsCurrentPage>1&&(_eventsCurrentPage--,_renderEventsPage())" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border-color);background:var(--input-bg);color:var(--text-muted);font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;'
                + (_eventsCurrentPage===1?'opacity:0.4;pointer-events:none;':'')+'">&#8592;</button>');
            for (let p = 1; p <= totalPages; p++) {
                const iA = p === _eventsCurrentPage;
                btns.push('<button onclick="_eventsCurrentPage='+p+';_renderEventsPage()" style="width:36px;height:36px;border-radius:8px;border:1.5px solid '+(iA?'#1e3a5f':'var(--border-color)')+';background:'+(iA?'#1e3a5f':'var(--input-bg)')+';color:'+(iA?'#fff':'var(--text-muted)')+';font-size:13px;font-weight:'+(iA?'800':'600')+';cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">'+p+'</button>');
            }
            btns.push('<button onclick="_eventsCurrentPage<'+totalPages+'&&(_eventsCurrentPage++,_renderEventsPage())" style="width:36px;height:36px;border-radius:8px;border:1.5px solid var(--border-color);background:var(--input-bg);color:var(--text-muted);font-size:14px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;'
                + (_eventsCurrentPage===totalPages?'opacity:0.4;pointer-events:none;':'')+'">&#8594;</button>');
            pgContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;padding-top:16px;border-top:1px solid var(--border-color);">'
                + btns.join('') + '</div>';
        }

        async function loadEventsView() {
            const eventsRaw = await getEvents();
            const events = eventsRaw.filter(e => e.status === 'approved');
            const now = new Date();
            const todayStr = now.toLocaleDateString('en-CA');
            const nowMins = now.getHours() * 60 + now.getMinutes();
            _eventsAllUpcoming = events.filter(e => {
                if (!e.date) return false;
                if (e.date > todayStr) return true;
                if (e.date < todayStr) return false;
                const endMins = _parseTimeMins(e.end_time || e.endTime);
                if (endMins === null) return true;
                return nowMins < endMins;
            });
            _eventsAllUpcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            _eventsCurrentCategory = 'all';
            _eventsCurrentPage = 1;
            document.querySelectorAll('.evcat-btn').forEach(btn => {
                const isActive = btn.id === 'evcat-all';
                btn.style.background = isActive ? '#1e3a5f' : '#fff';
                btn.style.borderColor = isActive ? '#1e3a5f' : '#e2e8f0';
                btn.style.color = isActive ? '#fff' : '#64748b';
            });
            _renderEventsPage();
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
                <i class="bi bi-tag mr-1"></i> ${a.type}
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

            _renderHistoryPagination(currentPageHistory, totalPages);
        }
        function _renderHistoryPagination(current, total) {
            const container = document.getElementById('historyPaginationContainer');
            if (!container) return;
            const btnBase = 'display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid;transition:all 0.15s;font-family:inherit;';
            const btnNormal = btnBase + 'background:#fff;border-color:#e2e8f0;color:#374151;';
            const btnActive = btnBase + 'background:#1e3a5f;border-color:#1e3a5f;color:#fff;';
            const btnDisabled = btnBase + 'background:#f3f4f6;border-color:#e2e8f0;color:#9ca3af;cursor:not-allowed;opacity:0.6;';
            const html = [];
            html.push('<button onclick="prevPageHistory()" ' + (current===1?'disabled':' ') + ' style="' + (current===1?btnDisabled:btnNormal) + '"><i class="bi bi-chevron-left"></i></button>');
            _getPageRange(current, total).forEach(function(p) {
                if (p === '...') {
                    html.push('<span style="padding:0 4px;color:#9ca3af;font-size:14px;line-height:36px;">&#8230;</span>');
                } else {
                    html.push('<button onclick="currentPageHistory=' + p + ';renderHistory()" style="' + (p===current?btnActive:btnNormal) + '">' + p + '</button>');
                }
            });
            html.push('<button onclick="nextPageHistory()" ' + (current===total?'disabled':' ') + ' style="' + (current===total?btnDisabled:btnNormal) + '"><i class="bi bi-chevron-right"></i></button>');
            container.innerHTML = html.join('');
        }
        function _getPageRange(current, total) {
            if (total <= 7) { var out=[]; for(var i=1;i<=total;i++) out.push(i); return out; }
            var pages = [];
            if (current <= 4) {
                for (var i=1;i<=5;i++) pages.push(i);
                pages.push('...'); pages.push(total);
            } else if (current >= total-3) {
                pages.push(1); pages.push('...');
                for (var i=total-4;i<=total;i++) pages.push(i);
            } else {
                pages.push(1); pages.push('...');
                for (var i=current-1;i<=current+1;i++) pages.push(i);
                pages.push('...'); pages.push(total);
            }
            return pages;
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
                bor.forEach(b => all.push({ type: 'Borrowing', title: `Borrowed: ${b.equipment_name || 'Equipment'} (x${b.quantity})`, date: new Date(b.created_at || b.date_requested), status: b.status, icon: '<i class="bi bi-box-seam"></i>', colorClass: 'bg-[#e8edf5] text-[#1e3a5f] border-[#c0cfe8] dark:bg-[rgba(30,58,95,0.25)] dark:border-[rgba(30,58,95,0.4)] dark:text-[#93c5fd]' }));
                con.forEach(c => all.push({ type: 'Concern', title: `Reported: ${c.title || c.category}`, date: new Date(c.created_at), status: c.status, icon: '<i class="bi bi-chat-left-text"></i>', colorClass: 'bg-[#e8edf5] text-[#1e3a5f] border-[#c0cfe8] dark:bg-[rgba(30,58,95,0.25)] dark:border-[rgba(30,58,95,0.4)] dark:text-[#93c5fd]' }));
                boo.forEach(b => all.push({ type: 'Facility Reservation', title: `Booked: ${b.venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall'}`, date: new Date(b.created_at || (b.date + 'T' + b.time)), status: b.status, icon: '<i class="bi bi-calendar-event"></i>', colorClass: 'bg-[#e8edf5] text-[#1e3a5f] border-[#c0cfe8] dark:bg-[rgba(30,58,95,0.25)] dark:border-[rgba(30,58,95,0.4)] dark:text-[#93c5fd]' }));
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
                activeBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)';
                activeBtn.style.color = '#fff';
                activeBtn.style.borderColor = '#1e3a5f';
            }
            if (tab === 'security') loadDashboardTOTPStatus();
        }

                async function fetchFullProfileData() {
            try {
                const { data, error } = await supabase.from('users').select('*').eq('username', user.username).maybeSingle();
                if (data) {
                    user.email = typeof decryptData === 'function' ? await decryptData(data.email) : data.email || '';
                    user.phone = typeof decryptData === 'function' ? await decryptData(data.phone || data.contact_number) : (data.phone || data.contact_number || '');
                    user.address = data.address || '';
                    user.name = typeof decryptData === 'function' ? await decryptData(data.full_name || data.fullName || data.name) : (data.full_name || data.fullName || data.name || '');
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
            if (document.getElementById('s-username')) document.getElementById('s-username').value = user.barangay_id || user.username || '';
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

        // ¢â€â‚¬ Google Authenticator (2FA) in Settings ¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬¢â€â‚¬
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
                    statusBadge.style.cssText = 'padding:4px 12px;background:#e8edf5;color:#065f46;border-radius:20px;font-size:12px;font-weight:700;';
                    statusBadge.textContent = ' Active';
                    actionsEl.innerHTML = `<button onclick="disableDashboardTOTP()" style="padding:12px 24px;border-radius:12px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:#fee2e2;color:#b91c1c;border:1.5px solid #fecaca;transition:all 0.2s;"> Disable Google Authenticator</button>`;
                } else {
                    statusText.textContent = 'Not Enabled';
                    statusBadge.style.cssText = 'padding:4px 12px;background:#f3f4f6;color:#6b7280;border-radius:20px;font-size:12px;font-weight:700;';
                    statusBadge.textContent = 'Not Set Up';
                    actionsEl.innerHTML = `<a href="setup-totp.html" style="display:inline-block;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;box-shadow:0 4px 12px rgba(99,102,241,0.3);transition:all 0.2s;"> Enable Google Authenticator</a>`;
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

        // Initialize  auto-complete expired bookings first so UI is clean
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

        // Cross-tab synchronization  listen for admin changes from other tabs
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
            if (btn) { btn.disabled = false; btn.innerHTML = '&#128197; Reschedule'; }
            
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
                // Sync operating hours globally for user
                try {
                    const { data, error } = await supabase.from('site_settings').select('key,value');
                    if (!error && data) {
                        const get = k => { const r = data.find(x=>x.key===k); return r ? parseInt(r.value) : null; };
                        const patch = {};
                        ['equipment_open_hour', 'equipment_close_hour', 'facility_open_hour', 'facility_close_hour'].forEach(k => {
                            const v = get(k);
                            if (v !== null) patch[k] = v;
                        });
                        const current = JSON.parse(localStorage.getItem('brgy_operating_hours') || '{}');
                        localStorage.setItem('brgy_operating_hours', JSON.stringify(Object.assign(current, patch)));
                    }
                } catch(e) { console.warn('Failed to sync operating hours:', e); }

                supabase
                    .channel('live-notifications')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, payload => {
                        const newR = payload.new;
                        if (!newR || !newR.key) return;
                        const validKeys = ['equipment_open_hour', 'equipment_close_hour', 'facility_open_hour', 'facility_close_hour'];
                        if (validKeys.includes(newR.key)) {
                            const current = JSON.parse(localStorage.getItem('brgy_operating_hours') || '{}');
                            current[newR.key] = parseInt(newR.value);
                            localStorage.setItem('brgy_operating_hours', JSON.stringify(current));
                        }
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowings' }, () => {
                        console.log('Borrowing changed! Reloading equipment...');
                        if (typeof loadEquipmentView === 'function') loadEquipmentView();
                        if (typeof loadMyBorrowingsList === 'function') loadMyBorrowingsList();
                    })
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_notifications' }, payload => {
                        const newR = payload.new;
                        if (!window.user || !newR) return;
                        // Match by user_id  check both session id AND resolved Supabase integer id
                        const matchesUser = String(newR.user_id) === String(window.user.id)
                            || (window._resolvedUserId && String(newR.user_id) === String(window._resolvedUserId));
                        if (!matchesUser) return;

                        // Route by type
                        const type = newR.type || '';
                        const msg  = newR.message || '';

                        // Always refresh bell immediately
                        pollBellNotifications();

                        if (type === 'booking_cancelled') {
                            checkPendingNotifications();
                        } else if (type === 'booking_approved') {
                            showNotifToast(' Booking Approved', msg, 'success');
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'booking_rejected') {
                            showNotifToast('&#10060; Booking Rejected', msg, 'error');
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'equipment_approved') {
                            showNotifToast(' Equipment Request Approved', msg, 'success');
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'equipment_rejected') {
                            showNotifToast('&#10060; Equipment Request Rejected', msg, 'error');
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'concern_in_progress') {
                            showNotifToast('&#128296; Concern In Progress', msg, 'info');
                            loadConcernsView && loadConcernsView();
                            loadHistoryView && loadHistoryView();
                        } else if (type === 'concern_resolved') {
                            showNotifToast(' Concern Resolved', msg, 'success');
                            loadConcernsView && loadConcernsView();
                            loadHistoryView && loadHistoryView();
                        } else if (type === 'concern_rejected') {
                            showNotifToast('&#10060; Concern Rejected', msg, 'error');
                            loadConcernsView && loadConcernsView();
                            loadHistoryView && loadHistoryView();
                        } else if (type === 'event_added') {
                            showNotifToast(' New Barangay Event', msg, 'info');
                            loadEventsView && loadEventsView();
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        } else if (type === 'event_cancelled') {
                            showNotifToast(' Event Cancelled', msg, 'warning');
                            loadEventsView && loadEventsView();
                            loadBookingView && loadBookingView();
                            loadDashboardStats && loadDashboardStats();
                        }
                    })
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'concerns' }, payload => {
                        // Realtime concerns update  refresh report history for this user
                        const updated = payload.new;
                        if (!window.user || !updated) return;
                        const matchesUser = String(updated.user_id) === String(window.user.id)
                            || (window._resolvedUserId && String(updated.user_id) === String(window._resolvedUserId));
                        if (!matchesUser) return;
                        // Refresh history + concerns view silently
                        if (typeof loadConcernsView === 'function') loadConcernsView();
                        if (typeof loadHistoryView === 'function') loadHistoryView();
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
                success: { bg: '#e8edf5', border: '#1e3a5f', icon: '', text: '#065f46', progress: '#1e3a5f' },
                error:   { bg: '#fee2e2', border: '#ef4444', icon: '&#10060;', text: '#991b1b', progress: '#ef4444' },
                info:    { bg: '#dbeafe', border: '#3b82f6', icon: '', text: '#1e40af', progress: '#3b82f6' },
                warning: { bg: '#fef3c7', border: '#f59e0b', icon: '¸Â', text: '#92400e', progress: '#f59e0b' }
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
                        style="background:none;border:none;cursor:pointer;font-size:16px;color:${c.text};opacity:0.6;line-height:1;flex-shrink:0;"></button>
                </div>
                <div style="background:rgba(0,0,0,0.1);border-radius:4px;overflow:hidden;height:3px;">
                    <div style="height:100%;background:${c.progress};animation:shrinkWidth 5s linear forwards;"></div>
                </div>
            `;
            document.body.appendChild(toast);
            setTimeout(() => { if (toast.isConnected) toast.remove(); }, 5200);
        }


    
        // ── TERMS & CONDITIONS MODAL ──────────────────────────────────
        async function showBorrowTermsModal() {
            const purpose = window.currentBorrowPurpose || 'event';
            const isEvent = purpose === 'event';

            // Update modal title/subtitle per purpose
            const titleEl = document.getElementById('termsModalTitle');
            const subEl = document.getElementById('termsModalSubtitle');
            if (titleEl) titleEl.textContent = isEvent ? 'Equipment Borrowing Terms & Conditions' : 'Funeral Viewing Borrowing Terms & Conditions';
            if (subEl) subEl.textContent = isEvent ? 'Read all personal event borrowing terms carefully before proceeding.' : 'Read all funeral-viewing borrowing terms carefully before proceeding.';

            // Load purpose-specific rules
            const ruleKey = isEvent ? 'borrowing_rules_event' : 'borrowing_rules_burol';
            const fallbackKey = 'borrowing_rules';
            let rules = [];
            try {
                const { data: d1, error: e1 } = await supabase.from('site_settings').select('value').eq('key', ruleKey).single();
                if (!e1 && d1) rules = JSON.parse(d1.value || '[]');
                if (!rules.length) {
                    const { data: d2, error: e2 } = await supabase.from('site_settings').select('value').eq('key', fallbackKey).single();
                    if (!e2 && d2) rules = JSON.parse(d2.value || '[]');
                }
            } catch(err) {}

            const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const scrollEl = document.getElementById('termsRulesContent');
            const proceedBtn = document.getElementById('termsProceedBtn');

            // Default rules per purpose if none in DB
            let rulesHtml = '';
            if (!rules.length) {
                if (isEvent) {
                    rulesHtml =
                        '<div style="background:#f0fdfa;border:1.5px solid #99f6e4;border-radius:10px;padding:16px 18px;margin-bottom:4px;">' +
                        '<div style="font-weight:800;color:#065f46;margin-bottom:10px;font-size:14px;display:flex;align-items:center;gap:8px;">' +
                        '<i class="bi bi-calendar-event-fill" style="color:#0d9488;font-size:16px;"></i>General Event Borrowing Policy</div>' +
                        '<ol style="margin:0;padding-left:20px;color:#374151;line-height:2.0;font-size:13px;">' +
                        '<li>Equipment must be picked up on your <strong>event day</strong> and returned the <strong>very next day</strong> at the same time.</li>' +
                        '<li>All items must be returned in the <strong>same condition</strong> as borrowed.</li>' +
                        '<li>Any damage or loss must be <strong>reported immediately</strong> to the Barangay.</li>' +
                        '<li>Borrowers are liable for <strong>replacing lost or damaged items</strong>.</li>' +
                        '<li>Equipment is for <strong>community events only</strong> — not for commercial or personal profit.</li>' +
                        '<li>A <strong>+1 day extension</strong> applies — items returned beyond this incur a penalty.</li>' +
                        '</ol></div>';
                } else {
                    rulesHtml =
                        '<div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:16px 18px;margin-bottom:4px;">' +
                        '<div style="font-weight:800;color:#92400e;margin-bottom:10px;font-size:14px;display:flex;align-items:center;gap:8px;">' +
                        '<i class="bi bi-shield-fill" style="color:#d97706;font-size:16px;"></i>Funeral Viewing Borrowing Policy</div>' +
                        '<ol style="margin:0;padding-left:20px;color:#374151;line-height:2.0;font-size:13px;">' +
                        '<li>Equipment may be borrowed for up to <strong>7 days</strong> for funeral viewings.</li>' +
                        '<li>Items must be treated with <strong>respect and care</strong> during the viewing period.</li>' +
                        '<li>All items must be returned <strong>clean and in the same condition</strong> as when borrowed.</li>' +
                        '<li>Any damage or loss must be <strong>reported immediately</strong> to the Barangay.</li>' +
                        '<li>Borrowers are fully liable for <strong>replacing lost or damaged equipment</strong>.</li>' +
                        '<li>Equipment is exclusively for the <strong>viewing/wake</strong> — not for other personal use.</li>' +
                        '</ol></div>';
                }
            } else {
                rulesHtml = rules.map((r, i) =>
                    '<div style="padding:14px 0;' + (i < rules.length-1 ? 'border-bottom:1px solid #e2e8f0;' : '') + '">' +
                    '<div style="display:flex;align-items:flex-start;gap:12px;">' +
                    '<span style="min-width:24px;height:24px;background:#1e3a5f;color:#fff;border-radius:50%;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">' + (i+1) + '</span>' +
                    '<div><div style="font-weight:700;color:#1A1A2E;margin-bottom:4px;font-size:14px;">' + _e(r.title) + '</div>' +
                    '<div style="color:#6B7280;font-size:13px;line-height:1.7;">' + _e(r.content) + '</div></div>' +
                    '</div></div>'
                ).join('');
            }

            // Append agree checkbox at the very bottom
            rulesHtml +=
                '<div id="termsCheckRow" style="margin-top:20px;padding:16px 18px;background:#EEF2FF;border:2px solid #C7D2FE;border-radius:12px;">' +
                '<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">' +
                '<input type="checkbox" id="termsAgreeCheck" onchange="onTermsCheckChange(this)"' +
                ' style="width:18px;height:18px;flex-shrink:0;margin-top:2px;accent-color:#1e3a5f;cursor:pointer;">' +
                '<span style="font-size:13px;font-weight:600;color:#1e3a5f;line-height:1.5;">' +
                'I have read and fully understood the <strong>Barangay Borrowing Terms &amp; Conditions</strong> above and agree to comply.' +
                '</span></label></div>';

            if (scrollEl) { scrollEl.innerHTML = rulesHtml; scrollEl.scrollTop = 0; }

            // Reset proceed button
            if (proceedBtn) {
                proceedBtn.disabled = true;
                proceedBtn.style.background = '#D1D5DB';
                proceedBtn.style.color = '#9CA3AF';
                proceedBtn.style.cursor = 'not-allowed';
            }

            // Show modal
            const modal = document.getElementById('borrowTermsModal');
            if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
        }
        function onTermsCheckChange(chk) {
            const proceedBtn = document.getElementById('termsProceedBtn');
            if (!proceedBtn) return;
            if (chk.checked) {
                proceedBtn.disabled = false;
                proceedBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)';
                proceedBtn.style.color = '#fff';
                proceedBtn.style.cursor = 'pointer';
                proceedBtn.style.boxShadow = '0 4px 14px rgba(30,58,95,0.35)';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.style.background = '#D1D5DB';
                proceedBtn.style.color = '#9CA3AF';
                proceedBtn.style.cursor = 'not-allowed';
                proceedBtn.style.boxShadow = 'none';
            }
        }

        function closeTermsModal() {
            const modal = document.getElementById('borrowTermsModal');
            if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
        }

        function agreeAndSubmitBorrow() {
            const chk = document.getElementById('termsAgreeCheck');
            if (!chk || !chk.checked) return;
            window._borrowTermsAgreed = true;
            closeTermsModal();
            // Show terms-accepted state on the submit button
            const _btn = document.getElementById('submitBorrowBtn');
            if (_btn) {
                _btn.innerHTML = '<i class="bi bi-check-circle-fill" style="margin-right:6px;"></i>Terms Accepted — Click to Submit';
                _btn.style.background = 'linear-gradient(135deg,#1e3a5f,#065f46)';
            }
        }
        // ──────────────────────────────────────────────────────────────
        