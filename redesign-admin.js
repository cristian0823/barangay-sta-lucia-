const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');
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
    'background:#1A3A6B;border-bottom:3px solid #FDB913;',
    'background:#1A3A6B;border-bottom:1px solid rgba(255,255,255,0.12);',
    'admin header remove amber border'
);

// ═══════════════════════════════════════════════════════════════
// 2. SIDEBAR active state: dark navy → #2563eb
// ═══════════════════════════════════════════════════════════════
rep(
    '.sidebar-btn.active { background: #1e2a4a; color: #fff; font-weight: 700; }',
    '.sidebar-btn.active { background: #2563eb; color: #fff; font-weight: 700; }',
    'sidebar active blue'
);

// ═══════════════════════════════════════════════════════════════
// 3. HEADER avatar: amber → blue
// ═══════════════════════════════════════════════════════════════
rep(
    'id="userAvatar" style="width:34px;height:34px;border-radius:50%;background:#FDB913;color:#0F2547;',
    'id="userAvatar" style="width:34px;height:34px;border-radius:50%;background:#2563eb;color:#fff;',
    'header avatar blue'
);
rep(
    'id="profileDropdownAvatar" style="width:40px;height:40px;border-radius:50%;background:#FDB913;color:#0F2547;',
    'id="profileDropdownAvatar" style="width:40px;height:40px;border-radius:50%;background:#2563eb;color:#fff;',
    'dropdown avatar blue'
);

// 4. "Official" badge
rep(
    'font-size:11px;font-weight:600;color:#1A3A6B;background:#EEF2FF;border:1px solid #C7D2FE;border-radius:4px;padding:1px 7px;">Official</span>',
    'font-size:11px;font-weight:600;color:#fff;background:#2563eb;border:1px solid #2563eb;border-radius:4px;padding:1px 7px;">Official</span>',
    'official badge blue'
);

// ═══════════════════════════════════════════════════════════════
// 5. ADMIN BANNER — upgrade + add Today's Summary panel
// ═══════════════════════════════════════════════════════════════
rep(
    '                            <!-- Content -->\n                            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:20px;position:relative;z-index:1;">\n                                <div>\n                                    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FDB913;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="width:18px;height:2px;background:#FDB913;border-radius:2px;display:inline-block;"></span>Barangay Sta. Lucia Admin Portal</div>\n                                    <div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:6px;line-height:1.2;" id="welcomeGreeting">Good morning, Admin</div>\n                                    <div style="font-size:14px;color:rgba(255,255,255,0.65);" id="heroDate">Loading date...</div>\n                                </div>\n                            </div>',
    `                            <!-- Content -->
                            <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:20px;position:relative;z-index:1;">
                                <div>
                                    <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;color:#FDB913;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="width:18px;height:2px;background:#FDB913;border-radius:2px;display:inline-block;"></span>Barangay Sta. Lucia Admin Portal</div>
                                    <div style="font-size:28px;font-weight:800;color:#FFFFFF;margin-bottom:6px;line-height:1.2;" id="welcomeGreeting">Good morning, Admin</div>
                                    <div style="font-size:14px;color:rgba(255,255,255,0.65);" id="heroDate">Loading date...</div>
                                </div>
                                <!-- Today's Summary -->
                                <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.18);border-radius:14px;padding:18px 24px;flex-shrink:0;">
                                    <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.14em;margin-bottom:12px;">Today&#8217;s Summary</div>
                                    <div style="display:flex;gap:20px;align-items:center;">
                                        <div style="text-align:center;">
                                            <div id="todayNewRequests" style="font-size:30px;font-weight:800;color:#fff;line-height:1;">—</div>
                                            <div style="font-size:10px;color:rgba(255,255,255,0.65);font-weight:600;margin-top:3px;">New Requests</div>
                                        </div>
                                        <div style="width:1px;height:40px;background:rgba(255,255,255,0.2);"></div>
                                        <div style="text-align:center;">
                                            <div id="todayNewConcerns" style="font-size:30px;font-weight:800;color:#fff;line-height:1;">—</div>
                                            <div style="font-size:10px;color:rgba(255,255,255,0.65);font-weight:600;margin-top:3px;">New Concerns</div>
                                        </div>
                                    </div>
                                </div>
                            </div>`,
    'admin banner today summary'
);

