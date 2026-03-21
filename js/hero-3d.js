import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function init(container) {
  // Early return for prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
    return null;
  }

  // Get DOM references from container
  const canvas = container.querySelector('canvas');
  const overlay = container.querySelector('.canvas-overlay');

  if (!canvas || !overlay) {
    console.error('hero-3d.js: Missing canvas or overlay element in container');
    return null;
  }

  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  canvas.width = W;
  canvas.height = H;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 60);
  camera.position.set(0.5, 2.2, 11);
  camera.lookAt(0.5, 2.5, 0);

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  if (!isMobile) {
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 1.0, 0.4, 0.3);
    composer.addPass(bloom);
  }

  scene.fog = new THREE.FogExp2(0x080B14, 0.02);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.02;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.2;
  controls.target.set(0.5, 2, 0);

  if (!isTouchDevice) {
    // Desktop: allow click-drag rotate, but don't grab the mouse
    controls.enableRotate = true;
  } else if (isTablet) {
    // Tablet (iPad): no rotate, no zoom, allow scroll-through
    controls.enableRotate = false;
    canvas.style.touchAction = 'pan-y';
  } else {
    // Mobile: no controls
    controls.enableRotate = false;
  }

  controls.update();

  // --- Lighting: 3 point lights + ambient + directional ---
  const ambientLight = new THREE.AmbientLight(0x1a2040, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x4466cc, 0.5);
  dirLight.position.set(5, 10, 6);
  scene.add(dirLight);

  const streetLight1 = new THREE.PointLight(0xFFA040, 1.2, 20);
  streetLight1.position.set(-1, 1.5, 4);
  scene.add(streetLight1);

  const streetLight2 = new THREE.PointLight(0x8060FF, 0.8, 20);
  streetLight2.position.set(3, 3, 5);
  scene.add(streetLight2);

  const streetLight3 = new THREE.PointLight(0xFF6040, 0.6, 18);
  streetLight3.position.set(-3, 4, -1);
  scene.add(streetLight3);

  // --- Ground ---
  const groundGeo = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d18,
    roughness: 0.06,
    metalness: 0.95,
    emissive: 0x000000
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(30, 30, new THREE.Color(0x0891B2), new THREE.Color(0x0891B2));
  gridHelper.position.y = 0.01;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0;
  scene.add(gridHelper);

  // --- Building definitions: 15 buildings ---
  const buildingPositions = [
    // Front row (close to camera, z > 0)
    { x: -4.5, z: 1.5, w: 1.0, d: 1.0, height: 2.2, color: new THREE.Color(0xFF6B6B), rot: 0.02 },
    { x: -2.8, z: 0.8, w: 1.3, d: 1.1, height: 3.0, color: new THREE.Color(0xFE5800), rot: -0.01 },
    { x: -1.2, z: 1.2, w: 0.9, d: 0.9, height: 2.5, color: new THREE.Color(0x06D6A0), rot: 0.03 },
    { x: 2.0,  z: 1.0, w: 1.1, d: 1.0, height: 2.8, color: new THREE.Color(0xFFBE0B), rot: -0.02 },
    { x: 3.8,  z: 1.3, w: 0.8, d: 0.8, height: 2.0, color: new THREE.Color(0x10B981), rot: 0.01 },

    // Main row (z ~ 0, the primary skyline)
    { x: -4.2, z: -0.2, w: 1.2, d: 1.2, height: 3.5, color: new THREE.Color(0xFE5800), rot: 0 },
    { x: -2.5, z: 0.1,  w: 1.0, d: 1.0, height: 2.4, color: new THREE.Color(0xFF6B35), rot: 0 },
    { x: -1.0, z: -0.3, w: 1.4, d: 1.4, height: 4.2, color: new THREE.Color(0x0891B2), rot: -0.01 },
    { x: 0.5,  z: -0.1, w: 1.5, d: 1.5, height: 5.2, color: new THREE.Color(0x8B5CF6), rot: 0, isHero: true },
    { x: 2.0,  z: -0.2, w: 1.1, d: 1.1, height: 3.8, color: new THREE.Color(0xE040A0), rot: 0 },
    { x: 3.5,  z: 0.1,  w: 1.3, d: 1.3, height: 4.5, color: new THREE.Color(0x0891B2), rot: 0.01 },

    // Back row (behind main row, z < -1)
    { x: -3.5, z: -2.0, w: 1.5, d: 1.2, height: 4.8, color: new THREE.Color(0x8B5CF6), rot: 0.01 },
    { x: -1.0, z: -2.2, w: 1.8, d: 1.5, height: 5.5, color: new THREE.Color(0x0891B2), rot: -0.01 },
    { x: 1.5,  z: -2.5, w: 1.6, d: 1.3, height: 5.0, color: new THREE.Color(0xE040A0), rot: 0.02 },
    { x: 4.0,  z: -2.0, w: 1.4, d: 1.2, height: 4.0, color: new THREE.Color(0x10B981), rot: -0.01 },
  ];

  // --- Shared window geometry and materials (performance optimization) ---
  const sharedWindowGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
  const litYellowMat = new THREE.MeshStandardMaterial({
    color: 0xFFDD00, emissive: 0xFFDD00, emissiveIntensity: 0, roughness: 0.3
  });
  const litWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xDDEEFF, emissive: 0xDDEEFF, emissiveIntensity: 0, roughness: 0.3
  });
  const litBlueMat = new THREE.MeshStandardMaterial({
    color: 0x8899FF, emissive: 0x8899FF, emissiveIntensity: 0, roughness: 0.3
  });
  const darkWindowMat = new THREE.MeshStandardMaterial({
    color: 0x111122, emissive: 0x111122, emissiveIntensity: 0, roughness: 0.8
  });

  // Track all window meshes for animation
  const allWindowMeshes = [];
  // Track all lit window materials for emissive animation
  const litWindowMats = [litYellowMat, litWhiteMat, litBlueMat];

  function pickWindowMat() {
    const r = Math.random();
    if (r < 0.30) return darkWindowMat;        // 30% dark
    if (r < 0.30 + 0.55 * 0.70) return litYellowMat;  // ~38.5% yellow
    if (r < 0.30 + 0.85 * 0.70) return litWhiteMat;    // ~21% white
    return litBlueMat;                                    // ~10.5% blue
  }

  // --- Create buildings ---
  const buildings = [];

  buildingPositions.forEach((cfg, bIdx) => {
    const h = cfg.height;
    const baseColor = cfg.color.clone().multiplyScalar(0.25);
    const emissiveColor = cfg.color.clone();

    const bodyGeo = new THREE.BoxGeometry(cfg.w, h, cfg.d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: emissiveColor,
      emissiveIntensity: 0.1,
      roughness: 0.3,
      metalness: 0.4
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(cfg.x, -(h + 2), cfg.z || 0);
    if (cfg.rot) body.rotation.y = cfg.rot;
    body.userData.targetY = h / 2;
    body.userData.startY = -(h + 2);
    body.userData.emissiveColor = emissiveColor;
    body.userData.cfg = cfg;
    body.userData.buildingIndex = bIdx;
    scene.add(body);
    buildings.push(body);

    // Colorful emissive edge wireframes
    const edges = new THREE.EdgesGeometry(bodyGeo);
    const wireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: cfg.color, linewidth: 2 }));
    body.add(wireframe);

    // Storefront bar at ground level
    const barGeo = new THREE.BoxGeometry(cfg.w, 0.15, 0.02);
    const barMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.color,
      emissiveIntensity: 0,
      roughness: 0.2
    });
    const storefront = new THREE.Mesh(barGeo, barMat);
    storefront.position.set(0, -h / 2 + 0.1, cfg.d / 2 + 0.01);
    storefront.userData.emissiveColor = cfg.color;
    body.add(storefront);

    // Awning on some front-row buildings
    if (cfg.z > 0.5 && Math.random() > 0.4) {
      const awningGeo = new THREE.PlaneGeometry(cfg.w * 0.6, 0.3);
      const awningMat = new THREE.MeshStandardMaterial({
        color: cfg.color.clone().multiplyScalar(0.6),
        emissive: cfg.color,
        emissiveIntensity: 0.05,
        side: THREE.DoubleSide
      });
      const awning = new THREE.Mesh(awningGeo, awningMat);
      awning.position.set(0, -h / 2 + 0.35, cfg.d / 2 + 0.15);
      awning.rotation.x = -Math.PI / 6;
      body.add(awning);
    }

    // --- Windows on ALL 4 faces using individual meshes ---
    const hw = cfg.w / 2;
    const hd = cfg.d / 2;
    const spacingX = 0.25;
    const spacingY = 0.5;
    const inset = 0.15;

    // Face definitions: [spanWidth, fixedAxisValue, axisConfig]
    // front: spans x, fixed z = +hd
    // back:  spans x, fixed z = -hd
    // right: spans z, fixed x = +hw
    // left:  spans z, fixed x = -hw
    const faces = [
      { spanW: cfg.w, fixedVal: hd + 0.011,  axis: 'front' },
      { spanW: cfg.w, fixedVal: -(hd + 0.011), axis: 'back' },
      { spanW: cfg.d, fixedVal: hw + 0.011,  axis: 'right' },
      { spanW: cfg.d, fixedVal: -(hw + 0.011), axis: 'left' },
    ];

    faces.forEach((face) => {
      for (let u = -face.spanW / 2 + inset; u <= face.spanW / 2 - inset; u += spacingX) {
        for (let y = 0.5; y < h - 0.5; y += spacingY) {
          const mat = pickWindowMat();
          const win = new THREE.Mesh(sharedWindowGeo, mat);

          const yLocal = y - h / 2 + 0.4;

          if (face.axis === 'front') {
            win.position.set(u, yLocal, face.fixedVal);
          } else if (face.axis === 'back') {
            win.position.set(u, yLocal, face.fixedVal);
            win.rotation.y = Math.PI;
          } else if (face.axis === 'right') {
            win.position.set(face.fixedVal, yLocal, u);
            win.rotation.y = Math.PI / 2;
          } else {
            win.position.set(face.fixedVal, yLocal, u);
            win.rotation.y = -Math.PI / 2;
          }

          win.userData.isWindow = true;
          if (mat !== darkWindowMat) {
            win.userData.emissiveColor = new THREE.Color(mat.color.getHex());
          }
          body.add(win);
          allWindowMeshes.push(win);
        }
      }
    });
  });

  // --- Rooftop details as children of building bodies ---

  // Water towers on 3 tall buildings
  const waterTowerIndices = [7, 11, 12]; // tall buildings
  const wtCylGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 6);
  const wtConeGeo = new THREE.ConeGeometry(0.12, 0.15, 6);
  const wtMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9, metalness: 0.1 });
  const wtConeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9, metalness: 0.1 });

  waterTowerIndices.forEach((bIdx) => {
    const cfg = buildingPositions[bIdx];
    const body = buildings[bIdx];
    const h = cfg.height;
    const offsetX = (Math.random() - 0.5) * cfg.w * 0.4;
    const offsetZ = (Math.random() - 0.5) * cfg.d * 0.4;

    const cyl = new THREE.Mesh(wtCylGeo, wtMat);
    cyl.position.set(offsetX, h / 2 + 0.15, offsetZ);
    body.add(cyl);

    const cone = new THREE.Mesh(wtConeGeo, wtConeMat);
    cone.position.set(offsetX, h / 2 + 0.375, offsetZ);
    body.add(cone);
  });

  // AC units on some buildings (small boxes on rooftops)
  const acGeo = new THREE.BoxGeometry(0.15, 0.1, 0.12);
  const acMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.7, metalness: 0.3 });
  const acBuildings = [0, 3, 5, 9, 10, 14];

  acBuildings.forEach((bIdx) => {
    const cfg = buildingPositions[bIdx];
    const body = buildings[bIdx];
    const h = cfg.height;
    for (let j = 0; j < 2; j++) {
      const ac = new THREE.Mesh(acGeo, acMat);
      ac.position.set(
        (Math.random() - 0.5) * cfg.w * 0.5,
        h / 2 + 0.05,
        (Math.random() - 0.5) * cfg.d * 0.5
      );
      ac.rotation.y = Math.random() * 0.3;
      body.add(ac);
    }
  });

  // Antenna/spire on the tallest building (hero building)
  const heroIdx = buildingPositions.findIndex(b => b.isHero);
  const heroBody = buildings[heroIdx];
  const heroH = buildingPositions[heroIdx].height;

  const antennaGeo = new THREE.CylinderGeometry(0.01, 0.025, 1.2, 4);
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.4, metalness: 0.8 });
  const antenna = new THREE.Mesh(antennaGeo, antennaMat);
  antenna.position.set(0, heroH / 2 + 0.6, 0);
  heroBody.add(antenna);

  // Blinking light on top of antenna
  const antennaLightGeo = new THREE.SphereGeometry(0.03, 4, 4);
  const antennaLightMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2 });
  const antennaLight = new THREE.Mesh(antennaLightGeo, antennaLightMat);
  antennaLight.position.set(0, heroH / 2 + 1.2, 0);
  heroBody.add(antennaLight);

  // --- Neon sign: "LI FI" only ---
  const neonGroup = new THREE.Group();
  neonGroup.position.set(0, heroH / 2 - 0.4, buildingPositions[heroIdx].d / 2 + 0.04);

  // Sign backing
  neonGroup.add(new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.5, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.5 })
  ));

  // Hitbox for hover
  const neonHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  neonHitbox.position.z = 0.05;
  neonGroup.add(neonHitbox);

  function NB(x, y, w, h, c) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.035),
      new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: 0, roughness: 0.25 })
    );
    m.position.set(x, y, 0.05);
    neonGroup.add(m);
    return m;
  }

  const neonBars = [];
  const OC = 0xFE5800; // orange for "LI"
  const OE = 0xFF6B35; // orange-red for "FI"

  const LH = 0.28; // letter height
  const LW = 0.04; // stroke width
  const baseY = 0.0;

  // --- L ---
  const lx = -0.38;
  neonBars.push(NB(lx, baseY, LW, LH, OC));                              // vertical
  neonBars.push(NB(lx + 0.06, baseY - LH / 2 + LW / 2, 0.12, LW, OC));  // horizontal bottom

  // --- I ---
  const ix = -0.16;
  neonBars.push(NB(ix, baseY, LW, LH, OC));

  // --- F ---
  const fx = 0.10;
  neonBars.push(NB(fx, baseY, LW, LH, OE));                              // vertical
  neonBars.push(NB(fx + 0.07, baseY + LH / 2 - LW / 2, 0.14, LW, OE));  // top horizontal
  neonBars.push(NB(fx + 0.05, baseY + 0.01, 0.10, LW, OE));              // middle horizontal

  // --- I ---
  const i2x = 0.32;
  neonBars.push(NB(i2x, baseY, LW, LH, OE));

  const neonLetters = neonBars.flat();

  const neonPL = new THREE.PointLight(0xFE5800, 0, 5, 1.5);
  neonPL.position.set(0, 0, 1.0);
  neonGroup.add(neonPL);

  heroBody.add(neonGroup);

  // We also add a scene-level point light for the neon glow to cast further
  const neonSceneLight = new THREE.PointLight(0xFE5800, 0, 5, 1.5);
  neonSceneLight.position.set(0.5, 3.2, 1.5);
  scene.add(neonSceneLight);

  // --- Raycaster for neon sign hover ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let neonHoverIntensity = 0;

  const onPointerMove = (e) => {
    mouse.x = (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(neonHitbox, true);
    neonHoverIntensity = intersects.length > 0 ? 1 : 0;
  };

  canvas.addEventListener('pointermove', onPointerMove);

  let firstPointerDown = true;
  const onPointerDown = () => {
    if (firstPointerDown) {
      // Compute neon sign world position for sparks
      const neonWorldPos = new THREE.Vector3();
      neonGroup.getWorldPosition(neonWorldPos);
      spawnSpark(neonWorldPos.x, neonWorldPos.y, neonWorldPos.z, 30, true);
      firstPointerDown = false;
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);

  // --- Spark / ember particle system ---
  function spawnSpark(x, y, z, count, isBurst) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = isBurst ? 3 + Math.random() * 4 : 0.5 + Math.random();
      const particle = {
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(Math.cos(angle) * speed, (isBurst ? 2 + Math.random() * 2 : 1 + Math.random()) * speed, Math.sin(angle) * speed),
        life: 1,
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.05, 1, 0.6),
        size: isBurst ? 3 + Math.random() * 3 : 1 + Math.random() * 2
      };
      sparkles.push(particle);
    }
  }

  const sparkles = [];
  const embersGeo = new THREE.BufferGeometry();
  const emberCount = isMobile ? 15 : 35;
  const emberPositions = new Float32Array(emberCount * 3);
  const emberVelocities = [];
  for (let i = 0; i < emberCount; i++) {
    emberPositions[i * 3] = 0.5 + (Math.random() - 0.5) * 0.5;
    emberPositions[i * 3 + 1] = 3.0 + (Math.random() - 0.5) * 0.3;
    emberPositions[i * 3 + 2] = 0.66;
    emberVelocities.push({
      x: (Math.random() - 0.5) * 0.3,
      y: 0.2 + Math.random() * 0.15,
      z: (Math.random() - 0.5) * 0.3,
      life: 1,
      hue: 0.05 + Math.random() * 0.1
    });
  }
  embersGeo.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));

  const canvas_shader_frag = `
varying vec3 vColor;
varying float vAlpha;
void main(){
  float dist = length(gl_PointCoord - vec2(0.5));
  if(dist > 0.5) discard;
  gl_FragColor = vec4(vColor, vAlpha * (1.0 - dist * 2.0));
}`;

  const canvas_shader_vert = `
varying vec3 vColor;
varying float vAlpha;
attribute vec3 color;
attribute float alpha;
void main(){
  vColor = color;
  vAlpha = alpha;
  gl_PointSize = 4.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

  const emberColors = new Float32Array(emberCount * 3);
  const emberAlphas = new Float32Array(emberCount);
  for (let i = 0; i < emberCount; i++) {
    emberColors[i * 3] = 1; emberColors[i * 3 + 1] = 0.4; emberColors[i * 3 + 2] = 0;
    emberAlphas[i] = 0.8;
  }
  embersGeo.setAttribute('color', new THREE.BufferAttribute(emberColors, 3));
  embersGeo.setAttribute('alpha', new THREE.BufferAttribute(emberAlphas, 1));

  const emberMat = new THREE.ShaderMaterial({
    vertexShader: canvas_shader_vert,
    fragmentShader: canvas_shader_frag,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
  const embers = new THREE.Points(embersGeo, emberMat);
  scene.add(embers);

  // --- Ambient particles ---
  const ambientParticlesGeo = new THREE.BufferGeometry();
  const particleCount = isMobile ? 30 : 70;
  const ambientPositions = new Float32Array(particleCount * 3);
  const ambientColors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    ambientPositions[i * 3] = (Math.random() - 0.5) * 10;
    ambientPositions[i * 3 + 1] = Math.random() * 5;
    ambientPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    const col = new THREE.Color().setHSL(Math.random(), 0.5 + Math.random() * 0.5, 0.4 + Math.random() * 0.3);
    ambientColors[i * 3] = col.r; ambientColors[i * 3 + 1] = col.g; ambientColors[i * 3 + 2] = col.b;
  }
  ambientParticlesGeo.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
  ambientParticlesGeo.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));

  const ambientMat = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xffffff,
    transparent: true,
    vertexColors: true,
    sizeAttenuation: true
  });
  const ambientParticles = new THREE.Points(ambientParticlesGeo, ambientMat);
  ambientParticles.userData.opacity = 0;
  scene.add(ambientParticles);

  // --- Animation loop ---
  const clock = new THREE.Clock();
  let startTime = null;
  let started = false;
  let hasScrolled = false;
  let riseComplete = false;

  function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  }

  function animate() {
    if (!started) {
      startTime = clock.getElapsedTime();
      started = true;
      overlay.classList.add('revealed');
      clock.getDelta();
    }

    const elapsed = clock.getElapsedTime() - startTime;

    // Check for navbar (optional)
    const navBar = document.getElementById('navbar');
    if (navBar) {
      if (window.scrollY > 50) {
        navBar.classList.add('scrolled');
      } else {
        navBar.classList.remove('scrolled');
      }
    }

    const scrollP = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

    if (scrollP > 0) hasScrolled = true;

    if (scrollP > 0.7) {
      canvas.style.opacity = Math.max(0, 1 - (scrollP - 0.7) / 0.3);
    } else {
      canvas.style.opacity = '1';
    }

    if (elapsed < 0.8) {
      const p = elapsed / 0.8;
      gridHelper.material.opacity = p * 0.3;

      buildings.forEach(b => {
        const lerpY = easeOutBack(p);
        b.position.y = b.userData.startY + (b.userData.targetY - b.userData.startY) * lerpY;
      });

      if (elapsed >= 0.3 && elapsed < 0.35) {
        const neonWorldPos = new THREE.Vector3();
        neonGroup.getWorldPosition(neonWorldPos);
        spawnSpark(neonWorldPos.x, neonWorldPos.y, neonWorldPos.z, 50, true);
      }

      if (elapsed >= 0.4) {
        const crackP = Math.min((elapsed - 0.4) / 0.2, 1);
        neonLetters.forEach(bar => {
          bar.material.emissiveIntensity = crackP * 3.5;
        });
        if (!neonPL.userData.intensitySet) {
          neonPL.intensity = 5;
          neonSceneLight.intensity = 5;
          neonPL.userData.intensitySet = true;
        }
      }

      if (elapsed >= 0.6) {
        const windowP = Math.min((elapsed - 0.6) / 0.4, 1);
        // Animate shared lit window materials
        litWindowMats.forEach(m => { m.emissiveIntensity = windowP * 2.0; });
        darkWindowMat.emissiveIntensity = windowP * 0.1;

        buildings.forEach(b => {
          b.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material.emissive && !child.userData.isWindow) {
              child.material.emissiveIntensity = windowP;
            }
          });
        });
      }
    } else {
      if (!riseComplete) {
        riseComplete = true;
        buildings.forEach(b => { b.position.y = b.userData.targetY; });
      }

      gridHelper.material.opacity = 0.3;

      buildings.forEach((b, idx) => {
        b.position.y = b.userData.targetY;
        b.scale.y = 1 + Math.sin(elapsed * 0.6 + idx * 0.3) * 0.015;

        b.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material.emissive && !child.userData.isWindow) {
            child.material.emissiveIntensity = 2.0;
          }
        });
      });

      // Shared materials handle all windows at once
      litWindowMats.forEach(m => { m.emissiveIntensity = 2.0; });
      darkWindowMat.emissiveIntensity = 0.1;

      neonLetters.forEach(bar => {
        const targetIntensity = neonHoverIntensity > 0.5 ? 3.5 : 2.0;
        bar.material.emissiveIntensity += (targetIntensity - bar.material.emissiveIntensity) * 0.05;
      });

      // Antenna blink
      antennaLightMat.emissiveIntensity = Math.sin(elapsed * 3) > 0.7 ? 3.0 : 0.3;

      controls.autoRotate = true;
    }

    if (elapsed >= 0.8) {
      emberVelocities.forEach((e, i) => {
        e.y -= 0.01;
        e.life -= 0.008;
        if (e.life < 0) e.life = 1;

        emberPositions[i * 3] += e.x;
        emberPositions[i * 3 + 1] += e.y;
        emberPositions[i * 3 + 2] += e.z;

        emberColors[i * 3] = 1;
        emberColors[i * 3 + 1] = 0.4 * e.life;
        emberColors[i * 3 + 2] = 0;
        emberAlphas[i] = e.life;
      });
      embersGeo.attributes.position.needsUpdate = true;
      embersGeo.attributes.color.needsUpdate = true;
      embersGeo.attributes.alpha.needsUpdate = true;
    }

    sparkles.forEach((s, idx) => {
      s.pos.add(s.vel);
      s.vel.y -= 0.01;
      s.life -= 0.01;
      if (s.life < 0) sparkles.splice(idx, 1);
    });

    ambientParticles.userData.opacity += (0.4 - ambientParticles.userData.opacity) * 0.02;
    ambientParticles.material.opacity = ambientParticles.userData.opacity;

    if (hasScrolled) {
      const scrollPct = Math.min(window.scrollY / 500, 1);
      camera.position.z = 11 - scrollPct * 2;
      camera.position.y = 2.2 + scrollPct * 1;
    }

    controls.update();
    composer.render();
    requestAnimationFrame(animate);
  }

  const onResize = () => {
    const newW = canvas.clientWidth;
    const newH = canvas.clientHeight;
    if (newW !== W || newH !== H) {
      canvas.width = newW;
      canvas.height = newH;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      composer.setSize(newW, newH);
    }
  };

  window.addEventListener('resize', onResize);

  animate();

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', onResize);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerdown', onPointerDown);
    renderer.dispose();
    composer.dispose();
  };
}

