const fs = require('fs');

// =====================================
// 1. PATCH admin.html - Add Maintenance History Log section
// =====================================
let adminHtml = fs.readFileSync('admin-portal/admin.html', 'utf8');

// Add "Maintenance Log" button to the inventory section header
adminHtml = adminHtml.replace(
    `<button class="btn btn-small btn-light" onclick="openAddEquipmentModal()">+ Add Item</button>`,
    `<button class="btn btn-small btn-light" onclick="openAddEquipmentModal()">+ Add Item</button>
                                <button class="btn btn-small btn-light" onclick="toggleMaintenanceLog()" id="maintenanceLogToggle">📋 Maintenance Log</button>`
);

// Add the maintenance log panel after the inventory table
adminHtml = adminHtml.replace(
    `                        </div>\n                     </div> \n\n                    <!-- USERS SECTION -->`,
    `                        </div>

                        <!-- MAINTENANCE LOG PANEL -->
                        <div id="maintenanceLogPanel" style="display:none; padding: 0 26px 26px;">
                            <div style="background: var(--card,#1e293b); border-radius: 12px; border: 1px solid var(--border,#334155); overflow:hidden;">
                                <div style="padding: 16px 20px; border-bottom: 1px solid var(--border,#334155); display:flex; align-items:center; justify-content:space-between;">
                                    <div style="display:flex;align-items:center;gap:10px;">
                                        <span style="font-size:20px;">🔧</span>
                                        <div>
                                            <h4 style="margin:0;font-size:15px;font-weight:700;color:var(--text,#f1f5f9);">Maintenance History</h4>
                                            <p style="margin:0;font-size:12px;color:var(--muted,#94a3b8);">All Under Repair & For Disposal changes</p>
                                        </div>
                                    </div>
                                    <input type="text" id="maintenanceSearch" placeholder="Search item..." oninput="filterMaintenanceLogs()" style="padding:8px 12px;border-radius:8px;border:1px solid var(--border,#334155);background:var(--bg,#0f172a);color:var(--text,#f1f5f9);font-size:13px;width:200px;">
                                </div>
                                <div style="overflow-x:auto;">
                                    <table style="width:100%;border-collapse:collapse;">
                                        <thead>
                                            <tr style="background:var(--bg,#0f172a);">
                                                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:var(--muted,#94a3b8);text-transform:uppercase;letter-spacing:0.05em;">Date & Time</th>
                                                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:var(--muted,#94a3b8);text-transform:uppercase;">Equipment</th>
                                                <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;color:var(--muted,#94a3b8);text-transform:uppercase;">Action</th>
                                                <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;color:var(--muted,#94a3b8);text-transform:uppercase;">Qty Changed</th>
                                                <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;color:var(--muted,#94a3b8);text-transform:uppercase;">Before → After</th>
                                                <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;color:var(--muted,#94a3b8);text-transform:uppercase;">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody id="maintenanceLogTable">
                                            <tr><td colspan="6" style="padding:32px;text-align:center;color:var(--muted,#94a3b8);">Loading...</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                     </div>

                    <!-- USERS SECTION -->`
);

fs.writeFileSync('admin-portal/admin.html', adminHtml);
console.log('✅ Patched admin.html - Added Maintenance Log panel');


// =====================================
// 2. PATCH app.js - Auto-clear disposal on new stock + Maintenance log writing
// =====================================
let appJs = fs.readFileSync('admin-portal/js/app.js', 'utf8');

// A) Add logMaintenance function before updateEquipment
const logMaintenanceFunc = `
// ==========================================
// MAINTENANCE LOG
// ==========================================
async function logMaintenance(itemName, action, qtyChanged, prevCount, newCount, notes = '') {
    const timestamp = new Date().toISOString();
    const supabaseAvailable = await isSupabaseAvailable();
    const entry = {
        item_name: itemName,
        action,
        qty_changed: qtyChanged,
        prev_count: prevCount,
        new_count: newCount,
        notes,
        created_at: timestamp
    };
    
    if (supabaseAvailable) {
        try {
            await supabase.from('maintenance_log').insert([entry]);
        } catch(e) {
            // Fall back to local
        }
    }
    
    // Always store locally as backup
    const LOCAL_MAINT_KEY = 'maintenance_log';
    const logs = JSON.parse(localStorage.getItem(LOCAL_MAINT_KEY)) || [];
    logs.unshift({ id: Date.now(), ...entry });
    if (logs.length > 200) logs.splice(200);
    localStorage.setItem(LOCAL_MAINT_KEY, JSON.stringify(logs));
}

async function getMaintenanceLogs() {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        try {
            const { data } = await supabase.from('maintenance_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);
            if (data && data.length > 0) return data;
        } catch(e) {}
    }
    return JSON.parse(localStorage.getItem('maintenance_log')) || [];
}

`;

