/* city.js v3 — MIDTOWN GRID. Nothing is placed by hand: streets, sidewalks, blocks,
   lots, lanes, crosswalks, the walk graph, tree/lamp rhythm, and parking are DERIVED
   from grid constants. A zoning validator throws if any building touches a
   right-of-way. SimCity rules: derive, don't place. */

export const ACCENTS = {
  cyan: '#33e6ff', magenta: '#ff3ec8', amber: '#ffb02e',
  lime: '#9dff3e', violet: '#a06bff', coral: '#ff6a4d',
};

export const ART = {
  bloom: { strength: 0.8, strengthMobile: 0.66, radius: 0.6, threshold: 0.55 },
  exposure: 1.3,
  fogDensity: 0.007,
  signFill: '#f0e6ff',
  glyphMin: 120,
  windowLitRatio: { day: 0.10, golden: 0.34, night: 0.4, dawn: 0.2 },
  dayAnchors: [
    { t: 0.05, hemiS: '#8a6bc0', hemiG: '#3a2244', hemiI: 2.2, keyC: '#ffc9a0', keyI: 1.9, rimI: 1.0, fog: '#3a2258', bg: '#31205c', win: 0.55, sign: 0.6, grid: 0.55, edge: 0.6, orb: 0.5, head: 1 },
    { t: 0.29, hemiS: '#a99bf0', hemiG: '#4a3a6a', hemiI: 3.6, keyC: '#fff2dd', keyI: 3.4, rimI: 1.2, fog: '#4a3585', bg: '#4a3390', win: 0.16, sign: 0.3, grid: 0.32, edge: 0.4, orb: 0.15, head: 0 },
    { t: 0.53, hemiS: '#7a5bd6', hemiG: '#2a1548', hemiI: 2.6, keyC: '#ffd9c2', keyI: 2.2, rimI: 1.6, fog: '#2c1656', bg: '#241148', win: 1.0, sign: 1.0, grid: 1.0, edge: 1.0, orb: 1.0, head: 1 },
    { t: 0.80, hemiS: '#4a3f92', hemiG: '#191030', hemiI: 2.0, keyC: '#8a9aff', keyI: 1.0, rimI: 1.8, fog: '#1c1042', bg: '#150c32', win: 1.3, sign: 1.2, grid: 1.1, edge: 1.1, orb: 1.15, head: 1 },
  ],
  sky: {
    dawn: { stops: ['#1a1240', '#45276e', '#a04a80', '#ff9a72'], sun: [700, 386, 12, 0.7], stars: 0.35, skyC: 'rgba(58,32,92,0.9)', winR: 0.34, winC: '190,200,255' },
    day: { stops: ['#4636b0', '#6a4cd2', '#9a6ae4', '#ffd9a8'], sun: [610, 250, 11, 0.9], stars: 0, skyC: 'rgba(122,102,190,0.85)', winR: 0.5, winC: '230,238,255' },
    golden: { stops: ['#2a1157', '#5b2192', '#a4359e', '#ff8a5c'], sun: [645, 352, 15, 0.82], stars: 0.4, skyC: 'rgba(64,28,112,0.85)', winR: 0.3, winC: '255,200,170' },
    night: { stops: ['#0e081f', '#1c1145', '#301a5e', '#4a2358'], sun: null, stars: 1, skyC: 'rgba(22,12,44,0.95)', winR: 0.1, winC: '255,214,170' },
  },
  skyline: { bridge: [340, 430], empire: 1048, chrysler: 1568 },
};

/* ============ THE GRID ============ */
const AVENUE_W = 2.2;   // E-W, two drive lanes + a parking lane
const STREET_W = 1.4;   // N-S, one drive lane
const WALK_W = 0.95;    // sidewalk width, always flanks every roadway
const SLAB_W = 32, SLAB_D = 22;

/* Avenue center-z rows and street center-x cols — the whole city hangs off these. */
const AVENUE_Z = [4.6, -4.6];
const STREET_X = [-8.6, 0, 8.6];

const aveBand = (z) => ({ z0: z - AVENUE_W / 2, z1: z + AVENUE_W / 2 });
const stBand = (x) => ({ x0: x - STREET_W / 2, x1: x + STREET_W / 2 });

