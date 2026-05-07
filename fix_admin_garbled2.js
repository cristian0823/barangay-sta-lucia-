
const fs = require('fs');
let html = fs.readFileSync('admin-portal/admin.html', 'utf8');
const before = html.length;

// ── Line 2458: Settings button ──────────────────────────────────────────────
html = html.replace(
    `<button onclick="window.location.href='admin-settings.html'" style="color: var(--text);">\u00c3\u0192\u00c2\u00a2\u00c3\u2026\u00c2\u00a1\u00c3\u00a2\u00e2\u20ac\u017e\u00c2\u00a2\u00c3\u0192\u00c2\u00af\u00c3\u201a\u00c2\u00b8\u00c3\u201a\u00c2\u00a0 Settings</button>`,
    `<button onclick="window.location.href='admin-settings.html'" style="color: var(--text);"><i class="bi bi-gear-fill"></i> Settings</button>`
);

// ── Line 2459: Logout button ─────────────────────────────────────────────────
html = html.replace(
    `<button onclick="logoutUser()" style="color: var(--danger);">\u00c3\u0192\u00c2\u00b0\u00c3\u2026\u00c2\u00b8\u00c3\u2026\u00c2\u00a1\u00c3\u201a\u00c2\u00aa Logout</button>`,
    `<button onclick="logoutUser()" style="color: var(--danger);"><i class="bi bi-box-arrow-right"></i> Logout</button>`
);

// ── Line 5365: Concerns "Replied" badge ─────────────────────────────────────
html = html.replace(
    `'<div style="margin-top:3px;font-size:11px;color:#059669;font-style:italic;">\u00c3\u0192\u00c2\u00a2\u00c3\u2026\u00e2\u20ac\u0153\u00c3\u00a2\u00e2\u201a\u00ac\u00c5\u201e Replied</div>'`,
    `'<div style="margin-top:3px;font-size:11px;color:#059669;font-style:italic;"><i class=\\"bi bi-check-circle-fill\\"></i> Replied</div>'`
);

// ── Line 5366: Concerns "Photo" badge ───────────────────────────────────────
html = html.replace(
    `'<span style="margin-left:5px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:20px;font-weight:700;">\u00c3\u0192\u00c2\u00b0\u00c3\u2026\u00c2\u00b8\u00c3\u00a2\u00e2\u201a\u00ac\u00c5\u201e\u00c3\u201a\u00c2\u00b7 Photo</span>'`,
    `'<span style="margin-left:5px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:20px;font-weight:700;"><i class=\\"bi bi-image-fill\\"></i> Photo</span>'`
);

if (html.length === before) {
    console.log('WARNING: No replacements made (strings not found). Trying byte-level approach...');
    
    // Try a different approach: rebuild the lines by line number
    const lines = html.split('\n');
    
    // Line 2458 (0-indexed: 2457) - Settings button
    if (lines[2457] && lines[2457].includes('admin-settings.html')) {
        lines[2457] = `            <button onclick="window.location.href='admin-settings.html'" style="color: var(--text);"><i class="bi bi-gear-fill"></i> Settings</button>\r`;
        console.log('Fixed line 2458 (Settings) by line replacement');
    }
    
    // Line 2459 (0-indexed: 2458) - Logout button  
    if (lines[2458] && lines[2458].includes('logoutUser')) {
        lines[2458] = `            <button onclick="logoutUser()" style="color: var(--danger);"><i class="bi bi-box-arrow-right"></i> Logout</button>\r`;
        console.log('Fixed line 2459 (Logout) by line replacement');
    }
    
    // Line 5365 (0-indexed: 5364) - Replied badge
    if (lines[5364] && lines[5364].includes('Replied')) {
        lines[5364] = `                    const resp = _adminParseConcernResponse(c.response).reply ? '<div style="margin-top:3px;font-size:11px;color:#059669;font-style:italic;"><i class=\\"bi bi-check-circle-fill\\"></i> Replied</div>' : '';\r`;
        console.log('Fixed line 5365 (Replied) by line replacement');
    }
    
    // Line 5366 (0-indexed: 5365) - Photo badge
    if (lines[5365] && lines[5365].includes('Photo')) {
        lines[5365] = `                    const img = (c.description&&c.description.includes('[ATTACHED_IMAGE_DATA]'))||c.imageUrl ? '<span style="margin-left:5px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 6px;border-radius:20px;font-weight:700;"><i class=\\"bi bi-image-fill\\"></i> Photo</span>' : '';\r`;
        console.log('Fixed line 5366 (Photo) by line replacement');
    }
    
    html = lines.join('\n');
} else {
    console.log('String replacements applied successfully');
}

fs.writeFileSync('admin-portal/admin.html', html, 'utf8');

// Verify
const verify = fs.readFileSync('admin-portal/admin.html', 'utf8').split('\n');
const garbledStillPresent = [2457, 2458, 5364, 5365].filter(i => {
    return /[\u00c0-\u00ff]{3,}/.test(verify[i] || '');
});
if (garbledStillPresent.length === 0) {
    console.log('✓ All target lines are now clean');
} else {
    console.log('✗ Garbled text still present at lines:', garbledStillPresent.map(i => i+1));
    garbledStillPresent.forEach(i => console.log('  Line ' + (i+1) + ':', (verify[i]||'').trim().substring(0,100)));
}
