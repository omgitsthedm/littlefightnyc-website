/* main.js — composition root: renderer, camera rig (free/ease/chase/attract/scrub/photo),
   UI (chips/ticker/HUD/audio), build-in, aesthetics, and the acceptance tests (?test=1). */

import * as THREE from 'https://esm.sh/three@0.164.1';
import { EffectComposer } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.164.1/examples/jsm/postprocessing/ShaderPass.js';
import { mergeGeometries } from 'https://esm.sh/three@0.164.1/examples/jsm/utils/BufferGeometryUtils.js';
import { Reflector } from 'https://esm.sh/three@0.164.1/examples/jsm/objects/Reflector.js';
import { CITY, ART, ACCENTS } from './city.js';
import { buildWorld } from './world.js';
import { makeSystems } from './systems.js';

/* ---------- dom ---------- */
const $ = (s) => document.querySelector(s);
const canvas = $('[data-scene]');
const veil = $('[data-veil]'), veilFill = $('[data-veil-fill]');
const plate = $('[data-plate]'), hint = $('[data-hint]');
const chipEl = $('[data-chip]'), chipBar = $('[data-chip-bar]'), chipKicker = $('[data-chip-kicker]');
const chipTitle = $('[data-chip-title]'), chipBody = $('[data-chip-body]'), chipStats = $('[data-chip-stats]');
const hudEl = $('[data-hud]'), tickerEl = $('[data-ticker]'), audioBtn = $('[data-audio]');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 500;
const TESTMODE = new URLSearchParams(location.search).has('test');

const setProgress = (p) => { if (veilFill) veilFill.style.width = `${Math.round(p * 100)}%`; };
setProgress(0.25);

/* ---------- renderer ---------- */
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
} catch (err) {
  veil.querySelector('.veil__mark').textContent = 'This device could not start WebGL.';
  throw err;
}
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = ART.exposure;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.75 : 2));
renderer.info.autoReset = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#241148');
scene.fog = new THREE.FogExp2('#2c1656', ART.fogDensity);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 240);

