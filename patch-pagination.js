const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// ─── STEP 0: Swap Bootstrap Icons CDN to local ─────────────────────────────
html = html.replace(
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">',
  '<link rel="stylesheet" href="css/bootstrap-icons/bootstrap-icons.min.css">'
);

// ─── STEP 1: Fix missing emojis ─────────────────────────────────────────────
html = html.replace(
  'linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"></div>',
  'linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">⚡</div>'
);
html = html.replace(
  'linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"></div>',
  'linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">📋</div>'
);

// ─── STEP 2: Inject pagination CSS before `.eq-icon {` ──────────────────────
const paginationCSS = `
        /* ── Pagination + Filter Controls ── */
        .pg-controls { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid var(--border,#e2e8f0); flex-wrap:wrap; gap:8px; }
        .pg-info { font-size:13px; color:var(--muted,#6b7280); }
        .pg-btns { display:flex; gap:6px; align-items:center; }
        .pg-btn { padding:6px 14px; border:1.5px solid var(--border,#e2e8f0); border-radius:8px; background:var(--surface,#fff); color:var(--text,#1e293b); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .pg-btn:hover:not(:disabled) { background:var(--green-50,#f0fdf4); border-color:var(--green,#059669); color:var(--green,#059669); }
        .pg-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .pg-btn.pg-active { background:var(--green,#059669); border-color:var(--green,#059669); color:#fff; }
        .filter-bar { display:flex; align-items:center; gap:10px; padding:12px 20px 12px; border-bottom:1px solid var(--border,#e2e8f0); flex-wrap:wrap; }
        .filter-bar select, .filter-bar input[type="text"] { padding:7px 12px; border:1.5px solid var(--border,#e2e8f0); border-radius:8px; background:var(--surface,#fff); color:var(--text,#1e293b); font-size:13px; outline:none; }
        .filter-bar select:focus { border-color:var(--green,#059669); }
        .filter-label { font-size:13px; font-weight:600; color:var(--muted,#6b7280); white-space:nowrap; }
`;
html = html.replace('        .eq-icon {', paginationCSS + '\n        .eq-icon {');

// ─── STEP 3: Add filter bar + pagination placeholders to Concerns section ─────
html = html.replace(
  `<div class="section-content" style="padding: 0;">
                            <div class="admin-tables">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Citizen</th>
                                            <th>Address</th>`,
  `<div class="section-content" style="padding: 0;">
                            <div class="filter-bar">
                                <span class="filter-label">Filter:</span>
                                <select id="concernStatusFilter" onchange="applyConcernFilter()">
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div class="admin-tables">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Citizen</th>
                                            <th>Address</th>`
);
html = html.replace(
  `<tbody id="concernsTable"></tbody>
                                 </table>
                             </div>
                         </div>
                     </div>

                     <div id="events-section"`,
  `<tbody id="concernsTable"></tbody>
                                 </table>
                                 <div id="concernsPg" class="pg-controls" style="display:none;"></div>
                             </div>
                         </div>
                     </div>

                     <div id="events-section"`
);

// ─── STEP 4: Add pagination divs to other tables ─────────────────────────────
// Equipment requests table
html = html.replace(
  '<tbody id="requestsTable"></tbody>',
  '<tbody id="requestsTable"></tbody>'
);
// Insert pagination after the closing </table> of requestsTable
html = html.replace(
  `<tbody id="requestsTable"></tbody>
                                 </table>
                                 <div id="noRequests" class="empty-state">`,
  `<tbody id="requestsTable"></tbody>
                                 </table>
                                 <div id="requestsPg" class="pg-controls" style="display:none;"></div>
                                 <div id="noRequests" class="empty-state">`
);

// Court Bookings table
html = html.replace(
  `<tbody id="courtBookingsTable"></tbody>
                                 </table>
                                 <div id="noCourtBookings" class="empty-state" style="display:none;">`,
  `<tbody id="courtBookingsTable"></tbody>
                                 </table>
                                 <div id="courtBookingsPg" class="pg-controls" style="display:none;"></div>
                                 <div id="noCourtBookings" class="empty-state" style="display:none;">`
);

