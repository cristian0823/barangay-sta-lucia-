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
async function registerUser(userData) {
    // Try Supabase first, fallback to local
    const supabaseAvailable = await isSupabaseAvailable();

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
                password: userData.password,
                full_name: userData.fullName,
                email: userData.email,
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
            password: userData.password,
            fullName: userData.fullName,
            email: userData.email,
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
        const matchedDefault = defaultAccounts.find(a => a.username === username && a.password === password);
        if (matchedDefault) {
            const { data: checkUser } = await supabase.from('users').select('*').eq('username', username).maybeSingle();
            if (!checkUser) {
                await supabase.from('users').insert([{
                    username: matchedDefault.username,
                    password: matchedDefault.password,
                    full_name: matchedDefault.fullName,
                    email: matchedDefault.email,
                    role: matchedDefault.role,
                    avatar: matchedDefault.avatar
                }]);
            }
        }

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();

        if (data) {
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

        if (error) {
            console.error("Supabase Login Error:", error);
        }

        console.warn("User not found in remote Supabase. Attempting local storage fallback...");
    }

    // Local fallback authentication (executes if Supabase is unavailable OR if Supabase login fails)
    initializeLocalUsers();
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY));

    // Map legacy 'admin' handle to 'admin1' to prevent lockout
    const searchUsername = username === 'admin' ? 'admin1' : username;
    const user = users.find(u => u.username === searchUsername && u.password === password);

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

function logoutUser() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function redirectToDashboard() {
    const user = getCurrentUser();
    if (user) {
        if (user.role === 'admin') {
            window.location.href = 'admin-new.html';
        } else {
            window.location.href = 'home.html';
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
        const data = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
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

        // Update available count
        await supabase.from('equipment').update({ available: item.available - quantity }).eq('id', equipmentId);

        // Insert borrowing
        const { error } = await supabase.from('borrowings').insert([{
            user_id: user.id,
            user_name: user.fullName || user.username,
            equipment: item.name,
            quantity: quantity,
            borrow_date: borrowDate,
            return_date: returnDate,
            purpose: purpose,
            status: 'pending'
        }]);

        if (error) return { success: false, message: error.message };
        
        await logActivity('Borrow Request', `User ${user.fullName || user.username} requested to borrow ${quantity}x ${item.name}`);
        return { success: true, message: 'Equipment request submitted' };
    } else {
        // Local fallback
        initializeLocalEquipment();
        const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY));
        const item = equipment.find(e => e.id === equipmentId);
        if (!item) return { success: false, message: 'Equipment not found' };
        if (item.available < quantity) return { success: false, message: `Only ${item.available} ${item.name} available` };

        // Update available count
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
        return { success: true, message: 'Equipment request submitted' };
    }
}



async function getMyBorrowings() {
    const user = getCurrentUser();
    if (!user) return [];

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('borrowings').select('*').eq('user_id', user.id).order('id', { ascending: false });
        if (error || !data) return [];
        return data.map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.user_name || item.username || 'Unknown',
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
        const { data, error } = await supabase.from('borrowings').select('*').order('id', { ascending: false });
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
            userName: item.user_name || item.username || 'Unknown',
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

async function updateBorrowingStatus(borrowingId, status) {
    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { data: borrowing } = await supabase.from('borrowings').select('*').eq('id', borrowingId).single();
        if (!borrowing) return { success: false, message: 'Borrowing record not found' };

        const { error } = await supabase.from('borrowings').update({ status }).eq('id', borrowingId);
        if (error) return { success: false, message: error.message };

        // Restore available stock on rejection or return
        if (status === 'rejected' || status === 'returned') {
            const { data: item } = await supabase.from('equipment').select('*').eq('name', borrowing.equipment).single();
            if (item) {
                await supabase.from('equipment').update({ available: item.available + borrowing.quantity }).eq('id', item.id);
            }
        }
        
        await logActivity(`Borrow ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Admin marked request for ${borrowing.quantity}x ${borrowing.equipment} by ${borrowing.user_name || 'User'} as ${status}`);
        return { success: true, message: `Status updated to ${status}` };
    } else {
        // Local fallback
        const borrowings = JSON.parse(localStorage.getItem(LOCAL_BORROWINGS_KEY)) || [];
        const index = borrowings.findIndex(b => b.id === borrowingId);
        if (index === -1) return { success: false, message: 'Borrowing record not found' };

        borrowings[index].status = status;
        localStorage.setItem(LOCAL_BORROWINGS_KEY, JSON.stringify(borrowings));

        // Restore available stock on rejection or return
        if (status === 'rejected' || status === 'returned') {
            const equipment = JSON.parse(localStorage.getItem(LOCAL_EQUIPMENT_KEY)) || [];
            const itemIndex = equipment.findIndex(e => e.name === borrowings[index].equipment);
            if (itemIndex !== -1) {
                equipment[itemIndex].available += borrowings[index].quantity;
                localStorage.setItem(LOCAL_EQUIPMENT_KEY, JSON.stringify(equipment));
            }
        }
        
        logActivity(`Borrow ${status.charAt(0).toUpperCase() + status.slice(1)}`, `Admin marked request for ${borrowings[index].quantity}x ${borrowings[index].equipment} by ${borrowings[index].userName} as ${status} (Local)`);
        return { success: true, message: `Status updated to ${status}` };
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

        // Return equipment
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

        // Return equipment
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
async function submitConcern(category, title, description, address) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();

    if (supabaseAvailable) {
        const { error } = await supabase.from('concerns').insert([{
            user_id: user.id,
            user_name: user.fullName || user.username,
            category: category,
            title: title,
            description: description,
            address: address,
            status: 'pending'
        }]);

        if (error) return { success: false, message: error.message };
        await logActivity('Concern Submitted', `User ${user.fullName || user.username} submitted a concern: ${title}`);
        return { success: true, message: 'Concern submitted successfully' };
    } else {
        // Local fallback
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        const newConcern = {
            id: Date.now(),
            userId: user.id,
            userName: user.fullName || user.username,
            category: category,
            title: title,
            description: description,
            address: address,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        concerns.push(newConcern);
        localStorage.setItem(LOCAL_CONCERNS_KEY, JSON.stringify(concerns));
        logActivity('Concern Submitted', `Local User ${user.fullName || user.username} submitted a concern: ${title}`);
        return { success: true, message: 'Concern submitted successfully' };
    }
}

async function getMyConcerns() {
    const user = getCurrentUser();
    if (!user) return [];

    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('concerns').select('*').eq('user_id', user.id).order('id', { ascending: false });
        if (error || !data) return [];
        return data.map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.user_name || item.username || 'Unknown',
            category: item.category || '',
            title: item.title || '',
            description: item.description || '',
            address: item.address || '',
            status: item.status || 'pending',
            response: item.response || '',
            assignedTo: item.assigned_to || '',
            createdAt: item.created_at || new Date().toISOString()
        }));
    } else {
        const concerns = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        return concerns.filter(c => c.userId === user.id).map(item => ({
            ...item,
            userName: item.userName || item.user_name || 'Unknown',
            createdAt: item.createdAt || item.created_at || new Date().toISOString()
        }));
    }
}

