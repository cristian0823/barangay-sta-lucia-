const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Remove Emojis from Dropdown
h = h.replace(/<span class="text-lg">👤<\/span> /g, '');
h = h.replace(/<span class="text-lg">🚪<\/span> /g, '');

// 2. Remove isolated Gear / Settings Buttons that were left over
// Based on grep, we found occurrences like: 
// <button onclick="showPanel('profile'); setTimeout(()=>showSettingsTab('password'), 50);" id="desktopSettingsBtn" title="Settings" class="w-[38px] h-[38px] flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-lg">⚙️</button>
// And mobile:
// <button class="mobile-header-btn" onclick="showPanel('profile'); setTimeout(()=>showSettingsTab('password'), 50);" title="Settings">⚙️</button>

h = h.replace(/<button[^>]*id="desktopSettingsBtn"[^>]*>⚙️<\/button>/g, '');
h = h.replace(/<button class="mobile-header-btn"[^>]*title="Settings">⚙️<\/button>/g, '');


// 3. Remove the Username Input block from the Profile Form
// The block is:
// <div style="margin-bottom:20px;">
//     <label style="display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--text-muted);margin-bottom:7px;">Username</label>
//     <input type="text" id="p-username"...>
// </div>

const startText = '<div style="margin-bottom:20px;">';
const labelText = '>Username</label>';
const pIdText = 'id="p-username"';
const sIdText = 'id="s-username"';

function removeBlock(htmlContent, idText) {
    let result = htmlContent;
    let idx = result.indexOf(idText);
    while (idx !== -1) {
        // Find the start of the div backward
        let startDiv = result.lastIndexOf(startText, idx);
        if (startDiv !== -1) {
            // Find the end </div> forward
            let endDiv = result.indexOf('</div>', idx);
            if (endDiv !== -1) {
                // Ensure the label in it is Username
                let block = result.substring(startDiv, endDiv + 6);
                if (block.includes(labelText)) {
                    result = result.substring(0, startDiv) + result.substring(endDiv + 6);
                    idx = result.indexOf(idText, startDiv); // check for next
                    continue;
                }
            }
        }
        idx = result.indexOf(idText, idx + idText.length);
    }
    return result;
}

h = removeBlock(h, pIdText);
h = removeBlock(h, sIdText); // In case s-username is still present somewhere

// Write updated HTML
fs.writeFileSync('user-dashboard.html', h);
console.log('Profile UI refined successfully.');
