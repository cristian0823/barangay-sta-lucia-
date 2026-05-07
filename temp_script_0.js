
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
        } else if (user.role !== 'admin') {
            window.location.replace('login.html');
        } else {
            // Valid admin — reveal the page immediately
            document.getElementById('auth-guard-style').textContent = '';
        }
    })();
    