const fs = require('fs');

function fixFile(path, fn, label) {
    let c = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
    const before = c;
    c = fn(c);
    if (c === before) { console.log(`[WARN] No change made: ${label}`); return; }
    fs.writeFileSync(path, c, 'utf8');
    console.log(`[OK] ${label}`);
}

function rep(c, old, neo, label) {
    if (!c.includes(old)) { console.log(`[MISS] ${label}`); return c; }
    console.log(`[HIT] ${label}`);
    return c.replace(old, neo);
}

// ─────────────────────────────────────────────
// 1. FIX USER SIDEBAR ACTIVE COLOR (amber→blue)
// ─────────────────────────────────────────────
fixFile(
    'c:/Users/Kael/OneDrive/Documents/barangay-website/user-portal/user-dashboard.html',
    c => {
        // CSS variable block
        c = rep(c,
            '--nav-active-bg: rgba(245,166,35,0.15); --nav-active-text: #f5a623;',
            '--nav-active-bg: rgba(37,99,235,0.15); --nav-active-text: #2563eb;',
            'nav-active CSS vars'
        );
        // .nav-item.active border-left and icon color
        c = rep(c,
            '.nav-item.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; border-left: 3px solid #f5a623 !important; box-shadow: none; }\n        .nav-item.active .nav-icon { background: rgba(245,166,35,0.15) !important; color: #f5a623 !important; }',
            '.nav-item.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; border-left: 3px solid #2563eb !important; box-shadow: none; }\n        .nav-item.active .nav-icon { background: rgba(37,99,235,0.15) !important; color: #2563eb !important; }',
            'nav-item.active border and icon colors'
        );
        // --green-xl amber
        c = rep(c,
            '--green-xl: #f5a623;',
            '--green-xl: #2563eb;',
            '--green-xl amber→blue'
        );
        return c;
    },
    'User sidebar active color fix'
);

