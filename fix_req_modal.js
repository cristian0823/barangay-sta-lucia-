const fs = require('fs');

try {
    let html = fs.readFileSync('admin.html', 'utf8');

    // Make Equipment Request modal NOT have max-height and NO overflow
    const requestRegex = /<div id="adminRequestModal"[\s\S]*?<div style="background:var\(--bg,#fff\); border-radius:24px; width:100%; max-width:560px; box-shadow:0 32px 80px rgba\(0,0,0,0.25\); max-height:90vh; overflow-y:auto; overflow-x:hidden; display:flex; flex-direction:column; position:relative;">/;
    const requestReplacement = '<div id="adminRequestModal"\n            style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); z-index:9000; align-items:center; justify-content:center; padding:16px;">\n            <div style="background:var(--bg,#fff); border-radius:24px; width:100%; max-width:560px; box-shadow:0 32px 80px rgba(0,0,0,0.25); max-height:none; overflow:hidden; display:flex; flex-direction:column; position:relative;">';
    
    html = html.replace(requestRegex, requestReplacement);

    fs.writeFileSync('admin.html', html);
    console.log('Fixed adminRequestModal');
} catch (e) {
    console.error(e);
}
