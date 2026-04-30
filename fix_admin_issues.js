const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    // Fix 1: Replace var(--text-main) with var(--text) in the equipment request rendering
    html = html.replace(/var\(--text-main\s*(?:,\s*#[0-9a-fA-F]+)?\)/g, 'var(--text)');
    html = html.replace(/var\(--text-muted\s*(?:,\s*#[0-9a-fA-F]+)?\)/g, 'var(--muted)');
    html = html.replace(/var\(--border-color\s*(?:,\s*#[0-9a-fA-F]+)?\)/g, 'var(--border)');

    // Fix 2: Prevent flickering in loadAdminBookings
    const badLogic = `            async function loadAdminBookings() {
                const tbody = document.getElementById('courtBookingsTable');
                const empty = document.getElementById('noCourtBookings');
                tbody.innerHTML = '';

                let allBookings = await getCourtBookings();`;
                
    const goodLogic = `            async function loadAdminBookings() {
                const tbody = document.getElementById('courtBookingsTable');
                const empty = document.getElementById('noCourtBookings');
                
                let allBookings = await getCourtBookings();
                if (!tbody) return;
                tbody.innerHTML = '';`;

    html = html.replace(badLogic, goodLogic);

    fs.writeFileSync('admin.html', html);
    console.log('Fixed admin.html issues.');
} catch (e) {
    console.error(e);
}
