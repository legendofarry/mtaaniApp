// src/services/water.service.js
// Lightweight client-side service for water reports, vendors and simple predictions

const STORAGE_KEY = "water_reports_v1";

const nowIso = () => new Date().toISOString();

export const getSavedReports = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed reading saved reports", e);
    return [];
  }
};

export const saveReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const submitReport = async (report) => {
  const reports = getSavedReports();
  const r = { ...report, createdAt: nowIso(), synced: false };
  reports.push(r);
  saveReports(reports);

  // fire-and-forget sync (simulated)
  trySync();
  return r;
};

export const trySync = async () => {
  const reports = getSavedReports();
  const unsynced = reports.filter((r) => !r.synced);
  if (!unsynced.length) return { ok: true, synced: 0 };

  // simulate network call
  await new Promise((res) => setTimeout(res, 600));

  // mark all as synced
  const now = nowIso();
  const updated = reports.map((r) => ({ ...r, synced: true, syncedAt: now }));
  saveReports(updated);
  return { ok: true, synced: unsynced.length };
};

export const getCommunityStatus = () => {
  const reports = getSavedReports();
  const recent = reports.filter((r) => {
    const age = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
    return age <= 72; // last 3 days
  });

  let off = recent.filter((r) => r.type === "OFF").length;
  let low = recent.filter((r) => r.type === "LOW").length;

  if (off > 6) return { status: "OFF", count: off };
  if (low > 4) return { status: "LOW PRESSURE", count: low };
  return { status: "ON", count: recent.length };
};

export const getVendors = () => {
  // sample static vendors; later replaced by backend
  return [
    { id: "VND-01", name: "Asha Vendors", route: "Kawangware Rd", price: 12, available: true, contact: "+254700111222", hours: "6am–8pm" },
    { id: "VND-02", name: "Tanker Express", route: "Market St", price: 9, available: false, contact: "+254700333444", hours: "24/7" },
    { id: "VND-03", name: "Mama Jerrys", route: "Court 5", price: 10, available: true, contact: "+254700555666", hours: "7am–6pm" },
  ];
};

export const predictNextSupply = () => {
  // naive prediction: pick a day based on recent reports frequency by weekday
  const reports = getSavedReports();
  if (!reports.length) return { day: "Thursday", time: "6:00 AM" };

  const freq = {};
  reports.forEach((r) => {
    const d = new Date(r.createdAt).toLocaleDateString(undefined, { weekday: "long" });
    freq[d] = (freq[d] || 0) + 1;
  });

  // choose weekday with highest reports (most active)
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  const day = sorted[0] || new Date().toLocaleDateString(undefined, { weekday: "long" });
  return { day, time: "6:00 AM" };
};

export const getSupplyPatternSeries = (days = 14) => {
  const reports = getSavedReports();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = reports.filter((r) => r.createdAt.slice(0, 10) === key).length;
    series.push(count);
  }
  return series;
};
