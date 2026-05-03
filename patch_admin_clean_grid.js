const fs = require('fs');

let html = fs.readFileSync('admin_clean.html', 'utf8');

// The replacement logic:
const searchString = `                    <td>
                        <div style="display:flex;align-items:center;gap:12px;">
                            <div class="eq-icon \${iconCls}">\${iconHtml}</div>`;

const replaceString = `                    <td>
                        <div style="display:flex;align-items:center;gap:12px;">
                            \${e.image_url ? \`<img src="\${e.image_url}" alt="\${e.name}" style="width:40px;height:40px;border-radius:12px;object-fit:cover;border:1px solid var(--border);">\` : \`<div class="eq-icon \${iconCls}">\${iconHtml}</div>\`}`;

html = html.replace(searchString, replaceString);

fs.writeFileSync('admin_clean.html', html);
console.log('Fixed admin_clean.html grid logic.');
