const fs = require('fs');

function patchFile(filePath, biCssLink) {
    let c = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    let changes = 0;

    function rep(old, neu, label) {
        const idx = c.indexOf(old);
        if (idx === -1) { console.log('[' + filePath + '] MISS:', label || old.substring(0, 60)); return; }
        c = c.substring(0, idx) + neu + c.substring(idx + old.length);
        changes++;
        console.log('[' + filePath + '] OK:', label);
    }

    // Add Bootstrap Icons CSS if not present
    if (!c.includes('bootstrap-icons')) {
        rep(
            '<link rel="stylesheet" href="css/styles.css">',
            '<link rel="stylesheet" href="css/styles.css">\n    <link rel="stylesheet" href="' + biCssLink + '">',
            'Add Bootstrap Icons link'
        );
    } else {
        console.log('[' + filePath + '] BI already present');
    }

    // Replace hero cards
    rep(
        '<div class="hero-cards">\n                <div class="hero-card">\n                    <span class="hero-card-icon">🪑</span>\n                    <p>Borrow Equipment</p>\n                </div>\n                <div class="hero-card">\n                    <span class="hero-card-icon">📋</span>\n                    <p>Submit Concerns</p>\n                </div>\n                <div class="hero-card">\n                    <span class="hero-card-icon">🏀</span>\n                    <p>Book the Court</p>\n                </div>\n                <div class="hero-card">\n                    <span class="hero-card-icon">📅</span>\n                    <p>View Events</p>\n                </div>\n            </div>',
        '<div class="hero-cards">\n                <div class="hero-card">\n                    <span class="hero-card-icon"><i class="bi bi-box-seam"></i></span>\n                    <p>Borrow Equipment</p>\n                </div>\n                <div class="hero-card">\n                    <span class="hero-card-icon"><i class="bi bi-chat-left-text"></i></span>\n                    <p>Submit Concerns</p>\n                </div>\n                <div class="hero-card">\n                    <span class="hero-card-icon"><i class="bi bi-building"></i></span>\n                    <p>Facility Reservation</p>\n                </div>\n                <div class="hero-card">\n                    <span class="hero-card-icon"><i class="bi bi-calendar-event"></i></span>\n                    <p>View Events</p>\n                </div>\n            </div>',
        'Replace hero card emojis + rename Facility'
    );

    // Make hero-card-icon color white for BI icons
    if (c.includes('.hero-card-icon {') && !c.includes('.hero-card-icon i {')) {
        rep(
            '.hero-card-icon { font-size: 36px; margin-bottom: 10px; display: block; text-align: center; width: 100%; }',
            '.hero-card-icon { font-size: 36px; margin-bottom: 10px; display: block; text-align: center; width: 100%; color: #fff; }\n        .hero-card-icon i { font-size: 36px; color: #fff; }',
            'Fix icon color'
        );
    }

    fs.writeFileSync(filePath, c);
    console.log('[' + filePath + '] Done.', changes, 'changes');
}

// user-portal/index.html — local BI CSS
patchFile('user-portal/index.html', 'css/bootstrap-icons/bootstrap-icons.min.css');

// root index.html — use CDN since it's at root level
patchFile('index.html', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css');
