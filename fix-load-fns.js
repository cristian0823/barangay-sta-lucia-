const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// ── FIX 1: Replace loadConcerns direct render with pagination call ─────────────
// Find the sort block + direct render in loadConcerns (the REAL one at line ~6806)
const concernsOldBlock = `                    _allAdminConcerns = concerns;

                    if (!concerns.length) {
                        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af;"> No concerns submitted yet</td></tr>';
                        return;
                    }

                    // Sort: unread first, then by date (oldest first for FCFS)
                    concerns.sort((a, b) => {
                        const aUnread = a.is_read === false ? 0 : 1;
                        const bUnread = b.is_read === false ? 0 : 1;
                        if (aUnread !== bUnread) return aUnread - bUnread;
                        return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
                    });

                    const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        'in_progress': { bg: '#dbeafe', color: '#1e40af' },
                        'in-progress': { bg: '#dbeafe', color: '#1e40af' },
                        resolved: { bg: '#dcfce7', color: '#166534' },
                        closed: { bg: '#f1f5f9', color: '#475569' }
                    };

                    tbody.innerHTML = concerns.map(c => {
                        const sc = statusColors[c.status] || { bg: '#f1f5f9', color: '#374151' };
                        const badge = \`<span style="padding:4px 10px;border-radius:20px;font-size:12px;font-weight:700;background:\${sc.bg};color:\${sc.color};">\${c.status}</span>\`;
                        const submittedAt = c.createdAt || c.created_at ? new Date(c.createdAt || c.created_at).toLocaleString('en-US', {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : '';
                        const residentDisplay = \`<div style="line-height:1.2;"><strong>\${c.userName || ''}</strong><br><small style="color:#6b7280;font-size:11px;">\${submittedAt}</small></div>\`;
                        const date = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                        const responseNote = c.response ? \`<div style="margin-top:4px;font-size:11px;color:#059669;font-style:italic;"> Replied</div>\` : '';
                        const hasImage = c.description && c.description.includes('[ATTACHED_IMAGE_DATA]') || c.imageUrl;
                        const imgBadge = hasImage ? \`<span style="margin-left:6px;font-size:10px;background:#dbeafe;color:#1d4ed8;padding:2px 7px;border-radius:20px;font-weight:700;"> Photo</span>\` : '';
                        return \`<tr data-cid="\${c.id}" onclick="openConcernRespond(\${c.id})" style="cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='rgba(16,185,129,0.06)'" onmouseout="this.style.background=''">
                        <td>\${residentDisplay}</td>
                        <td>\${c.address || ''}</td>
                        <td>\${c.category || ''}</td>
                        <td>\${c.title || ''}\${responseNote}\${imgBadge}</td>
                        <td>\${date}</td>
                    </tr>\`;
                    }).join('');`;

const concernsNewBlock = `                    _allAdminConcerns = concerns;

                    // Sort: unread first, then by date (oldest first for FCFS)
                    concerns.sort((a, b) => {
                        const aUnread = a.is_read === false ? 0 : 1;
                        const bUnread = b.is_read === false ? 0 : 1;
                        if (aUnread !== bUnread) return aUnread - bUnread;
                        return new Date(a.created_at || a.createdAt || 0) - new Date(b.created_at || b.createdAt || 0);
                    });

                    _allConcernsList = concerns;
                    _concernsPage = 1;
                    renderConcernsPage();`;

if (html.includes(concernsOldBlock)) {
    html = html.replace(concernsOldBlock, concernsNewBlock);
    console.log('OK: loadConcerns patched');
} else {
    console.log('WARNING: loadConcerns block not found – trying CRLF variant');
    const crlf = concernsOldBlock.replace(/\n/g, '\r\n');
    if (html.includes(crlf)) {
        html = html.replace(crlf, concernsNewBlock);
        console.log('OK: loadConcerns patched (CRLF)');
    } else {
        console.log('FAILED: loadConcerns block could not be found');
    }
}

// ── FIX 2: Replace loadAdminBookings direct render with renderCourtPage call ──
const oldCourtBlock = `                empty.style.display = 'none';

                tbody.innerHTML = allBookings.map(b => {
                    const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        approved: { bg: '#dcfce7', color: '#166534' },
                        booked: { bg: '#dcfce7', color: '#166534' },
                        rejected: { bg: '#fee2e2', color: '#991b1b' },`;

