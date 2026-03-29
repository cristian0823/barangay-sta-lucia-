// Barangay Website - Main JavaScript

// Initialize local storage on load - MUST be first!
if (typeof localStorage !== 'undefined') {
    // Initialize default users
    const storedUsers = localStorage.getItem('barangay_local_users');
    if (!storedUsers) {
        const defaultUsers = [
            { id: 1, username: 'admin1', password: 'admin123', fullName: 'Barangay Administrator', email: 'admin@barangay.gov', role: 'admin', avatar: 'A' },
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
const LOCAL_ACTIVITY_LOG_KEY = 'barangay_local_activity_log';
const LOCAL_NOTIFICATIONS_KEY = 'barangay_local_notifications';

function initializeLocalUsers() {
    const stored = localStorage.getItem(LOCAL_USERS_KEY);
    if (!stored) {
        const defaultUsers = [
            { id: 1, username: 'admin1', password: 'admin123', fullName: 'Barangay Administrator', email: 'admin@barangay.gov', role: 'admin', avatar: 'A' },
            { id: 2, username: 'admin2', password: 'admin123', fullName: 'Barangay Admin 2', email: 'admin2@barangay.gov', role: 'admin', avatar: 'B' },
            { id: 3, username: 'user', password: 'user123', fullName: 'Barangay Resident', email: 'user@barangay.gov', role: 'user', avatar: 'U' }
        ];
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
    } else {
        // Ensure admin2 exists in existing localStorage
        const users = JSON.parse(stored);
        const hasAdmin2 = users.some(u => u.username === 'admin2');
        if (!hasAdmin2) {
            users.push({ id: Date.now(), username: 'admin2', password: 'admin123', fullName: 'Barangay Admin 2', email: 'admin2@barangay.gov', role: 'admin', avatar: 'B' });
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
                avatar: userData.fullName.charAt(0).toUpperCase()
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

        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: hashedPassword,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone || null,
            address: userData.address || null,
            role: 'user',
            avatar: userData.fullName.charAt(0).toUpperCase()
        };
        users.push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        logActivity('User Registered', `New user registered: ${userData.username}`);
        return { success: true, message: 'Registration successful! You can now login.' };
    }
}

async function loginUser(username, password, rememberMe = false) {
    // Check if Supabase is available
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        // Auto-create default accounts if they don't exist in Supabase
        const defaultAccounts = [
            { username: 'admin1', password: 'admin123', role: 'admin', fullName: 'Barangay Administrator', email: 'admin@barangay.gov', avatar: 'A' },
            { username: 'admin2', password: 'admin123', role: 'admin', fullName: 'Barangay Admin 2', email: 'admin2@barangay.gov', avatar: 'B' },
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
            }
        }

        const { data: usersData, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username);

        let data = null;
        if (usersData && usersData.length > 0) {
            const userMatch = usersData.find(u => u.password === password || u.password === hashedPassword);
            if (userMatch) {
                data = userMatch;
                // Migrate plain text password to hash silently
                if (userMatch.password === password && password !== hashedPassword) {
                    await supabase.from('users').update({ password: hashedPassword }).eq('id', userMatch.id);
                }
            }
        }

        if (data) {
            // Check server-side lockout before granting access
            if (data.lockout_until && new Date(data.lockout_until) > new Date()) {
                return { success: false, message: 'Account temporarily locked. Try again later.' };
            }
            // Reset fail count on successful login
            await supabase.from('users').update({ login_fail_count: 0, lockout_until: null }).eq('id', data.id);
            const sessionData = {
                ...mapRecords([data])[0],
                loginTime: new Date().toISOString()
            };

            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
            }

            // Log the activity
            logActivity('Login', `User logged in: ${sessionData.username}`);

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
    const localHashedPassword = await hashPassword(password);
    const user = users.find(u => u.username === searchUsername && (u.password === password || u.password === localHashedPassword));

    if (user && user.password === password && password !== localHashedPassword) {
        user.password = localHashedPassword;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }

    if (user) {
        const sessionData = {
            ...user,
            role: user.role || (username === 'admin' || username === 'admin1' || username === 'admin2' ? 'admin' : 'user'),
            loginTime: new Date().toISOString()
        };

        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(sessionData));
        }

        // Log the activity
        logActivity('Login', `Local User logged in: ${sessionData.username}`);

        return { success: true, user: sessionData };
    }

    return { success: false, message: 'Invalid username or password' };
}