const rng = (() => { let s = 20260202; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
const rand = (a, b) => a + rng() * (b - a);
const pick = (arr) => arr[Math.floor(rng() * arr.length)];

/* ---------- world + systems ---------- */
const world = buildWorld(THREE, scene, { rng, rand, pick, isMobile, reduceMotion, mergeGeometries, Reflector });
setProgress(0.55);

const tickerQueue = [];
function pushTicker(msg) {
  tickerQueue.push(msg);
  if (tickerQueue.length > 6) tickerQueue.shift();
  tickerEl.textContent = tickerQueue.join('   ···   ');
}

let chipDirty = false;
const sys = makeSystems(THREE, world, {
  rng, rand, pick, reduceMotion, isMobile, scene,
  onTicker: pushTicker,
  onEventUI: () => { chipDirty = true; },
});
const S = sys.state;
pushTicker(`DAY ${S.persist.day} in the district — ${S.persist.allTime.toLocaleString()} signals all-time`);
setProgress(0.75);

/* ---------- signal posts ---------- */
const sigTops = [], sigBots = [];
for (const p of CITY.roads.signalPosts) {
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
  g.position.set(p.x, 0, p.z);
  g.rotation.y = p.ry;
  world.rotGroup.add(g);
  world.builders.push({ group: g, order: 3 });
  sigTops.push(mTop); sigBots.push(mBot);
}
function signalVisuals() {
  const ew = S.signal.state === 'EW', ns = S.signal.state === 'NS';
  for (const m of sigTops) m.color.set(ew ? '#39ff8a' : '#183c28');
  for (const m of sigBots) m.color.set(ns ? '#39ff8a' : '#3c1418');
}

/* ---------- sky domes ---------- */
const SKY_ORDER = ['dawn', 'day', 'golden', 'night'];
const skyTex = { golden: world.skyTexture('golden'), night: world.skyTexture('night') };
const lazySkies = () => { if (!skyTex.dawn) { skyTex.dawn = world.skyTexture('dawn'); skyTex.day = world.skyTexture('day'); } };
if ('requestIdleCallback' in window) requestIdleCallback(lazySkies); else setTimeout(lazySkies, 1200);
const domeGeo = new THREE.CylinderGeometry(62, 62, 46, 48, 1, true, Math.PI * 0.55, Math.PI * 1.9);
const domeMatA = new THREE.MeshBasicMaterial({ map: skyTex.golden, side: THREE.BackSide, fog: false });
const domeMatB = new THREE.MeshBasicMaterial({ map: skyTex.night, side: THREE.BackSide, fog: false, transparent: true, opacity: 0 });
const domeA = new THREE.Mesh(domeGeo, domeMatA);
const domeB = new THREE.Mesh(domeGeo, domeMatB);
domeA.position.y = 12; domeB.position.y = 12;
domeB.renderOrder = 1;
scene.add(domeA, domeB);
function skyStep() {
  const t = S.dayT;
  const idx = (t < 0.13 || t >= 0.98) ? 0 : t < 0.45 ? 1 : t < 0.62 ? 2 : 3;
  const edges = [0.13, 0.45, 0.62, 0.98];
  let blend = 0;
  for (const e of edges) { const d = t - e; if (d >= -0.05 && d < 0) blend = (d + 0.05) / 0.05; }
  const texA = skyTex[SKY_ORDER[idx]] || skyTex.golden;
  const texB = skyTex[SKY_ORDER[(idx + 1) % 4]] || skyTex.golden;
  if (domeMatA.map !== texA) domeMatA.map = texA;
  if (domeMatB.map !== texB) domeMatB.map = texB;
  domeMatB.opacity = blend;
}

/* ---------- lights ---------- */
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

/* ---------- post ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), isMobile ? ART.bloom.strengthMobile : ART.bloom.strength, ART.bloom.radius, ART.bloom.threshold);
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

/* ---------- camera rig ---------- */
const CENTER = new THREE.Vector3(0, 0, 0);
let heroDist = 34, viewAz = 0.56;
const HERO_POLAR = 1.2;
let polar = HERO_POLAR, targetPolar = HERO_POLAR;
let dollyFrac = 1, targetDollyFrac = 1;
const lookPoint = new THREE.Vector3();
let mode = 'build';
let buildT = 0;
const BUILD_DUR = reduceMotion ? 0 : 3.6;
const tween = { active: false, t: 0, dur: 1.1, fromPos: new THREE.Vector3(), toPos: new THREE.Vector3(), fromLook: new THREE.Vector3(), toLook: new THREE.Vector3() };
const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10);
const attract = { on: false, idx: 0, t: 0 };
const chase = { on: false, car: null };
let clockTime = 0, lastInteract = 0, idleBlend = 1, spinVel = 0;
const IDLE_SPIN = reduceMotion ? 0 : (Math.PI * 2) / 85;

function computeFraming() {
  const bb = new THREE.Box3().setFromObject(world.rotGroup);
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
  dollyFrac = targetDollyFrac = THREE.MathUtils.clamp(dist / heroDist, 0.24, 1.15);
}
function startTween(toPos, toLook, dur) {
  tween.active = true; tween.t = 0;
  tween.dur = reduceMotion ? 0.01 : dur;
  tween.fromPos.copy(camera.position);
  tween.fromLook.copy(lookPoint);
  tween.toPos.copy(toPos);
  tween.toLook.copy(toLook);
}
function easeToBeacon(i) {
  const b = CITY.beacons[i];
  world.rotGroup.updateMatrixWorld();
  const anchorW = new THREE.Vector3(...b.anchor).applyMatrix4(world.rotGroup.matrixWorld);
  const dirW = new THREE.Vector3(...b.dir).normalize().applyQuaternion(world.rotGroup.quaternion);
  const camPos = anchorW.clone().add(dirW.multiplyScalar(b.dist));
  camPos.y = Math.max(camPos.y, 1.3);
  const lookW = anchorW.clone(); lookW.y -= b.down || 1;
  startTween(camPos, lookW, 1.1);
}
const ATTRACT_POSES = [
  { az: 0.2, polar: 1.34, dolly: 0.5, look: [-6, 2, 4] },
  { az: 1.7, polar: 1.02, dolly: 0.52, look: [7.6, 9, -3.2] },
  { az: -1.1, polar: 0.78, dolly: 0.8, look: [0, 2, 0] },
  { az: 0.7, polar: 1.38, dolly: 0.44, look: [4.2, 0.8, 2] },
];
function startAttractPose() {
  const p = ATTRACT_POSES[attract.idx % ATTRACT_POSES.length];
  world.rotGroup.updateMatrixWorld();
  startTween(freeCameraPos(viewAz + p.az, heroDist * p.dolly, p.polar), new THREE.Vector3(...p.look).applyMatrix4(world.rotGroup.matrixWorld), 2.0);
  attract.t = 0;
}
function startChase(car) {
  chase.on = true;
  chase.car = car;
  chipClose();
  attract.on = false;
  pushTicker(car.cab ? 'Riding the cab — tap anywhere to hop out' : 'Riding along — tap anywhere to hop out');
}
function chaseStep(dt) {
  const c = chase.car;
  if (!c || !c.m.visible) { endChase(); return; }
  world.rotGroup.updateMatrixWorld();
  const carW = c.m.getWorldPosition(new THREE.Vector3());
  const dirW = new THREE.Vector3(Math.cos(c.m.rotation.y), 0, -Math.sin(c.m.rotation.y)).applyQuaternion(world.rotGroup.quaternion);
  const camPos = carW.clone().sub(dirW.clone().multiplyScalar(2.6)).add(new THREE.Vector3(0, 1.5, 0));
  camera.position.lerp(camPos, Math.min(1, dt * 5));
  const ahead = carW.clone().add(dirW.multiplyScalar(2.2));
  lookPoint.lerp(ahead, Math.min(1, dt * 6));
  camera.lookAt(lookPoint);
}
function endChase() {
  chase.on = false;
  chase.car = null;
  adoptCameraPose();
}

/* time scrub: drag the sky (top quarter of the screen) to move the sun */
let scrubbing = false;

/* ---------- chips ---------- */
let chipIdx = -1, chipCitizen = -1;
function chipOpenBiz(i) {
  attract.on = false;
  endChaseSilent();
  chipCitizen = -1;
  chipIdx = i;
  const b = CITY.beacons[i];
  const biz = CITY.businesses[b.biz];
  chipBar.style.background = biz.accent;
  chipBar.style.color = biz.accent;
  chipKicker.textContent = i === 6 && S.reno.open ? 'Launched today' : b.kicker;
  chipTitle.textContent = i === 6 && S.reno.open ? 'TACOS is open.' : b.title;
  chipBody.textContent = b.body;
  renderChipStats();
  chipEl.hidden = false;
  requestAnimationFrame(() => chipEl.classList.add('is-open'));
  easeToBeacon(i);
}
function chipOpenCitizen(ci) {
  attract.on = false;
  endChaseSilent();
  chipIdx = -1;
  chipCitizen = ci;
  const cz = S.citizens[ci];
  const biz = CITY.businesses[cz.works];
  chipBar.style.background = biz.accent;
  chipBar.style.color = biz.accent;
  chipKicker.textContent = `Citizen · works at ${biz.name}`;
  chipTitle.textContent = cz.name;
  chipBody.textContent = cz.activity ? `Right now: ${cz.activity}.` : 'Living the district life.';
  renderChipStats();
  chipEl.hidden = false;
  requestAnimationFrame(() => chipEl.classList.add('is-open'));
}
function endChaseSilent() { if (chase.on) { chase.on = false; chase.car = null; adoptCameraPose(); } }
function chipClose() {
  chipIdx = -1; chipCitizen = -1;
  chipEl.classList.remove('is-open');
  setTimeout(() => { if (chipIdx < 0 && chipCitizen < 0) chipEl.hidden = true; }, 300);
}
function renderChipStats() {
  if (chipCitizen >= 0) {
    const cz = S.citizens[chipCitizen];
    chipBody.textContent = `Right now: ${cz.activity}.`;
    chipStats.innerHTML = `<div style="grid-column:1/-1"><dt>Day log</dt>${cz.log.slice(-3).map((l) => `<dd style="font-size:12px;font-family:ui-monospace,monospace">${l}</dd>`).join('') || '<dd style="font-size:12px">just woke up</dd>'}</div>`;
    return;
  }
  if (chipIdx < 0) return;
  const b = CITY.beacons[chipIdx];
  const s = S.biz[b.biz];
  const biz = CITY.businesses[b.biz];
  const rows = [];
  if (b.biz === 9) {
    const total = S.biz.reduce((n, x) => n + x.orders, 0);
    rows.push(['District events', `${total}`]);
    rows.push(['Signals / min', `${S.sim.evtWindow.length}`]);
    rows.push(['Beam in', `${12 - (S.sim.events % 12)} <em>events</em>`]);
    rows.push(['All-time', `${(S.persist.allTime + S.sim.events).toLocaleString()} <em>day ${S.persist.day}</em>`]);
  } else {
    rows.push([biz.kind === 'shop' ? 'Orders today' : 'Leads today', `${s.orders}`]);
    rows.push(['Calls routed', `${s.calls}`]);
    rows.push(['Signal', `${s.signalPct.toFixed(1)}<em>%</em>`]);
    rows.push(['Clock', `${sys.dayClock(S.dayT)} <em>${S.phase}</em>`]);
  }
  chipStats.innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  if (S.sim.history.length > 2) {
    const cnv = document.createElement('canvas');
    cnv.width = 240; cnv.height = 30;
    const g = cnv.getContext('2d');
    const maxV = Math.max(4, ...S.sim.history);
    g.strokeStyle = biz.accent; g.lineWidth = 2;
    g.beginPath();
    S.sim.history.forEach((v, i) => {
      const x = i / (S.sim.history.length - 1) * 236 + 2;
      const y = 27 - (v / maxV) * 23;
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    });
    g.stroke();
    g.globalAlpha = 0.18;
    g.lineTo(238, 29); g.lineTo(2, 29); g.closePath();
    g.fillStyle = biz.accent; g.fill();
    const holder = document.createElement('div');
    holder.style.gridColumn = '1 / -1';
    const dt2 = document.createElement('dt');
    dt2.textContent = 'Signals / min · trend';
    holder.appendChild(dt2);
    cnv.style.cssText = 'width:100%;height:15px;display:block;margin-top:2px';
    holder.appendChild(cnv);
    chipStats.appendChild(holder);
  }
}
const _v = new THREE.Vector3();
function chipTrack() {
  if (chipIdx < 0 && chipCitizen < 0) return;
  if (chipCitizen >= 0) _v.copy(S.citizens[chipCitizen].m.position).add(new THREE.Vector3(0, 0.6, 0)).applyMatrix4(world.rotGroup.matrixWorld);
  else _v.set(...CITY.beacons[chipIdx].anchor).applyMatrix4(world.rotGroup.matrixWorld);
  _v.project(camera);
  if (_v.z > 1) { chipEl.style.opacity = '0'; return; }
  chipEl.style.opacity = '';
  const px = (_v.x * 0.5 + 0.5) * innerWidth;
  const py = (-_v.y * 0.5 + 0.5) * innerHeight;
  const w = chipEl.offsetWidth || 300, h = chipEl.offsetHeight || 180;
  let x = px + 18;
  if (x + w > innerWidth - 12) x = px - w - 18;
  let y = THREE.MathUtils.clamp(py - h * 0.4, 12, innerHeight - h - 120);
  x = THREE.MathUtils.clamp(x, 8, innerWidth - w - 8);
  chipEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
$('[data-chip-close]').addEventListener('click', chipClose);
$('[data-chip-prev]').addEventListener('click', () => chipOpenBiz(((chipIdx < 0 ? 0 : chipIdx) - 1 + CITY.beacons.length) % CITY.beacons.length));
$('[data-chip-next]').addEventListener('click', () => chipOpenBiz(((chipIdx < 0 ? -1 : chipIdx) + 1) % CITY.beacons.length));

/* ---------- input ---------- */
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const pointers = new Map();
let dragging = false, moved = 0, lastX = 0, lastY = 0, pinchDist = 0, hoverIdx = -1;

function pickBeacon(cx, cy) {
  ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(world.beaconSprites, false);
  return hits.length ? hits[0].object.userData.beacon : -1;
}
function pickCar(cx, cy) {
  ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  for (const c of S.cars) {
    const hits = raycaster.intersectObject(c.m, true);
    if (hits.length) return c;
  }
  return null;
}
function pickCitizen(cx, cy) {
  ndc.set((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  for (const cz of S.citizens) {
    if (!cz.m.visible) continue;
    const hits = raycaster.intersectObject(cz.m, true);
    if (hits.length) return cz.i;
  }
  return -1;
}
function userInterrupt() {
  attract.on = false;
  if (tween.active) { tween.active = false; adoptCameraPose(); }
  lastInteract = clockTime;
}
canvas.addEventListener('pointerdown', (e) => {
  try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic */ }
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  moved = 0;
  scrubbing = !chase.on && e.clientY < innerHeight * 0.22 && pointers.size === 1 && mode === 'free';
  if (pointers.size === 1) {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    canvas.classList.add('is-dragging');
  } else if (pointers.size === 2) {
    const pts = [...pointers.values()];
    pinchDist = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    scrubbing = false;
  }
  if (mode === 'build' && buildT > 0.4) buildT = BUILD_DUR;
  if (chase.on) return;
  userInterrupt();
  hint.classList.add('is-out');
});
canvas.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 2) {
    const pts = [...pointers.values()];
    const d = Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]);
    if (pinchDist > 0 && mode === 'free' && !chase.on) {
      targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac * (pinchDist / d), 0.24, 1.15);
    }
    pinchDist = d;
    lastInteract = clockTime;
    return;
  }
  if (!dragging || mode !== 'free' || chase.on) return;
  const dx = e.clientX - lastX, dy = e.clientY - lastY;
  moved += Math.abs(dx) + Math.abs(dy);
  lastX = e.clientX; lastY = e.clientY;
  if (scrubbing) {
    S.timeHeld = true;
    S.dayT = ((S.dayT + dx / innerWidth * 0.5) % 1 + 1) % 1;
    sys.audio.ding && null;
    return;
  }
  spinVel = dx * 0.0042;
  world.rotGroup.rotation.y += spinVel;
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
    if (scrubbing) { scrubbing = false; setTimeout(() => { S.timeHeld = false; }, 1200); }
  }
  if (!wasTap || mode === 'build') return;
  if (chase.on) { endChase(); return; }
  const hit = pickBeacon(e.clientX, e.clientY);
  if (hit >= 0) { chipOpenBiz(hit); return; }
  const car = pickCar(e.clientX, e.clientY);
  if (car) { startChase(car); return; }
  const ci = pickCitizen(e.clientX, e.clientY);
  if (ci >= 0) { chipOpenCitizen(ci); return; }
  if (chipIdx >= 0 || chipCitizen >= 0) chipClose();
};
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); dragging = false; });
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  if (mode === 'build' || chase.on) return;
  userInterrupt();
  targetDollyFrac = THREE.MathUtils.clamp(targetDollyFrac + e.deltaY * 0.0011, 0.24, 1.15);
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
let hudOn = false;
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (chase.on) endChase(); else chipClose(); }
  if (e.key === '`' || e.key === '~') { hudOn = !hudOn; hudEl.hidden = !hudOn; }
  if (e.key === 'p' || e.key === 'P') photoMode();
});
audioBtn.addEventListener('click', () => {
  const on = sys.audio.toggle();
  audioBtn.classList.toggle('is-on', on);
  audioBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
});

