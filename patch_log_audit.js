const fs = require('fs');

try {
    let appJs = fs.readFileSync('js/app.js', 'utf8');

    const logActivityOld = `window.logActivity = async function(action, details, severity = 'info') {
    // Migration wrapper
    const actStr = action || '';
    const isSecurity = /Login|Logout|User|Password|OTP|Suspend|Role|Admin|Account/i.test(actStr);
    
    if (isSecurity) {
        let evType = actStr;
        if (actStr === 'Login') evType = 'LoginSuccess';
        else if (actStr === 'OTP') evType = 'OtpVerified';
        
        let authMethod = actStr.includes('OTP') ? 'OTP' : actStr.includes('Login') || actStr.includes('Password') ? 'Password' : 'N/A';
        await window.logSecurity(evType, authMethod, severity, details);
    } else {
        await window.logAudit(actStr, null, 'UPDATE', details);
    }
};`;

    const logActivityNew = `window.logActivity = async function(action, details, severity = 'info') {
    // Migration wrapper
    const actStr = action || '';
    const isSecurity = /Login|Logout|User|Password|OTP|Suspend|Role|Admin|Account/i.test(actStr);
    
    if (isSecurity) {
        let evType = actStr;
        if (actStr === 'Login') evType = 'LoginSuccess';
        else if (actStr === 'OTP') evType = 'OtpVerified';
        
        let authMethod = actStr.includes('OTP') ? 'OTP' : actStr.includes('Login') || actStr.includes('Password') ? 'Password' : 'N/A';
        await window.logSecurity(evType, authMethod, severity, details);
        
        // Ensure Account/User events ALSO show up in Audit Log!
        if (/Suspend|Delete|User|Role|Admin|Account/i.test(actStr)) {
            await window.logAudit('Account Management', null, actStr, details);
        }
    } else {
        await window.logAudit(actStr, null, 'UPDATE', details);
    }
};`;

    if (appJs.includes(logActivityOld)) {
        appJs = appJs.replace(logActivityOld, logActivityNew);
        fs.writeFileSync('js/app.js', appJs);
        console.log('Successfully updated logActivity in js/app.js');
    } else {
        console.log('Could not find logActivity in js/app.js to replace.');
    }
} catch (e) {
    console.error(e);
}
