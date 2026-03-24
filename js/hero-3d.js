import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function init(container) {
  if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return null;

  const canvas = container.querySelector('canvas');
  const overlay = container.querySelector('.canvas-overlay');
  if (!canvas || !overlay) return null;

  let W = canvas.clientWidth;
  let H = canvas.clientHeight;
  canvas.width = W;
  canvas.height = H;

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // ── Scene ──
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x060810, 0.022);

  // Camera: wider FOV + pulled back on mobile so full skyline is visible
  const fov = isMobile ? 55 : 48;
  const camZ = isMobile ? 19 : 18;
  const camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 100);
  camera.position.set(0, 4, camZ);
  camera.lookAt(0, 2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (!isMobile) {
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.7, 0.5, 0.4));
  }

  // ── Controls ──
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = true;          // on from the start — fixes mobile "still image"
  controls.autoRotateSpeed = 0.3;
  controls.target.set(0, 2, 0);
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 2.2;

  if (!isTouchDevice) {
    controls.enableRotate = true;
  } else {
    controls.enableRotate = false;
    canvas.style.touchAction = 'pan-y';
  }
  controls.update();

  // ── Lighting ──
  scene.add(new THREE.AmbientLight(0x182040, 0.6));

  const moonLight = new THREE.DirectionalLight(0x4466aa, 0.4);
  moonLight.position.set(8, 15, 10);
  scene.add(moonLight);

  [
    { pos: [-2, 1.5, 4], color: 0xFFAA60, intensity: 1.4, dist: 14 },
    { pos: [2, 1.5, 4],  color: 0xFFAA60, intensity: 1.4, dist: 14 },
    { pos: [-4, 2.5, 2], color: 0xFF8844, intensity: 0.7, dist: 12 },
    { pos: [4, 2.5, 2],  color: 0xFF8844, intensity: 0.7, dist: 12 },
    { pos: [0, 5, 3],    color: 0x5533CC, intensity: 0.4, dist: 15 },
  ].forEach(sl => {
    const l = new THREE.PointLight(sl.color, sl.intensity, sl.dist);
    l.position.set(...sl.pos);
    scene.add(l);
  });

  // ── Sky dome (gradient) ──
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor:    { value: new THREE.Color(0x010306) },
      bottomColor: { value: new THREE.Color(0x0a1025) },
    },
    vertexShader: `
      varying vec3 vWorld;
      void main(){
        vWorld = (modelMatrix * vec4(position,1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`,
    fragmentShader: `
      uniform vec3 topColor, bottomColor;
      varying vec3 vWorld;
      void main(){
        float h = normalize(vWorld + 5.0).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h,0.0),0.4),0.0)),1.0);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 16, 12), skyMat));

  // Stars
  const starCount = isMobile ? 80 : 220;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.4;
    const r = 35 + Math.random() * 10;
    starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    starPos[i * 3 + 1] = r * Math.cos(phi) + 5;
    starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.12, transparent: true, opacity: 0.65, sizeAttenuation: true,
  })));

  // Moon (subtle)
  const moonGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const moonMat2 = new THREE.MeshStandardMaterial({ color: 0xddeeff, emissive: 0x556688, emissiveIntensity: 0.6, roughness: 1 });
  const moon = new THREE.Mesh(moonGeo, moonMat2);
  moon.position.set(12, 18, -15);
  scene.add(moon);

  // ── Ground ──
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x0c0e18, roughness: 0.15, metalness: 0.85, emissive: 0x020408, emissiveIntensity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Cyber-grid overlay
  const grid = new THREE.GridHelper(40, 40, 0x0891B2, 0x0891B2);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0;
  scene.add(grid);

  // Road in front of buildings
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x181a28, roughness: 0.65, metalness: 0.15 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.015, 3.5);
  scene.add(road);

  // Yellow center line
  const yellowLine = new THREE.MeshStandardMaterial({ color: 0xFFCC00, emissive: 0xFFCC00, emissiveIntensity: 0.25 });
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.04), yellowLine);
  cl.rotation.x = -Math.PI / 2;
  cl.position.set(0, 0.025, 3.5);
  scene.add(cl);

  // White dashed edge lines
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, emissive: 0xcccccc, emissiveIntensity: 0.15 });
  const dashGeo = new THREE.PlaneGeometry(0.35, 0.025);
  for (let side of [-1, 1]) {
    for (let x = -5.5; x < 6; x += 0.7) {
      const d = new THREE.Mesh(dashGeo, dashMat);
      d.rotation.x = -Math.PI / 2;
      d.position.set(x, 0.025, 3.5 + side * 1.05);
      scene.add(d);
    }
  }

  // Crosswalk
  const cwMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, emissive: 0xdddddd, emissiveIntensity: 0.1 });
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 2.2), cwMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(-0.45 + i * 0.24, 0.025, 3.5);
    scene.add(s);
  }

  // Sidewalk
  const sw = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 0.7),
    new THREE.MeshStandardMaterial({ color: 0x1e2030, roughness: 0.7, metalness: 0.1 })
  );
  sw.rotation.x = -Math.PI / 2;
  sw.position.set(0, 0.016, 2.05);
  scene.add(sw);

  // Street lamps
  const lampPostGeo = new THREE.CylinderGeometry(0.018, 0.022, 2.4, 6);
  const lampMetalMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.4, metalness: 0.7 });
  const lampGlowMat = new THREE.MeshStandardMaterial({ color: 0xFFDD88, emissive: 0xFFDD88, emissiveIntensity: 3, roughness: 0.2 });

  [-3.5, 0, 3.5].forEach(x => {
    const post = new THREE.Mesh(lampPostGeo, lampMetalMat);
    post.position.set(x, 1.2, 2.75);
    scene.add(post);

    // Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.02), lampMetalMat);
    arm.position.set(x + 0.12, 2.38, 2.75);
    scene.add(arm);

    // Lamp head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.08), lampMetalMat);
    head.position.set(x + 0.24, 2.36, 2.75);
    scene.add(head);

    // Glow bulb
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), lampGlowMat);
    glow.position.set(x + 0.24, 2.32, 2.75);
    scene.add(glow);

    // Light source
    const pl = new THREE.PointLight(0xFFDD88, 0.5, 5, 2);
    pl.position.set(x + 0.24, 2.3, 2.75);
    scene.add(pl);
  });

  // ── Building definitions ──
  const buildingDefs = [
    // Front row (z > 0, close to camera)
    { x: -4.5, z: 1.2, w: 1.0, d: 1.0, h: 2.2, color: 0xFF6B6B },
    { x: -2.8, z: 0.8, w: 1.3, d: 1.1, h: 3.0, color: 0xFE5800 },
    { x: -1.2, z: 1.0, w: 0.9, d: 0.9, h: 2.5, color: 0x06D6A0 },
    { x: 2.0,  z: 0.8, w: 1.1, d: 1.0, h: 2.8, color: 0xFFBE0B },
    { x: 3.8,  z: 1.0, w: 0.8, d: 0.8, h: 2.0, color: 0x10B981 },
    // Main row (z ~ 0, primary skyline)
    { x: -4.2, z: -0.5, w: 1.2, d: 1.2, h: 3.5, color: 0xFE5800 },
    { x: -2.5, z: -0.2, w: 1.0, d: 1.0, h: 2.4, color: 0xFF6B35 },
    { x: -1.0, z: -0.6, w: 1.4, d: 1.4, h: 4.2, color: 0x0891B2 },
    { x: 0.5,  z: -0.4, w: 1.5, d: 1.5, h: 5.2, color: 0x8B5CF6, isHero: true },
    { x: 2.0,  z: -0.5, w: 1.1, d: 1.1, h: 3.8, color: 0xE040A0 },
    { x: 3.5,  z: -0.2, w: 1.3, d: 1.3, h: 4.5, color: 0x0891B2 },
    // Back row (z < -1)
    { x: -3.5, z: -2.2, w: 1.5, d: 1.2, h: 4.8, color: 0x8B5CF6 },
    { x: -1.0, z: -2.5, w: 1.8, d: 1.5, h: 5.5, color: 0x0891B2 },
    { x: 1.5,  z: -2.8, w: 1.6, d: 1.3, h: 5.0, color: 0xE040A0 },
    { x: 4.0,  z: -2.2, w: 1.4, d: 1.2, h: 4.0, color: 0x10B981 },
  ];

  // ── Window materials ──
  const winGeo = new THREE.BoxGeometry(0.09, 0.13, 0.012);
  const winMats = {
    warmYellow: new THREE.MeshStandardMaterial({ color: 0xFFDD44, emissive: 0xFFDD44, emissiveIntensity: 0, roughness: 0.3 }),
    coolWhite:  new THREE.MeshStandardMaterial({ color: 0xCCDDFF, emissive: 0xCCDDFF, emissiveIntensity: 0, roughness: 0.3 }),
    warmOrange: new THREE.MeshStandardMaterial({ color: 0xFFAA55, emissive: 0xFFAA55, emissiveIntensity: 0, roughness: 0.3 }),
    tvBlue:     new THREE.MeshStandardMaterial({ color: 0x6688FF, emissive: 0x6688FF, emissiveIntensity: 0, roughness: 0.3 }),
    dark:       new THREE.MeshStandardMaterial({ color: 0x0a0a18, emissive: 0x0a0a18, emissiveIntensity: 0, roughness: 0.9 }),
  };
  const litMats = [winMats.warmYellow, winMats.coolWhite, winMats.warmOrange, winMats.tvBlue];

  function pickWinMat() {
    const r = Math.random();
    if (r < 0.22) return winMats.dark;
    if (r < 0.52) return winMats.warmYellow;
    if (r < 0.72) return winMats.coolWhite;
    if (r < 0.88) return winMats.warmOrange;
    return winMats.tvBlue;
  }

  const flickerWindows = [];

  // ── Door / storefront materials ──
  const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.8, metalness: 0.2 });
  const doorGlassMat = new THREE.MeshStandardMaterial({
    color: 0xFFCC66, emissive: 0xFFCC66, emissiveIntensity: 0, roughness: 0.1, transparent: true, opacity: 0.85,
  });
  const storefrontMat = new THREE.MeshStandardMaterial({
    color: 0xFFBB44, emissive: 0xFFBB44, emissiveIntensity: 0, roughness: 0.1, transparent: true, opacity: 0.75,
  });
  const awningColors = [0x882222, 0x228844, 0x224488, 0x884422, 0x882266];

  // ── Build each building ──
  const buildings = [];

  buildingDefs.forEach((cfg, bIdx) => {
    const { w, d, h } = cfg;
    const baseColor = new THREE.Color(cfg.color).multiplyScalar(0.18);
    const emColor = new THREE.Color(cfg.color);

    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: baseColor, emissive: emColor, emissiveIntensity: 0.06, roughness: 0.45, metalness: 0.25,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(cfg.x, -(h + 2), cfg.z);
    body.userData = { targetY: h / 2, startY: -(h + 2), cfg, bIdx };
    scene.add(body);
    buildings.push(body);

    // Subtle wireframe
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(bodyGeo),
      new THREE.LineBasicMaterial({ color: emColor.clone().multiplyScalar(0.4), transparent: true, opacity: 0.25 })
    );
    body.add(wire);

    // ── Windows: proper grid, all 4 faces ──
    const winSpaceX = 0.17;
    const winSpaceY = 0.22;
    const marginEdge = 0.1;
    const floorStart = 0.5;   // above ground (leaves room for door)
    const roofStop = 0.18;

    // front/back span building width; left/right span building depth
    const faces = [
      { span: w, depth: d, axis: 'front' },
      { span: w, depth: d, axis: 'back' },
      { span: d, depth: w, axis: 'right' },
      { span: d, depth: w, axis: 'left' },
    ];

    faces.forEach(face => {
      const cols = Math.max(1, Math.floor((face.span - marginEdge * 2) / winSpaceX));
      const startU = -(cols - 1) * winSpaceX / 2;

      for (let c = 0; c < cols; c++) {
        const u = startU + c * winSpaceX;
        for (let y = floorStart; y < h - roofStop; y += winSpaceY) {
          const mat = pickWinMat();
          const win = new THREE.Mesh(winGeo, mat);
          const yLocal = y - h / 2;

          switch (face.axis) {
            case 'front':
              win.position.set(u, yLocal, d / 2 + 0.007);
              break;
            case 'back':
              win.position.set(u, yLocal, -(d / 2 + 0.007));
              win.rotation.y = Math.PI;
              break;
            case 'right':
              win.position.set(w / 2 + 0.007, yLocal, u);
              win.rotation.y = Math.PI / 2;
              break;
            case 'left':
              win.position.set(-(w / 2 + 0.007), yLocal, u);
              win.rotation.y = -Math.PI / 2;
              break;
          }

          if (mat !== winMats.dark && Math.random() < 0.07) {
            flickerWindows.push({ mesh: win, phase: Math.random() * Math.PI * 2, speed: 1.5 + Math.random() * 4 });
          }
          body.add(win);
        }
      }
    });

    // ── Front door ──
    const doorW = Math.min(w * 0.18, 0.2);
    const doorH = 0.32;
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.03, doorH + 0.03, 0.018), doorFrameMat);
    doorFrame.position.set(0, -h / 2 + doorH / 2 + 0.01, d / 2 + 0.01);
    body.add(doorFrame);

    const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH * 0.65, 0.02), doorGlassMat.clone());
    doorGlass.position.set(0, doorH * 0.08, 0.005);
    doorGlass.userData.isDoorGlass = true;
    doorFrame.add(doorGlass);

    // Door handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.06, 0.015),
      new THREE.MeshStandardMaterial({ color: 0xccaa66, metalness: 0.8, roughness: 0.2 })
    );
    handle.position.set(doorW * 0.35, -0.02, 0.015);
    doorFrame.add(handle);

    // ── Storefront windows + awning (front-row buildings) ──
    if (cfg.z > 0.3 && w >= 0.9) {
      const sfW = w * 0.28;
      const sfH = 0.28;
      const sfGeo = new THREE.BoxGeometry(sfW, sfH, 0.018);

      [-1, 1].forEach(side => {
        const sf = new THREE.Mesh(sfGeo, storefrontMat.clone());
        sf.position.set(side * (doorW / 2 + sfW / 2 + 0.08), -h / 2 + sfH / 2 + 0.04, d / 2 + 0.01);
        sf.userData.isStorefront = true;
        body.add(sf);
      });

      // Awning
      const awW = w * 0.88;
      const awMat = new THREE.MeshStandardMaterial({
        color: awningColors[bIdx % awningColors.length], roughness: 0.8, side: THREE.DoubleSide,
      });
      const awning = new THREE.Mesh(new THREE.PlaneGeometry(awW, 0.22), awMat);
      awning.position.set(0, -h / 2 + 0.42, d / 2 + 0.11);
      awning.rotation.x = -Math.PI / 5;
      body.add(awning);

      // Awning valance (hanging edge)
      const val = new THREE.Mesh(new THREE.PlaneGeometry(awW, 0.05), awMat);
      val.position.set(0, -h / 2 + 0.31, d / 2 + 0.2);
      body.add(val);
    }
  });

  // ── Rooftop: water towers (iconic NYC wooden barrel on stilts) ──
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.85, metalness: 0.05 });
  const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x3a2518, roughness: 0.9 });
  const metalBandMat = new THREE.MeshStandardMaterial({ color: 0x556666, roughness: 0.3, metalness: 0.8 });

  [7, 11, 12].forEach(bIdx => {
    const cfg = buildingDefs[bIdx];
    const body = buildings[bIdx];
    const h = cfg.h;
    const ox = (Math.random() - 0.5) * cfg.w * 0.3;
    const oz = (Math.random() - 0.5) * cfg.d * 0.3;

    const legH = 0.28;
    const barrelR = 0.1;
    const barrelH = 0.24;

    // 4 legs
    const legGeo = new THREE.CylinderGeometry(0.012, 0.012, legH, 4);
    [[-0.06, -0.06], [0.06, -0.06], [-0.06, 0.06], [0.06, 0.06]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodDarkMat);
      leg.position.set(ox + lx, h / 2 + legH / 2, oz + lz);
      body.add(leg);
    });

    // Platform
    const plat = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.018, 0.22), woodDarkMat);
    plat.position.set(ox, h / 2 + legH, oz);
    body.add(plat);

    // Barrel (tapered)
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(barrelR * 0.88, barrelR, barrelH, 8),
      woodMat
    );
    barrel.position.set(ox, h / 2 + legH + barrelH / 2 + 0.01, oz);
    body.add(barrel);

    // Metal bands
    const bandGeo = new THREE.TorusGeometry(barrelR * 0.94, 0.006, 4, 8);
    [-0.06, 0.06].forEach(yOff => {
      const band = new THREE.Mesh(bandGeo, metalBandMat);
      band.position.set(ox, h / 2 + legH + barrelH / 2 + 0.01 + yOff, oz);
      band.rotation.x = Math.PI / 2;
      body.add(band);
    });

    // Conical roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(barrelR * 1.05, 0.1, 8),
      woodDarkMat
    );
    roof.position.set(ox, h / 2 + legH + barrelH + 0.06, oz);
    body.add(roof);
  });

  // AC units
  const acGeo = new THREE.BoxGeometry(0.14, 0.07, 0.11);
  const acMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.6, metalness: 0.4 });
  const fanGeo = new THREE.CircleGeometry(0.035, 6);
  const fanMat = new THREE.MeshStandardMaterial({ color: 0x333344, side: THREE.DoubleSide });
  [0, 3, 5, 9, 10, 14].forEach(bIdx => {
    const cfg = buildingDefs[bIdx];
    const body = buildings[bIdx];
    for (let j = 0; j < 2; j++) {
      const ax = (Math.random() - 0.5) * cfg.w * 0.4;
      const az = (Math.random() - 0.5) * cfg.d * 0.4;
      const acUnit = new THREE.Mesh(acGeo, acMat);
      acUnit.position.set(ax, cfg.h / 2 + 0.035, az);
      body.add(acUnit);
      const fan = new THREE.Mesh(fanGeo, fanMat);
      fan.position.set(ax, cfg.h / 2 + 0.035, az + 0.056);
      body.add(fan);
    }
  });

  // Satellite dishes
  const dishGeo = new THREE.SphereGeometry(0.055, 8, 4, 0, Math.PI);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.3, metalness: 0.7 });
  [2, 6, 13].forEach(bIdx => {
    const cfg = buildingDefs[bIdx];
    const body = buildings[bIdx];
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.position.set((Math.random() - 0.5) * cfg.w * 0.35, cfg.h / 2 + 0.03, (Math.random() - 0.5) * cfg.d * 0.35);
    dish.rotation.set(-Math.PI / 4, Math.random() * Math.PI, 0);
    body.add(dish);
  });

  // Chimneys
  const chimneyGeo = new THREE.BoxGeometry(0.07, 0.18, 0.07);
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x3a2828, roughness: 0.9 });
  [1, 4, 6, 10].forEach(bIdx => {
    const cfg = buildingDefs[bIdx];
    const body = buildings[bIdx];
    const ch = new THREE.Mesh(chimneyGeo, chimneyMat);
    ch.position.set(cfg.w * 0.3 * (Math.random() > 0.5 ? 1 : -1), cfg.h / 2 + 0.09, cfg.d * 0.3 * (Math.random() > 0.5 ? 1 : -1));
    body.add(ch);
  });

  // ── Hero building extras ──
  const heroIdx = buildingDefs.findIndex(b => b.isHero);
  const heroBody = buildings[heroIdx];
  const heroH = buildingDefs[heroIdx].h;

  // Antenna + blinking light
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.025, 1.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.4, metalness: 0.8 })
  );
  antenna.position.set(0, heroH / 2 + 0.6, 0);
  heroBody.add(antenna);

  const blinkMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 2 });
  const blink = new THREE.Mesh(new THREE.SphereGeometry(0.03, 4, 4), blinkMat);
  blink.position.set(0, heroH / 2 + 1.2, 0);
  heroBody.add(blink);

  // Neon sign: "LI FI"
  const neonGroup = new THREE.Group();
  neonGroup.position.set(0, heroH / 2 - 0.5, buildingDefs[heroIdx].d / 2 + 0.04);

  // Sign backing
  neonGroup.add(new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.5, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.5 })
  ));

  const neonHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.6, 0.3),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  neonHitbox.position.z = 0.05;
  neonGroup.add(neonHitbox);

  function NB(x, y, bw, bh, c) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(bw, bh, 0.035),
      new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: 0, roughness: 0.25 })
    );
    m.position.set(x, y, 0.05);
    neonGroup.add(m);
    return m;
  }

  const neonBars = [];
  const OC = 0xFE5800, OE = 0xFF6B35;
  const LH = 0.28, LW = 0.04, bY = 0;
  // L
  neonBars.push(NB(-0.38, bY, LW, LH, OC));
  neonBars.push(NB(-0.32, bY - LH / 2 + LW / 2, 0.12, LW, OC));
  // I
  neonBars.push(NB(-0.16, bY, LW, LH, OC));
  // F
  neonBars.push(NB(0.10, bY, LW, LH, OE));
  neonBars.push(NB(0.17, bY + LH / 2 - LW / 2, 0.14, LW, OE));
  neonBars.push(NB(0.15, bY + 0.01, 0.10, LW, OE));
  // I
  neonBars.push(NB(0.32, bY, LW, LH, OE));

  const neonPL = new THREE.PointLight(0xFE5800, 0, 5, 1.5);
  neonPL.position.set(0, 0, 1.0);
  neonGroup.add(neonPL);
  heroBody.add(neonGroup);

  const neonSceneLight = new THREE.PointLight(0xFE5800, 0, 5, 1.5);
  neonSceneLight.position.set(0.5, 3.2, 1.5);
  scene.add(neonSceneLight);

  // ── Interaction ──
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let neonHover = 0;

  const onPointerMove = (e) => {
    mouse.x = (e.clientX / W) * 2 - 1;
    mouse.y = -(e.clientY / H) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    neonHover = raycaster.intersectObject(neonHitbox, true).length > 0 ? 1 : 0;
  };
  canvas.addEventListener('pointermove', onPointerMove);

  let firstClick = true;
  const onPointerDown = () => {
    if (firstClick) {
      const pos = new THREE.Vector3();
      neonGroup.getWorldPosition(pos);
      spawnSpark(pos.x, pos.y, pos.z, 35, true);
      firstClick = false;
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  // ── Spark / ember particles ──
  const sparkles = [];
  function spawnSpark(x, y, z, count, isBurst) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = isBurst ? 3 + Math.random() * 4 : 0.5 + Math.random();
      sparkles.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(Math.cos(a) * spd, (isBurst ? 2 + Math.random() * 2 : 1 + Math.random()) * spd, Math.sin(a) * spd),
        life: 1,
      });
    }
  }

  const emberCount = isMobile ? 12 : 28;
  const embersGeo = new THREE.BufferGeometry();
  const ePos = new Float32Array(emberCount * 3);
  const eCol = new Float32Array(emberCount * 3);
  const eAlpha = new Float32Array(emberCount);
  const eVel = [];
  for (let i = 0; i < emberCount; i++) {
    ePos[i * 3] = 0.5 + (Math.random() - 0.5) * 0.5;
    ePos[i * 3 + 1] = 3 + Math.random() * 0.5;
    ePos[i * 3 + 2] = 0.5;
    eCol[i * 3] = 1; eCol[i * 3 + 1] = 0.4; eCol[i * 3 + 2] = 0;
    eAlpha[i] = 0.8;
    eVel.push({ x: (Math.random() - 0.5) * 0.2, y: 0.15 + Math.random() * 0.12, z: (Math.random() - 0.5) * 0.2, life: Math.random() });
  }
  embersGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  embersGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
  embersGeo.setAttribute('alpha', new THREE.BufferAttribute(eAlpha, 1));

  const emberVS = `varying vec3 vC;varying float vA;attribute vec3 color;attribute float alpha;
    void main(){vC=color;vA=alpha;gl_PointSize=4.0;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
  const emberFS = `varying vec3 vC;varying float vA;
    void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;gl_FragColor=vec4(vC,vA*(1.-d*2.));}`;

  scene.add(new THREE.Points(embersGeo, new THREE.ShaderMaterial({
    vertexShader: emberVS, fragmentShader: emberFS, transparent: true, blending: THREE.AdditiveBlending,
  })));

  // Ambient particles
  const pCount = isMobile ? 20 : 55;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);
  const pCol = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 1] = Math.random() * 7;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    const c = new THREE.Color().setHSL(Math.random(), 0.5 + Math.random() * 0.5, 0.35 + Math.random() * 0.3);
    pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const ambientParticles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.07, transparent: true, vertexColors: true, sizeAttenuation: true, opacity: 0,
  }));
  scene.add(ambientParticles);

  // ── Animation loop ──
  const clock = new THREE.Clock();
  let startTime = null, started = false, riseComplete = false, hasScrolled = false;

  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
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
    const scrollP = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (scrollP > 0) hasScrolled = true;
    canvas.style.opacity = scrollP > 0.7 ? String(Math.max(0, 1 - (scrollP - 0.7) / 0.3)) : '1';

    // ── Rise phase (0–0.8s) ──
    if (elapsed < 0.8) {
      const p = elapsed / 0.8;
      grid.material.opacity = p * 0.12;

      buildings.forEach(b => {
        b.position.y = b.userData.startY + (b.userData.targetY - b.userData.startY) * easeOutBack(p);
      });

      if (elapsed >= 0.3 && elapsed < 0.35) {
        const pos = new THREE.Vector3();
        neonGroup.getWorldPosition(pos);
        spawnSpark(pos.x, pos.y, pos.z, 50, true);
      }

      if (elapsed >= 0.4) {
        const np = Math.min((elapsed - 0.4) / 0.2, 1);
        neonBars.forEach(bar => { bar.material.emissiveIntensity = np * 3.5; });
        if (!neonPL.userData.lit) { neonPL.intensity = 5; neonSceneLight.intensity = 5; neonPL.userData.lit = true; }
      }

      if (elapsed >= 0.5) {
        const wp = Math.min((elapsed - 0.5) / 0.5, 1);
        litMats.forEach(m => { m.emissiveIntensity = wp * 1.8; });
        winMats.dark.emissiveIntensity = wp * 0.04;
        doorGlassMat.emissiveIntensity = wp * 2;
        storefrontMat.emissiveIntensity = wp * 2.5;
      }
    } else {
      // ── Steady state ──
      if (!riseComplete) {
        riseComplete = true;
        buildings.forEach(b => { b.position.y = b.userData.targetY; });
      }

      grid.material.opacity = 0.12;
      litMats.forEach(m => { m.emissiveIntensity = 1.8; });
      winMats.dark.emissiveIntensity = 0.04;
      doorGlassMat.emissiveIntensity = 2;
      storefrontMat.emissiveIntensity = 2.5;

      // Gentle breathing
      buildings.forEach((b, i) => {
        b.scale.y = 1 + Math.sin(elapsed * 0.5 + i * 0.4) * 0.006;
      });

      // Window flicker (lively)
      flickerWindows.forEach(fw => {
        const v = Math.sin(elapsed * fw.speed + fw.phase);
        if (fw.mesh.material !== winMats.dark) {
          fw.mesh.material.emissiveIntensity = 1.8 + v * 0.9;
        }
      });

      // Neon hover
      neonBars.forEach(bar => {
        const target = neonHover > 0.5 ? 3.5 : 2.0;
        bar.material.emissiveIntensity += (target - bar.material.emissiveIntensity) * 0.05;
      });

      // Antenna blink
      blinkMat.emissiveIntensity = Math.sin(elapsed * 3) > 0.7 ? 3.0 : 0.3;

      // Storefront warm pulse
      doorGlassMat.emissiveIntensity = 2 + Math.sin(elapsed * 0.8) * 0.3;
      storefrontMat.emissiveIntensity = 2.5 + Math.sin(elapsed * 0.6 + 1) * 0.4;
    }

    // Embers
    if (elapsed >= 0.8) {
      eVel.forEach((e, i) => {
        e.y -= 0.008; e.life -= 0.006;
        if (e.life < 0) { e.life = 1; ePos[i * 3 + 1] = 3 + Math.random() * 0.5; ePos[i * 3] = 0.5 + (Math.random() - 0.5) * 0.5; }
        ePos[i * 3] += e.x * 0.02; ePos[i * 3 + 1] += e.y * 0.02; ePos[i * 3 + 2] += e.z * 0.02;
        eCol[i * 3] = 1; eCol[i * 3 + 1] = 0.4 * e.life; eCol[i * 3 + 2] = 0;
        eAlpha[i] = e.life;
      });
      embersGeo.attributes.position.needsUpdate = true;
      embersGeo.attributes.color.needsUpdate = true;
      embersGeo.attributes.alpha.needsUpdate = true;
    }

    // Sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.pos.add(s.vel); s.vel.y -= 0.01; s.life -= 0.01;
      if (s.life < 0) sparkles.splice(i, 1);
    }

    // Ambient fade in
    ambientParticles.material.opacity += (0.3 - ambientParticles.material.opacity) * 0.02;

    // Scroll parallax
    if (hasScrolled) {
      const sp = Math.min(window.scrollY / 500, 1);
      camera.position.z = camZ - sp * 2;
      camera.position.y = 4 + sp * 1;
    }

    controls.update();
    composer.render();
    requestAnimationFrame(animate);
  }

  const onResize = () => {
    const nW = canvas.clientWidth, nH = canvas.clientHeight;
    if (nW !== W || nH !== H) {
      W = nW; H = nH;
      canvas.width = nW; canvas.height = nH;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
      composer.setSize(nW, nH);
    }
  };
  window.addEventListener('resize', onResize);

  animate();

  return () => {
    window.removeEventListener('resize', onResize);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerdown', onPointerDown);
    renderer.dispose();
    composer.dispose();
  };
}
