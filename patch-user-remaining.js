const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

// =====================================================================
// 1. STOCK THRESHOLDS — read from localStorage instead of hardcoded 40/75
// =====================================================================
const OLD_THRESH = `                if (pct === 0)       { color = 'bg-gray-400';   statusColor = 'text-gray-500';   statusBg = 'bg-gray-50';   statusIcon = '<i class="bi bi-x-circle-fill"></i>'; }
                else if (pct < 40)   { color = 'bg-red-500';    statusColor = 'text-red-600';    statusBg = 'bg-red-50';    statusIcon = '<i class="bi bi-exclamation-triangle-fill"></i>'; }
                else if (pct < 75)   { color = 'bg-amber-400';  statusColor = 'text-amber-600';  statusBg = 'bg-amber-50';  statusIcon = '<i class="bi bi-dash-circle-fill"></i>'; }
                else                 { color = 'bg-green-500';  statusColor = 'text-green-600';  statusBg = 'bg-green-50';  statusIcon = '<i class="bi bi-check-circle-fill"></i>'; }`;

const NEW_THRESH = `                const _t = JSON.parse(localStorage.getItem('brgy_stock_thresholds') || '{"high":75,"low":40}');
                if (pct === 0)               { color = 'bg-gray-400';   statusColor = 'text-gray-500';   statusBg = 'bg-gray-50';   statusIcon = '<i class="bi bi-x-circle-fill"></i>'; }
                else if (pct < _t.low)       { color = 'bg-red-500';    statusColor = 'text-red-600';    statusBg = 'bg-red-50';    statusIcon = '<i class="bi bi-exclamation-triangle-fill"></i>'; }
                else if (pct < _t.high)      { color = 'bg-amber-400';  statusColor = 'text-amber-600';  statusBg = 'bg-amber-50';  statusIcon = '<i class="bi bi-dash-circle-fill"></i>'; }
                else                         { color = 'bg-green-500';  statusColor = 'text-green-600';  statusBg = 'bg-green-50';  statusIcon = '<i class="bi bi-check-circle-fill"></i>'; }`;

let idx = c.indexOf(OLD_THRESH);
if (idx === -1) { console.log('MISS #1 stock thresholds'); } else { c = c.substring(0, idx) + NEW_THRESH + c.substring(idx + OLD_THRESH.length); console.log('OK #1'); }

// =====================================================================
// 2. TIME-AGO helper + notification formatting (#9)
// =====================================================================
const OLD_BELL_FUNC = `        function renderBellNotifications(notifs) {`;
const NEW_BELL_FUNC = `        function timeAgo(isoStr) {
            if (!isoStr) return 'Just now';
            const diff = Date.now() - new Date(isoStr).getTime();
            const mins = Math.floor(diff / 60000);
            if (mins < 1) return 'Just now';
            if (mins < 60) return mins + 'm ago';
            const hrs = Math.floor(mins / 60);
            if (hrs < 24) return hrs + 'h ago';
            const days = Math.floor(hrs / 24);
            if (days < 7) return days + 'd ago';
            return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        function renderBellNotifications(notifs) {`;

idx = c.indexOf(OLD_BELL_FUNC);
if (idx === -1) { console.log('MISS #2a bell func'); } else { c = c.substring(0, idx) + NEW_BELL_FUNC + c.substring(idx + OLD_BELL_FUNC.length); console.log('OK #2a'); }

const OLD_TIME_STR = `                const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now';`;
const NEW_TIME_STR = `                const timeStr = n.createdAt ? timeAgo(n.createdAt) : 'Just now';`;

idx = c.indexOf(OLD_TIME_STR);
if (idx === -1) { console.log('MISS #2b timeStr'); } else { c = c.substring(0, idx) + NEW_TIME_STR + c.substring(idx + OLD_TIME_STR.length); console.log('OK #2b'); }

// =====================================================================
// 3. HISTORY TOTAL COUNT (#11) — add count badge + update renderHistory
// =====================================================================
const OLD_HIST_HEADER = `                    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <select id="historyFilter" onchange="currentPageHistory = 1; renderHistory()" class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold shadow-sm w-full md:w-auto">
                            <option value="all">All Activities</option>
                            <option value="borrowing">Borrowings</option>
                            <option value="concern">Concerns</option>
                            <option value="facility reservation">Facility Reservations</option>
                        </select>
                        <button onclick="loadHistoryView()" style="padding:8px 20px;background:#1e3a5f;color:#fff;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;display:flex;align-items:center;gap:6px;font-family:inherit;transition:all 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#1e3a5f'">
                            <i class="bi bi-arrow-repeat"></i> Refresh Log
                        </button>
                    </div>`;