// Multipurpose Hall table
html = html.replace(
  `<tbody id="multipurposeBookingsTable"></tbody>
                                 </table>
                                 <div id="noMultipurposeBookings" class="empty-state" style="display:none;">`,
  `<tbody id="multipurposeBookingsTable"></tbody>
                                 </table>
                                 <div id="multipurposePg" class="pg-controls" style="display:none;"></div>
                                 <div id="noMultipurposeBookings" class="empty-state" style="display:none;">`
);

// Users table
html = html.replace(
  `<tbody id="usersTable"></tbody>
                                 </table>
                                 <div id="noUsers" class="empty-state" style="display: none;">`,
  `<tbody id="usersTable"></tbody>
                                 </table>
                                 <div id="usersPg" class="pg-controls" style="display:none;"></div>
                                 <div id="noUsers" class="empty-state" style="display: none;">`
);

// Activity Log table
html = html.replace(
  `<tbody id="activityLogTable"></tbody>
                                 </table>
                                 <div id="noActivityLog" class="empty-state"`,
  `<tbody id="activityLogTable"></tbody>
                                 </table>
                                 <div id="activityLogPg" class="pg-controls" style="display:none;"></div>
                                 <div id="noActivityLog" class="empty-state"`
);

// ─── STEP 5: Inject master pagination JS block right after `let _allActivityLogs = [];`
const paginationJS = `

            // ═══ PAGINATION ENGINE ════════════════════════════════════════════
            const PG_SIZE = 8;
            let _usersPage = 1, _allUsersList = [];
            let _concernsPage = 1, _allConcernsList = [], _concernFilter = 'all';
            let _requestsPage = 1, _allRequestsList = [];
            let _courtPage = 1, _allCourtList = [];
            let _mpPage = 1, _allMpList = [];
            let _activityPage = 1;

            function renderPagination(containerId, total, perPage, currentPage, gotoFn) {
                const el = document.getElementById(containerId);
                if (!el) return;
                const totalPages = Math.ceil(total / perPage);
                if (totalPages <= 1) { el.style.display = 'none'; return; }
                el.style.display = 'flex';
                const start = (currentPage - 1) * perPage + 1;
                const end = Math.min(currentPage * perPage, total);
                let btns = '';
                for (let p = 1; p <= totalPages; p++) {
                    if (totalPages > 7 && p > 2 && p < totalPages - 1 && Math.abs(p - currentPage) > 1) {
                        if (p === 3 || p === totalPages - 2) btns += '<span style="color:var(--muted,#9ca3af);padding:0 2px;">…</span>';
                        continue;
                    }
                    btns += '<button class="pg-btn' + (p === currentPage ? ' pg-active' : '') + '" onclick="' + gotoFn + '(' + p + ')">' + p + '</button>';
                }
                el.innerHTML =
                    '<span class="pg-info">Showing ' + start + '–' + end + ' of ' + total + ' records</span>' +
                    '<div class="pg-btns">' +
                        '<button class="pg-btn" onclick="' + gotoFn + '(' + (currentPage - 1) + ')"' + (currentPage <= 1 ? ' disabled' : '') + '>‹ Prev</button>' +
                        btns +
                        '<button class="pg-btn" onclick="' + gotoFn + '(' + (currentPage + 1) + ')"' + (currentPage >= totalPages ? ' disabled' : '') + '>Next ›</button>' +
                    '</div>';
            }

            // ── Users ──────────────────────────────────────────────────────────
            function gotoUsersPage(p) { _usersPage = p; renderUsersPage(); }
            function renderUsersPage() {
                const tbody = document.getElementById('usersTable');
                const emptyState = document.getElementById('noUsers');
                const pgEl = document.getElementById('usersPg');
                if (!tbody) return;
                if (!_allUsersList.length) {
                    tbody.innerHTML = '';
                    if (emptyState) emptyState.style.display = 'block';
                    if (pgEl) pgEl.style.display = 'none';
                    return;
                }
                if (emptyState) emptyState.style.display = 'none';
                const slice = _allUsersList.slice((_usersPage - 1) * PG_SIZE, _usersPage * PG_SIZE);
                tbody.innerHTML = slice.map(u => {
                    const displayName = u.fullName || u.full_name || u.username || '';
                    const phone = u.phone || u.contact_number || u.contactNumber || '';
                    return '<tr>' +
                        '<td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">' + (u.barangay_id || '') + '</td>' +
                        '<td style="white-space:nowrap;"><strong>' + displayName + '</strong></td>' +
                        '<td style="font-size:13px;">' + phone + '</td>' +
                        '<td style="font-size:13px;color:#6b7280;">' + (u.email || '') + '</td>' +
                        '<td style="font-size:12px;">' + (u.address || '') + '</td>' +
                    '</tr>';
                }).join('');
                renderPagination('usersPg', _allUsersList.length, PG_SIZE, _usersPage, 'gotoUsersPage');
            }

            // ── Concerns ───────────────────────────────────────────────────────
            function applyConcernFilter() {
                _concernFilter = document.getElementById('concernStatusFilter')?.value || 'all';
                _concernsPage = 1;
                renderConcernsPage();
            }
            function gotoConcernsPage(p) { _concernsPage = p; renderConcernsPage(); }
            function renderConcernsPage() {
                const tbody = document.getElementById('concernsTable');
                if (!tbody) return;
                const statusColors = {
                    open: { bg: '#fef9c3', color: '#854d0e' },
                    'in-progress': { bg: '#dbeafe', color: '#1e40af' },
                    resolved: { bg: '#dcfce7', color: '#166534' },
                    closed: { bg: '#f1f5f9', color: '#475569' }
                };
                let filtered = _concernFilter === 'all' ? [..._allConcernsList] : _allConcernsList.filter(c => c.status === _concernFilter);
                if (!filtered.length) {
                    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af;"> No concerns found</td></tr>';
                    const pg = document.getElementById('concernsPg'); if (pg) pg.style.display = 'none';
                    return;
                }
                const slice = filtered.slice((_concernsPage - 1) * PG_SIZE, _concernsPage * PG_SIZE);
                tbody.innerHTML = slice.map(c => {
                    const sc = statusColors[c.status] || { bg: '#f1f5f9', color: '#374151' };
                    const badge = '<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:' + sc.bg + ';color:' + sc.color + ';">' + (c.status || 'open') + '</span>';
                    const submittedAt = c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
                    const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                    const isUnread = !c.adminRead;
                    const unreadDot = isUnread ? '<span style="display:inline-block;width:8px;height:8px;background:#ef4444;border-radius:50%;margin-right:6px;vertical-align:middle;"></span>' : '';
                    return '<tr data-cid="' + c.id + '" style="cursor:pointer;' + (isUnread ? 'font-weight:600;' : '') + '" onclick="openConcernRespond(' + c.id + ')">' +
                        '<td><div style="line-height:1.3;">' + unreadDot + '<strong>' + (c.userName || '') + '</strong><br><small style="color:#6b7280;font-size:11px;font-weight:400;">' + submittedAt + '</small></div></td>' +
                        '<td style="font-size:12px;color:#6b7280;">' + (c.address || c.location || '') + '</td>' +
                        '<td>' + (c.category || '') + '</td>' +
                        '<td>' + (c.title || '') + '</td>' +
                        '<td style="font-size:12px;">' + date + '</td>' +
                        '<td>' + badge + '</td>' +
                        '<td style="font-size:12px;max-width:120px;">' + (c.adminComment ? '<span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;display:block;">' + c.adminComment + '</span>' : '') + '</td>' +
                        '<td><button class="btn btn-small btn-primary" onclick="event.stopPropagation();openConcernRespond(' + c.id + ')">Respond</button></td>' +
                    '</tr>';
                }).join('');
                renderPagination('concernsPg', filtered.length, PG_SIZE, _concernsPage, 'gotoConcernsPage');
            }

            // ── Equipment Requests ──────────────────────────────────────────────
            function gotoRequestsPage(p) { _requestsPage = p; renderRequestsPage(); }
            function renderRequestsPage() {
                const tbody = document.getElementById('requestsTable');
                const noEl = document.getElementById('noRequests');
                if (!tbody) return;
                if (!_allRequestsList.length) {
                    tbody.innerHTML = '';
                    if (noEl) noEl.style.display = 'block';
                    const pg = document.getElementById('requestsPg'); if(pg) pg.style.display='none';
                    return;
                }
                if (noEl) noEl.style.display = 'none';
                const slice = _allRequestsList.slice((_requestsPage - 1) * PG_SIZE, _requestsPage * PG_SIZE);
                tbody.innerHTML = slice.map(b => {
                    const submittedAt = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Unknown';
                    const residentDisplay = '<div style="line-height:1.2;"><strong>' + (b.userName || '') + '</strong><br><small style="color:#6b7280;font-size:11px;">' + submittedAt + '</small></div>';
                    return '<tr data-req-id="' + b.id + '" onclick="openRequestRespond(' + b.id + ')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'rgba(16,185,129,0.06)\'" onmouseout="this.style.background=\'\'">' +
                        '<td>' + residentDisplay + '</td>' +
                        '<td><strong style="color:var(--text);">' + (b.equipment || '') + '</strong></td>' +
                        '<td style="font-weight:bold;color:var(--text);">' + (b.quantity || 1) + '</td>' +
                        '<td style="white-space:nowrap;color:var(--muted);">' + (b.borrowDate || '') + '<br>to ' + (b.returnDate || '') + '</td>' +
                        '<td style="color:var(--text);">' + (b.purpose || '') + '</td>' +
                        '<td>' + getStatusBadge(b.status) + '</td>' +
                    '</tr>';
                }).join('');
                renderPagination('requestsPg', _allRequestsList.length, PG_SIZE, _requestsPage, 'gotoRequestsPage');
            }

            // ── Court Bookings ────────────────────────────────────────────────
            function gotoCourtPage(p) { _courtPage = p; renderCourtPage(); }
            function renderCourtPage() {
                const tbody = document.getElementById('courtBookingsTable');
                const empty = document.getElementById('noCourtBookings');
                if (!tbody) return;
                if (!_allCourtList.length) {
                    tbody.innerHTML = '';
                    if (empty) empty.style.display = 'block';
                    const pg = document.getElementById('courtBookingsPg'); if(pg) pg.style.display='none';
                    return;
                }
                if (empty) empty.style.display = 'none';
                const slice = _allCourtList.slice((_courtPage - 1) * PG_SIZE, _courtPage * PG_SIZE);
                const statusColors = { pending:{bg:'#fef9c3',color:'#854d0e'}, approved:{bg:'#dcfce7',color:'#166534'}, booked:{bg:'#dcfce7',color:'#166534'}, rejected:{bg:'#fee2e2',color:'#991b1b'}, cancelled:{bg:'#f1f5f9',color:'#475569'} };
                tbody.innerHTML = slice.map(b => {
                    const sc = statusColors[b.status] || { bg: '#f1f5f9', color: '#374151' };
                    const badge = '<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:' + sc.bg + ';color:' + sc.color + ';">' + b.status + '</span>';
                    const subAt = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
                    return '<tr data-bid="' + b.id + '" style="cursor:pointer;" onclick="openBookingModal(' + b.id + ')">' +
                        '<td>' + (b.userName || b.user_name || b.username || '') + '</td>' +
                        '<td>' + (b.venueName || b.venue_name || (b.venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall') || '') + '</td>' +
                        '<td>' + (b.date || '') + '</td>' +
                        '<td style="font-size:12px;">' + (b.timeRange || b.time || '') + '</td>' +
                        '<td style="font-size:12px;">' + (b.purpose || '') + '</td>' +
                        '<td>' + badge + '</td>' +
                        '<td style="font-size:12px;">' + subAt + '</td>' +
                    '</tr>';
                }).join('');
                renderPagination('courtBookingsPg', _allCourtList.length, PG_SIZE, _courtPage, 'gotoCourtPage');
            }

            // ── Multi-Purpose ─────────────────────────────────────────────────
            function gotoMpPage(p) { _mpPage = p; renderMpPage(); }
            function renderMpPage() {
                const tbody = document.getElementById('multipurposeBookingsTable');
                const empty = document.getElementById('noMultipurposeBookings');
                if (!tbody) return;
                if (!_allMpList.length) {
                    tbody.innerHTML = '';
                    if (empty) empty.style.display = 'block';
                    const pg = document.getElementById('multipurposePg'); if(pg) pg.style.display='none';
                    return;
                }
                if (empty) empty.style.display = 'none';
                const slice = _allMpList.slice((_mpPage - 1) * PG_SIZE, _mpPage * PG_SIZE);
                const statusColors = { pending:{bg:'#fef9c3',color:'#854d0e'}, approved:{bg:'#dcfce7',color:'#166534'}, rejected:{bg:'#fee2e2',color:'#991b1b'}, cancelled:{bg:'#f1f5f9',color:'#475569'} };
                tbody.innerHTML = slice.map(b => {
                    const sc = statusColors[b.status] || { bg: '#f1f5f9', color: '#374151' };
                    const badge = '<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:' + sc.bg + ';color:' + sc.color + ';">' + b.status + '</span>';
                    const subAt = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
                    return '<tr data-bid="' + b.id + '" style="cursor:pointer;" onclick="openBookingModal(' + b.id + ')">' +
                        '<td>' + (b.userName || b.user_name || b.username || '') + '</td>' +
                        '<td>' + (b.date || '') + '</td>' +
                        '<td style="font-size:12px;">' + (b.timeRange || b.time || '') + '</td>' +
                        '<td style="font-size:12px;">' + (b.purpose || '') + '</td>' +
                        '<td>' + badge + '</td>' +
                        '<td style="font-size:12px;">' + subAt + '</td>' +
                        '<td class="action-btns"><button class="btn btn-small btn-primary" onclick="event.stopPropagation();openBookingModal(' + b.id + ')">Review</button></td>' +
                    '</tr>';
                }).join('');
                renderPagination('multipurposePg', _allMpList.length, PG_SIZE, _mpPage, 'gotoMpPage');
            }

            // ── Activity Log ──────────────────────────────────────────────────
            function gotoActivityPage(p) { _activityPage = p; renderActivityTable(); }
`;
html = html.replace(
  '            let _allActivityLogs = [];',
  '            let _allActivityLogs = [];\n' + paginationJS
);

