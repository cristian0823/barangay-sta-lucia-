
window.logAudit = async function(entityType, entityId, action, details) {
    // Local fallback
    const logs = JSON.parse(localStorage.getItem(LOCAL_AUDIT_LOG_KEY)) || [];
    logs.push({
        id: Date.now(), user_id: (getCurrentUser() || {}).id || null,
        entity_type: entityType, entity_id: entityId, action: action, details: details,
        created_at: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_AUDIT_LOG_KEY, JSON.stringify(logs));

    try {
        const u = getCurrentUser() || {};
        if (window.supabase) {
            await supabase.from('audit_log').insert([{
                user_id: u.id || null,
                entity_type: entityType || 'System',
                entity_id: entityId,
                action: action,
                details: details
            }]);
        }
    } catch(e) { console.error('logAudit failed', e); }
};

window.logSecurity = async function(eventType, authMethod, severity, details, targetUsername = null) {
    let ip = 'Unknown';
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip = ipData.ip;
    } catch(e) {}

    // Local fallback
    const logs = JSON.parse(localStorage.getItem(LOCAL_SECURITY_LOG_KEY)) || [];
    logs.push({
        id: Date.now(), user_id: (getCurrentUser() || {}).id || null,
        target_username: targetUsername, event_type: eventType, auth_method: authMethod, 
        severity: severity, ip_address: ip, device_info: navigator.userAgent, details: details,
        created_at: new Date().toISOString()
    });
    localStorage.setItem(LOCAL_SECURITY_LOG_KEY, JSON.stringify(logs));

    try {
        const u = getCurrentUser() || {};
        const device = navigator.userAgent;

        if (window.supabase) {
            await supabase.from('security_log').insert([{
                user_id: u.id || null,
                target_username: targetUsername || u.username || null,
                event_type: eventType,
                auth_method: authMethod || 'System',
                severity: severity,
                ip_address: ip,
                device_info: device,
                details: details
            }]);
        }
    } catch(e) { console.error('logSecurity failed', e); }
};

window.logActivity = async function(action, details, severity = 'info') {
    // Migration wrapper
    const actStr = action || '';
    const isSecurity = /Login|Logout|User|Password|OTP|Suspend|Role|Admin|Account/i.test(actStr);
    
    if (isSecurity) {
        let evType = actStr.includes('OTP') ? 'OtpVerified' : actStr.includes('Login') ? 'LoginSuccess' : actStr;
        let authMethod = actStr.includes('OTP') ? 'OTP' : actStr.includes('Login') || actStr.includes('Password') ? 'Password' : 'N/A';
        await window.logSecurity(evType, authMethod, severity, details);
    } else {
        await window.logAudit(actStr, null, 'UPDATE', details);
    }
};


// Barangay Website - Main JavaScript

// Initialize local storage on load - MUST be first!
if (typeof localStorage !== 'undefined') {
    // Initialize default users
    const storedUsers = localStorage.getItem('barangay_local_users');
    if (!storedUsers) {
        const defaultUsers = [
            { id: 1, username: 'admin1', password: 'admin123', fullName: 'Barangay Administrator', email: 'cristianjames0808@gmail.com', role: 'admin', avatar: 'A' },
            { id: 2, username: 'admin2', password: 'admin123', fullName: 'Barangay Admin 2', email: 'admin2@barangay.gov', role: 'admin', avatar: 'B' },
            { id: 3, username: 'user', password: 'user123', fullName: 'Barangay Resident', email: 'user@barangay.gov', role: 'user', avatar: 'U' }
        ];
        localStorage.setItem('barangay_local_users', JSON.stringify(defaultUsers));
    }
    // Initialize default equipment
    const storedEquipment = localStorage.getItem('barangay_local_equipment');
    if (!storedEquipment) {
        const defaultEquipment = [
            { id: 1, name: 'Chairs', quantity: 150, available: 150, icon: '🪑', description: 'Plastic folding chairs' },
            { id: 2, name: 'Tables', quantity: 3, available: 3, icon: '🪵', description: 'Tables (subject for availability)' },
            { id: 3, name: 'Tents', quantity: 5, available: 5, icon: '⛺', description: 'Event tents' },
            { id: 4, name: 'Ladder', quantity: 1, available: 1, icon: '🪜', description: 'Ladder (Barangay use only)' },
            { id: 5, name: 'Microphone', quantity: 1, available: 1, icon: '🎤', description: 'Microphone (Barangay only)' },
            { id: 6, name: 'Speaker', quantity: 1, available: 1, icon: '🔊', description: 'Speaker (Barangay only)' },
            { id: 7, name: 'Electric Fan', quantity: 5, available: 5, icon: '🌀', description: 'Electric Fan (For big events)' }
        ];
        localStorage.setItem('barangay_local_equipment', JSON.stringify(defaultEquipment));
    }
}

// Local storage key for offline authentication
const LOCAL_USERS_KEY = 'barangay_local_users';
const LOCAL_EQUIPMENT_KEY = 'barangay_local_equipment';
const LOCAL_BORROWINGS_KEY = 'barangay_local_borrowings';
const LOCAL_CONCERNS_KEY = 'barangay_local_concerns';
const LOCAL_EVENTS_KEY = 'barangay_local_events';
const LOCAL_BOOKINGS_KEY = 'barangay_local_bookings';

// Initialize default users in localStorage if not exists
const LOCAL_AUDIT_LOG_KEY = 'barangay_local_audit_log';
const LOCAL_SECURITY_LOG_KEY = 'barangay_local_security_log';
const LOCAL_NOTIFICATIONS_KEY = 'barangay_local_notifications';

// Cross-tab synchronization channel
const appSyncChannel = new BroadcastChannel('barangay_app_sync');
function broadcastSync() {
    appSyncChannel.postMessage({ type: 'SYNC_NEEDED', timestamp: Date.now() });
}

function initializeLocalUsers() {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    if (!stored) {
        const defaultUsers = [
            { id: 1, username: 'admin1', password: 'admin123', fullName: 'Barangay Administrator', email: 'cristianjames0808@gmail.com', role: 'admin', avatar: 'A' },
            { id: 2, username: 'admin2', password: 'admin123', fullName: 'Barangay Admin 2', email: 'cristianalfonso0823@gmail.com', role: 'admin', avatar: 'B' },
            { id: 3, username: 'user', password: 'user123', fullName: 'Barangay Resident', email: 'user@barangay.gov', role: 'user', avatar: 'U' }
        ];
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
    } else {
        // Ensure admin2 exists in existing localStorage
        const users = JSON.parse(stored);
        const hasAdmin2 = users.some(u => u.username === 'admin2');
        if (!hasAdmin2) {
            users.push({ id: Date.now(), username: 'admin2', password: 'admin123', fullName: 'Barangay Admin 2', email: 'cristianalfonso0823@gmail.com', role: 'admin', avatar: 'B' });
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        }
        // Also rename 'admin' to 'admin1' if old default exists
        const hasAdmin1 = users.some(u => u.username === 'admin1');
        if (!hasAdmin1) {
            const adminIdx = users.findIndex(u => u.username === 'admin' && u.role === 'admin');
            if (adminIdx !== -1) {
                users[adminIdx].username = 'admin1';
                localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
            }
        }
        
        // Auto-fix admin1 email to new target
        const admin1Idx = users.findIndex(u => u.username === 'admin1');
        if (admin1Idx !== -1 && users[admin1Idx].email !== 'cristianjames0808@gmail.com') {
            users[admin1Idx].email = 'cristianjames0808@gmail.com';
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        }

        // Auto-fix admin2 email to new target
        const admin2Idx = users.findIndex(u => u.username === 'admin2');
        if (admin2Idx !== -1 && users[admin2Idx].email !== 'cristianalfonso0823@gmail.com') {
            users[admin2Idx].email = 'cristianalfonso0823@gmail.com';
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        }
    }
}

// Initialize default equipment in localStorage if not exists
function initializeLocalEquipment() {
    const stored = localStorage.getItem(LOCAL_EQUIPMENT_KEY);
    if (!stored) {
        const defaultEquipment = [
            { id: 1, name: 'Chairs', quantity: 150, available: 150, icon: '🪑', description: 'Plastic folding chairs' },
            { id: 2, name: 'Tables', quantity: 3, available: 3, icon: '🪵', description: 'Tables (subject for availability)' },
            { id: 3, name: 'Tents', quantity: 5, available: 5, icon: '⛺', description: 'Event tents' },
            { id: 4, name: 'Ladder', quantity: 1, available: 1, icon: '🪜', description: 'Ladder (Barangay use only)' },
            { id: 5, name: 'Microphone', quantity: 1, available: 1, icon: '🎤', description: 'Microphone (Barangay only)' },
            { id: 6, name: 'Speaker', quantity: 1, available: 1, icon: '🔊', description: 'Speaker (Barangay only)' },
            { id: 7, name: 'Electric Fan', quantity: 5, available: 5, icon: '🌀', description: 'Electric Fan (For big events)' }
        ];
        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(defaultEquipment));
    }
}

// Initialize local storage data
initializeLocalEquipment();

// Check if Supabase is available
async function isSupabaseAvailable() {
    try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        console.log("Supabase check - data:", data, "error:", error);
        return !error;
    } catch (e) {
        console.log("Supabase check - exception:", e);
        return false;
    }
}

// Initialize local storage users on load
initializeLocalUsers();

// Auth Functions
// Security Utility
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function registerUser(userData) {
    // Try Supabase first, fallback to local
    const supabaseAvailable = await isSupabaseAvailable();
    const hashedPassword = await hashPassword(userData.password);

    if (supabaseAvailable) {
        const { data: existingUsername } = await supabase
            .from('users')
            .select('*')
            .eq('username', userData.username);

        if (existingUsername && existingUsername.length > 0) {
            return { success: false, message: 'Username already exists' };
        }

        const { data: existingEmail } = await supabase
            .from('users')
            .select('*')
            .eq('email', userData.email);

        if (existingEmail && existingEmail.length > 0) {
            return { success: false, message: 'Email already registered' };
        }

        const { data: existingPhone } = await supabase
            .from('users')
            .select('*')
            .eq('phone', userData.phone);

        if (existingPhone && existingPhone.length > 0) {
            return { success: false, message: 'Phone number already registered' };
        }

        const { error } = await supabase
            .from('users')
            .insert([{
                username: userData.username,
                password: hashedPassword,
                full_name: userData.fullName,
                email: userData.email,
                phone: userData.phone || null,
                address: userData.address || null,
                role: 'user',
                avatar: (userData.firstName || userData.fullName).charAt(0).toUpperCase()
            }]);

        if (error) return { success: false, message: error.message };
        await logActivity('User Registered', `New user registered: ${userData.username}`);
        return { success: true, message: 'Registration successful! You can now login.' };
    } else {
        // Local fallback
        initializeLocalUsers();
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));

        if (users.find(u => u.username === userData.username)) {
            return { success: false, message: 'Username already exists' };
        }
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        if (users.find(u => u.phone === userData.phone)) {
            return { success: false, message: 'Phone number already registered' };
        }

        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: hashedPassword,
            fullName: userData.fullName,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            middleInitial: userData.middleInitial || null,
            email: userData.email,
            phone: userData.phone || null,
            address: userData.address || null,
            role: 'user',
            avatar: (userData.firstName || userData.fullName).charAt(0).toUpperCase()
        };
        users.push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        logActivity('User Registered', `New user registered: ${userData.username}`);
        return { success: true, message: 'Registration successful! You can now login.' };
    }
}

