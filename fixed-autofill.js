const fs = require('fs');
let h = fs.readFileSync('user-dashboard.html', 'utf8');

// We know the exact string to inject for fetchFullProfileData
const injectionString = `        async function fetchFullProfileData() {
            try {
                const { data, error } = await supabase.from('users').select('*').eq('username', user.username).maybeSingle();
                if (data) {
                    user.email = data.email || '';
                    user.phone = data.phone || data.contact_number || '';
                    user.address = data.address || '';
                    user.name = data.full_name || data.fullName || data.name || '';
                    window.user = user;
                }
            } catch(e) { console.error('Error hydrating user details', e); }
        }

        async function loadProfilePanel() {
            await fetchFullProfileData();
            if (document.getElementById('p-fullName')) document.getElementById('p-fullName').value = user.name || '';
            if (document.getElementById('p-email')) document.getElementById('p-email').value = user.email || '';
            if (document.getElementById('p-phone')) document.getElementById('p-phone').value = user.phone || '';
            if (document.getElementById('p-address')) document.getElementById('p-address').value = user.address || '';
        }
`;

// Inject before async function loadSettingsView() {
const sIdx = h.indexOf('async function loadSettingsView() {');
if (sIdx > -1) {
    if (!h.includes('fetchFullProfileData')) {
        h = h.substring(0, sIdx) + injectionString + '\n' + h.substring(sIdx);
    }
}

// 2. Inject into openBorrowModalWithEquip
const borrowIdx = h.indexOf("document.getElementById('borrowerFullName').value");
if (borrowIdx > -1) {
    const borrowReplacement = `            // Ensure we have hydrated data
            if (!user.phone) await fetchFullProfileData();
            document.getElementById('borrowerFullName').value = user.name || '';
            document.getElementById('borrowerContact').value = user.phone || '';
            if (document.getElementById('borrowerAddress')) document.getElementById('borrowerAddress').value = user.address || '';
`;
    // Find where document.getElementById('borrowerContact').value = ''; ends
    const endContactIdx = h.indexOf("document.getElementById('borrowerContact').value = '';");
    if (endContactIdx > -1) {
        h = h.substring(0, borrowIdx) + borrowReplacement + h.substring(endContactIdx + 56);
    }
}

// 3. Trigger loadProfilePanel when 'profile' is selected
const historyTriggerIdx = h.indexOf("if (panelId === 'history') loadHistoryView();");
if (historyTriggerIdx > -1) {
    if (!h.includes("if (panelId === 'profile') loadProfilePanel();")) {
        h = h.substring(0, historyTriggerIdx + 45) + "\n            if (panelId === 'profile') loadProfilePanel();" + h.substring(historyTriggerIdx + 45);
    }
}

fs.writeFileSync('user-dashboard.html', h);
console.log('Fixed missing replace execution by utilizing programmatic Index positioning.');
