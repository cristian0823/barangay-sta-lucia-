const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// =====================================================================
// 1. WEEKLY ACTIVITY CHART (#14) — add chart canvas after overview panels
// =====================================================================
const OLD_OVERVIEW_END = `                        <!-- OVERVIEW PANELS ROW -->
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px;">
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-box-seam-fill" style="color:#1A3A6B;"></i> Pending Approvals</div>
                                    <button onclick="switchSection('requests',document.querySelector('.sidebar-btn[onclick*=requests]'))" style="font-size:12px;color:#1A3A6B;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewPendingList" style="padding:8px 0;"><div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">Loading...</div></div>
                            </div>
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-megaphone-fill" style="color:#1A3A6B;"></i> Unresolved Concerns</div>
                                    <button onclick="switchSection('concerns',document.querySelector('.sidebar-btn[onclick*=concerns]'))" style="font-size:12px;color:#1A3A6B;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewConcernsList" style="padding:8px 0;"><div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">Loading...</div></div>
                            </div>
                        </div>`;

const NEW_OVERVIEW_END = `                        <!-- OVERVIEW PANELS ROW -->
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:22px;">
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-box-seam-fill" style="color:#1A3A6B;"></i> Pending Approvals</div>
                                    <button onclick="switchSection('requests',document.querySelector('.sidebar-btn[onclick*=requests]'))" style="font-size:12px;color:#1A3A6B;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewPendingList" style="padding:8px 0;"><div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">Loading...</div></div>
                            </div>
                            <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;">
                                <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                    <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-megaphone-fill" style="color:#1A3A6B;"></i> Unresolved Concerns</div>
                                    <button onclick="switchSection('concerns',document.querySelector('.sidebar-btn[onclick*=concerns]'))" style="font-size:12px;color:#1A3A6B;font-weight:600;background:none;border:none;cursor:pointer;padding:0;">View all &rarr;</button>
                                </div>
                                <div id="overviewConcernsList" style="padding:8px 0;"><div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">Loading...</div></div>
                            </div>
                        </div>

                        <!-- WEEKLY ACTIVITY CHART -->
                        <div style="background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.07);overflow:hidden;margin-bottom:22px;">
                            <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;display:flex;align-items:center;justify-content:space-between;">
                                <div style="font-size:14px;font-weight:700;color:#0f2952;display:flex;align-items:center;gap:8px;"><i class="bi bi-bar-chart-fill" style="color:#1A3A6B;"></i> Weekly Activity</div>
                                <span style="font-size:12px;color:#6b7280;font-weight:600;">Last 4 weeks</span>
                            </div>
                            <div style="padding:20px;">
                                <canvas id="weeklyActivityChart" height="80"></canvas>
                            </div>
                        </div>`;

let idx = c.indexOf(OLD_OVERVIEW_END);
if (idx === -1) { console.log('MISS #1 overview panels'); } else { c = c.substring(0, idx) + NEW_OVERVIEW_END + c.substring(idx + OLD_OVERVIEW_END.length); console.log('OK #1 weekly chart HTML'); }

// =====================================================================
// 2. WEEKLY CHART DATA — add to loadOverviewPanels
// =====================================================================
const OLD_LOAD_OVERVIEW_END = `                } catch (err) {
                    console.error('loadOverviewPanels error:', err);
                }
            }

            function switchEventsTab`;

