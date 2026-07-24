import * as THREE from 'https://esm.sh/three@0.164.1';
import { OrbitControls } from 'https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('[data-scene]');
const loader = document.querySelector('[data-loader]');
const fallback = document.querySelector('[data-fallback]');
const timeButton = document.querySelector('[data-time]');
const timeLabel = document.querySelector('[data-time-label]');
const inspectButton = document.querySelector('[data-inspect]');
const inspectLabel = document.querySelector('[data-inspect-label]');
const quickInspectButton = document.querySelector('[data-quick-inspect]');
const replayButton = document.querySelector('[data-replay]');
const inspector = document.querySelector('[data-inspector]');
const windowTitle = document.querySelector('[data-window-title]');
const windowState = document.querySelector('[data-window-state]');
const windowNote = document.querySelector('[data-window-note]');
const windowLightButton = document.querySelector('[data-window-light]');
const previousWindowButton = document.querySelector('[data-previous-window]');
const nextWindowButton = document.querySelector('[data-next-window]');
const resetViewButton = document.querySelector('[data-reset-view]');
const status = document.querySelector('[data-status]');
const story = document.querySelector('.brownstone-story');
const floorRail = document.querySelector('.brownstone-rail');
const help = document.querySelector('[data-help]');
const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
const railButtons = Array.from(document.querySelectorAll('[data-target]'));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const compact = matchMedia('(max-width: 760px)').matches;
const saveData = navigator.connection?.saveData === true;
const lowPower = compact || saveData || (navigator.hardwareConcurrency || 8) <= 4;
const staticMotion = reducedMotion || saveData;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    alpha: false,
    powerPreference: lowPower ? 'low-power' : 'high-performance'
  });
} catch (error) {
  loader.classList.add('is-done');
  fallback.hidden = false;
  throw error;
}

renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;
renderer.shadowMap.enabled = !lowPower;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07080c);
scene.fog = new THREE.FogExp2(0x07080c, 0.018);

const camera = new THREE.PerspectiveCamera(compact ? 52 : 42, innerWidth / innerHeight, 0.1, 220);
camera.position.set(19, 10, 28);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 48;
controls.maxPolarAngle = Math.PI * 0.53;
controls.minPolarAngle = Math.PI * 0.08;
controls.enablePan = false;
controls.rotateSpeed = 0.58;
controls.zoomSpeed = 0.72;
controls.touches.ONE = THREE.TOUCH.ROTATE;
controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
controls.target.set(0, 8, 1);

const world = new THREE.Group();
scene.add(world);

const palette = {
  brick: new THREE.Color(0x742c21),
  brickDark: new THREE.Color(0x3b1815),
  stone: new THREE.Color(0xb4aa98),
  iron: new THREE.Color(0x121318),
  glass: new THREE.Color(0x111a25),
  warm: new THREE.Color(0xffa85c),
  skyNight: new THREE.Color(0x07080c),
  skyDawn: new THREE.Color(0x745f61),
  skyDay: new THREE.Color(0x92a9b7)
};

function seeded(seed) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => (value = value * 16807 % 2147483647) / 2147483647;
}

