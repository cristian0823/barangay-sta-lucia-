/**
 * Dark Mode — DISABLED for Barangay Sta. Lucia Admin Portal
 * Light theme is enforced permanently. Dark mode has been removed.
 */
(function () {
    const STORAGE_KEY = 'barangay-theme';

    // Always force light theme regardless of saved preference
    localStorage.setItem(STORAGE_KEY, 'light');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'light');

    // No-op stubs so existing onclick="toggleDarkMode()" calls don't throw
    window.toggleDarkMode = function () {};
    window.initDarkMode   = function () {};
})();
