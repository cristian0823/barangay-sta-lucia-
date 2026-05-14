const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0, 80))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}
function repAll(old, neu) {
    const n = c.split(old).length - 1;
    c = c.split(old).join(neu);
    if (n === 0) console.log('MISS(all):', JSON.stringify(old.substring(0, 60)));
    else changes += n;
}

// ── 1 & 6: Sidebar nav icon-box colors ───────────────────────────────────────
// Inactive: dark sidebar (#0f1f3d), icon boxes need white-tinted background
rep(
    '.nav-item .nav-icon-box {\n            width: 38px; height: 38px;\n            border-radius: 12px;\n            background: rgba(30,58,95,0.08);\n            border: 1.5px solid rgba(30,58,95,0.15);\n            display: flex; align-items: center; justify-content: center;\n            font-size: 18px; flex-shrink: 0;\n            transition: all 0.2s ease;\n        }',
    '.nav-item .nav-icon-box {\n            width: 38px; height: 38px;\n            border-radius: 12px;\n            background: rgba(255,255,255,0.08);\n            border: 1.5px solid rgba(255,255,255,0.15);\n            display: flex; align-items: center; justify-content: center;\n            font-size: 18px; flex-shrink: 0;\n            transition: all 0.2s ease;\n        }'
);

// Dark mode inactive icon-box — remove stray gold border
rep(
    '[data-theme="dark"] .nav-item .nav-icon-box {\n            background: rgba(30,58,95,0.1); border-color: rgba(245,166,35,0.25);\n        }',
    '[data-theme="dark"] .nav-item .nav-icon-box {\n            background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12);\n        }'
);

// Hover icon-box
rep(
    '.nav-item:hover .nav-icon-box { background: rgba(30,58,95,0.12); border-color: rgba(30,58,95,0.4); }',
    '.nav-item:hover .nav-icon-box { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.3); }'
);
rep(
    '[data-theme="dark"] .nav-item:hover .nav-icon-box { background: rgba(30,58,95,0.15); border-color: rgba(30,58,95,0.4); }',
    '[data-theme="dark"] .nav-item:hover .nav-icon-box { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); }'
);

// Active icon-box: icon was navy on navy → make white on translucent white
rep(
    '.nav-item.active .nav-icon-box { background: rgba(30,58,95,0.15) !important; border-color: rgba(30,58,95,0.5) !important; color: #1e3a5f !important; }',
    '.nav-item.active .nav-icon-box { background: rgba(255,255,255,0.18) !important; border-color: rgba(255,255,255,0.4) !important; color: #fff !important; }'
);

// ── 2: Concerns form — remove max-width:680px constraint ─────────────────────
rep(
    '<div style="max-width:680px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.06);overflow:hidden;">',
    '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.06);overflow:hidden;">'
);

// ── 3: Photo preview — fix double display property ────────────────────────────
rep(
    'id="imagePreviewContainer" style="display:none;margin-bottom:10px;position:relative;display:inline-block;"',
    'id="imagePreviewContainer" style="display:none;margin-bottom:10px;position:relative;"'
);

// ── 5: Recent Activity icon circles — light blue → navy ──────────────────────
rep(
    "'<div style=\"width:38px;height:38px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;flex-shrink:0;\"><i class=\"bi ' + a.icon + '\" style=\"color:#2563eb;font-size:16px;\"></i></div>'",
    "'<div style=\"width:38px;height:38px;border-radius:50%;background:rgba(30,58,95,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;\"><i class=\"bi ' + a.icon + '\" style=\"color:#1e3a5f;font-size:16px;\"></i></div>'"
);

// ── 5: My Activity icon colorClass — gray → navy ──────────────────────────────
repAll(
    "colorClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-navy-900/30 dark:border-slate-200 dark:text-slate-400'",
    "colorClass: 'bg-[#e8edf5] text-[#1e3a5f] border-[#c0cfe8] dark:bg-[rgba(30,58,95,0.25)] dark:border-[rgba(30,58,95,0.4)] dark:text-[#93c5fd]'"
);

// ── 7: My Profile hero banner — teal gradient → all navy ─────────────────────
rep(
    'background:linear-gradient(135deg,#0f1f3d 0%,#0f1f3d 50%,#0f766e 100%); border-radius:20px; padding:24px 28px; margin-bottom:20px; overflow:hidden;',
    'background:linear-gradient(135deg,#0f1f3d 0%,#1e3a5f 60%,#1a3a6b 100%); border-radius:20px; padding:24px 28px; margin-bottom:20px; overflow:hidden;'
);

// Fix profile avatar — nearly invisible bg + old orange border → visible
rep(
    'style="width:52px;height:52px;border-radius:14px;background:rgba(30,58,95,0.15);border:1px solid rgba(245,166,35,0.35);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;"><i class="bi bi-person-fill"',
    'style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.35);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;color:#fff;"><i class="bi bi-person-fill"'
);

// Also fix My Activity hero and Borrowing hero that have the same old orange border pattern
repAll(
    'background:rgba(30,58,95,0.15);border:1px solid rgba(245,166,35,0.35);',
    'background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.3);'
);

