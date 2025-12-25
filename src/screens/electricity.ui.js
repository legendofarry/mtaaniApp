import { getCurrentUserData } from "../services/user.service.js";
import { handleLogout } from "../controller/homeController.js";
import {
  mockDailyUsage,
  summaryFromSeries,
  estimateRemaining,
  predictNextTopup,
  sparklineSVG,
} from "../services/usage.service.js";

export const renderElectricity = async () => {
  const content = document.getElementById("content");

  // Data Fetching & Processing
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

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
      
      <!-- Top Navigation/Header -->
      <div class="flex items-center justify-between mb-2">
        <div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight">Electricity</h2>
          <p class="text-slate-500 font-medium italic">Account: ${
            user?.meterNumber || "Meter-4401-22"
          }</p>
        </div>
        <button id="logout-btn" class="p-3 text-slate-400 hover:text-rose-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <!-- Main Balance "Wallet" Card -->
      <div class="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
        <!-- Decorative background glow -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row justify-between gap-8">
          <div class="space-y-6">
            <div>
              <span class="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">Available Balance</span>
              <div class="flex items-baseline gap-2 mt-2">
                <h3 class="text-7xl font-black tracking-tighter">120.4</h3>
                <span class="text-2xl font-bold text-slate-400">kWh</span>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <p class="text-[10px] uppercase font-bold text-slate-400">Est. Duration</p>
                <p class="text-lg font-bold">${est}</p>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <p class="text-[10px] uppercase font-bold text-slate-400">Daily Avg</p>
                <p class="text-lg font-bold">${
                  summary.avg
                } <span class="text-xs">u/d</span></p>
              </div>
            </div>
          </div>

          <div class="flex flex-col justify-end gap-3 md:w-64">
            <button class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Top Up Meter
            </button>
            <p class="text-[11px] text-center text-slate-500 font-medium px-4">
              Predicted next top-up needed by <span class="text-indigo-400 font-bold">${nextTopup}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Usage Analytics -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-8">
              <div>
                <h3 class="text-xl font-black text-slate-900">Consumption Trend</h3>
                <p class="text-sm text-slate-500">Activity for the last 21 days</p>
              </div>
              <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
                <button class="px-3 py-1 bg-white shadow-sm rounded-lg text-xs font-bold text-slate-800">kWh</button>
                <button class="px-3 py-1 rounded-lg text-xs font-bold text-slate-500">Cost</button>
              </div>
            </div>

            <div class="w-full h-32 flex items-end justify-center group">
              ${spark}
            </div>

            <div class="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-50">
              <div class="text-center">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Use</p>
                <p class="text-xl font-black text-slate-800">${
                  summary.peak
                } <span class="text-xs font-normal">u</span></p>
              </div>
              <div class="text-center border-x border-slate-100 px-2">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                <p class="text-xl font-black text-emerald-500">+4.2%</p>
              </div>
              <div class="text-center">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Load</p>
                <p class="text-xl font-black text-slate-800">0.42 <span class="text-xs font-normal">kw</span></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Token History -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full flex flex-col">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-black text-slate-900 tracking-tight italic">Token History</h3>
              <button class="text-xs font-bold text-indigo-600 hover:underline tracking-tight">Export PDF</button>
            </div>
            
            <div class="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              ${renderTokenRow("05 Dec 2025", "50.0", "Ksh 1,200", "Success")}
              ${renderTokenRow("28 Nov 2025", "100.0", "Ksh 2,400", "Success")}
              ${renderTokenRow("20 Nov 2025", "75.0", "Ksh 1,800", "Success")}
              ${renderTokenRow("12 Nov 2025", "20.0", "Ksh 500", "Success")}
            </div>

            <button class="mt-8 w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm transition-all border border-slate-100">
              View All Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach Handlers
  document.getElementById("logout-btn").onclick = handleLogout;
};

/**
 * Sub-component for Transaction Rows
 */
function renderTokenRow(date, units, price, status) {
  return `
    <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all group">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-black text-slate-800">${units} units</p>
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
