const fs = require('fs');

// Fix remaining emojis in admin-settings and home.html
{
    let s = fs.readFileSync('admin-portal/admin-settings.html', 'utf8').replace(/\r\n/g, '\n');
    // Fix toast fallback emoji
    s = s.replace(
        "toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;",
        'toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;'
    );
    fs.writeFileSync('admin-portal/admin-settings.html', s);
    console.log('[settings] Fixed toast fallback emoji');
}

{
    let h = fs.readFileSync('user-portal/home.html', 'utf8').replace(/\r\n/g, '\n');
    let changes = 0;
    function rep(old, neu) {
        const idx = h.indexOf(old);
        if (idx === -1) { console.log('[home2] MISS:', JSON.stringify(old.substring(0, 70))); return; }
        h = h.substring(0, idx) + neu + h.substring(idx + old.length);
        changes++;
    }

    // Fix h5 "Selected Borrowing Period" emoji
    rep(
        '">📅</span> Selected Borrowing Period',
        '"><i class="bi bi-calendar-range" style="font-size:16px;"></i></span> Selected Borrowing Period'
    );

    // Fix empty state divs
    rep(
        '<div class="empty-state"><span>📋</span><p>No concerns submitted yet.</p></div>',
        '<div class="empty-state"><span><i class="bi bi-clipboard2-x" style="font-size:24px;"></i></span><p>No concerns submitted yet.</p></div>'
    );

    // Fix JS template literal for borrowing period date display (text only)
    h = h.replace(/📅 ' \+ fullMonths/g, "' + fullMonths");

    // Fix JS template literal for venue name (li-title)
    h = h.replace(/<div class=\\"li-title\\">🏀 \$\{venueName\}<\/div>/g,
        '<div class=\\"li-title\\"><i class=\\"bi bi-dribbble\\" style=\\"margin-right:4px;\\"></i>${venueName}</div>');

    // Fix calendar event badge (in JS) - use Buffer to avoid string escaping issues
    h = h.replace(/🎉 Event<\/div>/g, 'Event</div>');

    // Fix equipment empty state
    rep(
        '<div class="empty-state"><span>📦</span><p>No equipment available.</p></div>',
        '<div class="empty-state"><span><i class="bi bi-box-seam" style="font-size:24px;"></i></span><p>No equipment available.</p></div>'
    );
    rep(
        '<div class="empty-state"><span>📦</span><p>No borrowings yet. Request some equipm',
        '<div class="empty-state"><span><i class="bi bi-bag-x" style="font-size:24px;"></i></span><p>No borrowings yet. Request some equipm'
    );

    // Fix max units JS string
    h = h.replace(/maxHelp\.innerHTML = '📦 Max: '/g, "maxHelp.innerHTML = '<i class=\"bi bi-boxes\" style=\"margin-right:3px;\"></i>Max: '");

    fs.writeFileSync('user-portal/home.html', h);
    console.log('[home2] Done.', changes, 'changes');
}
