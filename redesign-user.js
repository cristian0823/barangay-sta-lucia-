const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let count = 0;
function rep(old, neo, label) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS: ' + label); return false; }
    c = c.substring(0, idx) + neo + c.substring(idx + old.length);
    count++; console.log('OK: ' + label); return true;
}
function repAll(old, neo, label) {
    if (!c.includes(old)) { console.log('MISS: ' + label); return false; }
    const prev = c; c = c.split(old).join(neo);
    if (c !== prev) { count++; console.log('OK: ' + label); return true; }
    console.log('MISS (no change): ' + label); return false;
}

// ═══════════════════════════════════════════════════════════════
// 1. HEADER — remove amber bottom border
// ═══════════════════════════════════════════════════════════════
rep(
    'background:#0f1f3d;border-bottom:3px solid #f5a623;',
    'background:#0f1f3d;border-bottom:1px solid rgba(255,255,255,0.1);',
    'user header remove amber border'
);

// ═══════════════════════════════════════════════════════════════
// 2. GREETING BANNER — redesign with profile mini-card
// ═══════════════════════════════════════════════════════════════
rep(
    `                <!-- Welcome Banner -->
                <div style="background:linear-gradient(135deg,#0f1f3d 0%,#1a3a6b 100%);border-radius:20px;padding:28px 36px;margin-bottom:24px;box-shadow:0 8px 32px rgba(15,31,61,0.3);position:relative;overflow:hidden;">
                    <div style="position:absolute;top:-40px;right:80px;width:200px;height:200px;background:rgba(245,166,35,0.06);border-radius:50%;pointer-events:none;"></div>
                    <div style="position:absolute;bottom:-60px;right:-20px;width:240px;height:240px;background:rgba(255,255,255,0.03);border-radius:50%;pointer-events:none;"></div>
                    <div style="position:absolute;top:0;left:0;right:0;bottom:0;background-image:url('brgy.png');background-size:cover;background-position:center;opacity:0.05;border-radius:20px;pointer-events:none;"></div>
                    <div style="position:relative;z-index:1;">
                        <div style="font-size:11px;font-weight:700;color:#f5a623;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;">Barangay Resident Portal</div>
                        <h2 id="dashGreeting" style="font-family:'Playfair Display',serif;font-size:26px;font-weight:800;color:#fff;margin:0 0 6px 0;">Good morning, <span id="welcomeName">Resident</span>!</h2>
                        <div id="dashDate" style="font-size:13px;color:#f5a623;font-weight:600;"></div>
                    </div>
                </div>`,
    `                <!-- Welcome Banner -->
                <div style="background:linear-gradient(135deg,#0f2952 0%,#1e3a5f 60%,#1a4a8a 100%);border-radius:20px;padding:28px 36px;margin-bottom:24px;box-shadow:0 8px 32px rgba(15,41,82,0.35);position:relative;overflow:hidden;">
                    <!-- Dot grid pattern -->
                    <div style="position:absolute;inset:0;opacity:0.07;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:22px 22px;pointer-events:none;border-radius:20px;"></div>
                    <!-- Diagonal accents -->
                    <div style="position:absolute;top:0;right:300px;width:2px;height:100%;background:rgba(255,255,255,0.06);transform:skewX(-15deg);pointer-events:none;"></div>
                    <div style="position:absolute;top:0;right:260px;width:1px;height:100%;background:rgba(255,255,255,0.04);transform:skewX(-15deg);pointer-events:none;"></div>
                    <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;">
                        <!-- Left: greeting -->
                        <div>
                            <div style="font-size:10px;font-weight:700;color:#F59E0B;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="width:16px;height:2px;background:#F59E0B;border-radius:2px;display:inline-block;"></span>Barangay Resident Portal</div>
                            <h2 id="dashGreeting" style="font-size:26px;font-weight:800;color:#fff;margin:0 0 8px 0;line-height:1.25;">Good morning, <span id="welcomeName">Resident</span>!</h2>
                            <div id="dashDate" style="font-size:13px;color:#F59E0B;font-weight:600;"></div>
                        </div>
                        <!-- Right: profile mini-card -->
                        <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.18);border-radius:14px;padding:16px 20px;display:flex;align-items:center;gap:14px;flex-shrink:0;">
                            <div id="dashAvatarCircle" style="width:50px;height:50px;border-radius:50%;background:#F59E0B;color:#0f2952;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;flex-shrink:0;border:2px solid rgba(255,255,255,0.3);">R</div>
                            <div>
                                <div id="dashProfileName" style="font-size:14px;font-weight:700;color:#fff;line-height:1.2;">Resident</div>
                                <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.12em;margin-top:2px;">RESIDENT</div>
                                <div style="margin-top:6px;height:4px;width:80px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden;"><div id="dashProfileBar" style="height:100%;width:60%;background:#F59E0B;border-radius:4px;transition:width 0.6s;"></div></div>
                                <div id="dashProfilePct" style="font-size:10px;color:rgba(255,255,255,0.55);margin-top:2px;">Profile 60%</div>
                            </div>
                        </div>
                    </div>
                </div>`,
    'user greeting banner redesign'
);

