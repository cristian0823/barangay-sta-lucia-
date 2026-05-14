const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

let count = 0;
function rep(old, neo, label) {
  const idx = c.indexOf(old);
  if (idx === -1) { console.log('MISS: ' + (label||old.substring(0,80))); return; }
  c = c.substring(0, idx) + neo + c.substring(idx + old.length);
  count++;
  console.log('OK: ' + (label||old.substring(0,60)));
}

// ==============================
// 1. REMOVE DESKTOP DARK MODE BUTTON
// ==============================
rep(
  '<button onclick="toggleDarkMode()" id="darkModeBtn" title="Toggle Dark Mode" class="dark-mode-toggle w-[38px] h-[38px] flex items-center justify-center rounded-xl transition-all duration-200 text-lg" style="border:1.5px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.08);color:#fff;"><i class="bi bi-moon-fill"></i></button>',
  '',
  'remove desktop dark mode btn'
);

// ==============================
// 2. REMOVE MOBILE DARK MODE BUTTON
// ==============================
rep(
  '<button class="mobile-header-btn dark-mode-toggle" onclick="toggleDarkMode()" id="mobileDarkModeBtn" title="Toggle Dark Mode"><i class="bi bi-moon-fill"></i></button>',
  '',
  'remove mobile dark mode btn'
);

// ==============================
// 3. FIX PENDING CONCERNS STAT CARD (gold → blue)
// ==============================
rep(
  'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 10px 28px rgba(253,185,19,0.18)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.05)\'">\n                        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#FDB913;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(253,185,19,0.1);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#d97706;"><i class="bi bi-megaphone-fill"></i></div>',
  'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 10px 28px rgba(30,58,95,0.13)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.05)\'">\n                        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#1e3a5f;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(30,58,95,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1e3a5f;"><i class="bi bi-megaphone-fill"></i></div>',
  'pending concerns card gold→blue'
);

// ==============================
// 4. FIX UPCOMING RESERVATIONS STAT CARD (dark navy → consistent blue)
// ==============================
rep(
  'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 10px 28px rgba(15,31,61,0.12)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.05)\'">\n                        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#0f1f3d;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(15,31,61,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#0f1f3d;"><i class="bi bi-calendar-check-fill"></i></div>',
  'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 10px 28px rgba(30,58,95,0.13)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.05)\'">\n                        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#1e3a5f;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(30,58,95,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1e3a5f;"><i class="bi bi-calendar-check-fill"></i></div>',
  'reservations card navy→blue'
);

// ==============================
// 5. FIX TOTAL REQUESTS STAT CARD (red → blue)
// ==============================
rep(
  '<div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#CE1126;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(206,17,38,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#CE1126;"><i class="bi bi-clipboard2-data-fill"></i></div>\n                            <span style="font-size:10px;font-weight:700;color:#CE1126;background:rgba(206,17,38,0.08);padding:2px 8px;border-radius:20px;">ALL-TIME</span>',
  '<div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#1e3a5f;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(30,58,95,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1e3a5f;"><i class="bi bi-clipboard2-data-fill"></i></div>\n                            <span style="font-size:10px;font-weight:700;color:#1e3a5f;background:rgba(30,58,95,0.08);padding:2px 8px;border-radius:20px;">ALL-TIME</span>',
  'total requests card red→blue'
);

// ==============================
// 6. REMOVE QUICK SERVICES + STATUS SUMMARY ROW
// ==============================
// Remove from "<!-- Quick Services -->" up to (but not including) the last closing "</div>" before PANEL 2
const QS_START = '                <!-- Quick Services -->\n';
const QS_END = '            </div>\n\n            <!-- PANEL 2: EQUIPMENT -->';
const qsStart = c.indexOf(QS_START);
const qsEnd = c.indexOf(QS_END);
if (qsStart !== -1 && qsEnd !== -1) {
  c = c.substring(0, qsStart) + '            </div>\n\n            <!-- PANEL 2: EQUIPMENT -->' + c.substring(qsEnd + QS_END.length);
  count++;
  console.log('OK: removed Quick Services + Status Summary Row');
} else {
  console.log('MISS: Quick Services block (qsStart=' + qsStart + ', qsEnd=' + qsEnd + ')');
}

