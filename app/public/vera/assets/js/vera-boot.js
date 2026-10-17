/* VERA boot — start the publication download while the app is still
   arriving. The app adopts this exact request as its first attempt, so the
   retry, timeout, and validation contract is unchanged; this only moves the
   first byte earlier. Nothing here renders or stores anything. */
(function () {
  'use strict';
  if (window.__VERA_FEED_STARTED || !window.fetch) return;
  try {
    var early = window.fetch('./data/public.json', { cache: 'no-store' });
    early.catch(function () {});
    window.__VERA_EARLY_FEED = early;
  } catch (e) {
    window.__VERA_EARLY_FEED = null;
  }
})();
