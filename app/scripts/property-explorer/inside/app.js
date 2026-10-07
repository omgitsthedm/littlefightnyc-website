import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createModel, layerDefs, data } from './model-faithful.js';
import { createServiceIndex } from './service-index-faithful.js';

const $ = (id) => document.getElementById(id);
const confidence = { dimensioned: 'Measured', derived: 'Derived', approximate: 'Approximate', schematic: 'Illustrative', conflict: 'Approximate' };
const post = (type) => {
  if (parent !== window) { parent.postMessage({ type }, location.origin); return; }
  location.assign(type === 'farm-house-property' ? '/examples/lab/concepts/house-explorer/' : '/');
};

function boot() {
  if (data.schema !== 'farm-house-construction-safe-v2') throw new Error('The construction study is unavailable.');
  const model = createModel();
  Object.assign(model.layers.walls, { visible: true });
  Object.assign(model.layers.trusses, { visible: true });
  Object.assign(model.layers.roof, { visible: false });
  Object.assign(model.layers.finishes, { visible: false });
  Object.assign(model.layers.ceilings, { visible: false });
  Object.assign(model.layers.barn, { visible: false });
  const index = createServiceIndex(model, data);
  const scene = new T.Scene();
  scene.background = new T.Color('#121317');
  scene.add(model.root, model.trussGallery);
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.localClippingEnabled = true;
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('aria-label', 'Farm House construction model. Drag to orbit and scroll to zoom.');
  $('view').append(renderer.domElement);
  const camera = new T.PerspectiveCamera(42, 1, .05, 600);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * .49;
  controls.minDistance = .15;
  controls.maxDistance = 160;
  scene.add(new T.HemisphereLight('#fff2d3', '#25312c', 2.2));
  const sun = new T.DirectionalLight('#fff3d9', 3);
  sun.position.set(-35, 60, 20); sun.castShadow = true; scene.add(sun);
  let selected; let box; let galleryOpen = false;
  const defaultTarget = new T.Vector3(...model.P(655, 424, 2));
  let framing = { target: defaultTarget.clone(), size: 44 };
  const clippingPlane = new T.Plane(new T.Vector3(0, -1, 0), 0);
  const render = () => renderer.render(scene, camera);
  function frame(target = defaultTarget, size = 44) {
    if (galleryOpen) {
      const bounds = new T.Box3().setFromObject(model.trussGallery);
      const dimensions = bounds.getSize(new T.Vector3());
      const fitHeight = Math.max(dimensions.y / .43, dimensions.x / camera.aspect / .78, .2);
      const distance = fitHeight / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)));
      const center = bounds.getCenter(new T.Vector3());
      center.y += fitHeight * .1;
      controls.target.copy(center);
      camera.position.copy(center).add(new T.Vector3(0, distance * .04, distance));
      controls.update(); render(); return;
    }
    framing = { target: target.clone(), size };
    const fittedSize = size / Math.min(1, Math.max(camera.aspect, .25));
    controls.target.copy(target);
    camera.position.copy(target).add(new T.Vector3(-1, .8, .8).normalize().multiplyScalar(fittedSize / (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))));
    controls.update(); render();
  }
  function closeGallery() {
    if (!galleryOpen) return false;
    model.trussGallery.clear(); model.trussGallery.visible = false; model.root.visible = true; galleryOpen = false;
    $('view-title').textContent = 'See the build.'; $('view-kicker').textContent = 'Construction study'; frame(); return true;
  }
  function clearSelection() {
    selected = null;
    if (box) { scene.remove(box); box.geometry.dispose(); box.material.dispose(); box = null; }
    $('selected').hidden = true;
    model.objects.forEach((object) => { object.visible = !object.userData.alwaysHidden; });
    render();
  }
  function select(id) {
    closeGallery();
    const object = model.registry[id], entry = index.get(id);
    if (!object) return;
    clearSelection();
    selected = entry || { id, name: object.name, category: object.userData.layer, confidence: object.userData.confidence, relatedIds: [id] };
    model.layers[object.userData.layer].visible = true;
    layerInputs.get(object.userData.layer).checked = true;
    model.objects.forEach((item) => { item.visible = (selected.relatedIds || [id]).includes(item.userData.id); }); object.visible = true;
    box = new T.BoxHelper(object, '#ff7839'); box.material.depthTest = false; scene.add(box);
    $('selected').hidden = false; $('selected-name').textContent = selected.name || object.name;
    $('selected-meta').textContent = `${selected.category || object.userData.layer} · ${confidence[selected.confidence] || 'Approximate'}`;
    const bounds = new T.Box3().setFromObject(object);
    frame(bounds.getCenter(new T.Vector3()), Math.max(9, bounds.getSize(new T.Vector3()).length() * 1.8)); updateResults();
  }
  function updateResults() {
    const entries = index.search({ query: $('search').value, limit: 480 });
    $('results').replaceChildren(...entries.map((entry) => {
      const button = document.createElement('button'); button.className = 'result'; button.type = 'button';
      button.textContent = `${entry.name} · ${entry.roomName}`; button.addEventListener('click', () => select(entry.id)); return button;
    }));
    $('count').textContent = entries.length ? `${entries.length} matches` : 'Try outlet, toilet, truss, or air.';
  }
  function setGallery(mark) {
    model.trussGallery.clear(); const profile = model.trussProfile(mark); if (!profile.children.length) return;
    clearSelection(); model.root.visible = false; model.trussGallery.visible = true; model.trussGallery.add(profile); galleryOpen = true;
    const bounds = new T.Box3().setFromObject(profile), dimensions = bounds.getSize(new T.Vector3());
    $('view-title').textContent = `Truss ${mark}`; $('view-kicker').textContent = 'Individual profile · Illustrative placement'; frame(bounds.getCenter(new T.Vector3()), Math.max(dimensions.x, dimensions.y, dimensions.z) * 1.45);
  }
  function setBarnVisible(visible) { model.layers.barn.visible = visible; $('barn-toggle').checked = visible; if (layerInputs.has('barn')) layerInputs.get('barn').checked = visible; }
  function showBarn() { closeGallery(); clearSelection(); setBarnVisible(true); frame(new T.Vector3(...model.barnTarget), 28); }
  const layerInputs = new Map();
  for (const [id, label] of layerDefs) {
    if (!model.layers[id].children.length) continue;
    const wrapper = document.createElement('label'), input = document.createElement('input'); wrapper.className = 'layer'; input.type = 'checkbox'; input.checked = model.layers[id].visible;
    input.addEventListener('change', () => { model.layers[id].visible = input.checked; if (id === 'barn') $('barn-toggle').checked = input.checked; render(); }); layerInputs.set(id, input); wrapper.append(input, document.createTextNode(label)); $('layers').append(wrapper);
  }
  for (const truss of data.trusses) { const option = document.createElement('option'); option.value = truss.mark; option.textContent = truss.mark; $('truss').append(option); }
  $('truss').value = data.trusses.find((truss) => data.truss_vectors.some((vector) => vector.mark === truss.mark))?.mark || data.trusses[0]?.mark || '';
  $('search').addEventListener('input', updateResults);
  $('reset').addEventListener('click', () => { closeGallery(); clearSelection(); frame(); });
  $('property').addEventListener('click', () => post('farm-house-property')); $('exit').addEventListener('click', () => post('farm-house-exit')); $('clear').addEventListener('click', clearSelection);
  $('cut').addEventListener('input', () => { const value = Number($('cut').value); renderer.clippingPlanes = value === 100 ? [] : [clippingPlane]; clippingPlane.constant = value / 100 * 8; render(); });
  $('barn-toggle').addEventListener('change', (event) => { closeGallery(); setBarnVisible(event.target.checked); event.target.checked ? frame(new T.Vector3(...model.barnTarget), 28) : frame(); });
  $('show-barn').addEventListener('click', showBarn); $('show-truss').addEventListener('click', () => setGallery($('truss').value));
  document.querySelectorAll('[data-q]').forEach((button) => button.addEventListener('click', () => { $('search').value = button.dataset.q; updateResults(); }));
  document.addEventListener('keydown', (event) => { if (event.key !== 'Escape') return; if (closeGallery()) { event.preventDefault(); return; } if (selected) { clearSelection(); event.preventDefault(); return; } post('farm-house-exit'); });
  const ray = new T.Raycaster();
  renderer.domElement.addEventListener('click', (event) => {
    if (galleryOpen) return; const bounds = renderer.domElement.getBoundingClientRect();
    ray.setFromCamera(new T.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
    const hit = ray.intersectObjects(model.root.children, true)[0]; let object = hit?.object; while (object && !object.userData?.id) object = object.parent; if (object) select(object.userData.id);
  });
  new ResizeObserver(() => { const bounds = $('view').getBoundingClientRect(); renderer.setSize(bounds.width, bounds.height, false); camera.aspect = bounds.width / bounds.height; camera.updateProjectionMatrix(); frame(framing.target, framing.size); }).observe($('view'));
  controls.addEventListener('change', render); updateResults(); frame();
  if (new URLSearchParams(location.search).get('collection') === 'find') {
    $('search').setAttribute('aria-label', 'Find construction detail');
    document.querySelector('aside').scrollTo({ top: 0 });
    if (matchMedia('(min-width: 701px)').matches) requestAnimationFrame(() => $('search').focus({ preventScroll: true }));
  }
  window.farmHouseInside = Object.freeze({ model, renderer, camera, controls, frame, select, showBarn, setGallery, getState: () => ({ safeData: true, selected: selected?.id || null, entries: index.entries.length, galleryOpen }) });
}
try { boot(); } catch (error) { $('fallback').hidden = false; $('fallback').textContent = error.message; console.error(error); }
