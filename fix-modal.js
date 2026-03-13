const fs = require('fs');
let html = fs.readFileSync('user-dashboard.html', 'utf8');

const startMod1 = html.indexOf('<!-- REQUEST TO BORROW MODAL -->');
const endMod1 = html.indexOf('<!-- PANEL 3: CONCERNS & FEEDBACK -->');
if (startMod1 > -1 && endMod1 > startMod1) {
    html = html.substring(0, startMod1) + html.substring(endMod1);
}

const wrapperStartHtml = `
    <!-- Borrow Modal -->
    <div id="borrowModal" class="fixed inset-0 z-[200] hidden flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto pt-10 pb-10">
        <div class="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col mx-4 animate-[fadeIn_0.3s_ease]">
            <button onclick="closeBorrowModal()" class="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition text-gray-700 dark:text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div class="p-6 border-b`;

const targetStart = `<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/20">`;
html = html.replace(targetStart, wrapperStartHtml.trim() + ' border-gray-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-emerald-900/20">');

const targetEnd = `Submit Request
                </button>
            </form>
        </div>
    </div>
    </div>
    </div>`;

const wrapperEndHtml = `Submit Request
                </button>
            </form>
        </div>
    </div>
    </div>
    </div>
        </div>
    </div>`;
html = html.replace(targetEnd, wrapperEndHtml);

fs.writeFileSync('user-dashboard.html', html, 'utf8');
console.log('Fixed DOM successfully!');