const newCourtBlock = `                empty.style.display = 'none';
                _allCourtList = allBookings;
                _courtPage = 1;
                renderCourtPage();
                if (false) { const b0 = allBookings[0]; const statusColors = {
                        pending: { bg: '#fef9c3', color: '#854d0e' },
                        approved: { bg: '#dcfce7', color: '#166534' },
                        booked: { bg: '#dcfce7', color: '#166534' },
                        rejected: { bg: '#fee2e2', color: '#991b1b' },`;

// Count occurrences
const courtMatches = html.split(oldCourtBlock).length - 1;
console.log('Court booking block occurrences:', courtMatches);

if (courtMatches >= 1) {
    // Only replace the SECOND occurrence (the original loadAdminBookings, not the patch's)
    // Actually we want the one inside loadAdminBookings, which comes AFTER the early patch
    // We already patched the one earlier, so now we patch the remaining original
    const parts = html.split(oldCourtBlock);
    if (parts.length >= 3) {
        // There are 2+ occurrences - patch the second one (the original function)
        html = parts[0] + oldCourtBlock + parts.slice(1, parts.length - 1).join(oldCourtBlock) + newCourtBlock + parts[parts.length - 1];
        console.log('OK: loadAdminBookings patched (second occurrence)');
    } else {
        html = html.replace(oldCourtBlock, newCourtBlock);
        console.log('OK: loadAdminBookings patched (first/only occurrence)');
    }
} else {
    console.log('WARNING: court booking block not found');
}

// ── FIX 3: Replace loadMultipurposeBookings direct render with renderMpPage call
// Find the specific render inside loadMultipurposeBookings
const oldMpBlock = `                tbody.innerHTML = mpBookings.map(b => {
                    const sc = statusColors[b.status] || { bg: '#f1f5f9', color: '#374151' };`;

const newMpBlock = `                _allMpList = mpBookings;
                _mpPage = 1;
                renderMpPage();
                if (false) { const mpb = mpBookings[0]; const sc = statusColors[mpb && mpb.status] || { bg: '#f1f5f9', color: '#374151' };`;

const mpMatches = html.split(oldMpBlock).length - 1;
console.log('Multipurpose block occurrences:', mpMatches);

if (mpMatches >= 1) {
    // Replace the last occurrence (the real function body)
    const parts = html.split(oldMpBlock);
    html = parts.slice(0, parts.length - 1).join(oldMpBlock) + newMpBlock + parts[parts.length - 1];
    console.log('OK: loadMultipurposeBookings patched (last occurrence)');
} else {
    console.log('WARNING: multipurpose block not found');
}

// ── FIX 4: Replace loadUsers direct render with renderUsersPage call ──────────
const oldUsersBlock = `                if (emptyState) emptyState.style.display = 'none';
                tbody.innerHTML = users.map(u => {
                    const isSuspended = u.suspended_until && new Date(u.suspended_until) > new Date();
                    const statusBadge = isSuspended`;

const newUsersBlock = `                if (emptyState) emptyState.style.display = 'none';
                _allUsersList = users;
                _usersPage = 1;
                renderUsersPage();
                if (false) { const isSuspended = false; const statusBadge = isSuspended`;

const usersMatches = html.split(oldUsersBlock).length - 1;
console.log('Users block occurrences:', usersMatches);

if (usersMatches >= 1) {
    const parts = html.split(oldUsersBlock);
    html = parts.slice(0, parts.length - 1).join(oldUsersBlock) + newUsersBlock + parts[parts.length - 1];
    console.log('OK: loadUsers patched (last occurrence)');
} else {
    console.log('WARNING: users block not found');
}

fs.writeFileSync('admin.html', html);
console.log('\nAll done. Verifying...');

// Verify the real functions now call pagination
const verifyTerms = ['_allConcernsList = concerns', '_allCourtList = allBookings', '_allMpList = mpBookings', '_allUsersList = users'];
verifyTerms.forEach(t => console.log((html.includes(t) ? 'OK' : 'MISSING') + ': ' + t));
