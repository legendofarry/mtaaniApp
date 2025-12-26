// src\utils\location.utils.js
import { geohashForLocation } from "geofire-common";

/**
 * Derive areaId from coordinates
 * @param {number} lat
 * @param {number} lng
 */
export const deriveAreaId = (lat, lng) => {
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  const geohash = geohashForLocation([lat, lng]);
  return geohash.substring(0, 4); // ~5km
};
