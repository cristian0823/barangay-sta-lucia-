const fs = require('fs');

function fix(file, name, oldStr, newStr) {
    let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const idx = c.indexOf(oldStr);
    if (idx === -1) { console.log('MISS:', name, 'in', file); return; }
    c = c.substring(0, idx) + newStr + c.substring(idx + oldStr.length);
    fs.writeFileSync(file, c);
    console.log('OK:', name);
}

const AD = 'admin-portal/admin.html';
const UD = 'user-portal/user-dashboard.html';

// ════════════════════════════════════════════════════════════
// PART 1 — Remove Delivery Mode from Edit Equipment modal
// ════════════════════════════════════════════════════════════

// 1a. Remove the Delivery Mode toggle div from the edit form
fix(AD, 'p1a-remove-edit-modal-delivery-div',
`                        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#fff;border:1px solid #D1D5DB;border-radius:6px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <i class="bi bi-truck" style="color:#1A3A6B;font-size:16px;flex-shrink:0;"></i>
                                <div>
                                    <div style="font-size:13px;font-weight:600;color:#374151;">Delivery Mode</div>
                                    <div id="editEquipDelivLabel" style="font-size:11px;color:#6B7280;margin-top:1px;">Delivery available</div>
                                </div>
                            </div>
                            <label style="position:relative;display:inline-block;width:42px;height:24px;flex-shrink:0;cursor:pointer;">
                                <input type="checkbox" id="editEquipCanDeliver" style="opacity:0;width:0;height:0;position:absolute;" onchange="(function(c){document.getElementById('editEquipDelivLabel').textContent=c.checked?'Delivery available':'Pickup Only — resident collects in person';document.getElementById('editDelivTrack').style.background=c.checked?'#1A3A6B':'#D1D5DB';document.getElementById('editDelivKnob').style.transform=c.checked?'translateX(18px)':'none';})(this)">
                                <span id="editDelivTrack" style="position:absolute;inset:0;border-radius:24px;background:#D1D5DB;transition:background 0.2s;"></span>
                                <span id="editDelivKnob" style="position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></span>
                            </label>
                        </div>`,
``
);

// 1b. Remove can_deliver read block in openEditEquipmentModal
fix(AD, 'p1b-remove-openEdit-canDeliver',
`                var _lower = (equipment.name||'').toLowerCase();
                var _defCanDeliv = !['table','tent'].some(function(kw){return _lower.indexOf(kw)>=0;});
                var _canDeliv = (equipment.can_deliver !== null && equipment.can_deliver !== undefined) ? !!equipment.can_deliver : _defCanDeliv;
                var _dcb = document.getElementById('editEquipCanDeliver');
                if (_dcb) {
                    _dcb.checked = _canDeliv;
                    document.getElementById('editEquipDelivLabel').textContent = _canDeliv ? 'Delivery available' : 'Pickup Only — resident collects in person';
                    document.getElementById('editDelivTrack').style.background = _canDeliv ? '#1A3A6B' : '#D1D5DB';
                    document.getElementById('editDelivKnob').style.transform = _canDeliv ? 'translateX(18px)' : 'none';
                }

                document.getElementById('editEquipmentModal').classList.add('active');`,
`                document.getElementById('editEquipmentModal').classList.add('active');`
);

// 1c. Remove canDeliver from updates object
fix(AD, 'p1c-remove-canDeliver-from-updates',
`                    isArchived: document.getElementById('editEquipArchived').checked,
                    canDeliver: document.getElementById('editEquipCanDeliver').checked
                };`,
`                    isArchived: document.getElementById('editEquipArchived').checked
                };`
);

// 1d. Remove the extra can_deliver supabase update in the success block
fix(AD, 'p1d-remove-submit-canDeliver-update',
`                if (result.success) {
                    if (window.supabase) {
                        supabase.from('equipment').update({ can_deliver: updates.canDeliver }).eq('id', id).then(() => {}).catch(() => {});
                    }
                    showAlert('Equipment updated successfully', 'success');`,
`                if (result.success) {
                    showAlert('Equipment updated successfully', 'success');`
);

