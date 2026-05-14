const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

// ─── 1. CSS variables: change --primary orange → navy ──────────────────────
// Light mode vars
c = c.replace(
    '--primary: #f5a623; --primary-hover: #e09610;',
    '--primary: #1e3a5f; --primary-hover: #0f2547;'
);
// Dark mode vars (multiple lines in root block)
c = c.replace(
    '--primary: #f5a623; --nav-hover-bg: rgba(245,166,35,0.1);',
    '--primary: #1e3a5f; --nav-hover-bg: rgba(30,58,95,0.2);'
);
c = c.replace(
    '--nav-active-bg: rgba(245,166,35,0.2); --nav-active-text: #f5a623;',
    '--nav-active-bg: rgba(30,58,95,0.4); --nav-active-text: #fff;'
);
c = c.replace(
    '--input-focus: #f5a623;\n            --green-xl: #f5a623;',
    '--input-focus: #1e3a5f;\n            --green-xl: #1e3a5f;'
);
console.log('OK CSS variables');

// ─── 2. Dark theme nav item hover/active orange → white ────────────────────
c = c.replace(
    '[data-theme="dark"] .nav-item:hover { background-color: rgba(245,166,35,0.08); color: #f5a623; }',
    '[data-theme="dark"] .nav-item:hover { background-color: rgba(255,255,255,0.06); color: #fff; }'
);
c = c.replace(
    '[data-theme="dark"] .nav-item .nav-icon { background-color: rgba(245,166,35,0.08); color: #f5a623; }',
    '[data-theme="dark"] .nav-item .nav-icon { background-color: rgba(30,58,95,0.2); color: rgba(255,255,255,0.8); }'
);
console.log('OK dark nav colors');

// ─── 3. Header: "Resident Portal" subtitle orange → muted white ────────────
// Mobile version
c = c.replace(
    '<span style="font-size:10px;color:#f5a623;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Resident Portal</span>',
    '<span style="font-size:10px;color:rgba(255,255,255,0.6);font-weight:600;text-transform:uppercase;letter-spacing:1px;">Resident Portal</span>'
);
// Desktop version
c = c.replace(
    '<span class="subtitle text-[11px] uppercase tracking-widest font-semibold" style="color:#f5a623;">Resident Portal</span>',
    '<span class="subtitle text-[11px] uppercase tracking-widest font-semibold" style="color:rgba(255,255,255,0.6);">Resident Portal</span>'
);
console.log('OK header subtitle');

// ─── 4. Hero banner: remove orange "Barangay Resident Portal" label + dash ─
const OLD_BANNER_LABEL = `<div style="font-size:10px;font-weight:700;color:#F59E0B;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px;"><span style="width:16px;height:2px;background:#F59E0B;border-radius:2px;display:inline-block;"></span>Barangay Resident Portal</div>
                            <h2 id="dashGreeting"`;
const NEW_BANNER_LABEL = `<h2 id="dashGreeting"`;
let idx = c.indexOf(OLD_BANNER_LABEL);
if (idx === -1) { console.log('MISS banner label'); process.exit(1); }
c = c.substring(0, idx) + NEW_BANNER_LABEL + c.substring(idx + OLD_BANNER_LABEL.length);
console.log('OK remove hero banner orange label');

// ─── 5. Hero banner: date color orange → white/muted ──────────────────────
c = c.replace(
    '<div id="dashDate" style="font-size:13px;color:#F59E0B;font-weight:600;"></div>',
    '<div id="dashDate" style="font-size:13px;color:rgba(255,255,255,0.65);font-weight:500;"></div>'
);
console.log('OK hero date color');

// ─── 6. Quick action card default --uqa-color fallback ────────────────────
c = c.replace(
    /background: linear-gradient\(135deg, #f5a623, #0f1f3d\)/g,
    'background: linear-gradient(135deg, #1e3a5f, #0f1f3d)'
);
c = c.replace(
    '.user-quick-card::after {\n            height: 3px;\n            background: var(--uqa-color, #f5a623);',
    '.user-quick-card::after {\n            height: 3px;\n            background: var(--uqa-color, #1e3a5f);'
);
c = c.replace(
    '.user-quick-card:hover {\n            border-color: var(--uqa-color, #f5a623);',
    '.user-quick-card:hover {\n            border-color: var(--uqa-color, #1e3a5f);'
);
c = c.replace(
    'font-size: 20px; color: var(--uqa-color, #f5a623);',
    'font-size: 20px; color: var(--uqa-color, #1e3a5f);'
);
console.log('OK quick action card colors');

// ─── 7. Sidebar active border: orange left border → navy ──────────────────
// Keep sidebar active bg as navy; change any remaining f5a623 in sidebar CSS
c = c.replace(
    'border-color: rgba(245,166,35,0.5) !important; color: #f5a623 !important;',
    'border-color: rgba(30,58,95,0.5) !important; color: #1e3a5f !important;'
);
// Dark mode active text (if not already handled)
c = c.replace(
    '[data-theme="dark"] .text-slate-800 { color: #f5a623 !important; }',
    '[data-theme="dark"] .text-slate-800 { color: #fff !important; }'
);
console.log('OK sidebar active/dark colors');

// ─── 8. Equipment category color: Tables uses #f5a623 (keep as-is, it's
//        a data color not UI chrome) — skip
// But fix the FDB913 (gold) KPI usage if it was #FDB913 (admin trophy color)
// That's in admin, not user portal — skip

// ─── 9. Remaining --primary references in inline styles ───────────────────
// The var(--primary) references will automatically pick up the new #1e3a5f value
// No additional changes needed

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('\nDone. user-dashboard.html saved.');

// ─── Also patch login.html header ─────────────────────────────────────────
let l = fs.readFileSync('user-portal/login.html', 'utf8').replace(/\r\n/g, '\n');
// Change RESIDENTS ONLY badge orange border+text → navy
l = l.replace(
    'style="background:#fffbeb; color:#92400e; border:1px solid #fde68a; letter-spacing:0.1em;">Residents Only</span>',
    'style="background:#e8eef6; color:#1e3a5f; border:1px solid #c0cfe8; letter-spacing:0.1em;">Residents Only</span>'
);
// Change sign-in button gold text → white
l = l.replace(
    'style="background:#0f1f3d; color:#f5a623; font-family:inherit;',
    'style="background:#1e3a5f; color:#fff; font-family:inherit;'
);
// gold/navy top bar gradient → all navy
l = l.replace(
    'background: linear-gradient(90deg, #0f1f3d, #f5a623, #0f1f3d);',
    'background: linear-gradient(90deg, #0f1f3d, #1e3a5f, #0f1f3d);'
);
fs.writeFileSync('user-portal/login.html', l);
console.log('login.html saved.');
