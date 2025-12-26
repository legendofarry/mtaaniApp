// src/services/water.service.js
// Lightweight client-side service for water reports, vendors and simple predictions

import { getFirestore, collection, getDocs } from "firebase/firestore"; // ← make sure collection is imported

const db = getFirestore();

const STORAGE_KEY = "water_reports_v1";

const nowIso = () => new Date().toISOString();

export const getSavedReports = async () => {
  try {
    const colRef = collection(db, "waterReports");
    const snapshot = await getDocs(colRef);
    const anga = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(anga);
    return anga;
  } catch (e) {
    console.warn("Failed reading reports from Firestore", e);
    return [];
  }
};

export const saveReports = (reports) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const submitReport = async (report) => {
  const reports = await getSavedReports();
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
    console.log("User location for report:", loc);
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
  const reports = await getSavedReports();
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

// Haversine formula to calculate distance in km
const getDistanceKm = (loc1, loc2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getCommunityStatus = async (radiusKm = 5) => {
  // Prefer server-side aggregated status
  try {
    const { aggregateStatus } = await import("./resourceReports.service.js");
    const { getCurrentUserData } = await import("./user.service.js");

    const userRes = await getCurrentUserData();
    const user = userRes.success ? userRes.data : null;
    if (!user || !user.location?.geo) throw new Error("No user location");

    const center = { lat: user.location.geo.lat, lng: user.location.geo.lng };

    const agg = await aggregateStatus({
      resource: "water",
      center,
      radiusKm,
    });

    if (agg && agg.finalized !== null) {
      return { status: agg.finalized, count: agg.total };
    }
  } catch (e) {
    console.warn("aggregateStatus not available", e.message || e);
  }

  // Fallback: local Firestore data
  const reports = await getSavedReports();

  // Filter recent reports (last 3 days) and within radius
  const now = Date.now();
  const userRes = await import("./user.service.js").then((m) =>
    m.getCurrentUserData()
  );
  const user = userRes.success ? userRes.data : null;
  const userLoc = user?.location?.geo;

  const nearbyRecent = reports.filter((r) => {
    // Convert Firestore timestamp to Date
    const createdAt = r.createdAt?.toDate
      ? r.createdAt.toDate()
      : new Date(r.createdAt);
    const ageHours = (now - createdAt.getTime()) / (1000 * 60 * 60);
    if (ageHours > 72) return false;

    if (!userLoc || !r.location?.latitude || !r.location?.longitude)
      return true;

    const dist = getDistanceKm(userLoc, {
      lat: Number(r.location.latitude),
      lng: Number(r.location.longitude),
    });

    return dist <= radiusKm;
  });

  const off = nearbyRecent.filter((r) => r.type === "OFF").length;
  const low = nearbyRecent.filter((r) => r.type === "LOW").length;

  if (off > 6) return { status: "OFF", count: off };
  if (low > 4) return { status: "LOW PRESSURE", count: low };
  return { status: "ON", count: nearbyRecent.length };
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

export const getSupplyPatternSeries = async (days = 14) => {
  const reports = await getSavedReports();
  const series = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);

    const count = reports.filter((r) => {
      // Convert Firestore Timestamp to Date if necessary
      const createdAt = r.createdAt?.toDate
        ? r.createdAt.toDate()
        : new Date(r.createdAt);
      return createdAt.toISOString().slice(0, 10) === key;
    }).length;

    series.push(count);
  }

  return series;
};
