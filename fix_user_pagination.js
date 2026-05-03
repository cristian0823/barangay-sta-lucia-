const fs = require('fs');
let txt = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

// 1. Pagination for Borrowing History
const oldBorrowing = `        async function loadMyBorrowingsList() {
            // Ensure equipment list is loaded so icons work correctly
            if (!allEquipmentList || allEquipmentList.length === 0) {
                try { allEquipmentList = await getEquipment(); } catch(e) { /* continue with keyword fallback */ }
            }
            const list = await getMyBorrowings();
            const container = document.getElementById('myBorrowingsList');
            if (!list || list.length === 0) {
                container.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-center col-span-full"><div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4"><i class="bi bi-box-seam"></i></div><p class="text-gray-500 font-medium">No borrowing history yet</p></div>';
                return;
            }
            const sorted = [...list].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            container.innerHTML = sorted.map(b => {
                let statusBadge = '', statusBorder = 'border-emerald-200';
                if (b.status === 'pending') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>Pending</span>'; statusBorder = 'border-amber-200'; }
                if (b.status === 'approved') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Approved</span>'; statusBorder = 'border-emerald-200'; }
                if (b.status === 'rejected') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>'; statusBorder = 'border-red-200'; }
                if (b.status === 'returned') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Returned</span>'; statusBorder = 'border-blue-200'; }
                const rejectionMsg = (b.status === 'rejected' && b.rejection_reason) ? '<div class="mt-3 text-xs bg-red-50 p-3 rounded-lg border border-red-100"><strong class="text-red-700">Reason:</strong> <span class="text-red-600">' + b.rejection_reason + '</span></div>' : '';
                const equipIcon = getEquipmentIcon(b.equipment);
                return '<div class="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ' + statusBorder + ' shadow-sm hover:shadow-md transition-all duration-300">' +
                    '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div class="flex items-start gap-4">' + equipIcon + 
                    '<div><h4 class="font-bold text-lg text-gray-800 dark:text-white">' + b.equipment + '</h4><p class="text-sm text-gray-500 font-medium">Quantity: <span class="text-emerald-600 font-bold">x' + b.quantity + '</span></p></div></div>' +
                    '<div class="flex flex-col items-end gap-2">' + statusBadge + '<div class="text-xs text-gray-400 flex items-center gap-1">📅 ' + formatDate(b.borrowDate) + ' <i class="bi bi-arrow-right"></i> ' + formatDate(b.returnDate) + '</div></div></div>' +
                    rejectionMsg +
                    (b.status === 'pending' ? '<div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"><p class="text-xs text-amber-600 font-medium flex items-center gap-1">⏳ Waiting for approval</p><div class="flex gap-2"><button onclick="cancelEqRequest(' + b.id + ')" class="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Cancel</button></div></div>' : '') +
                    '</div>';
            }).join('');
        }`;

const newBorrowing = `        let borrowCurrentPage = 1;
        const borrowItemsPerPage = 5;
        let allBorrowingItems = [];
        async function loadMyBorrowingsList() {
            if (!allEquipmentList || allEquipmentList.length === 0) {
                try { allEquipmentList = await getEquipment(); } catch(e) { /* continue with keyword fallback */ }
            }
            const list = await getMyBorrowings();
            const container = document.getElementById('myBorrowingsList');
            if (!list || list.length === 0) {
                container.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-center col-span-full"><div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4"><i class="bi bi-box-seam"></i></div><p class="text-gray-500 font-medium">No borrowing history yet</p></div>';
                return;
            }
            allBorrowingItems = [...list].sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            renderBorrowingPage();
        }

        function renderBorrowingPage() {
            const container = document.getElementById('myBorrowingsList');
            const totalPages = Math.ceil(allBorrowingItems.length / borrowItemsPerPage);
            if (borrowCurrentPage > totalPages && totalPages > 0) borrowCurrentPage = totalPages;
            if (borrowCurrentPage < 1) borrowCurrentPage = 1;
            
            const start = (borrowCurrentPage - 1) * borrowItemsPerPage;
            const paginated = allBorrowingItems.slice(start, start + borrowItemsPerPage);
            
            let html = paginated.map(b => {
                let statusBadge = '', statusBorder = 'border-emerald-200';
                if (b.status === 'pending') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700"><span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>Pending</span>'; statusBorder = 'border-amber-200'; }
                if (b.status === 'approved') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>Approved</span>'; statusBorder = 'border-emerald-200'; }
                if (b.status === 'rejected') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700"><span class="w-1.5 h-1.5 bg-red-500 rounded-full"></span>Rejected</span>'; statusBorder = 'border-red-200'; }
                if (b.status === 'returned') { statusBadge = '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700"><span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>Returned</span>'; statusBorder = 'border-blue-200'; }
                const rejectionMsg = (b.status === 'rejected' && b.rejection_reason) ? '<div class="mt-3 text-xs bg-red-50 p-3 rounded-lg border border-red-100"><strong class="text-red-700">Reason:</strong> <span class="text-red-600">' + b.rejection_reason + '</span></div>' : '';
                const equipIcon = getEquipmentIcon(b.equipment);
                return '<div class="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800 border-2 ' + statusBorder + ' shadow-sm hover:shadow-md transition-all duration-300">' +
                    '<div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4"><div class="flex items-start gap-4">' + equipIcon + 
                    '<div><h4 class="font-bold text-lg text-gray-800 dark:text-white">' + b.equipment + '</h4><p class="text-sm text-gray-500 font-medium">Quantity: <span class="text-emerald-600 font-bold">x' + b.quantity + '</span></p></div></div>' +
                    '<div class="flex flex-col items-end gap-2">' + statusBadge + '<div class="text-xs text-gray-400 flex items-center gap-1">📅 ' + formatDate(b.borrowDate) + ' <i class="bi bi-arrow-right"></i> ' + formatDate(b.returnDate) + '</div></div></div>' +
                    rejectionMsg +
                    (b.status === 'pending' ? '<div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between"><p class="text-xs text-amber-600 font-medium flex items-center gap-1">⏳ Waiting for approval</p><div class="flex gap-2"><button onclick="cancelEqRequest(' + b.id + ')" class="px-4 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">Cancel</button></div></div>' : '') +
                    '</div>';
            }).join('');
            
            if (totalPages > 1) {
                html += \`<div class="col-span-full flex justify-center mt-4 gap-2">
                    <button onclick="borrowCurrentPage--;renderBorrowingPage()" \${borrowCurrentPage===1?'disabled':''} class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">\${borrowCurrentPage} / \${totalPages}</span>
                    <button onclick="borrowCurrentPage++;renderBorrowingPage()" \${borrowCurrentPage===totalPages?'disabled':''} class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
                </div>\`;
            }
            container.innerHTML = html;
        }`;

