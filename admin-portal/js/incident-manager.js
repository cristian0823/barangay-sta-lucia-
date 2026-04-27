// ============================================================
// ISO/IEC 27001 A.16 — Incident Management
// Barangay Sta. Lucia Management System
// ============================================================

const INCIDENT_TYPES = {
    MASS_FAILED_LOGIN: 'Mass Failed Logins',
    UNAUTHORIZED_ACCESS: 'Unauthorized Access Attempt',
    SUSPICIOUS_EXPORT: 'Suspicious Data Export',
    ACCOUNT_LOCKED: 'Account Locked',
    PRIVILEGE_ESCALATION: 'Privilege Escalation Attempt',
    ADMIN_MFA_FAILED: 'Admin MFA Failed',
    DATA_BREACH_ATTEMPT: 'Potential Data Breach Attempt',
    GENERAL: 'General Security Event'
};

const SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// ── A.16.1.2 Detect and Log Security Incidents ───────────────
async function detectAndReportIncident(type, details, severity = SEVERITY.MEDIUM) {
    const incident = {
        type,
        severity,
        description: details,
        detected_at: new Date().toISOString(),
        status: 'open',
        actions_taken: '',
        notified_users: false
    };

    // Log to activity_log as well
    if (typeof logActivity === 'function') {
        await logActivity(`🚨 Security Incident: ${type}`, details, severity);
    }

    // Try to persist to Supabase security_incidents table
    try {
        if (typeof supabase !== 'undefined') {
            const { error } = await supabase.from('security_incidents').insert([{
                type: incident.type,
                severity: incident.severity,
                description: incident.description,
                status: incident.status,
                detected_at: incident.detected_at
            }]);
            if (error) throw error;
        }
    } catch (e) {
        // Fallback to localStorage
        const incidents = JSON.parse(localStorage.getItem('brgy_incidents') || '[]');
        incidents.unshift({ ...incident, id: Date.now() });
        localStorage.setItem('brgy_incidents', JSON.stringify(incidents.slice(0, 100)));
    }

    // Show admin notification if they're on the dashboard
    if (typeof showAdminIncidentToast === 'function') {
        showAdminIncidentToast(type, severity);
    }

    return incident;
}

// ── Failed Login Monitor (A.16.1.3) ─────────────────────────
const _failedLoginTracker = {};

async function trackFailedLogin(username) {
    const key = username.toLowerCase();
    if (!_failedLoginTracker[key]) {
        _failedLoginTracker[key] = { count: 0, firstAt: Date.now() };
    }
    _failedLoginTracker[key].count++;

    // 5 failures within 10 minutes = incident
    const elapsed = Date.now() - _failedLoginTracker[key].firstAt;
    if (_failedLoginTracker[key].count >= 5 && elapsed < 10 * 60 * 1000) {
        await detectAndReportIncident(
            INCIDENT_TYPES.MASS_FAILED_LOGIN,
            `${_failedLoginTracker[key].count} failed login attempts for username "${username}" within ${Math.round(elapsed / 60000)} minutes.`,
            SEVERITY.HIGH
        );
        delete _failedLoginTracker[key]; // reset after reporting
    }
}

// ── A.16.1.5 Breach Response — Notify Affected Users ─────────
async function notifyUsersOfIncident(message, userIds = null) {
    try {
        if (typeof supabase === 'undefined') throw new Error('Supabase unavailable');

        let query = supabase.from('users').select('id');
        if (userIds && userIds.length > 0) {
            query = query.in('id', userIds);
        } else {
            query = query.eq('role', 'user');
        }
        const { data: users, error } = await query;
        if (error) throw error;

        const notifications = users.map(u => ({
            user_id: u.id,
            type: 'security_alert',
            message,
            is_read: false,
            created_at: new Date().toISOString()
        }));

        const { error: notifErr } = await supabase.from('user_notifications').insert(notifications);
        if (notifErr) throw notifErr;

        return { success: true, count: notifications.length };
    } catch (e) {
        console.error('[ISO A.16] Notify users failed:', e);
        return { success: false, message: e.message };
    }
}

// ── A.16.1.7 Resolve Incident ────────────────────────────────
async function resolveIncident(incidentId, actionsTaken) {
    try {
        if (typeof supabase !== 'undefined') {
            const { error } = await supabase.from('security_incidents').update({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                actions_taken: actionsTaken
            }).eq('id', incidentId);
            if (!error) return { success: true };
        }
    } catch (e) {}

    // localStorage fallback
    const incidents = JSON.parse(localStorage.getItem('brgy_incidents') || '[]');
    const idx = incidents.findIndex(i => i.id == incidentId);
    if (idx !== -1) {
        incidents[idx].status = 'resolved';
        incidents[idx].resolved_at = new Date().toISOString();
        incidents[idx].actions_taken = actionsTaken;
        localStorage.setItem('brgy_incidents', JSON.stringify(incidents));
    }
    return { success: true };
}

// ── A.12.4 Fetch Incidents for Admin Display ─────────────────
async function getSecurityIncidents(limit = 50) {
    try {
        if (typeof supabase !== 'undefined') {
            const { data, error } = await supabase
                .from('security_incidents')
                .select('*')
                .order('detected_at', { ascending: false })
                .limit(limit);
            if (!error && data && data.length > 0) return data;
        }
    } catch (e) {}
    return JSON.parse(localStorage.getItem('brgy_incidents') || '[]').slice(0, limit);
}
