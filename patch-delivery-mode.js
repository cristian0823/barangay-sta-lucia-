const fs = require('fs');

function fix(file, name, oldStr, newStr) {
    let c = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const idx = c.indexOf(oldStr);
    if (idx === -1) { console.log('MISS:', name, 'in', file); return; }
    c = c.substring(0, idx) + newStr + c.substring(idx + oldStr.length);
    fs.writeFileSync(file, c);
    console.log('OK:', name);
}

// ── ADMIN.HTML ──────────────────────────────────────────────────────────────

// FIX 1: Table row delivery badge — read from e.can_deliver (Supabase) not localStorage
fix('admin-portal/admin.html', 'table-badge-can-deliver',
`                        var lower = (e.name||'').toLowerCase();
                        var _rds = JSON.parse(localStorage.getItem('brgy_delivery_settings')||'{}');
                        var _rDef = !['table','tent'].some(function(kw){return lower.indexOf(kw)>=0;});
                        var _canDeliv = _rds['id_'+e.id] !== undefined ? _rds['id_'+e.id] : (_rds[lower] !== undefined ? _rds[lower] : _rDef);`,
`                        var lower = (e.name||'').toLowerCase();
                        var _defCanDeliv = !['table','tent'].some(function(kw){return lower.indexOf(kw)>=0;});
                        var _canDeliv = (e.can_deliver !== null && e.can_deliver !== undefined) ? !!e.can_deliver : _defCanDeliv;`
);

// FIX 2: toggleDeliveryAdmin — update Supabase instead of localStorage
fix('admin-portal/admin.html', 'toggleDeliveryAdmin-supabase',
`            function toggleDeliveryAdmin(itemNameLower) {
                try {
                    const s = JSON.parse(localStorage.getItem('brgy_delivery_settings') || '{}');
                    s[itemNameLower] = s[itemNameLower] === false ? true : false;
                    localStorage.setItem('brgy_delivery_settings', JSON.stringify(s));
                } catch(e) {}
                loadEquipment();
            }`,
`            async function toggleDeliveryAdmin(equipId, currentVal) {
                const newVal = !currentVal;
                try {
                    if (window.supabase) {
                        await window.supabase.from('equipment').update({ can_deliver: newVal }).eq('id', equipId);
                    }
                } catch(e) { console.warn('toggleDeliveryAdmin error:', e); }
                loadEquipment();
            }`
);

// FIX 3: openEditEquipmentModal — read can_deliver from equipment object (Supabase) not localStorage
fix('admin-portal/admin.html', 'editModal-read-can_deliver',
`                var _ds = JSON.parse(localStorage.getItem('brgy_delivery_settings')||'{}');
                var _lower = (equipment.name||'').toLowerCase();
                var _defCanDeliv = !['table','tent'].some(function(kw){return _lower.indexOf(kw)>=0;});
                var _canDeliv = _ds['id_'+equipment.id] !== undefined ? _ds['id_'+equipment.id]
                              : (_ds[_lower] !== undefined ? _ds[_lower] : _defCanDeliv);`,
`                var _lower = (equipment.name||'').toLowerCase();
                var _defCanDeliv = !['table','tent'].some(function(kw){return _lower.indexOf(kw)>=0;});
                var _canDeliv = (equipment.can_deliver !== null && equipment.can_deliver !== undefined) ? !!equipment.can_deliver : _defCanDeliv;`
);

// FIX 4: submitEditEquipmentForm — remove localStorage write, Supabase update already exists on line 5408
fix('admin-portal/admin.html', 'editForm-remove-localStorage',
`                var _savDs = JSON.parse(localStorage.getItem('brgy_delivery_settings')||'{}');
                _savDs['id_'+id] = document.getElementById('editEquipCanDeliver').checked;
                localStorage.setItem('brgy_delivery_settings', JSON.stringify(_savDs));

                const updates = {`,
`                const updates = {`
);

// ── ADMIN-PORTAL/JS/APP.JS ──────────────────────────────────────────────────

// FIX 5: getEquipment() return mapping — include can_deliver
fix('admin-portal/js/app.js', 'admin-app-getEquipment-can_deliver',
`        return equipmentList.map(item => ({
            ...item,
            name: item.name || 'Unknown',
            icon: item.icon || '📦',
            description: item.description || '',
            quantity: item.quantity || 0,
            available: item.available !== undefined ? item.available : Math.max(0, (item.quantity || 0) - (item.broken || 0)),
            broken: item.broken || 0,
            status: item.status || 'Available',
            pending: pendingQtyMap[item.name] || 0,
            isLocked: lockedNames.has(item.name || 'Unknown')
        }));`,
`        return equipmentList.map(item => ({
            ...item,
            name: item.name || 'Unknown',
            icon: item.icon || '📦',
            description: item.description || '',
            quantity: item.quantity || 0,
            available: item.available !== undefined ? item.available : Math.max(0, (item.quantity || 0) - (item.broken || 0)),
            broken: item.broken || 0,
            status: item.status || 'Available',
            pending: pendingQtyMap[item.name] || 0,
            isLocked: lockedNames.has(item.name || 'Unknown'),
            can_deliver: item.can_deliver !== null && item.can_deliver !== undefined ? !!item.can_deliver : !['table','tent'].some(kw => (item.name||'').toLowerCase().includes(kw))
        }));`
);

// ── USER-PORTAL/JS/APP.JS ───────────────────────────────────────────────────

// FIX 6: user getEquipment() return mapping — include can_deliver
fix('user-portal/js/app.js', 'user-app-getEquipment-can_deliver',
`        return equipmentList.map(item => ({
            ...item,
            name: item.name || 'Unknown',
            icon: item.icon || '📦',
            description: item.description || '',
            quantity: item.quantity || 0,
            available: item.available !== undefined ? item.available : Math.max(0, (item.quantity || 0) - (item.broken || 0)),
            broken: item.broken || 0,
            status: item.status || 'Available',
            pending: pendingQtyMap[item.name] || 0,
            isLocked: lockedNames.has(item.name || 'Unknown')
        }));`,
`        return equipmentList.map(item => ({
            ...item,
            name: item.name || 'Unknown',
            icon: item.icon || '📦',
            description: item.description || '',
            quantity: item.quantity || 0,
            available: item.available !== undefined ? item.available : Math.max(0, (item.quantity || 0) - (item.broken || 0)),
            broken: item.broken || 0,
            status: item.status || 'Available',
            pending: pendingQtyMap[item.name] || 0,
            isLocked: lockedNames.has(item.name || 'Unknown'),
            can_deliver: item.can_deliver !== null && item.can_deliver !== undefined ? !!item.can_deliver : !['table','tent'].some(kw => (item.name||'').toLowerCase().includes(kw))
        }));`
);

console.log('admin.html + both app.js done');