async function logoutUser() {
    try {
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }
    } catch(err) {
        console.error('Supabase signout error:', err);
    }
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
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
    if (supabaseAvailable) {
        // One-time auto-fix for the 210 Chairs bug based on user request
        await supabase.from('equipment').update({ available: 150 }).eq('name', 'Chairs').eq('available', 210);

        const { data, error } = await supabase.from('equipment').select('*').order('id', { ascending: true });
        // Fall back to localStorage on error OR if Supabase returned empty data
        if (error || !data || data.length === 0) {
            console.log('[getEquipment] Supabase returned empty or error, falling back to localStorage');
            initializeLocalEquipment();
            const localData = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
            return localData.map(item => ({
                ...item,
                name: item.name || 'Unknown',
                icon: item.icon || '📦',
                description: item.description || '',
                quantity: item.quantity || 0,
                available: item.available || 0,
                broken: item.broken || 0
            }));
        }
        return mapRecords(data);
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

        return data.map(item => ({
            ...item,
            name: item.name || 'Unknown',
            icon: item.icon || '📦',
            description: item.description || '',
            quantity: item.quantity || 0,
            available: item.available || 0,
            broken: item.broken || 0
        }));
    }
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
        const { data: item } = await supabase.from('equipment').select('*').eq('id', equipmentId).single();
        if (!item) return { success: false, message: 'Equipment not found' };
        if (item.available < quantity) return { success: false, message: `Only ${item.available} ${item.name} available` };

        // Deduct available count immediately upon request (User preference)
        await supabase.from('equipment').update({ available: item.available - quantity }).eq('id', equipmentId);

        // Insert borrowing
        const { error } = await supabase.from('borrowings').insert([{
            user_id: user.id,
            equipment: item.name,
            quantity: quantity,
            borrow_date: borrowDate,
            return_date: returnDate,
            purpose: purpose,
            status: 'pending'
        }]);

        if (error) return { success: false, message: error.message };
        
        await logActivity('Borrow Request', `User ${user.fullName || user.username} requested to borrow ${quantity}x ${item.name}`);
        await addNotification('admin', 'borrow', `User ${user.fullName || user.username} requested to borrow ${quantity}x ${item.name}`);
        return { success: true, message: 'Equipment request submitted' };
    } else {
        // Local fallback
        initializeLocalEquipment();
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY));
        const item = equipment.find(e => e.id === equipmentId);
        if (!item) return { success: false, message: 'Equipment not found' };
        if (item.available < quantity) return { success: false, message: `Only ${item.available} ${item.name} available` };

        // Update available count immediately
        item.available -= quantity;
        localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));

        // Add borrowing record
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
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

        logActivity('Borrow Request', `Local User ${user.fullName || user.username} requested to borrow ${quantity}x ${item.name}`);
        await addNotification('admin', 'borrow', `Local User ${user.fullName || user.username} requested to borrow ${quantity}x ${item.name}`);
        return { success: true, message: 'Equipment request submitted' };
    }
}



async function getMyBorrowings() {
    const user = getCurrentUser();
    if (!user) return [];

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('borrowings').select('*, users(full_name, username)').eq('user_id', user.id).order('id', { ascending: false });
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
    if (supabaseAvailable) {
        // Update the status to approved (We bypass the RPC because stock is already deducted at request time)
        const { error } = await supabase.from('borrowings').update({ status: 'approved' }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };
        
        await logActivity('Borrow Approved', `Admin approved equipment request #${borrowingId}`);
        return { success: true, message: 'Status updated to approved' }; 
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId);
        if (index === -1) return { success: false, message: 'Borrowing record not found' };

        borrowings[index].status = 'approved';
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));
        
        // Stock was already deducted at request time, no need to deduct here
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
        return { success: true, message: `Status updated to returned` };
    }
}

