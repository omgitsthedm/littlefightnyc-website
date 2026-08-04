/* VERA sweep hero — the radar pass that opens the day. Runs once per
   session, over the real NTA polygons, and then gets out of the way.
   It replays the sweep that already happened; it never pretends one is
   happening live. Reduced motion skips it entirely. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var TESTMODE = /(^|[?&])test=1/.test(location.search);

  function played() {
    if (TESTMODE) return true;
    try { return sessionStorage.getItem('vera-sweep-seen') === '1'; } catch (e) { return true; }
  }
  function mark() {
    if (TESTMODE) return;
    try { sessionStorage.setItem('vera-sweep-seen', '1'); } catch (e) {}
  }

  function bearingDelay(card, cx, cy) {
    var b = card.getAttribute('data-bearing');
    if (b == null) return null;
    /* the beam takes ~2.2s for a full turn; cards land as it passes them */
    return 500 + (+b / 360) * 1800;
  }

  function maybePlay(page) {
    var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (RM || played() || !window.__VERAG || !window.__VERAG.ready()) return false;
    var M = C.MAP;
    var land = window.__VERAG.atlasLand(M.px, M.py, M.B);
    if (!land) return false;
    mark();

    var host = document.createElement('div');
    host.className = 'sweephero';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML =
      '<svg viewBox="0 0 ' + M.VW + ' ' + M.VH + '" preserveAspectRatio="xMidYMid slice">' +
        '<rect class="mp-water" width="' + M.VW + '" height="' + M.VH + '"/>' + land.polys +
        '<g class="sweephero__beam" style="transform-origin:' + (M.VW / 2) + 'px ' + (M.VH / 2) + 'px">' +
          '<path d="M' + (M.VW / 2) + ' ' + (M.VH / 2) + ' L' + (M.VW / 2) + ' -300 A 900 900 0 0 1 ' + (M.VW / 2 + 640) + ' ' + (M.VH / 2 - 640) + ' Z"/>' +
        '</g>' +
      '</svg>' +
      '<p class="sweephero__cap">replaying the ' + C.esc((window.__VERA_APP && window.__VERA_APP.D() && window.__VERA_APP.D().generated_at || '').slice(11, 16) || 'last') + ' UTC sweep</p>';

    var dh = page.querySelector('.drophead');
    (dh ? dh.parentNode : page).insertBefore(host, dh || page.firstChild);

    /* cards materialize as the beam passes their bearing */
    var cards = page.querySelectorAll('.dropcard[data-bearing]');
    for (var i = 0; i < cards.length; i++) {
      var d = bearingDelay(cards[i]);
      if (d != null) cards[i].style.animationDelay = Math.round(d) + 'ms';
    }

    setTimeout(function () {
      host.classList.add('is-done');
      setTimeout(function () { if (host.parentNode) host.parentNode.removeChild(host); }, 700);
    }, 2600);
    return true;
  }

  window.__VERAS = { maybePlay: maybePlay, played: played };
})();
