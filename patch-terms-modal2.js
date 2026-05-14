const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

function rep(old, neu) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', JSON.stringify(old.substring(0, 80))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
}

// ── 1. Replace the entire terms modal HTML ───────────────────────────────────
const OLD_MODAL = `<!-- TERMS & CONDITIONS MODAL -->
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
    </div>`;

const NEW_MODAL = `<!-- TERMS & CONDITIONS MODAL -->
    <div id="borrowTermsModal" style="display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);align-items:center;justify-content:center;padding:20px;">
        <div style="background:#fff;border-radius:20px;width:100%;max-width:660px;box-shadow:0 32px 80px rgba(0,0,0,0.3);overflow:hidden;display:flex;flex-direction:column;max-height:92vh;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0f1f3d 0%,#1e3a5f 100%);padding:22px 28px;display:flex;align-items:center;gap:14px;flex-shrink:0;">
                <div style="width:46px;height:46px;background:rgba(255,255,255,0.13);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid rgba(255,255,255,0.2);">
                    <i class="bi bi-journal-check" style="color:#fff;font-size:22px;"></i>
                </div>
                <div style="flex:1;">
                    <div style="font-size:18px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.3px;">Borrowing Terms &amp; Conditions</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:3px;">Read all terms carefully. A checkbox will appear at the bottom.</div>
                </div>
                <button onclick="closeTermsModal()" style="width:32px;height:32px;border-radius:8px;border:none;background:rgba(255,255,255,0.12);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;"
                    onmouseover="this.style.background='rgba(255,255,255,0.22)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <!-- Scroll hint banner -->
            <div id="termsScrollHint" style="background:#fef9c3;border-bottom:1px solid #fde68a;padding:9px 24px;display:flex;align-items:center;gap:8px;font-size:12px;color:#92400e;font-weight:600;flex-shrink:0;">
                <i class="bi bi-arrow-down-circle-fill" style="font-size:15px;flex-shrink:0;animation:termsArrowBounce 1.2s ease-in-out infinite;"></i>
                Scroll down to read all the terms — the agreement checkbox is waiting at the bottom
            </div>
            <!-- Scrollable content — checkbox lives INSIDE here at the very end -->
            <div id="termsRulesContent" style="padding:20px 24px;height:340px;overflow-y:auto;font-size:13px;color:#374151;line-height:1.75;flex-shrink:0;">
                <!-- rules filled by JS; checkbox appended after rules -->
            </div>
            <!-- Footer: Cancel + Proceed -->
            <div style="padding:16px 24px;border-top:1.5px solid #e2e8f0;display:flex;gap:10px;background:#f8fafc;flex-shrink:0;">
                <button onclick="closeTermsModal()"
                    style="padding:12px 24px;border-radius:10px;border:1.5px solid #D1D5DB;background:#fff;color:#374151;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.15s;white-space:nowrap;"
                    onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='#fff'">
                    <i class="bi bi-arrow-left" style="margin-right:5px;"></i>Cancel
                </button>
                <button id="termsProceedBtn" onclick="agreeAndSubmitBorrow()" disabled
                    style="flex:1;padding:12px;border-radius:10px;border:none;font-size:14px;font-weight:700;cursor:not-allowed;font-family:inherit;background:#D1D5DB;color:#9CA3AF;transition:all 0.25s;">
                    <i class="bi bi-send-fill" style="margin-right:6px;"></i>Proceed
                </button>
            </div>
        </div>
    </div>
    <style>
        @keyframes termsArrowBounce {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(3px); }
        }
    </style>`;

rep(OLD_MODAL, NEW_MODAL);

// ── 2. Replace showBorrowTermsModal function body ────────────────────────────
const OLD_FN_START = `async function showBorrowTermsModal() {
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
        }`;