async function rejectEquipmentRequest(borrowingId, reason) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data: borrowing } = await supabase.from('borrowings').select('*').eq('id', borrowingId).single();
        if (!borrowing) return { success: false, message: 'Borrowing record not found' };

        // Restore stock since request was rejected
        const { data: item } = await supabase.from('equipment').select('*').eq('name', borrowing.equipment).single();
        if (item) {
            await supabase.from('equipment').update({ available: item.available + borrowing.quantity }).eq('id', item.id);
        }

        const { error } = await supabase.from('borrowings').update({ status: 'rejected', rejection_reason: reason }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };
        
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
        
        // Restore stock
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
        const itemIndex = equipment.findIndex(e => e.name === borrowings[index].equipment);
        if (itemIndex !== -1) {
            equipment[itemIndex].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
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

        // Restore stock since it was deducted when requested
        const { data: item } = await supabase.from('equipment').select('*').eq('name', borrowing.equipment).single();
        if (item) {
            await supabase.from('equipment').update({ available: item.available + borrowing.quantity }).eq('id', item.id);
        }

        await supabase.from('borrowings').delete().eq('id', borrowingId);
        await logActivity('Borrow Cancelled', `User ${user.fullName || user.username} cancelled their request for ${borrowing.quantity}x ${borrowing.equipment}`);
        return { success: true, message: 'Request cancelled successfully' };
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId && b.userId === user.id);
        if (index === -1) return { success: false, message: 'Request not found' };
        if (borrowings[index].status !== 'pending') return { success: false, message: 'Only pending requests can be cancelled' };

        // Restore equipment availability because it was deducted when initially requested
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY));
        const itemIndex = equipment.findIndex(e => e.name === borrowings[index].equipment);
        if (itemIndex !== -1) {
            equipment[itemIndex].available += borrowings[index].quantity;
            localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
        }

        borrowings.splice(index, 1);
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));
        logActivity('Borrow Cancelled', `Local User ${user.fullName || user.username} cancelled their request for ${borrowings[index].quantity}x ${borrowings[index].equipment}`);
        return { success: true, message: 'Request cancelled successfully' };
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
            finalDescription += "\n[ATTACHED_IMAGE_DATA]\n" + imageUrl;
        }

        const payload = {
            user_id: user.id,
            category: category,
            title: title,
            description: finalDescription,
            address: address,
            status: 'pending'
        };

        const { error } = await supabase.from('concerns').insert([payload]);

        if (error) return { success: false, message: error.message };
        await logActivity('Concern Submitted', `User ${user.fullName || user.username} submitted a concern: ${title}`);
        await addNotification('admin', 'concern', `User ${user.fullName || user.username} submitted a concern: ${title}`);
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
        logActivity('Concern Submitted', `Local User ${user.fullName || user.username} submitted a concern: ${title}`);
        await addNotification('admin', 'concern', `Local User ${user.fullName || user.username} submitted a concern: ${title}`);
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
        const { data, error } = await supabase.from('concerns').select('*, users(full_name, username)').eq('user_id', user.id).order('id', { ascending: false });
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
        localStorage.setItem(LOCAL_CONCERNS_KEY, JSON.stringify(filtered));
        return { success: true, message: 'Concern deleted successfully' };
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
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        // Only fall back to localStorage on actual error, not on empty results
        if (error) {
            const localData = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
            return localData.map(item => ({
                ...item,
                title: item.title || 'Untitled Event',
                date: item.date || '',
                time: item.time || '',
                end_time: item.end_time || '',
                location: item.location || 'TBD',
                organizer: item.organizer || 'Barangay'
            }));
        }
        return mapRecords(data || []);
    } else {
        const data = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY)) || [];
        return data.map(item => ({
            ...item,
            title: item.title || 'Untitled Event',
            date: item.date || '',
            time: item.time || '',
            end_time: item.end_time || '',
            location: item.location || 'TBD',
            organizer: item.organizer || 'Barangay'
        }));
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