/* photo mode */
let photoBusy = false;
function photoMode() {
  if (photoBusy) return;
  photoBusy = true;
  const hidden = [plate, hint, chipEl, hudEl, tickerEl, audioBtn, document.querySelector('.lab-concept-shell'), document.querySelector('.lab-concept-hint')].filter(Boolean);
  const prev = hidden.map((el) => el.style.visibility);
  hidden.forEach((el) => { el.style.visibility = 'hidden'; });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      canvas.toBlob((blob) => {
        if (blob) {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `neon-district-day${S.persist.day}.png`;
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        }
        hidden.forEach((el, i) => { el.style.visibility = prev[i]; });
        photoBusy = false;
      }, 'image/png');
    });
  });
}

/* ---------- build-in ---------- */
for (const b of world.builders) {
  b.delay = reduceMotion ? 0 : 0.5 + b.order * 0.5 + rng() * 0.35;
  if (!reduceMotion) b.group.scale.y = 0.001;
}
function buildStep(dt) {
  buildT += dt;
  let done = true;
  for (const b of world.builders) {
    const k = THREE.MathUtils.clamp((buildT - b.delay) / 1.1, 0, 1);
    if (k < 1) done = false;
    const e = 1 - Math.pow(1 - k, 3);
    const over = k > 0 && k < 1 ? 1 + Math.sin(k * Math.PI) * 0.06 : 1;
    b.group.scale.y = Math.max(0.001, e * over);
  }
  const bk = THREE.MathUtils.clamp((buildT - (BUILD_DUR - 0.9)) / 0.7, 0, 1);
  const be = bk < 0.6 ? bk / 0.6 * 1.45 : 1.45 - (bk - 0.6) / 0.4 * 0.33;
  world.beaconSprites.forEach((s, i) => s.scale.setScalar(Math.max(0.001, be * (1 + (i % 3) * 0.05))));
  if (buildT >= BUILD_DUR && done) {
    mode = 'free';
    world.beaconSprites.forEach((s) => s.scale.setScalar(1.12));
  }
}
if (reduceMotion) {
  world.builders.forEach((b) => { b.group.scale.y = 1; });
  world.beaconSprites.forEach((s) => s.scale.setScalar(1.12));
  mode = 'free';
}

