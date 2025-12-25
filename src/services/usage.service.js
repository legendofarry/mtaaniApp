// src/services/usage.service.js
// Provides mock usage data and simple predictions for v1

export const mockDailyUsage = (days = 14) => {
  const arr = [];
  for (let i = 0; i < days; i++) {
    // simulate between 4 and 12 units/day with some noise
    const val = Math.round(4 + Math.random() * 8 + (i % 7 === 5 ? 2 : 0));
    arr.push(val);
  }
  return arr;
};

export const estimateRemaining = ({ lastTopupUnits = 120, dailyUsage = 8 }) => {
  const daysLeft = lastTopupUnits / dailyUsage;
  const hoursLeft = Math.round((daysLeft % 1) * 24);
  const days = Math.floor(daysLeft);
  return `${days} day${days !== 1 ? "s" : ""} ${hoursLeft} hours`;
};

export const predictNextTopup = (dailyUsage) => {
  // naive: next topup in (avgConsumptionPeriod) days
  const avgDays = Math.max(1, Math.round(120 / Math.max(1, dailyUsage)));
  const now = new Date();
  const next = new Date(now.getTime() + avgDays * 24 * 60 * 60 * 1000);
  return next.toLocaleDateString(undefined, { weekday: "long" });
};

export const summaryFromSeries = (series) => {
  const total = series.reduce((s, v) => s + v, 0);
  const avg = Math.round(total / series.length);
  const peak = Math.max(...series);
  const peakDayIndex = series.indexOf(peak);
  return { total, avg, peak, peakDayIndex };
};

export const sparklineSVG = (values = [], w = 220, h = 48) => {
  if (!values || values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1 || 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polyline fill="none" stroke="#4f46e5" stroke-width="2" points="${points}" />
  </svg>`;
};
