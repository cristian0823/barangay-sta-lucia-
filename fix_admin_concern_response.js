const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

const oldFn = `async function submitAdminConcernResponse(newStatus) {\r\n                const concernId = _currentConcernId;\r\n                const responseText = (document.getElementById('adminConcernResponseText') || {}).value || '';\r\n                if (!concernId) return;\r\n                try {\r\n                    const supabaseAvail = await isSupabaseAvailable();\r\n                    if (supabaseAvail) {\r\n                        await supabase.from('concerns').update(updateData).eq('id', concernId);\r\n                    }\r\n                    const c = _allAdminConcerns.find(function(x){ return x.id === concernId; });\r\n                    if (c) { c.status = newStatus; if (responseText.trim()) c.response = responseText.trim(); }\r\n                    await logActivity('Concern Responded', 'Admin responded to concern #' + concernId + ' (Status: ' + newStatus + ')');\r\n                    showAlert('Concern marked as ' + newStatus + '.', 'success');\r\n                    closeAdminConcernModal();\r\n                    loadConcerns();\r\n                } catch(err) {\r\n                    console.error('Concern respond error:', err);\r\n                    showAlert('Failed to submit response. Please try again.', 'error');\r\n                }\r\n            }`;

const newFn = `async function submitAdminConcernResponse(newStatus) {
                const concernId = _currentConcernId;
                const responseText = (document.getElementById('adminConcernResponseText') || {}).value || '';
                if (!concernId) return;
                try {
                    const supabaseAvail = await isSupabaseAvailable();
                    if (supabaseAvail && typeof updateConcernStatus === 'function') {
                        // Calls app.js updateConcernStatus which also sends user notification bell
                        await updateConcernStatus(concernId, newStatus, responseText.trim() || null, undefined);
                    } else if (supabaseAvail) {
                        const updateData = { status: newStatus };
                        if (responseText.trim()) updateData.response = responseText.trim();
                        await supabase.from('concerns').update(updateData).eq('id', concernId);
                    }
                    const c = _allAdminConcerns.find(function(x){ return x.id === concernId; });
                    if (c) { c.status = newStatus; if (responseText.trim()) c.response = responseText.trim(); }
                    await logActivity('Concern Responded', 'Admin responded to concern #' + concernId + ' (Status: ' + newStatus + ')');
                    showAlert('Concern marked as ' + newStatus + '.', 'success');
                    closeAdminConcernModal();
                    loadConcerns();
                } catch(err) {
                    console.error('Concern respond error:', err);
                    showAlert('Failed to submit response. Please try again.', 'error');
                }
            }`;

if (txt.includes(oldFn)) {
    txt = txt.replace(oldFn, newFn);
    fs.writeFileSync('admin-portal/admin.html', txt);
    console.log('Success');
} else {
    console.log('Target not found - will try normalizing...');
    // Try normalizing newlines
    const normalized = txt.replace(/\r\n/g, '\n');
    const normalizedOld = oldFn.replace(/\r\n/g, '\n');
    if (normalized.includes(normalizedOld)) {
        const result = normalized.replace(normalizedOld, newFn);
        fs.writeFileSync('admin-portal/admin.html', result);
        console.log('Success after normalizing');
    } else {
        console.log('Still not found. Dumping around line 8070...');
    }
}
