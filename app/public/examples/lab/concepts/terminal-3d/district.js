import * as THREE from 'https://esm.sh/three@0.164.1';
import { EffectComposer } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';

/* ---------- setup ---------- */

const canvas = document.querySelector('[data-scene]');
const veil = document.querySelector('[data-veil]');
const veilFill = document.querySelector('[data-veil-fill]');
const plate = document.querySelector('[data-plate]');
const hint = document.querySelector('[data-hint]');
const cardEl = document.querySelector('[data-card]');
const cardBar = document.querySelector('[data-card-bar]');
const cardKicker = document.querySelector('[data-card-kicker]');
const cardTitle = document.querySelector('[data-card-title]');
const cardBody = document.querySelector('[data-card-body]');
const cardIndex = document.querySelector('[data-card-index]');

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

const scene = new THREE.Scene();
scene.background = new THREE.Color('#241148');
scene.fog = new THREE.FogExp2('#2c1656', 0.0075);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 240);

const rng = (() => { let s = 20260202; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const rand = (a, b) => a + rng() * (b - a);

const ACCENTS = {
  cyan: '#33e6ff',
  magenta: '#ff3ec8',
  amber: '#ffb02e',
  lime: '#9dff3e',
  violet: '#a06bff',
  coral: '#ff6a4d',
};

/* ---------- canvas textures ---------- */

function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 2048; c.height = 512;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#2a1157');
  sky.addColorStop(0.42, '#5b2192');
  sky.addColorStop(0.7, '#a4359e');
  sky.addColorStop(0.88, '#e05a86');
  sky.addColorStop(1, '#ff8a5c');
  g.fillStyle = sky; g.fillRect(0, 0, 2048, 512);
  // synth sun low on the horizon band, soft
  const sx = 645, sy = 352;
  const sg = g.createRadialGradient(sx, sy, 3, sx, sy, 105);
  sg.addColorStop(0, 'rgba(255,214,140,0.6)');
  sg.addColorStop(0.3, 'rgba(255,160,110,0.35)');
  sg.addColorStop(1, 'rgba(255,160,110,0)');
  g.fillStyle = sg; g.fillRect(sx - 160, sy - 160, 320, 320);
  g.fillStyle = 'rgba(255,236,196,0.82)';
  g.beginPath(); g.arc(sx, sy, 15, 0, Math.PI * 2); g.fill();
  // horizon shimmer lines through the sun
  g.fillStyle = 'rgba(90,26,120,0.55)';
  for (let i = 0; i < 4; i++) g.fillRect(sx - 40 - i * 12, sy - 7 + i * 7, 80 + i * 24, 2 + i);
  // tinted stars upper sky
  for (let i = 0; i < 180; i++) {
    const y = Math.pow(rng(), 1.6) * 250;
    const tint = ['214,236,255', '255,214,244', '255,238,204'][Math.floor(rng() * 3)];
    g.fillStyle = `rgba(${tint},${rand(0.2, 0.8).toFixed(2)})`;
    g.beginPath(); g.arc(rand(0, 2048), y, rand(0.5, 1.5), 0, Math.PI * 2); g.fill();
  }
  // far silhouette skyline, distant and airy
  let x = 0;
  while (x < 2048) {
    const w = rand(34, 90), h = rand(14, 52);
    g.fillStyle = 'rgba(64,28,112,0.85)';
    g.fillRect(x, 452 - h, w, h + 60);
    for (let wy = 458 - h; wy < 500; wy += 9) {
      for (let wx = x + 4; wx < x + w - 4; wx += 10) {
        if (rng() < 0.3) {
          g.fillStyle = `rgba(255,${180 + Math.round(rng() * 60)},170,${rand(0.25, 0.7).toFixed(2)})`;
          g.fillRect(wx, wy, 3, 4);
        }
      }
    }
    x += w + rand(4, 18);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function gridTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 704;
  const g = c.getContext('2d');
  g.fillStyle = '#221040'; g.fillRect(0, 0, 1024, 704);
  const cell = 32;
  // minor grid
  g.strokeStyle = 'rgba(122,84,214,0.4)';
  g.lineWidth = 1;
  for (let x = 0; x <= 1024; x += cell) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 704); g.stroke(); }
  for (let y = 0; y <= 704; y += cell) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  // major glow lines with gradient
  const major = g.createLinearGradient(0, 0, 1024, 704);
  major.addColorStop(0, 'rgba(51,230,255,0.9)');
  major.addColorStop(0.5, 'rgba(160,107,255,0.9)');
  major.addColorStop(1, 'rgba(255,62,200,0.9)');
  g.strokeStyle = major;
  g.lineWidth = 2.5;
  for (let x = 0; x <= 1024; x += cell * 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 704); g.stroke(); }
  for (let y = 0; y <= 704; y += cell * 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
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
      const a = hot ? 1 : rand(0.35, 0.8);
      g.fillStyle = hot
        ? 'rgba(255,255,255,0.98)'
        : `rgba(${Math.round(col.r * 255)},${Math.round(col.g * 255)},${Math.round(col.b * 255)},${a.toFixed(2)})`;
      g.fillRect(k * cw + 3, r * ch + 3, cw - 6, ch - 7);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  return t;
}

