const fs = require('fs');

let html = fs.readFileSync('user-dashboard.html', 'utf8');

// 1. User stat cards overhaul (the tiny top cards)
const newUserStatCardCSS = `.user-stat-card {
            background: var(--surface);
            border-radius: var(--radius-xl);
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow-sm);
            transition: var(--transition);
        }
        .user-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }`;
html = html.replace(/\.user-stat-card\s*{[^}]+}/, newUserStatCardCSS);

// 2. User quick cards overhaul (the main action cards)
const newUserQuickCardCSS = `.user-quick-card {
            background: var(--surface);
            padding: 24px;
            border-radius: var(--radius-xl);
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: var(--transition);
            border: 1px solid var(--border);
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            width: 100%;
        }
        .user-quick-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 4px;
            background: var(--uqa-color, var(--primary));
            opacity: 0.8;
        }
        .user-quick-card:hover {
            border-color: var(--uqa-color, var(--primary));
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }`;
html = html.replace(/\.user-quick-card\s*{[^}]+}\s*.user-quick-card::before\s*{[^}]+}\s*.user-quick-card:hover\s*{[^}]+}/, newUserQuickCardCSS);

const newUqaIconCss = `.uqa-icon {
            font-size: 28px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: var(--panel-bg);
            color: var(--uqa-color, var(--primary));
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }`;
html = html.replace(/\.uqa-icon\s*{[^}]+}/, newUqaIconCss);

// Bottom tab nav upgrade for mobile
const newBottomNavCSS = `.bottom-tab-nav {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-top: 1px solid var(--border);
            display: none;
            justify-content: space-around;
            padding: 10px 5px 25px 5px;
            z-index: 1000;
            box-shadow: 0 -4px 16px rgba(0,0,0,0.04);
        }`;
html = html.replace(/\.bottom-tab-nav\s*{[^}]+}/, newBottomNavCSS);

// Make sure glass-cards (if present) are also nice
const newGlassCardCSS = `.glass-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-sm);
            overflow: hidden;
            transition: var(--transition);
        }`;
html = html.replace(/\.glass-card\s*{[^}]+}/, newGlassCardCSS);


fs.writeFileSync('user-dashboard.html', html, 'utf8');
console.log('User Dashboard UI upgraded successfully!');