// ─── STEP 6: Patch renderActivityTable to use pagination ──────────────────────
html = html.replace(
  '                tbody.innerHTML = filtered.map(log => {',
  '                const _activityTotal = filtered.length;\n                filtered = filtered.slice((_activityPage-1)*PG_SIZE, _activityPage*PG_SIZE);\n                tbody.innerHTML = filtered.map(log => {'
);
html = html.replace(
  `                }).join('');
             }

             async function loadActivityLog()`,
  `                }).join('');
                renderPagination('activityLogPg', _activityTotal, PG_SIZE, _activityPage, 'gotoActivityPage');
             }

             async function loadActivityLog()`
);

// ─── STEP 7: Patch loadUsers to store list then call renderUsersPage ──────────
html = html.replace(
  `                let users = await getAllUsers();
                users = users.filter(u => u.role !== 'admin');

                if (users.length === 0) {
                    tbody.innerHTML = '';
                    if (emptyState) emptyState.style.display = 'block';
                    return;
                }`,
  `                let users = await getAllUsers();
                users = users.filter(u => u.role !== 'admin');
                _allUsersList = users;
                _usersPage = 1;
                renderUsersPage();
                return;
                // Legacy block below never runs (pagination above handles it)
                if (users.length === 0) { tbody.innerHTML = ''; }`
);