// ─────────────────────────────────────────────
// 2. ADMIN: Add loadOverviewPanels function + Court Events tabs
// ─────────────────────────────────────────────
fixFile(
    'c:/Users/Kael/OneDrive/Documents/barangay-website/admin-portal/admin.html',
    c => {

        // ── 2a. Insert loadOverviewPanels function before loadCourtBookings ──
        const insertBefore = '\n            async function loadCourtBookings() {';
        if (!c.includes(insertBefore)) {
            console.log('[MISS] loadCourtBookings insertion point');
        } else {
            const fn = `
            async function loadOverviewPanels() {
                try {
                    const supabase = window.supabase;
                    if (!supabase) return;

                    // Today's summary counts
                    const today = new Date().toISOString().split('T')[0];
                    const [reqRes, conRes] = await Promise.all([
                        supabase.from('borrowings').select('id', { count: 'exact', head: true }).gte('created_at', today),
                        supabase.from('concerns').select('id', { count: 'exact', head: true }).gte('created_at', today)
                    ]);
                    const todayReqEl = document.getElementById('todayNewRequests');
                    const todayConEl = document.getElementById('todayNewConcerns');
                    if (todayReqEl) todayReqEl.textContent = reqRes.count ?? 0;
                    if (todayConEl) todayConEl.textContent = conRes.count ?? 0;

                    // Pending approvals (borrowings)
                    const pendingEl = document.getElementById('overviewPendingList');
                    if (pendingEl) {
                        const { data: pendingReqs, error: pe } = await supabase
                            .from('borrowings')
                            .select('id, equipment, quantity, created_at, users(full_name)')
                            .eq('status', 'pending')
                            .order('created_at', { ascending: false })
                            .limit(5);
                        if (pe || !pendingReqs || pendingReqs.length === 0) {
                            pendingEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">No pending approvals</div>';
                        } else {
                            pendingEl.innerHTML = pendingReqs.map(r => {
                                const name = r.users?.full_name || 'Unknown';
                                const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                return \`<div style="padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f1f5f9;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:#0f2952;">\${name}</div>
                                        <div style="font-size:12px;color:#6b7280;">\${r.equipment || 'Equipment'} &times; \${r.quantity || 1}</div>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span style="font-size:11px;color:#6b7280;">\${date}</span>
                                        <span style="padding:2px 8px;border-radius:20px;background:#fef9c3;color:#854d0e;font-size:11px;font-weight:600;">Pending</span>
                                    </div>
                                </div>\`;
                            }).join('');
                        }
                    }

                    // Unresolved concerns
                    const concernsEl = document.getElementById('overviewConcernsList');
                    if (concernsEl) {
                        const { data: unresConcerns, error: ce } = await supabase
                            .from('concerns')
                            .select('id, title, category, status, created_at, users(full_name)')
                            .neq('status', 'resolved')
                            .order('created_at', { ascending: false })
                            .limit(5);
                        if (ce || !unresConcerns || unresConcerns.length === 0) {
                            concernsEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">No unresolved concerns</div>';
                        } else {
                            const statusColors = { 'pending': '#fef9c3|#854d0e', 'in-progress': '#dbeafe|#1d4ed8', 'open': '#fee2e2|#991b1b' };
                            concernsEl.innerHTML = unresConcerns.map(r => {
                                const name = r.users?.full_name || 'Unknown';
                                const date = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                const [bg, fg] = (statusColors[r.status] || '#f3f4f6|#374151').split('|');
                                return \`<div style="padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f1f5f9;">
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:#0f2952;">\${r.title || 'Concern'}</div>
                                        <div style="font-size:12px;color:#6b7280;">\${name} &bull; \${r.category || ''}</div>
                                    </div>
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <span style="font-size:11px;color:#6b7280;">\${date}</span>
                                        <span style="padding:2px 8px;border-radius:20px;background:\${bg};color:\${fg};font-size:11px;font-weight:600;text-transform:capitalize;">\${r.status}</span>
                                    </div>
                                </div>\`;
                            }).join('');
                        }
                    }

                    // System health
                    const dbStatusEl = document.getElementById('healthDbStatus');
                    const totalLogsEl = document.getElementById('healthTotalLogs');
                    const lastActivityEl = document.getElementById('healthLastActivity');
                    const { count: logCount, data: lastLogData } = await supabase
                        .from('audit_log')
                        .select('id, created_at', { count: 'exact' })
                        .order('created_at', { ascending: false })
                        .limit(1);
                    if (dbStatusEl) dbStatusEl.textContent = logCount !== null ? 'Connected' : 'Error';
                    if (dbStatusEl) dbStatusEl.style.color = logCount !== null ? '#16a34a' : '#dc2626';
                    if (totalLogsEl) totalLogsEl.textContent = logCount !== null ? logCount.toLocaleString() : '—';
                    if (lastActivityEl && lastLogData && lastLogData[0]) {
                        const d = new Date(lastLogData[0].created_at);
                        lastActivityEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    }

                    // Recent registrations
                    const recentUsersEl = document.getElementById('overviewRecentUsers');
                    if (recentUsersEl) {
                        const { data: recentUsers, error: rue } = await supabase
                            .from('users')
                            .select('id, full_name, username, created_at')
                            .neq('role', 'admin')
                            .order('created_at', { ascending: false })
                            .limit(3);
                        if (rue || !recentUsers || recentUsers.length === 0) {
                            recentUsersEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">No recent registrations</div>';
                        } else {
                            recentUsersEl.innerHTML = recentUsers.map(u => {
                                const initials = (u.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const date = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                return \`<div style="padding:10px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;">
                                    <div style="width:34px;height:34px;border-radius:50%;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">\${initials}</div>
                                    <div style="flex:1;min-width:0;">
                                        <div style="font-size:13px;font-weight:600;color:#0f2952;">\${u.full_name || 'Unknown'}</div>
                                        <div style="font-size:12px;color:#6b7280;">@\${u.username || ''}</div>
                                    </div>
                                    <span style="font-size:11px;color:#6b7280;flex-shrink:0;">\${date}</span>
                                </div>\`;
                            }).join('');
                        }
                    }
                } catch (err) {
                    console.error('loadOverviewPanels error:', err);
                }
            }
`;
            c = c.replace(insertBefore, fn + insertBefore);
            console.log('[HIT] loadOverviewPanels function inserted');
        }

        // ── 2b. Court Events section: add main page tabs + Schedule Overview tab content ──
        // Replace the page heading + existing filter area with a new tab structure
        const OLD_HEADING = `                        <!-- PAGE HEADING -->
                        <div style="margin-bottom:20px;">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                                <div>
                                    <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#1A3A6B;font-weight:600;margin:0 0 4px;display:flex;align-items:center;gap:6px;">
                                        <i class="bi bi-calendar-check-fill"></i> FACILITY MANAGEMENT
                                    </p>
                                    <h1 style="font-size:24px;font-weight:700;color:#1A1A2E;margin:0;">Facility Reservations</h1>
                                    <p style="color:#6B7280;font-size:13px;margin:4px 0 0;">Review, approve or reject resident reservation requests.</p>
                                </div>
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <button onclick="loadAdminBookings()" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:transparent;border:1px solid #1A3A6B;border-radius:6px;color:#1A3A6B;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:inherit;" onmouseover="this.style.background='#1A3A6B';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='#1A3A6B'">
                                        <i class="bi bi-arrow-clockwise"></i> Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- FILTER + SEARCH BAR -->
                        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;margin-bottom:16px;">
                            <div style="display:flex;gap:4px;padding:4px;background:#F3F4F6;border-radius:8px;width:fit-content;" id="courtBookingTabs">
                                <button class="cb-tab-btn cb-active" onclick="setCourtBookingTab('All', this)">All</button>
                                <button class="cb-tab-btn" onclick="setCourtBookingTab('Pending', this)">Pending</button>
                                <button class="cb-tab-btn" onclick="setCourtBookingTab('Approved', this)">Approved</button>
                                <button class="cb-tab-btn" onclick="setCourtBookingTab('Cancelled', this)">Cancelled / Rejected</button>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <select id="courtBookingVenueFilter" onchange="loadAdminBookings()" style="padding:8px 12px;border-radius:6px;border:1px solid #D1D5DB;outline:none;background:#fff;color:#1A1A2E;font-size:13px;font-family:inherit;cursor:pointer;transition:all 0.15s;" onfocus="this.style.borderColor='#1A3A6B';this.style.boxShadow='0 0 0 3px rgba(26,58,107,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow=''">
                                    <option value="all">All Venues</option>
                                    <option value="basketball">Basketball Court</option>
                                    <option value="multipurpose">Multi-Purpose Hall</option>
                                </select>
                                <div style="position:relative;">
                                    <i class="bi bi-search" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#6B7280;font-size:13px;pointer-events:none;"></i>
                                    <input type="text" id="courtBookingSearch" placeholder="Search resident..." oninput="loadAdminBookings()" style="padding:8px 12px 8px 34px;border-radius:6px;border:1px solid #D1D5DB;outline:none;background:#fff;color:#1A1A2E;font-size:13px;width:200px;font-family:inherit;transition:all 0.15s;" onfocus="this.style.borderColor='#1A3A6B';this.style.boxShadow='0 0 0 3px rgba(26,58,107,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow=''">
                                </div>
                            </div>
                        </div>`;

        const NEW_HEADING = `                        <!-- PAGE HEADING -->
                        <div style="margin-bottom:20px;">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                                <div>
                                    <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#2563eb;font-weight:600;margin:0 0 4px;display:flex;align-items:center;gap:6px;">
                                        <i class="bi bi-calendar-check-fill"></i> FACILITY MANAGEMENT
                                    </p>
                                    <h1 style="font-size:24px;font-weight:700;color:#0f2952;margin:0;">Court &amp; Facility Bookings</h1>
                                    <p style="color:#6B7280;font-size:13px;margin:4px 0 0;">Review, approve or reject resident reservation requests.</p>
                                </div>
                                <div style="display:flex;gap:8px;align-items:center;">
                                    <button onclick="loadAdminBookings()" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:transparent;border:1.5px solid #2563eb;border-radius:8px;color:#2563eb;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:inherit;" onmouseover="this.style.background='#2563eb';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='#2563eb'">
                                        <i class="bi bi-arrow-clockwise"></i> Refresh
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- MAIN PAGE TABS: Court Events / Schedule Overview -->
                        <div style="display:flex;gap:8px;margin-bottom:20px;">
                            <button id="courtMainTab-events" onclick="switchCourtMainTab('events')" style="display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;border:2px solid #2563eb;background:#2563eb;color:#fff;transition:all 0.2s;">
                                <i class="bi bi-calendar-event-fill"></i> Court Events
                            </button>
                            <button id="courtMainTab-schedule" onclick="switchCourtMainTab('schedule')" style="display:flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;border:2px solid #1e3a5f;background:transparent;color:#1e3a5f;transition:all 0.2s;">
                                <i class="bi bi-list-ul"></i> Schedule Overview
                            </button>
                        </div>

                        <!-- TAB PANEL: Court Events (existing table) -->
                        <div id="courtPanel-events">
                        <!-- FILTER + SEARCH BAR -->
                        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;margin-bottom:16px;">
                            <div style="display:flex;gap:4px;padding:4px;background:#F3F4F6;border-radius:8px;width:fit-content;" id="courtBookingTabs">
                                <button class="cb-tab-btn cb-active" onclick="setCourtBookingTab('All', this)">All</button>
                                <button class="cb-tab-btn" onclick="setCourtBookingTab('Pending', this)">Pending</button>
                                <button class="cb-tab-btn" onclick="setCourtBookingTab('Approved', this)">Approved</button>
                                <button class="cb-tab-btn" onclick="setCourtBookingTab('Cancelled', this)">Cancelled / Rejected</button>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <select id="courtBookingVenueFilter" onchange="loadAdminBookings()" style="padding:8px 12px;border-radius:6px;border:1px solid #D1D5DB;outline:none;background:#fff;color:#1A1A2E;font-size:13px;font-family:inherit;cursor:pointer;transition:all 0.15s;" onfocus="this.style.borderColor='#2563eb';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow=''">
                                    <option value="all">All Venues</option>
                                    <option value="basketball">Basketball Court</option>
                                    <option value="multipurpose">Multi-Purpose Hall</option>
                                </select>
                                <div style="position:relative;">
                                    <i class="bi bi-search" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#6B7280;font-size:13px;pointer-events:none;"></i>
                                    <input type="text" id="courtBookingSearch" placeholder="Search resident..." oninput="loadAdminBookings()" style="padding:8px 12px 8px 34px;border-radius:6px;border:1px solid #D1D5DB;outline:none;background:#fff;color:#1A1A2E;font-size:13px;width:200px;font-family:inherit;transition:all 0.15s;" onfocus="this.style.borderColor='#2563eb';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow=''">
                                </div>
                            </div>
                        </div>`;

        c = rep(c, OLD_HEADING, NEW_HEADING, 'Court Events: page heading + tab buttons');

        // ── 2c. Close the courtPanel-events div and add Schedule Overview panel ──
        // Find the closing of the existing table/pagination section (before the section close div)
        const OLD_PANEL_END = `                        <div id="courtBookingsPg" class="pg-controls" style="display:none;margin-top:16px;"></div>
                    </div> <!-- Closes court-bookings-section -->`;

        const NEW_PANEL_END = `                        <div id="courtBookingsPg" class="pg-controls" style="display:none;margin-top:16px;"></div>
                        </div><!-- end courtPanel-events -->

                        <!-- TAB PANEL: Schedule Overview -->
                        <div id="courtPanel-schedule" style="display:none;">
                            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;margin-bottom:16px;">
                                <div style="display:flex;gap:4px;padding:4px;background:#F3F4F6;border-radius:8px;width:fit-content;" id="scheduleOverviewTabs">
                                    <button class="cb-tab-btn cb-active" onclick="setScheduleFilter('all',this)">All</button>
                                    <button class="cb-tab-btn" onclick="setScheduleFilter('basketball',this)">Basketball Court</button>
                                    <button class="cb-tab-btn" onclick="setScheduleFilter('multipurpose',this)">Multi-Purpose Hall</button>
                                </div>
                                <div style="position:relative;">
                                    <i class="bi bi-search" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#6B7280;font-size:13px;pointer-events:none;"></i>
                                    <input type="text" id="scheduleSearch" placeholder="Search by resident or venue..." oninput="renderScheduleOverview()" style="padding:8px 12px 8px 34px;border-radius:6px;border:1px solid #D1D5DB;outline:none;background:#fff;color:#1A1A2E;font-size:13px;width:260px;font-family:inherit;transition:all 0.15s;" onfocus="this.style.borderColor='#2563eb';this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.12)'" onblur="this.style.borderColor='#D1D5DB';this.style.boxShadow=''">
                                </div>
                            </div>
                            <div id="scheduleOverviewList" style="display:flex;flex-direction:column;gap:10px;">
                                <div style="padding:40px;text-align:center;color:#94a3b8;font-size:14px;">Loading schedule...</div>
                            </div>
                            <div id="scheduleOverviewPg" class="pg-controls" style="display:none;margin-top:16px;"></div>
                        </div><!-- end courtPanel-schedule -->

                    </div> <!-- Closes court-bookings-section -->`;

        c = rep(c, OLD_PANEL_END, NEW_PANEL_END, 'Court Events: schedule overview panel');

        // ── 2d. Fix .cb-tab-btn.cb-active color from #1A3A6B to #2563eb ──
        c = rep(c,
            '.cb-tab-btn.cb-active { background:#1A3A6B;color:#fff;font-weight:600; }',
            '.cb-tab-btn.cb-active { background:#2563eb;color:#fff;font-weight:600; }',
            'cb-tab-btn active color'
        );

        return c;
    },
    'Admin: loadOverviewPanels + Court Events tabs'
);

