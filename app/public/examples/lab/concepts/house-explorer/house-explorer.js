import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('[data-canvas]');
const loading = document.querySelector('[data-house-loading]');
const fallback = document.querySelector('[data-house-fallback]');
const status = document.querySelector('[data-house-status]');
const hint = document.querySelector('[data-house-hint]');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const announce = (message) => { status.textContent = message; };
const setPressed = (selector, value) => document.querySelectorAll(selector).forEach((button) => {
  button.setAttribute('aria-pressed', String(button.dataset[selector.includes('view') ? 'houseView' : 'houseLight'] === value));
});

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
} catch (error) {
  console.error(error);
  fallback.hidden = false;
  loading.hidden = true;
  announce('3D graphics are unavailable. A static alternative is shown.');
}

if (renderer) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 1000);
  const target = new THREE.Vector3();
  const orbit = { theta: -.82, phi: 1.16, radius: 40, targetTheta: -.82, targetPhi: 1.16, targetRadius: 40 };
  const group = new THREE.Group();
  const hemi = new THREE.HemisphereLight(0xd8efff, 0x7e6a4e, 2.2);
  const sun = new THREE.DirectionalLight(0xfff2cf, 4.3);
  const fill = new THREE.DirectionalLight(0xb5d6ff, 1.5);
  const views = {
    overview: { theta: -.82, phi: 1.16, radius: 1.55, label: 'Overview' },
    front: { theta: -1.58, phi: 1.27, radius: 1.32, label: 'Front view' },
    side: { theta: .22, phi: 1.22, radius: 1.4, label: 'Side view' },
  };
  let baseRadius = 40;
  let day = true;
  let pointer = null;
  let animateFrame = 0;

  scene.add(group, hemi, sun, fill);
  sun.position.set(-28, 52, 35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(matchMedia('(pointer: coarse)').matches ? 1024 : 2048, matchMedia('(pointer: coarse)').matches ? 1024 : 2048);
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 140;
  fill.position.set(25, 24, -20);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(66, 96),
    new THREE.MeshStandardMaterial({ color: 0xd8d1bf, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -.35;
  ground.receiveShadow = true;
  scene.add(ground);

  function updateCamera() {
    const moving = Math.abs(orbit.targetTheta - orbit.theta) > .0005 || Math.abs(orbit.targetPhi - orbit.phi) > .0005 || Math.abs(orbit.targetRadius - orbit.radius) > .01;
    orbit.theta += (orbit.targetTheta - orbit.theta) * (reducedMotion.matches ? 1 : .12);
    orbit.phi += (orbit.targetPhi - orbit.phi) * (reducedMotion.matches ? 1 : .12);
    orbit.radius += (orbit.targetRadius - orbit.radius) * (reducedMotion.matches ? 1 : .12);
    const sinPhi = Math.sin(orbit.phi);
    camera.position.set(
      target.x + orbit.radius * sinPhi * Math.sin(orbit.theta),
      target.y + orbit.radius * Math.cos(orbit.phi),
      target.z + orbit.radius * sinPhi * Math.cos(orbit.theta)
    );
    camera.lookAt(target);
    return moving;
  }

  function render() {
    animateFrame = 0;
    const moving = updateCamera();
    renderer.render(scene, camera);
    if (moving && !document.hidden) requestRender();
  }

  function requestRender() {
    if (!animateFrame && !document.hidden) animateFrame = requestAnimationFrame(render);
  }

  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 2));
    renderer.setSize(width, height, false);
    requestRender();
  }

  function setView(name, announceChange = true) {
    const view = views[name];
    orbit.targetTheta = view.theta;
    orbit.targetPhi = view.phi;
    orbit.targetRadius = baseRadius * view.radius;
    setPressed('[data-house-view]', name);
    requestRender();
    if (announceChange) announce(`${view.label} selected.`);
  }

  function setLight(name) {
    day = name === 'day';
    const sky = day ? 0xb8dbef : 0x5e665e;
    scene.fog = new THREE.FogExp2(sky, day ? .005 : .012);
    hemi.color.set(day ? 0xd8efff : 0x626a91);
    hemi.groundColor.set(day ? 0x7e6a4e : 0x273127);
    hemi.intensity = day ? 2.2 : .84;
    sun.color.set(day ? 0xfff2cf : 0xffb477);
    sun.intensity = day ? 4.3 : 1.2;
    sun.position.set(day ? -28 : 28, day ? 52 : 18, day ? 35 : -22);
    fill.color.set(day ? 0xb5d6ff : 0x8e7dcc);
    fill.intensity = day ? 1.5 : .9;
    ground.material.color.set(day ? 0xd8d1bf : 0x4b4947);
    document.documentElement.style.setProperty('--house-sky', day ? '#b8dbef' : '#565e74');
    document.querySelector('.house-explorer').classList.toggle('is-dusk', !day);
    setPressed('[data-house-light]', name);
    requestRender();
    announce(`${day ? 'Day' : 'Dusk'} light selected.`);
  }

  function reset() {
    setView('overview', false);
    setLight('day');
    hint.textContent = 'View reset · drag to look around';
  }

  document.querySelectorAll('[data-house-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.houseView)));
  document.querySelectorAll('[data-house-light]').forEach((button) => button.addEventListener('click', () => setLight(button.dataset.houseLight)));
  document.querySelector('[data-house-reset]').addEventListener('click', reset);

  canvas.addEventListener('pointerdown', (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!pointer) return;
    orbit.targetTheta -= (event.clientX - pointer.x) * .009;
    orbit.targetPhi = THREE.MathUtils.clamp(orbit.targetPhi + (event.clientY - pointer.y) * .008, .38, 1.5);
    pointer = { x: event.clientX, y: event.clientY };
    requestRender();
  });
  canvas.addEventListener('pointerup', () => { pointer = null; });
  canvas.addEventListener('pointercancel', () => { pointer = null; });
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    orbit.targetRadius = THREE.MathUtils.clamp(orbit.targetRadius + event.deltaY * .024, baseRadius * .72, baseRadius * 2.2);
    requestRender();
  }, { passive: false });
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Home') { reset(); event.preventDefault(); }
    if (event.key === '+' || event.key === '=') { orbit.targetRadius *= .9; event.preventDefault(); }
    if (event.key === '-') { orbit.targetRadius *= 1.1; event.preventDefault(); }
    if (event.key === 'ArrowLeft') { orbit.targetTheta += .16; event.preventDefault(); }
    if (event.key === 'ArrowRight') { orbit.targetTheta -= .16; event.preventDefault(); }
    if (event.key === 'ArrowUp') { orbit.targetPhi = THREE.MathUtils.clamp(orbit.targetPhi - .1, .38, 1.5); event.preventDefault(); }
    if (event.key === 'ArrowDown') { orbit.targetPhi = THREE.MathUtils.clamp(orbit.targetPhi + .1, .38, 1.5); event.preventDefault(); }
    requestRender();
  });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    loading.hidden = false;
    loading.querySelector('p').textContent = 'Restoring the design study';
  });
  canvas.addEventListener('webglcontextrestored', () => {
    loading.hidden = true;
    announce('The 3D view was restored.');
    requestRender();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) requestRender(); });
  new ResizeObserver(resize).observe(canvas);
  resize();
  setLight('day');
  requestRender();

  new GLTFLoader().load('./assets/house-study.glb', (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (Array.isArray(child.material)) child.material.forEach((material) => { material.envMapIntensity = .55; });
      else child.material.envMapIntensity = .55;
    });
    group.add(model);
    const bounds = new THREE.Box3().setFromObject(model);
    const size = bounds.getSize(new THREE.Vector3());
    bounds.getCenter(target);
    target.y += size.y * .14;
    baseRadius = Math.max(size.length() * .72, 16);
    setView('overview', false);
    requestRender();
    loading.hidden = true;
    document.body.dataset.houseExplorer = 'ready';
    announce('House Explorer is ready. Drag to look around, or choose a view.');
  }, undefined, (error) => {
    console.error(error);
    loading.hidden = true;
    fallback.hidden = false;
    cancelAnimationFrame(animateFrame);
    announce('The 3D view could not be opened. A static alternative is shown.');
  });
}
