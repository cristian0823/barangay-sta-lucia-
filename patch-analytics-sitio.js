const fs = require('fs');
let c = fs.readFileSync('admin-portal/admin.html', 'utf8').replace(/\r\n/g, '\n');

// ─── 1. Update _parsePurok to recognize Sitio I–VII ───────────────────────
const OLD_PARSE = `_parsePurok(address) {
                if (!address) return 'Others';
                var s = String(address);
                var m;
                m = s.match(/purok\\s*(?:no\\.?\\s*)?([a-z0-9]+)/i);
                if (m) return 'Purok ' + m[1].toUpperCase();
                m = s.match(/zone\\s*([a-z0-9]+)/i);
                if (m) return 'Zone ' + m[1].toUpperCase();
                m = s.match(/blk\\.?\\s*([a-z0-9]+)/i);
                if (m) return 'Blk ' + m[1].toUpperCase();
                m = s.match(/block\\s*([a-z0-9]+)/i);
                if (m) return 'Block ' + m[1].toUpperCase();
                m = s.match(/sitio\\s+(\\S+)/i);
                if (m) return 'Sitio ' + m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
                return 'Others';
            }`;

const NEW_PARSE = `_parsePurok(address) {
                if (!address) return 'Others';
                var s = String(address);
                // Explicit Sitio I–VII mention
                var sm = s.match(/sitio\\s+(VII|VI|IV|V{1,3}|III|II|I)/i);
                if (sm) return 'Sitio ' + sm[1].toUpperCase();
                // Map street names to Sitio
                var streetMap = [
                    ['I',   ['castro compound','plainville','pamanaville','sta. marcela','sta marcela','paguio','area trinidad','galvez','f. balagtas','f balagtas','balagtas st']],
                    ['II',  ['j. rizal st','j rizal st','a. luna','a luna st','riveraville','marco polo','e. jacinto','e jacinto','diego silang','panganiban','m.h. del pilar','del pilar','m. aquino','m aquino']],
                    ['III', ['j.p. rizal','jp rizal','aguinaldo','lakandula','lopez jaena','p. bukaneg','bukaneg','san francisco subd','interior 19','interior 21','panday pira']],
                    ['IV',  ['p. gomez','p gomez','p. burgos','p burgos','zamora','naning ponce','jose basa','homabon']],
                    ['V',   ['t. alonzo','t alonzo','sta. lucia avenue','sta lucia ave','natividad subd','natividad subdivision','p. soliman','p soliman']],
                    ['VI',  ['f. agoncillo','f agoncillo','agoncillo','veronica court','villa carmen']],
                    ['VII', ['f. calderon','f calderon','calderon st','jose palma','lapu-lapu','lapu lapu','tarrahville']]
                ];
                var sl = s.toLowerCase();
                for (var i = 0; i < streetMap.length; i++) {
                    var roman = streetMap[i][0], streets = streetMap[i][1];
                    for (var j = 0; j < streets.length; j++) {
                        if (sl.indexOf(streets[j]) !== -1) return 'Sitio ' + roman;
                    }
                }
                // Legacy fallbacks
                var m;
                m = s.match(/purok\\s*(?:no\\.?\\s*)?([a-z0-9]+)/i);
                if (m) return 'Purok ' + m[1].toUpperCase();
                m = s.match(/zone\\s*([a-z0-9]+)/i);
                if (m) return 'Zone ' + m[1].toUpperCase();
                return 'Others';
            }`;

var idx = c.indexOf(OLD_PARSE);
if (idx === -1) { console.log('MISS _parsePurok'); process.exit(1); }
c = c.substring(0, idx) + NEW_PARSE + c.substring(idx + OLD_PARSE.length);
console.log('OK _parsePurok');

// ─── 2. Update loadAnalytics to also load facility_reservations ────────────
const OLD_LOAD_END = `                renderAnalytics(requests, concerns);
            }`;

