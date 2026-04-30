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

    const scriptLogic = `
            async function verifyAdminPassword(password) {
                const u = getCurrentUser();
                if (!u) return false;
                
                if (await isSupabaseAvailable()) {
                    const emailToUse = u.email || (u.user_metadata && u.user_metadata.email);
                    if (!emailToUse) return false;
                    
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email: emailToUse,
                        password: password
                    });
                    return !error;
                } else {
                    const users = JSON.parse(localStorage.getItem('barangay_local_users')) || [];
                    const admin = users.find(x => x.username === u.username && x.password === password);
                    return !!admin;
                }
            }

            function requestAdminPassword(actionName) {
                return new Promise((resolve) => {
                    const modal = document.getElementById('adminPasswordConfirmModal');
                    const input = document.getElementById('adminPasswordConfirmInput');
                    const title = document.getElementById('adminPasswordConfirmTitle');
                    const errorMsg = document.getElementById('adminPasswordConfirmError');
                    
                    title.textContent = \`Confirm \${actionName}\`;
                    input.value = '';
                    errorMsg.style.display = 'none';
                    modal.style.display = 'flex';
                    input.focus();
                    
                    const closeAndResolve = (res) => {
                        modal.style.display = 'none';
                        resolve(res);
                    };

                    document.getElementById('adminPasswordConfirmCancel').onclick = () => closeAndResolve(false);
                    
                    document.getElementById('adminPasswordConfirmSubmit').onclick = async () => {
                        const pwd = input.value;
                        if (!pwd) {
                            errorMsg.textContent = 'Password is required';
                            errorMsg.style.display = 'block';
                            return;
                        }
                        
                        const btn = document.getElementById('adminPasswordConfirmSubmit');
                        const originalText = btn.textContent;
                        btn.textContent = 'Verifying...';
                        btn.disabled = true;
                        
                        const isValid = await verifyAdminPassword(pwd);
                        
                        btn.textContent = originalText;
                        btn.disabled = false;
                        
                        if (isValid) {
                            closeAndResolve(true);
                        } else {
                            errorMsg.textContent = 'Incorrect password. Action denied.';
                            errorMsg.style.display = 'block';
                        }
                    };
                });
            }
`;

    if (!html.includes('adminPasswordConfirmModal')) {
        // Insert Modal HTML before <!-- User View Modal -->
        html = html.replace('<!-- User View Modal -->', modalHTML + '\n        <!-- User View Modal -->');
        
        // Insert JS Logic right before closeSuspendModal()
        html = html.replace('function closeSuspendModal() {', scriptLogic + '\n            function closeSuspendModal() {');
    }

    const suspendOld = `            async function confirmSuspendUser() {
                if (!currentSuspendUserId) return;
                
                const tier = parseInt(document.getElementById('suspendPenaltyTier').value);
                let days = 7;
                if (tier === 2) days = 14;
                if (tier === 3) days = 30;
                
                if (tier === 4) {
                    await adminDeleteUserConfirm(currentSuspendUserId, document.getElementById('suspendModalUsername').textContent);
                    return;
                }

                const conf = await showConfirmModal(\`Suspend \${document.getElementById('suspendModalUsername').textContent} for \${days} days?\`, 'Confirm Suspension', 'Yes, Suspend', 'Cancel', 'warning');
                if (!conf) return;

                document.getElementById('adminSuspendUserModal').style.display = 'none';
                const result = await suspendUser(currentSuspendUserId, days);
                if (result.success) {
                    showAlert('User suspended successfully.', 'success');
                    await loadUsers();
                } else {
                    showAlert('Failed to suspend user: ' + result.message, 'error');
                }
            }`;

    const suspendNew = `            async function confirmSuspendUser() {
                if (!currentSuspendUserId) return;
                
                const tier = parseInt(document.getElementById('suspendPenaltyTier').value);
                let days = 7;
                if (tier === 2) days = 14;
                if (tier === 3) days = 30;
                
                if (tier === 4) {
                    await adminDeleteUserConfirm(currentSuspendUserId, document.getElementById('suspendModalUsername').textContent);
                    return;
                }

                const conf = await showConfirmModal(\`Suspend \${document.getElementById('suspendModalUsername').textContent} for \${days} days?\`, 'Confirm Suspension', 'Yes, Suspend', 'Cancel', 'warning');
                if (!conf) return;
                
                document.getElementById('adminSuspendUserModal').style.display = 'none';

                // Prompt for admin password
                const pwdConfirmed = await requestAdminPassword('Suspension');
                if (!pwdConfirmed) {
                    showAlert('Suspension cancelled.', 'info');
                    return;
                }

                const result = await suspendUser(currentSuspendUserId, days);
                if (result.success) {
                    showAlert('User suspended successfully.', 'success');
                    await loadUsers();
                } else {
                    showAlert('Failed to suspend user: ' + result.message, 'error');
                }
            }`;

    html = html.replace(suspendOld, suspendNew);

    const delOld = `            async function adminDeleteUserConfirm(userId, userName) {
                const conf = await showConfirmModal(\`Are you absolutely sure you want to delete \${userName}? This cannot be undone.\`, 'Delete User', 'Yes, Delete', 'Cancel', 'warning');
                if (conf) {
                    const res = await deleteUser(userId);
                    if (res.success) {
                        showAlert('User deleted successfully', 'success');
                        await loadUsers();
                    } else {
                        showAlert('Error deleting user: ' + res.message, 'error');
                    }
                }
            }`;

    const delNew = `            async function adminDeleteUserConfirm(userId, userName) {
                const conf = await showConfirmModal(\`Are you absolutely sure you want to delete \${userName}? This cannot be undone.\`, 'Delete User', 'Yes, Delete', 'Cancel', 'warning');
                if (conf) {
                    const suspendModal = document.getElementById('adminSuspendUserModal');
                    if (suspendModal) suspendModal.style.display = 'none';
                    
                    // Prompt for admin password
                    const pwdConfirmed = await requestAdminPassword('Account Deletion');
                    if (!pwdConfirmed) {
                        showAlert('Account deletion cancelled.', 'info');
                        return;
                    }

                    const res = await deleteUser(userId);
                    if (res.success) {
                        showAlert('User deleted successfully', 'success');
                        await loadUsers();
                    } else {
                        showAlert('Error deleting user: ' + res.message, 'error');
                    }
                }
            }`;

    html = html.replace(delOld, delNew);

    fs.writeFileSync('admin.html', html);
    console.log('Fixed admin.html with password verification logic');
} catch (e) {
    console.error(e);
}
