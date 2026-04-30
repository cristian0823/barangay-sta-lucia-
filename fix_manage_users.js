const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    // Fix Table Header
    const headerOld = `                                        <tr>
                                            <th>Barangay ID</th>
                                            <th>Full Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Address</th>
                                        </tr>`;
    const headerNew = `                                        <tr>
                                            <th>Barangay ID</th>
                                            <th>Full Name</th>
                                            <th>Phone</th>
                                            <th>Email</th>
                                            <th>Address</th>
                                            <th>Status</th>
                                            <th style="text-align:center;">Actions</th>
                                        </tr>`;
    
    html = html.replace(headerOld, headerNew);

    // Fix Table Body in loadUsers
    const bodyOldRegex = /return `<tr>[\s\S]*?<td style="font-size:12px;font-weight:700;color:var\(--green-xl\);white-space:nowrap;">\$\{u\.barangay_id \|\| ''\}<\/td>[\s\S]*?<td style="white-space:nowrap;"><strong>\$\{displayName\}<\/strong><\/td>[\s\S]*?<td style="font-size:13px;">\$\{phone\}<\/td>[\s\S]*?<td style="font-size:13px;color:#6b7280;">\$\{u\.email \|\| ''\}<\/td>[\s\S]*?<td style="font-size:12px;">\$\{address\}<\/td>[\s\S]*?<\/tr>`;/m;

    const mapCodeToReplaceOld = `                    return \`<tr>
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">\${u.barangay_id || ''}</td>
                        <td style="white-space:nowrap;"><strong>\${displayName}</strong></td>
                        <td style="font-size:13px;">\${phone}</td>
                        <td style="font-size:13px;color:#6b7280;">\${u.email || ''}</td>
                        <td style="font-size:12px;">\${address}</td>
                    </tr>\`;`;

    const mapCodeToReplaceNew = `                    const actionHtml = isSuspended 
                        ? \`<button onclick="liftSuspension('\${u.id}', '\${displayName}')" class="btn btn-smaller" style="background:var(--green-xl);color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">Lift Ban</button>\`
                        : \`<button onclick="openSuspendModal('\${u.id}', '\${displayName}', \${u.offense_count || 0})" style="background:#f59e0b;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;margin-right:6px;">Suspend</button>
                           <button onclick="adminDeleteUserConfirm('\${u.id}', '\${displayName}')" style="background:#dc2626;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;">Delete</button>\`;
                    
                    return \`<tr>
                        <td style="font-size:12px;font-weight:700;color:var(--green-xl);white-space:nowrap;">\${u.barangay_id || ''}</td>
                        <td style="white-space:nowrap;"><strong>\${displayName}</strong></td>
                        <td style="font-size:13px;">\${phone}</td>
                        <td style="font-size:13px;color:#6b7280;">\${u.email || ''}</td>
                        <td style="font-size:12px;">\${address}</td>
                        <td>\${statusBadge}</td>
                        <td style="text-align:center; white-space:nowrap;">\${actionHtml}</td>
                    </tr>\`;`;

    if (html.includes(mapCodeToReplaceOld)) {
        html = html.replace(mapCodeToReplaceOld, mapCodeToReplaceNew);
        fs.writeFileSync('admin.html', html);
        console.log('Fixed usersTable to show Status and Actions columns');
    } else {
        console.log('Could not find exact match for table body rows.');
    }
} catch (e) {
    console.error(e);
}
