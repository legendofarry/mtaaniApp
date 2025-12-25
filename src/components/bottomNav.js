import { navigate } from "../app/router.js";
import { getCurrentRoute } from "../app/router.js";
import { getCurrentUserData } from "../services/user.service.js";
import { getCommunityStatus } from "../services/water.service.js";

export const renderBottomNav = async () => {
  const nav = document.getElementById("bottom-nav");
  const userRes = await getCurrentUserData();
  const metersCount =
    userRes?.success && userRes.data && userRes.data.meters
      ? userRes.data.meters.length
      : 0;
  const waterStatus = getCommunityStatus();

  nav.innerHTML = `
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[92%] max-w-3xl bg-white/90 backdrop-blur rounded-2xl shadow-lg px-3 py-2 flex items-center justify-between z-40">
      <button data-path="/home" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="rounded-md text-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" class="w-6 h-6">
<g>
	<path d="M256,319.841c-35.346,0-64,28.654-64,64v128h128v-128C320,348.495,291.346,319.841,256,319.841z"/>
	<g>
		<path d="M362.667,383.841v128H448c35.346,0,64-28.654,64-64V253.26c0.005-11.083-4.302-21.733-12.011-29.696l-181.29-195.99    c-31.988-34.61-85.976-36.735-120.586-4.747c-1.644,1.52-3.228,3.103-4.747,4.747L12.395,223.5    C4.453,231.496-0.003,242.31,0,253.58v194.261c0,35.346,28.654,64,64,64h85.333v-128c0.399-58.172,47.366-105.676,104.073-107.044    C312.01,275.383,362.22,323.696,362.667,383.841z"/>
		<path d="M256,319.841c-35.346,0-64,28.654-64,64v128h128v-128C320,348.495,291.346,319.841,256,319.841z"/>
	</g>
</g>
</svg>
</div>
        <span class="text-xs mt-1 font-semibold">Home</span>
      </button>

      <button data-path="/water" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="relative rounded-md text-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" class="w-6 h-6">
  <path d="m20.652,18.266s1.848,2.234,1.848,3.234c0,.64-.244,1.28-.732,1.768s-1.128.732-1.768.732c-.64,0-1.28-.244-1.768-.732s-.732-1.128-.732-1.768c0-1,1.848-3.234,1.848-3.234.362-.354.942-.354,1.304,0ZM15,2c.552,0,1-.447,1-1s-.448-1-1-1H5c-.552,0-1,.447-1,1s.448,1,1,1h4v3H1c-.552,0-1,.447-1,1v6c0,.553.448,1,1,1h10V2h4Zm0,3h-2v8h2c.551,0,1,.448,1,1,0,1.103.897,2,2,2h4c1.103,0,2-.897,2-2,0-4.963-4.038-9-9-9Z"/>
</svg>
        <span id="water-dot" class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"></span></div>
        <span class="text-xs mt-1 font-semibold">Water</span>
      </button>

      <button data-path="/electricity" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="rounded-md text-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" class="w-6 h-6"><path d="M11.24,24a2.262,2.262,0,0,1-.948-.212,2.18,2.18,0,0,1-1.2-2.622L10.653,16H6.975A3,3,0,0,1,4.1,12.131l3.024-10A2.983,2.983,0,0,1,10,0h3.693a2.6,2.6,0,0,1,2.433,3.511L14.443,8H17a3,3,0,0,1,2.483,4.684l-6.4,10.3A2.2,2.2,0,0,1,11.24,24Z"/></svg>
        </div>
        <span class="text-xs mt-1 font-semibold">Electricity</span>
      </button>

      <button data-path="/profile" class="nav-item flex-1 py-2 px-3 flex flex-col items-center justify-center text-gray-500 transition transform rounded-lg hover:bg-gray-50">
        <div class="rounded-md text-2xl">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" class="w-6 h-6">
<g>
	<circle cx="256" cy="128" r="128"/>
	<path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z"/>
</g>
</svg>
        </div>
        <span class="text-xs mt-1 font-semibold">Profile</span>
        ${
          metersCount
            ? `<span class="absolute mt-[-36px] ml-[28px] text-xs bg-indigo-600 text-white rounded-full px-2">${metersCount}</span>`
            : ""
        }
      </button>
    </div>
  `;

  // color water dot
  const waterDot = document.getElementById("water-dot");
  if (waterDot) {
    if (waterStatus.status === "OFF") {
      waterDot.classList.add("bg-red-500");
    } else if (waterStatus.status === "LOW PRESSURE") {
      waterDot.classList.add("bg-yellow-400");
    } else {
      waterDot.classList.add("bg-green-500");
    }
  }

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

// Highlight the active tab with smooth styles
export const setActiveTab = () => {
  const current = getCurrentRoute() || "/home";
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.remove("text-indigo-600", "scale-105", "font-semibold");
    if (btn.dataset.path === current) {
      btn.classList.add("text-indigo-600", "scale-105", "font-semibold");
    }
  });
};