// ─── STEP 8: Patch loadConcerns to store list then call renderConcernsPage ────
html = html.replace(
  `                    _allAdminConcerns = concerns;

                    if (!concerns.length) {
                        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af;"> No concerns submitted yet</td></tr>';
                        return;
                    }

                    // Sort: unread first, then by date (oldest first for FCFS)
                    concerns.sort((a, b) => {`,
  `                    _allAdminConcerns = concerns;
                    // Sort: unread first, then by date (oldest first for FCFS)
                    concerns.sort((a, b) => {`
);
// Remove old concerns render block and replace with pagination call
html = html.replace(
  `                    const statusColors = {
                        open: { bg: '#fef9c3', color: '#854d0e' },
                        'in-progress': { bg: '#dbeafe', color: '#1e40af' },
                        resolved: { bg: '#dcfce7', color: '#166534' },
                        closed: { bg: '#f1f5f9', color: '#475569' }
                    };

                    tbody.innerHTML = concerns.map(c => {`,
  `                    _allConcernsList = concerns;
                    _concernsPage = 1;
                    renderConcernsPage();
                    // (pagination handles the render above) - legacy map block follows and should not execute
                    if (false) { const concerns2 = []; const statusColors = { open:{}, 'in-progress':{}, resolved:{}, closed:{} };
                    tbody.innerHTML = concerns2.map(c => {`
);

