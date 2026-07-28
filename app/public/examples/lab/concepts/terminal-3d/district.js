import * as THREE from 'https://esm.sh/three@0.164.1';
import { EffectComposer } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';
import { mergeGeometries } from 'https://esm.sh/three@0.164.1/examples/jsm/utils/BufferGeometryUtils.js';

/* ================= setup ================= */

const canvas = document.querySelector('[data-scene]');
const veil = document.querySelector('[data-veil]');
const veilFill = document.querySelector('[data-veil-fill]');
const plate = document.querySelector('[data-plate]');
const hint = document.querySelector('[data-hint]');
const chipEl = document.querySelector('[data-chip]');
const chipBar = document.querySelector('[data-chip-bar]');
const chipKicker = document.querySelector('[data-chip-kicker]');
const chipTitle = document.querySelector('[data-chip-title]');
const chipBody = document.querySelector('[data-chip-body]');
const chipStats = document.querySelector('[data-chip-stats]');
const hudEl = document.querySelector('[data-hud]');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 500;

const setProgress = (p) => { if (veilFill) veilFill.style.width = `${Math.round(p * 100)}%`; };
setProgress(0.3);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  veil.querySelector('.veil__mark').textContent = 'This device could not start WebGL.';
  throw err;
}

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.75 : 2));
renderer.info.autoReset = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#241148');
scene.fog = new THREE.FogExp2('#2c1656', 0.0075);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 240);

const rng = (() => { let s = 20260202; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const rand = (a, b) => a + rng() * (b - a);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

const ACCENTS = {
  cyan: '#33e6ff', magenta: '#ff3ec8', amber: '#ffb02e',
  lime: '#9dff3e', violet: '#a06bff', coral: '#ff6a4d',
};

/* ================= day cycle ================= */
/* dayT 0..1 · anchors: dawn .05 · day .29 · golden .53 · night .80 */

const DAY_LEN = 180;
let dayT = 0.5;

const DAY_ANCHORS = [
  { t: 0.05, hemiS: '#8a6bc0', hemiG: '#3a2244', hemiI: 2.2, keyC: '#ffc9a0', keyI: 1.9, rimI: 1.0, fog: '#3a2258', bg: '#31205c', win: 0.55, sign: 0.6, grid: 0.55, edge: 0.6, orb: 0.5, head: 1 },
  { t: 0.29, hemiS: '#a99bf0', hemiG: '#4a3a6a', hemiI: 3.6, keyC: '#fff2dd', keyI: 3.4, rimI: 1.2, fog: '#4a3585', bg: '#4a3390', win: 0.16, sign: 0.3, grid: 0.32, edge: 0.4, orb: 0.15, head: 0 },
  { t: 0.53, hemiS: '#7a5bd6', hemiG: '#2a1548', hemiI: 2.6, keyC: '#ffd9c2', keyI: 2.2, rimI: 1.6, fog: '#2c1656', bg: '#241148', win: 1.0, sign: 1.0, grid: 1.0, edge: 1.0, orb: 1.0, head: 1 },
  { t: 0.80, hemiS: '#4a3f92', hemiG: '#191030', hemiI: 2.0, keyC: '#8a9aff', keyI: 1.0, rimI: 1.8, fog: '#1c1042', bg: '#150c32', win: 1.3, sign: 1.2, grid: 1.1, edge: 1.1, orb: 1.15, head: 1 },
];

const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function sampleDay(t) {
  const A = DAY_ANCHORS;
  let i = A.length - 1;
  for (let k = 0; k < A.length; k++) { if (t >= A[k].t) i = k; }
  const a = A[i], b = A[(i + 1) % A.length];
  let span = b.t - a.t; if (span <= 0) span += 1;
  let f = t - a.t; if (f < 0) f += 1;
  f = THREE.MathUtils.clamp(f / span, 0, 1);
  f = f * f * (3 - 2 * f);
  const mix = (x, y) => x + (y - x) * f;
  const col = (x, y) => _c1.set(x).lerp(_c2.set(y), f).clone();
  return {
    hemiS: col(a.hemiS, b.hemiS), hemiG: col(a.hemiG, b.hemiG), hemiI: mix(a.hemiI, b.hemiI),
    keyC: col(a.keyC, b.keyC), keyI: mix(a.keyI, b.keyI), rimI: mix(a.rimI, b.rimI),
    fog: col(a.fog, b.fog), bg: col(a.bg, b.bg),
    win: mix(a.win, b.win), sign: mix(a.sign, b.sign), grid: mix(a.grid, b.grid),
    edge: mix(a.edge, b.edge), orb: mix(a.orb, b.orb), head: mix(a.head, b.head),
  };
}

function dayClock(t) {
  const ts = [0.05, 0.29, 0.53, 0.80, 1.05];
  const hs = [6, 12, 19.5, 25, 30];
  const tt = t < 0.05 ? t + 1 : t;
  let i = 0;
  for (let k = 0; k < 4; k++) if (tt >= ts[k]) i = k;
  const f = (tt - ts[i]) / (ts[i + 1] - ts[i]);
  const h = hs[i] + (hs[i + 1] - hs[i]) * f;
  const hh = Math.floor(h) % 24, mm = Math.floor((h % 1) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function phaseName(t) {
  if (t < 0.13 || t >= 0.98) return 'DAWN';
  if (t < 0.45) return 'DAY';
  if (t < 0.62) return 'GOLDEN';
  return 'NIGHT';
}

/* ================= sky textures ================= */

function skyTexture(phase) {
  const P = {
    dawn: { stops: ['#1a1240', '#45276e', '#a04a80', '#ff9a72'], sun: [700, 386, 12, 0.7], stars: 0.35, skyC: 'rgba(58,32,92,0.9)', winR: 0.34, winC: '190,200,255' },
    day: { stops: ['#4636b0', '#6a4cd2', '#9a6ae4', '#ffd9a8'], sun: [610, 250, 11, 0.9], stars: 0, skyC: 'rgba(122,102,190,0.85)', winR: 0.5, winC: '230,238,255' },
    golden: { stops: ['#2a1157', '#5b2192', '#a4359e', '#ff8a5c'], sun: [645, 352, 15, 0.82], stars: 0.4, skyC: 'rgba(64,28,112,0.85)', winR: 0.3, winC: '255,200,170' },
    night: { stops: ['#0e081f', '#1c1145', '#301a5e', '#4a2358'], sun: null, stars: 1, skyC: 'rgba(22,12,44,0.95)', winR: 0.1, winC: '255,214,170' },
  }[phase];
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 512;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, P.stops[0]); sky.addColorStop(0.45, P.stops[1]);
  sky.addColorStop(0.78, P.stops[2]); sky.addColorStop(1, P.stops[3]);
  g.fillStyle = sky; g.fillRect(0, 0, 2048, 512);
  if (P.stars > 0) {
    for (let i = 0; i < 220 * P.stars; i++) {
      const y = Math.pow(rng(), 1.5) * 300;
      const tint = ['214,236,255', '255,214,244', '255,238,204'][Math.floor(rng() * 3)];
      g.fillStyle = `rgba(${tint},${(rand(0.2, 0.85) * P.stars).toFixed(2)})`;
      g.beginPath(); g.arc(rand(0, 2048), y, rand(0.5, 1.5), 0, Math.PI * 2); g.fill();
    }
  }
  if (P.sun) {
    const [sx, sy, sr, sa] = P.sun;
    const sg = g.createRadialGradient(sx, sy, 3, sx, sy, sr * 7);
    sg.addColorStop(0, `rgba(255,214,140,${0.6 * sa})`);
    sg.addColorStop(0.3, `rgba(255,160,110,${0.3 * sa})`);
    sg.addColorStop(1, 'rgba(255,160,110,0)');
    g.fillStyle = sg; g.fillRect(sx - sr * 8, sy - sr * 8, sr * 16, sr * 16);
    g.fillStyle = `rgba(255,236,196,${sa})`;
    g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(90,26,120,0.5)';
    for (let i = 0; i < 4; i++) g.fillRect(sx - 40 - i * 12, sy - 7 + i * 7, 80 + i * 24, 2 + i);
  }
  // composed NYC skyline — clean grids, landmark spires, and the bridge
  const grid = (bx, by, bw, bh, cols, rows) => {
    g.fillStyle = P.skyC;
    g.fillRect(bx, by - bh, bw, bh + 60);
    const cw = bw / cols, chh = bh / rows;
    for (let r2 = 0; r2 < rows; r2++) {
      for (let k2 = 0; k2 < cols; k2++) {
        if (((r2 * 31 + k2 * 17 + bx) % 97) / 97 < P.winR) {
          g.fillStyle = `rgba(${P.winC},0.5)`;
          g.fillRect(bx + k2 * cw + 2, by - bh + r2 * chh + 2, Math.max(2, cw - 4), Math.max(2, chh - 4));
        }
      }
    }
  };
  const spireEmpire = (bx) => {
    grid(bx, 452, 84, 92, 7, 11);
    grid(bx + 14, 360, 56, 46, 5, 6);
    grid(bx + 28, 314, 28, 26, 3, 3);
    g.fillStyle = P.skyC;
    g.fillRect(bx + 39, 268, 6, 22);
    g.fillStyle = `rgba(${P.winC},0.9)`;
    g.fillRect(bx + 40, 262, 4, 6);
  };
  const spireChrysler = (bx) => {
    grid(bx, 452, 72, 96, 6, 12);
    g.fillStyle = P.skyC;
    for (let a2 = 0; a2 < 5; a2++) g.fillRect(bx + 8 + a2 * 6, 356 - a2 * 14, 56 - a2 * 12, 16);
    g.fillRect(bx + 33, 282, 6, 18);
    g.fillStyle = `rgba(${P.winC},0.8)`;
    for (let a2 = 0; a2 < 4; a2++) g.fillRect(bx + 14 + a2 * 6, 352 - a2 * 14, 3, 3);
  };
  const bridge = (bx, bw2) => {
    const deckY = 430, towH = 96;
    g.fillStyle = P.skyC;
    g.fillRect(bx, deckY, bw2, 7);
    for (const tx2 of [bx + bw2 * 0.24, bx + bw2 * 0.76]) {
      g.fillRect(tx2 - 5, deckY - towH, 10, towH + 30);
      g.fillRect(tx2 - 9, deckY - towH + 18, 18, 8);
      g.fillStyle = P.stops[0];
      g.fillRect(tx2 - 3, deckY - towH + 30, 6, 12);
      g.fillStyle = P.skyC;
    }
    g.strokeStyle = P.skyC;
    g.lineWidth = 2.5;
    const t1 = bx + bw2 * 0.24, t2 = bx + bw2 * 0.76, topY = deckY - towH + 4;
    g.beginPath(); g.moveTo(bx, deckY); g.quadraticCurveTo((bx + t1) / 2, deckY - 8, t1, topY); g.stroke();
    g.beginPath(); g.moveTo(t1, topY); g.quadraticCurveTo((t1 + t2) / 2, deckY + 14, t2, topY); g.stroke();
    g.beginPath(); g.moveTo(t2, topY); g.quadraticCurveTo((t2 + bx + bw2) / 2, deckY - 8, bx + bw2, deckY); g.stroke();
    // necklace lights along the cables
    g.fillStyle = `rgba(${P.winC},0.95)`;
    for (let i2 = 0; i2 <= 22; i2++) {
      const k2 = i2 / 22;
      let lx, ly;
      if (k2 < 0.24) { const f2 = k2 / 0.24; lx = bx + (t1 - bx) * f2; ly = deckY + (topY - deckY) * f2 * f2 - 6 * f2 * (1 - f2); }
      else if (k2 < 0.76) { const f2 = (k2 - 0.24) / 0.52; lx = t1 + (t2 - t1) * f2; ly = topY + (deckY + 12 - topY) * (4 * f2 * (1 - f2)); }
      else { const f2 = (k2 - 0.76) / 0.24; lx = t2 + (bx + bw2 - t2) * f2; ly = topY + (deckY - topY) * f2 * f2; }
      g.fillRect(lx - 1, ly - 1, 2.4, 2.4);
    }
  };
  // rhythm of flat towers, tallest center, mirrored heights
  const seq = [46, 72, 58, 88, 64, 96, 64, 88, 58, 72, 46];
  let bx2 = 20;
  const slots = [];
  for (let i2 = 0; i2 < 26; i2++) {
    const h2 = seq[i2 % seq.length];
    const w2 = 58;
    slots.push([bx2, h2]);
    bx2 += w2 + 14;
  }
  for (const [sx2, h2] of slots) {
    if (sx2 > 330 && sx2 < 760) continue;   // hero window: the bridge lives here
    if (sx2 > 1040 && sx2 < 1140) continue; // Empire slot
    if (sx2 > 1560 && sx2 < 1650) continue; // Chrysler slot
    grid(sx2, 452, 58, h2, 5, Math.max(3, Math.round(h2 / 9)));
  }
  bridge(340, 430);
  spireEmpire(1048);
  spireChrysler(1568);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const SKY_ORDER = ['dawn', 'day', 'golden', 'night'];
const skyTex = { golden: skyTexture('golden'), night: skyTexture('night') };
const lazySkies = () => { if (!skyTex.dawn) { skyTex.dawn = skyTexture('dawn'); skyTex.day = skyTexture('day'); } };
if ('requestIdleCallback' in window) requestIdleCallback(lazySkies); else setTimeout(lazySkies, 1500);

function skyPhaseIdx(t) {
  if (t < 0.13 || t >= 0.98) return 0;
  if (t < 0.45) return 1;
  if (t < 0.62) return 2;
  return 3;
}
function skyBlend(t) {
  const edges = [0.13, 0.45, 0.62, 0.98];
  const W = 0.05;
  const i = skyPhaseIdx(t);
  for (let e = 0; e < edges.length; e++) {
    const d = t - edges[e];
    if (d >= -W && d < 0) return [i, (i + 1) % 4, (d + W) / W];
  }
  return [i, (i + 1) % 4, 0];
}

/* ================= shared textures ================= */

function gridTexture() {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 1408;
  const g = c.getContext('2d');
  const X = (wx) => (wx + 13) / 26 * 2048;
  const Y = (wz) => (wz + 9) / 18 * 1408;
  const W = (wu) => wu / 26 * 2048;
  const H = (wu) => wu / 18 * 1408;

  // parcels base
  g.fillStyle = '#1c0e38'; g.fillRect(0, 0, 2048, 1408);
  g.strokeStyle = 'rgba(122,84,214,0.22)'; g.lineWidth = 1;
  for (let u = -13; u <= 13; u++) { g.beginPath(); g.moveTo(X(u), 0); g.lineTo(X(u), 1408); g.stroke(); }
  for (let u = -9; u <= 9; u++) { g.beginPath(); g.moveTo(0, Y(u)); g.lineTo(2048, Y(u)); g.stroke(); }

  // sidewalks: paving + expansion joints
  const paveBand = (z0, z1) => {
    g.fillStyle = '#2a1854';
    g.fillRect(0, Y(z0), 2048, Y(z1) - Y(z0));
    g.strokeStyle = 'rgba(8,4,20,0.5)'; g.lineWidth = 2;
    for (let u = -13; u <= 13; u += 1) { g.beginPath(); g.moveTo(X(u), Y(z0)); g.lineTo(X(u), Y(z1)); g.stroke(); }
  };
  paveBand(3.0, 5.65);   // back-of-shops walk
  paveBand(5.65, 9);     // front promenade
  paveBand(-5.9, -4.6);  // back-avenue north walk
  paveBand(-9, -7.6);    // south edge walk

  // streets: asphalt
  const aveFill = '#120822';
  g.fillStyle = aveFill;
  g.fillRect(0, Y(0.9), 2048, H(2.1));
  g.fillRect(0, Y(-7.6), 2048, H(1.7));
  g.fillRect(X(3.3), 0, W(1.8), 1408);
  g.fillRect(X(-7.0), 0, W(1.8), 1408);

  // lane dashes (skip intersections)
  const dashRow = (wz) => {
    g.fillStyle = 'rgba(51,230,255,0.45)';
    for (let px = 0; px < 2048; px += 46) {
      const wx = px / 2048 * 26 - 13;
      if ((wx > -7.4 && wx < -4.8) || (wx > 2.9 && wx < 5.5)) continue;
      g.fillRect(px, Y(wz) - 2, 26, 4);
    }
  };
  const dashCol = (wx) => {
    g.fillStyle = 'rgba(51,230,255,0.45)';
    for (let py = 0; py < 1408; py += 46) {
      const wz = py / 1408 * 18 - 9;
      if ((wz > 0.5 && wz < 3.4) || (wz > -8.0 && wz < -5.5)) continue;
      g.fillRect(X(wx) - 2, py, 4, 26);
    }
  };
  dashRow(1.95); dashRow(-6.75);
  dashCol(4.2); dashCol(-6.1);

  // curbs
  g.fillStyle = 'rgba(240,240,255,0.4)';
  for (const wz of [0.9, 3.0, -5.9, -7.6]) g.fillRect(0, Y(wz) - 1.5, 2048, 3);
  for (const wx of [3.3, 5.1, -7.0, -5.2]) g.fillRect(X(wx) - 1.5, 0, 3, 1408);

  // crosswalks + stop lines at all four corners
  const zebraV = (wx, wz0, wz1) => {
    g.fillStyle = 'rgba(240,240,255,0.75)';
    for (let i = 0; i < 6; i++) g.fillRect(X(wx) - 34 + i * 12.5, Y(wz0) + 5, 7, Y(wz1) - Y(wz0) - 10);
  };
  const zebraH = (wz, wx0, wx1) => {
    g.fillStyle = 'rgba(240,240,255,0.75)';
    for (let i = 0; i < 6; i++) g.fillRect(X(wx0) + 5, Y(wz) - 30 + i * 11, X(wx1) - X(wx0) - 10, 6);
  };
  for (const ix of [-6.1, 4.2]) {
    zebraV(ix, 0.9, 3.0);
    zebraV(ix, -7.6, -5.9);
  }
  zebraH(1.95, 3.3, 5.1); zebraH(1.95, -7.0, -5.2);
  zebraH(-6.75, 3.3, 5.1); zebraH(-6.75, -7.0, -5.2);
  g.fillStyle = 'rgba(240,240,255,0.85)';
  for (const ix of [-6.1, 4.2]) {
    g.fillRect(X(ix - 1.6) - 2, Y(0.9), 4, H(2.1));
    g.fillRect(X(ix + 1.6) - 2, Y(-7.6), 4, H(1.7));
  }

  // plaza: circular paving, concentric rings
  const px2 = X(9.4), py2 = Y(7.3), pr = W(1.9);
  g.fillStyle = '#241245';
  g.beginPath(); g.arc(px2, py2, pr, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(51,230,255,0.35)'; g.lineWidth = 3;
  for (const rr of [0.35, 0.65, 0.95]) { g.beginPath(); g.arc(px2, py2, pr * rr, 0, Math.PI * 2); g.stroke(); }
  g.strokeStyle = 'rgba(51,230,255,0.18)';
  for (let a2 = 0; a2 < 12; a2++) {
    g.beginPath(); g.moveTo(px2, py2);
    g.lineTo(px2 + Math.cos(a2 / 12 * Math.PI * 2) * pr, py2 + Math.sin(a2 / 12 * Math.PI * 2) * pr);
    g.stroke();
  }

  // pocket park
  g.fillStyle = '#0f2e1c';
  g.fillRect(X(-12.6), Y(-1.6), W(3.8), H(2.2));
  g.strokeStyle = 'rgba(157,255,62,0.4)'; g.lineWidth = 3;
  g.strokeRect(X(-12.6), Y(-1.6), W(3.8), H(2.2));
  g.fillStyle = 'rgba(240,240,255,0.15)';
  g.fillRect(X(-12.6), Y(-0.65), W(3.8), H(0.35));
  g.fillRect(X(-10.9), Y(-1.6), W(0.35), H(2.2));

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function windowsTexture(accent, density) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000000'; g.fillRect(0, 0, 128, 256);
  const col = new THREE.Color(accent);
  const cols = 6, rows = 16, cw = 128 / cols, ch = 256 / rows;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      if (rng() > density) continue;
      const hot = rng() < 0.22;
      g.fillStyle = hot ? 'rgba(255,255,255,0.98)' : `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${rand(0.35, 0.8).toFixed(2)})`;
      g.fillRect(k * cw + 3, r * ch + 3, cw - 6, ch - 7);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

function signTexture(text, accent, opts = {}) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 144;
  const g = c.getContext('2d');
  g.fillStyle = opts.bg || '#14082c'; g.fillRect(0, 0, 384, 144);
  g.strokeStyle = accent;
  g.lineWidth = 7;
  g.shadowColor = accent;
  g.shadowBlur = opts.dim ? 4 : 16;
  g.globalAlpha = opts.dim ? 0.4 : 1;
  g.strokeRect(12, 12, 360, 120);
  g.font = `800 ${opts.size || 66}px "Barlow Condensed", Arial, sans-serif`;
  g.textBaseline = 'middle';
  g.shadowBlur = opts.dim ? 6 : 26;
  if (opts.perLetter != null) {
    const chars = text.split('');
    g.textAlign = 'left';
    const totalW = g.measureText(text).width;
    let cx = 192 - totalW / 2;
    chars.forEach((ch2, i) => {
      const w = g.measureText(ch2).width;
      g.fillStyle = i < opts.perLetter ? '#ffffff' : 'rgba(255,255,255,0.12)';
      g.shadowBlur = i < opts.perLetter ? 26 : 0;
      g.fillText(ch2, cx, 78);
      cx += w;
    });
  } else {
    g.textAlign = 'center';
    g.fillStyle = opts.dim ? 'rgba(255,255,255,0.5)' : '#ffffff';
    g.fillText(text, 192, 78);
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function beaconTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,0.95)';
  g.lineWidth = 6;
  g.shadowColor = 'rgba(255,255,255,0.9)';
  g.shadowBlur = 12;
  g.beginPath(); g.arc(64, 64, 40, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,1)';
  g.beginPath(); g.arc(64, 64, 14, 0, Math.PI * 2); g.fill();
  return new THREE.CanvasTexture(c);
}

function orbTexture(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(32, 32, 2, 32, 32, 32);
  rg.addColorStop(0, '#ffffff');
  rg.addColorStop(0.3, color);
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const softDot = orbTexture('rgba(255,240,220,1)');

/* ================= scene graph ================= */

const rotGroup = new THREE.Group();
rotGroup.rotation.y = -0.32;
scene.add(rotGroup);

const SLAB_W = 26, SLAB_D = 18;
const pulseTargets = [];
const edgeMats = [];
const signMats = [];
const builders = [];
const orbSprites = [];
const treeCanopies = [];
const ripples = [];
const textRedraws = [];

/* -- slab + floor -- */
{
  const gridTex = gridTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#2a1650', map: gridTex, emissive: '#ffffff', emissiveMap: gridTex,
    emissiveIntensity: 0.72, roughness: 0.65, metalness: 0.15,
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, 0.3, SLAB_D), floorMat);
  floor.position.y = -0.15;
  rotGroup.add(floor);
  pulseTargets.push({ mat: floorMat, base: 0.72, speed: 0.7, phase: 0, kind: 'grid' });

  const under = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, 1.1, SLAB_D), new THREE.MeshStandardMaterial({ color: '#170b30', roughness: 1 }));
  under.position.y = -0.86;
  rotGroup.add(under);

  const rimMat = new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 1 });
  edgeMats.push(rimMat);
  const mk = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), rimMat);
    m.position.set(x, -0.02, z);
    rotGroup.add(m);
  };
  mk(SLAB_W + 0.08, 0.1, 0, SLAB_D / 2 + 0.02);
  mk(SLAB_W + 0.08, 0.1, 0, -SLAB_D / 2 - 0.02);
  mk(0.1, SLAB_D + 0.08, SLAB_W / 2 + 0.02, 0);
  mk(0.1, SLAB_D + 0.08, -SLAB_W / 2 - 0.02, 0);
}

