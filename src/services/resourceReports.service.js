// src/services/resourceReports.service.js
import { addDocument, getCollection } from "./firestore.service.js";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import { geohashForLocation } from "geofire-common";

const MS_MIN = 60 * 1000;
const MS_HOUR = 60 * MS_MIN;
const MS_20_MIN = 20 * MS_MIN;
const MS_24_HOURS = 24 * MS_HOUR;

const COLLECTION_NAME = (resource) =>
  resource === "electricity" ? "electricityReports" : "waterReports";

// Normalize status to handle variations
const normalizeStatus = (status) => {
  if (!status) return "ON";
  const s = status.toString().toUpperCase().trim();

  // Normalize variations
  if (s === "LOW" || s === "LOW PRESSURE") return "LOW PRESSURE";
  if (s === "DIRTY" || s === "DIRTY WATER") return "DIRTY WATER";

  return s; // ON, OFF, or other
};

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
 * Check if two locations match based on areaId (geohash prefix)
 * Priority: areaId > area/estate > geo distance
 */
const isMatchingLocation = (loc1, loc2, radiusKm = 5) => {
  // PRIMARY: Match by areaId (geohash-based, ~5km areas)
  if (loc1.areaId && loc2.areaId && loc1.areaId === loc2.areaId) {
    return true;
  }

  // SECONDARY: Match by area/estate if available
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

  // FALLBACK: Calculate distance if both have coordinates
  if (loc1.lat && loc1.lng && loc2.lat && loc2.lng) {
    const dist = haversineKm(
      parseFloat(loc1.lat),
      parseFloat(loc1.lng),
      parseFloat(loc2.lat),
      parseFloat(loc2.lng)
    );
    return dist <= radiusKm;
  }

  // Also check latitude/longitude format (some reports use this)
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

  // Normalize status before processing
  const normalizedStatus = normalizeStatus(status);

  // enforce duplicate rule: no same user + same status within 20 minutes
  try {
    const now = Date.now();
    const all = await getCollection(col);
    const existing = all.find((r) => r.clientReportId === meta.clientReportId);
    if (existing) {
      return { success: true, id: existing.id };
    }

    // Calculate geohash and areaId from coordinates
    const lat = Number(location.latitude || location.lat);
    const lng = Number(location.longitude || location.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return { success: false, message: "Valid coordinates required" };
    }

    const geohash = geohashForLocation([lat, lng]);
    const areaId = geohash.substring(0, 4); // ≈ 5km precision
    console.log("handleSubmit called"); // log the number of times the function is called

    const payload = {
      userId,
      reporterName: reporterName || null,
      location: {
        latitude: lat,
        longitude: lng,
        county: location.county || null,
        area: location.area || null,
        estate: location.estate || null,
        zone: location.zone || null,
        court: location.court || null,
        plot: location.plot || null,
      },
      lat,
      lng,
      geohash,
      areaId,
      status: normalizedStatus, // Store normalized status
      resource,
      meta,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + MS_24_HOURS)),
    };

    const docRef = await addDocument(col, payload);

    // also add a generic notifications doc (so UI that reads notifications can surface it)
    try {
      await addDocument("notifications", {
        title: `${resource} report: ${normalizedStatus}`,
        message: payload.reporterName
          ? `${payload.reporterName} reported ${normalizedStatus}`
          : `Report: ${normalizedStatus}`,
        reporterUid: userId,
        reporterName: payload.reporterName || null,
        targetCounty: location?.county || null,
        targetArea: location?.area || null,
        areaId,
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
      if (!r.location && !r.lat && !r.lng) return false;

      // Create a location object for matching
      const reportLoc = {
        areaId: r.areaId,
        area: r.location?.area,
        estate: r.location?.estate,
        zone: r.location?.zone,
        lat: r.lat || r.location?.latitude,
        lng: r.lng || r.location?.longitude,
        latitude: r.lat || r.location?.latitude,
        longitude: r.lng || r.location?.longitude,
      };

      return isMatchingLocation(userLocation, reportLoc, radiusKm);
    })
    .map((r) => {
      // Calculate distance if both have geo coordinates
      let distanceKm = null;
      const userLat = userLocation.lat || userLocation.latitude;
      const userLng = userLocation.lng || userLocation.longitude;
      const reportLat = r.lat || r.location?.latitude;
      const reportLng = r.lng || r.location?.longitude;

      if (userLat && userLng && reportLat && reportLng) {
        distanceKm = haversineKm(
          parseFloat(userLat),
          parseFloat(userLng),
          parseFloat(reportLat),
          parseFloat(reportLng)
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

  // Count by normalized status
  list.forEach((r) => {
    const normalized = normalizeStatus(r.status);
    counts[normalized] = (counts[normalized] || 0) + 1;
  });

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
        const item = list.find((r) => normalizeStatus(r.status) === t);
        if (item) latestByStatus[t] = new Date(item.createdAt).getTime();
      }
      const sorted = Object.entries(latestByStatus).sort((a, b) => b[1] - a[1]);
      finalized = sorted[0][0];
    }
  }

  // Count neighbors who reported the SAME status as finalized
  const neighborsWithSameStatus = list.filter(
    (r) => normalizeStatus(r.status) === finalized
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
