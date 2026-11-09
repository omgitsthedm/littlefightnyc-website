/* Finite, visibility-aware ornament for the authored tile artwork. */
(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const tiles = [...document.querySelectorAll('.mosaic-home .tile')];
  const states = new Map();
  const visible = new Set();
  const queued = [];
  const active = new Set();
  const maxActive = 3;
  const albums = new Map();
  const websiteRotators = new Map();

  const motionEnabled = () => !document.hidden && !reduce.matches && !document.body.classList.contains('no-motion') && !document.body.classList.contains('reader-open') && !document.body.classList.contains('explore-open');
  const stateFor = tile => states.get(tile) || (() => {
    const state = { timers: [], queued: false, started: false };
    states.set(tile, state);
    return state;
  })();
  const clearTimers = state => {
    state.timers.forEach(clearTimeout);
    state.timers.length = 0;
  };
  const reset = tile => {
    const state = stateFor(tile);
    clearTimers(state);
    state.queued = false;
    active.delete(tile);
    tile.classList.remove('is-performing');
    tile.dataset.scenePhase = '2';
    tile.removeAttribute('data-trace-visible');
  };
  const settle = tile => {
    const state = stateFor(tile);
    state.queued = false;
    active.delete(tile);
    tile.classList.remove('is-performing');
    tile.dataset.scenePhase = '2';
    tile.removeAttribute('data-trace-visible');
    pump();
  };
  const perform = tile => {
    const state = stateFor(tile);
    if (!motionEnabled() || active.size >= maxActive || active.has(tile)) return;
    clearTimers(state);
    state.queued = false;
    state.started = true;
    active.add(tile);
    tile.classList.add('is-performing');
    tile.dataset.scenePhase = '0';
    const sculpture = tile.dataset.sculpture === 'true';
    if (!sculpture && tile.matches('.service-anchor')) tile.setAttribute('data-trace-visible', '');
    state.timers.push(setTimeout(() => {
      if (active.has(tile) && motionEnabled()) tile.dataset.scenePhase = '1';
    }, sculpture ? 100 : 130));
    state.timers.push(setTimeout(() => {
      if (active.has(tile) && motionEnabled()) tile.dataset.scenePhase = '2';
    }, sculpture ? 240 : 590));
    // The finite anchor perimeter needs its complete 1.65 second pass before reset.
    state.timers.push(setTimeout(() => settle(tile), sculpture ? 400 : 1680));
  };
  const request = tile => {
    const state = stateFor(tile);
    if (!motionEnabled() || active.has(tile) || state.queued) return;
    state.queued = true;
    queued.push(tile);
    pump();
  };
  const pump = () => {
    if (!motionEnabled()) return;
    while (active.size < maxActive && queued.length) {
      const tile = queued.shift();
      const state = stateFor(tile);
      if (!state.queued || !visible.has(tile)) { state.queued = false; continue; }
      perform(tile);
    }
  };

  const tileObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const tile = entry.target;
      if (entry.isIntersecting) {
        visible.add(tile);
        const state = stateFor(tile);
        if (!state.started) request(tile);
      } else {
        visible.delete(tile);
        reset(tile);
      }
    });
  }, { rootMargin: '48px 0px', threshold: .18 });

  tiles.forEach(tile => {
    tile.removeAttribute('data-trace-visible');
    tileObserver.observe(tile);
    tile.addEventListener('pointerenter', () => request(tile), { passive: true });
    tile.addEventListener('focusin', () => request(tile));
    // Sculptural fronts have a static ceramic bloom, so pointer tracking would
    // measure layout and rewrite styles without changing a single visible pixel.
    if (tile.dataset.sculpture !== 'true') tile.addEventListener('pointermove', event => {
      if (!motionEnabled()) return;
      const box = tile.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const x = Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - box.top) / box.height) * 100));
      tile.style.setProperty('--mineral-x', `${x.toFixed(1)}%`);
      tile.style.setProperty('--mineral-y', `${y.toFixed(1)}%`);
    }, { passive: true });
    if (tile.dataset.sculpture !== 'true') tile.addEventListener('pointerleave', () => {
      tile.style.removeProperty('--mineral-x');
      tile.style.removeProperty('--mineral-y');
    }, { passive: true });
  });

  const ensureImage = image => {
    if (!image || image.currentSrc || image.getAttribute('src')) return;
    const src = image.dataset.src;
    if (!src) return;
    image.src = src;
    if (image.dataset.srcset) image.srcset = image.dataset.srcset;
    if (image.dataset.sizes) image.sizes = image.dataset.sizes;
  };
  const imageIsReady = async image => {
    if (!image) return false;
    if (!image.complete) {
      const loaded = await new Promise(resolve => {
        const finish = success => {
          image.removeEventListener('load', onLoad);
          image.removeEventListener('error', onError);
          resolve(success);
        };
        const onLoad = () => finish(true);
        const onError = () => finish(false);
        image.addEventListener('load', onLoad, { once: true });
        image.addEventListener('error', onError, { once: true });
      });
      if (!loaded) return false;
    }
    if (!image.naturalWidth) return false;
    if (typeof image.decode === 'function') {
      try { await image.decode(); } catch { /* decoded pixels are already usable after load */ }
    }
    return image.naturalWidth > 0;
  };

  // The Website anchor begins with a real, static project preview. Later
  // frames load only after they are needed; the existing explicit Motion
  // control pauses this rotation along with every other tile animation.
  const rotatorState = rotator => websiteRotators.get(rotator) || (() => {
    const images = [...rotator.querySelectorAll('.website-project-shot')];
    const state = {
      images,
      index: Math.max(0, images.findIndex(image => image.classList.contains('is-active'))),
      visible: false,
      timer: 0,
      request: 0,
    };
    if (state.index < 0) state.index = 0;
    rotator.dataset.projectIndex = String(state.index);
    websiteRotators.set(rotator, state);
    return state;
  })();
  const stopWebsiteRotator = rotator => {
    const state = rotatorState(rotator);
    clearTimeout(state.timer);
    state.timer = 0;
  };
  const showWebsiteProject = async (rotator, index) => {
    const state = rotatorState(rotator);
    if (!state.images.length) return false;
    const nextIndex = ((index % state.images.length) + state.images.length) % state.images.length;
    const next = state.images[nextIndex];
    if (nextIndex === state.index && next.classList.contains('is-active')) return true;
    const request = ++state.request;
    ensureImage(next);
    // A failed replacement must never clear the visible, static project.
    if (!await imageIsReady(next) || !motionEnabled() || !state.visible || request !== state.request) return false;
    state.index = nextIndex;
    rotator.dataset.projectIndex = String(nextIndex);
    state.images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === nextIndex));
    return true;
  };
  const tickWebsiteRotator = rotator => {
    const state = rotatorState(rotator);
    stopWebsiteRotator(rotator);
    if (!motionEnabled() || !state.visible || state.images.length < 2) return;
    state.timer = setTimeout(async () => {
      state.timer = 0;
      if (!motionEnabled() || !state.visible) return;
      await showWebsiteProject(rotator, state.index + 1);
      if (motionEnabled() && state.visible) tickWebsiteRotator(rotator);
    }, 7000);
  };
  const websiteRotatorObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const rotator = entry.target;
      const state = rotatorState(rotator);
      state.visible = entry.isIntersecting;
      if (state.visible) {
        showWebsiteProject(rotator, state.index);
        tickWebsiteRotator(rotator);
      } else stopWebsiteRotator(rotator);
    });
  }, { rootMargin: '0px', threshold: .28 });
  document.querySelectorAll('.mosaic-home [data-website-project-rotator]').forEach(rotator => websiteRotatorObserver.observe(rotator));

  const albumState = album => albums.get(album) || (() => {
    const images = [...album.querySelectorAll('.photo-album-tile__images > img')];
    const state = { images, index: Math.max(0, images.findIndex(image => image.classList.contains('is-active'))), visible: false, timer: 0, request: 0 };
    if (state.index < 0) state.index = 0;
    albums.set(album, state);
    return state;
  })();
  const showAlbum = async (album, index) => {
    const state = albumState(album);
    if (!state.images.length) return false;
    const nextIndex = ((index % state.images.length) + state.images.length) % state.images.length;
    const next = state.images[nextIndex];
    if (nextIndex === state.index && next.classList.contains('is-active')) return true;
    const request = ++state.request;
    ensureImage(next);
    // Keep the established photo on screen until the replacement has decoded.
    // A failed or aborted request leaves the current image untouched.
    if (!await imageIsReady(next) || !motionEnabled() || !state.visible || request !== state.request) return false;
    state.index = nextIndex;
    state.images.forEach((image, imageIndex) => image.classList.toggle('is-active', imageIndex === nextIndex));
    return true;
  };
  const stopAlbum = album => {
    const state = albumState(album);
    clearTimeout(state.timer);
    state.timer = 0;
  };
  const tickAlbum = album => {
    const state = albumState(album);
    stopAlbum(album);
    if (!motionEnabled() || !state.visible || state.images.length < 2) return;
    state.timer = setTimeout(async () => {
      state.timer = 0;
      if (!motionEnabled() || !state.visible) return;
      await showAlbum(album, state.index + 1);
      if (motionEnabled() && state.visible) tickAlbum(album);
    }, 6000);
  };
  const albumObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const album = entry.target;
      const state = albumState(album);
      state.visible = entry.isIntersecting;
      if (state.visible) {
        showAlbum(album, state.index);
        tickAlbum(album);
      } else stopAlbum(album);
    });
  }, { rootMargin: '0px', threshold: .28 });
  document.querySelectorAll('.mosaic-home .photo-album-tile').forEach(album => albumObserver.observe(album));

  const pauseAll = () => {
    queued.splice(0).forEach(tile => { stateFor(tile).queued = false; });
    [...active].forEach(reset);
    albums.forEach((state, album) => {
      stopAlbum(album);
      if (state.visible && motionEnabled()) tickAlbum(album);
    });
    websiteRotators.forEach((state, rotator) => {
      stopWebsiteRotator(rotator);
      if (state.visible && motionEnabled()) tickWebsiteRotator(rotator);
    });
  };
  document.addEventListener('visibilitychange', pauseAll);
  reduce.addEventListener('change', pauseAll);
  new MutationObserver(records => {
    if (records.some(record => record.attributeName === 'class')) pauseAll();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
})();