function brickTexture() {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 512;
  textureCanvas.height = 512;
  const context = textureCanvas.getContext('2d');
  const random = seeded(37);
  context.fillStyle = '#8c8175';
  context.fillRect(0, 0, 512, 512);
  const brickWidth = 64;
  const brickHeight = 32;
  for (let row = 0; row < 16; row += 1) {
    const offset = row % 2 ? -32 : 0;
    for (let column = 0; column < 10; column += 1) {
      const shade = Math.floor(86 + random() * 46);
      const red = Math.floor(shade * 1.34);
      const green = Math.floor(shade * 0.56);
      const blue = Math.floor(shade * 0.43);
      context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      context.fillRect(column * brickWidth + offset + 2, row * brickHeight + 2, brickWidth - 4, brickHeight - 4);
      context.fillStyle = 'rgba(255,255,255,0.055)';
      context.fillRect(column * brickWidth + offset + 4, row * brickHeight + 4, brickWidth - 8, 2);
    }
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 7);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const brickMaterial = new THREE.MeshStandardMaterial({ map: brickTexture(), roughness: 0.88, metalness: 0.02 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: palette.stone, roughness: 0.82 });
const darkStoneMaterial = new THREE.MeshStandardMaterial({ color: 0x58534c, roughness: 0.9 });
const ironMaterial = new THREE.MeshStandardMaterial({ color: palette.iron, roughness: 0.42, metalness: 0.76 });
const glassMaterials = [
  new THREE.MeshPhysicalMaterial({ color: palette.glass, roughness: 0.14, metalness: 0.35, clearcoat: 0.7, emissive: 0x07090d, emissiveIntensity: 0.4 }),
  new THREE.MeshPhysicalMaterial({ color: 0x2a1a10, roughness: 0.24, metalness: 0.14, clearcoat: 0.35, emissive: palette.warm, emissiveIntensity: 1.65 })
];

function mesh(geometry, material, position, cast = false, receive = false) {
  const item = new THREE.Mesh(geometry, material);
  item.position.set(position[0], position[1], position[2]);
  item.castShadow = cast && !lowPower;
  item.receiveShadow = receive;
  return item;
}

const building = new THREE.Group();
building.position.set(0, 0, 0);
world.add(building);

const floors = 6;
const floorHeight = 4;
const buildingWidth = 12;
const buildingDepth = 8.4;
const buildingHeight = floors * floorHeight;
const frontZ = buildingDepth / 2;

building.add(mesh(new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth), brickMaterial, [0, buildingHeight / 2, 0], true, true));
building.add(mesh(new THREE.BoxGeometry(buildingWidth + 0.45, 1.15, buildingDepth + 0.25), darkStoneMaterial, [0, 0.58, 0], true, true));

for (let floor = 1; floor <= floors; floor += 1) {
  building.add(mesh(new THREE.BoxGeometry(buildingWidth + 0.18, 0.14, buildingDepth + 0.18), stoneMaterial, [0, floor * floorHeight, 0], true));
}

const cornice = new THREE.Group();
cornice.position.y = buildingHeight;
cornice.add(mesh(new THREE.BoxGeometry(buildingWidth + 1.1, 0.42, buildingDepth + 0.55), stoneMaterial, [0, 0.22, 0], true));
cornice.add(mesh(new THREE.BoxGeometry(buildingWidth + 0.7, 0.26, buildingDepth + 0.35), stoneMaterial, [0, 0.62, 0], true));
const dentilGeometry = new THREE.BoxGeometry(0.28, 0.22, 0.18);
for (let index = 0; index < 27; index += 1) {
  cornice.add(mesh(dentilGeometry, stoneMaterial, [-5.5 + index * 0.42, -0.08, frontZ + 0.13], true));
}
building.add(cornice);
building.add(mesh(new THREE.BoxGeometry(buildingWidth + 0.35, 1.05, 0.32), brickMaterial, [0, buildingHeight + 1.32, frontZ], true));

function framePart(width, height, depth, x, y, z) {
  return mesh(new THREE.BoxGeometry(width, height, depth), stoneMaterial, [x, y, z], true);
}

const windowRecords = [];
const windowHitMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  colorWrite: false
});
const windowSelectionMaterial = new THREE.LineBasicMaterial({
  color: palette.warm,
  transparent: true,
  opacity: 0.92,
  depthTest: false
});
const floorLabels = ['Garden level', 'Parlor floor', 'Third floor', 'Fourth floor', 'Fifth floor', 'Top floor'];

