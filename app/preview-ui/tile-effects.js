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
    if (tile.matches('.service-anchor')) tile.setAttribute('data-trace-visible', '');
    state.timers.push(setTimeout(() => {
      if (active.has(tile) && motionEnabled()) tile.dataset.scenePhase = '1';
    }, 130));
    state.timers.push(setTimeout(() => {
      if (active.has(tile) && motionEnabled()) tile.dataset.scenePhase = '2';
    }, 590));
    // The finite anchor perimeter needs its complete 1.65 second pass before reset.
    state.timers.push(setTimeout(() => settle(tile), 1680));
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
    tile.addEventListener('pointermove', event => {
      if (!motionEnabled()) return;
      const box = tile.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const x = Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - box.top) / box.height) * 100));
      tile.style.setProperty('--mineral-x', `${x.toFixed(1)}%`);
      tile.style.setProperty('--mineral-y', `${y.toFixed(1)}%`);
    }, { passive: true });
    tile.addEventListener('pointerleave', () => {
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
