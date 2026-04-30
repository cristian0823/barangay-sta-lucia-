const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        for (const { search, replace } of replacements) {
            content = content.replace(search, replace);
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    } catch (err) {
        console.error(`Error updating ${filePath}:`, err);
    }
}

// 1. Add checkEquipmentAvailability to js/app.js and admin-portal/js/app.js
const checkAvailabilityFn = `
async function checkEquipmentAvailability(equipmentId, borrowDate, returnDate) {
    const supabaseAvailable = await isSupabaseAvailable();
    let totalStock = 0;
    let equipmentName = '';

    if (supabaseAvailable) {
        const { data: item } = await supabase.from('equipment').select('quantity, broken, name').eq('id', equipmentId).single();
        if (!item) return { success: false, message: 'Equipment not found' };
        totalStock = item.quantity - (item.broken || 0);
        equipmentName = item.name;

        // Find overlapping approved or pending reservations
        const { data: overlapping } = await supabase
            .from('borrowings')
            .select('quantity')
            .eq('equipment_id', equipmentId)
            .in('status', ['approved', 'pending'])
            .lte('borrow_date', returnDate)
            .gte('return_date', borrowDate);
        
        let reservedCount = 0;
        if (overlapping) {
            overlapping.forEach(b => reservedCount += b.quantity);
        }

        return { success: true, available: totalStock - reservedCount, total: totalStock };
    } else {
        // Local fallback
        const equipment = JSON.parse(localStorage.getItem('barangay_local_equipment')) || [];
        const item = equipment.find(e => e.id == equipmentId);
        if (!item) return { success: false, message: 'Equipment not found' };
        
        totalStock = item.quantity - (item.broken || 0);
        equipmentName = item.name;

        const borrowings = JSON.parse(localStorage.getItem('barangay_local_borrowings')) || [];
        let reservedCount = 0;
        
        const reqStart = new Date(borrowDate).getTime();
        const reqEnd = new Date(returnDate).getTime();

        borrowings.forEach(b => {
            if (b.equipment === equipmentName && (b.status === 'approved' || b.status === 'pending')) {
                const bStart = new Date(b.borrowDate || b.borrow_date).getTime();
                const bEnd = new Date(b.returnDate || b.return_date).getTime();
                
                // Overlap condition
                if (reqStart <= bEnd && reqEnd >= bStart) {
                    reservedCount += parseInt(b.quantity);
                }
            }
        });

        return { success: true, available: totalStock - reservedCount, total: totalStock };
    }
}
`;

const appJsReplacements = [
    // Remove immediate deduction
    {
        search: `// Immediately deduct available stock — first-come, first-served reservation
        await supabase.from('equipment').update({ available: item.available - quantity }).eq('id', equipmentId);`,
        replace: `// Removed immediate deduction`
    },
    {
        search: `// Immediately deduct available stock — first-come, first-served reservation
        item.available -= quantity;
        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));`,
        replace: `// Removed immediate deduction`
    },
    // Add check inside borrowEquipment
    {
        search: `if (item.available < quantity) return { success: false, message: \`Only \${item.available} \${item.name} available right now\` };`,
        replace: `const availCheck = await checkEquipmentAvailability(equipmentId, borrowDate, returnDate);
        if (!availCheck.success) return availCheck;
        if (availCheck.available < quantity) return { success: false, message: \`Only \${availCheck.available} \${item.name} are available for selected dates\` };`
    },
    // Remove restoration on reject
    {
        search: `// Restore reserved stock
        if (borrowing.equipment_id) {
            const { data: eq } = await supabase.from('equipment').select('available').eq('id', borrowing.equipment_id).single();
            if (eq) await supabase.from('equipment').update({ available: eq.available + borrowing.quantity }).eq('id', borrowing.equipment_id);
        }`,
        replace: `// Removed restore reserved stock`
    },
    {
        search: `// Restore reserved stock
        const localEquip = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const eqIdx = localEquip.findIndex(e => e.name === borrowings[index].equipment);
        if (eqIdx !== -1) {
            localEquip[eqIdx].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(localEquip));
        }`,
        replace: `// Removed restore reserved stock`
    },
    // Remove restoration on cancel
    {
        search: `// Restore reserved stock
        if (borrowing.equipment_id) {
            const { data: eq } = await supabase.from('equipment').select('available').eq('id', borrowing.equipment_id).single();
            if (eq) await supabase.from('equipment').update({ available: eq.available + borrowing.quantity }).eq('id', borrowing.equipment_id);
        }`,
        replace: `// Removed restore reserved stock`
    },
    {
        search: `// Restore reserved stock
        const localEquip2 = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const eqIdx2 = localEquip2.findIndex(e => e.name === borrowings[index].equipment);
        if (eqIdx2 !== -1) {
            localEquip2[eqIdx2].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(localEquip2));
        }`,
        replace: `// Removed restore reserved stock`
    },
    // Remove restoration on return
    {
        search: `// Restore stock
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const itemIndex = equipment.findIndex(e => e.name === borrowings[index].equipment);
        if (itemIndex !== -1) {
            equipment[itemIndex].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
        }`,
        replace: `// Removed restore reserved stock`
    }
];

