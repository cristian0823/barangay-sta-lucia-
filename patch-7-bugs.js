// #19 login button + #20 About section + #21 color + #23 typography
const fs = require('fs');

// =====================================================================
// INDEX.HTML — Add About section (#20)
// =====================================================================
let idx = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

const OLD_SERVICES = '    <!-- Services Section -->\n    <section class="services-bg">';
const NEW_ABOUT_AND_SERVICES = `    <!-- About Section (#20) -->
    <section style="padding:72px 48px;background:#f8fafc;">
        <div style="max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;">
            <div>
                <p style="font-size:11px;font-weight:700;letter-spacing:0.15em;color:#16a34a;text-transform:uppercase;margin:0 0 10px;">About the Barangay</p>
                <h2 style="font-size:36px;font-weight:800;color:#0f1f3d;margin:0 0 18px;line-height:1.15;">Serving the community of Sta. Lucia</h2>
                <p style="font-size:15px;color:#475569;line-height:1.75;margin:0 0 18px;">Barangay Sta. Lucia is located in Novaliches, Quezon City, one of the most progressive communities in District 5. We are dedicated to providing efficient, transparent, and accessible public services to all our residents.</p>
                <p style="font-size:15px;color:#475569;line-height:1.75;margin:0 0 24px;">This digital portal is our commitment to modernizing how we serve you — bringing barangay services online, reducing wait times, and ensuring every resident has a voice.</p>
                <div style="display:flex;gap:28px;flex-wrap:wrap;">
                    <div style="text-align:center;"><div style="font-size:32px;font-weight:800;color:#0f1f3d;">5,000+</div><div style="font-size:12px;color:#64748b;font-weight:600;">Registered residents</div></div>
                    <div style="width:1px;background:#e2e8f0;"></div>
                    <div style="text-align:center;"><div style="font-size:32px;font-weight:800;color:#0f1f3d;">24/7</div><div style="font-size:12px;color:#64748b;font-weight:600;">Online access</div></div>
                    <div style="width:1px;background:#e2e8f0;"></div>
                    <div style="text-align:center;"><div style="font-size:32px;font-weight:800;color:#0f1f3d;">7</div><div style="font-size:12px;color:#64748b;font-weight:600;">Sitios served</div></div>
                </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px 18px;box-shadow:0 2px 12px rgba(0,0,0,0.05);"><div style="font-size:26px;margin-bottom:10px;">🏛️</div><h4 style="font-size:13px;font-weight:700;color:#0f1f3d;margin:0 0 5px;">Good governance</h4><p style="font-size:12px;color:#64748b;margin:0;line-height:1.5;">Transparent operations and accountable public service.</p></div>
                <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px 18px;box-shadow:0 2px 12px rgba(0,0,0,0.05);"><div style="font-size:26px;margin-bottom:10px;">🤝</div><h4 style="font-size:13px;font-weight:700;color:#0f1f3d;margin:0 0 5px;">Community first</h4><p style="font-size:12px;color:#64748b;margin:0;line-height:1.5;">Every service is designed around your needs as a resident.</p></div>
                <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px 18px;box-shadow:0 2px 12px rgba(0,0,0,0.05);"><div style="font-size:26px;margin-bottom:10px;">💻</div><h4 style="font-size:13px;font-weight:700;color:#0f1f3d;margin:0 0 5px;">Digital innovation</h4><p style="font-size:12px;color:#64748b;margin:0;line-height:1.5;">Bringing e-government services to every household in Sta. Lucia.</p></div>
                <div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px 18px;box-shadow:0 2px 12px rgba(0,0,0,0.05);"><div style="font-size:26px;margin-bottom:10px;">🌱</div><h4 style="font-size:13px;font-weight:700;color:#0f1f3d;margin:0 0 5px;">Sustainability</h4><p style="font-size:12px;color:#64748b;margin:0;line-height:1.5;">Building a cleaner, safer, and greener barangay together.</p></div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section class="services-bg">`;

let i = idx.indexOf(OLD_SERVICES);
if (i === -1) { console.log('MISS about section'); } else { idx = idx.substring(0, i) + NEW_ABOUT_AND_SERVICES + idx.substring(i + OLD_SERVICES.length); console.log('OK about section'); }
fs.writeFileSync('index.html', idx);

