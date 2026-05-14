const fs = require('fs');

// ═══════════════════════════════════════════════════════
//  ADMIN.HTML PATCHES
// ═══════════════════════════════════════════════════════
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// ─── TASK 4: Remove stray > after panel-dashboard closing div ───────────────
// (also in user-dashboard.html — handled below)

// ─── TASK 5: Remove gold label row above the greeting ───────────────────────
const OLD_GOLD_LABEL = `<div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FDB913;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="width:18px;height:2px;background:#FDB913;border-radius:2px;display:inline-block;"></span>Barangay Sta. Lucia Admin Portal</div>
                                    <div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:6px;line-height:1.2;" id="welcomeGreeting">Good morning, Admin</div>`;
const NEW_GOLD_LABEL = `<div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:6px;line-height:1.2;" id="welcomeGreeting">Good morning, Admin</div>`;
let idx = a.indexOf(OLD_GOLD_LABEL);
if (idx === -1) { console.log('MISS gold label'); process.exit(1); }
a = a.substring(0, idx) + NEW_GOLD_LABEL + a.substring(idx + OLD_GOLD_LABEL.length);
console.log('OK remove gold label');

// ─── TASK 6a: Unify bar chart colors to navy ────────────────────────────────
// Change Concerns chart from red and Reservations from blue to navy
a = a.replace(
    `_analyticsRenderBarChart('concernsByAreaChart', '_analyticsConChart', conAreas.slice(0,10), '#CE1126', 'Concerns');`,
    `_analyticsRenderBarChart('concernsByAreaChart', '_analyticsConChart', conAreas.slice(0,10), '#1A3A6B', 'Concerns');`
);
a = a.replace(
    `_analyticsRenderBarChart('reservationsByAreaChart', '_analyticsResChart', resAreas.slice(0,10), '#0369A1', 'Reservations');`,
    `_analyticsRenderBarChart('reservationsByAreaChart', '_analyticsResChart', resAreas.slice(0,10), '#1A3A6B', 'Reservations');`
);
// Update chart dot colors in HTML from red/blue to navy
a = a.replace(
    `<div style="width:8px;height:8px;background:#CE1126;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Concerns by Sitio</span>`,
    `<div style="width:8px;height:8px;background:#1A3A6B;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Concerns by Sitio</span>`
);
a = a.replace(
    `<div style="width:8px;height:8px;background:#0369A1;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Facility Reservations by Sitio</span>`,
    `<div style="width:8px;height:8px;background:#1A3A6B;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Facility Reservations by Sitio</span>`
);
// Update ranked table trophy colors
a = a.replace(
    `<i class="bi bi-trophy-fill" style="color:#CE1126;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Concerns</span>`,
    `<i class="bi bi-trophy-fill" style="color:#1A3A6B;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Concerns</span>`
);
a = a.replace(
    `<i class="bi bi-trophy-fill" style="color:#0369A1;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Reservations</span>`,
    `<i class="bi bi-trophy-fill" style="color:#1A3A6B;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Reservations</span>`
);
console.log('OK chart color unification');

// ─── TASK 6b: Unify Pending Approvals / Unresolved Concerns accent colors ───
// Change #2563eb icons and links to navy #1A3A6B / #1e3a5f
a = a.replace(
    `<i class="bi bi-box-seam-fill" style="color:#2563eb;"></i> Pending Approvals`,
    `<i class="bi bi-box-seam-fill" style="color:#1A3A6B;"></i> Pending Approvals`
);
a = a.replace(
    `<i class="bi bi-megaphone-fill" style="color:#2563eb;"></i> Unresolved Concerns`,
    `<i class="bi bi-megaphone-fill" style="color:#1A3A6B;"></i> Unresolved Concerns`
);
// View all buttons
a = a.replace(
    `style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewPendingList"`,
    `style="font-size:12px;color:#1A3A6B;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewPendingList"`
);
a = a.replace(
    `style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>`,
    `style="font-size:12px;color:#1A3A6B;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>`
);
// Pending badge: keep yellow (semantic) — do not change
// Concern status colors: blue "in-progress" badge → navy
a = a.replace(
    `'in-progress': '#dbeafe|#1d4ed8'`,
    `'in-progress': '#e0e7ff|#1A3A6B'`
);
console.log('OK overview color unification');