async function getCourtBookings() {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('court_bookings').select('*, users(full_name, username)').order('date', { ascending: false });
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
                status: item.status || 'pending',
                admin_comment: item.admin_comment || ''
            };
        });
    } else {
        const data = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        return data.map(item => {
            const parsed = parseBookingTime(item.time);
            return { ...item, venueName: item.venueName || parsed.venueName, timeRange: parsed.timeRange, userName: item.userName || item.user_name || 'Unknown' };
        });
    }
}


// Time Slot Validation Helper
function timeToMinutes(t) {
    if (!t) return 0;
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
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

async function checkTimeOverlap(date, venue, startTime, endTime, ignoreBookings = false) {
    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime || startTime);
    if (reqStart >= reqEnd && endTime) {
        return { success: false, message: 'End time must be after start time' };
    }
    
    // Check bookings
    if (!ignoreBookings) {
        const allBookings = await getCourtBookings();
        const venueLabelCheck = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
        for (const b of allBookings) {
            if (b.date === date && b.status !== 'rejected' && b.status !== 'cancelled' && b.status !== 'cancelled_by_admin' && b.status !== 'admin_cancelled') {
                if (venue === 'all' || b.venue === venue || b.venueName === venueLabelCheck) {
                    let tRange = b.timeRange || b.time; 
                    if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
                    let [sTime, eTime] = tRange.split(' – ').map(s => s.trim());
                    if (!eTime) eTime = sTime; 
                    const eStart = timeToMinutes(sTime);
                    const eEnd = timeToMinutes(eTime);
                    if (reqStart < eEnd && reqEnd > eStart) {
                        return { success: false, message: `Time slot overlaps with an existing booking (${tRange})` };
                    }
                }
            }
        }
    }

    // Check official events (events block all venues)
    const allEvents = await getEvents();
    for (const e of allEvents) {
         if (e.date === date) {
             const eStart = timeToMinutes(e.time);
             const eEnd = timeToMinutes(e.end_time || e.time);
             if (reqStart < eEnd && reqEnd > eStart) {
                 return { success: false, message: `Time slot overlaps with an official Barangay Event (${e.time} - ${e.end_time || e.time})` };
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

    const blockedDates = await getBlockedDates();
    if (blockedDates.includes(bookingData.date)) {
        return { success: false, message: 'This date is blocked due to an official Barangay Event.' };
    }

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
            const { error } = await supabase.from('court_bookings').insert([{
                user_id: user.id,
                date: bookingData.date,
                time: combinedTime,
                venue: venue,
                purpose: bookingData.purpose || '',
                status: 'pending'
            }]);

            if (error) throw error;
            await logActivity('Court Booking Submitted', `User ${user.fullName || user.username} booked the ${venueLabel} for ${combinedTime}`);
            await addNotification('admin', 'booking', `User ${user.fullName || user.username} booked the ${venueLabel} for ${combinedTime}`);
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
        status: 'pending'
    };
    bookings.push(newBooking);
    localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
    logActivity('Court Booking Submitted', `Local User ${user.fullName || user.username} booked the ${venueLabel} for ${combinedTime}`);
    await addNotification('admin', 'booking', `Local User ${user.fullName || user.username} booked the ${venueLabel} for ${combinedTime}`);
    return { success: true, message: 'Venue booked (offline mode)' };
}


async function cancelCourtBooking(bookingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        let query = supabase.from('court_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
        if (user.role !== 'admin') query = query.eq('user_id', user.id);

        const { error } = await query;
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
        return { success: true, message: 'Booking cancelled' };
    }
}

async function getPendingCancellationNotifications(userId) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase
            .from('user_notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('type', 'booking_cancelled')
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
            n.type === 'booking_cancelled' &&
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

async function deleteCourtBooking(bookingId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        let query = supabase.from('court_bookings').delete().eq('id', bookingId);
        if (user.role !== 'admin') query = query.eq('user_id', user.id);

        const { error } = await query;
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
        return { success: true, message: 'Record permanently deleted' };
    }
}

async function addAdminComment(bookingId, comment) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('court_bookings').update({ admin_comment: comment }).eq('id', bookingId);
    return { success: !error, message: error ? error.message : 'Comment added' };
}

async function approveCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('court_bookings').update({ status: 'approved' }).eq('id', bookingId);
    return { success: !error, message: error ? error.message : 'Court booking approved' };
}