// ─── STEP 9: Patch loadAdminBookings to store list then call renderCourtPage ──
html = html.replace(
  `                empty.style.display = 'none';

                tbody.innerHTML = allBookings.map(b => {
                    const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        approved: { bg: '#dcfce7', color: '#166534' },
                        booked: { bg: '#dcfce7', color: '#166534' },
                        rejected: { bg: '#fee2e2', color: '#991b1b' },`,
  `                empty.style.display = 'none';
                _allCourtList = allBookings;
                _courtPage = 1;
                renderCourtPage();
                if (false) { const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        approved: { bg: '#dcfce7', color: '#166534' },
                        booked: { bg: '#dcfce7', color: '#166534' },
                        rejected: { bg: '#fee2e2', color: '#991b1b' },`
);

// ─── STEP 10: Patch loadMultipurposeBookings to store list then call renderMpPage
html = html.replace(
  `                tbody.innerHTML = mpBookings.map(b => {
                    const sc = statusColors[b.status] || { bg: '#f1f5f9', color: '#374151' };`,
  `                _allMpList = mpBookings;
                _mpPage = 1;
                renderMpPage();
                if (false) { const mpb = mpBookings[0]; const sc = statusColors[mpb && mpb.status] || { bg: '#f1f5f9', color: '#374151' };`
);

