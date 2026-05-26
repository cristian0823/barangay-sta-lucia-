const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// =====================================================================
// 1. MOBILE CSS — add to existing styles
// =====================================================================
const OLD_SIDEBAR_CSS_END = '        .sidebar-btn.active { background: #2563EB !important; color: #fff !important; }';
const existIdx = c.indexOf(OLD_SIDEBAR_CSS_END);
console.log('sidebar css end:', existIdx);

// Find the closing </style> of the main style block
const MOBILE_CSS = `
        /* Mobile responsive */
        @media (max-width: 768px) {
            #adminSidebar { transform: translateX(-100%); transition: transform 0.25s ease; }
            #adminSidebar.sidebar-open { transform: translateX(0); }
            #mainContentArea { margin-left: 0 !important; }
            #sidebarOverlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 89; }
            #sidebarOverlay.active { display: block; }
            #mobileHamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
            #mobileHamburger { display: none !important; }
        }`;

// Add CSS before first closing </style> after the body styles
const styleEndIdx = c.indexOf('    </style>\n</head>');
if (styleEndIdx !== -1) {
    c = c.substring(0, styleEndIdx) + MOBILE_CSS + '\n    </style>\n</head>' + c.substring(styleEndIdx + '    </style>\n</head>'.length);
    console.log('OK mobile CSS');
} else {
    // Try alternative
    const styleEnd2 = c.indexOf('</style>\n<body');
    if (styleEnd2 !== -1) {
        c = c.substring(0, styleEnd2) + MOBILE_CSS + '\n</style>\n<body' + c.substring(styleEnd2 + '</style>\n<body'.length);
        console.log('OK mobile CSS alt');
    } else {
        console.log('MISS mobile CSS');
    }
}

// =====================================================================
// 2. ADD id to sidebar <aside> and main content div
// =====================================================================
const OLD_ASIDE = '<aside style="position:fixed;top:64px;left:0;bottom:0;width:220px;background:#0F2547;overflow:hidden;z-index:90;display:flex;flex-direction:column;">';
const NEW_ASIDE = '<aside id="adminSidebar" style="position:fixed;top:64px;left:0;bottom:0;width:220px;background:#0F2547;overflow:hidden;z-index:90;display:flex;flex-direction:column;">';

let idx = c.indexOf(OLD_ASIDE);
if (idx === -1) { console.log('MISS aside id'); } else { c = c.substring(0, idx) + NEW_ASIDE + c.substring(idx + OLD_ASIDE.length); console.log('OK aside id'); }

const OLD_MAIN_DIV = '<div style="margin-left:220px;padding-top:64px;min-height:100vh;background:#EDEEF2;">';
const NEW_MAIN_DIV = '<div id="mainContentArea" style="margin-left:220px;padding-top:64px;min-height:100vh;background:#EDEEF2;">' +
    '\n<div id="sidebarOverlay" onclick="toggleSidebar()"></div>';

idx = c.indexOf(OLD_MAIN_DIV);
if (idx === -1) { console.log('MISS main div id'); } else { c = c.substring(0, idx) + NEW_MAIN_DIV + c.substring(idx + OLD_MAIN_DIV.length); console.log('OK main div id'); }

// =====================================================================
// 3. ADD hamburger button to admin header (left side of header)
// =====================================================================
const OLD_HEADER_START = '<header style="position:fixed;top:0;left:0;right:0;height:64px;background:#0F2547;display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:100;box-shadow:0 2px 16px rgba(0,0,0,0.25);">';
const NEW_HEADER_START = '<header style="position:fixed;top:0;left:0;right:0;height:64px;background:#0F2547;display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:100;box-shadow:0 2px 16px rgba(0,0,0,0.25);">' +
    '\n    <button id="mobileHamburger" onclick="toggleSidebar()" style="display:none;align-items:center;justify-content:center;width:38px;height:38px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;cursor:pointer;margin-right:12px;flex-shrink:0;"><i class="bi bi-list" style="font-size:22px;color:#fff;"></i></button>';

idx = c.indexOf(OLD_HEADER_START);
if (idx === -1) { console.log('MISS header start'); } else { c = c.substring(0, idx) + NEW_HEADER_START + c.substring(idx + OLD_HEADER_START.length); console.log('OK hamburger button'); }

// =====================================================================
// 4. ADD toggleSidebar JS function
// =====================================================================
const OLD_SWITCH_SECTION_FN = `            function switchSection(section, btn) {
                if (section === 'equipment') { setTimeout(loadStockThresholdUI, 50); }
                if (section === 'announcements') { setTimeout(loadAnnouncements, 50); }`;

