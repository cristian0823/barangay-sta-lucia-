const fs = require('fs');

// ============================================================
// ADMIN.HTML
// ============================================================
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

function fix(name, oldStr, newStr) {
    const idx = a.indexOf(oldStr);
    if (idx === -1) { console.log('MISS:', name); return; }
    a = a.substring(0, idx) + newStr + a.substring(idx + oldStr.length);
    console.log('OK:', name);
}

// ─── FIX 1a: editEventForm handler — wrongly got equipment selector, restore ──
fix('editEventForm-btn',
    `document.getElementById('editEventForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = document.querySelector('[form="editEquipmentForm"][type="submit"]');`,
    `document.getElementById('editEventForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');`
);

// ─── FIX 1b: addEquipmentForm handler — wrongly got equipment selector ─────────
fix('addEquipmentForm-btn',
    `document.getElementById('addEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = document.querySelector('[form="editEquipmentForm"][type="submit"]');`,
    `document.getElementById('addEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = document.querySelector('[form="addEquipmentForm"][type="submit"]');`
);

// ─── FIX 1c: editEquipmentForm handler — still has old this.querySelector ─────
fix('editEquipmentForm-btn',
    `document.getElementById('editEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');`,
    `document.getElementById('editEquipmentForm').addEventListener('submit', async function (e) {
                e.preventDefault();
                const btn = document.querySelector('[form="editEquipmentForm"][type="submit"]');`
);

// ─── FIX 2: Redesign renderPg to numbered page buttons ───────────────────────
const OLD_RENDERPG = `            function renderPg(containerId, total, perPage, page, cbName) {
                const el = document.getElementById(containerId);
                if (!el) return;
                const totalPages = Math.max(1, Math.ceil(total / perPage));
                el.style.display = (total === 0) ? "none" : "flex";
                if (total === 0) return;
                const s = (page - 1) * perPage + 1;
                const e = Math.min(page * perPage, total);
                el.style.justifyContent = "space-between";
                el.style.alignItems = "center";
                el.innerHTML =
                    \`<span style="font-size:12px;color:#6B7280;">Showing \${s}&ndash;\${e} of \${total} results</span>\` +
                    \`<div style="display:flex;align-items:center;gap:8px;">\` +
                    \`<button class="pg-btn" onclick="\${cbName}(\${page - 1})" \${page <= 1 ? "disabled" : ""} style="padding:5px 12px;font-size:12px;">&#8592; Previous</button>\` +
                    \`<span style="font-size:12px;color:#6B7280;white-space:nowrap;">Page \${page} of \${totalPages}</span>\` +
                    \`<button class="pg-btn" onclick="\${cbName}(\${page + 1})" \${page >= totalPages ? "disabled" : ""} style="padding:5px 12px;font-size:12px;">Next &#8594;</button>\` +
                    \`</div>\`;
            }`;