const avenueBands = AVENUE_Z.map(aveBand);
const crossBands = STREET_X.map(stBand);

/* Sidewalk bands flank every avenue + the slab's north/south edges. */
const sidewalkBands = [];
for (const b of avenueBands) {
  sidewalkBands.push({ z0: b.z0 - WALK_W, z1: b.z0 });
  sidewalkBands.push({ z0: b.z1, z1: b.z1 + WALK_W });
}
sidewalkBands.push({ z0: SLAB_D / 2 - WALK_W, z1: SLAB_D / 2 });
sidewalkBands.push({ z0: -SLAB_D / 2, z1: -SLAB_D / 2 + WALK_W });
const sideBandsX = crossBands.map((b) => [{ x0: b.x0 - WALK_W, x1: b.x0 }, { x0: b.x1, x1: b.x1 + WALK_W }]).flat();

/* Blocks: the rectangles left between rights-of-way. */
const xEdges = [-SLAB_W / 2, ...STREET_X.map((x) => [x - STREET_W / 2 - WALK_W, x + STREET_W / 2 + WALK_W]).flat(), SLAB_W / 2];
const zEdges = [-SLAB_D / 2 + WALK_W, ...AVENUE_Z.slice().sort((a, b) => b - a).map((z) => [z + AVENUE_W / 2 + WALK_W, z - AVENUE_W / 2 - WALK_W]).flat(), SLAB_D / 2 - WALK_W];
/* zEdges (north→south): [-11+w? careful] — build rows explicitly: */
const rowN = { z0: AVENUE_Z[0] + AVENUE_W / 2 + WALK_W, z1: SLAB_D / 2 - WALK_W };            // 5.15 .. 10.05
const rowM = { z0: AVENUE_Z[1] + AVENUE_W / 2 + WALK_W, z1: AVENUE_Z[0] - AVENUE_W / 2 - WALK_W }; // -1.05 .. 1.05
const rowS = { z0: -SLAB_D / 2 + WALK_W, z1: AVENUE_Z[1] - AVENUE_W / 2 - WALK_W };           // -10.05 .. -5.15
const colA = { x0: -SLAB_W / 2, x1: STREET_X[0] - STREET_W / 2 - WALK_W };  // -16 .. -10.25
const colB = { x0: STREET_X[0] + STREET_W / 2 + WALK_W, x1: STREET_X[1] - STREET_W / 2 - WALK_W }; // -6.95 .. -1.65
const colC = { x0: STREET_X[1] + STREET_W / 2 + WALK_W, x1: STREET_X[2] - STREET_W / 2 - WALK_W }; // 1.65 .. 6.95
const colD = { x0: STREET_X[2] + STREET_W / 2 + WALK_W, x1: SLAB_W / 2 };   // 10.25 .. 16
export const BLOCKS = { rowN, rowM, rowS, colA, colB, colC, colD };

const SETBACK = 0.35;
const lot = (col, row) => ({ x0: col.x0 + SETBACK, x1: col.x1 - SETBACK, z0: row.z0 + SETBACK, z1: row.z1 - SETBACK });
const lotCenter = (L) => [(L.x0 + L.x1) / 2, (L.z0 + L.z1) / 2];
const lotSize = (L) => [L.x1 - L.x0, L.z1 - L.z0];

/* ============ LANES (derived) ============ */
/* Avenue 0 (north, z=3.1): one-way EB pair + south-curb parking lane.
   Avenue 1 (south, z=-3.1): one-way WB pair + north-curb parking lane.
   Streets: C1 SB, C2 NB, C3 SB (alternating one-ways). */
const laneStopsX = (dirSign) => STREET_X.map((x) => x - dirSign * (STREET_W / 2 + WALK_W + 0.35));
const laneStopsZ = (dirSign) => AVENUE_Z.map((z) => z - dirSign * (AVENUE_W / 2 + WALK_W + 0.35));

