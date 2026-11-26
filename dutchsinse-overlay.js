(function(root) {
  'use strict';
  const defaults = { north: 90, south: -90, west: -180, east: 180, projection: 'equirectangular', opacity: 1 };
  const imageUrl = typeof document === 'undefined' ? '' : new URL('images/dutchsinse-arrows-map.png', document.currentScript.src).href;
  const limit = 85.0511287798066;
  function mercator(latitude) {
    const radians = Math.max(-limit, Math.min(limit, latitude)) * Math.PI / 180;
    return Math.log(Math.tan(Math.PI / 4 + radians / 2));
  }
  function latitudeAtPixel(y, worldSize) {
    return Math.atan(Math.sinh(Math.PI * (1 - 2 * y / worldSize))) * 180 / Math.PI;
  }
  function sourceY(latitude, height, settings) {
    const project = settings.projection === 'mercator' ? mercator : value => value;
    return (project(settings.north) - project(latitude)) /
      (project(settings.north) - project(settings.south)) * height;
  }
  function validate(settings) {
    const result = { ...defaults, ...settings };
    if (!['north', 'south', 'west', 'east', 'opacity'].every(key => Number.isFinite(result[key])) ||
        result.north > 90 || result.south < -90 || result.north <= result.south ||
        result.east <= result.west || result.east - result.west > 360 ||
        result.opacity < 0 || result.opacity > 1 || !['mercator', 'equirectangular'].includes(result.projection) ||
        (result.projection === 'mercator' && mercator(result.north) <= mercator(result.south))) {
      throw new Error('Use north > south within ±90°, east > west with a span of at most 360°, and opacity from 0 to 100%.');
    }
    return result;
  }
  function horizontalSegments(tileX, zoom, imageWidth, settings, tileSize = 256) {
    const span = 360 / 2 ** zoom;
    const left = tileX * span - 180;
    const right = left + span;
    const segments = [];
    const first = Math.floor((left - settings.east) / 360);
    const last = Math.ceil((right - settings.west) / 360);
    for (let copy = first; copy <= last; copy++) {
      const west = settings.west + copy * 360, east = settings.east + copy * 360;
      const start = Math.max(left, west), end = Math.min(right, east);
      if (end <= start) continue;
      segments.push({ sx: (start - west) / (east - west) * imageWidth,
        sw: (end - start) / (east - west) * imageWidth,
        dx: (start - left) / span * tileSize, dw: (end - start) / span * tileSize });
    }
    return segments;
  }
  function loadImage() {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Dutchsinse image could not load. Check that images/dutchsinse-arrows-map.png was copied with the page.'));
      image.src = imageUrl;
    });
  }
  function createLayer(L, image, settings) {
    const Raster = L.GridLayer.extend({
      createTile(coords) {
        const tile = document.createElement('canvas');
        const size = this.getTileSize().x;
        tile.width = tile.height = size;
        const ctx = tile.getContext('2d');
        const worldSize = size * 2 ** coords.z;
        const calibration = this.calibration;
        const segments = horizontalSegments(coords.x, coords.z, image.width, calibration, size);
        // Inverse-project each destination row into the original PNG. A plain
        // image overlay would stretch latitude linearly in Mercator screen space.
        for (let row = 0; row < size; row++) {
          const latitude = latitudeAtPixel(coords.y * size + row + 0.5, worldSize);
          if (latitude > calibration.north || latitude < calibration.south) continue;
          const top = Math.max(0, sourceY(latitudeAtPixel(coords.y * size + row, worldSize), image.height, calibration));
          const bottom = Math.min(image.height, sourceY(latitudeAtPixel(coords.y * size + row + 1, worldSize), image.height, calibration));
          if (bottom <= top) continue;
          segments.forEach(segment => ctx.drawImage(image, segment.sx, top, segment.sw, bottom - top,
            segment.dx, row, segment.dw, 1));
        }
        return tile;
      },
      setCalibration(next) {
        this.calibration = validate(next);
        this.setOpacity(this.calibration.opacity);
        return this.redraw();
      }
    });
    const layer = new Raster({ pane: 'dutchsinsePane', tileSize: 256, keepBuffer: 1, minZoom: 0, maxZoom: 19,
      attribution: 'Overlay artwork: Dutchsinse', opacity: settings.opacity });
    layer.calibration = validate(settings);
    return layer;
  }
  function createStyle(map, L) {
    map.createPane('dutchsinsePane');
    map.getPane('dutchsinsePane').classList.add('dutchsinse-raster-pane');
    map.getPane('dutchsinsePane').style.zIndex = 250;
    map.getPane('dutchsinsePane').style.pointerEvents = 'none';
    let layer = null, loading = null;
    return {
      getLayer: () => layer,
      load() {
        if (layer) return Promise.resolve(layer);
        if (!loading) loading = loadImage().then(image => {
          layer = createLayer(L, image, defaults);
          return layer;
        }).finally(() => { loading = null; });
        return loading;
      }
    };
  }
  const api = { defaults, validate, mercator, latitudeAtPixel, sourceY, horizontalSegments, loadImage, createLayer, createStyle };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DutchsinseOverlay = api;
})(typeof globalThis === 'object' ? globalThis : this);
