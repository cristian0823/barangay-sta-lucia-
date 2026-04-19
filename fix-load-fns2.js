const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
const lines = html.split('\n');

// ── FIX loadUsers (line 4637 area) ────────────────────────────────────────────
// Find the exact index of the loadUsers render block and splice it
function patchFunction(startMarker, endMarker, replacement) {
    const start = html.indexOf(startMarker);
    const end = html.indexOf(endMarker, start);
    if (start === -1) { console.log('MISSING start:', startMarker.substring(0, 60)); return false; }
    if (end === -1) { console.log('MISSING end:', endMarker.substring(0, 60)); return false; }
    html = html.substring(0, start) + replacement + html.substring(end + endMarker.length);
    return true;
}

// ── loadUsers ─────────────────────────────────────────────────────────────────
const usersRenderStart = 'if (emptyState) emptyState.style.display = \'none\';\r\n                tbody.innerHTML = users.map';
const usersRenderEnd = '}).join(\'\');\r\n             }';
const usersReplacement = `if (emptyState) emptyState.style.display = 'none';\r\n                _allUsersList = users;\r\n                _usersPage = 1;\r\n                renderUsersPage();\r\n             }`;
if (html.includes(usersRenderStart)) {
    const s = html.indexOf(usersRenderStart);
    // Find the closing }).join(''); after this block
    let depth = 0;
    let i = s + usersRenderStart.length;
    let found = -1;
    while (i < html.length) {
        if (html[i] === '{') depth++;
        if (html[i] === '}') { if (depth === 0) { found = i; break; } depth--; }
        i++;
    }
    if (found > -1) {
        // Find }).join(''); right after the closing }
        const joinStr = "}).join('');";
        const joinIdx = html.indexOf(joinStr, found);
        if (joinIdx > found && joinIdx - found < 20) {
            html = html.substring(0, s) + usersReplacement + html.substring(joinIdx + joinStr.length);
            console.log('OK: loadUsers patched');
        } else {
            console.log('WARN: loadUsers join not found near', found);
        }
    } else {
        console.log('WARN: loadUsers closing brace not found');
    }
} else {
    console.log('WARN: loadUsers render start not found');
}

// ── loadMultipurposeBookings ───────────────────────────────────────────────────
const mpStart = 'empty.style.display = \'none\';\r\n\r\n                const statusColors = { pending: { bg: \'#fef9c3\', color: \'#854d0e\' }, approved: { bg: \'#dcfce7\', color: \'#166534\' }, booked: { bg: \'#dcfce7\', color: \'#166534\' }, rejected: { bg: \'#fee2e2\', color: \'#991b1b\' }, cancelled: { bg: \'#f1f5f9\', color: \'#475569\' } };\r\n                tbody.innerHTML = mpBookings.map';
if (html.includes(mpStart)) {
    const s = html.indexOf(mpStart);
    let r = s + mpStart.length;
    let d = 0;
    while (r < html.length) {
        if (html[r] === '{') d++;
        if (html[r] === '}') { if (d === 0) break; d--; }
        r++;
    }
    const joinStr = "}).join('');";
    const joinIdx = html.indexOf(joinStr, r);
    if (joinIdx > r && joinIdx - r < 30) {
        const replacement = "empty.style.display = 'none';\r\n                _allMpList = mpBookings;\r\n                _mpPage = 1;\r\n                renderMpPage();";
        html = html.substring(0, s) + replacement + html.substring(joinIdx + joinStr.length);
        console.log('OK: loadMultipurposeBookings patched');
    } else {
        console.log('WARN: mpBookings join not found, joinIdx:', joinIdx, 'r:', r);
    }
} else {
    console.log('WARN: mpStart not found');
}

// ── loadAdminBookings: assign _allCourtList before renderCourtPage ─────────────
// Court bookings already injects pagination via the early patch script, 
// but _allCourtList needs to be set from allBookings in this function.
// Find: "_allAdminBookingsList = allBookings;" inside loadAdminBookings (after line ~6000)
const admBookIdx = html.indexOf('async function loadAdminBookings()');
if (admBookIdx > -1) {
    const assignStr = '_allAdminBookingsList = allBookings;\r\n\r\n                // Auto-remove past bookings from display';
    const localIdx = html.indexOf(assignStr, admBookIdx);
    if (localIdx > -1) {
        html = html.substring(0, localIdx) + '_allAdminBookingsList = allBookings;\r\n\r\n                // Auto-remove past bookings from display' + html.substring(localIdx + assignStr.length);
        // Now find the point after all filtering where it sets empty.style.display = 'none'
        // and inject _allCourtList = allBookings; renderCourtPage();
        // Find the direct tbody.innerHTML = allBookings.map inside loadAdminBookings
        const tbodyIdx = html.indexOf('tbody.innerHTML = allBookings.map(b =>', admBookIdx);
        if (tbodyIdx > -1) {
            // Find the empty.style.display = 'none'; just before it
            const emptyBeforeIdx = html.lastIndexOf("empty.style.display = 'none';", tbodyIdx);
            if (emptyBeforeIdx > admBookIdx && tbodyIdx - emptyBeforeIdx < 200) {
                // Find the .join(''); at the end of this map
                let i = tbodyIdx + 40;
                let d = 0;
                while (i < html.length) {
                    if (html[i] === '{') d++;
                    if (html[i] === '}') { if (d === 0) break; d--; }
                    i++;
                }
                const joinStr = "}).join('');";
                const jIdx = html.indexOf(joinStr, i);
                if (jIdx > i && jIdx - i < 30) {
                    const emptyLine = html.substring(emptyBeforeIdx, emptyBeforeIdx + 31);
                    const newBlock = "empty.style.display = 'none';\r\n                _allCourtList = allBookings;\r\n                _courtPage = 1;\r\n                renderCourtPage();";
                    html = html.substring(0, emptyBeforeIdx) + newBlock + html.substring(jIdx + joinStr.length);
                    console.log('OK: loadAdminBookings render patched');
                } else {
                    console.log('WARN: allBookings join not found, jIdx:', jIdx, 'i:', i);
                }
            } else {
                console.log('WARN: empty before tbody not found');
            }
        } else {
            console.log('WARN: allBookings.map not found in loadAdminBookings');
        }
    }
}

fs.writeFileSync('admin.html', html);
console.log('\nVerifying...');
const h2 = fs.readFileSync('admin.html', 'utf8');
['_allUsersList = users', '_allMpList = mpBookings', '_allCourtList = allBookings', 'renderUsersPage', 'renderMpPage', 'renderCourtPage'].forEach(k => {
    console.log((h2.includes(k) ? 'OK' : 'MISSING') + ': ' + k);
});
