/* Little Fight NYC — shared EXPERIENCE layer (motion + personality).
 * Canonical source: brand-system/experience.js (pairs with experience.css).
 * Self-initialising, dependency-free, reduced-motion-safe. Load with `defer`.
 * Wires: scroll progress · cursor glow · tug bob/toot personality · scroll reveals. */
(function () {
  'use strict';
  function init() {
    var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

    // ---- scroll progress ----
    var prog = document.createElement('div');
    prog.className = 'lf-prog';
    document.body.appendChild(prog);
    function onScroll() {
      var h = document.documentElement;
      var p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1);
      prog.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---- cursor ambient glow (opt out with <html data-noglow> on content-heavy sites) ----
    if (!reduce && !document.documentElement.hasAttribute('data-noglow') && matchMedia('(hover:hover)').matches) {
      var glow = document.createElement('div');
      glow.className = 'lf-glow';
      document.body.appendChild(glow);
      var raf = 0, x = 0, y = 0;
      addEventListener('pointermove', function (e) {
        x = e.clientX; y = e.clientY; glow.classList.add('on');
        if (!raf) raf = requestAnimationFrame(function () {
          glow.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
          raf = 0;
        });
      }, { passive: true });
      document.addEventListener('mouseleave', function () { glow.classList.remove('on'); });
    }

    // The tugboat's idle bob is CSS-only (see experience.css [data-tug]) and
    // survives React re-renders. The former tap-to-"toot" easter-egg was removed:
    // this script runs at DOMContentLoaded, before React mounts the [data-tug]
    // marks, so the handler never attached (dead code) — and it put a misleading
    // pointer cursor on marks that are aria-hidden + decorative.
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
