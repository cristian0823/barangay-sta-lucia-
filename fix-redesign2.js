const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

let count = 0;
function rep(old, neo, label) {
  const idx = c.indexOf(old);
  if (idx === -1) { console.log('MISS: ' + label); return false; }
  c = c.substring(0, idx) + neo + c.substring(idx + old.length);
  count++;
  console.log('OK: ' + label);
  return true;
}
function repAll(old, neo, label) {
  if (c.indexOf(old) === -1) { console.log('MISS(all): ' + label); return; }
  c = c.split(old).join(neo);
  count++;
  console.log('OK(all): ' + label);
}

// ============================================================
// 1. FACILITY MODAL COLORS — green → blue
// ============================================================

// Day schedule modal header (green gradient → blue)
rep(
  'class="bg-gradient-to-br from-slate-50 to-emerald-500 p-6 relative flex-shrink-0">\n                <button onclick="closeDayScheduleModal()" class="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-0 text-white w-8 h-8 rounded-full text-lg cursor-pointer flex items-center justify-center transition"><i class="bi bi-x-lg"></i></button>',
  'style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;position:relative;flex-shrink:0;">\n                <button onclick="closeDayScheduleModal()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.background=\'rgba(255,255,255,0.25)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.15)\'"><i class="bi bi-x-lg"></i></button>',
  'day schedule modal header green→blue'
);

// "Add Facility Reservation" button inside day schedule modal (green gradient → blue)
rep(
  'class="w-full py-3 bg-gradient-to-r from-slate-50 to-emerald-700 hover:from-slate-50 hover:to-emerald-800 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 border-none cursor-pointer">\n                        <span> Add Facility Reservation</span>',
  'style="width:100%;padding:12px;background:#2563eb;color:#fff;font-weight:700;border-radius:12px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;font-size:14px;transition:all 0.2s;" onmouseover="this.style.background=\'#1d4ed8\'" onmouseout="this.style.background=\'#2563eb\'">\n                        <i class="bi bi-plus-circle-fill"></i><span>Add Facility Reservation</span>',
  'Add Facility Reservation btn green→blue'
);

// Add booking modal header (green gradient → blue) - dsBookingModal
rep(
  'class="bg-gradient-to-br from-slate-50 to-emerald-500 p-6 relative flex-shrink-0">\n            <button onclick="closeDsBookingModal()" type="button" class="absolute top-4 right-4 bg-white/20 hover:bg-white/30 border-0 text-white w-8 h-8 rounded-full text-lg cursor-pointer flex items-center justify-center transition"></button>',
  'style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:24px;position:relative;flex-shrink:0;">\n            <button onclick="closeDsBookingModal()" type="button" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;color:#fff;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.background=\'rgba(255,255,255,0.25)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.15)\'">&#10005;</button>',
  'dsBookingModal header green→blue'
);

// Confirm Reservation button (green gradient → blue solid)
rep(
  'class="w-full py-3 bg-gradient-to-r from-slate-500 to-emerald-600 hover:from-slate-50 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-md border-none cursor-pointer">\n                         Confirm Reservation',
  'style="width:100%;padding:12px;background:#2563eb;color:#fff;font-weight:700;border-radius:12px;border:none;cursor:pointer;font-family:inherit;font-size:14px;transition:all 0.2s;" onmouseover="this.style.background=\'#1d4ed8\'" onmouseout="this.style.background=\'#2563eb\'">\n                        <i class="bi bi-check-circle-fill" style="margin-right:6px;"></i> Confirm Reservation',
  'Confirm Reservation btn green→blue'
);

// Form focus rings: emerald-400 → blue-500
repAll('focus:ring-emerald-400', 'focus:ring-blue-500', 'form focus ring emerald→blue');
repAll('focus:ring-emerald-500', 'focus:ring-blue-500', 'form focus ring emerald-500→blue');

// ============================================================
// 2. VENUE TOGGLE BUTTONS — fix visibility
// ============================================================
// HTML: sel-basketball active (navy), sel-multipurpose inactive (clean outlined)
rep(
  '<button onclick="switchVenue(\'basketball\')" id="sel-basketball" class="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-all border-none cursor-pointer transform hover:scale-105 active:scale-95" style="background:#0f1f3d;"><i class="bi bi-dribbble mr-2"></i>Basketball Court</button>\n                            <button onclick="switchVenue(\'multipurpose\')" id="sel-multipurpose" class="px-6 py-2.5 rounded-xl font-bold text-sm bg-transparent transition-all border-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" style="color:var(--text-muted);"><i class="bi bi-building mr-2"></i>Multi-Purpose Hall</button>',
  '<button onclick="switchVenue(\'basketball\')" id="sel-basketball" style="padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#fff;background:#1e3a5f;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;"><i class="bi bi-dribbble"></i>Basketball Court</button>\n                            <button onclick="switchVenue(\'multipurpose\')" id="sel-multipurpose" style="padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#1e3a5f;background:#fff;border:1.5px solid #1e3a5f;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;"><i class="bi bi-building"></i>Multi-Purpose Hall</button>',
  'venue toggle buttons fix'
);