function signTexture(text, accent) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 144;
  const g = c.getContext('2d');
  g.fillStyle = '#14082c'; g.fillRect(0, 0, 384, 144);
  g.strokeStyle = accent;
  g.lineWidth = 5;
  g.shadowColor = accent;
  g.shadowBlur = 16;
  g.lineWidth = 7;
  g.strokeRect(12, 12, 360, 120);
  g.font = '800 66px "Barlow Condensed", Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  g.shadowBlur = 26;
  g.fillText(text, 192, 78);
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

/* ---------- scene graph ---------- */

const rotGroup = new THREE.Group();
rotGroup.rotation.y = -0.32;
scene.add(rotGroup);

const SLAB_W = 26, SLAB_D = 18;
const pulseTargets = []; // { mat, base, speed, phase }
const edgeMats = [];
const signMats = [];
const builders = []; // { group, finalY, order } for build-in

/* -- slab + grid floor -- */
{
  const gridTex = gridTexture();
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#2a1650',
    map: gridTex,
    emissive: '#ffffff',
    emissiveMap: gridTex,
    emissiveIntensity: 0.72,
    roughness: 0.65,
    metalness: 0.15,
  });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, 0.3, SLAB_D), floorMat);
  floor.position.y = -0.15;
  rotGroup.add(floor);
  pulseTargets.push({ mat: floorMat, base: 0.72, speed: 0.7, phase: 0 });

  const under = new THREE.Mesh(new THREE.BoxGeometry(SLAB_W, 1.1, SLAB_D), new THREE.MeshStandardMaterial({ color: '#170b30', roughness: 1 }));
  under.position.y = -0.86;
  rotGroup.add(under);

  // rim light strips
  const rimMat = new THREE.MeshBasicMaterial({ color: ACCENTS.cyan });
  const mk = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), rimMat);
    m.position.set(x, -0.02, z);
    rotGroup.add(m);
  };
  mk(SLAB_W + 0.08, 0.1, 0, SLAB_D / 2 + 0.02);
  mk(SLAB_W + 0.08, 0.1, 0, -SLAB_D / 2 - 0.02);
  mk(0.1, SLAB_D + 0.08, SLAB_W / 2 + 0.02, 0);
  mk(0.1, SLAB_D + 0.08, -SLAB_W / 2 - 0.02, 0);
  const rimPulse = { mat: rimMat, base: 1, speed: 1.1, phase: 1.4 };
  rimMat.userData = rimPulse;
}