/* ---------- hud ---------- */
let fpsAvg = 60, hudAcc = 0;
function hudStep(dt) {
  fpsAvg = fpsAvg * 0.95 + (1 / Math.max(dt, 0.001)) * 0.05;
  if (!hudOn) return;
  hudAcc += dt;
  if (hudAcc < 0.25) return;
  hudAcc = 0;
  const info = renderer.info.render;
  hudEl.textContent =
    `FPS ${Math.round(fpsAvg)} · CALLS ${info.calls} · TRIS ${(info.triangles / 1000).toFixed(0)}k · WIN ${world.windows.length}\n` +
    `ENTITIES cars ${S.cars.length} · citizens ${S.citizens.length} · courier ${S.courier && S.courier.state !== 'idle' ? 'out' : 'home'}\n` +
    `SIM tick ${S.sim.tick} · events ${S.sim.events} · ${S.sim.evtWindow.length}/min · reno ${S.reno.open ? 'OPEN' : 'stage ' + S.reno.stage}\n` +
    `CLOCK ${sys.dayClock(S.dayT)} · ${S.phase} · signal ${S.signal.state} · wx ${S.weather.v > 0.5 ? 'RAIN' : 'CLEAR'} · DAY ${S.persist.day}${chase.on ? ' · CHASE' : ''}${attract.on ? ' · ATTRACT' : ''}`;
}

