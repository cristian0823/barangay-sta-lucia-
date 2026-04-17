const fs = require('fs');

let html = fs.readFileSync('admin.html', 'utf8');

// Fix the syntax error from my massive overhaul replacement
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

fs.writeFileSync('admin.html', html, 'utf8');
console.log('Fixed admin.html syntax safely.');
