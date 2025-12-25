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
  const email = user?.email || "";

  headerContainer.innerHTML = `
    <header class="fixed top-0 left-0 w-full h-16 bg-white/60 backdrop-blur-md shadow-sm z-50 transition-colors">
      <div class="max-w-5xl mx-auto h-full px-4 flex items-center justify-evenly gap-6">

        <div id="brand-logo" class="flex items-center gap-3 cursor-pointer select-none">
          <div class="w-10 h-10 rounded-2xl brand-mark flex items-center justify-center shadow-xl">
            <span class="text-white font-extrabold">F</span>
          </div>
          <div>
            <div class="text-lg font-bold text-accent">Flux</div>
            <div class="text-xs text-muted">Energy & Water — Community</div>
        </div>

        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center bg-gray-100 rounded-xl px-3 py-1 gap-3 shadow-sm">
            <input id="header-search" placeholder="Search meters, vendors..." class="bg-transparent outline-none text-sm text-gray-700" />
            <button id="search-btn" class="text-indigo-600 text-sm">Search</button>
          </div>

          <button id="notif-btn" class="relative p-2 rounded-xl hover:bg-gray-50 transition-shadow shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span id="notif-dot" class="absolute -top-1 -right-1 w-2.5 h-2.5 notif-dot hidden"></span>
          </button>

          <div id="profile-btn" class="flex items-center gap-3 cursor-pointer group">
            <div class="w-10 h-10 rounded-full avatar-mark text-white flex items-center justify-center text-sm font-semibold shadow-xl">${initials}</div>
            <div class="hidden sm:flex flex-col text-left">
              <div class="text-sm font-semibold text-accent">${displayName}</div>
              <div class="text-xs text-muted">${email}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

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
      showToast("Search for: " + q, "info");
    };
  }

  document.getElementById("profile-btn").onclick = () => navigate("/profile");
};

const showNotifications = () => {
  showToast("No critical alerts right now.", "info");
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
