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
      <div id="install-cta-container"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="card rounded-xl p-4">
          <p class="text-sm text-muted">Estimated electricity left</p>
          <h3 class="text-3xl font-bold text-accent mt-1">${est}</h3>
          <p class="text-xs text-muted mt-1">Based on average ${summary.avg} units/day</p>
        </div>

        <div class="card rounded-xl p-4">
          <p class="text-sm text-muted">Next top-up (estimate)</p>
          <h3 class="text-xl font-semibold mt-1">${nextTopup}</h3>
          <p class="text-sm text-muted mt-2">Peak usage: ${summary.peak} units</p>
          <p class="text-sm text-muted mt-1">14-day avg: ${summary.avg} units/day</p>
        </div>
      </div>
    </div>
  `;
  // init install prompt CTA
  (await import("../components/installPrompt.js")).startInstallPrompt();
};
