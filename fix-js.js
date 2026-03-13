const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// The block to replace:
const blockStart = '// Open borrow modal (called from equipment card or button)';
const blockEnd = '// Render the borrow calendar';

const startIndex = html.indexOf(blockStart);
const endIndex = html.indexOf(blockEnd);

if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find block indices');
    process.exit(1);
}

const replacement = `// Open borrow modal (called from equipment card or button)
        async function openBorrowModalWithEquip(equipId) {
            const list = await getEquipment();
            const item = list.find(e => e.id === equipId);
            if (!item) return;
            
            document.getElementById('borrowModalTitle').innerHTML = \`Borrow \${item.name} \${item.icon}\`;
            document.getElementById('borrowEquipmentId').value = equipId;
            document.getElementById('borrowEquipmentName').value = item.name;
            
            document.getElementById('borrowQty').max = item.available;
            document.getElementById('borrowQty').value = 1;
            document.getElementById('borrowMaxHelp').innerHTML = \`<svg class="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Max: \${item.available} units available\`;
            
            document.getElementById('borrowPurpose').value = '';
            borrowStartDate = null;
            borrowReturnDate = null;
            borrowDateSelectingStart = true;
            
            updateBorrowDateDisplays();
            renderBorrowCalendar();
            updateBorrowSubmitButton();
            
            document.getElementById('borrowModal').classList.remove('hidden');
        }
        
        function openBorrowModal() {
            showToast('Please close this modal and click Borrow on a specific equipment card first', 'error');
        }
        
        function closeBorrowModal() {
            document.getElementById('borrowModal').classList.add('hidden');
        }
        
        document.getElementById('borrowQty').addEventListener('input', updateBorrowSubmitButton);
        document.getElementById('borrowPurpose').addEventListener('input', updateBorrowSubmitButton);
        
        function updateBorrowSubmitButton() {
            const btn = document.getElementById('submitBorrowBtn');
            const qty = document.getElementById('borrowQty').value;
            const purpose = document.getElementById('borrowPurpose').value;
            
            if (borrowStartDate && borrowReturnDate && qty > 0 && purpose.trim() !== '') {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }

        // Update the date displays in the form
        function updateBorrowDateDisplays() {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            const bDisp = document.getElementById('borrowDateDisplay');
            const rDisp = document.getElementById('returnDateDisplay');
            
            const dpStartDay = document.getElementById('dispStartDateDay');
            const dpStartMonth = document.getElementById('dispStartDateMonth');
            const dpReturnDay = document.getElementById('dispReturnDateDay');
            const dpReturnMonth = document.getElementById('dispReturnDateMonth');
            const durText = document.getElementById('borrowDuration');
            const rangeDisplay = document.getElementById('dateRangeDisplay');
            
            if (borrowStartDate) {
                const d = new Date(borrowStartDate);
                bDisp.innerHTML = \`<div class="text-lg font-bold text-emerald-700 dark:text-emerald-300">\${fullMonths[d.getMonth()]} \${d.getDate()}</div><div class="text-xs text-emerald-500">\${d.getFullYear()}</div>\`;
                bDisp.classList.add('border-emerald-400', 'bg-emerald-100');
                if (dpStartDay) { dpStartDay.textContent = d.getDate(); dpStartMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                rangeDisplay.textContent = 'Now select a return date from the calendar';
            } else {
                bDisp.innerHTML = \`<div class="text-lg font-bold text-emerald-700">Select date</div><div class="text-xs text-emerald-500">from calendar</div>\`;
                bDisp.classList.remove('border-emerald-400', 'bg-emerald-100');
                if (dpStartDay) { dpStartDay.textContent = '--'; dpStartMonth.textContent = 'Select date'; }
                rangeDisplay.textContent = 'Please select your borrowing dates from the calendar';
            }
            
            if (borrowReturnDate) {
                const d = new Date(borrowReturnDate);
                rDisp.innerHTML = \`<div class="text-lg font-bold text-teal-700 dark:text-teal-300">\${fullMonths[d.getMonth()]} \${d.getDate()}</div><div class="text-xs text-teal-500">\${d.getFullYear()}</div>\`;
                rDisp.classList.add('border-teal-400', 'bg-teal-100');
                if (dpReturnDay) { dpReturnDay.textContent = d.getDate(); dpReturnMonth.textContent = months[d.getMonth()] + ' ' + d.getFullYear(); }
                
                const start = new Date(borrowStartDate);
                const diffTime = Math.abs(d - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                durText.textContent = diffDays + (diffDays > 1 ? ' days' : ' day');
                rangeDisplay.innerHTML = \`<span class="text-emerald-600 dark:text-emerald-400">📅 \${fullMonths[start.getMonth()]} \${start.getDate()} → \${fullMonths[d.getMonth()]} \${d.getDate()}, \${d.getFullYear()}</span> <span class="ml-2 px-2 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold">\${diffDays} day\${diffDays > 1 ? 's' : ''}</span>\`;
            } else {
                rDisp.innerHTML = \`<div class="text-lg font-bold text-teal-700">Select date</div><div class="text-xs text-teal-500">from calendar</div>\`;
                rDisp.classList.remove('border-teal-400', 'bg-teal-100');
                if (dpReturnDay) { dpReturnDay.textContent = '--'; dpReturnMonth.textContent = 'Select date'; durText.textContent = '0 days'; }
            }
        }

        `;

// Replace
const newHtml = html.substring(0, startIndex) + replacement + html.substring(endIndex);
fs.writeFileSync('user-dashboard.html', newHtml, 'utf8');

// Now we need to remove updateInlineDateDisplays from the old code if it's lingering beyond that block
let finalHtml = fs.readFileSync('user-dashboard.html', 'utf8');
const inlineBlockStart = '// Update inline form date displays';
const inlineBlockEnd = '// Change borrow calendar month';

const iStart = finalHtml.indexOf(inlineBlockStart);
const iEnd = finalHtml.indexOf(inlineBlockEnd);
if (iStart > -1 && iEnd > iStart) {
    finalHtml = finalHtml.substring(0, iStart) + finalHtml.substring(iEnd);
    fs.writeFileSync('user-dashboard.html', finalHtml, 'utf8');
}

console.log('Fixed JS handlers perfectly');
