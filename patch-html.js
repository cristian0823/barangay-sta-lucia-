const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

const targetHtml = `<div class="flex justify-end mb-6">
                        <button onclick="loadHistoryView()"`;
const newHtml = `<div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <select id="historyFilter" onchange="currentPageHistory = 1; renderHistory()" class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-semibold shadow-sm w-full md:w-auto">
                            <option value="all">All Activities</option>
                            <option value="borrowing">Borrowing</option>
                            <option value="concern">Concern</option>
                            <option value="court reservation">Court Reservation</option>
                        </select>
                        <button onclick="loadHistoryView()"`;

html = html.replace(targetHtml, newHtml);
html = html.replace(targetHtml.replace(/\r\n/g, '\n'), newHtml); // fallback for lf

const historyListHtml = `<div id="unifiedHistoryList" class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                    </div>`;
const paginationHtml = `<div id="unifiedHistoryList" class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        
                    </div>
                    <!-- Pagination Controls -->
                    <div class="flex justify-between items-center mt-auto border-t border-gray-200 dark:border-slate-700 pt-4">
                        <button onclick="prevPageHistory()" class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                        <span id="historyPaginationInfo" class="text-sm text-gray-500 dark:text-gray-400 font-medium">Page 1 of 1</span>
                        <button onclick="nextPageHistory()" class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                    </div>`;

html = html.replace(historyListHtml, paginationHtml);
html = html.replace(historyListHtml.replace(/\r\n/g, '\n'), paginationHtml); // fallback for lf

fs.writeFileSync('user-dashboard.html', html);
console.log('HTML patch done');