function addWindow(axisPosition, y, side = 'front', lit = false, floorIndex = 0) {
  const windowGroup = new THREE.Group();
  const glass = mesh(
    new THREE.BoxGeometry(1.35, 2.35, 0.12),
    glassMaterials[lit ? 1 : 0].clone(),
    [0, 0, 0.18]
  );
  windowGroup.add(glass);
  windowGroup.add(framePart(1.55, 0.12, 0.18, 0, 1.22, 0.23));
  windowGroup.add(framePart(1.6, 0.16, 0.32, 0, -1.22, 0.28));
  windowGroup.add(framePart(0.1, 2.42, 0.18, -0.72, 0, 0.23));
  windowGroup.add(framePart(0.1, 2.42, 0.18, 0.72, 0, 0.23));
  windowGroup.add(framePart(1.35, 0.08, 0.16, 0, 0.18, 0.25));

  const hitTarget = mesh(new THREE.BoxGeometry(1.95, 2.9, 0.1), windowHitMaterial, [0, 0, 0.42]);
  const selection = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.86, 2.84, 0.18)),
    windowSelectionMaterial
  );
  selection.position.z = 0.36;
  selection.renderOrder = 12;
  selection.visible = false;
  windowGroup.add(hitTarget, selection);

  if (side === 'right') {
    windowGroup.rotation.y = Math.PI / 2;
    windowGroup.position.set(buildingWidth / 2, y, axisPosition);
  } else if (side === 'left') {
    windowGroup.rotation.y = -Math.PI / 2;
    windowGroup.position.set(-buildingWidth / 2, y, axisPosition);
  } else {
    windowGroup.position.set(axisPosition, y, frontZ);
  }

  const faceLabel = side === 'front' ? 'Front facade' : side === 'right' ? 'Right wall' : 'Left wall';
  const windowNumber = windowRecords.filter((item) => (
    item.floorIndex === floorIndex && item.faceLabel === faceLabel
  )).length + 1;
  const record = {
    floorIndex,
    floorLabel: floorLabels[floorIndex],
    faceLabel,
    windowNumber,
    glass,
    hitTarget,
    selection,
    lit
  };
  windowGroup.children.forEach((part) => {
    part.userData.windowRecord = record;
  });
  windowRecords.push(record);
  building.add(windowGroup);
}

const windowXs = [-4.25, -1.42, 1.42, 4.25];
for (let floor = 0; floor < floors; floor += 1) {
  const y = 2.35 + floor * floorHeight;
  windowXs.forEach((x, index) => {
    if (floor === 0 && (index === 1 || index === 2)) return;
    addWindow(x, y, 'front', (floor + index) % 3 === 0 || (floor === 4 && index === 2), floor);
  });
  [-2.45, 2.45].forEach((z, index) => {
    addWindow(z, y, 'right', (floor + index) % 4 === 1, floor);
    addWindow(z, y, 'left', (floor + index) % 4 === 2, floor);
  });
}

const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x24130d, roughness: 0.62, metalness: 0.08 });
building.add(mesh(new THREE.BoxGeometry(2.25, 3.65, 0.28), darkStoneMaterial, [0, 2.48, frontZ + 0.08], true));
building.add(mesh(new THREE.BoxGeometry(1.9, 3.25, 0.16), doorMaterial, [0, 2.32, frontZ + 0.28], true));
building.add(mesh(new THREE.BoxGeometry(1.88, 0.68, 0.13), glassMaterials[1], [0, 4.38, frontZ + 0.29]));
const porchLight = new THREE.PointLight(0xffa35f, 12, 12, 2);
porchLight.position.set(0, 5.1, frontZ + 1.7);
building.add(porchLight);

const stoop = new THREE.Group();
for (let step = 0; step < 6; step += 1) {
  const depth = 0.46;
  stoop.add(mesh(new THREE.BoxGeometry(3.9, 0.24, depth), stoneMaterial, [0, 0.12 + step * 0.24, frontZ + 0.7 + (5 - step) * depth], true, true));
}
stoop.add(mesh(new THREE.BoxGeometry(3.9, 1.45, 0.85), stoneMaterial, [0, 0.72, frontZ + 0.5], true, true));
const postGeometry = new THREE.CylinderGeometry(0.045, 0.045, 1.2, 8);
[-1, 1].forEach((side) => {
  for (let step = 0; step <= 5; step += 1) {
    const post = mesh(postGeometry, ironMaterial, [side * 1.82, 0.72 + step * 0.24, frontZ + 0.9 + (5 - step) * 0.46], true);
    stoop.add(post);
  }
});
building.add(stoop);