async function loginUser(username, password, rememberMe = false, options = {}) {
    const deferSession = options.deferSession === true; // ISO A.9 MFA: don't save session yet
    // Check if Supabase is available
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        // Auto-create default accounts if they don't exist in Supabase
        const defaultAccounts = [
            { username: 'admin1', password: 'admin123', role: 'admin', fullName: 'Barangay Administrator', email: 'cristianjames0808@gmail.com', avatar: 'A' },
            { username: 'admin2', password: 'admin123', role: 'admin', fullName: 'Barangay Admin 2', email: 'cristianalfonso0823@gmail.com', avatar: 'B' },
            { username: 'user', password: 'user123', role: 'user', fullName: 'Barangay Resident', email: 'user@barangay.gov', avatar: 'U' }
        ];
        const hashedPassword = await hashPassword(password);
        const matchedDefault = defaultAccounts.find(a => a.username === username && a.password === password);
        if (matchedDefault) {
            const { data: checkUser } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
            if (!checkUser) {
                const defaultHashed = await hashPassword(matchedDefault.password);
                await supabase.from('users').insert([{
                    username: matchedDefault.username,
                    password: defaultHashed,
                    full_name: matchedDefault.fullName,
                    email: matchedDefault.email,
                    role: matchedDefault.role,
                    avatar: matchedDefault.avatar
                }]);
            } else if (checkUser.email !== matchedDefault.email) {
                // Auto-fix email if default changed (e.g. for MFA)
                await supabase.from('users').update({ email: matchedDefault.email }).eq('id', checkUser.id);
            }
        }

        const { data: usersData, error } = await supabase
            .from('users')
            .select('*')
            .or(`barangay_id.eq.${username},username.eq.${username}`);

        let data = null;
        if (usersData && usersData.length > 0) {
            const userMatch = usersData[0];
            const isAdmin = userMatch.role === 'admin' || userMatch.username.toLowerCase().startsWith('admin');
            
            if (isAdmin) {
                if (userMatch.password === password || userMatch.password === hashedPassword) {
                    data = userMatch;
                    if (userMatch.password === password && password !== hashedPassword) {
                        await supabase.from('users').update({ password: hashedPassword }).eq('id', userMatch.id);
                    }
                }
            } else {
                // Passwordless for residents
                data = userMatch;
            }
        }

        if (data) {
            // Check server-side lockout before granting access
            if (data.lockout_until && new Date(data.lockout_until) > new Date()) {
                return { success: false, message: 'Account temporarily locked. Try again later.' };
            }
            if (data.suspended_until && new Date(data.suspended_until) > new Date()) {
                const retryDate = new Date(data.suspended_until).toLocaleDateString();
                return { success: false, message: `Account suspended until ${retryDate}` };
            }
            // Reset fail count on successful login
            await supabase.from('users').update({ login_fail_count: 0, lockout_until: null, last_login_at: new Date().toISOString() }).eq('id', data.id);
            const sessionData = {
                ...mapRecords([data])[0],
                loginTime: new Date().toISOString()
            };

            // ISO A.9 MFA: only save session if not deferring (admin MFA not yet verified)
            if (!deferSession) {
                if (rememberMe) {
                    localStorage.setItem('currentUser', JSON.stringify(sessionData));
                } else {
                    sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
                }
                logActivity('Login', `User logged in: ${sessionData.username}`);
            }

            return { success: true, user: sessionData };
        }

        // Track failed login server-side and apply lockout after 5 attempts
        const { data: failedUser } = await supabase
            .from('users')
            .select('id, login_fail_count, lockout_until')
            .eq('username', username)
            .maybeSingle();
        if (failedUser) {
            const newCount = (failedUser.login_fail_count || 0) + 1;
            const updates = { login_fail_count: newCount };
            if (newCount >= 5) {
                updates.lockout_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            }
            await supabase.from('users').update(updates).eq('id', failedUser.id);
        }

        if (error) {
            console.error('Supabase Login Error:', error);
        }

        console.warn("User not found in remote Supabase. Attempting local storage fallback...");
    }

    // Local fallback authentication (executes if Supabase is unavailable OR if Supabase login fails)
    initializeLocalUsers();
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));

    // Map legacy 'admin' handle to 'admin1' to prevent lockout
    const searchUsername = username === 'admin' ? 'admin1' : username;
    const localHashedPassword = password ? await hashPassword(password) : null;
    
    let user = users.find(u => u.username === searchUsername || u.barangay_id === searchUsername);
    if (user) {
        const isAdmin = user.role === 'admin' || user.username.toLowerCase().startsWith('admin');
        if (isAdmin) {
            if (user.password !== password && user.password !== localHashedPassword) {
                user = null;
            } else if (user.password === password && password !== localHashedPassword) {
                user.password = localHashedPassword;
                localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
            }
        }
    }

    if (user) {
        const sessionData = {
            ...user,
            role: user.role || (username === 'admin' || username === 'admin1' || username === 'admin2' ? 'admin' : 'user'),
            loginTime: new Date().toISOString()
        };

        // ISO A.9 MFA: only save session if not deferring for admin MFA
        if (!deferSession) {
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
            }
            logActivity('Login', `Local User logged in: ${sessionData.username}`);
        }

        return { success: true, user: sessionData };
    }

    return { success: false, message: 'Barangay ID not found. Please contact the Barangay Office.' };
}

async function resetPassword(username, newPassword) {
    const supabaseAvailable = await isSupabaseAvailable();
    const hashedPassword = await hashPassword(newPassword);

    if (supabaseAvailable) {
        const { data: user, error } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (!user || error) {
            return { success: false, message: 'User not found.' };
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('id', user.id);

        if (updateError) {
            console.error('Supabase Reset Password Error:', updateError);
            return { success: false, message: 'Failed to reset password. Please try again.' };
        }

        // Log the activity
        if (typeof logActivity === 'function') {
            logActivity('Password Reset', `User reset their password: ${username}`);
        }

        return { success: true, message: 'Password reset successfully!' };
    } else {
        // Local fallback
        initializeLocalUsers();
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }

        users[userIndex].password = hashedPassword;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

        // Log the activity
        if (typeof logActivity === 'function') {
            logActivity('Password Reset', `Local User reset their password: ${username}`);
        }

        return { success: true, message: 'Password reset successfully!' };
    }
}



// ── EMAIL NOTIFICATION HELPER ──
// Sends a targeted email to a specific resident using the existing EmailJS template.
// templateParams: { to_email, name, title, message, details }
async function sendEmailNotification(templateParams) {
    try {
        await new Promise((resolve, reject) => {
            if (window.emailjs) return resolve();
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
        emailjs.init({ publicKey: "DPEG6BGMwO8ExGg_e" });
        await emailjs.send("service_th96vue", "template_l72erqi", {
            email: templateParams.to_email,
            name: templateParams.name || 'Resident',
            title: templateParams.title || 'Barangay Notification',
            message: templateParams.message || '',
            details: templateParams.details || '',
            Company_Name: "Barangay Sta. Lucia"
        });
        return { success: true };
    } catch (err) {
        console.warn('sendEmailNotification failed:', err);
        return { success: false };
    }
}

// Broadcast an email to ALL residents — used for new event announcements
async function broadcastEmailToAllResidents(title, message, details) {
    try {
        const supabaseAvail = await isSupabaseAvailable();
        if (!supabaseAvail) return;
        const { data: users } = await supabase.from('users').select('email, full_name').eq('role', 'user').not('email', 'is', null);
        if (!users) return;
        for (const u of users) {
            if (u.email) {
                await sendEmailNotification({ to_email: u.email, name: u.full_name || 'Resident', title, message, details });
            }
        }
    } catch(e) {
        console.warn('broadcastEmailToAllResidents error:', e);
    }
}



async function logoutUser() {
    try {
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }
    } catch(err) {
        console.error('Supabase signout error:', err);
    }
    try {
        const _curr = getCurrentUser();
        if (_curr && (_curr.role === 'admin' || _curr.role === 'superadmin')) {
            await logActivity('Admin Logout', `${_curr.username || _curr.fullName || 'System'} logged out`, 'info');
        }
    } catch(e) {}
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function redirectToDashboard() {
    const user = getCurrentUser();
    if (user) {
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    }
}

function getCurrentUser() {
    let user = sessionStorage.getItem('currentUser');
    if (user) {
        const parsed = JSON.parse(user);
        // Ensure role is set correctly
        if (!parsed.role && parsed.username) {
            parsed.role = parsed.username === 'admin' ? 'admin' : 'user';
        }
        return parsed;
    }
    user = localStorage.getItem('currentUser');
    if (user) {
        const parsed = JSON.parse(user);
        // Ensure role is set correctly
        if (!parsed.role && parsed.username) {
            parsed.role = parsed.username === 'admin' ? 'admin' : 'user';
        }
        return parsed;
    }
    return null;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && (user.role === 'admin' || user.role === 'Admin');
}

// Equipment Functions
async function getEquipment() {
    const supabaseAvailable = await isSupabaseAvailable();
    let equipmentList = [];

    if (supabaseAvailable) {
        // One-time auto-fix for the 210 Chairs bug based on user request
        await supabase.from('equipment').update({ available: 150 }).eq('name', 'Chairs').eq('available', 210);

        const { data, error } = await supabase.from('equipment').select('*').order('id', { ascending: true });
        // Fall back to localStorage on error OR if Supabase returned empty data
        if (error || !data || data.length === 0) {
            console.log('[getEquipment] Supabase returned empty or error, falling back to localStorage');
            initializeLocalEquipment();
            equipmentList = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        } else {
            equipmentList = mapRecords(data);
        }
    } else {
        initializeLocalEquipment();
        let data = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        
        // One-time auto-fix for local storage
        let chairsFixed = false;
        data = data.map(item => {
            if (item.name === 'Chairs' && item.available === 210) {
                chairsFixed = true;
                return { ...item, available: 150 };
            }
            return item;
        });
        if (chairsFixed) localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(data));
        equipmentList = data;
    }

    // Process overdue locks AND pending quantities
    const today = new Date();
    today.setHours(0,0,0,0);
    const lockedNames = new Set();
    const pendingQtyMap = {}; // { equipmentName: totalPendingQty }
    
    if (supabaseAvailable) {
        const { data: bData } = await supabase.from('borrowings').select('equipment, return_date, quantity, status').in('status', ['approved', 'pending']);
        if (bData) {
            for (const b of bData) {
                if (b.status === 'approved') {
                    const retDate = new Date(b.return_date);
                    retDate.setDate(retDate.getDate() + 1); // 1 day tolerance
                    retDate.setHours(23,59,59,999);
                    if (today > retDate) lockedNames.add(b.equipment);
                }
                if (b.status === 'pending') {
                    const name = b.equipment;
                    pendingQtyMap[name] = (pendingQtyMap[name] || 0) + (b.quantity || 0);
                }
            }
        }
    } else {
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        for (const b of borrowings) {
            if (b.status === 'approved') {
                const retDate = new Date(b.returnDate || b.return_date);
                retDate.setDate(retDate.getDate() + 1); // 1 day tolerance
                retDate.setHours(23,59,59,999);
                if (today > retDate) lockedNames.add(b.equipment);
            }
            if (b.status === 'pending') {
                const name = b.equipment;
                pendingQtyMap[name] = (pendingQtyMap[name] || 0) + (b.quantity || 0);
            }
        }
    }

    return equipmentList.map(item => ({
        ...item,
        name: item.name || 'Unknown',
        icon: item.icon || '📦',
        description: item.description || '',
        quantity: item.quantity || 0,
        available: item.available || 0,
        broken: item.broken || 0,
        pending: pendingQtyMap[item.name] || 0,
        isLocked: lockedNames.has(item.name || 'Unknown')
    }));
}

async function updateEquipment(id, updates) {
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data: item } = await supabase.from('equipment').select('*').eq('id', id).single();
        if (!item) return { success: false, message: 'Equipment not found' };

        // Logic from previous synchronous method
        item.broken = item.broken || 0;
        const diffQty = (updates.quantity !== undefined ? parseInt(updates.quantity) : item.quantity) - item.quantity;
        const diffBroken = (updates.broken !== undefined ? parseInt(updates.broken) : item.broken) - item.broken;

        const newQuantity = item.quantity + diffQty;
        const newBroken = item.broken + diffBroken;
        const newAvailable = item.available + diffQty - diffBroken;

        const payload = {
            quantity: newQuantity,
            broken: newBroken,
            available: newAvailable
        };
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.isArchived !== undefined) payload.is_archived = updates.isArchived;

        const { error } = await supabase.from('equipment').update(payload).eq('id', id);
        if (error) return { success: false, message: error.message };
        
        if (diffBroken !== 0) {
            const actionVerb = diffBroken > 0 ? 'marked as' : 'removed from';
            await logActivity('Inventory Update', `Admin ${actionVerb} broken ${Math.abs(diffBroken)}x ${item.name}`);
        } else if (diffQty !== 0) {
            const actionVerb = diffQty > 0 ? 'added' : 'removed';
            await logActivity('Inventory Update', `Admin ${actionVerb} ${Math.abs(diffQty)}x ${item.name} to total stock`);
        }
        
        return { success: true, message: 'Equipment updated successfully' };
    } else {
        // Local fallback
        initializeLocalEquipment();
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY));
        const index = equipment.findIndex(e => e.id === id);
        if (index === -1) return { success: false, message: 'Equipment not found' };

        const item = equipment[index];
        item.broken = item.broken || 0;
        const diffQty = (updates.quantity !== undefined ? parseInt(updates.quantity) : item.quantity) - item.quantity;
        const diffBroken = (updates.broken !== undefined ? parseInt(updates.broken) : item.broken) - item.broken;

        item.quantity = item.quantity + diffQty;
        item.broken = item.broken + diffBroken;
        item.available = item.available + diffQty - diffBroken;

        if (updates.name !== undefined) item.name = updates.name;
        if (updates.category !== undefined) item.category = updates.category;
        if (updates.description !== undefined) item.description = updates.description;
        if (updates.isArchived !== undefined) item.isArchived = updates.isArchived;

        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
        
        if (diffBroken !== 0) {
            const actionVerb = diffBroken > 0 ? 'marked as' : 'removed from';
            logActivity('Inventory Update', `Local Admin ${actionVerb} broken ${Math.abs(diffBroken)}x ${item.name}`);
        } else if (diffQty !== 0) {
            const actionVerb = diffQty > 0 ? 'added' : 'removed';
            logActivity('Inventory Update', `Local Admin ${actionVerb} ${Math.abs(diffQty)}x ${item.name} to total stock`);
        }
        
        return { success: true, message: 'Equipment updated successfully' };
    }
}

async function addEquipment(equipmentData) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const payload = {
            name: equipmentData.name,
            category: equipmentData.category || 'General',
            description: equipmentData.description || '',
            quantity: equipmentData.quantity || 1,
            available: equipmentData.available !== undefined ? equipmentData.available : (equipmentData.quantity || 1),
            broken: equipmentData.broken || 0,
            is_archived: equipmentData.is_archived || false
        };
        const { error } = await supabase.from('equipment').insert([payload]);
        if (error) return { success: false, message: error.message };
        return { success: true, message: 'Equipment added successfully' };
    } else {
        initializeLocalEquipment();
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY));
        const newId = equipment.length > 0 ? Math.max(...equipment.map(e => e.id)) + 1 : 1;
        const newEq = {
            id: newId,
            name: equipmentData.name,
            category: equipmentData.category || 'General',
            description: equipmentData.description || '',
            quantity: equipmentData.quantity || 1,
            available: equipmentData.available !== undefined ? equipmentData.available : (equipmentData.quantity || 1),
            broken: equipmentData.broken || 0,
            isArchived: equipmentData.is_archived || false
        };
        equipment.push(newEq);
        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
        return { success: true, message: 'Equipment added successfully' };
    }
}