// ─── TASK 7: Fix Purok numbers → Sitio in _parsePurok ───────────────────────
const OLD_PUROK_FALLBACK = `                // Legacy fallbacks
                var m;
                m = s.match(/purok\\s*(?:no\\.?\\s*)?([a-z0-9]+)/i);
                if (m) return 'Purok ' + m[1].toUpperCase();
                m = s.match(/zone\\s*([a-z0-9]+)/i);
                if (m) return 'Zone ' + m[1].toUpperCase();
                return 'Others';`;
const NEW_PUROK_FALLBACK = `                // Map purok/sitio numbers to Sitio I-VII
                var numMap = {'1':'I','2':'II','3':'III','4':'IV','5':'V','6':'VI','7':'VII'};
                var nm = s.match(/(?:purok|sitio)\\s*(?:no\\.?\\s*)?(\\d)/i);
                if (nm && numMap[nm[1]]) return 'Sitio ' + numMap[nm[1]];
                m = s.match(/zone\\s*([a-z0-9]+)/i);
                if (m) return 'Zone ' + m[1].toUpperCase();
                return 'Others';`;
idx = a.indexOf(OLD_PUROK_FALLBACK);
if (idx === -1) { console.log('MISS purok fallback'); process.exit(1); }
a = a.substring(0, idx) + NEW_PUROK_FALLBACK + a.substring(idx + OLD_PUROK_FALLBACK.length);
console.log('OK purok number → Sitio mapping');

// ─── TASK 1: Clickable user rows → open user detail panel ───────────────────
const OLD_USER_ROW = `                    return \`<tr>
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">\${u.barangay_id || ''}</td>
                        <td style="font-size:13px;line-height:1.2;"><strong>\${displayName}</strong></td>
                        <td style="font-size:12px;white-space:nowrap;">\${phone}</td>
                        <td style="font-size:12px;color:#6b7280;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${u.email || ''}">\${u.email || ''}</td>
                        <td style="font-size:12px;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${address}">\${address}</td>
                        <td style="white-space:nowrap;">\${statusBadge}</td>
                        <td style="text-align:center; white-space:nowrap;">\${actionHtml}</td>
                    </tr>\`;`;

const NEW_USER_ROW = `                    return \`<tr onclick="openUserDetailPanel(this)" data-uid="\${u.id}" style="cursor:pointer;transition:background 0.12s;" onmouseover="this.style.background='#f0f4ff'" onmouseout="this.style.background=''">
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">\${u.barangay_id || ''}</td>
                        <td style="font-size:13px;line-height:1.2;"><strong>\${displayName}</strong></td>
                        <td style="font-size:12px;white-space:nowrap;">\${phone}</td>
                        <td style="font-size:12px;color:#6b7280;max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${u.email || ''}">\${u.email || ''}</td>
                        <td style="font-size:12px;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${address}">\${address}</td>
                        <td style="white-space:nowrap;">\${statusBadge}</td>
                        <td style="text-align:center; white-space:nowrap;" onclick="event.stopPropagation()">\${actionHtml}</td>
                    </tr>\`;`;

idx = a.indexOf(OLD_USER_ROW);
if (idx === -1) { console.log('MISS user row template'); process.exit(1); }
a = a.substring(0, idx) + NEW_USER_ROW + a.substring(idx + OLD_USER_ROW.length);
console.log('OK clickable user rows');

// Also populate _userDetailMap after join() so openUserDetailPanel can look up by id
const OLD_JOIN = `                }).join('');
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');`;
const NEW_JOIN = `                }).join('');
                // Build id→user lookup for detail panel
                _pgUsersList.forEach(function(u){ _userDetailMap[String(u.id)] = u; });
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');`;
idx = a.indexOf(OLD_JOIN);
if (idx === -1) { console.log('MISS join/renderPg'); process.exit(1); }
a = a.substring(0, idx) + NEW_JOIN + a.substring(idx + OLD_JOIN.length);
console.log('OK _userDetailMap population');

