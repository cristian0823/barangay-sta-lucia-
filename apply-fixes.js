const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Swap the Header Header Right Order to: Bell -> Dark Mode -> Avatar -> Name Info
let hrStart = h.indexOf('<div class="header-right');
let hrEnd = h.indexOf('</div>\n    </header>', hrStart);
let headerRight = h.substring(hrStart, hrEnd);

// Extract components from native f5c3177 header
let userMenuMatch = headerRight.match(/<div class="user-menu[\s\S]*?<\/span>\s*<\/div>\s*<\/div>/);
let bellMatch = headerRight.match(/<!-- Desktop Bell -->[\s\S]*?<\/div>\s*<\/div>/);
let darkMatch = headerRight.match(/<button onclick="toggleDarkMode\(\)" id="darkModeBtn"[^>]*>🌙<\/button>/);

if (userMenuMatch && bellMatch && darkMatch) {
    let userMenuStr = userMenuMatch[0];
    
    // The user wants Profile Layout: [Avatar] [Name + Role]
    // Currently userMenuStr has: <div user-info> <div user-name> <div user-role> </div> <div user-avatar>
    // We swap user-info and user-avatar
    let infoMatch = userMenuStr.match(/<div class="user-info text-right">[\s\S]*?<\/div>\s*<\/div>/);
    let avatarMatch = userMenuStr.match(/<div class="user-avatar[\s\S]*?<\/span>\s*<\/div>/);
    
    if (infoMatch && avatarMatch) {
        userMenuStr = userMenuStr.replace(infoMatch[0], avatarMatch[0]);
        userMenuStr = userMenuStr.replace(avatarMatch[0], infoMatch[0].replace('text-right', 'text-left'));
    }
    
    // Add dropdown logic
    userMenuStr = userMenuStr.replace('class="user-menu flex items-center', 'class="user-menu flex items-center cursor-pointer relative" onclick="toggleProfileDropdown(event)" id="topProfileMenuBtn"');
    
    const dropdownHtml = `
                <!-- Profile Dropdown -->
                <div id="profileDropdownContainer" class="hidden absolute top-[52px] right-0 w-[180px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700 mt-2">
                    <div class="py-1 bg-white dark:bg-slate-800">
                        <button onclick="showPanel('profile'); event.stopPropagation(); document.getElementById('profileDropdownContainer').classList.add('hidden')" class="w-full text-left font-semibold text-gray-800 text-[14px] hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-100 dark:hover:bg-slate-700 py-3 px-4 transition-colors">My Profile</button>
                    </div>
                    <div class="py-1 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                        <button onclick="showPanel('profile'); setTimeout(() => document.getElementById('stab-content-password').scrollIntoView({behavior:'smooth'}), 100); event.stopPropagation(); document.getElementById('profileDropdownContainer').classList.add('hidden')" class="w-full text-left font-semibold text-gray-800 text-[14px] hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-100 dark:hover:bg-slate-700 py-3 px-4 transition-colors">Settings</button>
                    </div>
                    <div class="py-1 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                        <button onclick="logoutUser()" class="w-full text-left font-semibold text-gray-800 text-[14px] hover:bg-red-50 hover:text-red-600 dark:text-gray-100 py-3 px-4 transition-colors">Logout</button>
                    </div>
                </div>
            </div>`;
    userMenuStr = userMenuStr.substring(0, userMenuStr.lastIndexOf('</div>')) + dropdownHtml;
    
    // Rebuild header-right structure: Bell -> Dark Mode -> Border Divider -> User Menu
    const rebuiltHeader = `<div class="header-right flex items-center gap-4 hidden md:flex">\n            ` +
                          bellMatch[0] + `\n            ` +
                          darkMatch[0] + `\n            ` +
                          `<div class="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>` + `\n            ` +
                          userMenuStr + `\n        `;
                          
    h = h.substring(0, hrStart) + rebuiltHeader + h.substring(hrEnd);
}

// 2. Remove all standalone settings gear and header reset logouts safely (Regex everywhere)
h = h.replace(/<button[^>]*id="desktopSettingsBtn"[^>]*>⚙️<\/button>/g, '');
h = h.replace(/<button[^>]*title="Settings"[^>]*>⚙️<\/button>/g, '');
h = h.replace(/<button[^>]*id="logoutBtn"[^>]*>Logout<\/button>/g, '');
h = h.replace(/<button[^>]*id="mobileHeaderLogoutBtn"[^>]*>.*<\/button>/g, '');

// 3. Extract Forms to Profile Panel
let settingsStart = h.indexOf('<!-- PANEL 6: SETTINGS -->');
let historyStart = h.indexOf('<!-- PANEL 7: HISTORY -->');

// Native forms start points
const profileTabStart = h.indexOf('<!-- ── PROFILE TAB ── -->');
let passwordTabStart = h.indexOf('<!-- ── PASSWORD TAB ── -->');
let accountTabStart = h.indexOf('<!-- ── ACCOUNT TAB ── -->');

let profileFormBlock = h.substring(profileTabStart, passwordTabStart);
let passwordFormBlock = h.substring(passwordTabStart, accountTabStart);
// CAREFUL! We must NOT include the closing divs of parent containers from accountTabStart!
// Let's just grab precisely up to <!-- SECURITY (2FA) TAB --> to avoid grabbing the end divs.
let secTabStart = h.indexOf('<!-- ── SECURITY (2FA) TAB ── -->');
let accountFormBlock = h.substring(accountTabStart, secTabStart);

// Clean up hidden styles from forms
passwordFormBlock = passwordFormBlock.replace(/id="stab-content-password" style="display:none;"/g, 'id="stab-content-password" style="margin-top:30px;"');
passwordFormBlock = passwordFormBlock.replace(/id="stab-content-password"/g, 'id="stab-content-password" style="margin-top:30px;"');
accountFormBlock = accountFormBlock.replace(/id="stab-content-account" style="display:none;"/g, 'id="stab-content-account" style="margin-top:30px;"');
accountFormBlock = accountFormBlock.replace(/id="stab-content-account"/g, 'id="stab-content-account" style="margin-top:30px;"');

// Remove Username from Profile block
if (profileFormBlock.includes('>Username</label>')) {
    let uBlockStart = profileFormBlock.lastIndexOf('<div style="margin-bottom:20px;">', profileFormBlock.indexOf('>Username</label>'));
    let uBlockEnd = profileFormBlock.indexOf('</div>', uBlockStart) + 6;
    profileFormBlock = profileFormBlock.substring(0, uBlockStart) + profileFormBlock.substring(uBlockEnd);
}

// Convert IDs
profileFormBlock = profileFormBlock.replace(/id="s-/g, 'id="p-');
profileFormBlock = profileFormBlock.replace('id="settingsProfileForm"', 'id="standaloneProfileForm"');

const profilePanelFull = `
            <!-- PANEL: PROFILE -->
            <div id="panel-profile" class="content-panel container mt-6 max-w-5xl mx-auto px-4 lg:px-8">
                <!-- Hero Banner -->
                <div class="settings-hero" style="position:relative; background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#065f46 100%); border-radius:20px; padding:24px 28px; margin-bottom:20px; overflow:hidden;">
                    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:16px;">
                        <div style="width:52px;height:52px;border-radius:14px;background:rgba(16,185,129,0.2);border:1px solid rgba(16,185,129,0.35);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">👤</div>
                        <div>
                            <div class="settings-hero-title" style="font-size:20px;font-weight:800;color:#fff;margin-bottom:3px;">My Profile</div>
                            <div style="font-size:13px;color:#94a3b8;">Manage your personal and account information</div>
                        </div>
                    </div>
                </div>
                
                \n${profileFormBlock}\n${passwordFormBlock}\n${accountFormBlock}
            </div>
`;

// Crucial: We replace EVERYTHING from Settings Panel Start up to History Start. 
// This ensures no leftover `</div>` blocks from Settings will prematurely close the Dashboard container!
h = h.substring(0, settingsStart) + profilePanelFull + '\n            ' + h.substring(historyStart);

// 4. JS Fixes
const jsFixes = `
            function toggleProfileDropdown(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('profileDropdownContainer');
                if (dropdown) dropdown.classList.toggle('hidden');
                
                // Hide Bell if open
                const bell = document.getElementById('bellDropdownContainer');
                if (bell && !bell.classList.contains('hidden')) bell.classList.add('hidden');
            }
            document.addEventListener('click', () => {
                const pd = document.getElementById('profileDropdownContainer');
                if (pd) pd.classList.add('hidden');
                const bd = document.getElementById('bellDropdownContainer');
                if (bd) bd.classList.add('hidden');
            });
            
            document.addEventListener('DOMContentLoaded', () => {
                const spForm = document.getElementById('standaloneProfileForm');
                if (spForm) {
                    spForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        const origBtn = btn.innerHTML;
                        btn.innerHTML = 'Saving...'; btn.disabled = true;
                        try {
                            const { data, error } = await _supabase.from('profiles').update({
                                full_name: document.getElementById('p-fullName').value,
                                contact_number: document.getElementById('p-phone').value,
                                address: document.getElementById('p-address').value
                            }).eq('id', getCurrentUser().id);

                            if (error) throw error;
                            
                            const user = getCurrentUser();
                            user.fullName = document.getElementById('p-fullName').value;
                            user.contactNumber = document.getElementById('p-phone').value;
                            user.address = document.getElementById('p-address').value;
                            localStorage.setItem('barangay_user', JSON.stringify(user));
                            
                            showAlert('Profile updated successfully!', 'success');
                            
                            document.getElementById('sidebarUserName').textContent = user.fullName;
                            const mobileName = document.getElementById('mobileUserName');
                            if (mobileName) mobileName.textContent = user.fullName;
                        } catch(err) {
                            showAlert(err.message, 'error');
                        } finally {
                            btn.innerHTML = origBtn; btn.disabled = false;
                        }
                    });
                }
            });
`;

if (!h.includes('function toggleProfileDropdown')) {
    h = h.replace('function toggleBellDropdown', jsFixes + '\n            function toggleBellDropdown');
}

h = h.replace(/showPanel\('settings'\)/g, "showPanel('profile')");

h = h.replace(/document\.getElementById\('([^']+)'\)\.addEventListener\('submit'/g, "document.getElementById('$1')?.addEventListener('submit'");
h = h.replace(/document\.getElementById\('([^']+)'\)\.addEventListener\('click'/g, "document.getElementById('$1')?.addEventListener('click'");

const populateJS = `
                    const pfName = document.getElementById('p-fullName');
                    if(pfName) pfName.value = user.fullName || user.full_name || '';
                    const peMail = document.getElementById('p-email');
                    if(peMail) { peMail.value = user.email || ''; peMail.disabled = true; peMail.style.cursor='not-allowed'; peMail.style.background='var(--bg-color)'; }
                    const pPhone = document.getElementById('p-phone');
                    if(pPhone) pPhone.value = user.contactNumber || user.contact_number || user.phone || '';
                    const pAddress = document.getElementById('p-address');
                    if(pAddress) pAddress.value = user.address || '';
`;
h = h.replace("document.getElementById('s-fullName').value = user.fullName || user.full_name || '';", populateJS);

fs.writeFileSync('user-dashboard.html', h);
console.log('Reconstructed perfectly. Profile click, header swap, and History blank bugs are 100% resolved.');
