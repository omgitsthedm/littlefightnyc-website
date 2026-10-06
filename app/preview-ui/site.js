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
      const source = sameOriginPath(frame.dataset.demoSrc);
      if (!source) return;
      const block = frame.closest('[data-reader-demo]');
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
      write.hidden = isInquiry;
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

  async function fetchReader(path, signal) {
    const response = await fetch(path, { credentials: 'same-origin', signal, headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error(`Reader request failed: ${response.status}`);
    const markup = await response.text();
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    const reader = parsed.querySelector('main[data-page-content]');
    if (!reader) throw new Error('Reader markup was not found.');
    return { html: reader.innerHTML, layout: reader.dataset.readerLayout || '', family: reader.dataset.readerFamily || 'brand', template: reader.dataset.readerTemplate || '', homePath: reader.dataset.homePath || path, title: parsed.title || reader.querySelector('h1')?.textContent || document.title };
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
    // Tiles for standalone public apps keep their canonical href. They can opt into a
    // small static reader document without changing the URL, browser history, or event payload.
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const version = ++requestVersion;
    activeSource = findTile(readerPath) || source || activeSource;
    loadingVersion = version;
    mosaic?.classList.add('is-loading-reader');
    if (menu?.open) setMenu(false, { returnFocus: false });

    try {
      const readerDocument = await readerFetchPath(readerPath, findTile(readerPath) || source);
      if (version !== requestVersion || controller.signal.aborted) return false;
      const reader = await fetchReader(readerDocument, controller.signal);
      if (version !== requestVersion || controller.signal.aborted) return false;
      releaseDemos();
      window.LFWebsiteStory?.release(panel);
      detailBody.innerHTML = reader.html;
      activeSource = findTile(reader.homePath) || activeSource;
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
      if (error.name !== 'AbortError') {
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
        releaseDemos();
        delete detail.dataset.readerLayout;
        delete panel.dataset.readerLayout;
        source?.focus?.({ preventScroll: true });
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
    openReader(previous, findTile(previous), { backTrail: trail });
  });
  readerHub?.addEventListener('click', () => closeReader());
  [readerPrevious, readerNext].forEach(button => button?.addEventListener('click', () => {
    if (button.dataset.readerTarget) openReader(button.dataset.readerTarget, findTile(button.dataset.readerTarget));
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
    if (open) {
      loadSearchIndex();
      focusExploreEntry();
    } else if (returnFocus) menuToggle?.focus({ preventScroll: true });
    interaction(open ? 'explore_open' : 'explore_close', 'mosaic', 'explore');
  }
  menuToggle?.addEventListener('click', () => setMenu(!menu?.open));
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
  setMotionState(!prefersReducedMotion.matches && !document.body.classList.contains('no-motion'), { announce: false });

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
    openReader(path, findTile(path) || trigger);
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
})();
