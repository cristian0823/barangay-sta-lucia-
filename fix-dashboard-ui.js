const fs = require('fs');
const { execSync } = require('child_process');

function rep(c, old, neo, label) {
    if (!c.includes(old)) { console.log('[MISS]', label); return c; }
    console.log('[HIT] ', label);
    return c.replace(old, neo);
}

// ═══════════════════════════════════════════
// USER DASHBOARD
// ═══════════════════════════════════════════
let u = fs.readFileSync('c:/Users/Kael/OneDrive/Documents/barangay-website/user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

// ─── 1. Nav active state: solid navy fill + amber left border ───
u = rep(u,
    '--nav-active-bg: rgba(37,99,235,0.15); --nav-active-text: #2563eb;',
    '--nav-active-bg: #1e3a5f; --nav-active-text: #fff;',
    'nav-active CSS vars → navy'
);
u = rep(u,
    '.nav-item.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; border-left: 3px solid #2563eb !important; box-shadow: none; }\n        .nav-item.active .nav-icon { background: rgba(37,99,235,0.15) !important; color: #2563eb !important; }',
    '.nav-item.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; border-left: 4px solid #F59E0B !important; box-shadow: none; }\n        .nav-item.active .nav-icon { background: rgba(255,255,255,0.15) !important; color: #fff !important; }',
    'nav-item.active border amber + white icon'
);

// ─── 2. Fix panel structure: remove premature panel-dashboard close ───
// The </div> between metric-grid close and QUICK ACTIONS wrongly closes panel-dashboard
u = rep(u,
    '                </div>\n\n            </div>\n                <!-- QUICK ACTIONS BAR -->',
    '                </div>\n\n                <!-- QUICK ACTIONS BAR -->',
    'Remove premature panel-dashboard close'
);

// ─── 3. Quick Actions: upgrade tiles to 48px circle icons + better hover ───
u = rep(u,
    `                <!-- QUICK ACTIONS BAR -->
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
                    </div>`,
    `                <!-- QUICK ACTIONS BAR -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
                    <div onclick="showPanel('equipment')" style="background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:22px 16px;text-align:center;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);" onmouseover="this.style.borderColor='#2563eb';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
                        <div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="bi bi-box-seam-fill" style="font-size:22px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#0f2952;">Borrow Equipment</div>
                    </div>
                    <div onclick="showPanel('concerns')" style="background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:22px 16px;text-align:center;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);" onmouseover="this.style.borderColor='#2563eb';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
                        <div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="bi bi-megaphone-fill" style="font-size:22px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#0f2952;">Report Concern</div>
                    </div>
                    <div onclick="showPanel('booking')" style="background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:22px 16px;text-align:center;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);" onmouseover="this.style.borderColor='#2563eb';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
                        <div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="bi bi-calendar-check-fill" style="font-size:22px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#0f2952;">Reserve Facility</div>
                    </div>`,
    'Quick Actions: 52px circle icons'
);
// Last tile (View Events)
u = rep(u,
    `style="background:#fff;border:1.5px solid #e2e8f0;border-radius:14px;padding:18px 16px;text-align:center;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor='#2563eb';this.style.background='#eff6ff';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff';this.style.transform=''">
                        <div style="width:44px;height:44px;background:#eff6ff;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;"><i class="bi bi-calendar-event-fill" style="font-size:20px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#1e3a5f;">View Events</div>
                    </div>
                </div>`,
    `style="background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:22px 16px;text-align:center;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);" onmouseover="this.style.borderColor='#2563eb';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)'">
                        <div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class="bi bi-calendar-event-fill" style="font-size:22px;color:#2563eb;"></i></div>
                        <div style="font-size:13px;font-weight:700;color:#0f2952;">View Events</div>
                    </div>
                </div>`,
    'Quick Actions: last tile View Events'
);

// ─── 4. Activity Feed card: fix width ratio + border, add hover style ───
u = rep(u,
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">',
    '<div style="display:grid;grid-template-columns:55% 45%;gap:20px;margin-bottom:24px;">',
    'Activity/Announcements grid ratio 55/45'
);

// Fix activity card container
u = rep(u,
    '<!-- Recent Activity Feed -->\n                    <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">',
    '<!-- Recent Activity Feed -->\n                    <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f1f5f9;overflow:hidden;">',
    'Activity card border'
);

// Fix announcements card container
u = rep(u,
    '<!-- Announcements -->\n                    <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">',
    '<!-- Announcements -->\n                    <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f1f5f9;overflow:hidden;min-height:200px;">',
    'Announcements card border + min-height'
);

// ─── 5. Add Barangay Events section + close panel-dashboard ─────────────────
// Insert events section + panel close before PANEL 2
u = rep(u,
    `\n\n\n            <!-- PANEL 2: EQUIPMENT -->`,
    `
                <!-- BARANGAY EVENTS SECTION -->
                <div style="background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);border:1px solid #f1f5f9;overflow:hidden;margin-top:0;">
                    <div style="padding:18px 24px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:16px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-calendar3-fill" style="color:#2563eb;"></i> Barangay Events</div>
                            <div style="font-size:12px;color:#64748b;margin-top:2px;">Upcoming events and activities in your barangay</div>
                        </div>
                        <button onclick="showPanel('events')" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">View all &#8594;</button>
                    </div>
                    <div id="dashEventsSection" style="padding:12px 0;">
                        <div style="padding:32px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-hourglass" style="font-size:20px;display:block;margin-bottom:8px;"></i>Loading...</div>
                    </div>
                </div>

            </div><!-- end panel-dashboard -->


            <!-- PANEL 2: EQUIPMENT -->`,
    'Add Barangay Events + close panel-dashboard'
);

// ─── 6. Fix loadDashboardExtras: status badges, empty states, add events ───
// Fix the statusBadge helper to cover all statuses
u = rep(u,
    `                        const statusBadge = (s) => {
                            if (s === 'approved' || s === 'resolved') return 'background:#dcfce7;color:#16a34a';
                            if (s === 'rejected') return 'background:#fee2e2;color:#dc2626';
                            if (s === 'in_progress') return 'background:#dbeafe;color:#1d4ed8';
                            return 'background:#fef3c7;color:#d97706';
                        };`,
    `                        const statusBadge = (s) => {
                            const st = (s||'pending').toLowerCase().replace(/_/g,'-');
                            if (st==='approved' || st==='resolved') return 'background:#dcfce7;color:#16a34a';
                            if (st==='rejected') return 'background:#fee2e2;color:#dc2626';
                            if (st==='cancelled') return 'background:#f1f5f9;color:#64748b';
                            if (st==='returned') return 'background:#dbeafe;color:#2563eb';
                            if (st==='in-progress' || st==='in_progress') return 'background:#dbeafe;color:#1d4ed8';
                            return 'background:#fef9c3;color:#ca8a04';
                        };`,
    'statusBadge: full status coverage'
);

// Fix activity row HTML: better icon circle, hover tint, divider
u = rep(u,
    `                        feedEl.innerHTML = all.map(a => {
                            const d = new Date(a.date).toLocaleDateString('en-US',{month:'short',day:'numeric'});
                            return '<div style="padding:10px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f8fafc;">' +
                                '<div style="width:34px;height:34px;border-radius:10px;background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi ' + a.icon + '" style="color:#2563eb;font-size:15px;"></i></div>' +
                                '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#1e3a5f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'`,
    `                        feedEl.innerHTML = all.map(a => {
                            const d = new Date(a.date).toLocaleDateString('en-US',{month:'short',day:'numeric'});
                            const badgeStyle = statusBadge(a.status);
                            return '<div style="padding:11px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f1f5f9;transition:background 0.15s;cursor:default;" onmouseover="this.style.background=\'#f0f7ff\'" onmouseout="this.style.background=\'\'">' +
                                '<div style="width:38px;height:38px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi ' + a.icon + '" style="color:#2563eb;font-size:16px;"></i></div>' +
                                '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#0f2952;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'`,
    'Activity row HTML: circle icon + hover + divider'
);

// Fix the status badge in the row HTML (after desc + date)
u = rep(u,
    `'<div style="font-size:11px;color:#94a3b8;">' + d + '</div></div>' +
                                '<span style="font-size:11px;font-weight:700;' + statusBadge(a.status) + ';padding:2px 8px;border-radius:20px;white-space:nowrap;">' + (a.status||'pending') + '</span></div>';`,
    `'<div style="font-size:11px;color:#94a3b8;margin-top:2px;">' + d + '</div></div>' +
                                '<span style="font-size:11px;font-weight:600;' + badgeStyle + ';padding:3px 12px;border-radius:999px;white-space:nowrap;text-transform:capitalize;">' + (a.status||'pending').replace(/_/g,' ') + '</span></div>';`,
    'Activity row: badge pill styling'
);

// Fix activity empty state
u = rep(u,
    `feedEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-inbox" style="font-size:24px;display:block;margin-bottom:8px;"></i>No recent activity</div>';`,
    `feedEl.innerHTML = '<div style="padding:36px 24px;text-align:center;"><div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class=\\"bi bi-inbox\\" style=\\"font-size:22px;color:#2563eb;\\"></i></div><div style=\\"font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;\\">No recent activity</div><div style=\\"font-size:12px;color:#94a3b8;\\">Your borrowings and concerns will appear here</div></div>';`,
    'Activity empty state'
);

// Fix announcements empty state (replace broken calendar-x icon approach)
u = rep(u,
    `                    if (!evs || !evs.length) {
                        annEl.innerHTML = '<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-calendar-x" style="font-size:24px;display:block;margin-bottom:8px;"></i>No upcoming announcements</div>';`,
    `                    if (!evs || !evs.length) {
                        annEl.innerHTML = '<div style="padding:36px 24px;text-align:center;"><div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class=\\"bi bi-megaphone-fill\\" style=\\"font-size:22px;color:#2563eb;\\"></i></div><div style=\\"font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;\\">No upcoming announcements</div><div style=\\"font-size:12px;color:#94a3b8;\\">Check back later for barangay updates</div></div>';`,
    'Announcements empty state: megaphone circle'
);

// ─── 7. Add Barangay Events render inside loadDashboardExtras ─────────────
// Insert after the announcements try/catch block (before closing brace of function)
const OLD_EVENTS_END = `            } catch(e) { console.warn('announcements error', e); }
        }`;
const NEW_EVENTS_END = `            } catch(e) { console.warn('announcements error', e); }

            // Barangay Events in dashboard
            try {
                const evSecEl = document.getElementById('dashEventsSection');
                if (evSecEl && window.supabase) {
                    const today = new Date().toISOString().split('T')[0];
                    const { data: evList } = await window.supabase
                        .from('events')
                        .select('id,title,date,start_time,end_time,category,description')
                        .gte('date', today)
                        .order('date', { ascending: true })
                        .limit(4);
                    if (!evList || !evList.length) {
                        evSecEl.innerHTML = '<div style="padding:36px 24px;text-align:center;background:#f0f7ff;margin:12px 16px;border-radius:12px;"><div style="width:52px;height:52px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;"><i class=\\"bi bi-calendar3\\" style=\\"font-size:22px;color:#2563eb;\\"></i></div><div style=\\"font-size:14px;font-weight:600;color:#374151;margin-bottom:4px;\\">No upcoming events at this time</div><div style=\\"font-size:12px;color:#94a3b8;\\">Check back later for new barangay events</div></div>';
                    } else {
                        const catColors = { Sports:'#2563eb', Community:'#16a34a', Health:'#dc2626', Others:'#64748b' };
                        evSecEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;padding:16px;">' +
                            evList.map(ev => {
                                const d = ev.date ? new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }) : '—';
                                const cc = catColors[ev.category] || '#64748b';
                                const timeStr = ev.start_time ? ev.start_time + (ev.end_time ? ' – ' + ev.end_time : '') : '';
                                return '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;border-top:3px solid ' + cc + ';">' +
                                    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
                                    '<span style="font-size:10px;font-weight:700;background:' + cc + '20;color:' + cc + ';padding:2px 8px;border-radius:20px;">' + (ev.category||'Event') + '</span>' +
                                    '</div>' +
                                    '<div style="font-size:13px;font-weight:700;color:#0f2952;margin-bottom:6px;line-height:1.3;">' + (ev.title||'Event') + '</div>' +
                                    '<div style="font-size:11px;color:#64748b;display:flex;align-items:center;gap:4px;"><i class=\\"bi bi-calendar3\\"></i> ' + d + '</div>' +
                                    (timeStr ? '<div style=\\"font-size:11px;color:#94a3b8;display:flex;align-items:center;gap:4px;margin-top:2px;\\"><i class=\\"bi bi-clock\\"></i> ' + timeStr + '</div>' : '') +
                                    '</div>';
                            }).join('') +
                            '</div>';
                    }
                }
            } catch(e) { console.warn('events section error', e); }
        }`;

u = rep(u, OLD_EVENTS_END, NEW_EVENTS_END, 'loadDashboardExtras: events section');

fs.writeFileSync('c:/Users/Kael/OneDrive/Documents/barangay-website/user-portal/user-dashboard.html', u, 'utf8');
console.log('[SAVED] user-dashboard.html');

// ═══════════════════════════════════════════
// ADMIN: Remove System Health + Recent Registrations panels
// ═══════════════════════════════════════════
let a = fs.readFileSync('c:/Users/Kael/OneDrive/Documents/barangay-website/admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// The right column currently has System Health + Recent Registrations stacked
// Replace that right column content with nothing (remove both panels)
const OLD_RIGHT_COL = `                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);padding:18px 20px;">
                                <div style="font-size:14px;font-weight:700;color:#0f2952;margin-bottom:14px;display:flex;align-items:center;gap:8px;"><i class="bi bi-activity" style="color:#2563eb;"></i> System Health</div>
                                <div style="display:flex;flex-direction:column;gap:8px;">
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Database:</span><span id="healthDbStatus" style="color:#6b7280;">Checking...</span></div>
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Authentication:</span><span style="color:#6b7280;">Active</span></div>
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Total Logs:</span><span id="healthTotalLogs" style="color:#6b7280;">—</span></div>
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Last Activity:</span><span id="healthLastActivity" style="color:#6b7280;">—</span></div>
                                </div>
                            </div>
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-person-plus-fill" style="color:#2563eb;"></i> Recent Registrations</div>
                                    <button onclick="switchSection('users',document.querySelector('.sidebar-btn[onclick*=users]'))" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewRecentUsers" style="padding:8px 0;"><div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">Loading...</div></div>
                            </div>`;

a = rep(a, OLD_RIGHT_COL, '', 'Admin: remove System Health + Recent Registrations HTML');

// Also remove the right column wrapper if it becomes empty
// The right column is inside a two-column grid - check structure
// Find the two-panel grid that wraps left (Pending+Concerns) and right (now empty)
// The right column wrapper is: <div style="display:flex;flex-direction:column;gap:16px;">  (the right flex col)
// After removing, the wrapper div will be empty - remove it too
a = rep(a,
    `                        <div style="display:flex;flex-direction:column;gap:16px;">

                        </div>`,
    '',
    'Admin: remove empty right column wrapper'
);

// Also simplify the two-column grid to single column since right is gone
// Find the overview panels grid wrapper
a = rep(a,
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;">`,
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;" id="overviewPanelsGrid">`,
    'Admin: tag overview panels grid'
);

// Clean up loadOverviewPanels to not fetch health/registrations
a = rep(a,
    `                    // System health
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
                    }`,
    '',
    'Admin: remove health/registrations from loadOverviewPanels'
);

fs.writeFileSync('c:/Users/Kael/OneDrive/Documents/barangay-website/admin-portal/admin.html', a, 'utf8');
console.log('[SAVED] admin.html');

// ─── Syntax check ───
['user-portal/user-dashboard.html', 'admin-portal/admin.html'].forEach(file => {
    const path = 'c:/Users/Kael/OneDrive/Documents/barangay-website/' + file;
    const c = fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
    const si = c.lastIndexOf('<script>'); const ei = c.lastIndexOf('</script>');
    const tmp = 'c:/Users/Kael/OneDrive/Documents/barangay-website/tmp-check.js';
    fs.writeFileSync(tmp, c.substring(si + 8, ei), 'utf8');
    try { execSync('node --check "' + tmp + '"', { stdio: 'pipe' }); console.log('[SYNTAX OK]', file); }
    catch (e) { console.error('[SYNTAX ERR]', file, '\n', e.stderr?.toString()); }
    fs.unlinkSync(tmp);
});

console.log('\nDone.');