// 1e. Remove toggleDeliveryAdmin function
fix(AD, 'p1e-remove-toggleDeliveryAdmin',
`            async function toggleDeliveryAdmin(equipId, currentVal) {
                const newVal = !currentVal;
                try {
                    if (window.supabase) {
                        await window.supabase.from('equipment').update({ can_deliver: newVal }).eq('id', equipId);
                    }
                } catch(e) { console.warn('toggleDeliveryAdmin error:', e); }
                loadEquipment();
            }

            function quickUploadEquipImage(id, cell) {`,
`            function quickUploadEquipImage(id, cell) {`
);

// ════════════════════════════════════════════════════════════
// PART 2 — Add global delivery toggle banner (HTML)
// ════════════════════════════════════════════════════════════

fix(AD, 'p2-add-global-delivery-banner',
`                        </div>

                        <!-- STAT PILLS -->`,
`                        </div>

                        <!-- GLOBAL DELIVERY TOGGLE -->
                        <div id="globalDeliveryBanner" style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 20px;border-radius:12px;margin-bottom:20px;border:2px solid #bbf7d0;background:#f0fdf4;flex-wrap:wrap;">
                            <div style="display:flex;align-items:center;gap:12px;">
                                <i class="bi bi-truck" style="font-size:22px;color:#15803d;flex-shrink:0;"></i>
                                <div>
                                    <div id="globalDelivBannerLabel" style="font-size:14px;font-weight:700;color:#15803d;">Delivery Available &mdash; Residents can choose delivery or pickup</div>
                                    <div style="font-size:11px;color:#4ade80;margin-top:2px;">Global setting &mdash; overrides all individual item delivery settings</div>
                                </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                                <span id="globalDelivStatusText" style="font-size:12px;font-weight:700;color:#15803d;">ON</span>
                                <label style="position:relative;display:inline-block;width:52px;height:28px;cursor:pointer;" title="Toggle global delivery availability">
                                    <input type="checkbox" id="globalDelivToggle" checked style="opacity:0;width:0;height:0;position:absolute;" onchange="setGlobalDelivery(this.checked)">
                                    <span id="globalDelivTrack" style="position:absolute;inset:0;border-radius:28px;background:#16a34a;transition:background 0.25s;"></span>
                                    <span id="globalDelivKnob" style="position:absolute;left:4px;top:4px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform 0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.25);transform:translateX(24px);"></span>
                                </label>
                            </div>
                        </div>

                        <!-- STAT PILLS -->`
);

// ════════════════════════════════════════════════════════════
// PART 2 — Add global delivery JS (functions + call in loadEquipment)
// ════════════════════════════════════════════════════════════

fix(AD, 'p2-add-global-delivery-js',
`        async function loadEquipment() {
                const equipment = await getEquipment();`,
`        window._adminGlobalDelivery = true;

        async function loadGlobalDeliverySetting() {
            try {
                if (!window.supabase) return;
                const { data } = await window.supabase.from('settings').select('value').eq('key', 'delivery_available').maybeSingle();
                const isOn = data ? data.value !== 'false' : true;
                window._adminGlobalDelivery = isOn;
                _applyGlobalDeliveryUI(isOn);
            } catch(e) { console.warn('loadGlobalDeliverySetting error:', e); }
        }

        function _applyGlobalDeliveryUI(isOn) {
            const toggle = document.getElementById('globalDelivToggle');
            const track = document.getElementById('globalDelivTrack');
            const knob = document.getElementById('globalDelivKnob');
            const label = document.getElementById('globalDelivBannerLabel');
            const status = document.getElementById('globalDelivStatusText');
            const banner = document.getElementById('globalDeliveryBanner');
            if (toggle) toggle.checked = isOn;
            if (track) track.style.background = isOn ? '#16a34a' : '#dc2626';
            if (knob) knob.style.transform = isOn ? 'translateX(24px)' : 'none';
            if (label) label.textContent = isOn
                ? 'Delivery Available — Residents can choose delivery or pickup'
                : 'Delivery Unavailable — Pickup Only (e.g. vehicle is broken)';
            if (label) label.style.color = isOn ? '#15803d' : '#b91c1c';
            if (status) { status.textContent = isOn ? 'ON' : 'OFF'; status.style.color = isOn ? '#15803d' : '#b91c1c'; }
            if (banner) {
                banner.style.background = isOn ? '#f0fdf4' : '#fef2f2';
                banner.style.borderColor = isOn ? '#bbf7d0' : '#fecaca';
            }
        }

        async function setGlobalDelivery(isOn) {
            window._adminGlobalDelivery = isOn;
            _applyGlobalDeliveryUI(isOn);
            try {
                if (window.supabase) {
                    await window.supabase.from('settings')
                        .upsert({ key: 'delivery_available', value: isOn ? 'true' : 'false', updated_at: new Date().toISOString() });
                }
            } catch(e) { console.warn('setGlobalDelivery error:', e); }
            renderEquipmentPg();
        }

        async function loadEquipment() {
                await loadGlobalDeliverySetting();
                const equipment = await getEquipment();`
);

