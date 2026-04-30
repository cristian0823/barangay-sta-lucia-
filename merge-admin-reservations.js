const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    // 1. Mobile Sidebar
    html = html.replace(
        '<button onclick="mobileSwitchSection(\'multipurpose-bookings\')"> Multi-Purpose Hall</button>\n',
        ''
    );

    // 2. Desktop Sidebar
    html = html.replace(
        '                    <button class="sidebar-btn" onclick="switchSection(\'multipurpose-bookings\', this)">\n                        <span class="nav-icon-box"><i class="bi bi-building-fill"></i></span> Multi-Purpose Hall\n                    </button>\n',
        ''
    );

    // 3. allSections array
    html = html.replace(
        'const allSections = [\'overview\', \'court-bookings\', \'multipurpose-bookings\', \'requests\', \'concerns\', \'events\', \'equipment\', \'users\', \'audit-log\', \'security-log\', \'profile\', \'system\'];',
        'const allSections = [\'overview\', \'court-bookings\', \'requests\', \'concerns\', \'events\', \'equipment\', \'users\', \'audit-log\', \'security-log\', \'profile\', \'system\'];'
    );

    // 4. Polling logic
    html = html.replace(
        'if (document.getElementById(\'multipurpose-bookings-section\')?.style.display !== \'none\' && typeof loadMultipurposeBookings === \'function\') loadMultipurposeBookings();\n',
        ''
    );

    // 5. Filter bar in Facility Reservations
    const filterBarOld = `                                <div style="position:relative; max-width:250px; width:100%;">
                                    <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--muted);"></span>
                                    <input type="text" id="courtBookingSearch" placeholder="Search resident..." oninput="loadAdminBookings()" style="width:100%; padding:8px 12px 8px 36px; border-radius:8px; border:1px solid var(--border); outline:none; background:var(--bg); color:var(--text);">
                                </div>`;
    const filterBarNew = `                                <div style="display:flex; gap:12px; align-items:center; max-width:450px; width:100%;">
                                    <select id="courtBookingVenueFilter" onchange="loadAdminBookings()" style="padding:8px 12px; border-radius:8px; border:1px solid var(--border); outline:none; background:var(--bg); color:var(--text-main); font-weight:600;">
                                        <option value="all">All Venues</option>
                                        <option value="basketball">Basketball Court</option>
                                        <option value="multipurpose">Multi-Purpose Hall</option>
                                    </select>
                                    <div style="position:relative; flex:1;">
                                        <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--muted);"></span>
                                        <input type="text" id="courtBookingSearch" placeholder="Search resident..." oninput="loadAdminBookings()" style="width:100%; padding:8px 12px 8px 36px; border-radius:8px; border:1px solid var(--border); outline:none; background:var(--bg); color:var(--text);">
                                    </div>
                                </div>`;
    html = html.replace(filterBarOld, filterBarNew);

    // 6. Delete multipurpose section HTML
    const multiStart = '                    <!-- ===== Facility Reservations SECTION ===== -->';
    const multiEnd = '                    <div id="rejectReasonModal"';
    const idxStart = html.indexOf(multiStart);
    const idxEnd = html.indexOf(multiEnd);
    if(idxStart > -1 && idxEnd > -1) {
        html = html.substring(0, idxStart) + html.substring(idxEnd);
    } else {
        console.log("Could not find section boundary for multipurpose HTML");
    }

    // 7. Replace logic in loadAdminBookings
    const logicOld1 = `                // Filter to COURT / BASKETBALL only
                allBookings = allBookings.filter(b =>
                    b.venue === 'basketball' ||
                    b.venue === 'court' ||
                    (b.venueName && (
                        b.venueName.toLowerCase().includes('basketball') ||
                        b.venueName.toLowerCase().includes('court')
                    )) ||
                    // Include entries where venue is not explicitly multipurpose
                    (!b.venue && !b.venueName) ||
                    (b.venue && !b.venue.toLowerCase().includes('multi') && !b.venue.toLowerCase().includes('multipurpose') && b.venue !== 'hall')
                ).filter(b => !(
                    (b.venue && (b.venue.toLowerCase().includes('multi') || b.venue === 'hall')) ||
                    (b.venueName && b.venueName.toLowerCase().includes('multi'))
                ));`;

    const logicNew1 = `                // Apply Venue Filter
                const venueFilter = document.getElementById('courtBookingVenueFilter')?.value || 'all';
                allBookings = allBookings.filter(b => {
                    const isMp = (b.venue && (b.venue.toLowerCase().includes('multi') || b.venue === 'hall')) || 
                                 (b.venueName && b.venueName.toLowerCase().includes('multi'));
                    if (venueFilter === 'basketball') return !isMp;
                    if (venueFilter === 'multipurpose') return isMp;
                    return true;
                });`;
    html = html.replace(logicOld1, logicNew1);

    const logicOld2 = "                    const venue = b.venueName || '';";
    const logicNew2 = "                    const isMp = (b.venue && (b.venue.toLowerCase().includes('multi') || b.venue === 'hall')) || (b.venueName && b.venueName.toLowerCase().includes('multi'));\n                    const venue = isMp ? '<i class=\"bi bi-building mr-1\"></i> Multi-Purpose Hall' : '<i class=\"bi bi-dribbble mr-1\"></i> Basketball Court';";
    html = html.replace(logicOld2, logicNew2);

    fs.writeFileSync('admin.html', html);
    console.log('Script ran successfully!');
} catch (e) {
    console.error(e);
}
