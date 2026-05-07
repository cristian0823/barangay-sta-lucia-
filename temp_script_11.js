
            function activateBottomTab(element) {
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                element.classList.add('active');
            }
        
            // ==========================================
            // ADMIN BELL NOTIFICATIONS (matches user portal design)
            // ==========================================
            function toggleAdminBell(e) {
                if (e) e.stopPropagation();
                const drop = document.getElementById('adminBellDropdown');
                if (!drop) return;
                const isOpen = drop.style.display === 'flex';
                drop.style.display = isOpen ? 'none' : 'flex';
                if (!isOpen) refreshAdminBell();
            }

            document.addEventListener('click', function(e) {
                const drop = document.getElementById('adminBellDropdown');
                const wrap = document.getElementById('adminBellWrapper');
                if (drop && wrap && drop.style.display === 'flex' && !wrap.contains(e.target)) {
                    drop.style.display = 'none';
                }
            });

            // Track which notification IDs have been dismissed by admin
            const ADMIN_BELL_DISMISSED_KEY = 'adminBellDismissed';
            function getAdminDismissed() {
                try { return new Set(JSON.parse(localStorage.getItem(ADMIN_BELL_DISMISSED_KEY)) || []); } catch { return new Set(); }
            }
            function saveAdminDismissed(set) {
                localStorage.setItem(ADMIN_BELL_DISMISSED_KEY, JSON.stringify([...set]));
            }
            function dismissAdminNotif(id) {
                const d = getAdminDismissed();
                d.add(id);
                saveAdminDismissed(d);
                refreshAdminBell();
            }
            function dismissAllAdminNotifs() {
                const d = getAdminDismissed();
                // Add all currently shown ids
                document.querySelectorAll('.admin-bell-item[data-notif-id]').forEach(el => d.add(el.dataset.notifId));
                saveAdminDismissed(d);
                refreshAdminBell();
            }

            async function refreshAdminBell() {
                const list = document.getElementById('adminBellList');
                const badge = document.getElementById('adminBellBadge');
                if (!list || !badge) return;

                let items = [];

                try {
                    const supabaseOk = typeof isSupabaseAvailable === 'function' && await isSupabaseAvailable();
                    if (supabaseOk) {
                        // Query all three tables for recent pending activity
                        const [bookingsRes, borrowingsRes, concernsRes] = await Promise.all([
                            supabase.from('facility_reservations').select('id, user_id, date, time, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('borrowings').select('id, user_id, equipment, quantity, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20),
                            supabase.from('concerns').select('id, user_id, title, description, created_at, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(20)
                        ]);

                        (bookingsRes.data || []).forEach(b => items.push({
                            id: 'booking_' + b.id,
                            refId: b.id,
                            type: 'booking',
                            icon: '📅',
                            message: 'New facility reservation on ' + b.date,
                            createdAt: b.created_at
                        }));
                        (borrowingsRes.data || []).forEach(b => items.push({
                            id: 'borrow_' + b.id,
                            refId: b.id,
                            type: 'borrow',
                            icon: '📦',
                            message: 'Equipment request: ' + b.quantity + 'x ' + b.equipment,
                            createdAt: b.created_at
                        }));
                        (concernsRes.data || []).forEach(c => items.push({
                            id: 'concern_' + c.id,
                            refId: c.id,
                            type: 'concern',
                            icon: '📢',
                            message: 'New concern: ' + (c.title || 'Untitled'),
                            createdAt: c.created_at
                        }));
                    } else {
                        // LocalStorage fallback
                        const bookings = (JSON.parse(localStorage.getItem('courtBookings')) || []).filter(b => b.status === 'pending');
                        const borrowings = (JSON.parse(localStorage.getItem('courtBorrowings')) || []).filter(b => b.status === 'pending');
                        const concerns = (JSON.parse(localStorage.getItem('barangayConcerns')) || []).filter(c => c.status === 'pending');
                        bookings.forEach(b => items.push({ id: 'booking_' + b.id, refId: b.id, type: 'booking', icon: '📅', message: 'Pending facility reservation on ' + b.date, createdAt: b.createdAt }));
                        borrowings.forEach(b => items.push({ id: 'borrow_' + b.id, refId: b.id, type: 'borrow', icon: '📦', message: 'Equipment request: ' + (b.quantity || 1) + 'x ' + b.equipment, createdAt: b.createdAt }));
                        concerns.forEach(c => items.push({ id: 'concern_' + c.id, refId: c.id, type: 'concern', icon: '📢', message: 'New concern: ' + (c.title || 'Untitled'), createdAt: c.createdAt }));
                    }
                } catch(e) { console.warn('Admin bell error:', e); }

                // Sort newest first & filter dismissed
                items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                const dismissed = getAdminDismissed();
                const visible = items.filter(n => !dismissed.has(n.id));
                const total = visible.length;

                if (total > 0) {
                    badge.style.display = 'flex';
                    badge.textContent = total > 99 ? '99+' : total;
                } else {
                    badge.style.display = 'none';
                }

                if (total === 0) {
                    list.innerHTML = '<div class="admin-bell-empty"><i class="bi bi-bell-slash" style="font-size:24px;display:block;margin-bottom:8px;"></i>No pending actions</div>';
                    return;
                }

                list.innerHTML = visible.slice(0, 30).map(n => {
                    const timeStr = n.createdAt
                        ? new Date(n.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Just now';
                    return `<div class="admin-bell-item is-unread" data-notif-id="${n.id}" onclick="handleAdminBellClick('${n.id}', '${n.type}')">
                        <div class="admin-bell-icon-circle">${n.icon}</div>
                        <div style="flex:1;min-width:0;padding-right:12px;">
                            <p class="admin-bell-msg">${n.message}</p>
                            <div class="admin-bell-time">${timeStr}</div>
                        </div>
                    </div>`;
                }).join('');
            }

            async function handleAdminBellClick(id, type) {
                dismissAdminNotif(id);
                document.getElementById('adminBellDropdown').style.display = 'none';
                const sectionMap = { 'borrow': 'requests', 'booking': 'court-bookings', 'concern': 'concerns' };
                const target = sectionMap[type];
                if (target) {
                    const btn = document.querySelector(`.sidebar-btn[onclick*="${target}"]`);
                    switchSection(target, btn);
                }
                refreshAdminBell();
            }

            async function markAllAdminBellRead() {
                dismissAllAdminNotifs();
            }

            setInterval(refreshAdminBell, 30000);

        