// ═══════════════════════════════════════════════════════════════
// 3. STAT CARDS — add count-up IDs and consistent styling
// ═══════════════════════════════════════════════════════════════
// Fix stat numbers to use data-target for count-up
repAll(
    'id="stat-equipment" style="font-size:32px;font-weight:800;color:#0F2547;line-height:1;margin-bottom:4px;">0</div>',
    'id="stat-equipment" data-target="0" style="font-size:32px;font-weight:800;color:#0f2952;line-height:1;margin-bottom:4px;">0</div>',
    'stat equipment data-target'
);
repAll(
    'id="stat-concerns" style="font-size:32px;font-weight:800;color:#0F2547;line-height:1;margin-bottom:4px;">0</div>',
    'id="stat-concerns" data-target="0" style="font-size:32px;font-weight:800;color:#0f2952;line-height:1;margin-bottom:4px;">0</div>',
    'stat concerns data-target'
);
repAll(
    'id="stat-bookings" style="font-size:32px;font-weight:800;color:#0F2547;line-height:1;margin-bottom:4px;">0</div>',
    'id="stat-bookings" data-target="0" style="font-size:32px;font-weight:800;color:#0f2952;line-height:1;margin-bottom:4px;">0</div>',
    'stat bookings data-target'
);
repAll(
    'id="stat-totalreq" style="font-size:32px;font-weight:800;color:#0F2547;line-height:1;margin-bottom:4px;">0</div>',
    'id="stat-totalreq" data-target="0" style="font-size:32px;font-weight:800;color:#0f2952;line-height:1;margin-bottom:4px;">0</div>',
    'stat totalreq data-target'
);

// ═══════════════════════════════════════════════════════════════
// 4. ADD QUICK ACTIONS BAR + ACTIVITY FEED + ANNOUNCEMENTS
//    (insert after metric cards closing div)
// ═══════════════════════════════════════════════════════════════
const newDashSections = `
                <!-- QUICK ACTIONS BAR -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;">
                    <div onclick="showPanel('equipment')" style="background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px 16px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#2563eb';this.style.background='#eff6ff';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff';this.style.transform=''">
                        <div style="width:44px;height:44px;background:#eff6ff;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;"><i class="bi bi-box-seam-fill" style="font-size:20px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#1e3a5f;">Borrow Equipment</div>
                    </div>
                    <div onclick="showPanel('concerns')" style="background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px 16px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#2563eb';this.style.background='#eff6ff';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff';this.style.transform=''">
                        <div style="width:44px;height:44px;background:#eff6ff;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;"><i class="bi bi-megaphone-fill" style="font-size:20px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#1e3a5f;">Report Concern</div>
                    </div>
                    <div onclick="showPanel('booking')" style="background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px 16px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#2563eb';this.style.background='#eff6ff';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff';this.style.transform=''">
                        <div style="width:44px;height:44px;background:#eff6ff;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;"><i class="bi bi-calendar-check-fill" style="font-size:20px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#1e3a5f;">Reserve Facility</div>
                    </div>
                    <div onclick="showPanel('events')" style="background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px 16px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#2563eb';this.style.background='#eff6ff';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff';this.style.transform=''">
                        <div style="width:44px;height:44px;background:#eff6ff;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;"><i class="bi bi-calendar-event-fill" style="font-size:20px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#1e3a5f;">View Events</div>
                    </div>
                </div>

                <!-- ACTIVITY FEED + ANNOUNCEMENTS ROW -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">
                    <!-- Recent Activity Feed -->
                    <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                        <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                            <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-clock-history" style="color:#2563eb;"></i> Recent Activity</div>
                            <button onclick="showPanel('history')" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &#8594;</button>
                        </div>
                        <div id="dashActivityFeed" style="padding:4px 0;">
                            <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-hourglass" style="font-size:20px;display:block;margin-bottom:8px;"></i>Loading...</div>
                        </div>
                    </div>
                    <!-- Announcements -->
                    <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                        <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                            <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-megaphone-fill" style="color:#2563eb;"></i> Announcements</div>
                            <button onclick="showPanel('events')" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">See all &#8594;</button>
                        </div>
                        <div id="dashAnnouncements" style="padding:4px 0;">
                            <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-hourglass" style="font-size:20px;display:block;margin-bottom:8px;"></i>Loading...</div>
                        </div>
                    </div>
                </div>
`;