/* -- neon building factory -- */
function neonBuilding({ w, h, d, x, z, accent, density = 0.5, order = 1, ry = 0 }) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: '#2b1a52', roughness: 0.55, metalness: 0.25 });
  const winTex = windowsTexture(accent, density);
  const winMat = new THREE.MeshStandardMaterial({
    color: '#1c0f3a',
    emissive: '#ffffff',
    emissiveMap: winTex,
    emissiveIntensity: rand(1.15, 1.6),
    roughness: 0.4,
    metalness: 0.3,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat);
  body.position.y = h / 2;
  g.add(body);
  // window planes on all four faces
  const faces = [
    [0, h / 2, d / 2 + 0.012, 0],
    [0, h / 2, -d / 2 - 0.012, Math.PI],
    [w / 2 + 0.012, h / 2, 0, Math.PI / 2],
    [-w / 2 - 0.012, h / 2, 0, -Math.PI / 2],
  ];
  for (const [fx, fy, fz, fry] of faces) {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(fry) === Math.PI / 2 ? d * 0.92 : w * 0.92, h * 0.94), winMat);
    plane.position.set(fx, fy, fz);
    plane.rotation.y = fry;
    g.add(plane);
  }
  // neon edges
  const eMat = new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.95 });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), eMat);
  edges.position.y = h / 2;
  g.add(edges);
  edgeMats.push(eMat);
  // roof glow slab
  const roofMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.85 });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.08, d * 0.4), roofMat);
  roof.position.y = h + 0.04;
  g.add(roof);

  g.position.set(x, 0, z);
  g.rotation.y = ry;
  rotGroup.add(g);
  pulseTargets.push({ mat: winMat, base: winMat.emissiveIntensity, speed: rand(0.5, 1.1), phase: rand(0, 6.28) });
  builders.push({ group: g, order });
  return g;
}

/* -- storefront strip (small business block) -- */
const SHOPS = [
  { name: 'PIZZA', accent: ACCENTS.coral },
  { name: 'BODEGA', accent: ACCENTS.lime },
  { name: 'CUTS', accent: ACCENTS.cyan },
  { name: 'NAILS', accent: ACCENTS.magenta },
  { name: 'CAFÉ', accent: ACCENTS.amber },
];

{
  const stripX0 = -9.6, unitW = 2.35;
  SHOPS.forEach((shop, i) => {
    const g = new THREE.Group();
    const h = rand(2.3, 2.9);
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#2e1c56', roughness: 0.6, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(unitW - 0.14, h, 3.1), bodyMat);
    body.position.y = h / 2;
    g.add(body);
    const eMat = new THREE.LineBasicMaterial({ color: shop.accent, transparent: true, opacity: 0.95 });
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(unitW - 0.14, h, 3.1)), eMat);
    edges.position.y = h / 2;
    g.add(edges);
    edgeMats.push(eMat);
    // glowing shopfront band
    const frontMat = new THREE.MeshBasicMaterial({ color: shop.accent, transparent: true, opacity: 0.4 });
    const front = new THREE.Mesh(new THREE.PlaneGeometry(unitW - 0.5, 0.72), frontMat);
    front.position.set(0, 0.62, 1.57);
    g.add(front);
    // door slit
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.15), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.55 }));
    door.position.set(unitW / 2 - 0.62, 0.58, 1.571);
    g.add(door);
    // awning
    const awn = new THREE.Mesh(new THREE.BoxGeometry(unitW - 0.3, 0.06, 0.7), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.8 }));
    awn.position.set(0, 1.32, 1.85);
    awn.rotation.x = 0.18;
    g.add(awn);
    const awnEdge = new THREE.Mesh(new THREE.BoxGeometry(unitW - 0.3, 0.045, 0.05), new THREE.MeshBasicMaterial({ color: shop.accent }));
    awnEdge.position.set(0, 1.27, 2.2);
    g.add(awnEdge);
    // neon sign
    const signMat = new THREE.MeshBasicMaterial({ map: signTexture(shop.name, shop.accent), transparent: true });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.64), signMat);
    sign.position.set(0, h + 0.42, 1.35);
    g.add(sign);
    const signBack = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.72, 0.1), new THREE.MeshStandardMaterial({ color: '#180c30', roughness: 0.7 }));
    signBack.position.set(0, h + 0.42, 1.28);
    g.add(signBack);
    signMats.push({ mat: signMat, t: rand(2, 9), busy: 0 });
    // roof AC cube
    const ac = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.5), new THREE.MeshStandardMaterial({ color: '#3a2766', roughness: 0.8 }));
    ac.position.set(rand(-0.5, 0.5), h + 0.16, rand(-0.7, 0.3));
    g.add(ac);

    g.position.set(stripX0 + i * unitW, 0, 4.1);
    rotGroup.add(g);
    builders.push({ group: g, order: 0 });
  });
}