const escape = new THREE.Group();
const escapeX = 3.35;
for (let floor = 1; floor < floors; floor += 1) {
  const y = floor * floorHeight + 0.86;
  const platform = mesh(new THREE.BoxGeometry(3.65, 0.1, 2.35), ironMaterial, [escapeX, y, frontZ + 1.15], true);
  escape.add(platform);
  for (let bar = -1.65; bar <= 1.65; bar += 0.22) {
    escape.add(mesh(new THREE.BoxGeometry(0.025, 0.03, 2.2), ironMaterial, [escapeX + bar, y + 0.07, frontZ + 1.15]));
  }
  [-1.78, 1.78].forEach((side) => {
    [0.08, 2.2].forEach((depth) => escape.add(mesh(postGeometry, ironMaterial, [escapeX + side, y + 0.62, frontZ + depth], true)));
  });
  escape.add(mesh(new THREE.BoxGeometry(3.65, 0.05, 0.05), ironMaterial, [escapeX, y + 1.2, frontZ + 2.25], true));
  if (floor < floors - 1) {
    const ladderX = escapeX + (floor % 2 ? -1.12 : 1.12);
    [-0.25, 0.25].forEach((offset) => escape.add(mesh(new THREE.BoxGeometry(0.045, 4, 0.045), ironMaterial, [ladderX + offset, y + 2, frontZ + 2], true)));
    for (let rung = 0; rung < 9; rung += 1) {
      escape.add(mesh(new THREE.BoxGeometry(0.54, 0.035, 0.04), ironMaterial, [ladderX, y + 0.28 + rung * 0.44, frontZ + 2], true));
    }
  }
}
building.add(escape);

const tower = new THREE.Group();
const timberMaterial = new THREE.MeshStandardMaterial({ color: 0x4f2c1d, roughness: 0.9 });
tower.add(mesh(new THREE.CylinderGeometry(1.28, 1.15, 2.65, 16), timberMaterial, [0, buildingHeight + 4.8, 0], true));
tower.add(mesh(new THREE.ConeGeometry(1.45, 1.05, 16), timberMaterial, [0, buildingHeight + 6.65, 0], true));
for (let index = 0; index < 4; index += 1) {
  const angle = Math.PI / 4 + index * Math.PI / 2;
  tower.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.1, 8), ironMaterial, [Math.cos(angle) * 0.9, buildingHeight + 2.9, Math.sin(angle) * 0.9], true));
}
tower.position.set(-2.7, 0, -1.2);
building.add(tower);

const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x11131a, roughness: 0.78, metalness: 0.08 });
const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: 0x54545a, roughness: 0.88 });
const ground = mesh(new THREE.PlaneGeometry(120, 120), groundMaterial, [0, -0.02, 0], false, true);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
scene.add(mesh(new THREE.BoxGeometry(24, 0.16, 6), sidewalkMaterial, [0, 0.06, frontZ + 4.1], false, true));
scene.add(mesh(new THREE.BoxGeometry(24, 0.3, 0.35), stoneMaterial, [0, 0.15, frontZ + 7.1], true));

const puddleMaterial = new THREE.MeshPhysicalMaterial({ color: 0x111822, roughness: 0.14, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.1 });
const puddle = mesh(new THREE.CircleGeometry(2.8, 48), puddleMaterial, [-4.4, 0.025, frontZ + 9.2]);
puddle.rotation.x = -Math.PI / 2;
puddle.scale.set(1.8, 0.6, 1);
scene.add(puddle);

const neighborMaterial = new THREE.MeshStandardMaterial({ color: 0x171820, roughness: 0.94 });
[-1, 1].forEach((side) => {
  for (let index = 0; index < 4; index += 1) {
    const width = 10 + (index % 2) * 3;
    const height = 15 + index * 4;
    const neighbor = mesh(new THREE.BoxGeometry(width, height, 8), neighborMaterial, [side * (12 + index * 11), height / 2, -5 - index * 2], false, true);
    scene.add(neighbor);
  }
});

const streetLights = [];

function streetLamp(x) {
  const lamp = new THREE.Group();
  lamp.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.8, 10), ironMaterial, [0, 2.9, 0], true));
  lamp.add(mesh(new THREE.SphereGeometry(0.34, 16, 12), glassMaterials[1], [0, 5.75, 0]));
  const light = new THREE.PointLight(0xffa45f, 18, 15, 2);
  light.position.set(0, 5.55, 0);
  lamp.add(light);
  streetLights.push(light);
  lamp.position.set(x, 0, frontZ + 8.2);
  scene.add(lamp);
}
streetLamp(-8.8);
streetLamp(8.8);