/* Original signal-field ornament: sparse red pixels on quiet circuit paths.
 * One bounded canvas, no media/dependency requests, and no work while paused. */
(() => {
  'use strict';
  if (!document.body.classList.contains('mosaic-home')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const contrast = matchMedia('(forced-colors: active)');
  const connection = navigator.connection;
  const allowed = () => !document.hidden && !reduced.matches && !contrast.matches && !connection?.saveData &&
    !document.body.matches('.no-motion, .reader-open, .explore-open');
  let canvas, context, width = 0, height = 0, timer = 0, frame = 0, phase = 0;
  let paths = [], dots = [], ready = false, resizeTimer = 0, activePage = true;
  const seed = n => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };
  const stop = () => { clearTimeout(timer); cancelAnimationFrame(frame); timer = frame = 0; };
  const point = (path, distance) => {
    const first = path.turnX + 64;
    if (distance < first) return [distance - 64, path.y];
    if (distance < first + path.rise) return [path.turnX, path.y + (distance - first) * path.direction];
    return [path.turnX + distance - first - path.rise, path.y + path.rise * path.direction];
  };
  const draw = () => {
    context.clearRect(0, 0, width, height);
    // A faint, fixed matrix gives the moving signals context without a texture file.
    context.fillStyle = '#eb514a';
    dots.forEach(dot => { context.globalAlpha = dot.alpha; context.fillRect(dot.x, dot.y, 1, 1); });
    paths.forEach(path => {
      const distance = (path.offset + phase * path.speed) % path.length;
      for (let tail = 3; tail >= 0; tail--) {
        const [x, y] = point(path, (distance - tail * 8 + path.length) % path.length);
        const edge = .45 + .55 * Math.abs(x - width / 2) / (width / 2);
        context.globalAlpha = edge * (tail ? .14 : .72);
        context.fillStyle = tail ? '#d94440' : '#f8594e';
        context.fillRect(Math.round(x), Math.round(y), tail ? 2 : 3, 2);
        if (!tail) {
          context.globalAlpha = edge * .065;
          context.fillRect(Math.round(x) - 3, Math.round(y) - 3, 9, 8);
        }
      }
    });
    context.globalAlpha = 1;
  };
  const size = () => {
    const nextWidth = innerWidth, nextHeight = innerHeight;
    if (nextWidth === width && nextHeight === height) return;
    width = nextWidth; height = nextHeight;
    const scale = Math.min(devicePixelRatio || 1, width < 700 ? 1 : 1.25);
    canvas.width = Math.ceil(width * scale); canvas.height = Math.ceil(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    dots = [];
    for (let x = 20; x < width; x += 40) for (let y = 20; y < height; y += 40) {
      if (seed(x + y * 3) < .24) dots.push({ x, y, alpha: .085 + .075 * Math.abs(x - width / 2) / (width / 2) });
    }
    paths = Array.from({ length: width < 700 ? 12 : 24 }, (_, i) => {
      const rise = (2 + Math.floor(seed(i + 90) * 4)) * 40;
      return { y: Math.floor(seed(i + 4) * height / 40) * 40 + 20,
        turnX: Math.floor((.2 + seed(i + 12) * .6) * width / 40) * 40 + 20,
        rise, direction: i % 2 ? -1 : 1, length: width + 128 + rise,
        offset: seed(i + 70) * (width + rise), speed: 12 + seed(i + 31) * 12 };
    });
    draw();
  };
  const tick = () => {
    frame = 0;
    if (!activePage || !allowed()) { stop(); return; }
    phase += 1 / 20;
    draw();
    // Sleep between frames; do not wake a 60/120Hz display to discard frames.
    timer = setTimeout(() => { timer = 0; frame = requestAnimationFrame(tick); }, 50);
  };
  const sync = () => {
    stop();
    if (!ready || !activePage || !allowed()) {
      if (canvas) canvas.dataset.state = 'paused';
      return;
    }
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'signal-field'; canvas.setAttribute('aria-hidden', 'true');
      context = canvas.getContext('2d');
      if (!context) { canvas = undefined; return; }
      document.body.prepend(canvas);
      size();
    }
    canvas.dataset.state = 'running';
    frame = requestAnimationFrame(tick);
  };
  const start = () => {
    const initialize = () => { ready = true; sync(); };
    if ('requestIdleCallback' in window) requestIdleCallback(initialize, { timeout: 1800 });
    else setTimeout(initialize, 300);
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  contrast.addEventListener('change', sync);
  connection?.addEventListener?.('change', sync);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('pagehide', () => { activePage = false; stop(); clearTimeout(resizeTimer); });
  window.addEventListener('pageshow', () => { activePage = true; sync(); });
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (canvas) size(); }, 150);
  }, { passive: true });
})();
