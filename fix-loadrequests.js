const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// Find the exact orphaned block and replace it
const orphaned = `                _allAdminRequestsList = borrowings;\r\n                    <td style="font-weight:bold;color:var(--text);">${b.quantity}</td>\r\n                    <td style="white-space: nowrap;color:var(--muted);">${b.borrowDate}<br>to ${b.returnDate}</td>\r\n                    <td style="color:var(--text);">${b.purpose}</td>\r\n                    <td>${getStatusBadge(b.status)}</td>\r\n                </tr>\r\n            \`}).join('');\r\n            }`;

const fixed = `                _allAdminRequestsList = borrowings;\r\n                _allRequestsList = borrowings;\r\n                _requestsPage = 1;\r\n                renderRequestsPage();\r\n            }`;

if (html.includes(orphaned)) {
    html = html.replace(orphaned, fixed);
    console.log('Orphaned block replaced successfully');
} else {
    // Try without \r
    const orphaned2 = orphaned.replace(/\r\n/g, '\n');
    if (html.includes(orphaned2)) {
        html = html.replace(orphaned2, fixed.replace(/\r\n/g, '\n'));
        console.log('Orphaned block (LF) replaced successfully');
    } else {
        // Try partial approach - find and fix multiline
        const idx = html.indexOf('_allAdminRequestsList = borrowings;');
        const nextFn = html.indexOf('async function loadCourtBookings');
        if (idx > -1 && nextFn > idx) {
            const before = html.substring(0, idx);
            const after = html.substring(nextFn);
            const patchedMiddle = `                _allAdminRequestsList = borrowings;\n                _allRequestsList = borrowings;\n                _requestsPage = 1;\n                renderRequestsPage();\n            }\n\n            `;
            html = before + patchedMiddle + after;
            console.log('Fixed via index approach');
        } else {
            console.log('ERROR: could not find orphaned block');
        }
    }
}

// Verify fix
if (html.includes('renderRequestsPage();\n            }\n\n            async function loadCourtBookings') || 
    html.includes('renderRequestsPage();\r\n            }\r\n\r\n            async function loadCourtBookings')) {
    console.log('OK: loadRequests properly wired');
} else {
    // check for the new block
    const hasCall = html.includes('renderRequestsPage()');
    const hasCourt = html.includes('async function loadCourtBookings');
    console.log('renderRequestsPage present:', hasCall);
    console.log('loadCourtBookings present:', hasCourt);
}

fs.writeFileSync('admin.html', html);
console.log('Done.');