// ─────────────────────────────────────────────
// 3. Add switchCourtMainTab + renderScheduleOverview JS functions to admin
// ─────────────────────────────────────────────
fixFile(
    'c:/Users/Kael/OneDrive/Documents/barangay-website/admin-portal/admin.html',
    c => {
        // Insert JS functions before loadCourtBookings
        const anchor = '\n            async function loadCourtBookings() {';
        if (!c.includes(anchor)) { console.log('[MISS] anchor for court tab JS'); return c; }

        const fns = `
            let _scheduleAllBookings = [];
            let _scheduleFilter = 'all';
            let _schedulePage = 1;
            const SCHEDULE_PER_PAGE = 10;

            function switchCourtMainTab(tab) {
                const eventsPanel = document.getElementById('courtPanel-events');
                const schedPanel = document.getElementById('courtPanel-schedule');
                const eventsBtn = document.getElementById('courtMainTab-events');
                const schedBtn = document.getElementById('courtMainTab-schedule');
                if (tab === 'events') {
                    if (eventsPanel) eventsPanel.style.display = '';
                    if (schedPanel) schedPanel.style.display = 'none';
                    if (eventsBtn) { eventsBtn.style.background = '#2563eb'; eventsBtn.style.color = '#fff'; eventsBtn.style.borderColor = '#2563eb'; }
                    if (schedBtn) { schedBtn.style.background = 'transparent'; schedBtn.style.color = '#1e3a5f'; schedBtn.style.borderColor = '#1e3a5f'; }
                } else {
                    if (eventsPanel) eventsPanel.style.display = 'none';
                    if (schedPanel) schedPanel.style.display = '';
                    if (schedBtn) { schedBtn.style.background = '#2563eb'; schedBtn.style.color = '#fff'; schedBtn.style.borderColor = '#2563eb'; }
                    if (eventsBtn) { eventsBtn.style.background = 'transparent'; eventsBtn.style.color = '#1e3a5f'; eventsBtn.style.borderColor = '#1e3a5f'; }
                    loadScheduleOverview();
                }
            }

            function setScheduleFilter(venue, btn) {
                _scheduleFilter = venue;
                _schedulePage = 1;
                document.querySelectorAll('#scheduleOverviewTabs .cb-tab-btn').forEach(b => b.classList.remove('cb-active'));
                if (btn) btn.classList.add('cb-active');
                renderScheduleOverview();
            }

            async function loadScheduleOverview() {
                const listEl = document.getElementById('scheduleOverviewList');
                if (!listEl) return;
                listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:14px;">Loading schedule...</div>';
                const { data, error } = await window.supabase
                    .from('facility_reservations')
                    .select('id, venue, date, start_time, end_time, purpose, status, created_at, users(full_name)')
                    .order('date', { ascending: true });
                if (error || !data) {
                    listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444;font-size:14px;">Failed to load schedule.</div>';
                    return;
                }
                _scheduleAllBookings = data;
                _schedulePage = 1;
                renderScheduleOverview();
            }

            function renderScheduleOverview() {
                const listEl = document.getElementById('scheduleOverviewList');
                const pgEl = document.getElementById('scheduleOverviewPg');
                if (!listEl) return;
                const search = (document.getElementById('scheduleSearch')?.value || '').toLowerCase();
                let items = _scheduleAllBookings.filter(b => {
                    const venueMatch = _scheduleFilter === 'all' || (b.venue || '').toLowerCase().includes(_scheduleFilter);
                    const searchMatch = !search ||
                        (b.users?.full_name || '').toLowerCase().includes(search) ||
                        (b.venue || '').toLowerCase().includes(search) ||
                        (b.purpose || '').toLowerCase().includes(search);
                    return venueMatch && searchMatch;
                });
                if (items.length === 0) {
                    listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:14px;">No bookings found.</div>';
                    if (pgEl) pgEl.style.display = 'none';
                    return;
                }
                const totalPages = Math.ceil(items.length / SCHEDULE_PER_PAGE);
                if (_schedulePage > totalPages) _schedulePage = 1;
                const page = items.slice((_schedulePage - 1) * SCHEDULE_PER_PAGE, _schedulePage * SCHEDULE_PER_PAGE);
                const statusColors = { approved: '#dcfce7|#166534', pending: '#fef9c3|#854d0e', cancelled: '#fee2e2|#991b1b', rejected: '#fee2e2|#991b1b' };
                listEl.innerHTML = page.map(b => {
                    const name = b.users?.full_name || 'Unknown';
                    const date = b.date ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                    const time = b.start_time && b.end_time ? b.start_time + ' – ' + b.end_time : b.start_time || '—';
                    const [bg, fg] = (statusColors[b.status] || '#f3f4f6|#374151').split('|');
                    const venueLabel = (b.venue || '').toLowerCase().includes('basketball') ? 'Basketball Court' : (b.venue || '').toLowerCase().includes('multi') ? 'Multi-Purpose Hall' : b.venue || 'Venue';
                    return \`<div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;display:flex;align-items:center;gap:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                        <div style="width:44px;height:44px;border-radius:10px;background:#eff6ff;color:#2563eb;display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0;font-family:inherit;">
                            <i class="bi bi-calendar3" style="font-size:18px;"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:14px;font-weight:700;color:#0f2952;">\${name}</div>
                            <div style="font-size:12px;color:#6b7280;margin-top:2px;">\${venueLabel} &bull; \${date} &bull; \${time}</div>
                            \${b.purpose ? '<div style="font-size:12px;color:#374151;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + b.purpose + '</div>' : ''}
                        </div>
                        <span style="padding:4px 12px;border-radius:20px;background:\${bg};color:\${fg};font-size:12px;font-weight:600;text-transform:capitalize;flex-shrink:0;">\${b.status}</span>
                    </div>\`;
                }).join('');
                // Pagination
                if (pgEl) {
                    if (totalPages <= 1) { pgEl.style.display = 'none'; return; }
                    pgEl.style.display = 'flex';
                    pgEl.innerHTML = '';
                    const mkBtn = (label, page, disabled, active) => {
                        const btn = document.createElement('button');
                        btn.innerHTML = label;
                        btn.style.cssText = \`padding:6px 12px;border-radius:6px;font-size:13px;font-weight:600;cursor:\${disabled?'default':'pointer'};font-family:inherit;border:1.5px solid \${active?'#2563eb':'#e2e8f0'};background:\${active?'#2563eb':'#fff'};color:\${active?'#fff':'#374151'};opacity:\${disabled?0.4:1};\`;
                        if (!disabled) btn.onclick = () => { _schedulePage = page; renderScheduleOverview(); };
                        return btn;
                    };
                    pgEl.appendChild(mkBtn('&laquo;', _schedulePage - 1, _schedulePage === 1, false));
                    for (let i = 1; i <= totalPages; i++) pgEl.appendChild(mkBtn(i, i, false, i === _schedulePage));
                    pgEl.appendChild(mkBtn('&raquo;', _schedulePage + 1, _schedulePage === totalPages, false));
                }
            }
`;
        c = c.replace(anchor, fns + anchor);
        console.log('[HIT] switchCourtMainTab + renderScheduleOverview functions inserted');
        return c;
    },
    'Admin: court tab JS functions'
);

// ─────────────────────────────────────────────
// 4. Syntax check
// ─────────────────────────────────────────────
const { execSync } = require('child_process');
['user-portal/user-dashboard.html', 'admin-portal/admin.html'].forEach(file => {
    const path = 'c:/Users/Kael/OneDrive/Documents/barangay-website/' + file;
    const c = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
    const lastScript = c.lastIndexOf('<script>');
    const closeScript = c.lastIndexOf('</script>');
    const js = c.substring(lastScript + 8, closeScript);
    const tmpFile = 'c:/Users/Kael/OneDrive/Documents/barangay-website/tmp-check.js';
    fs.writeFileSync(tmpFile, js, 'utf8');
    try {
        execSync('node --check "' + tmpFile + '"', { stdio: 'pipe' });
        console.log('[SYNTAX OK]', file);
    } catch (e) {
        console.error('[SYNTAX ERROR]', file, e.stderr?.toString() || e.message);
    }
    fs.unlinkSync(tmpFile);
});

console.log('\nAll done.');