appJs = appJs.replace(
    'async function updateEquipment(id, updates) {',
    logMaintenanceFunc + 'async function updateEquipment(id, updates) {'
);

// B) Auto-clear disposal when new stock arrives + log maintenance entries
// Find the notification section in updateEquipment and add maintenance logging + auto-disposal-clear
appJs = appJs.replace(
    `        // Cap values to prevent impossible states
        const cappedBroken   = Math.min(newBroken,   newQty);
        const cappedDisposal = Math.min(newDisposal, Math.max(0, newQty - cappedBroken));`,
    `        // Auto-clear disposal when new stock is added (new chairs replace disposed ones)
        let adjustedDisposal = newDisposal;
        const stockAdded = newQty - oldQty;
        if (stockAdded > 0 && adjustedDisposal > 0) {
            adjustedDisposal = Math.max(0, adjustedDisposal - stockAdded);
        }

        // Cap values to prevent impossible states
        const cappedBroken   = Math.min(newBroken,   newQty);
        const cappedDisposal = Math.min(adjustedDisposal, Math.max(0, newQty - cappedBroken));`
);

// C) After the notification loop, add maintenance log entries
appJs = appJs.replace(
    `        for (let msg of notifMessages) {
            await addNotification('all_users', 'inventory', msg);
        }

        return { success: true, message: 'Equipment updated successfully' };
    } else {
        // Local fallback`,
    `        for (let msg of notifMessages) {
            await addNotification('all_users', 'inventory', msg);
        }

        // Log to maintenance history
        if (diffBroken !== 0) {
            const action = diffBroken > 0 ? 'Under Repair' : 'Repaired';
            await logMaintenance(item.name, action, Math.abs(diffBroken), oldBroken, cappedBroken,
                diffBroken > 0 ? \`\${cappedBroken} units marked under repair\` : \`\${Math.abs(diffBroken)} units restored\`);
        }
        if (diffDisposal !== 0) {
            const action = diffDisposal > 0 ? 'For Disposal' : 'Recovered from Disposal';
            await logMaintenance(item.name, action, Math.abs(diffDisposal), oldDisposal, cappedDisposal,
                diffDisposal > 0 ? \`\${cappedDisposal} units marked for disposal\` : \`\${Math.abs(diffDisposal)} units recovered\`);
        }
        if (stockAdded > 0 && (newDisposal - adjustedDisposal) > 0) {
            await logMaintenance(item.name, 'Disposal Cleared (New Stock)', newDisposal - adjustedDisposal, newDisposal, adjustedDisposal,
                \`\${newDisposal - adjustedDisposal} disposal units cleared because \${stockAdded} new items were added\`);
        }

        return { success: true, message: 'Equipment updated successfully' };
    } else {
        // Local fallback`
);

fs.writeFileSync('admin-portal/js/app.js', appJs);
console.log('✅ Patched app.js - Auto-dispose clear + maintenance log writes');


// =====================================
// 3. PATCH admin.html - Add JS functions for Maintenance Log UI
// =====================================
adminHtml = fs.readFileSync('admin-portal/admin.html', 'utf8');

