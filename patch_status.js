const fs = require('fs');

// 1. Update admin.html
let adminHtml = fs.readFileSync('admin-portal/admin.html', 'utf8');

// Add Status dropdown to Add Equipment modal (after the hidden category)
if (!adminHtml.includes('<select id="equipStatus"')) {
    adminHtml = adminHtml.replace(
        '</select>\n        </div>\n        <div class="form-group" style="display:none;">\n            <label for="equipIcon">Icon (Emoji)</label>',
        `</select>
        </div>
        <div class="form-group">
            <label for="equipStatus">Status / Condition</label>
            <select id="equipStatus" required>
                <option value="Available">Available</option>
                <option value="Under Repair">Under Repair</option>
                <option value="For Disposal">For Disposal</option>
            </select>
        </div>
        <div class="form-group" style="display:none;">
            <label for="equipIcon">Icon (Emoji)</label>`
    );
}

// Add Status dropdown to Edit Equipment modal
if (!adminHtml.includes('<select id="editEquipStatus"')) {
    adminHtml = adminHtml.replace(
        '</select>\n        </div>\n        <div class="form-group" style="display:none;">\n            <label for="editEquipIcon">Icon (Emoji)</label>',
        `</select>
        </div>
        <div class="form-group">
            <label for="editEquipStatus">Status / Condition</label>
            <select id="editEquipStatus" required>
                <option value="Available">Available</option>
                <option value="Under Repair">Under Repair</option>
                <option value="For Disposal">For Disposal</option>
            </select>
        </div>
        <div class="form-group" style="display:none;">
            <label for="editEquipIcon">Icon (Emoji)</label>`
    );
}

// Add Status to table headers
if (!adminHtml.includes('<th>Status</th>')) {
    adminHtml = adminHtml.replace(
        '<th>Available</th>\n                                <th>Actions</th>',
        '<th>Available</th>\n                                <th>Status</th>\n                                <th>Actions</th>'
    );
}

// Replace category text with status in admin.html where applicable
adminHtml = adminHtml.replace(
    "document.getElementById('editEquipCategory').value = equipment.category || 'General';",
    "document.getElementById('editEquipCategory').value = equipment.category || 'General';\n                document.getElementById('editEquipStatus').value = equipment.status || 'Available';"
);

fs.writeFileSync('admin-portal/admin.html', adminHtml);


// 2. Update app.js
let appJs = fs.readFileSync('admin-portal/js/app.js', 'utf8');

// Render status badge in admin equipment table
if (!appJs.includes("const statBadge = e.status")) {
    appJs = appJs.replace(
        "const brokenBadge = e.broken > 0 ? `<span class=\"badge\" style=\"background:#fee2e2;color:#991b1b;font-size:11px;\">${e.broken} broken</span>` : '';",
        `const brokenBadge = e.broken > 0 ? \`<span class="badge" style="background:#fee2e2;color:#991b1b;font-size:11px;">\${e.broken} broken</span>\` : '';
        let statBadge = '';
        if (e.status === 'Under Repair') statBadge = '<span class="badge" style="background:#fef3c7;color:#92400e;">Under Repair</span>';
        else if (e.status === 'For Disposal') statBadge = '<span class="badge" style="background:#fee2e2;color:#991b1b;">For Disposal</span>';
        else statBadge = '<span class="badge" style="background:#d1fae5;color:#065f46;">Available</span>';`
    );
    appJs = appJs.replace(
        "<td><span style=\"font-weight:700;color:var(--primary-color);\">${e.available}</span> ${brokenBadge}</td>",
        "<td><span style=\"font-weight:700;color:var(--primary-color);\">${e.available}</span> ${brokenBadge}</td>\n                        <td>${statBadge}</td>"
    );
}

// Add status to payloads
appJs = appJs.replace(
    "if (updates.image_url !== undefined) payload.image_url = updates.image_url;",
    "if (updates.image_url !== undefined) payload.image_url = updates.image_url;\n        if (updates.status !== undefined) payload.status = updates.status;"
);

appJs = appJs.replace(
    "if (updates.image_url !== undefined) item.image_url = updates.image_url;",
    "if (updates.image_url !== undefined) item.image_url = updates.image_url;\n        if (updates.status !== undefined) item.status = updates.status;"
);

appJs = appJs.replace(
    "is_archived: equipmentData.is_archived || false",
    "is_archived: equipmentData.is_archived || false,\n            status: equipmentData.status || 'Available'"
);

appJs = appJs.replace(
    "isArchived: equipmentData.is_archived || false",
    "isArchived: equipmentData.is_archived || false,\n            status: equipmentData.status || 'Available'"
);

appJs = appJs.replace(
    "category: document.getElementById('equipCategory').value,",
    "category: document.getElementById('equipCategory').value,\n                    status: document.getElementById('equipStatus').value,"
);

appJs = appJs.replace(
    "category: document.getElementById('editEquipCategory').value,",
    "category: document.getElementById('editEquipCategory').value,\n                    status: document.getElementById('editEquipStatus').value,"
);

// Include status in fetching mapper
appJs = appJs.replace(
    "broken: item.broken || 0,",
    "broken: item.broken || 0,\n        status: item.status || 'Available',"
);

fs.writeFileSync('admin-portal/js/app.js', appJs);


// 3. Update user-dashboard.html
let userHtml = fs.readFileSync('user-portal/user-dashboard.html', 'utf8');

if (!userHtml.includes("item.status === 'Under Repair'")) {
    userHtml = userHtml.replace(
        "const isAvail = item.available > 0;",
        `const isAvail = item.available > 0 && item.status !== 'Under Repair' && item.status !== 'For Disposal';`
    );

    userHtml = userHtml.replace(
        "const ok = item.available > 0;",
        "const ok = item.available > 0 && item.status !== 'Under Repair' && item.status !== 'For Disposal';"
    );
    
    userHtml = userHtml.replace(
        "const statusIcon = ok ? '<i class=\"bi bi-check-circle-fill\"></i>' : '<i class=\"bi bi-x-circle-fill\"></i>';",
        `let statusIcon = ok ? '<i class="bi bi-check-circle-fill"></i>' : '<i class="bi bi-x-circle-fill"></i>';
        let statusText = item.available + ' Available';
        if (item.status === 'Under Repair') { statusText = 'Under Repair'; statusIcon = '<i class="bi bi-wrench"></i>'; }
        else if (item.status === 'For Disposal') { statusText = 'For Disposal'; statusIcon = '<i class="bi bi-trash-fill"></i>'; }`
    );

    userHtml = userHtml.replace(
        "${statusIcon} ${item.available} Available",
        "${statusIcon} ${statusText}"
    );
}

fs.writeFileSync('user-portal/user-dashboard.html', userHtml);

console.log('Successfully patched status logic across admin.html, app.js, and user-dashboard.html!');
