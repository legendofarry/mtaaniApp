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

  // Sparkline with Electricity Theme (Amber stroke)
  const spark = sparklineSVG(series, 400, 80);

  content.innerHTML = `
    <div class="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in pb-20">
      
      <!-- Top Navigation/Header -->
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

      <!-- Hero "Energy Wallet" Card (Amber Theme) -->
      <div class="relative overflow-hidden bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
        <!-- Decorative Amber Glow -->
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full"></div>
        <div class="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-amber-600/5 blur-[60px] rounded-full"></div>
        
        <div class="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
          <div class="space-y-6">
            <div>
              <span class="text-amber-400 text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 00-1-1H7a1 1 0 00-1 1v1h5V3zM3 8a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>
                Units Remaining
              </span>
              <div class="flex items-baseline gap-2 mt-2">
                <h3 class="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-amber-200">120.4</h3>
                <span class="text-2xl font-bold text-amber-500/80 tracking-tight">kWh</span>
              </div>
            </div>
            
            <div class="flex gap-4">
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 group hover:bg-white/10 transition-colors">
                <p class="text-[10px] uppercase font-bold text-amber-400/60 tracking-widest">Duration</p>
                <p class="text-lg font-bold">~ ${est}</p>
              </div>
              <div class="bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/10 group hover:bg-white/10 transition-colors">
                <p class="text-[10px] uppercase font-bold text-amber-400/60 tracking-widest">Usage</p>
                <p class="text-lg font-bold">${
                  summary.avg
                } <span class="text-xs font-normal opacity-60">u/d</span></p>
              </div>
            </div>
          </div>

          <div class="flex flex-col justify-end gap-3 md:w-64">
            <button class="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-900/20 transition-all active:scale-95 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
              </svg>
              Buy Tokens
            </button>
            <p class="text-[11px] text-center text-slate-500 font-medium px-4">
              Forecast: Top-up needed by <span class="text-amber-500 font-bold underline underline-offset-4">${nextTopup}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Usage Analytics (White Card with Amber Accents) -->
        <div class="lg:col-span-7 space-y-6">
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            <div class="flex justify-between items-center mb-10">
              <div>
                <h3 class="text-xl font-black text-slate-900">Power Activity</h3>
                <p class="text-sm text-slate-500">21-day consumption pattern</p>
              </div>
              <div class="flex gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button class="px-4 py-1.5 bg-white shadow-sm rounded-xl text-xs font-black text-amber-600 border border-slate-100">kWh</button>
                <button class="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Cost</button>
              </div>
            </div>

            <!-- Sparkline Container with Amber Stroke Style -->
            <div class="w-full h-32 flex items-end justify-center stroke-amber-500 transition-all duration-1000">
              ${spark}
            </div>

            <div class="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-50">
              <div class="text-center group">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Peak</p>
                <p class="text-xl font-black text-slate-800">${
                  summary.peak
                }<span class="text-[10px] ml-1">kWh</span></p>
              </div>
              <div class="text-center border-x border-slate-100 px-2 group">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-emerald-500 transition-colors">Savings</p>
                <p class="text-xl font-black text-emerald-500">+4.2%</p>
              </div>
              <div class="text-center group">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-amber-500 transition-colors">Load</p>
                <p class="text-xl font-black text-slate-800">0.42<span class="text-[10px] ml-1">kW</span></p>
              </div>
            </div>
          </div>
        </div>

        <!-- Token History (Amber Interaction) -->
        <div class="lg:col-span-5">
          <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full flex flex-col">
            <div class="flex justify-between items-center mb-8">
              <h3 class="text-xl font-black text-slate-900 tracking-tight italic">Purchase Logs</h3>
              <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                 <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
              </div>
            </div>
            
            <div class="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              ${renderTokenRow("05 Dec 2025", "50.0", "Ksh 1,200", "Success")}
              ${renderTokenRow("28 Nov 2025", "100.0", "Ksh 2,400", "Success")}
              ${renderTokenRow("20 Nov 2025", "75.0", "Ksh 1,800", "Success")}
              ${renderTokenRow("12 Nov 2025", "20.0", "Ksh 500", "Success")}
            </div>

            <button class="mt-8 w-full py-4 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-500 rounded-2xl font-black text-sm transition-all border border-slate-100 hover:border-amber-100 active:scale-[0.98]">
              Full Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Modernized Token Row with Amber/Electric Icon
 */
function renderTokenRow(date, units, price, status) {
  return `
    <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border-2 border-transparent hover:border-amber-100 hover:bg-white transition-all group cursor-pointer">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:border-amber-100 shadow-sm transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-black text-slate-800">${units} <span class="text-xs font-normal text-slate-400">kWh</span></p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${date}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-black text-slate-800">${price}</p>
        <p class="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter flex items-center justify-end gap-1">
          <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
          ${status}
        </p>
      </div>
    </div>
  `;
}
