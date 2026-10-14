/* A quiet repeating day on the block. The complete scene also works without JS. */
(() => {
  const hero = document.querySelector('[data-hero="clay-neighborhood"]');
  if (!hero) return;
  const stage = hero.querySelector('.clay-neighborhood');
  const toggle = hero.querySelector('.clay-motion-toggle');
  const pigeon = hero.querySelector('.clay-pigeon');
  const announcement = hero.querySelector('.clay-surprise-status');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let inView = false;
  let paused = false;
  let frame = 0;
  let surpriseTimer;
  let position = {x: 0, y: 0};

  function resetDepth() {
    cancelAnimationFrame(frame);
    frame = 0;
    stage.style.setProperty('--depth-x', '0px');
    stage.style.setProperty('--depth-y', '0px');
  }

  function sync() {
    const running = inView && !document.hidden && !motion.matches && !paused && document.documentElement.dataset.siteBoot !== 'loading';
    hero.dataset.motion = running ? 'running' : 'paused';
    toggle.hidden = motion.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
    if (!running) resetDepth();
  }

  function paintDepth() {
    frame = 0;
    const box = stage.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (position.x - box.left) / box.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (position.y - box.top) / box.height * 2 - 1));
    stage.style.setProperty('--depth-x', (x * 7).toFixed(2) + 'px');
    stage.style.setProperty('--depth-y', (y * 4).toFixed(2) + 'px');
  }

  stage.addEventListener('pointermove', event => {
    if (hero.dataset.motion !== 'running' || !pointer.matches) return;
    position = {x: event.clientX, y: event.clientY};
    if (!frame) frame = requestAnimationFrame(paintDepth);
  }, {passive: true});
  stage.addEventListener('pointerleave', resetDepth);
  pointer.addEventListener('change', resetDepth);

  toggle.addEventListener('click', () => {
    paused = !paused;
    sync();
  });
  pigeon.addEventListener('click', () => {
    clearTimeout(surpriseTimer);
    pigeon.dataset.surprise = 'found';
    announcement.textContent = 'A pizza crust! The pigeon found lunch.';
    surpriseTimer = window.setTimeout(() => {
      delete pigeon.dataset.surprise;
      announcement.textContent = '';
    }, 3600);
  });

  const observer = new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting);
    sync();
  }, {threshold: 0.1});
  observer.observe(stage);
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('lf:site-ready', sync);
  window.addEventListener('pagehide', () => {
    resetDepth();
    clearTimeout(surpriseTimer);
    delete pigeon.dataset.surprise;
    announcement.textContent = '';
  });
  sync();
})();
