const fs = require('fs');
const files = ['admin.html', 'admin-portal/admin.html'];

for (const path of files) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Add the pointer arrow and fix positioning
    const oldDropdownStart = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 10px);right:0;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.18);z-index:99999;flex-direction:column;overflow:hidden;">`;
    
    // Changing right:0 to right:-10px and adding the little triangle pointer via a before-like element
    const newDropdownStart = `<div id="adminBellDropdown" onclick="event.stopPropagation()" style="display:none;position:absolute;top:calc(100% + 10px);right:-10px;width:350px;max-height:480px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.18);z-index:99999;flex-direction:column;overflow:visible;">
                        <div style="position:absolute;top:-6px;right:22px;width:12px;height:12px;background:#fff;border-left:1px solid #e5e7eb;border-top:1px solid #e5e7eb;transform:rotate(45deg);z-index:1;"></div>
                        <div style="position:relative;z-index:2;background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;max-height:100%;">`;

    if (content.includes(oldDropdownStart)) {
        content = content.replace(oldDropdownStart, newDropdownStart);
        
        // Find the end of the dropdown to close the extra wrapper div
        const oldDropdownEnd = `                            See all activity in Audit Log
                        </div>
                    </div>
                </div>`;
        const newDropdownEnd = `                            See all activity in Audit Log
                        </div>
                        </div>
                    </div>
                </div>`;
        content = content.replace(oldDropdownEnd, newDropdownEnd);
        
        console.log('Fixed dropdown alignment in', path);
    } else {
        console.log('Dropdown not found exactly in', path);
    }

    fs.writeFileSync(path, content, 'utf8');
}
