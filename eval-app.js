const fs = require('fs');

global.window = {};
global.document = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {} };
global.BroadcastChannel = class { constructor() {} postMessage() {} };
global.crypto = { subtle: {} };
global.location = { replace: () => {} };
global.supabase = undefined;

try {
    const code = fs.readFileSync('js/app.js', 'utf8');
    eval(code);
    console.log("SUCCESS");
} catch(e) {
    console.error("RUNTIME ERROR:", e);
}