/* -- neon building factory -- */
function neonBuilding({ w, h, d, x, z, accent, density = 0.5, order = 1, ry = 0 }) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: '#2b1a52', roughness: 0.55, metalness: 0.25 }));
  body.position.y = h / 2;
  g.add(body);
  const winTex = windowsTexture(accent, density);
  const winMat = new THREE.MeshStandardMaterial({ color: '#1c0f3a', emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: rand(1.15, 1.6), roughness: 0.4, metalness: 0.3 });
  for (const [fx, fz, fry] of [[0, d / 2 + 0.012, 0], [0, -d / 2 - 0.012, Math.PI], [w / 2 + 0.012, 0, Math.PI / 2], [-w / 2 - 0.012, 0, -Math.PI / 2]]) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(fry) === Math.PI / 2 ? d * 0.92 : w * 0.92, h * 0.94), winMat);
    plane.position.set(fx, h / 2, fz);
    plane.rotation.y = fry;
    g.add(plane);
  }
  const eMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.95 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), eMat);
  edges.position.y = h / 2;
  g.add(edges);
  edgeMats.push(eMat);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.08, d * 0.4), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.85 }));
  roof.position.y = h + 0.04;
  g.add(roof);
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  rotGroup.add(g);
  pulseTargets.push({ mat: winMat, base: winMat.emissiveIntensity, speed: rand(0.5, 1.1), phase: rand(0, 6.28), kind: 'win' });
  builders.push({ group: g, order });
  return g;
}

/* -- storefront strip + renovation unit -- */
const SHOPS = [
  { name: 'PIZZA', accent: ACCENTS.coral },
  { name: 'BODEGA', accent: ACCENTS.lime },
  { name: 'CUTS', accent: ACCENTS.cyan },
  { name: 'NAILS', accent: ACCENTS.magenta },
  { name: 'CAFÉ', accent: ACCENTS.amber },
  { name: 'TACOS', accent: ACCENTS.violet, renovation: true },
];

const STRIP_X0 = -9.6, UNIT_W = 2.35;
const shopDoors = [];
let renoRefs = null;

