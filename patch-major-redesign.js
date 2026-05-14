const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');
let changes = 0;

function rep(old, neu, label) {
    const idx = c.indexOf(old);
    if (idx === -1) { console.log('MISS:', label || JSON.stringify(old.substring(0, 80))); return; }
    c = c.substring(0, idx) + neu + c.substring(idx + old.length);
    changes++;
    if (label) console.log('OK:', label);
}

// ── 1. Remove yellow scroll hint banner from Terms modal HTML ────────────────
rep(
    '\n            <!-- Scroll hint banner -->\n            <div id="termsScrollHint" style="background:#fef9c3;border-bottom:1px solid #fde68a;padding:9px 24px;display:flex;align-items:center;gap:8px;font-size:12px;color:#92400e;font-weight:600;flex-shrink:0;">\n                <i class="bi bi-arrow-down-circle-fill" style="font-size:15px;flex-shrink:0;animation:termsArrowBounce 1.2s ease-in-out infinite;"></i>\n                Scroll down to read all the terms — the agreement checkbox is waiting at the bottom\n            </div>',
    '',
    'Remove yellow hint banner'
);

// ── 2. Add id to terms modal title for dynamic updates ───────────────────────
rep(
    '<div style="font-size:18px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.3px;">Borrowing Terms &amp; Conditions</div>',
    '<div id="termsModalTitle" style="font-size:18px;font-weight:800;color:#fff;line-height:1.2;letter-spacing:-0.3px;">Borrowing Terms &amp; Conditions</div>',
    'Add id to terms title'
);

// ── 3. Update terms modal subtitle ───────────────────────────────────────────
rep(
    '<div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:3px;">Read all terms carefully. A checkbox will appear at the bottom.</div>',
    '<div id="termsModalSubtitle" style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:3px;">Read all terms carefully, then check the box to proceed.</div>',
    'Update terms subtitle'
);

// ── 4. Change form submit listener to check _borrowTermsAgreed flag ──────────
rep(
    `document.getElementById('borrowForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            // Show Terms & Conditions modal instead of submitting directly
            await showBorrowTermsModal();
        });`,
    `document.getElementById('borrowForm')?.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (window._borrowTermsAgreed) {
                await _doSubmitBorrowRequest();
            } else {
                await showBorrowTermsModal();
            }
        });`,
    'Form submit check flag'
);

// ── 5. Change agreeAndSubmitBorrow() to set flag and NOT auto-submit ──────────
rep(
    `function agreeAndSubmitBorrow() {
            // Check the checkbox is actually ticked before proceeding
            const chk = document.getElementById('termsAgreeCheck');
            if (!chk || !chk.checked) return;
            closeTermsModal();
            _doSubmitBorrowRequest();
        }`,
    `function agreeAndSubmitBorrow() {
            const chk = document.getElementById('termsAgreeCheck');
            if (!chk || !chk.checked) return;
            window._borrowTermsAgreed = true;
            closeTermsModal();
            // Show terms-accepted state on the submit button
            const _btn = document.getElementById('submitBorrowBtn');
            if (_btn) {
                _btn.innerHTML = '<i class="bi bi-check-circle-fill" style="margin-right:6px;"></i>Terms Accepted — Click to Submit';
                _btn.style.background = 'linear-gradient(135deg,#1e3a5f,#065f46)';
            }
        }`,
    'agreeAndSubmitBorrow no auto-submit'
);

// ── 6. Reset terms flag and submit button in closeBorrowModal ────────────────
rep(
    `            const _pon = document.getElementById('deliveryPickupOnlyNotice'); if (_pon) _pon.style.display = 'none';
            updateBorrowLockState();
        }`,
    `            const _pon = document.getElementById('deliveryPickupOnlyNotice'); if (_pon) _pon.style.display = 'none';
            updateBorrowLockState();
            window._borrowTermsAgreed = false;
            const _sbtn = document.getElementById('submitBorrowBtn');
            if (_sbtn) { _sbtn.innerHTML = 'Submit Borrow Request'; _sbtn.style.background = ''; }
            const _bdr = document.getElementById('borrowDetailsReveal'); if (_bdr) _bdr.style.display = 'none';
        }`,
    'Reset flag in closeBorrowModal'
);