// ════════════════════════════════════════════════════════════
// PART 4 — Override delivery badge with global setting
// ════════════════════════════════════════════════════════════

fix(AD, 'p4-global-override-delivery-badge',
`                        var lower = (e.name||'').toLowerCase();
                        var _defCanDeliv = !['table','tent'].some(function(kw){return lower.indexOf(kw)>=0;});
                        var _canDeliv = (e.can_deliver !== null && e.can_deliver !== undefined) ? !!e.can_deliver : _defCanDeliv;
                        var delivToggle = _canDeliv
                            ? '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#DBEAFE;color:#1E40AF;text-transform:uppercase;letter-spacing:0.04em;">Delivery</span>'
                            : '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#F3E8FF;color:#6B21A8;text-transform:uppercase;letter-spacing:0.04em;">Pickup Only</span>';`,
`                        var _globalDelivOn = (typeof window._adminGlobalDelivery !== 'undefined') ? window._adminGlobalDelivery : true;
                        var delivToggle;
                        if (!_globalDelivOn) {
                            delivToggle = '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#FEE2E2;color:#991b1b;text-transform:uppercase;letter-spacing:0.04em;">Pickup Only</span>';
                        } else {
                            var lower = (e.name||'').toLowerCase();
                            var _defCanDeliv = !['table','tent'].some(function(kw){return lower.indexOf(kw)>=0;});
                            var _canDeliv = (e.can_deliver !== null && e.can_deliver !== undefined) ? !!e.can_deliver : _defCanDeliv;
                            delivToggle = _canDeliv
                                ? '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#DBEAFE;color:#1E40AF;text-transform:uppercase;letter-spacing:0.04em;">Delivery</span>'
                                : '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:#F3E8FF;color:#6B21A8;text-transform:uppercase;letter-spacing:0.04em;">Pickup Only</span>';
                        }`
);

// ════════════════════════════════════════════════════════════
// PART 3 + 5 — User-portal: global delivery state
// ════════════════════════════════════════════════════════════

// Add loadGlobalDeliveryState() and window._globalDeliveryEnabled near PICKUP_ONLY_ITEMS
fix(UD, 'p3-add-global-delivery-state',
`        const PICKUP_ONLY_ITEMS = ['table', 'tent'];
        function _itemDeliveryAllowed(item) {
            // Primary: use can_deliver from Supabase data
            if (item && typeof item === 'object' && item.can_deliver !== undefined && item.can_deliver !== null) {
                return !!item.can_deliver;
            }
            // Fallback: name-based heuristic (for items not yet migrated)
            const lower = (typeof item === 'string' ? item : (item && item.name) || '').toLowerCase();
            return !PICKUP_ONLY_ITEMS.some(kw => lower.includes(kw));
        }`,
`        const PICKUP_ONLY_ITEMS = ['table', 'tent'];

        // Global delivery state (loaded from settings table)
        window._globalDeliveryEnabled = true;
        async function loadGlobalDeliveryState() {
            try {
                if (!window.supabase) return;
                const { data } = await window.supabase.from('settings').select('value').eq('key', 'delivery_available').maybeSingle();
                window._globalDeliveryEnabled = data ? data.value !== 'false' : true;
            } catch(e) { window._globalDeliveryEnabled = true; }
        }

        function _itemDeliveryAllowed(item) {
            // Per-item only check (no global — global checked in updateDeliveryOptions)
            if (item && typeof item === 'object' && item.can_deliver !== undefined && item.can_deliver !== null) {
                return !!item.can_deliver;
            }
            const lower = (typeof item === 'string' ? item : (item && item.name) || '').toLowerCase();
            return !PICKUP_ONLY_ITEMS.some(kw => lower.includes(kw));
        }`
);