SHOPS.forEach((shop, i) => {
  const g = new THREE.Group();
  const h = shop.renovation ? 2.6 : rand(2.3, 2.9);
  const bodyMat = new THREE.MeshStandardMaterial({ color: shop.renovation ? '#221639' : '#2e1c56', roughness: 0.6, metalness: 0.2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(UNIT_W - 0.14, h, 3.1), bodyMat);
  body.position.y = h / 2;
  g.add(body);
  const eMat = new THREE.LineBasicMaterial({ color: shop.accent, transparent: true, opacity: shop.renovation ? 0.18 : 0.95 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(UNIT_W - 0.14, h, 3.1)), eMat);
  edges.position.y = h / 2;
  g.add(edges);
  edgeMats.push(eMat);
  const frontMat = new THREE.MeshBasicMaterial({ color: shop.accent, transparent: true, opacity: shop.renovation ? 0 : 0.4 });
  const front = new THREE.Mesh(new THREE.PlaneGeometry(UNIT_W - 0.5, 0.72), frontMat);
  front.position.set(0, 0.62, 1.57);
  g.add(front);
  const doorMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: shop.renovation ? 0.06 : 0.55 });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.15), doorMat);
  door.position.set(UNIT_W / 2 - 0.62, 0.58, 1.571);
  g.add(door);
  const awn = new THREE.Mesh(new THREE.BoxGeometry(UNIT_W - 0.3, 0.06, 0.7), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.8 }));
  awn.position.set(0, 1.32, 1.85);
  awn.rotation.x = 0.18;
  g.add(awn);
  const awnEdgeMat = new THREE.MeshBasicMaterial({ color: shop.accent, transparent: true, opacity: shop.renovation ? 0.1 : 1 });
  const awnEdge = new THREE.Mesh(new THREE.BoxGeometry(UNIT_W - 0.3, 0.045, 0.05), awnEdgeMat);
  awnEdge.position.set(0, 1.27, 2.2);
  g.add(awnEdge);
  const startTex = shop.renovation ? signTexture('FOR LEASE', '#8a8aa0', { dim: true, size: 46 }) : signTexture(shop.name, shop.accent);
  const signMat = new THREE.MeshBasicMaterial({ map: startTex, transparent: true });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.64), signMat);
  sign.position.set(0, h + 0.42, 1.35);
  g.add(sign);
  const signBack = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.72, 0.1), new THREE.MeshStandardMaterial({ color: '#180c30', roughness: 0.7 }));
  signBack.position.set(0, h + 0.42, 1.28);
  g.add(signBack);
  const rec = { mat: signMat, t: rand(3, 10), busy: 0, dead: !!shop.renovation };
  signMats.push(rec);
  const ac = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.5), new THREE.MeshStandardMaterial({ color: '#3a2766', roughness: 0.8 }));
  ac.position.set(rand(-0.5, 0.5), h + 0.16, rand(-0.7, 0.3));
  g.add(ac);

  const gx = STRIP_X0 + i * UNIT_W;
  g.position.set(gx, 0, 4.1);
  rotGroup.add(g);
  builders.push({ group: g, order: 0 });
  shopDoors.push(new THREE.Vector3(gx + UNIT_W / 2 - 0.62, 0.16, 5.75));

  if (shop.renovation) {
    const scafMat = new THREE.LineBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0 });
    const scaf = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(UNIT_W + 0.3, h + 0.7, 3.5, 2, 3, 2)), scafMat);
    scaf.position.y = (h + 0.7) / 2;
    scaf.scale.y = 0.001;
    g.add(scaf);
    renoRefs = { group: g, bodyMat, edge: eMat, front: frontMat, doorMat, awnEdge: awnEdgeMat, sign: signMat, signRec: rec, scaf, scafMat, accent: shop.accent, h };
  }
});

/* -- mid-rises + tower -- */
neonBuilding({ w: 4.4, h: 6.8, d: 4.2, x: -8.6, z: -3.6, accent: ACCENTS.violet, density: 0.55, order: 2, ry: 0.04 });
neonBuilding({ w: 3.4, h: 9.4, d: 3.4, x: -3.2, z: -4.6, accent: ACCENTS.cyan, density: 0.5, order: 3, ry: -0.03 });
neonBuilding({ w: 3.8, h: 5.2, d: 3.6, x: 1.6, z: -3.8, accent: ACCENTS.amber, density: 0.6, order: 2 });

let crownMat, crownLight;
const TOWER_POS = new THREE.Vector3(7.6, 0, -3.2);
{
  const accent = ACCENTS.magenta;
  const tower = new THREE.Group();
  const tiers = [
    { w: 5.2, h: 7.5, d: 5.0, y: 0 },
    { w: 4.0, h: 4.6, d: 3.9, y: 7.5 },
    { w: 2.8, h: 3.4, d: 2.7, y: 12.1 },
  ];
  for (const tier of tiers) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.d), new THREE.MeshStandardMaterial({ color: '#301c5e', roughness: 0.5, metalness: 0.3 }));
    body.position.y = tier.y + tier.h / 2;
    tower.add(body);
    const winTex = windowsTexture(accent, 0.52);
    const winMat = new THREE.MeshStandardMaterial({ color: '#1c0f3a', emissive: '#ffffff', emissiveMap: winTex, emissiveIntensity: 1.35, roughness: 0.4, metalness: 0.3 });
    for (const [fx, fz, fry] of [[0, tier.d / 2 + 0.012, 0], [0, -tier.d / 2 - 0.012, Math.PI], [tier.w / 2 + 0.012, 0, Math.PI / 2], [-tier.w / 2 - 0.012, 0, -Math.PI / 2]]) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(fry) === Math.PI / 2 ? tier.d * 0.9 : tier.w * 0.9, tier.h * 0.92), winMat);
      plane.position.set(fx, tier.y + tier.h / 2, fz);
      plane.rotation.y = fry;
      tower.add(plane);
    }
    const eMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.95 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(tier.w, tier.h, tier.d)), eMat);
    edges.position.y = tier.y + tier.h / 2;
    tower.add(edges);
    edgeMats.push(eMat);
    pulseTargets.push({ mat: winMat, base: 1.35, speed: rand(0.5, 0.9), phase: rand(0, 6), kind: 'win' });
  }
  for (const sx of [-1.8, 1.8]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 7.2, 0.1), new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.9 }));
    strip.position.set(sx, 3.75, tiers[0].d / 2 + 0.08);
    tower.add(strip);
  }
  crownMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.95 });
  const crown = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.3, 3.0), crownMat);
  crown.position.y = 15.65;
  tower.add(crown);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  mast.position.y = 16.6;
  tower.add(mast);
  crownLight = new THREE.PointLight(accent, 6, 26, 2);
  crownLight.position.y = 15.8;
  tower.add(crownLight);
  tower.position.copy(TOWER_POS);
  tower.rotation.y = -0.06;
  rotGroup.add(tower);
  builders.push({ group: tower, order: 4 });
}

/* -- street poles + trees -- */
{
  const orbTexC = orbTexture(ACCENTS.cyan);
  const orbTexM = orbTexture(ACCENTS.magenta);
  const lampSpots = [];
  for (let li = 0; li < 5; li++) {
    const lx = -10.4 + li * 5.2;
    lampSpots.push([lx, 3.55, li % 2 === 0 ? orbTexC : orbTexM]);
    lampSpots.push([lx + 2.6, -5.55, li % 2 === 0 ? orbTexM : orbTexC]);
  }
  for (const [px, pz, tex] of lampSpots) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 8), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.6, metalness: 0.5 }));
    pole.position.y = 1.6;
    g.add(pole);
    const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false }));
    orb.scale.setScalar(0.9);
    orb.position.y = 3.35;
    g.add(orb);
    orbSprites.push(orb);
    g.position.set(px, 0, pz);
    rotGroup.add(g);
    builders.push({ group: g, order: 3 });
  }
  // real trees: displaced foliage clumps in lit tree pits
  const canopyDark = new THREE.MeshStandardMaterial({ color: '#2f7a55', roughness: 0.85 });
  const canopyLight = new THREE.MeshStandardMaterial({ color: '#46a86e', roughness: 0.8 });
  const foliageClump = (r) => {
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const pos = geo.attributes.position;
    const v3 = new THREE.Vector3();
    for (let vi = 0; vi < pos.count; vi++) {
      v3.fromBufferAttribute(pos, vi);
      v3.multiplyScalar(1 + (rng() - 0.5) * 0.4);
      pos.setXYZ(vi, v3.x, v3.y * (0.85 + rng() * 0.18), v3.z);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const mkTree = (tx2, tz2, s2 = 1) => {
    const g = new THREE.Group();
    const pit = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.03, 0.95), new THREE.MeshStandardMaterial({ color: '#0d0620', roughness: 1 }));
    pit.position.y = 0.015;
    g.add(pit);
    const rimMat = new THREE.LineBasicMaterial({ color: ACCENTS.lime, transparent: true, opacity: 0.45 });
    const rim2 = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.95, 0.03, 0.95)), rimMat);
    rim2.position.y = 0.03;
    g.add(rim2);
    edgeMats.push(rimMat);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * s2, 0.09 * s2, 1.25 * s2, 8), new THREE.MeshStandardMaterial({ color: '#33203f', roughness: 0.95 }));
    trunk.position.y = 0.62 * s2;
    g.add(trunk);
    const darkGeos = [], lightGeos = [];
    for (let ci = 0; ci < 6; ci++) {
      const geo = foliageClump(rand(0.34, 0.58) * s2);
      geo.translate(rand(-0.5, 0.5) * s2, 1.55 * s2 + rand(-0.15, 0.5) * s2, rand(-0.5, 0.5) * s2);
      (ci % 3 === 0 ? lightGeos : darkGeos).push(geo);
    }
    const canopy = new THREE.Group();
    canopy.add(new THREE.Mesh(mergeGeometries(darkGeos, false), canopyDark));
    canopy.add(new THREE.Mesh(mergeGeometries(lightGeos, false), canopyLight));
    g.add(canopy);
    treeCanopies.push(canopy);
    g.position.set(tx2, 0, tz2);
    rotGroup.add(g);
    builders.push({ group: g, order: 2 });
  };
  [[-11.7, 7.6], [-6.5, 7.6], [-1.3, 7.6], [11.9, 7.5, 0.9],
   [-9.4, 3.35, 0.85], [-0.2, 3.35, 0.85], [9.6, 3.35, 0.85],
   [-11.8, -0.9], [-9.6, 0.1, 0.9]].forEach(([tx2, tz2, s2]) => mkTree(tx2, tz2, s2 || 1));

  // flower planters between the storefronts
  const flowerColors = [ACCENTS.magenta, ACCENTS.amber, ACCENTS.coral, ACCENTS.lime];
  [[-8.42], [-6.07], [-3.72], [-1.37], [0.98]].forEach(([fx2], pi2) => {
    const g = new THREE.Group();
    const potMat = new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.8 });
    const pot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.34), potMat);
    pot.position.y = 0.15;
    g.add(pot);
    for (let fi = 0; fi < 3; fi++) {
      const bud = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture(flowerColors[(pi2 + fi) % flowerColors.length]), transparent: true, opacity: 0.9, depthWrite: false }));
      bud.scale.setScalar(0.16);
      bud.position.set(-0.14 + fi * 0.14, 0.4, 0);
      g.add(bud);
    }
    g.position.set(fx2, 0, 5.85);
    rotGroup.add(g);
    builders.push({ group: g, order: 1 });
  });

  // fountain plaza
  const fountain = new THREE.Group();
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.2, 0.3, 24), new THREE.MeshStandardMaterial({ color: '#1c0f3a', roughness: 0.6 }));
  basin.position.y = 0.15;
  fountain.add(basin);
  const waterMat = new THREE.MeshStandardMaterial({ color: '#0a2a3a', emissive: '#33e6ff', emissiveIntensity: 0.8, roughness: 0.2, metalness: 0.3 });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.06, 24), waterMat);
  water.position.y = 0.31;
  fountain.add(water);
  pulseTargets.push({ mat: waterMat, base: 0.8, speed: 1.4, phase: 2, kind: 'grid' });
  const basinRimMat = new THREE.LineBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.8 });
  const basinRim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(1.12, 1.12, 0.02, 24)), basinRimMat);
  basinRim.position.y = 0.31;
  fountain.add(basinRim);
  edgeMats.push(basinRimMat);
  for (let ri2 = 0; ri2 < 3; ri2++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.014, 6, 32), new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.35;
    fountain.add(ring);
    ripples.push({ ring, t: ri2 * 0.66 });
  }
  const jet = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture('#8af2ff'), transparent: true, opacity: 0.85, depthWrite: false }));
  jet.scale.setScalar(0.35);
  jet.position.y = 0.6;
  fountain.add(jet);
  ripples.jet = jet;
  fountain.position.set(9.4, 0, 7.3);
  rotGroup.add(fountain);
  builders.push({ group: fountain, order: 2 });

  // benches: plaza trio + park pair
  const mkBench = (bx2, bz2, ry2) => {
    const g = new THREE.Group();
    const seatMat = new THREE.MeshStandardMaterial({ color: '#180c30', roughness: 0.7 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.26), seatMat);
    seat.position.y = 0.3;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 0.05), seatMat);
    back.position.set(0, 0.5, -0.12);
    g.add(back);
    for (const lx2 of [-0.32, 0.32]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.2), seatMat);
      leg.position.set(lx2, 0.15, 0);
      g.add(leg);
    }
    const glowLine = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.015, 0.02), new THREE.MeshBasicMaterial({ color: ACCENTS.violet, transparent: true, opacity: 0.7 }));
    glowLine.position.set(0, 0.34, 0.13);
    g.add(glowLine);
    g.position.set(bx2, 0, bz2);
    g.rotation.y = ry2;
    rotGroup.add(g);
    builders.push({ group: g, order: 1 });
  };
  mkBench(8.0, 8.35, 2.4); mkBench(10.8, 8.35, -2.4); mkBench(9.4, 5.95, 0);
  mkBench(-11.6, -0.15, Math.PI / 2); mkBench(-9.8, -0.6, -Math.PI / 2);

  // string lights across the pocket park
  {
    const bulbCols = [ACCENTS.magenta, ACCENTS.amber, ACCENTS.cyan, ACCENTS.lime];
    const p0 = new THREE.Vector3(-12.3, 1.7, -1.45);
    const p1 = new THREE.Vector3(-9.0, 1.7, 0.45);
    for (const pp of [p0, p1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.7, 6), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.7 }));
      pole.position.set(pp.x, 0.85, pp.z);
      rotGroup.add(pole);
      builders.push({ group: pole, order: 1 });
    }
    for (let bi = 0; bi <= 13; bi++) {
      const k2 = bi / 13;
      const bp = p0.clone().lerp(p1, k2);
      bp.y = 1.7 - Math.sin(Math.PI * k2) * 0.4;
      const bulb = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture(bulbCols[bi % 4]), transparent: true, opacity: 0.9, depthWrite: false }));
      bulb.scale.setScalar(0.14);
      bulb.position.copy(bp);
      rotGroup.add(bulb);
      orbSprites.push(bulb);
    }
  }
}