// ─── TASK 1: Add user detail side panel HTML (before </body>) ───────────────
const OLD_BODY_END = '</body>\n\n</html>\n';
const USER_DETAIL_PANEL = `
<!-- User Detail Side Panel -->
<div id="userDetailPanel" style="display:none;position:fixed;top:0;right:0;width:380px;height:100vh;background:#fff;box-shadow:-4px 0 24px rgba(0,0,0,0.12);z-index:1100;flex-direction:column;overflow:hidden;">
    <div style="background:#1A3A6B;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="bi bi-person-fill" style="color:#fff;font-size:16px;"></i>
            </div>
            <div style="font-size:15px;font-weight:700;color:#fff;">Resident Details</div>
        </div>
        <button onclick="closeUserDetailPanel()" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.12);border:none;color:#fff;cursor:pointer;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;" onmouseover="this.style.background='rgba(255,255,255,0.22)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">&times;</button>
    </div>
    <div id="userDetailBody" style="flex:1;overflow-y:auto;padding:20px;"></div>
</div>
<div id="userDetailOverlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.25);z-index:1099;" onclick="closeUserDetailPanel()"></div>

<script>
var _userDetailMap = {};
function openUserDetailPanel(row) {
    var uid = row.getAttribute('data-uid');
    var u = _userDetailMap[uid];
    if (!u) return;
    var b = document.getElementById('userDetailBody');
    if (!b) return;
    var name = u.fullName || u.full_name || u.username || '—';
    var initials = name.split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase() || 'U';
    var status = (u.suspended_until && new Date(u.suspended_until) > new Date())
        ? '<span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Suspended</span>'
        : '<span style="background:#d1fae5;color:#059669;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Active</span>';
    var createdAt = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '—';
    var lastLogin = u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
    function row(label, val) {
        return '<div style="margin-bottom:16px;">'
            + '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B7280;margin-bottom:4px;">'+label+'</div>'
            + '<div style="font-size:14px;color:#0f1f3d;font-weight:500;word-break:break-word;">'+(val||'<span style=\\'color:#9ca3af;font-style:italic;\\'>Not provided</span>')+'</div>'
            + '</div>';
    }
    b.innerHTML = '<div style="text-align:center;margin-bottom:24px;">'
        + '<div style="width:64px;height:64px;background:#1A3A6B;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;">'+initials+'</div>'
        + '<div style="font-size:18px;font-weight:700;color:#0f1f3d;margin-bottom:4px;">'+name+'</div>'
        + status
        + '</div>'
        + '<hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:20px;">'
        + row('Barangay ID', u.barangay_id)
        + row('Full Name', name)
        + row('Phone', u.phone || u.contact_number)
        + row('Email', u.email)
        + row('Address', u.address)
        + row('Role', u.role ? u.role.charAt(0).toUpperCase()+u.role.slice(1) : null)
        + row('2FA Enabled', u.totp_enabled === true ? '✔ Enabled' : u.totp_enabled === false ? '✘ Disabled' : '—')
        + row('Date Registered', createdAt)
        + row('Last Login', lastLogin);
    var panel = document.getElementById('userDetailPanel');
    var overlay = document.getElementById('userDetailOverlay');
    panel.style.display = 'flex';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeUserDetailPanel() {
    var panel = document.getElementById('userDetailPanel');
    var overlay = document.getElementById('userDetailOverlay');
    if (panel) panel.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}
</script>
</body>

</html>
`;

idx = a.lastIndexOf(OLD_BODY_END);
if (idx === -1) { console.log('MISS </body>'); process.exit(1); }
a = a.substring(0, idx) + USER_DETAIL_PANEL;
console.log('OK user detail panel');

// ─── TASK 2: Fix submitAddUser to save to users table ───────────────────────
const OLD_SUBMIT = `                try {
                    var chk=await supabase.from('residents').select('id').eq('barangay_id',bid);
                    if(chk.data&&chk.data.length>0){btn.innerHTML=orig;btn.disabled=false;return showErr('Barangay ID "'+bid+'" already exists.');}
                    var ins=await supabase.from('residents').insert([{barangay_id:bid,full_name:name,phone:phone||null,email:email||null,address:addr||null,role:'resident'}]);
                    if(ins.error){btn.innerHTML=orig;btn.disabled=false;return showErr('Insert error: '+ins.error.message);}
                    closeAddUserModal();
                    showAlert('User "'+name+'" added successfully.','success');
                    loadUsers();
                } catch(e) {
                    btn.innerHTML=orig;btn.disabled=false;showErr('Unexpected error: '+e.message);
                }`;

