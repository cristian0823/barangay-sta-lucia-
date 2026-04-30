const fs = require('fs');
const file = 'user-portal/login.html';
const lines = fs.readFileSync(file, 'utf8').split('\n');

const newBlock = `                // Call loginUser to authenticate (no deferSession for users since no 2FA)
                const result = await loginUser(username, password, rememberMe, { deferSession: false });

                if (result.success) {
                    resetLoginAttempts();
                    btn.disabled = false; btn.textContent = 'Sign In';

                    showToast('✅ Login successful! Redirecting...', 'success');
                    setTimeout(() => window.location.href = 'user-dashboard.html', 1000);
                } else {
                    btn.disabled = false; btn.textContent = 'Sign In';
                    recordFailedAttempt(username);
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

// Lines 578 (0-indexed) to 695 (0-indexed) corresponds to lines 579-696.
lines.splice(578, 696 - 579 + 1, newBlock);

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log('✅ Success replacing user login handler!');