async function rejectCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('court_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    return { success: !error, message: error ? error.message : 'Court booking rejected and cancelled' };
}

async function deleteBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };
    const { error } = await supabase.from('court_bookings').delete().eq('id', bookingId);
    return { success: !error, message: error ? error.message : 'Booking deleted' };
}

async function adminCancelBookingsForDay(date, venue, reason) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (!supabaseAvailable) return { success: false, message: 'Online access required' };

    const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';
    
    // 1. Fetch bookings
    const { data: bookings, error: fetchErr } = await supabase.from('court_bookings')
        .select('*')
        .eq('date', date)
        .in('status', ['pending', 'approved']);
        
    if (fetchErr) return { success: false, message: fetchErr.message };

    // Filter by venue
    const affected = bookings.filter(b => b.venue === venue || b.venue_name === venueLabel || String(b.time).includes(venueLabel));
    if (affected.length === 0) return { success: true, message: 'No bookings to cancel' };

    // 2. Perform updates and create notifications
    for (const b of affected) {
        await supabase.from('court_bookings').update({
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
        const { error } = await supabase.from('court_bookings').update({ admin_comment: comment }).eq('id', bookingId);
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
        const { error } = await supabase.from('court_bookings').update({ status: 'approved' }).eq('id', bookingId);
        if (!error) await logActivity('Booking Approved', `Approved court booking ID: ${bookingId}`);
        return { success: !error, message: error ? error.message : 'Court booking approved' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        bookings[index].status = 'approved';
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        logActivity('Booking Approved', `Approved court booking ID: ${bookingId}`);
        return { success: true, message: 'Court booking approved' };
    }
}

async function rejectCourtBooking(bookingId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('court_bookings').update({ status: 'cancelled' }).eq('id', bookingId);
        if (!error) await logActivity('Booking Rejected', `Rejected court booking ID: ${bookingId}`);
        return { success: !error, message: error ? error.message : 'Court booking rejected and cancelled' };
    } else {
        const bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        const index = bookings.findIndex(b => b.id === bookingId);
        if (index === -1) return { success: false, message: 'Booking not found' };
        bookings[index].status = 'cancelled';
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        logActivity('Booking Rejected', `Rejected court booking ID: ${bookingId}`);
        return { success: true, message: 'Court booking rejected and cancelled' };
    }
}

async function updateCourtBookingStatus(bookingId, status) {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('court_bookings').update({ status }).eq('id', bookingId);
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
        const { error } = await supabase.from('court_bookings').delete().eq('id', bookingId);
        if (!error) await logActivity('Booking Deleted', `Deleted court booking ID: ${bookingId}`);
        return { success: !error, message: error ? error.message : 'Booking deleted' };
    } else {
        let bookings = JSON.parse(localStorage.getItem(LOCAL_BOOKINGS_KEY)) || [];
        bookings = bookings.filter(b => b.id !== bookingId);
        localStorage.setItem(LOCAL_BOOKINGS_KEY, JSON.stringify(bookings));
        logActivity('Booking Deleted', `Deleted court booking ID: ${bookingId}`);
        return { success: true, message: 'Booking deleted' };
    }
}

