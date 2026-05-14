
var _userDetailMap = {};
function openUserDetailPanel(row) {
    var uid = row.getAttribute('data-uid');
    var u = _userDetailMap[uid];
    if (!u) return;
    var b = document.getElementById('userDetailBody');
    if (!b) return;
    var name = u.fullName || u.full_name || u.username || '—';
    var initials = name.split(' ').map(function(w){return w[0]||'';}).slice(0,2).join('').toUpperCase() || 'U';
    var statusHtml = (u.suspended_until && new Date(u.suspended_until) > new Date())
        ? '<span style="background:#FEE2E2;color:#991B1B;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Suspended</span>'
        : '<span style="background:#d1fae5;color:#059669;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Active</span>';
    var createdAt = u.created_at ? new Date(u.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}) : '—';
    var lastLogin = u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
    function infoRow(label, val) {
        return '<div style="margin-bottom:16px;">'
            + '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B7280;margin-bottom:4px;">'+label+'</div>'
            + '<div style="font-size:14px;color:#0f1f3d;font-weight:500;word-break:break-word;">'+(val||'<span style=\'color:#9ca3af;font-style:italic;\'>Not provided</span>')+'</div>'
            + '</div>';
    }
    b.innerHTML = '<div style="text-align:center;margin-bottom:24px;">'
        + '<div style="width:64px;height:64px;background:#1A3A6B;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:800;color:#fff;">'+initials+'</div>'
        + '<div style="font-size:18px;font-weight:700;color:#0f1f3d;margin-bottom:4px;">'+name+'</div>'
        + statusHtml
        + '</div>'
        + '<hr style="border:none;border-top:1px solid #e5e7eb;margin-bottom:20px;">'
        + infoRow('Barangay ID', u.barangay_id)
        + infoRow('Full Name', name)
        + infoRow('Phone', u.phone || u.contact_number)
        + infoRow('Email', u.email)
        + infoRow('Address', u.address)
        + infoRow('Role', u.role ? u.role.charAt(0).toUpperCase()+u.role.slice(1) : null)
        + infoRow('2FA Enabled', u.totp_enabled === true ? '✔ Enabled' : u.totp_enabled === false ? '✘ Disabled' : '—')
        + infoRow('Date Registered', createdAt)
        + infoRow('Last Login', lastLogin);
    var panel = document.getElementById('userDetailPanel');
    var overlay = document.getElementById('userDetailOverlay');
    panel.style.display = 'flex';
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
function closeUserDetailPanel() {
    var panel = document.getElementById('userDetailPanel');
    var overlay = document.getElementById('userDetailOverlay');
    if (panel) panel.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
}
        