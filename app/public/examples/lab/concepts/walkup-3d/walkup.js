import * as THREE from 'https://esm.sh/three@0.164.1';
import { EffectComposer } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';
import { mergeGeometries } from 'https://esm.sh/three@0.164.1/examples/jsm/utils/BufferGeometryUtils.js';

/* ---------- setup ---------- */

const canvas = document.querySelector('[data-scene]');
const veil = document.querySelector('[data-veil]');
const veilFill = document.querySelector('[data-veil-fill]');
const plate = document.querySelector('[data-plate]');
const hint = document.querySelector('[data-hint]');

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
renderer.toneMappingExposure = 1.6;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const DPR_CAP = isMobile ? 1.75 : 2;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, DPR_CAP));

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05070f');
scene.fog = new THREE.FogExp2('#0b101f', 0.0088);

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.1, 220);

const rng = (() => { let s = 20260728; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const rand = (a, b) => a + rng() * (b - a);

/* ---------- canvas textures ---------- */

function brickTexture() {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 768;
  const g = c.getContext('2d');
  g.fillStyle = '#7a5142'; g.fillRect(0, 0, 384, 768);
  const bh = 12, bw = 48;
  for (let y = 0; y < 768 / bh; y++) {
    for (let x = -1; x < 384 / bw + 1; x++) {
      const ox = (y % 2) * (bw / 2);
      const tint = 0.86 + rng() * 0.26;
      g.fillStyle = `rgb(${Math.round(120 * tint)},${Math.round(80 * tint)},${Math.round(64 * tint)})`;
      g.fillRect(x * bw + ox + 1, y * bh + 1, bw - 2, bh - 2);
    }
  }
  // mortar shadow + grime bands
  const grime = g.createLinearGradient(0, 0, 0, 768);
  grime.addColorStop(0, 'rgba(10,8,12,0.34)');
  grime.addColorStop(0.12, 'rgba(10,8,12,0.05)');
  grime.addColorStop(0.82, 'rgba(8,6,8,0.06)');
  grime.addColorStop(1, 'rgba(8,6,8,0.3)');
  g.fillStyle = grime; g.fillRect(0, 0, 384, 768);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function sidewalkTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#33363e'; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${rng() > 0.5 ? '255,255,255' : '0,0,0'},${rand(0.015, 0.05)})`;
    g.fillRect(rand(0, 512), rand(0, 128), rand(1, 3), rand(1, 3));
  }
  g.strokeStyle = 'rgba(8,9,12,0.8)'; g.lineWidth = 3;
  for (let x = 0; x <= 512; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function backdropTexture() {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 512;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#04060d');
  sky.addColorStop(0.55, '#111a36');
  sky.addColorStop(0.86, '#25254a');
  sky.addColorStop(1, '#332947');
  g.fillStyle = sky; g.fillRect(0, 0, 2048, 512);
  // starfield — dense, varied, brighter high in the sky
  for (let i = 0; i < 420; i++) {
    const sy = rand(0, 415);
    const a = rand(0.16, 0.95) * (1 - sy / 640);
    g.fillStyle = `rgba(226,233,255,${a.toFixed(3)})`;
    g.beginPath(); g.arc(rand(0, 2048), sy, rand(0.5, 1.7), 0, Math.PI * 2); g.fill();
  }
  // a faint drift of micro-stars, like a thin milky band
  for (let i = 0; i < 160; i++) {
    const bx = rand(0, 2048);
    const by = 265 + Math.sin(bx / 340) * 55 + rand(-30, 30);
    g.fillStyle = `rgba(214,224,250,${rand(0.05, 0.2).toFixed(3)})`;
    g.beginPath(); g.arc(bx, by, rand(0.4, 0.9), 0, Math.PI * 2); g.fill();
  }
  // a handful of hero stars with cross sparkle
  for (let i = 0; i < 12; i++) {
    const sx = rand(40, 2008), sy = rand(225, 385), sr = rand(2.6, 4.6);
    const halo = g.createRadialGradient(sx, sy, 0.5, sx, sy, sr * 2.2);
    halo.addColorStop(0, 'rgba(240,246,255,0.95)');
    halo.addColorStop(0.4, 'rgba(226,235,255,0.25)');
    halo.addColorStop(1, 'rgba(226,235,255,0)');
    g.fillStyle = halo;
    g.beginPath(); g.arc(sx, sy, sr * 2.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(238,244,255,0.55)';
    g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(sx - sr * 2.6, sy); g.lineTo(sx + sr * 2.6, sy); g.stroke();
    g.beginPath(); g.moveTo(sx, sy - sr * 2.6); g.lineTo(sx, sy + sr * 2.6); g.stroke();
  }
  // crescent moon, lit limb facing the scene
  const mx = 505, my = 262, mr = 19;
  g.fillStyle = 'rgba(242,246,255,0.98)';
  g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
  const cutSky = g.createLinearGradient(0, 0, 0, 512);
  cutSky.addColorStop(0, '#04060d');
  cutSky.addColorStop(0.55, '#111a36');
  cutSky.addColorStop(0.86, '#25254a');
  cutSky.addColorStop(1, '#332947');
  g.fillStyle = cutSky;
  g.beginPath(); g.arc(mx - mr * 0.5, my - mr * 0.22, mr * 0.94, 0, Math.PI * 2); g.fill();
  const mg = g.createRadialGradient(mx + mr * 0.35, my + mr * 0.18, 2, mx + mr * 0.35, my + mr * 0.18, mr * 3.6);
  mg.addColorStop(0, 'rgba(215,226,255,0.20)');
  mg.addColorStop(0.4, 'rgba(205,218,255,0.07)');
  mg.addColorStop(1, 'rgba(205,218,255,0)');
  g.fillStyle = mg; g.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
  // skyline layers
  const layer = (baseY, color, winAlpha) => {
    g.fillStyle = color;
    let x = 0;
    const tops = [];
    while (x < 2048) {
      const w = rand(60, 190);
      const h = rand(60, 170);
      g.fillRect(x, baseY - h, w, h + (512 - baseY));
      tops.push([x, w, baseY - h]);
      x += w + rand(4, 26);
    }
    for (const [bx, bw, ty] of tops) {
      const rows = Math.floor((baseY - ty) / 16);
      for (let r = 0; r < rows; r++) {
        for (let k = 0; k < bw / 22; k++) {
          if (rng() < 0.16) {
            g.fillStyle = `rgba(255,${200 + Math.round(rng() * 40)},150,${winAlpha * rand(0.5, 1)})`;
            g.fillRect(bx + 6 + k * 22, ty + 8 + r * 16, 5, 7);
          }
        }
      }
    }
  };
  layer(430, '#121530', 0.52);
  layer(468, '#1a1e38', 0.72);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowSprite(color) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(64, 64, 2, 64, 64, 64);
  rg.addColorStop(0, color);
  rg.addColorStop(0.35, color.replace('1)', '0.28)'));
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function steamTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  for (let i = 0; i < 5; i++) {
    const x = 40 + rng() * 48, y = 40 + rng() * 48, r = 22 + rng() * 26;
    const rg = g.createRadialGradient(x, y, 1, x, y, r);
    rg.addColorStop(0, 'rgba(190,200,220,0.16)');
    rg.addColorStop(1, 'rgba(190,200,220,0)');
    g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}


function interiorTextures() {
  const mk = (draw) => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 192;
    const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, 192);
    bg.addColorStop(0, '#fff3dd');
    bg.addColorStop(0.55, '#ffe1b0');
    bg.addColorStop(1, '#e8b477');
    g.fillStyle = bg; g.fillRect(0, 0, 128, 192);
    // ceiling shadow + floor line
    g.fillStyle = 'rgba(60,30,10,0.25)'; g.fillRect(0, 0, 128, 14);
    g.fillStyle = 'rgba(60,30,10,0.30)'; g.fillRect(0, 168, 128, 24);
    draw(g);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  const ink = 'rgba(30,14,6,0.88)';
  const soft = 'rgba(30,14,6,0.5)';
  return [
    mk((g) => { // curtains
      g.fillStyle = soft;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(34, 90, 8, 192); g.lineTo(0, 192); g.fill();
      g.beginPath(); g.moveTo(128, 0); g.quadraticCurveTo(94, 90, 120, 192); g.lineTo(128, 192); g.fill();
    }),
    mk((g) => { // plant on sill
      g.fillStyle = ink;
      g.fillRect(52, 148, 26, 22);
      for (let i = 0; i < 7; i++) {
        g.beginPath();
        g.ellipse(65 + Math.cos(i * 0.9) * 16, 132 - Math.abs(Math.sin(i * 1.3)) * 26, 5, 16, i * 0.5 - 0.8, 0, Math.PI * 2);
        g.fill();
      }
    }),
    mk((g) => { // standing figure
      g.fillStyle = ink;
      g.beginPath(); g.arc(58, 74, 11, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(44, 192); g.lineTo(46, 108) ; g.quadraticCurveTo(58, 86, 72, 106); g.lineTo(76, 158); g.lineTo(66, 160); g.lineTo(64, 192); g.fill();
    }),
    mk((g) => { // floor lamp
      g.fillStyle = ink;
      g.fillRect(84, 96, 4, 78);
      g.fillRect(70, 168, 34, 6);
      g.beginPath(); g.moveTo(72, 96); g.lineTo(102, 96); g.lineTo(96, 70); g.lineTo(78, 70); g.fill();
      const glow = g.createRadialGradient(87, 84, 2, 87, 84, 30);
      glow.addColorStop(0, 'rgba(255,255,235,0.9)');
      glow.addColorStop(1, 'rgba(255,255,235,0)');
      g.fillStyle = glow; g.fillRect(50, 50, 76, 70);
    }),
    mk((g) => { // shelves
      g.fillStyle = ink;
      g.fillRect(18, 58, 92, 5); g.fillRect(18, 100, 92, 5); g.fillRect(18, 142, 92, 5);
      g.fillStyle = soft;
      for (const [x, y, w, h] of [[24, 38, 10, 20], [40, 42, 8, 16], [70, 34, 12, 24], [30, 80, 9, 20], [58, 84, 11, 16], [88, 78, 8, 22], [26, 124, 12, 18], [52, 128, 8, 14], [80, 120, 10, 22]]) g.fillRect(x, y, w, h);
    }),
    mk((g) => { // cat on sill
      g.fillStyle = ink;
      g.beginPath(); g.ellipse(64, 158, 26, 12, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(86, 146, 9, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.moveTo(80, 140); g.lineTo(83, 131); g.lineTo(87, 139); g.fill();
      g.beginPath(); g.moveTo(92, 140); g.lineTo(89, 131); g.lineTo(85, 139); g.fill();
      g.fillRect(36, 150, 5, 16);
    }),
    mk(() => {}), // plain warm room
    mk(() => {}),
  ];
}
const INTERIORS = interiorTextures();

/* ---------- materials ---------- */

const brickTex = brickTexture();
brickTex.repeat.set(2.2, 3.4);
const brickSideTex = brickTex.clone();
brickSideTex.needsUpdate = true;
brickSideTex.repeat.set(2.4, 3.4);
brickSideTex.offset.set(0.37, 0);

const M = {
  brick: new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.94 }),
  brickSide: new THREE.MeshStandardMaterial({ map: brickSideTex, color: '#e5dcd6', roughness: 0.96 }),
  base: new THREE.MeshStandardMaterial({ color: '#38291f', roughness: 0.9 }),
  stone: new THREE.MeshStandardMaterial({ color: '#6d5c4d', roughness: 0.85 }),
  stoneDark: new THREE.MeshStandardMaterial({ color: '#4a3d33', roughness: 0.88 }),
  frame: new THREE.MeshStandardMaterial({ color: '#181310', roughness: 0.72 }),
  door: new THREE.MeshStandardMaterial({ color: '#3a2416', roughness: 0.55, metalness: 0.05 }),
  metal: new THREE.MeshStandardMaterial({ color: '#171a1f', roughness: 0.55, metalness: 0.55 }),
  metalDark: new THREE.MeshStandardMaterial({ color: '#101216', roughness: 0.6, metalness: 0.4 }),
  roof: new THREE.MeshStandardMaterial({ color: '#191b20', roughness: 0.97 }),
  asphalt: new THREE.MeshStandardMaterial({ color: '#262b36', roughness: 0.5, metalness: 0.08 }),
  curb: new THREE.MeshStandardMaterial({ color: '#2e3238', roughness: 0.9 }),
  soil: new THREE.MeshStandardMaterial({ color: '#171219', roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: '#4a3527', roughness: 0.9 }),
  woodDark: new THREE.MeshStandardMaterial({ color: '#221a14', roughness: 0.92 }),
  trunk: new THREE.MeshStandardMaterial({ color: '#2b2019', roughness: 1 }),
  canopy: new THREE.MeshStandardMaterial({ color: '#2c4a37', roughness: 0.95 }),
  neighborA: new THREE.MeshStandardMaterial({ color: '#352b33', roughness: 0.97 }),
  neighborB: new THREE.MeshStandardMaterial({ color: '#312d3a', roughness: 0.97 }),
  hydrant: new THREE.MeshStandardMaterial({ color: '#571f1c', roughness: 0.6 }),
  glassDark: new THREE.MeshStandardMaterial({ color: '#0d1420', roughness: 0.25, metalness: 0.7 }),
  awning: new THREE.MeshStandardMaterial({ color: '#20262c', roughness: 0.9 }),
};

const sideTex = sidewalkTexture();
sideTex.repeat.set(5, 1);
M.sidewalk = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.92 });

/* ---------- helpers ---------- */

const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
};

function collectMerged(parts, mat, { shadow = true } = {}) {
  const geos = parts.map((p) => { p.updateMatrixWorld(); const geo = p.geometry.clone().applyMatrix4(p.matrix); return geo; });
  const merged = new THREE.Mesh(mergeGeometries(geos, false), mat);
  merged.castShadow = shadow;
  merged.receiveShadow = shadow;
  geos.forEach((g2) => g2.dispose());
  return merged;
}

/* ---------- scene graph ---------- */

const rotGroup = new THREE.Group();
rotGroup.rotation.y = -0.38;
scene.add(rotGroup);

/* -- diorama slab -- */
const SLAB_W = 21, SLAB_D = 13.6;
{
  const top = box(SLAB_W, 0.3, SLAB_D, M.asphalt, 0, -0.15, 0);
  top.receiveShadow = true;
  rotGroup.add(top);
  const earth = box(SLAB_W, 1.0, SLAB_D, M.soil, 0, -0.8, 0);
  rotGroup.add(earth);
  const skirt = box(SLAB_W + 0.001, 0.07, SLAB_D + 0.001, M.stone, 0, -0.33, 0);
  rotGroup.add(skirt);
}

/* -- sidewalk + curb along the building street edge -- */
{
  const sw = box(SLAB_W, 0.14, 3.4, M.sidewalk, 0, 0.07, 3.1);
  sw.receiveShadow = true;
  rotGroup.add(sw);
  const curb = box(SLAB_W, 0.16, 0.22, M.curb, 0, 0.04, 4.9);
  curb.receiveShadow = true;
  rotGroup.add(curb);
  // manhole
  const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.02, 24), M.metalDark);
  mh.position.set(3.4, 0.012, 6.4);
  mh.receiveShadow = true;
  rotGroup.add(mh);
}