const maintenanceJsFunctions = `
        // ========== MAINTENANCE LOG UI ==========
        let allMaintenanceLogs = [];

        async function toggleMaintenanceLog() {
            const panel = document.getElementById('maintenanceLogPanel');
            const btn = document.getElementById('maintenanceLogToggle');
            if (!panel) return;
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            btn.style.background = isHidden ? 'var(--primary, #16a34a)' : '';
            btn.style.color = isHidden ? '#fff' : '';
            if (isHidden) await loadMaintenanceLogs();
        }

        async function loadMaintenanceLogs() {
            const tbody = document.getElementById('maintenanceLogTable');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="6" style="padding:24px;text-align:center;color:#94a3b8;">Loading...</td></tr>';
            try {
                allMaintenanceLogs = typeof getMaintenanceLogs === 'function' ? await getMaintenanceLogs() : [];
                renderMaintenanceLogs(allMaintenanceLogs);
            } catch(e) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding:24px;text-align:center;color:#ef4444;">Failed to load logs.</td></tr>';
            }
        }

        function filterMaintenanceLogs() {
            const q = (document.getElementById('maintenanceSearch')?.value || '').toLowerCase();
            const filtered = allMaintenanceLogs.filter(l =>
                (l.item_name || '').toLowerCase().includes(q) ||
                (l.action || '').toLowerCase().includes(q)
            );
            renderMaintenanceLogs(filtered);
        }

        function renderMaintenanceLogs(logs) {
            const tbody = document.getElementById('maintenanceLogTable');
            if (!tbody) return;
            if (!logs || logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="padding:32px;text-align:center;color:#94a3b8;font-size:14px;">No maintenance records found.</td></tr>';
                return;
            }

            const actionStyles = {
                'Under Repair':           { bg:'#fef3c7', color:'#92400e', icon:'🔧' },
                'Repaired':               { bg:'#d1fae5', color:'#065f46', icon:'✅' },
                'For Disposal':           { bg:'#fee2e2', color:'#991b1b', icon:'🗑️' },
                'Recovered from Disposal':{ bg:'#dbeafe', color:'#1e40af', icon:'♻️' },
                'Disposal Cleared (New Stock)': { bg:'#ede9fe', color:'#5b21b6', icon:'📦' },
            };

            tbody.innerHTML = logs.map(log => {
                const style = actionStyles[log.action] || { bg:'#f3f4f6', color:'#374151', icon:'📋' };
                const dt = log.created_at ? new Date(log.created_at).toLocaleString('en-PH', {
                    month:'short', day:'2-digit', year:'numeric',
                    hour:'2-digit', minute:'2-digit', hour12:true
                }) : '—';
                const before = log.prev_count ?? '—';
                const after  = log.new_count  ?? '—';
                return \`<tr style="border-top:1px solid var(--border,#334155);transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background=''">
                    <td style="padding:12px 16px;font-size:12px;color:var(--muted,#94a3b8);white-space:nowrap;">\${dt}</td>
                    <td style="padding:12px 16px;">
                        <span style="font-size:13px;font-weight:600;color:var(--text,#f1f5f9);">\${log.item_name || '—'}</span>
                    </td>
                    <td style="padding:12px 16px;text-align:center;">
                        <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;background:\${style.bg};color:\${style.color};">
                            \${style.icon} \${log.action}
                        </span>
                    </td>
                    <td style="padding:12px 16px;text-align:center;font-size:14px;font-weight:700;color:var(--text,#f1f5f9);">\${log.qty_changed ?? '—'}</td>
                    <td style="padding:12px 16px;text-align:center;font-size:13px;color:var(--muted,#94a3b8);">
                        <span style="color:#94a3b8;">\${before}</span>
                        <span style="margin:0 6px;">→</span>
                        <span style="color:var(--text,#f1f5f9);font-weight:600;">\${after}</span>
                    </td>
                    <td style="padding:12px 16px;font-size:12px;color:var(--muted,#94a3b8);">\${log.notes || '—'}</td>
                </tr>\`;
            }).join('');
        }
        // ========== END MAINTENANCE LOG UI ==========
`;

// Inject just before the closing </script> tag of the main script block
// Find a good place - near the end of the inline script
const insertBefore = `        async function loadEquipment()`;
adminHtml = adminHtml.replace(insertBefore, maintenanceJsFunctions + '\n        async function loadEquipment()');

fs.writeFileSync('admin-portal/admin.html', adminHtml);
console.log('✅ Patched admin.html - Added JS functions for Maintenance Log UI');

console.log('\n🎉 All patches applied! Run: git add -A && git commit -m "feat: maintenance log, auto-disposal clear on new stock" && git push');