const NEW_LOAD_END = `                // Load facility reservations with user address
                var reservations = [];
                try {
                    var { data: rData } = await supabase
                        .from('facility_reservations')
                        .select('id,created_at,status,users(address)');
                    if (rData && rData.length) {
                        reservations = rData.map(function(r) {
                            return { id: r.id, created_at: r.created_at, status: r.status,
                                     address: (r.users && r.users.address) || '' };
                        });
                    }
                } catch(e) {}

                renderAnalytics(requests, concerns, reservations);
            }`;

idx = c.indexOf(OLD_LOAD_END);
if (idx === -1) { console.log('MISS loadAnalytics end'); process.exit(1); }
c = c.substring(0, idx) + NEW_LOAD_END + c.substring(idx + OLD_LOAD_END.length);
console.log('OK loadAnalytics');

// ─── 3. Update renderAnalytics signature and add reservations processing ──
const OLD_RENDER_SIG = `            function renderAnalytics(requests, concerns) {
                requests = requests || [];
                concerns = concerns || [];`;

const NEW_RENDER_SIG = `            function renderAnalytics(requests, concerns, reservations) {
                requests = requests || [];
                concerns = concerns || [];
                reservations = reservations || [];`;

idx = c.indexOf(OLD_RENDER_SIG);
if (idx === -1) { console.log('MISS renderAnalytics sig'); process.exit(1); }
c = c.substring(0, idx) + NEW_RENDER_SIG + c.substring(idx + OLD_RENDER_SIG.length);
console.log('OK renderAnalytics sig');

// ─── 4. Update allAreasSet to include reservations ────────────────────────
const OLD_AREAS = `                requests.forEach(function(r) { allAreasSet[getArea(r)] = 1; });
                concerns.forEach(function(c) { allAreasSet[getArea(c)] = 1; });`;

const NEW_AREAS = `                requests.forEach(function(r) { allAreasSet[getArea(r)] = 1; });
                concerns.forEach(function(c) { allAreasSet[getArea(c)] = 1; });
                reservations.forEach(function(r) { allAreasSet[getArea(r)] = 1; });`;

idx = c.indexOf(OLD_AREAS);
if (idx === -1) { console.log('MISS allAreasSet'); process.exit(1); }
c = c.substring(0, idx) + NEW_AREAS + c.substring(idx + OLD_AREAS.length);
console.log('OK allAreasSet');

// ─── 5. Update passFilter and area counting to include reservations ────────
const OLD_FILTER = `                var filtReq = requests.filter(passFilter);
                var filtCon = concerns.filter(passFilter);

                // Count by area
                var reqByArea = {}, conByArea = {};
                filtReq.forEach(function(r) { var a=getArea(r); reqByArea[a]=(reqByArea[a]||0)+1; });
                filtCon.forEach(function(c) { var a=getArea(c); conByArea[a]=(conByArea[a]||0)+1; });

                var reqAreas = Object.entries(reqByArea).sort(function(a,b){return b[1]-a[1];});
                var conAreas = Object.entries(conByArea).sort(function(a,b){return b[1]-a[1];});

                // Most active combined area
                var combined = {};
                Object.entries(reqByArea).forEach(function(e){combined[e[0]]=(combined[e[0]]||0)+e[1];});
                Object.entries(conByArea).forEach(function(e){combined[e[0]]=(combined[e[0]]||0)+e[1];});
                var topArea = Object.entries(combined).sort(function(a,b){return b[1]-a[1];})[0];`;

const NEW_FILTER = `                var filtReq = requests.filter(passFilter);
                var filtCon = concerns.filter(passFilter);
                var filtRes = reservations.filter(passFilter);

                // Count by area
                var reqByArea = {}, conByArea = {}, resByArea = {};
                filtReq.forEach(function(r) { var a=getArea(r); reqByArea[a]=(reqByArea[a]||0)+1; });
                filtCon.forEach(function(c) { var a=getArea(c); conByArea[a]=(conByArea[a]||0)+1; });
                filtRes.forEach(function(r) { var a=getArea(r); resByArea[a]=(resByArea[a]||0)+1; });

                var reqAreas = Object.entries(reqByArea).sort(function(a,b){return b[1]-a[1];});
                var conAreas = Object.entries(conByArea).sort(function(a,b){return b[1]-a[1];});
                var resAreas = Object.entries(resByArea).sort(function(a,b){return b[1]-a[1];});

                // Most active combined area
                var combined = {};
                Object.entries(reqByArea).forEach(function(e){combined[e[0]]=(combined[e[0]]||0)+e[1];});
                Object.entries(conByArea).forEach(function(e){combined[e[0]]=(combined[e[0]]||0)+e[1];});
                Object.entries(resByArea).forEach(function(e){combined[e[0]]=(combined[e[0]]||0)+e[1];});
                var topArea = Object.entries(combined).sort(function(a,b){return b[1]-a[1];})[0];`;

