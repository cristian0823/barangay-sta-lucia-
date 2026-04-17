const fs = require('fs');
let html = fs.readFileSync('clean_admin_base.html', 'utf8');

// 1. Fix the "const ico" syntax error introduced earlier
html = html.replace(/const ico\s+let _allReportTransactions = \[\];/g, 
`const icon = actionIcons[log.action] || '📝';
                                return \`<div class="feed-item" style="padding:10px 0;border-bottom:1px solid #f1f5f9;display:flex;align-items:flex-start;gap:12px;">
                                    <div style="font-size:18px;">\${icon}</div>
                                    <div>
                                        <div style="font-size:13px;font-weight:600;color:#1a2e1f;">\${log.action}</div>
                                        <div style="font-size:12px;color:#6b7280;margin-top:2px;">\${log.details}</div>
                                        <div style="font-size:11px;color:#94a3b8;margin-top:4px;">\${new Date(log.created_at).toLocaleDateString()} \${new Date(log.created_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                                    </div>
                                </div>\`;
                            }).join('');
                        }
                    } catch (e) {
                        feed.innerHTML = '<div style="text-align:center;padding:20px;color:#ef4444;font-size:13px;">Error loading feed</div>';
                    }
                }
            }

            let _allReportTransactions = [];`);

// 2. Safely replace native emojis with Bootstrap Icons for uniform UI across devices
html = html.replace(/🪪/g, '<i class="bi bi-person-badge"></i>');
html = html.replace(/🔐/g, '<i class="bi bi-shield-lock"></i>');
html = html.replace(/✅/g, '<i class="bi bi-check-circle-fill"></i>');
html = html.replace(/⚠️/g, '<i class="bi bi-exclamation-triangle-fill"></i>');
html = html.replace(/📦/g, '<i class="bi bi-box-fill"></i>');
html = html.replace(/📢/g, '<i class="bi bi-megaphone-fill"></i>');
html = html.replace(/📅/g, '<i class="bi bi-calendar-check-fill"></i>');
html = html.replace(/👥/g, '<i class="bi bi-people-fill"></i>');
html = html.replace(/⚙️/g, '<i class="bi bi-gear-fill"></i>');
html = html.replace(/❌/g, '<i class="bi bi-x-circle-fill"></i>');
html = html.replace(/📝/g, '<i class="bi bi-pencil-square"></i>');
html = html.replace(/🔧/g, '<i class="bi bi-tools"></i>');
html = html.replace(/📊/g, '<i class="bi bi-file-earmark-bar-graph-fill"></i>');
html = html.replace(/📈/g, '<i class="bi bi-graph-up"></i>');
html = html.replace(/🏢/g, '<i class="bi bi-building-fill"></i>');
html = html.replace(/🗑️/g, '<i class="bi bi-trash-fill"></i>');
html = html.replace(/🚪/g, '<i class="bi bi-box-arrow-right"></i>');

// Specifically for sidebar buttons for better alignment
html = html.replace(/<span class="nav-icon-box">(.*?)<\/span>/g, '<span class="nav-icon-box">$1</span>');

fs.writeFileSync('admin.html', html);
console.log('Restored and fixed admin.html! No syntax errors.');