const NEW_LOAD_OVERVIEW_END = `
                    // Weekly activity chart (#14)
                    try {
                        const fourWeeksAgo = new Date(); fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
                        const fwStr = fourWeeksAgo.toISOString();
                        const [wBRes, wCRes, wRRes] = await Promise.all([
                            supabase.from('borrowings').select('created_at').gte('created_at', fwStr),
                            supabase.from('concerns').select('created_at').gte('created_at', fwStr),
                            supabase.from('facility_reservations').select('created_at').gte('created_at', fwStr)
                        ]);
                        const wLabels = [], wBorr = [0,0,0,0], wCon = [0,0,0,0], wRes = [0,0,0,0];
                        const now2 = new Date();
                        for (let w = 3; w >= 0; w--) {
                            const ws = new Date(now2); ws.setDate(now2.getDate() - (w+1)*7);
                            const we = new Date(now2); we.setDate(now2.getDate() - w*7);
                            wLabels.push('Week ' + (4-w));
                            const i = 3-w;
                            (wBRes.data||[]).forEach(r => { const d=new Date(r.created_at); if(d>=ws&&d<we) wBorr[i]++; });
                            (wCRes.data||[]).forEach(r => { const d=new Date(r.created_at); if(d>=ws&&d<we) wCon[i]++; });
                            (wRRes.data||[]).forEach(r => { const d=new Date(r.created_at); if(d>=ws&&d<we) wRes[i]++; });
                        }
                        const cEl = document.getElementById('weeklyActivityChart');
                        if (cEl && typeof Chart !== 'undefined') {
                            if (window._weeklyChart) window._weeklyChart.destroy();
                            window._weeklyChart = new Chart(cEl, {
                                type: 'bar',
                                data: { labels: wLabels, datasets: [
                                    { label: 'Equipment Requests', data: wBorr, backgroundColor: '#1A3A6B', borderRadius: 4 },
                                    { label: 'Concerns',           data: wCon,  backgroundColor: '#dc2626', borderRadius: 4 },
                                    { label: 'Reservations',       data: wRes,  backgroundColor: '#16a34a', borderRadius: 4 }
                                ]},
                                options: { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
                            });
                        }
                    } catch(e) { console.warn('Weekly chart error', e); }

                } catch (err) {
                    console.error('loadOverviewPanels error:', err);
                }
            }

            function switchEventsTab`;

idx = c.indexOf(OLD_LOAD_OVERVIEW_END);
if (idx === -1) { console.log('MISS #2 loadOverviewPanels end'); } else { c = c.substring(0, idx) + NEW_LOAD_OVERVIEW_END + c.substring(idx + OLD_LOAD_OVERVIEW_END.length); console.log('OK #2 weekly chart data'); }

// =====================================================================
// 3. STOCK THRESHOLD ADMIN SETTINGS — add after global delivery banner
// =====================================================================
const OLD_AFTER_DELIV = `                        <!-- STAT PILLS -->
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">`;

const NEW_AFTER_DELIV = `                        <!-- STOCK THRESHOLD SETTINGS -->
                        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 20px;border-radius:12px;margin-bottom:16px;border:1.5px solid #e2e8f0;background:#f8fafc;flex-wrap:wrap;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <i class="bi bi-sliders2" style="font-size:18px;color:#1A3A6B;flex-shrink:0;"></i>
                                <div>
                                    <div style="font-size:13px;font-weight:700;color:#0f2952;">Stock Alert Thresholds</div>
                                    <div style="font-size:11px;color:#6b7280;">Set when stock bars turn yellow (low) and red (critical)</div>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:14px;flex-shrink:0;">
                                <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#374151;">
                                    <span style="color:#d97706;">Low %</span>
                                    <input type="number" id="threshLow" min="1" max="99" value="40" style="width:56px;padding:5px 8px;border:1px solid #D1D5DB;border-radius:6px;font-size:12px;font-weight:700;color:#1A1A2E;font-family:inherit;text-align:center;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                                </label>
                                <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:#374151;">
                                    <span style="color:#dc2626;">Critical %</span>
                                    <input type="number" id="threshHigh" min="1" max="99" value="75" style="width:56px;padding:5px 8px;border:1px solid #D1D5DB;border-radius:6px;font-size:12px;font-weight:700;color:#1A1A2E;font-family:inherit;text-align:center;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                                </label>
                                <button onclick="saveStockThresholds()" style="padding:6px 16px;background:#1A3A6B;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.15s;" onmouseover="this.style.background='#0F2547'" onmouseout="this.style.background='#1A3A6B'">Save</button>
                            </div>
                        </div>

                        <!-- STAT PILLS -->
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">`;

idx = c.indexOf(OLD_AFTER_DELIV);
if (idx === -1) { console.log('MISS #3 after delivery'); } else { c = c.substring(0, idx) + NEW_AFTER_DELIV + c.substring(idx + OLD_AFTER_DELIV.length); console.log('OK #3 stock threshold UI'); }