/* -- mid-rises + tower -- */
neonBuilding({ w: 4.4, h: 6.8, d: 4.2, x: -8.6, z: -3.6, accent: ACCENTS.violet, density: 0.55, order: 2, ry: 0.04 });
neonBuilding({ w: 3.4, h: 9.4, d: 3.4, x: -3.2, z: -4.6, accent: ACCENTS.cyan, density: 0.5, order: 3, ry: -0.03 });
neonBuilding({ w: 3.8, h: 5.2, d: 3.6, x: 1.6, z: -3.8, accent: ACCENTS.amber, density: 0.6, order: 2 });

let crownMat, crownLight;
{
  // the anchor tower: three setbacks
  const tx = 7.6, tz = -3.2, accent = ACCENTS.magenta;
  const tower = new THREE.Group();
  const tiers = [
    { w: 5.2, h: 7.5, d: 5.0, y: 0 },
    { w: 4.0, h: 4.6, d: 3.9, y: 7.5 },
    { w: 2.8, h: 3.4, d: 2.7, y: 12.1 },
  ];
  for (const tier of tiers) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: '#301c5e', roughness: 0.5, metalness: 0.3 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(tier.w, tier.h, tier.d), bodyMat);
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
    pulseTargets.push({ mat: winMat, base: 1.35, speed: rand(0.5, 0.9), phase: rand(0, 6) });
  }
  // vertical light strips on the base tier
  for (const sx of [-1.8, 1.8]) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 7.2, 0.1), new THREE.MeshBasicMaterial({ color: ACCENTS.cyan, transparent: true, opacity: 0.9 }));
    strip.position.set(sx, 3.75, tiers[0].d / 2 + 0.08);
    tower.add(strip);
  }
  // crown
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

  tower.position.set(tx, 0, tz);
  tower.rotation.y = -0.06;
  rotGroup.add(tower);
  builders.push({ group: tower, order: 4 });
}

/* -- street poles + neon trees -- */
{
  const orbTexC = orbTexture(ACCENTS.cyan);
  const orbTexM = orbTexture(ACCENTS.magenta);
  const poles = [[-11.2, 1.8, orbTexC], [-1.5, 1.6, orbTexM], [5.2, 1.9, orbTexC], [11, 1.7, orbTexM]];
  for (const [px, pz, tex] of poles) {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 8), new THREE.MeshStandardMaterial({ color: '#1a0d34', roughness: 0.6, metalness: 0.5 }));
    pole.position.y = 1.6;
    g.add(pole);
    const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false }));
    orb.scale.setScalar(0.9);
    orb.position.y = 3.35;
    g.add(orb);
    g.position.set(px, 0, pz);
    rotGroup.add(g);
    builders.push({ group: g, order: 3 });
  }

  const treeAccents = [ACCENTS.lime, ACCENTS.cyan, ACCENTS.violet];
  [[-12.2, 5.8], [0.6, 6.1], [11.6, 5.6]].forEach(([tx2, tz2], i) => {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.1, 6), new THREE.MeshStandardMaterial({ color: '#241245', roughness: 0.8 }));
    trunk.position.y = 0.55;
    g.add(trunk);
    const ball = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.72, 1)),
      new THREE.LineBasicMaterial({ color: treeAccents[i], transparent: true, opacity: 0.85 })
    );
    ball.position.y = 1.65;
    g.add(ball);
    g.position.set(tx2, 0, tz2);
    rotGroup.add(g);
    builders.push({ group: g, order: 2 });
  });
}

