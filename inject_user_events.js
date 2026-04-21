const fs = require('fs');

// --- USER DASHBOARD HTML ---
let ud = fs.readFileSync('user-dashboard.html', 'utf8');

const s1 = '                      \'<div class=\"flex items-center gap-2 mb-2\"><span class=\"font-bold\">\' + timeStr + \'</span></div>\' +\n                      \'<div class=\"flex items-center gap-2\"><span class=\"text-sm\">By \' + e.organizer + \'</span></div>\' +\n                      \'</div></div>\';';
const r1 = '                      \'<div class=\"flex items-center gap-2 mb-2\"><span class=\"font-bold\">\' + timeStr + \'</span></div>\' +\n                      (e.capacity ? \'<div class=\"flex items-center gap-2 mb-2\" style=\"background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:12px;display:inline-block;\"><span class=\"text-xs font-bold\">CAPACITY LIMIT: \' + e.capacity + \'</span></div>\' : \'\') +\n                      (e.description ? \'<div style=\"font-size:13px; line-height:1.4; opacity:0.9; margin:8px 0; border-left:2px solid rgba(255,255,255,0.4); padding-left:8px;\">\' + e.description + \'</div>\' : \'\') +\n                      \'<div class=\"flex items-center gap-2 mt-2 pt-2 border-t border-white/10\"><span class=\"text-sm opacity-75\">By \' + e.organizer + \'</span></div>\' +\n                      \'</div></div>\';';

ud = ud.replace(s1, r1);
fs.writeFileSync('user-dashboard.html', ud);

// --- ADMIN HTML ---
let ah = fs.readFileSync('admin.html', 'utf8');

// There's a render function for events on the admin side. Let's find it.
const s2 = '                            \'<h4 style=\"margin:0 0 6px 0;font-size:16px;font-weight:800;color:var(--text-main, #1f2937);\">\' + evt.title + \'</h4>\' +\n                            \'<p style=\"margin:0;font-size:13px;color:var(--text-muted, #6b7280);display:flex;align-items:center;gap:6px;\">\' +';
const r2 = '                            \'<h4 style=\"margin:0 0 6px 0;font-size:16px;font-weight:800;color:var(--text-main, #1f2937);\">\' + evt.title + \'</h4>\' +\n                            (evt.description ? \'<p style=\"margin:0 0 6px;font-size:13px;color:var(--text-muted, #6b7280);\"><i>\' + evt.description + \'</i></p>\' : \'\') +\n                            (evt.capacity ? \'<p style=\"margin:0 0 6px;font-size:12px;font-weight:bold;color:#db2777;\">Max Capacity: \' + evt.capacity + \'</p>\' : \'\') +\n                            \'<p style=\"margin:0;font-size:13px;color:var(--text-muted, #6b7280);display:flex;align-items:center;gap:6px;\">\' +';

ah = ah.replace(s2, r2);
fs.writeFileSync('admin.html', ah);