// =====================================================================
// 4. EQUIPMENT EDIT FORM — add Variation + Per-item Delivery fields (#4, #6)
// =====================================================================
const OLD_EDIT_FORM_END = `                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#374151;font-weight:500;padding:10px 12px;background:#fff;border:1px solid #D1D5DB;border-radius:6px;margin-bottom:8px;">
                            <input type="checkbox" id="editEquipArchived" style="width:15px;height:15px;cursor:pointer;accent-color:#1A3A6B;flex-shrink:0;">
                            <span>Archive this equipment (hide from active inventory)</span>
                        </label>

                    </div>
                </form>`;

const NEW_EDIT_FORM_END = `                        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#374151;font-weight:500;padding:10px 12px;background:#fff;border:1px solid #D1D5DB;border-radius:6px;margin-bottom:8px;">
                            <input type="checkbox" id="editEquipArchived" style="width:15px;height:15px;cursor:pointer;accent-color:#1A3A6B;flex-shrink:0;">
                            <span>Archive this equipment (hide from active inventory)</span>
                        </label>

                    </div>
                    <div style="background:#F8FAFF;border:1px solid #E5E9F5;border-radius:10px;padding:16px 20px;">
                        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;color:#1A3A6B;text-transform:uppercase;margin-bottom:14px;">Advanced Settings</div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block;font-size:12px;font-weight:600;color:#374151;margin-bottom:5px;">Variation <span style="font-size:11px;color:#9CA3AF;font-weight:400;">(optional)</span></label>
                            <input type="text" id="editEquipVariation" placeholder="e.g. Blue, Red, Large, Small..." style="width:100%;padding:8px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#1A1A2E;background:#fff;outline:none;font-family:inherit;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                        </div>
                        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:10px 12px;background:#fff;border:1px solid #D1D5DB;border-radius:6px;">
                            <div style="position:relative;width:44px;height:24px;flex-shrink:0;">
                                <input type="checkbox" id="editEquipDelivery" style="opacity:0;width:0;height:0;position:absolute;" onchange="(function(v){var t=document.getElementById('editDelivTrack');var k=document.getElementById('editDelivKnob');if(t)t.style.background=v?'#16a34a':'#D1D5DB';if(k)k.style.transform=v?'translateX(20px)':'translateX(0)';})(this.checked)">
                                <span id="editDelivTrack" style="position:absolute;inset:0;border-radius:24px;background:#D1D5DB;transition:background 0.2s;"></span>
                                <span id="editDelivKnob" style="position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.25);transition:transform 0.2s;"></span>
                            </div>
                            <div>
                                <div style="font-size:13px;font-weight:600;color:#374151;">Allow Delivery</div>
                                <div style="font-size:11px;color:#6B7280;">Residents can request delivery for this item</div>
                            </div>
                        </label>
                    </div>
                </form>`;

idx = c.indexOf(OLD_EDIT_FORM_END);
if (idx === -1) { console.log('MISS #4 edit form end'); } else { c = c.substring(0, idx) + NEW_EDIT_FORM_END + c.substring(idx + OLD_EDIT_FORM_END.length); console.log('OK #4 edit form fields'); }

// =====================================================================
// 5. openEditEquipmentModal — populate variation + delivery fields
// =====================================================================
const OLD_OPEN_EDIT = `                document.getElementById('editEquipImage').value = '';
                document.getElementById('editPhotoLabel').textContent = 'Click to upload new photo';
                calcEditAvail();`;

const NEW_OPEN_EDIT = `                document.getElementById('editEquipImage').value = '';
                document.getElementById('editPhotoLabel').textContent = 'Click to upload new photo';
                // Variation
                const varField = document.getElementById('editEquipVariation');
                if (varField) varField.value = equipment.variation || '';
                // Per-item delivery
                const ds = JSON.parse(localStorage.getItem('brgy_delivery_settings') || '{}');
                const delivOn = ds['id_' + equipment.id] !== undefined ? ds['id_' + equipment.id] : false;
                const delivCb = document.getElementById('editEquipDelivery');
                const delivTrack = document.getElementById('editDelivTrack');
                const delivKnob = document.getElementById('editDelivKnob');
                if (delivCb) { delivCb.checked = delivOn; }
                if (delivTrack) delivTrack.style.background = delivOn ? '#16a34a' : '#D1D5DB';
                if (delivKnob) delivKnob.style.transform = delivOn ? 'translateX(20px)' : 'translateX(0)';
                calcEditAvail();`;

