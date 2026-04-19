const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('admin.html', 'utf8');

const mockJs = `
  <script>
    function requireAuth() { return true; }
    function requireAdmin() { return true; }
    function getCurrentUser() { return { fullName: 'Admin' }; }
    function autoCompleteExpiredBookings() { return true; }
    async function loadOverview() { console.log('loadOverview started'); }
    async function loadCourtBookings() { }
    async function loadRequests() { }
    async function loadConcerns() { }
    async function loadEvents() { }
    async function loadEquipment() { }
    async function renderAdminCalendar() { }
    async function loadAdminNotifications() { }
    async function loadSystemStatsForProfile() { }
    const supabase = { from: () => ({ select: () => ({ error: null, data: [] })}) };
  </script>
`;

const fullHtml = html.replace('</head>', mockJs + '</head>');

const dom = new JSDOM(fullHtml, { runScripts: 'dangerously', url: 'http://localhost/admin.html' });
dom.window.addEventListener('error', event => {
    console.error('RUNTIME ERROR:', event.error.message || event.error);
});
dom.window.document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Loaded successfully');
});
setTimeout(() => {
    console.log('welcomeTime text:', dom.window.document.getElementById('welcomeTime')?.textContent);
    console.log('welcomeDateStr text:', dom.window.document.getElementById('welcomeDateStr')?.textContent);
}, 2000);
