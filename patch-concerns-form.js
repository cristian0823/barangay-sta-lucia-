const fs = require('fs');
let c = fs.readFileSync('user-portal/user-dashboard.html','utf8').replace(/\r\n/g,'\n');

const OLD = `                <div id="concern-tab-form">
                    <div class="glass-card overflow-hidden" style="max-width:680px;">
                        <div style="background:#f8fafc;padding:16px 20px;border-bottom:1px solid #e2e8f0;">
                            <h3 style="font-size:14px;font-weight:800;color:#0f1f3d;margin:0;"><i class="bi bi-pencil-square" style="margin-right:8px;color:#1e3a5f;"></i>New Report</h3>
                            <p style="font-size:11px;color:#64748b;margin:4px 0 0 0;">Please provide details about your concern.</p>
                        </div>
                        <div class="p-5">
                            <form id="concernForm" class="space-y-4">
                                <div class="space-y-1.5">
                                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Title <span class="text-red-500">*</span></label>
                                    <input type="text" id="concernTitle" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition-all outline-none" placeholder="e.g. Broken street light">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Category <span class="text-red-500">*</span></label>
                                    <select id="concernCategory" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none">
                                        <option value="" disabled selected>Select a category...</option>
                                        <option value="Road Issue"> Road Issue / Pothole</option>
                                        <option value="Electric"> Electric / Power Outage</option>
                                        <option value="Water Leak"> Water Leak / Broken Pipe</option>
                                        <option value="Waste &amp; Cleanliness"> Waste &amp; Cleanliness</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="space-y-1.5">
                                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Specific Location <span class="text-red-500">*</span></label>
                                    <input type="text" id="concernLocation" required class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition-all outline-none" placeholder="e.g. Purok 4, intersection">
                                </div>
                                <div class="space-y-1.5">
                                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300">Detailed Description <span class="text-red-500">*</span></label>
                                    <textarea id="concernDescription" required rows="4" class="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition-all outline-none resize-y" placeholder="Describe your concern in detail..."></textarea>
                                </div>
                                <div class="space-y-1.5 p-4 bg-slate-50 text-slate-900 dark:bg-navy-900/20 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-200">
                                    <label class="block text-sm font-bold mb-1"><i class="bi bi-camera-fill mr-2"></i>Attach Photo <span class="text-red-500">*</span></label>
                                    <p class="text-[11px] opacity-80 mb-3 leading-relaxed">Adding an image helps the admin understand and address your concern faster.</p>
                                    <div id="imagePreviewContainer" class="hidden mb-3 relative inline-block">
                                        <img id="concernImagePreview" src="" alt="Preview" class="max-w-full h-32 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-sm object-cover">
                                        <button type="button" onclick="clearImagePreview()" class="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md"></button>
                                    </div>
                                    <input type="file" id="concernImage" required accept="image/*" class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white dark:file:bg-gray-800 file:text-slate-700 dark:file:text-slate-400 file:shadow-sm hover:file:bg-gray-50 cursor-pointer">
                                </div>
                                <button type="submit" id="submitConcernBtn" class="w-full mt-2 font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer border-none" style="background:#1e3a5f;color:#fff;">
                                    <i class="bi bi-send-fill mr-2"></i>Submit Report
                                </button>
                            </form>
                        </div>
                    </div>
                </div>`;

