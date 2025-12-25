import {
  mockDailyUsage,
  estimateRemaining,
  predictNextTopup,
  summaryFromSeries,
  sparklineSVG,
} from "../services/usage.service.js";

export const renderHome = async () => {
  const content = document.getElementById("content");

  // Data Processing
  const series = mockDailyUsage(14);
  const summary = summaryFromSeries(series);
  const unitsLeft = 84.5; // Mocking current units for the UI
  const maxUnits = 120; // Reference for the progress bar
  const percentLeft = Math.round((unitsLeft / maxUnits) * 100);

  const est = estimateRemaining({
    lastTopupUnits: maxUnits,
    dailyUsage: summary.avg,
  });

  const nextTopup = predictNextTopup(summary.avg);
  const spark = sparklineSVG(series, 400, 60);

  content.innerHTML = `
    <div class="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      
      <!-- Header Section -->
      <header class="flex justify-between items-end">
        <div>
          <h2 class="text-4xl font-extrabold text-slate-900 tracking-tight">My Energy</h2>
        </div>
        <div id="install-cta-container"></div>
      </header>

      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Primary Balance Card (Hero) -->
        <div class="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <!-- Decorative Background Shape -->
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
          
          <!-- Progress Circle -->
          <div class="relative flex-shrink-0">
            <svg class="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-100" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" 
                stroke-dasharray="440" 
                stroke-dashoffset="${440 - (440 * percentLeft) / 100}" 
                class="text-indigo-600 stroke-round transition-all duration-1000 ease-out" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-slate-800">${percentLeft}%</span>
              <span class="text-[10px] uppercase text-slate-400 font-semibold tracking-widest">Remaining</span>
            </div>
          </div>

          <div class="flex-1 space-y-4 text-center md:text-left">
            <div>
              <p class="text-slate-500 font-medium">Estimated Units Left</p>
              <h3 class="text-6xl font-black text-slate-900 mt-1">${est} <span class="text-2xl font-normal text-slate-400">kWh</span></h3>
            </div>
            <div class="flex flex-wrap gap-3 justify-center md:justify-start">
              <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95">
                Top Up Now
              </button>
              <button class="bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all border border-slate-200">
                View History
              </button>
            </div>
          </div>
        </div>

        <!-- Prediction Stats Column -->
        <div class="space-y-6">
          <!-- Next Top Up Card -->
          <div class="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
            <p class="text-slate-400 text-sm font-medium">Predicted Depletion</p>
            <h4 class="text-2xl font-bold mt-2 text-indigo-300">${nextTopup}</h4>
            <div class="mt-6 flex items-center gap-2 text-sm text-slate-400">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Standard usage pattern detected
            </div>
          </div>

          <!-- Quick Insights Card -->
          <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
            <div class="flex justify-between items-center mb-4">
               <span class="text-slate-500 font-bold text-sm uppercase tracking-tight">Insights</span>
               <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg">LIVE</span>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-slate-500 text-sm">Daily Average</span>
                <span class="font-bold text-slate-800">${
                  summary.avg
                } units</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 text-sm">Peak Usage</span>
                <span class="font-bold text-slate-800">${
                  summary.peak
                } units</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Graph Card -->
      <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h3 class="text-xl font-bold text-slate-900">Usage Trend</h3>
            <p class="text-sm text-slate-500">Last 14 days consumption activity</p>
          </div>
          <select class="bg-slate-50 border-none text-sm font-semibold rounded-lg px-3 py-2 text-slate-600 focus:ring-2 focus:ring-indigo-500">
            <option>Last 14 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
        
        <div class="w-full overflow-hidden flex items-end justify-center h-24">
          ${spark}
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
           <div class="text-center">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Efficiency</p>
              <p class="text-lg font-bold text-slate-800">+12%</p>
           </div>
           <div class="text-center border-l border-slate-100">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Cost Est.</p>
              <p class="text-lg font-bold text-slate-800">$42.10</p>
           </div>
           <div class="text-center border-l border-slate-100">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Peak Time</p>
              <p class="text-lg font-bold text-slate-800">19:00</p>
           </div>
           <div class="text-center border-l border-slate-100">
              <p class="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Status</p>
              <p class="text-lg font-bold text-emerald-500">Optimal</p>
           </div>
        </div>
      </div>
    </div>
  `;

  // init install prompt CTA
  (await import("../components/installPrompt.js")).startInstallPrompt();
};
