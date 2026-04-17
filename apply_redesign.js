const fs = require('fs');

const premiumRootCSS = `:root {
            --green: #10b981;
            --green-dark: #059669;
            --green-xl: #047857;
            --green-50: #ecfdf5;
            --green-100: #d1fae5;
            --green-200: #a7f3d0;
            --green-600: #059669;
            --text: #0f172a;
            --muted: #64748b;
            --border: #e2e8f0;
            --surface: #ffffff;
            --panel-bg: #f8fafc;
            --bg: #f1f5f9;
            --radius-md: 12px;
            --radius-lg: 16px;
            --radius-xl: 24px;
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.025);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);
            --shadow-float: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02);
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --danger: #ef4444;
            --danger-bg: #fef2f2;
            --danger-border: #fecaca;
            --warning-bg: #fffbeb;
            --warning-border: #fde68a;
            --warning-text: #b45309;
            --primary: #10b981;
            --primary-dark: #059669;
            --white: #ffffff;
            --dark: #0f172a;
        }`;

const premiumDarkCSS = `[data-theme="dark"] {
            --green: #10b981;
            --green-dark: #059669;
            --green-xl: #34d399;
            --green-50: rgba(16, 185, 129, 0.05);
            --green-100: rgba(16, 185, 129, 0.1);
            --green-200: rgba(16, 185, 129, 0.2);
            --green-600: #10b981;
            --text: #f8fafc;
            --muted: #94a3b8;
            --border: #1e293b;
            --surface: #0f172a;
            --panel-bg: #020617;
            --bg: #020617;
            --danger: #f87171;
            --danger-bg: rgba(239, 68, 68, 0.1);
            --danger-border: rgba(239, 68, 68, 0.2);
            --warning-bg: rgba(245, 158, 11, 0.1);
            --warning-border: rgba(245, 158, 11, 0.2);
            --warning-text: #fcd34d;
            --primary: #10b981;
            --primary-dark: #059669;
            --white: #0f172a;
            --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.4);
            --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.5);
            --shadow-float: 0 20px 25px -5px rgba(0,0,0,0.6);
            --dark: #f8fafc;
        }`;

['admin.html', 'user-dashboard.html'].forEach(file => {
    if(fs.existsSync(file)) {
        let html = fs.readFileSync(file, 'utf8');
        
        // Remove BOM if present
        if (html.charCodeAt(0) === 0xFEFF || html.charCodeAt(0) === 65279) {
            html = html.substring(1);
        }

        // Clean any corrupted garbage comments completely
        html = html.replace(/\/\*\s*├뿯½┬뿯½├뿯½뿯ν뿯½뿯½[^]+?\*\//g, '');
        
        // Replace Fonts
        html = html.replace(/family=Inter/g, 'family=Plus+Jakarta+Sans');
        html = html.replace(/font-family: inherit;/g, "font-family: 'Plus Jakarta Sans', sans-serif;");
        html = html.replace(/\*\s*{\s*margin: 0;\s*padding: 0;\s*box-sizing: border-box;\s*}/g, "* {\n            margin: 0;\n            padding: 0;\n            box-sizing: border-box;\n            font-family: 'Plus Jakarta Sans', sans-serif;\n        }");

        // Replace Root CSS
        html = html.replace(/:root\s*{[^}]+}/, premiumRootCSS);
        html = html.replace(/\[data-theme="dark"\]\s*{[^}]+}/, premiumDarkCSS);

        // Enhance sidebar buttons (glassmorphism/gap)
        html = html.replace(/\.sidebar-btn\s*{[^}]+}/, ".sidebar-btn {\n            display: flex;\n            align-items: center;\n            gap: 16px;\n            width: 100%;\n            padding: 14px 16px;\n            border-radius: var(--radius-md);\n            border: none;\n            background: transparent;\n            color: var(--muted);\n            font-size: 15px;\n            font-weight: 600;\n            cursor: pointer;\n            transition: var(--transition);\n            text-align: left;\n            margin-bottom: 4px;\n        }");
        html = html.replace(/\.sidebar-btn.active\s*{[^}]+}/, ".sidebar-btn.active {\n            background: var(--surface);\n            color: var(--text);\n            box-shadow: var(--shadow-sm);\n        }");
        html = html.replace(/\.sidebar-btn:hover\s*{[^}]+}/, ".sidebar-btn:hover {\n            background: var(--surface);\n            color: var(--text);\n            box-shadow: var(--shadow-sm);\n        }");

        fs.writeFileSync(file, html, 'utf8');
        console.log('Processed CSS for ' + file);
    }
});