const ambient = new THREE.HemisphereLight(0x65718f, 0x160b09, 0.78);
scene.add(ambient);
const keyLight = new THREE.DirectionalLight(0xffb178, lowPower ? 2.1 : 3.4);
keyLight.position.set(-14, 28, 22);
keyLight.castShadow = !lowPower;
if (!lowPower) {
  keyLight.shadow.mapSize.set(1536, 1536);
  keyLight.shadow.camera.left = -24;
  keyLight.shadow.camera.right = 24;
  keyLight.shadow.camera.top = 34;
  keyLight.shadow.camera.bottom = -8;
  keyLight.shadow.camera.far = 80;
  keyLight.shadow.bias = -0.0008;
}
scene.add(keyLight);
const edgeLight = new THREE.DirectionalLight(0x4f8df7, 1.15);
edgeLight.position.set(18, 20, -14);
scene.add(edgeLight);

function steamTexture() {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 128;
  textureCanvas.height = 128;
  const context = textureCanvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 3, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(245, 247, 250, 0.72)');
  gradient.addColorStop(0.34, 'rgba(216, 222, 230, 0.34)');
  gradient.addColorStop(0.72, 'rgba(190, 198, 210, 0.1)');
  gradient.addColorStop(1, 'rgba(190, 198, 210, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const steam = new THREE.Group();
steam.position.set(-6.8, 0.12, frontZ + 9);
const grate = mesh(new THREE.CylinderGeometry(0.82, 0.82, 0.09, 24), ironMaterial, [0, 0, 0], false, true);
steam.add(grate);
for (let slat = -2; slat <= 2; slat += 1) {
  steam.add(mesh(new THREE.BoxGeometry(1.15, 0.035, 0.055), darkStoneMaterial, [0, 0.06, slat * 0.2]));
}

const steamPuffs = [];
const steamRandom = seeded(91);
const steamCount = staticMotion ? 4 : lowPower ? 7 : 12;
const steamMap = steamTexture();
for (let index = 0; index < steamCount; index += 1) {
  const phase = steamRandom();
  const material = new THREE.SpriteMaterial({
    map: steamMap,
    color: 0xd8dde5,
    transparent: true,
    opacity: 0.12,
    depthWrite: false
  });
  const puff = new THREE.Sprite(material);
  puff.userData.phase = phase;
  puff.userData.speed = 0.055 + steamRandom() * 0.04;
  puff.userData.baseX = (steamRandom() - 0.5) * 0.46;
  puff.userData.baseZ = (steamRandom() - 0.5) * 0.34;
  puff.userData.drift = 0.22 + steamRandom() * 0.34;
  const scale = 0.7 + phase * 1.45;
  puff.position.set(puff.userData.baseX, 0.45 + phase * 5.2, puff.userData.baseZ);
  puff.scale.set(scale, scale * 0.72, 1);
  steamPuffs.push(puff);
  steam.add(puff);
}
scene.add(steam);

const views = {
  street: { camera: [19, 9.5, compact ? 34 : 29], target: [0, 8, 0] },
  stoop: { camera: [8, 5.8, compact ? 26 : 19], target: [0, 4.2, 4.3] },
  parlor: { camera: [-11, 13.6, compact ? 25 : 19], target: [0, 12.5, 3.8] },
  escape: { camera: [15, 20, compact ? 26 : 20], target: [3, 18.5, 4.8] },
  roof: { camera: [-7, 32, compact ? 27 : 21], target: [-1.8, 27.8, 0] }
};

let active = 'street';
let desiredCamera = new THREE.Vector3(...views.street.camera);
let desiredTarget = new THREE.Vector3(...views.street.target);
let inspecting = false;
let lightState = 'night';
let selectedWindow = null;
let pointerStart = null;
let motionPaused = false;
let hostActive = true;
let documentActive = document.visibilityState === 'visible';
let frameId = 0;
let lastTime = performance.now();
let sceneReady = false;
let statusTimer;

const lightingOrder = ['night', 'dawn', 'day'];
const lighting = {
  night: {
    label: 'Night',
    sky: palette.skyNight,
    fogDensity: 0.018,
    exposure: 0.88,
    ambient: 0.78,
    key: lowPower ? 2.1 : 3.4,
    edge: 1.15,
    window: 1.65,
    unlitWindow: 0.4,
    porch: 12,
    street: 18,
    message: 'Night settled over the block.'
  },
  dawn: {
    label: 'Dawn',
    sky: palette.skyDawn,
    fogDensity: 0.013,
    exposure: 0.98,
    ambient: 1.16,
    key: lowPower ? 2.85 : 3.9,
    edge: 0.72,
    window: 1.02,
    unlitWindow: 0.24,
    porch: 7,
    street: 9,
    message: 'Dawn reached the facade.'
  },
  day: {
    label: 'Day',
    sky: palette.skyDay,
    fogDensity: 0.008,
    exposure: 1.06,
    ambient: 1.62,
    key: lowPower ? 3.25 : 4.7,
    edge: 0.34,
    window: 0.38,
    unlitWindow: 0.1,
    porch: 1.8,
    street: 1.4,
    message: 'Daylight opened up the block.'
  }
};

function canAnimate() {
  return !staticMotion && !motionPaused && hostActive && documentActive;
}

function scheduleFrame(resetClock = false) {
  if (!canAnimate() || frameId) return;
  if (resetClock) lastTime = performance.now();
  frameId = requestAnimationFrame(render);
}

function requestSceneRender() {
  if (!sceneReady || !hostActive || !documentActive) return;
  if (canAnimate()) scheduleFrame();
  else renderer.render(scene, camera);
}

function syncLoop() {
  if (canAnimate()) {
    scheduleFrame(true);
    return;
  }
  if (frameId) cancelAnimationFrame(frameId);
  frameId = 0;
  requestSceneRender();
}

function announceStatus(message) {
  status.textContent = message;
  status.classList.add('is-visible');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => status.classList.remove('is-visible'), 1800);
}

function updateWindowAppearance(record) {
  const state = lighting[lightState];
  const material = record.glass.material;
  if (record.lit) {
    material.color.set(lightState === 'day' ? 0x4b392c : 0x2a1a10);
    material.emissive.copy(palette.warm);
    material.emissiveIntensity = state.window;
    material.roughness = 0.24;
    material.metalness = 0.14;
    material.clearcoat = 0.35;
  } else {
    material.color.copy(palette.glass);
    material.emissive.set(0x07090d);
    material.emissiveIntensity = state.unlitWindow;
    material.roughness = 0.14;
    material.metalness = 0.35;
    material.clearcoat = 0.7;
  }
}

function setTimeState(nextState, announce = true) {
  if (!lighting[nextState]) return;
  lightState = nextState;
  const state = lighting[nextState];
  document.body.dataset.light = nextState;
  timeLabel.textContent = state.label;
  timeButton.setAttribute('aria-label', `Change time of day, currently ${state.label.toLowerCase()}`);
  renderer.toneMappingExposure = state.exposure;
  scene.background.copy(state.sky);
  scene.fog.color.copy(state.sky);
  scene.fog.density = state.fogDensity;
  ambient.intensity = state.ambient;
  keyLight.intensity = state.key;
  edgeLight.intensity = state.edge;
  glassMaterials[1].emissiveIntensity = state.window;
  porchLight.intensity = state.porch;
  streetLights.forEach((light) => {
    light.intensity = state.street;
  });
  windowRecords.forEach(updateWindowAppearance);
  requestSceneRender();
  if (announce) announceStatus(state.message);
}

function setActive(name) {
  if (!views[name]) return;
  active = name;
  desiredCamera.set(...views[name].camera);
  desiredTarget.set(...views[name].target);
  chapters.forEach((chapter) => chapter.classList.toggle('is-active', chapter.dataset.chapter === name));
  railButtons.forEach((button) => {
    const isActive = button.dataset.target === name;
    button.classList.toggle('is-active', isActive);
    if (isActive) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });
  if (staticMotion && !inspecting) {
    camera.position.copy(desiredCamera);
    controls.target.copy(desiredTarget);
    camera.lookAt(controls.target);
  }
  requestSceneRender();
}

const chapterObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActive(visible.target.dataset.chapter);
}, { threshold: [0.35, 0.55, 0.72] });
chapters.forEach((chapter) => chapterObserver.observe(chapter));

