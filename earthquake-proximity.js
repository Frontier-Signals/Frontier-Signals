/* Shared by the earthquake map and its distance regression tests. */
(function(root) {
  'use strict';
  const EARTH_RADIUS_KM = 6371;
  const RADIUS_KM = 50 * 1.609344;
  const radians = value => value * Math.PI / 180;
  function validCoordinates(coords) {
    return Array.isArray(coords) && Number.isFinite(coords[0]) &&
      Number.isFinite(coords[1]) && Math.abs(coords[1]) <= 90;
  }
  function distanceKm(a, b) {
    const h = Math.sin(radians(b[1] - a[1]) / 2) ** 2 +
      Math.cos(radians(a[1])) * Math.cos(radians(b[1])) *
      Math.sin(radians(b[0] - a[0]) / 2) ** 2;
    return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
  }
  function createIndex(features) {
    // Latitude ordering avoids a full distance calculation against every event.
    const events = features.filter(event => validCoordinates(event.geometry?.coordinates))
      .slice().sort((a, b) => a.geometry.coordinates[1] - b.geometry.coordinates[1]);
    return function nearby(coords) {
      let count = 0;
      let nearestKm = Infinity;
      if (!validCoordinates(coords)) return { count, nearestKm };
      const delta = RADIUS_KM / EARTH_RADIUS_KM * 180 / Math.PI;
      let low = 0;
      let high = events.length;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (events[mid].geometry.coordinates[1] < coords[1] - delta) low = mid + 1;
        else high = mid;
      }
      for (let i = low; i < events.length; i++) {
        const other = events[i].geometry.coordinates;
        if (other[1] > coords[1] + delta) break;
        const distance = distanceKm(coords, other);
        if (distance <= RADIUS_KM + 1e-9) {
          count++;
          nearestKm = Math.min(nearestKm, distance);
        }
      }
      return { count, nearestKm };
    };
  }
  const api = { RADIUS_KM, distanceKm, createIndex };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.EarthquakeProximity = api;
})(typeof globalThis === 'object' ? globalThis : this);