/* -- NYC props -- *//* -- NYC props -- */
const steamPuffs = [];
let billboardBorder = null;
{
  // subway entrance: green rails, dark stair ramp, MTA globe
  const sub = new THREE.Group();
  const railMat = new THREE.MeshBasicMaterial({ color: '#2fbf71', transparent: true, opacity: 0.9 });
  for (const rz of [-0.42, 0.42]) {
    sub.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.05, 0.05), railMat)).children;
    const rail = sub.children[sub.children.length - 1];
    rail.position.set(0, 0.62, rz);
    for (let p = 0; p < 4; p++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.04), railMat);
      post.position.set(-0.78 + p * 0.52, 0.31, rz);
      sub.add(post);
    }
  }
  const ramp = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ color: '#07040f' }));
  ramp.rotation.x = -Math.PI / 2 + 0.5;
  ramp.position.set(0, 0.28, 0);
  sub.add(ramp);
  const globe = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture('#2fbf71'), transparent: true, opacity: 0.95, depthWrite: false }));
  globe.scale.setScalar(0.5);
  globe.position.set(-1.05, 1.15, 0);
  sub.add(globe);
  const gPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), new THREE.MeshStandardMaterial({ color: '#143a28', roughness: 0.6 }));
  gPole.position.set(-1.05, 0.5, 0);
  sub.add(gPole);
  sub.position.set(7.4, 0, 3.85);
  rotGroup.add(sub);
  builders.push({ group: sub, order: 2 });

  // rooftop water towers (a Build-01 callback)
  const waterTower = (bx, by, bz, accent) => {
    const wt = new THREE.Group();
    for (const [lx, lz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), new THREE.MeshStandardMaterial({ color: '#1c1240', roughness: 0.7 }));
      leg.position.set(lx, 0.2, lz);
      wt.add(leg);
    }
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.62, 16), new THREE.MeshStandardMaterial({ color: '#241a4a', roughness: 0.7, metalness: 0.2 }));
    tank.position.y = 0.71;
    wt.add(tank);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.3, 16), new THREE.MeshStandardMaterial({ color: '#180f33', roughness: 0.8 }));
    cone.position.y = 1.17;
    wt.add(cone);
    const ringMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.85 });
    const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.345, 0.345, 0.02, 16)), ringMat);
    ring.position.y = 0.86;
    wt.add(ring);
    edgeMats.push(ringMat);
    wt.position.set(bx, by, bz);
    rotGroup.add(wt);
    builders.push({ group: wt, order: 3 });
  };
  waterTower(-9.5, 6.84, -4.4, ACCENTS.violet);
  waterTower(2.5, 5.24, -4.5, ACCENTS.amber);

  // steam grate
  const grate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 0.5), new THREE.MeshStandardMaterial({ color: '#120a28', roughness: 0.9 }));
  grate.position.set(0.6, 0.02, 3.6);
  rotGroup.add(grate);
  const steamTex = orbTexture('rgba(214,214,255,1)');
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false }));
    sp.position.set(0.6, 0.1, 3.6);
    rotGroup.add(sp);
    steamPuffs.push({ sp, t: i * 1.1, dur: rand(3.2, 4.2) });
  }

  // newsstand
  const stand = new THREE.Group();
  const sBody = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.0, 0.85), new THREE.MeshStandardMaterial({ color: '#241a4a', roughness: 0.7 }));
  sBody.position.y = 0.5;
  stand.add(sBody);
  const sFront = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.55), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.85 }));
  sFront.position.set(0, 0.55, 0.43);
  stand.add(sFront);
  const sEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.15, 1.0, 0.85)), new THREE.LineBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.8 }));
  sEdge.position.y = 0.5;
  stand.add(sEdge);
  stand.position.set(-3.3, 0, 3.9);
  stand.rotation.y = Math.PI;
  rotGroup.add(stand);
  builders.push({ group: stand, order: 2 });

  // tower billboard — measured so nothing ever clips
  const drawBillboard = () => {
    const cnv2 = document.createElement('canvas');
    cnv2.width = 768; cnv2.height = 384;
    const bg2 = cnv2.getContext('2d');
    bg2.fillStyle = '#12082a'; bg2.fillRect(0, 0, 768, 384);
    bg2.textAlign = 'center'; bg2.textBaseline = 'middle';
    const fitText = (txt, weight, maxSize, maxW, y2, glow) => {
      let size = maxSize;
      bg2.font = `${weight} ${size}px "Barlow Condensed", Arial, sans-serif`;
      while (bg2.measureText(txt).width > maxW && size > 20) {
        size -= 2;
        bg2.font = `${weight} ${size}px "Barlow Condensed", Arial, sans-serif`;
      }
      bg2.shadowColor = glow; bg2.shadowBlur = 34;
      bg2.fillStyle = '#ffffff';
      bg2.fillText(txt, 384, y2);
    };
    fitText('LITTLE FIGHT', 800, 132, 660, 152, '#ff3ec8');
    fitText('NEW YORK · NEW YORK', 700, 62, 620, 282, '#33e6ff');
    const t2 = new THREE.CanvasTexture(cnv2);
    t2.colorSpace = THREE.SRGBColorSpace;
    return t2;
  };
  const bbTex = drawBillboard();
  const bbMat = new THREE.MeshBasicMaterial({ map: bbTex, transparent: true });
  const bb = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 1.62), bbMat);
  textRedraws.push(() => { bbMat.map = drawBillboard(); bbMat.needsUpdate = true; });
  bb.position.set(7.45, 5.35, -0.63);
  rotGroup.add(bb);
  billboardBorder = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.28, 1.74)), new THREE.LineBasicMaterial({ color: ACCENTS.magenta, transparent: true, opacity: 0.95 }));
  billboardBorder.position.copy(bb.position);
  billboardBorder.position.z += 0.001;
  rotGroup.add(billboardBorder);

  // street name signs at both intersections
  const nameSign = (text, x, z, ry) => {
    const cnv = document.createElement('canvas');
    cnv.width = 192; cnv.height = 48;
    const gg = cnv.getContext('2d');
    gg.fillStyle = '#0b6b3a'; gg.fillRect(0, 0, 192, 48);
    gg.strokeStyle = '#ffffff'; gg.lineWidth = 3; gg.strokeRect(3, 3, 186, 42);
    gg.font = '700 26px "Barlow Condensed", Arial, sans-serif';
    gg.textAlign = 'center'; gg.textBaseline = 'middle';
    gg.fillStyle = '#ffffff';
    gg.fillText(text, 96, 26);
    const tx3 = new THREE.CanvasTexture(cnv);
    tx3.colorSpace = THREE.SRGBColorSpace;
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), new THREE.MeshBasicMaterial({ map: tx3, transparent: true, side: THREE.DoubleSide }));
    blade.position.set(x, 2.35, z);
    blade.rotation.y = ry;
    rotGroup.add(blade);
  };
  nameSign('SIGNAL AVE', 2.65, 3.62, 0);
  nameSign('LF ST', 2.42, 3.4, Math.PI / 2);
  nameSign('SIGNAL AVE', -7.65, 3.62, 0);
  nameSign('GRID ST', -7.42, 3.4, Math.PI / 2);

  // fire escapes on the mid-rise fronts
  const fireEscape = (bx, bz, w2, h2, floors, accent) => {
    const pts = [];
    const fh = h2 / floors;
    for (let f2 = 1; f2 < floors; f2++) {
      const y2 = f2 * fh;
      const dir2 = f2 % 2 === 0 ? 1 : -1;
      pts.push(new THREE.Vector3(-w2 / 2 + 0.25, y2, 0), new THREE.Vector3(w2 / 2 - 0.25, y2, 0));
      pts.push(new THREE.Vector3(dir2 * (w2 / 2 - 0.3), y2, 0), new THREE.Vector3(-dir2 * (w2 / 2 - 0.3), y2 + fh, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat2 = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.5 });
    const fe = new THREE.LineSegments(geo, mat2);
    fe.position.set(bx, 0, bz);
    rotGroup.add(fe);
    edgeMats.push(mat2);
  };
  fireEscape(-8.6, -1.47, 4.0, 6.4, 5, ACCENTS.violet);
  fireEscape(1.6, -1.97, 3.4, 4.9, 4, ACCENTS.amber);
}

function steamStep(dt) {
  for (const p of steamPuffs) {
    p.t += dt;
    if (p.t > p.dur) { p.t = 0; p.dur = rand(3.2, 4.2); }
    const k = p.t / p.dur;
    p.sp.position.set(0.6 + Math.sin(p.t * 2.2) * 0.08 + k * 0.25, 0.15 + k * 1.5, 3.6);
    p.sp.scale.setScalar(0.3 + k * 1.0);
    p.sp.material.opacity = Math.sin(Math.PI * k) * 0.16;
  }
}

/* -- traffic signal -- */
const signal = { t: 0, EW: 9, NS: 7, RED: 1.2, state: 'EW' };
let sigA = null, sigB = null;
const sigPosts = [];
{
  const mkPost = (x, z, ry) => {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.9, 6), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.6, metalness: 0.5 }));
    pole.position.y = 0.95;
    g.add(pole);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.12), new THREE.MeshStandardMaterial({ color: '#140a28', roughness: 0.7 }));
    box.position.y = 1.95;
    g.add(box);
    const mTop = new THREE.MeshBasicMaterial({ color: '#39ff8a' });
    const mBot = new THREE.MeshBasicMaterial({ color: '#ff4a4a' });
    const d1 = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10), mTop);
    d1.position.set(0, 2.03, 0.065);
    const d2 = new THREE.Mesh(new THREE.CircleGeometry(0.045, 10), mBot);
    d2.position.set(0, 1.87, 0.065);
    g.add(d1, d2);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    rotGroup.add(g);
    builders.push({ group: g, order: 3 });
    return { top: mTop, bot: mBot };
  };
  sigA = mkPost(2.65, 3.4, 0.35);
  sigB = mkPost(5.75, 0.5, Math.PI + 0.35);
  sigPosts.push(mkPost(-7.65, 3.4, -0.35), mkPost(-4.55, 0.5, Math.PI - 0.35), mkPost(2.65, -5.85, 0.35), mkPost(-7.65, -5.85, -0.35));
}

function signalStep(dt) {
  signal.t += dt;
  const cycle = signal.EW + signal.RED + signal.NS + signal.RED;
  const tt = signal.t % cycle;
  if (tt < signal.EW) signal.state = 'EW';
  else if (tt < signal.EW + signal.RED) signal.state = 'RED1';
  else if (tt < signal.EW + signal.RED + signal.NS) signal.state = 'NS';
  else signal.state = 'RED2';
  const ewGo = signal.state === 'EW';
  const nsGo = signal.state === 'NS';
  if (sigA) {
    for (const p of [sigA, ...sigPosts.filter((x, i) => i % 2 === 0)]) {
      p.top.color.set(ewGo ? '#39ff8a' : '#183c28');
      p.bot.color.set(ewGo ? '#3c1418' : '#ff4a4a');
    }
    for (const p of [sigB, ...sigPosts.filter((x, i) => i % 2 === 1)]) {
      p.top.color.set(nsGo ? '#39ff8a' : '#183c28');
      p.bot.color.set(nsGo ? '#3c1418' : '#ff4a4a');
    }
  }
}

