const fs = require('fs');
let a = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// Find and remove the entire deliveryDetail variable (shows "Delivery Address" in modal)
const START_MARKER = 'const deliveryDetail = isDelivery';
const END_MARKER = ": '';\n\n";

const startIdx = a.indexOf(START_MARKER);
if (startIdx === -1) { console.log('MISS: deliveryDetail block'); process.exit(1); }

// Back up to include the leading whitespace
const lineStart = a.lastIndexOf('\n', startIdx) + 1;
const endIdx = a.indexOf(END_MARKER, startIdx) + END_MARKER.length;

console.log('Removing block:');
console.log(JSON.stringify(a.substring(lineStart, endIdx)));

// Also find where deliveryDetail is used in the template and remove it
const USE_MARKER = '${deliveryDetail}';
const useIdx = a.indexOf(USE_MARKER);
if (useIdx === -1) { console.log('MISS: deliveryDetail usage'); }

// Remove declaration block
a = a.substring(0, lineStart) + a.substring(endIdx);

// Remove usage in template (find it again after splice)
const useIdx2 = a.indexOf('${deliveryDetail}');
if (useIdx2 !== -1) {
    // Remove the whole line containing it
    const useLineStart = a.lastIndexOf('\n', useIdx2) + 1;
    const useLineEnd = a.indexOf('\n', useIdx2) + 1;
    a = a.substring(0, useLineStart) + a.substring(useLineEnd);
    console.log('Removed ${deliveryDetail} usage');
}

fs.writeFileSync('admin-portal/admin.html', a);
console.log('Done.');
