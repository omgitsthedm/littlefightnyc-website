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
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.2;
  controls.target.set(0.5, 2, 0);
  if (isMobile) {
    controls.enableRotate = false;
    controls.enableZoom = false;
  }
  controls.update();

  // --- Lighting: 2 point lights + ambient + directional ---
  const ambientLight = new THREE.AmbientLight(0x1a2040, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x4466cc, 0.5);
  dirLight.position.set(5, 10, 6);
  scene.add(dirLight);

  // Street-level warm light (replaces many individual building lights)
  const streetLight1 = new THREE.PointLight(0xFFA040, 1.2, 20);
  streetLight1.position.set(-1, 1.5, 4);
  scene.add(streetLight1);

  const streetLight2 = new THREE.PointLight(0x8060FF, 0.8, 20);
  streetLight2.position.set(3, 3, 5);
  scene.add(streetLight2);

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

  // --- Building definitions ---
  // 18 buildings at varying x AND z positions for a real city block
  const buildingPositions = [
    // Front row (close to camera, z > 0)
    { x: -4.5, z: 1.5, w: 1.0, d: 1.0, height: 2.2, color: new THREE.Color(0xFF6B6B), rot: 0.02 },
    { x: -2.8, z: 0.8, w: 1.3, d: 1.1, height: 3.0, color: new THREE.Color(0xFE5800), rot: -0.01 },
    { x: -1.2, z: 1.2, w: 0.9, d: 0.9, height: 2.5, color: new THREE.Color(0x06D6A0), rot: 0.03 },
    { x: 2.0,  z: 1.0, w: 1.1, d: 1.0, height: 2.8, color: new THREE.Color(0xFFBE0B), rot: -0.02 },
    { x: 3.8,  z: 1.3, w: 0.8, d: 0.8, height: 2.0, color: new THREE.Color(0x10B981), rot: 0.01 },

    // Main row (z ~ 0, the primary skyline)
    { x: -4.2, z: -0.2, w: 1.2, d: 1.2, height: 3.5, color: new THREE.Color(0xFE5800), rot: 0 },
    { x: -3.0, z: 0.1,  w: 1.0, d: 1.0, height: 2.4, color: new THREE.Color(0xFF6B35), rot: 0 },
    { x: -1.8, z: -0.3, w: 1.4, d: 1.4, height: 4.2, color: new THREE.Color(0x0891B2), rot: -0.01 },
    { x: -0.5, z: 0.0,  w: 0.9, d: 0.9, height: 2.8, color: new THREE.Color(0x06D6A0), rot: 0.02 },
    { x: 0.5,  z: -0.1, w: 1.5, d: 1.5, height: 5.2, color: new THREE.Color(0x8B5CF6), rot: 0, isHero: true }, // tallest, neon sign
    { x: 2.0,  z: -0.2, w: 1.1, d: 1.1, height: 3.8, color: new THREE.Color(0xE040A0), rot: 0 },
    { x: 3.0,  z: 0.1,  w: 0.8, d: 0.8, height: 2.2, color: new THREE.Color(0xFFBE0B), rot: -0.02 },
    { x: 3.8,  z: -0.3, w: 1.3, d: 1.3, height: 4.5, color: new THREE.Color(0x0891B2), rot: 0.01 },
    { x: 5.0,  z: 0.0,  w: 1.0, d: 1.0, height: 3.0, color: new THREE.Color(0xFF6B6B), rot: 0 },

    // Back row (behind main row, z < -1)
    { x: -3.5, z: -2.0, w: 1.5, d: 1.2, height: 4.8, color: new THREE.Color(0x8B5CF6), rot: 0.01 },
    { x: -1.0, z: -2.2, w: 1.8, d: 1.5, height: 6.0, color: new THREE.Color(0x0891B2), rot: -0.01 },
    { x: 1.5,  z: -2.5, w: 1.6, d: 1.3, height: 5.5, color: new THREE.Color(0xE040A0), rot: 0.02 },
    { x: 4.0,  z: -2.0, w: 1.4, d: 1.2, height: 4.0, color: new THREE.Color(0x10B981), rot: -0.01 },
  ];

  // --- Pre-calculate ALL windows across ALL buildings for instancing ---
  const windowSpacingX = 0.2;
  const windowSpacingY = 0.4;
  const windowSize = 0.08;
  const windowInset = 0.15;

  // Window color palette
  const warmYellow = new THREE.Color(0xFFDD00);
  const coolWhite = new THREE.Color(0xDDEEFF);
  const tvBlue = new THREE.Color(0x8899FF);
  const darkWindowColor = new THREE.Color(0x111122);

  // First pass: count all windows
  let totalLitWindows = 0;
  let totalDarkWindows = 0;

  // Store per-building window data for second pass
  const buildingWindowData = [];

  buildingPositions.forEach((cfg) => {
    const h = cfg.height;
    const hw = cfg.w / 2;
    const hd = cfg.d / 2;
    const sides = [
      { axis: 'z', pos: hd + 0.01, spanW: cfg.w, spanAxis: 'x' },    // front
      { axis: 'z', pos: -(hd + 0.01), spanW: cfg.w, spanAxis: 'x' },  // back
      { axis: 'x', pos: hw + 0.01, spanW: cfg.d, spanAxis: 'z' },     // right
      { axis: 'x', pos: -(hw + 0.01), spanW: cfg.d, spanAxis: 'z' },  // left
    ];

    const bWindows = [];

    sides.forEach((side) => {
      const sW = side.spanW;
      for (let u = -sW / 2 + windowInset; u <= sW / 2 - windowInset; u += windowSpacingX) {
        for (let y = 0.5; y < h - 0.5; y += windowSpacingY) {
          const lit = Math.random() < 0.65;
          bWindows.push({ side, u, y, lit });
          if (lit) totalLitWindows++;
          else totalDarkWindows++;
        }
      }
    });

    buildingWindowData.push(bWindows);
  });

  // --- Create instanced meshes for windows ---
  const windowGeo = new THREE.PlaneGeometry(windowSize, windowSize);

  const litWindowMat = new THREE.MeshStandardMaterial({
    color: 0xFFDD00,
    emissive: 0xFFDD00,
    emissiveIntensity: 0,
    roughness: 0.3,
    side: THREE.DoubleSide
  });

  const darkWindowMat = new THREE.MeshStandardMaterial({
    color: 0x111122,
    emissive: 0x111122,
    emissiveIntensity: 0,
    roughness: 0.8,
    side: THREE.DoubleSide
  });

  const litWindowMesh = new THREE.InstancedMesh(windowGeo, litWindowMat, totalLitWindows);
  const darkWindowMesh = new THREE.InstancedMesh(windowGeo, darkWindowMat, totalDarkWindows);

  // Set per-instance colors for lit windows (varied warmth)
  const litColors = [warmYellow, coolWhite, tvBlue];
  const litColorWeights = [0.55, 0.3, 0.15]; // mostly warm yellow

  litWindowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  darkWindowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  // We'll populate matrices after buildings are created (need building refs for animation)
  // Store instance index counters
  let litIdx = 0;
  let darkIdx = 0;

  // Temp objects for matrix computation
  const _dummy = new THREE.Object3D();
  const _color = new THREE.Color();

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

    // Colorful emissive edge wireframes — signature style
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
      awning.rotation.x = -Math.PI / 6; // angled outward
      body.add(awning);
    }
  });

  // --- Populate window instance matrices ---
  // We need to compute world-space positions for windows based on building position/rotation
  // Since buildings animate (rise up), we store the window offsets relative to each building
  // and update instance matrices each frame during the rise animation.
  // For performance, after rise-up completes we only update once.

  // Store window metadata for per-frame updates during animation
  const windowInstances = []; // { buildingIdx, localPos: Vector3, localQuat: Quaternion, isLit, instanceIdx }

  buildingPositions.forEach((cfg, bIdx) => {
    const h = cfg.height;
    const hw = cfg.w / 2;
    const hd = cfg.d / 2;
    const bWindows = buildingWindowData[bIdx];

    bWindows.forEach((win) => {
      const { side, u, y, lit } = win;
      const localPos = new THREE.Vector3();
      const localQuat = new THREE.Quaternion();

      const yLocal = y - h / 2 + 0.4;

      if (side.axis === 'z') {
        localPos.set(u, yLocal, side.pos);
        if (side.pos < 0) {
          localQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
        }
      } else {
        localPos.set(side.pos, yLocal, u);
        const angle = side.pos > 0 ? Math.PI / 2 : -Math.PI / 2;
        localQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      }

      const idx = lit ? litIdx++ : darkIdx++;
      const mesh = lit ? litWindowMesh : darkWindowMesh;

      // Set color for lit windows
      if (lit) {
        const r = Math.random();
        let col;
        if (r < litColorWeights[0]) col = warmYellow;
        else if (r < litColorWeights[0] + litColorWeights[1]) col = coolWhite;
        else col = tvBlue;
        // Add slight random variation
        _color.copy(col);
        _color.r += (Math.random() - 0.5) * 0.1;
        _color.g += (Math.random() - 0.5) * 0.05;
        _color.b += (Math.random() - 0.5) * 0.05;
        litWindowMesh.setColorAt(idx, _color);
      }

      windowInstances.push({
        buildingIdx: bIdx,
        localPos,
        localQuat,
        isLit: lit,
        instanceIdx: idx
      });
    });
  });

  if (litWindowMesh.instanceColor) litWindowMesh.instanceColor.needsUpdate = true;

  scene.add(litWindowMesh);
  scene.add(darkWindowMesh);

  // Function to update all window instance matrices based on current building positions
  function updateWindowMatrices() {
    windowInstances.forEach((wi) => {
      const building = buildings[wi.buildingIdx];
      const cfg = building.userData.cfg;

      // Compute world position of this window
      _dummy.position.copy(wi.localPos);
      _dummy.quaternion.copy(wi.localQuat);
      _dummy.scale.set(1, 1, 1);

      // Apply building rotation
      if (cfg.rot) {
        const bQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), cfg.rot);
        _dummy.position.applyQuaternion(bQuat);
        _dummy.quaternion.premultiply(bQuat);
      }

      // Apply building world position
      _dummy.position.x += building.position.x;
      _dummy.position.y += building.position.y;
      _dummy.position.z += building.position.z;

      // Apply building scale
      _dummy.position.y = building.position.y + wi.localPos.y * building.scale.y;

      _dummy.updateMatrix();

      const mesh = wi.isLit ? litWindowMesh : darkWindowMesh;
      mesh.setMatrixAt(wi.instanceIdx, _dummy.matrix);
    });

    litWindowMesh.instanceMatrix.needsUpdate = true;
    darkWindowMesh.instanceMatrix.needsUpdate = true;
  }

  // Initial update (buildings are below ground, windows follow)
  updateWindowMatrices();

  // --- Rooftop details using InstancedMesh ---

  // Water towers: cylinder + cone (on 3 buildings)
  const waterTowerBuildings = [2, 7, 15]; // indices into buildingPositions (tall-ish ones, back row)
  const wtCylGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.3, 6);
  const wtConeGeo = new THREE.ConeGeometry(0.12, 0.15, 6);
  const wtMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9, metalness: 0.1 });
  const wtConeMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9, metalness: 0.1 });

  const wtCylMesh = new THREE.InstancedMesh(wtCylGeo, wtMat, waterTowerBuildings.length);
  const wtConeMesh = new THREE.InstancedMesh(wtConeGeo, wtConeMat, waterTowerBuildings.length);

  // We'll set these after rise-up too, but initialize them
  const waterTowerData = waterTowerBuildings.map((bIdx, i) => {
    const cfg = buildingPositions[bIdx];
    return { bIdx, offsetX: (Math.random() - 0.5) * cfg.w * 0.4, offsetZ: (Math.random() - 0.5) * cfg.d * 0.4 };
  });

  function updateWaterTowers() {
    waterTowerData.forEach((wt, i) => {
      const building = buildings[wt.bIdx];
      const cfg = building.userData.cfg;
      const topY = building.position.y + cfg.height / 2 * building.scale.y;

      // Cylinder
      _dummy.position.set(building.position.x + wt.offsetX, topY + 0.15, building.position.z + wt.offsetZ);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      wtCylMesh.setMatrixAt(i, _dummy.matrix);

      // Cone on top
      _dummy.position.y = topY + 0.375;
      _dummy.updateMatrix();
      wtConeMesh.setMatrixAt(i, _dummy.matrix);
    });
    wtCylMesh.instanceMatrix.needsUpdate = true;
    wtConeMesh.instanceMatrix.needsUpdate = true;
  }

  scene.add(wtCylMesh);
  scene.add(wtConeMesh);
  updateWaterTowers();

  // AC units: small boxes on rooftops (6 buildings)
  const acBuildings = [0, 3, 5, 8, 11, 13];
  const acGeo = new THREE.BoxGeometry(0.15, 0.1, 0.12);
  const acMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.7, metalness: 0.3 });
  // 2 AC units per building = 12 instances
  const acCount = acBuildings.length * 2;
  const acMesh = new THREE.InstancedMesh(acGeo, acMat, acCount);

  const acData = [];
  acBuildings.forEach((bIdx) => {
    const cfg = buildingPositions[bIdx];
    for (let j = 0; j < 2; j++) {
      acData.push({
        bIdx,
        offsetX: (Math.random() - 0.5) * cfg.w * 0.5,
        offsetZ: (Math.random() - 0.5) * cfg.d * 0.5
      });
    }
  });

  function updateACUnits() {
    acData.forEach((ac, i) => {
      const building = buildings[ac.bIdx];
      const cfg = building.userData.cfg;
      const topY = building.position.y + cfg.height / 2 * building.scale.y;
      _dummy.position.set(building.position.x + ac.offsetX, topY + 0.05, building.position.z + ac.offsetZ);
      _dummy.rotation.set(0, Math.random() * 0.3, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      acMesh.setMatrixAt(i, _dummy.matrix);
    });
    acMesh.instanceMatrix.needsUpdate = true;
  }

  scene.add(acMesh);
  updateACUnits();

  // Rooftop railings on some buildings: thin boxes around edges
  const railingBuildings = [6, 9, 10, 14];
  // 4 railings per building = 16 instances
  const railGeo = new THREE.BoxGeometry(1, 0.08, 0.02);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x444455, roughness: 0.6, metalness: 0.5 });
  const railCount = railingBuildings.length * 4;
  const railMesh = new THREE.InstancedMesh(railGeo, railMat, railCount);

  const railData = [];
  railingBuildings.forEach((bIdx) => {
    const cfg = buildingPositions[bIdx];
    // front, back, left, right
    railData.push({ bIdx, side: 'front', w: cfg.w, d: cfg.d });
    railData.push({ bIdx, side: 'back', w: cfg.w, d: cfg.d });
    railData.push({ bIdx, side: 'left', w: cfg.w, d: cfg.d });
    railData.push({ bIdx, side: 'right', w: cfg.w, d: cfg.d });
  });

  function updateRailings() {
    railData.forEach((rd, i) => {
      const building = buildings[rd.bIdx];
      const cfg = building.userData.cfg;
      const topY = building.position.y + cfg.height / 2 * building.scale.y;
      const hw = cfg.w / 2;
      const hd = cfg.d / 2;

      _dummy.scale.set(1, 1, 1);
      _dummy.rotation.set(0, 0, 0);

      if (rd.side === 'front') {
        _dummy.position.set(building.position.x, topY + 0.04, building.position.z + hd);
        _dummy.scale.x = cfg.w;
      } else if (rd.side === 'back') {
        _dummy.position.set(building.position.x, topY + 0.04, building.position.z - hd);
        _dummy.scale.x = cfg.w;
      } else if (rd.side === 'left') {
        _dummy.position.set(building.position.x - hw, topY + 0.04, building.position.z);
        _dummy.rotation.y = Math.PI / 2;
        _dummy.scale.x = cfg.d;
      } else {
        _dummy.position.set(building.position.x + hw, topY + 0.04, building.position.z);
        _dummy.rotation.y = Math.PI / 2;
        _dummy.scale.x = cfg.d;
      }

      _dummy.updateMatrix();
      railMesh.setMatrixAt(i, _dummy.matrix);
    });
    railMesh.instanceMatrix.needsUpdate = true;
  }

  scene.add(railMesh);
  updateRailings();

  // Antenna/spire on the tallest building (hero building, index 9)
  const heroIdx = buildingPositions.findIndex(b => b.isHero);
  const antennaGeo = new THREE.CylinderGeometry(0.01, 0.025, 1.2, 4);
  const antennaMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.4, metalness: 0.8 });
  const antenna = new THREE.Mesh(antennaGeo, antennaMat);
  // Position will be updated with building
  scene.add(antenna);

  // Small blinking light on top of antenna
  const antennaLightGeo = new THREE.SphereGeometry(0.03, 4, 4);
  const antennaLightMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2 });
  const antennaLight = new THREE.Mesh(antennaLightGeo, antennaLightMat);
  scene.add(antennaLight);

  function updateAntenna() {
    const building = buildings[heroIdx];
    const cfg = building.userData.cfg;
    const topY = building.position.y + cfg.height / 2 * building.scale.y;
    antenna.position.set(building.position.x, topY + 0.6, building.position.z);
    antennaLight.position.set(building.position.x, topY + 1.2, building.position.z);
  }
  updateAntenna();

  // --- Neon sign: "LI FI" only ---
  const neonGroup = new THREE.Group();
  neonGroup.position.set(0.5, 3.0, 0.66); // on hero building front face

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
  const T = 0.05;
  const OC = 0xFE5800; // orange for "LI"
  const OE = 0xFF6B35; // orange-red for "FI"

  // Letter dimensions
  const LH = 0.28; // letter height
  const LW = 0.04; // stroke width

  // "LI" on the left, "FI" on the right — side by side with spacing
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
  neonPL.position.set(0.5, 3.2, 1.5);
  scene.add(neonPL);
  scene.add(neonGroup);

  // --- Raycaster for neon sign hover ---
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let neonHoverIntensity = 0;

  const onPointerMove = (e) => {
    mouse.x = (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(neonHitbox);
    neonHoverIntensity = intersects.length > 0 ? 1 : 0;
  };

  canvas.addEventListener('pointermove', onPointerMove);

  let firstPointerDown = true;
  const onPointerDown = () => {
    if (firstPointerDown) {
      spawnSpark(0.5, 3.0, 0.66, 30, true);
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

  function bezier(p0, p1, p2, t) {
    const mt = 1 - t;
    return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2;
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

      // Update instanced elements to follow buildings during rise
      updateWindowMatrices();
      updateWaterTowers();
      updateACUnits();
      updateRailings();
      updateAntenna();

      if (elapsed >= 0.3 && elapsed < 0.35) {
        spawnSpark(0.5, 3.0, 0.66, 50, true);
      }

      if (elapsed >= 0.4) {
        const crackP = Math.min((elapsed - 0.4) / 0.2, 1);
        neonLetters.forEach(bar => {
          bar.material.emissiveIntensity = crackP * 3.5;
        });
        if (!neonPL.userData.intensitySet) {
          neonPL.intensity = 5;
          neonPL.userData.intensitySet = true;
        }
      }

      if (elapsed >= 0.6) {
        const windowP = Math.min((elapsed - 0.6) / 0.4, 1);
        litWindowMat.emissiveIntensity = windowP * 2.0;
        darkWindowMat.emissiveIntensity = windowP * 0.1;

        buildings.forEach(b => {
          b.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material.emissive) {
              child.material.emissiveIntensity = windowP;
            }
          });
        });
      }
    } else {
      if (!riseComplete) {
        riseComplete = true;
        // Final position update for all instanced elements
        buildings.forEach(b => { b.position.y = b.userData.targetY; });
        updateWindowMatrices();
        updateWaterTowers();
        updateACUnits();
        updateRailings();
        updateAntenna();
      }

      gridHelper.material.opacity = 0.3;

      buildings.forEach((b, idx) => {
        b.position.y = b.userData.targetY;
        b.scale.y = 1 + Math.sin(elapsed * 0.6 + idx * 0.3) * 0.015;

        b.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material.emissive) {
            child.material.emissiveIntensity = 2.0;
          }
        });
      });

      // Update windows only when buildings breathe (scale changes)
      updateWindowMatrices();
      // Update rooftop elements to follow breathing
      updateWaterTowers();
      updateACUnits();
      updateRailings();
      updateAntenna();

      litWindowMat.emissiveIntensity = 2.0;
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