// Insert after metric cards closing div
const metricEndMark = '</div>\n\n            </div>\n\n            <!-- PANEL 2: EQUIPM';
const meIdx = c.indexOf(metricEndMark);
if (meIdx !== -1) {
    const insertAt = meIdx + '</div>'.length + '\n\n            </div>'.length;
    c = c.substring(0, insertAt) + newDashSections + c.substring(insertAt);
    count++; console.log('OK: dash quick actions + activity + announcements inserted');
} else {
    console.log('MISS: dashboard sections insertion point');
}

// ═══════════════════════════════════════════════════════════════
// 5. EQUIPMENT BUTTON — amber → blue (#f59e0b → #2563eb)
// ═══════════════════════════════════════════════════════════════
repAll(
    'style="background:#f59e0b;color:#1a1a1a;"><i class="bi bi-pencil-square"></i> Request to Borrow</button>',
    'style="background:#2563eb;color:#fff;"><i class="bi bi-pencil-square"></i> Request to Borrow</button>',
    'equip borrow btn amber→blue'
);

// ═══════════════════════════════════════════════════════════════
// 6. TAB BUTTONS — standardize active=blue, inactive=navy outline
// ═══════════════════════════════════════════════════════════════

// Equipment tabs HTML
rep(
    'id="tab-btn-catalog" onclick="switchEquipTab(\'catalog\')"\n                        style="display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #f59e0b;background:#f59e0b;color:#1a1a1a;transition:all 0.2s;font',
    'id="tab-btn-catalog" onclick="switchEquipTab(\'catalog\')"\n                        style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #2563eb;background:#2563eb;color:#fff;transition:all 0.2s;font',
    'equip catalog tab active→blue'
);
rep(
    'id="tab-btn-history" onclick="switchEquipTab(\'history\')"\n                        style="display:inline-flex;align-items:center;gap:8px;padding:10px 22px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #0f1f3d;background:transparent;color:#0f1f3d;transition:all 0.2s;font',
    'id="tab-btn-history" onclick="switchEquipTab(\'history\')"\n                        style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #1e3a5f;background:#fff;color:#1e3a5f;transition:all 0.2s;font',
    'equip history tab inactive→navy outline'
);

// Booking tabs HTML
rep(
    'id="tab-btn-booking-calendar" onclick="switchBookingTab(\'calendar\')"\n                        style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #f59e0b;background:#f59e0b;color:#fff;transition:all 0',
    'id="tab-btn-booking-calendar" onclick="switchBookingTab(\'calendar\')"\n                        style="display:inline-flex;align-items:center;gap:8px;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;border:2px solid #2563eb;background:#2563eb;color:#fff;transition:all 0',
    'booking calendar tab amber→blue'
);

// ═══════════════════════════════════════════════════════════════
// 7. TAB SWITCHING FUNCTIONS — fix amber colors
// ═══════════════════════════════════════════════════════════════
// switchEquipTab: #f59e0b active → #2563eb, #1a1a1a → #fff
rep(
    "btnCatalog.style.background = '#f59e0b'; btnCatalog.style.color = '#1a1a1a'; btnCatalog.style.borderColor = '#f59e0b';\n                btnHistory.style.background = 'transparent'; btnHistory.style.color = '#0f1f3d'; btnHistory.style.borderColor = '#0f1f3d';",
    "btnCatalog.style.background = '#2563eb'; btnCatalog.style.color = '#fff'; btnCatalog.style.borderColor = '#2563eb';\n                btnHistory.style.background = '#fff'; btnHistory.style.color = '#1e3a5f'; btnHistory.style.borderColor = '#1e3a5f';",
    'switchEquipTab catalog active blue'
);
rep(
    "btnHistory.style.background = '#f59e0b'; btnHistory.style.color = '#1a1a1a'; btnHistory.style.borderColor = '#f59e0b';\n                btnCatalog.style.background = 'transparent'; btnCatalog.style.color = '#0f1f3d'; btnCatalog.style.borderColor = '#0f1f3d';",
    "btnHistory.style.background = '#2563eb'; btnHistory.style.color = '#fff'; btnHistory.style.borderColor = '#2563eb';\n                btnCatalog.style.background = '#fff'; btnCatalog.style.color = '#1e3a5f'; btnCatalog.style.borderColor = '#1e3a5f';",
    'switchEquipTab history active blue'
);