railButtons.forEach((button) => {
  button.addEventListener('click', () => document.getElementById(button.dataset.target).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }));
});

replayButton.addEventListener('click', () => document.getElementById('street').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }));

timeButton.addEventListener('click', () => {
  const index = lightingOrder.indexOf(lightState);
  setTimeState(lightingOrder[(index + 1) % lightingOrder.length]);
});

function preferredWindow() {
  const floorByChapter = { street: 0, stoop: 0, parlor: 2, escape: 4, roof: 5 };
  const preferredFloor = floorByChapter[active] ?? 2;
  return windowRecords.find((record) => record.floorIndex === preferredFloor && record.faceLabel === 'Front facade')
    || windowRecords[0];
}

function selectWindow(record, announce = true) {
  if (!record) return;
  if (selectedWindow) selectedWindow.selection.visible = false;
  selectedWindow = record;
  selectedWindow.selection.visible = inspecting;
  windowTitle.textContent = `${record.floorLabel} · ${record.faceLabel} · Window ${record.windowNumber}`;
  windowState.textContent = record.lit ? 'Light on' : 'Light off';
  windowNote.textContent = 'Its glass and five frame pieces share one local origin, then lock flush to the wall.';
  windowLightButton.disabled = false;
  windowLightButton.textContent = record.lit ? 'Turn this light off' : 'Turn this light on';
  canvas.setAttribute('aria-label', `Interactive three-dimensional New York brownstone. Selected ${record.floorLabel}, ${record.faceLabel.toLowerCase()}, window ${record.windowNumber}, light ${record.lit ? 'on' : 'off'}.`);
  requestSceneRender();
  if (announce) {
    announceStatus(`${record.floorLabel}, ${record.faceLabel.toLowerCase()}, window ${record.windowNumber}.`);
  }
}

