const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    const modalHTML = `
        <!-- ========================================== -->
        <!-- ADMIN PASSWORD CONFIRM MODAL -->
        <!-- ========================================== -->
        <div id="adminPasswordConfirmModal"
            style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:95000;align-items:center;justify-content:center;padding:16px;">
            <div style="background:var(--surface,#fff);border-radius:24px;width:100%;max-width:400px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);overflow:hidden;animation:modalIn 0.3s ease;">
                <div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:24px;position:relative;text-align:center;">
                    <h3 style="color:#fff;font-size:20px;font-weight:700;margin:0;" id="adminPasswordConfirmTitle">Confirm Action</h3>
                    <p style="color:rgba(255,255,255,0.9);font-size:13px;margin:4px 0 0;">Please enter your password to proceed.</p>
                </div>
                <div style="padding:24px;">
                    <div style="margin-bottom:20px;">
                        <label style="display:block;font-size:13px;font-weight:700;color:var(--text,#374151);margin-bottom:8px;">Admin Password</label>
                        <input type="password" id="adminPasswordConfirmInput" placeholder="••••••••" style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border,#d1d5db);background:var(--bg,#f9fafb);font-size:14px;color:var(--text,#111827);outline:none;transition:all 0.2s;">
                        <p id="adminPasswordConfirmError" style="display:none;color:#dc2626;font-size:12px;margin:8px 0 0;font-weight:600;">Incorrect password.</p>
                    </div>
                    <div style="display:flex;gap:12px;">
                        <button id="adminPasswordConfirmCancel" style="flex:1;padding:12px;background:var(--bg,#f3f4f6);border:1px solid var(--border,#e5e7eb);border-radius:12px;color:var(--text,#4b5563);font-size:14px;font-weight:700;cursor:pointer;">Cancel</button>
                        <button id="adminPasswordConfirmSubmit" style="flex:1;padding:12px;background:#dc2626;border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
`;

    if (!html.includes('adminPasswordConfirmModal')) {
        html = html.replace('<!-- USER SUSPENSION MODAL (ADMIN VIEW) -->', modalHTML + '\n        <!-- USER SUSPENSION MODAL (ADMIN VIEW) -->');
        fs.writeFileSync('admin.html', html);
        console.log('Injected modal HTML');
    } else {
        console.log('Modal HTML already injected');
    }
} catch(e) { console.error(e); }