// ═══════════════════════════════════════════════════════════════
// 6. STAT CARDS — add onclick navigation + improve styling
// ═══════════════════════════════════════════════════════════════
// Equipment Requests card
rep(
    '<div class="gov-stat-card" style="background:#fff;border:1px solid #D1D5DB;border-left:3px solid #1A3A6B;border-radius:8px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.07);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.12)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,0.07)\';this.style.transform=\'\'">\n                                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                                    <div style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Equipment Requests</div>\n                                    <div style="width:40px;height:40px;background:rgba(26,58,107,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-box-seam-fill" style="font-size:20px;color:#1A3A6B;"></i></div>\n                                </div>\n                                <div class="stat-number" style="font-size:36px;font-weight:700;color:#1A1A2E;line-height:1;margin-top:8px;" id="pendingRequests">&#8212;</div>\n                                <div style="font-size:12px;color:#6B7280;margin-top:2px;">pending</div>\n                            </div>',
    `<div class="gov-stat-card" style="background:#fff;border:1.5px solid #e2e8f0;border-left:4px solid #1e3a5f;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;" onclick="switchSection('requests',document.querySelector('.sidebar-btn[onclick*=requests]'))" onmouseover="this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)';this.style.transform='translateY(-3px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';this.style.transform=''">
                                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Equipment Requests</div>
                                    <div style="width:42px;height:42px;background:rgba(37,99,235,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-box-seam-fill" style="font-size:20px;color:#2563eb;"></i></div>
                                </div>
                                <div class="stat-number" style="font-size:38px;font-weight:800;color:#0f2952;line-height:1;margin-top:8px;" id="pendingRequests">—</div>
                                <div style="font-size:12px;color:#6B7280;margin-top:2px;">pending</div>
                                <div style="position:absolute;bottom:12px;right:14px;font-size:11px;color:#2563eb;font-weight:600;">View &#8594;</div>
                            </div>`,
    'stat card equipment requests redesign'
);

// Open Concerns card
rep(
    '<div class="gov-stat-card" style="background:#fff;border:1px solid #D1D5DB;border-left:3px solid #1A3A6B;border-radius:8px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,0.07);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.12)\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,0.07)\';this.style.transform=\'\'">\n                                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">\n                                    <div style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.08em;">Open Concerns</div>\n                                    <div style="width:40px;height:40px;background:rgba(26,58,107,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-megaphone-fill" style="font-size:20px;color:#1A3A6B;"></i></div>\n                                </div>\n                                <div class="stat-number" style="font-size:36px;font-weight:700;color:#1A1A2E;line-height:1;margin-top:8px;" id="pendingConcerns">&#8212;</div>\n                                <div style="font-size:12px;color:#6B7280;margin-top:2px;">unresolved</div>\n                            </div>',
    `<div class="gov-stat-card" style="background:#fff;border:1.5px solid #e2e8f0;border-left:4px solid #1e3a5f;border-radius:14px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;" onclick="switchSection('concerns',document.querySelector('.sidebar-btn[onclick*=concerns]'))" onmouseover="this.style.boxShadow='0 8px 24px rgba(37,99,235,0.15)';this.style.transform='translateY(-3px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)';this.style.transform=''">
                                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                                    <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Open Concerns</div>
                                    <div style="width:42px;height:42px;background:rgba(37,99,235,0.08);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-megaphone-fill" style="font-size:20px;color:#2563eb;"></i></div>
                                </div>
                                <div class="stat-number" style="font-size:38px;font-weight:800;color:#0f2952;line-height:1;margin-top:8px;" id="pendingConcerns">—</div>
                                <div style="font-size:12px;color:#6B7280;margin-top:2px;">unresolved</div>
                                <div style="position:absolute;bottom:12px;right:14px;font-size:11px;color:#2563eb;font-weight:600;">View &#8594;</div>
                            </div>`,
    'stat card concerns redesign'
);

