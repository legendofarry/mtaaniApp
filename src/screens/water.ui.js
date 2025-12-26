import { getCurrentUserData } from "../services/user.service.js";
import { sparklineSVG } from "../services/usage.service.js";
import {
  getCommunityStatus,
  getVendors,
  submitReport,
  trySync,
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
 * Sub-component: Premium Vendor Card (Matching Home UI Style)
 */
const renderVendorCard = (v) => `
  <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/10 group hover:bg-white/20 transition-all cursor-pointer" data-vendor-id="${v.id}">
    <div>
      <h5 class="font-bold text-sm text-white">${v.name}</h5>
      <p class="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">${v.route} • ⭐ 4.8</p>
    </div>
    <div class="text-right">
      <span class="text-lg font-black text-white">Ksh ${v.price}</span>
      <p class="text-[8px] uppercase font-bold text-indigo-200">per 20L</p>
    </div>
  </div>`;

/**
 * Main Render Function
 */
export const renderWater = async () => {
  const content = document.getElementById("content");

  // Fetch Data
  const [userData, status, vendors, pattern] = await Promise.all([
    getCurrentUserData(),
    getCommunityStatus(),
    getVendors(),
    getSupplyPatternSeries(14),
  ]);

  const statusClasses = getStatusStyles(status.status);

  // Mock Alerts for the new section
  const waterAlerts = [
    { type: "ON", msg: "Water ON in your area", time: "Just now" },
    { type: "OFF", msg: "Water OFF reported by many users", time: "2h ago" },
  ];

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
          Report Status
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- MAIN COLUMN: Status & Map -->
        <div class="lg:col-span-8 space-y-6">
          <div class="relative overflow-hidden rounded-[2.5rem] border-2 ${statusClasses} p-8 shadow-sm transition-colors duration-500">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-current opacity-5 rounded-full"></div>
            
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                </span>
                <p class="text-xs font-black uppercase tracking-[0.2em] opacity-70">Live Area Pulse</p>
              </div>
              
              <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h3 class="text-6xl font-black tracking-tighter">${
                    status.status
                  }</h3>
                  <p class="text-lg font-medium mt-2 opacity-80">${
                    status.count
                  } neighbors verified this status</p>
                </div>
                <div class="bg-white/30 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/40">
                    <span class="text-[10px] font-bold uppercase block opacity-60 italic text-right">Last Report</span>
                    <span class="text-sm font-bold tracking-tight">Just now</span>
                </div>
              </div>
              
              <!-- Map Section -->
              <div class="mt-10 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-white/60 p-3 shadow-inner">
                <div class="w-full h-72 bg-slate-200/40 rounded-[1.5rem] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
                  <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 opacity-20 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p class="text-xs font-black tracking-widest uppercase text-slate-500 relative z-10">Area Hotspots Map</p>
                  <div class="absolute top-1/4 left-1/3 w-4 h-4 bg-emerald-500 rounded-full blur-[2px] animate-pulse"></div>
                  <div class="absolute bottom-1/3 right-1/4 w-4 h-4 bg-indigo-500 rounded-full blur-[2px] animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SIDEBAR: Alerts & Vendors -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- 1. SIMPLE WATER ALERTS (New Section) -->
          <div class="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Supply Alerts</h4>
            <div class="space-y-4">
              ${waterAlerts
                .map(
                  (alert) => `
                <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div class="mt-1 w-2 h-2 rounded-full ${
                    alert.type === "ON" ? "bg-emerald-500" : "bg-rose-500"
                  }"></div>
                  <div class="flex-1">
                    <p class="text-sm font-bold text-slate-800 leading-tight">${
                      alert.msg
                    }</p>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">${
                      alert.time
                    }</span>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- 2. LOCAL VENDORS (Home Highlight Style) -->
          <div class="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden flex flex-col h-[500px]">
             <div class="absolute top-0 right-0 p-4 opacity-10">
                <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
             </div>
             
             <div class="relative z-10 mb-6">
               <h3 class="font-black text-xl tracking-tight italic">Nearby Vendors</h3>
               <p class="text-xs text-indigo-200 font-medium">Top verified delivery partners</p>
             </div>

             <div id="vendors-list" class="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                ${vendors.map((v) => renderVendorCard(v)).join("")}
             </div>

             <div class="pt-6 mt-auto">
               <p class="text-[10px] text-center text-indigo-300 font-bold uppercase tracking-widest">Showing ${
                 vendors.length
               } vendors in your route</p>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALS (Keeping original logic) -->
    <div id="report-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md hidden items-center justify-center z-50 p-4 transition-all">
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-scale-in">
        <div class="flex justify-between items-start mb-6 text-slate-900">
            <div>
                <h3 class="text-3xl font-black tracking-tight">Report Status</h3>
                <p class="text-slate-500 text-sm font-medium">Your data helps the whole neighborhood.</p>
            </div>
            <button id="report-close-x" class="text-slate-400">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <form id="report-form" class="space-y-6">
          <div class="grid grid-cols-2 gap-3">
              <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm" data-value="ON">Water ON</button>
              <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm" data-value="OFF">Water OFF</button>
              <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm" data-value="LOW">Low Pressure</button>
              <button type="button" class="report-opt-btn p-3 rounded-2xl border-2 border-slate-100 font-bold text-sm" data-value="DIRTY">Dirty Water</button>
          </div>
          <input type="hidden" id="report-type" value="ON">
          <textarea id="report-notes" placeholder="Notes (optional)" class="w-full bg-slate-50 rounded-2xl p-4 text-sm outline-none" rows="3"></textarea>
          <div class="flex gap-4">
            <button type="button" id="report-cancel" class="flex-1 py-4 font-bold text-slate-400">Cancel</button>
            <button type="submit" class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100">Post Report</button>
          </div>
        </form>
      </div>
    </div>

    <div id="vendor-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md hidden items-center justify-center z-50 p-4 transition-all">
      <div class="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-scale-in" id="vendor-modal-content"></div>
    </div>
  `;

  setupEventListeners(vendors);
  trySync();
};

/**
 * Event Logic (Unchanged from original structure)
 */
const setupEventListeners = (vendors) => {
  const reportModal = document.getElementById("report-modal");
  const vendorModal = document.getElementById("vendor-modal");
  const reportTypeInput = document.getElementById("report-type");

  document.getElementById("fab-report").onclick = () =>
    reportModal.classList.replace("hidden", "flex");

  [
    document.getElementById("report-cancel"),
    document.getElementById("report-close-x"),
  ].forEach((btn) => {
    btn.onclick = () => reportModal.classList.replace("flex", "hidden");
  });

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

  document.getElementById("report-form").onsubmit = async (e) => {
    e.preventDefault();
    const res = await submitReport({
      type: reportTypeInput.value,
      notes: document.getElementById("report-notes").value.trim(),
    });

    if (res && res.success) {
      showToast("Community updated!", "success");
      reportModal.classList.replace("flex", "hidden");
      renderWater();
    } else {
      // if failed to sync, notify user and keep modal open or close based on preference
      showToast(
        res?.message || "Report saved locally (will sync when online)",
        "warning"
      );
      reportModal.classList.replace("flex", "hidden");
      renderWater();
    }
  };

  // Vendor Details
  document.querySelectorAll("[data-vendor-id]").forEach((btn) => {
    btn.onclick = () => {
      const v = vendors.find(
        (x) => x.id === btn.getAttribute("data-vendor-id")
      );
      if (!v) return;
      document.getElementById("vendor-modal-content").innerHTML = `
        <div class="text-center text-slate-900">
            <h3 class="text-3xl font-black">${v.name}</h3>
            <p class="text-slate-400 font-bold uppercase text-xs mt-2">${v.route}</p>
            <div class="grid grid-cols-2 gap-4 mt-8 text-left">
                <div class="p-4 bg-slate-50 rounded-2xl"><p class="text-[10px] font-black text-slate-400 uppercase">Price</p><p class="font-bold">Ksh ${v.price}</p></div>
                <div class="p-4 bg-slate-50 rounded-2xl"><p class="text-[10px] font-black text-slate-400 uppercase">Status</p><p class="font-bold text-emerald-500">Active</p></div>
            </div>
            <a href="tel:${v.contact}" class="block w-full mt-8 py-5 bg-emerald-500 text-white rounded-[1.5rem] font-bold shadow-xl">Call Vendor</a>
            <button id="vendor-close" class="mt-6 text-sm font-bold text-slate-400">Dismiss</button>
        </div>
      `;
      vendorModal.classList.replace("hidden", "flex");
      document.getElementById("vendor-close").onclick = () =>
        vendorModal.classList.replace("flex", "hidden");
    };
  });
};