/* ================= agents ================= */

const agents = { cars: [], peds: [], courier: null };

function carMesh(color, cab = false) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.34), new THREE.MeshStandardMaterial({ color: cab ? '#e8b422' : '#181030', roughness: 0.5, metalness: 0.4 }));
  body.position.y = 0.14;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.28), new THREE.MeshStandardMaterial({ color: cab ? '#3a2f14' : '#241a4a', roughness: 0.4, metalness: 0.3 }));
  cabin.position.set(-0.04, 0.27, 0);
  const glow = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.02, 0.38), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 }));
  glow.position.y = 0.05;
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, transparent: true, opacity: 0.9, depthWrite: false }));
  head.scale.setScalar(0.42);
  head.position.set(0.42, 0.15, 0);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: '#ff2b4a' }));
  tail.position.set(-0.37, 0.15, 0);
  g.add(body, cabin, glow, head, tail);
  if (cab) {
    const topper = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.1), new THREE.MeshBasicMaterial({ color: '#fff2c2' }));
    topper.position.set(-0.02, 0.36, 0);
    g.add(topper);
  }
  g.userData.head = head;
  return g;
}

// NYC rules: avenues are one-way pairs, cross streets alternate one-way
const CAR_ROUTES = [
  { dir: 'EW', from: new THREE.Vector3(-14.5, 0, 2.4), to: new THREE.Vector3(14.5, 0, 2.4), stops: [-7.65, 2.65] },
  { dir: 'EW', from: new THREE.Vector3(-14.5, 0, 1.5), to: new THREE.Vector3(14.5, 0, 1.5), stops: [-7.65, 2.65] },
  { dir: 'EW', from: new THREE.Vector3(14.5, 0, -6.4), to: new THREE.Vector3(-14.5, 0, -6.4), stops: [5.75, -4.55] },
  { dir: 'EW', from: new THREE.Vector3(14.5, 0, -7.2), to: new THREE.Vector3(-14.5, 0, -7.2), stops: [5.75, -4.55] },
  { dir: 'NS', from: new THREE.Vector3(4.2, 0, 10), to: new THREE.Vector3(4.2, 0, -10), stops: [3.55, -5.35] },
  { dir: 'NS', from: new THREE.Vector3(-6.1, 0, -10), to: new THREE.Vector3(-6.1, 0, 10), stops: [-8.15, 0.35] },
];
for (const r of CAR_ROUTES) {
  r.len = r.from.distanceTo(r.to);
  const axis = Math.abs(r.to.x - r.from.x) > Math.abs(r.to.z - r.from.z) ? 'x' : 'z';
  const sign = axis === 'x' ? Math.sign(r.to.x - r.from.x) : Math.sign(r.to.z - r.from.z);
  r.axis = axis; r.sign = sign;
  r.stopAlongs = r.stops.map((sv) => axis === 'x'
    ? (sign > 0 ? sv - r.from.x : r.from.x - sv)
    : (sign > 0 ? sv - r.from.z : r.from.z - sv)).sort((a2, b2) => a2 - b2);
}

{
  const fleet = [
    { r: 0, cab: true }, { r: 1, cab: false }, { r: 0, cab: false },
    { r: 2, cab: true }, { r: 3, cab: false }, { r: 2, cab: false },
    { r: 4, cab: true }, { r: 5, cab: false },
  ];
  const carColors = [ACCENTS.cyan, ACCENTS.magenta, ACCENTS.violet, ACCENTS.lime, ACCENTS.coral];
  fleet.forEach((f, i) => {
    const route = CAR_ROUTES[f.r];
    const m = carMesh(f.cab ? '#ffb02e' : carColors[i % carColors.length], f.cab);
    m.rotation.y = route.axis === 'x' ? (route.sign > 0 ? 0 : Math.PI) : (route.sign > 0 ? -Math.PI / 2 : Math.PI / 2);
    rotGroup.add(m);
    agents.cars.push({ m, route, t: (i * 0.29 + rng() * 0.15) % 1, speed: rand(2.5, 3.3), v: 0 });
  });
}

{
  const parked = [
    [-11.8, 2.72, 0, false], [-9.2, 2.72, 0, true], [0.5, 2.72, 0, false], [10.6, 2.72, 0, false],
    [-2.0, -6.02, Math.PI, false], [7.2, -6.02, Math.PI, true],
  ];
  for (const [px3, pz3, ry3, isCab] of parked) {
    const m = carMesh(isCab ? '#ffb02e' : pick([ACCENTS.violet, ACCENTS.cyan, ACCENTS.magenta]), isCab);
    m.position.set(px3, 0.02, pz3);
    m.rotation.y = ry3;
    m.userData.head.material.opacity = 0.08;
    rotGroup.add(m);
    builders.push({ group: m, order: 2 });
  }
}

function carStep(a, dt) {
  const r = a.route;
  const posAlong = a.t * r.len;
  const go = (r.dir === 'EW' && signal.state === 'EW') || (r.dir === 'NS' && signal.state === 'NS');
  let targetV = a.speed;
  if (!go) {
    for (const sa of r.stopAlongs) {
      const distToStop = sa - posAlong;
      if (distToStop > 0 && distToStop < 2.2) {
        targetV = distToStop < 0.35 ? 0 : a.speed * (distToStop / 2.2);
        break;
      }
    }
  }
  for (const other of agents.cars) {
    if (other === a || other.route !== r) continue;
    const gap = (other.t - a.t) * r.len;
    if (gap > 0 && gap < 1.5) targetV = Math.min(targetV, Math.max(0, (gap - 0.9) * 2));
  }
  a.v += (targetV - a.v) * Math.min(1, dt * 4);
  a.t += (a.v * dt) / r.len;
  if (a.t > 1) a.t -= 1;
  a.m.position.copy(r.from).lerp(r.to, a.t);
  a.m.position.y = 0.02;
  const margin = r.axis === 'x'
    ? Math.min(a.m.position.x + 13.4, 13.4 - a.m.position.x)
    : Math.min(a.m.position.z + 9.2, 9.2 - a.m.position.z);
  const vis = THREE.MathUtils.clamp(margin / 1.2, 0, 1);
  a.m.visible = vis > 0.05;
  a.m.scale.setScalar(Math.max(0.001, vis));
}

/* -- pedestrians -- */
function pedMesh() {
  const g = new THREE.Group();
  const tint = pick(['#ffe9c8', '#ffd9f2', '#d9f2ff', '#e6ffd9']);
  const bodyM = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 8), new THREE.MeshBasicMaterial({ color: tint }));
  bodyM.position.y = 0.16;
  const headM = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: tint }));
  headM.position.y = 0.32;
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, transparent: true, opacity: 0.35, depthWrite: false }));
  glow.scale.setScalar(0.5);
  glow.position.y = 0.2;
  g.add(bodyM, headM, glow);
  return g;
}

const CURB_N = new THREE.Vector3(4.2, 0, 3.35);
const CURB_S = new THREE.Vector3(4.2, 0, 0.55);

{
  for (let i = 0; i < 14; i++) {
    const m = pedMesh();
    const band = i < 8 ? 'prom' : 'ave';
    const bz = band === 'prom' ? 6.35 : 3.35;
    m.position.set(rand(-12, 12), 0, bz);
    rotGroup.add(m);
    agents.peds.push({ m, band, bz, state: 'stroll', side: 'N', target: rand(-12, 12), speed: rand(0.5, 0.85), wait: 0, shop: -1 });
  }
}

function pedStep(a, dt, t) {
  const p = a.m.position;
  if (a.state === 'stroll') {
    const dir = Math.sign(a.target - p.x);
    p.x += dir * a.speed * dt;
    p.y = Math.abs(Math.sin(t * 9 + a.target)) * 0.02;
    if (Math.abs(p.x - a.target) < 0.1) {
      const roll = rng();
      if (a.side === 'S') {
        if (roll < 0.6) { a.state = 'toCrossBack'; a.target = CURB_S.x; }
        else a.target = rand(1.8, 7.5);
      } else if (a.band === 'prom' && roll < 0.5) {
        let idx = Math.floor(rng() * SHOPS.length);
        if (idx === 5 && !sim.renoOpen) idx = Math.floor(rng() * 5);
        a.shop = idx;
        a.state = 'toShop';
        a.target = shopDoors[idx].x;
      } else if (a.band === 'ave' && roll < 0.35) {
        a.state = 'toCross';
        a.target = CURB_N.x;
      } else {
        a.target = rand(-12, 12);
      }
    }
  } else if (a.state === 'toShop') {
    const dir = Math.sign(a.target - p.x);
    p.x += dir * a.speed * dt;
    if (Math.abs(p.x - a.target) < 0.12) {
      a.state = 'inShop';
      a.wait = rand(3.5, 8);
      a.m.visible = false;
      simEvent(a.shop);
    }
  } else if (a.state === 'inShop') {
    a.wait -= dt;
    if (a.wait <= 0) {
      a.m.visible = true;
      a.state = 'stroll';
      a.target = rand(-12, 12);
      a.m.position.z = a.bz;
    }
  } else if (a.state === 'toCross' || a.state === 'toCrossBack') {
    const curb = a.state === 'toCross' ? CURB_N : CURB_S;
    const dir = Math.sign(curb.x - p.x);
    p.x += dir * a.speed * dt;
    if (Math.abs(p.x - curb.x) < 0.1) {
      a.state = a.state === 'toCross' ? 'waitCross' : 'waitCrossBack';
    }
  } else if (a.state === 'waitCross' || a.state === 'waitCrossBack') {
    if (signal.state === 'NS') {
      a.state = a.state === 'waitCross' ? 'crossing' : 'crossingBack';
    }
  } else if (a.state === 'crossing' || a.state === 'crossingBack') {
    const toZ = a.state === 'crossing' ? CURB_S.z : CURB_N.z;
    const dir = Math.sign(toZ - p.z);
    p.z += dir * (a.speed * 1.15) * dt;
    if (Math.abs(p.z - toZ) < 0.08) {
      p.z = toZ;
      a.side = a.state === 'crossing' ? 'S' : 'N';
      a.state = 'stroll';
      a.target = a.side === 'S' ? rand(1.8, 7.5) : rand(-12, 12);
    }
  }
}

/* -- courier -- */
{
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.14), new THREE.MeshStandardMaterial({ color: '#1c1240', roughness: 0.5 }));
  deck.position.y = 0.09;
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.16), new THREE.MeshBasicMaterial({ color: ACCENTS.coral }));
  box.position.set(-0.1, 0.24, 0);
  const rider = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffe9c8' }));
  rider.position.set(0.05, 0.3, 0);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: orbTexture(ACCENTS.coral), transparent: true, opacity: 0.5, depthWrite: false }));
  glow.scale.setScalar(0.55);
  glow.position.y = 0.15;
  g.add(deck, box, rider, glow);
  g.visible = false;
  rotGroup.add(g);
  agents.courier = { m: g, state: 'idle', leg: 0, t: 0, path: [], deliveries: 0 };
}

const COURIER_DESTS = [new THREE.Vector3(-8.6, 0, -1.3), new THREE.Vector3(-3.2, 0, -2.6), new THREE.Vector3(1.6, 0, -1.7)];

function dispatchCourier() {
  const c = agents.courier;
  if (!c || c.state !== 'idle') return;
  const dest = pick(COURIER_DESTS);
  const start = new THREE.Vector3(shopDoors[0].x, 0.02, 3.0);
  c.path = [
    start,
    new THREE.Vector3(start.x, 0.02, 1.9),
    new THREE.Vector3(dest.x, 0.02, 1.9),
    new THREE.Vector3(dest.x, 0.02, dest.z),
  ];
  c.leg = 0; c.t = 0;
  c.state = 'out';
  c.m.visible = true;
  c.m.position.copy(start);
}

function courierStep(c, dt) {
  if (c.state === 'idle') return;
  if (c.state === 'pause') {
    c.t -= dt;
    if (c.t <= 0) { c.state = 'back'; c.leg = c.path.length - 2; c.t = 0; }
    return;
  }
  const fwd = c.state === 'out';
  const a = c.path[c.leg], b = c.path[c.leg + 1];
  const len = a.distanceTo(b) || 0.001;
  c.t += (2.6 * dt) / len;
  const from = fwd ? a : b, to = fwd ? b : a;
  c.m.position.copy(from).lerp(to, Math.min(1, c.t));
  const dir = to.clone().sub(from);
  if (dir.lengthSq() > 0.001) c.m.rotation.y = Math.atan2(dir.x, dir.z) - Math.PI / 2;
  if (c.t >= 1) {
    c.t = 0;
    if (fwd) {
      c.leg++;
      if (c.leg >= c.path.length - 1) { c.state = 'pause'; c.t = 1.6; c.deliveries++; }
    } else {
      c.leg--;
      if (c.leg < 0) { c.state = 'idle'; c.m.visible = false; }
    }
  }
}

/* ================= simulation ================= */

