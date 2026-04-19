const fs = require('fs');

// ═════════════════════════════════════════════════════════════════════
// FIX home.html
// ═════════════════════════════════════════════════════════════════════
let home = fs.readFileSync('home.html', 'utf8');

// 1. Remove the Start & End Time grid block from booking modal
const startEndBlock = `                    <!-- Start & End Time Side by Side -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
                        <div>
                            <label
                                style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 7px;">Start
                                Time</label>
                            <select id="cbStartTime" required
                                style="display: block; width: 100%; padding: 11px 14px; border: 1.5px solid #d1fae5; border-radius: 10px; font-size: 14px; font-family: 'Inter', sans-serif; color: #111; background: #f0fdf4; box-sizing: border-box; outline: none; cursor: pointer;">
                                <option value="">-- Choose --</option>
                                <option value="6:00 AM">6:00 AM</option>
                                <option value="8:00 AM">8:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="2:00 PM">2:00 PM</option>
                                <option value="4:00 PM">4:00 PM</option>
                                <option value="6:00 PM">6:00 PM</option>
                                <option value="8:00 PM">8:00 PM</option>
                            </select>
                        </div>
                        <div>
                            <label
                                style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 7px;">End
                                Time</label>
                            <select id="cbEndTime" required
                                style="display: block; width: 100%; padding: 11px 14px; border: 1.5px solid #d1fae5; border-radius: 10px; font-size: 14px; font-family: 'Inter', sans-serif; color: #111; background: #f0fdf4; box-sizing: border-box; outline: none; cursor: pointer;">
                                <option value="">-- Choose --</option>
                                <option value="8:00 AM">8:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="2:00 PM">2:00 PM</option>
                                <option value="4:00 PM">4:00 PM</option>
                                <option value="6:00 PM">6:00 PM</option>
                                <option value="8:00 PM">8:00 PM</option>
                                <option value="10:00 PM">10:00 PM</option>
                            </select>
                        </div>
                    </div>`;

if (home.includes(startEndBlock)) {
    home = home.replace(startEndBlock, '');
    console.log('✅ Removed Start/End Time selects from booking modal');
} else {
    // Try a more flexible match by key elements
    home = home.replace(/\s*<!-- Start & End Time Side by Side -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\n\s*\n\s*<!-- Purpose -->/,
        '\n\n                    <!-- Purpose -->');
    console.log('⚠️ Used fallback removal for Start/End Time block');
}

// 2. Fix JS: remove dependency on cbStartTime/cbEndTime
home = home.replace(
    `const startTime = document.getElementById('cbStartTime').value;
                const endTime = document.getElementById('cbEndTime').value;`,
    `const startTime = ''; // Time selection removed - admin manages schedule
                const endTime = '';`
);

home = home.replace(
    `if (!startTime || !endTime) {`,
    `if (false) { // Time validation disabled (no time selects)`
);

// 3. Rename "Court Bookings" → "Court Reservation" in sidebar nav label
home = home.replace(
    '<span>Court Bookings</span>',
    '<span>Court Reservation</span>'
);

// 4. Rename in panel header
home = home.replace(
    '<h3 style="font-size: 16px; font-weight: 700; color: #064e3b;">🏀 Court Bookings</h3>',
    '<h3 style="font-size: 16px; font-weight: 700; color: #064e3b;">🏀 Court Reservation</h3>'
);

// 5. Rename "My Court Bookings" section heading
home = home.replace(
    '<h4 style="font-size: 15px; font-weight: 700; color: #064e3b; margin-bottom: 14px;">My Court\n                        Bookings</h4>',
    '<h4 style="font-size: 15px; font-weight: 700; color: #064e3b; margin-bottom: 14px;">My Court Reservations</h4>'
);

// 6. Change "Book Court" → "Court Reservation" in modal title
home = home.replace(
    '<h3 id="bookingDateTitle" style="font-size: 22px; font-weight: 800; color: white; margin: 0 0 4px;">Book\n                    Court</h3>',
    '<h3 id="bookingDateTitle" style="font-size: 22px; font-weight: 800; color: white; margin: 0 0 4px;">Court Reservation</h3>'
);

// 7. Change "Confirm Booking" button → "Confirm Reservation"
home = home.replace(
    '        Confirm Booking\n                    </button>',
    '        Confirm Reservation\n                    </button>'
);

// 8. Change "Purpose of Booking" label → "Purpose of Reservation"
home = home.replace('Purpose\n                            of Booking</label>', 'Purpose of Reservation</label>');

// 9. Change "No court bookings yet" placeholder text
home = home.replace("No court bookings yet.", "No court reservations yet.");

fs.writeFileSync('home.html', home);
console.log('✅ home.html updated');

// ═════════════════════════════════════════════════════════════════════
// FIX admin.html - remove Print button from concerns section
// ═════════════════════════════════════════════════════════════════════
let admin = fs.readFileSync('admin.html', 'utf8');

// Find and remove any print button in the concerns area
const printPatterns = [
    /\s*<button[^>]*onclick="window\.print\(\)"[^>]*>[\s\S]*?<\/button>/g,
    /\s*<button[^>]*onclick="[^"]*print[^"]*"[^>]*>[\s\S]*?<\/button>/g,
];

let printRemoved = false;
for (const pattern of printPatterns) {
    if (admin.match(pattern)) {
        admin = admin.replace(pattern, '');
        printRemoved = true;
        console.log('✅ Removed print button(s) from admin.html');
        break;
    }
}
if (!printRemoved) {
    // Search for print keyword near concern
    const lines = admin.split('\n');
    lines.forEach((l, i) => {
        if (l.toLowerCase().includes('print')) console.log(`Admin line ${i+1}: ${l.trim()}`);
    });
    console.log('⚠️ No print button found matching pattern - check above lines');
}

fs.writeFileSync('admin.html', admin);
console.log('✅ admin.html updated');