const NEW_SUBMIT = `                try {
                    // Check duplicate in users table
                    var chk = await supabase.from('users').select('id').eq('barangay_id', bid);
                    if (chk.data && chk.data.length > 0) { btn.innerHTML=orig; btn.disabled=false; return showErr('Barangay ID "'+bid+'" already exists.'); }
                    var chkU = await supabase.from('users').select('id').eq('username', bid);
                    if (chkU.data && chkU.data.length > 0) { btn.innerHTML=orig; btn.disabled=false; return showErr('Barangay ID "'+bid+'" is already in use.'); }
                    // Insert into users table — barangay_id and username both set to the ID
                    // totp_enabled is null (not false) so login forces first-login setup flow
                    var ins = await supabase.from('users').insert([{
                        barangay_id: bid,
                        username: bid,
                        full_name: name,
                        phone: phone || null,
                        email: email || null,
                        address: addr || null,
                        role: 'user',
                        avatar: name.trim().charAt(0).toUpperCase(),
                        totp_enabled: null,
                        password: null
                    }]);
                    if (ins.error) { btn.innerHTML=orig; btn.disabled=false; return showErr('Save error: '+ins.error.message); }
                    closeAddUserModal();
                    showAlert('User "'+name+'" added. They can log in with Barangay ID: '+bid+' and will be prompted to set up their account on first login.', 'success');
                    loadUsers();
                } catch(e) {
                    btn.innerHTML=orig; btn.disabled=false; showErr('Unexpected error: '+e.message);
                }`;

idx = a.indexOf(OLD_SUBMIT);
if (idx === -1) { console.log('MISS submitAddUser try block'); process.exit(1); }
a = a.substring(0, idx) + NEW_SUBMIT + a.substring(idx + OLD_SUBMIT.length);
console.log('OK submitAddUser → users table');

fs.writeFileSync('admin-portal/admin.html', a);
console.log('admin.html saved');

// ═══════════════════════════════════════════════════════
//  USER-DASHBOARD.HTML — Task 4: Remove stray >
// ═══════════════════════════════════════════════════════
let u = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

const OLD_STRAY = `</div><!-- end panel-dashboard -->>`;
const NEW_STRAY = `</div><!-- end panel-dashboard -->`;
idx = u.indexOf(OLD_STRAY);
if (idx === -1) { console.log('MISS stray >'); process.exit(1); }
u = u.substring(0, idx) + NEW_STRAY + u.substring(idx + OLD_STRAY.length);
console.log('OK remove stray >');

fs.writeFileSync('user-portal/user-dashboard.html', u);
console.log('user-dashboard.html saved');

// ═══════════════════════════════════════════════════════
//  LOGIN.HTML — Task 3: First-login detection
// ═══════════════════════════════════════════════════════
let l = fs.readFileSync('user-portal/login.html', 'utf8').replace(/\r\n/g, '\n');

// The current flow:
//   totp_enabled === false → login directly (demouser bypass)
//   else (null/undefined + no secret) → redirect to setup-totp.html
// New: when totp_enabled is null (admin-created account), redirect to
//   a first-login setup page that sets password THEN TOTP
// For now we reuse setup-totp.html — it already handles the full setup

// The existing flow already handles totp_enabled=null → setup-totp.html
// We just need to pass a flag so setup-totp.html knows to show password step too
const OLD_SETUP_REDIRECT = `                // No TOTP yet — require setup
                sessionStorage.setItem('totp_pending_user', JSON.stringify(result.user));
                sessionStorage.setItem('totp_remember_me', rememberMe ? 'true' : 'false');
                showToast('Please set up Google Authenticator to continue.', 'success');
                setTimeout(() => window.location.href = 'setup-totp.html', 1200);`;

const NEW_SETUP_REDIRECT = `                // No TOTP yet — check if this is a brand-new admin-created account
                const isFirstLogin = (result.user.totp_enabled === null || result.user.totp_enabled === undefined) && !result.user.password;
                sessionStorage.setItem('totp_pending_user', JSON.stringify(result.user));
                sessionStorage.setItem('totp_remember_me', rememberMe ? 'true' : 'false');
                if (isFirstLogin) {
                    sessionStorage.setItem('totp_first_login', 'true');
                    showToast('Welcome! Please set up your account to continue.', 'success');
                } else {
                    showToast('Please set up Google Authenticator to continue.', 'success');
                }
                setTimeout(() => window.location.href = 'setup-totp.html', 1200);`;

idx = l.indexOf(OLD_SETUP_REDIRECT);
if (idx === -1) { console.log('MISS login setup redirect'); process.exit(1); }
l = l.substring(0, idx) + NEW_SETUP_REDIRECT + l.substring(idx + OLD_SETUP_REDIRECT.length);
console.log('OK login first-login flag');

fs.writeFileSync('user-portal/login.html', l);
console.log('login.html saved');

console.log('\nAll patches done.');
