const fs = require('fs');

try {
    let h = fs.readFileSync('user-dashboard.html', 'utf8');

    // --- 1. Swap Header UI & Add Dropdown Layout ---
    let hrStart = h.indexOf('<div class="header-right');
    let hrEnd = h.indexOf('</div>\n    </header>', hrStart);
    if (hrEnd === -1) hrEnd = h.indexOf('</header>', hrStart);

    if (hrStart > -1 && hrEnd > -1) {
        let headerRight = h.substring(hrStart, hrEnd);
        
        const userMenuMatch = headerRight.match(/<div class="user-menu[\s\S]*?<\/span>\s*<\/div>\s*<\/div>/);
        const bellMatch = headerRight.match(/<!-- Desktop Bell -->[\s\S]*?<\/div>\s*<\/div>/);
        const darkMatch = headerRight.match(/<button onclick="toggleDarkMode\(\)" id="darkModeBtn"[^>]*>🌙<\/button>/);

        if (userMenuMatch && bellMatch && darkMatch) {
            let userMenuStr = userMenuMatch[0];
            
            if(!userMenuStr.includes('id="topProfileMenuBtn"')) {
                userMenuStr = userMenuStr.replace('class="user-menu flex items-center gap-3 pr-3 border-r border-gray-200"', 'class="user-menu flex items-center gap-3 pr-3 border-r border-gray-200 cursor-pointer relative" onclick="toggleProfileDropdown(event)" id="topProfileMenuBtn"');
                
                const dropdownHtml = `
                            <!-- Profile Dropdown -->
                            <div id="profileDropdownContainer" class="hidden absolute top-[52px] right-0 w-[200px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700 mt-2">
                                <div class="px-4 py-3 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-700">
                                    <p class="text-xs text-gray-500 font-semibold mb-0">Account Menu</p>
                                </div>
                                <div class="py-1 bg-white dark:bg-slate-800">
                                    <button onclick="showPanel('profile'); event.stopPropagation(); document.getElementById('profileDropdownContainer').classList.add('hidden')" class="w-full text-left font-bold text-gray-800 text-[14px] hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-100 dark:hover:bg-slate-700 flex items-center py-3 px-4 transition-colors">My Profile</button>
                                </div>
                                <div class="py-1 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                                    <button onclick="logoutUser()" class="w-full text-left font-bold text-red-600 text-[14px] hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center py-3 px-4 transition-colors">Logout</button>
                                </div>
                            </div>
                        </div>`;
                        
                userMenuStr = userMenuStr.substring(0, userMenuStr.lastIndexOf('</div>')) + dropdownHtml;

                const rebuiltHeader = `<div class="header-right flex items-center gap-3 hidden md:flex">\n            ` +
                                      darkMatch[0] + `\n            ` +
                                      bellMatch[0] + `\n            ` +
                                      userMenuStr + `\n        `;
                                      
                h = h.substring(0, hrStart) + rebuiltHeader + h.substring(hrEnd);
                console.log("Header UI Swapped successfully.");
            }
        }
    }

    // --- 2. Mobile Dark Mode Logic ---
    let mrStart = h.indexOf('<div class="mobile-header-controls">');
    let mrEnd = h.indexOf('</div>\n        </div>\n        <div class="header-right');
    if (mrStart > -1 && mrEnd > -1) {
        let mobileControls = h.substring(mrStart, mrEnd);
        const mDarkMatch = mobileControls.match(/<button class="mobile-header-btn dark-mode-toggle"[^>]*>🌙<\/button>/);
        const mAvatarMatch = mobileControls.match(/<div class="mobile-header-avatar"[^>]*>U<\/div>/);
        if (mDarkMatch && mAvatarMatch && !mobileControls.includes(mDarkMatch[0] + '\n                ' + mAvatarMatch[0])) {
            mobileControls = mobileControls.replace(mDarkMatch[0], '');
            mobileControls = mobileControls.replace(mAvatarMatch[0], '');
            mobileControls = mobileControls.replace('<div class="mobile-header-controls">', '<div class="mobile-header-controls">\n                ' + mDarkMatch[0] + '\n                ' + mAvatarMatch[0]);
            h = h.substring(0, mrStart) + mobileControls + h.substring(mrEnd);
            console.log("Mobile Controls swapped.");
        }
    }

    // --- 3. Clean Duplicate Logouts & Settings ---
    h = h.replace(/<button class="mobile-header-btn"[^>]*title="Settings">⚙️<\/button>/g, '');
    h = h.replace(/<button id="mobileHeaderLogoutBtn"[^>]*>Logout<\/button>/g, '');

    // --- 4. JS Fixes & Modifications ---
    const jsFixes = `
                function toggleProfileDropdown(e) {
                    e.stopPropagation();
                    const dropdown = document.getElementById('profileDropdownContainer');
                    if (dropdown) dropdown.classList.toggle('hidden');
                    const bell = document.getElementById('bellDropdownContainer');
                    if (bell && !bell.classList.contains('hidden')) bell.classList.add('hidden');
                }
                document.addEventListener('click', () => {
                    const pd = document.getElementById('profileDropdownContainer');
                    if (pd) pd.classList.add('hidden');
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
        console.log("Injected profile JS hooks.");
    }

    h = h.replace(/showPanel\('settings'\)/g, "showPanel('profile')");

    // Null checks for listeners without destroying file integrity
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
    if (!h.includes("document.getElementById('p-fullName')")) {
        h = h.replace("document.getElementById('s-fullName').value = user.fullName || user.full_name || '';", populateJS);
    }

    fs.writeFileSync('user-dashboard.html', h);
    console.log('Complete dashboard reconstruction finished applying user requirements safely!');

} catch (e) {
    console.error("Error patching file: ", e.message);
}
