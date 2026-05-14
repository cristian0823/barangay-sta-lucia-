const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0, 80))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}

// ── 1. Remove inline borrowRulesSection block from form ──────────────────────
const rulesBlockStart = c.indexOf('\n                        <!-- Borrowing Rules Agreement — TOP of form -->');
const rulesBlockEnd   = c.indexOf('\n                        <!-- User Info Fields -->');
if (rulesBlockStart !== -1 && rulesBlockEnd !== -1) {
    c = c.substring(0, rulesBlockStart) + c.substring(rulesBlockEnd);
    changes++;
    console.log('Removed inline borrowRulesSection');
} else {
    console.log('MISS: inline rules block', rulesBlockStart, rulesBlockEnd);
}

// ── 2. Remove submitBorrowBtn's disabled attribute + change button label ─────
rep(
    '<button type="submit" id="submitBorrowBtn" disabled class="w-full mt-2 bg-gradient-to-r from-slate-500 to-emerald-600 hover:from-slate-50 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 bo',
    '<button type="submit" id="submitBorrowBtn" class="w-full mt-2 bg-gradient-to-r from-slate-500 to-emerald-600 hover:from-slate-50 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 bo'
);

// ── 3. Add Terms & Conditions modal to DOM (before BORROW MODAL comment) ────
const TERMS_MODAL = `<!-- TERMS & CONDITIONS MODAL -->
    <div id="borrowTermsModal" style="display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:16px;">
        <div style="background:#fff;border-radius:18px;width:100%;max-width:500px;box-shadow:0 24px 64px rgba(0,0,0,0.25);overflow:hidden;display:flex;flex-direction:column;max-height:90vh;" class="dark:bg-gray-800">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0f1f3d,#1e3a5f);padding:20px 24px;display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;background:rgba(255,255,255,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    <i class="bi bi-journal-check" style="color:#fff;font-size:20px;"></i>
                </div>
                <div>
                    <div style="font-size:16px;font-weight:800;color:#fff;line-height:1.2;">Borrowing Terms &amp; Conditions</div>
                    <div style="font-size:11px;color:rgba(255,255,255,0.65);margin-top:2px;">Please read carefully before proceeding</div>
                </div>
            </div>
            <!-- Scroll hint -->
            <div id="termsScrollHint" style="background:#fef9c3;border-bottom:1px solid #fde68a;padding:8px 20px;display:flex;align-items:center;gap:7px;font-size:12px;color:#92400e;font-weight:600;">
                <i class="bi bi-arrow-down-circle-fill" style="font-size:14px;flex-shrink:0;"></i>
                Scroll down to read all terms before you can proceed
            </div>
            <!-- Scrollable content -->
            <div id="termsRulesContent" style="padding:16px 20px;height:250px;overflow-y:auto;font-size:13px;color:#374151;line-height:1.7;flex-shrink:0;">
                <!-- filled by JS -->
            </div>
            <!-- Footer -->
            <div style="padding:16px 20px;border-top:1px solid #e2e8f0;display:flex;gap:10px;background:#f8fafc;flex-shrink:0;">
                <button onclick="closeTermsModal()" style="flex:1;padding:11px;border-radius:10px;border:1.5px solid #D1D5DB;background:#fff;color:#374151;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;"
                    onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='#fff'">
                    Cancel
                </button>
                <button id="termsAgreeBtn" onclick="agreeAndSubmitBorrow()" disabled
                    style="flex:2;padding:11px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:not-allowed;font-family:inherit;background:#9CA3AF;color:#fff;transition:all 0.2s;opacity:0.7;">
                    <i class="bi bi-check-circle-fill" style="margin-right:6px;"></i>I Agree &amp; Proceed
                </button>
            </div>
        </div>
    </div>

`;

rep('<!-- BORROW MODAL -->', TERMS_MODAL + '<!-- BORROW MODAL -->');