// ── 7. Hide borrowDetailsReveal on purpose select + reset dates ──────────────
rep(
    `            borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true;
            updateBorrowDurationRules();
            renderAvailableItemsForPurpose(purpose);`,
    `            borrowStartDate = null; borrowReturnDate = null; borrowDateSelectingStart = true;
            const _bdrSel = document.getElementById('borrowDetailsReveal'); if (_bdrSel) _bdrSel.style.display = 'none';
            updateBorrowDurationRules();
            renderAvailableItemsForPurpose(purpose);`,
    'Hide reveal on purpose select'
);

// ── 8. Auto-select Event when modal opens ────────────────────────────────────
rep(
    `            renderBorrowAlerts();
            renderExistingBookings();
            renderBorrowCalendar();
            updateBorrowLockState();
            document.getElementById('borrowModal').classList.remove('hidden');`,
    `            renderBorrowAlerts();
            renderExistingBookings();
            selectBorrowPurpose('event');
            updateBorrowLockState();
            document.getElementById('borrowModal').classList.remove('hidden');`,
    'Auto-select Event on open'
);

// ── 9. Make renderAvailableItemsForPurpose a no-op (remove chips) ────────────
rep(
    `function renderAvailableItemsForPurpose(purpose) {
            const el = document.getElementById('availableItemsForPurpose');
            if (!el || !purpose) { if (el) el.innerHTML = ''; return; }`,
    `function renderAvailableItemsForPurpose(purpose) {
            const el = document.getElementById('availableItemsForPurpose');
            if (el) el.innerHTML = '';
            return; // chips removed`,
    'Remove chips (no-op)'
);

// ── 10. Burol auto-sets return date to next day (same as event) ──────────────
rep(
    `                borrowStartDate = dateStr; borrowReturnDate = null; borrowDateSelectingStart = false;
                showToast('Now select your return date (max 7 days)', 'success');`,
    `                // Auto-set return date to next day (same UX as event)
                const _bnd = new Date(dateStr); _bnd.setDate(_bnd.getDate() + 1);
                const _bndStr = _bnd.getFullYear() + '-' + String(_bnd.getMonth()+1).padStart(2,'0') + '-' + String(_bnd.getDate()).padStart(2,'0');
                borrowStartDate = dateStr; borrowReturnDate = _bndStr; borrowDateSelectingStart = true;
                updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                updateBorrowLockState();`,
    'Burol auto-next-day return'
);

// ── 11. Progressive disclosure: wrap form in reveal div ──────────────────────
// Move borrowModalAlerts inside reveal div, below the date display
rep(
    `<div id="borrowFormBody" style="display:none;padding:0 20px 24px;">
                    <div id="borrowModalAlerts" class="flex flex-col gap-3 mb-4 empty:hidden"></div>
                    <!-- Date Display -->`,
    `<div id="borrowFormBody" style="display:none;padding:0 20px 24px;">
                    <!-- Date Display -->`,
    'Move alerts out of top position'
);

rep(
    `                    <form id="borrowForm" class="flex flex-col space-y-4">`,
    `                    <div id="borrowDetailsReveal" style="display:none;">
                    <div id="borrowModalAlerts" class="flex flex-col gap-3 mb-4 empty:hidden"></div>
                    <form id="borrowForm" class="flex flex-col space-y-4">`,
    'Add borrowDetailsReveal wrapper'
);

rep(
    `                    </form>
                    </div><!-- /borrowFormBody -->`,
    `                    </form>
                    </div><!-- /borrowDetailsReveal -->
                    </div><!-- /borrowFormBody -->`,
    'Close borrowDetailsReveal'
);

// ── 12. Show borrowDetailsReveal after date selection (event branch) ─────────
rep(
    `                borrowStartDate = dateStr; borrowReturnDate = nextDayStr; borrowDateSelectingStart = true;
                    updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                    updateBorrowLockState();`,
    `                borrowStartDate = dateStr; borrowReturnDate = nextDayStr; borrowDateSelectingStart = true;
                    updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                    updateBorrowLockState();
                    const _bdrEv = document.getElementById('borrowDetailsReveal'); if (_bdrEv) _bdrEv.style.display = 'block';`,
    'Show reveal after event date select'
);

// Show reveal after burol date selection (the new code we just inserted)
rep(
    `                updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                updateBorrowLockState();`,
    `                updateBorrowDateDisplays(); renderBorrowCalendar(); updateBorrowSubmitButton(); renderBorrowAlerts();
                updateBorrowLockState();
                const _bdrBu = document.getElementById('borrowDetailsReveal'); if (_bdrBu) _bdrBu.style.display = 'block';`,
    'Show reveal after burol date select'
);

