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
  const motionToggle = document.querySelector('#motion-toggle');
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  if (!detail || !panel || !detailBody) return;
  // The modal rail is a separate landmark from the page content it displays.
  // Keep its accessible name distinct after each progressive reader injection.
  detail.querySelector('.reader-rail')?.setAttribute('aria-label', 'Quick contact');

  let activeController = null;
  let requestVersion = 0;
  let loadingVersion = 0;
  let activeSource = null;
  let lastOpenState = null;
  let indexPromise = null;
  let searchIndex = [];
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

  function setMotionState(enabled, { announce = true } = {}) {
    document.body.classList.toggle('no-motion', !enabled);
    if (motionToggle) {
      motionToggle.setAttribute('aria-pressed', String(!enabled));
      motionToggle.setAttribute('aria-label', enabled ? 'Turn motion off' : 'Turn motion on');
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

  async function fetchReader(path, signal) {
    const response = await fetch(path, { credentials: 'same-origin', signal, headers: { Accept: 'text/html' } });
    if (!response.ok) throw new Error(`Reader request failed: ${response.status}`);
    const markup = await response.text();
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    const reader = parsed.querySelector('main[data-page-content]');
    if (!reader) throw new Error('Reader markup was not found.');
    return { html: reader.innerHTML, title: parsed.title || reader.querySelector('h1')?.textContent || document.title };
  }

  function focusReader() {
    // Keep the focus ring on the familiar escape hatch, never across the display headline.
    const target = closeButton || detailBody.querySelector('[data-reader-focus], a, button, input, textarea');
    target?.focus?.({ preventScroll: true });
  }

  async function openReader(path, source, options = {}) {
    const readerPath = sameOriginPath(path);
    if (!readerPath) return false;
    // A click can land in the microtask after the dialog disappears but before
    // its return-focus/history cleanup settles. Finish that finite close first.
    if (closingPromise) await closingPromise;
    const isInReader = dialogIsOpen();
    // Tiles for standalone public apps keep their canonical href. They can opt into a
    // small static reader document without changing the URL, browser history, or event payload.
    const readerFetchPath = (!isInReader && sameOriginPath(source?.dataset.readerSrc)) || readerPath;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const version = ++requestVersion;
    activeSource = source || findTile(readerPath);
    loadingVersion = version;
    mosaic?.classList.add('is-loading-reader');
    if (menu?.open) setMenu(false, { returnFocus: false });

    try {
      const reader = await fetchReader(readerFetchPath, controller.signal);
      if (version !== requestVersion || controller.signal.aborted) return false;
      detailBody.innerHTML = reader.html;
      detailBody.scrollTop = 0;
      detailBody.dataset.readerPath = readerPath;
      detail.dataset.readerPath = readerPath;
      panel.dataset.readerPath = readerPath;
      document.title = reader.title;
      // The bridge receives reader-ready on document and mounts against this URL.
      // Commit the state before that event, while the fetched reader is already in place.
      lastOpenState = { lfReader: true, path: readerPath };
      if (!options.fromHistory) {
        if (isInReader || options.replaceHistory || history.state?.lfReader) history.replaceState(lastOpenState, '', readerPath);
        else history.pushState(lastOpenState, '', readerPath);
      }
      document.dispatchEvent(new CustomEvent('lf:reader-ready', { detail: { path: readerPath } }));

      showDialog();
      const motion = window.LFTileMotion;
      if (!isInReader && motion?.open) await motion.open({ source: activeSource, dialog: detail, panel });
      if (version !== requestVersion) return false;
      focusReader();

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
      try {
        const motion = window.LFTileMotion;
        if (motion?.close && dialogIsOpen()) await motion.close({ source, dialog: detail, panel });
        if (dialogIsOpen() && typeof detail.close === 'function') detail.close();
        else detail.removeAttribute('open');
        document.body.classList.remove('reader-open');
        document.title = shellTitle;
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
    const readerHistoryEntry = Boolean(history.state?.lfReader);
    await finishClose();
    if (useHistory && readerHistoryEntry && history.state?.lfReader) history.back();
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
  let mineralLightTimer = 0;
  mosaic?.addEventListener('pointerover', event => {
    const tile = event.target.closest('.tile');
    if (!tile || !mosaic.contains(tile) || tile.dataset.mineralLit) return;
    tile.dataset.mineralLit = 'true';
    clearTimeout(mineralLightTimer);
    mineralLightTimer = setTimeout(() => { delete tile.dataset.mineralLit; }, 560);
  });

  closeButton?.addEventListener('click', event => { event.preventDefault(); closeReader(); });
  detail.addEventListener('cancel', event => { event.preventDefault(); closeReader(); });
  detail.addEventListener('click', event => {
    if (event.target === detail) { closeReader(); return; }
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    // Production CTAs can opt out of the reader island and load their document normally.
    if (link.hasAttribute('data-document-link')) {
      event.preventDefault();
      location.assign(link.href);
      return;
    }
    const path = sameOriginPath(link.href);
    const currentPath = String(detailBody.dataset.readerPath || '').split('#')[0];
    if (!path || path === detailBody.dataset.readerPath || path.split('#')[0] === currentPath || path.startsWith('mailto:') || path.startsWith('tel:') || path.startsWith('sms:')) return;
    event.preventDefault();
    openReader(path, activeSource, { replaceHistory: true });
  });

  addEventListener('popstate', event => {
    const state = event.state;
    if (state?.lfReader && state.path) {
      openReader(state.path, findTile(state.path), { fromHistory: true });
    } else if (dialogIsOpen()) {
      finishClose(findTile(detailBody.dataset.readerPath));
    }
  });

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
      search?.focus({ preventScroll: true });
    } else if (returnFocus) menuToggle?.focus({ preventScroll: true });
    interaction(open ? 'explore_open' : 'explore_close', 'mosaic', 'explore');
  }
  menuToggle?.addEventListener('click', () => setMenu(!menu?.open));
  menuClose?.addEventListener('click', () => setMenu(false));
  menu?.addEventListener('cancel', event => { event.preventDefault(); setMenu(false); });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (dialogIsOpen()) { event.preventDefault(); closeReader(); }
    else if (menu?.open) { event.preventDefault(); setMenu(false); }
  });

  document.querySelectorAll('[data-filter]').forEach(control => control.addEventListener('click', () => {
    const filter = safeText(control.dataset.filter || 'all');
    const canvas = document.querySelector('#canvas') || mosaic;
    if (!canvas) return;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === control)));
    canvas.dataset.filter = filter;
    // The approved layout keeps every card in the document and moves the selected family forward.
    canvas.dataset.world = filter;
    window.LF_MOSAIC?.layout?.(filter);
    setMenu(false, { returnFocus: false });
    canvas.scrollIntoView({ block: 'start', behavior: prefersReducedMotion.matches || document.body.classList.contains('no-motion') ? 'instant' : 'smooth' });
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
      indexPromise = fetch('/search-index.json', { credentials: 'same-origin' })
        .then(response => response.ok ? response.json() : [])
        .then(rows => Array.isArray(rows) ? rows.filter(row => sameOriginPath(row.path)).slice(0, 500) : [])
        .catch(() => []);
    }
    searchIndex = await indexPromise;
    return searchIndex;
  }

  function drawSearchResults(rows, query) {
    if (!searchResults) return;
    searchResults.replaceChildren();
    if (!query) return;
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = 'No clear match yet. Try a service, problem, or kind of business.';
      searchResults.append(empty);
      return;
    }
    rows.slice(0, 8).forEach(row => {
      const link = document.createElement('a');
      link.href = sameOriginPath(row.path);
      link.className = 'search-result';
      const family = document.createElement('span'); family.textContent = safeText(row.family || 'Little Fight NYC');
      const title = document.createElement('strong'); title.textContent = safeText(row.title);
      const description = document.createElement('small'); description.textContent = safeText(row.description);
      link.append(family, title, description);
      searchResults.append(link);
    });
  }

  search?.addEventListener('input', async () => {
    const query = safeText(search.value).toLowerCase().trim();
    const rows = await loadSearchIndex();
    const words = query.split(/\s+/).filter(Boolean);
    const variantsFor = word => {
      const variants = new Set([word]);
      if (/ers?$/.test(word)) variants.add(`${word.replace(/ers?$/, '')}ing`);
      if (/ing$/.test(word)) variants.add(`${word.slice(0, -3)}er`);
      return [...variants];
    };
    const matches = !words.length ? [] : rows.map(row => {
      const haystack = `${row.title || ''} ${row.description || ''} ${row.family || ''}`.toLowerCase();
      return { row, score: words.reduce((score, word) => score + (variantsFor(word).some(variant => haystack.includes(variant)) ? 1 : 0), 0) };
    }).filter(result => result.score).sort((a, b) => b.score - a.score).map(result => result.row);
    drawSearchResults(matches, query);
    // Search terms are private input. The bridge only needs the fixed no-match
    // signal to improve the known content library, never the query itself.
    if (query && !matches.length) interaction('search_no_match', 'mosaic', 'explore');
  });
  searchResults?.addEventListener('click', event => {
    const link = event.target.closest('a.search-result');
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const path = sameOriginPath(link.getAttribute('href'));
    if (!path) return;
    event.preventDefault();
    interaction('search_result_selected', contentId(path), 'explore');
    setMenu(false, { returnFocus: false });
    openReader(path, findTile(path));
  });

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-reader-link]');
    if (!trigger || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || trigger.target === '_blank') return;
    const path = sameOriginPath(trigger.dataset.readerLink || trigger.href);
    if (!path) return;
    event.preventDefault();
    setMenu(false, { returnFocus: false });
    openReader(path, findTile(path));
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
  document.querySelectorAll('form[data-email-draft] textarea[name="message"]').forEach(field => { if (field.maxLength < 0) field.maxLength = 4000; });
})();