/* -- the walk-up -- */
const B = { w: 6.6, d: 7.0, x: -2.4, z: -0.6 };
const FLOORS = 6, FLOOR_H = 1.66, GARDEN_H = 1.05, PARAPET = 0.5;
const BODY_H = GARDEN_H + FLOORS * FLOOR_H;
const windows = []; // { mesh, mat, on, warm }
let ventWorld = new THREE.Vector3();
let beacon, beaconLight;

{
  const bld = new THREE.Group();
  bld.position.set(B.x, 0, B.z);
  rotGroup.add(bld);

  // masses
  const front = box(B.w, BODY_H, 0.3, M.brick, 0, BODY_H / 2, B.d / 2 - 0.15);
  const back = box(B.w, BODY_H, 0.3, M.brickSide, 0, BODY_H / 2, -B.d / 2 + 0.15);
  const left = box(0.3, BODY_H, B.d, M.brickSide, -B.w / 2 + 0.15, BODY_H / 2, 0);
  const right = box(0.3, BODY_H, B.d, M.brickSide, B.w / 2 - 0.15, BODY_H / 2, 0);
  const core = box(B.w - 0.4, BODY_H, B.d - 0.4, M.roof, 0, BODY_H / 2 - 0.05, 0);
  [front, back, left, right].forEach((m) => { m.castShadow = true; m.receiveShadow = true; bld.add(m); });
  bld.add(core);

  // brownstone garden base band
  const baseBand = box(B.w + 0.08, GARDEN_H + 0.35, B.d + 0.08, M.base, 0, (GARDEN_H + 0.35) / 2, 0);
  baseBand.castShadow = true; baseBand.receiveShadow = true;
  bld.add(baseBand);

  // parapet + cornice
  const parapet = box(B.w + 0.14, PARAPET, B.d + 0.14, M.brick, 0, BODY_H + PARAPET / 2, 0);
  parapet.castShadow = true;
  bld.add(parapet);
  const cornice = box(B.w + 0.5, 0.16, B.d + 0.5, M.stoneDark, 0, BODY_H + 0.02, 0);
  cornice.castShadow = true;
  bld.add(cornice);
  const dentils = [];
  const dentGeoRef = [];
  for (let i = 0; i < 15; i++) {
    dentils.push(box(0.16, 0.14, 0.2, M.stoneDark, -B.w / 2 + 0.35 + i * ((B.w - 0.7) / 14), BODY_H - 0.14, B.d / 2 + 0.12));
  }
  bld.add(collectMerged(dentils, M.stoneDark));
  dentGeoRef.length = 0;

  // window factory
  const WIN_W = 0.72, WIN_H = 1.08;
  const frameParts = [];
  const sillParts = [];
  const addWindow = (side, fx, fy, opts = {}) => {
    // side: 0 front(+z) 1 right(+x) 2 left(-x)
    const g = new THREE.Group();
    const depth = 0.09;
    const reveal = box(WIN_W + 0.1, WIN_H + 0.1, 0.02, M.frame, 0, 0, -depth);
    const frV = box(0.05, WIN_H, 0.03, M.frame, 0, 0, -depth + 0.03);
    const frH = box(WIN_W, 0.05, 0.03, M.frame, 0, 0.16, -depth + 0.03);
    const glassMat = new THREE.MeshStandardMaterial({ color: '#182234', roughness: 0.45, metalness: 0.35, emissive: '#ffffff', emissiveIntensity: 0 });
    glassMat.emissiveMap = INTERIORS[Math.floor(rng() * INTERIORS.length)];
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(WIN_W - 0.04, WIN_H - 0.04), glassMat);
    glass.position.z = -depth + 0.015;
    const sill = box(WIN_W + 0.22, 0.09, 0.16, M.stone, 0, -WIN_H / 2 - 0.05, 0.02);
    const lintel = box(WIN_W + 0.16, 0.12, 0.1, M.stoneDark, 0, WIN_H / 2 + 0.08, 0);
    g.add(reveal, frV, frH, glass, sill, lintel);
    if (opts.grille) {
      for (let i = -1; i <= 1; i++) g.add(box(0.025, WIN_H - 0.08, 0.02, M.metalDark, i * (WIN_W / 3.2), 0, 0.03));
    }
    if (opts.ac && rng() < 0.5) {
      const ac = box(0.42, 0.26, 0.3, M.metalDark, rand(-0.1, 0.1), -WIN_H / 2 + 0.16, 0.12);
      ac.castShadow = true;
      g.add(ac);
    }
    if (side === 0) { g.position.set(fx, fy, B.d / 2 + depth + 0.002); }
    if (side === 1) { g.rotation.y = Math.PI / 2; g.position.set(B.w / 2 + depth + 0.002, fy, fx); }
    if (side === 2) { g.rotation.y = -Math.PI / 2; g.position.set(-B.w / 2 - depth - 0.002, fy, fx); }
    if (side === 3) { g.rotation.y = Math.PI; g.position.set(fx, fy, -B.d / 2 - depth - 0.002); }
    bld.add(g);
    windows.push({ mat: glassMat, on: false, warm: true, base: 0 });
    return g;
  };

  // front: 4 bays × 6 floors + garden
  const bays = [-2.32, -0.88, 0.88, 2.32];
  for (let f = 0; f < FLOORS; f++) {
    const y = GARDEN_H + f * FLOOR_H + FLOOR_H / 2 + 0.06;
    for (let bIdx = 0; bIdx < 4; bIdx++) {
      if (f === 0 && bIdx === 0) continue; // door bay
      const g = addWindow(0, bays[bIdx], y + (f === 0 ? 0.06 : 0), { ac: f > 0 && f < 5 });
      if (f === 0) g.scale.set(1, 1.22, 1);
    }
  }
  for (const bx of [-0.88, 0.88, 2.32]) addWindow(0, bx, GARDEN_H / 2 + 0.16, { grille: true });

  // sides: 3 columns × 6 floors
  const sideCols = [-2.1, 0, 2.1];
  for (const side of [1, 2]) {
    for (let f = 0; f < FLOORS; f++) {
      const y = GARDEN_H + f * FLOOR_H + FLOOR_H / 2 + 0.06;
      for (const cx of sideCols) {
        addWindow(side, cx, y);
      }
    }
  }
  // rear: 4 bays × 6 floors
  for (let f = 0; f < FLOORS; f++) {
    const y = GARDEN_H + f * FLOOR_H + FLOOR_H / 2 + 0.06;
    for (const bx of bays) addWindow(3, bx, y, { ac: f > 0 && f < 5 });
  }
  void frameParts; void sillParts;

  // floor course lines
  const courses = [];
  for (let f = 1; f <= FLOORS; f++) {
    courses.push(box(B.w + 0.06, 0.07, 0.06, M.stoneDark, 0, GARDEN_H + f * FLOOR_H + 0.02, B.d / 2 + 0.02));
  }
  bld.add(collectMerged(courses, M.stoneDark, { shadow: false }));

  /* street-level entrance at bay 0 */
  {
    const doorX = bays[0];
    const doorFrame = box(1.24, 2.3, 0.14, M.stone, doorX, 1.17, B.d / 2 + 0.04);
    const door = box(0.96, 2.0, 0.08, M.door, doorX, 1.02, B.d / 2 + 0.08);
    door.castShadow = true;
    const transomMat = new THREE.MeshStandardMaterial({ color: '#1c130a', emissive: '#ffc890', emissiveIntensity: 3.4, roughness: 0.4 });
    const transom = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.26), transomMat);
    transom.position.set(doorX, 2.18, B.d / 2 + 0.09);
    bld.add(doorFrame, door, transom);
    const lanternMat = new THREE.MeshStandardMaterial({ color: '#2a1c0c', emissive: '#ffd9a0', emissiveIntensity: 4.2, roughness: 0.5 });
    for (const lx of [doorX - 0.66, doorX + 0.66]) {
      const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), lanternMat);
      lantern.position.set(lx, 1.78, B.d / 2 + 0.1);
      bld.add(lantern);
    }
    const stoopLight = new THREE.PointLight('#ffc27a', 5.2, 8, 2);
    stoopLight.position.set(doorX, 1.9, B.d / 2 + 0.85);
    bld.add(stoopLight);
  }

  /* fire escape over bays 3-4 */
  {
    const fe = new THREE.Group();
    const cx = 1.6, half = 1.55;
    const parts = [];
    for (let f = 1; f <= FLOORS - 1; f++) {
      const y = GARDEN_H + f * FLOOR_H + 0.14;
      parts.push(box(half * 2, 0.05, 0.82, M.metal, cx, y, B.d / 2 + 0.44));
      parts.push(box(half * 2, 0.035, 0.035, M.metal, cx, y + 0.58, B.d / 2 + 0.83));
      parts.push(box(half * 2, 0.028, 0.028, M.metal, cx, y + 0.32, B.d / 2 + 0.83));
      for (let p = 0; p <= 4; p++) parts.push(box(0.03, 0.6, 0.03, M.metal, cx - half + p * (half / 2), y + 0.3, B.d / 2 + 0.83));
      // zigzag stair to the next platform, alternating direction each floor
      if (f < FLOORS - 1) {
        const dir = f % 2 === 0 ? 1 : -1;
        const stair = new THREE.Group();
        for (const sx of [-0.24, 0.24]) stair.add(box(0.04, FLOOR_H * 1.18, 0.04, M.metal, sx, 0, 0));
        for (let r = 0; r < 7; r++) stair.add(box(0.44, 0.032, 0.09, M.metal, 0, -FLOOR_H * 0.52 + r * (FLOOR_H * 1.04 / 6), 0));
        stair.position.set(cx + dir * 0.72, y + FLOOR_H / 2 + 0.12, B.d / 2 + 0.56);
        stair.rotation.x = -0.5;
        stair.updateMatrixWorld(true);
        stair.traverse((n) => { if (n.isMesh) { n.updateMatrixWorld(true); const g2 = n.geometry.clone().applyMatrix4(n.matrixWorld); parts.push(new THREE.Mesh(g2, M.metal)); } });
      }
    }
    // hanging drop ladder below the first platform
    for (const lx of [1.38, 1.82]) parts.push(box(0.035, 1.2, 0.035, M.metal, lx, GARDEN_H + 0.98, B.d / 2 + 0.5));
    for (let r = 0; r < 4; r++) parts.push(box(0.48, 0.03, 0.03, M.metal, 1.6, GARDEN_H + 0.52 + r * 0.3, B.d / 2 + 0.5));
    const merged = collectMerged(parts.map((p) => { p.updateMatrix(); return p; }), M.metal);
    fe.add(merged);
    bld.add(fe);
  }

  /* roofscape */
  {
    const roofY = BODY_H + 0.05;
    const bulkhead = box(1.7, 1.1, 1.9, M.brickSide, -1.7, roofY + 0.55, -1.4);
    bulkhead.castShadow = true;
    const bulkDoor = box(0.7, 0.85, 0.05, M.door, -1.7, roofY + 0.46, -0.44);
    const ac = box(1.0, 0.62, 0.8, M.metalDark, 1.4, roofY + 0.31, -2.0);
    ac.castShadow = true;
    const pipe = box(0.09, 0.8, 0.09, M.metalDark, 2.6, roofY + 0.4, 0.6);
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.55, 10), M.metalDark);
    vent.position.set(0.6, roofY + 0.27, -0.6);
    vent.castShadow = true;
    const ventCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10), M.metal);
    ventCap.position.set(0.6, roofY + 0.58, -0.6);
    bld.add(bulkhead, bulkDoor, ac, pipe, vent, ventCap);
    vent.getWorldPosition(ventWorld);

    /* water tower */
    const tower = new THREE.Group();
    const legH = 1.5, tankH = 1.9, tankR = 1.05;
    for (const [lx, lz] of [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]]) {
      const leg = box(0.09, legH, 0.09, M.metalDark, lx, legH / 2, lz);
      leg.castShadow = true;
      tower.add(leg);
    }
    tower.add(box(1.62, 0.07, 0.07, M.metalDark, 0, legH * 0.55, -0.72));
    tower.add(box(1.62, 0.07, 0.07, M.metalDark, 0, legH * 0.55, 0.72));
    tower.add(box(0.07, 0.07, 1.62, M.metalDark, -0.72, legH * 0.55, 0));
    tower.add(box(0.07, 0.07, 1.62, M.metalDark, 0.72, legH * 0.55, 0));
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(tankR * 0.92, tankR, tankH, 14), M.wood);
    tank.position.y = legH + tankH / 2;
    tank.castShadow = true;
    tower.add(tank);
    for (const hy of [0.3, 0.9, 1.5]) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(tankR * (1 - hy * 0.028), 0.028, 6, 20), M.metalDark);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = legH + hy;
      tower.add(hoop);
    }
    const cone = new THREE.Mesh(new THREE.ConeGeometry(tankR * 1.06, 0.8, 14), M.woodDark);
    cone.position.y = legH + tankH + 0.4;
    cone.castShadow = true;
    tower.add(cone);
    const mast = box(0.05, 0.55, 0.05, M.metalDark, 0, legH + tankH + 1.05, 0);
    tower.add(mast);
    const beaconMat = new THREE.MeshStandardMaterial({ color: '#30090a', emissive: '#ff3b30', emissiveIntensity: 0.2 });
    beacon = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), beaconMat);
    beacon.position.set(0, legH + tankH + 1.36, 0);
    tower.add(beacon);
    beaconLight = new THREE.PointLight('#ff3b30', 0, 7, 2);
    beaconLight.position.copy(beacon.position);
    tower.add(beaconLight);
    tower.position.set(1.1, roofY, 0.9);
    tower.rotation.y = 0.35;
    bld.add(tower);
  }
}

