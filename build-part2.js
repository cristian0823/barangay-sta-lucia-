const fs = require('fs');
const html = `
            <!-- PANEL 3: CONCERNS -->
            <div id="panel-concerns" class="content-panel">
                <div class="mb-8 border-b pb-6" style="border-color: var(--border-color);">
                    <h2 class="text-3xl font-extrabold text-amber-500 mb-2">💬 Sent a Concern</h2>
                    <p style="color: var(--text-muted);">Report issues, give feedback, or request assistance securely.</p>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-1 glass-card p-6 h-fit">
                        <h3 class="text-xl font-bold mb-4" style="color: var(--text-main);">New Report</h3>
                        <form id="concernForm" class="space-y-4">
                            <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">Title</label><input type="text" id="concernTitle" required class="w-full border-2 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none transition"></div>
                            <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">Category</label>
                                <select id="concernCategory" required class="w-full border-2 rounded-lg px-3 py-2 border-gray-200">
                                    <option value="infrastructure">Infrastructure & Roads</option><option value="cleanliness">Waste & Cleanliness</option>
                                    <option value="security">Safety & Security</option><option value="noise">Noise Complaint</option>
                                    <option value="suggestion">General Suggestion</option><option value="other">Other</option>
                                </select>
                            </div>
                            <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">Specific Location (Optional)</label><input type="text" id="concernLocation" class="w-full border-2 rounded-lg px-3 py-2 border-gray-200" placeholder="e.g. Purok 4, near intersection"></div>
                            <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">Details</label><textarea id="concernDescription" required class="w-full border-2 rounded-lg px-3 py-2 h-24 resize-none border-gray-200"></textarea></div>
                            <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition transform hover:scale-[1.02]">Submit Report</button>
                        </form>
                    </div>
                    <div class="lg:col-span-2 glass-card p-6">
                        <h3 class="text-xl font-bold mb-4" style="color: var(--text-main);">My Submitted Concerns</h3>
                        <div id="myConcernsList" class="space-y-4"><p class="text-gray-500 italic">Loading concerns...</p></div>
                    </div>
                </div>
            </div>

            <!-- PANEL 4: COURT BOOKING -->
            <div id="panel-booking" class="content-panel">
                <div class="mb-8 border-b pb-6 flex justify-between items-end flex-wrap gap-4" style="border-color: var(--border-color);">
                    <div><h2 class="text-3xl font-extrabold text-blue-600 mb-2">📅 Court Booking</h2><p style="color: var(--text-muted);">Reserve the basketball court or multi-purpose hall.</p></div>
                    <div class="bg-gray-100 p-1 rounded-xl flex shadow-inner">
                        <button onclick="switchVenue('basketball')" id="sel-basketball" class="px-5 py-2 rounded-lg font-bold text-sm bg-blue-600 text-white shadow-sm transition">🏀 Basketball Court</button>
                        <button onclick="switchVenue('multipurpose')" id="sel-multipurpose" class="px-5 py-2 rounded-lg font-bold text-sm text-gray-500 hover:text-gray-800 transition">🏢 Multi-Purpose Hall</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div class="glass-card p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h2 id="calendarMonthTitle" class="text-xl font-bold" style="color: var(--text-main);">Month</h2>
                            <div class="flex space-x-2">
                                <button onclick="changeBookingMonth(-1)" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm font-bold transition">←</button>
                                <button onclick="changeBookingMonth(1)" class="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm font-bold transition">→</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-7 gap-1 mb-2">
                            <div class="text-center font-bold text-gray-400 text-xs py-1">Sun</div><div class="text-center font-bold text-gray-400 text-xs py-1">Mon</div>
                            <div class="text-center font-bold text-gray-400 text-xs py-1">Tue</div><div class="text-center font-bold text-gray-400 text-xs py-1">Wed</div>
                            <div class="text-center font-bold text-gray-400 text-xs py-1">Thu</div><div class="text-center font-bold text-gray-400 text-xs py-1">Fri</div>
                            <div class="text-center font-bold text-gray-400 text-xs py-1">Sat</div>
                        </div>
                        <div id="bookingCalendarGrid" class="grid grid-cols-7 gap-1"></div>
                        <div class="flex justify-center flex-wrap gap-4 mt-6 text-xs font-semibold text-gray-500">
                            <div class="flex items-center"><div class="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm mr-1"></div>Available</div>
                            <div class="flex items-center"><div class="w-3 h-3 bg-purple-100 border border-purple-300 rounded-sm mr-1"></div>Brgy Event</div>
                            <div class="flex items-center"><div class="w-3 h-3 bg-red-100 border border-red-300 rounded-sm mr-1"></div>Booked</div>
                        </div>
                    </div>
                    <div class="glass-card p-6 flex flex-col justify-center">
                        <h2 id="bookingFormHeading" class="text-2xl font-bold mb-6 text-center" style="color: var(--text-main);">Select a Date in the Calendar</h2>
                        <form id="userBookingForm" class="hidden space-y-4">
                            <input type="hidden" id="bookingDateInput"><input type="hidden" id="bookingVenueInput" value="basketball">
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">Start Time</label><input type="time" id="bookingTimeInput" required class="w-full border-2 rounded-lg px-3 py-2 focus:border-blue-500 border-gray-200"></div>
                                <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">End Time</label><input type="time" id="bookingEndTimeInput" required class="w-full border-2 rounded-lg px-3 py-2 focus:border-blue-500 border-gray-200"></div>
                            </div>
                            <div><label class="block text-sm font-bold mb-1" style="color: var(--text-muted);">Purpose</label><textarea id="bookingPurposeInput" required class="w-full border-2 rounded-lg px-3 py-2 h-20 resize-none border-gray-200"></textarea></div>
                            <div id="bookingConflictWarning"></div>
                            <button type="submit" id="submitBookingBtn" class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition transform">Confirm Booking</button>
                        </form>
                    </div>
                </div>
                <div class="glass-card p-6">
                    <h3 class="text-xl font-bold mb-4" style="color: var(--text-main);">My Reservations</h3>
                    <div id="myReservationsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><p class="text-gray-500 italic">Loading reservations...</p></div>
                </div>
            </div>

            <!-- PANEL 5: EVENTS -->
            <div id="panel-events" class="content-panel">
                <div class="mb-8 border-b pb-6" style="border-color: var(--border-color);">
                    <h2 class="text-3xl font-extrabold text-purple-600 mb-2">🎉 Upcoming Court Events</h2>
                    <p style="color: var(--text-muted);">Official barangay activities and tournaments.</p>
                </div>
                <div id="upcomingEventsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><p class="text-gray-500 italic col-span-full">Loading events...</p></div>
            </div>

    </div>
    </main>

    <!-- BORROW MODAL -->
    <div id="borrowModal" class="fixed inset-0 z-[200] hidden flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
        <div class="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col mx-4 animate-[fadeIn_0.3s_ease]">
            <button onclick="closeBorrowModal()" class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition text-gray-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="p-6 border-b border-gray-100 bg-emerald-50/50">
                <h3 class="text-2xl font-extrabold text-gray-800" id="borrowModalTitle">Borrow Item</h3>
                <p class="text-sm text-gray-500 mt-1">Select your borrowing dates and provide details below.</p>
            </div>
            <div class="flex flex-col lg:flex-row flex-1 overflow-y-auto">
                <!-- Left Column: Calendar -->
                <div class="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gray-50/30">
                    <div class="flex justify-between items-center mb-4">
                        <h4 id="borrowMonthTitle" class="text-lg font-bold text-gray-800">Month Year</h4>
                        <div class="flex space-x-2">
                            <button type="button" onclick="changeBorrowMonth(-1)" class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 transition shadow-sm text-gray-600">&larr;</button>
                            <button type="button" onclick="changeBorrowMonth(1)" class="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 transition shadow-sm text-gray-600">&rarr;</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-7 gap-1 mb-2">
                        <div class="text-center font-bold text-gray-400 text-xs py-1">Sun</div><div class="text-center font-bold text-gray-400 text-xs py-1">Mon</div>
                        <div class="text-center font-bold text-gray-400 text-xs py-1">Tue</div><div class="text-center font-bold text-gray-400 text-xs py-1">Wed</div>
                        <div class="text-center font-bold text-gray-400 text-xs py-1">Thu</div><div class="text-center font-bold text-gray-400 text-xs py-1">Fri</div>
                        <div class="text-center font-bold text-gray-400 text-xs py-1">Sat</div>
                    </div>
                    <div id="borrowCalendarGrid" class="grid grid-cols-7 gap-1.5"></div>
                    <div class="flex flex-wrap justify-between items-center mt-6 p-3 bg-white rounded-xl border border-gray-100 shadow-sm text-xs font-medium text-gray-600">
                        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div> Available</div>
                        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-red-100 border border-red-300"></div> Unavailable</div>
                        <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded bg-indigo-500 border border-indigo-600"></div> Selected</div>
                    </div>
                </div>
                <!-- Right Column: Professional Form -->
                <div class="w-full lg:w-1/2 p-6 flex flex-col">
                    <!-- Date Display -->
                    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-6 relative overflow-hidden">
                        <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-200/30 rounded-full -mr-8 -mt-8"></div>
                        <h5 class="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2 relative z-10">
                            <span class="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-base">📅</span> Selected Borrowing Period
                        </h5>
                        <div class="flex items-center justify-between gap-4 relative z-10">
                            <div class="flex-1 text-center">
                                <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Borrow Date</div>
                                <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-emerald-100">
                                    <div class="text-2xl font-extrabold text-emerald-600" id="dispStartDateDay">--</div>
                                    <div class="text-xs text-gray-500" id="dispStartDateMonth">Select date</div>
                                </div>
                            </div>
                            <div class="flex flex-col items-center">
                                <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center"><span class="text-emerald-600 text-xl">→</span></div>
                                <div class="text-xs font-bold text-emerald-600 mt-1" id="borrowDuration">0 days</div>
                            </div>
                            <div class="flex-1 text-center">
                                <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">Return Date</div>
                                <div class="bg-white rounded-xl py-3 px-2 shadow-sm border border-emerald-100">
                                    <div class="text-2xl font-extrabold text-emerald-600" id="dispReturnDateDay">--</div>
                                    <div class="text-xs text-gray-500" id="dispReturnDateMonth">Select date</div>
                                </div>
                            </div>
                        </div>
                        <div id="dateRangeDisplay" class="mt-4 text-center text-sm font-medium text-emerald-700 bg-white/60 py-2 rounded-lg">Please select your borrowing dates from the calendar</div>
                        <div class="mt-3 text-[11px] leading-relaxed text-emerald-700 bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200/50">
                            <strong>Important:</strong> Return deadline is <strong>2:00 PM</strong> on your Return Date. You get a <strong>+1 day extension</strong> to bring the item back.
                        </div>
                    </div>
                    <form id="borrowForm" class="flex-1 flex flex-col h-full space-y-4">
                        <input type="hidden" id="borrowEquipmentId"><input type="hidden" id="borrowEquipmentName">
                        <input type="hidden" id="borrowStartDate"><input type="hidden" id="borrowReturnDate">
                        <!-- Professional User Info -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <span class="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">📥</span> Borrow Date
                                </label>
                                <div id="borrowDateDisplay" class="bg-emerald-50 border-2 border-emerald-200 rounded-xl py-3 px-4 text-center">
                                    <div class="text-lg font-bold text-emerald-700">Select date</div><div class="text-xs text-emerald-500">from calendar</div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold mb-2 text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                    <span class="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center text-sm">📤</span> Return Date
                                </label>
                                <div id="returnDateDisplay" class="bg-teal-50 border-2 border-teal-200 rounded-xl py-3 px-4 text-center">
                                    <div class="text-lg font-bold text-teal-700">Select date</div><div class="text-xs text-teal-500">from calendar</div>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold mb-1.5 text-gray-700 uppercase tracking-wider">Full Name</label>
                                <input type="text" id="borrowerFullName" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium" placeholder="Your full name">
                            </div>
                            <div>
                                <label class="block text-xs font-bold mb-1.5 text-gray-700 uppercase tracking-wider">Contact Number</label>
                                <input type="text" id="borrowerContact" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium" placeholder="09XX XXX XXXX">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold mb-1.5 text-gray-700 uppercase tracking-wider">Quantity Needed</label>
                            <input type="number" id="borrowQty" min="1" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800 font-medium">
                            <p id="borrowMaxHelp" class="text-xs text-orange-600 mt-1.5 font-medium"></p>
                        </div>
                        <div class="flex-1">
                            <label class="block text-xs font-bold mb-1.5 text-gray-700 uppercase tracking-wider">Purpose</label>
                            <textarea id="borrowPurpose" required class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 h-24 resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-gray-800" placeholder="Describe why you need this equipment..."></textarea>
                        </div>
                        <button type="submit" id="submitBorrowBtn" disabled class="w-full mt-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5">
                            ✅ Submit Borrow Request
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
`;
fs.appendFileSync('user-dashboard-new.html', html, 'utf8');
console.log('Part 2 written');