/* ---------- loop ---------- */
const clock = new THREE.Clock();
let firstFrame = false, running = true;
document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) clock.getDelta(); });
setProgress(0.9);
computeFraming();
renderer.setSize(innerWidth, innerHeight);
composer.setSize(innerWidth, innerHeight);
camera.aspect = innerWidth / innerHeight;
camera.updateProjectionMatrix();
window.addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  computeFraming();
});
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

  sys.update(dt);
  const D = sys.sampleDay(S.dayT);
  applyDay(D);
  skyStep();
  signalVisuals();

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
  } else if (chase.on) {
    chaseStep(dt);
  } else if (mode === 'free') {
    if (attract.on) {
      attract.t += dt;
      world.rotGroup.rotation.y += IDLE_SPIN * 0.5 * dt;
      if (attract.t > 6.5) { attract.idx++; startAttractPose(); }
    } else {
      if (dragging) idleBlend = 0;
      else {
        spinVel *= Math.pow(0.06, dt);
        if (t - lastInteract > 2.6 && chipIdx < 0 && chipCitizen < 0) idleBlend = Math.min(1, idleBlend + dt / 1.6);
        else if (chipIdx >= 0 || chipCitizen >= 0) idleBlend = 0;
        world.rotGroup.rotation.y += spinVel + IDLE_SPIN * smoother(idleBlend) * dt;
        if (!reduceMotion && chipIdx < 0 && chipCitizen < 0 && t - lastInteract > 24) {
          attract.on = true;
          attract.idx = 0;
          startAttractPose();
        }
      }
      if (chipIdx >= 0) {
        const b = CITY.beacons[chipIdx];
        _v.set(...b.anchor).applyMatrix4(world.rotGroup.matrixWorld);
        _v.y -= b.down || 1;
        lookPoint.lerp(_v, Math.min(1, dt * 6));
        camera.lookAt(lookPoint);
      } else if (chipCitizen >= 0) {
        _v.copy(S.citizens[chipCitizen].m.position).applyMatrix4(world.rotGroup.matrixWorld);
        lookPoint.lerp(_v, Math.min(1, dt * 5));
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
    world.rotGroup.rotation.y += IDLE_SPIN * 0.5 * dt;
    buildStep(dt);
  }

  /* aesthetics keyed to day */
  if (!reduceMotion) {
    for (const p of world.pulseTargets) {
      const f = p.kind === 'grid' ? D.grid : D.win;
      p.mat.emissiveIntensity = p.base * f * (0.86 + 0.14 * Math.sin(t * p.speed + p.phase));
    }
    const crownPulse = 0.55 + 0.45 * Math.sin(t * 1.7);
    if (world.crownMat) world.crownMat.opacity = (0.5 + crownPulse * 0.5) * Math.max(0.45, D.sign);
    if (world.crownLight) world.crownLight.intensity = (2.5 + crownPulse * 6) * D.sign;
    for (const em of world.edgeMats) {
      if (world.renoRefs && em === world.renoRefs.edge && S.reno.stage < 2) { em.opacity = 0.18; continue; }
      em.opacity = Math.min(1, (0.8 + 0.2 * Math.sin(t * 0.9 + em.id * 0.7)) * D.edge);
    }
    for (const s of world.signMats) {
      if (s.dead) { s.mat.opacity = 0.5; continue; }
      if (s.busy > 0) {
        s.busy -= dt;
        s.mat.opacity = Math.random() < 0.5 ? 0.5 : 1;
        if (s.busy <= 0) s.mat.opacity = 1;
      } else {
        s.mat.opacity = Math.min(1, 0.55 + 0.45 * D.sign);
        s.t -= dt;
        if (s.t <= 0) { s.t = rand(5, 13); s.busy = 0.3; }
      }
    }
    for (const orb of world.orbSprites) orb.material.opacity = 0.25 + 0.7 * D.orb;
    for (let ci = 0; ci < world.treeCanopies.length; ci++) {
      world.treeCanopies[ci].rotation.z = Math.sin(t * 0.55 + ci * 1.7) * 0.02;
      world.treeCanopies[ci].rotation.x = Math.cos(t * 0.42 + ci * 1.1) * 0.014;
    }
    for (const rp of world.ripples) {
      if (!rp.ring) continue;
      rp.t += dt / 2.2;
      if (rp.t > 1) rp.t -= 1;
      rp.ring.scale.setScalar(0.35 + rp.t * 2.6);
      rp.ring.material.opacity = Math.sin(Math.PI * rp.t) * 0.55;
    }
    if (world.ripples.jet) world.ripples.jet.position.y = 0.6 + Math.sin(t * 2.4) * 0.07;
    if (world.billboardBorder) world.billboardBorder.material.color.setHSL((t * 0.045) % 1, 0.85, 0.62);
    const headOn = D.head > 0.5;
    for (const a of S.cars) a.m.userData.head.material.opacity = headOn ? 0.9 : 0.12;
    const bs = 1.12 + 0.11 * Math.sin(t * 2.1);
    if (mode !== 'build') world.beaconSprites.forEach((s, i) => {
      const active = i === chipIdx;
      s.scale.setScalar(active ? 0.92 : (i === hoverIdx ? bs * 1.22 : bs));
      s.material.opacity = chipIdx >= 0 ? (active ? 0.7 : 0.35) : 0.98;
      s.position.y = CITY.beacons[i].anchor[1] + Math.sin(t * 1.3 + i) * 0.12;
    });
  }

  chipTrack();
  if (chipDirty) { chipDirty = false; renderChipStats(); }
  if (chipCitizen >= 0 && Math.floor(t * 2) % 2 === 0) renderChipStats();
  finishPass.uniforms.uTime.value = t;
  composer.render();
  hudStep(dt);

  if (!firstFrame) {
    firstFrame = true;
    setProgress(1);
    veil.classList.add('is-done');
    plate.classList.add('is-in');
    if (!reduceMotion) setTimeout(() => hint.classList.add('is-in'), 3400);
    setTimeout(() => hint.classList.add('is-out'), 12000);
  }
}
frame();

/* ---------- acceptance tests (?test=1) ---------- */
if (TESTMODE) {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });
  setTimeout(() => {
    check('windows instanced', world.windows.length > 700, `count=${world.windows.length}`);
    check('citizens present', S.citizens.length === 20, `n=${S.citizens.length}`);
    check('cars present', S.cars.length === CITY.fleet.length);
    check('fps healthy', fpsAvg > 40, `fps=${Math.round(fpsAvg)}`);
    const bands = [[3.2, 5.2], [-7.1, -5.1]];
    const laneZs = [2.4, 1.5, -6.45, -7.15];
    let walkersInRoad = 0;
    for (const cz of S.citizens) {
      if (!cz.m.visible) continue;
      const { x, z } = cz.m.position;
      const inAve = laneZs.some((lz) => Math.abs(z - lz) < 0.3);
      const inCross = bands.some(([a, b]) => x > a && x < b) && Math.abs(z) < 9;
      const onZebra = Math.abs(x - 3.66) < 0.3;
      if (inAve && !onZebra) walkersInRoad++;
      if (inCross && !onZebra && (z > 0.9 && z < 3.0 || z > -7.6 && z < -5.9)) walkersInRoad++;
    }
    check('no walkers in roadway', walkersInRoad === 0, `violations=${walkersInRoad}`);
    const waitNS = () => new Promise((res) => { const iv = setInterval(() => { if (S.signal.state === 'NS') { clearInterval(iv); res(); } }, 100); });
    waitNS().then(() => setTimeout(() => {
      const violators = S.cars.filter((c) => {
        if (c.lane.dir !== 'EW') return false;
        const pos = c.t * c.lane.len;
        return c.lane.stopAlongs.some((sa) => pos > sa + 0.15 && pos < sa + 1.9) && c.v > 0.6;
      });
      check('no car runs the red', violators.length === 0, `in-box-on-red=${violators.length}`);
      const stopped = S.cars.filter((c) => c.lane.dir === 'EW' && c.v < 0.1).length;
      check('avenue traffic queuing', stopped >= 2, `stopped=${stopped}`);
      const d0 = S.dayT;
      window.__districtDay((d0 + 0.3) % 1);
      check('time scrub api', Math.abs(S.dayT - (d0 + 0.3) % 1) < 0.01);
      window.__districtRain(true);
      setTimeout(() => {
        check('rain wets the street', world.floorMat.roughness < 0.5, `rough=${world.floorMat.roughness.toFixed(2)}`);
        check('reflectors follow rain', isMobile || world.reflectors.every((r) => r.visible));
        window.__districtChase(0);
        setTimeout(() => {
          check('chase engages', chase.on === true);
          endChase();
          check('chase releases', chase.on === false);
          window.__testResults = { pass: results.every((r) => r.ok), results };
          console.log('[NEON TESTS]', JSON.stringify(window.__testResults, null, 1));
        }, 1200);
      }, 4000);
    }, 2600));
  }, 6000);
}

