import * as THREE from './vendor/three/three.module.js';
import { OrbitControls } from './vendor/three/OrbitControls.js';

export function init(container) {
  const canvas = container.querySelector('canvas');
  if (!canvas) return null;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const signalLayer = container.querySelector('.hero-signal-layer');
  const radiantFrame = container.querySelector('#hero-radiant-frame');
  const appStatus = container.querySelector('#hero-app-status');
  const appDockValue = container.querySelector('#hero-app-dock-value');
  const factGuide = container.querySelector('#hero-fact-guide');
  const factBubble = container.querySelector('#hero-fact-bubble');
  const factKicker = container.querySelector('#hero-fact-kicker');
  const factTitle = container.querySelector('#hero-fact-title');
  const factBody = container.querySelector('#hero-fact-body');
  const factSource = container.querySelector('#hero-fact-source');
  const factLink = container.querySelector('#hero-fact-link');

  let W = canvas.clientWidth || container.clientWidth;
  let H = canvas.clientHeight || container.clientHeight;
  canvas.width = W;
  canvas.height = H;

  const isMobile = window.innerWidth < 768;
  const isPhone = window.innerWidth < 640;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const prefersSaveData = navigator.connection?.saveData === true;
  const deviceMemory = navigator.deviceMemory || 4;
  const hardwareThreads = navigator.hardwareConcurrency || 4;
  const useReducedMotion = prefersReducedMotion;
  const brandPalette = {
    ink: 0x080b14,
    night: 0x0d1120,
    navy: 0x111730,
    orange: 0xFE5800,
    orangeSoft: 0xFF6B35,
    cyan: 0x1FB9D8,
    purple: 0x9557F2,
    violet: 0xB46AF6,
    green: 0x15B77E,
    mint: 0x1DCCA1,
    gold: 0xF3A51A,
    amber: 0xFFBE0B,
    red: 0xF4505F,
    ivory: 0xF5F1EA,
    slate: 0x9DA1B0,
  };
  const performanceTier = (prefersSaveData || deviceMemory <= 4 || hardwareThreads <= 4)
    ? 'low'
    : (isMobile || isTablet ? 'balanced' : 'high');
  const idleGuideText = isTouchDevice
    ? 'Swipe the skyline, tap a building, then open the source when you want the proof.'
    : 'Drag the skyline, open a building, then open the source when you want the proof.';
  const activeGuideText = isTouchDevice
    ? 'Tap the open building again to zoom back out, or use View Source to check the citation.'
    : 'Click the open building again to zoom back out, or use View Source to check the citation.';
  const defaultTheme = {
    accent: brandPalette.orange,
    softAccent: 'rgba(254,88,0,0.16)',
  };
  const factSourceUrls = {
    googleRetail: 'https://www.thinkwithgoogle.com/_qs/documents/3459/3-new-realities-of-local-retail_articles_1.pdf',
    googleNearby: 'https://www.thinkwithgoogle.com/_qs/documents/620/mobile-search-trends-consumers-to-stores.pdf',
    squareAppointments: 'https://squareup.com/us/en/the-bottom-line/reaching-customers/how-customers-use-square-appointments',
    visa2022: 'https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.18711.html',
    visa2023: 'https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.19891.html',
    visa2018: 'https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.15736.html',
    gs1Rfid: 'https://www.supplychain.gs1us.org/rfid/warehouse-management',
  };

  function postRadiantParam(name, value) {
    if (!radiantFrame?.contentWindow) return;
    radiantFrame.contentWindow.postMessage({ type: 'param', name, value }, '*');
  }

  function syncRadiantState(active = false) {
    const baseDrift = isMobile ? 0.16 : 0.2;
    postRadiantParam('DRIFT_SPEED', active ? baseDrift + 0.02 : baseDrift);
    postRadiantParam('GRAIN_AMOUNT', active ? 0.02 : 0.03);
  }

  function setSupportState({ fact = null } = {}) {
    if (appStatus) appStatus.textContent = fact ? fact.kicker : 'Interactive Proof';
    if (appDockValue) appDockValue.textContent = fact
      ? fact.title
      : 'Open a building to see how a custom site can drive bookings, trust, payments, and neighborhood traffic.';
  }

  const factCards = [
    {
      kicker: 'Availability',
      title: 'People want stock answers before they leave home.',
      body: '74% said nearby product availability would be helpful in local search results.',
      source: 'Think with Google / Ipsos MediaCT and Sterling Brands, 2014',
      accent: brandPalette.orange,
      url: factSourceUrls.googleRetail,
    },
    {
      kicker: 'Pricing',
      title: 'Local price clarity removes hesitation.',
      body: '75% said pricing at that store would be helpful in local search results.',
      source: 'Think with Google / Ipsos MediaCT and Sterling Brands, 2014',
      accent: brandPalette.orangeSoft,
      url: factSourceUrls.googleRetail,
    },
    {
      kicker: 'After Hours',
      title: 'Booking should keep working after the shop closes.',
      body: '48% of appointments made through Square Appointments are booked during off hours.',
      source: 'Square Appointments, 2017',
      accent: brandPalette.green,
      url: factSourceUrls.squareAppointments,
    },
    {
      kicker: 'Mobile Booking',
      title: 'The phone is where a lot of bookings actually happen.',
      body: '78% of online bookings through Square Appointments come through mobile devices.',
      source: 'Square Appointments, 2017',
      accent: brandPalette.cyan,
      url: factSourceUrls.squareAppointments,
    },
    {
      kicker: 'Payment Friction',
      title: 'Payment limits can lose the sale before trust even starts.',
      body: '41% of shoppers said they abandoned a purchase because a business did not accept their preferred digital payment option.',
      source: 'Visa Global Back to Business Study, 2022',
      accent: brandPalette.gold,
      url: factSourceUrls.visa2022,
    },
    {
      kicker: 'Foot Traffic',
      title: 'Nearby search should behave like a doorway.',
      body: '76% of people who search for something nearby on a smartphone visit a business within 24 hours.',
      source: 'Think with Google / Google Purchased Digital Diary, 2016',
      accent: brandPalette.orange,
      url: factSourceUrls.googleNearby,
    },
    {
      kicker: 'Intent',
      title: 'Local discovery turns into real purchases fast.',
      body: '28% of nearby smartphone searches end in a purchase.',
      source: 'Think with Google / Google Purchased Digital Diary, 2016',
      accent: brandPalette.red,
      url: factSourceUrls.googleNearby,
    },
    {
      kicker: 'Resilience',
      title: 'Digital presence can become survival infrastructure.',
      body: '90% of SMBs with an online presence said e-commerce efforts helped them survive during the pandemic.',
      source: 'Visa Global Back to Business Study, 2022',
      accent: brandPalette.cyan,
      url: factSourceUrls.visa2022,
    },
    {
      kicker: 'Online Revenue',
      title: 'Online sales are not extra anymore.',
      body: 'In Visa\'s study, online channels represented 52% of revenue on average over the prior three months.',
      source: 'Visa Global Back to Business Study, 2022',
      accent: brandPalette.purple,
      url: factSourceUrls.visa2022,
    },
    {
      kicker: 'Growth',
      title: 'More payment options act like a growth lever.',
      body: '73% of small businesses said accepting new forms of digital payment is fundamental to growth.',
      source: 'Visa Global Back to Business Study, 2022',
      accent: brandPalette.cyan,
      url: factSourceUrls.visa2022,
    },
    {
      kicker: 'New Customers',
      title: 'Payment flexibility can widen who buys.',
      body: '35% of surveyed business owners saw accepting new forms of payment as a crucial area that can help improve the business.',
      source: 'Visa Global Back to Business Study, 2023',
      accent: brandPalette.amber,
      url: factSourceUrls.visa2023,
    },
    {
      kicker: 'Sales Lift',
      title: 'Digital checkout can cost less than old payment habits.',
      body: 'Visa estimated the average cost of processing digital payments was 57% lower than non-digital payments when direct expenses and labor were included.',
      source: 'Visa SMB Digital Era Report, 2018',
      accent: brandPalette.gold,
      url: factSourceUrls.visa2018,
    },
    {
      kicker: 'Basket Size',
      title: 'People often spend more when they pay by card.',
      body: '65% of SMBs agreed customers spend more when they use cards versus cash.',
      source: 'Visa SMB Digital Era Report, 2018',
      accent: brandPalette.amber,
      url: factSourceUrls.visa2018,
    },
    {
      kicker: 'Inventory',
      title: 'Digital stock systems sharpen the count.',
      body: 'GS1 US says item-level inventory accuracy can rise to over 95% with RFID.',
      source: 'GS1 US / Auburn University',
      accent: brandPalette.green,
      url: factSourceUrls.gs1Rfid,
    },
    {
      kicker: 'In Stock',
      title: 'Good inventory systems prevent missed sales.',
      body: 'GS1 and Auburn University found RFID can reduce retail out-of-stocks by up to 50%.',
      source: 'GS1 US / Auburn University',
      accent: brandPalette.mint,
      url: factSourceUrls.gs1Rfid,
    },
  ];
  let hoveredBuildingIndex = null;
  let selectedBuildingIndex = null;
  let cameraState = 'idle';
  const overviewCameraPosition = new THREE.Vector3();
  const overviewCameraTarget = new THREE.Vector3();
  const desiredCameraPosition = new THREE.Vector3();
  const desiredCameraTarget = new THREE.Vector3();

  function softAccentFromHex(hex) {
    const color = new THREE.Color(hex);
    return `rgba(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)},0.16)`;
  }

  function applyTheme(accentHex) {
    const accent = accentHex ?? defaultTheme.accent;
    container.style.setProperty('--hero-accent', `#${accent.toString(16).padStart(6, '0')}`);
    container.style.setProperty('--hero-accent-soft', softAccentFromHex(accent));
  }

  // ── Scene ──
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(brandPalette.ink, isPhone ? 0.00205 : isMobile ? 0.0022 : 0.0028);

  // Camera: wider FOV + pulled back on mobile so full skyline is visible
  const fov = isPhone ? 44 : isMobile ? 42 : 36;
  const camZ = isPhone ? 13.8 : isMobile ? 13.4 : 12.35;
  const camera = new THREE.PerspectiveCamera(fov, W / H, 0.1, 100);
  camera.position.set(0.18, isPhone ? 3.42 : 3.3, camZ);
  camera.lookAt(0.15, isPhone ? 2.58 : 2.65, 0.1);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isTouchDevice && performanceTier !== 'low',
      alpha: true,
      powerPreference: isTouchDevice ? 'default' : 'high-performance',
    });
  } catch (error) {
    console.error('Unable to initialize hero skyline renderer.', error);
    return null;
  }
  renderer.setSize(W, H);
  const pixelRatioCap = isPhone
    ? 1.26
    : isMobile
      ? 1.42
      : performanceTier === 'high'
        ? 2
        : performanceTier === 'balanced'
          ? 1.55
          : 1.15;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);

  // ── Controls ──
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.045;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = isPhone ? 0.13 : isMobile ? 0.17 : 0.22;
  controls.target.set(0.15, 2.55, 0.05);
  controls.minPolarAngle = Math.PI / 4;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.enableRotate = true;
  controls.rotateSpeed = isTouchDevice ? 0.82 : 0.62;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  if (isTouchDevice) canvas.style.touchAction = 'none';
  controls.update();
  applyTheme(defaultTheme.accent);
  if (factGuide) factGuide.textContent = idleGuideText;
  setSupportState({ accent: defaultTheme.accent });
  if (radiantFrame) {
    radiantFrame.addEventListener('load', () => {
      syncRadiantState(selectedBuildingIndex != null);
    });
  }
  desiredCameraPosition.copy(camera.position);
  desiredCameraTarget.copy(controls.target);
  overviewCameraPosition.copy(camera.position);
  overviewCameraTarget.copy(controls.target);

  // ── Lighting ──
  scene.add(new THREE.AmbientLight(0x4b66a0, isPhone ? 1.46 : isMobile ? 1.38 : 1.28));

  const skyFill = new THREE.HemisphereLight(0x92a7eb, 0x0c1020, isPhone ? 1.12 : isMobile ? 1.05 : 0.98);
  scene.add(skyFill);

  const moonLight = new THREE.DirectionalLight(0xe1ebff, isPhone ? 0.58 : isMobile ? 0.51 : 0.44);
  moonLight.position.set(10, 17, 8);
  scene.add(moonLight);
  const frontFill = new THREE.DirectionalLight(0xffce9c, isPhone ? 0.38 : isMobile ? 0.33 : 0.26);
  frontFill.position.set(-2, 7, 12);
  scene.add(frontFill);

  function makeRadialTexture(stops) {
    const size = 256;
    const surface = document.createElement('canvas');
    surface.width = size;
    surface.height = size;
    const ctx = surface.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
    stops.forEach(([stop, color]) => gradient.addColorStop(stop, color));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new THREE.CanvasTexture(surface);
    texture.needsUpdate = true;
    return texture;
  }

  // ── Sky dome (gradient) ──
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    transparent: true,
    uniforms: {
      topColor: { value: new THREE.Color(0x091123) },
      bottomColor: { value: new THREE.Color(0x3553a0) },
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
        float h = normalize(vWorld + 6.0).y;
        float band = smoothstep(-0.22, 0.36, h);
        vec3 sky = mix(bottomColor, topColor, max(pow(max(band,0.0),0.55),0.0));
        gl_FragColor = vec4(sky, 0.9);
      }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(50, 16, 12), skyMat));

  const moonGlowTexture = makeRadialTexture([
    [0, 'rgba(255,255,255,0.92)'],
    [0.18, 'rgba(198,219,255,0.82)'],
    [0.42, 'rgba(100,150,255,0.22)'],
    [1, 'rgba(18,24,42,0)'],
  ]);
  const horizonGlowTexture = makeRadialTexture([
    [0, 'rgba(254,88,0,0.42)'],
    [0.22, 'rgba(84,168,255,0.24)'],
    [1, 'rgba(10,16,30,0)'],
  ]);

  function createStarField(count, size, opacity, spreadOffset = 0) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * (0.36 + spreadOffset);
      const r = 34 + Math.random() * 12;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) + 5;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const field = new THREE.Points(geo, material);
    field.userData = {
      baseOpacity: opacity,
      phase: Math.random() * Math.PI * 2,
      speed: 0.16 + Math.random() * 0.18,
    };
    scene.add(field);
    return field;
  }

  const starCount = performanceTier === 'high'
    ? (isMobile ? 96 : 208)
    : performanceTier === 'balanced'
      ? (isMobile ? 64 : 132)
      : (isMobile ? 40 : 78);
  const starFields = [
    createStarField(starCount, isMobile ? 0.14 : 0.16, isPhone ? 0.9 : isMobile ? 0.86 : 0.82),
    createStarField(Math.max(14, Math.floor(starCount * 0.24)), isMobile ? 0.24 : 0.28, isPhone ? 1.08 : 1, 0.08),
  ];

  // Moon and glow halo
  const moonGeo = new THREE.SphereGeometry(1.2, 16, 16);
  const moonMat2 = new THREE.MeshStandardMaterial({
    color: 0xddeeff,
    emissive: 0x5f79b2,
    emissiveIntensity: 0.7,
    roughness: 1,
  });
  const moon = new THREE.Mesh(moonGeo, moonMat2);
  moon.position.set(15.5, 21.5, -31);
  scene.add(moon);

  const moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: moonGlowTexture,
    color: 0xaecfff,
    transparent: true,
    opacity: isPhone ? 0.46 : isMobile ? 0.42 : 0.38,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  moonHalo.position.copy(moon.position);
  moonHalo.scale.set(14.4, 14.4, 1);
  scene.add(moonHalo);

  const horizonGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: horizonGlowTexture,
    color: 0x5e90ff,
    transparent: true,
    opacity: isPhone ? 0.22 : isMobile ? 0.19 : 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  horizonGlow.position.set(0, 6.1, -26.4);
  horizonGlow.scale.set(50, 18.4, 1);
  scene.add(horizonGlow);

  const cityGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: horizonGlowTexture,
    color: brandPalette.orange,
    transparent: true,
    opacity: isPhone ? 0.17 : isMobile ? 0.145 : 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  cityGlow.position.set(0, 4.1, -22.8);
  cityGlow.scale.set(43, 14.6, 1);
  scene.add(cityGlow);

  const skylineBacklights = [];
  [
    { x: -6.2, y: 4.9, z: -11.2, color: brandPalette.orange, scale: [14, 11], opacity: isPhone ? 0.26 : isMobile ? 0.23 : 0.2, speed: 0.22 },
    { x: 0.4, y: 5.2, z: -12.4, color: brandPalette.purple, scale: [17, 12], opacity: isPhone ? 0.22 : isMobile ? 0.19 : 0.16, speed: 0.18 },
    { x: 6.6, y: 4.7, z: -11.6, color: brandPalette.cyan, scale: [14, 11], opacity: isPhone ? 0.26 : isMobile ? 0.23 : 0.2, speed: 0.24 },
  ].forEach((cfg, index) => {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: horizonGlowTexture,
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    glow.position.set(cfg.x, cfg.y, cfg.z);
    glow.scale.set(cfg.scale[0], cfg.scale[1], 1);
    glow.userData = {
      baseOpacity: cfg.opacity,
      speed: cfg.speed,
      phase: index * 0.8 + Math.random() * 0.4,
    };
    skylineBacklights.push(glow);
    scene.add(glow);
  });

  const backdropDefs = [
    { x: -5.8, z: -7.2, w: 2.1, d: 1.4, h: 5.6, color: 0x31457e },
    { x: -3.2, z: -7.8, w: 1.8, d: 1.4, h: 6.7, color: 0x403888 },
    { x: -0.2, z: -8.5, w: 2.6, d: 1.5, h: 8.2, color: 0x25618d },
    { x: 2.9, z: -7.9, w: 2.0, d: 1.35, h: 6.9, color: 0x5d356d },
    { x: 5.6, z: -7.3, w: 1.9, d: 1.35, h: 5.9, color: 0x2d5d74 },
  ];
  backdropDefs.forEach((cfg) => {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d),
      new THREE.MeshLambertMaterial({
        color: cfg.color,
        emissive: new THREE.Color(cfg.color).multiplyScalar(0.18),
        emissiveIntensity: 0.7,
      }),
    );
    block.position.set(cfg.x, cfg.h / 2 - 0.05, cfg.z);
    scene.add(block);
  });

  const shootingStarHeadTexture = makeRadialTexture([
    [0, 'rgba(255,255,255,0.95)'],
    [0.3, 'rgba(255,210,160,0.82)'],
    [1, 'rgba(15,18,28,0)'],
  ]);
  const shootingStarSystems = [];
  [
    {
      points: [[-15, 15.8, -18], [-7, 18.5, -9], [1.5, 16.6, -1], [13, 11.7, 7]],
      color: 0xffd3a6,
      speed: 0.022,
      offset: 0.16,
    },
    {
      points: [[14, 14.8, -20], [6, 17.2, -12], [-1.2, 15.1, -5], [-11, 10.6, 4.5]],
      color: 0x8cc8ff,
      speed: 0.018,
      offset: 0.63,
    },
  ].forEach((cfg) => {
    const curve = new THREE.CatmullRomCurve3(cfg.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const trail = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 56, 0.022, 8, false),
      new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.065,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scene.add(trail);
    const head = new THREE.Sprite(new THREE.SpriteMaterial({
      map: shootingStarHeadTexture,
      color: cfg.color,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    head.scale.set(0.9, 0.9, 1);
    scene.add(head);
    shootingStarSystems.push({
      curve,
      trail,
      head,
      baseOpacity: 0.065,
      speed: cfg.speed,
      offset: cfg.offset,
    });
  });

  // ── Ground ──
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    new THREE.MeshStandardMaterial({
      color: 0x090d18,
      roughness: 0.3,
      metalness: 0.56,
      emissive: 0x050913,
      emissiveIntensity: 0.18,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const groundGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: horizonGlowTexture,
    color: 0x254f90,
    transparent: true,
    opacity: 0.04,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  groundGlow.position.set(0, 0.35, 0.2);
  groundGlow.scale.set(31, 10.5, 1);
  scene.add(groundGlow);

  // Perspective guide floor
  const grid = new THREE.GridHelper(40, 28, 0x1a3551, 0x14283d);
  grid.position.y = 0.01;
  grid.material.transparent = true;
  grid.material.opacity = 0;
  scene.add(grid);

  // Long-exposure avenue strips
  const longExposureTrails = [];
  [
    { x: -2.25, width: 0.28, length: 18, z: -0.8, color: brandPalette.cyan, opacity: 0.056, speed: 0.42 },
    { x: -0.7, width: 0.18, length: 17, z: -0.4, color: brandPalette.purple, opacity: 0.049, speed: 0.5 },
    { x: 0.65, width: 0.24, length: 18, z: -0.5, color: brandPalette.orange, opacity: 0.064, speed: 0.46 },
    { x: 2.15, width: 0.18, length: 16, z: -0.2, color: brandPalette.gold, opacity: 0.046, speed: 0.38 },
  ].forEach((cfg) => {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(cfg.width, cfg.length),
      new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity * 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(cfg.x, 0.018, cfg.z);
    scene.add(strip);
    longExposureTrails.push({
      mesh: strip,
      baseOpacity: cfg.opacity,
      speed: cfg.speed,
      phase: Math.random() * Math.PI * 2,
    });
  });

  // Road in front of buildings
  const roadShoulder = new THREE.Mesh(
    new THREE.PlaneGeometry(15.4, 3.05),
    new THREE.MeshStandardMaterial({ color: 0x0c1220, roughness: 0.38, metalness: 0.3, emissive: 0x060b14, emissiveIntensity: 0.1 }),
  );
  roadShoulder.rotation.x = -Math.PI / 2;
  roadShoulder.position.set(0, 0.014, 3.5);
  scene.add(roadShoulder);

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x101824,
    roughness: 0.24,
    metalness: 0.44,
    emissive: 0x091120,
    emissiveIntensity: 0.16,
  });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.4), roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.016, 3.5);
  scene.add(road);

  const roadSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(13.6, 2.04),
    new THREE.MeshBasicMaterial({
      color: 0x9dc8ff,
      transparent: true,
      opacity: 0.036,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  );
  roadSheen.rotation.x = -Math.PI / 2;
  roadSheen.position.set(0, 0.018, 3.5);
  scene.add(roadSheen);

  // Yellow center line
  const yellowLine = new THREE.MeshStandardMaterial({ color: 0xFFCC00, emissive: 0xFFCC00, emissiveIntensity: 0.46 });
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.085), yellowLine);
  cl.rotation.x = -Math.PI / 2;
  cl.position.set(0, 0.026, 3.5);
  scene.add(cl);

  // White dashed edge lines
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xe6ebff, emissive: 0xe6ebff, emissiveIntensity: 0.26 });
  const dashGeo = new THREE.PlaneGeometry(0.42, 0.05);
  for (const side of [-1, 1]) {
    for (let x = -5.5; x < 6; x += 0.7) {
      const d = new THREE.Mesh(dashGeo, dashMat);
      d.rotation.x = -Math.PI / 2;
      d.position.set(x, 0.025, 3.5 + side * 1.05);
      scene.add(d);
    }
  }

  // Crosswalk
  const cwMat = new THREE.MeshStandardMaterial({ color: 0xf0f3ff, emissive: 0xf0f3ff, emissiveIntensity: 0.12 });
  for (let i = 0; i < 6; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 2.2), cwMat);
    s.rotation.x = -Math.PI / 2;
    s.position.set(-0.45 + i * 0.24, 0.025, 3.5);
    scene.add(s);
  }

  // Sidewalk
  const sw = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 0.76),
    new THREE.MeshStandardMaterial({ color: 0x182132, roughness: 0.58, metalness: 0.18 }),
  );
  sw.rotation.x = -Math.PI / 2;
  sw.position.set(0, 0.016, 2.05);
  scene.add(sw);

  // Street lamps
  const lampPostGeo = new THREE.CylinderGeometry(0.018, 0.022, 2.4, 6);
  const lampMetalMat = new THREE.MeshStandardMaterial({ color: 0x333344, roughness: 0.4, metalness: 0.7 });
  const lampGlowMat = new THREE.MeshStandardMaterial({ color: 0xFFDD88, emissive: 0xFFDD88, emissiveIntensity: 3.8, roughness: 0.2 });

  [-3.5, 0, 3.5].forEach((x) => {
    const post = new THREE.Mesh(lampPostGeo, lampMetalMat);
    post.position.set(x, 1.2, 2.75);
    scene.add(post);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.02), lampMetalMat);
    arm.position.set(x + 0.12, 2.38, 2.75);
    scene.add(arm);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.08), lampMetalMat);
    head.position.set(x + 0.24, 2.36, 2.75);
    scene.add(head);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), lampGlowMat);
    glow.position.set(x + 0.24, 2.32, 2.75);
    scene.add(glow);

    const pl = new THREE.PointLight(0xFFDD88, 0.72, 5.8, 2);
    pl.position.set(x + 0.24, 2.3, 2.75);
    scene.add(pl);
  });

  const streetTrees = [];
  const planterMat = new THREE.MeshStandardMaterial({ color: 0x26313f, roughness: 0.9, metalness: 0.08 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6f4327, roughness: 0.92, metalness: 0.02 });
  const leafPalette = [brandPalette.green, brandPalette.mint, 0x7fd44c, 0x5dd67d];
  [-5.0, -2.55, 0.05, 2.65, 5.05].forEach((x, index) => {
    const group = new THREE.Group();
    group.position.set(x, 0, 2.22);

    const planter = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.42), planterMat);
    planter.position.y = 0.11;
    group.add(planter);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.13, 0.04, 10),
      new THREE.MeshStandardMaterial({ color: 0x1b140d, roughness: 1 }),
    );
    soil.position.y = 0.22;
    group.add(soil);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.64, 8), trunkMat);
    trunk.position.y = 0.52;
    group.add(trunk);

    const canopyColor = leafPalette[index % leafPalette.length];
    const canopyMat = new THREE.MeshLambertMaterial({
      color: new THREE.Color(canopyColor).lerp(new THREE.Color(brandPalette.ivory), 0.08),
      emissive: new THREE.Color(canopyColor).multiplyScalar(0.12),
      emissiveIntensity: isMobile ? 0.92 : 0.78,
    });
    const canopyOffsets = [
      { x: 0, y: 0.96, z: 0, s: 0.34 },
      { x: -0.16, y: 0.82, z: 0.04, s: 0.24 },
      { x: 0.16, y: 0.84, z: -0.04, s: 0.24 },
    ];
    canopyOffsets.forEach((cfg) => {
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(cfg.s, 10, 10), canopyMat);
      canopy.position.set(cfg.x, cfg.y, cfg.z);
      group.add(canopy);
    });

    const fairy = new THREE.PointLight(canopyColor, 0.18, 1.8, 2);
    fairy.position.set(0, 0.92, 0);
    group.add(fairy);

    group.userData = {
      swaySpeed: 0.6 + Math.random() * 0.3,
      swayAmount: 0.04 + Math.random() * 0.02,
      phase: Math.random() * Math.PI * 2,
    };
    streetTrees.push(group);
    scene.add(group);
  });

  // ── Building definitions ──
  const buildingDefs = [
    // Front row (z > 0, close to camera)
    { x: -4.5, z: 1.2, w: 1.0, d: 1.0, h: 2.2, color: brandPalette.red },
    { x: -2.8, z: 0.8, w: 1.3, d: 1.1, h: 3.0, color: 0xF09514 },
    { x: -1.2, z: 1.0, w: 0.9, d: 0.9, h: 2.5, color: brandPalette.green },
    { x: 2.0,  z: 0.8, w: 1.1, d: 1.0, h: 2.8, color: brandPalette.gold },
    { x: 3.8,  z: 1.0, w: 0.8, d: 0.8, h: 2.0, color: brandPalette.cyan },
    // Main row (z ~ 0, primary skyline)
    { x: -4.2, z: -0.5, w: 1.2, d: 1.2, h: 3.5, color: brandPalette.orange },
    { x: -2.5, z: -0.2, w: 1.0, d: 1.0, h: 2.4, color: 0xE24D67 },
    { x: -1.0, z: -0.6, w: 1.4, d: 1.4, h: 4.2, color: 0x1595B5 },
    { x: 0.5,  z: -0.4, w: 1.5, d: 1.5, h: 5.2, color: brandPalette.purple, isHero: true },
    { x: 2.0,  z: -0.5, w: 1.1, d: 1.1, h: 3.8, color: brandPalette.violet },
    { x: 3.5,  z: -0.2, w: 1.3, d: 1.3, h: 4.5, color: brandPalette.cyan },
    // Back row (z < -1)
    { x: -3.5, z: -2.2, w: 1.5, d: 1.2, h: 4.8, color: 0x7E57D9 },
    { x: -1.0, z: -2.5, w: 1.8, d: 1.5, h: 5.5, color: 0x1282A7 },
    { x: 1.5,  z: -2.8, w: 1.6, d: 1.3, h: 5.0, color: 0xD28A17 },
    { x: 4.0,  z: -2.2, w: 1.4, d: 1.2, h: 4.0, color: 0x16A275 },
  ];

  // ── Window materials ──
  const winGeo = new THREE.PlaneGeometry(0.11, 0.154);
  function makeLitPlaneMaterial(hex, { transparent = false, opacity = 1 } = {}) {
    const material = new THREE.MeshBasicMaterial({
      color: hex,
      transparent,
      opacity,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    material.userData.baseColor = new THREE.Color(hex);
    return material;
  }
  const winMats = {
    warmIvory: makeLitPlaneMaterial(0xFFF1C7),
    coolWhite: makeLitPlaneMaterial(0xE7EEFF),
    warmAmber: makeLitPlaneMaterial(0xFFC16B),
    softCyan:  makeLitPlaneMaterial(0xB9E8FF),
    dark:      makeLitPlaneMaterial(0x090d16),
  };
  const litMats = [winMats.warmIvory, winMats.coolWhite, winMats.warmAmber, winMats.softCyan];
  const windowGlowTargets = new Map([
    [winMats.warmIvory, 1.26],
    [winMats.coolWhite, 1.18],
    [winMats.warmAmber, 1.22],
    [winMats.softCyan, 1.08],
  ]);
  const darkWindowGlowTarget = 1;
  const animatedWindows = [];
  const animatedWindowChance = performanceTier === 'low' ? 0.016 : isMobile ? 0.028 : 0.045;
  const windowLift = 0.006;

  function pickWinMat() {
    const r = Math.random();
    if (r < 0.24) return winMats.dark;
    if (r < 0.51) return winMats.warmIvory;
    if (r < 0.72) return winMats.coolWhite;
    if (r < 0.88) return winMats.warmAmber;
    return winMats.softCyan;
  }

  // ── Door / storefront materials ──
  const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.8, metalness: 0.2 });
  const doorGlassMat = makeLitPlaneMaterial(0xFFCC66, { transparent: true, opacity: 0.88 });
  const storefrontMat = makeLitPlaneMaterial(0xFFBB44, { transparent: true, opacity: 0.8 });
  const awningColors = [0xF4505F, 0x15B77E, 0x1FB9D8, 0xF3A51A, 0x9557F2];
  const doorGlassGlowTarget = 0.96;
  const storefrontGlowTarget = 1.0;

  function setLitPlaneIntensity(material, intensity) {
    const baseColor = material.userData.baseColor;
    if (!baseColor) return;
    material.color.copy(baseColor).multiplyScalar(intensity);
  }

  function setWindowGlow(progress = 1) {
    litMats.forEach((material) => {
      setLitPlaneIntensity(material, (windowGlowTargets.get(material) || 1) * progress);
    });
    animatedWindows.forEach((windowState) => {
      setLitPlaneIntensity(windowState.material, windowState.baseIntensity * progress);
    });
    setLitPlaneIntensity(winMats.dark, darkWindowGlowTarget);
    setLitPlaneIntensity(doorGlassMat, doorGlassGlowTarget * progress);
    setLitPlaneIntensity(storefrontMat, storefrontGlowTarget * progress);
  }

  // ── Build each building ──
  const buildings = [];

  buildingDefs.forEach((cfg, bIdx) => {
    const { w, d, h } = cfg;
    const baseColor = new THREE.Color(cfg.color).lerp(new THREE.Color(brandPalette.ivory), 0.03);
    const emColor = new THREE.Color(cfg.color).multiplyScalar(0.12);
    const frameColor = new THREE.Color(cfg.color).lerp(new THREE.Color(brandPalette.ivory), 0.16);
    const baseBodyEmissiveIntensity = isPhone ? 0.72 : isMobile ? 0.66 : 0.56;
    const baseFrameEmissiveIntensity = isPhone ? 0.86 : isMobile ? 0.77 : 0.68;

    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshLambertMaterial({
      color: baseColor,
      emissive: emColor,
      emissiveIntensity: baseBodyEmissiveIntensity,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(cfg.x, -(h + 2), cfg.z);
    body.userData = {
      targetY: h / 2,
      startY: -(h + 2),
      cfg,
      bIdx,
      emColor,
      baseEmissiveIntensity: baseBodyEmissiveIntensity,
      fact: factCards[bIdx] || null,
    };
    scene.add(body);
    buildings.push(body);

    // Architectural trim: thicker than single-pixel lines, so edges read better on Windows and lower-end displays
    const trimThickness = Math.max(0.06, Math.min(0.11, Math.min(w, d) * 0.13));
    const trimDepth = 0.07;
    const frameMat = new THREE.MeshLambertMaterial({
      color: frameColor,
      emissive: emColor.clone().multiplyScalar(0.18),
      emissiveIntensity: baseFrameEmissiveIntensity,
    });
    frameMat.userData.baseEmissiveIntensity = baseFrameEmissiveIntensity;
    const cornerGeo = new THREE.BoxGeometry(trimThickness, h + 0.05, trimThickness);
    [
      [w / 2 - trimThickness / 2, d / 2 - trimThickness / 2],
      [-w / 2 + trimThickness / 2, d / 2 - trimThickness / 2],
      [w / 2 - trimThickness / 2, -d / 2 + trimThickness / 2],
      [-w / 2 + trimThickness / 2, -d / 2 + trimThickness / 2],
    ].forEach(([tx, tz]) => {
      const corner = new THREE.Mesh(cornerGeo, frameMat);
      corner.position.set(tx, 0, tz);
      body.add(corner);
    });
    const frontBarGeo = new THREE.BoxGeometry(w + 0.05, trimThickness, trimDepth);
    const sideBarGeo = new THREE.BoxGeometry(trimDepth, trimThickness, d + 0.05);
    const topFront = new THREE.Mesh(frontBarGeo, frameMat);
    topFront.position.set(0, h / 2 - trimThickness / 2, d / 2 + trimDepth / 2);
    body.add(topFront);
    const topBack = topFront.clone();
    topBack.position.z = -(d / 2 + trimDepth / 2);
    body.add(topBack);
    const topRight = new THREE.Mesh(sideBarGeo, frameMat);
    topRight.position.set(w / 2 + trimDepth / 2, h / 2 - trimThickness / 2, 0);
    body.add(topRight);
    const topLeft = topRight.clone();
    topLeft.position.x = -(w / 2 + trimDepth / 2);
    body.add(topLeft);
    const frontGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.max(0.28, w - trimThickness * 1.9), Math.max(0.4, h - trimThickness * 2.2)),
      new THREE.MeshBasicMaterial({
        color: frameColor.clone().multiplyScalar(0.58),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    frontGlow.position.set(0, 0, d / 2 + 0.011);
    body.add(frontGlow);
    body.userData.frameMat = frameMat;
    body.userData.frontGlow = frontGlow.material;

    // ── Windows: proper grid, all 4 faces ──
    const winSpaceX = 0.215;
    const winSpaceY = 0.27;
    const marginEdge = 0.12;
    const floorStart = 0.5;   // above ground (leaves room for door)
    const roofStop = 0.18;

    // Keep window detail on broad faces only.
    // Side-face window planes create edge moire/artifacts at shallow angles.
    const faces = [
      { span: w, depth: d, axis: 'front' },
      { span: w, depth: d, axis: 'back' },
    ];

    faces.forEach(face => {
      const cols = Math.max(1, Math.floor((face.span - marginEdge * 2) / winSpaceX));
      const startU = -(cols - 1) * winSpaceX / 2;

      for (let c = 0; c < cols; c++) {
        const u = startU + c * winSpaceX;
        for (let y = floorStart; y < h - roofStop; y += winSpaceY) {
          const mat = pickWinMat();
          let windowMaterial = mat;
          if (mat !== winMats.dark) {
            if (Math.random() < animatedWindowChance) {
              windowMaterial = mat.clone();
              windowMaterial.userData.baseColor = mat.userData.baseColor.clone();
              animatedWindows.push({
                material: windowMaterial,
                baseIntensity: windowGlowTargets.get(mat) || 1,
                speed: 0.28 + Math.random() * 0.34,
                flutterSpeed: 0.7 + Math.random() * 0.7,
                dipSpeed: 0.42 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
                dipDepth: 0.04 + Math.random() * 0.06,
              });
            }
          }
          const win = new THREE.Mesh(winGeo, windowMaterial);
          const yLocal = y - h / 2;

          switch (face.axis) {
            case 'front':
              win.position.set(u, yLocal, d / 2 + windowLift);
              break;
            case 'back':
              win.position.set(u, yLocal, -(d / 2 + windowLift));
              win.rotation.y = Math.PI;
              break;
            case 'right':
              win.position.set(w / 2 + windowLift, yLocal, u);
              win.rotation.y = Math.PI / 2;
              break;
            case 'left':
              win.position.set(-(w / 2 + windowLift), yLocal, u);
              win.rotation.y = -Math.PI / 2;
              break;
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

    const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(doorW, doorH * 0.65), doorGlassMat);
    doorGlass.position.set(0, doorH * 0.08, 0.01);
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
      const sfGeo = new THREE.PlaneGeometry(sfW, sfH);

      [-1, 1].forEach(side => {
        const sf = new THREE.Mesh(sfGeo, storefrontMat);
        sf.position.set(side * (doorW / 2 + sfW / 2 + 0.08), -h / 2 + sfH / 2 + 0.04, d / 2 + 0.012);
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

  const dataBlips = [];
  [
    { x: -3.9, y: 4.7, z: -0.7, color: brandPalette.orange },
    { x: -2.2, y: 5.1, z: -1.1, color: brandPalette.gold },
    { x: -0.4, y: 4.9, z: -0.5, color: brandPalette.cyan },
    { x: 1.6, y: 5.5, z: -0.8, color: brandPalette.purple },
    { x: 3.6, y: 4.8, z: -0.4, color: brandPalette.cyan },
    { x: 4.6, y: 4.1, z: 0.2, color: brandPalette.red },
  ].forEach((cfg, index) => {
    const blip = new THREE.Sprite(new THREE.SpriteMaterial({
      map: moonGlowTexture,
      color: cfg.color,
      transparent: true,
      opacity: 0.26,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    blip.position.set(cfg.x, cfg.y, cfg.z);
    blip.scale.set(0.28, 0.28, 1);
    blip.userData = {
      baseY: cfg.y,
      baseOpacity: 0.18 + (index % 2) * 0.04,
      speed: 0.65 + index * 0.08,
      phase: index * 0.9 + Math.random() * 0.6,
    };
    dataBlips.push(blip);
    scene.add(blip);
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

  const blinkMat = new THREE.MeshStandardMaterial({ color: 0xFF0000, emissive: 0xFF0000, emissiveIntensity: 0.9 });
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
  const OC = brandPalette.orange, OE = brandPalette.orangeSoft;
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

  const focusRing = new THREE.Mesh(
    new THREE.RingGeometry(0.82, 1.18, 56),
    new THREE.MeshBasicMaterial({ color: defaultTheme.accent, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  focusRing.rotation.x = -Math.PI / 2;
  focusRing.position.y = 0.04;
  scene.add(focusRing);

  const focusLight = new THREE.PointLight(defaultTheme.accent, 0, 7, 2);
  scene.add(focusLight);

  // ── Interaction ──
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let neonHover = 0;
  
  function updateGuide(text) {
    if (!factGuide) return;
    factGuide.textContent = text;
  }

  function hideFactBubble() {
    if (!factBubble) return;
    factBubble.classList.remove('is-visible', 'is-below', 'is-hud', 'is-sheet');
    factBubble.hidden = true;
    if (factLink) factLink.tabIndex = -1;
  }

  function showFactBubble(fact) {
    if (!factBubble || !fact) return;
    if (factKicker) factKicker.textContent = fact.kicker;
    if (factTitle) factTitle.textContent = fact.title;
    if (factBody) factBody.textContent = fact.body;
    if (factSource) factSource.textContent = fact.source;
    if (factLink) {
      const hasUrl = Boolean(fact.url);
      factLink.hidden = !hasUrl;
      factLink.tabIndex = hasUrl ? 0 : -1;
      if (hasUrl) {
        factLink.href = fact.url;
      } else {
        factLink.removeAttribute('href');
      }
    }
    factBubble.scrollTop = 0;
    if (factBody) factBody.scrollTop = 0;
    factBubble.hidden = false;
    factBubble.classList.add('is-visible');
  }

  function positionFactBubble() {
    if (!factBubble || selectedBuildingIndex == null) return;
    const selectedBuilding = buildings[selectedBuildingIndex];
    if (!selectedBuilding) return;

    if (isPhone) {
      factBubble.classList.remove('is-hud');
      factBubble.classList.add('is-sheet');
      factBubble.classList.remove('is-below');
      const maxBubbleHeight = Math.max(248, Math.min(H - 82, 288));
      factBubble.style.setProperty('--bubble-max-height', `${maxBubbleHeight}px`);
      factBubble.style.removeProperty('--bubble-x');
      factBubble.style.removeProperty('--bubble-y');
      factBubble.style.removeProperty('--bubble-tail-left');
      return;
    }

    factBubble.classList.remove('is-sheet', 'is-below');
    factBubble.classList.add('is-hud');
    factBubble.style.removeProperty('--bubble-max-height');
    const bubbleWidth = factBubble.offsetWidth || (isTablet ? 390 : 430);
    const top = isTablet ? 88 : 82;
    const left = Math.max(16, Math.round((W - bubbleWidth) / 2));
    factBubble.style.setProperty('--bubble-x', `${left}px`);
    factBubble.style.setProperty('--bubble-y', `${top}px`);
    factBubble.style.removeProperty('--bubble-tail-left');
  }

  function getFocusPose(building) {
    const { cfg } = building.userData;
    const focusDistance = THREE.MathUtils.clamp(
      cfg.h * (isPhone ? 1.02 : 1.15),
      isPhone ? 4.1 : isMobile ? 4.6 : 5.1,
      isPhone ? 5.35 : isMobile ? 6.2 : 6.9,
    );
    const sideBias = THREE.MathUtils.clamp(-cfg.x * 0.08, -0.45, 0.45);
    const position = new THREE.Vector3(
      cfg.x + sideBias,
      Math.max(isPhone ? 1.6 : 1.85, cfg.h * (isPhone ? 0.68 : 0.74)),
      cfg.z + focusDistance,
    );
    const target = new THREE.Vector3(
      cfg.x,
      Math.max(1.15, cfg.h * 0.52),
      cfg.z,
    );
    return { position, target };
  }

  function selectBuilding(buildingIndex) {
    const building = buildings[buildingIndex];
    const fact = building?.userData?.fact;
    if (!building || !fact) return;

    if (selectedBuildingIndex == null) {
      overviewCameraPosition.copy(camera.position);
      overviewCameraTarget.copy(controls.target);
    }

    selectedBuildingIndex = buildingIndex;
    hoveredBuildingIndex = null;
    controls.autoRotate = false;
    controls.enableRotate = false;
    cameraState = 'focus';

    const { position, target } = getFocusPose(building);
    desiredCameraPosition.copy(position);
    desiredCameraTarget.copy(target);
    applyTheme(fact.accent);
    setSupportState({ fact, accent: fact.accent });
    updateGuide(activeGuideText);
    factGuide?.classList.add('is-hidden');
    showFactBubble(fact);
    positionFactBubble();
    syncRadiantState(true);
  }

  function clearSelection(instant = false) {
    if (selectedBuildingIndex == null) return;

    selectedBuildingIndex = null;
    applyTheme(defaultTheme.accent);
    setSupportState({ accent: defaultTheme.accent });
    updateGuide(idleGuideText);
    factGuide?.classList.remove('is-hidden');
    hideFactBubble();
    syncRadiantState(false);
    desiredCameraPosition.copy(overviewCameraPosition);
    desiredCameraTarget.copy(overviewCameraTarget);

    if (instant) {
      camera.position.copy(overviewCameraPosition);
      controls.target.copy(overviewCameraTarget);
      controls.autoRotate = !useReducedMotion;
      controls.enableRotate = true;
      cameraState = 'idle';
      return;
    }

    cameraState = 'return';
  }

  function setMouseFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function getBuildingHit() {
    return raycaster.intersectObjects(buildings, false).find((hit) => Boolean(hit.object.userData.fact)) || null;
  }

  const onPointerMove = (e) => {
    setMouseFromEvent(e);
    raycaster.setFromCamera(mouse, camera);
    neonHover = raycaster.intersectObject(neonHitbox, true).length > 0 ? 1 : 0;
    const buildingHit = getBuildingHit();

    if (selectedBuildingIndex == null) {
      hoveredBuildingIndex = buildingHit ? buildingHit.object.userData.bIdx : null;
    }

    if (!isTouchDevice) {
      if (selectedBuildingIndex != null) {
        canvas.style.cursor = buildingHit ? 'pointer' : 'zoom-out';
      } else {
        canvas.style.cursor = buildingHit || neonHover > 0.5 ? 'pointer' : 'grab';
      }
    }
  };
  canvas.addEventListener('pointermove', onPointerMove);

  const onPointerLeave = () => {
    neonHover = 0;
    if (selectedBuildingIndex == null) hoveredBuildingIndex = null;
    if (!isTouchDevice) {
      canvas.style.cursor = selectedBuildingIndex == null ? 'grab' : 'zoom-out';
    }
  };
  canvas.addEventListener('pointerleave', onPointerLeave);

  const onPointerDown = (e) => {
    setMouseFromEvent(e);
    raycaster.setFromCamera(mouse, camera);
    const buildingHit = getBuildingHit();

    if (buildingHit) {
      const hitIndex = buildingHit.object.userData.bIdx;
      if (hitIndex === selectedBuildingIndex) {
        clearSelection(false);
        return;
      }
      selectBuilding(hitIndex);
      return;
    }

    if (selectedBuildingIndex != null) {
      clearSelection(false);
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);

  // (embers, sparkles, ambient particles removed — clean skyline look)

  // ── Animation loop ──
  const clock = new THREE.Clock();
  let startTime = null, started = false, riseComplete = false;
  const riseDuration = 0.72;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate() {
    if (!started) {
      startTime = clock.getElapsedTime();
      started = true;
      container.classList.add('is-ready');
      clock.getDelta();
    }

    const elapsed = clock.getElapsedTime() - startTime;
    const scrollP = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const layerOpacity = scrollP > 0.7 ? Math.max(0, 1 - (scrollP - 0.7) / 0.3) : 1;
    canvas.style.opacity = String(layerOpacity);
    if (signalLayer) signalLayer.style.opacity = String(layerOpacity);
    const riseFactor = Math.min(elapsed / riseDuration, 1);

    starFields.forEach((field) => {
      field.material.opacity = (field.userData.baseOpacity + Math.sin(elapsed * field.userData.speed + field.userData.phase) * 0.05) * layerOpacity;
    });
    moonHalo.material.opacity = (0.31 + Math.sin(elapsed * 0.16) * 0.018) * layerOpacity;
    moonHalo.scale.setScalar(9.8 + Math.sin(elapsed * 0.1 + 0.6) * 0.22);
    horizonGlow.material.opacity = (0.16 + Math.sin(elapsed * 0.1 + 0.8) * 0.02) * layerOpacity;
    cityGlow.material.opacity = (0.095 + Math.sin(elapsed * 0.18 + 1.3) * 0.015) * layerOpacity;
    roadSheen.material.opacity = (0.06 + Math.sin(elapsed * 0.24 + 1.1) * 0.012) * layerOpacity;
    groundGlow.material.opacity = (0.075 + Math.sin(elapsed * 0.12 + 2.1) * 0.01) * layerOpacity;

    skylineBacklights.forEach((glow) => {
      glow.material.opacity = (glow.userData.baseOpacity + Math.sin(elapsed * glow.userData.speed + glow.userData.phase) * 0.05) * layerOpacity;
    });

    longExposureTrails.forEach((trail, index) => {
      const shimmer = 0.78 + Math.sin(elapsed * trail.speed + trail.phase + index * 0.4) * 0.22;
      trail.mesh.material.opacity = trail.baseOpacity * shimmer * riseFactor * layerOpacity;
    });

    dataBlips.forEach((blip) => {
      blip.position.y = blip.userData.baseY + Math.sin(elapsed * blip.userData.speed + blip.userData.phase) * 0.12;
      blip.material.opacity = (blip.userData.baseOpacity + Math.sin(elapsed * (blip.userData.speed + 0.18) + blip.userData.phase) * 0.08) * layerOpacity;
    });

    streetTrees.forEach((tree) => {
      tree.rotation.z = Math.sin(elapsed * tree.userData.swaySpeed + tree.userData.phase) * tree.userData.swayAmount;
    });

    shootingStarSystems.forEach((system) => {
      const cycle = (elapsed * system.speed + system.offset) % 1;
      if (cycle < 0.14) {
        const t = cycle / 0.14;
        const pulse = Math.sin(t * Math.PI);
        system.head.position.copy(system.curve.getPoint(t));
        system.head.material.opacity = pulse * 0.95 * layerOpacity;
        system.head.scale.setScalar(0.75 + pulse * 0.5);
        system.trail.material.opacity = (system.baseOpacity + pulse * 0.08) * layerOpacity;
      } else {
        system.head.material.opacity = 0;
        system.trail.material.opacity = system.baseOpacity * 0.45 * layerOpacity;
      }
    });

    // ── Rise phase ──
    if (elapsed < riseDuration) {
        const p = elapsed / riseDuration;
        grid.material.opacity = p * 0.018;

      buildings.forEach(b => {
        b.position.y = b.userData.startY + (b.userData.targetY - b.userData.startY) * easeOutCubic(p);
      });

      if (elapsed >= 0.2) {
        const np = Math.min((elapsed - 0.2) / 0.22, 1);
        neonBars.forEach(bar => { bar.material.emissiveIntensity = np * 2.7; });
        neonPL.intensity = 3.7 * np;
        neonSceneLight.intensity = 3.3 * np;
      }

      if (elapsed >= 0.24) {
        const wp = Math.min((elapsed - 0.24) / 0.34, 1);
        setWindowGlow(wp);
      }
      blinkMat.emissiveIntensity = 0.9 * riseFactor;
    } else {
      // ── Steady state ──
      if (!riseComplete) {
        riseComplete = true;
        buildings.forEach(b => { b.position.y = b.userData.targetY; });
        setWindowGlow(1);
        if (selectedBuildingIndex == null) controls.autoRotate = !useReducedMotion;
      }

      grid.material.opacity = 0.018;
      setWindowGlow(1);

      const focusIndex = selectedBuildingIndex ?? hoveredBuildingIndex;
      const focusBuilding = focusIndex != null ? buildings[focusIndex] : null;
      const focusFact = focusBuilding?.userData?.fact || null;

      buildings.forEach((b) => {
        b.material.emissiveIntensity = b.userData.baseEmissiveIntensity || 0;
        if (b.userData.frameMat) {
          b.userData.frameMat.emissiveIntensity = b.userData.frameMat.userData.baseEmissiveIntensity || 0;
        }
        if (b.userData.frontGlow) {
          b.userData.frontGlow.opacity = 0;
        }
      });

      animatedWindows.forEach((windowState, index) => {
        const shimmer = 0.965 + Math.sin(elapsed * windowState.speed + windowState.phase + index * 0.05) * 0.035;
        const flutter = Math.pow(Math.max(0, Math.sin(elapsed * windowState.flutterSpeed + windowState.phase * 1.2)), 18) * 0.05;
        const dip = Math.pow(Math.max(0, Math.sin(elapsed * windowState.dipSpeed + windowState.phase * 0.55)), 24) * windowState.dipDepth;
        setLitPlaneIntensity(windowState.material, windowState.baseIntensity * THREE.MathUtils.clamp(shimmer + flutter - dip, 0.88, 1.02));
      });

      if (focusBuilding && focusFact) {
        const { cfg } = focusBuilding.userData;
        focusRing.position.set(cfg.x, 0.04, cfg.z);
        focusLight.position.set(cfg.x, cfg.h * 0.72, cfg.z + 0.15);
        focusRing.material.color.setHex(focusFact.accent);
        focusLight.color.setHex(focusFact.accent);
        focusBuilding.material.emissiveIntensity = (focusBuilding.userData.baseEmissiveIntensity || 0) + (selectedBuildingIndex != null ? 0.12 : 0.06);
        if (focusBuilding.userData.frameMat) {
          focusBuilding.userData.frameMat.emissiveIntensity = (focusBuilding.userData.frameMat.userData.baseEmissiveIntensity || 0) + (selectedBuildingIndex != null ? 0.14 : 0.08);
        }
      }

      const focusStrength = selectedBuildingIndex != null ? 1 : (hoveredBuildingIndex != null ? 0.55 : 0);
      const targetRingOpacity = focusStrength > 0 ? (selectedBuildingIndex != null ? 0.18 : 0.08) : 0;
      const targetRingScale = focusStrength > 0 ? (selectedBuildingIndex != null ? 1.03 : 0.97) : 0.9;
      const targetLightIntensity = focusStrength > 0 ? (selectedBuildingIndex != null ? 0.52 : 0.16) : 0;
      focusRing.material.opacity += (targetRingOpacity - focusRing.material.opacity) * 0.16;
      focusRing.scale.setScalar(focusRing.scale.x + (targetRingScale - focusRing.scale.x) * 0.16);
      focusLight.intensity += (targetLightIntensity - focusLight.intensity) * 0.16;

      // Neon hover
      neonBars.forEach(bar => {
        const target = neonHover > 0.5 ? 3.2 : 2.45;
        bar.material.emissiveIntensity += (target - bar.material.emissiveIntensity) * 0.05;
      });
      neonPL.intensity += ((neonHover > 0.5 ? 4.5 : 3.8) - neonPL.intensity) * 0.08;
      neonSceneLight.intensity += ((neonHover > 0.5 ? 4.1 : 3.4) - neonSceneLight.intensity) * 0.08;

      blinkMat.emissiveIntensity = 0.9;
    }

    if (cameraState === 'focus' || cameraState === 'return') {
      const lerp = cameraState === 'focus' ? 0.08 : 0.075;
      camera.position.lerp(desiredCameraPosition, lerp);
      controls.target.lerp(desiredCameraTarget, lerp);

      if (cameraState === 'return'
        && camera.position.distanceTo(desiredCameraPosition) < 0.08
        && controls.target.distanceTo(desiredCameraTarget) < 0.05) {
        cameraState = 'idle';
        controls.autoRotate = !useReducedMotion;
        controls.enableRotate = true;
      }
    }

    if (!useReducedMotion && cameraState === 'idle' && selectedBuildingIndex == null) {
      const idleTargetX = 0.15 + Math.sin(elapsed * 0.11) * 0.03;
      const idleTargetY = 2.55 + Math.sin(elapsed * 0.22 + 0.4) * 0.045;
      controls.target.x += (idleTargetX - controls.target.x) * 0.04;
      controls.target.y += (idleTargetY - controls.target.y) * 0.04;
    }

    controls.update();
    if (selectedBuildingIndex != null) positionFactBubble();
    renderer.render(scene, camera);
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
      if (selectedBuildingIndex != null) positionFactBubble();
    }
  };
  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('scroll', onResize);

  animate();

  return () => {
    window.removeEventListener('resize', onResize);
    window.visualViewport?.removeEventListener('resize', onResize);
    window.visualViewport?.removeEventListener('scroll', onResize);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('pointerdown', onPointerDown);
    renderer.dispose();
  };
}
