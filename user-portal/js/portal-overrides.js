/**
 * portal-overrides.js
 * Loaded AFTER app.js — patches cross-site redirect functions.
 * No need to edit this file; update portal-config.js with the correct URLs.
 */
(function () {
    var adminBase = (window.__ADMIN_PORTAL_URL__ || '').replace(/\/$/, '');
    var userBase  = (window.__USER_PORTAL_URL__  || '').replace(/\/$/, '');

    // Patch: redirectToDashboard
    window.redirectToDashboard = function () {
        var user = getCurrentUser();
        if (!user) { window.location.href = 'login.html'; return; }
        if (user.role === 'admin') {
            window.location.href = adminBase ? adminBase + '/admin.html' : 'admin.html';
        } else {
            window.location.href = userBase ? userBase + '/user-dashboard.html' : 'user-dashboard.html';
        }
    };

    // Patch: requireAdmin — redirect regular users to user portal
    window.requireAdmin = function () {
        var user = getCurrentUser();
        if (!user) { window.location.replace('login.html'); return false; }
        if (user.role !== 'admin') {
            window.location.replace(userBase ? userBase + '/login.html' : 'login.html');
            return false;
        }
        return true;
    };

    // Patch: requireUser — redirect admins to admin portal
    window.requireUser = function () {
        var user = getCurrentUser();
        if (!user) { window.location.replace('login.html'); return false; }
        if (user.role === 'admin') {
            window.location.replace(adminBase ? adminBase + '/admin.html' : 'admin.html');
            return false;
        }
        return true;
    };

    // Patch: logoutUser — always land on login of current portal
    window.logoutUser = async function () {
        var _curr = getCurrentUser();
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
        try {
            if (_curr) window.logSecurity('Logout', 'N/A', 'info', (_curr.username || 'User') + ' logged out', _curr.username || null);
            if (window.supabase) window.supabase.auth.signOut().catch(function(){});
        } catch(e) {}
    };
})();
