/* VERA sweep hero — the radar pass that opens the day. Phase D elevates
   it into the demo moment: a full-bleed veil replays the REAL nightly
   run — its own stage counts, its own sources — then lifts into the
   in-flow hero, where the beam's pass still lands each card by bearing.
   Once per session. It replays a sweep that already happened; it never
   pretends one is happening live. Reduced motion skips it entirely. */
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

  function mapSvg(beamCls) {
    var M = C.MAP;
    var land = window.__VERAG.atlasLand(M.px, M.py, M.B);
    if (!land) return null;
    return '<svg viewBox="0 0 ' + M.VW + ' ' + M.VH + '" preserveAspectRatio="xMidYMid slice">' +
      '<rect class="mp-water" width="' + M.VW + '" height="' + M.VH + '"/>' + land.polys +
      '<g class="' + beamCls + '" style="transform-origin:' + (M.VW / 2) + 'px ' + (M.VH / 2) + 'px">' +
        '<path d="M' + (M.VW / 2) + ' ' + (M.VH / 2) + ' L' + (M.VW / 2) + ' -300 A 900 900 0 0 1 ' + (M.VW / 2 + 640) + ' ' + (M.VH / 2 - 640) + ' Z"/>' +
      '</g>' +
    '</svg>';
  }

  /* The narration replays the run's own numbers — every figure is read
     off the feed (stages, sources, the full-fit gate), never invented
     for drama. */
  function beats() {
    var app = window.__VERA_APP;
    var D = app && app.D ? app.D() : null;
    var t = ((D && D.generated_at) || '').slice(11, 16);
    var lines = ['replaying the ' + (t || 'last') + ' UTC sweep'];
    var st = (D && D.stages) || {};
    var src = ((D && D.sources) || []).filter(function (s) { return s.record_count > 0; });
    if (st.discover && st.discover.records_out != null) {
      var names = src.slice(0, 3).map(function (s) { return s.source_name.replace(/_/g, ' ') + ' ' + s.record_count; }).join(' · ');
      lines.push('<b>' + st.discover.records_out + '</b> raw finds' + (names ? ' — ' + C.esc(names) : ''));
    }
    if (st.dedupe && st.dedupe.records_out != null) {
      lines.push('dedupe → <b>' + st.dedupe.records_out + '</b> in the net');
    }
    if (app && app.POOL) {
      lines.push('<b>' + app.POOL().filter(C.isFullFit).length + '</b> cleared every gate — those are below');
    }
    return lines;
  }

  function bearingDelay(card) {
    var b = card.getAttribute('data-bearing');
    if (b == null) return null;
    /* the beam takes ~2.2s for a full turn; cards land as it passes them */
    return 500 + (+b / 360) * 1800;
  }

  function playInlineHero(page) {
    var svg = mapSvg('sweephero__beam');
    if (!svg) return;
    var host = document.createElement('div');
    host.className = 'sweephero';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = svg +
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
  }

  function maybePlay(page) {
    var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (RM || played() || !window.__VERAG || !window.__VERAG.ready()) return false;
    var veilSvg = mapSvg('sweepveil__beam');
    if (!veilSvg) return false;
    mark();

    /* Act one: the veil. Full-bleed city, one slow beam, and the run
       narrated in its own numbers. */
    var veil = document.createElement('div');
    veil.className = 'sweepveil';
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = veilSvg + '<p class="sweepveil__line" data-sweep-line></p>';
    document.body.appendChild(veil);

    var lineEl = veil.querySelector('[data-sweep-line]');
    var bts = beats();
    var i = 0;
    lineEl.innerHTML = bts[0];
    var iv = setInterval(function () {
      i++;
      if (i >= bts.length) {
        clearInterval(iv);
        veil.classList.add('is-lift');
        setTimeout(function () {
          if (veil.parentNode) veil.parentNode.removeChild(veil);
          playInlineHero(page);
        }, 780);
        return;
      }
      lineEl.classList.add('is-out');
      setTimeout(function () {
        lineEl.innerHTML = bts[i];
        lineEl.classList.remove('is-out');
      }, 220);
    }, 880);
    return true;
  }

  window.__VERAS = { maybePlay: maybePlay, played: played, _beats: beats };
})();
