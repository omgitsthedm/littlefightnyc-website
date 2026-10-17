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
  // Failsafe: reveal the tile canvas if its layout never completes.
  setTimeout(() => {
    const canvas = document.getElementById('canvas');
    if (canvas && !canvas.dataset.layoutReady) canvas.dataset.layoutReady = 'failsafe';
  }, 3000);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => ready('parsed'), {once: true});
  else ready('parsed');
  window.addEventListener('pageshow', event => { if (event.persisted) ready('history'); });
})();
