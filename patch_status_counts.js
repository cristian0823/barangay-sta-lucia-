const fs = require('fs');

// 1. Update admin.html
let adminHtml = fs.readFileSync('admin-portal/admin.html', 'utf8');

// A. Replace the global status dropdowns with numeric inputs for "For Disposal" (since "Under Repair" is 'broken')
// In Add modal
adminHtml = adminHtml.replace(
    `<div class="form-group">
            <label for="equipStatus">Status / Condition</label>
            <select id="equipStatus" required>
                <option value="Available">Available</option>
                <option value="Under Repair">Under Repair</option>
                <option value="For Disposal">For Disposal</option>
            </select>
        </div>`,
    `<div class="form-group">
            <label for="equipDisposal">For Disposal (Qty)</label>
            <input type="number" id="equipDisposal" min="0" value="0" required>
        </div>`
);

// B. Also, we need to make sure 'equipBroken' (Under Repair) is in the Add modal (it wasn't there originally)
if (!adminHtml.includes('id="equipBroken"')) {
    adminHtml = adminHtml.replace(
        `<div class="form-group">
                        <label for="equipQuantity">Quantity</label>
                        <input type="number" id="equipQuantity" min="1" value="1" required>
                    </div>`,
        `<div class="form-group">
                        <label for="equipQuantity">Quantity</label>
                        <input type="number" id="equipQuantity" min="1" value="1" required>
                    </div>
                    <div class="form-group">
                        <label for="equipBroken">Under Repair (Qty)</label>
                        <input type="number" id="equipBroken" min="0" value="0" required>
                    </div>`
    );
}

// C. In Edit modal, replace the Status dropdown with For Disposal
adminHtml = adminHtml.replace(
    `<div class="form-group">
            <label for="editEquipStatus">Status / Condition</label>
            <select id="editEquipStatus" required>
                <option value="Available">Available</option>
                <option value="Under Repair">Under Repair</option>
                <option value="For Disposal">For Disposal</option>
            </select>
        </div>`,
    `<div class="form-group">
            <label for="editEquipDisposal">For Disposal (Qty)</label>
            <input type="number" id="editEquipDisposal" min="0" value="0" required>
        </div>`
);

// D. Table column headers: Add 'For Disposal'
if (!adminHtml.includes('<th>For Disposal</th>')) {
    adminHtml = adminHtml.replace(
        `<th style="text-align: center;">Under Repair</th>
                                            <th style="text-align: center;">Status</th>`,
        `<th style="text-align: center;">Under Repair</th>
                                            <th style="text-align: center;">For Disposal</th>
                                            <th style="text-align: center;">Status</th>`
    );
}

// E. Table Row Generation in admin.html
adminHtml = adminHtml.replace(
    "const dbStatus = e.category;",
    `const disposal = parseInt(e.category) || 0;`
);

adminHtml = adminHtml.replace(
    `if (dbStatus === 'Under Repair') {
                        statusBadge = '<span class="status-badge" style="background:#fef3c7;color:#92400e;border:1px solid #fde68a;"><i class="bi bi-wrench"></i> Under Repair</span>';
                    } else if (dbStatus === 'For Disposal') {
                        statusBadge = '<span class="status-badge" style="background:#fee2e2;color:#991b1b;border:1px solid #fecaca;"><i class="bi bi-trash-fill"></i> For Disposal</span>';
                    } else if (e.isArchived) {`,
    `if (e.isArchived) {`
);

adminHtml = adminHtml.replace(
    `<td style="text-align: center; color:\${broken > 0 ? '#c2410c' : '#9ca3af'};font-weight:\${broken > 0 ? '700' : '400'}">\${broken}</td>
                    <td style="text-align: center;">\${statusBadge}</td>`,
    `<td style="text-align: center; color:\${broken > 0 ? '#c2410c' : '#9ca3af'};font-weight:\${broken > 0 ? '700' : '400'}">\${broken}</td>
                    <td style="text-align: center; color:\${disposal > 0 ? '#991b1b' : '#9ca3af'};font-weight:\${disposal > 0 ? '700' : '400'}">\${disposal}</td>
                    <td style="text-align: center;">\${statusBadge}</td>`
);