// ═══════════════════════════════════════════════════════════════
// 7. INVENTORY STAT CARDS — all blue
// ═══════════════════════════════════════════════════════════════
rep(
    'background:#DCFCE7;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-check-circle-fill" style="color:#16a34a;font-size:16px;"></i></div>\n                                <div><div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Available</div><div style="font-size:22px;font-weight:700;color:#166534;',
    'background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-check-circle-fill" style="color:#2563eb;font-size:16px;"></i></div>\n                                <div><div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Available</div><div style="font-size:22px;font-weight:700;color:#1e3a5f;',
    'inventory available green→blue'
);
rep(
    'background:#FFEDD5;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-wrench-adjustable" style="color:#c2410c;font-size:16px;"></i></div>\n                                <div><div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Under Repair</div><div style="font-size:22px;font-weight:700;color:#9A3412;',
    'background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-wrench-adjustable" style="color:#2563eb;font-size:16px;"></i></div>\n                                <div><div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Under Repair</div><div style="font-size:22px;font-weight:700;color:#1e3a5f;',
    'inventory repair orange→blue'
);
rep(
    'background:#FEE2E2;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-trash3-fill" style="color:#CE1126;font-size:16px;"></i></div>\n                                <div><div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">For Disposal</div><div style="font-size:22px;font-weight:700;color:#991b1b;',
    'background:#eff6ff;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-trash3-fill" style="color:#2563eb;font-size:16px;"></i></div>\n                                <div><div style="font-size:11px;color:#6B7280;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">For Disposal</div><div style="font-size:22px;font-weight:700;color:#1e3a5f;',
    'inventory disposal red→blue'
);

// ═══════════════════════════════════════════════════════════════
// 8. EVENT MODAL — redesign with blue gradient header
// ═══════════════════════════════════════════════════════════════
// Update modal-header CSS
rep(
    '.modal-header { display: flex; align-items: center; justify-content: space-between;\n        padding: 16px 20px; border-bottom: 1px solid #E5E7EB; }',
    `.modal-header { display: flex; align-items: center; justify-content: space-between;
        padding: 20px 24px; background: linear-gradient(135deg,#1e3a5f,#2563eb); border-radius: 16px 16px 0 0; }
      .modal-header h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
      .modal-close { background: rgba(255,255,255,0.15) !important; border: none !important; color: #fff !important; cursor: pointer; width: 30px !important; height: 30px !important; border-radius: 50% !important; font-size: 18px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
      .modal-close:hover { background: rgba(255,255,255,0.25) !important; }`,
    'modal-header blue gradient CSS'
);
// Remove old h3 style since we added it above
rep(
    '.modal-header h3 { font-size: 16px; font-weigh',
    '/* .modal-header h3 moved */ .modal-header-old { font-size: 16px; font-weigh',
    'modal h3 deduplicate'
);

// Form input height + focus
rep(
    '.form-group input, .form-group select, .form-group textarea {\n        width: 100%; padding: 9px 12px; border: 1px solid #D1D5DB; border-radius: 6px;\n        font-size: 13px; font-family: inherit; color: #1A1A2E; background: #fff; outline: none; transition: border-color 0.15s; }',
    `.form-group input, .form-group select, .form-group textarea {
        width: 100%; padding: 10px 14px; border: 1.5px solid #D1D5DB; border-radius: 10px;
        font-size: 13px; font-family: inherit; color: #1A1A2E; background: #fff; outline: none; transition: border-color 0.15s; height: 48px; box-sizing: border-box; }
      .form-group textarea { height: auto; min-height: 120px; resize: vertical; }`,
    'form inputs improved height'
);