const NEW_HIST_HEADER = `                    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <select id="historyFilter" onchange="currentPageHistory = 1; renderHistory()" class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold shadow-sm">
                                <option value="all">All Activities</option>
                                <option value="borrowing">Borrowings</option>
                                <option value="concern">Concerns</option>
                                <option value="facility reservation">Facility Reservations</option>
                            </select>
                            <span id="historyCountBadge" style="font-size:12px;font-weight:700;color:#6b7280;white-space:nowrap;"></span>
                        </div>
                        <button onclick="loadHistoryView()" style="padding:8px 20px;background:#1e3a5f;color:#fff;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;display:flex;align-items:center;gap:6px;font-family:inherit;transition:all 0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#1e3a5f'">
                            <i class="bi bi-arrow-repeat"></i> Refresh Log
                        </button>
                    </div>`;

idx = c.indexOf(OLD_HIST_HEADER);
if (idx === -1) { console.log('MISS #3 history header'); } else { c = c.substring(0, idx) + NEW_HIST_HEADER + c.substring(idx + OLD_HIST_HEADER.length); console.log('OK #3'); }

// Update renderHistory to update count badge
const OLD_RENDER_HISTORY_FILTER = `            let filtered = allHistoryData;
            if (filterVal !== 'all') {
                filtered = allHistoryData.filter(a => a.type.toLowerCase() === filterVal);
            }`;

const NEW_RENDER_HISTORY_FILTER = `            let filtered = allHistoryData;
            if (filterVal !== 'all') {
                filtered = allHistoryData.filter(a => a.type.toLowerCase() === filterVal);
            }
            const _countBadge = document.getElementById('historyCountBadge');
            if (_countBadge) {
                if (filtered.length === 0) { _countBadge.textContent = ''; }
                else { _countBadge.textContent = filtered.length + ' total'; }
            }`;

idx = c.indexOf(OLD_RENDER_HISTORY_FILTER);
if (idx === -1) { console.log('MISS #3b renderHistory filter'); } else { c = c.substring(0, idx) + NEW_RENDER_HISTORY_FILTER + c.substring(idx + OLD_RENDER_HISTORY_FILTER.length); console.log('OK #3b'); }

// =====================================================================
// 4. EVENTS EMPTY STATE (#8) — friendlier message with Filipino text
// =====================================================================
const OLD_EVENTS_EMPTY = `            if (filtered.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px 20px;">'
                    + '<div style="width:72px;height:72px;background:rgba(30,58,95,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 16px;">'
                    + '<i class="bi bi-calendar-x" style="color:#1e3a5f;"></i></div>'
                    + '<p style="font-size:16px;font-weight:700;color:#0f1f3d;margin:0 0 6px;">No events found</p>'
                    + '<p style="font-size:13px;color:#94a3b8;margin:0;">No upcoming events in this category.</p></div>';`;

const NEW_EVENTS_EMPTY = `            if (filtered.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:56px 20px;">'
                    + '<div style="width:80px;height:80px;background:rgba(30,58,95,0.07);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:36px;margin:0 auto 18px;border:2px dashed rgba(30,58,95,0.15);">'
                    + '<i class="bi bi-calendar2-heart" style="color:#1e3a5f;"></i></div>'
                    + '<p style="font-size:17px;font-weight:800;color:#0f1f3d;margin:0 0 6px;">Walang upcoming events sa ngayon</p>'
                    + '<p style="font-size:13px;color:#94a3b8;margin:0 0 0;">Abangan ang mga susunod na aktibidad ng Barangay Sta. Lucia!</p></div>';`;

idx = c.indexOf(OLD_EVENTS_EMPTY);
if (idx === -1) { console.log('MISS #4 events empty'); } else { c = c.substring(0, idx) + NEW_EVENTS_EMPTY + c.substring(idx + OLD_EVENTS_EMPTY.length); console.log('OK #4'); }

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done writing user-dashboard.html');