// F. Edit mapping
adminHtml = adminHtml.replace(
    "document.getElementById('editEquipStatus').value = equipment.category && ['Available', 'Under Repair', 'For Disposal'].includes(equipment.category) ? equipment.category : 'Available';",
    "document.getElementById('editEquipDisposal').value = parseInt(equipment.category) || 0;"
);


// 2. Update app.js
let appJs = fs.readFileSync('admin-portal/js/app.js', 'utf8');

// Parse broken and disposal properly
appJs = appJs.replace(
    "const diffQty = (updates.quantity !== undefined ? parseInt(updates.quantity) : item.quantity) - item.quantity;",
    `const disposal = parseInt(item.category) || 0;
        const updatesDisposal = updates.category !== undefined ? parseInt(updates.category) : disposal;
        const diffQty = (updates.quantity !== undefined ? parseInt(updates.quantity) : item.quantity) - item.quantity;`
);

appJs = appJs.replace(
    "const newAvailable = item.available + diffQty - diffBroken;",
    "const diffDisposal = updatesDisposal - disposal;\n        const newAvailable = item.available + diffQty - diffBroken - diffDisposal;"
);

// Same for local fallback
appJs = appJs.replace(
    "item.available = item.available + diffQty - diffBroken;",
    "const diffDisposalLocal = (updates.category !== undefined ? parseInt(updates.category) : (parseInt(item.category)||0)) - (parseInt(item.category)||0);\n        item.available = item.available + diffQty - diffBroken - diffDisposalLocal;"
);

// Fix addEquipment payload
appJs = appJs.replace(
    "category: equipmentData.status || 'Available',",
    "category: equipmentData.disposal ? String(equipmentData.disposal) : '0',"
);

// Fix get values from admin.html
appJs = appJs.replace(
    "category: document.getElementById('equipStatus').value,",
    "disposal: document.getElementById('equipDisposal').value,\n                    broken: document.getElementById('equipBroken').value,"
);
appJs = appJs.replace(
    "category: document.getElementById('editEquipStatus').value,",
    "category: document.getElementById('editEquipDisposal').value," // Overrides updates.category
);


// 3. Update user-dashboard.html
let userHtml = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

userHtml = userHtml.replace(
    "const ok = item.available > 0 && item.category !== 'Under Repair' && item.category !== 'For Disposal';",
    "const ok = item.available > 0;"
);

userHtml = userHtml.replace(
    `let statusText = item.available + ' Available';
                if (item.category === 'Under Repair') { statusText = 'Under Repair'; statusIcon = '<i class="bi bi-wrench"></i>'; }
                else if (item.category === 'For Disposal') { statusText = 'For Disposal'; statusIcon = '<i class="bi bi-trash-fill"></i>'; }`,
    `const disposal = parseInt(item.category) || 0;
                const broken = item.broken || 0;
                let statusText = item.available + ' Available';
                
                let detailsArr = [];
                if (broken > 0) detailsArr.push(broken + ' Under Repair');
                if (disposal > 0) detailsArr.push(disposal + ' For Disposal');
                
                if (!ok) {
                    if (detailsArr.length > 0) {
                        statusText = '0 Available';
                    } else {
                        statusText = 'Out of Stock';
                    }
                    statusIcon = '<i class="bi bi-x-circle-fill"></i>';
                }
                
                let extraBadges = '';
                if (broken > 0) {
                    extraBadges += '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-amber-500/90 text-white"><i class="bi bi-wrench"></i> ' + broken + ' Repair</span> ';
                }
                if (disposal > 0) {
                    extraBadges += '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md bg-red-600/90 text-white"><i class="bi bi-trash-fill"></i> ' + disposal + ' Disposal</span>';
                }`
);

userHtml = userHtml.replace(
    `<div class="absolute top-3 right-3">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md \${ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}">\${statusIcon} \${statusText}</span>
                        </div>`,
    `<div class="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md \${ok ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}">\${statusIcon} \${statusText}</span>
                            \${extraBadges}
                        </div>`
);

fs.writeFileSync('admin-portal/admin.html', adminHtml);
fs.writeFileSync('admin-portal/js/app.js', appJs);
fs.writeFileSync('user-portal/user-dashboard.html', userHtml);

console.log('Successfully applied partial status counts logic!');