// switchVenue JS function — fix class/style assignment
rep(
  `function switchVenue(venue) {
            selectedVenue = venue;

            const activeClass = 'px-6 py-2.5 rounded-xl font-bold text-sm bg-navy-600 text-white shadow-md transition-all border-none cursor-pointer transform hover:scale-105 active:scale-95';
            const inactiveClass = 'px-6 py-2.5 rounded-xl font-bold text-sm bg-transparent transition-all border-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800';

            document.getElementById('sel-basketball').className = venue === 'basketball' ? activeClass : inactiveClass;
            document.getElementById('sel-multipurpose').className = venue === 'multipurpose' ? activeClass : inactiveClass;

            document.getElementById('sel-basketball').style.color = venue === 'basketball' ? '' : 'var(--text-muted)';
            document.getElementById('sel-multipurpose').style.color = venue === 'multipurpose' ? '' : 'var(--text-muted)';`,
  `function switchVenue(venue) {
            selectedVenue = venue;
            const bball = document.getElementById('sel-basketball');
            const multi = document.getElementById('sel-multipurpose');
            if (venue === 'basketball') {
                bball.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#fff;background:#1e3a5f;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
                multi.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#1e3a5f;background:#fff;border:1.5px solid #1e3a5f;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
            } else {
                multi.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#fff;background:#1e3a5f;border:none;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
                bball.style.cssText = 'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;color:#1e3a5f;background:#fff;border:1.5px solid #1e3a5f;cursor:pointer;transition:all 0.2s;font-family:inherit;display:inline-flex;align-items:center;gap:6px;';
            }`,
  'switchVenue function fix'
);

// ============================================================
// 3. TOTAL REQUESTS STAT CARD — make clickable, add arrow
// ============================================================
rep(
  '<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:18px 20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);position:relative;overflow:hidden;">\n                        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#1e3a5f;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(30,58,95,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1e3a5f;"><i class="bi bi-clipboard2-data-fill"></i></div>\n                            <span style="font-size:10px;font-weight:700;color:#1e3a5f;background:rgba(30,58,95,0.08);padding:2px 8px;border-radius:20px;">ALL-TIME</span>',
  '<div onclick="showPanel(\'history\')" style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:18px 20px;box-shadow:0 2px 10px rgba(0,0,0,0.05);cursor:pointer;transition:all 0.25s;position:relative;overflow:hidden;" onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 10px 28px rgba(30,58,95,0.13)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 2px 10px rgba(0,0,0,0.05)\'">\n                        <div style="position:absolute;top:0;left:0;width:4px;height:100%;background:#1e3a5f;border-radius:16px 0 0 16px;"></div>\n                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">\n                            <div style="width:40px;height:40px;background:rgba(30,58,95,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;color:#1e3a5f;"><i class="bi bi-clipboard2-data-fill"></i></div>\n                            <i class="bi bi-arrow-up-right" style="font-size:12px;color:#94a3b8;"></i>',
  'total requests card clickable + arrow'
);

// ============================================================
// 4. NOTIFICATIONS — fix icons, "Mark all read" blue, "See all" blue
// ============================================================

// Mark all read → blue text
rep(
  'class="text-xs text-slate-700 hover:underline font-semibold flex items-center gap-1"><span class="text-sm"><i class="bi bi-check-all"></i></span> Mark all read</button>',
  'style="font-size:12px;color:#2563eb;background:none;border:none;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:4px;font-family:inherit;" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'"><i class="bi bi-check-all"></i> Mark all read</button>',
  'Mark all read → blue'
);

// "See all activity in history" → blue underline link style
rep(
  'class="px-4 py-2 bg-gray-50 text-center border-t border-gray-100 text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-gray-400 transition relative z-10 w-full" onclick="showPanel(\'history\'); document.getElementById(\'bellDropdownContainer\').classList.add(\'hidden\');">See all activity in history</div>',
  'style="padding:10px 16px;background:#eff6ff;text-align:center;border-top:1px solid #bfdbfe;font-size:12px;font-weight:600;color:#2563eb;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background=\'#dbeafe\'" onmouseout="this.style.background=\'#eff6ff\'" onclick="showPanel(\'history\'); document.getElementById(\'bellDropdownContainer\').classList.add(\'hidden\');">See all activity in history &#8594;</div>',
  'See all activity → blue'
);

