import { getCurrentUserData } from "../services/user.service.js";
import { sparklineSVG } from "../services/usage.service.js";
import {
  getCommunityStatus,
  getVendors,
  submitReport,
  trySync,
  predictNextSupply,
  getSupplyPatternSeries,
} from "../services/water.service.js";
import { showToast } from "../components/toast.js";
import { navigate } from "../app/router.js";

/**
 * Modern Style Helpers
 */
const getStatusStyles = (s) => {
  const styles = {
    ON: "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500",
    OFF: "bg-rose-50 text-rose-700 border-rose-100 ring-rose-500",
    "LOW PRESSURE":
      "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500",
    DEFAULT: "bg-slate-50 text-slate-700 border-slate-100 ring-slate-500",
  };
  return styles[s] || styles.DEFAULT;
};

/**
 * Sub-component: Vendor Card
 */
const renderVendorCard = (v) => `
  <div class="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all duration-300">
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div>
          <h4 class="font-bold text-slate-800 text-sm">${v.name}</h4>
          <p class="text-[11px] text-slate-500 uppercase tracking-tighter">${
            v.route
          }</p>
        </div>
      </div>
      <span class="text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
        v.available
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-100 text-slate-400"
      }">
        ${v.available ? "Online" : "Away"}
      </span>
    </div>
    <div class="mt-4 flex items-center justify-between">
      <span class="text-sm font-bold text-slate-700">Ksh ${
        v.price
      }<span class="text-[10px] text-slate-400 font-normal">/20L</span></span>
      <button data-vendor-id="${
        v.id
      }" class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
        Details →
      </button>
    </div>
  </div>`;

/**
 * Main Render Function
 */
export const renderWater = async () => {
  const content = document.getElementById("content");

  // Fetch Data
  const [userData, status, vendors, pred, pattern] = await Promise.all([
    getCurrentUserData(),
    getCommunityStatus(),
    getVendors(),
    predictNextSupply(),
    getSupplyPatternSeries(14),
  ]);

  const spark = sparklineSVG(pattern, 400, 60);
  const statusClasses = getStatusStyles(status.status);

  content.innerHTML = `
    <div class="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in">
      
      <!-- Top Action Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight">Water Central</h2>
          <p class="text-slate-500 font-medium">Real-time community supply monitoring</p>
        </div>
        <button id="fab-report" class="flex items-center justify-center gap-2 py-4 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 transition-all active:scale-95 group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Report Water Status
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- MAIN COLUMN: Status & Map -->
        <div class="lg:col-span-8 space-y-6">
          <div class="relative overflow-hidden rounded-[2.5rem] border-2 ${statusClasses} p-8 shadow-sm transition-colors duration-500">
            <!-- Decorative Background Element -->
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-current opacity-5 rounded-full"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                </span>
                <p class="text-xs font-black uppercase tracking-[0.2em] opacity-70">Live Status</p>
              </div>
              
              <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 class="text-6xl font-black tracking-tighter">${
                    status.status
                  }</h3>
                  <p class="text-lg font-medium mt-2 opacity-80">${
                    status.count
                  } neighbors verified this today</p>
                </div>
                <div class="bg-white/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/40">
                    <span class="text-[10px] font-bold uppercase block opacity-60">Last Updated</span>
                    <span class="text-sm font-bold tracking-tight">Just now</span>
                </div>
              </div>
              
              <!-- Map Section -->
              <div class="mt-10 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white/60 p-3 shadow-inner">
                <div class="w-full h-72 bg-slate-200/40 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
                  <!-- Abstract Map Grid Pattern -->
                  <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>
                  
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 opacity-20 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p class="text-xs font-black tracking-widest uppercase text-slate-500 relative z-10">Area Coverage Map</p>
                  <p class="text-[10px] mt-1 font-bold text-slate-400 relative z-10">Interactive hotspots active</p>
                  
                  <!-- Fake Map Indicators -->
                  <div class="absolute top-1/4 left-1/3 w-4 h-4 bg-emerald-500 rounded-full blur-[2px] animate-pulse"></div>
                  <div class="absolute bottom-1/3 right-1/4 w-4 h-4 bg-indigo-500 rounded-full blur-[2px] animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR: Forecast & Vendors -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Prediction Card -->
          <div class="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
             <div class="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
             
             <p class="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">Supply Forecast</p>
             <h3 class="text-2xl font-bold mt-6 leading-tight">Next supply expected <span class="text-indigo-400">${
               pred.day
             }</span> around <span class="text-indigo-400">${
    pred.time
  }</span>.</h3>
             
             <div class="mt-8 pt-8 border-t border-slate-800">
                <div class="flex justify-between items-end mb-4">
                   <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">14-Day Supply Trend</span>
                   <span class="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-bold tracking-tighter">PREDICTIVE</span>
                </div>
                <div class="w-full h-16 opacity-50 hover:opacity-100 transition-opacity">
                    ${spark}
                </div>
             </div>
          </div>

          <!-- Vendors Card -->
          <div class="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col max-h-[600px]">
            <div class="flex justify-between items-center mb-6 px-2 flex-shrink-0">
               <h3 class="font-black text-slate-900 text-xl tracking-tight italic">Local Vendors</h3>
               <div class="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 border border-slate-100">
                ${vendors.length} ACTIVE
               </div>
            </div>
            <div id="vendors-list" class="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              ${vendors.map((v) => renderVendorCard(v)).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- REPORT MODAL -->
    <div id="report-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md hidden items-center justify-center z-50 p-4 transition-all">
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-scale-in">
        <div class="flex justify-between items-start mb-6">
            <div>
                <h3 class="text-3xl font-black text-slate-900 tracking-tight">Report Issue</h3>
                <p class="text-slate-500 text-sm font-medium">Your data helps the whole neighborhood.</p>
            </div>
            <button id="report-close-x" class="text-slate-400 hover:text-slate-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        
        <form id="report-form" class="space-y-6">
          <div>
            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Current Condition</label>
            <div class="grid grid-cols-2 gap-3">
                <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm hover:border-indigo-600 transition-all" data-value="ON">Water ON</button>
                <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm hover:border-indigo-600 transition-all" data-value="OFF">Water OFF</button>
                <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm hover:border-indigo-600 transition-all" data-value="LOW">Low Pressure</button>
                <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm hover:border-indigo-600 transition-all" data-value="DIRTY">Dirty Water</button>
            </div>
            <input type="hidden" id="report-type" value="ON">
          </div>
          <div>
            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Internal Notes</label>
            <textarea id="report-notes" placeholder="Optional: e.g. 'Since 10 AM'" class="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all" rows="3"></textarea>
          </div>
          <div class="flex gap-4 pt-2">
            <button type="button" id="report-cancel" class="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" class="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">Post Update</button>
          </div>
        </form>
      </div>
    </div>

    <!-- VENDOR DETAILS MODAL -->
    <div id="vendor-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md hidden items-center justify-center z-50 p-4 transition-all">
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-scale-in" id="vendor-modal-content"></div>
    </div>
  `;

  // Attach Event Handlers
  setupEventListeners(vendors);
  trySync();
};

