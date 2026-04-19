const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// Strategy: Replace a UNIQUE short string that appears at the END of each direct render
// with the pagination call, then remove the dead code before it.

// ═══ 1. loadUsers ════════════════════════════════════════════════════════════
// The users map ends with this unique sequence (address column, closing tr, join)
const usersMapEnd = `                        <td style="font-size:12px;">${'$'}{address}</td>\r\n                    </tr>\`;\r\n                }).join('');\r\n             }`;

// What we replace FROM: the 'if (emptyState) emptyState.style.display = \'none\';' that precedes the tbody.innerHTML in loadUsers
// We find the SECOND occurrence (first is in renderUsersPage, second is in the original function)
const usersNoneIdx_1 = html.indexOf("if (emptyState) emptyState.style.display = 'none';\n                tbody.innerHTML = users.map");
const usersNoneIdx_2 = html.indexOf("if (emptyState) emptyState.style.display = 'none';\r\n                tbody.innerHTML = users.map");

const usersStart = Math.max(usersNoneIdx_1, usersNoneIdx_2);
const usersEnd_1 = html.indexOf("}).join('');\r\n             }", usersStart);
const usersEnd_2 = html.indexOf("}).join('');\n             }", usersStart);
const usersEnd = usersEnd_1 > usersStart ? usersEnd_1 : usersEnd_2;

if (usersStart > -1 && usersEnd > usersStart) {
    const closingToken = usersEnd_1 > usersStart ? "}).join('');\r\n             }" : "}).join('');\n             }";
    html = html.substring(0, usersStart) 
        + "if (emptyState) emptyState.style.display = 'none';\r\n                _allUsersList = users;\r\n                _usersPage = 1;\r\n                renderUsersPage();\r\n             }" 
        + html.substring(usersEnd + closingToken.length);
    console.log('OK: loadUsers patched');
} else {
    console.log('FAIL loadUsers: start=' + usersStart + ' end=' + usersEnd);
}

// ═══ 2. loadMultipurposeBookings ════════════════════════════════════════════
// This map ends with these two unique closing rows:
const mpMapSearch_1 = "}).join('');\r\n             }\r\n\r\n             async function loadAdminBookings()";
const mpMapSearch_2 = "}).join('');\n             }\n\n             async function loadAdminBookings()";

let mpJoinIdx = html.indexOf(mpMapSearch_1);
let mpJoinLen = mpMapSearch_1.length;
if (mpJoinIdx === -1) { mpJoinIdx = html.indexOf(mpMapSearch_2); mpJoinLen = mpMapSearch_2.length; }

// Now find the empty.style.display before this join
if (mpJoinIdx > -1) {
    const mpEmptyIdx_1 = html.lastIndexOf("empty.style.display = 'none';\r\n\r\n                const statusColors", mpJoinIdx);
    const mpEmptyIdx_2 = html.lastIndexOf("empty.style.display = 'none';\n\n                const statusColors", mpJoinIdx);
    const mpEmptyIdx = Math.max(mpEmptyIdx_1, mpEmptyIdx_2);
    if (mpEmptyIdx > -1 && mpJoinIdx - mpEmptyIdx < 3000) {
        const joinClose = mpJoinIdx > -1 ? (mpMapSearch_1.substring(0, mpMapSearch_1.indexOf('\r\nasync') > 0 ? mpMapSearch_1.indexOf('\r\nasync') : mpMapSearch_1.indexOf('\nasync'))) : '';
        const joinCloseStr_1 = "}).join('');\r\n             }";
        const joinCloseStr_2 = "}).join('');\n             }";
        const usesCRLF = html.indexOf(joinCloseStr_1, mpEmptyIdx) < html.indexOf(joinCloseStr_2 + '\n', mpEmptyIdx) || html.indexOf(joinCloseStr_2, mpEmptyIdx) === -1;
        const joinCloseStr = usesCRLF ? joinCloseStr_1 : joinCloseStr_2;
        const actualJoinIdx = html.indexOf(joinCloseStr, mpEmptyIdx);
        if (actualJoinIdx > mpEmptyIdx && actualJoinIdx < mpJoinIdx + 10) {
            html = html.substring(0, mpEmptyIdx) 
                + "empty.style.display = 'none';\r\n                _allMpList = mpBookings;\r\n                _mpPage = 1;\r\n                renderMpPage();\r\n             }" 
                + html.substring(actualJoinIdx + joinCloseStr.length);
            console.log('OK: loadMultipurposeBookings patched');
        } else {
            console.log('FAIL mp: actualJoinIdx=' + actualJoinIdx + ' mpEmptyIdx=' + mpEmptyIdx + ' mpJoinIdx=' + mpJoinIdx);
        }
    } else {
        console.log('FAIL mp: mpEmptyIdx=' + mpEmptyIdx);
    }
} else {
    console.log('FAIL mp: join not found');
}