const NEW = `                <div id="concern-tab-form">
                    <div style="max-width:680px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,0.06);overflow:hidden;">
                        <!-- Form Header -->
                        <div style="background:#1e3a5f;padding:18px 24px;display:flex;align-items:center;gap:12px;">
                            <div style="width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="bi bi-megaphone-fill" style="font-size:16px;color:#fff;"></i></div>
                            <div>
                                <div style="font-size:15px;font-weight:700;color:#fff;line-height:1.2;">Submit a Concern</div>
                                <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px;">Barangay Sta. Lucia &mdash; Official Report Form</div>
                            </div>
                        </div>
                        <!-- Form Body -->
                        <div style="padding:24px;">
                            <form id="concernForm">
                                <!-- Row 1: Title + Category -->
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                                    <div>
                                        <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:6px;">Concern Title <span style="color:#dc2626;">*</span></label>
                                        <input type="text" id="concernTitle" required placeholder="e.g. Broken street light" style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid #e2e8f0;font-size:13px;font-family:inherit;outline:none;background:#f8fafc;color:#0f1f3d;box-sizing:border-box;transition:border-color 0.15s;" onfocus="this.style.borderColor='#1e3a5f';this.style.boxShadow='0 0 0 3px rgba(30,58,95,0.08)'" onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow=''">
                                    </div>
                                    <div>
                                        <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:6px;">Category <span style="color:#dc2626;">*</span></label>
                                        <select id="concernCategory" required style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid #e2e8f0;font-size:13px;font-family:inherit;outline:none;background:#f8fafc;color:#0f1f3d;box-sizing:border-box;transition:border-color 0.15s;cursor:pointer;appearance:auto;" onfocus="this.style.borderColor='#1e3a5f';this.style.boxShadow='0 0 0 3px rgba(30,58,95,0.08)'" onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow=''">
                                            <option value="" disabled selected>Select a category...</option>
                                            <option value="Road Issue">Road Issue / Pothole</option>
                                            <option value="Electric">Electric / Power Outage</option>
                                            <option value="Water Leak">Water Leak / Broken Pipe</option>
                                            <option value="Waste &amp; Cleanliness">Waste &amp; Cleanliness</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <!-- Location -->
                                <div style="margin-bottom:16px;">
                                    <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:6px;">Specific Location <span style="color:#dc2626;">*</span></label>
                                    <input type="text" id="concernLocation" required placeholder="e.g. Purok 4, near the intersection" style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid #e2e8f0;font-size:13px;font-family:inherit;outline:none;background:#f8fafc;color:#0f1f3d;box-sizing:border-box;transition:border-color 0.15s;" onfocus="this.style.borderColor='#1e3a5f';this.style.boxShadow='0 0 0 3px rgba(30,58,95,0.08)'" onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow=''">
                                </div>
                                <!-- Description -->
                                <div style="margin-bottom:16px;">
                                    <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:6px;">Detailed Description <span style="color:#dc2626;">*</span></label>
                                    <textarea id="concernDescription" required rows="4" placeholder="Describe your concern clearly so the barangay can address it promptly..." style="width:100%;padding:10px 12px;border-radius:8px;border:1.5px solid #e2e8f0;font-size:13px;font-family:inherit;outline:none;background:#f8fafc;color:#0f1f3d;box-sizing:border-box;resize:vertical;transition:border-color 0.15s;" onfocus="this.style.borderColor='#1e3a5f';this.style.boxShadow='0 0 0 3px rgba(30,58,95,0.08)'" onblur="this.style.borderColor='#e2e8f0';this.style.boxShadow=''"></textarea>
                                </div>
                                <!-- Photo upload -->
                                <div style="margin-bottom:20px;padding:16px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;">
                                    <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#64748b;margin-bottom:4px;"><i class="bi bi-camera-fill" style="margin-right:6px;color:#1e3a5f;"></i>Attach Photo <span style="color:#dc2626;">*</span></label>
                                    <p style="font-size:11px;color:#94a3b8;margin:0 0 10px 0;">Adding a photo helps the barangay understand and respond to your concern faster.</p>
                                    <div id="imagePreviewContainer" style="display:none;margin-bottom:10px;position:relative;display:inline-block;">
                                        <img id="concernImagePreview" src="" alt="Preview" style="max-width:100%;height:120px;border-radius:8px;border:1.5px solid #e2e8f0;object-fit:cover;">
                                        <button type="button" onclick="clearImagePreview()" style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;background:#ef4444;border:none;border-radius:50%;color:#fff;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">&#10005;</button>
                                    </div>
                                    <input type="file" id="concernImage" required accept="image/*" style="width:100%;font-size:12px;color:#64748b;cursor:pointer;">
                                </div>
                                <!-- Submit -->
                                <button type="submit" id="submitConcernBtn" style="width:100%;padding:13px;border-radius:10px;border:none;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;background:#1e3a5f;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s;" onmouseover="this.style.background='#0f2547'" onmouseout="this.style.background='#1e3a5f'">
                                    <i class="bi bi-send-fill"></i> Submit Report
                                </button>
                            </form>
                        </div>
                    </div>
                </div>`;

const idx = c.indexOf(OLD);
if(idx===-1){console.log('MISS form block');process.exit(1);}
c=c.substring(0,idx)+NEW+c.substring(idx+OLD.length);
fs.writeFileSync('user-portal/user-dashboard.html',c);
console.log('OK form redesign');
