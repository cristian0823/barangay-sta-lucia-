const fs = require('fs');

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

replaceInFile('user-portal/js/app.js', appJsReplacements);

const injectFn = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('async function checkEquipmentAvailability')) {
        content += '\n' + checkAvailabilityFn;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Injected checkEquipmentAvailability into ${filePath}`);
    }
};

injectFn('user-portal/js/app.js');
