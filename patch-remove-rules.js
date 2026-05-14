const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// Remove the Borrowing Rules HTML panel from equipment section
const panelStart = c.indexOf('\n                    <!-- ── BORROWING RULES MANAGEMENT ── -->');
const panelEnd = c.indexOf('\n                    <!-- USERS SECTION -->');
if (panelStart !== -1 && panelEnd !== -1) {
    c = c.substring(0, panelStart) + c.substring(panelEnd);
    console.log('Removed borrowing rules HTML panel');
} else {
    console.log('MISS: panel bounds', panelStart, panelEnd);
}

// Remove adminLoadBorrowingRules() from switchSection
c = c.replace(
    `if (section === 'equipment') { loadEquipment(); adminLoadBorrowingRules(); }`,
    `if (section === 'equipment') loadEquipment();`
);

// Remove borrowing rules JS functions block
const jsStart = c.indexOf('\n        // ── EQUIPMENT: BORROWING RULES MANAGEMENT ────────────────────');
const jsEnd = c.indexOf('\n        // ──────────────────────────────────────────────────────────────\n');
if (jsStart !== -1 && jsEnd !== -1) {
    const lineEnd = jsEnd + '\n        // ──────────────────────────────────────────────────────────────\n'.length;
    c = c.substring(0, jsStart) + c.substring(lineEnd);
    console.log('Removed borrowing rules JS functions');
} else {
    console.log('MISS: JS block', jsStart, jsEnd);
}

fs.writeFileSync('admin-portal/admin.html', c);
console.log('Done.');