// ── 13. Show reveal also after manual return date selection ─────────────────
// After the range-check success in selectBorrowDate (the else branch for return date)
rep(
    `                borrowStartDate = borrowStartDate; borrowReturnDate = dateStr; borrowDateSelectingStart = true;
                updateBorrowDateDisplays();`,
    `                borrowStartDate = borrowStartDate; borrowReturnDate = dateStr; borrowDateSelectingStart = true;
                const _bdrRet = document.getElementById('borrowDetailsReveal'); if (_bdrRet) _bdrRet.style.display = 'block';
                updateBorrowDateDisplays();`,
    'Show reveal after return date select'
);

// ── 14. Hide reveal when dates are cleared ───────────────────────────────────
rep(
    `            borrowStartDate = null;
            borrowReturnDate = null;
            borrowDateSelectingStart = true;
            updateBorrowDateDisplays();
            renderBorrowCalendar();
            updateBorrowSubmitButton();
            renderBorrowAlerts();
            updateBorrowLockState();
        }`,
    `            borrowStartDate = null;
            borrowReturnDate = null;
            borrowDateSelectingStart = true;
            const _bdrClr = document.getElementById('borrowDetailsReveal'); if (_bdrClr) _bdrClr.style.display = 'none';
            updateBorrowDateDisplays();
            renderBorrowCalendar();
            updateBorrowSubmitButton();
            renderBorrowAlerts();
            updateBorrowLockState();
        }`,
    'Hide reveal on clear dates'
);

// ── 15. Swap calendar/form columns (calendar RIGHT, form LEFT) ───────────────
rep(
    `            <div class="flex flex-col lg:flex-row flex-1 lg:overflow-hidden" style="min-height:0;">
                <!-- Left Column: Calendar -->
                <div class="w-full lg:w-1/2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30 lg:overflow-y-auto flex flex-col" style="background: var(--dm-cal-bg, inherit);">`,
    `            <div class="flex flex-col lg:flex-row-reverse flex-1 lg:overflow-hidden" style="min-height:0;">
                <!-- Right Column: Calendar (visually on right via flex-row-reverse) -->
                <div class="w-full lg:w-1/2 p-4 lg:p-6 border-b lg:border-b-0 lg:border-l border-gray-100 bg-gray-50/30 lg:overflow-y-auto flex flex-col" style="background: var(--dm-cal-bg, inherit);">`,
    'Swap columns to calendar-right'
);