/* -- data pulses along the streets -- */
const pulses = [];
if (!reduceMotion) {
  const routes = [
    [new THREE.Vector3(-13, 0.1, 2.4), new THREE.Vector3(13, 0.1, 2.4)],
    [new THREE.Vector3(13, 0.1, 1.4), new THREE.Vector3(-13, 0.1, 1.4)],
    [new THREE.Vector3(-5.9, 0.1, 9), new THREE.Vector3(-5.9, 0.1, -9)],
    [new THREE.Vector3(4.2, 0.1, -9), new THREE.Vector3(4.2, 0.1, 9)],
    [new THREE.Vector3(-13, 0.1, -1.6), new THREE.Vector3(13, 0.1, -1.6)],
  ];
  const colors = [ACCENTS.cyan, ACCENTS.magenta, ACCENTS.amber, ACCENTS.lime, ACCENTS.coral];
  for (let i = 0; i < 9; i++) {
    const route = routes[i % routes.length];
    const mat = new THREE.MeshBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.07, 0.15), mat);
    const dirV = route[1].clone().sub(route[0]);
    m.rotation.y = Math.abs(dirV.x) > Math.abs(dirV.z) ? 0 : Math.PI / 2;
    rotGroup.add(m);
    pulses.push({ m, a: route[0], b: route[1], t: rng(), speed: rand(0.06, 0.16) });
  }
}

/* -- sky dome -- */
{
  const dome = new THREE.Mesh(
    new THREE.CylinderGeometry(62, 62, 46, 48, 1, true, Math.PI * 0.55, Math.PI * 1.9),
    new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false })
  );
  dome.position.y = 12;
  scene.add(dome);
}

/* ---------- lighting ---------- */

scene.add(new THREE.HemisphereLight('#7a5bd6', '#2a1548', 2.6));
const key = new THREE.DirectionalLight('#ffd9c2', 2.2);
key.position.set(-14, 20, 18);
scene.add(key);
const rim = new THREE.DirectionalLight('#39d8ff', 1.6);
rim.position.set(16, 14, -16);
scene.add(rim);

/* ---------- beacons + focus ---------- */