// ── 7: Profile card header — old orange gradient → subtle navy ────────────────
repAll(
    'background:linear-gradient(135deg,rgba(245,166,35,0.06),transparent);',
    'background:linear-gradient(135deg,rgba(30,58,95,0.05),transparent);'
);

// ── 8: Profile save — also update sessionStorage so page reflects changes ─────
// updateUserProfile in app.js already saves to Supabase, no change needed in dashboard
// But ensure phone key consistency — app.js saves as phone, but session uses contactNumber
// The handler already sets user.contactNumber = payload.phone — no change needed

// ── 9: Profile 2-edits-per-month limit ───────────────────────────────────────
// Replace the submit button with one that shows remaining edits + blocks after 2
rep(
    '<button type="submit" style="width:100%;padding:13px;border-radius:12px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#0f1f3d);color:#fff;box-shadow:0 4px 12px rgba(30,58,95,0.25);transition:all 0.2s;"><i class="bi bi-check-circle mr-2"></i>Save Changes</button>',
    '<div id="profileEditQuota" style="font-size:12px;color:#6b7280;text-align:right;margin-bottom:8px;"></div>\n                                <button type="submit" id="profileSaveBtn" style="width:100%;padding:13px;border-radius:12px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,#1e3a5f,#0f1f3d);color:#fff;box-shadow:0 4px 12px rgba(30,58,95,0.25);transition:all 0.2s;"><i class="bi bi-check-circle mr-2"></i>Save Changes</button>'
);

// Replace profile save handler to add 2-edits-per-month tracking
rep(
    `spForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        const origBtn = btn.innerHTML;
                        btn.innerHTML = 'Saving...'; btn.disabled = true;
                        try {
                            const payload = {
                                fullName: document.getElementById('p-fullName').value,
                                email: document.getElementById('p-email').value,
                                phone: document.getElementById('p-phone').value,
                                address: document.getElementById('p-address').value`,
    `spForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        // ── 2-edits-per-month guard ──────────────────────
                        const now = new Date();
                        const monthKey = now.getFullYear() + '-' + (now.getMonth() + 1);
                        const quotaRaw = localStorage.getItem('profileEditQuota');
                        let quota = quotaRaw ? JSON.parse(quotaRaw) : {};
                        const usedThisMonth = (quota.month === monthKey) ? (quota.count || 0) : 0;
                        if (usedThisMonth >= 2) {
                            showAlert('You have reached the limit of 2 profile edits for this month. Changes are locked until next month.', 'error');
                            return;
                        }
                        const btn = e.target.querySelector('button[type="submit"]');
                        const origBtn = btn.innerHTML;
                        btn.innerHTML = 'Saving...'; btn.disabled = true;
                        try {
                            const payload = {
                                fullName: document.getElementById('p-fullName').value,
                                email: document.getElementById('p-email').value,
                                phone: document.getElementById('p-phone').value,
                                address: document.getElementById('p-address').value`
);

// After showAlert success line, add quota increment
rep(
    `showAlert('Profile updated successfully!', 'success');

                            document.getElementById('sidebarUserName').textContent = user.fullName;`,
    `showAlert('Profile updated successfully!', 'success');

                            // Track edit count
                            const _now = new Date();
                            const _mk = _now.getFullYear() + '-' + (_now.getMonth() + 1);
                            const _qr = localStorage.getItem('profileEditQuota');
                            let _q = _qr ? JSON.parse(_qr) : {};
                            const _used = (_q.month === _mk) ? (_q.count || 0) : 0;
                            localStorage.setItem('profileEditQuota', JSON.stringify({ month: _mk, count: _used + 1 }));
                            _updateProfileQuotaUI();

                            document.getElementById('sidebarUserName').textContent = user.fullName;`
);

// Add _updateProfileQuotaUI helper + initial quota display after spForm handler setup
rep(
    `const spForm = document.getElementById('standaloneProfileForm');
                if (spForm) {`,
    `function _updateProfileQuotaUI() {
                    const now = new Date();
                    const monthKey = now.getFullYear() + '-' + (now.getMonth() + 1);
                    const quotaRaw = localStorage.getItem('profileEditQuota');
                    let quota = quotaRaw ? JSON.parse(quotaRaw) : {};
                    const used = (quota.month === monthKey) ? (quota.count || 0) : 0;
                    const remaining = Math.max(0, 2 - used);
                    const el = document.getElementById('profileEditQuota');
                    const btn = document.getElementById('profileSaveBtn');
                    if (el) {
                        if (remaining === 0) {
                            el.textContent = 'Edit limit reached for this month (0 edits remaining).';
                            el.style.color = '#dc2626';
                        } else {
                            el.textContent = remaining + ' profile edit' + (remaining === 1 ? '' : 's') + ' remaining this month.';
                            el.style.color = remaining === 1 ? '#d97706' : '#6b7280';
                        }
                    }
                    if (btn) btn.disabled = remaining === 0;
                }
                const spForm = document.getElementById('standaloneProfileForm');
                if (spForm) {
                    _updateProfileQuotaUI();`
);

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