txt = txt.replace(oldBorrowing, newBorrowing);

// 2. Pagination for Active Reservations
const oldReservation = `            // Render Active
            if (activeBookings.length === 0) { 
                myContainer.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have no active reservations.</p>'; 
            } else {
                activeBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
                myContainer.innerHTML = activeBookings.map(b => {
                    const statusClass = b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
                    const statusText = b.status.charAt(0).toUpperCase() + b.status.slice(1);
                    return '<div class="border rounded-xl p-4 shadow-sm" style="background-color: var(--panel-bg); border-color: var(--border-color);">' +
                        '<div class="flex justify-between mb-2 border-b pb-2" style="border-color: var(--border-color);"><h4 class="font-bold" style="color: var(--text-main);">📅 ' + formatDate(b.date) + '</h4><span class="px-2 py-0.5 rounded text-xs font-bold ' + statusClass + '">' + statusText + '</span></div>' +
                        '<p class="text-xs mb-1" style="color: var(--text-muted);">⏰ ' + b.time + '</p>' +
                        '<p class="text-xs italic" style="color: var(--text-muted);">Purpose: ' + (b.purpose || '') + '</p>' +
                        '<div class="mt-3 flex gap-2 flex-col">' +
                        '<button onclick="cancelMyReservation(' + b.id + ')" class="w-full py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition">Cancel Reservation</button>' +
                        '</div></div>';
                }).join('');
            }`;

const newReservation = `            // Render Active
            if (activeBookings.length === 0) { 
                myContainer.innerHTML = '<p class="text-gray-500 italic py-4 col-span-full">You have no active reservations.</p>'; 
            } else {
                activeBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
                window.allActiveBookings = activeBookings;
                window.activeBookingPage = 1;
                renderActiveBookingsPage();
            }
        }

        function renderActiveBookingsPage() {
            const container = document.getElementById('myReservationsList');
            if (!container) return;
            const itemsPerPage = 3;
            const totalPages = Math.ceil(window.allActiveBookings.length / itemsPerPage);
            if (window.activeBookingPage > totalPages && totalPages > 0) window.activeBookingPage = totalPages;
            if (window.activeBookingPage < 1) window.activeBookingPage = 1;
            
            const start = (window.activeBookingPage - 1) * itemsPerPage;
            const paginated = window.allActiveBookings.slice(start, start + itemsPerPage);

            let html = paginated.map(b => {
                const statusClass = b.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800';
                const statusText = b.status.charAt(0).toUpperCase() + b.status.slice(1);
                return '<div class="border rounded-xl p-4 shadow-sm" style="background-color: var(--panel-bg); border-color: var(--border-color);">' +
                    '<div class="flex justify-between mb-2 border-b pb-2" style="border-color: var(--border-color);"><h4 class="font-bold" style="color: var(--text-main);">📅 ' + formatDate(b.date) + '</h4><span class="px-2 py-0.5 rounded text-xs font-bold ' + statusClass + '">' + statusText + '</span></div>' +
                    '<p class="text-xs mb-1" style="color: var(--text-muted);">⏰ ' + b.time + '</p>' +
                    '<p class="text-xs italic" style="color: var(--text-muted);">Purpose: ' + (b.purpose || '') + '</p>' +
                    '<div class="mt-3 flex gap-2 flex-col">' +
                    '<button onclick="cancelMyReservation(' + b.id + ')" class="w-full py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded transition">Cancel Reservation</button>' +
                    '</div></div>';
            }).join('');

            if (totalPages > 1) {
                html += \`<div class="col-span-full flex justify-center mt-4 gap-2">
                    <button onclick="window.activeBookingPage--;renderActiveBookingsPage()" \${window.activeBookingPage===1?'disabled':''} class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
                    <span class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded">\${window.activeBookingPage} / \${totalPages}</span>
                    <button onclick="window.activeBookingPage++;renderActiveBookingsPage()" \${window.activeBookingPage===totalPages?'disabled':''} class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
                </div>\`;
            }
            container.innerHTML = html;`;

txt = txt.replace(oldReservation, newReservation);

fs.writeFileSync('user-portal/user-dashboard.html', txt);
console.log('User dashboard pagination applied.');