idx = c.indexOf(OLD_FILTER);
if (idx === -1) { console.log('MISS filter section'); process.exit(1); }
c = c.substring(0, idx) + NEW_FILTER + c.substring(idx + OLD_FILTER.length);
console.log('OK filter section');

// ─── 6. Update KPI cards render and add reservations KPI ──────────────────
const OLD_KPI = `                if(el('analyticsKpiRequests')) el('analyticsKpiRequests').textContent = filtReq.length;
                if(el('analyticsKpiConcerns')) el('analyticsKpiConcerns').textContent = filtCon.length;
                if(el('analyticsKpiTopArea'))  el('analyticsKpiTopArea').textContent  = topArea ? topArea[0] : '—';
                if(el('analyticsKpiTopCat'))   el('analyticsKpiTopCat').textContent   = topCat  ? topCat[0]  : '—';`;

const NEW_KPI = `                if(el('analyticsKpiRequests'))     el('analyticsKpiRequests').textContent     = filtReq.length;
                if(el('analyticsKpiConcerns'))     el('analyticsKpiConcerns').textContent     = filtCon.length;
                if(el('analyticsKpiReservations')) el('analyticsKpiReservations').textContent = filtRes.length;
                if(el('analyticsKpiTopArea'))      el('analyticsKpiTopArea').textContent      = topArea ? topArea[0] : '—';`;

idx = c.indexOf(OLD_KPI);
if (idx === -1) { console.log('MISS KPI render'); process.exit(1); }
c = c.substring(0, idx) + NEW_KPI + c.substring(idx + OLD_KPI.length);
console.log('OK KPI render');

// ─── 7. Add reservations chart rendering ──────────────────────────────────
const OLD_CON_CHART = `                // Concerns chart
                if(el('analyticsConChartEmpty')) el('analyticsConChartEmpty').style.display = (conAreas.length===0) ? 'block' : 'none';
                if(el('concernsByAreaChart'))    el('concernsByAreaChart').style.display    = (conAreas.length===0) ? 'none'  : 'block';
                if (conAreas.length) {
                    _analyticsRenderBarChart('concernsByAreaChart', '_analyticsConChart', conAreas.slice(0,10), '#CE1126', 'Concerns');
                }

                // Ranked tables
                _analyticsRenderTable('analyticsReqTableBody', reqAreas);
                _analyticsRenderTable('analyticsConTableBody', conAreas);`;

const NEW_CON_CHART = `                // Concerns chart
                if(el('analyticsConChartEmpty')) el('analyticsConChartEmpty').style.display = (conAreas.length===0) ? 'block' : 'none';
                if(el('concernsByAreaChart'))    el('concernsByAreaChart').style.display    = (conAreas.length===0) ? 'none'  : 'block';
                if (conAreas.length) {
                    _analyticsRenderBarChart('concernsByAreaChart', '_analyticsConChart', conAreas.slice(0,10), '#CE1126', 'Concerns');
                }

                // Reservations chart
                if(el('analyticsResChartEmpty')) el('analyticsResChartEmpty').style.display = (resAreas.length===0) ? 'block' : 'none';
                if(el('reservationsByAreaChart')) el('reservationsByAreaChart').style.display = (resAreas.length===0) ? 'none' : 'block';
                if (resAreas.length) {
                    _analyticsRenderBarChart('reservationsByAreaChart', '_analyticsResChart', resAreas.slice(0,10), '#0369A1', 'Reservations');
                }

                // Ranked tables
                _analyticsRenderTable('analyticsReqTableBody', reqAreas);
                _analyticsRenderTable('analyticsConTableBody', conAreas);
                _analyticsRenderTable('analyticsResTableBody', resAreas);`;

