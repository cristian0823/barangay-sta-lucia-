
    (function() {
        function _getUser() {
            try {
                var u = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
                return u ? JSON.parse(u) : null;
            } catch(e) { return null; }
        }
        var user = _getUser();
        if (!user) {
            window.location.replace('login.html');
        } else if (user.role === 'admin') {
            // Admins should not be here — send to admin dashboard
            window.location.replace('admin.html');
        } else {
            // Valid user — reveal the page immediately
            document.getElementById('auth-guard-style').textContent = '';
        }
    })();
    