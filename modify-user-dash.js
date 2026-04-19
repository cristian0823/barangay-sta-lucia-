const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Add Dropdown to Top Profile
const profileHtml = `<div class="user-menu flex items-center gap-3 pr-3 border-r border-gray-200 cursor-pointer relative" onclick="toggleProfileDropdown(event)" id="topProfileMenuBtn">
                <div class="user-info text-right">
                    <div class="user-name text-[14px] font-bold text-gray-800" id="sidebarUserName">User</div>
                    <div class="user-role text-[11px] text-emerald-500 font-semibold uppercase">Resident</div>
                </div>
                <div class="user-avatar w-[40px] h-[40px] rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-extrabold text-[15px] border-[3px] border-emerald-200">
                    <span id="userInitial">U</span>
                </div>
                <!-- Profile Dropdown -->
                <div id="profileDropdownContainer" class="hidden absolute top-[52px] right-0 w-[200px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700 mt-2">
                    <div class="px-4 py-3 border-b flex justify-between items-center bg-gray-50 dark:bg-slate-900 border-gray-100 dark:border-slate-700">
                        <p class="text-xs text-gray-500 font-semibold mb-0">Account Menu</p>
                    </div>
                    <div class="py-1 bg-white dark:bg-slate-800">
                        <button onclick="showPanel('profile'); event.stopPropagation(); document.getElementById('profileDropdownContainer').classList.add('hidden')" class="w-full text-left font-bold text-gray-800 text-[14px] hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-100 dark:hover:bg-slate-700 flex items-center gap-2 py-3 px-4 transition-colors"><span class="text-lg">👤</span> My Profile</button>
                    </div>
                </div>
            </div>`;

// Replace the existing user-menu block
h = h.replace(
    /<div class=\"user-menu flex items-center gap-3 pr-3 border-r border-gray-200\">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    profileHtml
);

// Add JS for toggleProfileDropdown and making sure both profile and form logic work
const jsToggle = `
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

            // Replicated submit handler for the standalone profile panel
            document.addEventListener('DOMContentLoaded', () => {
                const spForm = document.getElementById('standaloneProfileForm');
                if (spForm) {
                    spForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const btn = e.target.querySelector('button[type="submit"]');
                        const origBtn = btn.innerHTML;
                        btn.innerHTML = 'Saving...'; btn.disabled = true;
                        
                        // Fake a successful save since real saves seem to be handled outside or identically
                        // We will actually just trigger the same logic if necessary, or simply show alert
                        try {
                            const { data, error } = await _supabase.from('profiles').update({
                                full_name: document.getElementById('p-fullName').value,
                                contact_number: document.getElementById('p-phone').value,
                                address: document.getElementById('p-address').value
                            }).eq('id', getCurrentUser().id);

                            if (error) throw error;
                            
                            // sync to local
                            const user = getCurrentUser();
                            user.fullName = document.getElementById('p-fullName').value;
                            user.contactNumber = document.getElementById('p-phone').value;
                            user.address = document.getElementById('p-address').value;
                            localStorage.setItem('barangay_user', JSON.stringify(user));
                            
                            showAlert('Profile updated successfully!', 'success');
                            
                            // Update UI
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
    h = h.replace('function toggleBellDropdown', jsToggle + '\n            function toggleBellDropdown');
}


// 2. Hide Profile and Security Tabs in Settings
h = h.replace(
    /<button id=\"stab-profile\"[^>]*>[\s\S]*?👤 Profile.*?<\/button>/,
    '<button id="stab-profile" onclick="showSettingsTab(\'profile\')" class="settings-tab-pill active" style="display:none;">👤 Profile</button>'
);
h = h.replace(
    /<button id=\"stab-security\"[^>]*>[\s\S]*?🔐 Security.*?<\/button>/,
    '<button id="stab-security" onclick="showSettingsTab(\'security\')" class="settings-tab-pill" style="display:none;">🔐 Security</button>'
);

// We should also "click" the password tab automatically so Settings doesn't open to a hidden Profile tab
h = h.replace(
    /onclick=\"showPanel\('settings'\)\"/g,
    'onclick="showPanel(\'settings\'); setTimeout(()=>showSettingsTab(\'password\'), 50);"'
);

// Wait, the mobile settings button is also there
h = h.replace(/onclick=\"showSettings\(\)\"/g, 'onclick="showPanel(\'settings\'); setTimeout(()=>showSettingsTab(\'password\'), 50);"');

// 3. Extract the Profile form content and wrap it in panel-profile
const stabProfileStart = h.indexOf('<!-- ── PROFILE TAB ── -->');
let stabProfileEnd = h.indexOf('<!-- ── PASSWORD TAB ── -->');
if (stabProfileEnd === -1) stabProfileEnd = h.indexOf('<!-- ── SECURITY TAB ── -->'); // fallback

if (stabProfileStart > -1 && stabProfileEnd > -1) {
    let profileContent = h.substring(stabProfileStart, stabProfileEnd);
    
    // Hide the original one in settings just in case logic touches it
    h = h.replace('id="stab-content-profile"', 'id="stab-content-profile" style="display:none;"');
    
    // Modify IDs so they don't clash
    profileContent = profileContent.replace(/id="s-/g, 'id="p-');
    profileContent = profileContent.replace('id="settingsProfileForm"', 'id="standaloneProfileForm"');

    const profilePanelStr = `
            <!-- PANEL: PROFILE -->
            <div id="panel-profile" class="content-panel container mt-6 max-w-5xl mx-auto px-4 lg:px-8">
                <!-- Hero Banner -->
                <div class="settings-hero" style="position:relative; background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#065f46 100%); border-radius:20px; padding:24px 28px; margin-bottom:20px; overflow:hidden;">
                    <div style="position:relative;z-index:1;display:flex;align-items:center;gap:16px;">
                        <div style="width:52px;height:52px;border-radius:14px;background:rgba(16,185,129,0.2);border:1px solid rgba(16,185,129,0.35);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;">👤</div>
                        <div>
                            <div class="settings-hero-title" style="font-size:20px;font-weight:800;color:#fff;margin-bottom:3px;">My Profile</div>
                            <div style="font-size:13px;color:#94a3b8;">Manage your personal information</div>
                        </div>
                    </div>
                </div>
                
                ` + profileContent + `
            </div>
`;

    if (!h.includes('id="panel-profile"')) {
        h = h.replace('<!-- PANEL 6: SETTINGS -->', profilePanelStr + '\n            <!-- PANEL 6: SETTINGS -->');
    }
}

// Ensure the profile loading populates the new fields
const populateJS = `
                    // Profile panel fields
                    const pfName = document.getElementById('p-fullName');
                    if(pfName) pfName.value = user.fullName || user.full_name || '';
                    const peMail = document.getElementById('p-email');
                    if(peMail) { peMail.value = user.email || ''; peMail.disabled = true; peMail.style.cursor='not-allowed'; peMail.style.background='var(--bg-color)'; }
                    const pPhone = document.getElementById('p-phone');
                    if(pPhone) pPhone.value = user.contactNumber || user.contact_number || user.phone || '';
                    const pAddress = document.getElementById('p-address');
                    if(pAddress) pAddress.value = user.address || '';
                    const pUsername = document.getElementById('p-username');
                    if(pUsername) pUsername.value = user.barangay_id || user.username || '';
`;
h = h.replace('document.getElementById(\'s-fullName\').value = ', populateJS + '\n                    document.getElementById(\'s-fullName\').value = ');


fs.writeFileSync('user-dashboard.html', h);
console.log('DOM modifications applied successfully.');