const lanes = [
  { id: 'ebA', dir: 'EW', from: [-17, AVENUE_Z[0] + 0.62], to: [17, AVENUE_Z[0] + 0.62], stops: laneStopsX(1) },
  { id: 'ebB', dir: 'EW', from: [-17, AVENUE_Z[0] - 0.05], to: [17, AVENUE_Z[0] - 0.05], stops: laneStopsX(1) },
  { id: 'wbA', dir: 'EW', from: [17, AVENUE_Z[1] - 0.62], to: [-17, AVENUE_Z[1] - 0.62], stops: laneStopsX(-1) },
  { id: 'wbB', dir: 'EW', from: [17, AVENUE_Z[1] + 0.05], to: [-17, AVENUE_Z[1] + 0.05], stops: laneStopsX(-1) },
  { id: 'sb1', dir: 'NS', from: [STREET_X[0], rowN.z1], to: [STREET_X[0], -SLAB_D / 2 + 0.6], stops: laneStopsZ(-1) },
  { id: 'nb2', dir: 'NS', from: [STREET_X[1], -SLAB_D / 2 + 0.6], to: [STREET_X[1], rowN.z1], stops: laneStopsZ(1) },
  { id: 'sb3', dir: 'NS', from: [STREET_X[2], rowN.z1], to: [STREET_X[2], -SLAB_D / 2 + 0.6], stops: laneStopsZ(-1) },
];

/* Parking: derived stalls along each avenue's parking lane, skipping intersections. */
const parkingZ = [AVENUE_Z[0] - 0.78, AVENUE_Z[1] + 0.78];
const parked = [];
for (let i = 0; i < 2; i++) {
  for (let x = -14; x <= 14; x += 3.4) {
    if (crossBands.some((b) => x > b.x0 - 1.2 && x < b.x1 + 1.2)) continue;
    if (Math.abs(x % 2) < 0.01 && parked.length % 3 === 0) continue; // leave gaps
    parked.push({ x: +(x + (i ? 0.7 : 0)).toFixed(2), z: parkingZ[i], ry: i ? Math.PI : 0, cab: (x + i) % 3 === 0 });
  }
}

/* Signals at every avenue×street corner (two visual posts per intersection). */
const signalPosts = [];
for (const sx of STREET_X) {
  for (const az of AVENUE_Z) {
    signalPosts.push({ x: sx - STREET_W / 2 - 0.45, z: az + AVENUE_W / 2 + 0.35, ry: 0.35, group: 'A' });
    signalPosts.push({ x: sx + STREET_W / 2 + 0.45, z: az - AVENUE_W / 2 - 0.35, ry: Math.PI + 0.35, group: 'B' });
  }
}

/* ============ WALK GRAPH (derived) ============ */
/* Nodes at every sidewalk corner of every intersection + midblock door stubs.
   Crossing edges over avenues are signal-gated ('cross'). */
const nodes = {};
const edges = [];
const nid = (...parts) => parts.join('_');
const walkRowsZ = [
  rowN.z0 - WALK_W / 2,               // north sidewalk of avenue 0 (shops frontage)  ≈ 4.68
  AVENUE_Z[0] - AVENUE_W / 2 - WALK_W / 2, // south sidewalk of avenue 0 ≈ 1.53
  AVENUE_Z[1] + AVENUE_W / 2 + WALK_W / 2, // north sidewalk of avenue 1 ≈ -1.53
  rowS.z1 + WALK_W / 2,               // south sidewalk of avenue 1 ≈ -4.68
];
const walkColXs = [-15.2, ...STREET_X.map((x) => [x - STREET_W / 2 - WALK_W / 2, x + STREET_W / 2 + WALK_W / 2]).flat(), 15.2];
walkRowsZ.forEach((wz, r) => {
  walkColXs.forEach((wx, c) => {
    nodes[nid('n', r, c)] = [+wx.toFixed(2), +wz.toFixed(2)];
  });
  for (let c = 0; c < walkColXs.length - 1; c++) {
    const midStreet = c % 2 === 1; // between a street's two flanking sidewalks
    edges.push([nid('n', r, c), nid('n', r, c + 1), midStreet ? 'street' : undefined]);
  }
});
/* vertical links along each street sidewalk between the two avenues + crossings over avenues */
for (let c = 0; c < walkColXs.length; c++) {
  edges.push([nid('n', 1, c), nid('n', 2, c)]);           // between the avenues (crosses nothing)
  edges.push([nid('n', 0, c), nid('n', 1, c), 'cross']);  // crossing avenue 0
  edges.push([nid('n', 2, c), nid('n', 3, c), 'cross']);  // crossing avenue 1
}