const BEACONS = [
  {
    anchor: new THREE.Vector3(-9.6 + 0 * 2.35, 3.9, 4.4),
    dir: new THREE.Vector3(-0.25, 0.42, 1).normalize(), dist: 7.5,
    down: 1.5, accent: ACCENTS.coral, kicker: 'Small business block',
    title: 'Live in two weeks.',
    body: 'A full storefront site — booking, payments, menus — launched while the paint is still wet. Every small shop on this strip runs one.',
  },
  {
    anchor: new THREE.Vector3(-7.25, 3.7, 4.4),
    dir: new THREE.Vector3(0.3, 0.36, 1).normalize(), dist: 7,
    down: 1.4, accent: ACCENTS.lime, kicker: 'Local signal',
    title: 'Found by the neighborhood.',
    body: 'Local SEO wiring puts the bodega on the map — literally. Google Business, reviews, and search all point at the same front door.',
  },
  {
    anchor: new THREE.Vector3(-8.6, 7.6, -3.6),
    dir: new THREE.Vector3(-0.75, 0.35, 0.9).normalize(), dist: 9,
    down: 2.4, accent: ACCENTS.violet, kicker: 'Growing teams',
    title: 'Systems that follow up.',
    body: 'Intake, scheduling, invoicing, and follow-up wired into one path — the mid-rise version of a business that never drops a lead.',
  },
  {
    anchor: new THREE.Vector3(7.6, 16, -3.2),
    dir: new THREE.Vector3(0.85, 0.3, 1).normalize(), dist: 11,
    down: 3.6, accent: ACCENTS.magenta, kicker: 'Big business polish',
    title: '98+ performance scores.',
    body: 'Enterprise-grade builds: sub-second loads, accessibility passes, and Lighthouse numbers the big towers brag about.',
  },
  {
    anchor: new THREE.Vector3(-1, 0.6, 1.9),
    dir: new THREE.Vector3(0.15, 0.85, 0.7).normalize(), dist: 8,
    down: 0.1, accent: ACCENTS.cyan, kicker: 'The grid',
    title: 'Every signal tracked.',
    body: 'Those pulses are calls, bookings, and form fills moving through the block — one dashboard shows where every one came from.',
  },
  {
    anchor: new THREE.Vector3(11.6, 2.6, 5.6),
    dir: new THREE.Vector3(0.7, 0.4, 1).normalize(), dist: 7,
    down: 0.9, accent: ACCENTS.amber, kicker: 'The district',
    title: 'One studio, whole block.',
    body: 'LittleFight builds at every scale on this street — sites, systems, brand, and content that share one signal path.',
  },
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

/* ---------- camera rig ---------- */

const CENTER = new THREE.Vector3(0, 0, 0);
let heroDist = 34, heroAz = 0.56;
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

/* ---------- modes: build → live ⇄ focus ---------- */

let mode = 'build';
let buildT = 0;
const BUILD_DUR = reduceMotion ? 0 : 3.6;
let focusIdx = -1;
const tween = { active: false, t: 0, dur: 1.15, fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromLook: new THREE.Vector3(), toLook: new THREE.Vector3(), then: null };
const savedPose = { az: heroAz, polar: HERO_POLAR, dolly: 1 };
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);

function startTween(toPos, toLook, dur, then) {
  tween.active = true;
  tween.t = 0;
  tween.dur = reduceMotion ? 0.01 : dur;
  tween.fromPos.copy(camera.position);
  tween.fromLook.copy(lookPoint);
  tween.toPos.copy(toPos);
  tween.toLook.copy(toLook);
  tween.then = then || null;
}

function beaconWorld(i) {
  const v = BEACONS[i].anchor.clone();
  return rotGroup.localToWorld(v);
}

function focusBeacon(i) {
  focusIdx = i;
  const b = BEACONS[i];
  const anchorW = beaconWorld(i);
  const dirW = b.dir.clone().applyQuaternion(rotGroup.quaternion).normalize();
  const camPos = anchorW.clone().add(dirW.multiplyScalar(b.dist));
  camPos.y = Math.max(camPos.y, 1.2);
  const lookW = anchorW.clone();
  lookW.y -= b.down || 1;
  mode = 'flying';
  hideCard();
  startTween(camPos, lookW, 1.15, () => {
    mode = 'focused';
    showCard(i);
  });
}

function releaseFocus() {
  if (mode !== 'focused' && mode !== 'flying') return;
  hideCard();
  focusIdx = -1;
  mode = 'flying';
  const toPos = freeCameraPos(savedPose.az, heroDist * savedPose.dolly, savedPose.polar);
  startTween(toPos, CENTER.clone(), 1.0, () => { mode = 'live'; });
}

function showCard(i) {
  const b = BEACONS[i];
  cardBar.style.background = b.accent;
  cardBar.style.color = b.accent;
  cardKicker.textContent = b.kicker;
  cardTitle.textContent = b.title;
  cardBody.textContent = b.body;
  cardIndex.textContent = `${i + 1} / ${BEACONS.length}`;
  cardEl.hidden = false;
  requestAnimationFrame(() => cardEl.classList.add('is-open'));
}

function hideCard() {
  cardEl.classList.remove('is-open');
  setTimeout(() => { if (mode !== 'focused') cardEl.hidden = true; }, 360);
}

