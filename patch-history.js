const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Replace HTML
const htmlTarget = `<div class="flex justify-end mb-6">
                        <button onclick="loadHistoryView()" class="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition shadow-md border-none flex items-center gap-2">
                            🔄 Refresh Log
                        </button>
                    </div>
                    <div id="unifiedHistoryList" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                    </div>`;

const htmlReplacement = `<div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <select id="historyFilter" onchange="currentPageHistory = 1; renderHistory()" class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold shadow-sm w-full md:w-auto">
                            <option value="all">All Activities</option>
                            <option value="borrowing">Borrowings</option>
                            <option value="concern">Concerns</option>
                            <option value="court reservation">Court Reservations</option>
                        </select>
                        <button onclick="loadHistoryView()" class="px-5 py-2 w-full md:w-auto justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold cursor-pointer hover:from-emerald-600 hover:to-emerald-700 transition shadow-md border-none flex items-center gap-2">
                            🔄 Refresh Log
                        </button>
                    </div>
                    <div id="unifiedHistoryList" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        
                    </div>
                    <div class="flex justify-between items-center mt-auto border-t border-gray-200 dark:border-slate-700 pt-4">
                        <button onclick="prevPageHistory()" class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                        <span id="historyPaginationInfo" class="text-sm text-gray-500 dark:text-gray-400 font-medium">Page 1 of 1</span>
                        <button onclick="nextPageHistory()" class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                    </div>`;

const regexHtml = new RegExp(htmlTarget.replace(/\s+/g, '\\s*'), 'g');
html = html.replace(regexHtml, htmlReplacement);

// 2. Replace JS loadHistoryView block
const jsTargetRegex = /\/\/ 5\.5 MY HISTORY\s*\/\/ ==========================================\s*async function loadHistoryView\(\) \{/;

const jsInject = `// 5.5 MY HISTORY
        // ==========================================
        let allHistoryData = [];
        let currentPageHistory = 1;
        const HISTORY_PER_PAGE = 6;

        function renderHistory() {
            const container = document.getElementById('unifiedHistoryList');
            const filterEl = document.getElementById('historyFilter');
            const filterVal = filterEl ? filterEl.value.toLowerCase() : 'all';
            
            let filtered = allHistoryData;
            if (filterVal !== 'all') {
                filtered = allHistoryData.filter(a => a.type.toLowerCase() === filterVal);
            }

            const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_PER_PAGE));
            if (currentPageHistory > totalPages) currentPageHistory = totalPages;
            
            const startIdx = (currentPageHistory - 1) * HISTORY_PER_PAGE;
            const currentItems = filtered.slice(startIdx, startIdx + HISTORY_PER_PAGE);

            if (filtered.length === 0) { 
                container.innerHTML = '<p class="text-gray-500 italic text-[15px] font-bold mt-4 col-span-full text-center">No activity history found matching the filter.</p>'; 
            } else {
                container.innerHTML = currentItems.map(a => {
                    const displayStatus = a.status === 'completed' ? 'Completed'
                        : a.status === 'cancelled_by_admin' ? 'Cancelled by Admin'
                        : a.status === 'cancelled' ? 'Cancelled'
                        : a.status === 'approved' ? 'Approved'
                        : a.status === 'resolved' ? 'Resolved'
                        : a.status === 'rejected' ? 'Rejected'
                        : a.status || 'Pending';
                    const statusColor = (a.status === 'approved' || a.status === 'resolved' || a.status === 'completed')
                        ? 'text-green-600 bg-green-50'
                        : (a.status === 'rejected' || a.status === 'cancelled' || a.status === 'cancelled_by_admin')
                        ? 'text-red-600 bg-red-50'
                        : 'text-orange-600 bg-orange-50';
                    return \`
<div class="group relative flex items-start gap-4 p-5 rounded-2xl border hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800/70 border-gray-100 dark:border-slate-700 overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-700 ease-in-out pointer-events-none"></div>
    <div class="\${a.colorClass} w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border shadow-sm shrink-0 transition-transform group-hover:scale-110">
        \${a.icon}
    </div>
    <div class="flex-1 w-full flex flex-col justify-center">
        <div class="flex justify-between items-start gap-3 w-full">
            <h4 class="font-extrabold text-gray-900 dark:text-white text-[15px] leading-snug">\${a.title}</h4>
            <span class="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50 backdrop-blur-md \${statusColor} shrink-0">\${displayStatus}</span>
        </div>
        <div class="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400 font-semibold w-full">
            <span class="bg-gray-100 dark:bg-slate-700/80 px-2.5 py-1 rounded-md text-[11px] shadow-sm flex items-center gap-1">
                📌 \${a.type}
            </span>
            <span class="flex items-center gap-1.5">
                <i class="bi bi-clock"></i>
                \${isNaN(a.date.getTime())?'Unknown Date':a.date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})+' at '+a.date.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </span>
        </div>
    </div>
</div>\`;
                }).join('');
            }

            const info = document.getElementById('historyPaginationInfo');
            if(info) info.textContent = \`Page \${currentPageHistory} of \${totalPages}\`;
            
            const prevBtn = document.querySelector('button[onclick="prevPageHistory()"]');
            const nextBtn = document.querySelector('button[onclick="nextPageHistory()"]');
            if(prevBtn) prevBtn.disabled = currentPageHistory === 1;
            if(nextBtn) nextBtn.disabled = currentPageHistory === totalPages;
        }

        function prevPageHistory() {
            if(currentPageHistory > 1) { currentPageHistory--; renderHistory(); }
        }
        function nextPageHistory() {
            const filterEl = document.getElementById('historyFilter');
            const filterVal = filterEl ? filterEl.value.toLowerCase() : 'all';
            const filtered = filterVal === 'all' ? allHistoryData : allHistoryData.filter(a => a.type.toLowerCase() === filterVal);
            const totalPages = Math.ceil(filtered.length / HISTORY_PER_PAGE);
            if(currentPageHistory < totalPages) { currentPageHistory++; renderHistory(); }
        }

        async function loadHistoryView() {`;

html = html.replace(jsTargetRegex, jsInject);

// 3. Replace the sorting and mapping block inside loadHistoryView
const sortMapRegex = /all\.sort\(\(a,b\) => b\.date - a\.date\);[\s\S]*?\}\)\.join\(''\);/m;

html = html.replace(sortMapRegex, `all.sort((a,b) => b.date - a.date);
                allHistoryData = all;
                currentPageHistory = 1;
                renderHistory();`);

fs.writeFileSync('user-dashboard.html', html);
console.log('Successfully patched user-dashboard.html!');
