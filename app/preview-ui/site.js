/* Progressive behavior for the static Little Fight preview. No analytics transport lives here. */
(() => {
  'use strict';

  const detail = document.querySelector('#detail');
  const panel = detail?.querySelector('.detail-window');
  const detailBody = document.querySelector('#detail-body');
  const closeButton = document.querySelector('#close-detail');
  const mosaic = document.querySelector('.mosaic-home');
  const menu = document.querySelector('#explore-menu');
  const menuToggle = document.querySelector('#explore-toggle');
  let menuReturnFocus = menuToggle;
  const menuClose = menu?.querySelector('.menu-close');
  const search = document.querySelector('#preview-search');
  const searchResults = document.querySelector('#search-results');
  const readerBack = document.querySelector('#reader-back');
  const readerPrevious = document.querySelector('#reader-previous');
  const readerNext = document.querySelector('#reader-next');
  const readerHub = document.querySelector('#reader-hub');
  let readerTrail = [];
  let readerRoutesPromise;
  let readerRoutes = {};
  const motionToggle = document.querySelector('#motion-toggle');
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  // Share the public canonical destination, including from a local preview or
  // a reader opened over the homepage. Cancellation is never a copy request.
  document.addEventListener('click', async event => {
    const button = event.target.closest('button[data-native-share], button[data-copy-page-link], button[data-copy-lab-link]');
    if (!button) return;
    const group = button.closest('.reader-share, .lab-share');
    const status = group?.querySelector('[data-copy-status]');
    const fallback = group?.querySelector('[data-share-fallback]');
    const path = group?.dataset.shareUrl || button.dataset.copyLabLink;
    if (!path) return;
    const destination = new URL(path, 'https://littlefightnyc.com');
    if (destination.origin !== 'https://littlefightnyc.com') return;
    destination.search = '';
    destination.hash = '';
    const url = destination.href;
    const data = { title: group?.dataset.shareTitle || document.title, url };
    if (button.hasAttribute('data-native-share') && typeof navigator.share === 'function' &&
        (typeof navigator.canShare !== 'function' || navigator.canShare(data))) {
      try {
        await navigator.share(data);
        if (status) status.textContent = 'Share options opened.';
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      if (status) status.textContent = 'Link copied.';
      if (fallback) fallback.hidden = true;
    } catch {
      if (status) status.textContent = 'Use the page link to open or copy this page.';
      if (fallback) { fallback.href = url; fallback.hidden = false; fallback.focus(); }
    }
  });

  if (!detail || !panel || !detailBody) return;
  // The modal rail is a separate landmark from the page content it displays.
  // Keep its accessible name distinct after each progressive reader injection.
  const readerRail = detail.querySelector('.reader-rail');
  readerRail?.setAttribute('aria-label', 'Quick contact');
  if (readerRail) detail.dataset.readerRail = 'true';

  // Direct links use a sticky contact rail. Measure its rendered height so
  // enlarged labels and wrapped phone layouts cannot cover a jumped-to answer.
  const directContactRail = document.querySelector('.page-shell>.direct-contact-rail');
  if (directContactRail) {
    const updateContactClearance = () => {
      const stickyTop = Math.max(0, parseFloat(getComputedStyle(directContactRail).top) || 0);
      const clearance = Math.ceil(directContactRail.getBoundingClientRect().height + stickyTop + 12);
      document.documentElement.style.setProperty('--direct-contact-clearance', `${clearance}px`);
    };
    updateContactClearance();
    if ('ResizeObserver' in window) new ResizeObserver(updateContactClearance).observe(directContactRail);
    window.addEventListener('resize', updateContactClearance, { passive: true });
  }

  let activeController = null;
  let requestVersion = 0;
  let loadingVersion = 0;
  let activeSource = null;
  let lastOpenState = null;
  let indexPromise = null;
  let searchIndex = [];
  let searchAliases = {};
  let searchDebounce = 0;
  let searchRequest = 0;
  let searchReturn = null;
  let isClosing = false;
  let closingPromise = null;
  const shellTitle = document.title;
  const shareSelector = 'link[rel="canonical"], meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]';
  const captureShareHead = source => [...source.querySelectorAll(shareSelector)].map(node => node.cloneNode(true));
  const shellShareHead = captureShareHead(document);
  const applyShareHead = nodes => {
    document.querySelectorAll(shareSelector).forEach(node => node.remove());
    nodes.forEach(node => document.head.appendChild(node.cloneNode(true)));
  };

  const safeText = value => String(value || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 96);
  const draftText = (value, limit) => String(value || '').replace(/\u0000/g, '').slice(0, limit);
  const sameOriginPath = href => {
    if (typeof href !== 'string' || !href.trim()) return null;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return null;
      return `${url.pathname}${url.search}${url.hash}`;
    } catch { return null; }
  };
  const interaction = (event, contentId = '', placement = '') => {
    document.dispatchEvent(new CustomEvent('lf:interaction', {
      detail: { event: safeText(event), contentId: safeText(contentId), placement: safeText(placement) }
    }));
  };
  const dialogIsOpen = () => detail.open || detail.hasAttribute('open');
  const contentId = path => {
    const safePath = sameOriginPath(path) || '';
    return safePath.replace(/[?#].*$/, '').replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9/_-]/gi, '').replaceAll('/', '_').slice(0, 96) || 'mosaic';
  };
  const findTile = path => [...(mosaic?.querySelectorAll('.tile[href]') || [])].find(tile => {
    const tilePath = sameOriginPath(tile.href);
    return tilePath && tilePath.split('#')[0] === String(path || '').split('#')[0];
  }) || null;

  function prepareNativeInquiry(root, path) {
    const form = root.querySelector('form.static-inquiry');
    const host = form?.closest('[data-production-island]');
    const copyNode = host?.querySelector('[data-inquiry-copy]');
    if (!form || !copyNode || form.dataset.contextReady) return;
    let copies;
    try { copies = JSON.parse(copyNode.textContent); } catch { return; }
    const selector = form.elements.namedItem('intent');
    if (!(selector instanceof HTMLSelectElement)) return;
    const params = new URL(path, location.origin).searchParams;
    const queryIntent = params.get('intent');
    const requested = queryIntent && Object.prototype.hasOwnProperty.call(copies, queryIntent) ? queryIntent : 'general';
    if (Object.prototype.hasOwnProperty.call(copies, requested)) {
      for (const option of selector.options) {
        option.defaultSelected = option.selected = option.value === requested;
      }
    }
    const source = params.get('source');
    const sourceField = form.elements.namedItem('source');
    if (sourceField && source && /^[a-z0-9/_-]{1,160}$/i.test(source)) {
      sourceField.defaultValue = sourceField.value = source;
    }
    // Keep supplied context in the visible field. It remains optional: a new
    // business can ask for help without a current domain, and a bare domain is
    // as useful here as a complete URL.
    const websiteField = form.elements.namedItem('website_url');
    const directWebsite = params.get('url');
    const sharedText = `${params.get('text') || ''} ${params.get('title') || ''}`;
    const sharedMatch = sharedText.match(/https?:\/\/[^\s]+/i);
    const sharedWebsite = (directWebsite || sharedMatch?.[0] || '').trim().slice(0, 2048);
    if (websiteField instanceof HTMLInputElement && sharedWebsite) {
      websiteField.defaultValue = websiteField.value = sharedWebsite;
    }
    const showCopy = () => {
      const copy = copies[selector.value] || copies.general;
      host.dataset.inquiryIntent = selector.value;
      for (const [attribute, field] of [
        ['title', 'title'], ['summary', 'summary'], ['eyebrow', 'eyebrow'],
        ['message-label', 'messageLabel'], ['submit', 'submit'],
      ]) {
        const target = host.querySelector(`[data-inquiry-${attribute}]`);
        if (target && typeof copy[field] === 'string') target.textContent = copy[field];
      }
      const message = form.elements.namedItem('message');
      if (message && typeof copy.placeholder === 'string') message.placeholder = copy.placeholder;
    };
    showCopy();
    selector.addEventListener('change', showCopy);
    form.dataset.contextReady = 'true';
  }

  function setMotionState(enabled, { announce = true } = {}) {
    document.body.classList.toggle('no-motion', !enabled);
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', String(!enabled));
      motionToggle.setAttribute('aria-label', enabled ? 'Pause animations and image rotation' : 'Resume animations and image rotation');
      const label = motionToggle.querySelector('.motion-label');
      if (label) label.textContent = enabled ? 'Pause motion & slideshows' : 'Resume motion & slideshows';
    }
    document.dispatchEvent(new CustomEvent('lf:motion-change', { detail: { enabled } }));
    if (announce) {
      try { sessionStorage.setItem('lf-motion-paused', enabled ? '0' : '1'); } catch { /* Respect the current page choice. */ }
    }
    if (announce) interaction(enabled ? 'motion_on' : 'motion_off', 'mosaic', 'controls');
  }

  function showDialog() {
    if (!dialogIsOpen()) {
      if (typeof detail.showModal === 'function') detail.showModal();
      else detail.setAttribute('open', '');
    }
    document.body.classList.add('reader-open');
  }

  async function readerFetchPath(path, source) {
    const explicit = sameOriginPath(source?.dataset.readerSrc);
    readerRoutesPromise ||= fetch('/reader-routes.json', { credentials: 'same-origin' })
      .then(response => response.ok ? response.json() : {}).then(routes => (readerRoutes = routes)).catch(() => ({}));
    const routes = await readerRoutesPromise;
    if (explicit && sameOriginPath(source?.href)?.split(/[?#]/)[0] === path.split(/[?#]/)[0]) return explicit;
    const url = new URL(path, location.origin);
    return routes[url.pathname] ? `${routes[url.pathname]}${url.search}${url.hash}` : path;
  }

  function releaseDemos() {
    detailBody.querySelectorAll('iframe[data-demo-src]').forEach(frame => {
      try { frame.contentDocument?.querySelectorAll('video,audio').forEach(media => media.pause()); } catch { /* frame may still be loading */ }
      frame.remove();
    });
  }

  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.type !== 'lf:lab-exit' || event.data.version !== 1) return;
    const root = dialogIsOpen() ? detailBody : document.querySelector('main[data-page-content]');
    const frame = [...(root?.querySelectorAll('.reader-demo:not([data-demo="vera"]) iframe[data-demo-src]') || [])]
      .find(candidate => candidate.contentWindow === event.source);
    if (!frame) return;
    if (dialogIsOpen()) closeReader();
    else location.assign('/');
  });

  function mountDemos(root = detailBody) {
    root.querySelectorAll('iframe[data-demo-src]').forEach(frame => {
      if (frame.hasAttribute('src')) return;
      let source = sameOriginPath(frame.dataset.demoSrc);
      if (!source) return;
      const block = frame.closest('[data-reader-demo]');
      // Only the Cabinet Lab accepts a saved design. Never forward arbitrary
      // outer-page query strings, contact fields or attribution into a demo.
      if (block?.dataset.demo === 'cabinet-concept') {
        const study = new URLSearchParams(location.search).get('study');
        if (study && study.length <= 20000 && /^(?:[zu]\.)?[A-Za-z0-9_-]+$/.test(study)) {
          const embedded = new URL(source, location.origin);
          embedded.searchParams.set('study', study);
          source = embedded.pathname + embedded.search;
        }
      }
      const status = block?.querySelector('.reader-demo-status');
      if (block) block.dataset.demoState = 'loading';
      frame.inert = true;
      let preparedDocument;
      let readinessPoll;
      const prepareDocument = () => {
        if (!frame.isConnected) { clearInterval(readinessPoll); return; }
        try {
          const child = frame.contentDocument;
          if (!child?.body || child.readyState === 'loading' || child.URL === 'about:blank') return;
          const domReady = frame.contentWindow.performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd;
          if (child.readyState !== 'complete' && !domReady) return;
          if (child === preparedDocument) return;
          preparedDocument = child;
          clearInterval(readinessPoll);
          // Keep the Lab's provenance beside its working surface rather than
          // allowing the standalone site's fixed notice to cover its controls.
          const disclosure = block?.dataset.demo !== 'vera' && frame.contentDocument?.querySelector('.lab-build-disclosure,.lab-concept-status');
          if (disclosure && block) {
            let note = block.querySelector('.reader-demo-disclosure');
            if (!note) {
              note = document.createElement('details');
              note.className = 'reader-demo-disclosure';
              const summary = document.createElement('summary');
              summary.textContent = 'About this demo +';
              const explanation = document.createElement('p');
              explanation.textContent = disclosure.textContent;
              note.append(summary, explanation);
              block.append(note);
            }
            disclosure.style.setProperty('display', 'none', 'important');
          }
          // Start each study at its working surface. Only the iframe scrolls;
          // the outer reader keeps the visitor's position and full explanation.
          const starts = {
            'micro-animations': 'main.playground', 'studio-engine': 'main.studio',
            'aha-laser': 'main.stagewrap', 'growth-street': 'main.story[data-story]',
            'pill-scroll': 'section.pin[data-pin]', goliath: 'section.pin[data-pin]'
          };
          const start = starts[block?.dataset.demo];
          const surface = start && frame.contentDocument?.querySelector(start);
          if (surface) frame.contentWindow.scrollTo({ top: surface.getBoundingClientRect().top + frame.contentWindow.scrollY, behavior: 'instant' });
          frame.contentDocument?.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !event.defaultPrevented && dialogIsOpen()) {
              event.preventDefault(); closeReader();
            }
          });
          frame.contentDocument?.addEventListener('click', event => {
            const link = event.target.closest('a[href]');
            if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
            const path = sameOriginPath(link.href);
            if (!path || !dialogIsOpen()) return;
            if (path === '/') { event.preventDefault(); closeReader(); return; }
            const targetPath = path.split(/[?#]/)[0];
            // VERA keeps its own app routing. A Lab's agency links enter the
            // outer reader, where forms and other pages are allowed to run.
            if (block?.dataset.demo !== 'vera' && readerRoutes[targetPath]
              && targetPath !== frame.contentWindow.location.pathname) {
              event.preventDefault();
              openReader(path, findTile(path) || activeSource);
            }
          });
          frame.inert = false;
          if (block) block.dataset.demoState = 'ready';
          if (status) status.hidden = true;
        } catch { /* External source links never acquire access to the shell. */ }
      };
      // Install navigation as soon as the document is interactive. Fonts,
      // images and video must not hold Escape hostage until window.load.
      frame.addEventListener('load', prepareDocument);
      readinessPoll = setInterval(prepareDocument, 50);
      frame.src = source;
    });
  }

  function updateNavigation(path, homePath = path) {
    if (readerBack) readerBack.hidden = readerTrail.length < 2;
    // Once someone starts an inquiry, keep the return path without suggesting
    // unrelated cards or leaving two disabled controls beside the form.
    const isInquiry = ['/tech-audit/', '/contact/', '/thanks/'].includes(path.split(/[?#]/)[0]);
    const isSupportAnswer = panel.dataset.readerFamily === 'it' && path.startsWith('/answers/');
    const write = panel.querySelector('.reader-rail .contact-plan');
    if (write) {
      write.hidden = isInquiry || panel.dataset.readerTemplate === 'website-service';
      const intent = { web: 'website', it: 'support', consulting: 'consulting', software: 'systems' }[panel.dataset.readerFamily] || 'general';
      write.href = '/tech-audit/?' + new URLSearchParams({ intent, source: path.split(/[?#]/)[0] });
    }
    const seen = new Set();
    const cards = [...(mosaic?.querySelectorAll('a.tile[href]') || [])].filter(tile => {
      const target = sameOriginPath(tile.href);
      if (!target || tile.target === '_blank' || seen.has(target)) return false;
      seen.add(target); return true;
    });
    const index = cards.findIndex(tile => sameOriginPath(tile.href)?.split(/[?#]/)[0] === homePath.split(/[?#]/)[0]);
    const previous = index > 0 ? cards[index - 1] : null;
    const next = index >= 0 ? cards[index + 1] || null : null;
    for (const [button, tile, name] of [[readerPrevious, previous, 'Previous'], [readerNext, next, 'Next']]) {
      if (!button) continue;
      button.hidden = isInquiry || isSupportAnswer;
      button.disabled = !tile;
      button.dataset.readerTarget = tile ? sameOriginPath(tile.href) : '';
      button.setAttribute('aria-label', tile ? `${name} card: ${tile.dataset.cellTitle || tile.textContent.trim()}` : `${name} card`);
    }
  }

  // The homepage paints with home.css; readers need the complete cascade in
  // site.css. Load it once, on the first reader, before the dialog appears.
  let readerStylesPromise;
  function ensureReaderStyles() {
    if ([...document.styleSheets].some(sheet => sheet.href && new URL(sheet.href).pathname === '/site.css')) return Promise.resolve();
    if (readerStylesPromise) return readerStylesPromise;
    readerStylesPromise = new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.id = 'reader-styles';
      link.rel = 'stylesheet';
      link.href = '/site.css';
      const fail = () => {
        clearTimeout(timeout);
        link.remove();
        readerStylesPromise = undefined;
        reject(new Error('Reader styles could not load.'));
      };
      const timeout = setTimeout(fail, 8000);
      link.onload = () => { clearTimeout(timeout); resolve(); };
      link.onerror = fail;
      document.head.append(link);
    });
    return readerStylesPromise;
  }

  // Instant opens: a card's reader is fetched as soon as intent shows (pointer,
  // touch or keyboard focus) and the open reuses that response. A cancelled
  // open only stops waiting; the shared request keeps warming the cache.
  const readerCache = new Map();
  function readerMarkup(path) {
    if (readerCache.has(path)) return readerCache.get(path);
    const request = fetch(path, { credentials: 'same-origin', headers: { Accept: 'text/html' } })
      .then(response => { if (!response.ok) throw new Error(`Reader request failed: ${response.status}`); return response.text(); });
    readerCache.set(path, request);
    request.catch(() => readerCache.delete(path));
    return request;
  }
  const untilAborted = (promise, signal) => !signal ? promise : new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException('Reader request aborted', 'AbortError'));
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true });
    promise.then(resolve, reject);
  });
  const warmedLinks = new WeakSet();
  function warmReader(link) {
    if (warmedLinks.has(link) || navigator.connection?.saveData) return;
    const path = sameOriginPath(link.href);
    if (!path || path === '/') return;
    warmedLinks.add(link);
    readerFetchPath(path, link).then(readerMarkup).catch(() => {});
    ensureReaderStyles().catch(() => {});
  }
  ['pointerover', 'focusin', 'touchstart'].forEach(type => document.addEventListener(type, event => {
    const link = event.target.closest?.('#canvas a.tile[href], a[data-reader-link][href]');
    if (link && !link.target) warmReader(link);
  }, { passive: true, capture: true }));

  async function fetchReader(path, signal) {
    const markup = await untilAborted(readerMarkup(path), signal);
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    const reader = parsed.querySelector('main[data-page-content]');
    if (!reader) throw new Error('Reader markup was not found.');
    return { shareHead: captureShareHead(parsed), html: reader.innerHTML, layout: reader.dataset.readerLayout || '', family: reader.dataset.readerFamily || 'brand', template: reader.dataset.readerTemplate || '', homePath: reader.dataset.homePath || path, title: parsed.title || reader.querySelector('h1')?.textContent || document.title };
  }

  function focusReader() {
    // Keep the focus ring on the familiar escape hatch, never across the display headline.
    const target = closeButton || detailBody.querySelector('[data-reader-focus], a, button, input, textarea');
    target?.focus?.({ preventScroll: true });
  }

  function focusReaderFragment(path) {
    const hash = String(path || '').split('#')[1];
    if (!hash) return false;
    let id;
    try { id = decodeURIComponent(hash); } catch { return false; }
    const target = [...detailBody.querySelectorAll('[id]')].find(node => node.id === id);
    if (!target) return false;
    const bodyRect = detailBody.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    detailBody.scrollTo({ top: Math.max(0, detailBody.scrollTop + targetRect.top - bodyRect.top - detailBody.clientTop), behavior: 'instant' });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    detail.scrollTop = 0;
    panel.scrollTop = 0;
    return true;
  }

  async function openReader(path, source, options = {}) {
    const readerPath = sameOriginPath(path);
    if (!readerPath) return false;
    if (readerPath === '/' && dialogIsOpen()) { await closeReader(); return true; }
    // A click can land in the microtask after the dialog disappears but before
    // its return-focus/history cleanup settles. Finish that finite close first.
    if (closingPromise) await closingPromise;
    const isInReader = dialogIsOpen();
    // The hero is an entry point of its own. Return to the work link the
    // visitor actually used, including after following links in the reader.
    const heroSource = isInReader
      ? (activeSource?.closest('.sculpture-hero') ? activeSource : null)
      : (source?.closest('.sculpture-hero') ? source : null);
    // Tiles for standalone public apps keep their canonical href. They can opt into a
    // small static reader document without changing the URL, browser history, or event payload.
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const version = ++requestVersion;
    activeSource = heroSource || findTile(readerPath) || source || activeSource;
    loadingVersion = version;
    mosaic?.classList.add('is-loading-reader');
    if (menu?.open) setMenu(false, { returnFocus: false });

    try {
      // Fetch the reader and the complete stylesheet together; the dialog
      // stays closed until both are ready, including on a slow connection.
      const [reader] = await Promise.all([
        readerFetchPath(readerPath, findTile(readerPath) || source)
          .then(readerDocument => fetchReader(readerDocument, controller.signal)),
        ensureReaderStyles(),
      ]);
      if (version !== requestVersion || controller.signal.aborted) return false;
      const applyReader = () => {
        releaseDemos();
        window.LFWebsiteStory?.release(panel);
        detailBody.innerHTML = reader.html;
        activeSource = heroSource || findTile(reader.homePath) || activeSource;
        detail.dataset.readerLayout = reader.layout;
        panel.dataset.readerLayout = reader.layout;
        detail.dataset.readerFamily = reader.family;
        panel.dataset.readerFamily = reader.family;
        panel.dataset.readerTemplate = reader.template;
        detailBody.scrollTop = 0;
        panel.scrollTop = 0;
        detailBody.dataset.readerPath = readerPath;
        detail.dataset.readerPath = readerPath;
        panel.dataset.readerPath = readerPath;
        document.title = reader.title;
        applyShareHead(reader.shareHead);
        // The bridge receives reader-ready on document and mounts against this URL.
        // Commit the state before that event, while the fetched reader is already in place.
        if (options.fromHistory) readerTrail = history.state?.trail || [readerPath];
        else if (options.backTrail) readerTrail = options.backTrail;
        else readerTrail = isInReader ? [...readerTrail, readerPath] : [readerPath];
        lastOpenState = { lfReader: true, path: readerPath, trail: readerTrail };
        if (options.backTrail) history.replaceState(lastOpenState, '', readerPath);
        else if (!options.fromHistory) history.pushState(lastOpenState, '', readerPath);
        updateNavigation(readerPath, reader.homePath);
        prepareNativeInquiry(detailBody, readerPath);
        // A standalone page can have its own detail-title behind this dialog.
        // Name the modal from its own content, never a duplicate background ID.
        detail.removeAttribute('aria-labelledby');
        detail.setAttribute('aria-label', detailBody.querySelector('h1')?.textContent.trim() || reader.title);
        document.dispatchEvent(new CustomEvent('lf:reader-ready', { detail: { path: readerPath } }));
      };
      // Moving between cards inside the reader is a same-document swap, the
      // case View Transitions were made for: the page slides in the direction
      // of travel and shared clay art morphs between the two cards.
      const readerArt = () => detailBody.querySelector('.reader-clay-cutout img, .story-art .clay-illustration img');
      if (isInReader && 'startViewTransition' in document && !prefersReducedMotion.matches && !document.body.classList.contains('no-motion')) {
        const root = document.documentElement;
        root.dataset.readerTurn = options.direction || 'next';
        detailBody.style.viewTransitionName = 'lf-reader';
        const outgoing = readerArt();
        if (outgoing) outgoing.style.viewTransitionName = 'lf-reader-art';
        const transition = document.startViewTransition(() => {
          applyReader();
          const incoming = readerArt();
          if (incoming && outgoing) incoming.style.viewTransitionName = 'lf-reader-art';
        });
        await transition.updateCallbackDone;
        transition.finished.finally(() => {
          detailBody.style.viewTransitionName = '';
          readerArt()?.style.removeProperty('view-transition-name');
          delete root.dataset.readerTurn;
        });
      } else applyReader();

      showDialog();
      const motion = window.LFTileMotion;
      if (!isInReader && motion?.open) await motion.open({ source: activeSource, dialog: detail, panel });
      if (version !== requestVersion) return false;
      if (!focusReaderFragment(readerPath)) focusReader();
      mountDemos();
      window.LFWebsiteStory?.mount(panel);

      interaction(isInReader ? 'reader_change' : 'reader_open', contentId(readerPath), isInReader ? 'reader_link' : (source ? 'tile' : 'history'));
      return true;
    } catch (error) {
      if (error.name !== 'AbortError' && version === requestVersion && !controller.signal.aborted) {
        // A real link remains the reliable fallback when an enhancement request fails.
        if (!options.fromHistory) location.assign(readerPath);
      }
      return false;
    } finally {
      if (loadingVersion === version) mosaic?.classList.remove('is-loading-reader');
    }
  }

  async function finishClose(source = activeSource) {
    if (closingPromise) return closingPromise;
    isClosing = true;
    closingPromise = (async () => {
      activeController?.abort();
      requestVersion += 1;
      loadingVersion = 0;
      mosaic?.classList.remove('is-loading-reader');
      window.LFWebsiteStory?.release(panel);
      try {
        const motion = window.LFTileMotion;
        if (motion?.close && dialogIsOpen()) await motion.close({ source, dialog: detail, panel });
        if (dialogIsOpen() && typeof detail.close === 'function') detail.close();
        else detail.removeAttribute('open');
        document.body.classList.remove('reader-open');
        document.title = shellTitle;
        applyShareHead(shellShareHead);
        releaseDemos();
        delete detail.dataset.readerLayout;
        delete panel.dataset.readerLayout;
        source?.focus?.({ preventScroll: true });
        // WebKit can defer returning focus when a native dialog closes.
        // Retry only if focus was lost, never over a new task.
        const closedVersion = requestVersion;
        requestAnimationFrame(() => {
          if (requestVersion === closedVersion && !dialogIsOpen() && !menu?.open &&
              document.activeElement === document.body && source?.isConnected) {
            source.focus({ preventScroll: true });
          }
        });
        interaction('reader_close', contentId(detailBody.dataset.readerPath), 'reader');
      } finally {
        isClosing = false;
        closingPromise = null;
      }
    })();
    return closingPromise;
  }

  async function closeReader({ useHistory = true } = {}) {
    // Native dialog cancel and the document Escape handler can fire in one keypress.
    // Claim the close synchronously so only one of them is allowed to step history.
    if (!dialogIsOpen() || isClosing) return;
    await finishClose();
    readerTrail = [];
    if (!mosaic) { location.assign('/'); return; }
    // Embedded apps and fragment links have their own joint history entries.
    // Returning to the hub must never depend on guessing how many they added.
    if (useHistory) history.replaceState({ lfHub: true }, '', '/');
    await restoreSearchContext();
  }

  async function restoreSearchContext() {
    // Search is a task path, not a dead end. Returning from an answer restores
    // the private in-memory query and the result list without putting it in the URL.
    const returnState = searchReturn;
    searchReturn = null;
    if (returnState?.query && search) {
      setMenu(true, { returnFocus: false });
      search.value = returnState.query;
      const clear = searchClearControl();
      if (clear) clear.hidden = false;
      const request = ++searchRequest;
      await runSearch(returnState.query, request);
      search.focus({ preventScroll: true });
    }
  }

  mosaic?.addEventListener('click', event => {
    const tile = event.target.closest('a.tile[href]');
    if (!tile || !mosaic.contains(tile)) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || tile.target === '_blank') return;
    const path = sameOriginPath(tile.href);
    if (!path) return;
    event.preventDefault();
    openReader(path, tile);
  });
  readerBack?.addEventListener('click', () => {
    if (readerTrail.length < 2) return;
    const trail = readerTrail.slice(0, -1);
    const previous = trail[trail.length - 1];
    openReader(previous, findTile(previous), { backTrail: trail, direction: 'prev' });
  });
  readerHub?.addEventListener('click', () => closeReader());
  [readerPrevious, readerNext].forEach(button => button?.addEventListener('click', () => {
    if (button.dataset.readerTarget) openReader(button.dataset.readerTarget, findTile(button.dataset.readerTarget), { direction: button === readerPrevious ? 'prev' : 'next' });
  }));

  closeButton?.addEventListener('click', event => { event.preventDefault(); closeReader(); });
  detail.addEventListener('cancel', event => { event.preventDefault(); closeReader(); });
  detail.addEventListener('click', event => {
    if (event.target === detail) { closeReader(); return; }
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const path = sameOriginPath(link.href);
    const currentPath = String(detailBody.dataset.readerPath || '').split('#')[0];
    // Fragment navigation belongs to this card. A native fragment history entry
    // loses the reader state and would make popstate close the dialog.
    if (path?.split('#')[0] === currentPath && path.includes('#')) {
      let targetId;
      try { targetId = decodeURIComponent(path.slice(path.indexOf('#') + 1)); } catch { return; }
      const target = [...detailBody.querySelectorAll('[id]')].find(node => node.id === targetId);
      if (target) {
        event.preventDefault();
        history.replaceState(lastOpenState, '', path);
        // This card owns the reading viewport. Native scrollIntoView() can
        // scroll-chain into #detail (which is fixed and intentionally hidden)
        // before it reaches .detail-body, taking the fixed header and close
        // control out of view. Move only the reader body instead.
        const bodyRect = detailBody.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        detailBody.scrollTo({
          top: Math.max(0, detailBody.scrollTop + targetRect.top - bodyRect.top - detailBody.clientTop),
          behavior: 'instant',
        });
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        // Focusing a link can nudge a hidden outer scroller by a border pixel.
        // The body is the only scrolling surface; keep both shell layers fixed.
        detail.scrollTop = 0;
        panel.scrollTop = 0;
        return;
      }
    }
    if (!path || path === detailBody.dataset.readerPath || path.split('#')[0] === currentPath || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('sms:')) return;
    event.preventDefault();
    openReader(path, activeSource, { replaceHistory: true });
  });

  addEventListener('popstate', event => {
    const state = event.state;
    if (state?.lfReader && state.path) {
      openReader(state.path, findTile(state.path), { fromHistory: true });
    } else if (dialogIsOpen()) {
      finishClose(findTile(detailBody.dataset.readerPath)).then(async () => {
        readerTrail = [];
        await restoreSearchContext();
      });
    }
  });

  function focusExploreEntry() {
    const target = search || menuClose;
    target?.focus({ preventScroll: true });
    // Native dialog focus can settle after showModal in some Chrome builds.
    // Reassert the useful first stop only if the browser left focus on body.
    requestAnimationFrame(() => {
      if (menu?.open && document.activeElement === document.body) target?.focus({ preventScroll: true });
    });
  }

  function exploreFocusableControls() {
    if (!menu) return [];
    return [...menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(control => {
        const style = getComputedStyle(control);
        return control.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      });
  }

  function keepExploreFocus(event) {
    if (event.key !== 'Tab' || !menu?.open) return;
    const controls = exploreFocusableControls();
    if (!controls.length) return;
    const first = controls[0];
    const last = controls.at(-1);
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !menu.contains(active))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (active === last || !menu.contains(active))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  function setMenu(open, { returnFocus = true } = {}) {
    if (!menu) return;
    if (open && !menu.open) {
      if (typeof menu.showModal === 'function') menu.showModal();
      else menu.setAttribute('open', '');
    } else if (!open && menu.open) {
      if (typeof menu.close === 'function') menu.close();
      else menu.removeAttribute('open');
    }
    document.body.classList.toggle('explore-open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    document.querySelector('#menu-toggle')?.setAttribute('aria-expanded', String(open));
    if (open) {
      loadSearchIndex();
      focusExploreEntry();
    } else if (returnFocus) (menuReturnFocus?.getClientRects().length ? menuReturnFocus : menuToggle)?.focus({ preventScroll: true });
    interaction(open ? 'explore_open' : 'explore_close', 'mosaic', 'explore');
  }
  menuToggle?.addEventListener('click', event => { menuReturnFocus = event.currentTarget; setMenu(!menu?.open); });
  document.querySelector('#menu-toggle')?.addEventListener('click', event => { menuReturnFocus = event.currentTarget; setMenu(!menu?.open); });
  menuClose?.addEventListener('click', () => setMenu(false));
  menu?.addEventListener('cancel', event => { event.preventDefault(); setMenu(false); });
  menu?.addEventListener('keydown', keepExploreFocus);

  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && dialogIsOpen()) {
      // A keyboard action takes priority over the finite opening animation.
      // Its temporary inert panel must not leave Tab with only the close
      // control (or the browser chrome) available during the half-turn.
      if (panel.dataset.motionPhase === 'open') window.LFTileMotion?.cancel?.();
      const controls = [...detail.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])')]
        .filter(control => {
          const style = getComputedStyle(control);
          return !control.closest('[inert]') && control.getClientRects().length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        });
      const first = controls[0], last = controls.at(-1);
      const active = document.activeElement;
      if (first && (event.shiftKey && active === first || !detail.contains(active))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (last && !event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
      return;
    }
    if (event.key !== 'Escape') return;
    if (dialogIsOpen()) { event.preventDefault(); closeReader(); }
    else if (menu?.open) { event.preventDefault(); setMenu(false); }
  });

  document.querySelectorAll('[data-filter]').forEach(control => control.addEventListener('click', () => {
    const filter = safeText(control.dataset.filter || 'all');
    const canvas = document.querySelector('#canvas') || mosaic;
    const topic = filter === 'all' ? canvas : document.querySelector(`#topic-${CSS.escape(filter)}`);
    if (!canvas || !topic) return;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === control)));
    canvas.dataset.filter = filter;
    // Topics stay in source order. Explore is a way to arrive at a section,
    // never a command that rearranges the page or keyboard order.
    window.LF_MOSAIC?.layout?.();
    setMenu(false, { returnFocus: false });
    topic.scrollIntoView({ block: 'start', behavior: prefersReducedMotion.matches || document.body.classList.contains('no-motion') ? 'instant' : 'smooth' });
    const heading = topic.querySelector('.topic-heading h2, h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      const moveFocus = () => heading.focus({ preventScroll: true });
      if (prefersReducedMotion.matches || document.body.classList.contains('no-motion')) moveFocus();
      else setTimeout(moveFocus, 360);
    }
    document.dispatchEvent(new CustomEvent('lf:filter', { detail: { filter } }));
    interaction('filter_select', filter, 'explore');
  }));

  motionToggle?.addEventListener('click', () => setMotionState(document.body.classList.contains('no-motion')));
  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) setMotionState(false);
  });
  document.addEventListener('lf:motion-request', event => {
    if (typeof event.detail?.enabled === 'boolean') setMotionState(event.detail.enabled && !prefersReducedMotion.matches);
  });
  let savedMotionPaused = false;
  try { savedMotionPaused = sessionStorage.getItem('lf-motion-paused') === '1'; } catch { /* Use the system preference. */ }
  setMotionState(!prefersReducedMotion.matches && !savedMotionPaused && !document.body.classList.contains('no-motion'), { announce: false });

  async function loadSearchIndex() {
    if (!indexPromise) {
      indexPromise = Promise.all([
        fetch('/search-index.json', { credentials: 'same-origin' }).then(response => response.ok ? response.json() : []),
        fetch('/search-aliases.json', { credentials: 'same-origin' }).then(response => response.ok ? response.json() : {})
      ]).then(([rows, aliases]) => {
        searchAliases = aliases && typeof aliases === 'object' ? aliases : {};
        return Array.isArray(rows) ? rows.filter(row => sameOriginPath(row.path)).slice(0, 500) : [];
      }).catch(() => []);
    }
    searchIndex = await indexPromise;
    return searchIndex;
  }

  function searchStatus() {
    let status = document.querySelector('#search-status');
    if (!status && searchResults) {
      status = document.createElement('p');
      status.id = 'search-status';
      status.className = 'sr-only';
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-atomic', 'true');
      searchResults.insertAdjacentElement('afterend', status);
      searchResults.setAttribute('aria-live', 'off');
    }
    return status;
  }

  function searchClearControl() {
    let clear = document.querySelector('#search-clear');
    if (!clear && search) {
      clear = document.createElement('button');
      clear.type = 'button';
      clear.id = 'search-clear';
      clear.className = 'search-clear';
      clear.textContent = 'Clear search';
      clear.setAttribute('aria-label', 'Clear search');
      clear.hidden = true;
      search.insertAdjacentElement('afterend', clear);
      clear.addEventListener('click', () => {
        clearTimeout(searchDebounce);
        searchRequest += 1;
        search.value = '';
        clear.hidden = true;
        searchResults?.replaceChildren();
        const status = searchStatus();
        if (status) status.textContent = '';
        search.focus({ preventScroll: true });
      });
    }
    return clear;
  }

  function drawSearchResults(rows, query) {
    if (!searchResults) return;
    searchResults.replaceChildren();
    const status = searchStatus();
    if (!query) return;
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = 'No clear match yet.';
      const help = document.createElement('a');
      help.className = 'search-help';
      help.href = '/tech-audit/?intent=support&source=search-no-match';
      help.textContent = "Can’t find it? Get help";
      searchResults.append(empty, help);
      if (status) status.textContent = 'No matching answers.';
      return;
    }
    const visibleRows = rows.slice(0, 8);
    const count = document.createElement('p');
    count.className = 'search-count';
    count.textContent = rows.length > visibleRows.length ? `Showing ${visibleRows.length} of ${rows.length} answers.` : `${rows.length} matching ${rows.length === 1 ? 'answer' : 'answers'}.`;
    searchResults.append(count);
    if (status) status.textContent = count.textContent;
    visibleRows.forEach(row => {
      const link = document.createElement('a');
      link.href = sameOriginPath(row.path);
      link.className = 'search-result';
      const family = document.createElement('span'); family.textContent = safeText(row.family || 'Little Fight NYC');
      const title = document.createElement('strong'); title.textContent = draftText(row.title, 320);
      const description = document.createElement('small'); description.textContent = draftText(row.description, 320);
      link.append(family, title, description);
      searchResults.append(link);
    });
  }

  async function runSearch(query, request) {
    const rows = await loadSearchIndex();
    if (request !== searchRequest || query !== safeText(search?.value).trim()) return;
    const matcher = window.LFSearch?.rank;
    const matches = typeof matcher === 'function' ? matcher(rows, query, searchAliases) : [];
    drawSearchResults(matches, query);
    // The bridge only receives the fixed no-match signal. Search text itself
    // can contain personal or business information and never leaves this DOM.
    if (query && !matches.length) interaction('search_no_match', 'mosaic', 'explore');
  }

  search?.addEventListener('input', () => {
    const query = safeText(search.value).trim();
    const clear = searchClearControl();
    if (clear) clear.hidden = !query;
    clearTimeout(searchDebounce);
    const request = ++searchRequest;
    if (!query) {
      drawSearchResults([], '');
      return;
    }
    searchDebounce = setTimeout(() => runSearch(query, request), 140);
  });
  searchResults?.addEventListener('click', event => {
    const link = event.target.closest('a.search-result');
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const path = sameOriginPath(link.getAttribute('href'));
    if (!path) return;
    event.preventDefault();
    searchReturn = { query: search?.value || '' };
    interaction('search_result_selected', contentId(path), 'explore');
    setMenu(false, { returnFocus: false });
    openReader(path, findTile(path) || search);
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-reader-link]');
    if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || trigger.target === '_blank') return;
    const path = sameOriginPath(trigger.dataset.readerLink || trigger.href);
    if (!path) return;
    event.preventDefault();
    setMenu(false, { returnFocus: false });
    openReader(path, trigger.closest('.sculpture-hero') ? trigger : findTile(path) || trigger);
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('form[data-email-draft]');
    if (!form) return;
    event.preventDefault();
    const messageField = form.elements.namedItem('message');
    if (messageField && messageField.maxLength < 0) messageField.maxLength = 4000;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const business = draftText(data.get('business') || 'Business website question', 180);
    const email = draftText(data.get('email') || '', 254);
    const message = draftText(data.get('message') || '', 4000);
    const subject = `Website question: ${business}`;
    const body = `Business: ${business}\nReply email: ${email}\n\n${message}\n\nThis is an editable draft. Sending it happens in your email app.`;
    interaction('email_draft', contentId(detailBody.dataset.readerPath || location.pathname), 'reader_contact');
    location.href = `mailto:hello@littlefightnyc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  prepareNativeInquiry(document, location.href);
  mountDemos(document.querySelector('main[data-page-content]') || document.createElement('div'));
  document.querySelectorAll('form[data-email-draft] textarea[name="message"]').forEach(field => { if (field.maxLength < 0) field.maxLength = 4000; });
  // Contact dock: Call, Text and Get help appear once the hero's own buttons
  // have scrolled away, and leave again when they return.
  const dock = document.querySelector('[data-contact-dock]');
  const heroActions = document.querySelector('.sculpture-hero-actions');
  if (dock && heroActions && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      dock.dataset.visible = String(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    }).observe(heroActions);
  }

  // Get help opens a one-tap chooser. Each choice starts the matching inquiry
  // in the reader; Call, Text and Email stay one tap away. Without scripts the
  // links still go straight to the inquiry page.
  const helpPanel = document.getElementById('get-help-panel');
  if (helpPanel && typeof helpPanel.showModal === 'function') {
    let helpSource = null;
    document.addEventListener('click', event => {
      const trigger = event.target.closest?.('.topbar .start-button, [data-get-help]');
      if (!trigger || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      helpSource = trigger;
      helpPanel.showModal();
      helpPanel.querySelector('.help-choice')?.focus({ preventScroll: true });
      interaction('help_panel_open', 'get-help', trigger.closest('.sculpture-hero') ? 'hero' : trigger.matches('[data-get-help]') ? 'dock' : 'header');
    }, { capture: true });
    helpPanel.addEventListener('click', event => {
      if (event.target === helpPanel || event.target.closest('[data-help-close]')) { helpPanel.close(); return; }
      const choice = event.target.closest('[data-help-choice]');
      if (!choice || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      interaction('help_choice', choice.dataset.helpChoice, 'help-panel');
      const source = helpSource;
      helpPanel.close();
      openReader(sameOriginPath(choice.href), source);
    });
    helpPanel.addEventListener('close', () => {
      if (!dialogIsOpen()) helpSource?.focus({ preventScroll: true });
    });
  }

  // Warm the reader stylesheet once the homepage is idle so the first card
  // opens without waiting on it. It never competes with first paint.
  if (mosaic) {
    const warm = () => ensureReaderStyles().catch(() => {});
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(warm, { timeout: 4000 }) : setTimeout(warm, 2500));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
  }
})();
