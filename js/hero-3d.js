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

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 1.0, 0.4, 0.3);
  composer.addPass(bloom);

  scene.fog = new THREE.FogExp2(0x080B14, 0.02);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.02;
  controls.enablePan = false;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.2;
  controls.target.set(0.5, 2, 0);
  controls.update();

  const ambientLight = new THREE.AmbientLight(0x1a2040, 0.8);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x4466cc, 0.5);
  dirLight.position.set(5, 10, 6);
  scene.add(dirLight);

  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x0a0d18,
    roughness: 0.06,
    metalness: 0.95,
    emissive: 0x000000
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(50, 50, new THREE.Color(0x0891B2), new THREE.Color(0x0891B2));
  gridHelper.position.y = 0.01;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0;
  scene.add(gridHelper);

  const buildingPositions = [
    { x: -4.2, w: 1.2, d: 1.2, height: 3.5, color: new THREE.Color(0xFE5800) },
    { x: -3.0, w: 1.0, d: 1.0, height: 2.4, color: new THREE.Color(0xFF6B35) },
    { x: -2.0, w: 1.4, d: 1.4, height: 4.2, color: new THREE.Color(0x0891B2) },
    { x: -0.7, w: 0.9, d: 0.9, height: 2.8, color: new THREE.Color(0x06D6A0) },
    { x: 0.3, w: 1.5, d: 1.5, height: 5.2, color: new THREE.Color(0x8B5CF6) },
    { x: 1.8, w: 1.1, d: 1.1, height: 3.8, color: new THREE.Color(0xE040A0) },
    { x: 2.8, w: 0.8, d: 0.8, height: 2.2, color: new THREE.Color(0xFFBE0B) },
    { x: 3.5, w: 1.3, d: 1.3, height: 4.5, color: new THREE.Color(0x0891B2) },
    { x: 4.6, w: 1.0, d: 1.0, height: 3.0, color: new THREE.Color(0xFF6B6B) },
    { x: 5.5, w: 0.9, d: 0.9, height: 2.0, color: new THREE.Color(0x10B981) }
  ];

  const buildings = [];

  buildingPositions.forEach((cfg, idx) => {
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
    body.position.set(cfg.x, -(h + 2), 0);
    body.userData.targetY = h / 2;
    body.userData.startY = -(h + 2);
    body.userData.emissiveColor = emissiveColor;
    scene.add(body);
    buildings.push(body);

    const edges = new THREE.EdgesGeometry(bodyGeo);
    const wireframe = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: cfg.color, linewidth: 2 }));
    body.add(wireframe);

    const light = new THREE.PointLight(cfg.color, 0.8, 8);
    light.position.set(cfg.x, h / 2, cfg.d / 2 + 1);
    scene.add(light);

    for (let x = -cfg.w / 2 + 0.15; x <= cfg.w / 2 - 0.15; x += 0.2) {
      for (let y = 0.5; y < h - 0.5; y += 0.4) {
        const windowGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
        const windowMat = new THREE.MeshStandardMaterial({
          color: 0xFFDD00,
          emissive: 0xFFDD00,
          emissiveIntensity: 0
        });
        const window = new THREE.Mesh(windowGeo, windowMat);
        window.position.set(x, y - h / 2 + 0.4, cfg.d / 2 + 0.01);
        window.userData.emissiveColor = new THREE.Color(0xFFDD00);
        body.add(window);
      }
    }

    const barGeo = new THREE.BoxGeometry(cfg.w, 0.15, 0.02);
    const barMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.color,
      emissiveIntensity: 0
    });
    const storefront = new THREE.Mesh(barGeo, barMat);
    storefront.position.set(0, -h / 2 + 0.1, cfg.d / 2 + 0.01);
    storefront.userData.emissiveColor = cfg.color;
    body.add(storefront);
  });

  // Neon sign on the tall purple building (x: 0.3)
  const neonGroup = new THREE.Group();
  neonGroup.position.set(0.3, 3.0, 0.78);

  // Sign backing
  neonGroup.add(new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.7, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.5 })
  ));

  // Hitbox for hover
  const neonHitbox = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 0.8, 0.3),
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
  const T = 0.05, Y1 = 0.12, H1 = 0.22, Y2 = -0.16, H2 = 0.17;
  const OC = 0xFE5800, OE = 0xFF6B35, BL = 0x0891B2;

  // "Little"
  neonBars.push(NB(-.82, Y1, T, H1, OC), NB(-.76, Y1 - H1 / 2 + T / 2, .1, T, OC));
  neonBars.push(NB(-.66, Y1 - .03, T, H1 * .6, OC), NB(-.66, Y1 + H1 / 2 - .01, T * .8, T * .8, OC));
  neonBars.push(NB(-.57, Y1, T, H1, OC), NB(-.57, Y1 + H1 / 2 - T / 2, .1, T, OC));
  neonBars.push(NB(-.46, Y1, T, H1, OC), NB(-.46, Y1 + H1 / 2 - T / 2, .1, T, OC));
  neonBars.push(NB(-.36, Y1, T, H1, OC));
  neonBars.push(NB(-.27, Y1, T, H1, OC), NB(-.21, Y1 + H1 / 2 - T / 2, .1, T, OC), NB(-.21, Y1, .1, T, OC), NB(-.21, Y1 - H1 / 2 + T / 2, .1, T, OC));
  // "Fight"
  neonBars.push(NB(-.04, Y1, T, H1, OE), NB(.03, Y1 + H1 / 2 - T / 2, .12, T, OE), NB(.01, Y1 + .01, .08, T, OE));
  neonBars.push(NB(.14, Y1 - .03, T, H1 * .6, OE), NB(.14, Y1 + H1 / 2 - .01, T * .8, T * .8, OE));
  // G: left vertical + top horizontal + bottom horizontal + right stub at mid
  neonBars.push(NB(.24, Y1, T, H1, OE), NB(.31, Y1 + H1 / 2 - T / 2, .12, T, OE), NB(.31, Y1 - H1 / 2 + T / 2, .12, T, OE), NB(.37, Y1 - .02, T, H1 * .4, OE), NB(.33, Y1, .08, T, OE));
  neonBars.push(NB(.48, Y1, T, H1, OE), NB(.48, Y1 + .01, .08, T, OE), NB(.55, Y1 - .05, T, H1 * .5, OE));
  neonBars.push(NB(.65, Y1, T, H1, OE), NB(.65, Y1 + H1 / 2 - T / 2, .1, T, OE));
  // "NYC, NY"
  neonBars.push(NB(-.28, Y2, T, H2, BL), NB(-.18, Y2, T, H2, BL), NB(-.23, Y2, .12, T * .7, BL));
  neonBars.push(NB(-.07, Y2 + H2 * .2, T, H2 * .5, BL), NB(.01, Y2 + H2 * .2, T, H2 * .5, BL), NB(-.03, Y2 - H2 * .15, T, H2 * .45, BL));
  neonBars.push(NB(.12, Y2, T, H2, BL), NB(.18, Y2 + H2 / 2 - T / 2, .08, T, BL), NB(.18, Y2 - H2 / 2 + T / 2, .08, T, BL));
  neonBars.push(NB(.27, Y2 - H2 / 2, T * .6, T * .6, BL));
  neonBars.push(NB(.38, Y2, T, H2, BL), NB(.48, Y2, T, H2, BL), NB(.43, Y2, .12, T * .7, BL));
  neonBars.push(NB(.58, Y2 + H2 * .2, T, H2 * .5, BL), NB(.66, Y2 + H2 * .2, T, H2 * .5, BL), NB(.62, Y2 - H2 * .15, T, H2 * .45, BL));

  const neonLetters = neonBars.flat();

  const neonPL = new THREE.PointLight(0xFE5800, 0, 5, 1.5);
  neonPL.position.set(0.3, 3.2, 1.5);
  scene.add(neonPL);
  scene.add(neonGroup);

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
      spawnSpark(0.3, 3.0, 0.78, 30, true);
      firstPointerDown = false;
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);

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
  const emberPositions = new Float32Array(35 * 3);
  const emberVelocities = [];
  for (let i = 0; i < 35; i++) {
    emberPositions[i * 3] = 0.3 + (Math.random() - 0.5) * 0.5;
    emberPositions[i * 3 + 1] = 3.0 + (Math.random() - 0.5) * 0.3;
    emberPositions[i * 3 + 2] = 0.78;
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

  const emberColors = new Float32Array(35 * 3);
  const emberAlphas = new Float32Array(35);
  for (let i = 0; i < 35; i++) {
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

  const dataStreamPaths = [];
  for (let i = 0; i < 6; i++) {
    dataStreamPaths.push({
      points: [
        new THREE.Vector3(0, 5, 0),
        new THREE.Vector3((Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 3),
        new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5)
      ],
      t: Math.random(),
      speed: 0.3 + Math.random() * 0.3
    });
  }

  const dataStreams = [];
  const streamLineGeo = new THREE.BufferGeometry();
  const streamLineMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x0891B2),
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  const ambientParticlesGeo = new THREE.BufferGeometry();
  const ambientPositions = new Float32Array(70 * 3);
  const ambientColors = new Float32Array(70 * 3);
  for (let i = 0; i < 70; i++) {
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


  const clock = new THREE.Clock();
  let startTime = null;
  let started = false;
  let hasScrolled = false;

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

      if (elapsed >= 0.3 && elapsed < 0.35) {
        spawnSpark(0.3, 3.0, 0.78, 50, true);
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
        buildings.forEach(b => {
          b.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.material.emissive) {
              child.material.emissiveIntensity = Math.min((elapsed - 0.6) / 0.4, 1);
            }
          });
        });
      }
    } else {
      gridHelper.material.opacity = 0.3;

      buildings.forEach((b, idx) => {
        b.position.y = b.userData.targetY;
        const h = b.userData.targetY * 2;
        b.scale.y = 1 + Math.sin(elapsed * 0.6 + idx * 0.3) * 0.015;

        b.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material.emissive) {
            child.material.emissiveIntensity = 2.0;
          }
        });
      });

      neonLetters.forEach(bar => {
        const targetIntensity = neonHoverIntensity > 0.5 ? 3.5 : 2.0;
        bar.material.emissiveIntensity += (targetIntensity - bar.material.emissiveIntensity) * 0.05;
      });

      controls.autoRotate = true;
    }

    if (elapsed >= 0.8) {
      dataStreamPaths.forEach(path => {
        path.t += path.speed * 0.016;
        if (path.t > 1) path.t = 0;
      });

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