const NEW_FN = `async function showBorrowTermsModal() {
            // Load rules from cache then Supabase
            let rules = [];
            try {
                const cached = localStorage.getItem('brgy_borrowing_rules');
                rules = cached ? JSON.parse(cached) : [];
                const { data, error } = await supabase.from('site_settings').select('value').eq('key','borrowing_rules').single();
                if (!error && data) {
                    rules = JSON.parse(data.value || '[]');
                    localStorage.setItem('brgy_borrowing_rules', JSON.stringify(rules));
                }
            } catch(e) {}

            const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const scrollEl = document.getElementById('termsRulesContent');
            const hint     = document.getElementById('termsScrollHint');
            const proceedBtn = document.getElementById('termsProceedBtn');

            // Build rules HTML
            let rulesHtml = '';
            if (!rules.length) {
                rulesHtml =
                    '<div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:16px 18px;margin-bottom:4px;">' +
                    '<div style="font-weight:800;color:#065f46;margin-bottom:10px;font-size:14px;display:flex;align-items:center;gap:8px;">' +
                    '<i class="bi bi-shield-check-fill" style="color:#16a34a;font-size:16px;"></i>General Borrowing Policy</div>' +
                    '<ol style="margin:0;padding-left:20px;color:#374151;line-height:2.0;font-size:13px;">' +
                    '<li>All borrowed equipment must be returned in the <strong>same condition</strong>.</li>' +
                    '<li>Return items on the <strong>agreed date and time</strong>.</li>' +
                    '<li>Any damage must be <strong>reported immediately</strong> to the Barangay.</li>' +
                    '<li>Borrowers are responsible for <strong>replacing lost or damaged</strong> items.</li>' +
                    '<li>Equipment is for <strong>community use only</strong> — not for commercial purposes.</li>' +
                    '</ol></div>';
            } else {
                rulesHtml = rules.map((r, i) =>
                    '<div style="padding:14px 0;' + (i < rules.length-1 ? 'border-bottom:1px solid #e2e8f0;' : '') + '">' +
                    '<div style="display:flex;align-items:flex-start;gap:12px;">' +
                    '<span style="min-width:24px;height:24px;background:#1e3a5f;color:#fff;border-radius:50%;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">' + (i+1) + '</span>' +
                    '<div><div style="font-weight:700;color:#1A1A2E;margin-bottom:4px;font-size:14px;">' + _e(r.title) + '</div>' +
                    '<div style="color:#6B7280;font-size:13px;line-height:1.7;">' + _e(r.content) + '</div></div>' +
                    '</div></div>'
                ).join('');
            }

            // Append agree checkbox at the very bottom of scrollable content
            rulesHtml +=
                '<div id="termsCheckRow" style="margin-top:20px;padding:16px 18px;background:#EEF2FF;border:2px solid #C7D2FE;border-radius:12px;">' +
                '<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">' +
                '<input type="checkbox" id="termsAgreeCheck" onchange="onTermsCheckChange(this)"' +
                ' style="width:18px;height:18px;flex-shrink:0;margin-top:2px;accent-color:#1e3a5f;cursor:pointer;">' +
                '<span style="font-size:13px;font-weight:600;color:#1e3a5f;line-height:1.5;">' +
                'I have read and fully understood the <strong>Barangay Borrowing Terms &amp; Conditions</strong> listed above.' +
                '</span></label></div>';

            if (scrollEl) {
                scrollEl.innerHTML = rulesHtml;
                scrollEl.scrollTop = 0;
            }

            // Reset proceed button
            if (proceedBtn) {
                proceedBtn.disabled = true;
                proceedBtn.style.background = '#D1D5DB';
                proceedBtn.style.color = '#9CA3AF';
                proceedBtn.style.cursor = 'not-allowed';
            }
            if (hint) hint.style.display = 'flex';

            // Show modal
            const modal = document.getElementById('borrowTermsModal');
            if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
        }

        function onTermsCheckChange(chk) {
            const proceedBtn = document.getElementById('termsProceedBtn');
            if (!proceedBtn) return;
            if (chk.checked) {
                proceedBtn.disabled = false;
                proceedBtn.style.background = 'linear-gradient(135deg,#1e3a5f,#0f1f3d)';
                proceedBtn.style.color = '#fff';
                proceedBtn.style.cursor = 'pointer';
                proceedBtn.style.boxShadow = '0 4px 14px rgba(30,58,95,0.35)';
            } else {
                proceedBtn.disabled = true;
                proceedBtn.style.background = '#D1D5DB';
                proceedBtn.style.color = '#9CA3AF';
                proceedBtn.style.cursor = 'not-allowed';
                proceedBtn.style.boxShadow = 'none';
            }
        }`;

rep(OLD_FN_START, NEW_FN);

// Fix agreeAndSubmitBorrow to also close the scroll hint
rep(
    `function agreeAndSubmitBorrow() {
            closeTermsModal();
            _doSubmitBorrowRequest();
        }`,
    `function agreeAndSubmitBorrow() {
            // Check the checkbox is actually ticked before proceeding
            const chk = document.getElementById('termsAgreeCheck');
            if (!chk || !chk.checked) return;
            closeTermsModal();
            _doSubmitBorrowRequest();
        }`
);

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
