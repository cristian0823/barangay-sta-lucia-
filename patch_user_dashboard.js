const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

// Patch renderEquipmentGrid
html = html.replace(
    /'<div class="flex items-start gap-4 mb-4 mt-2 relative z-0">' \+ getEquipmentIcon\(item\.name\) \+ /,
    `'<div class="flex items-start gap-4 mb-4 mt-2 relative z-0">' + (item.image_url ? '<img src="' + item.image_url + '" alt="' + item.name + '" style="width:48px;height:48px;border-radius:12px;object-fit:cover;border:1px solid #e5e7eb;">' : getEquipmentIcon(item.name)) + `
);

fs.writeFileSync('user-dashboard.html', html);
console.log("user-dashboard.html patched successfully.");