document.querySelector('[data-card-close]').addEventListener('click', releaseFocus);
document.querySelector('[data-card-prev]').addEventListener('click', () => focusBeacon((focusIdx - 1 + BEACONS.length) % BEACONS.length));
document.querySelector('[data-card-next]').addEventListener('click', () => focusBeacon((focusIdx + 1) % BEACONS.length));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') releaseFocus(); });

/* ---------- interaction ---------- */

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

function pickBeacon(clientX, clientY) {
  ndc.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(beaconSprites, false);
  return hits.length ? hits[0].object.userData.beacon : -1;
}

canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic or stale pointer */ }
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
  lastInteract = clockTime;
  hint.classList.add('is-out');
});

canvas.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const pts = [...pointers.values()];
    const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    if (pinchDist > 0 && mode === 'live') {
      targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac * (pinchDist / d), 0.3, 1.12);
    }
    pinchDist = d;
    lastInteract = clockTime;
    return;
  }
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  moved += Math.abs(dx) + Math.abs(dy);
  lastX = e.clientX; lastY = e.clientY;
  if (mode !== 'live') return;
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
  if (!wasTap) return;
  if (mode === 'live') {
    const hit = pickBeacon(e.clientX, e.clientY);
    if (hit >= 0) {
      savedPose.az = Math.atan2(camera.position.x - CENTER.x, camera.position.z - CENTER.z);
      savedPose.polar = polar;
      savedPose.dolly = dollyFrac;
      focusBeacon(hit);
    }
  } else if (mode === 'focused') {
    const hit = pickBeacon(e.clientX, e.clientY);
    if (hit >= 0 && hit !== focusIdx) focusBeacon(hit);
    else releaseFocus();
  }
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); dragging = false; });

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (mode !== 'live') return;
  targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac + e.deltaY * 0.0011, 0.3, 1.12);
  lastInteract = clockTime;
}, { passive: false });

if (!isMobile) {
  let hoverTick = 0;
  canvas.addEventListener('pointermove', (e) => {
    if (dragging || (mode !== 'live' && mode !== 'focused')) return;
    if (++hoverTick % 4 !== 0) return;
    canvas.classList.toggle('is-hot', pickBeacon(e.clientX, e.clientY) >= 0);
  });
}

/* ---------- post ---------- */

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

/* ---------- resize ---------- */

function resize() {
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  computeFraming();
}
window.addEventListener('resize', resize);

/* ---------- build-in choreography ---------- */

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
  // beacons pop at the end
  const bk = THREE.MathUtils.clamp((buildT - (BUILD_DUR - 0.9)) / 0.7, 0, 1);
  const be = bk < 0.6 ? bk / 0.6 * 1.45 : 1.45 - (bk - 0.6) / 0.4 * 0.33;
  beaconSprites.forEach((s, i) => { s.scale.setScalar(Math.max(0.001, be * (1 + (i % 3) * 0.05))); });
  if (buildT >= BUILD_DUR && done) {
    mode = 'live';
    beaconSprites.forEach((s) => s.scale.setScalar(0.85));
  }
}

if (reduceMotion) {
  builders.forEach((b) => { b.group.scale.y = 1; });
  beaconSprites.forEach((s) => s.scale.setScalar(1.12));
  mode = 'live';
}

/* ---------- loop ---------- */

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
camera.position.copy(freeCameraPos(heroAz, heroDist, HERO_POLAR));
camera.lookAt(lookPoint);

