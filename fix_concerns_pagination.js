const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

const oldConcerns = `        async function loadConcernsView() {
            const concerns = await getMyConcerns();
            const container = document.getElementById('myConcernsList');

            if (!concerns || concerns.length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have not submitted any concerns yet.</p>';
                return;
            }
            const sorted = [...concerns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            container.innerHTML = sorted.map(c => {
                let statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">⏳ Pending</span>';
                if (c.status === 'in-progress') statusBadge = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">🔄 In Progress</span>';
                if (c.status === 'resolved') statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">✅ Resolved</span>';
                if (c.status === 'rejected') statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">❌ Rejected</span>';
                
                let actualDescription = c.description || 'No description provided';
                let attachedImageHtml = '';
                
                if (actualDescription.includes('[ATTACHED_IMAGE_DATA]')) {
                    const parts = actualDescription.split('[ATTACHED_IMAGE_DATA]');
                    actualDescription = parts[0].replace(/Usern/g, '').trim();
                    const b64 = parts[1].replace(/Usern/g, '').trim();
                    attachedImageHtml = '<div class="mt-3"><img src="' + b64 + '" class="max-h-24 rounded-lg border shadow-sm object-cover" style="border-color: var(--border-color);" alt="Attached photo"></div>';
                }

                return '<div class="p-4 rounded-xl border hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex flex-col h-full" style="border-color: var(--border-color);">' +
                    '<div class="flex justify-between items-start mb-2">' +
                    '<h4 class="font-bold text-base line-clamp-1" style="color: var(--text-main);">' + c.title + '</h4>' +
                    statusBadge +
                    '</div>' +
                    '<p class="text-xs opacity-80 mb-2 flex-grow" style="color: var(--text-main);">' + actualDescription + '</p>' +
                    attachedImageHtml + 
                    '<div class="flex items-center justify-between mt-3 pt-3 border-t" style="border-color: var(--border-color);">' +
                    '<div class="flex items-center gap-3 text-xs mt-1" style="color: var(--text-muted);"><span class="bg-gray-100 px-2 py-0.5 rounded">' + c.category + '</span><span>📅 ' + formatDate(c.createdAt) + '</span></div>' +
                    (c.status === 'pending' ? '<div class="flex gap-2"><button onclick="openEditConcernModal(' + c.id + ')" class="text-xs text-blue-500 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">✏️ Edit</button><button onclick="deleteMyConcern(' + c.id + ')" class="text-xs text-red-500 hover:text-red-700 font-semibold bg-red-50 px-2 py-1 rounded">Delete</button></div>' : '') +
                    '</div>' +
                    (c.response ? '<div class="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg mt-3"><p class="text-xs font-bold text-emerald-700 mb-1">🏛️ Admin Response:</p><p class="text-sm text-emerald-800">' + c.response + '</p></div>' : '') +
                    '</div>';
            }).join('');
        }`;

const newConcerns = `        let concernsCurrentPage = 1;
        const concernsItemsPerPage = 4;
        let allConcernsItems = [];
        async function loadConcernsView() {
            const concerns = await getMyConcerns();
            const container = document.getElementById('myConcernsList');

            if (!concerns || concerns.length === 0) {
                container.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have not submitted any concerns yet.</p>';
                return;
            }
            allConcernsItems = [...concerns].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            renderConcernsPage();
        }

        function renderConcernsPage() {
            const container = document.getElementById('myConcernsList');
            const totalPages = Math.ceil(allConcernsItems.length / concernsItemsPerPage);
            if (concernsCurrentPage > totalPages && totalPages > 0) concernsCurrentPage = totalPages;
            if (concernsCurrentPage < 1) concernsCurrentPage = 1;
            
            const start = (concernsCurrentPage - 1) * concernsItemsPerPage;
            const paginated = allConcernsItems.slice(start, start + concernsItemsPerPage);

            let html = paginated.map(c => {
                let statusBadge = '<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold border border-amber-200">⏳ Pending</span>';
                if (c.status === 'in-progress') statusBadge = '<span class="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs font-bold border border-blue-200">🔄 In Progress</span>';
                if (c.status === 'resolved') statusBadge = '<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">✅ Resolved</span>';
                if (c.status === 'rejected') statusBadge = '<span class="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-bold border border-red-200">❌ Rejected</span>';
                
                let actualDescription = c.description || 'No description provided';
                let attachedImageHtml = '';
                
                if (actualDescription.includes('[ATTACHED_IMAGE_DATA]')) {
                    const parts = actualDescription.split('[ATTACHED_IMAGE_DATA]');
                    actualDescription = parts[0].replace(/Usern/g, '').trim();
                    const b64 = parts[1].replace(/Usern/g, '').trim();
                    attachedImageHtml = '<div class="mt-3"><img src="' + b64 + '" class="max-h-24 rounded-lg border shadow-sm object-cover" style="border-color: var(--border-color);" alt="Attached photo"></div>';
                }

                return '<div class="p-4 rounded-xl border hover:shadow-md transition-shadow bg-white dark:bg-gray-800 flex flex-col h-full" style="border-color: var(--border-color);">' +
                    '<div class="flex justify-between items-start mb-2">' +
                    '<h4 class="font-bold text-base line-clamp-1" style="color: var(--text-main);">' + c.title + '</h4>' +
                    statusBadge +
                    '</div>' +
                    '<p class="text-xs opacity-80 mb-2 flex-grow" style="color: var(--text-main);">' + actualDescription + '</p>' +
                    attachedImageHtml + 
                    '<div class="flex items-center justify-between mt-3 pt-3 border-t" style="border-color: var(--border-color);">' +
                    '<div class="flex items-center gap-3 text-xs mt-1" style="color: var(--text-muted);"><span class="bg-gray-100 px-2 py-0.5 rounded">' + c.category + '</span><span>📅 ' + formatDate(c.createdAt) + '</span></div>' +
                    (c.status === 'pending' ? '<div class="flex gap-2"><button onclick="openEditConcernModal(' + c.id + ')" class="text-xs text-blue-500 hover:text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">✏️ Edit</button><button onclick="deleteMyConcern(' + c.id + ')" class="text-xs text-red-500 hover:text-red-700 font-semibold bg-red-50 px-2 py-1 rounded">Delete</button></div>' : '') +
                    '</div>' +
                    (c.response ? '<div class="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg mt-3"><p class="text-xs font-bold text-emerald-700 mb-1">🏛️ Admin Response:</p><p class="text-sm text-emerald-800">' + c.response + '</p></div>' : '') +
                    '</div>';
            }).join('');

            if (totalPages > 1) {
                html += \`<div class="col-span-full flex justify-center mt-4 gap-2">
                    <button onclick="concernsCurrentPage--;renderConcernsPage()" \${concernsCurrentPage===1?'disabled':''} class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">\${concernsCurrentPage} / \${totalPages}</span>
                    <button onclick="concernsCurrentPage++;renderConcernsPage()" \${concernsCurrentPage===totalPages?'disabled':''} class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
                </div>\`;
            }
            container.innerHTML = html;
        }`;

txt = txt.replace(oldConcerns, newConcerns);
fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('Done concerns paginations');
