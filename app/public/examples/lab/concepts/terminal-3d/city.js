/* city.js — the world as data. Edit the city here; no system code below this layer.
   Contract: every coordinate is in world grid units on a 26×18 slab centered at 0,0.
   Renderers and systems consume this and must not hard-code positions. */

export const ACCENTS = {
  cyan: '#33e6ff', magenta: '#ff3ec8', amber: '#ffb02e',
  lime: '#9dff3e', violet: '#a06bff', coral: '#ff6a4d',
};

/* Art direction — taste as config. Signage: glyphs ≥120px, fill ≤ #f0e6ff, never thin-white. */
export const ART = {
  bloom: { strength: 0.8, strengthMobile: 0.66, radius: 0.6, threshold: 0.55 },
  exposure: 1.3,
  fogDensity: 0.0075,
  signFill: '#f0e6ff',
  glyphMin: 120,
  windowLitRatio: { day: 0.10, golden: 0.32, night: 0.38, dawn: 0.2 },
  heroGlow: 1.0, secondaryGlow: 0.6, ambientGlow: 0.32,
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
};

export const CITY = {
  slab: { w: 26, d: 18 },

  /* Streets: one-way avenue pairs + alternating one-way cross streets (NYC rules). */
  roads: {
    avenueBands: [ { z0: 0.9, z1: 3.0 }, { z0: -7.6, z1: -5.9 } ],
    crossBands: [ { x0: 3.3, x1: 5.1 }, { x0: -7.0, x1: -5.2 } ],
    lanes: [
      { id: 'ebA', dir: 'EW', from: [-14.5, 2.4], to: [14.5, 2.4], stops: [-7.65, 2.65] },
      { id: 'ebB', dir: 'EW', from: [-14.5, 1.5], to: [14.5, 1.5], stops: [-7.65, 2.65] },
      { id: 'wbA', dir: 'EW', from: [14.5, -6.45], to: [-14.5, -6.45], stops: [5.75, -4.55] },
      { id: 'wbB', dir: 'EW', from: [14.5, -7.15], to: [-14.5, -7.15], stops: [5.75, -4.55] },
      { id: 'nb', dir: 'NS', from: [4.62, 5.55], to: [4.62, -8.9], stops: [3.55, -5.35] },
      { id: 'sb', dir: 'NS', from: [-6.55, -8.9], to: [-6.55, 5.55], stops: [-8.15, 0.35] },
    ],
    dashRows: [1.95, -6.75],
    dashCols: [4.62, -6.55],
    signalPosts: [
      { x: 2.65, z: 3.4, ry: 0.35, group: 'A' }, { x: 5.75, z: 0.5, ry: 3.5, group: 'B' },
      { x: -7.65, z: 3.4, ry: -0.35, group: 'A' }, { x: -4.55, z: 0.5, ry: 2.8, group: 'B' },
      { x: 2.65, z: -5.85, ry: 0.35, group: 'A' }, { x: -7.65, z: -5.85, ry: -0.35, group: 'B' },
    ],
    phase: { EW: 9, NS: 7, RED: 1.2 },
  },

  sidewalkBands: [ { z0: 3.0, z1: 5.65 }, { z0: 5.65, z1: 9 }, { z0: -5.9, z1: -4.6 }, { z0: -9, z1: -7.6 } ],
  plaza: { x: 9.4, z: 7.3, r: 1.9 },
  park: { x0: -12.6, z0: -1.6, w: 3.8, d: 2.2 },

  /* Pedestrian graph: nodes + edges; 'cross' edges are signal-gated to the NS phase. */
  walkGraph: {
    nodes: {
      pA: [-12, 6.35], pB: [-6, 6.35], pC: [0, 6.35], pD: [3.0, 6.35], pE: [6.4, 6.35], pF: [9.4, 6.35], pG: [12, 6.35],
      wA: [-12, 3.35], wB: [-7.6, 3.35], wC: [-4.6, 3.35], wD: [2.8, 3.35], zN: [3.66, 3.35], wE: [5.6, 3.35], wF: [12, 3.35],
      zS: [3.66, 0.55], sA: [-12, 0.55], sB: [-9.2, 0.55], sC: [-3.2, 0.55], sD: [1.6, 0.55], sF: [7.6, 0.55], sG: [12, 0.55],
      d0: [-8.42, 5.75], d1: [-6.07, 5.75], d2: [-3.72, 5.75], d3: [-1.37, 5.75], d4: [0.98, 5.75], d5: [3.33, 5.75],
      oV: [-9.2, -1.2], oC: [-3.2, -2.6], oA2: [1.6, -1.7], oT: [7.6, -0.45],
    },
    edges: [
      ['pA', 'pB'], ['pB', 'pC'], ['pC', 'pD'], ['pD', 'pE'], ['pE', 'pF'], ['pF', 'pG'],
      ['wA', 'wB'], ['wB', 'wC'], ['wC', 'wD'], ['wD', 'zN'], ['zN', 'wE'], ['wE', 'wF'],
      ['pA', 'wA'], ['pG', 'wF'],
      ['zN', 'zS', 'cross'],
      ['zS', 'sA'], ['zS', 'sD'], ['sA', 'sB'], ['sB', 'sC'], ['sC', 'sD'], ['zS', 'sF'], ['sF', 'sG'],
      ['pB', 'd0'], ['pB', 'd1'], ['pC', 'd2'], ['pC', 'd3'], ['pC', 'd4'], ['pD', 'd5'],
      ['sB', 'oV'], ['sC', 'oC'], ['sD', 'oA2'], ['sF', 'oT'],
    ],
  },

  /* Businesses double as sim entities; shops render as the storefront strip. */
  businesses: [
    { id: 0, name: 'PIZZA', kind: 'shop', accent: ACCENTS.coral, peak: 0.72, door: 'd0' },
    { id: 1, name: 'BODEGA', kind: 'shop', accent: ACCENTS.lime, peak: 0.35, door: 'd1' },
    { id: 2, name: 'CUTS', kind: 'shop', accent: ACCENTS.cyan, peak: 0.45, door: 'd2' },
    { id: 3, name: 'NAILS', kind: 'shop', accent: ACCENTS.magenta, peak: 0.5, door: 'd3' },
    { id: 4, name: 'CAFÉ', kind: 'shop', accent: ACCENTS.amber, peak: 0.2, door: 'd4' },
    { id: 5, name: 'TACOS', kind: 'shop', accent: ACCENTS.violet, peak: 0.75, door: 'd5', renovation: true },
    { id: 6, name: 'VIOLET & CO', kind: 'office', accent: ACCENTS.violet, peak: 0.3, door: 'oV' },
    { id: 7, name: 'GRID WORKS', kind: 'office', accent: ACCENTS.cyan, peak: 0.3, door: 'oC' },
    { id: 8, name: 'AMBER LLC', kind: 'office', accent: ACCENTS.amber, peak: 0.32, door: 'oA2' },
    { id: 9, name: 'THE TOWER', kind: 'office', accent: ACCENTS.magenta, peak: 0.32, door: 'oT' },
  ],

  shopsStrip: { x0: -9.6, unitW: 2.35, z: 4.1, depth: 3.1 },

  buildings: [
    { arch: 'slab', x: -9.2, z: -3.6, w: 4.4, h: 6.8, d: 4.2, accent: ACCENTS.violet, biz: 6, fireEscape: true, waterTower: true },
    { arch: 'deco', x: -3.2, z: -4.6, w: 3.4, h: 9.4, d: 3.4, accent: ACCENTS.cyan, biz: 7 },
    { arch: 'slab', x: 1.6, z: -3.8, w: 3.8, h: 5.2, d: 3.6, accent: ACCENTS.amber, biz: 8, fireEscape: true, waterTower: true },
    { arch: 'tower', x: 7.6, z: -3.2, ry: -0.06, accent: ACCENTS.magenta, biz: 9, billboard: true },
  ],

  props: [
    { type: 'subway', x: 7.4, z: 3.85 },
    { type: 'newsstand', x: -3.3, z: 3.9, ry: Math.PI },
    { type: 'steam', x: 0.6, z: 3.6 },
    { type: 'cart', x: 2.7, z: 6.3, ry: -0.3 },
    { type: 'table', x: -0.85, z: 6.35 }, { type: 'table', x: 0.45, z: 6.6 },
    { type: 'fountain', x: 9.4, z: 7.3 },
    { type: 'bench', x: 8.0, z: 8.35, ry: 2.4 }, { type: 'bench', x: 10.8, z: 8.35, ry: -2.4 },
    { type: 'bench', x: 9.4, z: 5.95, ry: 0 }, { type: 'bench', x: -11.6, z: -0.15, ry: Math.PI / 2 },
    { type: 'bench', x: -9.8, z: -0.6, ry: -Math.PI / 2 },
    { type: 'stringlights', a: [-12.3, -1.45], b: [-9.0, 0.45], h: 1.7 },
    { type: 'namesign', x: 2.65, z: 3.62, ry: 0, text: 'SIGNAL AVE' },
    { type: 'namesign', x: 2.42, z: 3.4, ry: Math.PI / 2, text: 'LF ST' },
    { type: 'namesign', x: -7.65, z: 3.62, ry: 0, text: 'SIGNAL AVE' },
    { type: 'namesign', x: -7.42, z: 3.4, ry: Math.PI / 2, text: 'GRID ST' },
  ],

  trees: [
    [-11.7, 7.6, 1], [-6.5, 7.6, 1], [-1.3, 7.6, 1], [11.9, 7.5, 0.9],
    [-9.4, 3.35, 0.85], [-0.2, 3.35, 0.85], [9.6, 3.35, 0.85],
    [-11.8, -0.9, 1], [-9.6, 0.1, 0.9],
  ],
  lamps: (() => { const out = []; for (let i = 0; i < 5; i++) { const x = -10.4 + i * 5.2; out.push([x, 3.55, i % 2]); out.push([x + 2.6, -5.55, (i + 1) % 2]); } return out; })(),
  planters: [-8.42, -6.07, -3.72, -1.37, 0.98],
  parked: [
    { x: -11.5, z: 1.06, ry: 0, cab: false }, { x: -3.6, z: 1.06, ry: 0, cab: true },
    { x: 0.8, z: 1.06, ry: 0, cab: false }, { x: 10.9, z: 1.06, ry: 0, cab: false },
    { x: -2.0, z: -6.0, ry: Math.PI, cab: false }, { x: 7.2, z: -6.0, ry: Math.PI, cab: true },
  ],
  fleet: [
    { lane: 'ebA', cab: true }, { lane: 'ebB', cab: false }, { lane: 'ebA', cab: false },
    { lane: 'wbA', cab: true }, { lane: 'wbB', cab: false }, { lane: 'wbA', cab: false },
    { lane: 'nb', cab: true }, { lane: 'sb', cab: false },
  ],

  beacons: [
    { anchor: [-8.4, 3.9, 4.4], biz: 0, down: 1.5, dir: [-0.25, 0.42, 1], dist: 8, kicker: 'Small business block', title: 'Live in two weeks.', body: 'A full storefront site — booking, payments, menus — launched fast. Every tick on this counter is the sim taking a real order.' },
    { anchor: [-7.25, 3.7, 4.4], biz: 1, down: 1.4, dir: [0.3, 0.36, 1], dist: 7.5, kicker: 'Local signal', title: 'Found by the neighborhood.', body: 'Local SEO points the block at one front door. The walkers going in are the events — watch for their names on the ticker.' },
    { anchor: [-9.2, 7.6, -3.6], biz: 6, down: 2.4, dir: [-0.75, 0.35, 0.9], dist: 9.5, kicker: 'Growing teams', title: 'Systems that follow up.', body: 'Intake, scheduling, invoicing wired into one path. Office hours drive the curve — leads climb through the workday.' },
    { anchor: [7.6, 16, -3.2], biz: 9, down: 3.6, dir: [0.85, 0.3, 1], dist: 11.5, kicker: 'Big business polish', title: 'The whole block, one dashboard.', body: 'Every signal on the street flows up here. Twelve events fire a beam at the old skyline — the district announcing itself.' },
    { anchor: [-1, 0.6, 1.9], biz: 9, down: 0.1, dir: [0.15, 0.85, 0.7], dist: 8.5, kicker: 'The grid', title: 'Every signal tracked.', body: 'Those pulses are orders, calls, and bookings in transit. Nothing loops — each one was caused by someone with a name.' },
    { anchor: [11.6, 2.6, 5.6], biz: 9, down: 0.9, dir: [0.7, 0.4, 1], dist: 7.5, kicker: 'The district', title: 'One studio, whole block.', body: 'LittleFight builds at every scale on this street. Traffic obeys the signals, citizens keep schedules, and the city remembers.' },
    { anchor: [2.15 + 1.175, 3.8, 4.4], biz: 5, down: 1.5, dir: [0.3, 0.4, 1], dist: 7.5, kicker: 'The next client', title: 'Watch this space.', body: 'This unit is mid-renovation. Scaffolding, sign boot, first customer — the client journey, played out in world time.' },
  ],

  citizens: [
    { name: 'MARIA', works: 1, home: 'pA' }, { name: 'JUNE', works: 4, home: 'pG' },
    { name: 'ANDRE', works: 0, home: 'wA' }, { name: 'PRIYA', works: 2, home: 'pA' },
    { name: 'LUZ', works: 3, home: 'pG' }, { name: 'MO', works: 5, home: 'wF' },
    { name: 'IVY', works: 6, home: 'pA' }, { name: 'SAUL', works: 6, home: 'pG' },
    { name: 'NIA', works: 7, home: 'wA' }, { name: 'OTIS', works: 7, home: 'wF' },
    { name: 'REN', works: 8, home: 'pA' }, { name: 'GAB', works: 8, home: 'pG' },
    { name: 'DOT', works: 9, home: 'wA' }, { name: 'EZRA', works: 9, home: 'wF' },
    { name: 'KIKO', works: 9, home: 'pA' }, { name: 'BEA', works: 9, home: 'pG' },
    { name: 'ХО', works: 4, home: 'wA' }, { name: 'TASH', works: 1, home: 'wF' },
    { name: 'OMAR', works: 0, home: 'pA' }, { name: 'WREN', works: 3, home: 'pG' },
  ],

  skyline: { bridge: [340, 430], empire: 1048, chrysler: 1568 },
};