// ==============================
// 7. ADD PAGINATION ROW FOR BORROWING HISTORY
// ==============================
rep(
  '<div id="myBorrowingsList" style="display:flex;flex-direction:column;gap:12px;">\n                        <p style="color:#9ca3af;font-style:italic;font-size:13px;text-align:center;padding:40px 0;">No borrowing history yet.</p>\n                    </div>\n                </div>\n            </div>',
  '<div id="myBorrowingsList" style="display:flex;flex-direction:column;gap:12px;">\n                        <p style="color:#9ca3af;font-style:italic;font-size:13px;text-align:center;padding:40px 0;">No borrowing history yet.</p>\n                    </div>\n                    <div id="borrowingPaginationRow" style="margin-top:16px;"></div>\n                </div>\n            </div>',
  'add borrowingPaginationRow'
);

// ==============================
// 8. ADD PAGINATION LOGIC TO loadMyBorrowingsList
// ==============================
rep(
  `async function loadMyBorrowingsList() {
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
            container.innerHTML = sorted.map(b => {`,
  `let _borrowingsAllSorted = [];
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
            container.innerHTML = sorted.map(b => {`,
  'loadMyBorrowingsList pagination'
);

// Fix the end of loadMyBorrowingsList - add pagination rendering after the map().join('')
rep(
  `}).join('');
        }

        // ==========================================
        // BORROW MODAL LOGIC`,
  `}).join('');
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
        // BORROW MODAL LOGIC`,
  'borrowings pagination render'
);

// ==============================
// 9. CHANGE _CONCERNS_PER_PAGE from 5 to 2
// ==============================
rep('const _CONCERNS_PER_PAGE = 5;', 'const _CONCERNS_PER_PAGE = 2;', 'concerns per page 5→2');

// ==============================
// 10. UPDATE CONCERNS PAGINATION BUTTON COLORS (amber → blue)
// ==============================
rep(
  "';background:'+(isActive?'#f5a623':'var(--input-bg)')+';color:'+(isActive?'#fff':'var(--text-muted)')+';font-size:13px;font-weight:'+(isActive?'800':'600')+';cursor:pointer;min-width:36px;'>'+p+'</button>'",
  "';background:'+(isActive?'#1e3a5f':'var(--input-bg)')+';color:'+(isActive?'#fff':'var(--text-muted)')+';font-size:13px;font-weight:'+(isActive?'800':'600')+';cursor:pointer;min-width:36px;'>'+p+'</button>'",
  'concerns pagination active color amber→blue'
);

// Also fix the border color for active
rep(
  "border:1px solid '+(isActive?'#f5a623':'var(--border-color)')",
  "border:1px solid '+(isActive?'#1e3a5f':'var(--border-color)')",
  'concerns pagination border amber→blue'
);

// ==============================
// 11. EVENTS PANEL REDESIGN
// ==============================
rep(
  `<!-- PANEL 5: EVENTS -->
            <div id="panel-events" class="content-panel">
                <div class="mb-8 border-b pb-6" style="border-color: var(--border-color);">
                    <h2 class="text-3xl font-extrabold text-slate-700 mb-2"><i class="bi bi-calendar-event-fill mr-2"></i>Upcoming Court Events</h2>
                    <p style="color: var(--text-muted);">Official barangay activities and tournaments.</p>
                </div>
                <div id="upcomingEventsContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;"></div>
            </div>`,
  `<!-- PANEL 5: EVENTS -->
            <div id="panel-events" class="content-panel">
                <!-- Header -->
                <div class="mb-5 border-b pb-5" style="border-color:var(--border-color);">
                    <h2 style="font-size:26px;font-weight:800;color:#0f1f3d;margin:0 0 4px 0;"><i class="bi bi-calendar-event-fill" style="margin-right:8px;"></i>Barangay Events</h2>
                    <p style="color:var(--text-muted);font-size:14px;margin:0;">Official barangay activities, tournaments, and community programs.</p>
                </div>
                <!-- Category Filter Tabs -->
                <div id="eventsCategoryRow" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
                    <button onclick="filterEventsCategory('all')" id="evcat-all" class="evcat-btn" style="padding:7px 18px;border-radius:20px;border:1.5px solid #1e3a5f;background:#1e3a5f;color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;">All</button>
                    <button onclick="filterEventsCategory('sports')" id="evcat-sports" class="evcat-btn" style="padding:7px 18px;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;">Sports</button>
                    <button onclick="filterEventsCategory('community')" id="evcat-community" class="evcat-btn" style="padding:7px 18px;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;">Community</button>
                    <button onclick="filterEventsCategory('health')" id="evcat-health" class="evcat-btn" style="padding:7px 18px;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;">Health</button>
                    <button onclick="filterEventsCategory('others')" id="evcat-others" class="evcat-btn" style="padding:7px 18px;border-radius:20px;border:1.5px solid #e2e8f0;background:#fff;color:#64748b;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;">Others</button>
                </div>
                <div id="upcomingEventsContainer" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.25rem;margin-bottom:16px;"></div>
                <div id="eventsPaginationRow" style="margin-top:8px;"></div>
            </div>`,
  'events panel redesign'
);