const NEW_SWITCH_SECTION_FN = `            function toggleSidebar() {
                const sidebar = document.getElementById('adminSidebar');
                const overlay = document.getElementById('sidebarOverlay');
                if (!sidebar) return;
                const isOpen = sidebar.classList.contains('sidebar-open');
                sidebar.classList.toggle('sidebar-open', !isOpen);
                if (overlay) overlay.classList.toggle('active', !isOpen);
            }

            function switchSection(section, btn) {
                if (section === 'equipment') { setTimeout(loadStockThresholdUI, 50); }
                if (section === 'announcements') { setTimeout(loadAnnouncements, 50); }
                // Auto-close sidebar on mobile after navigation
                const sidebar = document.getElementById('adminSidebar');
                if (sidebar && window.innerWidth <= 768) {
                    sidebar.classList.remove('sidebar-open');
                    const overlay = document.getElementById('sidebarOverlay');
                    if (overlay) overlay.classList.remove('active');
                }`;

idx = c.indexOf(OLD_SWITCH_SECTION_FN);
if (idx === -1) { console.log('MISS switchSection fn'); } else { c = c.substring(0, idx) + NEW_SWITCH_SECTION_FN + c.substring(idx + OLD_SWITCH_SECTION_FN.length); console.log('OK toggleSidebar'); }

// =====================================================================
// 5. #5 ID TYPE — add ID Type dropdown to Add Resident modal
//    Add before the Contact Information section divider
// =====================================================================
const OLD_CONTACT_SECTION = '            <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #F3F4F6;">Contact Information</div>';
const NEW_CONTACT_SECTION = `            <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #F3F4F6;">Identity</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div>
                    <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Primary ID Type</label>
                    <select id="newUserIdType" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                        <option value="">None / Not Provided</option>
                        <option value="PhilSys (National ID)">PhilSys (National ID)</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Voter's ID">Voter's ID</option>
                        <option value="SSS ID">SSS ID</option>
                        <option value="PhilHealth ID">PhilHealth ID</option>
                        <option value="Pag-IBIG ID">Pag-IBIG ID</option>
                        <option value="Postal ID">Postal ID</option>
                    </select>
                </div>
                <div>
                    <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Secondary ID Type</label>
                    <select id="newUserIdType2" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;background:#fff;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
                        <option value="">None</option>
                        <option value="PhilSys (National ID)">PhilSys (National ID)</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver's License</option>
                        <option value="Voter's ID">Voter's ID</option>
                        <option value="SSS ID">SSS ID</option>
                        <option value="PhilHealth ID">PhilHealth ID</option>
                        <option value="Pag-IBIG ID">Pag-IBIG ID</option>
                        <option value="Postal ID">Postal ID</option>
                        <option value="Barangay Clearance">Barangay Clearance</option>
                    </select>
                </div>
            </div>
            <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #F3F4F6;">Contact Information</div>`;

idx = c.indexOf(OLD_CONTACT_SECTION);
if (idx === -1) { console.log('MISS ID type fields'); } else { c = c.substring(0, idx) + NEW_CONTACT_SECTION + c.substring(idx + OLD_CONTACT_SECTION.length); console.log('OK ID type fields'); }

// =====================================================================
// 6. #5 Full address field — add after House/Unit No.
// =====================================================================
const OLD_HOUSE_FIELD_END = `            <div style="margin-bottom:6px;">
                <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">House / Unit No.</label>
                <input type="text" id="newUserHouse" placeholder="e.g. 12B" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
            </div>`;

const NEW_HOUSE_FIELD_END = `            <div style="margin-bottom:6px;">
                <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">House / Unit No.</label>
                <input type="text" id="newUserHouse" placeholder="e.g. 12B" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
            </div>
            <div style="margin-bottom:6px;">
                <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:5px;">Full Address / Place of Living <span style="font-weight:400;color:#9CA3AF;">(optional)</span></label>
                <input type="text" id="newUserFullAddress" placeholder="e.g. 12B Sampaguita St., Sitio III" style="width:100%;padding:9px 12px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px;color:#111;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#1A3A6B'" onblur="this.style.borderColor='#D1D5DB'">
            </div>`;

idx = c.indexOf(OLD_HOUSE_FIELD_END);
if (idx === -1) { console.log('MISS house field end'); } else { c = c.substring(0, idx) + NEW_HOUSE_FIELD_END + c.substring(idx + OLD_HOUSE_FIELD_END.length); console.log('OK full address field'); }

fs.writeFileSync('admin-portal/admin.html', c);
console.log('Done admin mobile + ID type patch');