// ─── STEP 11: Patch loadRequests to store list then call renderRequestsPage ──
const oldLoadRequests = `            async function loadRequests() {
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
                container.innerHTML = borrowings.map(b => {`;

const newLoadRequests = `            async function loadRequests() {
                const borrowings = await getAllBorrowings();
                const noRequests = document.getElementById('noRequests');

                if (borrowings.length === 0) {
                    document.getElementById('requestsTable').innerHTML = '';
                    if (noRequests) noRequests.style.display = 'block';
                    const pg = document.getElementById('requestsPg'); if(pg) pg.style.display='none';
                    return;
                }
                if (noRequests) noRequests.style.display = 'none';

                // Pending first, then oldest within same status (FCFS)
                const _reqStatusPriority = s => s === 'pending' ? 0 : 1;
                borrowings.sort((a, b) => {
                    const sp = _reqStatusPriority(a.status) - _reqStatusPriority(b.status);
                    if (sp !== 0) return sp;
                    return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
                });

                _allAdminRequestsList = borrowings;
                _allRequestsList = borrowings;
                _requestsPage = 1;
                renderRequestsPage();
                if (false) { const b = borrowings[0];`;

if (html.includes(oldLoadRequests)) {
  html = html.replace(oldLoadRequests, newLoadRequests);
  console.log('loadRequests patched OK');
} else {
  console.log('WARNING: loadRequests original not found – manual patch may be needed');
}

fs.writeFileSync('admin.html', html);
console.log('All patches applied successfully!');

// Verify key functions are present
const checks = ['renderPagination', 'gotoUsersPage', 'gotoConcernsPage', 'gotoCourtPage', 'gotoMpPage', 'gotoRequestsPage', 'gotoActivityPage', 'applyConcernFilter', 'concernsPg', 'usersPg', 'courtBookingsPg', 'multipurposePg', 'requestsPg', 'activityLogPg'];
checks.forEach(k => {
  if (!html.includes(k)) console.log('MISSING: ' + k);
  else console.log('OK: ' + k);
});