/* ---------- dev hooks ---------- */
window.__districtInfo = () => ({ mode, chase: chase.on, attract: attract.on, chipIdx, chipCitizen, rotY: world.rotGroup.rotation.y, dayT: +S.dayT.toFixed(3), phase: S.phase, clock: sys.dayClock(S.dayT), events: S.sim.events, perMin: S.sim.evtWindow.length, reno: S.reno.stage, renoOpen: S.reno.open, signal: S.signal.state, wx: +S.weather.v.toFixed(2), cars: S.cars.length, citizens: S.citizens.length, day: S.persist.day, fps: Math.round(fpsAvg), windows: world.windows.length });
window.__districtPose = (rotY, dolly = 1, pol = HERO_POLAR, az = 0.56) => { attract.on = false; tween.active = false; endChaseSilent(); viewAz = az; world.rotGroup.rotation.y = rotY; targetDollyFrac = dollyFrac = dolly; targetPolar = polar = pol; lastInteract = clockTime; idleBlend = 0; };
window.__districtFocus = (i) => { if (i < 0) chipClose(); else chipOpenBiz(i); };
window.__districtCitizen = (i) => chipOpenCitizen(i);
window.__districtDay = (t) => { S.dayT = ((t % 1) + 1) % 1; };
window.__districtRain = (on) => { S.weather.target = on ? 1 : 0; S.weather.dur = on ? 30 : 0; S.weather.next = on ? 1e9 : 60; };
window.__districtChase = (i) => startChase(S.cars[i]);
window.__districtPhoto = photoMode;
window.__districtHud = () => { hudOn = !hudOn; hudEl.hidden = !hudOn; };
window.__districtCars = () => S.cars.map((c) => ({ dir: c.lane.dir, v: +c.v.toFixed(2), t: +c.t.toFixed(2) }));
window.__districtPick = (x, y) => pickBeacon(x, y);