// Fix notification icons — approval = checkmark, resolved = checkmark, box icon for equipment_approved
rep(
  "let iconHtml = '<i class=\"bi bi-bell-fill\"></i>';\n                                if (n.type === 'booking_approved') iconHtml = '';\n                if (n.type === 'booking_rejected' || n.type === 'equipment_rejected') iconHtml = '&#10060;';\n                if (n.type === 'concern_resolved') iconHtml = '';\n                if (n.type === 'concern_in_progress') iconHtml = '&#128296;';\n                if (n.type === 'concern_rejected') iconHtml = '&#10060;';\n                if (n.type === 'equipment_approved') iconHtml = '&#128230;';\n                if (n.type === 'booking_cancelled' || n.type === 'event_conflict') iconHtml = '¸Â';\n                if (n.type === 'event_added') iconHtml = '&#128197;';",
  `let iconBg = '#f1f5f9', iconColor = '#64748b';
                let iconHtml = '<i class="bi bi-bell-fill"></i>';
                if (n.type === 'booking_approved') { iconHtml = '<i class="bi bi-check-circle-fill"></i>'; iconBg = '#dcfce7'; iconColor = '#16a34a'; }
                if (n.type === 'equipment_approved') { iconHtml = '<i class="bi bi-check-circle-fill"></i>'; iconBg = '#dcfce7'; iconColor = '#16a34a'; }
                if (n.type === 'concern_resolved') { iconHtml = '<i class="bi bi-check-circle-fill"></i>'; iconBg = '#dcfce7'; iconColor = '#16a34a'; }
                if (n.type === 'booking_rejected' || n.type === 'equipment_rejected' || n.type === 'concern_rejected') { iconHtml = '<i class="bi bi-x-circle-fill"></i>'; iconBg = '#fee2e2'; iconColor = '#dc2626'; }
                if (n.type === 'concern_in_progress') { iconHtml = '<i class="bi bi-arrow-repeat"></i>'; iconBg = '#dbeafe'; iconColor = '#2563eb'; }
                if (n.type === 'booking_cancelled' || n.type === 'event_conflict') { iconHtml = '<i class="bi bi-calendar-x-fill"></i>'; iconBg = '#fef3c7'; iconColor = '#d97706'; }
                if (n.type === 'event_added') { iconHtml = '<i class="bi bi-calendar-event-fill"></i>'; iconBg = '#dbeafe'; iconColor = '#2563eb'; }`,
  'notification icons redesign'
);

// Update the icon container to use iconBg/iconColor
rep(
  '<div class="text-xl bg-gray-100 dark:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center shrink-0">\n                            ${iconHtml}\n                        </div>',
  '<div style="width:38px;height:38px;border-radius:50%;background:${iconBg};display:flex;align-items:center;justify-content:center;font-size:18px;color:${iconColor};flex-shrink:0;">\n                            ${iconHtml}\n                        </div>',
  'notification icon container styled'
);

// ============================================================
// 5. HISTORY PANEL — fix remaining green buttons
// ============================================================
// Refresh Log button (green gradient → blue)
rep(
  'class="px-5 py-2 w-full md:w-auto justify-center bg-gradient-to-r from-slate-500 to-emerald-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:from-slate-50 hover:to-emerald-700 transition shadow-md border-none flex items-center gap-2">\n                            &#128260; Refresh Log',
  'style="padding:8px 20px;background:#1e3a5f;color:#fff;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;display:flex;align-items:center;gap:6px;font-family:inherit;transition:all 0.2s;" onmouseover="this.style.background=\'#2563eb\'" onmouseout="this.style.background=\'#1e3a5f\'">\n                            <i class="bi bi-arrow-repeat"></i> Refresh Log',
  'Refresh Log btn green→blue'
);

// History filter focus ring
rep('focus:ring-emerald-500 outline-none text-sm font-semibold', 'focus:ring-blue-500 outline-none text-sm font-semibold', 'history filter focus ring');

// ============================================================
// 6. CONCERNS FORM — remaining emerald focus rings
// ============================================================
// concerns form inputs
const concernFormLine1 = 'white focus:ring-2 focus:ring-emerald-500 focus:border-slate-500 transition-all outline-none" placeholder="e.g';
if (c.indexOf(concernFormLine1) !== -1) {
  c = c.split('focus:ring-emerald-500 focus:border-slate-500').join('focus:ring-blue-500 focus:border-blue-500');
  count++;
  console.log('OK(all): concerns form focus rings');
}

// ============================================================
// 7. BOOKING CANCEL ring green→blue
// ============================================================
rep(
  "div.className += ' ring-2 ring-emerald-500 ring-offset-2';",
  "div.className += ' ring-2 ring-blue-500 ring-offset-2';",
  'booking calendar ring emerald→blue'
);

// ============================================================
// SAVE
// ============================================================
fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('\nUser dashboard: ' + count + ' changes applied.');
