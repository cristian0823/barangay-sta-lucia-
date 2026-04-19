const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Remove Top Bar Settings and Logout Buttons

// Desktop Settings Gear
h = h.replace(/<button onclick="showPanel\('settings'\)[^>]*id="desktopSettingsBtn"[^>]*>⚙️<\/button>/g, '');
// Desktop Logout Button
h = h.replace(/<button id="logoutBtn" class="[^"]*">Logout<\/button>/g, '');

// Mobile Settings Gear
// The mobile settings has title="Settings"
h = h.replace(/<button class="mobile-header-btn"[^>]*onclick="showPanel\('settings'\)[^>]*title="Settings">⚙️<\/button>/g, '');
// Mobile Logout
h = h.replace(/<button id="mobileHeaderLogoutBtn"[^>]*>Logout<\/button>/g, '');


// 2. Add Logout to the Profile Dropdown Container
const logoutDropdownHTML = `
                    <div class="py-1 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                        <button onclick="logoutUser()" class="w-full text-left font-bold text-red-600 text-[14px] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 py-3 px-4 transition-colors"><span class="text-lg">🚪</span> Logout</button>
                    </div>
                </div>
            </div>`;
// the end of profileDropdownContainer currently is:
// <span class="text-lg">👤</span> My Profile</button>
//                     </div>
//                 </div>
//             </div>
h = h.replace(/<span class="text-lg">👤<\/span> My Profile<\/button>\s*<\/div>\s*<\/div>\s*<\/div>/, '<span class="text-lg">👤</span> My Profile</button>\n                    </div>' + logoutDropdownHTML);


// 3. Extract Password and Account forms from panel-settings and merge into panel-profile
const startHtml = h;

const pwdStr = '<!-- ── PASSWORD TAB ── -->';
const accStr = '<!-- ── ACCOUNT TAB ── -->';
const endSettingsStr = '<!-- ── ACTIVITY LOG TAB ── -->';

if (h.includes(pwdStr) && h.includes(accStr)) {
    const pwdStartIdx = h.indexOf(pwdStr);
    const accStartIdx = h.indexOf(accStr);
    
    // Find where panel-settings ends. We'll just look for the end of panel-settings which is before <!-- MODALS -->
    const endIdx = h.indexOf('<!-- MODALS -->');
    
    // Extract the raw forms
    let passwordContent = h.substring(pwdStartIdx, accStartIdx);
    // strip the display:none from password content wrapper
    passwordContent = passwordContent.replace('id="stab-content-password" style="display:none;"', 'id="stab-content-password" style="margin-top:24px;"');
    passwordContent = passwordContent.replace('id="stab-content-password"', 'id="stab-content-password" style="margin-top:24px;"'); // fallback if no style

    let accountContent = h.substring(accStartIdx, h.indexOf('</div>\n            </div>', accStartIdx)); // just roughly
    // strip display:none
    accountContent = accountContent.replace('id="stab-content-account" style="display:none;"', 'id="stab-content-account" style="margin-top:24px;"');
    accountContent = accountContent.replace('id="stab-content-account"', 'id="stab-content-account" style="margin-top:24px;"');

    // To cleanly get account content:
    let accContentEnd = h.indexOf('<!-- ── ACTIVITY LOG TAB ── -->');
    if (accContentEnd > -1) {
        accountContent = h.substring(accStartIdx, accContentEnd);
        accountContent = accountContent.replace('id="stab-content-account" style="display:none;"', 'id="stab-content-account" style="margin-top:24px;"');
        accountContent = accountContent.replace('id="stab-content-account"', 'id="stab-content-account" style="margin-top:24px;"');
    }

    // Now inject these two blocks at the bottom of panel-profile
    const endOfProfilePanel = h.indexOf('</div>\n\n            <!-- PANEL 6: SETTINGS -->');
    if (endOfProfilePanel > -1) {
        h = h.substring(0, endOfProfilePanel) + '\n\n' + passwordContent + '\n\n' + accountContent + '\n' + h.substring(endOfProfilePanel);
    } else {
        // another attempt to find the end of panel profile
        const ppMatch = h.indexOf('id="panel-profile"');
        const nextPanel = h.indexOf('<!-- PANEL 6: SETTINGS -->', ppMatch);
        h = h.substring(0, nextPanel - 18) + '\n' + passwordContent + '\n' + accountContent + '\n' + h.substring(nextPanel - 18);
    }
}

// 4. DESTROY Settings Panel from DOM completely
const setStart = h.indexOf('<!-- PANEL 6: SETTINGS -->');
const setEnd = h.indexOf('<!-- ── ACTIVITY LOG TAB ── -->'); // this actually marks the end of settings panel if it existed, or wait, it marks the start of the next section?
// Let's check where the settings panel safely ends.
// In user-dashboard.html, panel 6 is settings. Is there a panel 7? No it's modals.
const modalsStart = h.indexOf('<!-- MODALS -->');
if (setStart > -1 && modalsStart > -1) {
    h = h.substring(0, setStart) + h.substring(modalsStart);
}

// 5. Cleanup references
h = h.replace(/showPanel\('settings'\)/g, "showPanel('profile')");


fs.writeFileSync('user-dashboard.html', h);
console.log('Profile settings merged and top bar cleaned up successfully!');