idx = c.indexOf(OLD_CON_CHART);
if (idx === -1) { console.log('MISS concerns chart section'); process.exit(1); }
c = c.substring(0, idx) + NEW_CON_CHART + c.substring(idx + OLD_CON_CHART.length);
console.log('OK concerns chart + reservations chart JS');

// ─── 8. Update KPI HTML: replace Top Concern Type card with Reservations ──
const OLD_KPI_HTML = `        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:18px 20px;display:flex;align-items:flex-start;gap:14px;">
            <div style="width:42px;height:42px;background:#F0FDF4;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-tag-fill" style="font-size:18px;color:#16A34A;"></i></div>
            <div style="min-width:0;">
                <div style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Top Concern Type</div>
                <div id="analyticsKpiTopCat" style="font-size:15px;font-weight:800;color:#1A1A2E;line-height:1.2;word-break:break-word;">—</div>
            </div>
        </div>`;

const NEW_KPI_HTML = `        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:18px 20px;display:flex;align-items:flex-start;gap:14px;">
            <div style="width:42px;height:42px;background:#E0F2FE;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-calendar-check-fill" style="font-size:18px;color:#0369A1;"></i></div>
            <div>
                <div style="font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">Total Reservations</div>
                <div id="analyticsKpiReservations" style="font-size:26px;font-weight:800;color:#1A1A2E;line-height:1;">—</div>
            </div>
        </div>`;

idx = c.indexOf(OLD_KPI_HTML);
if (idx === -1) { console.log('MISS KPI HTML Top Concern Type'); process.exit(1); }
c = c.substring(0, idx) + NEW_KPI_HTML + c.substring(idx + OLD_KPI_HTML.length);
console.log('OK KPI HTML');

// ─── 9. Update charts row HTML: change to 3-col grid + add reservations ───
const OLD_CHARTS_HTML = `    <!-- CHARTS ROW -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:8px;height:8px;background:#1A3A6B;border-radius:50%;"></div>
                <span style="font-size:14px;font-weight:700;color:#1A1A2E;">Requests by Area</span>
            </div>
            <div id="analyticsReqChartWrap" style="position:relative;height:260px;display:flex;align-items:center;justify-content:center;">
                <canvas id="requestsByAreaChart"></canvas>
                <div id="analyticsReqChartEmpty" style="display:none;color:#9CA3AF;font-size:13px;text-align:center;"><i class="bi bi-bar-chart" style="font-size:28px;display:block;margin-bottom:8px;"></i>No address data for requests</div>
            </div>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:8px;height:8px;background:#CE1126;border-radius:50%;"></div>
                <span style="font-size:14px;font-weight:700;color:#1A1A2E;">Concerns by Area</span>
            </div>
            <div id="analyticsConChartWrap" style="position:relative;height:260px;display:flex;align-items:center;justify-content:center;">
                <canvas id="concernsByAreaChart"></canvas>
                <div id="analyticsConChartEmpty" style="display:none;color:#9CA3AF;font-size:13px;text-align:center;"><i class="bi bi-bar-chart" style="font-size:28px;display:block;margin-bottom:8px;"></i>No concern data available</div>
            </div>
        </div>
    </div>`;