// ── 16. Replace showBorrowTermsModal with purpose-aware version ──────────────
const OLD_TERMS_FN_START = c.indexOf('async function showBorrowTermsModal() {');
const OLD_TERMS_FN_END = c.indexOf('\n        function onTermsCheckChange(');
if (OLD_TERMS_FN_START !== -1 && OLD_TERMS_FN_END !== -1) {
    const newFn = `async function showBorrowTermsModal() {
            const purpose = window.currentBorrowPurpose || 'event';
            const isEvent = purpose === 'event';

            // Update modal title/subtitle per purpose
            const titleEl = document.getElementById('termsModalTitle');
            const subEl = document.getElementById('termsModalSubtitle');
            if (titleEl) titleEl.textContent = isEvent ? 'Equipment Borrowing Terms & Conditions' : 'Funeral Viewing Borrowing Terms & Conditions';
            if (subEl) subEl.textContent = isEvent ? 'Read all event-borrowing terms carefully before proceeding.' : 'Read all funeral-viewing borrowing terms carefully before proceeding.';

            // Load purpose-specific rules
            const ruleKey = isEvent ? 'borrowing_rules_event' : 'borrowing_rules_burol';
            const fallbackKey = 'borrowing_rules';
            let rules = [];
            try {
                const { data: d1, error: e1 } = await supabase.from('site_settings').select('value').eq('key', ruleKey).single();
                if (!e1 && d1) rules = JSON.parse(d1.value || '[]');
                if (!rules.length) {
                    const { data: d2, error: e2 } = await supabase.from('site_settings').select('value').eq('key', fallbackKey).single();
                    if (!e2 && d2) rules = JSON.parse(d2.value || '[]');
                }
            } catch(err) {}

            const _e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const scrollEl = document.getElementById('termsRulesContent');
            const proceedBtn = document.getElementById('termsProceedBtn');

            // Default rules per purpose if none in DB
            let rulesHtml = '';
            if (!rules.length) {
                if (isEvent) {
                    rulesHtml =
                        '<div style="background:#f0fdfa;border:1.5px solid #99f6e4;border-radius:10px;padding:16px 18px;margin-bottom:4px;">' +
                        '<div style="font-weight:800;color:#065f46;margin-bottom:10px;font-size:14px;display:flex;align-items:center;gap:8px;">' +
                        '<i class="bi bi-calendar-event-fill" style="color:#0d9488;font-size:16px;"></i>General Event Borrowing Policy</div>' +
                        '<ol style="margin:0;padding-left:20px;color:#374151;line-height:2.0;font-size:13px;">' +
                        '<li>Equipment must be picked up on your <strong>event day</strong> and returned the <strong>very next day</strong> at the same time.</li>' +
                        '<li>All items must be returned in the <strong>same condition</strong> as borrowed.</li>' +
                        '<li>Any damage or loss must be <strong>reported immediately</strong> to the Barangay.</li>' +
                        '<li>Borrowers are liable for <strong>replacing lost or damaged items</strong>.</li>' +
                        '<li>Equipment is for <strong>community events only</strong> — not for commercial or personal profit.</li>' +
                        '<li>A <strong>+1 day extension</strong> applies — items returned beyond this incur a penalty.</li>' +
                        '</ol></div>';
                } else {
                    rulesHtml =
                        '<div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:16px 18px;margin-bottom:4px;">' +
                        '<div style="font-weight:800;color:#92400e;margin-bottom:10px;font-size:14px;display:flex;align-items:center;gap:8px;">' +
                        '<i class="bi bi-shield-fill" style="color:#d97706;font-size:16px;"></i>Funeral Viewing Borrowing Policy</div>' +
                        '<ol style="margin:0;padding-left:20px;color:#374151;line-height:2.0;font-size:13px;">' +
                        '<li>Equipment may be borrowed for up to <strong>7 days</strong> for funeral viewings.</li>' +
                        '<li>Items must be treated with <strong>respect and care</strong> during the viewing period.</li>' +
                        '<li>All items must be returned <strong>clean and in the same condition</strong> as when borrowed.</li>' +
                        '<li>Any damage or loss must be <strong>reported immediately</strong> to the Barangay.</li>' +
                        '<li>Borrowers are fully liable for <strong>replacing lost or damaged equipment</strong>.</li>' +
                        '<li>Equipment is exclusively for the <strong>viewing/wake</strong> — not for other personal use.</li>' +
                        '</ol></div>';
                }
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

            // Append agree checkbox at the very bottom
            rulesHtml +=
                '<div id="termsCheckRow" style="margin-top:20px;padding:16px 18px;background:#EEF2FF;border:2px solid #C7D2FE;border-radius:12px;">' +
                '<label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;">' +
                '<input type="checkbox" id="termsAgreeCheck" onchange="onTermsCheckChange(this)"' +
                ' style="width:18px;height:18px;flex-shrink:0;margin-top:2px;accent-color:#1e3a5f;cursor:pointer;">' +
                '<span style="font-size:13px;font-weight:600;color:#1e3a5f;line-height:1.5;">' +
                'I have read and fully understood the <strong>Barangay Borrowing Terms &amp; Conditions</strong> above and agree to comply.' +
                '</span></label></div>';

            if (scrollEl) { scrollEl.innerHTML = rulesHtml; scrollEl.scrollTop = 0; }

            // Reset proceed button
            if (proceedBtn) {
                proceedBtn.disabled = true;
                proceedBtn.style.background = '#D1D5DB';
                proceedBtn.style.color = '#9CA3AF';
                proceedBtn.style.cursor = 'not-allowed';
            }

            // Show modal
            const modal = document.getElementById('borrowTermsModal');
            if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
        }`;
    c = c.substring(0, OLD_TERMS_FN_START) + newFn + c.substring(OLD_TERMS_FN_END);
    changes++;
    console.log('OK: Replace showBorrowTermsModal with purpose-aware version');
} else {
    console.log('MISS: showBorrowTermsModal bounds', OLD_TERMS_FN_START, OLD_TERMS_FN_END);
}