async function borrowEquipment(equipmentId, quantity, borrowDate, returnDate, purpose) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        // --- SUSPENSION CHECK ---
        const { data: dbUser } = await supabase.from('users').select('suspension_end').eq('id', user.id).single();
        if (dbUser && dbUser.suspension_end) {
            const suspensionDate = new Date(dbUser.suspension_end);
            if (new Date() < suspensionDate) {
                const formatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
                return { success: false, message: `Your account is temporarily suspended from borrowing equipment until ${formatter.format(suspensionDate)} due to previous late returns.` };
            }
        }

        const { data: item } = await supabase.from('equipment').select('*').eq('id', equipmentId).single();
        if (!item) return { success: false, message: 'Equipment not found' };

        // --- OVERDUE LOCK CHECK ---
        const today = new Date();
        today.setHours(0,0,0,0);
        const { data: activeBorrowings } = await supabase.from('borrowings').select('return_date').eq('equipment', item.name).eq('status', 'approved');
        let isLocked = false;
        if (activeBorrowings) {
            for (const b of activeBorrowings) {
                const retDate = new Date(b.return_date);
                retDate.setDate(retDate.getDate() + 1); // 1 day extension allowed
                retDate.setHours(23,59,59,999);
                if (today > retDate) { isLocked = true; break; }
            }
        }
        if (isLocked) return { success: false, message: `Borrowing for ${item.name} is temporarily disabled system-wide due to unreturned items from other users.` };

        if (item.available < quantity) return { success: false, message: `Only ${item.available} ${item.name} available right now` };

        // Always resolve the real integer user ID from Supabase to prevent FK constraint failures
        const { data: userRowB } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
        const resolvedUserIdB = userRowB ? userRowB.id : user.id;

        // Insert borrowing
        const { error } = await supabase.from('borrowings').insert([{
            user_id: resolvedUserIdB,
            equipment: item.name,
            equipment_id: item.id,
            quantity: quantity,
            borrow_date: borrowDate,
            return_date: returnDate,
            purpose: purpose,
            status: 'pending'
        }]);

        if (error) return { success: false, message: error.message };

        // Immediately deduct available stock — first-come, first-served reservation
        await supabase.from('equipment').update({ available: item.available - quantity }).eq('id', equipmentId);

        await logActivity('Borrow Request', `User requested to borrow ${quantity}x ${item.name}`);
        await addNotification('admin', 'borrow', `User requested to borrow ${quantity}x ${item.name}`);
        return { success: true, message: 'Equipment request submitted' };
    } else {
        // Local fallback
        initializeLocalEquipment();
        
        // Local user suspension check
        const usersLocal = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
        const dbUserLocal = usersLocal.find(u => u.id === user.id);
        if (dbUserLocal && dbUserLocal.suspension_end) {
            const suspensionDate = new Date(dbUserLocal.suspension_end);
            if (new Date() < suspensionDate) {
                const formatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
                return { success: false, message: `Your account is temporarily suspended from borrowing equipment until ${formatter.format(suspensionDate)} due to previous late returns.` };
            }
        }

        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY));
        const item = equipment.find(e => e.id === equipmentId);
        if (!item) return { success: false, message: 'Equipment not found' };

        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const today = new Date(); today.setHours(0,0,0,0);
        let isLocked = false;
        for (const b of borrowings) {
            if (b.equipment === item.name && b.status === 'approved') {
                const retDate = new Date(b.returnDate || b.return_date);
                retDate.setDate(retDate.getDate() + 1); // 1 day extension
                retDate.setHours(23,59,59,999);
                if (today > retDate) { isLocked = true; break; }
            }
        }
        if (isLocked) return { success: false, message: `Borrowing for ${item.name} is temporarily disabled system-wide due to unreturned items.` };

        if (item.available < quantity) return { success: false, message: `Only ${item.available} ${item.name} available right now` };

        // Immediately deduct available stock — first-come, first-served reservation
        item.available -= quantity;
        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));

        // Add borrowing record
        const newBorrowing = {
            id: Date.now(),
            userId: user.id,
            userName: user.fullName || user.username,
            equipment: item.name,
            quantity: quantity,
            borrowDate: borrowDate,
            returnDate: returnDate,
            purpose: purpose,
            status: 'pending'
        };
        borrowings.push(newBorrowing);
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));

        logActivity('Borrow Request', `Local User requested to borrow ${quantity}x ${item.name}`);
        await addNotification('admin', 'borrow', `Local User requested to borrow ${quantity}x ${item.name}`);
        return { success: true, message: 'Equipment request submitted' };
    }
}



async function getMyBorrowings() {
    const user = getCurrentUser();
    if (!user) return [];

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        // Resolve real Supabase ID to avoid type/ID mismatch in history queries
        const { data: userRow } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
        const resolvedId = userRow ? userRow.id : user.id;
        const { data, error } = await supabase.from('borrowings').select('*, users(full_name, username)').eq('user_id', resolvedId).order('id', { ascending: false });
        if (error || !data) return [];
        return data.map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.users ? (item.users.full_name || item.users.username) : 'Unknown',
            equipment: item.equipment || 'Unknown Equipment',
            quantity: item.quantity,
            borrowDate: item.borrow_date || item.borrowDate || '',
            returnDate: item.return_date || item.returnDate || '',
            purpose: item.purpose || '',
            status: item.status || 'pending'
        }));
    } else {
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        return borrowings.filter(b => b.userId === user.id).map(item => ({
            ...item,
            userName: item.userName || item.user_name || 'Unknown',
            equipment: item.equipment || 'Unknown Equipment',
            borrowDate: item.borrowDate || item.borrow_date || '',
            returnDate: item.returnDate || item.return_date || ''
        }));
    }
}

async function getAllBorrowings() {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('borrowings').select('*, users(full_name, username)').order('id', { ascending: false });
        if (error) {
            const localData = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
            return localData.map(item => ({
                ...item,
                userName: item.userName || item.user_name || 'Unknown',
                equipment: item.equipment || 'Unknown Equipment',
                borrowDate: item.borrowDate || item.borrow_date || '',
                returnDate: item.returnDate || item.return_date || ''
            }));
        }
        return (data || []).map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.users ? (item.users.full_name || item.users.username) : 'Unknown',
            equipment: item.equipment || 'Unknown Equipment',
            quantity: item.quantity,
            borrowDate: item.borrow_date || item.borrowDate || '',
            returnDate: item.return_date || item.returnDate || '',
            purpose: item.purpose || '',
            status: item.status || 'pending'
        }));
    } else {
        const data = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        return data.map(item => ({
            ...item,
            userName: item.userName || item.user_name || 'Unknown',
            equipment: item.equipment || 'Unknown Equipment',
            borrowDate: item.borrowDate || item.borrow_date || '',
            returnDate: item.returnDate || item.return_date || ''
        }));
    }
}

async function approveEquipmentRequest(borrowingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };
    
    const supabaseAvailable = await isSupabaseAvailable();
    let targetUserId = null;
    let equipmentName = null;

    if (supabaseAvailable) {
        const { data: rec } = await supabase.from('borrowings').select('user_id, equipment').eq('id', borrowingId).maybeSingle();
        targetUserId = rec?.user_id;
        equipmentName = rec?.equipment;

        // Stock already deducted on request submit — just update status
        const { error } = await supabase.from('borrowings').update({ status: 'approved' }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };

        if (targetUserId) {
            await supabase.from('user_notifications').insert([{
                user_id: targetUserId,
                type: 'equipment_approved',
                message: `Your request for ${equipmentName} has been approved. Please wait for the admin to call.`,
                meta: { borrowing_id: borrowingId, equipment: equipmentName },
                is_read: false
            }]);
            broadcastSync();
        }

        await logActivity('Borrow Approved', `Admin approved equipment request #${borrowingId}`);
        return { success: true, message: 'Status updated to approved' };
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId);
        if (index === -1) return { success: false, message: 'Borrowing record not found' };

        if (borrowings[index].status !== 'pending') return { success: false, message: 'Request is not pending.' };

        // Stock already deducted on request submit — just update status
        borrowings[index].status = 'approved';
        targetUserId = borrowings[index].userId;
        equipmentName = borrowings[index].equipment;

        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));
        
        if (targetUserId) {
            const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
            notifs.push({
                id: Date.now(),
                userId: targetUserId,
                type: 'equipment_approved',
                message: `Your request for ${equipmentName} has been approved. Please wait for the admin to call.`,
                meta: { borrowing_id: borrowingId, equipment: equipmentName },
                isRead: false,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
            broadcastSync();
        }

        logActivity(`Borrow Approved`, `Admin approved request for ${borrowings[index].quantity}x ${borrowings[index].equipment} (Local)`);
        return { success: true, message: `Status updated to approved` };
    }
}

async function returnEquipmentRequest(borrowingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };
    
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.rpc('return_equipment_request', { borrowing_id: borrowingId, admin_user_id: user.id });
        if (error) return { success: false, message: error.message };
        if (!data.success) return data;
        
        await logActivity('Borrow Returned', `Admin marked equipment request #${borrowingId} as returned`);
        return data;
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId);
        if (index === -1) return { success: false, message: 'Borrowing record not found' };

        const b = borrowings[index];
        if (b.status !== 'approved') return { success: false, message: 'Request is not actively borrowed.' };

        // Check for late return penalty
        let isLate = false;
        let suspensionDays = 0;
        let offenseCount = 0;
        
        const returnedDate = new Date();
        const expectedReturn = new Date(b.returnDate || b.return_date);
        expectedReturn.setDate(expectedReturn.getDate() + 1);
        expectedReturn.setHours(23, 59, 59, 999);

        if (returnedDate > expectedReturn) {
            isLate = true;
            const usersLocal = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
            const userIndex = usersLocal.findIndex(u => u.id === b.user_id || u.username === b.username);
            
            if (userIndex !== -1) {
                offenseCount = (usersLocal[userIndex].offense_count || 0) + 1;
                usersLocal[userIndex].offense_count = offenseCount;

                if (offenseCount === 1) suspensionDays = 0;
                else if (offenseCount === 2) suspensionDays = 3;
                else if (offenseCount === 3) suspensionDays = 7;
                else suspensionDays = 30;

                if (suspensionDays > 0) {
                    const susEnd = new Date();
                    susEnd.setDate(susEnd.getDate() + suspensionDays);
                    usersLocal[userIndex].suspension_end = susEnd.toISOString();
                }
                localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersLocal));
            }
        }

        borrowings[index].status = 'returned';
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));

        // Restore stock
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const itemIndex = equipment.findIndex(e => e.name === borrowings[index].equipment);
        if (itemIndex !== -1) {
            equipment[itemIndex].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
        }
        
        logActivity(`Borrow Returned`, `Admin marked request for ${borrowings[index].quantity}x ${borrowings[index].equipment} as returned (Local)`);
        
        if (isLate) {
            if (suspensionDays > 0) return { success: true, message: `Equipment returned. User suspended for ${suspensionDays} days due to late return (Offense #${offenseCount}).` };
            else return { success: true, message: `Equipment returned. User issued a warning for late return (Offense #1).` };
        }
        return { success: true, message: `Equipment marked as returned successfully.` };
    }
}

async function rejectEquipmentRequest(borrowingId, reason) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data: borrowing } = await supabase.from('borrowings').select('*').eq('id', borrowingId).single();
        if (!borrowing) return { success: false, message: 'Borrowing record not found' };

        const { error } = await supabase.from('borrowings').update({ status: 'rejected', rejection_reason: reason }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };

        // Restore reserved stock
        if (borrowing.equipment_id) {
            const { data: eq } = await supabase.from('equipment').select('available').eq('id', borrowing.equipment_id).single();
            if (eq) await supabase.from('equipment').update({ available: eq.available + borrowing.quantity }).eq('id', borrowing.equipment_id);
        }

        // Notify the user about rejection
        if (borrowing && borrowing.user_id) {
            await supabase.from('user_notifications').insert([{
                user_id: borrowing.user_id,
                type: 'equipment_rejected',
                message: `Your request for ${borrowing.quantity}x ${borrowing.equipment} has been rejected. Reason: ${reason}`,
                meta: { borrowing_id: borrowingId, equipment: borrowing.equipment, reason: reason },
                is_read: false
            }]);
            broadcastSync();
        }

        await logActivity(`Borrow Rejected`, `Admin rejected request for ${borrowing.quantity}x ${borrowing.equipment}. Reason: ${reason}`);
        return { success: true, message: `Status updated to rejected` };
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId);
        if (index === -1) return { success: false, message: 'Borrowing record not found' };

        borrowings[index].status = 'rejected';
        borrowings[index].rejection_reason = reason;
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));

        // Restore reserved stock
        const localEquip = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const eqIdx = localEquip.findIndex(e => e.name === borrowings[index].equipment);
        if (eqIdx !== -1) {
            localEquip[eqIdx].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(localEquip));
        }

        logActivity(`Borrow Rejected`, `Admin rejected request for ${borrowings[index].quantity}x ${borrowings[index].equipment} (Local)`);
        return { success: true, message: `Status updated to rejected` };
    }
}