const BIZ = [
  { name: 'PIZZA', kind: 'shop', peak: 0.72 },
  { name: 'BODEGA', kind: 'shop', peak: 0.35 },
  { name: 'CUTS', kind: 'shop', peak: 0.45 },
  { name: 'NAILS', kind: 'shop', peak: 0.5 },
  { name: 'CAFÉ', kind: 'shop', peak: 0.2 },
  { name: 'TACOS', kind: 'shop', peak: 0.75 },
  { name: 'MIDRISE', kind: 'office', peak: 0.3 },
  { name: 'TOWER', kind: 'office', peak: 0.32 },
];

const sim = {
  tick: 0, events: 0, evtWindow: [], history: [], renoOpen: false,
  biz: BIZ.map((b, i) => ({
    orders: i === 5 ? 0 : Math.floor(rand(12, 70)),
    calls: Math.floor(rand(4, 26)),
    signalPct: rand(88, 99),
  })),
};

function bizRate(i, t) {
  const b = BIZ[i];
  if (i === 5 && !sim.renoOpen) return 0;
  let d = Math.abs(t - b.peak); if (d > 0.5) d = 1 - d;
  const bell = Math.exp(-(d * d) / 0.045);
  return (b.kind === 'shop' ? 3.2 : 2.2) * (0.25 + bell);
}

const PULSE_POOL = [];
for (let i = 0; i < 18; i++) {
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.12), mat);
  m.visible = false;
  rotGroup.add(m);
  PULSE_POOL.push({ m, active: false, a: new THREE.Vector3(), b: new THREE.Vector3(), t: 0, dur: 1 });
}

function spawnPulse(from, to, color) {
  const p = PULSE_POOL.find((x) => !x.active);
  if (!p) return;
  p.active = true;
  p.m.visible = true;
  p.a.copy(from); p.b.copy(to);
  p.a.y = 0.12; p.b.y = 0.12;
  p.t = 0;
  p.dur = Math.max(0.7, p.a.distanceTo(p.b) / 9);
  p.m.material.color.set(color);
  const d = p.b.clone().sub(p.a);
  p.m.rotation.y = Math.atan2(d.x, d.z) - Math.PI / 2;
}

function pulseStep(p, dt) {
  if (!p.active) return;
  p.t += dt / p.dur;
  if (p.t >= 1) { p.active = false; p.m.visible = false; return; }
  p.m.position.lerpVectors(p.a, p.b, p.t);
  p.m.material.opacity = Math.sin(p.t * Math.PI) * 0.95;
}

const TOWER_BASE = new THREE.Vector3(7.6, 0.15, -0.5);
const BIZ_COLORS = [ACCENTS.coral, ACCENTS.lime, ACCENTS.cyan, ACCENTS.magenta, ACCENTS.amber, ACCENTS.violet, ACCENTS.cyan, ACCENTS.magenta];
const bizAnchor = (i) => {
  if (i <= 5) return shopDoors[i].clone();
  if (i === 6) return new THREE.Vector3(-3.2, 0.2, -2.6);
  return new THREE.Vector3(7.6, 0.2, -0.6);
};

let chipIdx = -1;
let chipStatsDirty = false;

function simEvent(i) {
  const s = sim.biz[i];
  s.orders += 1;
  if (rng() < 0.3) s.calls += 1;
  sim.events += 1;
  sim.evtWindow.push(clockTime);
  if (i <= 5) {
    const rec = signMats[i];
    if (rec && !rec.dead) rec.busy = 0.22;
  }
  spawnPulse(bizAnchor(i), TOWER_BASE, BIZ_COLORS[i]);
  if (i === 0 && s.orders % 3 === 0) dispatchCourier();
  if (sim.events % 12 === 0) fireBeam();
  if (chipIdx >= 0) chipStatsDirty = true;
}

let simAcc = 0;
function simStep(dt) {
  simAcc += dt;
  if (simAcc < 0.5) return;
  simAcc -= 0.5;
  sim.tick += 1;
  for (let i = 0; i < BIZ.length; i++) {
    if (rng() < bizRate(i, dayT) / 120) simEvent(i);
  }
  for (const s of sim.biz) {
    s.signalPct = THREE.MathUtils.clamp(s.signalPct + rand(-0.4, 0.45), 86, 99.4);
  }
  while (sim.evtWindow.length && clockTime - sim.evtWindow[0] > 60) sim.evtWindow.shift();
  if (sim.tick % 4 === 0) {
    sim.history.push(sim.evtWindow.length);
    if (sim.history.length > 36) sim.history.shift();
    if (chipIdx >= 0) chipStatsDirty = true;
  }
}

/* -- milestone beam -- */
const beam = { active: false, t: 0, sprites: [] };
for (let i = 0; i < 9; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDot, transparent: true, opacity: 0, depthWrite: false, color: ACCENTS.magenta }));
  s.scale.setScalar(0.001);
  scene.add(s);
  beam.sprites.push(s);
}
const BEAM_P0 = new THREE.Vector3();
const BEAM_P1 = new THREE.Vector3();
const BEAM_P2 = new THREE.Vector3(-30, 13, -38);

function fireBeam() {
  if (beam.active) return;
  beam.active = true;
  beam.t = 0;
  rotGroup.updateMatrixWorld();
  BEAM_P0.set(TOWER_POS.x, 15.8, TOWER_POS.z).applyMatrix4(rotGroup.matrixWorld);
  BEAM_P1.copy(BEAM_P0).add(new THREE.Vector3(-8, 9, -10));
}

function beamStep(dt) {
  if (!beam.active) return;
  beam.t += dt / 1.5;
  if (beam.t >= 1.15) {
    beam.active = false;
    beam.sprites.forEach((s) => { s.material.opacity = 0; s.scale.setScalar(0.001); });
    return;
  }
  for (let i = 0; i < beam.sprites.length; i++) {
    const k = THREE.MathUtils.clamp(beam.t - i * 0.035, 0, 1);
    const a = BEAM_P0.clone().lerp(BEAM_P1, k);
    const b = BEAM_P1.clone().lerp(BEAM_P2, k);
    const p = a.lerp(b, k);
    const s = beam.sprites[i];
    s.position.copy(p);
    const head = i === 0;
    s.material.opacity = Math.max(0, (head ? 0.95 : 0.5 - i * 0.045) * (beam.t < 1 ? 1 : 1 - (beam.t - 1) / 0.15));
    s.scale.setScalar(Math.max(0.001, head ? 1.5 - k * 0.6 : 0.9 - i * 0.06));
  }
}

/* -- horizon train -- */
const train = { group: new THREE.Group(), t: -1, next: 22 };
for (let i = 0; i < 6; i++) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.3), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.85 }));
  m.position.x = i * 2.0;
  train.group.add(m);
}
train.group.visible = false;
scene.add(train.group);

function trainStep(dt) {
  if (train.t < 0) {
    train.next -= dt;
    const nightish = dayT > 0.45 || dayT < 0.13;
    if (train.next <= 0 && nightish) {
      train.t = 0;
      train.group.visible = true;
    }
    return;
  }
  train.t += dt / 8;
  const th = 2.35 + train.t * 1.15;
  train.group.position.set(Math.sin(th) * 53, 7.2, Math.cos(th) * 53);
  train.group.rotation.y = th + Math.PI / 2;
  const fade = THREE.MathUtils.clamp(Math.min(train.t / 0.12, (1 - train.t) / 0.12), 0, 1);
  train.group.children.forEach((m) => { m.material.opacity = 0.85 * fade; });
  if (train.t >= 1) {
    train.t = -1;
    train.next = rand(34, 55);
    train.group.visible = false;
  }
}

/* ================= renovation arc ================= */

const reno = { stage: 0, t: 0, boot: -1 };

function renoStep(dt) {
  if (!renoRefs || reno.stage >= 99) return;
  reno.t += dt;
  const R = renoRefs;
  if (reno.stage === 0) {
    if (reno.t > 24) { reno.stage = 1; reno.t = 0; }
  } else if (reno.stage === 1) {
    const k = Math.min(1, reno.t / 6);
    R.scafMat.opacity = 0.5 * k;
    R.scaf.scale.y = Math.max(0.001, k);
    if (reno.t > 18) { reno.stage = 2; reno.t = 0; }
  } else if (reno.stage === 2) {
    const k = Math.min(1, reno.t / 3.4);
    R.scafMat.opacity = 0.5 * (1 - k);
    R.scaf.scale.y = Math.max(0.001, 1 - k * 0.9);
    const lit = Math.min(5, Math.floor(k * 6));
    if (lit !== reno.boot) {
      reno.boot = lit;
      R.sign.map = signTexture('TACOS', R.accent, { perLetter: lit + 1 });
      R.sign.map.needsUpdate = true;
    }
    R.edge.opacity = 0.18 + 0.77 * k;
    R.front.opacity = 0.4 * k;
    R.doorMat.opacity = 0.06 + 0.5 * k;
    R.awnEdge.opacity = 0.1 + 0.9 * k;
    if (reno.t > 4) {
      reno.stage = 99;
      R.scaf.visible = false;
      R.sign.map = signTexture('TACOS', R.accent);
      R.sign.map.needsUpdate = true;
      R.signRec.dead = false;
      R.bodyMat.color.set('#2e1c56');
      sim.renoOpen = true;
      simEvent(5);
      if (chipIdx === 6) { chipStatsDirty = true; chipOpenStatic(6); }
    }
  }
}



/* redraw every canvas text after the display font loads (kills the clipped-Arial flash) */
textRedraws.push(() => {
  SHOPS.forEach((shop, i) => {
    const rec = signMats[i];
    if (!rec) return;
    if (shop.renovation && !sim.renoOpen) {
      rec.mat.map = signTexture('FOR LEASE', '#8a8aa0', { dim: true, size: 46 });
    } else {
      rec.mat.map = signTexture(shop.name, shop.accent);
    }
    rec.mat.needsUpdate = true;
  });
  pizzaFull = signTexture('PIZZA', ACCENTS.coral);
  pizzaDying = signTexture('PIZ A', ACCENTS.coral);
});
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => setTimeout(() => textRedraws.forEach((f) => f()), 80));
}

/* -- dying Z -- */
let pizzaFull = null, pizzaDying = null;
const dyingZ = { t: rand(8, 16), busy: 0 };

function dyingZStep(dt) {
  if (reduceMotion || !signMats[0]) return;
  if (!pizzaFull) {
    pizzaFull = signMats[0].mat.map;
    pizzaDying = signTexture('PIZ A', ACCENTS.coral);
  }
  if (dyingZ.busy > 0) {
    dyingZ.busy -= dt;
    signMats[0].mat.map = Math.random() < 0.5 ? pizzaDying : pizzaFull;
    if (dyingZ.busy <= 0) signMats[0].mat.map = pizzaFull;
  } else {
    dyingZ.t -= dt;
    if (dyingZ.t <= 0) { dyingZ.t = rand(9, 20); dyingZ.busy = rand(0.4, 0.8); }
  }
}

/* ================= sky domes ================= */

const domeGeo = new THREE.CylinderGeometry(62, 62, 46, 48, 1, true, Math.PI * 0.55, Math.PI * 1.9);
const domeMatA = new THREE.MeshBasicMaterial({ map: skyTex.golden, side: THREE.BackSide, fog: false });
const domeMatB = new THREE.MeshBasicMaterial({ map: skyTex.night, side: THREE.BackSide, fog: false, transparent: true, opacity: 0 });
const domeA = new THREE.Mesh(domeGeo, domeMatA);
const domeB = new THREE.Mesh(domeGeo, domeMatB);
domeA.position.y = 12; domeB.position.y = 12;
domeB.renderOrder = 1;
scene.add(domeA, domeB);

function skyStep() {
  const [ia, ib, blend] = skyBlend(dayT);
  const texA = skyTex[SKY_ORDER[ia]] || skyTex.golden;
  const texB = skyTex[SKY_ORDER[ib]] || skyTex.golden;
  if (domeMatA.map !== texA) domeMatA.map = texA;
  if (domeMatB.map !== texB) domeMatB.map = texB;
  domeMatB.opacity = blend;
}

/* ================= lighting ================= */

const hemi = new THREE.HemisphereLight('#7a5bd6', '#2a1548', 2.6);
scene.add(hemi);
const key = new THREE.DirectionalLight('#ffd9c2', 2.2);
key.position.set(-14, 20, 18);
scene.add(key);
const rim = new THREE.DirectionalLight('#39d8ff', 1.6);
rim.position.set(16, 14, -16);
scene.add(rim);

function applyDay(D) {
  hemi.color.copy(D.hemiS); hemi.groundColor.copy(D.hemiG); hemi.intensity = D.hemiI;
  key.color.copy(D.keyC); key.intensity = D.keyI;
  rim.intensity = D.rimI;
  scene.fog.color.copy(D.fog);
  scene.background.copy(D.bg);
}

/* ================= beacons + chip ================= */

