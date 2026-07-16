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

    // ---- tugboat personality: idle bob + tap-to-toot ----
    var TOOTS = ['toot toot!', 'honk!', 'all aboard', 'beep beep', 'pulling weight', '⚓ ahoy', '🚤 vroom'];
    document.querySelectorAll('[data-tug]').forEach(function (tug) {
      // every tug bobs on the water via CSS (survives React re-renders).
      // only toot on tap when the tug isn't inside a link/button (else the tap navigates)
      if (tug.closest('a, button')) return;
      var host = tug.parentElement || tug;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var bubble = document.createElement('span');
      bubble.className = 'lf-bubble';
      host.appendChild(bubble);
      var ti = 0;
      tug.addEventListener('click', function () {
        bubble.classList.toggle('lf-below', tug.getBoundingClientRect().top < 150);
        bubble.textContent = TOOTS[ti++ % TOOTS.length];
        bubble.classList.add('show');
        clearTimeout(tug._tb);
        tug._tb = setTimeout(function () { bubble.classList.remove('show'); }, 1150);
        if (reduce) return;
        // toot overrides the idle bob (higher specificity), then bob resumes automatically
        tug.classList.remove('lf-toot'); void tug.offsetWidth; tug.classList.add('lf-toot');
        tug.addEventListener('animationend', function h() {
          tug.classList.remove('lf-toot');
          tug.removeEventListener('animationend', h);
        }, { once: true });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
