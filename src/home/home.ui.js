import {
  mockDailyUsage,
  estimateRemaining,
  predictNextTopup,
  summaryFromSeries,
  sparklineSVG,
} from "../services/usage.service.js";

export const renderHome = async () => {
  const content = document.getElementById("content");

  const series = mockDailyUsage(14);
  const summary = summaryFromSeries(series);
  const est = estimateRemaining({
    lastTopupUnits: 120,
    dailyUsage: summary.avg,
  });
  const nextTopup = predictNextTopup(summary.avg);
  const spark = sparklineSVG(series, 320, 56);

  content.innerHTML = `
    <div class="p-4">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Home</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl shadow p-4">
          <p class="text-sm text-gray-500">Estimated electricity left</p>
          <h3 class="text-3xl font-bold text-blue-600 mt-1">${est}</h3>
          <p class="text-xs text-gray-400 mt-1">Based on average ${summary.avg} units/day</p>
          <div class="mt-3">${spark}</div>
        </div>

        <div class="bg-white rounded-xl shadow p-4">
          <p class="text-sm text-gray-500">Next top-up (estimate)</p>
          <h3 class="text-xl font-semibold mt-1">${nextTopup}</h3>
          <p class="text-sm text-gray-400 mt-2">Peak usage: ${summary.peak} units</p>
          <p class="text-sm text-gray-400 mt-1">14-day avg: ${summary.avg} units/day</p>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="bg-white rounded-xl shadow p-3">
          <p class="text-xs text-gray-500">Daily Consumption (avg)</p>
          <p class="text-lg font-semibold">${summary.avg} units</p>
        </div>
        <div class="bg-white rounded-xl shadow p-3">
          <p class="text-xs text-gray-500">Token history (mock)</p>
          <p class="text-lg font-semibold">5 purchases</p>
        </div>
        <div class="bg-white rounded-xl shadow p-3">
          <p class="text-xs text-gray-500">Budget</p>
          <p class="text-lg font-semibold">Ksh 1200 / month</p>
        </div>
      </div>
    </div>
  `;
};
