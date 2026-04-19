const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. Update Profile loading to point to the new Profile form IDs and dynamically fetch from Supabase
const settingsViewTarget = `async function loadSettingsView() {
            // Fill profile fields
            document.getElementById('s-fullName').value = user.full_name || user.fullName || user.name || '';
            document.getElementById('s-email').value = user.email || '';
            document.getElementById('s-username').value = user.username || '';
            document.getElementById('s-phone').value = user.contact_number || user.phone || '';
            document.getElementById('s-address').value = user.address || '';`;

const settingsViewReplacement = `async function fetchFullProfileData() {
            try {
                const { data, error } = await supabase.from('users').select('*').eq('username', user.username).maybeSingle();
                if (data) {
                    user.email = data.email;
                    user.contact_number = data.contact_number;
                    user.address = data.address;
                    user.full_name = data.full_name || data.name;
                    // Also store globally for other panels
                    window.user = user;
                }
            } catch(e) { console.error('Error hydrating user details', e); }
        }

        async function loadProfilePanel() {
            await fetchFullProfileData();
            if (document.getElementById('p-fullName')) document.getElementById('p-fullName').value = user.full_name || user.name || '';
            if (document.getElementById('p-email')) document.getElementById('p-email').value = user.email || '';
            if (document.getElementById('p-phone')) document.getElementById('p-phone').value = user.contact_number || user.phone || '';
            if (document.getElementById('p-address')) document.getElementById('p-address').value = user.address || '';
        }

        async function loadSettingsView() {
            // Trigger profile data load for the standalone panel since they technically coexist now
            loadProfilePanel();`;

if (h.includes('document.getElementById(\'s-username\').value = user.username || \'\';')) {
    h = h.replace(settingsViewTarget, settingsViewReplacement);
}

// Ensure `showPanel('profile')` logic triggers `loadProfilePanel()` correctly
const showPanelTarget = `            if (panelId === 'history') loadHistoryView();

            switch (panelId) {`;

const showPanelReplacement = `            if (panelId === 'history') loadHistoryView();
            if (panelId === 'profile') loadProfilePanel();

            switch (panelId) {`;
h = h.replace(showPanelTarget, showPanelReplacement);

// 2. Update Equipment Borrowing logic to auto-fill contact number and address natively
const borrowModalTarget = `            document.getElementById('borrowerFullName').value = user.name || '';
            document.getElementById('borrowerContact').value = '';`;
const borrowModalReplacement = `            // Ensure we have hydrated data
            if (!user.contact_number) await fetchFullProfileData();
            document.getElementById('borrowerFullName').value = user.full_name || user.name || '';
            document.getElementById('borrowerContact').value = user.contact_number || user.phone || '';
            if (document.getElementById('borrowerAddress')) document.getElementById('borrowerAddress').value = user.address || '';`;
h = h.replace(borrowModalTarget, borrowModalReplacement);

fs.writeFileSync('user-dashboard.html', h);
console.log('Autofill configuration added and hydrated from database successfully.');