idx = c.indexOf(OLD_OPEN_EDIT);
if (idx === -1) { console.log('MISS #5 openEditEquipmentModal'); } else { c = c.substring(0, idx) + NEW_OPEN_EDIT + c.substring(idx + OLD_OPEN_EDIT.length); console.log('OK #5 populate delivery+variation'); }

// =====================================================================
// 6. editEquipmentForm submit — save variation + per-item delivery
// =====================================================================
const OLD_SUBMIT_UPDATES = `                const updates = {
                    name: document.getElementById('editEquipName').value,
                    icon: document.getElementById('editEquipIcon').value,
                    equipCategory: document.getElementById('editEquipCategory').value,
                    description: document.getElementById('editEquipDesc').value,
                    quantity: newQty,
                    broken: newBroken,
                    disposal: newDisposal,
                    isArchived: document.getElementById('editEquipArchived').checked
                };`;

const NEW_SUBMIT_UPDATES = `                const updates = {
                    name: document.getElementById('editEquipName').value,
                    icon: document.getElementById('editEquipIcon').value,
                    equipCategory: document.getElementById('editEquipCategory').value,
                    description: document.getElementById('editEquipDesc').value,
                    quantity: newQty,
                    broken: newBroken,
                    disposal: newDisposal,
                    isArchived: document.getElementById('editEquipArchived').checked,
                    variation: (document.getElementById('editEquipVariation') || {}).value || ''
                };
                // Save per-item delivery setting to localStorage
                const delivCbEl = document.getElementById('editEquipDelivery');
                if (delivCbEl) {
                    const dsObj = JSON.parse(localStorage.getItem('brgy_delivery_settings') || '{}');
                    dsObj['id_' + id] = delivCbEl.checked;
                    localStorage.setItem('brgy_delivery_settings', JSON.stringify(dsObj));
                }`;

idx = c.indexOf(OLD_SUBMIT_UPDATES);
if (idx === -1) { console.log('MISS #6 submit updates'); } else { c = c.substring(0, idx) + NEW_SUBMIT_UPDATES + c.substring(idx + OLD_SUBMIT_UPDATES.length); console.log('OK #6 save delivery+variation'); }

// =====================================================================
// 7. saveStockThresholds function — add near loadOverviewPanels
// =====================================================================
const OLD_INIT_WELCOME_CLOCK = `            function switchEventsTab(tab) {`;

const NEW_INIT_WELCOME_CLOCK = `            function saveStockThresholds() {
                const low  = parseInt(document.getElementById('threshLow')?.value) || 40;
                const high = parseInt(document.getElementById('threshHigh')?.value) || 75;
                if (low >= high) { showAlert('Critical % must be greater than Low %', 'error'); return; }
                localStorage.setItem('brgy_stock_thresholds', JSON.stringify({ low, high }));
                showAlert('Stock thresholds saved (' + low + '% low, ' + high + '% critical)', 'success');
            }

            function switchEventsTab(tab) {`;

idx = c.indexOf(OLD_INIT_WELCOME_CLOCK);
if (idx === -1) { console.log('MISS #7 saveStockThresholds'); } else { c = c.substring(0, idx) + NEW_INIT_WELCOME_CLOCK + c.substring(idx + OLD_INIT_WELCOME_CLOCK.length); console.log('OK #7 saveStockThresholds'); }

// =====================================================================
// 8. Load saved threshold values on equipment section open
// =====================================================================
const OLD_LOAD_EQUIP = `            async function loadEquipment() {`;

const NEW_LOAD_EQUIP = `            function loadStockThresholdUI() {
                const t = JSON.parse(localStorage.getItem('brgy_stock_thresholds') || '{"high":75,"low":40}');
                const lowEl  = document.getElementById('threshLow');
                const highEl = document.getElementById('threshHigh');
                if (lowEl)  lowEl.value  = t.low;
                if (highEl) highEl.value = t.high;
            }

            async function loadEquipment() {`;

