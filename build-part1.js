// Part 1: HTML head, header, sidebar, dashboard panel, equipment panel, concerns panel
const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resident Dashboard - Barangay Sta. Lucia</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <style>
        :root {
            --bg-color: #f0fdf4; --sidebar-bg: #ffffff; --text-main: #1f2937;
            --text-muted: #6b7280; --panel-bg: #ffffff; --border-color: #e5e7eb;
            --primary: #10b981; --primary-hover: #059669; --nav-hover-bg: #ecfdf5;
            --nav-active-bg: linear-gradient(135deg, #10b981, #059669); --nav-active-text: #ffffff;
        }
        [data-theme="dark"] {
            --bg-color: #022c22; --sidebar-bg: #064e3b; --text-main: #f1f5f9;
            --text-muted: #9ca3af; --panel-bg: #064e3b; --border-color: #14532d;
            --primary: #10b981; --nav-hover-bg: #14532d;
            --nav-active-bg: linear-gradient(135deg, #059669, #047857); --nav-active-text: #ffffff;
        }
        body { font-family: 'Inter', sans-serif; background-color: var(--bg-color); color: var(--text-main); margin: 0; overflow: hidden; }
        [data-theme="dark"] .dashboard-header { background-color: #064e3b; border-color: #14532d; box-shadow: none; }
        [data-theme="dark"] .sidebar { background-color: #064e3b; border-color: #14532d; }
        [data-theme="dark"] .nav-item { color: #a7f3d0; }
        [data-theme="dark"] .nav-item:hover { background-color: #14532d; color: #6ee7b7; }
        [data-theme="dark"] .nav-item .nav-icon { background-color: #0d2818; color: #10b981; }
        [data-theme="dark"] .nav-item:hover .nav-icon { background-color: #065f46; }
        .nav-item.active { background: var(--nav-active-bg) !important; color: var(--nav-active-text) !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .nav-item.active .nav-icon { background: rgba(255,255,255,0.2) !important; color: white !important; }
        .content-panel { display: none; animation: fadeIn 0.3s ease; }
        .content-panel.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .glass-card { background-color: var(--panel-bg); border: 1px solid var(--border-color); border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        [data-theme="dark"] input, [data-theme="dark"] select, [data-theme="dark"] textarea { background-color: #0d2818; color: #f1f5f9; border-color: #14532d; }
        [data-theme="dark"] .bg-white { background-color: #064e3b !important; }
        [data-theme="dark"] .text-gray-800 { color: #f1f5f9 !important; }
        [data-theme="dark"] .text-gray-600 { color: #cbd5e1 !important; }
        [data-theme="dark"] .bg-gray-50 { background-color: #022c22 !important; }
    </style>
</head>
<body class="flex flex-col h-screen w-full">

    <!-- HEADER -->
    <header class="dashboard-header bg-white border-b border-emerald-200 px-6 flex justify-between items-center h-[70px] sticky top-0 z-[100] shadow-sm">
        <div class="header-left flex items-center gap-4">
            <img src="BARANGAY%20SUN%20LOGO.jpg" alt="Logo" class="w-[46px] h-[46px] rounded-xl border-2 border-emerald-200 object-cover">
            <div class="header-brand flex flex-col">
                <span class="brand text-[18px] font-extrabold text-emerald-800">Barangay Sta. Lucia</span>
                <span class="subtitle text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Resident Portal</span>
            </div>
            <button onclick="document.querySelector('.sidebar').classList.toggle('hidden')" class="md:hidden ml-auto p-2 border rounded-lg hover:bg-gray-50">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>
        <div class="header-right flex items-center gap-3 hidden md:flex">
            <div class="user-menu flex items-center gap-3 pr-3 border-r border-gray-200">
                <div class="user-info text-right">
                    <div class="user-name text-[14px] font-bold text-gray-800" id="sidebarUserName">User</div>
                    <div class="user-role text-[11px] text-emerald-500 font-semibold uppercase">Resident</div>
                </div>
                <div class="user-avatar w-[40px] h-[40px] rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-extrabold text-[15px] border-[3px] border-emerald-200">
                    <span id="userInitial">U</span>
                </div>
            </div>
            <button onclick="toggleDarkMode()" id="darkModeBtn" title="Toggle Dark Mode" class="dark-mode-toggle w-[38px] h-[38px] flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-lg">🌙</button>
            <a href="user-settings.html" title="Settings" class="w-[38px] h-[38px] flex items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-all duration-200 text-lg">⚙️</a>
            <button id="logoutBtn" class="px-4 py-2 rounded-xl text-[13px] font-semibold border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors duration-200">Logout</button>
        </div>
    </header>

    <!-- DASHBOARD CONTAINER -->
    <div class="dashboard-container flex flex-1 overflow-hidden">
        <!-- SIDEBAR -->
        <aside class="sidebar w-[280px] bg-white border-r border-gray-200 p-6 flex flex-col gap-2 overflow-y-auto hidden md:flex" style="height: calc(100vh - 70px);">
            <div class="sidebar-title text-[12px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2">Navigation</div>
            <button onclick="showPanel('dashboard')" id="nav-dashboard" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left active">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-emerald-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-emerald-200">🏠</div> Dashboard
            </button>
            <button onclick="showPanel('equipment')" id="nav-equipment" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left hover:bg-emerald-50 hover:text-emerald-800">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-emerald-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-emerald-200">📦</div> Equipment
            </button>
            <button onclick="showPanel('concerns')" id="nav-concerns" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left hover:bg-emerald-50 hover:text-emerald-800">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-emerald-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-emerald-200">💬</div> Concerns
            </button>
            <button onclick="showPanel('booking')" id="nav-booking" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left hover:bg-emerald-50 hover:text-emerald-800">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-emerald-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-emerald-200">📅</div> Court Booking
            </button>
            <button onclick="showPanel('events')" id="nav-events" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left hover:bg-emerald-50 hover:text-emerald-800">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-emerald-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-emerald-200">🎉</div> Events
            </button>
            <div class="sidebar-title text-[12px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-2 mt-6">Settings</div>
            <a href="user-settings.html" style="text-decoration:none;" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left hover:bg-gray-100">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-gray-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-gray-200 text-black">⚙️</div> Profile Settings
            </a>
            <button onclick="toggleDarkMode()" class="nav-item group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 text-[15px] font-semibold text-gray-600 w-full text-left hover:bg-gray-100 mt-2">
                <div class="nav-icon w-[42px] h-[42px] rounded-xl bg-gray-100 flex items-center justify-center text-[20px] transition-colors group-hover:bg-gray-200 text-black"><span class="dark-mode-toggle flex items-center justify-center w-[24px]">🌙</span></div> Dark Mode
            </button>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="main-content flex-1 p-8 overflow-y-auto bg-green-50/30" style="background-color: var(--bg-color);">

            <!-- PANEL 1: DASHBOARD -->
            <div id="panel-dashboard" class="content-panel active">
                <div class="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
                    <div class="relative z-10">
                        <h2 class="text-3xl font-extrabold mb-2">Welcome back, <span id="welcomeName">Resident</span>! 👋</h2>
                        <p class="text-emerald-100 max-w-lg text-lg">Your central hub for barangay services.</p>
                    </div>
                    <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500 opacity-20 blur-3xl"></div>
                    <div class="absolute bottom-0 right-40 w-60 h-60 rounded-full bg-teal-400 opacity-20 blur-2xl"></div>
                </div>
                <h3 class="text-xl font-bold mb-4" style="color: var(--text-main);">At a Glance</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="glass-card p-6 flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl shadow-sm">📦</div><div><p class="text-3xl font-black text-gray-800" id="stat-equipment">0</p><p class="text-sm font-semibold text-gray-500">Active Borrowings</p></div></div>
                    <div class="glass-card p-6 flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-sm">💬</div><div><p class="text-3xl font-black text-gray-800" id="stat-concerns">0</p><p class="text-sm font-semibold text-gray-500">Pending Concerns</p></div></div>
                    <div class="glass-card p-6 flex items-center gap-4"><div class="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl shadow-sm">📅</div><div><p class="text-3xl font-black text-gray-800" id="stat-bookings">0</p><p class="text-sm font-semibold text-gray-500">Upcoming Bookings</p></div></div>
                </div>
            </div>

            <!-- PANEL 2: EQUIPMENT -->
            <div id="panel-equipment" class="content-panel">
                <div class="mb-8 border-b pb-6 flex justify-between items-end flex-wrap gap-4" style="border-color: var(--border-color);">
                    <div>
                        <h2 class="text-3xl font-extrabold text-emerald-600 mb-2">📦 Equipment Borrowing</h2>
                        <p style="color: var(--text-muted);">Request to borrow barangay equipment for your activities.</p>
                    </div>
                </div>
                <div class="mb-8"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="equipmentGrid"></div></div>
                <div class="glass-card p-6">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xl">📋</div>
                            <div><h3 class="text-xl font-bold text-gray-800 dark:text-white">My Borrowing History</h3><p class="text-xs text-gray-500">Track all your equipment requests</p></div>
                        </div>
                    </div>
                    <div id="myBorrowingsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><p class="text-gray-500 italic col-span-full">No borrowing history yet.</p></div>
                </div>
            </div>
`;
fs.writeFileSync('user-dashboard-new.html', html, 'utf8');
console.log('Part 1 written');
