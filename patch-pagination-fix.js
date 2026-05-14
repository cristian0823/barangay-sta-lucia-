const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html', 'utf8').replace(/\r\n/g, '\n');

const OLD = "const info = document.getElementById('historyPaginationInfo');\n            if(info) info.textContent = `Page ${currentPageHistory} of ${totalPages}`;\n            \n            const prevBtn = document.querySelector('button[onclick=\"prevPageHistory()\"]');\n            const nextBtn = document.querySelector('button[onclick=\"nextPageHistory()\"]');\n            if(prevBtn) prevBtn.disabled = currentPageHistory === 1;\n            if(nextBtn) nextBtn.disabled = currentPageHistory === totalPages;\n        }";

const NEW = `_renderHistoryPagination(currentPageHistory, totalPages);
        }
        function _renderHistoryPagination(current, total) {
            const container = document.getElementById('historyPaginationContainer');
            if (!container) return;
            const btnBase = 'display:inline-flex;align-items:center;justify-content:center;min-width:36px;height:36px;padding:0 10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;border:1.5px solid;transition:all 0.15s;font-family:inherit;';
            const btnNormal = btnBase + 'background:#fff;border-color:#e2e8f0;color:#374151;';
            const btnActive = btnBase + 'background:#1e3a5f;border-color:#1e3a5f;color:#fff;';
            const btnDisabled = btnBase + 'background:#f3f4f6;border-color:#e2e8f0;color:#9ca3af;cursor:not-allowed;opacity:0.6;';
            const html = [];
            html.push('<button onclick="prevPageHistory()" ' + (current===1?'disabled':' ') + ' style="' + (current===1?btnDisabled:btnNormal) + '"><i class="bi bi-chevron-left"></i></button>');
            _getPageRange(current, total).forEach(function(p) {
                if (p === '...') {
                    html.push('<span style="padding:0 4px;color:#9ca3af;font-size:14px;line-height:36px;">&#8230;</span>');
                } else {
                    html.push('<button onclick="currentPageHistory=' + p + ';renderHistory()" style="' + (p===current?btnActive:btnNormal) + '">' + p + '</button>');
                }
            });
            html.push('<button onclick="nextPageHistory()" ' + (current===total?'disabled':' ') + ' style="' + (current===total?btnDisabled:btnNormal) + '"><i class="bi bi-chevron-right"></i></button>');
            container.innerHTML = html.join('');
        }
        function _getPageRange(current, total) {
            if (total <= 7) { var out=[]; for(var i=1;i<=total;i++) out.push(i); return out; }
            var pages = [];
            if (current <= 4) {
                for (var i=1;i<=5;i++) pages.push(i);
                pages.push('...'); pages.push(total);
            } else if (current >= total-3) {
                pages.push(1); pages.push('...');
                for (var i=total-4;i<=total;i++) pages.push(i);
            } else {
                pages.push(1); pages.push('...');
                for (var i=current-1;i<=current+1;i++) pages.push(i);
                pages.push('...'); pages.push(total);
            }
            return pages;
        }`;

const idx = c.indexOf(OLD);
if (idx === -1) { console.log('MISS: pagination JS target not found'); process.exit(1); }
c = c.substring(0, idx) + NEW + c.substring(idx + OLD.length);
fs.writeFileSync('user-portal/user-dashboard.html', c);
console.log('Done: pagination JS replaced');
