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
    document.dispatchEvent(new CustomEvent('lf:motion-request', { detail: { enabled: paused } }));
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

  // The block keeps New York time. The OPEN sign is lit only while a person
  // answers (9am-9pm Eastern, as the contact pages state), the windows glow
  // after dark and the clouds take the light of dawn and dusk.
  const root = document.documentElement;
  const clock = new Intl.DateTimeFormat('en-US', {timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'});
  function keepTime() {
    const parts = Object.fromEntries(clock.formatToParts(new Date()).map(part => [part.type, part.value]));
    const time = Number(parts.hour) % 24 + Number(parts.minute) / 60;
    const open = time >= 9 && time < 21;
    hero.dataset.nycOpen = root.dataset.nycOpen = String(open);
    hero.dataset.nycPhase = time >= 6 && time < 8 ? 'dawn' : time >= 8 && time < 17 ? 'day' : time >= 17 && time < 20 ? 'dusk' : 'night';
    // Short enough to stay on one line at 320px, so the swap never moves the page.
    document.querySelectorAll('[data-hours-status]').forEach(node => { node.textContent = open ? 'Open now · answering until 9pm ET' : 'Closed now · back at 9am ET'; });
    document.querySelectorAll('[data-hours-short]').forEach(node => { node.textContent = open ? 'Open now' : 'Back 9am ET'; });
  }
  keepTime();
  window.setInterval(keepTime, 60000);

  // First visit this session: the storefront opens. The block comes out of
  // shadow and, during opening hours, the OPEN sign flickers on. Nothing
  // waits for it; reduced motion skips it.
  try {
    if (!motion.matches && !sessionStorage.getItem('lf-arrived')) {
      sessionStorage.setItem('lf-arrived', '1');
      hero.classList.add('is-arriving');
      window.setTimeout(() => hero.classList.remove('is-arriving'), 2400);
    }
  } catch { /* storage unavailable: no welcome */ }

  const observer = new IntersectionObserver(entries => {
    inView = entries.some(entry => entry.isIntersecting);
    sync();
  }, {threshold: 0.1});
  observer.observe(stage);
  document.addEventListener('lf:motion-change', event => {
    paused = !event.detail.enabled;
    sync();
  });
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