/* -- neighbors -- */
function neighbor(w, h, d, mat, litColor, litRatio) {
  const g = new THREE.Group();
  const mass = box(w, h, d, mat, 0, h / 2, 0);
  mass.castShadow = true; mass.receiveShadow = true;
  g.add(mass);
  g.add(box(w + 0.14, 0.14, d + 0.14, M.roof, 0, h + 0.05, 0));
  const litParts = [], darkParts = [];
  const cols = Math.max(2, Math.floor(w / 1.15));
  const rows = Math.max(2, Math.floor(h / 1.6));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = -w / 2 + (c + 0.5) * (w / cols);
      const wy = 0.9 + r * ((h - 1.3) / rows);
      const win = box(0.52, 0.78, 0.04, M.frame, wx, wy, d / 2 + 0.02);
      (rng() < litRatio ? litParts : darkParts).push(win);
    }
  }
  if (litParts.length) {
    const litMat = new THREE.MeshStandardMaterial({ color: '#20150b', emissive: litColor, emissiveIntensity: 1.9, roughness: 0.6 });
    g.add(collectMerged(litParts, litMat, { shadow: false }));
  }
  if (darkParts.length) g.add(collectMerged(darkParts, M.glassDark, { shadow: false }));
  return g;
}

{
  const nA = neighbor(5.6, 7.2, 6.2, M.neighborA, '#ffbf8d', 0.3);
  nA.position.set(-8.0, 0, -3.4);
  nA.rotation.y = 0.06;
  rotGroup.add(nA);

  const nB = neighbor(5.0, 5.4, 6.0, M.neighborB, '#ffd2a1', 0.26);
  nB.position.set(5.6, 0, -3.8);
  nB.rotation.y = -0.05;
  rotGroup.add(nB);

}