/**
 * Encapsulated Event Logic
 */
const setupEventListeners = (vendors) => {
  const reportModal = document.getElementById("report-modal");
  const vendorModal = document.getElementById("vendor-modal");
  const reportTypeInput = document.getElementById("report-type");

  // Show Report Modal
  document.getElementById("fab-report").onclick = async () => {
    const profile = await getCurrentUserData();
    if (!profile.success || !profile.data.onboarded) {
      showToast("Please complete onboarding first", "warning");
      navigate("/onboarding");
      return;
    }
    reportModal.classList.replace("hidden", "flex");
  };

  // Close Modals
  [
    document.getElementById("report-cancel"),
    document.getElementById("report-close-x"),
  ].forEach((btn) => {
    btn.onclick = () => reportModal.classList.replace("flex", "hidden");
  });

  // Modal Option Selection
  document.querySelectorAll(".report-opt-btn").forEach((btn) => {
    btn.onclick = () => {
      document
        .querySelectorAll(".report-opt-btn")
        .forEach((b) =>
          b.classList.remove(
            "border-indigo-600",
            "bg-indigo-50",
            "text-indigo-600"
          )
        );
      btn.classList.add("border-indigo-600", "bg-indigo-50", "text-indigo-600");
      reportTypeInput.value = btn.getAttribute("data-value");
    };
  });

  // Submit Report
  document.getElementById("report-form").onsubmit = async (e) => {
    e.preventDefault();
    const type = reportTypeInput.value;
    const notes = document.getElementById("report-notes").value.trim();

    await submitReport({ type, notes });
    showToast("Community updated successfully!", "success");
    reportModal.classList.replace("flex", "hidden");
    renderWater(); // Re-render to show updated counts
  };

  // Vendor Details
  document.querySelectorAll("[data-vendor-id]").forEach((btn) => {
    btn.onclick = () => {
      const v = vendors.find(
        (x) => x.id === btn.getAttribute("data-vendor-id")
      );
      if (!v) return;

      document.getElementById("vendor-modal-content").innerHTML = `
        <div class="text-center">
            <div class="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            </div>
            <h3 class="text-3xl font-black text-slate-900 tracking-tight">${v.name}</h3>
            <p class="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">${v.route}</p>
            
            <div class="grid grid-cols-2 gap-4 mt-8">
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Price</p>
                    <p class="font-bold text-slate-800 tracking-tight">Ksh ${v.price}</p>
                </div>
                <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                    <p class="font-bold text-emerald-500 tracking-tight">Active</p>
                </div>
            </div>

            <a href="tel:${v.contact}" class="block w-full mt-8 py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-100 transition-all active:scale-95">
                Call Vendor
            </a>
            <button id="vendor-close" class="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Dismiss</button>
        </div>
      `;
      vendorModal.classList.replace("hidden", "flex");
      document.getElementById("vendor-close").onclick = () =>
        vendorModal.classList.replace("flex", "hidden");
    };
  });
};