idx = c.indexOf(OLD_LOAD_EQUIP);
if (idx === -1) { console.log('MISS #8 loadStockThresholdUI'); } else { c = c.substring(0, idx) + NEW_LOAD_EQUIP + c.substring(idx + OLD_LOAD_EQUIP.length); console.log('OK #8 loadStockThresholdUI'); }

// =====================================================================
// 9. Call loadStockThresholdUI in switchSection when equipment section opens
// =====================================================================
const OLD_SWITCH_SECTION = `            function switchSection(section, btn) {`;

const NEW_SWITCH_SECTION = `            function switchSection(section, btn) {
                if (section === 'equipment') { setTimeout(loadStockThresholdUI, 50); }`;

idx = c.indexOf(OLD_SWITCH_SECTION);
if (idx === -1) { console.log('MISS #9 switchSection'); } else { c = c.substring(0, idx) + NEW_SWITCH_SECTION + c.substring(idx + OLD_SWITCH_SECTION.length); console.log('OK #9 switchSection loadThreshold'); }

// =====================================================================
// 10. SIDEBAR — add Announcements button between events and equipment
// =====================================================================
const OLD_SIDEBAR_EVENTS_BTN = `        <button class="sidebar-btn" onclick="switchSection('equipment', this)">`;

const NEW_SIDEBAR_EVENTS_BTN = `        <button class="sidebar-btn" onclick="switchSection('announcements', this)">
            <i class="bi bi-megaphone-fill"></i>
            <span>Announcements</span>
        </button>
        <button class="sidebar-btn" onclick="switchSection('equipment', this)">`;

idx = c.indexOf(OLD_SIDEBAR_EVENTS_BTN);
if (idx === -1) { console.log('MISS #10 sidebar announcements'); } else { c = c.substring(0, idx) + NEW_SIDEBAR_EVENTS_BTN + c.substring(idx + OLD_SIDEBAR_EVENTS_BTN.length); console.log('OK #10 sidebar announcements'); }

// =====================================================================
// 11. ANNOUNCEMENTS SECTION — add before equipment-section div
// =====================================================================
const OLD_EQUIP_SECTION_START = `                    <div id="equipment-section" class="section-container" style="display: none;">`;

const NEW_EQUIP_SECTION_START = `                    <div id="announcements-section" class="section-container" style="display: none;">
                        <div style="margin-bottom:20px;">
                            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                                <div>
                                    <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#1A3A6B;font-weight:600;margin:0 0 4px;display:flex;align-items:center;gap:6px;"><i class="bi bi-megaphone-fill"></i> COMMUNITY</p>
                                    <h1 style="font-size:24px;font-weight:700;color:#1A1A2E;margin:0;">Announcements</h1>
                                    <p style="color:#6B7280;font-size:13px;margin:4px 0 0;">Post and manage barangay announcements and bulletins.</p>
                                </div>
                                <button onclick="document.getElementById('addAnnouncementModal').classList.add('active')" style="display:flex;align-items:center;gap:6px;padding:8px 16px;background:#1A3A6B;border:none;border-radius:6px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;" onmouseover="this.style.background='#0F2547'" onmouseout="this.style.background='#1A3A6B'"><i class="bi bi-plus-lg"></i> New Announcement</button>
                            </div>
                        </div>
                        <div id="announcementsList" style="display:flex;flex-direction:column;gap:12px;">
                            <div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px;">Loading announcements...</div>
                        </div>
                    </div>

                    <div id="equipment-section" class="section-container" style="display: none;">`;

idx = c.indexOf(OLD_EQUIP_SECTION_START);
if (idx === -1) { console.log('MISS #11 announcements section'); } else { c = c.substring(0, idx) + NEW_EQUIP_SECTION_START + c.substring(idx + OLD_EQUIP_SECTION_START.length); console.log('OK #11 announcements section HTML'); }

fs.writeFileSync('admin-portal/admin.html', c);
console.log('Done writing admin.html pass 1');
