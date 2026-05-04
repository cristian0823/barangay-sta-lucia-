const fs = require('fs');
const file = 'user-portal/user-dashboard.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace renderEquipmentGrid
const renderGridStart = content.indexOf('function renderEquipmentGrid(list) {');
const renderGridEnd = content.indexOf('async function loadEquipmentView() {');
if (renderGridStart !== -1 && renderGridEnd !== -1) {
    const newRenderGrid = `function renderEquipmentGrid(list) {
            const grid = document.getElementById('equipmentGrid');
            if (!list || list.length === 0) { grid.innerHTML = '<p class="text-gray-500 italic col-span-2">No equipment found.</p>'; return; }
            grid.innerHTML = list.map(item => {
                // Sanity check
                item.available = Math.min(item.available || 0, item.quantity || 1);
                const pct = Math.min(100, Math.round((item.available / item.quantity) * 100));
                let color = 'bg-emerald-500', statusColor = 'text-emerald-600', statusBg = 'bg-emerald-50', statusIcon = '✓';
                if (pct < 50) { color = 'bg-amber-500'; statusColor = 'text-amber-600'; statusBg = 'bg-amber-50'; statusIcon = '⚠'; }
                if (pct < 25) { color = 'bg-red-500'; statusColor = 'text-red-600'; statusBg = 'bg-red-50'; statusIcon = '✕'; }
                const ok = item.available > 0;
                let actionBtn = '';
                if (item.isLocked) {
                    actionBtn = '<button disabled class="w-full py-3 bg-gray-200 text-gray-500 text-sm font-bold rounded-xl shadow-inner cursor-not-allowed flex justify-center items-center gap-2"><i class="bi bi-lock-fill"></i> System Locked</button>';
                } else if (ok) {
                    actionBtn = '<button onclick="openBorrowModalWithEquip(' + item.id + ')" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition transform hover:-translate-y-1 shadow-md cursor-pointer border-none flex justify-center items-center gap-2"><i class="bi bi-pencil-square"></i> Request to Borrow</button>';
                } else {
                    actionBtn = '<div class="w-full py-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 text-center flex justify-center items-center gap-2"><i class="bi bi-exclamation-circle-fill"></i> Out of stock</div>';
                }

                const pendingBadge = (item.pending && item.pending > 0)
                    ? '<div class="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></span><span class="text-xs font-semibold text-amber-700">⏳ ' + item.pending + ' unit' + (item.pending > 1 ? 's' : '') + ' pending</span></div>'
                    : '';

                const imageName = item.name ? item.name.toLowerCase().replace(/\\s+/g, '-') + '.jpg' : 'BARANGAY LOGO.jpg';

                return \`<div class="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                    <!-- Image Header -->
                    <div class="relative h-48 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden shrink-0">
                        <img src="\${imageName}" alt="\${item.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='../BARANGAY LOGO.jpg'; this.onerror=null;">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div class="absolute top-3 right-3">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md \${ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}">\${statusIcon} \${item.available} Available</span>
                        </div>
                        \${item.isLocked ? '<div class="absolute top-3 left-3 bg-gray-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-md flex items-center gap-1"><i class="bi bi-lock-fill"></i> Locked</div>' : ''}
                        <div class="absolute bottom-3 left-4 right-4">
                            <h4 class="font-extrabold text-xl text-white leading-tight drop-shadow-md">\${item.name}</h4>
                            <p class="text-xs text-gray-200 font-medium drop-shadow-md">\${item.category || 'General Equipment'}</p>
                        </div>
                    </div>
                    
                    <!-- Details Section -->
                    <div class="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Availability</span>
                                <span class="text-xs font-bold \${statusColor}">\${pct}%</span>
                            </div>
                            <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-2">
                                <div class="\${color} h-full rounded-full transition-all duration-500" style="width: \${pct}%"></div>
                            </div>
                            \${pendingBadge}
                        </div>
                        
                        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            \${actionBtn}
                        </div>
                    </div>
                </div>\`;
            }).join('');
        }

        `;
    content = content.substring(0, renderGridStart) + newRenderGrid + content.substring(renderGridEnd);
}

