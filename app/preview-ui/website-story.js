/* Native-scroll enhancement for the five anchor readers. The document contains
   the complete story; this module only publishes visual progress to CSS. */
(() => {
  const roots = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  const clamp = value => Math.max(0, Math.min(1, value));

  function viewport(root) {
    let node = root.querySelector('[data-rw-scene]')?.parentElement;
    while (node && node !== document.body) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 1) {
        const rect = node.getBoundingClientRect();
        return { top: rect.top + node.clientTop, height: node.clientHeight };
      }
      node = node.parentElement;
    }
    return { top: 0, height: innerHeight };
  }

  function isNearView(rect, view, force) {
    if (force) return true;
    const bottom = view.top + view.height;
    const buffer = view.height * .25;
    return rect.bottom >= view.top - buffer && rect.top <= bottom + buffer;
  }

  function sceneProgress(scene, view, paused) {
    if (paused) return 1;
    const rect = scene.getBoundingClientRect();
    const bottom = view.top + view.height;
    if (scene.dataset.rwScene === 'opening') {
      // The opening remains settled while it is first read, then moves through
      // its own height as it naturally leaves the viewport.
      return clamp((view.top - rect.top) / Math.max(rect.height, view.height * .65));
    }
    // Later scenes start when their top meets the lower edge and settle by the
    // time it has travelled through the lower forty percent of the viewport.
    return clamp((bottom - rect.top) / Math.max(1, view.height * .6));
  }

  function itemProgress(item, view, paused) {
    if (paused) return 1;
    const rect = item.getBoundingClientRect();
    const bottom = view.top + view.height;
    // Gallery items begin at entry and settle as their top reaches roughly
    // sixty percent down the actual reading viewport.
    return clamp((bottom - rect.top) / Math.max(1, view.height * .4));
  }

  function update(force = false) {
    frame = 0;
    if (document.hidden) return;
    const paused = reducedMotion.matches || document.body.classList.contains('no-motion');
    roots.forEach((state, root) => {
      if (!root.isConnected || (root.matches('main') && document.body.classList.contains('reader-open'))) return;
      root.dataset.rwMotion = paused ? 'off' : 'on';
      const view = viewport(root);
      const rootRect = root.getBoundingClientRect();
      if (!isNearView(rootRect, view, force)) return;

      state.scenes.forEach(scene => {
        const rect = scene.getBoundingClientRect();
        if (!isNearView(rect, view, force)) return;
        scene.style.setProperty('--rw-progress', sceneProgress(scene, view, paused).toFixed(4));
      });
      state.items.forEach(item => {
        const rect = item.getBoundingClientRect();
        if (!isNearView(rect, view, force)) return;
        item.style.setProperty('--rw-item-progress', itemProgress(item, view, paused).toFixed(4));
      });
    });
  }

  function schedule() {
    // requestAnimationFrame passes its timestamp to the callback. update's
    // optional argument is a boolean visibility override, so passing update
    // directly turned every ordinary frame into a forced full pass.
    if (!frame && roots.size) frame = requestAnimationFrame(() => update());
  }

  const preferenceObserver = new MutationObserver(schedule);
  function listen() {
    document.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);
    preferenceObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  function release(root) {
    const state = roots.get(root);
    if (!state) return;
    state.resize.disconnect();
    roots.delete(root);
    delete root.dataset.rwEnhanced;
    delete root.dataset.rwMotion;
    state.scenes.forEach(scene => scene.style.removeProperty('--rw-progress'));
    state.items.forEach(item => item.style.removeProperty('--rw-item-progress'));
    if (roots.size) return;
    cancelAnimationFrame(frame);
    frame = 0;
    document.removeEventListener('scroll', schedule, true);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('visibilitychange', schedule);
    reducedMotion.removeEventListener('change', schedule);
    preferenceObserver.disconnect();
  }

  function mount(root) {
    if (!root?.matches('[data-reader-template="website-service"], [data-reader-template="anchor-service"]') || roots.has(root)) return;
    const scenes = [...root.querySelectorAll('[data-rw-scene]')];
    if (!scenes.length) return;
    const items = [...root.querySelectorAll('[data-rw-item]')];
    const resize = new ResizeObserver(schedule);
    if (!roots.size) listen();
    roots.set(root, { scenes, items, resize });
    root.dataset.rwEnhanced = '';
    resize.observe(root);
    scenes.forEach(scene => resize.observe(scene));
    items.forEach(item => resize.observe(item));
    update(true);
  }

  window.LFWebsiteStory = { mount, release };
  const start = () => document.querySelectorAll('main[data-reader-template="website-service"], main[data-reader-template="anchor-service"]').forEach(mount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