function frame() {
  requestAnimationFrame(frame);
  if (!running) return;
  const dt = Math.min(clock.getDelta(), 0.05);
  clockTime += dt;
  const t = clockTime;

  // camera
  if (tween.active) {
    tween.t += dt;
    const k = smoother(THREE.MathUtils.clamp(tween.t / tween.dur, 0, 1));
    camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
    lookPoint.lerpVectors(tween.fromLook, tween.toLook, k);
    camera.lookAt(lookPoint);
    if (tween.t >= tween.dur) {
      tween.active = false;
      if (tween.then) tween.then();
    }
  } else if (mode === 'live') {
    if (dragging) {
      idleBlend = 0;
    } else {
      spinVel *= Math.pow(0.06, dt);
      if (t - lastInteract > 2.6) idleBlend = Math.min(1, idleBlend + dt / 1.6);
      rotGroup.rotation.y += spinVel + IDLE_SPIN * smoother(idleBlend) * dt;
    }
    dollyFrac = THREE.MathUtils.damp(dollyFrac, targetDollyFrac, 4.5, dt);
    polar = THREE.MathUtils.damp(polar, targetPolar, 5.5, dt);
    camera.position.copy(freeCameraPos(Math.atan2(camera.position.x - CENTER.x, camera.position.z - CENTER.z) * 0 + heroAz, heroDist * dollyFrac, polar));
    lookPoint.lerp(CENTER, Math.min(1, dt * 6));
    camera.lookAt(lookPoint);
  } else if (mode === 'build') {
    rotGroup.rotation.y += IDLE_SPIN * 0.5 * dt;
    buildStep(dt);
  } else if (mode === 'focused') {
    const anchorW = beaconWorld(focusIdx);
    anchorW.y -= BEACONS[focusIdx].down || 1;
    lookPoint.lerp(anchorW, Math.min(1, dt * 8));
    camera.lookAt(lookPoint);
  }

  // pulse systems
  if (!reduceMotion) {
    for (const p of pulseTargets) {
      p.mat.emissiveIntensity = p.base * (0.86 + 0.14 * Math.sin(t * p.speed + p.phase));
    }
    const crownPulse = 0.55 + 0.45 * Math.sin(t * 1.7);
    if (crownMat) crownMat.opacity = 0.5 + crownPulse * 0.5;
    if (crownLight) crownLight.intensity = 2.5 + crownPulse * 6;
    for (const em of edgeMats) em.opacity = 0.8 + 0.2 * Math.sin(t * 0.9 + em.id * 0.7);
    // neon sign buzz
    for (const s of signMats) {
      s.t -= dt;
      if (s.busy > 0) {
        s.busy -= dt;
        s.mat.opacity = Math.random() < 0.5 ? 0.45 : 1;
        if (s.busy <= 0) s.mat.opacity = 1;
      } else if (s.t <= 0) {
        s.t = rand(4, 12);
        s.busy = 0.35;
      }
    }
    for (const p of pulses) {
      p.t += p.speed * dt * 10;
      if (p.t > 1) p.t -= 1;
      p.m.position.lerpVectors(p.a, p.b, p.t);
      p.m.material.opacity = 0.5 + 0.5 * Math.sin(p.t * Math.PI);
    }
    const bs = 1.12 + 0.11 * Math.sin(t * 2.1);
    if (mode !== 'build') beaconSprites.forEach((s, i) => {
      const active = i === focusIdx;
      s.scale.setScalar(active ? 0.92 : bs);
      s.material.opacity = focusIdx >= 0 ? (active ? 0.7 : 0.35) : 0.98;
      s.position.y = BEACONS[i].anchor.y + Math.sin(t * 1.3 + i) * 0.12;
    });
  }

  finishPass.uniforms.uTime.value = t;
  composer.render();

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

/* dev/verify hooks */
window.__districtInfo = () => ({ mode, focusIdx, rotY: rotGroup.rotation.y, beacons: BEACONS.length, calls: renderer.info.render.calls });
window.__districtPose = (rotY, dolly = 1, pol = HERO_POLAR) => { rotGroup.rotation.y = rotY; targetDollyFrac = dolly; dollyFrac = dolly; targetPolar = pol; polar = pol; lastInteract = clockTime; idleBlend = 0; };
window.__districtPick = (x, y) => pickBeacon(x, y);
window.__districtFocus = (i) => { if (i < 0) releaseFocus(); else { savedPose.az = heroAz; savedPose.polar = polar; savedPose.dolly = dollyFrac; focusBeacon(i); } };