// ── 4. Update form submit to show terms modal instead of submitting ───────────
// The form's submit event should now intercept and show the terms modal
// The actual submission logic stays the same but gets called from agreeAndSubmitBorrow()
const OLD_SUBMIT_START = `document.getElementById('borrowForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            const equipId = parseInt(document.getElementById('borrowEquipmentId').value);`;

const NEW_SUBMIT_START = `document.getElementById('borrowForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            // Show Terms & Conditions modal instead of submitting directly
            await showBorrowTermsModal();
        });

        async function _doSubmitBorrowRequest() {
            const equipId = parseInt(document.getElementById('borrowEquipmentId').value);`;

rep(OLD_SUBMIT_START, NEW_SUBMIT_START);

// Rename the function body's "this.querySelector" to use the form element directly
rep(
    `const btn = this.querySelector('button[type="submit"]');`,
    `const btn = document.getElementById('submitBorrowBtn');`
);

// Close the new _doSubmitBorrowRequest function — find its end
// The old listener ended with `});` after btn.innerHTML line. Now we need to close with just `}`
rep(
    `btn.disabled = false; btn.innerHTML = ' Submit Borrow Request';\n        });`,
    `btn.disabled = false; btn.innerHTML = '<i class="bi bi-send-fill" style="margin-right:6px;"></i>Submit Borrow Request';\n        }`
);

// ── 5. Add Terms modal JS functions ─────────────────────────────────────────
const TERMS_FUNCTIONS = `
        // ── TERMS & CONDITIONS MODAL ──────────────────────────────────
        async function showBorrowTermsModal() {
            // Load rules
            let rules = [];
            try {
                const cached = localStorage.getItem('brgy_borrowing_rules');
                rules = cached ? JSON.parse(cached) : [];
                // Try fresh fetch
                const { data, error } = await supabase.from('site_settings').select('value').eq('key','borrowing_rules').single();
                if (!error && data) {
                    rules = JSON.parse(data.value || '[]');
                    localStorage.setItem('brgy_borrowing_rules', JSON.stringify(rules));
                }
            } catch(e) {}

            const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const content = document.getElementById('termsRulesContent');
            if (content) {
                if (!rules.length) {
                    content.innerHTML =
                        '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin-bottom:12px;">' +
                        '<div style="font-weight:700;color:#065f46;margin-bottom:6px;display:flex;align-items:center;gap:8px;">' +
                        '<i class="bi bi-shield-check-fill" style="color:#16a34a;"></i>General Borrowing Policy</div>' +
                        '<ul style="margin:0;padding-left:18px;color:#374151;line-height:1.8;">' +
                        '<li>All borrowed equipment must be returned in the same condition.</li>' +
                        '<li>Return items on the agreed date and time.</li>' +
                        '<li>Any damage must be reported immediately to the Barangay.</li>' +
                        '<li>Borrowers are responsible for replacing lost or damaged items.</li>' +
                        '<li>Equipment is for community use only — not for commercial purposes.</li>' +
                        '</ul></div>';
                } else {
                    content.innerHTML = rules.map((r, i) =>
                        '<div style="padding:12px 14px;' + (i < rules.length-1 ? 'border-bottom:1px solid #e2e8f0;' : '') + '">' +
                        '<div style="display:flex;align-items:flex-start;gap:10px;">' +
                        '<span style="min-width:22px;height:22px;background:#1e3a5f;color:#fff;border-radius:50%;font-size:10px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">' + (i+1) + '</span>' +
                        '<div><div style="font-weight:700;color:#1A1A2E;margin-bottom:3px;font-size:13px;">' + _e(r.title) + '</div>' +
                        '<div style="color:#6B7280;font-size:12px;line-height:1.6;">' + _e(r.content) + '</div></div>' +
                        '</div></div>'
                    ).join('');
                }
            }

            // Reset scroll state
            const agreeBtn = document.getElementById('termsAgreeBtn');
            const hint     = document.getElementById('termsScrollHint');
            const scrollEl = document.getElementById('termsRulesContent');
            if (agreeBtn) { agreeBtn.disabled = true; agreeBtn.style.background = '#9CA3AF'; agreeBtn.style.cursor = 'not-allowed'; agreeBtn.style.opacity = '0.7'; }
            if (hint) hint.style.display = 'flex';
            if (scrollEl) scrollEl.scrollTop = 0;

            // Scroll-to-bottom detection
            function _onTermsScroll() {
                if (scrollEl.scrollHeight - scrollEl.scrollTop <= scrollEl.clientHeight + 10) {
                    if (agreeBtn) {
                        agreeBtn.disabled = false;
                        agreeBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)';
                        agreeBtn.style.cursor = 'pointer';
                        agreeBtn.style.opacity = '1';
                    }
                    if (hint) hint.style.display = 'none';
                    scrollEl.removeEventListener('scroll', _onTermsScroll);
                }
            }
            // If content fits without scrolling, enable immediately
            setTimeout(() => {
                if (scrollEl && scrollEl.scrollHeight <= scrollEl.clientHeight + 10) {
                    if (agreeBtn) {
                        agreeBtn.disabled = false;
                        agreeBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)';
                        agreeBtn.style.cursor = 'pointer';
                        agreeBtn.style.opacity = '1';
                    }
                    if (hint) hint.style.display = 'none';
                } else if (scrollEl) {
                    scrollEl.addEventListener('scroll', _onTermsScroll);
                }
            }, 80);

            // Show modal
            const modal = document.getElementById('borrowTermsModal');
            if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
        }

        function closeTermsModal() {
            const modal = document.getElementById('borrowTermsModal');
            if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
        }

        function agreeAndSubmitBorrow() {
            closeTermsModal();
            _doSubmitBorrowRequest();
        }
        // ──────────────────────────────────────────────────────────────`;

