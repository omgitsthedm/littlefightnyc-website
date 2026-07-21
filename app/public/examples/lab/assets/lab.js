/* The Lab — filters, reveal, small niceties. No dependencies. */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));
  var notes = Array.prototype.slice.call(document.querySelectorAll('.section-note'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var empty = document.querySelector('.empty');

  // year + live count
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();
  var cnt = document.getElementById('count'); if (cnt) cnt.textContent = String(cards.length);

  // filter
  function apply(filter) {
    var shown = 0;
    cards.forEach(function (c) {
      var match = filter === 'all' || c.getAttribute('data-cat') === filter;
      c.hidden = !match; if (match) shown++;
    });
    notes.forEach(function (n) {
      n.hidden = !(filter === 'all' || n.getAttribute('data-cat') === filter);
    });
    if (empty) empty.hidden = shown !== 0;
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('is-active'); chip.setAttribute('aria-pressed', 'true');
      apply(chip.getAttribute('data-filter'));
    });
  });

  // staggered reveal — progressive enhancement, never leaves content hidden
  function revealAll() { cards.forEach(function (c) { c.classList.add('in'); }); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (e.isIntersecting) {
          var el = e.target;
          setTimeout(function () { el.classList.add('in'); }, Math.min(i * 45, 220));
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    cards.forEach(function (c) { io.observe(c); });
    // failsafe: whatever hasn't been revealed shortly after load, show it anyway
    window.addEventListener('load', function () { setTimeout(revealAll, 1200); });
  }
})();