async function updateConcernStatus(concernId, status, response, assignedTo) {
    const supabaseAvailable = await isSupabaseAvailable();
    const payload = { status, response };
    if (assignedTo !== undefined) payload.assigned_to = assignedTo;

    if (supabaseAvailable) {
        const { error } = await supabase.from('concerns').update(payload).eq('id', concernId);
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
        logActivity('Concern Updated', `Updated concern ID: ${concernId} to status: ${status}`);
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
        const { data: bookings } = await supabase.from('court_bookings')
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
                    await supabase.from('court_bookings').delete().eq('id', b.id);
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
    const overlapCheck = await checkTimeOverlap(eventData.date, 'all', eventData.time, eventData.end_time, massCancel);
    if (!overlapCheck.success) return overlapCheck;

    const supabaseAvailable = await isSupabaseAvailable();

    // Admin-created events should be automatically approved
    const eventWithStatus = { ...eventData, status: 'approved' };
    let success = false;
    let errorMsg = '';

    if (supabaseAvailable) {
        const { error } = await supabase.from('events').insert([eventWithStatus]);
        if (!error) {
            await logActivity('Event Created', `Created event: ${eventData.title} on ${eventData.date}`);
            success = true;
        } else {
            errorMsg = error.message;
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
        const { data: b } = await supabase.from('court_bookings').select('venue, venueName').eq('id', bookingId).single();
        if(!b) return { success: false, message: 'Booking not found' };
        const vName = b.venueName || (b.venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall');
        const formattedTime = `${vName} | ${newTime}` + (newEndTime ? ` – ${newEndTime}` : '');
        
        const { error } = await supabase.from('court_bookings')
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

async function deleteEvent(eventId) {
    if (!isAdmin()) return { success: false, message: 'Admin access required' };

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (!error) await logActivity('Event Deleted', `Deleted event ID: ${eventId}`);
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
    if (updates.phone) payload.contact_number = updates.phone;
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
    const updatedUser = { ...user, ...updates };
    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
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
            supabase.from('court_bookings').select('*', { count: 'exact', head: true }).eq('user_id', userId)
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

async function logActivity(action, details) {
    const user = getCurrentUser();
    const adminUsername = user ? (user.username || user.fullName || 'admin') : 'system';
    const timestamp = new Date().toISOString();

    const supabaseAvailable = await isSupabaseAvailable().catch(() => false);
    if (supabaseAvailable) {
        try {
            const { error } = await supabase.from('activity_log').insert([{
                user_id: user ? user.id : null,
                action: action,
                details: details,
                created_at: timestamp
            }]);
            
            if (error) {
                console.warn('Supabase activity log error, falling back to local', error);
                _saveActivityLocal(adminUsername, action, details, timestamp);
            }
        } catch (e) {
            // Fall back to local if API completely fails
            _saveActivityLocal(adminUsername, action, details, timestamp);
        }
    } else {
        _saveActivityLocal(adminUsername, action, details, timestamp);
    }
}

function _saveActivityLocal(adminUsername, action, details, timestamp) {
    const logs = JSON.parse(localStorage.getItem(LOCAL_ACTIVITY_LOG_KEY)) || [];
    logs.unshift({ id: Date.now(), adminUsername, action, details, createdAt: timestamp });
    // Keep only last 500 entries
    if (logs.length > 500) logs.splice(500);
    localStorage.setItem(LOCAL_ACTIVITY_LOG_KEY, JSON.stringify(logs));
}

async function getActivityLog() {
    if (!isAdmin()) return [];
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*, users(full_name, username)')
                .order('created_at', { ascending: false })
                .limit(200);
            
            if (error) throw error; // Trigger fallback
            
            if (data && data.length > 0) {
                return data.map(r => ({
                    id: r.id,
                    adminUsername: r.users ? (r.users.full_name || r.users.username) : 'System',
                    action: r.action,
                    details: r.details,
                    createdAt: r.created_at
                }));
            }
        } catch (e) { 
            console.warn('Activity Log: Table not found or error, using local fallback.', e.message);
        }
    }
    // Fall back to localStorage
    return JSON.parse(localStorage.getItem(LOCAL_ACTIVITY_LOG_KEY)) || [];
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
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    // Provide basic styling since CSS might miss this
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.padding = '15px 25px';
    alertDiv.style.borderRadius = '5px';
    alertDiv.style.color = '#fff';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.background = type === 'success' ? '#10b981' : '#ef4444';
    alertDiv.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!isAdmin()) {
        window.location.href = 'home.html';
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