// Insert before the closing </script>
const scriptEnd = c.lastIndexOf('</script>');
c = c.substring(0, scriptEnd) + TERMS_FUNCTIONS + '\n        ' + c.substring(scriptEnd);
changes++;

// ── 6. Update updateBorrowSubmitButton — remove rulesAgreed dependency ────────
rep(
    `const rulesSection = document.getElementById('borrowRulesSection');
            const agreeCheck = document.getElementById('borrowAgreeCheck');
            const rulesVisible = rulesSection && rulesSection.style.display !== 'none';
            const rulesAgreed = !rulesVisible || (agreeCheck && agreeCheck.checked);
            btn.disabled = !(currentBorrowPurpose && borrowStartDate && borrowReturnDate && qty > 0 && purpose.trim() !== '' && name.trim() !== '' && contact.trim() !== '' && timesValid && deliveryMethodSelected && rulesAgreed);`,
    `btn.disabled = !(currentBorrowPurpose && borrowStartDate && borrowReturnDate && qty > 0 && purpose.trim() !== '' && name.trim() !== '' && contact.trim() !== '' && timesValid && deliveryMethodSelected);`
);

// ── 7. Remove loadBorrowRulesForUser call from modal open sequence ────────────
rep(
    `await loadBorrowRulesForUser();\n            document.getElementById('borrowModal').classList.remove('hidde`,
    `document.getElementById('borrowModal').classList.remove('hidde`
);

// ── 8. Remove old loadBorrowRulesForUser function (it's now replaced by showBorrowTermsModal) ─
const OLD_LBR_START = `\n        async function loadBorrowRulesForUser() {`;
const OLD_LBR_END   = `\n        document.getElementById('borrowerContact')?.addEventListener('input', updateBorrowSubmitButton);`;
const lbrStart = c.indexOf(OLD_LBR_START);
const lbrEnd   = c.indexOf(OLD_LBR_END);
if (lbrStart !== -1 && lbrEnd !== -1) {
    c = c.substring(0, lbrStart) + c.substring(lbrEnd);
    changes++;
    console.log('Removed old loadBorrowRulesForUser');
} else {
    console.log('MISS: old loadBorrowRulesForUser bounds', lbrStart, lbrEnd);
}

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