// Focus color for form inputs
rep(
    'onfocus="this.style.borderColor=\'#1A3A6B\'" onblur="this.style.borderColor=\'#D1D5DB\'">\n                    </div>\n                    <div class="form-group">\n                        <label for="eventTime">',
    'onfocus="this.style.borderColor=\'#2563eb\';this.style.boxShadow=\'0 0 0 3px rgba(37,99,235,0.12)\'" onblur="this.style.borderColor=\'#D1D5DB\';this.style.boxShadow=\'none\'">\n                    </div>\n                    <div class="form-group">\n                        <label for="eventTime">',
    'eventDate focus blue'
);

// Create Event button → blue
rep(
    '<button type="submit" class="btn btn-primary" style="width: 100%;">Create Event</button>',
    '<button type="submit" class="btn btn-primary" style="width:100%;height:52px;background:#2563eb;border-radius:10px;font-size:15px;font-weight:700;">Create Event</button>',
    'create event btn blue'
);

// btn-primary color update
rep(
    '.btn-primary { background: #1A3A6B; color: #fff; }\n      .btn-primary:hover { background: #0F2547; }',
    '.btn-primary { background: #2563eb; color: #fff; }\n      .btn-primary:hover { background: #1d4ed8; }',
    'btn-primary blue'
);

// ═══════════════════════════════════════════════════════════════
// 9. OVERVIEW SECTION — add Pending Approvals + Concerns panels + System Health + Registrations
// ═══════════════════════════════════════════════════════════════
// Find the end of the KPI stat cards grid and insert the new panels after it
const kpiEnd = c.indexOf('<!-- QUICK ACCESS');
const reqSecStart = c.indexOf('<!-- requests-section');
// Find a good insertion point - after KPI cards closing div
const insertMarker = '\n\n                        <!-- KPI STAT CARDS END -->';
const kpiCardsDiv = c.indexOf('</div>\n\n\n                        <!-- requests-section');
if (kpiCardsDiv !== -1) {
    const newPanels = `


                        <!-- OVERVIEW PANELS ROW -->
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px;">
                            <!-- Pending Approvals -->
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-box-seam-fill" style="color:#2563eb;"></i> Pending Approvals</div>
                                    <button onclick="switchSection('requests',document.querySelector('.sidebar-btn[onclick*=requests]'))" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &#8594;</button>
                                </div>
                                <div id="overviewPendingList" style="padding:8px 0;">
                                    <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-hourglass" style="font-size:20px;display:block;margin-bottom:8px;"></i>Loading...</div>
                                </div>
                            </div>
                            <!-- Unresolved Concerns -->
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-megaphone-fill" style="color:#2563eb;"></i> Unresolved Concerns</div>
                                    <button onclick="switchSection('concerns',document.querySelector('.sidebar-btn[onclick*=concerns]'))" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &#8594;</button>
                                </div>
                                <div id="overviewConcernsList" style="padding:8px 0;">
                                    <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-hourglass" style="font-size:20px;display:block;margin-bottom:8px;"></i>Loading...</div>
                                </div>
                            </div>
                        </div>

                        <!-- SYSTEM HEALTH + RECENT REGISTRATIONS ROW -->
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px;">
                            <!-- System Health -->
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);padding:18px 20px;">
                                <div style="font-size:14px;font-weight:700;color:#0f2952;margin-bottom:14px;display:flex;align-items:center;gap:8px;"><i class="bi bi-activity" style="color:#2563eb;"></i> System Health</div>
                                <div id="overviewHealthBar" style="display:flex;flex-direction:column;gap:8px;">
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Database:</span><span style="color:#6b7280;">Checking...</span></div>
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#16a34a;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Authentication:</span><span style="color:#6b7280;">Active</span></div>
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Total Logs:</span><span id="healthTotalLogs" style="color:#6b7280;">—</span></div>
                                    <div style="display:flex;align-items:center;gap:8px;font-size:13px;"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;"></span><span style="color:#374151;font-weight:600;">Last Activity:</span><span id="healthLastActivity" style="color:#6b7280;">—</span></div>
                                </div>
                            </div>
                            <!-- Recent Registrations -->
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-person-plus-fill" style="color:#2563eb;"></i> Recent Registrations</div>
                                    <button onclick="switchSection('users',document.querySelector('.sidebar-btn[onclick*=users]'))" style="font-size:12px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &#8594;</button>
                                </div>
                                <div id="overviewRecentUsers" style="padding:8px 0;">
                                    <div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;"><i class="bi bi-hourglass" style="font-size:20px;display:block;margin-bottom:8px;"></i>Loading...</div>
                                </div>
                            </div>
                        </div>`;

    c = c.substring(0, kpiCardsDiv) + newPanels + c.substring(kpiCardsDiv);
    count++;
    console.log('OK: admin overview panels inserted');
} else {
    console.log('MISS: overview panels insertion point');
}