function toggleSelectedWindow() {
  if (!selectedWindow) return;
  selectedWindow.lit = !selectedWindow.lit;
  updateWindowAppearance(selectedWindow);
  windowState.textContent = selectedWindow.lit ? 'Light on' : 'Light off';
  windowLightButton.textContent = selectedWindow.lit ? 'Turn this light off' : 'Turn this light on';
  canvas.setAttribute('aria-label', `Interactive three-dimensional New York brownstone. Selected ${selectedWindow.floorLabel}, ${selectedWindow.faceLabel.toLowerCase()}, window ${selectedWindow.windowNumber}, light ${selectedWindow.lit ? 'on' : 'off'}.`);
  requestSceneRender();
  announceStatus(`${selectedWindow.floorLabel} light ${selectedWindow.lit ? 'on' : 'off'}.`);
}

function stepWindow(offset) {
  const currentIndex = Math.max(0, windowRecords.indexOf(selectedWindow));
  const nextIndex = (currentIndex + offset + windowRecords.length) % windowRecords.length;
  selectWindow(windowRecords[nextIndex]);
}

function setInspecting(nextInspecting) {
  inspecting = nextInspecting;
  document.body.classList.toggle('is-inspecting', inspecting);
  document.documentElement.toggleAttribute('data-brownstone-inspecting', inspecting);
  inspectButton.setAttribute('aria-pressed', String(inspecting));
  inspectButton.setAttribute('aria-label', inspecting ? 'Close facade controls' : 'Explore the facade');
  inspectLabel.textContent = inspecting ? 'Done' : 'Explore';
  controls.enabled = inspecting;
  controls.enableDamping = !staticMotion && !motionPaused;
  if (inspecting) {
    inspector.hidden = false;
    controls.target.copy(desiredTarget);
    selectWindow(selectedWindow || preferredWindow(), false);
    windowLightButton.focus({ preventScroll: true });
    story.inert = true;
    floorRail.inert = true;
    story.setAttribute('aria-hidden', 'true');
    floorRail.setAttribute('aria-hidden', 'true');
    help.setAttribute('aria-hidden', 'true');
    announceStatus('Facade controls open.');
  } else {
    story.inert = false;
    floorRail.inert = false;
    story.setAttribute('aria-hidden', 'false');
    floorRail.setAttribute('aria-hidden', 'false');
    help.setAttribute('aria-hidden', 'false');
    inspectButton.focus({ preventScroll: true });
    inspector.hidden = true;
    if (selectedWindow) selectedWindow.selection.visible = false;
    desiredCamera.set(...views[active].camera);
    desiredTarget.set(...views[active].target);
    canvas.setAttribute('aria-label', 'Interactive three-dimensional New York brownstone');
  }
  requestSceneRender();
}