// 2. Replace borrowModal header logic
const modalStart = content.indexOf('<div class="p-6 border-b border-gray-100 bg-emerald-50/50">');
const modalEnd = content.indexOf('<!-- Left Column: Calendar -->');
if (modalStart !== -1 && modalEnd !== -1) {
    const newModalHeader = `<!-- Premium Image Header -->
            <div class="relative h-40 w-full bg-gray-200 overflow-hidden shrink-0">
                <img id="borrowModalImage" src="../BARANGAY LOGO.jpg" alt="Equipment" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div class="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                        <h3 class="text-3xl font-extrabold text-white drop-shadow-lg" id="borrowModalTitle">Borrow Item</h3>
                        <p class="text-sm text-emerald-100 mt-1 drop-shadow-md font-medium">Select your dates and provide details below.</p>
                    </div>
                    <div class="hidden sm:block">
                        <span id="borrowModalStockBadge" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-emerald-500/90 text-white backdrop-blur-md">0 Available</span>
                    </div>
                </div>
            </div>
            <div class="flex flex-col lg:flex-row flex-1 overflow-y-auto">
                `;
    content = content.substring(0, modalStart) + newModalHeader + content.substring(modalEnd);
}

// 3. Update openBorrowModalWithEquip
const openBorrowRegex = /async function openBorrowModalWithEquip\(equipId\)\s*\{[\s\S]*?document\.getElementById\('borrowModal'\)\.classList\.remove\('hidden'\);\s*\}/g;

const newOpenBorrow = `async function openBorrowModalWithEquip(equipId) {
            const list = await getEquipment();
            const item = list.find(e => e.id === equipId);
            if (!item) return;
            
            document.getElementById('borrowModalTitle').innerHTML = item.name;
            
            const imageName = item.name ? item.name.toLowerCase().replace(/\\s+/g, '-') + '.jpg' : 'BARANGAY LOGO.jpg';
            document.getElementById('borrowModalImage').src = imageName;
            
            const badge = document.getElementById('borrowModalStockBadge');
            if (badge) {
                badge.innerHTML = \`\${item.available} Available\`;
                badge.className = item.available > 0 ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-emerald-500/90 text-white backdrop-blur-md' : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md bg-red-500/90 text-white backdrop-blur-md';
            }

            document.getElementById('borrowEquipmentId').value = equipId;
            document.getElementById('borrowEquipmentName').value = item.name;
            document.getElementById('borrowQty').max = item.available;
            document.getElementById('borrowQty').value = 1;
            
            const helpEl = document.getElementById('borrowMaxHelp');
            if(helpEl) helpEl.innerHTML = '📦 Max: ' + item.available + ' units available';
            
            // Show pending notice if applicable
            if (item.pending && item.pending > 0 && helpEl) {
                helpEl.innerHTML += ' <br><span style="color:#b45309;font-size:11px;font-weight:600;">⚠️ ' + item.pending + ' unit(s) pending from other users</span>';
            }

            document.getElementById('borrowPurpose').value = '';
            document.getElementById('borrowerFullName').value = user.name || '';
            document.getElementById('borrowerContact').value = '';
            document.getElementById('borrowerAddress').value = user.address || '';
            document.getElementById('borrowTime').value = '';
            document.getElementById('returnTime').value = '';
            
            initBorrowCalendar();
            document.getElementById('borrowModal').classList.remove('hidden');
        }`;

content = content.replace(openBorrowRegex, newOpenBorrow);

// Remove the second duplicate openBorrowModalWithEquip
const openBorrowRegex2 = /async function openBorrowModalWithEquip\(equipId\)\s*\{[\s\S]*?document\.getElementById\('borrowModal'\)\.classList\.remove\('hidden'\);\s*\}/g;
let matches = content.match(openBorrowRegex2);
if (matches && matches.length > 1) {
    // Keep only the first one
    content = content.replace(matches[1], '/* Duplicate openBorrowModalWithEquip removed */');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched user-dashboard.html');
