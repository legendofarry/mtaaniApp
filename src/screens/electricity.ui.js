import { getCurrentUserData } from "../services/user.service.js";
import { handleLogout } from "../controller/homeController.js";

export const renderElectricity = async () => {
  const content = document.getElementById("content");
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

  content.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Electricity Dashboard</h2>

      <!-- Balance / Usage Card -->
      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <p class="text-gray-500">Estimated Units Left</p>
        <h3 class="text-3xl font-bold text-yellow-600">120 units</h3>
        <p class="text-sm text-gray-400 mt-1">Approx. 1 day 7 hours left</p>
      </div>

      <!-- Simple Usage Graph Placeholder -->
      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <p class="text-gray-500 mb-2">Daily Usage (kWh)</p>
        <div class="w-full h-32 bg-gray-100 rounded flex items-end justify-between px-1">
          <div class="bg-yellow-500 h-1/2 w-4 rounded"></div>
          <div class="bg-yellow-500 h-3/4 w-4 rounded"></div>
          <div class="bg-yellow-500 h-1/4 w-4 rounded"></div>
          <div class="bg-yellow-500 h-3/5 w-4 rounded"></div>
          <div class="bg-yellow-500 h-2/5 w-4 rounded"></div>
        </div>
      </div>

      <!-- Token History Placeholder -->
      <div class="bg-white rounded-xl shadow p-4 flex flex-col">
        <p class="text-gray-500 mb-2">Token History</p>
        <ul class="text-gray-700 text-sm">
          <li>05 Dec 2025 — 50 units</li>
          <li>28 Nov 2025 — 100 units</li>
          <li>20 Nov 2025 — 75 units</li>
        </ul>
      </div>
    </div>
  `;
};