replaceInFile('js/app.js', appJsReplacements);
replaceInFile('admin-portal/js/app.js', appJsReplacements);

// Inject the checkAvailabilityFn into both app.js
const injectFn = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('async function checkEquipmentAvailability')) {
        content += '\n' + checkAvailabilityFn;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Injected checkEquipmentAvailability into ${filePath}`);
    }
};

injectFn('js/app.js');
injectFn('admin-portal/js/app.js');

// Now, update user-dashboard.html to use checkEquipmentAvailability on date change
const userDashPath = 'user-portal/user-dashboard.html';
let dashContent = fs.readFileSync(userDashPath, 'utf8');

if (!dashContent.includes('checkAvailabilityRealtime')) {
    const scriptToInject = `
        async function checkAvailabilityRealtime() {
            const equipId = document.getElementById('borrowEquipmentId').value;
            const borrowDate = document.getElementById('borrowDate').value;
            const returnDate = document.getElementById('returnDate').value;
            const badge = document.getElementById('borrowModalStockBadge');
            const helpEl = document.getElementById('borrowMaxHelp');
            const qtyInput = document.getElementById('borrowQty');
            
            if (!equipId || !borrowDate || !returnDate) return;
            
            if (new Date(returnDate) < new Date(borrowDate)) {
                badge.innerHTML = \`<span style="color:#ef4444;">Invalid Dates</span>\`;
                qtyInput.max = 0;
                if(helpEl) helpEl.innerHTML = '<span style="color:#ef4444;"><i class="bi bi-exclamation-triangle-fill"></i> Return date cannot be before borrow date</span>';
                return;
            }

            badge.innerHTML = \`<i class="bi bi-arrow-repeat animate-spin"></i> Checking...\`;
            
            const availCheck = await checkEquipmentAvailability(equipId, borrowDate, returnDate);
            
            if (availCheck.success) {
                badge.innerHTML = \`\${availCheck.available} Available\`;
                qtyInput.max = availCheck.available;
                if (availCheck.available === 0) {
                    if(helpEl) helpEl.innerHTML = '<span style="color:#ef4444;"><i class="bi bi-x-circle-fill"></i> 0 items are available for selected dates</span>';
                    badge.classList.remove('bg-emerald-100', 'text-emerald-800');
                    badge.classList.add('bg-red-100', 'text-red-800');
                } else {
                    if(helpEl) helpEl.innerHTML = \`<span style="color:#10b981;"><i class="bi bi-check-circle-fill"></i> \${availCheck.available} items are available for selected dates</span>\`;
                    badge.classList.remove('bg-red-100', 'text-red-800');
                    badge.classList.add('bg-emerald-100', 'text-emerald-800');
                }
            } else {
                badge.innerHTML = 'Error';
            }
        }
        
        document.getElementById('borrowDate').addEventListener('change', checkAvailabilityRealtime);
        document.getElementById('returnDate').addEventListener('change', checkAvailabilityRealtime);
    `;
    
    // Inject at the end of the script tag before </body>
    dashContent = dashContent.replace('</script>\n</body>', scriptToInject + '\n</script>\n</body>');
    fs.writeFileSync(userDashPath, dashContent, 'utf8');
    console.log('Injected real-time availability check to user-dashboard.html');
}