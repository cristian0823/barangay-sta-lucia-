const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// The issue was that the reconstructed Profile Panel inherited multiple extra </div>s
// from the trailing end of the old Settings panel, which prematurely closed the Main section,
// throwing History out of the dashboard layout tree entirely.

// Find exactly the end of the Profile Panel
const start = h.indexOf('id="panel-profile"');
const end = h.indexOf('<!-- PANEL 7: HISTORY -->');

if (start > -1 && end > -1) {
    let profileBlock = h.substring(start, end);
    
    // We will just strip trailing `</div>` sequences up until the comment <!-- SECURITY (2FA) TAB -->
    // Actually, looking at the layout, we should ensure the number of opening <divs> equals closing divs exactly up to this segment.
    
    const opens = (profileBlock.match(/<div/gi) || []).length;
    const closes = (profileBlock.match(/<\/div>/gi) || []).length;
    
    console.log('Original Profile Opens:', opens, 'Closes:', closes);
    
    // It's much easier to just physically strip the trailing excess.
    // The previous form injection added TWO extra closes because we sliced the end of the file.
    // Let's strip the last few </div>s right before <!-- PANEL 7: HISTORY --> until opens == closes.
    
    let excess = closes - opens;
    if (excess > 0) {
        let trimmed = profileBlock;
        while (excess > 0) {
            let lastDivIdx = trimmed.lastIndexOf('</div>');
            if (lastDivIdx > -1) {
                // remove it
                trimmed = trimmed.substring(0, lastDivIdx) + trimmed.substring(lastDivIdx + 6);
                excess--;
            } else {
                break;
            }
        }
        h = h.substring(0, start) + trimmed + h.substring(end);
        console.log('Stripped ' + (closes - opens) + ' extra divs from profile panel!');
    }
}

// And finally, just double verify the gear icon actually got deleted.
h = h.replace(/<button [^>]*id="desktopSettingsBtn"[^>]*>⚙️<\/button>/g, '');
h = h.replace(/<button class="mobile-header-btn"[^>]*title="Settings">⚙️<\/button>/g, '');
// And logout Btn is fully deleted. 

fs.writeFileSync('user-dashboard.html', h);