const BEACONS = [
  { anchor: new THREE.Vector3(-8.4, 3.9, 4.4), biz: 0, down: 1.5, dir: new THREE.Vector3(-0.25, 0.42, 1).normalize(), dist: 8, accent: ACCENTS.coral, kicker: 'Small business block', title: 'Live in two weeks.', body: 'A full storefront site — booking, payments, menus — launched fast. Watch the counter: every tick is the sim taking a real order.' },
  { anchor: new THREE.Vector3(-7.25, 3.7, 4.4), biz: 1, down: 1.4, dir: new THREE.Vector3(0.3, 0.36, 1).normalize(), dist: 7.5, accent: ACCENTS.lime, kicker: 'Local signal', title: 'Found by the neighborhood.', body: 'Local SEO points the block at one front door. Foot traffic here is literal — the walkers going in are the events.' },
  { anchor: new THREE.Vector3(-8.6, 7.6, -3.6), biz: 6, down: 2.4, dir: new THREE.Vector3(-0.75, 0.35, 0.9).normalize(), dist: 9.5, accent: ACCENTS.violet, kicker: 'Growing teams', title: 'Systems that follow up.', body: 'Intake, scheduling, invoicing wired into one path. Office hours drive the curve — leads climb through the workday.' },
  { anchor: new THREE.Vector3(7.6, 16, -3.2), biz: 7, down: 3.6, dir: new THREE.Vector3(0.85, 0.3, 1).normalize(), dist: 11.5, accent: ACCENTS.magenta, kicker: 'Big business polish', title: 'The whole block, one dashboard.', body: 'Every signal on the street flows up here. Twelve events fire a beam at the old skyline — the district announcing itself.' },
  { anchor: new THREE.Vector3(-1, 0.6, 1.9), biz: 7, down: 0.1, dir: new THREE.Vector3(0.15, 0.85, 0.7).normalize(), dist: 8.5, accent: ACCENTS.cyan, kicker: 'The grid', title: 'Every signal tracked.', body: 'Those pulses are orders, calls, and bookings in transit. Nothing loops — each one was caused by someone on this block.' },
  { anchor: new THREE.Vector3(11.6, 2.6, 5.6), biz: 7, down: 0.9, dir: new THREE.Vector3(0.7, 0.4, 1).normalize(), dist: 7.5, accent: ACCENTS.amber, kicker: 'The district', title: 'One studio, whole block.', body: 'LittleFight builds at every scale on this street. Traffic obeys the signals, businesses keep their own hours, and the city runs.' },
  { anchor: new THREE.Vector3(STRIP_X0 + 5 * UNIT_W, 3.8, 4.4), biz: 5, down: 1.5, dir: new THREE.Vector3(0.3, 0.4, 1).normalize(), dist: 7.5, accent: ACCENTS.violet, kicker: 'The next client', title: 'Watch this space.', body: 'This unit is mid-renovation. Scaffolding, sign boot, first customer — the client journey, played out in world time.' },
];

const beaconSprites = [];
{
  const tex = beaconTexture();
  BEACONS.forEach((b, i) => {
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.98, depthWrite: false, depthTest: false, color: b.accent });
    const s = new THREE.Sprite(mat);
    s.position.copy(b.anchor);
    s.scale.setScalar(0.001);
    s.renderOrder = 5;
    s.userData.beacon = i;
    rotGroup.add(s);
    beaconSprites.push(s);
  });
}

const _v = new THREE.Vector3();

function chipOpenStatic(i) {
  const b = BEACONS[i];
  chipBar.style.background = b.accent;
  chipBar.style.color = b.accent;
  chipKicker.textContent = i === 6 && sim.renoOpen ? 'Launched today' : b.kicker;
  chipTitle.textContent = i === 6 && sim.renoOpen ? 'TACOS is open.' : b.title;
  chipBody.textContent = i === 6 && sim.renoOpen ? 'Renovation done, sign lit, first orders in. This is what week one looks like on the block.' : b.body;
  renderChipStats();
}

function chipOpen(i) {
  chipIdx = i;
  chipOpenStatic(i);
  chipEl.hidden = false;
  requestAnimationFrame(() => chipEl.classList.add('is-open'));
  easeToBeacon(i);
}

function chipClose() {
  chipIdx = -1;
  chipEl.classList.remove('is-open');
  setTimeout(() => { if (chipIdx < 0) chipEl.hidden = true; }, 300);
}

function renderChipStats() {
  if (chipIdx < 0) return;
  const b = BEACONS[chipIdx];
  const s = sim.biz[b.biz];
  const rows = [];
  if (b.biz === 7) {
    const total = sim.biz.reduce((n, x) => n + x.orders, 0);
    rows.push(['District events', `${total}`]);
    rows.push(['Signals / min', `${sim.evtWindow.length}`]);
    rows.push(['Beam in', `${12 - (sim.events % 12)} <em>events</em>`]);
    rows.push(['Clock', `${dayClock(dayT)} <em>${phaseName(dayT)}</em>`]);
  } else {
    rows.push([BIZ[b.biz].kind === 'shop' ? 'Orders today' : 'Leads today', `${s.orders}`]);
    rows.push(['Calls routed', `${s.calls}`]);
    rows.push(['Signal', `${s.signalPct.toFixed(1)}<em>%</em>`]);
    rows.push(['Clock', `${dayClock(dayT)} <em>${phaseName(dayT)}</em>`]);
  }
  chipStats.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  // sparkline: signals/min over the last few minutes
  if (sim.history.length > 2) {
    const cnv3 = document.createElement('canvas');
    cnv3.width = 240; cnv3.height = 30;
    const g3 = cnv3.getContext('2d');
    const maxV = Math.max(4, ...sim.history);
    g3.strokeStyle = b.accent;
    g3.lineWidth = 2;
    g3.beginPath();
    sim.history.forEach((v2, i2) => {
      const x2 = i2 / (sim.history.length - 1) * 236 + 2;
      const y2 = 27 - (v2 / maxV) * 23;
      if (i2 === 0) g3.moveTo(x2, y2); else g3.lineTo(x2, y2);
    });
    g3.stroke();
    g3.globalAlpha = 0.18;
    g3.lineTo(238, 29); g3.lineTo(2, 29); g3.closePath();
    g3.fillStyle = b.accent;
    g3.fill();
    const holder = document.createElement('div');
    holder.style.gridColumn = '1 / -1';
    const dt2 = document.createElement('dt');
    dt2.textContent = 'Signals / min · trend';
    holder.appendChild(dt2);
    cnv3.style.width = '100%';
    cnv3.style.height = '15px';
    cnv3.style.display = 'block';
    cnv3.style.marginTop = '2px';
    holder.appendChild(cnv3);
    chipStats.appendChild(holder);
  }
}

function chipTrack() {
  if (chipIdx < 0) return;
  const b = BEACONS[chipIdx];
  _v.copy(b.anchor).applyMatrix4(rotGroup.matrixWorld).project(camera);
  if (_v.z > 1) { chipEl.style.opacity = '0'; return; }
  chipEl.style.opacity = '';
  const px = (_v.x * 0.5 + 0.5) * innerWidth;
  const py = (-_v.y * 0.5 + 0.5) * innerHeight;
  const w = chipEl.offsetWidth || 300;
  const hgt = chipEl.offsetHeight || 180;
  let x = px + 18;
  if (x + w > innerWidth - 12) x = px - w - 18;
  let y = py - hgt * 0.4;
  y = THREE.MathUtils.clamp(y, 12, innerHeight - hgt - 96);
  x = THREE.MathUtils.clamp(x, 8, innerWidth - w - 8);
  chipEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

document.querySelector('[data-chip-close]').addEventListener('click', chipClose);
document.querySelector('[data-chip-prev]').addEventListener('click', () => chipOpen((chipIdx - 1 + BEACONS.length) % BEACONS.length));
document.querySelector('[data-chip-next]').addEventListener('click', () => chipOpen((chipIdx + 1) % BEACONS.length));

/* ================= camera ================= */

const CENTER = new THREE.Vector3(0, 0, 0);
let heroDist = 34;
let viewAz = 0.56;
const HERO_POLAR = 1.2;
let polar = HERO_POLAR, targetPolar = HERO_POLAR;
let dollyFrac = 1, targetDollyFrac = 1;
const lookPoint = new THREE.Vector3();

function computeFraming() {
  const bb = new THREE.Box3().setFromObject(rotGroup);
  const rXZ = 0.78 * Math.max(Math.abs(bb.min.x), Math.abs(bb.max.x), Math.abs(bb.min.z), Math.abs(bb.max.z));
  const top = bb.max.y, bottom = Math.max(bb.min.y, -1.5);
  const cy = (top + bottom) / 2;
  CENTER.set(0, cy + 0.2, 0);
  const halfH = (top - bottom) / 2 + 0.4;
  const sphere = Math.sqrt(rXZ * rXZ + halfH * halfH);
  const aspect = innerWidth / innerHeight;
  const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
  const hFov = Math.atan(Math.tan(vFov) * aspect);
  const margin = aspect < 0.8 ? 1.0 : 1.03;
  heroDist = (sphere * margin) / Math.tan(Math.min(vFov, hFov));
}

function freeCameraPos(az, dist, pol) {
  return new THREE.Vector3(
    CENTER.x + Math.sin(pol) * Math.sin(az) * dist,
    CENTER.y + Math.cos(pol) * dist,
    CENTER.z + Math.sin(pol) * Math.cos(az) * dist
  );
}

function adoptCameraPose() {
  const rel = camera.position.clone().sub(CENTER);
  const dist = rel.length() || 1;
  polar = targetPolar = THREE.MathUtils.clamp(Math.acos(THREE.MathUtils.clamp(rel.y / dist, -1, 1)), 0.38, 1.45);
  viewAz = Math.atan2(rel.x, rel.z);
  dollyFrac = targetDollyFrac = THREE.MathUtils.clamp(dist / heroDist, 0.28, 1.15);
}

let mode = 'build';
let buildT = 0;
const BUILD_DUR = reduceMotion ? 0 : 3.6;
const tween = { active: false, t: 0, dur: 1.1, fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromLook: new THREE.Vector3(), toLook: new THREE.Vector3() };
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);

function easeToBeacon(i) {
  const b = BEACONS[i];
  rotGroup.updateMatrixWorld();
  const anchorW = b.anchor.clone().applyMatrix4(rotGroup.matrixWorld);
  const dirW = b.dir.clone().applyQuaternion(rotGroup.quaternion).normalize();
  const camPos = anchorW.clone().add(dirW.multiplyScalar(b.dist));
  camPos.y = Math.max(camPos.y, 1.3);
  const lookW = anchorW.clone(); lookW.y -= b.down || 1;
  tween.active = true;
  tween.t = 0;
  tween.dur = reduceMotion ? 0.01 : 1.1;
  tween.fromPos.copy(camera.position);
  tween.fromLook.copy(lookPoint);
  tween.toPos.copy(camPos);
  tween.toLook.copy(lookW);
}

/* -- attract mode -- */
const attract = { on: false, idx: 0, t: 0 };
const ATTRACT_POSES = [
  { az: 0.2, polar: 1.34, dolly: 0.5, look: () => new THREE.Vector3(-6, 2, 4) },
  { az: 1.7, polar: 1.02, dolly: 0.52, look: () => new THREE.Vector3(7.6, 9, -3.2) },
  { az: -1.1, polar: 0.78, dolly: 0.8, look: () => new THREE.Vector3(0, 2, 0) },
  { az: 0.7, polar: 1.38, dolly: 0.44, look: () => new THREE.Vector3(4.2, 0.8, 2) },
];

function startAttractPose() {
  const p = ATTRACT_POSES[attract.idx % ATTRACT_POSES.length];
  const toPos = freeCameraPos(viewAz + p.az, heroDist * p.dolly, p.polar);
  tween.active = true;
  tween.t = 0;
  tween.dur = 2.0;
  tween.fromPos.copy(camera.position);
  tween.fromLook.copy(lookPoint);
  tween.toPos.copy(toPos);
  rotGroup.updateMatrixWorld();
  tween.toLook.copy(p.look().applyMatrix4(rotGroup.matrixWorld));
  attract.t = 0;
}

/* ================= interaction ================= */

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let spinVel = 0;
const IDLE_SPIN = reduceMotion ? 0 : (Math.PI * 2) / 85;
let idleBlend = 1;
let lastInteract = -10;
let dragging = false;
let moved = 0;
let lastX = 0, lastY = 0;
const pointers = new Map();
let pinchDist = 0;
let clockTime = 0;
let hudOn = false;
let hoverIdx = -1;

function pickBeacon(clientX, clientY) {
  ndc.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(beaconSprites, false);
  return hits.length ? hits[0].object.userData.beacon : -1;
}

function userInterrupt() {
  attract.on = false;
  if (tween.active) { tween.active = false; adoptCameraPose(); }
  lastInteract = clockTime;
}

canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  moved = 0;
  if (pointers.size === 1) {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    canvas.classList.add('is-dragging');
  } else if (pointers.size === 2) {
    const pts = [...pointers.values()];
    pinchDist = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
  }
  if (mode === 'build' && buildT > 0.4) buildT = BUILD_DUR;
  userInterrupt();
  hint.classList.add('is-out');
});