// Update updateDeliveryOptions to check global setting and show correct notice
fix(UD, 'p3-update-updateDeliveryOptions',
`        function updateDeliveryOptions(itemOrName) {
            const allowed = _itemDeliveryAllowed(itemOrName);
            const deliveryLabel = document.getElementById('deliveryToAddrLabel');
            const notice = document.getElementById('deliveryPickupOnlyNotice');
            const pickupRadio = document.getElementById('deliveryPickup');
            const deliveryRadio = document.getElementById('deliveryDelivery');
            const pickupLabel = document.getElementById('deliveryPickupLabel');
            if (pickupRadio) pickupRadio.checked = false;
            if (deliveryRadio) deliveryRadio.checked = false;
            if (deliveryLabel) { deliveryLabel.style.display = allowed ? 'flex' : 'none'; deliveryLabel.style.border = '2px solid #e2e8f0'; }
            if (notice) notice.style.display = allowed ? 'none' : 'block';
            if (pickupLabel) pickupLabel.style.border = '2px solid #e2e8f0';
            if (!allowed) { if (pickupRadio) pickupRadio.checked = true; if (pickupLabel) pickupLabel.style.border = '2px solid #1e3a5f'; }
        }`,
`        function updateDeliveryOptions(itemOrName) {
            const globalOff = window._globalDeliveryEnabled === false;
            const perItemAllowed = _itemDeliveryAllowed(itemOrName);
            const allowed = !globalOff && perItemAllowed;
            const deliveryLabel = document.getElementById('deliveryToAddrLabel');
            const notice = document.getElementById('deliveryPickupOnlyNotice');
            const pickupRadio = document.getElementById('deliveryPickup');
            const deliveryRadio = document.getElementById('deliveryDelivery');
            const pickupLabel = document.getElementById('deliveryPickupLabel');
            if (pickupRadio) pickupRadio.checked = false;
            if (deliveryRadio) deliveryRadio.checked = false;
            if (deliveryLabel) { deliveryLabel.style.display = allowed ? 'flex' : 'none'; deliveryLabel.style.border = '2px solid #e2e8f0'; }
            if (notice) {
                if (globalOff) {
                    notice.innerHTML = '⚠️ <strong>Delivery is currently unavailable.</strong> Pickup only at this time.';
                    notice.style.display = 'block';
                } else if (!perItemAllowed) {
                    notice.innerHTML = '⚠️ This item is <strong>Pickup only</strong> — large/heavy items cannot be delivered.';
                    notice.style.display = 'block';
                } else {
                    notice.style.display = 'none';
                }
            }
            if (pickupLabel) pickupLabel.style.border = '2px solid #e2e8f0';
            if (!allowed) { if (pickupRadio) pickupRadio.checked = true; if (pickupLabel) pickupLabel.style.border = '2px solid #1e3a5f'; }
        }`
);

// Load global delivery state when borrow modal opens (PART 5: always read current state)
fix(UD, 'p5-load-global-in-openBorrowModal',
`        async function openBorrowModalWithEquip(equipId) {
            const list = await getEquipment();`,
`        async function openBorrowModalWithEquip(equipId) {
            await loadGlobalDeliveryState();
            const list = await getEquipment();`
);

// Ensure updateDeliveryOptions is called explicitly after selectBorrowPurpose
fix(UD, 'p5-call-updateDelivery-in-openBorrowModal',
`            renderBorrowAlerts();
            renderExistingBookings();
            selectBorrowPurpose('event');
            updateBorrowLockState();
            document.getElementById('borrowModal').classList.remove('hidden');`,
`            renderBorrowAlerts();
            renderExistingBookings();
            selectBorrowPurpose('event');
            updateDeliveryOptions(item);
            updateBorrowLockState();
            document.getElementById('borrowModal').classList.remove('hidden');`
);

console.log('\nAll done.');