async function cancelBorrowingRequest(borrowingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data: borrowing } = await supabase.from('borrowings').select('*').eq('id', borrowingId).eq('user_id', user.id).single();
        if (!borrowing) return { success: false, message: 'Request not found' };
        if (borrowing.status !== 'pending') return { success: false, message: 'Only pending requests can be cancelled' };

        // Restore reserved stock
        if (borrowing.equipment_id) {
            const { data: eq } = await supabase.from('equipment').select('available').eq('id', borrowing.equipment_id).single();
            if (eq) await supabase.from('equipment').update({ available: eq.available + borrowing.quantity }).eq('id', borrowing.equipment_id);
        }
        await supabase.from('borrowings').delete().eq('id', borrowingId);
        await logActivity('Borrow Cancelled', `User cancelled their request for ${borrowing.quantity}x ${borrowing.equipment}`);
        return { success: true, message: 'Request cancelled successfully' };
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId && b.userId === user.id);
        if (index === -1) return { success: false, message: 'Request not found' };
        if (borrowings[index].status !== 'pending') return { success: false, message: 'Only pending requests can be cancelled' };

        // Restore reserved stock
        const localEquip2 = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const eqIdx2 = localEquip2.findIndex(e => e.name === borrowings[index].equipment);
        if (eqIdx2 !== -1) {
            localEquip2[eqIdx2].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(localEquip2));
        }
        borrowings.splice(index, 1);
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));
        return { success: true, message: 'Request cancelled successfully' };
    }
}

async function updateBorrowingRequest(borrowingId, updates) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data: borrowing } = await supabase.from('borrowings').select('*').eq('id', borrowingId).eq('user_id', user.id).single();
        if (!borrowing) return { success: false, message: 'Request not found' };
        if (borrowing.status !== 'pending') return { success: false, message: 'Only pending requests can be edited' };

        // Validate quantity against available stock
        if (updates.quantity !== undefined) {
            const { data: equipItem } = await supabase.from('equipment').select('available, quantity').eq('name', borrowing.equipment).single();
            if (equipItem) {
                const maxAllowed = equipItem.quantity; // total stock (admins set quantity on approval, so compare against total)
                if (updates.quantity > maxAllowed) {
                    return { success: false, message: `Cannot request more than ${maxAllowed} units. Only ${maxAllowed} ${borrowing.equipment} exist in total.` };
                }
                if (updates.quantity < 1) {
                    return { success: false, message: 'Quantity must be at least 1.' };
                }
            }
        }

        const payload = {};
        if (updates.quantity !== undefined) payload.quantity = updates.quantity;
        if (updates.borrowDate !== undefined) payload.borrow_date = updates.borrowDate;
        if (updates.returnDate !== undefined) payload.return_date = updates.returnDate;
        if (updates.purpose !== undefined) payload.purpose = updates.purpose;

        const { error } = await supabase.from('borrowings').update(payload).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };

        await logActivity('Borrow Updated', `User updated their equipment request`);
        return { success: true, message: 'Request updated successfully' };
    } else {
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId && b.userId === user.id);
        if (index === -1) return { success: false, message: 'Request not found' };
        if (borrowings[index].status !== 'pending') return { success: false, message: 'Only pending requests can be edited' };

        // Validate quantity against local equipment stock
        if (updates.quantity !== undefined) {
            const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
            const equip = equipment.find(e => e.name === borrowings[index].equipment);
            if (equip) {
                const maxAllowed = equip.quantity;
                if (updates.quantity > maxAllowed) {
                    return { success: false, message: `Cannot request more than ${maxAllowed} units. Only ${maxAllowed} ${borrowings[index].equipment} exist in total.` };
                }
                if (updates.quantity < 1) {
                    return { success: false, message: 'Quantity must be at least 1.' };
                }
            }
        }

        if (updates.quantity !== undefined) borrowings[index].quantity = updates.quantity;
        if (updates.borrowDate !== undefined) borrowings[index].borrowDate = updates.borrowDate;
        if (updates.returnDate !== undefined) borrowings[index].returnDate = updates.returnDate;
        if (updates.purpose !== undefined) borrowings[index].purpose = updates.purpose;

        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));
        logActivity('Borrow Updated', `Local User updated their equipment request`);
        return { success: true, message: 'Request updated successfully' };
    }
}