const NEW_RENDERPG = `            function renderPg(containerId, total, perPage, page, cbName) {
                const el = document.getElementById(containerId);
                if (!el) return;
                const totalPages = Math.max(1, Math.ceil(total / perPage));
                el.style.display = (total === 0) ? 'none' : 'flex';
                if (total === 0) return;
                const s = (page - 1) * perPage + 1;
                const e = Math.min(page * perPage, total);
                el.style.justifyContent = 'center';
                el.style.alignItems = 'center';
                el.style.gap = '0';
                el.style.padding = '16px';
                el.style.flexWrap = 'wrap';
                el.style.rowGap = '8px';

                // Build page number array with ellipsis
                function buildPages(cur, tot) {
                    if (tot <= 7) return Array.from({length: tot}, (_, i) => i + 1);
                    const pages = [];
                    pages.push(1);
                    if (cur > 3) pages.push('...');
                    for (let i = Math.max(2, cur - 1); i <= Math.min(tot - 1, cur + 1); i++) pages.push(i);
                    if (cur < tot - 2) pages.push('...');
                    pages.push(tot);
                    return pages;
                }
                const pages = buildPages(page, totalPages);
                const btnBase = 'display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:1px solid #E5E7EB;background:#fff;color:#374151;transition:all 0.12s;font-family:inherit;margin:0 2px;padding:0 8px;';
                const btnActive = 'display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;border-radius:8px;font-size:13px;font-weight:700;cursor:default;border:1px solid #1A3A6B;background:#1A3A6B;color:#fff;font-family:inherit;margin:0 2px;padding:0 8px;';
                const btnDisabled = 'display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;border-radius:8px;font-size:13px;font-weight:600;cursor:default;border:1px solid #E5E7EB;background:#F9FAFB;color:#D1D5DB;font-family:inherit;margin:0 2px;padding:0 8px;';

                let html = \`<span style="font-size:12px;color:#6B7280;margin-right:16px;white-space:nowrap;">\${s}–\${e} of \${total}</span>\`;
                html += \`<button \${page <= 1 ? 'disabled' : ''} onclick="\${cbName}(\${page - 1})" style="\${page <= 1 ? btnDisabled : btnBase}" onmouseover="if(!this.disabled)this.style.background='#F3F4F6'" onmouseout="if(!this.disabled)this.style.background='#fff'">&#8592;</button>\`;
                pages.forEach(p => {
                    if (p === '...') {
                        html += \`<span style="display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;font-size:13px;color:#9CA3AF;margin:0 2px;">…</span>\`;
                    } else if (p === page) {
                        html += \`<button disabled style="\${btnActive}">\${p}</button>\`;
                    } else {
                        html += \`<button onclick="\${cbName}(\${p})" style="\${btnBase}" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='#fff'">\${p}</button>\`;
                    }
                });
                html += \`<button \${page >= totalPages ? 'disabled' : ''} onclick="\${cbName}(\${page + 1})" style="\${page >= totalPages ? btnDisabled : btnBase}" onmouseover="if(!this.disabled)this.style.background='#F3F4F6'" onmouseout="if(!this.disabled)this.style.background='#fff'">&#8594;</button>\`;
                el.innerHTML = html;
            }`;

fix('renderPg', OLD_RENDERPG, NEW_RENDERPG);

// ─── FIX 3: Audit log fetch — ensure actor_type + barangay_id are returned ────
fix('audit-fetch-select',
    `from('audit_log').select('*, users(id, full_name, username, email, role)')`,
    `from('audit_log').select('*, users(id, full_name, username, barangay_id, email, role)')`
);

fs.writeFileSync('admin-portal/admin.html', a);
console.log('admin.html done');

// ============================================================
// BOTH APP.JS — improve logAudit error visibility
// ============================================================
for (const appPath of ['admin-portal/js/app.js', 'user-portal/js/app.js']) {
    let app = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

    // Fix: check the Supabase insert error so silent failures are logged
    const OLD_INS = `            await supabase.from('audit_log').insert([{
                user_id: finalUserId,
                actor_type: u.role === 'admin' ? 'admin' : 'resident',
                entity_type: entityType || 'System',
                entity_id: entityId,
                action: action,
                details: details
            }]);`;
    const NEW_INS = `            const { error: _auditErr } = await supabase.from('audit_log').insert([{
                user_id: finalUserId,
                actor_type: u.role === 'admin' ? 'admin' : 'resident',
                entity_type: entityType || 'System',
                entity_id: entityId,
                action: action,
                details: details
            }]);
            if (_auditErr) console.warn('[logAudit] insert failed:', _auditErr.code, _auditErr.message);`;
    const idx = app.indexOf(OLD_INS);
    if (idx === -1) { console.log('MISS: logAudit insert in', appPath); }
    else {
        app = app.substring(0, idx) + NEW_INS + app.substring(idx + OLD_INS.length);
        console.log('OK: logAudit error-check in', appPath);
        fs.writeFileSync(appPath, app);
    }
}

console.log('All done.');