// switchBookingTab: #f59e0b → #2563eb
rep(
    "const ACTIVE   = {background:'#f59e0b', color:'#fff', borderColor:'#f59e0b'};\n            const INACTIVE = {background:'transparent', color:'#1e3a5f', borderColor:'#1e3a5f'};",
    "const ACTIVE   = {background:'#2563eb', color:'#fff', borderColor:'#2563eb'};\n            const INACTIVE = {background:'#fff', color:'#1e3a5f', borderColor:'#1e3a5f'};",
    'switchBookingTab active blue'
);

// ═══════════════════════════════════════════════════════════════
// 8. WHITE GAP FIX
// ═══════════════════════════════════════════════════════════════
rep(
    '*, *::before, *::after { box-sizing: border-box; }',
    'html, body { height: 100%; }\n        *, *::before, *::after { box-sizing: border-box; }',
    'user white gap html/body height'
);

// ═══════════════════════════════════════════════════════════════
// 9. ADD JS for dashboard extras (activity feed + announcements + count-up + profile card)
// ═══════════════════════════════════════════════════════════════
const dashJsMarker = '// ==========================================\n        // 5. EVENTS';
const dashJsIdx = c.indexOf(dashJsMarker);
if (dashJsIdx !== -1) {
    const newDashJS = `// ==========================================
        // DASHBOARD EXTRAS: Activity Feed, Announcements, Count-up, Profile Card
        async function loadDashboardExtras() {
            const user = getCurrentUser();
            if (!user) return;

            // Profile mini-card
            const fullName = user.fullName || user.full_name || user.username || 'Resident';
            const initials = fullName.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
            const nameEl = document.getElementById('dashProfileName');
            const avatarEl = document.getElementById('dashAvatarCircle');
            const barEl = document.getElementById('dashProfileBar');
            const pctEl = document.getElementById('dashProfilePct');
            const wNameEl = document.getElementById('welcomeName');
            if (nameEl) nameEl.textContent = fullName;
            if (avatarEl) avatarEl.textContent = initials;
            if (wNameEl) wNameEl.textContent = fullName.split(' ')[0];
            const pct = user.profile_picture ? 90 : user.phone ? 70 : 50;
            if (barEl) barEl.style.width = pct + '%';
            if (pctEl) pctEl.textContent = 'Profile ' + pct + '%';

            // Count-up animation on stat cards
            function animateCount(el, target) {
                if (!el || isNaN(target)) return;
                const duration = 900; const start = Date.now();
                const tick = () => {
                    const elapsed = Date.now() - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.setAttribute('data-target', target);
                };
                requestAnimationFrame(tick);
            }
            ['stat-equipment','stat-concerns','stat-bookings','stat-totalreq'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const t = parseInt(el.getAttribute('data-target') || el.textContent) || 0;
                    if (t > 0) animateCount(el, t);
                }
            });

            // Activity feed
            try {
                const feedEl = document.getElementById('dashActivityFeed');
                if (feedEl && window.supabase) {
                    const [brRes, conRes, facRes] = await Promise.all([
                        supabase.from('borrowings').select('id,equipment,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(3),
                        supabase.from('concerns').select('id,title,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(2),
                        supabase.from('facility_reservations').select('id,venue,status,created_at').eq('user_id', user.id).order('created_at',{ascending:false}).limit(2)
                    ]);
                    const all = [
                        ...(brRes.data||[]).map(r=>({type:'borrow',icon:'bi-box-seam',desc:r.equipment||'Equipment',status:r.status,date:r.created_at})),
                        ...(conRes.data||[]).map(r=>({type:'concern',icon:'bi-megaphone',desc:r.title||'Concern',status:r.status,date:r.created_at})),
                        ...(facRes.data||[]).map(r=>({type:'booking',icon:'bi-calendar-check',desc:(r.venue||'Facility')+' Reservation',status:r.status,date:r.created_at}))
                    ].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
                    if (!all.length) {
                        feedEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>No recent activity</div>';
                    } else {
                        const statusBadge = (s) => {
                            if (s === 'approved' || s === 'resolved') return 'background:#dcfce7;color:#16a34a';
                            if (s === 'rejected') return 'background:#fee2e2;color:#dc2626';
                            if (s === 'in_progress') return 'background:#dbeafe;color:#1d4ed8';
                            return 'background:#fef3c7;color:#d97706';
                        };
                        feedEl.innerHTML = all.map(a => {
                            const d = new Date(a.date).toLocaleDateString('en-US',{month:'short',day:'numeric'});
                            return '<div style="padding:10px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f8fafc;">' +
                                '<div style="width:34px;height:34px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi ' + a.icon + '" style="color:#2563eb;font-size:15px;"></i></div>' +
                                '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#1e3a5f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + a.desc + '</div>' +
                                '<div style="font-size:11px;color:#94a3b8;">' + d + '</div></div>' +
                                '<span style="font-size:11px;font-weight:700;' + statusBadge(a.status) + ';padding:2px 8px;border-radius:20px;white-space:nowrap;">' + (a.status||'pending') + '</span></div>';
                        }).join('');
                    }
                }
            } catch(e) { console.warn('activity feed error', e); }

            // Announcements (events)
            try {
                const annEl = document.getElementById('dashAnnouncements');
                if (annEl && window.supabase) {
                    const { data: evs } = await supabase.from('events').select('id,title,date,category').order('date',{ascending:true}).limit(3);
                    if (!evs || !evs.length) {
                        annEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-calendar-x" style="font-size:24px;display:block;margin-bottom:8px;"></i>No upcoming announcements</div>';
                    } else {
                        const catColor = {'Sports':'#2563eb','Community':'#16a34a','Health':'#dc2626','Others':'#64748b'};
                        annEl.innerHTML = evs.map(e => {
                            const d = new Date(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
                            const cc = catColor[e.category] || '#64748b';
                            return '<div style="padding:12px 20px;border-bottom:1px solid #f8fafc;">' +
                                '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">' +
                                '<div style="font-size:13px;font-weight:600;color:#1e3a5f;">' + (e.title||'Event') + '</div>' +
                                '<span style="font-size:10px;font-weight:700;background:' + cc + '20;color:' + cc + ';padding:2px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0;">' + (e.category||'Event') + '</span></div>' +
                                '<div style="font-size:11px;color:#94a3b8;margin-top:3px;display:flex;align-items:center;gap:4px;"><i class="bi bi-calendar3"></i> ' + d + '</div></div>';
                        }).join('');
                    }
                }
            } catch(e) { console.warn('announcements error', e); }
        }

        `;
    c = c.substring(0, dashJsIdx) + newDashJS + c.substring(dashJsIdx);
    count++; console.log('OK: dashboard extras JS added');
} else {
    console.log('MISS: dashboard extras JS insertion');
}

