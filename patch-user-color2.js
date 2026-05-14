const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

let changes = 0;
function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', old.substring(0,60)); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}
function repAll(old, neu) {
    const before = c.split(old).length - 1;
    c = c.split(old).join(neu);
    if (before === 0) console.log('MISS (repAll):', old.substring(0,60));
    else changes += before;
}

// ─── Header "RESIDENT" role badge orange → white ──────────────────────────
rep(
    'font-semibold uppercase" style="color:#f5a623;">Resident</div>',
    'font-semibold uppercase" style="color:rgba(255,255,255,0.65);">Resident</div>'
);

// ─── User avatar in nav: orange background → navy ─────────────────────────
rep(
    'style="background:#f5a623;color:#0f1f3d;border:2px solid rgba(245,166,35,0.5);',
    'style="background:#1e3a5f;color:#fff;border:2px solid rgba(30,58,95,0.5);'
);

// ─── Gradient backgrounds (equipment borrow modal header, etc.) ───────────
repAll(
    'background:linear-gradient(135deg,#f5a623,#0f1f3d)',
    'background:linear-gradient(135deg,#1e3a5f,#0f1f3d)'
);
repAll(
    'background: linear-gradient(135deg, #f5a623, #0f1f3d)',
    'background: linear-gradient(135deg, #1e3a5f, #0f1f3d)'
);

// ─── Active selection borders orange → navy ───────────────────────────────
repAll(
    "'2px solid #f5a623'",
    "'2px solid #1e3a5f'"
);
rep(
    '"2px solid #f5a623"',
    '"2px solid #1e3a5f"'
);
rep(
    'border:2px solid #0f1f3d;background:#f5a623;box-shadow:0 4px 14px rgba(245,166,35,.35);',
    'border:2px solid #0f1f3d;background:#1e3a5f;box-shadow:0 4px 14px rgba(30,58,95,.35);'
);

// ─── Dark mode baseColor orange → navy ────────────────────────────────────
rep(
    "let baseColor = isDark ? '#f5a623' : '#0f1f3d';",
    "let baseColor = isDark ? '#1e3a5f' : '#0f1f3d';"
);
repAll(
    "let baseBorder = isDark ? '1px solid #f5a623' : '1px solid #f5a623';",
    "let baseBorder = '1px solid #1e3a5f';"
);

// ─── Input focus orange inline handlers → navy ────────────────────────────
repAll(
    "this.style.borderColor='#f5a623';this.style.boxShadow='0 0 0 3px rgba(245,166,35,0.",
    "this.style.borderColor='#1e3a5f';this.style.boxShadow='0 0 0 3px rgba(30,58,95,0."
);
repAll(
    "this.style.borderColor='#f5a623'",
    "this.style.borderColor='#1e3a5f'"
);

// ─── accent-color for checkboxes/radios → navy ────────────────────────────
repAll(
    "accent-color:#f5a623;",
    "accent-color:#1e3a5f;"
);

// ─── Borrowing rules/badge colors orange → navy ───────────────────────────
rep(
    "border:1px solid #f5a623;margin:2px;",
    "border:1px solid #1e3a5f;margin:2px;"
);
rep(
    "color:#065f46;border:1px solid #f5a623;",
    "color:#1e3a5f;border:1px solid #1e3a5f;"
);

// ─── Icon color orange → navy ─────────────────────────────────────────────
rep(
    'class="bi bi-journal-text" style="color:#f5a623;"',
    'class="bi bi-journal-text" style="color:#1e3a5f;"'
);

// ─── Hover onmouseover orange border → navy ───────────────────────────────
rep(
    "this.style.borderColor='#f5a623';this.style.color='#065f46'",
    "this.style.borderColor='#1e3a5f';this.style.color='#065f46'"
);

// ─── Selected status badge orange → navy ─────────────────────────────────
rep(
    'color: #f5a623 !important; border-color: rgba(245,166,35,0.3) !important;',
    'color: #1e3a5f !important; border-color: rgba(30,58,95,0.3) !important;'
);
rep(
    'color: #f5a623 !important; }',
    'color: #1e3a5f !important; }'
);

// Remaining rgba(245,166,35,...) backgrounds → navy equiv
repAll(
    'rgba(245,166,35,0.15)',
    'rgba(30,58,95,0.12)'
);
repAll(
    'rgba(245,166,35,0.1)',
    'rgba(30,58,95,0.1)'
);
repAll(
    'rgba(245,166,35,0.2)',
    'rgba(30,58,95,0.15)'
);
repAll(
    'rgba(245,166,35,.35)',
    'rgba(30,58,95,.35)'
);

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
