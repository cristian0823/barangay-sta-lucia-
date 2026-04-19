const fs = require('fs');

// Start from the known-good base
let html = fs.readFileSync('admin.html', 'utf8');
console.log('Starting from clean admin.html (' + html.length + ' bytes)');

// ═══ STEP 1: Bootstrap Icons - Swap CDN to local ═══════════════════════════
html = html.replace(
  '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">',
  '<link rel="stylesheet" href="css/bootstrap-icons/bootstrap-icons.min.css">'
);

// ═══ STEP 2: Fix missing emojis in Overview cards ══════════════════════════
html = html.replace(
  'linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"></div>',
  'linear-gradient(135deg,#fef3c7,#fde68a);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">⚡</div>'
);
html = html.replace(
  'linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;"></div>',
  'linear-gradient(135deg,#dcfce7,#bbf7d0);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">📋</div>'
);

// ═══ STEP 3: Add pagination CSS ════════════════════════════════════════════
const paginationCSS = `
        /* ── Pagination + Filter Controls ── */
        .pg-controls { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid var(--border,#e2e8f0); flex-wrap:wrap; gap:8px; }
        .pg-info { font-size:13px; color:var(--muted,#6b7280); }
        .pg-btns { display:flex; gap:6px; align-items:center; }
        .pg-btn { padding:6px 14px; border:1.5px solid var(--border,#e2e8f0); border-radius:8px; background:var(--surface,#fff); color:var(--text,#1e293b); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .pg-btn:hover:not(:disabled) { background:var(--green-50,#f0fdf4); border-color:var(--green,#059669); color:var(--green,#059669); }
        .pg-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .pg-btn.pg-active { background:var(--green,#059669); border-color:var(--green,#059669); color:#fff; }
        .filter-bar { display:flex; align-items:center; gap:10px; padding:12px 20px; border-bottom:1px solid var(--border,#e2e8f0); flex-wrap:wrap; }
        .filter-bar select { padding:7px 12px; border:1.5px solid var(--border,#e2e8f0); border-radius:8px; background:var(--surface,#fff); color:var(--text,#1e293b); font-size:13px; outline:none; }
        .filter-bar select:focus { border-color:var(--green,#059669); }
        .filter-label { font-size:13px; font-weight:600; color:var(--muted,#6b7280); white-space:nowrap; }
`;
html = html.replace('        .eq-icon {', paginationCSS + '\n        .eq-icon {');

// ═══ STEP 4: Add concern filter bar ════════════════════════════════════════
const concernFilterStr = `<div class="filter-bar"><span class="filter-label">Filter:</span><select id="concernStatusFilter" onchange="applyConcernFilter()"><option value="all">All Status</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>`;
const cHeaderIdx = html.indexOf('<h3>Citizen Concerns</h3>');
if (cHeaderIdx > -1) {
    const scIdx = html.indexOf('<div class="section-content"', cHeaderIdx);
    const tableDiv = html.indexOf('<div class="admin-tables">', scIdx);
    if (tableDiv > -1) {
        html = html.substring(0, tableDiv) + concernFilterStr + "\n                                " + html.substring(tableDiv);
        console.log('Step 4 done: concern filter bar added');
    }
}

// ═══ STEP 5: Add pagination div containers after each table ════════════════
const tIdMap = {
    'concernsTable': 'concernsPg',
    'usersTable': 'usersPg',
    'activityLogTable': 'activityLogPg',
    'requestsTable': 'requestsPg',
    'courtBookingsTable': 'courtBookingsPg',
    'multipurposeBookingsTable': 'multipurposePg'
};
Object.keys(tIdMap).forEach(tid => {
    const srch = '<tbody id="' + tid + '"></tbody>\n                                </table>';
    const srchCRLF = '<tbody id="' + tid + '"></tbody>\r\n                                </table>';
    const srchTblEnd = '<tbody id="' + tid + '"></tbody>\n                            </table>';
    const srchTblEndCRLF = '<tbody id="' + tid + '"></tbody>\r\n                            </table>';
    
    const ins = '\n                                <div id="' + tIdMap[tid] + '" class="pg-controls" style="display:none;"></div>';
    
    if (html.includes(srch)) html = html.replace(srch, srch + ins);
    else if (html.includes(srchCRLF)) html = html.replace(srchCRLF, srchCRLF + ins);
    else if (html.includes(srchTblEnd)) html = html.replace(srchTblEnd, srchTblEnd + ins);
    else if (html.includes(srchTblEndCRLF)) html = html.replace(srchTblEndCRLF, srchTblEndCRLF + ins);
    else console.log('WARN Step 5 missing: ' + tid);
});