// ═══════════════════════════════════════════════════════════════
// 10. CALL loadDashboardExtras when dashboard panel is shown
// ═══════════════════════════════════════════════════════════════
rep(
    "case 'dashboard': loadDashboardStats(); break;",
    "case 'dashboard': loadDashboardStats(); setTimeout(loadDashboardExtras, 200); break;",
    'call loadDashboardExtras on dashboard show'
);

// ═══════════════════════════════════════════════════════════════
// 11. HOOK into stat updates to trigger count-up
// ═══════════════════════════════════════════════════════════════
// When stat IDs get their values set, also trigger count-up
// We do this by patching the loadDashboardStats assignment
repAll(
    "document.getElementById('stat-equipment').textContent = ",
    "document.getElementById('stat-equipment').setAttribute('data-target', ",
    'stat-equipment data-target set'
);
repAll(
    "document.getElementById('stat-concerns').textContent = ",
    "document.getElementById('stat-concerns').setAttribute('data-target', ",
    'stat-concerns data-target set'
);
repAll(
    "document.getElementById('stat-bookings').textContent = ",
    "document.getElementById('stat-bookings').setAttribute('data-target', ",
    'stat-bookings data-target set'
);
repAll(
    "document.getElementById('stat-totalreq').textContent = ",
    "document.getElementById('stat-totalreq').setAttribute('data-target', ",
    'stat-totalreq data-target set'
);

// ═══════════════════════════════════════════════════════════════
fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('\nUser: ' + count + ' changes applied.');
