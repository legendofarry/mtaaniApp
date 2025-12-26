import { getCurrentUserData } from "../services/user.service.js";
import { handleLogout } from "../controller/homeController.js";
import {
  mockDailyUsage,
  summaryFromSeries,
  estimateRemaining,
  predictNextTopup,
  sparklineSVG,
} from "../services/usage.service.js";
import { showToast } from "../components/toast.js";

export const renderElectricity = async () => {
  const content = document.getElementById("content");

  // Data Fetching
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

  // Mock Data for Outage Logic
  const outageReportsCount = 12; // Example: many users reporting
  const threshold = 5;
  const isOutageAlertActive = outageReportsCount >= threshold;

  const series = mockDailyUsage(21);
  const summary = summaryFromSeries(series);
  const est = estimateRemaining({
    lastTopupUnits: 120,
    dailyUsage: summary.avg,
  });
  const nextTopup = predictNextTopup(summary.avg);
  const spark = sparklineSVG(series, 400, 80);

  content.innerHTML = `
    <div class="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in pb-20">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Electricity
            <span class="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
          </h2>
          <p class="text-slate-500 font-medium italic">Meter: ${
            user?.meterNumber || "4401-2290-11"
          }</p>
        </div>
      </div>

      <!-- COMMUNITY OUTAGE ALERT (Triggered by many reports) -->
      ${
        isOutageAlertActive
          ? `
        <div class="bg-rose-500 text-white rounded-[2rem] p-6 flex items-center gap-6 shadow-xl shadow-rose-200 animate-bounce-subtle">
          <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 class="text-xl font-black leading-tight">Potential Outage Detected</h4>
            <p class="text-rose-100 text-sm font-medium opacity-90">${outageReportsCount} neighbors reported power loss in your area recently.</p>
          </div>
        </div>
      `
          : ""
      }

      <!-- Hero Card -->
      <div class="relative overflow-hidden bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full"></div>
        
        <div class="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
          <div class="space-y-6">
            <div>
              <span class="text-amber-400 text-xs font-black uppercase tracking-[0.2em]">Balance Summary</span>
              <div class="flex items-baseline gap-2 mt-2">
                <h3 class="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-amber-200">120.4</h3>
                <span class="text-2xl font-bold text-amber-500/80 tracking-tight">kWh</span>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10">
                <p class="text-[10px] uppercase font-bold text-amber-400/60">Duration</p>
                <p class="text-lg font-bold">~ ${est}</p>
              </div>
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10">
                <p class="text-[10px] uppercase font-bold text-amber-400/60">Next Topup</p>
                <p class="text-lg font-bold text-amber-200">${nextTopup}</p>
              </div>
            </div>
          </div>

          <!-- POWER OUTAGE REPORTING BUTTON -->
          <div class="flex flex-col justify-end gap-3 md:w-72">
            <button id="report-power-btn" class="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center justify-center gap-3">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report Power Off/On
            </button>
            <p class="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest px-4">
              Community Verified Status
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <!-- Purchase Logs -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col">
            <h3 class="text-xl font-black text-slate-900 mb-6 italic">Purchase Logs</h3>
            <div class="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              ${renderTokenRow("05 Dec 2025", "50.0", "Ksh 1,200", "Success")}
              ${renderTokenRow("28 Nov 2025", "100.0", "Ksh 2,400", "Success")}
              ${renderTokenRow("20 Nov 2025", "75.0", "Ksh 1,800", "Success")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Handler for Reporting
  document.getElementById("report-power-btn").onclick = () => {
    // In a real app, this would open a modal or trigger a service
    showToast("Power status reported to community.", "success");
  };
};

function renderTokenRow(date, units, price, status) {
  return `
    <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border-2 border-transparent hover:border-amber-100 transition-all group">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-all">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-black text-slate-800">${units} kWh</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${date}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-black text-slate-800">${price}</p>
        <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">${status}</p>
      </div>
    </div>
  `;
}
