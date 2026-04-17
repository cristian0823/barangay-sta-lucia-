const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// 1. Stat Cards overhaul
// Find .stat-card CSS and rewrite
const newStatCardCSS = `.stat-card {
            background: var(--surface);
            padding: 24px;
            border-radius: var(--radius-xl);
            display: flex;
            align-items: center;
            gap: 20px;
            border: 1px solid var(--border);
            transition: var(--transition);
            box-shadow: var(--shadow-sm);
        }
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
            border-color: var(--green-200);
        }`;
html = html.replace(/\.stat-card\s*{[^}]+}\s*.stat-card:hover\s*{[^}]+}/, newStatCardCSS);

// Find .stat-icon CSS and rewrite it to be a bit more modern/rounded
const newStatIconCSS = `.stat-icon {
            width: 54px;
            height: 54px;
            border-radius: 18px;
            background: var(--panel-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: var(--primary);
            flex-shrink: 0;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }`;
html = html.replace(/\.stat-icon\s*{[^}]+}/, newStatIconCSS);

// Data table header styling update
const newDataTableCSS = `.data-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 15px;
            font-size: 14px;
        }

        .data-table th {
            text-align: left;
            padding: 16px 20px;
            color: var(--muted);
            font-weight: 600;
            border-bottom: 2px solid var(--border);
            background: var(--bg);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
        }

        .data-table td {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            color: var(--text);
            vertical-align: middle;
        }`;
// I will replace both .data-table css blocks if possible
html = html.replace(/\.data-table\s*{[^}]+}\s*.data-table th,\s*.data-table td\s*{[^}]+}\s*.data-table th\s*{[^}]+}/, newDataTableCSS);

// Also need to improve action cards (.quick-action-card)
const newActionCardCSS = `.quick-action-card {
            background: var(--surface);
            padding: 24px;
            border-radius: var(--radius-xl);
            display: flex;
            gap: 16px;
            cursor: pointer;
            transition: var(--transition);
            border: 1px solid var(--border);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
        }
        .quick-action-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
            border-color: var(--primary);
        }`;
html = html.replace(/\.quick-action-card\s*{[^}]+}\s*.quick-action-card:hover\s*{[^}]+}/, newActionCardCSS);

fs.writeFileSync('admin.html', html, 'utf8');
console.log('Admin UI upgraded successfully!');