// ==============================
// 12. UPDATE loadEventsView WITH CATEGORY FILTER + PAGINATION
// ==============================
rep(
  `// ==========================================
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
                const m24 = t.match(/^(\\d{1,2}):(\\d{2})$/);
                const m12 = t.match(/(\\d{1,2}):(\\d{2})\\s*(AM|PM)/i);
                if (m24) return parseInt(m24[1]) * 60 + parseInt(m24[2]);
                if (m12) { let h = parseInt(m12[1]); const m = parseInt(m12[2]); if (m12[3].toUpperCase()==='PM'&&h<12) h+=12; if (m12[3].toUpperCase()==='AM'&&h===12) h=0; return h*60+m; }
                return null;
            }
            const upcoming = events.filter(e => {
                if (!e.date) return false;
                if (e.date > todayStr) return true;
                if (e.date < todayStr) return false;
                // Today  only show if end_time hasn't passed
                const endMins = _parseTimeMins(e.end_time || e.endTime);
                if (endMins === null) return true;
                return nowMins < endMins;
            });
            if (upcoming.length === 0) { container.innerHTML = '<div class="col-span-full py-10 text-center"><p class="text-gray-500">No upcoming events.</p></div>'; return; }
            upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
            container.innerHTML = upcoming.map(e => {
                const timeStr = e.end_time ? fmt12(e.time) + ' - ' + fmt12(e.end_time) : fmt12(e.time);
                return '<div class="bg-gradient-to-br from-slate-500 to-emerald-700 rounded-2xl p-6 text-white shadow-xl transform transition hover:-translate-y-1 hover:shadow-2xl">' +
                    '<div class="flex justify-between items-start mb-4"><span class="bg-white text-slate-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide">Official Event</span></div>' +
                    '<h3 class="text-2xl font-black mb-1 line-clamp-2">' + e.title + '</h3>' +
                    '<p class="text-slate-100 font-medium mb-4 text-sm flex items-center gap-1">&#128205; ' + e.location + '</p>' +
                    '<div class="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/20">' +
                    '<div class="flex items-center gap-2 mb-2"><span class="font-bold">' + formatDate(e.date) + '</span></div>' +
                    '<div class="flex items-center gap-2 mb-2"><span class="font-bold">' + timeStr + '</span></div>' +
                    '<div class="flex items-center gap-2' + (e.capacity || e.description ? ' mb-2' : '') + '"><span class="text-sm">By ' + e.organizer + '</span></div>' +
                    (e.capacity ? '<div class="flex items-center gap-2 mb-2"><span class="text-sm font-bold text-slate-100"> Capacity: ' + e.capacity + ' max</span></div>' : '') +
                    ''  +
                    '</div></div>';
            }).join('');
        }

        // Auto-remove expired events every 60 seconds
        setInterval(loadEventsView, 60000);`,
  `// ==========================================
        // 5. EVENTS
        // ==========================================
        let _eventsAllUpcoming = [];
        let _eventsCurrentCategory = 'all';
        let _eventsCurrentPage = 1;
        const _EVENTS_PER_PAGE = 6;

        function _parseTimeMins(t) {
            if (!t) return null;
            const m24 = t.match(/^(\\d{1,2}):(\\d{2})$/);
            const m12 = t.match(/(\\d{1,2}):(\\d{2})\\s*(AM|PM)/i);
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
                    + 'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 10px 28px rgba(15,31,61,0.12)\'" '
                    + 'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 12px rgba(15,31,61,0.06)\'">'
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
        setInterval(loadEventsView, 60000);`,
  'events loadEventsView redesign'
);