/* -- street furniture -- */
const lampLights = [];
function streetLamp(x, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.6, 10), M.metalDark);
  pole.position.y = 1.8;
  pole.castShadow = true;
  g.add(pole);
  const arm = box(0.95, 0.06, 0.06, M.metalDark, 0.42, 3.52, 0);
  g.add(arm);
  const headMat = new THREE.MeshStandardMaterial({ color: '#1a130a', emissive: '#ffc37a', emissiveIntensity: 5.2 });
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.16, 10), headMat);
  head.position.set(0.86, 3.44, 0);
  g.add(head);
  const light = new THREE.PointLight('#ffb266', 14, 17, 2);
  light.position.set(0.86, 3.3, 0);
  g.add(light);
  lampLights.push(light);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowSprite('rgba(255,190,120,1)'), transparent: true, opacity: 0.5, depthWrite: false }));
  sprite.scale.setScalar(2.3);
  sprite.position.set(0.86, 3.44, 0);
  g.add(sprite);
  g.position.set(x, 0.14, z);
  return g;
}

{
  const l1 = streetLamp(-6.6, 3.6); l1.rotation.y = 0.2; rotGroup.add(l1);
  const l2 = streetLamp(3.2, 3.7); l2.rotation.y = -0.35; rotGroup.add(l2);

  // hydrant
  const hyd = new THREE.Group();
  const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.52, 10), M.hydrant);
  hb.position.y = 0.4; hb.castShadow = true;
  const hc = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), M.hydrant);
  hc.position.y = 0.68;
  hyd.add(hb, hc, box(0.4, 0.07, 0.07, M.hydrant, 0, 0.46, 0));
  hyd.position.set(-4.4, 0.14, 4.1);
  rotGroup.add(hyd);

  // trash cans by the stoop
  for (const [tx, tz, ry] of [[-5.3, 2.2, 0.4], [-5.75, 2.55, 1.2]]) {
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.72, 12), M.metal);
    can.position.set(tx, 0.5, tz);
    can.rotation.y = ry;
    can.castShadow = true;
    rotGroup.add(can);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 12), M.metalDark);
    lid.position.set(tx, 0.89, tz);
    rotGroup.add(lid);
  }
}

