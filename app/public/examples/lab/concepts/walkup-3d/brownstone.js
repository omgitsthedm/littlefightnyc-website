import * as THREE from 'https://esm.sh/three@0.164.1';
import { OrbitControls } from 'https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('[data-scene]');
const loader = document.querySelector('[data-loader]');
const fallback = document.querySelector('[data-fallback]');
const timeButton = document.querySelector('[data-time]');
const inspectButton = document.querySelector('[data-inspect]');
const replayButton = document.querySelector('[data-replay]');
const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
const railButtons = Array.from(document.querySelectorAll('[data-target]'));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const compact = matchMedia('(max-width: 760px)').matches;
const lowPower = compact || navigator.hardwareConcurrency <= 4;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: false, powerPreference: 'high-performance' });
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
  skyDawn: new THREE.Color(0x7b8998)
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

function addWindow(x, y, side = 'front', lit = false) {
  const windowGroup = new THREE.Group();
  const glass = mesh(new THREE.BoxGeometry(1.35, 2.35, 0.12), glassMaterials[lit ? 1 : 0], [x, y, frontZ + 0.18]);
  windowGroup.add(glass);
  windowGroup.add(framePart(1.55, 0.12, 0.18, x, y + 1.22, frontZ + 0.23));
  windowGroup.add(framePart(1.6, 0.16, 0.32, x, y - 1.22, frontZ + 0.28));
  windowGroup.add(framePart(0.1, 2.42, 0.18, x - 0.72, y, frontZ + 0.23));
  windowGroup.add(framePart(0.1, 2.42, 0.18, x + 0.72, y, frontZ + 0.23));
  windowGroup.add(framePart(1.35, 0.08, 0.16, x, y + 0.18, frontZ + 0.25));
  if (side === 'right') {
    windowGroup.rotation.y = Math.PI / 2;
    windowGroup.position.set(buildingWidth / 2, 0, x);
  } else if (side === 'left') {
    windowGroup.rotation.y = -Math.PI / 2;
    windowGroup.position.set(-buildingWidth / 2, 0, x);
  }
  building.add(windowGroup);
}

const windowXs = [-4.25, -1.42, 1.42, 4.25];
for (let floor = 0; floor < floors; floor += 1) {
  const y = 2.35 + floor * floorHeight;
  windowXs.forEach((x, index) => {
    if (floor === 0 && (index === 1 || index === 2)) return;
    addWindow(x, y, 'front', (floor + index) % 3 === 0 || (floor === 4 && index === 2));
  });
  [-2.45, 2.45].forEach((z, index) => {
    addWindow(z, y, 'right', (floor + index) % 4 === 1);
    addWindow(z, y, 'left', (floor + index) % 4 === 2);
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

function streetLamp(x) {
  const lamp = new THREE.Group();
  lamp.add(mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.8, 10), ironMaterial, [0, 2.9, 0], true));
  lamp.add(mesh(new THREE.SphereGeometry(0.34, 16, 12), glassMaterials[1], [0, 5.75, 0]));
  const light = new THREE.PointLight(0xffa45f, 18, 15, 2);
  light.position.set(0, 5.55, 0);
  lamp.add(light);
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

const steamCount = lowPower ? 42 : 86;
const steamPositions = new Float32Array(steamCount * 3);
const random = seeded(91);
for (let index = 0; index < steamCount; index += 1) {
  steamPositions[index * 3] = -6.8 + (random() - 0.5) * 1.2;
  steamPositions[index * 3 + 1] = random() * 9;
  steamPositions[index * 3 + 2] = frontZ + 9 + (random() - 0.5) * 1.2;
}
const steamGeometry = new THREE.BufferGeometry();
steamGeometry.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
const steam = new THREE.Points(steamGeometry, new THREE.PointsMaterial({ color: 0xb7bbc5, size: 0.13, transparent: true, opacity: 0.24, depthWrite: false }));
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
let dawn = false;
let running = true;
let lastTime = performance.now();

function setActive(name) {
  if (!views[name]) return;
  active = name;
  desiredCamera.set(...views[name].camera);
  desiredTarget.set(...views[name].target);
  chapters.forEach((chapter) => chapter.classList.toggle('is-active', chapter.dataset.chapter === name));
  railButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.target === name));
}

const chapterObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActive(visible.target.dataset.chapter);
}, { threshold: [0.35, 0.55, 0.72] });
chapters.forEach((chapter) => chapterObserver.observe(chapter));
setActive('street');

railButtons.forEach((button) => {
  button.addEventListener('click', () => document.getElementById(button.dataset.target).scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }));
});

replayButton.addEventListener('click', () => document.getElementById('street').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }));

timeButton.addEventListener('click', () => {
  dawn = !dawn;
  timeButton.setAttribute('aria-pressed', String(dawn));
  timeButton.textContent = dawn ? 'Night light' : 'Dawn light';
  renderer.toneMappingExposure = dawn ? 1.05 : 0.88;
  scene.background.copy(dawn ? palette.skyDawn : palette.skyNight);
  scene.fog.color.copy(dawn ? palette.skyDawn : palette.skyNight);
  scene.fog.density = dawn ? 0.012 : 0.018;
  ambient.intensity = dawn ? 1.38 : 0.78;
  keyLight.intensity = dawn ? 4.4 : (lowPower ? 2.1 : 3.4);
  edgeLight.intensity = dawn ? 0.45 : 1.15;
  glassMaterials[1].emissiveIntensity = dawn ? 0.62 : 1.65;
});

inspectButton.addEventListener('click', () => {
  inspecting = !inspecting;
  document.body.classList.toggle('is-inspecting', inspecting);
  inspectButton.setAttribute('aria-pressed', String(inspecting));
  inspectButton.textContent = inspecting ? 'Return to story' : 'Inspect the model';
  controls.enabled = inspecting;
  if (inspecting) controls.target.copy(desiredTarget);
  else {
    desiredCamera.set(...views[active].camera);
    desiredTarget.set(...views[active].target);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && inspecting) inspectButton.click();
});

document.addEventListener('lab:motion', (event) => {
  running = !event.detail.paused;
  if (running) requestAnimationFrame(render);
});
document.addEventListener('lab:visibility', (event) => {
  running = event.detail.active;
  if (running) requestAnimationFrame(render);
});
addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.data?.type !== 'lab:visibility') return;
  running = event.data.active;
  if (running) requestAnimationFrame(render);
});

function resize() {
  const width = innerWidth;
  const height = innerHeight;
  camera.aspect = width / height;
  camera.fov = width <= 760 ? 52 : 42;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width <= 760 ? 1.25 : 1.75));
}
addEventListener('resize', resize, { passive: true });

function render(time) {
  if (!running) return;
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

  if (!reducedMotion) {
    const positions = steam.geometry.attributes.position.array;
    for (let index = 0; index < steamCount; index += 1) {
      positions[index * 3 + 1] += delta * (0.32 + (index % 7) * 0.025);
      positions[index * 3] += Math.sin(time * 0.0004 + index) * 0.0009;
      if (positions[index * 3 + 1] > 9) positions[index * 3 + 1] = 0;
    }
    steam.geometry.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

renderer.compile(scene, camera);
renderer.render(scene, camera);
requestAnimationFrame(() => loader.classList.add('is-done'));
requestAnimationFrame(render);
