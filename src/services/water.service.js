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

  try {
    const { createReport } = await import("./resourceReports.service.js");
    const { getCurrentUserData } = await import("./user.service.js");

    const userRes = await getCurrentUserData();
    console.log("Current user:", userRes);

    if (!userRes.success || !userRes.data?.uid) {
      console.warn("Cannot submit report: user not authenticated");
      return { success: false, message: "User not authenticated" };
    }

    const user = userRes.data;

    const loc = user.location?.geo;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
      console.warn("Cannot submit report: missing or invalid location");
      return { success: false, message: "Valid location required" };
    }

    const payload = {
      resource: "water",
      status: r.type,
      userId: user.uid,
      reporterName: user.name || user.displayName || null,
      location: {
        latitude: Number(loc.lat),
        longitude: Number(loc.lng),
        county: user.location.county || null,
      },
      meta: { notes: r.notes || null },
    };

    const res = await createReport(payload);

    if (res && res.success) {
      // mark this local report as synced
      const updated = getSavedReports().map((x) =>
        x === r ? { ...x, synced: true, remoteId: res.id } : x
      );
      saveReports(updated);
      return { success: true, synced: true, remoteId: res.id };
    }

    return {
      success: false,
      message: res?.message || "Failed to create report",
    };
  } catch (e) {
    console.warn("submitReport sync failed", e.message || e);
    trySync(); // fire-and-forget
    return { success: false, message: e.message || String(e) };
  }
};

export const trySync = async () => {
  const reports = getSavedReports();
  const unsynced = reports.filter((r) => !r.synced);
  if (!unsynced.length) return { ok: true, synced: 0 };

  try {
    const { createReport } = await import("./resourceReports.service.js");
    const { getCurrentUserData } = await import("./user.service.js");
    const userRes = await getCurrentUserData();

    if (!userRes.success || !userRes.data?.uid) {
      console.warn("Cannot sync reports: user not authenticated");
      return { ok: false, synced: 0 };
    }

    const user = userRes.data;
    const loc = user.location?.geo;
    if (!loc || typeof loc.lat !== "number" || typeof loc.lng !== "number") {
      console.warn("Cannot submit report: missing or invalid location");
      return { success: false, message: "Valid location required" };
    }

    let synced = 0;
    const now = nowIso();

    for (const r of unsynced) {
      try {
        const payload = {
          resource: "water",
          status: r.type,
          userId: user.uid,
          reporterName: user.name || user.displayName || null,
          location: {
            latitude: Number(user.location.latitude),
            longitude: Number(user.location.longitude),
            county: user.location.county || null,
          },
          meta: { notes: r.notes || null },
        };

        const res = await createReport(payload);
        if (res && res.success) {
          synced++;
          r.synced = true;
          r.remoteId = res.id;
          r.syncedAt = now;
        }
      } catch (e) {
        console.warn("sync report failed", e.message || e);
      }
    }

    saveReports(reports); // save updated synced flags
    return { ok: true, synced };
  } catch (e) {
    console.warn("trySync failed", e.message || e);
    return { ok: false, synced: 0 };
  }
};

export const getCommunityStatus = async () => {
  // Prefer server-side aggregated status when available
  try {
    const { aggregateStatus } = await import("./resourceReports.service.js");
    const { getCurrentUserData } = await import("./user.service.js");
    const userRes = await getCurrentUserData();
    const user = userRes.success ? userRes.data : null;
    const center = user?.location
      ? { lat: user.location.latitude, lng: user.location.longitude }
      : null;

    const agg = await aggregateStatus({
      resource: "water",
      center,
      radiusKm: 5,
    });
    if (agg && agg.finalized !== null) {
      return { status: agg.finalized, count: agg.total };
    }
  } catch (e) {
    console.warn("aggregateStatus not available", e.message || e);
  }

  // Fallback to local storage method
  const reports = getSavedReports();
  const recent = reports.filter((r) => {
    const age =
      (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
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
    {
      id: "VND-01",
      name: "Asha Vendors",
      route: "Kawangware Rd",
      price: 12,
      available: true,
      contact: "+254700111222",
      hours: "6am–8pm",
    },
    {
      id: "VND-02",
      name: "Tanker Express",
      route: "Market St",
      price: 9,
      available: false,
      contact: "+254700333444",
      hours: "24/7",
    },
    {
      id: "VND-03",
      name: "Mama Jerrys",
      route: "Court 5",
      price: 10,
      available: true,
      contact: "+254700555666",
      hours: "7am–6pm",
    },
  ];
};

export const predictNextSupply = () => {
  // naive prediction: pick a day based on recent reports frequency by weekday
  const reports = getSavedReports();
  if (!reports.length) return { day: "Thursday", time: "6:00 AM" };

  const freq = {};
  reports.forEach((r) => {
    const d = new Date(r.createdAt).toLocaleDateString(undefined, {
      weekday: "long",
    });
    freq[d] = (freq[d] || 0) + 1;
  });

  // choose weekday with highest reports (most active)
  const sorted = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);
  const day =
    sorted[0] || new Date().toLocaleDateString(undefined, { weekday: "long" });
  return { day, time: "6:00 AM" };
};

export const getSupplyPatternSeries = (days = 14) => {
  const reports = getSavedReports();
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = reports.filter(
      (r) => r.createdAt.slice(0, 10) === key
    ).length;
    series.push(count);
  }
  return series;
};
