
        // Modal Handlers for Edit Functionality
        let allMyBorrowingsCache = [];
        let allMyConcernsCache = [];
        let allMyBookingsCache = [];

        async function fetchEditRecords() {
            allMyBorrowingsCache = await getMyBorrowings();
            allMyConcernsCache = await getMyConcerns();
            allMyBookingsCache = await getCourtBookings();
        }

        async function openEditBorrowingModal(id) {
            await fetchEditRecords();
            const record = allMyBorrowingsCache.find(b => b.id === id);
            if (!record) return showToast('Record not found', 'error');

            document.getElementById('editBorrowingId').value = record.id;
            document.getElementById('editBorrowingItemName').value = record.equipment;
            document.getElementById('editBorrowingQty').value = record.quantity;
            document.getElementById('editBorrowingStartDate').value = record.borrowDate;
            document.getElementById('editBorrowingEndDate').value = record.returnDate;
            
            let purpose = record.purpose || '';
            const pMatch = purpose.match(/Purpose:\s*(.*)\s*\| Borrower:/);
            if (pMatch) purpose = pMatch[1].trim();
            document.getElementById('editBorrowingPurpose').value = purpose;

            document.getElementById('editBorrowingModal').classList.remove('hidden');
        }

        function closeEditBorrowingModal() { document.getElementById('editBorrowingModal').classList.add('hidden'); }

        document.getElementById('editBorrowingForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editBorrowingId').value);
            const rawPurpose = document.getElementById('editBorrowingPurpose').value;
            const record = allMyBorrowingsCache.find(b => b.id === id);
            let finalPurpose = rawPurpose;
            if (record && record.purpose) {
                if (record.purpose.includes('Purpose: ') && record.purpose.includes(' | Borrower:')) {
                    finalPurpose = record.purpose.replace(/Purpose:\s*(.*)\s*\|\s*Borrower:/, `Purpose: ${rawPurpose} | Borrower:`);
                }
            }

            const updates = {
                quantity: parseInt(document.getElementById('editBorrowingQty').value),
                borrowDate: document.getElementById('editBorrowingStartDate').value,
                returnDate: document.getElementById('editBorrowingEndDate').value,
                purpose: finalPurpose
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            
            const res = await updateBorrowingRequest(id, updates);
            if (res.success) { showToast(res.message, 'success'); closeEditBorrowingModal(); loadMyBorrowingsList(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            
            btn.disabled = false; btn.innerHTML = 'Save Changes';
        });

        async function openEditConcernModal(id) {
            await fetchEditRecords();
            const record = allMyConcernsCache.find(c => c.id === id);
            if (!record) return showToast('Record not found', 'error');

            document.getElementById('editConcernId').value = record.id;
            document.getElementById('editConcernTitle').value = record.title;
            document.getElementById('editConcernCategory').value = record.category;
            document.getElementById('editConcernAddress').value = record.address;
            
            let description = record.description || '';
            if (description.includes('[ATTACHED_IMAGE_DATA]')) {
                description = description.split('[ATTACHED_IMAGE_DATA]')[0].trim();
            }
            document.getElementById('editConcernDescription').value = description;

            document.getElementById('editConcernModal').classList.remove('hidden');
        }

        function closeEditConcernModal() { document.getElementById('editConcernModal').classList.add('hidden'); }

        document.getElementById('editConcernForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editConcernId').value);
            const updates = {
                title: document.getElementById('editConcernTitle').value,
                category: document.getElementById('editConcernCategory').value,
                address: document.getElementById('editConcernAddress').value,
                description: document.getElementById('editConcernDescription').value
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            
            const res = await updateConcernRequest(id, updates);
            if (res.success) { showToast(res.message, 'success'); closeEditConcernModal(); loadConcernsView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            
            btn.disabled = false; btn.innerHTML = 'Save Changes';
        });

        async function openEditCourtBookingModal(id) {
            await fetchEditRecords();
            const record = allMyBookingsCache.find(b => b.id === id);
            if (!record) return showToast('Record not found', 'error');

            document.getElementById('editCourtBookingId').value = record.id;
            
            const d = new Date(record.date);
            const dateInput = document.getElementById('editCourtDate');
            dateInput.value = record.date; // set YYYY-MM-DD
            dateInput.min = new Date().toLocaleDateString('en-CA'); // enforce future date

            const venue = record.venue || (record.venueName && record.venueName.includes('Multi-Purpose') ? 'multipurpose' : 'basketball');
            // Remove emojis internally just in case UI had them previously
            document.getElementById('editCourtVenue').value = venue.replace(/[\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF\u200D]+/g, '').trim();

            const stSelect = document.getElementById('editCourtStartTime');
            const etSelect = document.getElementById('editCourtEndTime');
            stSelect.innerHTML = ''; etSelect.innerHTML = '';
            for (let i = 8; i <= 21; i++) {
                let h12 = i > 12 ? i - 12 : i;
                let ampm = i >= 12 ? 'PM' : 'AM';
                let timeStr = `${h12}:00 ${ampm}`;
                stSelect.add(new Option(timeStr, timeStr));
                etSelect.add(new Option(timeStr, timeStr));
                
                if (i !== 21) {
                    timeStr = `${h12}:30 ${ampm}`;
                    stSelect.add(new Option(timeStr, timeStr));
                    etSelect.add(new Option(timeStr, timeStr));
                }
            }

            let tRange = record.timeRange || record.time; 
            if (tRange.includes(' | ')) tRange = tRange.split(' | ')[1];
            const parts = tRange.split(' – ').map(s => s.trim());
            stSelect.value = parts[0];
            if (parts[1]) etSelect.value = parts[1];

            document.getElementById('editCourtPurpose').value = record.purpose || '';

            document.getElementById('editCourtBookingModal').classList.remove('hidden');
        }

        function closeEditCourtBookingModal() { document.getElementById('editCourtBookingModal').classList.add('hidden'); }

        document.getElementById('editCourtBookingForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            const id = parseInt(document.getElementById('editCourtBookingId').value);
            const updates = {
                date: document.getElementById('editCourtDate').value,
                venue: document.getElementById('editCourtVenue').value,
                time: document.getElementById('editCourtStartTime').value,
                end_time: document.getElementById('editCourtEndTime').value,
                purpose: document.getElementById('editCourtPurpose').value
            };

            const btn = this.querySelector('button[type="submit"]');
            btn.disabled = true; btn.innerHTML = 'Saving...';
            
            const res = await updateCourtBooking(id, updates);
            if (res.success) { showToast(res.message, 'success'); closeEditCourtBookingModal(); loadBookingView(); loadDashboardStats(); }
            else { showToast(res.message, 'error'); }
            
            btn.disabled = false; btn.innerHTML = 'Save Changes';
        });
    