// ── 17. Numbered pagination HTML for My Activity ─────────────────────────────
rep(
    '<!-- Pagination Controls -->\n                    <div class="flex justify-between items-center mt-auto border-t border-gray-200 dark:border-slate-700 pt-4">\n                        <button onclick="prevPageHistory()" class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>\n                        <span id="historyPaginationInfo" class="text-sm text-gray-500 dark:text-gray-400 font-medium">Page 1 of 1</span>\n                        <button onclick="nextPageHistory()" class="px-4 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>\n                    </div>',
    '<!-- Pagination Controls -->\n                    <div id="historyPaginationContainer" class="flex justify-center items-center gap-1.5 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex-wrap min-h-[44px]">\n                    </div>',
    'Numbered pagination HTML'
);

// ── 18. Numbered pagination JS in renderHistory ──────────────────────────────
rep(
    `const info = document.getElementById('historyPaginationInfo');
            if(info) info.textContent = \`Page \${currentPageHistory} of \${totalPages}\`;

            const prevBtn = document.querySelector('button[onclick="prevPageHistory()"]');
            const nextBtn = document.querySelector('button[onclick="nextPageHistory()"]');
            if(prevBtn) prevBtn.disabled = currentPageHistory === 1;
            if(nextBtn) nextBtn.disabled = currentPageHistory === totalPages;
        }`,
    `_renderHistoryPagination(currentPageHistory, totalPages);
        }
        function _renderHistoryPagination(current, total) {
            const container = document.getElementById('historyPaginationContainer');
            if (!container) return;
            const btnBase = 'display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid;transition:all 0.15s;font-family:inherit;';
            const btnNormal = btnBase + 'background:#fff;border-color:#e2e8f0;color:#374151;';
            const btnActive = btnBase + 'background:#1e3a5f;border-color:#1e3a5f;color:#fff;';
            const btnDisabled = btnBase + 'background:#f3f4f6;border-color:#e2e8f0;color:#9ca3af;cursor:not-allowed;opacity:0.6;';
            const html = [];
            // Prev
            html.push(\`<button onclick="prevPageHistory()" \${current===1?'disabled':''} style="\${current===1?btnDisabled:btnNormal}"><i class="bi bi-chevron-left"></i></button>\`);
            // Pages
            const pages = _getPageRange(current, total);
            pages.forEach(p => {
                if (p === '...') {
                    html.push('<span style="padding:0 4px;color:#9ca3af;font-size:14px;line-height:36px;">…</span>');
                } else {
                    html.push(\`<button onclick="currentPageHistory=\${p};renderHistory()" style="\${p===current?btnActive:btnNormal}">\${p}</button>\`);
                }
            });
            // Next
            html.push(\`<button onclick="nextPageHistory()" \${current===total?'disabled':''} style="\${current===total?btnDisabled:btnNormal}"><i class="bi bi-chevron-right"></i></button>\`);
            container.innerHTML = html.join('');
        }
        function _getPageRange(current, total) {
            if (total <= 7) return Array.from({length:total},(_,i)=>i+1);
            const pages = [];
            if (current <= 4) {
                for (let i=1;i<=5;i++) pages.push(i);
                pages.push('...'); pages.push(total);
            } else if (current >= total-3) {
                pages.push(1); pages.push('...');
                for (let i=total-4;i<=total;i++) pages.push(i);
            } else {
                pages.push(1); pages.push('...');
                for (let i=current-1;i<=current+1;i++) pages.push(i);
                pages.push('...'); pages.push(total);
            }
            return pages;
        }`,
    'Numbered pagination JS'
);

// ── 19. Also update selectBorrowDate return-date branch (manual 2-click) ─────
// Reveal form when manually selecting return date in multi-day burol booking
const manualReturnIdx = c.indexOf('borrowStartDate = borrowStartDate; borrowReturnDate = dateStr;');
if (manualReturnIdx === -1) {
    // The 'else' return branch sets dates differently
    console.log('NOTE: manual return date branch not found - burol now auto-sets');
}

// ── 20. Add fadeSlideIn CSS animation ────────────────────────────────────────
rep(
    `@keyframes termsArrowBounce {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(3px); }
        }`,
    `@keyframes termsArrowBounce {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(3px); }
        }
        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(-8px); }
            to   { opacity: 1; transform: translateY(0); }
        }`,
    'Add fadeSlideIn animation'
);

fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done.', changes, 'changes applied.');
