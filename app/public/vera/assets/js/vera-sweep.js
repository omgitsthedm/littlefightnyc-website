/* VERA sweep status. The feed still records a completed nightly sweep, but the
   interface no longer replays it as a blocking full-screen animation. Keep the
   small public API because the Today renderer and acceptance suite use it. */
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

  /* These facts remain useful to tests and future compact status UI. Every
     figure comes from the published feed; nothing here claims a live scan. */
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

  function removeLegacySweep() {
    var nodes = document.querySelectorAll('.sweepveil, .sweephero');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
    }
  }

  function maybePlay() {
    removeLegacySweep();
    mark();
    return false;
  }

  window.__VERAS = { maybePlay: maybePlay, played: played, _beats: beats };
})();
