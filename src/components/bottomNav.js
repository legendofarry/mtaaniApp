import { navigate } from "../app/router.js";
import { setActiveTab } from "../utils/nav.js";

export const renderBottomNav = () => {
  const nav = document.getElementById("bottom-nav");

  nav.innerHTML = `
    <div class="bottom-nav">
      <button data-path="/home" class="nav-item">🏠<span>Home</span></button>
      <button data-path="/water" class="nav-item">💧<span>Water</span></button>
      <button data-path="/electricity" class="nav-item electricity">
        ⚡<span>Electricity</span>
      </button>
      <button data-path="/profile" class="nav-item">👤<span>Profile</span></button>
    </div>
  `;

  nav.querySelectorAll(".nav-item").forEach((btn) => {
    btn.onclick = () => navigate(btn.dataset.path);
  });

  setActiveTab();
};
