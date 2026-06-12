const PSSC = (() => {
    const canvas = document.getElementById('pssc-map-canvas');
    const earthCanvas = document.getElementById('pssc-earth-canvas');
    const ctx = canvas.getContext('2d');
    const earthCtx = earthCanvas.getContext('2d');
    const pi = Math.PI;
    const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
    const DEG = '\u00B0';

    const controls = {
        lat: document.getElementById('pssc-latitude'),
        lon: document.getElementById('pssc-longitude'),
        latInput: document.getElementById('pssc-lat-input'),
        lonInput: document.getElementById('pssc-lon-input'),
        habitatLat: document.getElementById('pssc-habitat-latitude'),
        habitatLon: document.getElementById('pssc-habitat-longitude'),
        habitatLatInput: document.getElementById('pssc-habitat-lat-input'),
        habitatLonInput: document.getElementById('pssc-habitat-lon-input'),
        habitatPreset: document.getElementById('pssc-habitat-preset'),
        observeDate: document.getElementById('pssc-observe-date'),
        observeTime: document.getElementById('pssc-observe-time'),
        timeSlider: document.getElementById('pssc-time-slider'),
        timeSliderLabel: document.getElementById('pssc-time-slider-label'),
        showConstellations: document.getElementById('pssc-show-constellations'),
        showConstellationLabels: document.getElementById('pssc-show-constellation-labels'),
        theme: document.getElementById('pssc-theme'),
        projection: document.getElementById('pssc-projection'),
        labelMode: document.getElementById('pssc-label-mode'),
        skyFilter: document.getElementById('pssc-sky-filter'),
        visibleMode: document.getElementById('pssc-visible-mode'),
        objectSearch: document.getElementById('pssc-object-search'),
        exportInset: document.getElementById('pssc-export-inset'),
        showRaGrid: document.getElementById('pssc-show-ra-grid'),
        showAltGrid: document.getElementById('pssc-show-alt-grid'),
        download: document.getElementById('pssc-download'),
        printChart: document.getElementById('pssc-print-chart'),
        presets: Array.from(document.querySelectorAll('.pssc-preset-button')),
        seasons: Array.from(document.querySelectorAll('.pssc-season-button')),
    };

    const labelNodes = {
        poleLabel: document.getElementById('pssc-pole-label'),
        axisTiltLabel: document.getElementById('pssc-axis-tilt-label'),
        northStarLabel: document.getElementById('pssc-north-star-label'),
        habitatLabel: document.getElementById('pssc-habitat-label'),
        currentOrientation: document.getElementById('pssc-current-orientation'),
        hemisphereLabel: document.getElementById('pssc-hemisphere-label'),
        projectionLabel: document.getElementById('pssc-projection-label'),
        lstLabel: document.getElementById('pssc-lst-label'),
        toolbarLst: document.getElementById('pssc-toolbar-lst'),
        moonAgeLabel: document.getElementById('pssc-moon-age-label'),
        sunLongitude: document.getElementById('pssc-sun-longitude'),
        moonLongitude: document.getElementById('pssc-moon-longitude'),
    };

    const themeSettings = {
        frontier: {
            background: '#040d20',
            grid: 'rgba(126, 222, 255, 0.22)',
            gridBold: 'rgba(255, 214, 126, 0.44)',
            star: '#ffffff',
            starGlow: 'rgba(158, 229, 255, 0.34)',
            faint: '#89e8ff',
            label: '#f2fdff',
            accent: '#ff9b5c',
            planetText: '#ffffff',
        },
        grayscale: {
            background: '#050505',
            grid: 'rgba(255, 255, 255, 0.2)',
            gridBold: 'rgba(255, 255, 255, 0.48)',
            star: '#ffffff',
            starGlow: 'rgba(255, 255, 255, 0.25)',
            faint: '#c8c8c8',
            label: '#ffffff',
            accent: '#eeeeee',
            planetText: '#ffffff',
        },
        bluegold: {
            background: '#051629',
            grid: 'rgba(184, 222, 255, 0.23)',
            gridBold: 'rgba(255, 215, 140, 0.5)',
            star: '#fff8d4',
            starGlow: 'rgba(255, 216, 126, 0.28)',
            faint: '#b7daff',
            label: '#fff8d8',
            accent: '#ffd27f',
            planetText: '#ffffff',
        },
        parchment: {
            background: '#f2dfb7',
            grid: 'rgba(61, 40, 16, 0.28)',
            gridBold: 'rgba(61, 40, 16, 0.58)',
            star: '#160e07',
            starGlow: 'rgba(58, 35, 12, 0.18)',
            faint: '#5a3b18',
            label: '#1d1308',
            accent: '#8e4617',
            planetText: '#30200d',
        },
        nightvision: {
            background: '#090404',
            grid: 'rgba(255, 82, 82, 0.22)',
            gridBold: 'rgba(255, 160, 122, 0.52)',
            star: '#ffd7d1',
            starGlow: 'rgba(255, 72, 72, 0.28)',
            faint: '#ff8f86',
            label: '#ffe6df',
            accent: '#ffb15f',
            planetText: '#ffe6df',
        },
        mariner: {
            background: '#071a1c',
            grid: 'rgba(126, 231, 210, 0.22)',
            gridBold: 'rgba(255, 225, 150, 0.48)',
            star: '#f7fff8',
            starGlow: 'rgba(123, 255, 217, 0.25)',
            faint: '#8eead7',
            label: '#effff9',
            accent: '#ffc36b',
            planetText: '#ffffff',
        },
        inkprint: {
            background: '#ffffff',
            grid: 'rgba(24, 33, 35, 0.24)',
            gridBold: 'rgba(24, 33, 35, 0.52)',
            star: '#111719',
            starGlow: 'rgba(17, 23, 25, 0.12)',
            faint: '#35515b',
            label: '#111719',
            accent: '#9a3f20',
            planetText: '#111719',
            moonShadow: '#111719',
        },
        observatory: {
            background: '#050813',
            grid: 'rgba(160, 178, 255, 0.2)',
            gridBold: 'rgba(114, 226, 255, 0.46)',
            star: '#f9fbff',
            starGlow: 'rgba(128, 160, 255, 0.3)',
            faint: '#9fb3ff',
            label: '#f2f6ff',
            accent: '#ff8f70',
            planetText: '#ffffff',
        },
        astrolabe: {
            background: '#17100b',
            grid: 'rgba(219, 170, 89, 0.26)',
            gridBold: 'rgba(255, 213, 134, 0.56)',
            star: '#fff7dc',
            starGlow: 'rgba(255, 200, 103, 0.27)',
            faint: '#e7ba71',
            label: '#fff0c8',
            accent: '#7ddfd6',
            planetText: '#fff7dc',
        },
    };

    const seasonAngles = {
        winter: 270,
        spring: 0,
        summer: 90,
        autumn: 180,
    };

    const seasonDatePresets = {
        winter: { month: 0, day: 15, hour: 22 },
        spring: { month: 3, day: 15, hour: 22 },
        summer: { month: 6, day: 15, hour: 22 },
        autumn: { month: 9, day: 15, hour: 22 },
    };

    const projectionLabels = {
        orthographic: 'Orthographic',
        equidistant: 'Navigation polar',
        stereographic: 'Stereographic',
    };

    const labelModeSettings = {
        essential: { starMag: 1.55, planets: true, constellations: true },
        standard: { starMag: 2.45, planets: true, constellations: true },
        dense: { starMag: 3.15, planets: true, constellations: true },
    };

    const zodiacCodes = new Set(['Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Sgr', 'Cap', 'Aqr', 'Psc']);
    const navigationConstellationCodes = new Set(['UMa', 'UMi', 'Dra', 'Cas', 'Ori', 'Cru', 'Cen', 'Cyg', 'Lyr', 'Aql', 'Boo', 'Car']);
    const navigationConstellationNames = new Set(['Big Dipper', 'Little Dipper', 'Ursa Major', 'Ursa Minor', 'Draco', 'Cassiopeia', 'Orion', 'Crux', 'Centaurus', 'Cygnus', 'Lyra', 'Aquila', 'Bootes', 'Carina', 'Summer Triangle']);

    const constellationNames = {
        And: 'Andromeda', Ant: 'Antlia', Aps: 'Apus', Aql: 'Aquila', Aqr: 'Aquarius', Ara: 'Ara', Ari: 'Aries',
        Aur: 'Auriga', Boo: 'Bootes', CMa: 'Canis Major', CMi: 'Canis Minor', CVn: 'Canes Venatici', Cae: 'Caelum',
        Cam: 'Camelopardalis', Cap: 'Capricornus', Car: 'Carina', Cas: 'Cassiopeia', Cen: 'Centaurus', Cep: 'Cepheus',
        Cet: 'Cetus', Cha: 'Chamaeleon', Cir: 'Circinus', Cnc: 'Cancer', Col: 'Columba', Com: 'Coma Berenices',
        CrA: 'Corona Australis', CrB: 'Corona Borealis', Crt: 'Crater', Cru: 'Crux', Crv: 'Corvus', Cyg: 'Cygnus',
        Del: 'Delphinus', Dor: 'Dorado', Dra: 'Draco', Equ: 'Equuleus', Eri: 'Eridanus', For: 'Fornax', Gem: 'Gemini',
        Gru: 'Grus', Her: 'Hercules', Hor: 'Horologium', Hya: 'Hydra', Hyi: 'Hydrus', Ind: 'Indus', LMi: 'Leo Minor',
        Lac: 'Lacerta', Leo: 'Leo', Lep: 'Lepus', Lib: 'Libra', Lup: 'Lupus', Lyn: 'Lynx', Lyr: 'Lyra', Men: 'Mensa',
        Mic: 'Microscopium', Mon: 'Monoceros', Mus: 'Musca', Nor: 'Norma', Oct: 'Octans', Oph: 'Ophiuchus',
        Ori: 'Orion', Pav: 'Pavo', Peg: 'Pegasus', Per: 'Perseus', Phe: 'Phoenix', Pic: 'Pictor', PsA: 'Piscis Austrinus',
        Psc: 'Pisces', Pup: 'Puppis', Pyx: 'Pyxis', Ret: 'Reticulum', Scl: 'Sculptor', Sco: 'Scorpius', Sct: 'Scutum',
        Ser: 'Serpens', Sex: 'Sextans', Sge: 'Sagitta', Sgr: 'Sagittarius', Tau: 'Taurus', Tel: 'Telescopium',
        TrA: 'Triangulum Australe', Tri: 'Triangulum', Tuc: 'Tucana', UMa: 'Ursa Major', UMi: 'Ursa Minor',
        Vel: 'Vela', Vir: 'Virgo', Vol: 'Volans', Vul: 'Vulpecula',
    };

    function constellationName(code) {
        return constellationNames[code] || code;
    }

    function constellationCodeFromName(name) {
        return Object.keys(constellationNames).find(code => constellationNames[code] === name) || name;
    }

    function constellationMatchesFilter(constellation, filter) {
        if (filter === 'zodiac') return constellation.kind === 'zodiac' || zodiacCodes.has(constellation.code);
        if (filter === 'navigation') {
            return navigationConstellationNames.has(constellation.name) || navigationConstellationCodes.has(constellation.code);
        }
        return true;
    }

    let selectedSeason = 'winter';
    let starCatalog = [];
    let starCatalogLoaded = false;
    let figureConstellations = [];
    let figureConstellationsLoaded = false;
    let earthImage = null;
    let earthTexture = null;
    let selectedObjectId = '';

    const navigationStars = [
        { id: 'polaris', name: 'Polaris', constellation: 'Ursa Minor', ra: 37.9546, dec: 89.2641, mag: 1.98 },
        { id: 'kochab', name: 'Kochab', constellation: 'Ursa Minor', ra: 222.6764, dec: 74.1555, mag: 2.08 },
        { id: 'pherkad', name: 'Pherkad', constellation: 'Ursa Minor', ra: 230.1823, dec: 71.8340, mag: 3.00 },
        { id: 'yildun', name: 'Yildun', constellation: 'Ursa Minor', ra: 263.0542, dec: 86.5865, mag: 4.35 },
        { id: 'epsilon-umi', name: 'Epsilon UMi', constellation: 'Ursa Minor', ra: 251.4923, dec: 82.0373, mag: 4.23 },
        { id: 'zeta-umi', name: 'Zeta UMi', constellation: 'Ursa Minor', ra: 236.0147, dec: 77.7945, mag: 4.29 },
        { id: 'eta-umi', name: 'Eta UMi', constellation: 'Ursa Minor', ra: 244.3771, dec: 75.7553, mag: 4.95 },
        { id: 'thuban', name: 'Thuban', constellation: 'Draco', ra: 211.0973, dec: 64.3758, mag: 3.65 },
        { id: 'vega', name: 'Vega', constellation: 'Lyra', ra: 279.2347, dec: 38.7837, mag: 0.03 },
        { id: 'deneb', name: 'Deneb', constellation: 'Cygnus', ra: 310.3579, dec: 45.2803, mag: 1.25 },
        { id: 'altair', name: 'Altair', constellation: 'Aquila', ra: 297.6958, dec: 8.8683, mag: 0.77 },
        { id: 'arcturus', name: 'Arcturus', constellation: 'Bootes', ra: 213.9153, dec: 19.1824, mag: -0.05 },
        { id: 'capella', name: 'Capella', constellation: 'Auriga', ra: 79.1723, dec: 45.9979, mag: 0.08 },
        { id: 'sirius', name: 'Sirius', constellation: 'Canis Major', ra: 101.2872, dec: -16.7161, mag: -1.46 },
        { id: 'canopus', name: 'Canopus', constellation: 'Carina', ra: 95.9879, dec: -52.6957, mag: -0.74 },
        { id: 'rigel', name: 'Rigel', constellation: 'Orion', ra: 78.6345, dec: -8.2016, mag: 0.13 },
        { id: 'betelgeuse', name: 'Betelgeuse', constellation: 'Orion', ra: 88.7929, dec: 7.4071, mag: 0.50 },
        { id: 'bellatrix', name: 'Bellatrix', constellation: 'Orion', ra: 81.2828, dec: 6.3497, mag: 1.64 },
        { id: 'alnilam', name: 'Alnilam', constellation: 'Orion', ra: 84.0534, dec: -1.2019, mag: 1.69 },
        { id: 'mintaka', name: 'Mintaka', constellation: 'Orion', ra: 83.0017, dec: -0.2991, mag: 2.23 },
        { id: 'alnitak', name: 'Alnitak', constellation: 'Orion', ra: 85.1897, dec: -1.9426, mag: 1.74 },
        { id: 'saiph', name: 'Saiph', constellation: 'Orion', ra: 86.9391, dec: -9.6696, mag: 2.06 },
        { id: 'aldebaran', name: 'Aldebaran', constellation: 'Taurus', ra: 68.9800, dec: 16.5093, mag: 0.87 },
        { id: 'pleione', name: 'Pleiades', constellation: 'Taurus', ra: 56.8711, dec: 24.1051, mag: 5.09 },
        { id: 'elnath', name: 'Elnath', constellation: 'Taurus', ra: 81.5729, dec: 28.6075, mag: 1.65 },
        { id: 'zeta-tauri', name: 'Zeta Tauri', constellation: 'Taurus', ra: 84.4112, dec: 21.1425, mag: 3.00 },
        { id: 'procyon', name: 'Procyon', constellation: 'Canis Minor', ra: 114.8255, dec: 5.2250, mag: 0.38 },
        { id: 'pollux', name: 'Pollux', constellation: 'Gemini', ra: 116.3290, dec: 28.0262, mag: 1.14 },
        { id: 'castor', name: 'Castor', constellation: 'Gemini', ra: 113.6500, dec: 31.8883, mag: 1.58 },
        { id: 'alhena', name: 'Alhena', constellation: 'Gemini', ra: 99.4279, dec: 16.3993, mag: 1.93 },
        { id: 'wasat', name: 'Wasat', constellation: 'Gemini', ra: 110.0308, dec: 21.9823, mag: 3.53 },
        { id: 'acubens', name: 'Acubens', constellation: 'Cancer', ra: 134.6217, dec: 11.8577, mag: 4.25 },
        { id: 'altarf', name: 'Altarf', constellation: 'Cancer', ra: 124.1288, dec: 9.1857, mag: 3.52 },
        { id: 'regulus', name: 'Regulus', constellation: 'Leo', ra: 152.0929, dec: 11.9672, mag: 1.35 },
        { id: 'algieba', name: 'Algieba', constellation: 'Leo', ra: 154.9931, dec: 19.8415, mag: 2.08 },
        { id: 'zosma', name: 'Zosma', constellation: 'Leo', ra: 168.5271, dec: 20.5237, mag: 2.56 },
        { id: 'denebola', name: 'Denebola', constellation: 'Leo', ra: 177.2649, dec: 14.5721, mag: 2.14 },
        { id: 'spica', name: 'Spica', constellation: 'Virgo', ra: 201.2983, dec: -11.1614, mag: 0.98 },
        { id: 'porrima', name: 'Porrima', constellation: 'Virgo', ra: 190.4152, dec: -1.4494, mag: 2.74 },
        { id: 'vindemiatrix', name: 'Vindemiatrix', constellation: 'Virgo', ra: 195.5448, dec: 10.9591, mag: 2.83 },
        { id: 'zubenelgenubi', name: 'Zubenelgenubi', constellation: 'Libra', ra: 222.7196, dec: -16.0418, mag: 2.75 },
        { id: 'zubeneschamali', name: 'Zubeneschamali', constellation: 'Libra', ra: 229.2519, dec: -9.3831, mag: 2.61 },
        { id: 'antares', name: 'Antares', constellation: 'Scorpius', ra: 247.3519, dec: -26.4320, mag: 1.06 },
        { id: 'dschubba', name: 'Dschubba', constellation: 'Scorpius', ra: 240.0833, dec: -22.6217, mag: 2.32 },
        { id: 'sargas', name: 'Sargas', constellation: 'Scorpius', ra: 264.3297, dec: -42.9978, mag: 1.86 },
        { id: 'shaula', name: 'Shaula', constellation: 'Scorpius', ra: 263.4022, dec: -37.1038, mag: 1.62 },
        { id: 'nunki', name: 'Nunki', constellation: 'Sagittarius', ra: 283.8163, dec: -26.2967, mag: 2.05 },
        { id: 'kaus-australis', name: 'Kaus Australis', constellation: 'Sagittarius', ra: 276.0431, dec: -34.3846, mag: 1.85 },
        { id: 'kaus-media', name: 'Kaus Media', constellation: 'Sagittarius', ra: 274.4068, dec: -29.8281, mag: 2.70 },
        { id: 'kaus-borealis', name: 'Kaus Borealis', constellation: 'Sagittarius', ra: 271.4520, dec: -25.4217, mag: 2.82 },
        { id: 'deneb-algedi', name: 'Deneb Algedi', constellation: 'Capricornus', ra: 326.7602, dec: -16.1273, mag: 2.85 },
        { id: 'dabih', name: 'Dabih', constellation: 'Capricornus', ra: 305.2528, dec: -14.7814, mag: 3.05 },
        { id: 'sadalsuud', name: 'Sadalsuud', constellation: 'Aquarius', ra: 322.8897, dec: -5.5712, mag: 2.91 },
        { id: 'sadalmelik', name: 'Sadalmelik', constellation: 'Aquarius', ra: 331.4459, dec: -0.3199, mag: 2.95 },
        { id: 'alrescha', name: 'Alrescha', constellation: 'Pisces', ra: 30.5118, dec: 2.7638, mag: 3.82 },
        { id: 'fomalhaut', name: 'Fomalhaut', constellation: 'Piscis Austrinus', ra: 344.4128, dec: -29.6222, mag: 1.16 },
        { id: 'achernar', name: 'Achernar', constellation: 'Eridanus', ra: 24.4286, dec: -57.2368, mag: 0.46 },
        { id: 'acrux', name: 'Acrux', constellation: 'Crux', ra: 186.6496, dec: -63.0991, mag: 0.77 },
        { id: 'mimosa', name: 'Mimosa', constellation: 'Crux', ra: 191.9303, dec: -59.6888, mag: 1.25 },
        { id: 'gacrux', name: 'Gacrux', constellation: 'Crux', ra: 187.7915, dec: -57.1132, mag: 1.63 },
        { id: 'alpha-centauri', name: 'Alpha Centauri', constellation: 'Centaurus', ra: 219.9021, dec: -60.8339, mag: -0.27 },
        { id: 'hadar', name: 'Hadar', constellation: 'Centaurus', ra: 210.9559, dec: -60.3730, mag: 0.61 },
        { id: 'peacock', name: 'Peacock', constellation: 'Pavo', ra: 306.4120, dec: -56.7351, mag: 1.94 },
        { id: 'alpheratz', name: 'Alpheratz', constellation: 'Andromeda', ra: 2.0969, dec: 29.0904, mag: 2.06 },
        { id: 'mirach', name: 'Mirach', constellation: 'Andromeda', ra: 17.4330, dec: 35.6206, mag: 2.05 },
        { id: 'almach', name: 'Almach', constellation: 'Andromeda', ra: 30.9748, dec: 42.3297, mag: 2.10 },
        { id: 'schedar', name: 'Schedar', constellation: 'Cassiopeia', ra: 10.1268, dec: 56.5373, mag: 2.24 },
        { id: 'caph', name: 'Caph', constellation: 'Cassiopeia', ra: 2.2945, dec: 59.1498, mag: 2.28 },
        { id: 'gamma-cas', name: 'Gamma Cas', constellation: 'Cassiopeia', ra: 14.1772, dec: 60.7167, mag: 2.47 },
        { id: 'ruchbah', name: 'Ruchbah', constellation: 'Cassiopeia', ra: 21.4539, dec: 60.2353, mag: 2.68 },
        { id: 'segin', name: 'Segin', constellation: 'Cassiopeia', ra: 28.5990, dec: 63.6701, mag: 3.35 },
        { id: 'dubhe', name: 'Dubhe', constellation: 'Ursa Major', ra: 165.9320, dec: 61.7510, mag: 1.79 },
        { id: 'merak', name: 'Merak', constellation: 'Ursa Major', ra: 165.4603, dec: 56.3824, mag: 2.37 },
        { id: 'phecda', name: 'Phecda', constellation: 'Ursa Major', ra: 178.4577, dec: 53.6948, mag: 2.44 },
        { id: 'megrez', name: 'Megrez', constellation: 'Ursa Major', ra: 183.8565, dec: 57.0326, mag: 3.31 },
        { id: 'alioth', name: 'Alioth', constellation: 'Ursa Major', ra: 193.5073, dec: 55.9598, mag: 1.76 },
        { id: 'mizar', name: 'Mizar', constellation: 'Ursa Major', ra: 200.9814, dec: 54.9254, mag: 2.23 },
        { id: 'alkaid', name: 'Alkaid', constellation: 'Ursa Major', ra: 206.8856, dec: 49.3133, mag: 1.86 },
        { id: 'hamal', name: 'Hamal', constellation: 'Aries', ra: 31.7933, dec: 23.4624, mag: 2.00 },
        { id: 'sheratan', name: 'Sheratan', constellation: 'Aries', ra: 28.6600, dec: 20.8080, mag: 2.64 },
        { id: 'mesarthim', name: 'Mesarthim', constellation: 'Aries', ra: 28.3826, dec: 19.2939, mag: 3.88 },
        { id: 'scheat', name: 'Scheat', constellation: 'Pegasus', ra: 345.9436, dec: 28.0828, mag: 2.42 },
        { id: 'markab', name: 'Markab', constellation: 'Pegasus', ra: 346.1902, dec: 15.2053, mag: 2.49 },
        { id: 'enif', name: 'Enif', constellation: 'Pegasus', ra: 326.0465, dec: 9.8750, mag: 2.40 },
    ];

    const constellationLines = [
        { name: 'Big Dipper', kind: 'asterism', paths: [['dubhe', 'merak', 'phecda', 'megrez', 'alioth', 'mizar', 'alkaid']] },
        { name: 'Little Dipper', kind: 'asterism', paths: [['polaris', 'yildun', 'epsilon-umi', 'zeta-umi', 'kochab', 'pherkad', 'eta-umi', 'zeta-umi']] },
        { name: 'Cassiopeia', paths: [['caph', 'schedar', 'gamma-cas', 'ruchbah', 'segin']] },
        { name: 'Orion', paths: [['betelgeuse', 'bellatrix', 'mintaka', 'alnilam', 'alnitak', 'saiph', 'rigel', 'mintaka'], ['betelgeuse', 'alnilam'], ['bellatrix', 'alnilam']] },
        { name: 'Summer Triangle', kind: 'asterism', paths: [['vega', 'deneb', 'altair', 'vega']] },
        { name: 'Crux', paths: [['gacrux', 'acrux'], ['mimosa', 'acrux']] },
        { name: 'Centaurus', paths: [['alpha-centauri', 'hadar', 'mimosa']] },
        { name: 'Andromeda', paths: [['alpheratz', 'mirach', 'almach']] },
        { name: 'Pegasus', paths: [['markab', 'scheat', 'alpheratz'], ['markab', 'enif']] },
        { name: 'Aries', kind: 'zodiac', paths: [['hamal', 'sheratan', 'mesarthim']] },
        { name: 'Taurus', kind: 'zodiac', paths: [['pleione', 'aldebaran', 'zeta-tauri'], ['aldebaran', 'elnath']] },
        { name: 'Gemini', kind: 'zodiac', paths: [['castor', 'wasat', 'alhena'], ['pollux', 'wasat']] },
        { name: 'Cancer', kind: 'zodiac', paths: [['altarf', 'acubens']] },
        { name: 'Leo', kind: 'zodiac', paths: [['regulus', 'algieba', 'zosma', 'denebola'], ['algieba', 'denebola']] },
        { name: 'Virgo', kind: 'zodiac', paths: [['vindemiatrix', 'porrima', 'spica']] },
        { name: 'Libra', kind: 'zodiac', paths: [['zubenelgenubi', 'zubeneschamali']] },
        { name: 'Scorpius', kind: 'zodiac', paths: [['dschubba', 'antares', 'sargas', 'shaula']] },
        { name: 'Sagittarius', kind: 'zodiac', paths: [['kaus-borealis', 'kaus-media', 'kaus-australis', 'nunki']] },
        { name: 'Capricornus', kind: 'zodiac', paths: [['dabih', 'deneb-algedi']] },
        { name: 'Aquarius', kind: 'zodiac', paths: [['sadalsuud', 'sadalmelik']] },
        { name: 'Pisces', kind: 'zodiac', paths: [['alrescha', 'alpheratz']] },
    ];

    const orbitalElements = {
        Mercury: { color: '#f9ffba', N: 48.3313, Nd: 3.24587e-5, i: 7.0047, id: 5.0e-8, w: 29.1241, wd: 1.01444e-5, a: 0.387098, ad: 0, e: 0.205635, ed: 5.59e-10, M: 168.6562, Md: 4.0923344368 },
        Venus: { color: '#f2c77b', N: 76.6799, Nd: 2.46590e-5, i: 3.3946, id: 2.75e-8, w: 54.8910, wd: 1.38374e-5, a: 0.723330, ad: 0, e: 0.006773, ed: -1.302e-9, M: 48.0052, Md: 1.6021302244 },
        Mars: { color: '#ff6f60', N: 49.5574, Nd: 2.11081e-5, i: 1.8497, id: -1.78e-8, w: 286.5016, wd: 2.92961e-5, a: 1.523688, ad: 0, e: 0.093405, ed: 2.516e-9, M: 18.6021, Md: 0.5240207766 },
        Jupiter: { color: '#ffd99b', N: 100.4542, Nd: 2.76854e-5, i: 1.3030, id: -1.557e-7, w: 273.8777, wd: 1.64505e-5, a: 5.20256, ad: 0, e: 0.048498, ed: 4.469e-9, M: 19.8950, Md: 0.0830853001 },
        Saturn: { color: '#c5d0ff', N: 113.6634, Nd: 2.38980e-5, i: 2.4886, id: -1.081e-7, w: 339.3939, wd: 2.97661e-5, a: 9.55475, ad: 0, e: 0.055546, ed: -9.499e-9, M: 316.9670, Md: 0.0334442282 },
        Uranus: { color: '#7be1ff', N: 74.0005, Nd: 1.3978e-5, i: 0.7733, id: 1.9e-8, w: 96.6612, wd: 3.0565e-5, a: 19.18171, ad: -1.55e-8, e: 0.047318, ed: 7.45e-9, M: 142.5905, Md: 0.011725806 },
        Neptune: { color: '#6a94ff', N: 131.7806, Nd: 3.0173e-5, i: 1.7700, id: -2.55e-7, w: 272.8461, wd: -6.027e-6, a: 30.05826, ad: 3.313e-8, e: 0.008606, ed: 2.15e-9, M: 260.2471, Md: 0.005995147 },
    };

    function deg2rad(deg) { return deg * pi / 180; }
    function rad2deg(rad) { return rad * 180 / pi; }
    function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
    function wrap360(value) { return ((value % 360) + 360) % 360; }
    function daysSinceJ2000(date = new Date()) { return (date.getTime() - j2000) / 86400000; }
    function julianDate(date = new Date()) { return date.getTime() / 86400000 + 2440587.5; }

    function greenwichSiderealDegrees(date = new Date()) {
        const jd = julianDate(date);
        const t = (jd - 2451545.0) / 36525;
        return wrap360(280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t - (t * t * t) / 38710000);
    }

    function localSiderealDegrees(date, longitude) {
        return wrap360(greenwichSiderealDegrees(date) + longitude);
    }

    function formatSidereal(deg) {
        const totalHours = wrap360(deg) / 15;
        const hours = Math.floor(totalHours);
        const minutes = Math.floor((totalHours - hours) * 60);
        return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    }

    function pad2(value) {
        return String(value).padStart(2, '0');
    }

    function minutesToTime(totalMinutes) {
        const minutes = Math.max(0, Math.min(1439, Number(totalMinutes) || 0));
        const hour = Math.floor(minutes / 60);
        const minute = minutes % 60;
        return `${pad2(hour)}:${pad2(minute)}`;
    }

    function timeToMinutes(timeString) {
        const [hour = 0, minute = 0] = String(timeString || '22:00').split(':').map(Number);
        return Math.max(0, Math.min(1439, (hour * 60) + minute));
    }

    function syncTimeSliderFromInput() {
        if (!controls.timeSlider || !controls.observeTime) return;
        controls.timeSlider.value = String(timeToMinutes(controls.observeTime.value || '22:00'));
        if (controls.timeSliderLabel) controls.timeSliderLabel.textContent = controls.observeTime.value || '22:00';
    }

    function setTimeFromSlider() {
        if (!controls.timeSlider || !controls.observeTime) return;
        const time = minutesToTime(controls.timeSlider.value);
        controls.observeTime.value = time;
        if (controls.timeSliderLabel) controls.timeSliderLabel.textContent = time;
        drawScene();
    }

    function getObservationDate() {
        if (!controls.observeDate || !controls.observeTime || !controls.observeDate.value) return new Date();
        const time = controls.observeTime.value || '22:00';
        const parsed = new Date(`${controls.observeDate.value}T${time}`);
        return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    function setObservationDate(date) {
        if (!controls.observeDate || !controls.observeTime) return;
        controls.observeDate.value = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
        controls.observeTime.value = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
        syncTimeSliderFromInput();
    }

    function estimateMoonAge(date) {
        const synodicMonth = 29.530588853;
        const knownNewMoon = 2451550.1;
        return (julianDate(date) - knownNewMoon + synodicMonth * 10000) % synodicMonth;
    }

    function parseRA(raStr) {
        const [h, m, s] = String(raStr).split(':').map(Number);
        return (h + m / 60 + s / 3600) * 15;
    }

    function parseDEC(decStr) {
        const raw = String(decStr);
        const sign = raw.trim().startsWith('-') ? -1 : 1;
        const [d, m, s] = raw.replace('+', '').replace('-', '').split(':').map(Number);
        return sign * (d + m / 60 + s / 3600);
    }

    function vectorFromRaDec(raDeg, decDeg) {
        const ra = deg2rad(raDeg);
        const dec = deg2rad(decDeg);
        return {
            x: Math.cos(dec) * Math.cos(ra),
            y: Math.cos(dec) * Math.sin(ra),
            z: Math.sin(dec),
        };
    }

    function vectorFromLatLon(lat, lon) {
        const latRad = deg2rad(lat);
        const lonRad = deg2rad(lon);
        return {
            x: Math.cos(latRad) * Math.cos(lonRad),
            y: Math.cos(latRad) * Math.sin(lonRad),
            z: Math.sin(latRad),
        };
    }

    function normalize(v) {
        const m = Math.hypot(v.x, v.y, v.z) || 1;
        return { x: v.x / m, y: v.y / m, z: v.z / m };
    }

    function dot(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    function cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x,
        };
    }

    function rotate(v, axis, angle) {
        const u = normalize(axis);
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        const du = dot(u, v);
        return {
            x: v.x * cosA + (u.y * v.z - u.z * v.y) * sinA + u.x * du * (1 - cosA),
            y: v.y * cosA + (u.z * v.x - u.x * v.z) * sinA + u.y * du * (1 - cosA),
            z: v.z * cosA + (u.x * v.y - u.y * v.x) * sinA + u.z * du * (1 - cosA),
        };
    }

    function makeBasis(viewPole) {
        const up = normalize(viewPole);
        let east = normalize(cross({ x: 0, y: 0, z: 1 }, up));
        if (Math.hypot(east.x, east.y, east.z) < 1e-5) east = { x: 1, y: 0, z: 0 };
        const north = normalize(cross(up, east));
        return { east, north };
    }

    function makeShiftedSkyBasis(viewPole, northPole) {
        const up = normalize(viewPole);
        let north = {
            x: northPole.x - up.x * dot(northPole, up),
            y: northPole.y - up.y * dot(northPole, up),
            z: northPole.z - up.z * dot(northPole, up),
        };
        if (Math.hypot(north.x, north.y, north.z) < 1e-5) {
            north = makeBasis(up).north;
        } else {
            north = normalize(north);
        }
        const east = normalize(cross(north, up));
        return { east, north };
    }

    function projectVector(vector, viewPole, basis, center, radius, projection = controls.projection ? controls.projection.value : 'equidistant') {
        const v = normalize(vector);
        const cosTheta = clamp(dot(v, viewPole), -1, 1);
        const theta = Math.acos(cosTheta);
        const showFullSky = controls.visibleMode && controls.visibleMode.value === 'full';
        const maxTheta = showFullSky ? pi : pi / 2;
        if (theta > maxTheta) return null;
        let r = radius * theta / maxTheta;
        if (!showFullSky && projection === 'orthographic') r = radius * Math.sin(theta);
        if (!showFullSky && projection === 'stereographic') r = radius * Math.tan(theta / 2);
        return {
            x: center.x + r * dot(v, basis.east),
            y: center.y - r * dot(v, basis.north),
            theta,
            cosTheta,
        };
    }

    function rotateSeason(vector, seasonDeg, axis = { x: 0, y: 0, z: 1 }) {
        return rotate(vector, axis, deg2rad(seasonDeg));
    }

    function eclipticToEquatorial(lonDeg, latDeg = 0) {
        const lon = deg2rad(lonDeg);
        const lat = deg2rad(latDeg);
        const ob = deg2rad(23.43928);
        const x = Math.cos(lon) * Math.cos(lat);
        const y = Math.sin(lon) * Math.cos(lat) * Math.cos(ob) - Math.sin(lat) * Math.sin(ob);
        const z = Math.sin(lon) * Math.cos(lat) * Math.sin(ob) + Math.sin(lat) * Math.cos(ob);
        return normalize({ x, y, z });
    }

    function vectorToRaDec(v) {
        const n = normalize(v);
        return {
            ra: wrap360(rad2deg(Math.atan2(n.y, n.x))),
            dec: rad2deg(Math.asin(n.z)),
        };
    }

    async function loadStarCatalog() {
        try {
            const response = await fetch('files/BSC.json');
            const data = await response.json();
            starCatalog = data
                .map((star, index) => ({
                    id: `bsc-${star['harvard_ref_#'] || index}`,
                    ra: parseRA(star.RA),
                    dec: parseDEC(star.DEC),
                    mag: parseFloat(star.MAG),
                }))
                .filter(star => Number.isFinite(star.ra) && Number.isFinite(star.dec) && Number.isFinite(star.mag) && star.mag <= 6.6);
            starCatalogLoaded = true;
            drawScene();
        } catch (error) {
            console.error('Failed to load Bright Star Catalog:', error);
            starCatalogLoaded = true;
            drawScene();
        }
    }

    async function loadConstellationFigures() {
        try {
            const response = await fetch('files/constellation.figures.txt');
            const text = await response.text();
            figureConstellations = parseConstellationFigures(text);
            figureConstellationsLoaded = figureConstellations.length > 0;
            populateObjectSearch();
            drawScene();
        } catch (error) {
            console.error('Failed to load constellation figures:', error);
            figureConstellationsLoaded = false;
        }
    }

    function parseConstellationFigures(text) {
        const figures = new Map();
        text.split(/\r?\n/).forEach(line => {
            if (!line.startsWith('conline ')) return;
            const parts = line.trim().split(/\s+/);
            if (parts.length < 24) return;
            const constellation = parts[1];
            const thickness = parseInt(parts[2], 10) || 1;
            const first = parseConlineEndpoint(parts, 4);
            const second = parseConlineEndpoint(parts, 14);
            if (!first || !second) return;
            if (!figures.has(constellation)) {
                figures.set(constellation, {
                    name: constellationName(constellation),
                    code: constellation,
                    kind: zodiacCodes.has(constellation) ? 'zodiac' : undefined,
                    segments: [],
                });
            }
            figures.get(constellation).segments.push({ from: first, to: second, thickness });
        });
        return Array.from(figures.values());
    }

    function parseConlineEndpoint(parts, start) {
        const ra = parseFloat(parts[start + 5]);
        const dec = parseFloat(parts[start + 6]);
        const mag = parseFloat(parts[start + 3]);
        if (!Number.isFinite(ra) || !Number.isFinite(dec)) return null;
        return {
            id: parts[start],
            designation: parts[start + 1],
            constellation: parts[start + 2],
            mag: Number.isFinite(mag) ? mag : 5,
            ra,
            dec,
        };
    }

    function loadEarthImage() {
        earthImage = new Image();
        earthImage.onload = () => {
            const textureCanvas = document.createElement('canvas');
            textureCanvas.width = earthImage.width;
            textureCanvas.height = earthImage.height;
            const textureCtx = textureCanvas.getContext('2d');
            textureCtx.drawImage(earthImage, 0, 0);
            earthTexture = textureCtx.getImageData(0, 0, earthImage.width, earthImage.height);
            drawScene();
        };
        earthImage.src = 'images/spherical-projection-map.jpeg';
    }

    function orbitalPosition(name, d) {
        const o = orbitalElements[name];
        const N = deg2rad(o.N + o.Nd * d);
        const i = deg2rad(o.i + o.id * d);
        const w = deg2rad(o.w + o.wd * d);
        const a = o.a + o.ad * d;
        const e = o.e + o.ed * d;
        const M = deg2rad(wrap360(o.M + o.Md * d));
        let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
        for (let j = 0; j < 4; j += 1) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
        const xv = a * (Math.cos(E) - e);
        const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
        const v = Math.atan2(yv, xv);
        const r = Math.hypot(xv, yv);
        return {
            x: r * (Math.cos(N) * Math.cos(v + w) - Math.sin(N) * Math.sin(v + w) * Math.cos(i)),
            y: r * (Math.sin(N) * Math.cos(v + w) + Math.cos(N) * Math.sin(v + w) * Math.cos(i)),
            z: r * (Math.sin(v + w) * Math.sin(i)),
            color: o.color,
        };
    }

    function currentSolarSystem(date = new Date()) {
        const d = daysSinceJ2000(date);
        const earth = orbitalPosition('Earth', d);
        return Object.keys(orbitalElements).filter(name => name !== 'Earth').map(name => {
            const planet = orbitalPosition(name, d);
            const geo = normalize({
                x: planet.x - earth.x,
                y: planet.y - earth.y,
                z: planet.z - earth.z,
            });
            const eq = eclipticVectorToEquatorial(geo);
            const raDec = vectorToRaDec(eq);
            return { name, color: planet.color, vector: eq, ra: raDec.ra, dec: raDec.dec };
        });
    }

    orbitalElements.Earth = { N: 0, Nd: 0, i: 0, id: 0, w: 282.9404, wd: 4.70935e-5, a: 1, ad: 0, e: 0.016709, ed: -1.151e-9, M: 356.0470, Md: 0.9856002585 };

    function eclipticVectorToEquatorial(v) {
        const ob = deg2rad(23.43928);
        return normalize({
            x: v.x,
            y: v.y * Math.cos(ob) - v.z * Math.sin(ob),
            z: v.y * Math.sin(ob) + v.z * Math.cos(ob),
        });
    }

    function getSunLongitude(date = new Date()) {
        const d = daysSinceJ2000(date);
        const earth = orbitalPosition('Earth', d);
        return wrap360(rad2deg(Math.atan2(-earth.y, -earth.x)));
    }

    function getMoonPhaseName(age) {
        if (age < 1.5 || age > 28) return 'New Moon';
        if (age < 6.5) return 'Waxing Crescent';
        if (age < 8.5) return 'First Quarter';
        if (age < 14) return 'Waxing Gibbous';
        if (age < 16.5) return 'Full Moon';
        if (age < 22) return 'Waning Gibbous';
        if (age < 24) return 'Last Quarter';
        return 'Waning Crescent';
    }

    function formatCoordinate(lat, lon) {
        const latText = `${Math.abs(lat).toFixed(2)}${DEG} ${lat >= 0 ? 'N' : 'S'}`;
        const lonText = `${Math.abs(lon).toFixed(2)}${DEG} ${lon >= 0 ? 'E' : 'W'}`;
        return `${latText}, ${lonText}`;
    }

    function axisTiltDegrees(lat) {
        return 90 - lat;
    }

    function axisAzimuthDegrees(lon) {
        return wrap360(lon);
    }

    function getViewState() {
        const lat = clamp(parseFloat(controls.lat.value) || 0, -90, 90);
        const lon = clamp(parseFloat(controls.lon.value) || 0, -180, 180);
        const habitatLat = clamp(parseFloat(controls.habitatLat.value) || 0, -90, 90);
        const habitatLon = clamp(parseFloat(controls.habitatLon.value) || 0, -180, 180);
        const northPole = normalize(vectorFromLatLon(lat, lon));
        const habitatVector = normalize(vectorFromLatLon(habitatLat, habitatLon));
        const shiftedLatitude = 90 - rad2deg(Math.acos(clamp(dot(habitatVector, northPole), -1, 1)));
        const viewPole = habitatVector;
        const seasonDeg = seasonAngles[selectedSeason] || 0;
        const observationDate = getObservationDate();
        const siderealDeg = localSiderealDegrees(observationDate, habitatLon);
        const skyRotationDeg = wrap360(siderealDeg - 180);
        const projection = controls.projection ? controls.projection.value : 'equidistant';
        const labelMode = controls.labelMode ? controls.labelMode.value : 'essential';
        const skyFilter = controls.skyFilter ? controls.skyFilter.value : 'all';
        const visibleMode = controls.visibleMode ? controls.visibleMode.value : 'visible';
        const moonAge = estimateMoonAge(observationDate);
        const axisTilt = axisTiltDegrees(lat);
        const axisAzimuth = axisAzimuthDegrees(lon);
        return {
            lat,
            lon,
            axisTilt,
            axisAzimuth,
            habitatLat,
            habitatLon,
            shiftedLatitude,
            northPole,
            habitatVector,
            viewPole,
            seasonDeg,
            skyRotationDeg,
            siderealDeg,
            observationDate,
            hemisphere: shiftedLatitude >= 0 ? 'North' : 'South',
            projection,
            labelMode,
            skyFilter,
            visibleMode,
            moonAge,
        };
    }

    function drawBackground(target, w, h, theme, center, radius, printFriendly = false) {
        target.clearRect(0, 0, w, h);
        target.fillStyle = printFriendly ? '#ffffff' : theme.background;
        target.fillRect(0, 0, w, h);
        if (printFriendly) {
            target.save();
            target.beginPath();
            target.arc(center.x, center.y, radius, 0, pi * 2);
            target.fillStyle = theme.background;
            target.fill();
            target.restore();
        }
        target.save();
        target.strokeStyle = theme.grid;
        target.lineWidth = 1.2;
        for (let ring = 1; ring <= 5; ring += 1) {
            target.beginPath();
            target.arc(center.x, center.y, radius * ring / 5, 0, pi * 2);
            target.stroke();
        }
        if (!controls.showRaGrid || controls.showRaGrid.checked) {
            for (let deg = 0; deg < 360; deg += 15) {
                const angle = deg2rad(deg);
                target.beginPath();
                target.moveTo(center.x, center.y);
                target.lineTo(center.x + Math.sin(angle) * radius, center.y - Math.cos(angle) * radius);
                target.stroke();
            }
        }
        target.strokeStyle = theme.gridBold;
        target.lineWidth = 2;
        target.beginPath();
        target.arc(center.x, center.y, radius, 0, pi * 2);
        target.stroke();
        target.restore();
    }

    function drawDirections(target, theme, center, radius, scale = 1, printFriendly = false) {
        const labels = [
            ['N', 0], ['NE', 45], ['E', 90], ['SE', 135],
            ['S', 180], ['SW', 225], ['W', 270], ['NW', 315],
        ];
        target.save();
        target.fillStyle = printFriendly ? '#9a3f20' : theme.accent;
        target.font = `700 ${24 * scale}px Lucida Console, monospace`;
        target.textAlign = 'center';
        target.textBaseline = 'middle';
        labels.forEach(([label, deg]) => {
            const angle = deg2rad(deg);
            target.fillText(label, center.x + Math.sin(angle) * (radius + 30 * scale), center.y - Math.cos(angle) * (radius + 30 * scale));
        });
        target.restore();
    }

    function drawRaDecLabels(target, theme, center, radius, scale = 1) {
        target.save();
        target.fillStyle = theme.gridBold;
        target.font = `${10 * scale}px Arial, sans-serif`;
        target.textAlign = 'center';
        target.textBaseline = 'middle';
        for (let hour = 0; hour < 24; hour += 2) {
            const angle = deg2rad(hour * 15);
            target.fillText(`${hour}h`, center.x + Math.sin(angle) * (radius * 0.965), center.y - Math.cos(angle) * (radius * 0.965));
        }
        target.fillStyle = theme.grid;
        [30, 60].forEach(deg => {
            target.fillText(`${deg}${DEG}`, center.x + 14 * scale, center.y - radius * deg / 90);
            target.fillText(`${deg}${DEG}`, center.x + 14 * scale, center.y + radius * deg / 90);
        });
        target.restore();
    }

    function drawAltitudeGrid(target, theme, center, radius, scale = 1) {
        target.save();
        target.strokeStyle = theme.gridBold;
        target.fillStyle = theme.gridBold;
        target.font = `700 ${10 * scale}px Arial, sans-serif`;
        target.textAlign = 'left';
        target.textBaseline = 'middle';
        [
            { alt: 60, r: radius * (30 / 90) },
            { alt: 30, r: radius * (60 / 90) },
        ].forEach(ring => {
            target.beginPath();
            target.arc(center.x, center.y, ring.r, 0, pi * 2);
            target.stroke();
            target.fillText(`${ring.alt}${DEG} alt`, center.x + ring.r + 8 * scale, center.y);
        });
        target.fillText('Zenith', center.x + 8 * scale, center.y - 10 * scale);
        target.textAlign = 'center';
        target.fillText('Horizon', center.x, center.y + radius - 14 * scale);
        target.restore();
    }

    function drawEcliptic(target, theme, state, basis, center, radius, scale = 1) {
        target.save();
        target.strokeStyle = theme.accent;
        target.lineWidth = 1.4 * scale;
        target.setLineDash([8 * scale, 8 * scale]);
        let started = false;
        for (let deg = 0; deg <= 360; deg += 3) {
            const vector = rotateSeason(eclipticToEquatorial(deg), state.skyRotationDeg, state.northPole);
            const point = projectVector(vector, state.viewPole, basis, center, radius);
            if (!point) {
                started = false;
                continue;
            }
            if (!started) {
                target.beginPath();
                target.moveTo(point.x, point.y);
                started = true;
            } else {
                target.lineTo(point.x, point.y);
            }
        }
        target.stroke();
        target.setLineDash([]);
        target.restore();
    }

    function drawStars(target, theme, state, basis, center, radius, scale = 1) {
        const source = state.skyFilter === 'all' && starCatalogLoaded && starCatalog.length ? starCatalog : navigationStars;
        target.save();
        source.forEach(star => {
            if (state.skyFilter === 'zodiac' && star.constellation && !zodiacCodes.has(constellationCodeFromName(star.constellation))) return;
            const vector = rotateSeason(vectorFromRaDec(star.ra, star.dec), state.skyRotationDeg, state.northPole);
            const point = projectVector(vector, state.viewPole, basis, center, radius);
            if (!point) return;
            const size = clamp((6.75 - star.mag) * 0.46, 0.82, 4.25) * scale;
            const alpha = clamp((7.05 - star.mag) / 7.0, 0.34, 1);
            const glow = clamp((5.6 - star.mag) / 5.8, 0.08, 0.56);
            if (theme.starGlow && glow > 0.08) {
                target.globalAlpha = glow;
                target.fillStyle = theme.starGlow;
                target.beginPath();
                target.arc(point.x, point.y, size * 2.55, 0, pi * 2);
                target.fill();
            }
            target.globalAlpha = alpha;
            target.fillStyle = theme.star;
            target.beginPath();
            target.arc(point.x, point.y, size, 0, pi * 2);
            target.fill();
        });
        target.restore();
    }

    function drawConstellations(target, theme, state, basis, center, radius, labelBoxes, scale = 1) {
        if (!controls.showConstellations.checked) return;
        const byId = new Map(navigationStars.map(star => [star.id, star]));
        const sourceFigures = (figureConstellationsLoaded ? figureConstellations : constellationLines)
            .filter(constellation => constellationMatchesFilter(constellation, state.skyFilter));
        target.save();
        sourceFigures.forEach(constellation => {
            const isSelected = selectedObjectId === `constellation-${constellation.name.toLowerCase().replace(/\s+/g, '-')}`;
            const visiblePoints = [];
            target.strokeStyle = constellation.kind === 'zodiac' ? theme.accent : theme.faint;
            if (isSelected) target.strokeStyle = '#ffffff';
            target.lineWidth = (isSelected ? 2.6 : constellation.kind === 'asterism' ? 1.7 : 1.15) * scale;
            target.globalAlpha = isSelected ? 1 : constellation.kind === 'zodiac' ? 0.72 : 0.84;
            const paths = constellation.segments
                ? constellation.segments.map(segment => [segment.from, segment.to])
                : constellation.paths.map(path => path.map(id => byId.get(id)));
            paths.forEach(path => {
                const points = path.map(star => star && projectVector(rotateSeason(vectorFromRaDec(star.ra, star.dec), state.skyRotationDeg, state.northPole), state.viewPole, basis, center, radius));
                let started = false;
                target.beginPath();
                points.forEach(point => {
                    if (!point) {
                        started = false;
                        return;
                    }
                    visiblePoints.push(point);
                    if (!started) {
                        target.moveTo(point.x, point.y);
                        started = true;
                    } else {
                        target.lineTo(point.x, point.y);
                    }
                });
                target.stroke();
            });
            if (controls.showConstellationLabels.checked) {
                const labelPoint = averagePoint(visiblePoints);
                if (labelPoint) {
                    const color = isSelected ? '#ffffff' : constellation.kind === 'zodiac' ? theme.accent : theme.faint;
                    drawPlacedLabel(target, constellation.name, labelPoint.x, labelPoint.y - 12 * scale, {
                        color,
                        font: `700 ${13 * scale}px Arial, sans-serif`,
                        align: 'center',
                        boxes: labelBoxes,
                        priority: isSelected ? 3 : constellation.kind === 'asterism' ? 2 : 1,
                        scale,
                    });
                }
            }
        });
        target.restore();
    }

    function averagePoint(points) {
        if (!points.length) return null;
        return points.reduce((acc, point) => ({
            x: acc.x + point.x / points.length,
            y: acc.y + point.y / points.length,
        }), { x: 0, y: 0 });
    }

    function drawPlacedLabel(target, text, x, y, options) {
        const boxes = options.boxes || [];
        const font = options.font || '12px Arial, sans-serif';
        const align = options.align || 'left';
        const priority = options.priority || 1;
        const scale = options.scale || 1;
        const offsets = [
            [0, 0],
            [10 * scale, -10 * scale],
            [10 * scale, 12 * scale],
            [-10 * scale, -10 * scale],
            [-10 * scale, 12 * scale],
            [0, -22 * scale],
            [0, 22 * scale],
        ];

        target.save();
        target.font = font;
        target.textAlign = align;
        target.textBaseline = 'middle';
        target.fillStyle = options.color;

        for (const [dx, dy] of offsets) {
            const box = labelBox(target, text, x + dx, y + dy, align, scale);
            const collision = boxes.some(existing => boxesOverlap(existing, box));
            if (!collision || priority >= 3) {
                target.fillText(text, x + dx, y + dy);
                boxes.push(box);
                target.restore();
                return true;
            }
        }
        target.restore();
        return false;
    }

    function labelBox(target, text, x, y, align, scale) {
        const width = target.measureText(text).width + 8 * scale;
        const height = 16 * scale;
        let left = x;
        if (align === 'center') left = x - width / 2;
        if (align === 'right') left = x - width;
        return { left, right: left + width, top: y - height / 2, bottom: y + height / 2 };
    }

    function boxesOverlap(a, b) {
        return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
    }

    function drawNamedStars(target, theme, state, basis, center, radius, labelBoxes, scale = 1) {
        target.save();
        const mode = labelModeSettings[state.labelMode] || labelModeSettings.essential;
        navigationStars
            .filter(star => {
                if (state.skyFilter === 'zodiac' && !zodiacCodes.has(constellationCodeFromName(star.constellation))) return star.id === selectedObjectId;
                if (state.skyFilter === 'navigation') return star.mag <= 2.25 || star.id === selectedObjectId || ['polaris', 'thuban', 'kochab', 'pherkad', 'acrux', 'mimosa'].includes(star.id);
                return star.mag <= mode.starMag || star.id === selectedObjectId || ['polaris', 'thuban', 'kochab', 'pherkad'].includes(star.id);
            })
            .forEach(star => {
                const point = projectVector(rotateSeason(vectorFromRaDec(star.ra, star.dec), state.skyRotationDeg, state.northPole), state.viewPole, basis, center, radius);
                if (!point) return;
                const isSelected = star.id === selectedObjectId;
                const size = clamp((3.2 - star.mag) * 1.2 + 3, 3, 7) * scale;
                if (theme.starGlow) {
                    target.fillStyle = theme.starGlow;
                    target.globalAlpha = 0.5;
                    target.beginPath();
                    target.arc(point.x, point.y, (isSelected ? size + 9 * scale : size + 5 * scale), 0, pi * 2);
                    target.fill();
                    target.globalAlpha = 1;
                }
                target.fillStyle = theme.star;
                target.strokeStyle = isSelected ? '#ffffff' : theme.accent;
                target.lineWidth = (isSelected ? 3.2 : 1.25) * scale;
                target.beginPath();
                target.arc(point.x, point.y, isSelected ? size + 4 * scale : size, 0, pi * 2);
                target.fill();
                target.stroke();
                drawPlacedLabel(target, star.name, point.x + 8 * scale, point.y - 8 * scale, {
                    color: isSelected ? '#ffffff' : theme.label,
                    font: `700 ${12 * scale}px Arial, sans-serif`,
                    align: 'left',
                    boxes: labelBoxes,
                    priority: isSelected ? 3 : 1,
                    scale,
                });
            });
        target.restore();
    }

    function drawPlanetsAndMoon(target, theme, state, basis, center, radius, labelBoxes, scale = 1) {
        const planets = currentSolarSystem(state.observationDate);
        const sunLongitude = getSunLongitude(state.observationDate);
        const moonLongitude = wrap360(sunLongitude + state.moonAge * 12.19075);
        const moonVector = rotateSeason(eclipticToEquatorial(moonLongitude), state.skyRotationDeg, state.northPole);
        planets.forEach(planet => {
            const point = projectVector(rotateSeason(planet.vector, state.skyRotationDeg, state.northPole), state.viewPole, basis, center, radius);
            if (!point) return;
            const isSelected = selectedObjectId === `planet-${planet.name.toLowerCase()}`;
            target.save();
            target.fillStyle = planet.color;
            target.beginPath();
            target.arc(point.x, point.y, (isSelected ? 11 : 7) * scale, 0, pi * 2);
            target.fill();
            if (isSelected) {
                target.strokeStyle = '#ffffff';
                target.lineWidth = 2 * scale;
                target.stroke();
            }
            drawPlacedLabel(target, planet.name, point.x, point.y + 20 * scale, {
                color: theme.planetText,
                font: `700 ${12 * scale}px Arial, sans-serif`,
                align: 'center',
                boxes: labelBoxes,
                priority: isSelected ? 3 : 2,
                scale,
            });
            target.restore();
        });
        const moonPoint = projectVector(moonVector, state.viewPole, basis, center, radius);
        if (moonPoint) {
            target.save();
            target.fillStyle = '#eef4ff';
            target.beginPath();
            target.arc(moonPoint.x, moonPoint.y, 10 * scale, 0, pi * 2);
            target.fill();
            target.fillStyle = theme.moonShadow || theme.background;
            target.beginPath();
            target.arc(moonPoint.x + 4 * scale, moonPoint.y - 2 * scale, 6 * scale, 0, pi * 2);
            target.fill();
            drawPlacedLabel(target, getMoonPhaseName(state.moonAge), moonPoint.x, moonPoint.y + 25 * scale, {
                color: theme.label,
                font: `700 ${12 * scale}px Arial, sans-serif`,
                align: 'center',
                boxes: labelBoxes,
                priority: 2,
                scale,
            });
            target.restore();
        }
        return { sunLongitude, moonLongitude };
    }

    function drawChart(target, w, h, state, theme, exportScale = 1, layout = {}) {
        const center = layout.center || { x: w / 2, y: h / 2 };
        const radius = layout.radius || Math.min(w, h) * 0.43;
        const basis = makeShiftedSkyBasis(state.viewPole, state.northPole);
        const labelBoxes = [];
        const printFriendly = Boolean(layout.printFriendly);
        drawBackground(target, w, h, theme, center, radius, printFriendly);
        drawDirections(target, theme, center, radius, exportScale, printFriendly);
        if (!controls.showRaGrid || controls.showRaGrid.checked) drawRaDecLabels(target, theme, center, radius, exportScale);
        if (!controls.showAltGrid || controls.showAltGrid.checked) drawAltitudeGrid(target, theme, center, radius, exportScale);
        drawEcliptic(target, theme, state, basis, center, radius, exportScale);
        drawStars(target, theme, state, basis, center, radius, exportScale);
        drawConstellations(target, theme, state, basis, center, radius, labelBoxes, exportScale);
        drawNamedStars(target, theme, state, basis, center, radius, labelBoxes, exportScale);
        const longitudes = drawPlanetsAndMoon(target, theme, state, basis, center, radius, labelBoxes, exportScale);
        drawFooter(target, theme, state, longitudes, w, h, exportScale, layout.footerY, printFriendly);
        if (controls.exportInset && controls.exportInset.checked && exportScale > 1.5) {
            drawExportInset(target, theme, state, longitudes, w, h, exportScale, layout, printFriendly);
            drawExportTips(target, theme, layout.tipsX || w - 1240 * exportScale, layout.tipsY || 42 * exportScale, 418 * exportScale, exportScale, printFriendly);
        }
        return longitudes;
    }

    function drawFooter(target, theme, state, longitudes, w, h, scale = 1, footerY = null, printFriendly = false) {
        target.save();
        target.fillStyle = printFriendly ? '#111719' : theme.faint;
        target.font = `${12 * scale}px Arial, sans-serif`;
        target.textAlign = 'center';
        const dateText = state.observationDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
        const constellationState = controls.showConstellations.checked ? 'constellations on' : 'constellations off';
        const labelState = controls.showConstellationLabels.checked ? 'labels on' : 'labels off';
        target.fillText(`${state.hemisphere} habitat sky | pole ${formatCoordinate(state.lat, state.lon)} | habitat ${formatCoordinate(state.habitatLat, state.habitatLon)} | ${dateText}`, w / 2, (footerY || h - 24 * scale) - 16 * scale);
        target.fillText(`Conditions: ${projectionLabels[state.projection] || state.projection}; ${controls.labelMode.value} labels; ${state.skyFilter}; ${state.visibleMode}; ${constellationState}; ${labelState}; ecliptic/moon path shown`, w / 2, footerY || h - 24 * scale);
        if (!starCatalog.length) {
            target.fillStyle = theme.accent;
            target.fillText('Loading Bright Star Catalog...', w / 2, h / 2 + 32 * scale);
        }
        target.restore();
    }

    function drawExportInset(target, theme, state, longitudes, w, h, scale = 1, layout = {}, printFriendly = false) {
        const insetW = 382 * scale;
        const insetH = 190 * scale;
        const x = layout.insetX || 42 * scale;
        const y = layout.insetY || 42 * scale;
        const globeRadius = 52 * scale;
        const best = closestNorthStar(state);
        target.save();
        target.fillStyle = printFriendly ? '#ffffff' : (theme.background === '#efe0bc' ? 'rgba(239, 224, 188, 0.92)' : 'rgba(4, 15, 33, 0.9)');
        target.strokeStyle = printFriendly ? '#111719' : theme.gridBold;
        target.lineWidth = 1.2 * scale;
        target.beginPath();
        target.roundRect(x, y, insetW, insetH, 8 * scale);
        target.fill();
        target.stroke();
        target.restore();

        drawCalibratedEarth(target, x + 72 * scale, y + 92 * scale, globeRadius, state, scale, false);

        target.save();
        target.fillStyle = printFriendly ? '#111719' : theme.label;
        target.font = `700 ${15 * scale}px Arial, sans-serif`;
        target.textAlign = 'left';
        target.fillText('Pole Shift Star Chart', x + 142 * scale, y + 30 * scale);
        target.font = `${12 * scale}px Arial, sans-serif`;
        target.fillStyle = printFriendly ? '#243d45' : theme.faint;
        target.fillText(`Pole: ${formatCoordinate(state.lat, state.lon)}`, x + 142 * scale, y + 51 * scale);
        target.fillText(`Habitat: ${formatCoordinate(state.habitatLat, state.habitatLon)}`, x + 142 * scale, y + 71 * scale);
        target.fillText(`Tilt: ${state.axisTilt.toFixed(1)}${DEG} @ ${state.axisAzimuth.toFixed(1)}${DEG} azimuth`, x + 142 * scale, y + 91 * scale);
        target.fillText(`Projection: ${projectionLabels[state.projection] || state.projection}`, x + 142 * scale, y + 111 * scale);
        target.fillText(`View: ${state.visibleMode} | ${state.skyFilter} | ${controls.labelMode.value} labels`, x + 142 * scale, y + 131 * scale);
        if (best) target.fillText(`Pole guide: ${best.name} (${rad2deg(best.angle).toFixed(2)}${DEG}, ${best.visible ? 'visible' : 'below horizon'})`, x + 142 * scale, y + 151 * scale);
        target.fillText(`Sun ${longitudes.sunLongitude.toFixed(1)}${DEG} | Moon ${longitudes.moonLongitude.toFixed(1)}${DEG}`, x + 142 * scale, y + 171 * scale);
        target.restore();
    }

    function drawExportTips(target, theme, x, y, width, scale = 1, printFriendly = false) {
        const tips = [
            'Star-nav tips',
            'Rim = horizon; center = overhead sky.',
            'Use bright stars first, then confirm nearby patterns.',
            'The pole guide is nearest the selected pole axis.',
            'Planets and Moon move; fixed stars are the anchor.',
            'Compare exports with and without constellation lines.',
        ];
        const lineHeight = 18 * scale;
        const height = (tips.length * lineHeight) + 30 * scale;
        target.save();
        target.fillStyle = printFriendly ? '#ffffff' : (theme.background === '#efe0bc' || theme.background === '#ffffff' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(4, 15, 33, 0.76)');
        target.strokeStyle = printFriendly ? '#111719' : theme.gridBold;
        target.lineWidth = 1.1 * scale;
        target.beginPath();
        target.roundRect(x, y, width, height, 8 * scale);
        target.fill();
        target.stroke();
        target.textAlign = 'left';
        target.textBaseline = 'top';
        tips.forEach((tip, index) => {
            target.fillStyle = printFriendly ? (index === 0 ? '#9a3f20' : '#111719') : (index === 0 ? theme.accent : theme.label);
            target.font = `${index === 0 ? '700' : '600'} ${index === 0 ? 14 * scale : 11 * scale}px Arial, sans-serif`;
            target.fillText(tip, x + 18 * scale, y + 14 * scale + index * lineHeight);
        });
        target.restore();
    }

    function closestNorthStar(state) {
        return navigationStars.reduce((best, star) => {
            const baseVector = vectorFromRaDec(star.ra, star.dec);
            const apparentVector = rotateSeason(baseVector, state.skyRotationDeg, state.northPole);
            const angle = Math.acos(clamp(dot(baseVector, state.northPole), -1, 1));
            const visible = dot(apparentVector, state.viewPole) > 0;
            if (!best || angle < best.angle) return { ...star, angle, visible };
            return best;
        }, null);
    }

    function drawEarthModel(state) {
        const w = earthCanvas.width;
        const h = earthCanvas.height;
        const cx = w / 2;
        const cy = h / 2 - 18;
        const radius = 74;
        earthCtx.clearRect(0, 0, w, h);
        drawCalibratedEarth(earthCtx, cx, cy, radius, state, 1, true);
    }

    function drawCalibratedEarth(target, cx, cy, radius, state, scale = 1, showCaption = false) {
        const view = normalize(state.northPole);
        const basis = makeGlobeBasis(view);
        target.save();
        target.beginPath();
        target.arc(cx, cy, radius, 0, pi * 2);
        target.clip();
        if (earthTexture) {
            drawTexturedEarth(target, cx, cy, radius, view, basis);
        } else {
            const gradient = target.createRadialGradient(cx - radius * 0.25, cy - radius * 0.28, radius * 0.1, cx, cy, radius);
            gradient.addColorStop(0, '#1d6384');
            gradient.addColorStop(1, '#092f49');
            target.fillStyle = gradient;
            target.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
        }

        target.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        target.lineWidth = 0.75 * scale;
        for (let lat = -60; lat <= 60; lat += 30) drawGeoLineOn(target, cx, cy, radius, view, basis, lon => vectorFromLatLon(lat, lon), -180, 180, 4);
        for (let lon = -150; lon <= 180; lon += 30) drawGeoLineOn(target, cx, cy, radius, view, basis, lat => vectorFromLatLon(lat, lon), -90, 90, 3);

        target.strokeStyle = '#ffd479';
        target.lineWidth = 1.2 * scale;
        drawGeoLineOn(target, cx, cy, radius, view, basis, lon => vectorFromLatLon(0, lon), -180, 180, 3);
        target.strokeStyle = '#ff9b5c';
        drawGeoLineOn(target, cx, cy, radius, view, basis, lat => vectorFromLatLon(lat, 0), -90, 90, 3);
        target.restore();

        target.save();
        target.strokeStyle = 'rgba(255, 255, 255, 0.34)';
        target.lineWidth = 2 * scale;
        target.beginPath();
        target.arc(cx, cy, radius, 0, pi * 2);
        target.stroke();
        target.strokeStyle = '#ffd479';
        target.lineWidth = 2 * scale;
        target.beginPath();
        target.moveTo(cx, cy + radius * 0.88);
        target.lineTo(cx, cy - radius * 0.88);
        target.moveTo(cx - radius * 0.88, cy);
        target.lineTo(cx + radius * 0.88, cy);
        target.stroke();
        target.fillStyle = '#ffd479';
        target.beginPath();
        target.arc(cx, cy, 6 * scale, 0, pi * 2);
        target.fill();
        target.strokeStyle = '#ffffff';
        target.lineWidth = 1 * scale;
        target.beginPath();
        target.arc(cx, cy, 12 * scale, 0, pi * 2);
        target.stroke();
        target.fillStyle = '#061126';
        target.font = `700 ${10 * scale}px Arial, sans-serif`;
        target.textAlign = 'center';
        target.textBaseline = 'middle';
        target.fillText('N', cx, cy);
        const habitatPoint = projectGeoToGlobe(state.habitatVector, view, basis, cx, cy, radius);
        if (habitatPoint && habitatPoint.visible) {
            target.fillStyle = '#ffffff';
            target.strokeStyle = '#ff9b5c';
            target.lineWidth = 2 * scale;
            target.beginPath();
            target.arc(habitatPoint.x, habitatPoint.y, 5 * scale, 0, pi * 2);
            target.fill();
            target.stroke();
            target.fillStyle = '#ffffff';
            target.font = `700 ${9 * scale}px Arial, sans-serif`;
            target.fillText('H', habitatPoint.x, habitatPoint.y - 12 * scale);
        }
        const anti = projectGeoToGlobe(normalize({ x: -view.x, y: -view.y, z: -view.z }), view, basis, cx, cy, radius);
        if (anti && anti.visible) {
            target.strokeStyle = '#ffffff';
            target.beginPath();
            target.arc(anti.x, anti.y, 4 * scale, 0, pi * 2);
            target.stroke();
        }
        if (showCaption) {
            target.fillStyle = '#d8e9ff';
            target.font = `${12 * scale}px Arial, sans-serif`;
            target.textBaseline = 'alphabetic';
            target.fillText(`N pole centered: ${formatCoordinate(state.lat, state.lon)}`, cx, cy + radius + 26 * scale);
            target.fillStyle = 'rgba(216, 233, 255, 0.72)';
            target.font = `${10 * scale}px Arial, sans-serif`;
            target.fillText('grid and marker are coordinate-calibrated', cx, cy + radius + 42 * scale);
        }
        target.restore();
    }

    function drawTexturedEarth(target, cx, cy, radius, view, basis) {
        const size = Math.max(2, Math.round(radius * 2));
        const imageData = target.createImageData(size, size);
        for (let py = 0; py < size; py += 1) {
            const yn = (py - size / 2) / (size / 2);
            for (let px = 0; px < size; px += 1) {
                const xn = (px - size / 2) / (size / 2);
                const rr = xn * xn + yn * yn;
                if (rr > 1) continue;
                const zn = Math.sqrt(1 - rr);
                const world = normalize({
                    x: basis.east.x * xn - basis.north.x * yn + view.x * zn,
                    y: basis.east.y * xn - basis.north.y * yn + view.y * zn,
                    z: basis.east.z * xn - basis.north.z * yn + view.z * zn,
                });
                const lat = rad2deg(Math.asin(world.z));
                const lon = wrap360(rad2deg(Math.atan2(world.y, world.x)) + 180) - 180;
                const sx = clamp(Math.round(((lon + 180) / 360) * (earthTexture.width - 1)), 0, earthTexture.width - 1);
                const sy = clamp(Math.round(((90 - lat) / 180) * (earthTexture.height - 1)), 0, earthTexture.height - 1);
                const src = (sy * earthTexture.width + sx) * 4;
                const dst = (py * size + px) * 4;
                const shade = 0.58 + zn * 0.42;
                imageData.data[dst] = earthTexture.data[src] * shade;
                imageData.data[dst + 1] = earthTexture.data[src + 1] * shade;
                imageData.data[dst + 2] = earthTexture.data[src + 2] * shade;
                imageData.data[dst + 3] = 255;
            }
        }
        target.putImageData(imageData, Math.round(cx - size / 2), Math.round(cy - size / 2));
    }

    function projectGeoToGlobe(world, view, basis, cx, cy, radius) {
        const z = dot(world, view);
        if (z <= 0) return { visible: false };
        return {
            x: cx + dot(world, basis.east) * radius,
            y: cy - dot(world, basis.north) * radius,
            visible: true,
        };
    }

    function makeGlobeBasis(view) {
        let east = normalize(cross({ x: 0, y: 0, z: 1 }, view));
        if (Math.hypot(east.x, east.y, east.z) < 1e-5) east = { x: 1, y: 0, z: 0 };
        const north = normalize(cross(view, east));
        return { east, north };
    }

    function drawGeoLineOn(target, cx, cy, radius, view, basis, vectorFactory, start, end, step) {
        let drawing = false;
        target.beginPath();
        for (let value = start; value <= end; value += step) {
            const world = vectorFactory(value);
            const point = projectGeoToGlobe(world, view, basis, cx, cy, radius);
            if (!point.visible) {
                drawing = false;
                continue;
            }
            if (!drawing) {
                target.moveTo(point.x, point.y);
                drawing = true;
            } else {
                target.lineTo(point.x, point.y);
            }
        }
        target.stroke();
    }

    function updateLabels(state, longitudes) {
        const best = closestNorthStar(state);
        labelNodes.poleLabel.textContent = formatCoordinate(state.lat, state.lon);
        if (labelNodes.axisTiltLabel) labelNodes.axisTiltLabel.textContent = `${state.axisTilt.toFixed(2)}${DEG} @ ${state.axisAzimuth.toFixed(2)}${DEG} azimuth`;
        labelNodes.currentOrientation.textContent = formatCoordinate(state.lat, state.lon);
        labelNodes.hemisphereLabel.textContent = state.hemisphere;
        if (labelNodes.habitatLabel) {
            labelNodes.habitatLabel.textContent = `${formatCoordinate(state.habitatLat, state.habitatLon)} | shifted ${Math.abs(state.shiftedLatitude).toFixed(2)}${DEG} ${state.shiftedLatitude >= 0 ? 'N' : 'S'}`;
        }
        if (labelNodes.projectionLabel) labelNodes.projectionLabel.textContent = projectionLabels[state.projection] || state.projection;
        if (labelNodes.lstLabel) labelNodes.lstLabel.textContent = formatSidereal(state.siderealDeg);
        if (labelNodes.toolbarLst) labelNodes.toolbarLst.textContent = formatSidereal(state.siderealDeg);
        if (labelNodes.moonAgeLabel) labelNodes.moonAgeLabel.textContent = `${getMoonPhaseName(state.moonAge)} (${state.moonAge.toFixed(1)} days)`;
        labelNodes.sunLongitude.textContent = `${longitudes.sunLongitude.toFixed(1)}${DEG}`;
        labelNodes.moonLongitude.textContent = `${longitudes.moonLongitude.toFixed(1)}${DEG}`;
        if (best) {
            labelNodes.northStarLabel.textContent = `${best.name}, ${best.constellation}; ${rad2deg(best.angle).toFixed(2)}${DEG} from pole axis; ${best.visible ? 'visible in habitat sky' : 'below habitat horizon'}`;
        }
    }

    function drawScene() {
        const state = getViewState();
        const theme = themeSettings[controls.theme.value] || themeSettings.frontier;
        const longitudes = drawChart(ctx, canvas.width, canvas.height, state, theme, 1);
        drawEarthModel(state);
        updateLabels(state, longitudes);
    }

    function syncInputs(source, target) {
        target.value = source.value;
    }

    function setPole(lat, lon) {
        controls.lat.value = clamp(lat, -90, 90);
        controls.lon.value = clamp(lon, -180, 180);
        syncInputs(controls.lat, controls.latInput);
        syncInputs(controls.lon, controls.lonInput);
        drawScene();
    }

    function setHabitat(lat, lon) {
        controls.habitatLat.value = clamp(lat, -90, 90);
        controls.habitatLon.value = clamp(lon, -180, 180);
        syncInputs(controls.habitatLat, controls.habitatLatInput);
        syncInputs(controls.habitatLon, controls.habitatLonInput);
        syncHabitatPreset();
        drawScene();
    }

    function syncHabitatPreset() {
        if (!controls.habitatPreset) return;
        const lat = Number(parseFloat(controls.habitatLat.value).toFixed(2));
        const lon = Number(parseFloat(controls.habitatLon.value).toFixed(2));
        const match = Array.from(controls.habitatPreset.options).find(option => {
            if (option.value === 'custom') return false;
            const [presetLat, presetLon] = option.value.split(',').map(Number);
            return Math.abs(presetLat - lat) < 0.01 && Math.abs(presetLon - lon) < 0.01;
        });
        controls.habitatPreset.value = match ? match.value : 'custom';
    }

    function setSeasonDate(season) {
        const preset = seasonDatePresets[season];
        if (!preset) return;
        const now = getObservationDate();
        setObservationDate(new Date(now.getFullYear(), preset.month, preset.day, preset.hour, 0, 0));
    }

    function createExportCanvas(options = {}) {
        const exportCanvas = document.createElement('canvas');
        const exportWidth = options.width || 3200;
        const exportHeight = options.height || 4000;
        exportCanvas.width = exportWidth;
        exportCanvas.height = exportHeight;
        const exportCtx = exportCanvas.getContext('2d');
        const exportScale = exportWidth / canvas.width;
        drawChart(
            exportCtx,
            exportWidth,
            exportHeight,
            getViewState(),
            themeSettings[controls.theme.value] || themeSettings.frontier,
            exportScale,
            {
                center: { x: exportWidth / 2, y: options.centerY || 2380 },
                radius: options.radius || 1340,
                footerY: exportHeight - 86,
                insetX: 120,
                insetY: 110,
                tipsX: options.tipsX || 1880,
                tipsY: 110,
                printFriendly: true,
            },
        );
        return exportCanvas;
    }

    function openPrintLayout() {
        const printCanvas = createExportCanvas({ width: 2550, height: 3300, centerY: 1960, radius: 1080, tipsX: 1500 });
        const imageUrl = printCanvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            const link = document.createElement('a');
            link.download = `pole-shift-star-chart-print-${Date.now()}.png`;
            link.href = imageUrl;
            link.click();
            return;
        }
        printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Pole Shift Star Chart Print Layout</title>
    <style>
        @page { size: letter portrait; margin: 0.25in; }
        * { box-sizing: border-box; }
        body { margin: 0; background: #ffffff; }
        img { display: block; width: 100%; height: auto; page-break-inside: avoid; }
        .print-actions { position: fixed; top: 10px; right: 10px; display: flex; gap: 8px; }
        button { padding: 10px 14px; border: 0; border-radius: 6px; background: #131736; color: #fcf2dc; font: 700 14px Arial, sans-serif; cursor: pointer; }
        @media print { .print-actions { display: none; } body { background: #ffffff; } }
    </style>
</head>
<body>
    <div class="print-actions">
        <button onclick="window.print()">Print / Save PDF</button>
        <button onclick="window.close()">Close</button>
    </div>
    <img src="${imageUrl}" alt="Pole Shift Star Chart print layout">
</body>
</html>`);
        printWindow.document.close();
        printWindow.focus();
    }

    function populateObjectSearch() {
        if (!controls.objectSearch) return;
        const previous = controls.objectSearch.value;
        controls.objectSearch.textContent = '';
        const addOption = (value, label) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            controls.objectSearch.appendChild(option);
        };
        addOption('', 'Select object');
        navigationStars
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(star => addOption(star.id, `${star.name} (${star.constellation})`));
        Object.keys(orbitalElements)
            .filter(name => name !== 'Earth')
            .forEach(name => addOption(`planet-${name.toLowerCase()}`, name));
        const figures = figureConstellationsLoaded ? figureConstellations : constellationLines;
        figures
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(item => addOption(`constellation-${item.name.toLowerCase().replace(/\s+/g, '-')}`, item.name));
        controls.objectSearch.value = previous;
        if (controls.objectSearch.value !== previous) {
            controls.objectSearch.value = '';
            selectedObjectId = '';
        }
    }

    function initialize() {
        populateObjectSearch();
        loadEarthImage();
        loadStarCatalog();
        loadConstellationFigures();
        syncInputs(controls.lat, controls.latInput);
        syncInputs(controls.lon, controls.lonInput);
        syncInputs(controls.habitatLat, controls.habitatLatInput);
        syncInputs(controls.habitatLon, controls.habitatLonInput);
        setObservationDate(new Date());
        syncHabitatPreset();

        controls.lat.addEventListener('input', () => {
            syncInputs(controls.lat, controls.latInput);
            drawScene();
        });
        controls.lon.addEventListener('input', () => {
            syncInputs(controls.lon, controls.lonInput);
            drawScene();
        });
        controls.latInput.addEventListener('change', () => setPole(parseFloat(controls.latInput.value), parseFloat(controls.lon.value)));
        controls.lonInput.addEventListener('change', () => setPole(parseFloat(controls.lat.value), parseFloat(controls.lonInput.value)));
        controls.habitatLat.addEventListener('input', () => {
            syncInputs(controls.habitatLat, controls.habitatLatInput);
            syncHabitatPreset();
            drawScene();
        });
        controls.habitatLon.addEventListener('input', () => {
            syncInputs(controls.habitatLon, controls.habitatLonInput);
            syncHabitatPreset();
            drawScene();
        });
        controls.habitatLatInput.addEventListener('change', () => setHabitat(parseFloat(controls.habitatLatInput.value), parseFloat(controls.habitatLon.value)));
        controls.habitatLonInput.addEventListener('change', () => setHabitat(parseFloat(controls.habitatLat.value), parseFloat(controls.habitatLonInput.value)));
        controls.showConstellations.addEventListener('change', drawScene);
        controls.showConstellationLabels.addEventListener('change', drawScene);
        controls.theme.addEventListener('change', drawScene);
        if (controls.projection) controls.projection.addEventListener('change', drawScene);
        if (controls.labelMode) controls.labelMode.addEventListener('change', drawScene);
        if (controls.skyFilter) controls.skyFilter.addEventListener('change', drawScene);
        if (controls.visibleMode) controls.visibleMode.addEventListener('change', drawScene);
        if (controls.exportInset) controls.exportInset.addEventListener('change', drawScene);
        if (controls.showRaGrid) controls.showRaGrid.addEventListener('change', drawScene);
        if (controls.showAltGrid) controls.showAltGrid.addEventListener('change', drawScene);
        if (controls.observeDate) controls.observeDate.addEventListener('change', () => {
            drawScene();
        });
        if (controls.observeTime) controls.observeTime.addEventListener('change', () => {
            syncTimeSliderFromInput();
            drawScene();
        });
        if (controls.timeSlider) controls.timeSlider.addEventListener('input', setTimeFromSlider);
        if (controls.habitatPreset) {
            controls.habitatPreset.addEventListener('change', () => {
                if (controls.habitatPreset.value === 'custom') return;
                const [lat, lon] = controls.habitatPreset.value.split(',').map(Number);
                setHabitat(lat, lon);
            });
        }
        if (controls.objectSearch) {
            controls.objectSearch.addEventListener('change', () => {
                selectedObjectId = controls.objectSearch.value;
                drawScene();
            });
        }

        controls.presets.forEach(button => {
            button.addEventListener('click', () => setPole(parseFloat(button.dataset.lat), parseFloat(button.dataset.lon)));
        });

        controls.seasons.forEach(button => {
            button.addEventListener('click', () => {
                selectedSeason = button.dataset.season;
                controls.seasons.forEach(item => item.classList.toggle('is-active', item === button));
                setSeasonDate(selectedSeason);
                drawScene();
            });
        });

        controls.download.addEventListener('click', () => {
            const exportCanvas = createExportCanvas();
            exportCanvas.toBlob(blob => {
                if (!blob) return;
                const link = document.createElement('a');
                link.download = `pole-shift-star-chart-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            }, 'image/png');
        });

        if (controls.printChart) controls.printChart.addEventListener('click', openPrintLayout);

        drawScene();
    }

    return { init: initialize };
})();

window.addEventListener('load', PSSC.init);
