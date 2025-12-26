// src/services/resourceReports.service.js
import { addDocument, getCollection } from "./firestore.service.js";
import { serverTimestamp, Timestamp } from "firebase/firestore";

const MS_MIN = 60 * 1000;
const MS_HOUR = 60 * MS_MIN;
const MS_20_MIN = 20 * MS_MIN;
const MS_24_HOURS = 24 * MS_HOUR;

const COLLECTION_NAME = (resource) =>
  resource === "electricity" ? "electricityReports" : "waterReports";

// Haversine formula to compute distance (km)
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if two locations match based on detailed location fields
 * Priority: area > estate > zone > court
 */
const isMatchingLocation = (loc1, loc2, radiusKm = 5) => {
  // If both have area and they match, that's a strong match
  if (loc1.area && loc2.area && loc1.area === loc2.area) {
    // Further refine by estate if available
    if (loc1.estate && loc2.estate) {
      return loc1.estate === loc2.estate;
    }
    // Or by zone
    if (loc1.zone && loc2.zone) {
      return loc1.zone === loc2.zone;
    }
    // Area match is good enough
    return true;
  }

  // If areas don't match or aren't available, fall back to geo distance
  if (loc1.latitude && loc1.longitude && loc2.latitude && loc2.longitude) {
    const dist = haversineKm(
      parseFloat(loc1.latitude),
      parseFloat(loc1.longitude),
      parseFloat(loc2.latitude),
      parseFloat(loc2.longitude)
    );
    return dist <= radiusKm;
  }

  // If we can't determine, be conservative and don't match
  return false;
};

export const createReport = async ({
  resource = "water", // "water" or "electricity"
  status,
  userId,
  reporterName = null,
  location = null, // expected object with latitude/longitude and other fields
  meta = {},
}) => {
  if (!status) return { success: false, message: "status required" };
  const col = COLLECTION_NAME(resource);

  // use location param; prefer fully-specified location
  if (!location) return { success: false, message: "location required" };

  // enforce duplicate rule: no same user + same status within 20 minutes
  try {
    const now = Date.now();
    const all = await getCollection(col);
    const recentSame = all.find((r) => {
      return (
        r.userId === userId &&
        r.status === status &&
        new Date(r.createdAt).getTime() + MS_20_MIN > now
      );
    });
    if (recentSame) {
      return {
        success: false,
        message: "Duplicate report: you already reported this status recently",
      };
    }

    const payload = {
      userId,
      reporterName: reporterName || null,
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        county: location.county || null,
        area: location.area || null,
        estate: location.estate || null,
        zone: location.zone || null,
        court: location.court || null,
        plot: location.plot || null,
      },
      status,
      meta,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + MS_24_HOURS)),
      resource,
    };

    const docRef = await addDocument(col, payload);

    // also add a generic notifications doc (so UI that reads notifications can surface it)
    try {
      await addDocument("notifications", {
        title: `${resource} report: ${status}`,
        message: payload.reporterName
          ? `${payload.reporterName} reported ${status}`
          : `Report: ${status}`,
        reporterUid: userId,
        reporterName: payload.reporterName || null,
        targetCounty: location?.county || null,
        targetArea: location?.area || null,
        resource,
        reportRef: `${col}/${docRef.id}`,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      // non-fatal
      console.warn("failed to create notification doc", e);
    }

    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("createReport error", e);
    return { success: false, message: e.message || String(e) };
  }
};

export const fetchRecentReports = async ({ resource = "water" } = {}) => {
  const col = COLLECTION_NAME(resource);
  const all = await getCollection(col);
  const now = Date.now();
  // only return non-expired
  return all.filter((r) => new Date(r.expiresAt).getTime() > now);
};

export const fetchNearbyReports = async ({
  resource = "water",
  userLocation = null,
  radiusKm = 5,
} = {}) => {
  const recent = await fetchRecentReports({ resource });
  if (!userLocation) return [];

  const list = recent
    .filter((r) => {
      if (!r.location) return false;
      return isMatchingLocation(userLocation, r.location, radiusKm);
    })
    .map((r) => {
      // Calculate distance if both have geo coordinates
      let distanceKm = null;
      if (
        userLocation.latitude &&
        userLocation.longitude &&
        r.location.latitude &&
        r.location.longitude
      ) {
        distanceKm = haversineKm(
          parseFloat(userLocation.latitude),
          parseFloat(userLocation.longitude),
          parseFloat(r.location.latitude),
          parseFloat(r.location.longitude)
        );
      }
      return { ...r, distanceKm };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return list;
};

export const aggregateStatus = async ({
  resource = "water",
  userLocation = null,
  radiusKm = 5,
} = {}) => {
  const list = await fetchNearbyReports({ resource, userLocation, radiusKm });
  const counts = {};
  list.forEach((r) => (counts[r.status] = (counts[r.status] || 0) + 1));

  let finalized = null;
  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return {
      counts,
      finalized: null,
      total: 0,
      neighborsWithSameStatus: 0,
      allReports: [],
    };
  }

  // AUTO STATUS CHANGE: If any status has 5+ reports, prioritize it
  const highVolumeStatus = entries.find(([status, count]) => count >= 5);
  if (highVolumeStatus) {
    finalized = highVolumeStatus[0];
  } else {
    // find max count
    const max = Math.max(...entries.map(([, c]) => c));
    const tied = entries.filter(([, c]) => c === max).map(([s]) => s);

    if (tied.length === 1) {
      finalized = tied[0];
    } else {
      // tie-breaker: pick status with most recent report among tied statuses
      const latestByStatus = {};
      for (const t of tied) {
        const item = list.find((r) => r.status === t);
        if (item) latestByStatus[t] = new Date(item.createdAt).getTime();
      }
      const sorted = Object.entries(latestByStatus).sort((a, b) => b[1] - a[1]);
      finalized = sorted[0][0];
    }
  }

  // Count neighbors who reported the SAME status as finalized
  const neighborsWithSameStatus = list.filter(
    (r) => r.status === finalized
  ).length;

  return {
    counts,
    finalized,
    total: list.length,
    neighborsWithSameStatus,
    allReports: list,
  };
};

export default {
  createReport,
  fetchNearbyReports,
  aggregateStatus,
  fetchRecentReports,
};
