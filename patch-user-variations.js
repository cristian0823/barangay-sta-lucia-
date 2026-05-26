const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

// Add variation badge to equipment card
// Using string concatenation to avoid template literal evaluation
const OLD_DESC = '                            <p class="text-xs text-gray-200 font-medium drop-shadow-md line-clamp-2">' + '${item.description || \'No description available\'}</p>';
const NEW_DESC = '                            <p class="text-xs text-gray-200 font-medium drop-shadow-md line-clamp-2">' + '${item.description || \'No description available\'}</p>\n                            ' + "${item.variation ? '<span style=\"display:inline-block;margin-top:4px;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(255,255,255,0.2);color:#fff;\">' + item.variation + '</span>' : ''}";

let idx = c.indexOf(OLD_DESC);
if (idx === -1) { console.log('MISS variation badge:', JSON.stringify(OLD_DESC.substring(0, 80))); } else { c = c.substring(0, idx) + NEW_DESC + c.substring(idx + OLD_DESC.length); console.log('OK variation badge'); }

// =====================================================================
// Add Announcements panel HTML to user portal
// Insert before <!-- PANEL 7: HISTORY -->
// =====================================================================
const OLD_HIST_PANEL = '            <!-- PANEL 7: HISTORY -->';
const NEW_HIST_PANEL = `            <!-- PANEL: ANNOUNCEMENTS -->
            <div id="panel-announcements" class="content-panel">
                <div class="settings-hero" style="position:relative;background:linear-gradient(135deg,#0a1628 0%,#1e3a5f 50%,#0f4c2a 100%);border-radius:20px;padding:24px 28px;margin-bottom:24px;overflow:hidden;">
                    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:16px;">
                        <div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;"><i class="bi bi-megaphone-fill" style="color:#fdb913;"></i></div>
                        <div>
                            <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:3px;">Barangay Announcements</div>
                            <div style="font-size:13px;color:#cbd5e1;">Official bulletins and updates from Barangay Sta. Lucia.</div>
                        </div>
                    </div>
                </div>
                <div class="glass-card p-6 min-h-[400px]">
                    <div id="userAnnouncementsList" style="display:flex;flex-direction:column;gap:12px;">
                        <p class="text-gray-400 italic text-sm">Loading announcements...</p>
                    </div>
                </div>
            </div>

            <!-- PANEL 7: HISTORY -->`;

idx = c.indexOf(OLD_HIST_PANEL);
if (idx === -1) { console.log('MISS announcements panel'); } else { c = c.substring(0, idx) + NEW_HIST_PANEL + c.substring(idx + OLD_HIST_PANEL.length); console.log('OK announcements panel'); }

// =====================================================================
// Add Announcements sidebar nav item (desktop sidebar)
// Find the events nav link and add announcements after it
// =====================================================================
const OLD_EVENTS_NAV_AREA = "onclick=\"showPanel('events')\"";
const evIdx = c.indexOf(OLD_EVENTS_NAV_AREA);
console.log('events nav area idx:', evIdx);
if (evIdx !== -1) {
    // Find the end of the events <a> element (closing </a> tag)
    const closeAIdx = c.indexOf('</a>', evIdx);
    if (closeAIdx !== -1) {
        const annNavItem = '\n                    <a href="#" class="nav-link" onclick="showPanel(\'announcements\')">\n                        <i class="bi bi-megaphone-fill nav-icon"></i>\n                        <span>Announcements</span>\n                    </a>';
        c = c.substring(0, closeAIdx + 4) + annNavItem + c.substring(closeAIdx + 4);
        console.log('OK announcements nav link');
    }
}

// =====================================================================
// Add loadUserAnnouncements function
// =====================================================================
const OLD_LOAD_EVENTS = 'async function loadEventsView() {';
const NEW_LOAD_EVENTS = `async function loadUserAnnouncements() {
            const listEl = document.getElementById('userAnnouncementsList');
            if (!listEl) return;
            const supabase = window.supabase;
            if (!supabase) { listEl.innerHTML = '<p class="text-gray-400 italic text-sm">Unavailable.</p>'; return; }
            try {
                const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(30);
                if (error) throw error;
                const now = new Date();
                const active = (data || []).filter(a => !a.expires_at || new Date(a.expires_at) >= now);
                if (active.length === 0) {
                    listEl.innerHTML = '<div style="text-align:center;padding:48px 20px;"><div style="font-size:40px;margin-bottom:12px;">&#128226;</div><p style="font-size:16px;font-weight:700;color:#374151;margin:0 0 6px;">Walang bagong anunsyo</p><p style="font-size:13px;color:#9CA3AF;">Check back soon for updates from Barangay Sta. Lucia.</p></div>';
                    return;
                }
                const catColors = { General:'#1e3a5f', Health:'#dc2626', Infrastructure:'#d97706', Events:'#16a34a', Safety:'#7c3aed' };
                listEl.innerHTML = active.map(a => {
                    const cat = a.category || 'General';
                    const color = catColors[cat] || '#1e3a5f';
                    const dateStr = new Date(a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    return '<div style="background:#fff;border:1.5px solid #e2e8f0;border-left:4px solid ' + color + ';border-radius:12px;padding:16px 20px;dark:border-gray-700;">'
                        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">'
                        + '<span style="font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:' + color + '18;color:' + color + ';border:1px solid ' + color + '33;">' + cat + '</span>'
                        + '<span style="font-size:11px;color:#9CA3AF;margin-left:auto;">' + dateStr + '</span></div>'
                        + '<h4 style="font-size:15px;font-weight:700;color:#0f2952;margin:0 0 6px;">' + (a.title || '') + '</h4>'
                        + '<p style="font-size:13px;color:#374151;margin:0;line-height:1.6;white-space:pre-wrap;">' + (a.content || '') + '</p></div>';
                }).join('');
            } catch(e) {
                listEl.innerHTML = '<p class="text-gray-400 italic text-sm">Announcements unavailable (table may not exist yet).</p>';
            }
        }

        async function loadEventsView() {`;

idx = c.indexOf(OLD_LOAD_EVENTS);
if (idx === -1) { console.log('MISS loadUserAnnouncements'); } else { c = c.substring(0, idx) + NEW_LOAD_EVENTS + c.substring(idx + OLD_LOAD_EVENTS.length); console.log('OK loadUserAnnouncements'); }

// Call loadUserAnnouncements when panel shown - hook into showPanel
const OLD_SHOW_PANEL = "function showPanel(panelId) {";
const spIdx = c.indexOf(OLD_SHOW_PANEL);
console.log('showPanel idx:', spIdx);
if (spIdx !== -1) {
    // Find next line after function declaration
    const nlIdx = c.indexOf('\n', spIdx);
    const ANN_HOOK = "\n            if (panelId === 'announcements') { setTimeout(loadUserAnnouncements, 50); }";
    c = c.substring(0, nlIdx) + ANN_HOOK + c.substring(nlIdx);
    console.log('OK announcements panel hook');
}

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done user portal variations + announcements');
