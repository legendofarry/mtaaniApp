import { navigate } from "../app/router.js";
import { getCurrentUserData } from "../services/user.service.js";
import { getAuthUser } from "../services/auth.store.js";
import { showToast } from "../components/toast.js";

export const renderHeader = async () => {
  const headerContainer = document.getElementById("header");
  const authUser = getAuthUser();
  const userDataRes = await getCurrentUserData();

  const user =
    userDataRes?.success && userDataRes.data ? userDataRes.data : authUser;

  const displayName = user?.displayName || user?.name || "User";
  const initials = getInitials(displayName || user?.email || "U");

  headerContainer.innerHTML = `
    <header class="fixed top-0 left-0 w-full z-[100] transition-all duration-300 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        
        <!-- Brand Section -->
        <div id="brand-logo" class="flex items-center gap-3 cursor-pointer select-none group">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-2xl font-black text-slate-900 tracking-tighter leading-none">FLUX</h1>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Community Utility</span>
          </div>
        </div>

        <!-- Desktop Search Pill -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input id="header-search" type="text" 
              placeholder="Search meters or vendors..." 
              class="w-full bg-slate-100/50 border-2 border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400" />
            <div class="absolute inset-y-1 right-1 p-1">
               <button id="search-btn" class="px-3 h-full bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-xs font-black uppercase transition-colors">Search</button>
            </div>
          </div>
        </div>

        <!-- Action Group -->
        <div class="flex items-center gap-2 md:gap-4">
          
          <!-- Notifications -->
          <button id="notif-btn" class="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span id="notif-dot" class="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-bounce hidden"></span>
          </button>

        </div>
      </div>
    </header>
    <!-- Spacer to prevent content from going under the fixed header -->
    <div class="h-20"></div>
  `;

  // --- Logic ---
  document.getElementById("brand-logo").onclick = () => navigate("/home");

  const notifBtn = document.getElementById("notif-btn");
  notifBtn.onclick = (e) => {
    const dot = document.getElementById("notif-dot");
    if (dot) dot.classList.add("hidden");
    showNotifications();
  };

  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.onclick = () => {
      const q = document.getElementById("header-search").value.trim();
      if (!q) return;
      showToast(`Searching for "${q}"...`, "info");
    };
    // Add Enter key listener
    document.getElementById("header-search").onkeypress = (e) => {
      if (e.key === "Enter") searchBtn.click();
    };
  }
};

const showNotifications = () => {
  showToast("Your energy usage is optimal today!", "success");
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
