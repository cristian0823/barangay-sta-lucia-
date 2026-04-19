const fs = require('fs');
let h = fs.readFileSync('admin.html', 'utf8');
const joinToken = "}).join('');\r\n            }\r\n\r\n           ";

// ── loadUsers ─────────────────────────────────────────────────────────────────
const batchIdx = h.indexOf('//  BATCH UPLOAD FUNCTIONS ');
const usersMapStart = h.indexOf('tbody.innerHTML = users.map');
if (usersMapStart > -1 && usersMapStart < batchIdx) {
    const joinIdx = h.indexOf(joinToken, usersMapStart);
    if (joinIdx > usersMapStart && joinIdx < batchIdx) {
        const emptyStr = "if (emptyState) emptyState.style.display = 'none';";
        const emptyIdx = h.lastIndexOf(emptyStr, usersMapStart);
        if (emptyIdx > -1 && usersMapStart - emptyIdx < 200) {
            h = h.substring(0, emptyIdx) +
                "if (emptyState) emptyState.style.display = 'none';\r\n                _allUsersList = users;\r\n                _usersPage = 1;\r\n                renderUsersPage();\r\n            }\r\n\r\n           " +
                h.substring(joinIdx + joinToken.length);
            console.log('OK: loadUsers patched');
        } else { console.log('FAIL users: emptyIdx=' + emptyIdx + ' usersMapStart=' + usersMapStart); }
    } else { console.log('FAIL users: joinIdx=' + joinIdx); }
} else { console.log('FAIL users:', usersMapStart, batchIdx); }

// ── loadMultipurposeBookings ───────────────────────────────────────────────────
const mpFnIdx = h.indexOf('async function loadMultipurposeBookings()');
const admFnIdx = h.indexOf('async function loadAdminBookings()');
const mpMapStart = h.indexOf('tbody.innerHTML = mpBookings.map', mpFnIdx);
if (mpMapStart > mpFnIdx && mpMapStart < admFnIdx) {
    const joinIdx = h.indexOf(joinToken, mpMapStart);
    if (joinIdx > mpMapStart && joinIdx < admFnIdx + 200) {
        const emptyStr = "empty.style.display = 'none';";
        const emptyIdx = h.lastIndexOf(emptyStr, mpMapStart);
        if (emptyIdx > mpFnIdx) {
            h = h.substring(0, emptyIdx) +
                "empty.style.display = 'none';\r\n                _allMpList = mpBookings;\r\n                _mpPage = 1;\r\n                renderMpPage();\r\n            }\r\n\r\n           " +
                h.substring(joinIdx + joinToken.length);
            console.log('OK: loadMultipurposeBookings patched');
        } else { console.log('FAIL mp: emptyIdx=' + emptyIdx); }
    } else { console.log('FAIL mp: joinIdx=' + joinIdx + ' mpMapStart=' + mpMapStart + ' admFnIdx=' + admFnIdx); }
} else { console.log('FAIL mp: mpMapStart=' + mpMapStart); }

// ── loadAdminBookings ─────────────────────────────────────────────────────────
const admMap = h.indexOf('tbody.innerHTML = allBookings.map', admFnIdx);
if (admMap > admFnIdx) {
    const joinIdx = h.indexOf(joinToken, admMap);
    if (joinIdx > admMap) {
        const emptyStr = "empty.style.display = 'none';";
        const emptyIdx = h.lastIndexOf(emptyStr, admMap);
        if (emptyIdx > admFnIdx) {
            h = h.substring(0, emptyIdx) +
                "empty.style.display = 'none';\r\n                _allCourtList = allBookings;\r\n                _courtPage = 1;\r\n                renderCourtPage();\r\n            }\r\n\r\n           " +
                h.substring(joinIdx + joinToken.length);
            console.log('OK: loadAdminBookings patched');
        } else { console.log('FAIL court: emptyIdx=' + emptyIdx + ' admFnIdx=' + admFnIdx); }
    } else { console.log('FAIL court: joinIdx=' + joinIdx); }
} else { console.log('FAIL court: admMap=' + admMap); }

fs.writeFileSync('admin.html', h);
console.log('\nVerifying...');
const h2 = fs.readFileSync('admin.html', 'utf8');
['_allUsersList = users', '_allMpList = mpBookings', '_allCourtList = allBookings'].forEach(k => {
    const count = h2.split(k).length - 1;
    console.log((count > 0 ? 'OK(x' + count + ')' : 'MISSING') + ': ' + k);
});