const NEW_CHARTS_HTML = `    <!-- CHARTS ROW -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:8px;height:8px;background:#1A3A6B;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Equipment Requests by Sitio</span>
            </div>
            <div id="analyticsReqChartWrap" style="position:relative;height:220px;display:flex;align-items:center;justify-content:center;">
                <canvas id="requestsByAreaChart"></canvas>
                <div id="analyticsReqChartEmpty" style="display:none;color:#9CA3AF;font-size:13px;text-align:center;"><i class="bi bi-bar-chart" style="font-size:28px;display:block;margin-bottom:8px;"></i>No data yet</div>
            </div>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:8px;height:8px;background:#CE1126;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Concerns by Sitio</span>
            </div>
            <div id="analyticsConChartWrap" style="position:relative;height:220px;display:flex;align-items:center;justify-content:center;">
                <canvas id="concernsByAreaChart"></canvas>
                <div id="analyticsConChartEmpty" style="display:none;color:#9CA3AF;font-size:13px;text-align:center;"><i class="bi bi-bar-chart" style="font-size:28px;display:block;margin-bottom:8px;"></i>No data yet</div>
            </div>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:20px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="width:8px;height:8px;background:#0369A1;border-radius:50%;"></div>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Facility Reservations by Sitio</span>
            </div>
            <div id="analyticsResChartWrap" style="position:relative;height:220px;display:flex;align-items:center;justify-content:center;">
                <canvas id="reservationsByAreaChart"></canvas>
                <div id="analyticsResChartEmpty" style="display:none;color:#9CA3AF;font-size:13px;text-align:center;"><i class="bi bi-bar-chart" style="font-size:28px;display:block;margin-bottom:8px;"></i>No data yet</div>
            </div>
        </div>
    </div>`;

idx = c.indexOf(OLD_CHARTS_HTML);
if (idx === -1) { console.log('MISS charts row HTML'); process.exit(1); }
c = c.substring(0, idx) + NEW_CHARTS_HTML + c.substring(idx + OLD_CHARTS_HTML.length);
console.log('OK charts row HTML');

// ─── 10. Update ranked tables HTML: change to 3-col + add reservations ────
const OLD_TABLES_HTML = `    <!-- RANKED TABLES -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-trophy-fill" style="color:#FDB913;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Areas — Equipment Requests</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#F9FAFB;"><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;width:38px;">#</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Area</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Count</th></tr></thead>
                <tbody id="analyticsReqTableBody"></tbody>
            </table>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-trophy-fill" style="color:#CE1126;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Areas — Concerns</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#F9FAFB;"><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;width:38px;">#</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Area</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Count</th></tr></thead>
                <tbody id="analyticsConTableBody"></tbody>
            </table>
        </div>
    </div>
</div>`;

const NEW_TABLES_HTML = `    <!-- RANKED TABLES -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;">
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-trophy-fill" style="color:#FDB913;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Equipment</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#F9FAFB;"><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;width:28px;">#</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Sitio</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Count</th></tr></thead>
                <tbody id="analyticsReqTableBody"></tbody>
            </table>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-trophy-fill" style="color:#CE1126;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Concerns</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#F9FAFB;"><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;width:28px;">#</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Sitio</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Count</th></tr></thead>
                <tbody id="analyticsConTableBody"></tbody>
            </table>
        </div>
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;">
            <div style="padding:14px 18px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;gap:10px;">
                <i class="bi bi-trophy-fill" style="color:#0369A1;font-size:14px;"></i>
                <span style="font-size:13px;font-weight:700;color:#1A1A2E;">Top Sitios — Reservations</span>
            </div>
            <table style="width:100%;border-collapse:collapse;">
                <thead><tr style="background:#F9FAFB;"><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;width:28px;">#</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Sitio</th><th style="padding:9px 12px;font-size:11px;font-weight:700;color:#6B7280;text-align:left;">Count</th></tr></thead>
                <tbody id="analyticsResTableBody"></tbody>
            </table>
        </div>
    </div>
</div>`;

idx = c.indexOf(OLD_TABLES_HTML);
if (idx === -1) { console.log('MISS ranked tables HTML'); process.exit(1); }
c = c.substring(0, idx) + NEW_TABLES_HTML + c.substring(idx + OLD_TABLES_HTML.length);
console.log('OK ranked tables HTML');

// ─── 11. Update Area/Purok label to Sitio / Area ─────────────────────────
const OLD_LABEL = `<div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em;">Area / Purok</div>`;
const NEW_LABEL = `<div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.05em;">Filter by Sitio</div>`;

idx = c.indexOf(OLD_LABEL);
if (idx === -1) { console.log('MISS area label'); process.exit(1); }
c = c.substring(0, idx) + NEW_LABEL + c.substring(idx + OLD_LABEL.length);
console.log('OK area label');

fs.writeFileSync('admin-portal/admin.html', c);
console.log('DONE — admin.html updated');