/* -- trees -- */
const canopies = [];
M.canopyLight = new THREE.MeshStandardMaterial({ color: '#3d5c46', roughness: 0.95 });
function foliageGeo(r) {
  const geo = new THREE.IcosahedronGeometry(r, 1);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const k = 1 + (rng() - 0.5) * 0.42;
    v.multiplyScalar(k);
    pos.setXYZ(i, v.x, v.y * (0.82 + rng() * 0.2), v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
function tree(x, z, s = 1) {
  const g = new THREE.Group();
  const pit = box(1.1, 0.05, 1.1, M.soil, 0, 0.12, 0);
  g.add(pit);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.14 * s, 2.1 * s, 8), M.trunk);
  trunk.position.y = 1.05 * s + 0.1;
  trunk.castShadow = true;
  g.add(trunk);
  const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.04 * s, 0.06 * s, 0.9 * s, 6), M.trunk);
  limb.position.set(0.28 * s, 2.0 * s, 0.1 * s);
  limb.rotation.z = -0.7;
  g.add(limb);
  const canopy = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Mesh(foliageGeo(rand(0.42, 0.78) * s), i % 3 === 0 ? M.canopyLight : M.canopy);
    b.position.set(rand(-0.85, 0.85) * s, rand(-0.3, 0.75) * s, rand(-0.85, 0.85) * s);
    b.castShadow = true;
    canopy.add(b);
  }
  canopy.position.y = 2.5 * s;
  g.add(canopy);
  canopies.push(canopy);
  g.position.set(x, 0, z);
  return g;
}

