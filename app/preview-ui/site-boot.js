/* Run before the first paint. No JS means the ordinary complete page stays visible. */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-home-boot')) return;
  root.dataset.siteBoot = 'loading';
  let released = false;
  let deadline;
  const finish = reason => {
    if (released) return;
    released = true;
    clearTimeout(deadline);
    const shell = document.querySelector('.app-shell');
    if (shell) shell.inert = false;
    const loader = document.querySelector('.site-loading');
    if (loader) {
      loader.inert = true;
      loader.setAttribute('aria-hidden', 'true');
      if (loader.contains(document.activeElement)) document.querySelector('.wordmark')?.focus({preventScroll: true});
    }
    root.dataset.siteBoot = 'ready';
    performance.mark('lf-first-view-ready');
    document.dispatchEvent(new CustomEvent('lf:site-ready', {detail: {reason}}));
  };
  // Install the escape hatch before doing any other work. Failed/slow images
  // never leave a blank page, and returning from the back-forward cache is instant.
  // The page is hidden while this runs, so keep the hold short: a slow
  // connection sees the site after 1.5s and the artwork settles in place.
  deadline = setTimeout(() => finish('timeout'), 1500);
  window.addEventListener('pageshow', event => { if (event.persisted) finish('history'); });
  const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
  document.addEventListener('DOMContentLoaded', async () => {
    const shell = document.querySelector('.app-shell');
    if (shell) shell.inert = !released;
    document.querySelector('[data-boot-skip]')?.addEventListener('click', () => finish('skip'));
    const tug = document.querySelector('[data-boot-tug]');
    tug?.addEventListener('click', () => {
      tug.classList.remove('is-nudged');
      requestAnimationFrame(() => tug.classList.add('is-nudged'));
    });
    try {
      await document.fonts.ready;
      window.LF_MOSAIC?.layout();
      await frame();
      const images = [...document.querySelectorAll('.sculpture-hero img, #canvas img')].filter(img => {
        const box = img.getBoundingClientRect();
        return img.closest('.sculpture-hero') || (box.top < innerHeight + 120 && box.bottom > 0);
      });
      await Promise.allSettled(images.map(img => {
        img.loading = 'eager';
        return img.decode();
      }));
      await frame();
      finish('decoded');
    } catch { finish('fallback'); }
  }, {once: true});
})();
