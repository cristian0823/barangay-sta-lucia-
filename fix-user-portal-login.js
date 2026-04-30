/**
 * fix-user-portal-login.js
 * Removes the accidental 2FA enforcement for residents in the user portal login.
 * Residents only use Barangay ID to log in, so they should bypass 2FA.
 * Also fixes the authMethod string to "Barangay ID" instead of "Google Auth".
 */
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'user-portal', 'login.html');
let html = fs.readFileSync(file, 'utf8');

// 1. Remove deferSession from loginUser call so it logs security correctly internally
// Wait, loginUser does not do IP check correctly for deferSession=false? Yes it does!
// Let's just rewrite the submit handler's success block completely.

const oldBlockStart = "// Call loginUser to authenticate\n                const result = await loginUser(username, password, rememberMe, { deferSession: true });";
const oldBlockFallback = "const result = await loginUser(username, password, rememberMe, { deferSession: true });";

// We will find the loginUser call and replace everything after it inside the try block.

const newSubmitHandler = `                // Call loginUser to authenticate (no deferSession for users since no 2FA)
                const result = await loginUser(username, password, rememberMe, { deferSession: false });

                if (result.success) {
                    resetLoginAttempts();
                    btn.disabled = false; btn.textContent = 'Sign In';

                    showToast('✅ Login successful! Redirecting...', 'success');
                    setTimeout(() => window.location.href = 'user-dashboard.html', 1000);
                } else {
                    btn.disabled = false; btn.textContent = 'Sign In';
                    if (result.message.includes('suspended')) {
                        showToast(result.message, 'error');
                    } else if (result.message.includes('locked')) {
                        showToast(result.message, 'error');
                    } else {
                        showToast('Invalid Barangay ID. Please try again.', 'error');
                        document.getElementById('username').value = '';
                        document.getElementById('username').focus();
                    }
                }
            } catch (err) {
                console.error('Login error:', err);
                const btn = document.getElementById('loginBtn');
                btn.disabled = false; btn.textContent = 'Sign In';
                showToast('An unexpected error occurred. Please try again.', 'error');
            }
        });`;

// Replace from `// Call loginUser...` to the end of the submit handler
html = html.replace(/\/\/ Call loginUser to authenticate[\s\S]*?\}\);\s*<\/script>/, newSubmitHandler + '\n    </script>');

fs.writeFileSync(file, html, { encoding: 'utf8' });
console.log('✅ Replaced user-portal login handler to bypass 2FA');
