/* Signal that the homepage is ready without hiding it. Scripts that start
   motion listen for lf:site-ready; the tile canvas reveals itself separately
   once its layout is applied (site-boot.css, mosaic-layout.js). */
(() => {
  'use strict';
  const root = document.documentElement;
  if (!root.hasAttribute('data-home-boot')) return;
  const ready = reason => {
    if (root.dataset.siteBoot === 'ready') return;
    root.dataset.siteBoot = 'ready';
    performance.mark('lf-first-view-ready');
    document.dispatchEvent(new CustomEvent('lf:site-ready', {detail: {reason}}));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => ready('parsed'), {once: true});
  else ready('parsed');
  window.addEventListener('pageshow', event => { if (event.persisted) ready('history'); });
})();