rotGroup.add(tree(6.9, 3.3, 1.05), tree(-9.1, 3.4, 0.9));

/* -- backdrop (does not rotate) -- */
{
  const geo = new THREE.CylinderGeometry(58, 58, 46, 48, 1, true, Math.PI * 0.55, Math.PI * 1.9);
  const mat = new THREE.MeshBasicMaterial({ map: backdropTexture(), side: THREE.BackSide, fog: false });
  const dome = new THREE.Mesh(geo, mat);
  dome.position.y = 14;
  scene.add(dome);
}

/* ---------- lighting ---------- */

scene.add(new THREE.HemisphereLight('#4a5a94', '#241a24', 3.1));
const moon = new THREE.DirectionalLight('#c9cfe6', 5.0);
moon.position.set(-8, 22, 22);
moon.castShadow = true;
moon.shadow.mapSize.setScalar(isMobile ? 1024 : 2048);
moon.shadow.camera.left = -15; moon.shadow.camera.right = 15;
moon.shadow.camera.top = 20; moon.shadow.camera.bottom = -4;
moon.shadow.camera.far = 70;
moon.shadow.bias = -0.0002;
moon.shadow.normalBias = 0.035;
moon.shadow.radius = 2;
scene.add(moon);
scene.add(moon.target);
const streetBounce = new THREE.PointLight('#ff9d5c', 9.5, 22, 2);
streetBounce.position.set(0, 2.0, 5.2);
scene.add(streetBounce);