/* ============ BUSINESSES + LOTS ============ */
export const CITY = {};
const businesses = [
  { id: 0, name: 'PIZZA', kind: 'shop', accent: ACCENTS.coral, peak: 0.72 },
  { id: 1, name: 'BODEGA', kind: 'shop', accent: ACCENTS.lime, peak: 0.35 },
  { id: 2, name: 'CUTS', kind: 'shop', accent: ACCENTS.cyan, peak: 0.45 },
  { id: 3, name: 'NAILS', kind: 'shop', accent: ACCENTS.magenta, peak: 0.5 },
  { id: 4, name: 'CAFÉ', kind: 'shop', accent: ACCENTS.amber, peak: 0.2 },
  { id: 5, name: 'TACOS', kind: 'shop', accent: ACCENTS.violet, peak: 0.75, renovation: true },
  { id: 6, name: 'VIOLET & CO', kind: 'office', accent: ACCENTS.violet, peak: 0.3 },
  { id: 7, name: 'GRID WORKS', kind: 'office', accent: ACCENTS.cyan, peak: 0.3 },
  { id: 8, name: 'AMBER LLC', kind: 'office', accent: ACCENTS.amber, peak: 0.32 },
  { id: 9, name: 'THE TOWER', kind: 'office', accent: ACCENTS.magenta, peak: 0.32 },
];

/* Shops: two strips in rowN (colB + colC), storefront faces FLUSH to the lot's
   south edge (rowN.z0) — on the sidewalk line, never past it. */
const shopLotB = lot(colB, rowN), shopLotC = lot(colC, rowN);
const SHOP_DEPTH = 3.0;
const shopFrontZ = rowN.z0;                 // faces exactly onto the sidewalk edge
const shopRowZ = shopFrontZ + SHOP_DEPTH / 2;
const stripDefs = [
  { lot: shopLotB, shops: [0, 1, 2] },
  { lot: shopLotC, shops: [3, 4, 5] },
];
const shops = [];
for (const sd of stripDefs) {
  const w = (sd.lot.x1 - sd.lot.x0) / sd.shops.length;
  sd.shops.forEach((bizId, i) => {
    const x = sd.lot.x0 + w * (i + 0.5);
    shops.push({ biz: bizId, x: +x.toFixed(2), z: +shopRowZ.toFixed(2), w: +(w - 0.12).toFixed(2), d: SHOP_DEPTH });
    const doorId = nid('door', bizId);
    nodes[doorId] = [+(x + w / 2 - 0.5).toFixed(2), +(shopFrontZ - WALK_W / 2).toFixed(2)];
    const nearestC = walkColXs.reduce((best, wx, c) => Math.abs(wx - x) < Math.abs(walkColXs[best] - x) ? c : best, 0);
    edges.push([doorId, nid('n', 0, nearestC)]);
    businesses[bizId].door = doorId;
  });
}

/* Offices fill rowM lots; the tower takes colD. Industrial + park + plaza in rowS/rowN ends. */
const officeLots = [
  { biz: 6, L: lot(colA, rowM), h: 6.8, arch: 'slab', fireEscape: true, waterTower: true },
  { biz: 7, L: lot(colB, rowM), h: 9.4, arch: 'deco' },
  { biz: 8, L: lot(colC, rowM), h: 5.2, arch: 'slab', fireEscape: true, waterTower: true },
  { biz: 9, L: lot(colD, rowM), arch: 'tower', billboard: true },
];
const buildings = officeLots.map((o) => {
  const [cx, cz] = lotCenter(o.L);
  const [lw, ld] = lotSize(o.L);
  const w = Math.min(lw, o.arch === 'tower' ? 5.2 : 4.6);
  const d = Math.min(ld, o.arch === 'tower' ? 5.0 : 4.2) - 0.2;
  const b = { arch: o.arch, x: +cx.toFixed(2), z: +cz.toFixed(2), w: +w.toFixed(2), h: o.h || 0, d: +d.toFixed(2), accent: businesses[o.biz].accent, biz: o.biz, fireEscape: o.fireEscape, waterTower: o.waterTower, billboard: o.billboard };
  const doorId = nid('door', o.biz);
  const dz = o.L.z1 + WALK_W / 2; // office doors face their north sidewalk
  nodes[doorId] = [+cx.toFixed(2), +Math.min(dz, walkRowsZ[1]).toFixed(2)];
  const nearestC = walkColXs.reduce((best, wx, c) => Math.abs(wx - cx) < Math.abs(walkColXs[best] - cx) ? c : best, 0);
  edges.push([doorId, nid('n', 1, nearestC)]);
  businesses[o.biz].door = doorId;
  return b;
});