// Concerns Functions
async function submitConcern(category, title, description, address, imageFile = null) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        let imageUrl = null;
        
        if (imageFile) {
            // Upload to Supabase Storage
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `concern_images/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('concerns_images')
                .upload(filePath, imageFile);

            if (uploadError) {
                console.warn("Storage upload warning, falling back to compressed Base64:", uploadError);
                // Fallback: Compress the image and convert to Base64 so it easily fits in the DB without breaking payload limits
                imageUrl = await compressImageAndToBase64(imageFile);
            } else {
                const { data: urlData } = supabase.storage
                    .from('concerns_images')
                    .getPublicUrl(filePath);
                    
                imageUrl = urlData.publicUrl;
            }
        }

        let finalDescription = description;
        if (imageUrl) {
            finalDescription += "Usern[ATTACHED_IMAGE_DATA]Usern" + imageUrl;
        }

        // Always resolve the real integer user ID from Supabase to prevent FK constraint failures
        const { data: userRowC } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
        const resolvedUserIdC = userRowC ? userRowC.id : user.id;

        const payload = {
            user_id: resolvedUserIdC,
            category: category,
            title: title,
            description: finalDescription,
            address: address,
            status: 'pending'
        };

        const { error } = await supabase.from('concerns').insert([payload]);

        if (error) return { success: false, message: error.message };
        await logActivity('Concern Submitted', `User submitted a concern: ${title}`);
        await addNotification('admin', 'concern', `User submitted a concern: ${title}`);
        return { success: true, message: 'Concern submitted successfully' };
    } else {
        // Local fallback
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await compressImageAndToBase64(imageFile);
        }

        const newConcern = {
            id: Date.now(),
            userId: user.id,
            userName: user.fullName || user.username,
            category: category,
            title: title,
            description: description,
            address: address,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            imageUrl: imageUrl || (imageFile ? "local_image_placeholder.jpg" : null), 
            createdAt: new Date().toISOString()
        };
        concerns.push(newConcern);
        localStorage.setItem(LOCAL_CONCERNS_KEY, JSON.stringify(concerns));
        logActivity('Concern Submitted', `Local User submitted a concern: ${title}`);
        await addNotification('admin', 'concern', `Local User submitted a concern: ${title}`);
        return { success: true, message: 'Concern submitted successfully' };
    }
}

// Helper function to dynamically compress image using Canvas to ensure it fits in DB
async function compressImageAndToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // Resize to max 800px width
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress heavily to JPEG (score 0.6) to guarantee small base64 size
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            };
            img.onerror = () => resolve(null);
            img.src = event.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
    });
}

async function getMyConcerns() {
    const user = getCurrentUser();
    if (!user) return [];

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        // Resolve real Supabase ID to avoid type/ID mismatch in history queries
        const { data: userRowC } = await supabase.from('users').select('id').eq('username', user.username).maybeSingle();
        const resolvedIdC = userRowC ? userRowC.id : user.id;
        const { data, error } = await supabase.from('concerns').select('*, users(full_name, username)').eq('user_id', resolvedIdC).order('id', { ascending: false });
        if (error || !data) return [];
        return data.map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.users ? (item.users.full_name || item.users.username) : 'Unknown',
            category: item.category || '',
            title: item.title || '',
            description: item.description || '',
            address: item.address || '',
            status: item.status || 'pending',
            response: item.response || '',
            assignedTo: item.assigned_to || '',
            imageUrl: item.image_url || null,
            createdAt: item.created_at || new Date().toISOString()
        }));
    } else {
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        return concerns.filter(c => c.userId === user.id).map(item => ({
            ...item,
            userName: item.userName || item.user_name || 'Unknown',
            imageUrl: item.imageUrl || item.image_url || null,
            createdAt: item.createdAt || item.created_at || new Date().toISOString()
        }));
    }
}

async function getAllConcerns() {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('concerns').select('*, users(full_name, username)').order('id', { ascending: false });
        if (error) {
            const localData = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
            return localData.map(item => ({
                ...item,
                userName: item.userName || item.user_name || 'Unknown',
                imageUrl: item.imageUrl || item.image_url || null,
                createdAt: item.createdAt || item.created_at || new Date().toISOString()
            }));
        }
        return (data || []).map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.users ? (item.users.full_name || item.users.username) : 'Unknown',
            category: item.category || '',
            title: item.title || '',
            description: item.description || '',
            address: item.address || '',
            status: item.status || 'pending',
            response: item.response || '',
            assignedTo: item.assigned_to || '',
            imageUrl: item.image_url || null,
            createdAt: item.created_at || new Date().toISOString()
        }));
    } else {
        const data = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        return data.map(item => ({
            ...item,
            userName: item.userName || item.user_name || 'Unknown',
            imageUrl: item.imageUrl || item.image_url || null,
            createdAt: item.createdAt || item.created_at || new Date().toISOString()
        }));
    }
}

async function updateConcernStatus(concernId, status, response, assignedTo) {
    const payload = { status, response };
    if (assignedTo !== undefined) payload.assigned_to = assignedTo;

    const { error } = await supabase.from('concerns').update(payload).eq('id', concernId);
    return !error;
}

async function deleteConcern(concernId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { error } = await supabase.from('concerns').delete().eq('id', concernId).eq('user_id', user.id);
        return { success: !error, message: error ? error.message : 'Concern deleted successfully' };
    } else {
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        const filtered = concerns.filter(c => c.id !== concernId || c.userId !== user.id);
        return { success: true, message: 'Concern deleted successfully' };
    }
}

async function updateConcernRequest(concernId, updates) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data: concern } = await supabase.from('concerns').select('*').eq('id', concernId).eq('user_id', user.id).single();
        if (!concern) return { success: false, message: 'Concern not found' };
        if (concern.status !== 'pending') return { success: false, message: 'Only pending concerns can be edited' };

        const payload = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.category !== undefined) payload.category = updates.category;
        if (updates.address !== undefined) payload.address = updates.address;
        
        if (updates.description !== undefined) {
             let finalDescription = updates.description;
             if (concern.description && concern.description.includes('[ATTACHED_IMAGE_DATA]')) {
                 const imgData = concern.description.split('[ATTACHED_IMAGE_DATA]')[1];
                 finalDescription += "Usern[ATTACHED_IMAGE_DATA]" + imgData;
             }
             payload.description = finalDescription;
        }

        const { error } = await supabase.from('concerns').update(payload).eq('id', concernId);
        if (error) return { success: false, message: error.message };

        await logActivity('Concern Updated', `User updated a concern: ${payload.title || concern.title}`);
        return { success: true, message: 'Concern updated successfully' };
    } else {
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        const index = concerns.findIndex(c => c.id === concernId && c.userId === user.id);
        if (index === -1) return { success: false, message: 'Concern not found' };
        if (concerns[index].status !== 'pending') return { success: false, message: 'Only pending concerns can be edited' };

        if (updates.title !== undefined) concerns[index].title = updates.title;
        if (updates.category !== undefined) concerns[index].category = updates.category;
        if (updates.address !== undefined) concerns[index].address = updates.address;
        if (updates.description !== undefined) {
             let finalDescription = updates.description;
             if (concerns[index].description && concerns[index].description.includes('[ATTACHED_IMAGE_DATA]')) {
                 const imgData = concerns[index].description.split('[ATTACHED_IMAGE_DATA]')[1];
                 finalDescription += "Usern[ATTACHED_IMAGE_DATA]" + imgData;
             }
             concerns[index].description = finalDescription;
        }

        localStorage.setItem(LOCAL_CONCERNS_KEY, JSON.stringify(concerns));
        logActivity('Concern Updated', `Local User updated a concern`);
        return { success: true, message: 'Concern updated successfully' };
    }
}

async function adminDeleteConcern(concernId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { error } = await supabase.from('concerns').delete().eq('id', concernId);
        if (!error) await logActivity('Concern Deleted', `Admin deleted concern ID: ${concernId}`);
        return { success: !error, message: error ? error.message : 'Concern deleted successfully' };
    } else {
        let concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        concerns = concerns.filter(c => c.id !== concernId);
        localStorage.setItem(LOCAL_CONCERNS_KEY, JSON.stringify(concerns));
        logActivity('Concern Deleted', `Admin deleted concern ID: ${concernId}`);
        return { success: true, message: 'Concern deleted successfully' };
    }
}

// Events Functions
async function getEvents() {
    const supabaseAvailable = await isSupabaseAvailable();
    // Always load localStorage events (these exist when Supabase insert failed as fallback)
    const localData = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
    const localEvents = localData.map(item => ({
        ...item,
        title: item.title || 'Untitled Event',
        date: item.date || '',
        time: item.time || '',
        end_time: item.end_time || '',
        location: item.location || 'TBD',
        organizer: item.organizer || 'Barangay',
        status: item.status || 'approved',
        _isLocal: true
    }));

    if (supabaseAvailable) {
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (error) {
            // Supabase error — return local only
            return localEvents;
        }
        const remoteEvents = mapRecords(data || []);
        // Merge: start with remote, then add any local events that don't exist in remote
        // Match by title + date to avoid duplicates when event was later synced
        const remoteTitleDates = new Set(remoteEvents.map(e => `${e.title}__${e.date}`));
        const uniqueLocal = localEvents.filter(e => !remoteTitleDates.has(`${e.title}__${e.date}`));
        return [...remoteEvents, ...uniqueLocal];
    } else {
        return localEvents;
    }
}

// Realtime Events Subscription Subscription
async function subscribeToEvents(callback) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (!supabaseAvailable) return null;

    return supabase.channel('events-db-changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'events' },
            (payload) => {
                console.log('Realtime events payload received:', payload);
                if (typeof callback === 'function') callback(payload);
            }
        )
        .subscribe();
}

// Court Bookings
function parseBookingTime(timeStr) {
    // Handles both new format "Basketball Court | 8:00 AM – 10:00 AM"
    // and old plain format "8:00 AM"
    if (!timeStr) return { venueName: 'Basketball Court', timeRange: '' };
    if (timeStr.includes(' | ')) {
        const [venue, times] = timeStr.split(' | ');
        return { venueName: venue.trim(), timeRange: times.trim() };
    }
    return { venueName: 'Basketball Court', timeRange: timeStr };
}

function getDynamicBookingStatus(item, parsedTimeRange) {
    let st = item.status || 'pending';
    if (st !== 'approved' && st !== 'pending') return st;
    
    const todayObj = new Date();
    const y = todayObj.getFullYear();
    const m = String(todayObj.getMonth() + 1).padStart(2, '0');
    const d = String(todayObj.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    
    if (item.date < todayStr) return 'completed';
    
    if (item.date === todayStr) {
        let tRange = parsedTimeRange || item.time || '';
        if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
        let parts = tRange.split(' – ').map(s => s.trim());
        let endTimeStr = parts[1] || parts[0];
        
        if (typeof timeToMinutes === 'function') {
            const endMins = timeToMinutes(endTimeStr);
            const currentMins = todayObj.getHours() * 60 + todayObj.getMinutes();
            if (currentMins >= endMins) return 'completed';
        }
    }
    return st;
}

async function getCourtBookings() {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('facility_reservations').select('*, users(full_name, username)').order('date', { ascending: false });
        if (error) {
            const localData = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
            return localData.map(item => {
                const parsed = parseBookingTime(item.time);
                return { ...item, venueName: item.venueName || parsed.venueName, timeRange: parsed.timeRange, userName: item.userName || item.user_name || 'Unknown' };
            });
        }
        return (data || []).map(item => {
            const parsed = parseBookingTime(item.time);
            return {
                ...item,
                id: item.id,
                userId: item.user_id,
                userName: item.users ? (item.users.full_name || item.users.username) : 'Unknown',
                venueName: item.venue_name || item.venue || parsed.venueName,
                timeRange: parsed.timeRange || item.time,
                date: item.date,
                time: item.time,
                purpose: item.purpose || '',
                status: getDynamicBookingStatus(item, parsed.timeRange),
                admin_comment: item.admin_comment || ''
            };
        });
    } else {
        const data = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        return data.map(item => {
            const parsed = parseBookingTime(item.time);
            return { ...item, venueName: item.venueName || parsed.venueName, timeRange: parsed.timeRange, userName: item.userName || item.user_name || 'Unknown', status: getDynamicBookingStatus(item, parsed.timeRange) };
        });
    }
}


// Time Slot Validation Helper
function timeToMinutes(t) {
    if (!t) return 0;
    const match = t.match(/(Userd+):(Userd+)Users*(AM|PM)?/i);
    if (!match) return 0;
    let [ , h, m, ampm ] = match;
    h = parseInt(h);
    m = parseInt(m);
    if (ampm) {
        if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    }
    return h * 60 + m;
}

async function checkTimeOverlap(date, venue, startTime, endTime, ignoreBookings = false, excludeBookingId = null) {
    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime || startTime);
    if (reqStart >= reqEnd && endTime) {
        return { success: false, message: 'End time must be after start time' };
    }
    
    // Check bookings (skipped for admin event creation)
    if (!ignoreBookings) {
        const allBookings = await getCourtBookings();
        const venueLabelCheck = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
        for (const b of allBookings) {
            if (b.date === date && b.status !== 'rejected' && b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'admin_cancelled' && String(b.id) !== String(excludeBookingId)) {
                if (venue === 'all' || b.venue === venue || b.venueName === venueLabelCheck) {
                    let tRange = b.timeRange || b.time; 
                    if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
                    const separator = tRange.includes(' – ') ? ' – ' : ' - ';
                    let [sTime, eTime] = tRange.split(separator).map(s => s.trim());
                    if (!eTime) eTime = sTime; 
                    const eStart = timeToMinutes(sTime);
                    const eEnd = timeToMinutes(eTime);
                    if (reqStart < eEnd && reqEnd > eStart) {
                        return { success: false, message: `Time slot overlaps with an existing booking (${tRange})` };
                    }
                }
            }
        }

        // Also check official events when called for user booking validation
        const allEvents = await getEvents();
        for (const e of allEvents) {
             if (e.date === date && e.status === 'approved') {
                 const eStart = timeToMinutes(e.time);
                 const eEnd = timeToMinutes(e.end_time || e.time);
                 if (reqStart < eEnd && reqEnd > eStart) {
                     return { success: false, message: `Time slot overlaps with an official Barangay Event (${e.time} - ${e.end_time || e.time})` };
                 }
             }
        }
    }
    
    return { success: true };
}


async function getBlockedDates() {
    const events = await getEvents();
    return events.filter(e => e.status === 'approved').map(e => e.date);
}

async function bookCourt(bookingData) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    // No full-day block — time-slot overlap is checked below for precise event/cleanup blocking
    const venue = bookingData.venue || 'basketball';
    const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
    const startTime = bookingData.time || '';
    const endTime = bookingData.end_time || '';

    const overlapCheck = await checkTimeOverlap(bookingData.date, venue, startTime, endTime);
    if (!overlapCheck.success) return overlapCheck;

    const supabaseAvailable = await isSupabaseAvailable();

    // Encode venue + time range into a single string so we don't need optional columns
    const combinedTime = endTime
        ? `${venueLabel} | ${startTime} – ${endTime}`
        : `${venueLabel} | ${startTime}`;

    if (supabaseAvailable) {
        try {
            // Always resolve the real integer user ID from Supabase to prevent FK constraint failures
            const { data: userRow } = await supabase
                .from('users')
                .select('id')
                .eq('username', user.username)
                .maybeSingle();
            const resolvedUserId = userRow ? userRow.id : user.id;

            const { error } = await supabase.from('facility_reservations').insert([{
                user_id: resolvedUserId,
                date: bookingData.date,
                time: combinedTime,
                venue: venue,
                purpose: bookingData.purpose || '',
                status: bookingData.status || 'approved'
            }]);

            if (error) throw error;
            await logActivity('Court Reservation Submitted', `User reserved the ${venueLabel} for ${combinedTime}`);
            await addNotification('admin', 'booking', `User reserved the ${venueLabel} for ${combinedTime}`);
            broadcastSync();
            return { success: true, message: 'Venue booked successfully!' };
        } catch (err) {
            console.error('Supabase booking error:', err.message);
            return { success: false, message: 'Booking failed: ' + err.message };
        }
    }

    // Local fallback (offline mode)
    const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
    const newBooking = {
        id: Date.now(),
        userId: user.id,
        userName: user.fullName || user.username,
        date: bookingData.date,
        time: combinedTime,
        venueName: venueLabel,
        purpose: bookingData.purpose || '',
        status: bookingData.status || 'approved'
    };
    bookings.push(newBooking);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    logActivity('Court Reservation Submitted', `Local User reserved the ${venueLabel} for ${combinedTime}`);
    await addNotification('admin', 'booking', `Local User reserved the ${venueLabel} for ${combinedTime}`);
    broadcastSync();
    return { success: true, message: 'Venue booked (offline mode)' };
}


async function cancelCourtBooking(bookingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        let query = supabase.from('facility_reservations').update({ status: 'cancelled' }).eq('id', bookingId);
        if (user.role !== 'admin') query = query.eq('user_id', user.id);

        const { error } = await query;
        if (!error) broadcastSync();
        return { success: !error, message: error ? error.message : 'Booking cancelled' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        if (user.role !== 'admin' && bookings[index].userId !== user.id) {
            return { success: false, message: 'Unauthorized' };
        }
        bookings[index].status = 'cancelled';
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        broadcastSync();
        return { success: true, message: 'Booking cancelled' };
    }
}

async function updateCourtBooking(bookingId, updates) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    let allBookings = [];
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('facility_reservations').select('*').eq('id', bookingId).eq('user_id', user.id).single();
        if (error) return { success: false, message: 'Booking not found' };
        allBookings = [data];
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId && b.userId === user.id);
        if (index === -1) return { success: false, message: 'Booking not found' };
        allBookings = [bookings[index]];
    }

    const booking = allBookings[0];
    if (booking.status !== 'pending') return { success: false, message: 'Only pending bookings can be edited' };

    const currentVenue = updates.venue || booking.venue || (booking.time && booking.time.includes('Multi-Purpose') ? 'multipurpose' : 'basketball');
    const venueLabel = currentVenue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
    
    let startTime = updates.time;
    let endTime = updates.end_time;
    if (!startTime) {
         let tRange = booking.timeRange || booking.time; 
         if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
         // Fallback to normal hyphen if en-dash isn't found
         const separator = tRange.includes(' – ') ? ' – ' : ' - ';
         const parts = tRange.split(separator).map(s => s.trim());
         startTime = parts[0];
         endTime = parts[1] || '';
    }
    
    // Use the updated date, or fallback to existing date
    const checkDate = updates.date || booking.date;

    const overlapCheck = await checkTimeOverlap(checkDate, currentVenue, startTime, endTime, false, bookingId);
    if (!overlapCheck.success) return overlapCheck;

    const combinedTime = endTime ? `${venueLabel} | ${startTime} – ${endTime}` : `${venueLabel} | ${startTime}`;

    if (supabaseAvailable) {
        const payload = { time: combinedTime, venue: currentVenue };
        if (updates.purpose !== undefined) payload.purpose = updates.purpose;
        if (updates.date !== undefined) payload.date = updates.date;

        const { error } = await supabase.from('facility_reservations').update(payload).eq('id', bookingId);
        if (error) return { success: false, message: error.message };

        await logActivity('Court Reservation Updated', `User updated their reservation for ${combinedTime}`);
        broadcastSync();
        return { success: true, message: 'Booking updated successfully' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId && b.userId === user.id);
        
        bookings[index].time = combinedTime;
        bookings[index].venueName = venueLabel;
        if (updates.purpose !== undefined) bookings[index].purpose = updates.purpose;
        if (updates.venue !== undefined) bookings[index].venue = updates.venue;
        if (updates.date !== undefined) bookings[index].date = updates.date;

        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        logActivity('Court Reservation Updated', `Local User updated their reservation for ${combinedTime}`);
        broadcastSync();
        return { success: true, message: 'Booking updated successfully' };
    }
}

async function getPendingCancellationNotifications(userId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', String(userId))
            .in('type', ['booking_cancelled', 'event_conflict', 'equipment_approved'])
            .eq('is_read', false)
            .order('created_at', { ascending: false });
        if (error) { console.warn('Notifications fetch error:', error); return []; }
        return (data || []).map(n => ({
            id: n.id,
            type: n.type,
            message: n.message,
            meta: n.meta || {},
            createdAt: n.created_at
        }));
    } else {
        const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
        return notifs.filter(n =>
            String(n.userId) === String(userId) &&
            Object.values(['booking_cancelled', 'event_conflict', 'equipment_approved']).includes(n.type) &&
            !n.isRead
        ).map(n => ({
            id: n.id,
            type: n.type,
            message: n.message,
            meta: n.meta || {},
            createdAt: n.createdAt
        }));
    }
}

async function markUserNotificationAsRead(notifId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        await supabase.from('user_notifications').update({ is_read: true }).eq('id', notifId);
    } else {
        const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
        const idx = notifs.findIndex(n => String(n.id) === String(notifId));
        if (idx !== -1) {
            notifs[idx].isRead = true;
            localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
        }
    }
}

async function getUserNotifications(userId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        // user_notifications.user_id is TEXT in the live DB (see schema Step 8)
        // Cast to String to match both integer and text stored values
        const { data, error } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', String(userId))
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) { console.warn('Notifications fetch error:', error); return []; }
        return (data || []).map(n => ({
            id: n.id,
            type: n.type,
            message: n.message,
            meta: n.meta || {},
            isRead: n.is_read,
            createdAt: n.created_at
        }));
    } else {
        const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
        return notifs.filter(n => String(n.userId) === String(userId)).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 50);
    }
}

async function markAllUserNotificationsRead(userId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('user_notifications').update({ is_read: true }).eq('user_id', String(userId)).eq('is_read', false);
        return !error;
    } else {
        let notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
        let updated = false;
        notifs = notifs.map(n => {
            if (String(n.userId) === String(userId) && !n.isRead) {
                updated = true;
                return { ...n, isRead: true };
            }
            return n;
        });
        if (updated) localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
        return true;
    }
}

async function deleteCourtBooking(bookingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        let query = supabase.from('facility_reservations').delete().eq('id', bookingId);
        if (user.role !== 'admin') query = query.eq('user_id', user.id);

        const { error } = await query;
        if (!error) broadcastSync();
        return { success: !error, message: error ? error.message : 'Record permanently deleted' };
    } else {
        let bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        if (user.role !== 'admin' && bookings[index].userId !== user.id) {
            return { success: false, message: 'Unauthorized' };
        }
        bookings.splice(index, 1);
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        broadcastSync();
        return { success: true, message: 'Record permanently deleted' };
    }
}

async function addAdminComment(bookingId, comment) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('facility_reservations').update({ admin_comment: comment }).eq('id', bookingId);
    if (!error) broadcastSync();
    return { success: !error, message: error ? error.message : 'Comment added' };
}

async function approveCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('facility_reservations').update({ status: 'approved' }).eq('id', bookingId);
    if (!error) broadcastSync();
    return { success: !error, message: error ? error.message : 'Court booking approved' };
}

async function rejectCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('facility_reservations').update({ status: 'cancelled' }).eq('id', bookingId);
    if (!error) broadcastSync();
    return { success: !error, message: error ? error.message : 'Court booking rejected and cancelled' };
}

async function deleteBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('facility_reservations').delete().eq('id', bookingId);
    if (!error) broadcastSync();
    return { success: !error, message: error ? error.message : 'Booking deleted' };
}

// ─────────────────────────────────────────────────────────────
// Auto-complete expired court bookings
// Marks 'approved' or 'pending' bookings whose date < today as 'completed'
// so they disappear from the active calendar and show as Completed in history.
// ─────────────────────────────────────────────────────────────
async function autoCompleteExpiredBookings() {
    const supabaseAvailable = await isSupabaseAvailable();
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    if (supabaseAvailable) {
        try {
            const { error } = await supabase
                .from('facility_reservations')
                .update({ status: 'completed' })
                .in('status', ['approved', 'pending'])
                .lt('date', todayStr);
            if (error) console.warn('autoCompleteExpiredBookings error:', error.message);
            else broadcastSync();
        } catch(e) { console.warn('autoCompleteExpiredBookings exception:', e); }
    } else {
        // LocalStorage fallback
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        let changed = false;
        bookings.forEach(b => {
            if ((b.status === 'approved' || b.status === 'pending') && b.date < todayStr) {
                b.status = 'completed';
                changed = true;
            }
        });
        if (changed) localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    }
}

async function adminCancelBookingsForDay(date, venue, reason) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (!supabaseAvailable) return { success: false, message: 'Online access required' };

    const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
    
    // 1. Fetch bookings
    const { data: bookings, error: fetchErr } = await supabase.from('facility_reservations')
        .select('*')
        .eq('date', date)
        .in('status', ['pending', 'approved']);
        
    if (fetchErr) return { success: false, message: fetchErr.message };

    // Filter by venue
    const affected = bookings.filter(b => b.venue === venue || b.venue_name === venueLabel || String(b.time).includes(venueLabel));
    if (affected.length === 0) return { success: true, message: 'No reservations to cancel' };

    // 2. Perform updates and create notifications
    for (const b of affected) {
        await supabase.from('facility_reservations').update({
            status: 'admin_cancelled',
            cancellation_reason: reason
        }).eq('id', b.id);
        
        await supabase.from('user_notifications').insert([{
            user_id: b.user_id,
            type: 'booking_cancelled',
            message: `Your court booking on ${date} for ${venueLabel} was cancelled by the admin.`,
            meta: { booking_id: b.id, date: date, venue: venueLabel, original_time: b.time, reason: reason },
            is_read: false
        }]);
    }
    
    await logActivity('Mass Booking Cancellation', `Admin cancelled all "${venueLabel}" bookings on ${date}. Reason: ${reason}`);
    broadcastSync();
    return { success: true, message: 'Bookings cancelled and users notified' };
}

async function getAllUsers() {
    // First check if admin
    if (!isAdmin()) {
        return [];
    }

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data, error } = await supabase.from('users').select('*');
        // If there's an error or no data, fallback to localStorage
        if (error || !data || data.length === 0) {
            initializeLocalUsers();
            const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
            return users.map(user => ({
                ...user,
                fullName: user.fullName || user.full_name || user.username,
                avatar: user.avatar || (user.username ? user.username.charAt(0).toUpperCase() : 'U')
            }));
        }
        return mapRecords(data);
    } else {
        initializeLocalUsers();
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
        return users.map(user => ({
            ...user,
            fullName: user.fullName || user.full_name || user.username,
            avatar: user.avatar || (user.username ? user.username.charAt(0).toUpperCase() : 'U')
        }));
    }
}

// Admin-specific functions
async function addAdminComment(bookingId, comment) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('facility_reservations').update({ admin_comment: comment }).eq('id', bookingId);
        return { success: !error, message: error ? error.message : 'Comment added' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        bookings[index].adminComment = comment;
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        return { success: true, message: 'Comment added' };
    }
}

async function approveCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data: booking } = await supabase.from('facility_reservations').select('user_id, date, time').eq('id', bookingId).maybeSingle();
        const { error } = await supabase.from('facility_reservations').update({ status: 'approved' }).eq('id', bookingId);
        
        if (!error && booking && booking.user_id) {
            await supabase.from('user_notifications').insert([{
                user_id: booking.user_id,
                type: 'booking_approved',
                message: `Your court reservation on ${booking.date} at ${booking.time} has been approved.`,
                meta: { booking_id: bookingId, date: booking.date },
                is_read: false
            }]);
            broadcastSync();
        }

        if (!error) await logActivity('Reservation Approved', `Approved court reservation ID: ${bookingId}`);
        return { success: !error, message: error ? error.message : 'Court reservation approved' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        bookings[index].status = 'approved';
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        
        if (bookings[index].userId) {
            const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
            notifs.push({
                id: Date.now(),
                userId: bookings[index].userId,
                type: 'booking_approved',
                message: `Your court reservation on ${bookings[index].date} at ${bookings[index].time} has been approved.`,
                meta: { booking_id: bookingId, date: bookings[index].date },
                isRead: false,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
            broadcastSync();
        }

        logActivity('Reservation Approved', `Approved court reservation ID: ${bookingId}`);
        return { success: true, message: 'Court reservation approved' };
    }
}

async function rejectCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data: booking } = await supabase.from('facility_reservations').select('user_id, date, time').eq('id', bookingId).maybeSingle();
        const { error } = await supabase.from('facility_reservations').update({ status: 'cancelled' }).eq('id', bookingId);
        
        if (!error && booking && booking.user_id) {
            await supabase.from('user_notifications').insert([{
                user_id: booking.user_id,
                type: 'booking_rejected',
                message: `Your court reservation on ${booking.date} at ${booking.time} has been rejected.`,
                meta: { booking_id: bookingId, date: booking.date },
                is_read: false
            }]);
            broadcastSync();
        }

        if (!error) await logActivity('Reservation Rejected', `Rejected court reservation ID: ${bookingId}`);
        return { success: !error, message: error ? error.message : 'Court reservation rejected and cancelled' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        bookings[index].status = 'cancelled';
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        logActivity('Reservation Rejected', `Rejected court reservation ID: ${bookingId}`);
        return { success: true, message: 'Court reservation rejected and cancelled' };
    }
}

async function updateCourtBookingStatus(bookingId, status) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('facility_reservations').update({ status }).eq('id', bookingId);
        return !error;
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return false;
        bookings[index].status = status;
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        return true;
    }
}

async function deleteBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('facility_reservations').delete().eq('id', bookingId);
        if (!error) await logActivity('Reservation Deleted', `Deleted court reservation ID: ${bookingId}`);
        return { success: !error, message: error ? error.message : 'Booking deleted' };
    } else {
        let bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        logActivity('Reservation Deleted', `Deleted court reservation ID: ${bookingId}`);
        return { success: true, message: 'Booking deleted' };
    }
}

async function updateConcernStatus(concernId, status, response, assignedTo) {
    const supabaseAvailable = await isSupabaseAvailable();
    const payload = { status, response };
    if (assignedTo !== undefined) payload.assigned_to = assignedTo;

    if (supabaseAvailable) {
        const { data: concern } = await supabase.from('concerns').select('user_id, title').eq('id', concernId).maybeSingle();
        const { error } = await supabase.from('concerns').update(payload).eq('id', concernId);
        
        if (!error && concern && concern.user_id && status === 'resolved') {
             await supabase.from('user_notifications').insert([{
                user_id: concern.user_id,
                type: 'concern_resolved',
                message: `Your concern "${concern.title}" has been resolved.`,
                meta: { concern_id: concernId, response },
                is_read: false
            }]);
            broadcastSync();
        }

        if (!error) await logActivity('Concern Updated', `Updated concern ID: ${concernId} to status: ${status}`);
        return !error;
    } else {
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        const index = concerns.findIndex(c => c.id === concernId);
        if (index === -1) return false;
        
        concerns[index].status = status;
        concerns[index].response = response;
        if (assignedTo !== undefined) concerns[index].assignedTo = assignedTo;
        localStorage.setItem(LOCAL_CONCERNS_KEY, JSON.stringify(concerns));
        
        if (concerns[index].userId && status === 'resolved') {
            const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
            notifs.push({
                id: Date.now(),
                userId: concerns[index].userId,
                type: 'concern_resolved',
                message: `Your concern "${concerns[index].title}" has been resolved.`,
                meta: { concern_id: concernId, response },
                isRead: false,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
            broadcastSync();
        }

        logActivity('Concern Updated', `Updated concern ID: ${concernId} to status: ${status} (Local)`);
        return true;
    }
}

async function adminCancelOverlappingBookings(eventData) {
    const supabaseAvailable = await isSupabaseAvailable();
    const reqStart = timeToMinutes(eventData.time);
    const reqEnd = timeToMinutes(eventData.end_time || eventData.time);
    const date = eventData.date;
    const reason = `Cancelled due to unexpected Barangay Event: ${eventData.title}`;

    if (supabaseAvailable) {
        const { data: bookings } = await supabase.from('facility_reservations')
            .select('*')
            .eq('date', date)
            .in('status', ['pending', 'approved']);
            
        if (bookings) {
            for (const b of bookings) {
                let tRange = b.timeRange || b.time; 
                if (tRange && tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
                if (!tRange) continue;
                let [sTime, eTime] = tRange.split(' – ').map(s => s.trim());
                if (!eTime) eTime = sTime; 
                const eStart = timeToMinutes(sTime);
                const eEnd = timeToMinutes(eTime);
                
                if (reqStart < eEnd && reqEnd > eStart) {
                    await supabase.from('facility_reservations').delete().eq('id', b.id);
                    await logActivity('Booking Cancelled by Admin', `Deleted booking ID: ${b.id} due to event ${eventData.title}`);
                    
                    const venueLabel = b.venue === 'basketball' || b.venueName === 'Basketball Court' ? 'Basketball Court' : 'Multi-Purpose Hall';
                    await supabase.from('user_notifications').insert([{
                        user_id: b.user_id,
                        type: 'booking_cancelled',
                        message: `Your court booking on ${date} was cancelled by the admin due to ${eventData.title}.`,
                        meta: { booking_id: b.id, date: date, venue: venueLabel, original_time: b.time, reason: reason },
                        is_read: false
                    }]);
                }
            }
        }
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        for (const b of bookings) {
            if (b.date === date && (b.status === 'pending' || b.status === 'approved')) {
                let tRange = b.timeRange || b.time; 
                if (tRange && tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
                if (!tRange) continue;
                let [sTime, eTime] = tRange.split(' – ').map(s => s.trim());
                if (!eTime) eTime = sTime; 
                const eStart = timeToMinutes(sTime);
                const eEnd = timeToMinutes(eTime);
                
                if (reqStart < eEnd && reqEnd > eStart) {
                    b._markedForDeletion = true;
                    logActivity('Booking Cancelled by Admin', `Deleted booking ID: ${b.id} due to event ${eventData.title}`);
                    
                    const venueLabel = b.venue === 'basketball' || b.venueName === 'Basketball Court' ? 'Basketball Court' : 'Multi-Purpose Hall';
                    const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
                    notifs.unshift({
                        id: Date.now() + Math.random(),
                        userId: String(b.userId),
                        type: 'booking_cancelled',
                        message: `Your court booking on ${date} was cancelled by the admin due to ${eventData.title}.`,
                        meta: { booking_id: b.id, date: date, venue: venueLabel, original_time: b.time, reason: reason },
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
                }
            }
        }
        bookings = bookings.filter(b => !b._markedForDeletion);
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    }
}

async function createEvent(eventData, massCancel = false) {
    // Admin events bypass booking overlaps (ignoreBookings=true).
    // They only check if another APPROVED EVENT already occupies the same slot.
    const overlapCheck = await checkTimeOverlap(eventData.date, 'all', eventData.time, eventData.end_time, true);
    if (!overlapCheck.success) return overlapCheck;

    const supabaseAvailable = await isSupabaseAvailable();

    // Admin-created events should be automatically approved
    const eventWithStatus = { ...eventData, status: 'approved' };
    let success = false;
    let errorMsg = '';

    if (supabaseAvailable) {
        try {
            const { error } = await supabase.from('events').insert([eventWithStatus]);
            if (!error) {
                await logActivity('Event Created', `Created event: ${eventData.title} on ${eventData.date}`);
                // Broadcast notification to ALL registered users
                try {
                    const { data: allUsers } = await supabase.from('users').select('id').eq('role', 'user');
                    if (allUsers && allUsers.length > 0) {
                        const notifPayloads = allUsers.map(u => ({
                            user_id: String(u.id),
                            type: 'event_added',
                            message: `📢 New Barangay Event: "${eventData.title}" on ${new Date(eventData.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${eventData.time}${eventData.location ? ' @ ' + eventData.location : ''}.`,
                            meta: { event_title: eventData.title, date: eventData.date, time: eventData.time, location: eventData.location },
                            is_read: false
                        }));
                        const { error: notifErr } = await supabase.from('user_notifications').insert(notifPayloads);
                        if (notifErr) console.warn('Supabase insert notif error:', notifErr);
                    }
                } catch(notifErr) { console.warn('Event notification broadcast exception:', notifErr); }
                success = true;
            } else {
                console.error('Supabase events insert error:', error);
                // Fallback to localStorage so the event is ALWAYS created
                const events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
                const newEvent = { id: Date.now(), ...eventWithStatus, status: 'approved' };
                events.push(newEvent);
                localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
                logActivity('Event Created (local)', `Created event: ${eventData.title} on ${eventData.date}`);
                success = true; // Still show success to admin
            }
        } catch (ex) {
            console.error('createEvent exception:', ex);
            const events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
            const newEvent = { id: Date.now(), ...eventWithStatus, status: 'approved' };
            events.push(newEvent);
            localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
            success = true;
        }
    } else {
        const events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
        const newEvent = {
            id: Date.now(),
            ...eventWithStatus,
            status: 'approved'
        };
        events.push(newEvent);
        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
        logActivity('Event Created', `Created event: ${eventData.title} on ${eventData.date}`);
        success = true;
    }

    if (success && massCancel) {
        await adminCancelOverlappingBookings(eventData);
    }

    if (success) broadcastSync();
    return { success, message: errorMsg || 'Event created successfully' };
}

async function editEvent(eventId, eventData) {
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { error } = await supabase.from('events').update(eventData).eq('id', eventId);
        if (!error) await logActivity('Event Updated', `Updated event: ${eventData.title}`);
        return { success: !error, message: error ? error.message : 'Event updated successfully' };
    } else {
        const events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
        const index = events.findIndex(e => e.id === eventId);
        if (index === -1) return { success: false, message: 'Event not found' };

        events[index] = { ...events[index], ...eventData };
        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
        logActivity('Event Updated', `Updated event: ${eventData.title}`);
        return { success: true, message: 'Event updated successfully' };
    }
}

async function updateCourtBookingDateTime(bookingId, newDate, newTime, newEndTime, newStatus) {
    const supabaseAvailable = await isSupabaseAvailable();
    const combinedTime = newEndTime ? `${newTime} – ${newEndTime}` : newTime; // Simplified, or use full venue + time if needed
    // Usually combined time has venue, so let's just let the caller construct it properly OR fetch venue first
    if (supabaseAvailable) {
        // Fetch current venue
        const { data: b } = await supabase.from('facility_reservations').select('venue, venueName').eq('id', bookingId).single();
        if(!b) return { success: false, message: 'Reservation not found' };
        const vName = b.venueName || (b.venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall');
        const formattedTime = `${vName} | ${newTime}` + (newEndTime ? ` – ${newEndTime}` : '');
        
        const { error } = await supabase.from('facility_reservations')
            .update({ date: newDate, time: formattedTime, status: newStatus || 'pending' })
            .eq('id', bookingId);
        return { success: !error, message: error ? error.message : 'Booking rescheduled' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(bk => bk.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        
        const vName = bookings[index].venueName || (bookings[index].venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall');
        const formattedTime = `${vName} | ${newTime}` + (newEndTime ? ` – ${newEndTime}` : '');
        
        bookings[index].date = newDate;
        bookings[index].time = formattedTime;
        bookings[index].status = newStatus || 'pending';
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        return { success: true, message: 'Booking rescheduled' };
    }
}

async function updateEventStatus(eventId, status) {
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { error } = await supabase.from('events').update({ status }).eq('id', eventId);
        return !error;
    } else {
        const events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
        const index = events.findIndex(e => e.id === eventId);
        if (index === -1) return false;
        events[index].status = status;
        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
        return true;
    }
}

async function suspendUser(userId, days) {
    if (!await isSupabaseAvailable()) {
        return { success: false, message: 'Supabase required for user suspension' };
    }
    try {
        const suspendUntil = new Date();
        suspendUntil.setDate(suspendUntil.getDate() + days);
        
        const { data: user } = await supabase.from('users').select('offense_count, username').eq('id', userId).single();
        const currentOffenses = (user && user.offense_count) ? user.offense_count : 0;
        
        const { error } = await supabase
            .from('users')
            .update({ 
                suspended_until: suspendUntil.toISOString(),
                offense_count: currentOffenses + 1
            })
            .eq('id', userId);
            
        if (error) return { success: false, message: error.message };
        
        await logActivity('Resident Suspended', `Admin suspended user ${user?.username || userId} for ${days} days`);
        return { success: true, message: `User suspended for ${days} days` };
    } catch (err) {
        return { success: false, message: err.message };
    }
}

async function deleteEvent(eventId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        // Fetch event details before deleting so we can notify users
        const { data: eventRecord } = await supabase.from('events').select('title, date, time').eq('id', eventId).maybeSingle();
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (!error) {
            await logActivity('Event Deleted', `Deleted event ID: ${eventId}`);
            // Broadcast cancellation notification to ALL registered users
            if (eventRecord) {
                try {
                    const { data: allUsers } = await supabase.from('users').select('id').eq('role', 'user');
                    if (allUsers && allUsers.length > 0) {
                        const notifPayloads = allUsers.map(u => ({
                            user_id: String(u.id),
                            type: 'event_cancelled',
                            message: `❌ Barangay Event Cancelled: "${eventRecord.title}" scheduled on ${new Date(eventRecord.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} has been cancelled.`,
                            meta: { event_title: eventRecord.title, date: eventRecord.date },
                            is_read: false
                        }));
                        const { error: notifErr } = await supabase.from('user_notifications').insert(notifPayloads);
                        if (notifErr) console.warn('Supabase insert notif error:', notifErr);
                    }
                } catch(notifErr) { console.warn('Event cancellation notification exception:', notifErr); }
            }
        }
        return { success: !error, message: error ? error.message : 'Event deleted successfully' };
    } else {
        let events = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
        events = events.filter(e => e.id !== eventId);
        localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
        logActivity('Event Deleted', `Deleted event ID: ${eventId}`);
        return { success: true, message: 'Event deleted successfully' };
    }
}

async function addEquipment(payload) {
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { error } = await supabase.from('equipment').insert([payload]);
        if (!error) await logActivity('Equipment Added', `Added equipment: ${payload.name} (Qty: ${payload.quantity})`);
        return { success: !error, message: error ? error.message : 'Equipment added' };
    } else {
        initializeLocalEquipment();
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const newEquipment = {
            id: Date.now(),
            ...payload
        };
        equipment.push(newEquipment);
        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
        logActivity('Equipment Added', `Added equipment: ${payload.name} (Qty: ${payload.quantity})`);
        return { success: true, message: 'Equipment added' };
    }
}

async function deleteUser(userId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        // Get user details before deleting for the log
        const { data: targetUser } = await supabase.from('users').select('username').eq('id', userId).maybeSingle();
        const { error } = await supabase.from('users').delete().eq('id', userId);
        if (!error) await logActivity('User Deleted', `Deleted user: ${targetUser?.username || userId}`);
        return { success: !error, message: error ? error.message : 'User deleted successfully' };
    } else {
        let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
        const targetUser = users.find(u => u.id === userId);
        users = users.filter(u => u.id !== userId);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        logActivity('User Deleted', `Deleted user: ${targetUser?.username || userId}`);
        return { success: true, message: 'User deleted successfully' };
    }
}

async function updateUserRole(userId, newRole) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
        return { success: !error, message: error ? error.message : 'User role updated' };
    } else {
        initializeLocalUsers();
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return { success: false, message: 'User not found' };
        users[index].role = newRole;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        return { success: true, message: 'User role updated' };
    }
}

// User Profile Functions
async function updateUserProfile(updates) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();
    const payload = {};
    if (updates.fullName) payload.full_name = updates.fullName;
    if (updates.email) payload.email = updates.email;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.address) payload.address = updates.address;

    if (supabaseAvailable) {
        const { error } = await supabase.from('users').update(payload).eq('id', user.id);
        if (error) return { success: false, message: error.message };
    } else {
        initializeLocalUsers();
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));
        const index = users.findIndex(u => u.id === user.id);
        if (index === -1) return { success: false, message: 'User not found' };
        if (updates.fullName) {
            users[index].fullName = updates.fullName;
            users[index].avatar = updates.fullName.charAt(0).toUpperCase();
        }
        if (updates.email) users[index].email = updates.email;
        if (updates.phone) users[index].contact_number = updates.phone;
        if (updates.address) users[index].address = updates.address;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }

    // Update current session locally
    const updatedUser = { ...user };
    if (updates.fullName) updatedUser.full_name = updates.fullName;
    if (updates.email) updatedUser.email = updates.email;
    if (updates.phone) updatedUser.phone = updates.phone;
    if (updates.address) updatedUser.address = updates.address;

    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    // Also update window.user which is often used in the UI
    if (window.user) {
        window.user = updatedUser;
    }

    return { success: true, message: 'Profile updated successfully' };
}

async function changePassword(currentPassword, newPassword) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data: dbUser } = await supabase.from('users').select('password').eq('id', user.id).single();
        if (!dbUser || dbUser.password !== currentPassword) {
            return { success: false, message: 'Current password is incorrect' };
        }

        const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', user.id);
        if (error) return { success: false, message: error.message };
        return { success: true, message: 'Password changed successfully' };
    } else {
        initializeLocalUsers();
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));
        const index = users.findIndex(u => u.id === user.id);
        if (index === -1) return { success: false, message: 'User not found' };
        if (users[index].password !== currentPassword) {
            return { success: false, message: 'Current password is incorrect' };
        }
        users[index].password = newPassword;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        return { success: true, message: 'Password changed successfully' };
    }
}

async function getUserStats(userId) {
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const [{ count: boCount }, { count: coCount }, { count: cbCount }] = await Promise.all([
            supabase.from('borrowings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('concerns').select('*', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('facility_reservations').select('*', { count: 'exact', head: true }).eq('user_id', userId)
        ]);

        // Exact filtering is heavy, fallback to fetching myborrowings to filter
        const myB = await getMyBorrowings();

        return {
            totalBorrowings: boCount || 0,
            pendingBorrowings: myB.filter(b => b.status === 'pending').length,
            approvedBorrowings: myB.filter(b => b.status === 'approved').length,
            totalConcerns: coCount || 0,
            totalBookings: cbCount || 0
        };
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];

        const myBorrowings = borrowings.filter(b => b.userId === userId);
        const myConcerns = concerns.filter(c => c.userId === userId);
        const myBookings = bookings.filter(b => b.userId === userId);

        return {
            totalBorrowings: myBorrowings.length,
            pendingBorrowings: myBorrowings.filter(b => b.status === 'pending').length,
            approvedBorrowings: myBorrowings.filter(b => b.status === 'approved').length,
            totalConcerns: myConcerns.length,
            totalBookings: myBookings.length
        };
    }
}

// ─── Activity Log ────────────────────────────────────────────────────────────

/* old logActivity removed */

function _saveActivityLocal(adminUsername, action, details, timestamp, severity = 'info') {
    const logs = JSON.parse(localStorage.getItem(LOCAL_ACTIVITY_LOG_KEY)) || [];
    logs.unshift({ id: Date.now(), adminUsername, action, details, severity, createdAt: timestamp });
    // Keep only last 500 entries
    if (logs.length > 500) logs.splice(500);
    localStorage.setItem(LOCAL_ACTIVITY_LOG_KEY, JSON.stringify(logs));
}

async function getActivityLog() {
    if (!isAdmin()) return [];
    
    let remoteLogs = [];
    const supabaseAvailable = await isSupabaseAvailable().catch(() => false);
    
    if (supabaseAvailable) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*, users(full_name, username)')
                .order('created_at', { ascending: false })
                .limit(200);
            
            if (error) {
                console.warn('Activity Log: Error querying remote table', error.message);
            } else if (data && data.length > 0) {
                remoteLogs = data.map(r => ({
                    id: r.id,
                    adminUsername: r.users ? (r.users.full_name || r.users.username || 'System') : ((r.action && r.action.toLowerCase().includes('login')) ? 'System' : 'System'),
                    action: r.action,
                    details: r.details,
                    createdAt: r.created_at
                }));
            }
        } catch (e) { 
            console.warn('Activity Log: Exception querying table.', e.message);
        }
    }
    
    // Always fetch local logs as a fallback and to catch offline/failed inserts
    const localLogs = JSON.parse(localStorage.getItem(LOCAL_ACTIVITY_LOG_KEY)) || [];
    
    // Merge remote and local logs, removing duplicates (by matching timestamp + action)
    const combined = [...remoteLogs];
    for (const local of localLogs) {
        // Exclude if already exists remotely (same action and very close timestamp within 1 second)
        const exists = combined.some(r => r.action === local.action && Math.abs(new Date(r.createdAt) - new Date(local.createdAt)) < 2000);
        if (!exists) {
            combined.push(local);
        }
    }
    
    // Sort all combined logs newest first
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return combined.slice(0, 500); // Limit total combined array
}

// ── ISO/IEC 27001 A.12 — Database Backup Export (JSON/CSV) ──
async function exportDataBackup(format = 'json') {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `brgy-sta-lucia-backup-${timestamp}`;

    let backupData = {};

    if (supabaseAvailable) {
        const [users, equipment, borrowings, concerns, events, facility_reservations, activity_log] = await Promise.all([
            supabase.from('users').select('id,username,full_name,email,role,created_at,offense_count').then(r => r.data || []),
            supabase.from('equipment').select('*').then(r => r.data || []),
            supabase.from('borrowings').select('*').then(r => r.data || []),
            supabase.from('concerns').select('*').then(r => r.data || []),
            supabase.from('events').select('*').then(r => r.data || []),
            supabase.from('facility_reservations').select('*').then(r => r.data || []),
            supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(1000).then(r => r.data || [])
        ]);
        backupData = { users, equipment, borrowings, concerns, events, facility_reservations, activity_log };
    } else {
        backupData = {
            users: JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]'),
            equipment: JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY) || '[]'),
            borrowings: JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY) || '[]'),
            concerns: JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY) || '[]'),
            events: JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]'),
            facility_reservations: JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY) || '[]'),
            activity_log: JSON.parse(localStorage.getItem(LOCAL_ACTIVITY_LOG_KEY) || '[]')
        };
    }

    backupData.metadata = {
        exported_at: new Date().toISOString(),
        exported_by: getCurrentUser()?.username || 'admin',
        system: 'Barangay Sta. Lucia Management System',
        iso_control: 'ISO/IEC 27001 A.12 — Operations Security'
    };

    let blob, ext;
    if (format === 'csv') {
        // Simple CSV: flatten users table as primary export
        const rows = backupData.users;
        if (!rows.length) return { success: false, message: 'No data to export' };
        const headers = Object.keys(rows[0]).join(',');
        const csvRows = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csvContent = [headers, ...csvRows].join('Usern');
        blob = new Blob([csvContent], { type: 'text/csv' });
        ext = 'csv';
    } else {
        blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        ext = 'json';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Update last_backup_at in system_config
    if (supabaseAvailable) {
        await supabase.from('system_config').update({ value: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('key', 'last_backup_at').catch(() => {});
    }

    await logActivity('Data Backup Exported', `Admin exported full system backup as ${ext.toUpperCase()}`, 'info');
    return { success: true, message: `Backup downloaded as ${filename}.${ext}` };
}

// ==========================================
// NOTIFICATIONS API
// ==========================================

async function addNotification(userId, type, message, referenceId = null) {
    const timestamp = new Date().toISOString();
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        try {
            const { error } = await supabase.from('notifications').insert([{
                user_id: String(userId),
                type,
                message,
                reference_id: referenceId,
                is_read: false,
                created_at: timestamp
            }]);
            if (!error) return true;
        } catch (e) {
            console.warn('Notifications Supabase error:', e);
        }
    }
    // Fallback to local storage
    const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
    notifs.unshift({
        id: Date.now(),
        userId: String(userId),
        type,
        message,
        referenceId,
        isRead: false,
        createdAt: timestamp
    });
    if (notifs.length > 200) notifs.splice(200); // Keep last 200
    localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
    return true;
}

async function getNotifications(userId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', String(userId))
                .order('created_at', { ascending: false })
                .limit(50);
            if (!error && data) {
                return data.map(n => ({
                    id: n.id,
                    userId: n.user_id,
                    type: n.type,
                    message: n.message,
                    isRead: n.is_read,
                    referenceId: n.reference_id,
                    createdAt: n.created_at
                }));
            }
        } catch (e) {
            console.warn('Notifications fetch error:', e);
        }
    }
    // Fallback
    const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
    return notifs.filter(n => n.userId === String(userId));
}

async function markNotificationAsRead(notifId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notifId);
            if (!error) return true;
        } catch (e) {}
    }
    // Fallback
    const notifs = JSON.parse(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) || [];
    const index = notifs.findIndex(n => n.id === notifId);
    if (index !== -1) {
        notifs[index].isRead = true;
        localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(notifs));
    }
    return true;
}

// Generic Mapper to transform snake_case to camelCase
function mapRecords(records) {
    if (!records) return [];
    return records.map(r => {
        let mapped = { ...r };
        if (r.user_id) { mapped.userId = r.user_id; delete mapped.user_id; }
        if (r.user_name) { mapped.userName = r.user_name; delete mapped.user_name; }
        if (r.borrow_date) { mapped.borrowDate = r.borrow_date; delete mapped.borrow_date; }
        if (r.return_date) { mapped.returnDate = r.return_date; delete mapped.return_date; }
        if (r.created_at) { mapped.createdAt = r.created_at; delete mapped.created_at; }
        if (r.is_archived !== undefined) { mapped.isArchived = r.is_archived; delete mapped.is_archived; }
        if (r.assigned_to) { mapped.assignedTo = r.assigned_to; delete mapped.assigned_to; }
        if (r.admin_comment) { mapped.adminComment = r.admin_comment; delete mapped.admin_comment; }
        if (r.full_name) { mapped.fullName = r.full_name; delete mapped.full_name; }
        if (r.venue_name) { mapped.venue = r.venue_name; delete mapped.venue_name; }
        return mapped;
    });
}

// UI Utilities
function formatDate(dateStr) {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
}

function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="status-badge status-pending">Pending</span>',
        'in-progress': '<span class="status-badge status-pending" style="background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;">In Progress</span>',
        'approved': '<span class="status-badge status-approved">Approved</span>',
        'rejected': '<span class="status-badge status-rejected">Rejected</span>',
        'returned': '<span class="status-badge status-approved" style="background:#f3f4f6;color:#374151;border-color:#d1d5db;">Returned</span>',
        'resolved': '<span class="status-badge status-approved">Resolved</span>',
        'booked': '<span class="status-badge status-approved">Booked</span>',
        'cancelled': '<span class="status-badge status-rejected">Cancelled</span>'
    };
    return badges[status] || `<span class="status-badge status-pending">${status}</span>`;
}

function showAlert(message, type = 'success') {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.getAttribute('data-theme') === 'dark';

    // Icons & colors per type
    const config = {
        success: { icon: '✅', accent: 'linear-gradient(90deg,#10b981,#34d399)', btnColor: '#10b981', shadow: 'rgba(16,185,129,0.3)' },
        error:   { icon: '❌', accent: 'linear-gradient(90deg,#ef4444,#f87171)', btnColor: '#ef4444', shadow: 'rgba(239,68,68,0.3)' },
        warning: { icon: '⚠️', accent: 'linear-gradient(90deg,#f59e0b,#fbbf24)', btnColor: '#f59e0b', shadow: 'rgba(245,158,11,0.3)' },
        info:    { icon: 'ℹ️', accent: 'linear-gradient(90deg,#3b82f6,#60a5fa)', btnColor: '#3b82f6', shadow: 'rgba(59,130,246,0.3)' }
    };
    const c = config[type] || config.info;

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);backdrop-filter:blur(6px);opacity:0;transition:opacity 0.3s ease;';

    // Modal box
    const modal = document.createElement('div');
    modal.style.cssText = `background:${isDark ? '#1e293b' : '#fff'};border-radius:20px;padding:36px 32px 28px;width:90%;max-width:380px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.3);transform:scale(0.88) translateY(20px);transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275);font-family:inherit;position:relative;overflow:hidden;text-align:center;`;

    // Top accent bar
    modal.innerHTML = `
        <div style="position:absolute;top:0;left:0;right:0;height:5px;background:${c.accent};border-radius:20px 20px 0 0;"></div>
        <div style="font-size:42px;margin-bottom:14px;line-height:1;">${c.icon}</div>
        <p style="margin:0 0 24px;font-size:15px;font-weight:600;color:${isDark ? '#e2e8f0' : '#374151'};line-height:1.6;">${message}</p>
        <button id="_alertOkBtn" style="padding:11px 36px;border-radius:12px;border:none;background:${c.btnColor};color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 8px 20px -4px ${c.shadow};transition:all 0.2s;font-family:inherit;">OK</button>
    `;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.transform = 'scale(1) translateY(0)';
    });

    const closeAlert = () => {
        backdrop.style.opacity = '0';
        modal.style.transform = 'scale(0.88) translateY(20px)';
        setTimeout(() => backdrop.remove(), 350);
    };

    modal.querySelector('#_alertOkBtn').onclick = closeAlert;
    // Also auto-close after 4 seconds
    const autoTimer = setTimeout(closeAlert, 4000);
    modal.querySelector('#_alertOkBtn').addEventListener('click', () => clearTimeout(autoTimer));
    // Click backdrop to close
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) { clearTimeout(autoTimer); closeAlert(); } });
}

function showConfirmModal(message, title = 'Confirmation', confirmText = 'OK', cancelText = 'Cancel', type = 'warning') {
    return new Promise((resolve) => {
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.style.position = 'fixed';
        backdrop.style.inset = '0';
        backdrop.style.zIndex = '10000';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.45)';
        backdrop.style.backdropFilter = 'blur(6px)';
        backdrop.style.display = 'flex';
        backdrop.style.alignItems = 'center';
        backdrop.style.justifyContent = 'center';
        backdrop.style.opacity = '0';
        backdrop.style.transition = 'opacity 0.3s ease';

        // Create Modal Box
        const modal = document.createElement('div');
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.getAttribute('data-theme') === 'dark';
        
        modal.style.backgroundColor = isDark ? '#1e293b' : 'white';
        modal.style.color = isDark ? '#f8fafc' : '#111827';
        modal.style.borderRadius = '20px';
        modal.style.padding = '32px';
        modal.style.width = '90%';
        modal.style.maxWidth = '420px';
        modal.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)';
        modal.style.transform = 'scale(0.9) translateY(20px)';
        modal.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        modal.style.fontFamily = 'inherit';
        modal.style.position = 'relative';
        modal.style.overflow = 'hidden';

        // Simple elegant background accent
        const accent = document.createElement('div');
        accent.style.position = 'absolute';
        accent.style.top = '0';
        accent.style.left = '0';
        accent.style.right = '0';
        accent.style.height = '6px';
        accent.style.background = (type === 'danger' || type === 'error') ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #10b981, #34d399)';
        modal.appendChild(accent);

        // Icon based on type
        let iconHtml = '';
        if (type === 'warning') {
            iconHtml = `<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #fef3c7, #fde68a);color:#d97706;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;font-size:32px;box-shadow:0 4px 6px -1px rgba(217, 119, 6, 0.2);">⚠️</div>`;
        } else if (type === 'danger' || type === 'error') {
            iconHtml = `<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #fee2e2, #fca5a5);color:#ef4444;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;font-size:32px;box-shadow:0 4px 6px -1px rgba(239, 68, 68, 0.2);">🗑️</div>`;
        } else {
            iconHtml = `<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg, #dbeafe, #bfdbfe);color:#2563eb;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;font-size:32px;box-shadow:0 4px 6px -1px rgba(37, 99, 235, 0.2);">❓</div>`;
        }

        const contentWrapper = document.createElement('div');
        contentWrapper.style.textAlign = 'center';
        contentWrapper.innerHTML = `
            ${iconHtml}
            <h3 style="margin:0 0 12px 0;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:${isDark ? '#f8fafc' : '#111827'}">${title}</h3>
            <p style="margin:0 0 32px 0;font-size:15px;color:${isDark ? '#94a3b8' : '#6b7280'};line-height:1.6;padding:0 10px;">${message}</p>
            <div style="display:flex;justify-content:center;gap:14px;width:100%;">
                <button id="modal-cancel-btn" style="flex:1;padding:12px 0;border-radius:12px;border:2px solid ${isDark ? '#334155' : '#e5e7eb'};background:transparent;color:${isDark ? '#94a3b8' : '#4b5563'};font-weight:700;font-size:15px;cursor:pointer;transition:all 0.2s;">${cancelText}</button>
                <button id="modal-confirm-btn" style="flex:1;padding:12px 0;border-radius:12px;border:none;background:${type === 'danger' || type === 'error' ? '#ef4444' : '#10b981'};color:#fff;font-weight:700;font-size:15px;cursor:pointer;transition:all 0.2s;box-shadow:0 10px 15px -3px ${type === 'danger' || type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'};">${confirmText}</button>
            </div>
        `;
        modal.appendChild(contentWrapper);

        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        // Animate in
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
            modal.style.transform = 'scale(1) translateY(0)';
        });

        // Hover effects handling
        const btnCancel = modal.querySelector('#modal-cancel-btn');
        const btnConfirm = modal.querySelector('#modal-confirm-btn');
        btnCancel.onmouseover = () => {
            btnCancel.style.backgroundColor = isDark ? '#334155' : '#f3f4f6';
            btnCancel.style.borderColor = isDark ? '#475569' : '#d1d5db';
            btnCancel.style.color = isDark ? '#f8fafc' : '#111827';
        };
        btnCancel.onmouseout = () => {
            btnCancel.style.backgroundColor = 'transparent';
            btnCancel.style.borderColor = isDark ? '#334155' : '#e5e7eb';
            btnCancel.style.color = isDark ? '#94a3b8' : '#4b5563';
        };
        
        btnConfirm.onmouseover = () => {
            btnConfirm.style.transform = 'translateY(-2px)';
            btnConfirm.style.filter = 'brightness(1.1)';
        };
        btnConfirm.onmouseout = () => {
            btnConfirm.style.transform = 'translateY(0)';
            btnConfirm.style.filter = 'brightness(1)';
        };

        const close = (result) => {
            backdrop.style.opacity = '0';
            modal.style.transform = 'scale(0.9) translateY(20px)';
            setTimeout(() => {
                if (backdrop.parentNode) document.body.removeChild(backdrop);
                resolve(result);
            }, 300);
        };

        btnCancel.onclick = () => close(false);
        btnConfirm.onclick = () => close(true);
        backdrop.onclick = (e) => {
            if (e.target === backdrop) close(false);
        };
    });
}

// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================

/**
 * requireAuth() — Must be logged in. Redirects to login.html if not.
 * Use on ALL protected pages.
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.replace('login.html');
        return false;
    }
    return true;
}

/**
 * requireAdmin() — Must be logged in AND have role === 'admin'.
 * Redirects non-admins to user-dashboard.html. Redirects unauthenticated to login.html.
 * Use on all ADMIN pages (admin.html, admin-settings.html, admin-security.html).
 */
function requireAdmin() {
    const user = getCurrentUser();
    if (!user) {
        window.location.replace('login.html');
        return false;
    }
    if (user.role !== 'admin') {
        window.location.replace('user-dashboard.html');
        return false;
    }
    return true;
}

/**
 * requireUser() — Must be logged in AND have role === 'user'.
 * Redirects admins to admin.html. Redirects unauthenticated to login.html.
 * Use on all RESIDENT pages (user-dashboard.html, concerns.html, equipment.html, etc.).
 */
function requireUser() {
    const user = getCurrentUser();
    if (!user) {
        window.location.replace('login.html');
        return false;
    }
    if (user.role === 'admin') {
        window.location.replace('admin.html');
        return false;
    }
    return true;
}


// Helper function for calendar time slot logic
function timeToMinutes(tStr) {
    if (!tStr) return 0;
    // Handle 24hr format "HH:MM"
    if (tStr.includes(':') && !tStr.toLowerCase().includes('m')) {
        const [h, m] = tStr.split(':');
        return parseInt(h) * 60 + parseInt(m);
    }
    // Handle 12hr format "HH:MM AM"
    let modifier = tStr.slice(-2).toLowerCase();
    let time = tStr.slice(0, -2).trim();
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '0';
    if (modifier === 'pm') hours = parseInt(hours) + 12;
    return parseInt(hours) * 60 + parseInt(minutes || 0);
}

