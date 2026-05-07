
const fs = require('fs');
const html = fs.readFileSync('admin-portal/admin.html', 'utf8');
const lines = html.split('\n');

// Helper: replace a line by 0-indexed line number
function fixLine(idx, newContent) {
    const old = lines[idx];
    if (!old) { console.log('WARN: Line ' + (idx+1) + ' not found'); return; }
    lines[idx] = newContent + (old.endsWith('\r') ? '\r' : '');
    console.log('Fixed line ' + (idx+1));
}

// ── Line 3205: Security Log description garbled dash/bullet ─────────────────
fixLine(3204,
    `        <p style="color: var(--muted); font-size: 14px; margin: 0;">Authentication &amp; session events &mdash; OWASP A09:2021 compliant monitoring.</p>`
);

// ── Line 4789: Audit Log role label (emoji garbled) ─────────────────────────
fixLine(4788,
    `                    const roleLabel = role === 'admin' ? '<i class="bi bi-shield-lock-fill"></i> Admin' : role === 'user' ? '<i class="bi bi-person-fill"></i> User' : '<i class="bi bi-question-circle"></i> Unknown';`
);

// ── Line 5093: Security Log "N/A" details fallback garbled ──────────────────
fixLine(5092,
    `                        <td style="padding: 12px; font-size:12px; color: var(--muted);">\${s.details || 'N/A'}</td>`
);

// ── Line 5299: Pagination ‹ prev button arrow garbled ───────────────────────
// Read current content and replace the garbled arrow only
lines[5298] = lines[5298].replace(/Ã[^\x00-\x7F]*(?=<\/but)/g, '&lsaquo;');
// Also fix > next arrow if garbled
lines[5298] = lines[5298].replace(/(?<=\">)Ã[^\x00-\x7F]+(?=<\/but)/g, '&rsaquo;');
// Use a safer approach: replace the entire pagination button arrows
const paginationLine = lines[5298];
if (paginationLine.includes('pg-btn')) {
    lines[5298] = paginationLine
        .replace(/>[^<]{0,20}(?=<\/button>.*pg-btn.*onclick[^)]*page \+ 1)/s, '>&#8250;')
        .replace(/>[^<]{0,20}(?=<\/button>.*onclick[^)]*page - 1)/s, '>&#8249;');
}
console.log('Processed line 5299 (pagination arrows)');

// ── Line 5365: Concerns "Replied" badge ─────────────────────────────────────
fixLine(5364,
    `                    const resp = _adminParseConcernResponse(c.response).reply ? '<div style="margin-top:3px;font-size:11px;color:#059669;font-style:italic;"><i class=\\"bi bi-check-circle-fill\\"></i> Replied</div>' : '';`
);

// ── Line 5366: Concerns "Photo" badge ───────────────────────────────────────
fixLine(5365,
    `                    const img = (c.description&&c.description.includes('[ATTACHED_IMAGE_DATA]'))||c.imageUrl ? '<span style="margin-left:5px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:20px;font-weight:700;"><i class=\\"bi bi-image-fill\\"></i> Photo</span>' : '';`
);

// ── Line 6251: Facility Reservation Update title garbled char ───────────────
lines[6250] = lines[6250].replace(/Ãƒâ€¦[^\x00-\x7E]+/g, '').replace(/\s{2,}/g, ' ');
// Simpler: just trim trailing garbled after "Update"
lines[6250] = lines[6250].replace(/Facility Reservation Update\s+[^\x00-\x7E'",]+/g, 'Facility Reservation Update');
console.log('Processed line 6251 (facility title)');

// ── Lines 6632-6635: Maintenance Log status icons ───────────────────────────
fixLine(6631,
    `                'Under Repair':           { bg:'#fef3c7', color:'#92400e', icon:'<i class=\\"bi bi-tools\\"></i>' },`
);
fixLine(6632,
    `                'Repaired':               { bg:'#d1fae5', color:'#065f46', icon:'<i class=\\"bi bi-check-circle-fill\\"></i>' },`
);
fixLine(6633,
    `                'For Disposal':           { bg:'#fee2e2', color:'#991b1b', icon:'<i class=\\"bi bi-trash3-fill\\"></i>' },`
);
fixLine(6634,
    `                'Recovered from Disposal':{ bg:'#dbeafe', color:'#1e40af', icon:'<i class=\\"bi bi-arrow-counterclockwise\\"></i>' },`
);

// Check if there's a line 6636
if (lines[6635] && /[^\x00-\x7E]{2,}/.test(lines[6635])) {
    lines[6635] = lines[6635].replace(/icon:'[^']*'/g, 'icon:\'<i class=\\"bi bi-box-seam\\"></i>\'');
    console.log('Fixed line 6636 (maintenance extra status)');
}

// Write back
fs.writeFileSync('admin-portal/admin.html', lines.join('\n'), 'utf8');

// Final verification
const check = fs.readFileSync('admin-portal/admin.html', 'utf8').split('\n');
const remaining = [];
[3204, 4788, 5092, 5298, 5364, 5365, 6250, 6631, 6632, 6633, 6634].forEach(i => {
    const l = check[i] || '';
    const hasGarbled = /Ãƒ|Ã‚|Ã…/.test(l);
    if (hasGarbled) remaining.push('Line ' + (i+1) + ': STILL GARBLED');
    else console.log('Line ' + (i+1) + ': OK - ' + l.trim().substring(0, 80));
});
if (remaining.length) {
    console.log('\nREMAINING ISSUES:');
    remaining.forEach(r => console.log('  ' + r));
} else {
    console.log('\n✅ All target lines clean!');
}
