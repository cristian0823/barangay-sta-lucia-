const fs = require('fs');
let txt = fs.readFileSync('admin-portal/admin.html', 'utf8');

// ── 1. Replace the respond-form section (textarea + buttons) ──────────────────
const oldForm = `                <!-- Respond Form -->
                <div style="padding:12px 20px 20px;">
                    <div style="margin-bottom:10px;">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px;">Admin Response</label>
                        <textarea id="adminConcernResponseText" rows="3" placeholder="Type your response to this concern..." style="width:100%;padding:12px;border:1.5px solid var(--border,#e5e7eb);border-radius:12px;font-size:14px;color:var(--text,#111);background:var(--panel-bg,#f9fafb);outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor=''"></textarea>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;">
                        <button onclick="submitAdminConcernResponse('in-progress')" style="flex:1;min-width:120px;padding:11px 8px;background:#3b82f6;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">Mark In Progress</button>
                        <button onclick="submitAdminConcernResponse('resolved')" style="flex:1;min-width:120px;padding:11px 8px;background:#059669;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">Mark Resolved</button>
                        <button onclick="closeAdminConcernModal()" style="flex:1;min-width:100px;padding:11px 8px;border:1.5px solid var(--border,#e5e7eb);border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;background:transparent;color:var(--text,#374151);transition:background 0.2s;" onmouseover="this.style.background='var(--panel-bg)'" onmouseout="this.style.background='transparent'">Close</button>
                    </div>
                </div>`;

const newForm = `                <!-- Respond Form -->
                <div style="padding:12px 20px 20px;">
                    <div style="margin-bottom:10px;">
                        <label style="display:block;font-size:11px;font-weight:700;color:var(--muted,#6b7280);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px;">Admin Response / Notes</label>
                        <textarea id="adminConcernResponseText" rows="3" placeholder="Type your response or notes (optional for progress/resolve)..." style="width:100%;padding:12px;border:1.5px solid var(--border,#e5e7eb);border-radius:12px;font-size:14px;color:var(--text,#111);background:var(--panel-bg,#f9fafb);outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='#10b981'" onblur="this.style.borderColor=''"></textarea>
                    </div>
                    <!-- Rejection reason panel (hidden by default) -->
                    <div id="rejectReasonPanel" style="display:none;margin-bottom:12px;background:#fff5f5;border:1.5px solid #fca5a5;border-radius:12px;padding:14px;">
                        <label style="display:block;font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:7px;"><i class="bi bi-x-circle-fill" style="margin-right:5px;"></i>Rejection Reason <span style="color:#dc2626;">*</span></label>
                        <textarea id="adminConcernRejectReason" rows="3" placeholder="Enter reason for rejecting this concern (required)..." style="width:100%;padding:12px;border:1.5px solid #fca5a5;border-radius:10px;font-size:14px;color:#111;background:#fff;outline:none;font-family:inherit;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='#dc2626'" onblur="this.style.borderColor='#fca5a5'"></textarea>
                        <div style="display:flex;gap:8px;margin-top:10px;">
                            <button onclick="confirmRejectConcern()" style="flex:1;padding:10px;background:#dc2626;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'"><i class="bi bi-x-lg" style="margin-right:5px;"></i>Confirm Rejection</button>
                            <button onclick="cancelRejectPanel()" style="padding:10px 18px;border:1.5px solid #fca5a5;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:#dc2626;transition:background 0.2s;" onmouseover="this.style.background='#fee2e2'" onmouseout="this.style.background='transparent'">Cancel</button>
                        </div>
                    </div>
                    <div style="display:flex;gap:10px;flex-wrap:wrap;" id="concernActionBtns">
                        <button onclick="submitAdminConcernResponse('in-progress')" style="flex:1;min-width:120px;padding:11px 8px;background:#3b82f6;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'"><i class="bi bi-hourglass-split" style="margin-right:5px;"></i>Mark In Progress</button>
                        <button onclick="submitAdminConcernResponse('resolved')" style="flex:1;min-width:120px;padding:11px 8px;background:#059669;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'"><i class="bi bi-check-circle-fill" style="margin-right:5px;"></i>Mark Resolved</button>
                        <button onclick="showRejectPanel()" style="flex:1;min-width:110px;padding:11px 8px;background:#dc2626;color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;transition:filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'"><i class="bi bi-x-circle" style="margin-right:5px;"></i>Reject</button>
                        <button onclick="closeAdminConcernModal()" style="flex:1;min-width:90px;padding:11px 8px;border:1.5px solid var(--border,#e5e7eb);border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;background:transparent;color:var(--text,#374151);transition:background 0.2s;" onmouseover="this.style.background='var(--panel-bg)'" onmouseout="this.style.background='transparent'">Close</button>
                    </div>
                </div>`;

if (txt.includes(oldForm)) {
    txt = txt.replace(oldForm, newForm);
    console.log('✅ Replaced modal form');
} else {
    // Try CRLF normalized
    const normTxt = txt.replace(/\r\n/g, '\n');
    const normOld = oldForm.replace(/\r\n/g, '\n');
    if (normTxt.includes(normOld)) {
        txt = normTxt.replace(normOld, newForm);
        console.log('✅ Replaced after normalizing');
    } else {
        console.log('❌ Modal form not found');
        process.exit(1);
    }
}

// ── 2. Add helper JS functions after submitAdminConcernResponse ──────────────
const funcAnchor = `            function openBookingRespond(bookingId) {`;
const newHelpers = `            function showRejectPanel() {
                const panel = document.getElementById('rejectReasonPanel');
                const btns  = document.getElementById('concernActionBtns');
                if (panel) panel.style.display = 'block';
                if (btns)  btns.style.display  = 'none';
                const ta = document.getElementById('adminConcernRejectReason');
                if (ta) { ta.value = ''; ta.focus(); }
            }

            function cancelRejectPanel() {
                const panel = document.getElementById('rejectReasonPanel');
                const btns  = document.getElementById('concernActionBtns');
                if (panel) panel.style.display = 'none';
                if (btns)  btns.style.display  = 'flex';
            }

            async function confirmRejectConcern() {
                const reasonInput = document.getElementById('adminConcernRejectReason');
                const reason = reasonInput ? reasonInput.value.trim() : '';
                if (!reason) {
                    showAlert('Please enter a rejection reason before confirming.', 'error');
                    if (reasonInput) reasonInput.focus();
                    return;
                }
                // Pass rejection reason as the response text
                const prevResponse = document.getElementById('adminConcernResponseText');
                if (prevResponse) prevResponse.value = reason; // Store so submitAdminConcernResponse picks it up
                await submitAdminConcernResponse('rejected');
                cancelRejectPanel();
            }

            function openBookingRespond(bookingId) {`;

if (txt.includes(funcAnchor)) {
    txt = txt.replace(funcAnchor, newHelpers);
    console.log('✅ Added showRejectPanel / confirmRejectConcern helpers');
} else {
    console.log('❌ Could not find anchor for helpers');
    process.exit(1);
}

fs.writeFileSync('admin-portal/admin.html', txt);
console.log('Done writing file');