/* Industrial south row: three low warehouses with rooftop tanks. */
const industrial = [];
for (const col of [colA, colB, colC]) {
  const L = lot(col, rowS);
  const [cx, cz] = lotCenter(L);
  const [lw, ld] = lotSize(L);
  industrial.push({ arch: 'warehouse', x: +cx.toFixed(2), z: +(cz - 0.4).toFixed(2), w: +Math.min(lw, 4.8).toFixed(2), h: 2.6, d: +Math.min(ld - 0.8, 3.4).toFixed(2), accent: [ACCENTS.cyan, ACCENTS.amber, ACCENTS.lime][industrial.length], biz: 9, waterTower: false });
}
buildings.push(...industrial);

/* Plaza fills rowN×colD; park fills rowN×colA. */
const plazaLot = lot(colD, rowN), parkLot = lot(colA, rowN);
const plaza = { x: +lotCenter(plazaLot)[0].toFixed(2), z: +lotCenter(plazaLot)[1].toFixed(2), r: 2.0 };
const park = { x0: parkLot.x0, z0: parkLot.z0, w: parkLot.x1 - parkLot.x0, d: parkLot.z1 - parkLot.z0 };

/* Trees + lamps: derived rhythm along both sidewalks of each avenue. */
const trees = [];
const lamps = [];
{
  let alt = 0;
  for (let x = -13.6; x <= 14; x += 3.2) {
    if (crossBands.some((b) => x > b.x0 - 1.0 && x < b.x1 + 1.0)) continue;
    lamps.push([+x.toFixed(1), +(walkRowsZ[0]).toFixed(2), alt % 2]);
    lamps.push([+(x + 1.6).toFixed(1), +(walkRowsZ[3]).toFixed(2), (alt + 1) % 2]);
    alt++;
  }
  for (let x = -12; x <= 14; x += 3.2) {
    if (crossBands.some((b) => x > b.x0 - 1.0 && x < b.x1 + 1.0)) continue;
    trees.push([+x.toFixed(1), +(walkRowsZ[1]).toFixed(2), 0.85]);
    trees.push([+(x + 1.4).toFixed(1), +(walkRowsZ[2]).toFixed(2), 0.85]);
  }
  trees.push([+(parkLot.x0 + 1).toFixed(1), +(parkLot.z0 + 1.2).toFixed(1), 1]);
  trees.push([+(parkLot.x1 - 1.4).toFixed(1), +(parkLot.z1 - 1.6).toFixed(1), 1]);
  trees.push([+(plazaLot.x0 + 0.8).toFixed(1), +(plazaLot.z1 - 1).toFixed(1), 0.9]);
}