// =====================================================================
// USER LOGIN (#19) — change Sign In button to forest green
// =====================================================================
let uLogin = fs.readFileSync('user-portal/login.html', 'utf8').replace(/\r\n/g, '\n');
const LOGIN_OLD = "style=\"background:#1e3a5f; color:#fff; font-family:inherit; box-shadow:0 4px 16px rgba(15,31,61,0.35);\"";
const LOGIN_NEW = "style=\"background:#16a34a; color:#fff; font-family:inherit; box-shadow:0 4px 16px rgba(22,163,74,0.35);\"";
const liIdx = uLogin.indexOf(LOGIN_OLD);
if (liIdx === -1) { console.log('MISS login btn'); } else {
    uLogin = uLogin.substring(0, liIdx) + LOGIN_NEW + uLogin.substring(liIdx + LOGIN_OLD.length);
    // Also fix the hover handlers
    uLogin = uLogin.replace("onmouseover=\"if(!this.disabled) this.style.background='#1a3a6b'\"", "onmouseover=\"if(!this.disabled) this.style.background='#15803d'\"");
    uLogin = uLogin.replace("onmouseout=\"if(!this.disabled) this.style.background='#0f1f3d'\"", "onmouseout=\"if(!this.disabled) this.style.background='#16a34a'\"");
    console.log('OK login btn green');
}
fs.writeFileSync('user-portal/login.html', uLogin);

// =====================================================================
// USER PORTAL (#21) — borrow button Forest Green
// =====================================================================
let uDash = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

// Change borrow button from blue #2563eb to green #16a34a (in equip card action button)
const OLD_BORROW_BTN = 'style="background:#2563eb;color:#fff;"><i class="bi bi-pencil-square"></i> Request to Borrow</button>';
const NEW_BORROW_BTN = 'style="background:#16a34a;color:#fff;"><i class="bi bi-pencil-square"></i> Request to Borrow</button>';
const bbIdx = uDash.indexOf(OLD_BORROW_BTN);
if (bbIdx === -1) { console.log('MISS borrow btn'); } else { uDash = uDash.substring(0, bbIdx) + NEW_BORROW_BTN + uDash.substring(bbIdx + OLD_BORROW_BTN.length); console.log('OK borrow btn green'); }

// Change equip-borrow-btn CSS inline style
const OLD_BORROW_CSS = "equip-borrow-btn w-full py-3 text-sm font-bold rounded-xl transition transform hover:-translate-y-1 shadow-md cursor-pointer border-none flex justify-center items-center gap-2\" style=\"background:#2563eb;color:#fff;\"";
const NEW_BORROW_CSS = "equip-borrow-btn w-full py-3 text-sm font-bold rounded-xl transition transform hover:-translate-y-1 shadow-md cursor-pointer border-none flex justify-center items-center gap-2\" style=\"background:#16a34a;color:#fff;\"";
const bCssIdx = uDash.indexOf(OLD_BORROW_CSS);
if (bCssIdx !== -1) { uDash = uDash.substring(0, bCssIdx) + NEW_BORROW_CSS + uDash.substring(bCssIdx + OLD_BORROW_CSS.length); console.log('OK borrow css green'); }
else { console.log('MISS borrow css'); }

// Concern submit button
const OLD_CSUB = "background:#1e3a5f;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;\" onmouseover=\"this.style.background='#0f2547'\" onmouseout=\"this.style.background='#1e3a5f'\">\n                            <i class=\"bi bi-send-fill\"></i> Submit Report";
const NEW_CSUB = "background:#16a34a;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;\" onmouseover=\"this.style.background='#15803d'\" onmouseout=\"this.style.background='#16a34a'\">\n                            <i class=\"bi bi-send-fill\"></i> Submit Report";
const csIdx = uDash.indexOf(OLD_CSUB);
if (csIdx !== -1) { uDash = uDash.substring(0, csIdx) + NEW_CSUB + uDash.substring(csIdx + OLD_CSUB.length); console.log('OK concern submit green'); }
else { console.log('MISS concern submit'); }

fs.writeFileSync('user-portal/user-dashboard.html', uDash);
console.log('Done user portal green changes');

// =====================================================================
// ADMIN PORTAL (#21) — active sidebar button Deep Blue #1e40af
// =====================================================================
let admin = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

const OLD_SIDEBAR_ACT = '.sidebar-btn.active { background: #2563EB !important; color: #fff !important; }';
const NEW_SIDEBAR_ACT = '.sidebar-btn.active { background: #1e40af !important; color: #fff !important; }';
const saIdx = admin.indexOf(OLD_SIDEBAR_ACT);
if (saIdx === -1) { console.log('MISS sidebar active'); } else { admin = admin.substring(0, saIdx) + NEW_SIDEBAR_ACT + admin.substring(saIdx + OLD_SIDEBAR_ACT.length); console.log('OK sidebar active #1e40af'); }

// (#23) Typography — change ALL CAPS section headers visible in admin portal
// Change sidebar section labels from all-caps to title case
admin = admin.replace(/text-transform:uppercase;.*?>Main</g, m => m.replace('>Main', '>Main'));
// Change key visible ALL CAPS labels in section headings
admin = admin.replace(/>ASSET MANAGEMENT</g, '>Asset Management<');
admin = admin.replace(/>MANAGEMENT</g, '>Management<');
admin = admin.replace(/>COMMUNITY</g, '>Community<');
admin = admin.replace(/>SECURITY</g, '>Security<');
admin = admin.replace(/>ANALYTICS</g, '>Analytics<');

fs.writeFileSync('admin-portal/admin.html', admin);
console.log('Done admin Deep Blue + typography');