export function initAudio(toggleButton) {
  let audioContext = null;
  let audioPlaying = false;
  let audioOscillators = [];
  let audioGain = null;

  toggleButton.addEventListener('click', () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    audioPlaying = !audioPlaying;
    toggleButton.style.opacity = audioPlaying ? '1' : '0.5';
    if (audioPlaying) startAudio();
    else stopAudio();
  });

  function startAudio() {
    if (audioOscillators.length > 0) return;
    const ctx = audioContext;
    audioGain = ctx.createGain();
    audioGain.gain.value = 0.05;
    audioGain.connect(ctx.destination);

    const osc1 = ctx.createOscillator();
    osc1.frequency.value = 120;
    osc1.type = 'sawtooth';
    osc1.connect(audioGain);
    osc1.start();
    audioOscillators.push(osc1);

    const osc2 = ctx.createOscillator();
    osc2.frequency.value = 55;
    osc2.type = 'sine';
    osc2.connect(audioGain);
    osc2.start();
    audioOscillators.push(osc2);

    const osc3 = ctx.createOscillator();
    osc3.frequency.value = 82;
    osc3.type = 'sine';
    osc3.connect(audioGain);
    osc3.start();
    audioOscillators.push(osc3);
  }

  function stopAudio() {
    audioOscillators.forEach(osc => osc.stop());
    audioOscillators = [];
  }
}