async function getAllConcerns() {
    const supabaseAvailable = await isSupabaseAvailable();
    if (supabaseAvailable) {
        const { data, error } = await supabase.from('concerns').select('*').order('id', { ascending: false });
        if (error) {
            const localData = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
            return localData.map(item => ({
                ...item,
                userName: item.userName || item.user_name || 'Unknown',
                createdAt: item.createdAt || item.created_at || new Date().toISOString()
            }));
        }
        return (data || []).map(item => ({
            ...item,
            id: item.id,
            userId: item.user_id,
            userName: item.user_name || item.username || 'Unknown',
            category: item.category || '',
            title: item.title || '',
            description: item.description || '',
            address: item.address || '',
            status: item.status || 'pending',
            response: item.response || '',
            assignedTo: item.assigned_to || '',
            createdAt: item.created_at || new Date().toISOString()
        }));
    } else {
        const data = JSON.parse(localStorage.getItem(LOCAL_CONCERNS_KEY)) || [];
        return data.map(item => ({
            ...item,
            userName: item.userName || item.user_name || 'Unknown',
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
        const { data, error } = await supabase.from('court_bookings').select('*').order('date', { ascending: false });
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
                userName: item.user_name || item.username || 'Unknown',
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


async function bookCourt(bookingData) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Please login first' };

    const supabaseAvailable = await isSupabaseAvailable();
    const venue = bookingData.venue || 'basketball';
    const venueLabel = venue === 'basketball' ? 'Basketball Court' : 'Multi-Purpose Hall';

    // Encode venue + time range into a single string so we don't need optional columns
    const startTime = bookingData.time || '';
    const endTime = bookingData.end_time || '';
    const combinedTime = endTime
        ? `${venueLabel} | ${startTime} – ${endTime}`
        : `${venueLabel} | ${startTime}`;

    if (supabaseAvailable) {
        try {
            const { error } = await supabase.from('court_bookings').insert([{
                user_id: user.id,
                user_name: user.fullName || user.username,
                date: bookingData.date,
                time: combinedTime,
                venue: venue,
                purpose: bookingData.purpose || '',
                status: 'pending'
            }]);

            if (error) throw error;
            await logActivity('Court Booking Submitted', `User ${user.fullName || user.username} booked the ${venueLabel} for ${combinedTime}`);
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

async function createEvent(eventData) {
    const supabaseAvailable = await isSupabaseAvailable();

    // Admin-created events should be automatically approved
    const eventWithStatus = { ...eventData, status: 'approved' };

    if (supabaseAvailable) {
        const { error } = await supabase.from('events').insert([eventWithStatus]);
        if (!error) await logActivity('Event Created', `Created event: ${eventData.title} on ${eventData.date}`);
        return { success: !error, message: error ? error.message : 'Event created successfully' };
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
        return { success: true, message: 'Event created successfully' };
    }
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
                admin_username: adminUsername,
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
                .select('*')
                .order('created_at', { ascending: false })
                .limit(200);
            
            if (error) throw error; // Trigger fallback
            
            if (data && data.length > 0) {
                return data.map(r => ({
                    id: r.id,
                    adminUsername: r.admin_username,
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
