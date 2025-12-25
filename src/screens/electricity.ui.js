import { getCurrentUserData } from "../services/user.service.js";
import { handleLogout } from "../controller/homeController.js";
import {
  mockDailyUsage,
  summaryFromSeries,
  estimateRemaining,
  predictNextTopup,
  sparklineSVG,
} from "../services/usage.service.js";

export const renderElectricity = async () => {
  const content = document.getElementById("content");
  const userData = await getCurrentUserData();
  const user = userData.success ? userData.data : null;

  const series = mockDailyUsage(21);
  const summary = summaryFromSeries(series);
  const est = estimateRemaining({
    lastTopupUnits: 120,
    dailyUsage: summary.avg,
  });
  const nextTopup = predictNextTopup(summary.avg);
  const spark = sparklineSVG(series, 360, 72);

  content.innerHTML = `
    <div class="flex flex-col h-full p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Electricity Dashboard</h2>

      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500">Estimated Units Left</p>
            <h3 class="text-3xl font-bold text-yellow-600">120 units</h3>
            <p class="text-sm text-gray-400 mt-1">Approx. ${est}</p>
          </div>
          <div class="w-48">${spark}</div>
        </div>
        <p class="text-xs text-gray-400 mt-3">Next top-up (estimate): ${nextTopup}</p>
      </div>

      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <p class="text-gray-500 mb-2">Token History</p>
        <ul class="text-gray-700 text-sm">
          <li>05 Dec 2025 — 50 units</li>
          <li>28 Nov 2025 — 100 units</li>
          <li>20 Nov 2025 — 75 units</li>
        </ul>
      </div>

      <div class="mt-auto">
        <button id="logout-btn" class="py-2 px-4 bg-red-600 text-white rounded">Logout</button>
      </div>
    </div>
  `;

  document.getElementById("logout-btn").onclick = handleLogout;
};