canvas.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const pts = [...pointers.values()];
    const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    if (pinchDist > 0 && mode === 'free') {
      targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac * (pinchDist / d), 0.28, 1.15);
    }
    pinchDist = d;
    lastInteract = clockTime;
    return;
  }
  if (!dragging || mode !== 'free') return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  moved += Math.abs(dx) + Math.abs(dy);
  lastX = e.clientX; lastY = e.clientY;
  spinVel = dx * 0.0042;
  rotGroup.rotation.y += spinVel;
  targetPolar = THREE.MathUtils.clamp(targetPolar - dy * 0.0035, 0.38, 1.45);
  lastInteract = clockTime;
});

const endPointer = (e) => {
  const wasTap = moved < 9 && pointers.size === 1;
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchDist = 0;
  if (pointers.size === 0) {
    dragging = false;
    canvas.classList.remove('is-dragging');
  }
  if (!wasTap || mode === 'build') return;
  const hit = pickBeacon(e.clientX, e.clientY);
  if (hit >= 0) chipOpen(hit);
  else if (chipIdx >= 0) chipClose();
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); dragging = false; });

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (mode === 'build') return;
  userInterrupt();
  targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac + e.deltaY * 0.0011, 0.28, 1.15);
}, { passive: false });

if (!isMobile) {
  let hoverTick = 0;
  canvas.addEventListener('pointermove', (e) => {
    if (dragging || mode === 'build') return;
    if (++hoverTick % 4 !== 0) return;
    hoverIdx = pickBeacon(e.clientX, e.clientY);
    canvas.classList.toggle('is-hot', hoverIdx >= 0);
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') chipClose();
  if (e.key === '`' || e.key === '~') { hudOn = !hudOn; hudEl.hidden = !hudOn; }
});

/* ================= post ================= */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), isMobile ? 0.7 : 0.85, 0.62, 0.52);
composer.addPass(bloom);

const FinishShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    void main(){
      vec4 col = texture2D(tDiffuse, vUv);
      vec2 q = vUv - 0.5;
      float vig = smoothstep(0.95, 0.35, length(q));
      col.rgb *= mix(0.78, 1.0, vig);
      col.rgb = pow(col.rgb, vec3(0.98, 1.0, 0.96));
      float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 60.0) - 0.5;
      float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      col.rgb += g * 0.011 * (0.3 + lum);
      gl_FragColor = col;
    }`,
};
const finishPass = new ShaderPass(FinishShader);
composer.addPass(finishPass);

/* ================= resize ================= */

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  computeFraming();
}
window.addEventListener('resize', resize);

/* ================= build-in ================= */

for (const b of builders) {
  b.delay = reduceMotion ? 0 : 0.5 + b.order * 0.5 + rng() * 0.35;
  if (!reduceMotion) b.group.scale.y = 0.001;
}

function buildStep(dt) {
  buildT += dt;
  let done = true;
  for (const b of builders) {
    const k = THREE.MathUtils.clamp((buildT - b.delay) / 1.1, 0, 1);
    if (k < 1) done = false;
    const e = 1 - Math.pow(1 - k, 3);
    const over = k > 0 && k < 1 ? 1 + Math.sin(k * Math.PI) * 0.06 : 1;
    b.group.scale.y = Math.max(0.001, e * over);
  }
  const bk = THREE.MathUtils.clamp((buildT - (BUILD_DUR - 0.9)) / 0.7, 0, 1);
  const be = bk < 0.6 ? bk / 0.6 * 1.45 : 1.45 - (bk - 0.6) / 0.4 * 0.33;
  beaconSprites.forEach((s, i) => { s.scale.setScalar(Math.max(0.001, be * (1 + (i % 3) * 0.05))); });
  if (buildT >= BUILD_DUR && done) {
    mode = 'free';
    beaconSprites.forEach((s) => s.scale.setScalar(1.12));
  }
}

if (reduceMotion) {
  builders.forEach((b) => { b.group.scale.y = 1; });
  beaconSprites.forEach((s) => s.scale.setScalar(1.12));
  mode = 'free';
}

/* ================= debug hud ================= */

let fpsAvg = 60, hudAcc = 0;

function hudStep(dt) {
  fpsAvg = fpsAvg * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
  if (!hudOn) return;
  hudAcc += dt;
  if (hudAcc < 0.25) return;
  hudAcc = 0;
  const info = renderer.info.render;
  hudEl.textContent =
    `FPS ${Math.round(fpsAvg)} · CALLS ${info.calls} · TRIS ${(info.triangles / 1000).toFixed(0)}k\n` +
    `ENTITIES cars ${agents.cars.length} · peds ${agents.peds.length} · courier ${agents.courier && agents.courier.state !== 'idle' ? 'out' : 'home'}\n` +
    `SIM tick ${sim.tick} · events ${sim.events} · ${sim.evtWindow.length}/min · reno ${sim.renoOpen ? 'OPEN' : 'stage ' + reno.stage}\n` +
    `CLOCK ${dayClock(dayT)} · ${phaseName(dayT)} · signal ${signal.state}`;
}

/* ================= loop ================= */

const clock = new THREE.Clock();
let firstFrame = false;
let running = true;

document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running) clock.getDelta();
});

setProgress(0.75);
computeFraming();
resize();
lookPoint.copy(CENTER);
camera.position.copy(freeCameraPos(viewAz, heroDist, HERO_POLAR));
camera.lookAt(lookPoint);

function frame() {
  requestAnimationFrame(frame);
  if (!running) return;
  renderer.info.reset();
  const dt = Math.min(clock.getDelta(), 0.05);
  clockTime += dt;
  const t = clockTime;

  dayT = (dayT + dt / DAY_LEN) % 1;
  const D = sampleDay(dayT);
  applyDay(D);
  skyStep();

  if (tween.active) {
    tween.t += dt;
    const k = smoother(THREE.MathUtils.clamp(tween.t / tween.dur, 0, 1));
    camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
    lookPoint.lerpVectors(tween.fromLook, tween.toLook, k);
    camera.lookAt(lookPoint);
    if (tween.t >= tween.dur) {
      tween.active = false;
      adoptCameraPose();
      if (attract.on) attract.t = 0;
    }
  } else if (mode === 'free') {
    if (attract.on) {
      attract.t += dt;
      rotGroup.rotation.y += IDLE_SPIN * 0.5 * dt;
      if (attract.t > 6.5) { attract.idx++; startAttractPose(); }
    } else {
      if (dragging) {
        idleBlend = 0;
      } else {
        spinVel *= Math.pow(0.06, dt);
        if (t - lastInteract > 2.6 && chipIdx < 0) idleBlend = Math.min(1, idleBlend + dt / 1.6);
        else if (chipIdx >= 0) idleBlend = 0;
        rotGroup.rotation.y += spinVel + IDLE_SPIN * smoother(idleBlend) * dt;
        if (!reduceMotion && chipIdx < 0 && t - lastInteract > 24) {
          attract.on = true;
          attract.idx = 0;
          startAttractPose();
        }
      }
      if (chipIdx >= 0) {
        const b = BEACONS[chipIdx];
        _v.copy(b.anchor).applyMatrix4(rotGroup.matrixWorld);
        _v.y -= b.down || 1;
        lookPoint.lerp(_v, Math.min(1, dt * 6));
        camera.lookAt(lookPoint);
      } else {
        dollyFrac = THREE.MathUtils.damp(dollyFrac, targetDollyFrac, 4.5, dt);
        polar = THREE.MathUtils.damp(polar, targetPolar, 5.5, dt);
        camera.position.copy(freeCameraPos(viewAz, heroDist * dollyFrac, polar));
        lookPoint.lerp(CENTER, Math.min(1, dt * 6));
        camera.lookAt(lookPoint);
      }
    }
  } else if (mode === 'build') {
    rotGroup.rotation.y += IDLE_SPIN * 0.5 * dt;
    buildStep(dt);
  }

  // world systems — these never pause
  signalStep(dt);
  steamStep(dt);
  if (billboardBorder) billboardBorder.material.color.setHSL((t * 0.045) % 1, 0.85, 0.62);
  simStep(dt);
  renoStep(dt);
  dyingZStep(dt);
  trainStep(dt);
  beamStep(dt);
  {
    for (const a of agents.cars) carStep(a, dt);
    for (const a of agents.peds) pedStep(a, dt, t);
    if (agents.courier) courierStep(agents.courier, dt);
    for (const p of PULSE_POOL) pulseStep(p, dt);
    const headOn = D.head > 0.5;
    for (const a of agents.cars) a.m.userData.head.material.opacity = headOn ? 0.9 : 0.12;
  }

  {
    for (const p of pulseTargets) {
      const f = p.kind === 'grid' ? D.grid : D.win;
      p.mat.emissiveIntensity = p.base * f * (0.86 + 0.14 * Math.sin(t * p.speed + p.phase));
    }
    const crownPulse = 0.55 + 0.45 * Math.sin(t * 1.7);
    if (crownMat) crownMat.opacity = (0.5 + crownPulse * 0.5) * Math.max(0.45, D.sign);
    if (crownLight) crownLight.intensity = (2.5 + crownPulse * 6) * D.sign;
    for (const em of edgeMats) {
      if (renoRefs && em === renoRefs.edge && reno.stage < 2) { em.opacity = 0.18; continue; }
      em.opacity = Math.min(1, (0.8 + 0.2 * Math.sin(t * 0.9 + em.id * 0.7)) * D.edge);
    }
    for (const s of signMats) {
      if (s.dead) { s.mat.opacity = 0.5; continue; }
      if (s.busy > 0 && !reduceMotion) {
        s.busy -= dt;
        s.mat.opacity = Math.random() < 0.5 ? 0.5 : 1;
        if (s.busy <= 0) s.mat.opacity = 1;
      } else {
        s.busy = 0;
        s.mat.opacity = Math.min(1, 0.55 + 0.45 * D.sign);
        s.t -= dt;
        if (s.t <= 0) { s.t = rand(5, 13); s.busy = 0.3; }
      }
    }
    for (const orb of orbSprites) orb.material.opacity = 0.25 + 0.7 * D.orb;
    for (let ci2 = 0; ci2 < treeCanopies.length; ci2++) {
      treeCanopies[ci2].rotation.z = Math.sin(t * 0.55 + ci2 * 1.7) * 0.02;
      treeCanopies[ci2].rotation.x = Math.cos(t * 0.42 + ci2 * 1.1) * 0.014;
    }
    for (const rp of ripples) {
      if (!rp.ring) continue;
      rp.t += dt / 2.2;
      if (rp.t > 1) rp.t -= 1;
      const sc = 0.35 + rp.t * 2.6;
      rp.ring.scale.setScalar(sc);
      rp.ring.material.opacity = Math.sin(Math.PI * rp.t) * 0.55;
    }
    if (ripples.jet) ripples.jet.position.y = 0.6 + Math.sin(t * 2.4) * 0.07;
    const bs = 1.12 + 0.11 * Math.sin(t * 2.1);
    if (mode !== 'build') beaconSprites.forEach((s, i) => {
      const active = i === chipIdx;
      s.scale.setScalar(active ? 0.92 : (i === hoverIdx ? bs * 1.22 : bs));
      s.material.opacity = chipIdx >= 0 ? (active ? 0.7 : 0.35) : 0.98;
      s.position.y = BEACONS[i].anchor.y + Math.sin(t * 1.3 + i) * 0.12;
    });
  }

  chipTrack();
  if (chipStatsDirty) { chipStatsDirty = false; renderChipStats(); }
  finishPass.uniforms.uTime.value = t;
  composer.render();
  hudStep(dt);

  if (!firstFrame) {
    firstFrame = true;
    setProgress(1);
    veil.classList.add('is-done');
    plate.classList.add('is-in');
    if (!reduceMotion) setTimeout(() => hint.classList.add('is-in'), 3400);
    setTimeout(() => hint.classList.add('is-out'), 11000);
  }
}

frame();

/* dev hooks */
window.__districtInfo = () => ({ mode, chipIdx, rotY: rotGroup.rotation.y, dayT: +dayT.toFixed(3), phase: phaseName(dayT), clock: dayClock(dayT), events: sim.events, evtPerMin: sim.evtWindow.length, reno: reno.stage, renoOpen: sim.renoOpen, signal: signal.state, cars: agents.cars.length, peds: agents.peds.length, attract: attract.on, fps: Math.round(fpsAvg) });
window.__districtPose = (rotY, dolly = 1, pol = HERO_POLAR, az = 0.56) => { attract.on = false; tween.active = false; viewAz = az; rotGroup.rotation.y = rotY; targetDollyFrac = dolly; dollyFrac = dolly; targetPolar = pol; polar = pol; lastInteract = clockTime; idleBlend = 0; };
window.__districtPick = (x, y) => pickBeacon(x, y);
window.__districtCars = () => agents.cars.map((a) => ({ dir: a.route.dir, v: +a.v.toFixed(2), t: +a.t.toFixed(2) }));
window.__districtFocus = (i) => { if (i < 0) chipClose(); else chipOpen(i); };
window.__districtDay = (t) => { dayT = ((t % 1) + 1) % 1; };
window.__districtHud = () => { hudOn = !hudOn; hudEl.hidden = !hudOn; };
