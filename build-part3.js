const fs = require('fs');
const js = `
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"><\/script>
    <script src="js/supabase-config.js"><\/script>
    <script src="js/app.js"><\/script>
    <script src="js/darkmode.js"><\/script>
    <script>
        // Auth check
        const user = getCurrentUser();
        if (!user) { window.location.href = 'login.html'; }

        document.getElementById('sidebarUserName').textContent = user.name || user.email.split('@')[0];
        document.getElementById('welcomeName').textContent = user.name || user.email.split('@')[0];
        document.getElementById('userInitial').textContent = (user.name || user.email)[0].toUpperCase();

        // Panel routing
        function showPanel(panelId) {
            document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
            document.getElementById('panel-' + panelId).classList.add('active');
            const navLink = document.getElementById('nav-' + panelId);
            if (navLink) navLink.classList.add('active');
            switch (panelId) {
                case 'dashboard': loadDashboardStats(); break;
                case 'equipment': loadEquipmentView(); break;
                case 'concerns': loadConcernsView(); break;
                case 'booking': loadBookingView(); break;
                case 'events': loadEventsView(); break;
            }
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => { e.preventDefault(); logoutUser(); });

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
                document.getElementById('stat-equipment').textContent = eqReqs ? eqReqs.filter(b => b.status === 'pending' || b.status === 'approved').length : 0;
                const concerns = await getMyConcerns();
                document.getElementById('stat-concerns').textContent = concerns ? concerns.filter(c => c.status === 'pending').length : 0;
                const bookingsRaw = await getCourtBookings();
                const myBookings = bookingsRaw ? bookingsRaw.filter(b => b.userId === user.id && b.status !== 'cancelled') : [];
                const today = new Date(); today.setHours(0, 0, 0, 0);
                document.getElementById('stat-bookings').textContent = myBookings.filter(b => new Date(b.date) >= today).length;
            } catch (e) { console.error("Error loading stats", e); }
        }

        // ==========================================
        // 2. EQUIPMENT VIEW
        // ==========================================
        function renderEquipmentGrid(list) {
            const grid = document.getElementById('equipmentGrid');
            if (!list || list.length === 0) { grid.innerHTML = '<p class="text-gray-500 italic col-span-2">No equipment found.</p>'; return; }
            grid.innerHTML = list.map(item => {
                const pct = Math.round((item.available / item.quantity) * 100);
                let color = 'bg-emerald-500', statusColor = 'text-emerald-600', statusBg = 'bg-emerald-50', statusIcon = '✓';
                if (pct < 50) { color = 'bg-amber-500'; statusColor = 'text-amber-600'; statusBg = 'bg-amber-50'; statusIcon = '⚠'; }
                if (pct < 25) { color = 'bg-red-500'; statusColor = 'text-red-600'; statusBg = 'bg-red-50'; statusIcon = '✕'; }
                const ok = item.available > 0;
                return '<div class="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ' + (ok ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1' : 'border-gray-100 opacity-60') + '">' +
                    '<div class="absolute top-4 right-4"><span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ' + (ok ? statusBg + ' ' + statusColor : 'bg-gray-100 text-gray-500') + '"><span>' + statusIcon + '</span> ' + item.available + ' available</span></div>' +
                    '<div class="flex items-start gap-4 mb-4"><div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl shadow-sm">' + item.icon + '</div>' +
                    '<div class="flex-1 pt-1"><h4 class="font-bold text-lg text-gray-800 dark:text-white mb-1">' + item.name + '</h4><p class="text-xs text-gray-500 font-medium">' + (item.category || 'Equipment') + '</p></div></div>' +
                    '<div class="mb-3"><div class="flex justify-between items-center mb-2"><span class="text-xs font-semibold text-gray-500">Availability</span><span class="text-xs font-bold ' + statusColor + '">' + pct + '%</span></div>' +
                    '<div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"><div class="' + color + ' h-full rounded-full transition-all duration-500 shadow-inner" style="width: ' + pct + '%"></div></div></div>' +
                    '<div class="flex items-center justify-between pt-2 border-t border-gray-100"><div class="flex items-center gap-2"><span class="text-xs font-medium text-gray-500">' + item.quantity + ' total</span></div>' +
                    (ok ? '<button onclick="openBorrowModalWithEquip(' + item.id + ')" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition transform hover:scale-105 shadow-lg">📝 Borrow</button>' : '<span class="text-xs font-bold text-red-500">Out of stock</span>') +
                    '</div></div>';
            }).join('');
        }

        async function loadEquipmentView() {
            const list = await getEquipment();
            allEquipmentList = list;
            renderEquipmentGrid(list);
            loadMyBorrowingsList();
        }

        async function loadMyBorrowingsList() {
            const list = await getMyBorrowings();
            const container = document.getElementById('myBorrowingsList');
            if (!list || list.length === 0) {
                container.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-center col-span-full"><div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4">📦</div><p class="text-gray-500 font-medium">No borrowing history yet</p></div>';
                return;
            }
            const sorted = [...list].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            container.innerHTML = sorted.map(b => {
                let statusBadge = '', statusBorder = 'border-emerald-200';
                if (b.status === 'pending') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>Pending</span>'; statusBorder = 'border-amber-200'; }
                if (b.status === 'approved') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Approved</span>'; statusBorder = 'border-emerald-200'; }
                if (b.status === 'rejected') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>'; statusBorder = 'border-red-200'; }
                if (b.status === 'returned') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Returned</span>'; statusBorder = 'border-blue-200'; }
                return '<div class="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ' + statusBorder + ' shadow-sm hover:shadow-md transition-all duration-300">' +
                    '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div class="flex items-start gap-4"><div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-2xl shadow-sm">📦</div>' +
                    '<div><h4 class="font-bold text-lg text-gray-800 dark:text-white">' + b.equipment + '</h4><p class="text-sm text-gray-500 font-medium">Quantity: <span class="text-emerald-600 font-bold">x' + b.quantity + '</span></p></div></div>' +
                    '<div class="flex flex-col items-end gap-2">' + statusBadge + '<div class="text-xs text-gray-400 flex items-center gap-1">📅 ' + formatDate(b.borrowDate) + ' → ' + formatDate(b.returnDate) + '</div></div></div>' +
                    (b.status === 'pending' ? '<div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"><p class="text-xs text-amber-600 font-medium flex items-center gap-1">⏳ Waiting for approval</p><button onclick="cancelEqRequest(' + b.id + ')" class="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Cancel Request</button></div>' : '') +
                    '</div>';
            }).join('');
        }

        // ==========================================
        // BORROW MODAL LOGIC
        // ==========================================
        async function openBorrowModalWithEquip(equipId) {
            const list = await getEquipment();
            const item = list.find(e => e.id === equipId);
            if (!item) return;
            document.getElementById('borrowModalTitle').innerHTML = 'Borrow ' + item.name + ' ' + item.icon;
            document.getElementById('borrowEquipmentId').value = equipId;
            document.getElementById('borrowEquipmentName').value = item.name;
            document.getElementById('borrowQty').max = item.available;
            document.getElementById('borrowQty').value = 1;
            document.getElementById('borrowMaxHelp').innerHTML = '📦 Max: ' + item.available + ' units available';
            document.getElementById('borrowPurpose').value = '';
            document.getElementById('borrowerFullName').value = user.name || '';
            document.getElementById('borrowerContact').value = '';
            borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true;
            updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton();
            document.getElementById('borrowModal').classList.remove('hidden');
        }

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
                bDisp.innerHTML = '<div class="text-lg font-bold text-emerald-700">' + fullMonths[d.getMonth()] + ' ' + d.getDate() + '</div><div class="text-xs text-emerald-500">' + d.getFullYear() + '</div>';
                bDisp.classList.add('border-emerald-400', 'bg-emerald-100');
                if (dpStartDay) { dpStartDay.textContent = d.getDate(); dpStartMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                rangeDisplay.textContent = 'Now select a return date from the calendar';
            } else {
                bDisp.innerHTML = '<div class="text-lg font-bold text-emerald-700">Select date</div><div class="text-xs text-emerald-500">from calendar</div>';
                bDisp.classList.remove('border-emerald-400', 'bg-emerald-100');
                if (dpStartDay) { dpStartDay.textContent = '--'; dpStartMonth.textContent = 'Select date'; }
                rangeDisplay.textContent = 'Please select your borrowing dates from the calendar';
            }
            if (borrowReturnDate) {
                const d = new Date(borrowReturnDate);
                rDisp.innerHTML = '<div class="text-lg font-bold text-teal-700">' + fullMonths[d.getMonth()] + ' ' + d.getDate() + '</div><div class="text-xs text-teal-500">' + d.getFullYear() + '</div>';
                rDisp.classList.add('border-teal-400', 'bg-teal-100');
                if (dpReturnDay) { dpReturnDay.textContent = d.getDate(); dpReturnMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                const start = new Date(borrowStartDate);
                const diffDays = Math.ceil(Math.abs(d - start) / (1000*60*60*24)) + 1;
                durText.textContent = diffDays + (diffDays > 1 ? ' days' : ' day');
                rangeDisplay.innerHTML = '<span class="text-emerald-600">📅 ' + fullMonths[start.getMonth()] + ' ' + start.getDate() + ' → ' + fullMonths[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '</span> <span class="ml-2 px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">' + diffDays + ' day' + (diffDays > 1 ? 's' : '') + '</span>';
            } else {
                rDisp.innerHTML = '<div class="text-lg font-bold text-teal-700">Select date</div><div class="text-xs text-teal-500">from calendar</div>';
                rDisp.classList.remove('border-teal-400', 'bg-teal-100');
                if (dpReturnDay) { dpReturnDay.textContent = '--'; dpReturnMonth.textContent = 'Select date'; durText.textContent = '0 days'; }
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
                if (dateObj < today) { dayDiv.className += 'bg-gray-100 text-gray-400 cursor-not-allowed'; }
                else { dayDiv.className += 'bg-emerald-50 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'; dayDiv.onclick = () => selectBorrowDate(dateStr); }
                if (dateObj.getTime() === today.getTime()) { dayDiv.className += ' ring-2 ring-emerald-500 ring-offset-2'; }
                if (borrowStartDate === dateStr) { dayDiv.className = 'p-2.5 rounded-lg text-center cursor-pointer font-bold text-sm bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'; }
                if (borrowReturnDate === dateStr) { dayDiv.className = 'p-2.5 rounded-lg text-center cursor-pointer font-bold text-sm bg-teal-500 text-white shadow-md ring-2 ring-teal-300'; }
                if (borrowStartDate && borrowReturnDate) {
                    const start = new Date(borrowStartDate); const end = new Date(borrowReturnDate);
                    if (dateObj > start && dateObj < end) { dayDiv.className += ' bg-emerald-100'; }
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
            const purpose = document.getElementById('borrowPurpose').value;
            const borrowDate = borrowStartDate;
            const returnDate = borrowReturnDate;
            if (!equipId) return showToast('Please select an equipment item', 'error');
            if (!borrowDate || !returnDate) return showToast('Please select both dates', 'error');
            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Submitting...';
            const result = await borrowEquipment(equipId, qty, borrowDate, returnDate, purpose);
            if (result.success) { showToast(result.message, 'success'); closeBorrowModal(); await loadEquipmentView(); await loadDashboardStats(); }
            else { showToast(result.message, 'error'); }
            btn.disabled = false; btn.innerHTML = '✅ Submit Borrow Request';
        });

        async function cancelEqRequest(id) {
            if (!await showConfirmModal('Cancel this equipment request?', 'Cancel Request', 'Yes, Cancel', 'No', 'warning')) return;
            const res = await cancelBorrowingRequest(id);
            if (res.success) { showToast(res.message, 'success'); loadEquipmentView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
        }

        // ==========================================
        // 3. CONCERNS
        // ==========================================
        async function loadConcernsView() {
            const concerns = await getMyConcerns();
            const container = document.getElementById('myConcernsList');
            if (!concerns || concerns.length === 0) { container.innerHTML = '<p class="text-gray-500 italic py-4">You have not submitted any concerns yet.</p>'; return; }
            const sorted = [...concerns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = sorted.map(c => {
                let statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">⏳ Pending</span>';
                if (c.status === 'in-progress') statusBadge = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">🔄 In Progress</span>';
                if (c.status === 'resolved') statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">✅ Resolved</span>';
                if (c.status === 'rejected') statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">❌ Rejected</span>';
                return '<div class="border rounded-xl p-5 shadow-sm transition hover:shadow-md" style="background-color: var(--panel-bg); border-color: var(--border-color);">' +
                    '<div class="flex justify-between items-start mb-3 border-b pb-3" style="border-color: var(--border-color);">' +
                    '<div><h4 class="font-bold text-lg" style="color: var(--text-main);">' + c.title + '</h4>' +
                    '<div class="flex items-center gap-3 text-xs mt-1" style="color: var(--text-muted);"><span class="bg-gray-100 px-2 py-0.5 rounded">' + c.category + '</span><span>📅 ' + formatDate(c.createdAt) + '</span></div></div>' +
                    '<div class="flex flex-col items-end gap-2">' + statusBadge +
                    (c.status === 'pending' ? '<button onclick="deleteMyConcern(' + c.id + ')" class="text-xs text-red-500 hover:text-red-700 font-semibold bg-red-50 px-2 py-1 rounded">Delete</button>' : '') +
                    '</div></div>' +
                    '<p class="text-sm mb-3 leading-relaxed" style="color: var(--text-main);">' + c.description + '</p>' +
                    (c.address ? '<p class="text-xs mb-3" style="color: var(--text-muted);">📍 Location: ' + c.address + '</p>' : '') +
                    (c.response ? '<div class="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg mt-3"><p class="text-xs font-bold text-emerald-700 mb-1">🏛️ Admin Response:</p><p class="text-sm text-emerald-800">' + c.response + '</p></div>' : '') +
                    '</div>';
            }).join('');
        }

        document.getElementById('concernForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]'); btn.disabled = true; btn.innerHTML = 'Submitting...';
            const res = await submitConcern(document.getElementById('concernCategory').value, document.getElementById('concernTitle').value, document.getElementById('concernDescription').value, document.getElementById('concernLocation').value);
            if (res.success) { showToast('Concern successfully reported!', 'success'); this.reset(); await loadConcernsView(); await loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            btn.disabled = false; btn.innerHTML = 'Submit Report';
        });

        async function deleteMyConcern(id) {
            if (!await showConfirmModal('Delete this concern?', 'Delete Concern', 'Yes, Delete', 'Cancel', 'danger')) return;
            const res = await deleteConcern(id);
            if (res.success) { showToast('Concern deleted'); loadConcernsView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
        }

        // ==========================================
        // 4. BOOKING
        // ==========================================
        function switchVenue(venue) {
            selectedVenue = venue;
            document.getElementById('sel-basketball').className = venue === 'basketball' ? 'px-5 py-2 rounded-lg font-bold text-sm bg-blue-600 text-white shadow-sm transition' : 'px-5 py-2 rounded-lg font-bold text-sm text-gray-500 hover:text-gray-800 transition';
            document.getElementById('sel-multipurpose').className = venue === 'multipurpose' ? 'px-5 py-2 rounded-lg font-bold text-sm bg-blue-600 text-white shadow-sm transition' : 'px-5 py-2 rounded-lg font-bold text-sm text-gray-500 hover:text-gray-800 transition';
            document.getElementById('bookingVenueInput').value = venue;
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
            const eventDates = {}; approvedEvents.forEach(e => { eventDates[e.date] = e; });
            const venueBookings = bookings.filter(b => b.status !== 'cancelled' && b.venue === selectedVenue);
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
                dayDiv.className = 'p-3 rounded-lg text-center cursor-pointer font-bold text-sm transition transform hover:scale-105 ';
                if (dateObj < today) { dayDiv.className += 'bg-gray-100 text-gray-400 cursor-not-allowed'; }
                else if (hasEvent) { dayDiv.className += 'bg-purple-100 text-purple-700 border-2 border-purple-300'; dayDiv.title = 'Event: ' + hasEvent.title; }
                else if (bookedDates.includes(dateStr)) { dayDiv.className += 'bg-red-100 text-red-700 border-2 border-red-300'; }
                else { dayDiv.className += 'bg-emerald-50 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'; }
                if (dateObj.getTime() === today.getTime()) { dayDiv.className += ' ring-2 ring-emerald-500 ring-offset-2'; }
                if (selectedDate === dateStr) { dayDiv.className = 'p-3 rounded-lg text-center cursor-pointer font-bold text-sm bg-blue-600 text-white shadow-md hover:scale-105 transition transform'; }
                dayDiv.textContent = day;
                dayDiv.onclick = () => selectBookingDate(dateStr, hasEvent);
                grid.appendChild(dayDiv);
            }
            const myContainer = document.getElementById('myReservationsList');
            const myBookings = bookings.filter(b => b.userId === user.id);
            if (myBookings.length === 0) { myContainer.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have no reservations.</p>'; }
            else {
                myBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
                myContainer.innerHTML = myBookings.map(b => {
                    const statusClass = b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800';
                    const statusText = b.status === 'cancelled' ? 'Cancelled' : 'Booked';
                    return '<div class="border rounded-xl p-4 transition shadow-sm ' + (b.status === 'cancelled' ? 'opacity-60' : '') + '" style="background-color: var(--panel-bg); border-color: var(--border-color);">' +
                        '<div class="flex justify-between mb-2 border-b pb-2" style="border-color: var(--border-color);"><h4 class="font-bold" style="color: var(--text-main);">📅 ' + formatDate(b.date) + '</h4><span class="px-2 py-0.5 rounded text-xs font-bold ' + statusClass + '">' + statusText + '</span></div>' +
                        '<p class="text-xs mb-1" style="color: var(--text-muted);">⏰ ' + b.time + ' - ' + (b.end_time || '') + '</p>' +
                        '<p class="text-xs text-blue-600 font-bold mb-2">🏢 ' + b.venueName + '</p>' +
                        '<p class="text-xs italic" style="color: var(--text-muted);">Purpose: ' + b.purpose + '</p>' +
                        (b.status !== 'cancelled' ? '<button onclick="cancelMyReservation(' + b.id + ')" class="mt-3 w-full py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded transition">Cancel Reservation</button>' : '') +
                        '</div>';
                }).join('');
            }
        }

        async function selectBookingDate(dateStr, eventOnDate) {
            const today = new Date(); today.setHours(0,0,0,0);
            if (new Date(dateStr) < today) return showToast('Cannot select past dates', 'error');
            selectedDate = dateStr; await loadBookingView();
            document.getElementById('bookingFormHeading').innerHTML = 'Book for <span class="text-blue-600">' + formatDate(dateStr) + '</span>';
            document.getElementById('userBookingForm').classList.remove('hidden');
            document.getElementById('bookingDateInput').value = dateStr;
            const submitBtn = document.getElementById('submitBookingBtn');
            const warnBox = document.getElementById('bookingConflictWarning');
            if (eventOnDate) {
                warnBox.innerHTML = '<div class="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-800 text-sm mb-4"><p class="font-bold">⛔ Unavailable</p><p>Official event: <strong>' + eventOnDate.title + '</strong></p></div>';
                submitBtn.disabled = true; submitBtn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-500'); submitBtn.classList.remove('bg-gradient-to-r', 'from-blue-500', 'to-blue-600'); submitBtn.innerHTML = '🚫 Unavailable';
            } else {
                warnBox.innerHTML = ''; submitBtn.disabled = false; submitBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-gray-500'); submitBtn.classList.add('bg-gradient-to-r', 'from-blue-500', 'to-blue-600'); submitBtn.innerHTML = 'Confirm Booking';
            }
        }

        document.getElementById('userBookingForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = document.getElementById('submitBookingBtn'); btn.disabled = true; btn.innerHTML = 'Processing...';
            const bookingData = { date: document.getElementById('bookingDateInput').value, time: document.getElementById('bookingTimeInput').value, end_time: document.getElementById('bookingEndTimeInput').value, purpose: document.getElementById('bookingPurposeInput').value, venue: document.getElementById('bookingVenueInput').value, venueName: document.getElementById('bookingVenueInput').value === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall' };
            const result = await bookCourt(bookingData);
            if (result.success) { showToast(result.message, 'success'); this.reset(); this.classList.add('hidden'); document.getElementById('bookingFormHeading').innerHTML = 'Select a Date in the Calendar'; selectedDate = null; await loadBookingView(); await loadDashboardStats(); }
            else { showToast(result.message, 'error'); }
            btn.disabled = false; btn.innerHTML = 'Confirm Booking';
        });

        async function cancelMyReservation(id) {
            if (!await showConfirmModal('Cancel this reservation?', 'Cancel Reservation', 'Yes, Cancel', 'No', 'warning')) return;
            const res = await cancelCourtBooking(id);
            if (res.success) { showToast("Reservation cancelled", 'success'); loadBookingView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
        }

        // ==========================================
        // 5. EVENTS
        // ==========================================
        async function loadEventsView() {
            const container = document.getElementById('upcomingEventsContainer');
            const eventsRaw = await getEvents();
            const events = eventsRaw.filter(e => e.status === 'approved');
            const today = new Date(); today.setHours(0,0,0,0);
            const upcoming = events.filter(e => new Date(e.date + 'T00:00:00') >= today);
            if (upcoming.length === 0) { container.innerHTML = '<div class="col-span-full py-10 text-center"><p class="text-gray-500">No upcoming events.</p></div>'; return; }
            upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            container.innerHTML = upcoming.map(e => {
                const timeStr = e.end_time ? e.time + ' - ' + e.end_time : e.time;
                return '<div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform transition hover:-translate-y-1 hover:shadow-2xl">' +
                    '<div class="flex justify-between items-start mb-4"><span class="bg-white text-purple-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">Official Event</span></div>' +
                    '<h3 class="text-2xl font-black mb-1 line-clamp-2">' + e.title + '</h3>' +
                    '<p class="text-indigo-100 font-medium mb-4 text-sm flex items-center gap-1">📍 ' + e.location + '</p>' +
                    '<div class="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20">' +
                    '<div class="flex items-center gap-2 mb-2"><span class="text-xl">📅</span><span class="font-bold">' + formatDate(e.date) + '</span></div>' +
                    '<div class="flex items-center gap-2 mb-2"><span class="text-xl">⏰</span><span class="font-bold">' + timeStr + '</span></div>' +
                    '<div class="flex items-center gap-2"><span class="text-xl">👤</span><span class="text-sm">By ' + e.organizer + '</span></div>' +
                    '</div></div>';
            }).join('');
        }

        // Initialize
        showPanel('dashboard');
    <\/script>
</body>
</html>`;
fs.appendFileSync('user-dashboard-new.html', js, 'utf8');
console.log('Part 3 (JS) written. Dashboard rebuild complete!');
