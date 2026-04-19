const fs = require('fs');

let oldH = fs.readFileSync('old-dashboard.html', 'utf8');
let newH = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Recover panel-history
const phStart = oldH.indexOf('<!-- ── ACTIVITY LOG TAB ── -->');
const phEnd = oldH.indexOf('<!-- MODALS -->');
if (phStart > -1 && phEnd > -1) {
    const historyPanel = oldH.substring(phStart, phEnd);
    // Inject into newH right before MODALS
    const modIdx = newH.indexOf('<!-- MODALS -->');
    if (modIdx > -1) {
        newH = newH.substring(0, modIdx) + historyPanel + '\n            ' + newH.substring(modIdx);
    }
}

// 2. Swap Profile and Dark Mode Button
// The user wants Dark Mode icon on the left, Profile on the right
// Currently, in newH, we have:
// <div class="user-menu ... id="topProfileMenuBtn">
// ...
// </div>
// <div class="relative flex items-center justify-center"> <!-- This is the Desktop Bell --> ... </div>
// <button onclick="toggleDarkMode()" id="darkModeBtn" ...>🌙</button>

// Let's locate the entire `user-menu` (topProfileMenuBtn) wrapper and `darkModeBtn` wrapper
function extractBlock(html, markerStr, isButton=false) {
    const startObjId = html.indexOf(markerStr);
    if (startObjId === -1) return '';
    const start = html.lastIndexOf(isButton ? '<button' : '<div', startObjId);
    let endStr = isButton ? '</button>' : '</div>\n            </div>'; // approximate
    let end = html.indexOf(endStr, startObjId) + endStr.length;
    // For topProfileMenuBtn, it has a dropdown inside, so we need to be careful finding the end.
    if (markerStr === 'id="topProfileMenuBtn"') {
        end = html.indexOf('</div>\n                </div>\n            </div>', startObjId);
        if (end > -1) end += 47; // length of '</div>\n                </div>\n            </div>'
    }
    return html.substring(start, end);
}

// Actually, an easier way is just finding the exact blocks since I know their structures.
const umIdx = newH.indexOf('<div class="user-menu');
if (umIdx !== -1) {
    const umEnd = newH.indexOf('</span> Logout</button>\n                    </div>\n                </div>\n            </div>', umIdx) + 93;
    const userMenuBlock = newH.substring(umIdx, umEnd);
    
    const dmIdx = newH.indexOf('<button onclick="toggleDarkMode()" id="darkModeBtn"');
    if (dmIdx !== -1) {
        const dmEnd = newH.indexOf('</button>', dmIdx) + 9;
        const darkModeBlock = newH.substring(dmIdx, dmEnd);
        
        // Let's remove them from the header right div
        let hrStart = newH.indexOf('<div class="header-right');
        let hrEnd = newH.indexOf('</div>\n    </header>', hrStart);
        let headerRight = newH.substring(hrStart, hrEnd);
        
        // Remove old blocks
        headerRight = headerRight.replace(userMenuBlock, '');
        headerRight = headerRight.replace(darkModeBlock, '');
        // Note: There is also the bell button in between!
        // Right now the order is: User Menu -> Bell -> Dark Mode
        // We want: Dark Mode -> User Menu -> Bell ? Or Dark Mode -> Bell -> User Menu?
        // User said: "EXCHANGES THE NAME AND PROFILE TO THE DARK MODE ICON"
        // Let's put Dark Mode -> Bell -> User Menu
        
        // remove the Bell and we will rebuild the flex container
        const bellIdx = headerRight.indexOf('<!-- Desktop Bell -->');
        if (bellIdx !== -1) {
            const bellEnd = headerRight.indexOf('</div>\n            </div>', bellIdx);
            if (bellEnd !== -1) {
                 const bellBlock = headerRight.substring(bellIdx, bellEnd + 24);
                 headerRight = headerRight.replace(bellBlock, '');
                 
                 // reconstruct header right payload
                 // headerRight is now mostly empty (just the opening div)
                 // Wait, we need to strip whitespace
                 const hrRebuilt = '<div class="header-right flex items-center gap-3 hidden md:flex">\n            ' + 
                                   darkModeBlock + '\n            ' + 
                                   bellBlock + '\n            ' + 
                                   userMenuBlock + '\n        ';
                 
                 newH = newH.substring(0, hrStart) + hrRebuilt + newH.substring(hrEnd);
            }
        }
    }
}


fs.writeFileSync('user-dashboard.html', newH);
console.log('Restored My Activity panel and swapped top header icons.');