/* ---------- window life ---------- */

for (const w of windows) {
  const lit = rng() < 0.68;
  w.warm = rng() > 0.1;
  w.on = lit;
  w.base = lit ? rand(1.45, 2.15) : 0;
  if (!w.warm) {
    w.mat.emissive = new THREE.Color('#cfe2ff');
    w.mat.emissiveMap = null;
    w.base = lit ? rand(1.1, 1.6) : 0;
  }
  w.mat.emissiveIntensity = w.base;
  w.target = w.base;
  w.speed = 0;
}

let nextToggle = 2.8;
function windowLife(t, dt) {
  if (reduceMotion) return;
  if (t > nextToggle) {
    nextToggle = t + rand(2.4, 5.6);
    const w = windows[Math.floor(rng() * windows.length)];
    w.on = !w.on;
    w.target = w.on ? (w.warm ? rand(1.45, 2.15) : rand(1.1, 1.6)) : 0;
  }
  for (const w of windows) {
    const cur = w.mat.emissiveIntensity;
    if (Math.abs(cur - w.target) > 0.01) {
      w.mat.emissiveIntensity = THREE.MathUtils.damp(cur, w.target, 1.6, dt);
    }
  }
}

/* ---------- steam ---------- */

const steamGroup = new THREE.Group();
rotGroup.add(steamGroup);
const puffs = [];
if (!reduceMotion) {
  const tex = steamTexture();
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
    s.position.copy(ventWorld);
    steamGroup.add(s);
    puffs.push({ s, t: i * 1.35, dur: rand(5, 7), sway: rand(1, 2.4) });
  }
}

function steamLife(dt) {
  for (const p of puffs) {
    p.t += dt;
    if (p.t > p.dur) { p.t = 0; p.dur = rand(5, 7); p.sway = rand(1, 2.4); }
    const k = p.t / p.dur;
    p.s.position.set(ventWorld.x + Math.sin(p.t * p.sway) * 0.16 + k * 0.5, ventWorld.y + 0.25 + k * 1.9, ventWorld.z);
    p.s.scale.setScalar(0.4 + k * 1.5);
    p.s.material.opacity = Math.sin(Math.PI * k) * 0.16;
  }
}

/* ---------- framing + camera rig ---------- */

const CENTER = new THREE.Vector3(0, 0, 0);
let heroDist = 30, heroAz = 0.62;
const HERO_POLAR = 1.22;
let polar = HERO_POLAR, targetPolar = HERO_POLAR;
let dollyFrac = 1, targetDollyFrac = 1;

function computeFraming() {
  const bb = new THREE.Box3().setFromObject(rotGroup);
  const rXZ = 0.8 * Math.max(Math.abs(bb.min.x), Math.abs(bb.max.x), Math.abs(bb.min.z), Math.abs(bb.max.z));
  const top = bb.max.y, bottom = bb.min.y;
  const cy = (top + bottom) / 2;
  CENTER.set(0, cy + 0.4, 0);
  const halfH = (top - bottom) / 2 + 0.4;
  const sphere = Math.sqrt(rXZ * rXZ + halfH * halfH);
  const aspect = innerWidth / innerHeight;
  const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
  const hFov = Math.atan(Math.tan(vFov) * aspect);
  const margin = aspect < 0.8 ? 0.95 : 0.98;
  heroDist = (sphere * margin) / Math.tan(Math.min(vFov, hFov));
}

function placeCamera(az, dist, pol, look = CENTER) {
  camera.position.set(
    CENTER.x + Math.sin(pol) * Math.sin(az) * dist,
    CENTER.y + Math.cos(pol) * dist,
    CENTER.z + Math.sin(pol) * Math.cos(az) * dist
  );
  camera.lookAt(look);
}

/* ---------- opening pan ---------- */

let mode = reduceMotion ? 'live' : 'pan';
let panT = 0;
const PAN_DUR = 4.6;
const panFrom = { az: heroAz + 0.9, dist: 0.34, polar: 1.44 };
const panLook = new THREE.Vector3(B.x - 2.3, 2.2, B.z + B.d / 2 + 0.9);
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function panStep(dt) {
  panT += dt;
  const k = easeInOut(Math.min(1, panT / PAN_DUR));
  const az = THREE.MathUtils.lerp(panFrom.az, heroAz, k);
  const dist = THREE.MathUtils.lerp(heroDist * panFrom.dist, heroDist, k);
  const pol = THREE.MathUtils.lerp(panFrom.polar, HERO_POLAR, k);
  const look = panLook.clone().lerp(CENTER, k);
  placeCamera(az, dist, pol, look);
  if (panT >= PAN_DUR) mode = 'live';
}

