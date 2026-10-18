const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Exercise the actual chart functions without adding a public test API or DOM dependency.
const elements = new Map();
const document = {
    getElementById(id) {
        if (!elements.has(id)) elements.set(id, { value: '', getContext: () => ({}) });
        return elements.get(id);
    },
    querySelectorAll: () => [],
};
const source = fs.readFileSync(path.join(__dirname, '../pole-shift-star-chart.js'), 'utf8');
assert.ok(source.includes('return { init: initialize };'));
const api = vm.runInNewContext(source.replace('return { init: initialize };', `return {
    shiftSurfaceVector, vectorFromLatLon, vectorFromRaDec, dot, rotateSeason,
    makeShiftedSkyBasis, projectVector, projectedRadius, getViewState,
    closestNorthStar, greenwichSiderealDegrees, controls, drawScene,
    parseConstellationFigures, constellationArc, constellationLines, parseRA, parseDEC,
    getObservationDate, setObservationDate, setSeasonDate, formatUTCDate,
    shiftedSolarDate, formatSolarTime, labelNodes, syncTimeSliderFromInput
};`) + '\nPSSC;', { document, window: { addEventListener() {} }, Date, Math });
const rad = degrees => degrees * Math.PI / 180;
const deg = radians => radians * 180 / Math.PI;
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`);
const vectorNear = (actual, expected) => ['x', 'y', 'z'].forEach(key => near(actual[key], expected[key]));

function state(poleLat, poleLon, habitatLat, habitatLon) {
    for (const [key, value] of Object.entries({ lat: poleLat, lon: poleLon, habitatLat, habitatLon,
        observeDate: '2026-10-18', observeTime: '22:00', projection: 'equidistant', visibleMode: 'visible' })) {
        api.controls[key].value = String(value);
    }
    return api.getViewState();
}

test('every selected surface pole maps to north, and its antipode maps to south', () => {
    for (const lat of [-90, -89.999999, -45, -0.91, 0, 15, 89.999999, 90]) {
        for (const lon of [-180, -106, 0, 3.42, 90, 180]) {
            const pole = api.vectorFromLatLon(lat, lon);
            vectorNear(api.shiftSurfaceVector(pole, lat, lon), { x: 0, y: 0, z: 1 });
            vectorNear(api.shiftSurfaceVector({ x: -pole.x, y: -pole.y, z: -pole.z }, lat, lon), { x: 0, y: 0, z: -1 });
        }
    }
});

test('modern pole preserves habitat coordinates for every pole longitude', () => {
    for (const poleLon of [-180, 0, 90, 180]) {
        const s = state(90, poleLon, 40, -100);
        near(s.shiftedLatitude, 40);
        near(s.shiftedLongitude, -100);
        vectorNear(s.viewPole, s.habitatVector);
    }
});

test('surface rotation preserves lengths, pairwise distances, and handedness', () => {
    for (let i = 0; i < 500; i++) {
        const lat = -90 + (i * 13.7 % 180), lon = -180 + (i * 47.9 % 360);
        const a = api.vectorFromLatLon(-80 + (i * 7.3 % 160), i * 29.1 % 360);
        const b = api.vectorFromLatLon(-80 + (i * 11.9 % 160), i * 31.7 % 360);
        const shiftedA = api.shiftSurfaceVector(a, lat, lon), shiftedB = api.shiftSurfaceVector(b, lat, lon);
        near(api.dot(shiftedA, shiftedA), 1);
        near(api.dot(shiftedA, shiftedB), api.dot(a, b));
        const x = api.shiftSurfaceVector({ x: 1, y: 0, z: 0 }, lat, lon);
        const y = api.shiftSurfaceVector({ x: 0, y: 1, z: 0 }, lat, lon);
        const z = api.shiftSurfaceVector({ x: 0, y: 0, z: 1 }, lat, lon);
        near((x.y * y.z - x.z * y.y) * z.x + (x.z * y.x - x.x * y.z) * z.y + (x.x * y.y - x.y * y.x) * z.z, 1);
    }
});

test('shifted latitude agrees with independent great-circle formula', () => {
    for (let i = 0; i < 300; i++) {
        const pLat = -89 + (i * 13.1 % 178), pLon = -180 + (i * 43.7 % 360);
        const hLat = -89 + (i * 17.3 % 178), hLon = -180 + (i * 31.1 % 360);
        const s = state(pLat, pLon, hLat, hLon);
        const sine = Math.sin(rad(pLat)) * Math.sin(rad(hLat)) + Math.cos(rad(pLat)) * Math.cos(rad(hLat)) * Math.cos(rad(hLon - pLon));
        near(s.shiftedLatitude, deg(Math.asin(sine)));
    }
});

test('Davidson moves the old north pole to 15 N, 90 W; equatorial quarter-turn works', () => {
    let s = state(15, 90, 90, 0);
    near(s.shiftedLatitude, 15);
    near(s.shiftedLongitude, -90);
    s = state(0, 0, 0, 90);
    near(s.shiftedLatitude, 0);
    near(s.shiftedLongitude, 90);
    s = state(0, 0, 90, 0);
    near(s.shiftedLatitude, 0);
    near(Math.abs(s.shiftedLongitude), 180);
});

test('Polaris stays the guide for all HTML presets, independent of date or habitat', () => {
    const html = fs.readFileSync(path.join(__dirname, '../pole-shift-star-chart.html'), 'utf8');
    const presets = [...html.matchAll(/class="pssc-preset-button"[^>]*data-lat="([^"]+)" data-lon="([^"]+)"/g)];
    assert.ok(presets.length >= 3);
    for (const [, lat, lon] of presets) {
        for (const [hLat, hLon] of [[40, -100], [-30, 140], [Number(lat), Number(lon)]]) {
            state(Number(lat), Number(lon), hLat, hLon);
            for (const date of ['2000-01-01', '2026-10-18', '2050-06-21']) {
                api.controls.observeDate.value = date;
                const s = api.getViewState();
                vectorNear(s.northPole, { x: 0, y: 0, z: 1 });
                assert.equal(api.closestNorthStar(s).id, 'polaris');
                near(deg(api.closestNorthStar(s).angle), 90 - api.closestNorthStar(s).dec);
            }
        }
    }
});

test('sidereal time and sky altitudes match independent hour-angle astronomy', () => {
    // Reference: https://aa.usno.navy.mil/faq/alt_az (east-positive longitude).
    for (let i = 0; i < 300; i++) {
        const s = state(-80 + (i * 19.3 % 160), -180 + (i * 43.1 % 360), -80 + (i * 23.9 % 160), -180 + (i * 29.7 % 360));
        const ra = i * 37.7 % 360, dec = -85 + (i * 31.1 % 170);
        const star = api.rotateSeason(api.vectorFromRaDec(ra, dec), s.skyRotationDeg, s.northPole);
        const expectedAltitudeSine = Math.sin(rad(s.shiftedLatitude)) * Math.sin(rad(dec))
            + Math.cos(rad(s.shiftedLatitude)) * Math.cos(rad(dec)) * Math.cos(rad(s.siderealDeg - ra));
        near(api.dot(star, s.viewPole), expectedAltitudeSine);
        const basis = api.makeShiftedSkyBasis(s.viewPole, s.northPole);
        near(api.dot(star, basis.east), -Math.cos(rad(dec)) * Math.sin(rad(s.siderealDeg - ra)));
        near(api.dot(star, basis.north), Math.cos(rad(s.shiftedLatitude)) * Math.sin(rad(dec))
            - Math.sin(rad(s.shiftedLatitude)) * Math.cos(rad(dec)) * Math.cos(rad(s.siderealDeg - ra)));
    }
    near(api.greenwichSiderealDegrees(new Date('2000-01-01T12:00:00Z')), 280.46061837);
    const s = state(90, 0, 40, -100);
    const zenith = api.rotateSeason(api.vectorFromRaDec(s.siderealDeg, 40), s.skyRotationDeg, s.northPole);
    vectorNear(zenith, s.viewPole);
    const later = new Date(s.observationDate.getTime() + 3600000);
    near((api.greenwichSiderealDegrees(later) - api.greenwichSiderealDegrees(s.observationDate) + 360) % 360, 15.04106864, 1e-6);
});

test('projection distances and bearings match all supported projection definitions', () => {
    state(90, 0, 0, 0);
    const up = { x: 0, y: 0, z: 1 }, basis = api.makeShiftedSkyBasis(up, up);
    for (const projection of ['equidistant', 'orthographic', 'stereographic']) {
        for (const angle of [0, 15, 30, 60, 90]) {
            const theta = rad(angle);
            const vector = { x: 0, y: Math.sin(theta), z: Math.cos(theta) };
            const point = api.projectVector(vector, up, basis, { x: 0, y: 0 }, 100, projection);
            assert.ok(point);
            const expected = 100 * (projection === 'orthographic' ? Math.sin(theta) : projection === 'stereographic' ? Math.tan(theta / 2) : angle / 90);
            near(Math.hypot(point.x, point.y), expected);
            near(point.x, expected);
        }
    }
    assert.equal(api.projectVector({ x: 0, y: 0, z: -1 }, up, basis, { x: 0, y: 0 }, 100), null);
    api.controls.visibleMode.value = 'full';
    near(Math.hypot(...['x', 'y'].map(key => api.projectVector({ x: 0, y: 0, z: -1 }, up, basis, { x: 0, y: 0 }, 100)[key])), 100);
});

test('exact shifted poles have finite, orthonormal chart bases', () => {
    for (const [hLat, hLon] of [[15, 90], [-15, -90]]) {
        const s = state(15, 90, hLat, hLon);
        const basis = api.makeShiftedSkyBasis(s.viewPole, s.northPole);
        near(api.dot(basis.east, basis.north), 0);
        near(api.dot(basis.east, basis.east), 1);
        near(api.dot(basis.north, basis.north), 1);
        near(api.dot(basis.north, s.viewPole), 0);
        near(s.shiftedLongitude, 0);
    }
});

test('offline bundle preserves every source catalogue row, constellation segment, and texture byte', () => {
    const root = path.join(__dirname, '..');
    const context = vm.createContext({});
    vm.runInContext(fs.readFileSync(path.join(root, 'pole-shift-star-chart-assets.js'), 'utf8'), context);
    const assets = context.PSSC_ASSETS;
    const originalStars = JSON.parse(fs.readFileSync(path.join(root, 'files/BSC.json'), 'utf8'));
    assert.equal(JSON.stringify(assets.stars), JSON.stringify(originalStars.map((star, index) => [star['harvard_ref_#'] || index, star.RA, star.DEC, star.MAG])));
    const lines = fs.readFileSync(path.join(root, 'files/constellation.figures.txt'), 'utf8').split(/\r?\n/).filter(line => line.startsWith('conline '));
    assert.equal(assets.constellationFigures, lines.join('\n'));
    const figures = api.parseConstellationFigures(assets.constellationFigures);
    assert.equal(figures.length, 87); // The source has no Mensa conline records.
    assert.equal(figures.reduce((sum, figure) => sum + figure.segments.length, 0), 758);
    const texture = Buffer.from(assets.earthImage.split(',')[1], 'base64');
    assert.deepEqual(texture, fs.readFileSync(path.join(root, 'images/spherical-projection-map.jpeg')));
});

test('constellation arcs retain the visible part of a horizon crossing', () => {
    const up = { x: 0, y: 0, z: 1 };
    const a = api.vectorFromRaDec(10, 30), b = api.vectorFromRaDec(20, -30);
    const arc = api.constellationArc(a, b, up, false);
    assert.ok(arc.length > 2);
    vectorNear(arc[0], a);
    near(arc.at(-1).z, 0);
    for (let i = 0; i < arc.length; i++) {
        assert.ok(arc[i].z >= -1e-12);
        near(api.dot(arc[i], arc[i]), 1);
        if (i) assert.ok(deg(Math.acos(Math.min(1, api.dot(arc[i - 1], arc[i])))) <= 2.000001);
    }
    const reversed = api.constellationArc(b, a, up, false);
    near(reversed[0].z, 0);
    vectorNear(reversed.at(-1), a);
    assert.equal(api.constellationArc(b, api.vectorFromRaDec(60, -60), up, false).length, 0);
    vectorNear(api.constellationArc(a, b, up, true).at(-1), b);
});

test('both Dipper bowls are closed and reference existing stars', () => {
    const big = api.constellationLines.find(figure => figure.name === 'Big Dipper');
    assert.ok(big.paths.some(path => path.join(',') === 'megrez,dubhe'));
    const little = api.constellationLines.find(figure => figure.name === 'Little Dipper').paths[0];
    assert.equal(little.slice(2).join(','), 'epsilon-umi,zeta-umi,eta-umi,pherkad,kochab,epsilon-umi');
});

test('date inputs, initialization, slider labels, and season presets consistently use UTC', () => {
    state(90, 0, 40, -100);
    api.controls.observeDate.value = '2026-03-08'; // US daylight-saving transition.
    api.controls.observeTime.value = '02:30';
    assert.equal(api.getObservationDate().toISOString(), '2026-03-08T02:30:00.000Z');
    api.setObservationDate(new Date('2026-01-01T00:15:00Z'));
    assert.equal(api.controls.observeDate.value, '2026-01-01');
    assert.equal(api.controls.observeTime.value, '00:15');
    assert.equal(api.controls.timeSlider.value, '15');
    assert.equal(api.controls.timeSliderLabel.textContent, '00:15 UTC');
    api.setSeasonDate('winter');
    assert.equal(api.getObservationDate().toISOString(), '2026-01-15T22:00:00.000Z');
    assert.equal(api.formatUTCDate(api.getObservationDate()), '2026-01-15 22:00 UTC');
});

test('mean solar clock uses shifted longitude and rolls dates in both directions', () => {
    const midnight = new Date('2026-01-01T00:00:00Z');
    assert.equal(api.shiftedSolarDate(midnight, -100).toISOString(), '2025-12-31T17:20:00.000Z');
    assert.equal(api.shiftedSolarDate(midnight, 90).toISOString(), '2026-01-01T06:00:00.000Z');
    assert.equal(api.shiftedSolarDate(new Date('2026-12-31T23:30:00Z'), 15).toISOString(), '2027-01-01T00:30:00.000Z');
    assert.equal(api.shiftedSolarDate(midnight, 180).toISOString(), '2026-01-01T12:00:00.000Z');
    assert.equal(api.shiftedSolarDate(midnight, -180).toISOString(), '2025-12-31T12:00:00.000Z');
    assert.equal(api.shiftedSolarDate(midnight, 0).getTime(), midnight.getTime());
    near(api.shiftedSolarDate(midnight, 12.345).getTime() - midnight.getTime(), 12.345 * 240000, 1);
});

test('changing pole or habitat changes solar time without changing the UTC instant', () => {
    let s = state(90, 0, 40, -100);
    api.controls.observeDate.value = '2026-01-01';
    api.controls.observeTime.value = '00:00';
    s = api.getViewState();
    assert.equal(api.formatSolarTime(s), '2025-12-31 17:20:00 (UTC-06:40:00)');
    const instant = s.observationDate.getTime();
    api.controls.lat.value = '15';
    api.controls.lon.value = '90';
    const davidson = api.getViewState();
    assert.equal(davidson.observationDate.getTime(), instant);
    assert.notEqual(api.formatSolarTime(davidson), api.formatSolarTime(s));
    near(api.shiftedSolarDate(davidson.observationDate, davidson.shiftedLongitude).getTime() - instant, davidson.shiftedLongitude * 240000, 1);
    api.controls.habitatLat.value = '15';
    api.controls.habitatLon.value = '90';
    const pole = api.getViewState();
    assert.equal(pole.observationDate.getTime(), instant);
    assert.equal(api.formatSolarTime(pole), 'Undefined at the geographic pole');
});
