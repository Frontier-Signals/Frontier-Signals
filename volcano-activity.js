(function(root) {
  'use strict';
  const frameUrl = typeof document !== 'undefined'
    ? new URL('volcano-feed-frame.html', document.currentScript.src).href : '';
  function normalizeName(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/\bvolcano(?:es)?\b/g, '').replace(/[^a-z0-9]/g, '');
  }
  function normalizeRecord(record) {
    if (!record || record.lat == null || record.lng == null) return null;
    const lat = Number(record.lat), lng = Number(record.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
    const label = String(record.label || 'Unknown volcano');
    const match = label.match(/^(.+?)\s*\((.+)\)$/);
    const levelMatch = String(record.iconUrl || '').match(/_([0-4])\.png(?:\?|$)/);
    const level = levelMatch ? Number(levelMatch[1]) : null;
    const updated = Number(record.updatedSeconds) > 0 ? Number(record.updatedSeconds) * 1000 : null;
    return { ...record, lat, lng, name: (match ? match[1] : label).replace(/\s+volcano$/i, ''),
      region: match ? match[2] : '', level, active: level !== null && level >= 2, updated };
  }
  function load({ timeoutMs = 25000 } = {}) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      frame.hidden = true;
      frame.setAttribute('sandbox', 'allow-scripts');
      frame.setAttribute('aria-hidden', 'true');
      frame.src = frameUrl;
      const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', receive); frame.remove(); };
      const receive = event => {
        if (event.source !== frame.contentWindow || event.data?.type !== 'frontier-volcano-feed') return;
        const data = event.data;
        cleanup();
        if (data.error || !Array.isArray(data.records)) { reject(new Error('Volcano status feed unavailable')); return; }
        const reports = [...new Map(data.records.map(normalizeRecord).filter(Boolean)
          .map(report => [report.id || `${report.name}:${report.lat}:${report.lng}`, report])).values()];
        if (!reports.length) { reject(new Error('No valid volcano status records')); return; }
        resolve({ reports, retrievedAt: Date.now() });
      };
      const timer = setTimeout(() => { cleanup(); reject(new Error('Volcano status feed timed out')); }, timeoutMs);
      window.addEventListener('message', receive);
      document.body.appendChild(frame);
    });
  }
  function mergeFeatures(features, reports, distanceKm) {
    const entries = features.filter(feature => feature.geometry?.type === 'Point' &&
      Number.isFinite(feature.geometry.coordinates?.[0]) && Number.isFinite(feature.geometry.coordinates?.[1]))
      .map(feature => ({ feature, activity: null }));
    const named = new Map();
    entries.forEach(entry => {
      const key = normalizeName(entry.feature.properties?.V_Name);
      if (!named.has(key)) named.set(key, []);
      named.get(key).push(entry);
    });
    reports.forEach(report => {
      const coords = [report.lng, report.lat];
      const distance = entry => distanceKm(coords, entry.feature.geometry.coordinates);
      let candidates = (named.get(normalizeName(report.name)) || [])
        .filter(entry => !entry.activity && distance(entry) <= 50);
      if (!candidates.length) {
        // Geographic fallback only for a unique, very close static location.
        // Adjacent calderas/vents remain separate when the match is ambiguous.
        const close = entries.filter(entry => distance(entry) <= 5);
        if (close.length === 1 && !close[0].activity) candidates = close;
      }
      if (candidates.length === 1) candidates[0].activity = report;
      else entries.push({ activity: report, feature: { type: 'Feature',
        properties: { V_Name: report.name, Region: report.region },
        geometry: { type: 'Point', coordinates: coords } } });
    });
    return entries;
  }
  function markerState(active, nearby) { return active ? 'active' : nearby ? 'nearby' : 'other'; }
  function visible(mode, state) {
    return mode === 'all' || mode === 'active' && state === 'active' ||
      mode === 'nearby' && state === 'nearby' || mode === 'activeNearby' && state !== 'other';
  }
  const api = { load, normalizeName, normalizeRecord, mergeFeatures, markerState, visible };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VolcanoActivity = api;
})(typeof globalThis === 'object' ? globalThis : this);
