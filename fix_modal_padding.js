const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    // adminConcernModal
    html = html.replace(
        'padding:24px 28px; position:relative; flex-shrink:0;">\n                    <button onclick="closeAdminConcernModal()"',
        'padding:16px 20px; position:relative; flex-shrink:0;">\n                    <button onclick="closeAdminConcernModal()"'
    );
    html = html.replace('<div style="padding:24px 28px 0;">\n                    <div id="adminConcernDetailsDiv"></div>', '<div style="padding:16px 20px 0;">\n                    <div id="adminConcernDetailsDiv"></div>');
    html = html.replace('<div style="margin:8px 28px 0; border-top:2px dashed var(--border);"></div>', '<div style="margin:8px 20px 0; border-top:2px dashed var(--border);"></div>');
    html = html.replace('<div style="padding:16px 28px 28px;">\n                    <div style="margin-bottom:10px;">', '<div style="padding:12px 20px 20px;">\n                    <div style="margin-bottom:10px;">');

    // adminBookingModal
    html = html.replace(
        'padding:24px 28px; position:relative; flex-shrink:0;">\n                    <button onclick="closeAdminBookingModal()"',
        'padding:16px 20px; position:relative; flex-shrink:0;">\n                    <button onclick="closeAdminBookingModal()"'
    );
    html = html.replace('<div style="padding:24px 28px 0;">\n                    <div id="adminBookingDetailsDiv"></div>', '<div style="padding:16px 20px 0;">\n                    <div id="adminBookingDetailsDiv"></div>');
    html = html.replace('<div style="margin:8px 28px 0; border-top:2px dashed var(--border,#e5e7eb);"></div>', '<div style="margin:8px 20px 0; border-top:2px dashed var(--border,#e5e7eb);"></div>');
    html = html.replace('<div id="adminBookingActionsDiv" style="padding:20px 28px 28px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">', '<div id="adminBookingActionsDiv" style="padding:16px 20px 20px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">');

    // adminRequestModal
    html = html.replace(
        'padding:24px 28px; position:relative; flex-shrink:0;">\n                    <button onclick="closeAdminRequestModal()"',
        'padding:16px 20px; position:relative; flex-shrink:0;">\n                    <button onclick="closeAdminRequestModal()"'
    );
    html = html.replace('<div style="padding:24px 28px 0;">\n                    <div id="adminRequestDetailsDiv"></div>', '<div style="padding:16px 20px 0;">\n                    <div id="adminRequestDetailsDiv"></div>');
    html = html.replace('<div id="adminRequestActionsDiv" style="padding:20px 28px 28px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">', '<div id="adminRequestActionsDiv" style="padding:16px 20px 20px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">');

    // For the grids in JS inside openRequestRespond:
    html = html.replace(/<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">/g, '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">');
    html = html.replace(/<div style="background:var\(--panel-bg,#f9fafb\); border-radius:10px; padding:12px; border:1px solid var\(--border\);">/g, '<div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:10px; border:1px solid var(--border);">');
    
    html = html.replace(/<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">/g, '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">');
    
    html = html.replace(/<div style="margin-bottom:16px;background:var\(--panel-bg,#f9fafb\); border-radius:10px; padding:14px; border:1px solid var\(--border\);">/g, '<div style="margin-bottom:12px;background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border);">');
    
    html = html.replace(/<div style="background:var\(--panel-bg,#f9fafb\); border-radius:10px; padding:14px; border:1px solid var\(--border-color,#e5e7eb\); margin-bottom:16px;">/g, '<div style="background:var(--panel-bg,#f9fafb); border-radius:10px; padding:12px; border:1px solid var(--border); margin-bottom:12px;">');

    // And for the modal container itself
    html = html.replace(/max-height:92vh; overflow-y:auto;/g, 'max-height:90vh; overflow-y:auto; overflow-x:hidden;');

    fs.writeFileSync('admin.html', html);
    console.log('Fixed modal padding.');
} catch (e) {
    console.error(e);
}
