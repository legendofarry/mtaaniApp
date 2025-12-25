import { navigate } from "../app/router.js";
import { getCurrentRoute } from "../app/router.js";
import { getCurrentUserData } from "../services/user.service.js";
import { getCommunityStatus } from "../services/water.service.js";

export const renderBottomNav = async () => {
  const nav = document.getElementById("bottom-nav");
  const userRes = await getCurrentUserData();
  const metersCount = userRes?.success && userRes.data && userRes.data.meters ? userRes.data.meters.length : 0;
  const waterStatus = getCommunityStatus();

  nav.innerHTML = `
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-3xl bg-white/90 backdrop-blur rounded-2xl shadow-lg px-3 py-2 flex items-center justify-between z-40">
      <button data-path="/home" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="p-2 rounded-md text-2xl">🏠</div>
        <span class="text-xs mt-1">Home</span>
      </button>

      <button data-path="/water" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="relative p-2 rounded-md text-2xl">💧<span id="water-dot" class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"></span></div>
        <span class="text-xs mt-1">Water</span>
      </button>

      <button data-path="/electricity" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="p-2 rounded-md text-2xl">⚡</div>
        <span class="text-xs mt-1">Electricity</span>
      </button>

      <button data-path="/profile" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="p-2 rounded-md text-2xl">👤</div>
        <span class="text-xs mt-1">Profile</span>
        ${metersCount ? `<span class="absolute mt-[-36px] ml-[28px] text-xs bg-indigo-600 text-white rounded-full px-2">${metersCount}</span>` : ''}
      </button>
    </div>
  `;

  // color water dot
  const waterDot = document.getElementById('water-dot');
  if (waterDot) {
    if (waterStatus.status === 'OFF') {
      waterDot.classList.add('bg-red-500');
    } else if (waterStatus.status === 'LOW PRESSURE') {
      waterDot.classList.add('bg-yellow-400');
    } else {
      waterDot.classList.add('bg-green-500');
    }
  }

  // Attach click events
  nav.querySelectorAll('.nav-item').forEach((btn) => {
    btn.onclick = () => {
      navigate(btn.dataset.path);
      setActiveTab();
    };
  });

  // Set active tab on initial render
  setActiveTab();
};

// Highlight the active tab with smooth styles
export const setActiveTab = () => {
  const current = getCurrentRoute() || '/home';
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.remove('text-indigo-600', 'scale-105', 'font-semibold');
    if (btn.dataset.path === current) {
      btn.classList.add('text-indigo-600', 'scale-105', 'font-semibold');
    }
  });
};