function skipPan() {
  if (mode === 'pan' && panT > 0.2) { panT = PAN_DUR; }
}

/* ---------- interaction ---------- */

let spinVel = 0;
const IDLE_SPIN = reduceMotion ? 0 : (Math.PI * 2) / 78;
let idleBlend = 1;
let lastInteract = -10;
let dragging = false;
let lastX = 0, lastY = 0;
const pointers = new Map();
let pinchDist = 0;

canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic or stale pointer */ }
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 1) {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    canvas.classList.add('is-dragging');
  } else if (pointers.size === 2) {
    const pts = [...pointers.values()];
    pinchDist = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
  }
  skipPan();
  lastInteract = clockTime;
  hint.classList.add('is-out');
});

canvas.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const pts = [...pointers.values()];
    const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    if (pinchDist > 0) {
      targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac * (pinchDist / d), 0.34, 1.12);
    }
    pinchDist = d;
    lastInteract = clockTime;
    return;
  }
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX; lastY = e.clientY;
  spinVel = dx * 0.0042;
  rotGroup.rotation.y += spinVel;
  targetPolar = THREE.MathUtils.clamp(targetPolar - dy * 0.0035, 0.42, 1.42);
  lastInteract = clockTime;
});

const endPointer = (e) => {
  pointers.delete(e.pointerId);
  if (pointers.size < 2) pinchDist = 0;
  if (pointers.size === 0) {
    dragging = false;
    canvas.classList.remove('is-dragging');
  }
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac + e.deltaY * 0.0011, 0.34, 1.12);
  skipPan();
  lastInteract = clockTime;
}, { passive: false });

/* ---------- beacon ---------- */

function beaconLife(t) {
  if (!beacon) return;
  if (reduceMotion) {
    beacon.material.emissiveIntensity = 1.1 + Math.sin(t * 1.2) * 0.5;
    return;
  }
  const phase = t % 2.3;
  const on = phase < 0.14 ? 1 : phase < 0.24 ? (0.24 - phase) / 0.1 : 0;
  beacon.material.emissiveIntensity = 0.2 + on * 2.6;
  beaconLight.intensity = on * 1.4;
}

/* ---------- post ---------- */

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), isMobile ? 0.42 : 0.5, 0.45, 0.85);
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
      float vig = smoothstep(0.92, 0.32, length(q));
      col.rgb *= mix(0.72, 1.0, vig);
      float g = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 60.0) - 0.5;
      col.rgb *= vec3(1.07, 1.0, 0.90);
      float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      col.rgb += g * 0.012 * (0.35 + lum);
      gl_FragColor = col;
    }`,
};
const finishPass = new ShaderPass(FinishShader);
composer.addPass(finishPass);

/* ---------- resize ---------- */

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  computeFraming();
}
window.addEventListener('resize', resize);

/* ---------- loop ---------- */

const clock = new THREE.Clock();
let clockTime = 0;
let firstFrame = false;
let running = true;

document.addEventListener('visibilitychange', () => {
  running = !document.hidden;
  if (running) clock.getDelta();
});

setProgress(0.75);
computeFraming();
resize();

function frame() {
  requestAnimationFrame(frame);
  if (!running) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  clockTime += dt;
  const t = clockTime;

  // turntable + inertia
  if (mode === 'live') {
    if (dragging) {
      idleBlend = 0;
    } else {
      spinVel *= Math.pow(0.06, dt); // inertia decay
      const sinceTouch = t - lastInteract;
      if (sinceTouch > 2.6) idleBlend = Math.min(1, idleBlend + dt / 1.4);
      rotGroup.rotation.y += spinVel + IDLE_SPIN * easeInOut(idleBlend) * dt;
    }
    dollyFrac = THREE.MathUtils.damp(dollyFrac, targetDollyFrac, 4.5, dt);
    polar = THREE.MathUtils.damp(polar, targetPolar, 5.5, dt);
    placeCamera(heroAz, heroDist * dollyFrac, polar);
  } else {
    rotGroup.rotation.y += IDLE_SPIN * 0.4 * dt;
    panStep(dt);
  }

  windowLife(t, dt);
  steamLife(dt);
  beaconLife(t);
  if (!reduceMotion) {
    for (let i = 0; i < canopies.length; i++) {
      canopies[i].rotation.z = Math.sin(t * 0.55 + i * 2.1) * 0.014;
      canopies[i].rotation.x = Math.cos(t * 0.41 + i * 1.3) * 0.01;
    }
  }

  finishPass.uniforms.uTime.value = t;
  composer.render();

  if (!firstFrame) {
    firstFrame = true;
    setProgress(1);
    veil.classList.add('is-done');
    plate.classList.add('is-in');
    if (!reduceMotion) setTimeout(() => hint.classList.add('is-in'), 2600);
    setTimeout(() => hint.classList.add('is-out'), 9000);
  }
}

frame();

/* dev/verify hook */
window.__walkupPose = (rotY, dolly = 1, pol = HERO_POLAR) => { rotGroup.rotation.y = rotY; targetDollyFrac = dolly; dollyFrac = dolly; targetPolar = pol; polar = pol; lastInteract = clockTime; idleBlend = 0; };
window.__walkupInfo = () => ({
  calls: renderer.info.render.calls,
  tris: renderer.info.render.triangles,
  mode,
  rotY: rotGroup.rotation.y,
  windows: windows.length,
});
