const fs = require('fs');

let doc = fs.readFileSync('user-dashboard.html', 'utf8');

const sIdx = doc.indexOf('<div class="header-right');
if (sIdx === -1) {
    console.log('Could not find header-right start!');
    process.exit(1);
}
const eIdx = doc.indexOf('</header>', sIdx);
if (eIdx === -1) {
    console.log('Could not find header-right end!');
    process.exit(1);
}

// We will replace exactly from sIdx to eIdx
const replacement = `<div class="header-right flex items-center gap-4 hidden md:flex">
            <!-- Desktop Bell -->
            <div class="relative flex items-center justify-center">
                <button onclick="toggleBellDropdown(event)" id="desktopBellBtn" title="Notifications" class="w-[38px] h-[38px] flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-lg relative">
                    🔔
                    <span id="bellBadgeDesktop" class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden" style="line-height:1;">0</span>
                </button>
                <!-- Dropdown UI -->
                <div id="bellDropdownContainer" class="hidden absolute top-[52px] right-[-100px] md:right-0 w-[350px] max-w-[95vw] bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700 mt-2">
                    <div class="absolute -top-2 right-[120px] md:right-[15px] w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 dark:bg-slate-800 dark:border-slate-700 hidden md:block"></div>
                    <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700 relative z-10 w-full" onclick="event.stopPropagation()">
                        <h3 class="font-bold text-gray-800 text-[15px] dark:text-gray-100">Notifications</h3>
                        <button onclick="markAllBellNotificationsRead(); event.stopPropagation();" class="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1"><span class="text-sm">✔</span> Mark all read</button>
                    </div>
                    <div id="bellDropdownList" class="max-h-[380px] overflow-y-auto flex flex-col relative z-10 w-full" onclick="event.stopPropagation()">
                        <p id="bellEmptyState" class="text-center text-sm text-gray-500 py-6 hidden dark:text-gray-400">No new notifications.</p>
                    </div>
                    <div class="px-4 py-2 bg-gray-50 text-center border-t border-gray-100 text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 dark:bg-slate-900/50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-gray-400 transition relative z-10 w-full" onclick="showPanel('history'); document.getElementById('bellDropdownContainer').classList.add('hidden');">See all activity in history</div>
                </div>
            </div>

            <button onclick="toggleDarkMode()" id="darkModeBtn" title="Toggle Dark Mode" class="dark-mode-toggle w-[38px] h-[38px] flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-lg">🌙</button>

            <div class="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
            
            <div class="user-menu flex items-center cursor-pointer relative" onclick="toggleProfileDropdown(event)" id="topProfileMenuBtn">
                <div class="user-avatar w-[40px] h-[40px] rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-extrabold text-[15px] border-[3px] border-emerald-200 mr-3">
                    <span id="userInitial">U</span>
                </div>
                <div class="user-info text-left">
                    <div class="user-name text-[14px] font-bold text-gray-800" id="sidebarUserName">User</div>
                    <div class="user-role text-[11px] text-emerald-500 font-semibold uppercase">Resident</div>
                </div>

                <!-- Profile Dropdown -->
                <div id="profileDropdownContainer" class="hidden absolute top-[52px] right-0 w-[180px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] flex-col overflow-hidden dark:bg-slate-800 dark:border-slate-700 mt-2">
                    <div class="py-1 bg-white dark:bg-slate-800">
                        <button onclick="showPanel('profile'); event.stopPropagation(); document.getElementById('profileDropdownContainer').classList.add('hidden')" class="w-full text-left font-semibold text-gray-800 text-[14px] hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-100 dark:hover:bg-slate-700 py-3 px-4 transition-colors">My Profile</button>
                    </div>
                    <div class="py-1 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                        <button onclick="showPanel('profile'); setTimeout(() => document.getElementById('stab-content-password') && document.getElementById('stab-content-password').scrollIntoView({behavior:'smooth'}), 100); event.stopPropagation(); document.getElementById('profileDropdownContainer').classList.add('hidden')" class="w-full text-left font-semibold text-gray-800 text-[14px] hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-100 dark:hover:bg-slate-700 py-3 px-4 transition-colors">Settings</button>
                    </div>
                    <div class="py-1 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700">
                        <button onclick="logoutUser()" class="w-full text-left font-semibold text-gray-800 text-[14px] hover:bg-red-50 hover:text-red-600 dark:text-gray-100 py-3 px-4 transition-colors">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    `;

doc = doc.substring(0, sIdx) + replacement + doc.substring(eIdx);

fs.writeFileSync('user-dashboard.html', doc);
console.log('ABSOLUTE MATCH RECONSTRUCTION SUCCESSFUL.');