// ═══ 3. loadAdminBookings ════════════════════════════════════════════════════
// Find tbody.innerHTML = allBookings.map inside loadAdminBookings
const admFnIdx = html.indexOf('async function loadAdminBookings()');
if (admFnIdx > -1) {
    const mapStr_1 = "tbody.innerHTML = allBookings.map(b => {\r\n                    const statusColors = {\r\n                        pending: { bg: '#fef9c3'";
    const mapStr_2 = "tbody.innerHTML = allBookings.map(b => {\n                    const statusColors = {\n                        pending: { bg: '#fef9c3'";
    let mapIdx = html.indexOf(mapStr_1, admFnIdx);
    let usedMap = mapStr_1;
    if (mapIdx === -1) { mapIdx = html.indexOf(mapStr_2, admFnIdx); usedMap = mapStr_2; }

    if (mapIdx > admFnIdx) {
        // Find empty.style = 'none' before this map
        const emptyBefore_1 = html.lastIndexOf("empty.style.display = 'none';\r\n\r\n                tbody.innerHTML = allBookings.map", mapIdx + 5);
        const emptyBefore_2 = html.lastIndexOf("empty.style.display = 'none';\n\n                tbody.innerHTML = allBookings.map", mapIdx + 5);
        const emptyBefore = Math.max(emptyBefore_1, emptyBefore_2);

        if (emptyBefore > admFnIdx) {
            // Find the }).join(''); after this map
            // The map spans many lines - find the unique ending before the next major function
            const nextFnIdx = html.indexOf('\n             }\r\n\r\n             async function', mapIdx);
            if (nextFnIdx > mapIdx) {
                const joinEnd_1 = html.lastIndexOf("}).join('');", nextFnIdx);
                if (joinEnd_1 > mapIdx) {
                    const joinEndFull = joinEnd_1 + "}).join('');".length;
                    html = html.substring(0, emptyBefore) 
                        + "empty.style.display = 'none';\r\n                _allCourtList = allBookings;\r\n                _courtPage = 1;\r\n                renderCourtPage();" 
                        + html.substring(joinEndFull);
                    console.log('OK: loadAdminBookings patched');
                } else {
                    console.log('FAIL court: join not found before nextFn');
                }
            } else {
                console.log('FAIL court: nextFn not found, mapIdx=' + mapIdx);
            }
        } else {
            console.log('FAIL court: emptyBefore not found');
        }
    } else {
        console.log('FAIL court: allBookings.map not found after admFnIdx');
    }
} else {
    console.log('FAIL: loadAdminBookings function not found');
}

fs.writeFileSync('admin.html', html);
console.log('\nFinal verification:');
const h2 = fs.readFileSync('admin.html', 'utf8');
['_allUsersList = users', '_allMpList = mpBookings', '_allCourtList = allBookings'].forEach(k => {
    const count = h2.split(k).length - 1;
    console.log((count > 0 ? 'OK(' + count + ')' : 'MISSING') + ': ' + k);
});