/* Props on named spots (all inside lots or on sidewalks — validated below). */
const props = [
  { type: 'subway', x: +(colD.x0 + 1.4).toFixed(2), z: +(walkRowsZ[1]).toFixed(2) },
  { type: 'newsstand', x: +(colB.x0 + 0.8).toFixed(2), z: +(walkRowsZ[0]).toFixed(2), ry: Math.PI },
  { type: 'steam', x: 4.3, z: +(walkRowsZ[0]).toFixed(2) },
  { type: 'cart', x: +(colC.x1 - 0.9).toFixed(2), z: +(walkRowsZ[0]).toFixed(2), ry: -0.3 },
  { type: 'table', x: +(shops[4] ? shops[4].x - 0.7 : 4).toFixed(2), z: +(shopFrontZ - WALK_W + 0.25).toFixed(2) },
  { type: 'table', x: +(shops[4] ? shops[4].x + 0.6 : 5).toFixed(2), z: +(shopFrontZ - WALK_W + 0.4).toFixed(2) },
  { type: 'fountain', x: plaza.x, z: plaza.z },
  { type: 'bench', x: plaza.x - 1.4, z: plaza.z + 1.5, ry: 2.4 },
  { type: 'bench', x: plaza.x + 1.4, z: plaza.z + 1.5, ry: -2.4 },
  { type: 'bench', x: plaza.x, z: plaza.z - 1.7, ry: 0 },
  { type: 'bench', x: +(parkLot.x0 + 1.2).toFixed(2), z: +(parkLot.z0 + 2.4).toFixed(2), ry: Math.PI / 2 },
  { type: 'bench', x: +(parkLot.x1 - 1.2).toFixed(2), z: +(parkLot.z0 + 2).toFixed(2), ry: -Math.PI / 2 },
  { type: 'stringlights', a: [parkLot.x0 + 0.8, parkLot.z0 + 0.8], b: [parkLot.x1 - 0.8, parkLot.z1 - 0.8], h: 1.7 },
  { type: 'namesign', x: STREET_X[1] - STREET_W / 2 - 0.45, z: +(walkRowsZ[0] + 0.25).toFixed(2), ry: 0, text: 'SIGNAL AVE' },
  { type: 'namesign', x: STREET_X[1] - STREET_W / 2 - 0.68, z: +(walkRowsZ[0]).toFixed(2), ry: Math.PI / 2, text: 'LF ST' },
  { type: 'namesign', x: STREET_X[2] - STREET_W / 2 - 0.45, z: +(walkRowsZ[3] + 0.25).toFixed(2), ry: 0, text: 'GRID AVE' },
];

/* Fleet on derived lanes. */
const fleet = [
  { lane: 'ebA', cab: true }, { lane: 'ebB', cab: false }, { lane: 'ebA', cab: false },
  { lane: 'wbA', cab: true }, { lane: 'wbB', cab: false }, { lane: 'wbA', cab: false },
  { lane: 'nb2', cab: true }, { lane: 'sb1', cab: false }, { lane: 'sb3', cab: false },
];

/* Beacons anchored to derived geometry. */
const beacons = [
  { anchor: [shops[0].x, 3.9, shops[0].z], biz: 0, down: 1.5, dir: [-0.25, 0.42, -1], dist: 8, kicker: 'Small business block', title: 'Live in two weeks.', body: 'A full storefront site — booking, payments, menus — launched fast. Every tick on this counter is the sim taking a real order.' },
  { anchor: [shops[1].x, 3.7, shops[1].z], biz: 1, down: 1.4, dir: [0.3, 0.36, -1], dist: 7.5, kicker: 'Local signal', title: 'Found by the neighborhood.', body: 'Local SEO points the block at one front door. The walkers going in are the events — watch for their names on the ticker.' },
  { anchor: [buildings[0].x, 7.6, buildings[0].z], biz: 6, down: 2.4, dir: [-0.75, 0.35, 0.9], dist: 9.5, kicker: 'Growing teams', title: 'Systems that follow up.', body: 'Intake, scheduling, invoicing wired into one path. Office hours drive the curve — leads climb through the workday.' },
  { anchor: [buildings[3].x, 16, buildings[3].z], biz: 9, down: 3.6, dir: [0.85, 0.3, -1], dist: 11.5, kicker: 'Big business polish', title: 'The whole block, one dashboard.', body: 'Every signal on the street flows up here. Twelve events fire a beam at the old skyline — the district announcing itself.' },
  { anchor: [STREET_X[1] + 1.4, 0.6, AVENUE_Z[0]], biz: 9, down: 0.1, dir: [0.15, 0.85, 0.7], dist: 8.5, kicker: 'The grid', title: 'Every signal tracked.', body: 'Those pulses are orders, calls, and bookings in transit. Nothing loops — each one was caused by someone with a name.' },
  { anchor: [plaza.x, 2.6, plaza.z], biz: 9, down: 0.9, dir: [0.7, 0.4, 1], dist: 7.5, kicker: 'The district', title: 'One studio, whole block.', body: 'LittleFight builds at every scale on this grid. Traffic obeys the signals, citizens keep schedules, and the city remembers.' },
  { anchor: [shops[5].x, 3.8, shops[5].z], biz: 5, down: 1.5, dir: [0.3, 0.4, -1], dist: 7.5, kicker: 'The next client', title: 'Watch this space.', body: 'This unit is mid-renovation. Scaffolding, sign boot, first customer — the client journey, played out in world time.' },
];

