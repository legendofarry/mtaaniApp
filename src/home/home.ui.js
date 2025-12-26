import {
  mockDailyUsage,
  estimateRemaining,
  predictNextTopup,
  summaryFromSeries,
  sparklineSVG,
} from "../services/usage.service.js";
import { navigate } from "../app/router.js";

export const renderHome = async () => {
  const content = document.getElementById("content");

  // Mock Data for New Sections
  const unitsLeft = 84.5;
  const maxUnits = 120;
  const percentLeft = Math.round((unitsLeft / maxUnits) * 100);

  const series = mockDailyUsage(14);
  const summary = summaryFromSeries(series);
  const est = estimateRemaining({
    lastTopupUnits: maxUnits,
    dailyUsage: summary.avg,
  });

  // New Mock Data
  const waterStatus = {
    status: "ON",
    count: 18,
    lastUpdated: "12 mins ago",
    area: "Sector B",
  };
  const alerts = [
    {
      id: 1,
      type: "power",
      msg: "Scheduled maintenance in Sector C at 2PM",
      time: "1h ago",
    },
    {
      id: 2,
      type: "water",
      msg: "Water restored in Upper Hill area",
      time: "2h ago",
    },
    {
      id: 3,
      type: "vendor",
      msg: 'New Vendor "AquaPure" started deliveries nearby',
      time: "3h ago",
    },
  ];
  const premiumVendors = [
    { name: "H2O Express", price: "Ksh 20", distance: "0.8km", rating: "4.9" },
    {
      name: "QuickFill Water",
      price: "Ksh 18",
      distance: "1.2km",
      rating: "4.7",
    },
  ];

  content.innerHTML = `
    <div class="max-w-5xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-700 pb-24">
      
      <!-- Header Section -->
      <header class="flex justify-between items-center">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
        <div id="install-cta-container"></div>
      </header>

      <!-- 1. ELECTRICITY SUMMARY (Electricity Theme) -->
      <div class="relative overflow-hidden bg-slate-950 rounded-[2rem] p-6 md:p-8 text-white shadow-2xl shadow-amber-900/20">
        <!-- Amber Glow Decorative -->
        <div class="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <!-- Progress Circle (Amber) -->
          <div class="relative flex-shrink-0">
            <svg class="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="10" fill="transparent" class="text-slate-800" />
              <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="10" fill="transparent" 
                stroke-dasharray="364" 
                stroke-dashoffset="${364 - (364 * percentLeft) / 100}" 
                class="text-amber-500 stroke-round transition-all duration-1000 ease-out" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-2xl font-black text-white">${percentLeft}%</span>
            </div>
          </div>

          <div class="flex-1 text-center md:text-left space-y-1">
            <p class="text-amber-400 text-xs font-black uppercase tracking-widest">Electricity Remaining</p>
            <h3 class="text-5xl font-black tracking-tighter">${est}</h3>
            <p class="text-slate-400 text-sm font-medium">Approx. 4 days 12 hours left</p>
            
            <div class="flex gap-3 pt-4 justify-center md:justify-start">
              <button class="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-amber-500/20">
                Top Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. WATER STATUS SECTION -->
      <div class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
               <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.423 15.423a3.5 3.5 0 00-4.912 0l-3.511 3.511a3.5 3.5 0 004.912 4.912l3.511-3.511a3.5 3.5 0 000-4.912z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.75 3c0 4.142 3.358 7.5 7.5 7.5s7.5-3.358 7.5-7.5" /></svg>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Community Water Status</p>
              <h4 class="text-3xl font-black text-slate-900 flex items-center gap-2">
                Water is <span class="text-blue-600">${
                  waterStatus.status
                }</span>
              </h4>
              <p class="text-sm text-slate-500 font-medium mt-1">
                Based on <span class="text-slate-900 font-bold">${
                  waterStatus.count
                } reports</span> in ${waterStatus.area}
              </p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Last updated: ${
              waterStatus.lastUpdated
            }</span>
            <button onclick="navigate('/water')" class="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-95">
              Report Water Status
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 3. ALERTS FEED -->
        <div class="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col">
          <h4 class="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <span class="w-2 h-5 bg-rose-500 rounded-full"></span>
            Live Alerts Feed
          </h4>
          <div class="space-y-4">
            ${alerts
              .map(
                (alert) => `
              <div class="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                <div class="mt-1 w-2 h-2 rounded-full ${
                  alert.type === "power"
                    ? "bg-amber-500"
                    : alert.type === "water"
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                }"></div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-700 leading-snug">${
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

        <!-- 4. NEARBY VENDOR HIGHLIGHT (Monetization-ready) -->
        <div class="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
          </div>
          
          <h4 class="text-lg font-black mb-4">Nearby Vendors</h4>
          
          <div class="space-y-3">
            ${premiumVendors
              .map(
                (v) => `
              <div class="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white/10 group hover:bg-white/20 transition-all cursor-pointer">
                <div>
                  <h5 class="font-bold text-sm">${v.name}</h5>
                  <p class="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">${v.distance} away • ⭐ ${v.rating}</p>
                </div>
                <div class="text-right">
                  <span class="text-lg font-black">${v.price}</span>
                  <p class="text-[8px] uppercase font-bold text-indigo-200">per 20L</p>
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <button onclick="navigate('/water')" class="w-full mt-4 py-3 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
            View More Vendors
          </button>
        </div>
      </div>

    </div>
  `;

  // init install prompt CTA
  (await import("../components/installPrompt.js")).startInstallPrompt();
};