// ==============================
// 13. CONCERNS FORM: LIGHTER CARD HEADER
// ==============================
rep(
  '<div style="background:linear-gradient(135deg,#0f1f3d,#1a3a6b);padding:16px 20px;border-bottom:1px solid #e2e8f0;">\n                            <h3 style="font-size:14px;font-weight:800;color:#fff;margin:0;"><i class="bi bi-pencil-square mr-2"></i>New Report</h3>\n                            <p style="font-size:11px;color:rgba(245,166,35,0.9);margin:4px 0 0 0;">Please provide details about your concern.</p>\n                        </div>',
  '<div style="background:#f8fafc;padding:16px 20px;border-bottom:1px solid #e2e8f0;">\n                            <h3 style="font-size:14px;font-weight:800;color:#0f1f3d;margin:0;"><i class="bi bi-pencil-square" style="margin-right:8px;color:#1e3a5f;"></i>New Report</h3>\n                            <p style="font-size:11px;color:#64748b;margin:4px 0 0 0;">Please provide details about your concern.</p>\n                        </div>',
  'concerns form header lighter'
);

// ==============================
// 14. CONCERNS SUBMIT BUTTON: amber → blue
// ==============================
rep(
  '<button type="submit" id="submitConcernBtn" class="w-full mt-2 font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer border-none" style="background:#f59e0b;color:#fff;">',
  '<button type="submit" id="submitConcernBtn" class="w-full mt-2 font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer border-none" style="background:#1e3a5f;color:#fff;">',
  'concerns submit btn amber→blue'
);

// ==============================
// 15. CONCERNS TAB BUTTONS: amber → blue
// ==============================
rep(
  '<button id="tab-btn-concern-form" onclick="switchConcernTab(\'form\')"\n        style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #f59e0b;background:#f59e0b;color:#fff;transition:all 0.2s;font-family:inherit;">',
  '<button id="tab-btn-concern-form" onclick="switchConcernTab(\'form\')"\n        style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #1e3a5f;background:#1e3a5f;color:#fff;transition:all 0.2s;font-family:inherit;">',
  'concern tab btn active amber→blue'
);

// ==============================
// 16. CONCERN TAB SWITCH FUNCTION: update active colors
// ==============================
// Find switchConcernTab and update the amber colors
rep(
  "btnForm.style.background = '#f59e0b'; btnForm.style.color = '#fff'; btnForm.style.borderColor = '#f59e0b';",
  "btnForm.style.background = '#1e3a5f'; btnForm.style.color = '#fff'; btnForm.style.borderColor = '#1e3a5f';",
  'switchConcernTab form active amber→blue'
);
rep(
  "btnHistory.style.background = '#f59e0b'; btnHistory.style.color = '#fff'; btnHistory.style.borderColor = '#f59e0b';",
  "btnHistory.style.background = '#1e3a5f'; btnHistory.style.color = '#fff'; btnHistory.style.borderColor = '#1e3a5f';",
  'switchConcernTab history active amber→blue'
);

// ==============================
// 17. FACILITY CALENDAR LEGEND AS PILLS
// ==============================
rep(
  '<div class="flex justify-center flex-wrap gap-5 pt-4 border-t text-xs font-semibold" style="border-color: var(--border-color); color: var(--text-muted);">\n                            <div class="flex items-center gap-1.5"><div class="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></div>Available</div>\n                            <div class="flex items-center gap-1.5"><div class="w-3 h-3 bg-slate-100 border border-slate-300 rounded"></div>Brgy Event</div>\n                            <div class="flex items-center gap-1.5"><div class="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>Booked</div>\n                            <div class="flex items-center gap-1.5"><div class="w-3 h-3 bg-gray-200 rounded"></div>Past</div>\n                        </div>',
  '<div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px;padding-top:14px;border-top:1px solid var(--border-color);">\n                            <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;">&#9679; Available</span>\n                            <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#dbeafe;color:#1e3a5f;border:1px solid #bfdbfe;">&#9679; Brgy Event</span>\n                            <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;">&#9679; Booked</span>\n                            <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;background:#f3f4f6;color:#9ca3af;border:1px solid #e5e7eb;">&#9679; Past</span>\n                        </div>',
  'facility calendar legend as pills'
);

// ==============================
// SAVE
// ==============================
fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('\nDone! ' + count + ' changes applied.');
