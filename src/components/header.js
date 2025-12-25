import { navigate } from "../app/router.js";
import { getCurrentUserData } from "../services/user.service.js";
import { getAuthUser } from "../services/auth.store.js";

export const renderHeader = async () => {
  const headerContainer = document.getElementById("header");
  const authUser = getAuthUser();
  const userDataRes = await getCurrentUserData();

  const user = userDataRes?.success && userDataRes.data ? userDataRes.data : authUser;

  const displayName = user?.displayName || "User";
  const initials = getInitials(displayName || user?.email);
  const hasNotifications = true; // v1 mock (later real)

  headerContainer.innerHTML = `
    <header class="fixed top-0 left-0 w-full h-16 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-5 z-50">

      <!-- Brand -->
      <div class="flex items-center gap-3 cursor-pointer" id="brand-logo">
        <div class="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
          <div class="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <h1 class="text-xl font-black tracking-tight text-black">
          Flux
        </h1>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-4">

        <!-- Search (desktop only) -->
        <button
          id="search-btn"
          class="hidden md:block text-gray-400 hover:text-black transition"
          aria-label="Search"
        >
          🔍
        </button>

        <!-- Notifications -->
        <button
          id="notif-btn"
          class="relative p-2 rounded-xl hover:bg-gray-100 active:scale-90 transition"
        >
          🔔
          ${
            hasNotifications
              ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full animate-pulse"></span>`
              : ""
          }
        </button>

        <!-- Profile -->
        <button
          id="profile-btn"
          class="flex items-center gap-2 p-1 pr-3 bg-gray-50 hover:bg-black rounded-full border border-gray-100 transition active:scale-95"
        >
          <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs font-bold">
            ${initials}
          </div>
          <span class="hidden sm:block text-sm font-semibold text-gray-700 group-hover:text-white">
            ${displayName}
          </span>
        </button>

      </div>
    </header>
  `;

  attachHeaderEvents();
};

const attachHeaderEvents = () => {
  document.getElementById("brand-logo").onclick = () => navigate("/home");

  document.getElementById("notif-btn").onclick = (e) => {
    const dot = e.currentTarget.querySelector("span");
    if (dot) dot.remove();
    alert("No critical alerts right now.");
  };

  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.onclick = () => {
      console.log("Search coming in v2");
    };
  }

  document.getElementById("profile-btn").onclick = () => navigate("/profile");
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