inspectButton.addEventListener('click', () => setInspecting(!inspecting));
quickInspectButton.addEventListener('click', () => setInspecting(true));
previousWindowButton.addEventListener('click', () => stepWindow(-1));
nextWindowButton.addEventListener('click', () => stepWindow(1));
windowLightButton.addEventListener('click', toggleSelectedWindow);
resetViewButton.addEventListener('click', () => {
  camera.position.copy(desiredCamera);
  controls.target.copy(desiredTarget);
  camera.lookAt(controls.target);
  controls.update();
  requestSceneRender();
  announceStatus('View reset.');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && inspecting) setInspecting(false);
  if (!inspecting || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    stepWindow(-1);
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    stepWindow(1);
  }
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

canvas.addEventListener('pointerdown', (event) => {
  if (!inspecting || !event.isPrimary) return;
  pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
});

canvas.addEventListener('pointercancel', () => {
  pointerStart = null;
});

canvas.addEventListener('pointerup', (event) => {
  if (!inspecting || !pointerStart || pointerStart.id !== event.pointerId) return;
  const travel = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
  pointerStart = null;
  if (travel > 9) return;
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(building, true)[0];
  if (hit?.object.userData.windowRecord) selectWindow(hit.object.userData.windowRecord);
});

function setHostActive(activeState) {
  hostActive = activeState !== false;
  syncLoop();
}

document.addEventListener('lab:motion', (event) => {
  motionPaused = event.detail.paused === true;
  controls.enableDamping = !staticMotion && !motionPaused;
  syncLoop();
});
document.addEventListener('lab:visibility', (event) => {
  setHostActive(event.detail.active);
});
addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.data?.type !== 'lab:visibility') return;
  setHostActive(event.data.active);
});
document.addEventListener('visibilitychange', () => {
  documentActive = document.visibilityState === 'visible';
  syncLoop();
});

function resize() {
  const width = innerWidth;
  const height = innerHeight;
  camera.aspect = width / height;
  camera.fov = width <= 760 ? 52 : 42;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower || width <= 760 ? 1.25 : 1.75));
  requestSceneRender();
}
addEventListener('resize', resize, { passive: true });
window.visualViewport?.addEventListener('resize', resize, { passive: true });

controls.addEventListener('change', () => {
  if (!canAnimate()) requestSceneRender();
});

function render(time) {
  frameId = 0;
  if (!canAnimate()) return;
  const delta = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  if (inspecting) {
    controls.update();
  } else if (!reducedMotion) {
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.001, delta));
    controls.target.lerp(desiredTarget, 1 - Math.pow(0.001, delta));
    camera.lookAt(controls.target);
  } else {
    camera.position.copy(desiredCamera);
    controls.target.copy(desiredTarget);
    camera.lookAt(controls.target);
  }

  for (let index = 0; index < steamPuffs.length; index += 1) {
    const puff = steamPuffs[index];
    const progress = (puff.userData.phase + time * 0.001 * puff.userData.speed) % 1;
    const scale = 0.66 + progress * 1.75;
    puff.position.x = puff.userData.baseX + Math.sin(time * 0.00055 + index * 1.7) * puff.userData.drift * progress;
    puff.position.y = 0.45 + progress * 5.2;
    puff.position.z = puff.userData.baseZ + Math.cos(time * 0.00042 + index) * 0.12 * progress;
    puff.scale.set(scale, scale * 0.72, 1);
    puff.material.opacity = Math.sin(progress * Math.PI) * (lowPower ? 0.12 : 0.17);
  }

  renderer.render(scene, camera);
  scheduleFrame();
}

setTimeState('night', false);
setActive('street');
renderer.compile(scene, camera);
renderer.render(scene, camera);
sceneReady = true;
requestAnimationFrame(() => loader.classList.add('is-done'));
scheduleFrame(true);