const citizens = [
  { name: 'MARIA', works: 1 }, { name: 'JUNE', works: 4 }, { name: 'ANDRE', works: 0 },
  { name: 'PRIYA', works: 2 }, { name: 'LUZ', works: 3 }, { name: 'MO', works: 5 },
  { name: 'IVY', works: 6 }, { name: 'SAUL', works: 6 }, { name: 'NIA', works: 7 },
  { name: 'OTIS', works: 7 }, { name: 'REN', works: 8 }, { name: 'GAB', works: 8 },
  { name: 'DOT', works: 9 }, { name: 'EZRA', works: 9 }, { name: 'KIKO', works: 9 },
  { name: 'BEA', works: 9 }, { name: 'XO', works: 4 }, { name: 'TASH', works: 1 },
  { name: 'OMAR', works: 0 }, { name: 'WREN', works: 3 },
].map((c, i) => ({ ...c, home: nid('n', [0, 3][i % 2], [0, walkColXs.length - 1][Math.floor(i / 2) % 2]) }));

Object.assign(CITY, {
  slab: { w: SLAB_W, d: SLAB_D },
  grid: { AVENUE_W, STREET_W, WALK_W, AVENUE_Z, STREET_X, walkRowsZ, walkColXs, rows: { rowN, rowM, rowS }, cols: { colA, colB, colC, colD } },
  roads: {
    avenueBands, crossBands, lanes,
    dashRows: AVENUE_Z.map((z) => z + 0.285),
    dashCols: STREET_X.slice(),
    parkingZ,
    signalPosts,
    phase: { EW: 9, NS: 7, RED: 1.2 },
  },
  sidewalkBands, sideBandsX,
  plaza, park,
  walkGraph: { nodes, edges },
  businesses, shops, buildings, props, trees, lamps, parked, fleet, beacons, citizens,
  shopFrontZ,
});

/* ============ ZONING VALIDATOR — the SimCity rule ============ */
export function validateZoning() {
  const errors = [];
  const inBandZ = (z0, z1) => avenueBands.some((b) => z1 > b.z0 && z0 < b.z1);
  const inBandX = (x0, x1) => crossBands.some((b) => x1 > b.x0 && x0 < b.x1);
  const footprints = [
    ...buildings.map((b) => ({ name: `bldg:${b.arch}:${b.biz}`, x0: b.x - b.w / 2, x1: b.x + b.w / 2, z0: b.z - b.d / 2, z1: b.z + b.d / 2 })),
    ...shops.map((s) => ({ name: `shop:${businesses[s.biz].name}`, x0: s.x - s.w / 2, x1: s.x + s.w / 2, z0: s.z - s.d / 2, z1: s.z + s.d / 2 })),
  ];
  for (const f of footprints) {
    if (inBandZ(f.z0, f.z1)) errors.push(`${f.name} intersects an avenue (z ${f.z0.toFixed(2)}..${f.z1.toFixed(2)})`);
    if (inBandX(f.x0, f.x1)) errors.push(`${f.name} intersects a cross street (x ${f.x0.toFixed(2)}..${f.x1.toFixed(2)})`);
    for (const sb of sidewalkBands) {
      if (f.z1 > sb.z0 + 0.01 && f.z0 < sb.z1 - 0.01) { errors.push(`${f.name} encroaches sidewalk z ${sb.z0}..${sb.z1}`); break; }
    }
  }
  for (let i = 0; i < footprints.length; i++) {
    for (let j = i + 1; j < footprints.length; j++) {
      const a = footprints[i], b = footprints[j];
      if (a.x1 > b.x0 && a.x0 < b.x1 && a.z1 > b.z0 && a.z0 < b.z1) errors.push(`${a.name} overlaps ${b.name}`);
    }
  }
  for (const p of parked) {
    if (crossBands.some((b) => p.x > b.x0 - 0.5 && p.x < b.x1 + 0.5)) errors.push(`parked car in intersection at x=${p.x}`);
  }
  return errors;
}

const zoningErrors = validateZoning();
if (zoningErrors.length) {
  console.error('[ZONING] violations:', zoningErrors);
  throw new Error('Zoning validation failed: ' + zoningErrors[0]);
}
