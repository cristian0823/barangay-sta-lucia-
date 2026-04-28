// js/realtime-listeners.js
// Supabase Realtime setup for Barangay Management System

document.addEventListener('DOMContentLoaded', () => {
    // Give it 1.5 seconds to ensure Supabase and currentUser are initialized
    setTimeout(initRealtime, 1500);
});

function initRealtime() {
    if (!window.supabase) return;
    
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!userStr) return;
    
    let user;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        return;
    }
    
    const isAdmin = user.role === 'admin' || user.role === 'Admin';
    
    // Create a channel
    const channel = window.supabase.channel('barangay-realtime');

    if (isAdmin) {
        // Admin Listeners
        
        // 1. Listen for new Concerns
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'concerns' }, payload => {
            if (typeof window.showToast === 'function') window.showToast('New Citizen Concern Submitted!', 'info');
            if (typeof loadStats === 'function') loadStats();
            if (typeof loadConcerns === 'function') loadConcerns();
            if (typeof loadActivityLog === 'function') loadActivityLog();
        });

        // 2. Listen for new Equipment Requests
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'borrowings' }, payload => {
            if (typeof window.showToast === 'function') window.showToast('New Equipment Borrowing Request!', 'info');
            if (typeof loadStats === 'function') loadStats();
            if (typeof loadRequests === 'function') loadRequests();
            if (typeof loadActivityLog === 'function') loadActivityLog();
        });

        // 3. Listen for new Court Bookings
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'facility_reservations' }, payload => {
            if (typeof window.showToast === 'function') window.showToast('New Facility Booking Submitted!', 'info');
            if (typeof loadStats === 'function') loadStats();
            if (typeof loadCourtBookings === 'function') loadCourtBookings();
            if (typeof loadActivityLog === 'function') loadActivityLog();
        });

    } else {
        // Resident (User) Listeners
        
        // 1. Listen for status changes on THEIR equipment requests
        channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'borrowings', filter: `user_id=eq.${user.id}` }, payload => {
            const newStatus = payload.new.status;
            if (newStatus !== 'pending') {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Your equipment request was ${newStatus}!`, newStatus === 'approved' ? 'success' : 'error');
                }
                if (typeof loadMyBorrowingsList === 'function') loadMyBorrowingsList();
                if (typeof loadDashboardStats === 'function') loadDashboardStats();
            }
        });

        // 2. Listen for status changes on THEIR court bookings
        channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'facility_reservations', filter: `user_id=eq.${user.id}` }, payload => {
            const newStatus = payload.new.status;
            if (newStatus !== 'pending') {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Your reservation was ${newStatus}!`, newStatus === 'approved' ? 'success' : 'error');
                }
                if (typeof loadBookingView === 'function') loadBookingView();
                if (typeof loadDashboardStats === 'function') loadDashboardStats();
            }
        });

        // 3. Listen for NEW Events created by Admin
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, payload => {
            if (typeof window.showToast === 'function') {
                window.showToast(`New Event Added: ${payload.new.title}`, 'info');
            }
            
            // Fetch the new notification and update the bell immediately
            if (typeof pollBellNotifications === 'function') {
                pollBellNotifications();
            }
            
            // Refresh events view if on that page
            if (typeof loadEventsView === 'function') loadEventsView();
            if (typeof loadDashboardStats === 'function') loadDashboardStats();
        });
        
        // 4. Listen for concerns replies
        channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'concerns', filter: `user_id=eq.${user.id}` }, payload => {
            const newStatus = payload.new.status;
            if (newStatus !== 'pending') {
                if (typeof window.showToast === 'function') {
                    window.showToast(`Your concern was marked as ${newStatus}!`, 'success');
                }
                if (typeof loadConcernsView === 'function') loadConcernsView();
            }
        });
    }

    // Subscribe to the channel
    channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            console.log('⚡ Realtime connected for live updates');
        } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime Channel Error. Make sure you ran the enable_realtime.sql script.');
        }
    });
}
