const fs = require('fs');
const file = 'admin-portal/admin.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add search bar HTML to Manage Users
const oldHTML = `<div class="section-content">
                            <div class="admin-tables">`;

const newHTML = `<div class="section-content">
                            <div style="display:flex; justify-content:flex-end; padding:0 0 16px 0;">
                                <div style="position:relative; max-width:250px; width:100%;">
                                    <i class="bi bi-search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--muted);"></i>
                                    <input type="text" id="userFilterSearch" placeholder="Search residents..." oninput="applyUserFilter()" style="width:100%; padding:8px 12px 8px 36px; border-radius:8px; border:1px solid var(--border); outline:none; background:var(--bg); color:var(--text);">
                                </div>
                            </div>
                            <div class="admin-tables">`;

content = content.replace(oldHTML, newHTML);

// 2. Add applyUserFilter and replace renderUsersPagePg
const oldJS1 = `// ── Users ─────────────────────────────────────────────────────────
            function gotoUsersPage(p) { _pgUsersPage = p; renderUsersPagePg(); }
            function renderUsersPagePg() {
                const tbody = document.getElementById('usersTable');
                const empty = document.getElementById('noUsers');
                if (!tbody) return;
                if (!_pgUsersList.length) { tbody.innerHTML = ''; if(empty) empty.style.display='block'; const pg=document.getElementById('usersPg'); if(pg) pg.style.display='none'; return; }
                if(empty) empty.style.display='none';
                const slice = _pgUsersList.slice((_pgUsersPage-1)*PG_SIZE, _pgUsersPage*PG_SIZE);
                tbody.innerHTML = slice.map(u => {
                    const n = u.fullName||u.full_name||u.username||'';
                    const ph = u.phone||u.contact_number||u.contactNumber||'';
                    return '<tr><td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">'+(u.barangay_id||'')+'</td>'
                        +'<td style="white-space:nowrap;"><strong>'+n+'</strong></td>'
                        +'<td style="font-size:13px;">'+ph+'</td>'
                        +'<td style="font-size:13px;color:#6b7280;">'+(u.email||'')+'</td>'
                        +'<td style="font-size:12px;">'+(u.address||'')+'</td></tr>';
                }).join('');
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');
            }`;

const newJS1 = `// ── Users ─────────────────────────────────────────────────────────
            let _allUsersList = [];
            function applyUserFilter() {
                const searchTxt = (document.getElementById('userFilterSearch')?.value||'').toLowerCase();
                _pgUsersList = _allUsersList.filter(u => {
                    if(!searchTxt) return true;
                    const name = (u.fullName || u.full_name || u.username || '').toLowerCase();
                    const bgy = (u.barangay_id || '').toLowerCase();
                    const em = (u.email || '').toLowerCase();
                    return name.includes(searchTxt) || bgy.includes(searchTxt) || em.includes(searchTxt);
                });
                _pgUsersPage = 1;
                renderUsersPagePg();
            }
            function gotoUsersPage(p) { _pgUsersPage = p; renderUsersPagePg(); }
            function renderUsersPagePg() {
                const tbody = document.getElementById('usersTable');
                const empty = document.getElementById('noUsers');
                if (!tbody) return;
                if (!_pgUsersList.length) { 
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:#9ca3af;">No users found</td></tr>'; 
                    if(empty) empty.style.display='none'; 
                    const pg=document.getElementById('usersPg'); if(pg) pg.style.display='none'; 
                    return; 
                }
                if(empty) empty.style.display='none';
                
                const slice = _pgUsersList.slice((_pgUsersPage-1)*PG_SIZE, _pgUsersPage*PG_SIZE);
                tbody.innerHTML = slice.map(u => {
                    const isSuspended = u.suspended_until && new Date(u.suspended_until) > new Date();
                    const statusBadge = isSuspended
                        ? '<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;">Suspended</span>'
                        : '<span style="background:#d1fae5;color:#059669;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;">Active</span>';
                    const displayName = u.fullName || u.full_name || u.username;
                    const phone = u.phone || u.contact_number || u.contactNumber || '';
                    const address = u.address || '';
                    const actionHtml = isSuspended 
                        ? \`<button onclick="liftSuspension('\${u.id}', '\${displayName}')" style="background:var(--green-xl);color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">Lift Ban</button>\`
                        : \`<button onclick="openSuspendModal('\${u.id}', '\${displayName}', \${u.offense_count || 0})" style="background:#f59e0b;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;margin-right:4px;">Suspend</button>
                           <button onclick="adminDeleteUserConfirm('\${u.id}', '\${displayName}')" style="background:#dc2626;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">Delete</button>\`;

                    return \`<tr>
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">\${u.barangay_id || ''}</td>
                        <td style="font-size:13px;line-height:1.2;"><strong>\${displayName}</strong></td>
                        <td style="font-size:12px;white-space:nowrap;">\${phone}</td>
                        <td style="font-size:12px;color:#6b7280;max-width:160px;word-break:break-word;line-height:1.2;">\${u.email || ''}</td>
                        <td style="font-size:12px;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${address}">\${address}</td>
                        <td style="white-space:nowrap;">\${statusBadge}</td>
                        <td style="text-align:center; white-space:nowrap;">\${actionHtml}</td>
                    </tr>\`;
                }).join('');
                
                const pg = document.getElementById('usersPg');
                if (pg) pg.style.display = _pgUsersList.length > PG_SIZE ? 'flex' : 'none';
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');
            }`;

