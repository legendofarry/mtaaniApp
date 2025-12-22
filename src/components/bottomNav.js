import { navigate } from "../app/router.js";
import { getCurrentRoute } from "../app/router.js";

export const renderBottomNav = () => {
  const nav = document.getElementById("bottom-nav");

  nav.innerHTML = `
    <div class="fixed bottom-0 left-0 w-full bg-white shadow-inner border-t border-gray-200 flex justify-around items-center h-16">
      <button data-path="/home" class="flex flex-col items-center justify-center nav-item text-gray-500">
        🏠
        <span class="text-xs mt-1">Home</span>
      </button>
      <button data-path="/water" class="flex flex-col items-center justify-center nav-item text-gray-500">
        💧
        <span class="text-xs mt-1">Water</span>
      </button>
      <button data-path="/electricity" class="flex flex-col items-center justify-center nav-item text-gray-500 electricity">
        ⚡
        <span class="text-xs mt-1">Electricity</span>
      </button>
      <button data-path="/profile" class="flex flex-col items-center justify-center nav-item text-gray-500">
        👤
        <span class="text-xs mt-1">Profile</span>
      </button>
    </div>
  `;

  // Attach click events
  nav.querySelectorAll(".nav-item").forEach((btn) => {
    btn.onclick = () => {
      navigate(btn.dataset.path);
      setActiveTab();
    };
  });

  // Set active tab on initial render
  setActiveTab();
};

// Highlight the active tab
export const setActiveTab = () => {
  const current = getCurrentRoute() || "/home";
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.remove("text-blue-600", "font-bold");
    if (btn.dataset.path === current) {
      btn.classList.add("text-blue-600", "font-bold");
      if (btn.classList.contains("electricity")) {
        btn.classList.add("text-yellow-500");
      }
    }
  });
};