// ═══ STEP 6: Inject pagination JS engine + all render functions ════════════
const paginationJS = `

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
                    return '<tr data-cid="'+c.id+'" onclick="openConcernRespond('+c.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\\'rgba(16,185,129,0.06)\\'" onmouseout="this.style.background=\\'\\\\'">'
                        +'<td><div style="line-height:1.3;">'+dot+'<strong>'+(c.userName||'')+'</strong><br><small style="color:#6b7280;font-size:11px;">'+dt+'</small></div></td>'
                        +'<td style="font-size:12px;color:#6b7280;">'+(c.address||'')+'</td>'
                        +'<td>'+(c.category||'')+'</td>'
                        +'<td>'+(c.title||'')+resp+img+'</td>'
                        +'<td style="font-size:12px;">'+date+'</td>'
                        +'<td>'+badge+'</td>'
                        +'<td></td>'
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
                    return '<tr data-req-id="'+b.id+'" onclick="openRequestRespond('+b.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\\'rgba(16,185,129,0.06)\\'" onmouseout="this.style.background=\\'\\\\'">'
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
                    return '<tr data-bid="'+b.id+'" onclick="openBookingRespond('+b.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\\'rgba(16,185,129,0.06)\\'" onmouseout="this.style.background=\\'\\\\'">'
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
                    return '<tr data-bid="'+b.id+'" onclick="openBookingRespond('+b.id+')" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\\'rgba(16,185,129,0.06)\\'" onmouseout="this.style.background=\\'\\\\'">'
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
`;

if (html.includes('let _allActivityLogs = [];')) {
    html = html.replace('let _allActivityLogs = [];', 'let _allActivityLogs = [];\n' + paginationJS);
} else { console.log('WARN Step 6: _allActivityLogs not found'); }

// ═══ STEP 7: Patch renderActivityTable to slice for pagination ═════════════
const actStart = html.indexOf('tbody.innerHTML = filtered.map(log => {');
if (actStart > -1) {
    const srchEnd = "}).join('');";
    const srchEndCRLF = "}).join('');";
    let actEnd = html.indexOf(srchEnd, actStart);
    if (actEnd > -1) {
        html = html.replace(
            'tbody.innerHTML = filtered.map(log => {',
            'const _pgActivityTotal = filtered.length;\n                filtered = filtered.slice((_pgActivityPage-1)*PG_SIZE, _pgActivityPage*PG_SIZE);\n                tbody.innerHTML = filtered.map(log => {'
        );
        html = html.substring(0, actEnd + srchEnd.length) + "\n                renderPg('activityLogPg', (_pgActivityTotal||0), PG_SIZE, _pgActivityPage, 'gotoActivityPage');\n" + html.substring(actEnd + srchEnd.length);
        console.log('Step 7 done: activity log pagination patched');
    } else {
        console.log('WARN Step 7: actEnd string not found');
    }
} else { console.log('WARN Step 7: actStart string not found'); }