content = content.replace(oldJS1, newJS1);

// 3. Update loadUsers to use applyUserFilter
const oldJS2 = `async function loadUsers() {
                const tbody = document.getElementById('usersTable');
                const emptyState = document.getElementById('noUsers');
                if (!tbody) return;
                tbody.innerHTML = '';
                let users = await getAllUsers();
                users = users.filter(u => u.role !== 'admin');

                if (users.length === 0) {
                    tbody.innerHTML = '';
                    if (emptyState) emptyState.style.display = 'block';
                    return;
                }
                if (emptyState) emptyState.style.display = 'none';
                _pgUsersList = users;
                _pgUsersPage = 1;
                tbody.innerHTML = users.map(u => {
                    const isSuspended = u.suspended_until && new Date(u.suspended_until) > new Date();
                    const statusBadge = isSuspended
                        ? '<span style="background:#fee2e2;color:#dc2626;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;">Suspended</span>'
                        : '<span style="background:#d1fae5;color:#059669;padding:3px 10px;border-radius:50px;font-size:11px;font-weight:600;">Active</span>';
                    const displayName = u.fullName || u.full_name || u.username;
                    const phone = u.phone || u.contact_number || u.contactNumber || '';
                    const address = u.address || '';
                    const actionHtml = isSuspended 
                        ? \`<button onclick="liftSuspension('\${u.id}', '\${displayName}')" style="background:var(--green-xl);color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">Lift Ban</button>\`
                        : \`<button onclick="openSuspendModal('\${u.id}', '\${displayName}', \${u.offense_count || 0})" style="background:#f59e0b;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;margin-right:4px;">Suspend</button>
                           <button onclick="adminDeleteUserConfirm('\${u.id}', '\${displayName}')" style="background:#dc2626;color:#fff;border:none;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">Delete</button>\`;

                    return \`<tr>
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">\${u.barangay_id || ''}</td>
                        <td style="font-size:13px;line-height:1.2;"><strong>\${displayName}</strong></td>
                        <td style="font-size:12px;white-space:nowrap;">\${phone}</td>
                        <td style="font-size:12px;color:#6b7280;max-width:160px;word-break:break-word;line-height:1.2;">\${u.email || ''}</td>
                        <td style="font-size:12px;max-width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="\${address}">\${address}</td>
                        <td style="white-space:nowrap;">\${statusBadge}</td>
                        <td style="text-align:center; white-space:nowrap;">\${actionHtml}</td>
                    </tr>\`;
                }).join('');
                renderPg('usersPg', _pgUsersList.length, PG_SIZE, _pgUsersPage, 'gotoUsersPage');
            }`;

const newJS2 = `async function loadUsers() {
                const tbody = document.getElementById('usersTable');
                if (!tbody) return;
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;">Loading users...</td></tr>';
                let users = await getAllUsers();
                _allUsersList = users.filter(u => u.role !== 'admin');
                applyUserFilter();
            }`;

content = content.replace(oldJS2, newJS2);

fs.writeFileSync(file, content);
console.log('Patched admin.html');
