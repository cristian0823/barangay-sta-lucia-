/**
 * Dark Mode Utility — Barangay Sta. Lucia
 * Applies [data-theme="dark"] to <html>, persists in localStorage.
 */

(function () {
    const STORAGE_KEY = 'barangay-theme';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);

        // Update all toggle buttons on the page
        document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
            const isDark = theme === 'dark';
            btn.innerHTML = isDark
                ? '<span style="font-size:18px;">☀️</span>'
                : '<span style="font-size:18px;">🌙</span>';
            btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        });
    }

    function toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY) || 'light';
        applyTheme(saved);
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose globally
    window.toggleDarkMode = toggle;
    window.initDarkMode = init;
})();