// ═══ STEP 8: Store data in pagination state after each load function ════════
const tR = [
    { s: 'tbody.innerHTML = users.map(u => {', r: '_pgUsersList = users;\n                _pgUsersPage = 1;\n                tbody.innerHTML = users.map(u => {' },
    { s: 'tbody.innerHTML = concerns.map(c => {', r: '_pgConcernsList = concerns;\n                    _pgConcernsPage = 1;\n                    tbody.innerHTML = concerns.map(c => {' },
    { s: '_allAdminRequestsList = borrowings;\r\n                container.innerHTML = borrowings.map(b => {', r: '_allAdminRequestsList = borrowings;\r\n                _pgReqList = borrowings;\r\n                _pgReqPage = 1;\r\n                container.innerHTML = borrowings.map(b => {' },
    { s: '_allAdminRequestsList = borrowings;\n                container.innerHTML = borrowings.map(b => {', r: '_allAdminRequestsList = borrowings;\n                _pgReqList = borrowings;\n                _pgReqPage = 1;\n                container.innerHTML = borrowings.map(b => {' },
    { s: 'tbody.innerHTML = mpBookings.map(b => {', r: '_pgMpList = mpBookings;\n                _pgMpPage = 1;\n                tbody.innerHTML = mpBookings.map(b => {' },
    { s: "tbody.innerHTML = allBookings.map(b => {\r\n                    const statusColors = {\r\n                        pending: { bg: '#fef9c3'", r: "_pgCourtList = allBookings;\r\n                _pgCourtPage = 1;\r\n                tbody.innerHTML = allBookings.map(b => {\r\n                    const statusColors = {\r\n                        pending: { bg: '#fef9c3'" },
    { s: "tbody.innerHTML = allBookings.map(b => {\n                    const statusColors = {\n                        pending: { bg: '#fef9c3'", r: "_pgCourtList = allBookings;\n                _pgCourtPage = 1;\n                tbody.innerHTML = allBookings.map(b => {\n                    const statusColors = {\n                        pending: { bg: '#fef9c3'" }
];

tR.forEach(t => {
    if (html.includes(t.s)) html = html.replace(t.s, t.r);
});

const joinsMap = {
    "users": {
        regex: /(tbody\.innerHTML = users\.map(?:[\s\S]*?)}\)\.join\(''\);)(\r?\n\s*}\r?\n\s*\/\/\s*BATCH UPLOAD FUNCTIONS)/,
        rep: "$1\n                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');$2"
    },
    "concerns": {
        regex: /(tbody\.innerHTML = concerns\.map(?:[\s\S]*?)}\)\.join\(''\);)(\r?\n\s*} catch \(e\) {)/,
        rep: "$1\n                    renderConcernsPg();$2"
    },
    "requests": {
        regex: /(container\.innerHTML = borrowings\.map(?:[\s\S]*?)}\)\.join\(''\);)(\r?\n\s*}\r?\n\s*async function loadCourtBookings\(\))/,
        rep: "$1\n                renderPg('requestsPg', _pgReqList.length, PG_SIZE, _pgReqPage, 'gotoRequestsPage');$2"
    },
    "mpBookings": {
        regex: /(tbody\.innerHTML = mpBookings\.map(?:[\s\S]*?)}\)\.join\(''\);)(\r?\n\s*}\r?\n\s*async function loadAdminBookings\(\))/,
        rep: "$1\n                renderPg('multipurposePg', _pgMpList.length, PG_SIZE, _pgMpPage, 'gotoMpPage');$2"
    }
};

for (const [k, obj] of Object.entries(joinsMap)) {
    if (obj.regex.test(html)) {
        html = html.replace(obj.regex, obj.rep);
        console.log('Step 8: Join injected for ' + k);
    } else {
        console.log('WARN Step 8: Join not found for ' + k);
    }
}

fs.writeFileSync('admin.html', html);
const h2 = fs.readFileSync('admin.html', 'utf8');

const vm = require('vm');
const scriptMatches = [...h2.matchAll(/<script>([\s\S]*?)<\/script>/g)];
let errors = 0;
scriptMatches.forEach((match, index) => {
    try {
        new vm.Script(match[1]);
        console.log('Script ' + index + ' parses OK.');
    } catch (e) {
        console.error('Script ' + index + ' syntax error:', e.message);
        errors++;
    }
});

const checks = [
    'css/bootstrap-icons', '⚡', '📋',
    'renderPg(', 'gotoUsersPage', 'gotoConcernsPage', 'gotoCourtPage', 'gotoMpPage', 'gotoRequestsPage', 'gotoActivityPage',
    'applyConcernFilter', 'concernsPg', 'usersPg', 'courtBookingsPg', 'multipurposePg', 'requestsPg', 'activityLogPg',
    '_pgUsersList = users', '_pgMpList = mpBookings', '_pgCourtList = allBookings',
    '_pgConcernsList = concerns', '_pgReqList = borrowings'
];
let ok=0, fail=0;
checks.forEach(k => { if(h2.includes(k)) ok++; else { console.log('MISSING: '+k); fail++; } });
console.log('RESULT: ' + ok + ' OK, ' + fail + ' MISSING, ' + errors + ' JS Errors');