// ═══════════════════════════════════════════════════════════════
// 10. ADD JS for Today's Summary + Overview Panels
// ═══════════════════════════════════════════════════════════════
const jsMarker = 'function switchSection(sectionId, btn) {';
const jsIdx = c.indexOf(jsMarker);
if (jsIdx !== -1) {
    const newJS = `// ── OVERVIEW PANEL LOADERS ──────────────────────────────────────
        async function loadOverviewPanels() {
            try {
                // Today's summary
                const today = new Date().toISOString().split('T')[0];
                const [reqRes, conRes] = await Promise.all([
                    supabase.from('borrowings').select('id', {count:'exact',head:true}).gte('created_at', today),
                    supabase.from('concerns').select('id', {count:'exact',head:true}).gte('created_at', today)
                ]);
                document.getElementById('todayNewRequests').textContent = reqRes.count ?? 0;
                document.getElementById('todayNewConcerns').textContent = conRes.count ?? 0;

                // Pending approvals list
                const { data: pendingReqs } = await supabase.from('borrowings').select('id,equipment,quantity,created_at,users(full_name)').eq('status','pending').order('created_at',{ascending:false}).limit(5);
                const pendingEl = document.getElementById('overviewPendingList');
                if (pendingEl) {
                    if (!pendingReqs || pendingReqs.length === 0) {
                        pendingEl.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">No pending requests</div>';
                    } else {
                        pendingEl.innerHTML = pendingReqs.map(r => {
                            const name = (r.users && r.users.full_name) || 'Unknown';
                            const d = new Date(r.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});
                            return '<div style="padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f8fafc;">' +
                                '<div><div style="font-size:13px;font-weight:600;color:#1e3a5f;">' + (r.equipment || '—') + ' x' + (r.quantity||1) + '</div>' +
                                '<div style="font-size:11px;color:#6b7280;">' + name + ' · ' + d + '</div></div>' +
                                '<span style="font-size:11px;font-weight:700;background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:20px;">Pending</span></div>';
                        }).join('');
                    }
                }

                // Unresolved concerns
                const { data: unresConcerns } = await supabase.from('concerns').select('id,title,category,status,created_at,users(full_name)').neq('status','resolved').order('created_at',{ascending:false}).limit(5);
                const concEl = document.getElementById('overviewConcernsList');
                if (concEl) {
                    if (!unresConcerns || unresConcerns.length === 0) {
                        concEl.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">No unresolved concerns</div>';
                    } else {
                        concEl.innerHTML = unresConcerns.map(c => {
                            const name = (c.users && c.users.full_name) || 'Unknown';
                            const d = new Date(c.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});
                            const sb = c.status === 'in_progress' ? 'background:#dbeafe;color:#1d4ed8' : 'background:#fef3c7;color:#d97706';
                            return '<div style="padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f8fafc;">' +
                                '<div><div style="font-size:13px;font-weight:600;color:#1e3a5f;">' + (c.title || 'Concern') + '</div>' +
                                '<div style="font-size:11px;color:#6b7280;">' + name + ' · ' + d + '</div></div>' +
                                '<span style="font-size:11px;font-weight:700;' + sb + ';padding:2px 8px;border-radius:20px;">' + (c.status || 'open') + '</span></div>';
                        }).join('');
                    }
                }

                // System health
                const { count: logCount } = await supabase.from('audit_log').select('id',{count:'exact',head:true});
                const { data: lastLog } = await supabase.from('audit_log').select('created_at').order('created_at',{ascending:false}).limit(1);
                const healthLogs = document.getElementById('healthTotalLogs');
                const healthLast = document.getElementById('healthLastActivity');
                if (healthLogs) healthLogs.textContent = logCount ?? 0;
                if (healthLast && lastLog && lastLog[0]) {
                    healthLast.textContent = new Date(lastLog[0].created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
                }
                // DB connected indicator
                const dbEl = document.querySelector('#overviewHealthBar div:first-child span:last-child');
                if (dbEl) dbEl.textContent = 'Connected';

                // Recent registrations
                const { data: recentUsers } = await supabase.from('users').select('id,full_name,username,created_at').neq('role','admin').order('created_at',{ascending:false}).limit(3);
                const usersEl = document.getElementById('overviewRecentUsers');
                if (usersEl) {
                    if (!recentUsers || recentUsers.length === 0) {
                        usersEl.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:13px;">No recent registrations</div>';
                    } else {
                        usersEl.innerHTML = recentUsers.map(u => {
                            const initials = (u.full_name || u.username || '?').split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
                            const d = new Date(u.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
                            return '<div style="padding:10px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #f8fafc;">' +
                                '<div style="width:36px;height:36px;border-radius:50%;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">' + initials + '</div>' +
                                '<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#1e3a5f;">' + (u.full_name || u.username) + '</div>' +
                                '<div style="font-size:11px;color:#6b7280;">' + d + '</div></div>' +
                                '<button onclick="switchSection(\'users\',document.querySelector(\'.sidebar-btn[onclick*=users]\'))" style="font-size:11px;color:#2563eb;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View &#8594;</button></div>';
                        }).join('');
                    }
                }
            } catch(e) { console.error('loadOverviewPanels error', e); }
        }

        `;
    c = c.substring(0, jsIdx) + newJS + c.substring(jsIdx);
    count++;
    console.log('OK: overview JS added');
}

// Call loadOverviewPanels when switchSection shows overview
rep(
    "if (sectionId === 'overview') {",
    "if (sectionId === 'overview') { loadOverviewPanels();",
    'call loadOverviewPanels on overview switch'
);

// Also call on initial load
rep(
    'switchSection(\'overview\', document.querySelector(\'.sidebar-btn.active\'));',
    'switchSection(\'overview\', document.querySelector(\'.sidebar-btn.active\')); loadOverviewPanels();',
    'call loadOverviewPanels on initial load'
);

// ═══════════════════════════════════════════════════════════════
// 11. WHITE GAP FIX
// ═══════════════════════════════════════════════════════════════
rep(
    'body { font-family: \'Inter\', sans-serif; background: #EDEEF2; color: #1A1A2E; }',
    'html, body { height: 100%; margin: 0; padding: 0; }\n      body { font-family: \'Inter\', sans-serif; background: #EDEEF2; color: #1A1A2E; }',
    'white gap fix html/body'
);

// ═══════════════════════════════════════════════════════════════
fs.writeFileSync('admin-portal/admin.html', c);
console.log('\nAdmin: ' + count + ' changes applied.');
