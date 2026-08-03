/* VERA app shell — the product. Routes: Today (the drop), Market (the wide
   net), Browse (the whole table), Atlas (the hunt zone), My hunt, Field
   manual, System. Public lens only: fetches the sanitized public.json and
   nothing else. The Ledger (per-listing flyout) lives in vera-ledger.js. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = C.esc, money = C.money, num = C.num, median = C.median, timeago = C.timeago;

  var FEEDS = ['./data/public.json', 'https://vera-pipeline.netlify.app/data/public.json'];
  var TESTMODE = /(^|[?&])test=1/.test(location.search);
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var D = null;
  var POOL = [];
  var HOODS = [];
  var usedFallbackPool = false;

  var ROUTES = ['today', 'market', 'browse', 'atlas', 'hunt', 'manual', 'system'];
  var LEGACY = { command: 'market', discover: 'browse', map: 'atlas', cases: 'hunt', toolkit: 'manual', pipeline: 'system', about: 'system' };
  var DATA_ROUTES = { market: 1, browse: 1, atlas: 1 };

  var state = {
    bracket: 'all', unit: 'all', hoods: [], areas: [], transit: 0,
    lens: { noBrokers: false, noMgmt: false, privateFirst: false },
    view: 'all', q: '', sort: { key: 'overall_score', dir: -1 }, density: 'comfortable', route: 'today',
  };

  try {
    var saved = JSON.parse(localStorage.getItem('vera-workspace') || 'null');
    if (saved) { ['bracket', 'unit', 'hoods', 'areas', 'transit', 'lens', 'view', 'density'].forEach(function (k) { if (saved[k] !== undefined) state[k] = saved[k]; }); }
  } catch (e) {}

  function persist() {
    try { localStorage.setItem('vera-workspace', JSON.stringify({ bracket: state.bracket, unit: state.unit, hoods: state.hoods, areas: state.areas, transit: state.transit, lens: state.lens, view: state.view, density: state.density })); } catch (e) {}
  }

  function tidyTitle(t) {
    var s = String(t || '').replace(/\s+/g, ' ').trim();
    var letters = s.replace(/[^a-zA-Z]/g, '');
    var caps = letters.replace(/[^A-Z]/g, '');
    if (letters.length > 8 && caps.length / letters.length > 0.6) {
      s = s.toLowerCase().replace(/(^|[.!?]\s+|\b(?:st|ave|br|bd|nyc|ues|uws|les|soho|fidi)\b)/g, function (m) { return m.toUpperCase(); });
      s = s.charAt(0).toUpperCase() + s.slice(1);
    }
    return s;
  }

  function byUid(uid) { for (var i = 0; i < POOL.length; i++) if (POOL[i].listing_uid === uid) return POOL[i]; return null; }

  /* ---------- count-up: numbers that arrive, not appear ---------- */

  function countUps(root) {
    if (RM) {
      $$('[data-count-to]', root).forEach(function (el) { el.textContent = el.getAttribute('data-count-final'); });
      return;
    }
    $$('[data-count-to]', root).forEach(function (el) {
      var target = +el.getAttribute('data-count-to') || 0;
      var final = el.getAttribute('data-count-final');
      var prefix = el.getAttribute('data-count-prefix') || '';
      var t0 = performance.now(), dur = 650;
      function stepFn(ts) {
        var k = Math.min((ts - t0) / dur, 1);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = prefix + Math.round(target * e).toLocaleString('en-US');
        if (k < 1) requestAnimationFrame(stepFn);
        else if (final) el.textContent = final;
      }
      requestAnimationFrame(stepFn);
    });
  }

  // data-count-final is what the reduced-motion path reads; without it every
  // counter rendered blank instead of jumping straight to its value.
  function cval(n) { var v = +n || 0; return '<span data-count-to="' + v + '" data-count-final="' + v + '">0</span>'; }
  function cmoney(m) { return m == null ? '—' : '<span data-count-to="' + Math.round(m) + '" data-count-prefix="$" data-count-final="' + money(m) + '">$0</span>'; }

  /* ---------- photos over portraits ---------- */

  function photoOf(l) {
    var urls = l && l.image_urls;
    if (!urls || !urls.length) return null;
    for (var i = 0; i < urls.length; i++) {
      if (typeof urls[i] === 'string' && urls[i].slice(0, 8) === 'https://') return urls[i];
    }
    return null;
  }

  function photoLayer(l) {
    var src = photoOf(l);
    if (!src) return '';
    var n = +l.image_count || (l.image_urls || []).length;
    var where = l.title || l.address_normalized || 'this listing';
    return '<img class="shot" src="' + esc(src) + '" loading="lazy" decoding="async" ' +
      'alt="Listing photo for ' + esc(where) + '">' +
      (n > 1 ? '<span class="shot__n">' + n + ' photos</span>' : '');
  }

  // Image error events do not bubble, so they are caught on the way down.
  // An inline onerror would be dropped by the site CSP (script-src 'self').
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.className === 'shot') {
      var n = t.parentNode && t.parentNode.querySelector('.shot__n');
      if (n) n.parentNode.removeChild(n);
      t.parentNode.removeChild(t);
    }
  }, true);

  /* ---------- the hunt (cases, localStorage only) ---------- */

  var STAGES = [
    { id: 'saved', label: 'Saved', hint: 'worth a look' },
    { id: 'contacted', label: 'Reached out', hint: 'message sent' },
    { id: 'touring', label: 'Tour booked', hint: 'going to see it' },
    { id: 'toured', label: 'Seen it', hint: 'walked the unit' },
    { id: 'applied', label: 'Applied', hint: 'paperwork in' },
    { id: 'dead', label: 'Passed', hint: 'not the one' },
  ];

  var cases = {};
  try { cases = JSON.parse(localStorage.getItem('vera-cases') || '{}') || {}; } catch (e) { cases = {}; }

  function saveCases() {
    try { localStorage.setItem('vera-cases', JSON.stringify(cases)); } catch (e) {}
    var n = Object.keys(cases).filter(function (k) { return cases[k].stage !== 'dead'; }).length;
    var badge = $('[data-case-badge]');
    if (badge) { badge.hidden = !n; badge.textContent = n; }
  }

  function caseOf(uid) { return cases[uid] || null; }

  function setStage(uid, stage) {
    var l = byUid(uid);
    if (!cases[uid]) {
      cases[uid] = { uid: uid, stage: stage, added: new Date().toISOString(), notes: '', checks: {},
        title: l ? (l.title || l.address_normalized) : uid, rent: l ? l.rent : null, hood: l ? l.neighborhood : null };
    } else {
      cases[uid].stage = stage;
    }
    saveCases();
    toast(stage === 'dead' ? 'Passed — VERA will stop suggesting it.' : 'Moved to ' + (STAGES.filter(function (s) { return s.id === stage; })[0] || {}).label);
  }

  function dropCase(uid) { delete cases[uid]; saveCases(); toast('Removed from your hunt.'); }

  var toastT = 0;
  function toast(msg) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    requestAnimationFrame(function () { el.classList.add('is-up'); });
    clearTimeout(toastT);
    toastT = setTimeout(function () {
      el.classList.remove('is-up');
      setTimeout(function () { el.hidden = true; }, 300);
    }, 2600);
  }

  /* ---------- filter pipeline ---------- */

  var VIEWS = {
    all: function () { return true; },
    fresh: C.isFresh,
    owner: function (l) { return C.ownerRead(l).label === 'Private'; },
    clean: function (l) { return (+l.hpd_risk_score || 0) < 40 && !(+l.serious_open_violations); },
    verify: C.needsVerify,
    scam: C.isScam,
  };

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var out = POOL.filter(function (l) {
      if (state.bracket !== 'all' && C.bracketOf(l.rent) !== state.bracket) return false;
      if (state.unit !== 'all' && C.unitOf(l) !== state.unit) return false;
      if (state.areas.length && state.areas.indexOf(C.areaOf(l)) === -1) return false;
      if (state.hoods.length && state.hoods.indexOf(l.neighborhood || 'Unknown') === -1) return false;
      if (state.transit) {
        var t = C.nearestStation(l);
        if (!t || t.mins > state.transit) return false;
      }
      if (state.lens.noBrokers && C.ownerRead(l).label === 'Broker') return false;
      if (state.lens.noMgmt && C.ownerRead(l).label === 'Corporate') return false;
      if (!(VIEWS[state.view] || VIEWS.all)(l)) return false;
      if (q) {
        var hay = [l.title, l.neighborhood, l.address_normalized, l.source_name, l.owner_name].join(' ').toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var k = state.sort.key, dir = state.sort.dir;
    out.sort(function (a, b) {
      if (state.lens.privateFirst) {
        var pa = C.ownerRead(a).label === 'Private' ? 1 : 0, pb = C.ownerRead(b).label === 'Private' ? 1 : 0;
        if (pa !== pb) return pb - pa;
      }
      var va = a[k], vb = b[k];
      if (typeof va === 'string' || typeof vb === 'string') return String(va || '').localeCompare(String(vb || '')) * dir;
      return ((+va || 0) - (+vb || 0)) * dir;
    });
    return out;
  }

  /* ---------- charts (hand-rolled svg) ---------- */

  function sparkline(series, w, h, color) {
    if (!series.length) return '';
    var mx = Math.max.apply(null, series), mn = Math.min.apply(null, series);
    /* A constant series draws through the middle: a level line means level,
       not broken. */
    var flat = mx === mn;
    var span = (mx - mn) || 1;
    var pts = series.map(function (v, i) {
      var x = series.length === 1 ? w / 2 : (i / (series.length - 1)) * (w - 8) + 4;
      var y = flat ? h / 2 : h - 6 - ((v - mn) / span) * (h - 16);
      return [x, y];
    });
    var path = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = path + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (h - 4) + ' L' + pts[0][0].toFixed(1) + ' ' + (h - 4) + ' Z';
    var dots = pts.map(function (p, i) { return i === pts.length - 1 ? '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="' + color + '"/>' : ''; }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img">' +
      '<path d="' + area + '" fill="' + color + '" opacity="0.12"/>' +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round"/>' + dots + '</svg>';
  }

  /* ---------- chrome ---------- */

  function renderChrome() {
    var sh = (D && D.source_health) || {};
    $('[data-snapshot-line]').textContent = 'Sweep ' + timeago(D && D.generated_at) + ' · ' + POOL.length + ' in the net';
    var pulse = $('[data-pulse]');
    if (pulse) {
      pulse.className = 'pulse';
      if ((sh.broken || 0) > (sh.healthy || 0)) pulse.classList.add('is-bad');
      else if ((sh.broken || 0) > 0) pulse.classList.add('is-warn');
    }
  }

  function renderFilters() {
    var deck = $('[data-filters]');
    deck.hidden = !DATA_ROUTES[state.route];
    if (deck.hidden) return;
    $$('[data-bracket]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-bracket') === state.bracket); });
    $$('[data-unit]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-unit') === state.unit); });
    $$('[data-transit]').forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-transit') === state.transit); });
    $$('[data-lens]').forEach(function (b) { b.classList.toggle('is-on', !!state.lens[b.getAttribute('data-lens')]); });
    var counts = {};
    POOL.forEach(function (l) { var a = C.areaOf(l); if (a) counts[a] = (counts[a] || 0) + 1; });
    var box = $('[data-areas]');
    box.innerHTML = C.AREAS.map(function (a) {
      return '<button type="button" data-area="' + a.id + '" class="' + (state.areas.indexOf(a.id) > -1 ? 'is-on' : '') + '">' + esc(a.label) + ' <span class="dimcount">' + (counts[a.id] || 0) + '</span></button>';
    }).join('');
    var dirty = state.bracket !== 'all' || state.unit !== 'all' || state.hoods.length || state.areas.length || state.transit || state.lens.noBrokers || state.lens.noMgmt || state.lens.privateFirst || state.view !== 'all' || state.q;
    $('[data-clear]').hidden = !dirty;
  }

  function refresh() {
    persist();
    renderFilters();
    renderRoute();
  }

  /* ================================================================
     TODAY — the drop. Few things, deeply vetted, honestly told.
     No filters here on purpose: this page is VERA's opinion.
     ================================================================ */

  var countdownT = 0;

  function nextSweepUTC() {
    var now = new Date();
    var next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 6, 0, 0));
    if (next <= now) next = new Date(next.getTime() + 24 * 3.6e6);
    return next;
  }

  function fmtCountdown(ms) {
    if (ms < 0) ms = 0;
    var h = Math.floor(ms / 3.6e6), m = Math.floor((ms % 3.6e6) / 6e4), s = Math.floor((ms % 6e4) / 1000);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function startCountdown() {
    clearInterval(countdownT);
    var el = $('[data-countdown]');
    if (!el) return;
    if (RM) { el.textContent = 'next sweep 06:00 UTC'; return; }
    function tick() {
      var el2 = $('[data-countdown]');
      if (!el2) { clearInterval(countdownT); return; }
      el2.textContent = fmtCountdown(nextSweepUTC() - new Date());
    }
    tick();
    countdownT = setInterval(tick, 1000);
  }

  function provenance(l) {
    var a = C.authenticity(l);
    var bits = [];
    bits.push('<span class="prov__i" title="When VERA first saw this listing">seen ' + timeago(l.first_seen_at || l.last_seen_at) + '</span>');
    if (l.source_name) bits.push('<span class="prov__i">' + esc(l.source_name) + '</span>');
    if (a != null) bits.push('<span class="prov__i" title="Authenticity confidence, 0–100">real ' + num(a) + '</span>');
    bits.push('<span class="prov__i" title="HPD building-risk score — lower is cleaner">HPD ' + num(l.hpd_risk_score) + '</span>');
    if (l.duplicate_count) bits.push('<span class="prov__i">' + l.duplicate_count + '× reposted</span>');
    return '<div class="prov">' + bits.join('<span class="prov__dot">·</span>') + '</div>';
  }

  function addressOf(l) {
    var a = String(l.address_normalized || '').trim();
    if (!a) return null;
    a = a.replace(/\b(apt|unit)\b/gi, '#').replace(/#\s+/g, '#');
    return C.titleCase(a).replace(/\bE\b/g, 'E').replace(/\bW\b/g, 'W').replace(/#([a-z0-9]+)/gi, function (m, u) { return '#' + u.toUpperCase(); });
  }

  function gallery(l) {
    var urls = (l.image_urls || []).filter(function (u) { return typeof u === 'string' && u.slice(0, 8) === 'https://'; }).slice(0, 6);
    if (!urls.length) return C.portrait(l, 640, 340);
    var where = l.address_normalized || 'this listing';
    return C.portrait(l, 640, 340) +
      '<span class="gal" data-gal>' + urls.map(function (u, i) {
        return '<img class="gal__shot" src="' + esc(u) + '" loading="' + (i ? 'lazy' : 'eager') + '" decoding="async" alt="Photo ' + (i + 1) + ' of ' + esc(where) + '">';
      }).join('') + '</span>' +
      (urls.length > 1 ? '<span class="gal__n">' + urls.length + ' photos — swipe</span>' : '');
  }

  function ownerLine(l) {
    var o = C.ownerRead(l);
    var name = l.owner_name ? C.titleCase(String(l.owner_name).toLowerCase()) : null;
    var ind = +l.likely_independent_landlord_score || 0;
    var read = name ? name : (l.owner_type === 'llc' ? 'An LLC — human owner unproven' : 'Not named on the post');
    return '<span class="dropcard__owner"><span class="dropcard__ownerlabel">Landlord</span>' +
      '<b>' + esc(read) + '</b>' +
      '<span class="tag ' + o.cls + '">' + o.label + '</span>' +
      '<span class="ometer" title="Private-owner signal, 0–100"><i style="width:' + Math.max(4, Math.min(100, ind)) + '%"></i></span>' +
      '<span class="ometer__n">' + Math.round(ind) + '</span></span>';
  }

  function dropCard(l, i) {
    var st = C.stabilized(l);
    var t = C.nearestStation(l);
    var m = C.moveInMath(l);
    var why = l.why_this_listing || (l.trust_strengths || [])[0] || 'Clears every gate VERA can check from public data.';
    var flaw = (l.trust_caveats || [])[0] || (l.what_to_verify_before_applying || [])[0];
    var addr = addressOf(l);
    var unit = C.unitOf(l) === 'studio' ? 'Studio' : C.unitOf(l) === '1br' ? 'One bedroom' : esc(l.unit_type || 'Apartment');
    var place = window.__VERAG && window.__VERAG.ready() ? window.__VERAG.placeRead(l) : null;
    var hoodLine = esc(l.neighborhood || (place && place.name) || '—');
    if (place && !place.agrees) hoodLine += ' <span class="dropcard__pinwarn">· pin sits in ' + esc(place.name) + '</span>';
    var mini = window.__VERAG && window.__VERAG.ready() ? window.__VERAG.minimap(l, 300, 300) : '';
    var stew = C.stewardOf(l);
    var spatial = C.spatialLine(l);
    var ageMs = l.first_seen_at ? (Date.now() - new Date(l.first_seen_at).getTime()) : null;
    var freshBadge = ageMs != null && ageMs < 24 * 3.6e6
      ? '<span class="dropcard__fresh">' + (ageMs < 3.6e6 ? 'just posted' : Math.round(ageMs / 3.6e6) + 'h fresh') + '</span>' : '';
    return '<article class="dropcard" style="--i:' + i + '">' +
      '<button type="button" class="dropcard__hit" data-open="' + esc(l.listing_uid) + '" aria-label="Open the ledger for ' + esc(addr || C.charName(l)) + '">' +
        '<span class="dropcard__media">' + gallery(l) +
          '<span class="dropcard__rent">' + money(l.rent) + '<small>/mo</small></span>' + freshBadge +
          '<span class="dropcard__no">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span></span>' +
        '<span class="dropcard__body">' +
          '<span class="dropcard__main">' +
            '<span class="dropcard__hood">' + hoodLine + ' · ' + unit + (t ? ' · <span class="nowrap">≈' + t.mins + ' min walk ' + C.lineBullets(t.lines) + ' ' + esc(t.name) + '</span>' : '') + '</span>' +
            '<h3 class="dropcard__name">' + esc(addr || C.charName(l)) + '</h3>' +
            (addr ? '<p class="dropcard__flavor">' + esc(C.charName(l)) + '</p>' : '') +
            ownerLine(l) +
            '<span class="steward steward--' + stew.grade + '">' +
              '<b class="steward__grade">' + stew.grade + '</b>' +
              '<span class="steward__body"><span class="steward__word">Stewardship: ' + esc(stew.word) + (stew.score != null ? ' · ' + stew.score + '/100' : '') + '</span>' +
              (stew.failures.length ? '<span class="steward__line steward__line--bad">' + esc(stew.failures.join('; ')) + '</span>'
                : stew.strengths.length ? '<span class="steward__line steward__line--good">' + esc(stew.strengths.join('; ')) + '</span>'
                : '<span class="steward__line">city record too thin to judge — verify in person</span>') + '</span>' +
            '</span>' +
            '<p class="dropcard__why">' + esc(why) + '</p>' +
            (spatial ? '<p class="dropcard__spatial">' + esc(spatial) + ' · no floor plan published</p>' : '') +
            (flaw ? '<p class="dropcard__flaw">Eyes open: ' + esc(flaw) + '</p>' : '') +
            '<span class="dropcard__chips">' +
              (st ? '<span class="tag ' + st.cls + '">' + st.label + '</span>' : '') +
              '<span class="tag">move-in ≈ ' + money(m.total) + '</span>' +
              '<span class="tag">score ' + num(l.overall_score, 0) + '</span>' +
            '</span>' +
            provenance(l) +
          '</span>' +
          (mini ? '<span class="dropcard__map">' + mini + '</span>' : '') +
        '</span>' +
      '</button></article>';
  }

  function renderToday(page) {
    /* Winners first: fit score plus the steward grade, so a well-kept
       building outranks a slightly-better-priced one an owner lets rot. */
    function dropRank(l) {
      var st = C.stewardOf(l);
      return (+l.overall_score || 0) + (st.score != null ? st.score * 0.4 : 20);
    }
    var fits = POOL.filter(C.isFullFit).sort(function (a, b) { return dropRank(b) - dropRank(a); });
    var drop = fits.slice(0, 8);
    var inDrop = {};
    drop.forEach(function (l) { inDrop[l.listing_uid] = 1; });

    /* the bubble: strongest of what did NOT clear, clearly labelled */
    var bubble = POOL.filter(function (l) {
      if (inDrop[l.listing_uid] || C.isScam(l)) return false;
      var rec = String(l.recommendation || '').toLowerCase();
      return rec === 'pursue cautiously' || rec === 'manual review';
    }).sort(function (a, b) { return (+b.overall_score || 0) - (+a.overall_score || 0); }).slice(0, 4);

    /* the honesty ledger: why the rest didn't make it */
    var reasons = {};
    POOL.forEach(function (l) {
      if (inDrop[l.listing_uid]) return;
      var r = C.whyPassed(l);
      reasons[r] = (reasons[r] || 0) + 1;
    });
    var reasonBits = Object.keys(reasons).sort(function (a, b) { return reasons[b] - reasons[a]; }).slice(0, 4)
      .map(function (r) { return reasons[r] + ' ' + r; }).join(', ');

    var dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    var sm = (D && D.summary) || {};
    var passedCount = POOL.length - drop.length;

    page.innerHTML =
      (usedFallbackPool ? '<p class="notice">Feed is serving the pre-overhaul contract — the drop is limited to curated lanes until tonight\'s publish.</p>' : '') +
      '<header class="drophead">' +
        '<p class="kicker">The drop · sweep ' + timeago(D && D.generated_at) + '</p>' +
        '<h1 class="drophead__title">' + esc(dateStr) + '</h1>' +
        '<p class="drophead__lede">' +
          (drop.length
            ? 'Out of <b>' + POOL.length + '</b> listings across the net, <b>' + drop.length + '</b> clear' + (drop.length === 1 ? 's' : '') + ' every gate — price, papers, building record, and an owner worth talking to.'
            : 'Nothing met the bar today — out of ' + POOL.length + ' swept, none cleared every gate. That is not a bug. The net stays out and tomorrow sweeps again.') +
        '</p>' +
        '<p class="drophead__trust">We passed on ' + passedCount + ': ' + esc(reasonBits || 'nothing else in the net') + '. <a href="#/browse">Every listing is still inspectable ↗</a></p>' +
        '<p class="drophead__next">next sweep <span class="mono" data-countdown>—</span></p>' +
      '</header>' +
      (drop.length ? '<div class="dropgrid">' + drop.map(dropCard).join('') + '</div>'
        : '<div class="dropempty">' +
            '<svg width="86" height="86" viewBox="0 0 24 24" aria-hidden="true" class="dropempty__mark"><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".35"/><path d="M12 12 L12 2.75 A9.25 9.25 0 0 1 20.01 7.38 Z" fill="#4cc38a" opacity=".75"/></svg>' +
            '<h2>An honest empty state</h2>' +
            '<p>VERA does not pad the feed. When the market under ' + money(C.FIT.maxRent) + ' has nothing that clears verification, you see this page instead of eight compromises.</p>' +
            '<p><a class="ghostbtn" href="#/market">See what the market is doing instead ↗</a></p>' +
          '</div>') +
      (bubble.length ?
        '<section class="bubble"><h2 class="bubble__title">On the bubble</h2>' +
        '<p class="bubble__hint">Strong records that failed exactly one gate — usually verification. Worth a look with your eyes open, not your deposit.</p>' +
        '<div class="bubblegrid">' + bubble.map(function (l) {
          var o = C.ownerRead(l);
          return '<button type="button" class="bubcard" data-open="' + esc(l.listing_uid) + '">' +
            '<span class="bubcard__port">' + C.portrait(l, 300, 132) + photoLayer(l) + '</span>' +
            '<span class="bubcard__body"><b>' + esc(C.charName(l)) + '</b>' +
            '<span>' + money(l.rent) + ' · ' + esc(l.neighborhood || '—') + '</span>' +
            '<span class="bubcard__why">' + esc(C.whyPassed(l)) + '</span>' +
            '<span class="tag ' + o.cls + '">' + o.label + '</span></span></button>';
        }).join('') + '</div></section>' : '') +
      '<section class="wire"><div class="wire__card">' +
        '<h2>The wire</h2>' +
        '<p>When a listing clears every gate, VERA emails its operator within the hour — before the browse, before the scroll. The same bar as this page, delivered.</p>' +
        '<p class="wire__fine">One email per listing, ever. No digests of padding, no re-alerts, no urgency theater.</p>' +
      '</div></section>';

    page.classList.add('is-entered');
    startCountdown();
  }

  /* ================================================================
     MARKET — the wide net, honestly framed.
     ================================================================ */

  function renderMarket(page) {
    var f = filtered();
    var rents = f.map(function (l) { return +l.rent; }).filter(function (n) { return n > 0; });
    var privates = f.filter(function (l) { return C.ownerRead(l).label === 'Private'; });
    var scams = f.filter(C.isScam);
    var fresh = f.filter(C.isFresh);
    var sm = (D.summary || {});
    var dc = ((D.daily_changes || {}).counts || {});
    var mk = C.MARKET;

    var histHTML = '';
    if (rents.length) {
      var lo = Math.floor(Math.min.apply(null, rents) / 250) * 250;
      var hi = Math.ceil(Math.max.apply(null, rents) / 250) * 250;
      var buckets = [];
      for (var b = lo; b < hi; b += 250) buckets.push({ lo: b, n: 0 });
      if (!buckets.length) buckets.push({ lo: lo, n: 0 });
      rents.forEach(function (r) { var i = Math.min(buckets.length - 1, Math.floor((r - lo) / 250)); buckets[i].n++; });
      var mxN = Math.max.apply(null, buckets.map(function (x) { return x.n; })) || 1;
      histHTML = '<div class="hist">' + buckets.map(function (x) {
        return '<div class="hist__col"><div class="hist__bar" style="height:' + Math.max(3, (x.n / mxN) * 100) + '%"></div><span class="hist__label">' + (x.lo / 1000).toFixed(1).replace('.0', '') + 'k</span></div>';
      }).join('') + '</div>';
    } else {
      histHTML = '<p class="lane__empty">No listings under this lens — widen a tier.</p>';
    }

    var hoodCounts = {};
    POOL.forEach(function (l) {
      if (state.bracket !== 'all' && C.bracketOf(l.rent) !== state.bracket) return;
      if (state.unit !== 'all' && C.unitOf(l) !== state.unit) return;
      var h = l.neighborhood || 'Unknown';
      (hoodCounts[h] = hoodCounts[h] || { n: 0, rents: [] }).n++;
      if (+l.rent) hoodCounts[h].rents.push(+l.rent);
    });
    var hoodRows = Object.keys(hoodCounts).map(function (h) { return { name: h, n: hoodCounts[h].n, med: median(hoodCounts[h].rents) }; })
      .sort(function (a, b) { return b.n - a.n; }).slice(0, 8);
    var mxH = hoodRows.length ? hoodRows[0].n : 1;

    var trends = (D.run_trends || []).slice(-14);
    var discovered = trends.map(function (t) { return +t.records_discovered || 0; });

    var changes = D.daily_changes || {};
    var feed = [];
    (changes.new_listings || []).slice(0, 5).forEach(function (c) { feed.push({ b: 'new', t: c.title || c.listing_uid, n: money(c.rent), hood: c.neighborhood }); });
    (changes.price_changes || []).slice(0, 4).forEach(function (c) { feed.push({ b: (+c.price_change || 0) < 0 ? 'drop' : 'hike', t: c.title || c.listing_uid, n: money(c.rent), hood: c.neighborhood }); });
    // gone_listings nests its readable fields under change_detail, unlike
    // new_listings — reading them flat rendered a bare uid and no price.
    (changes.gone_listings || []).slice(0, 3).forEach(function (c) {
      var d = c.change_detail || c;
      feed.push({ b: 'gone', t: d.title || c.title || c.listing_uid, n: money(d.last_rent != null ? d.last_rent : d.rent), hood: d.neighborhood || c.neighborhood });
    });

    var ourMedian = rents.length ? median(rents) : null;

    var brTiles = C.BRACKETS.map(function (br) {
      var inBr = POOL.filter(function (l) {
        if (C.bracketOf(l.rent) !== br.id) return false;
        if (state.unit !== 'all' && C.unitOf(l) !== state.unit) return false;
        if (state.areas.length && state.areas.indexOf(C.areaOf(l)) === -1) return false;
        return true;
      });
      var med = median(inBr.map(function (l) { return +l.rent; }).filter(Boolean));
      var priv = inBr.filter(function (l) { return C.ownerRead(l).label === 'Private'; }).length;
      var on = state.bracket === br.id;
      return '<button type="button" class="brtile ' + (on ? 'is-on' : '') + '" data-brtile="' + br.id + '">' +
        '<span class="brtile__label">' + br.label + '</span>' +
        '<span class="brtile__n">' + cval(inBr.length) + '</span>' +
        '<span class="brtile__meta">' + (med ? 'median ' + money(med) : 'no priced listings') + (priv ? ' · ' + priv + ' private' : '') + '</span>' +
      '</button>';
    }).join('');

    /* The city vs the net — real StreetEasy aggregate series, published by
       the engine. Absent until the first post-upgrade publish; degrade to
       the static published-medians line in the lede. */
    var mc = D.market_context || null;
    var mcHTML = '';
    if (mc && mc.series) {
      var mcMonths = mc.months || [];
      function seriesOf(name) { var s = mc.series[name]; return s && s.median_asking_rent ? s.median_asking_rent.filter(function (v) { return v != null; }) : []; }
      function latestOf(name) { var s = mc.series[name]; return s ? s.median_asking_rent_latest : null; }
      var lanes = [['NYC', '#c8a468'], ['Manhattan', '#7ba7d9'], ['Brooklyn', '#4cc38a']];
      var lines = lanes.map(function (ln) {
        var s = seriesOf(ln[0]);
        return s.length ? '<div class="mctx__lane"><span class="mctx__who"><i style="background:' + ln[1] + '"></i>' + ln[0] + ' <b>' + money(latestOf(ln[0])) + '</b></span>' + sparkline(s, 260, 64, ln[1]) + '</div>' : '';
      }).join('');
      var hoodRows2 = Object.keys(mc.series).filter(function (k) {
        return mc.series[k].area_type === 'neighborhood';
      }).map(function (k) {
        var s = mc.series[k];
        var arr = (s.median_asking_rent || []).filter(function (v) { return v != null; });
        var yr = arr.length > 12 ? arr[arr.length - 13] : null;
        var now = s.median_asking_rent_latest;
        var d = yr && now ? Math.round((now - yr) / yr * 1000) / 10 : null;
        return { name: k, now: now, delta: d, inv: s.rental_inventory_latest };
      }).filter(function (r) { return r.now; }).sort(function (a, b) { return a.now - b.now; });
      var oursMed = median(POOL.map(function (l) { return +l.rent; }).filter(Boolean));
      mcHTML =
        '<div class="panel mctx"><div class="panel__head"><h2 class="panel__title">The city vs the net — median ask, 36 months</h2>' +
        '<p class="panel__hint">' + esc((mcMonths[mcMonths.length - 1] || '')) + ' · StreetEasy official data</p></div>' +
        '<div class="mctx__lanes">' + lines +
          (oursMed ? '<div class="mctx__lane mctx__lane--ours"><span class="mctx__who"><i style="background:var(--ink)"></i>VERA\'s net <b>' + money(oursMed) + '</b></span><p class="mctx__note">what we hunt beneath the lines above</p></div>' : '') +
        '</div>' +
        (hoodRows2.length ? '<div class="mctx__hoods">' + hoodRows2.slice(0, 12).map(function (r) {
          var cls = r.delta == null ? '' : r.delta > 0 ? 'is-up' : 'is-down';
          return '<span class="mctx__hood"><b>' + esc(r.name) + '</b> ' + money(r.now) +
            (r.delta != null ? ' <em class="' + cls + '">' + (r.delta > 0 ? '+' : '') + r.delta + '%/yr</em>' : '') + '</span>';
        }).join('') + '</div>' : '') +
        '</div>';
    }

    page.innerHTML =
      '<header class="pagehead"><p class="kicker">The wide net</p>' +
      '<h1 class="pagehead__title">The market, whole</h1>' +
      '<p class="pagehead__lede">Everything VERA is watching under ' + money(C.FIT.maxRent) + ' — not just what cleared. The published market medians sit at ' + money(mk.manhattanMedian) + ' Manhattan / ' + money(mk.brooklynMedian) + ' Brooklyn (' + esc(mk.asOf) + '); this net hunts the floor beneath them.</p></header>' +
      '<div class="kpis">' +
        kpi('In the net', cval(f.length) + '<small>/' + POOL.length + '</small>', 'under current lens', '', 'browse') +
        kpi('New tonight', cval(sm.new_today != null ? sm.new_today : fresh.length), (dc.gone || 0) + ' gone', 'kpi--good', 'fresh') +
        kpi('Median ask', rents.length ? cmoney(ourMedian) : '—', 'vs ' + money(mk.cityMedianAsk) + ' citywide', '') +
        kpi('Price drops', cval(sm.price_drops || dc.price_drop || 0), (sm.price_hikes || dc.price_hike || 0) + ' hikes', (sm.price_drops || dc.price_drop) ? 'kpi--good' : '') +
        kpi('Private landlords', cval(privates.length), 'no broker, no corp', 'kpi--good', 'owner') +
        kpi('Scam wall', cval(scams.length), 'kept out of the drop', scams.length ? 'kpi--bad' : '', 'scam') +
      '</div>' +
      '<div class="brackets">' + brTiles + '</div>' +
      '<div class="grid grid--2">' +
        '<div class="panel chart"><div class="panel__head"><h2 class="panel__title">Sweep pulse — records discovered per run</h2><p class="panel__hint">' + trends.length + ' runs</p></div>' +
          (discovered.length ? sparkline(discovered, 560, 190, '#4cc38a') : '<p class="lane__empty">Trend history arrives with the next publishes.</p>') +
          '<div class="strip srcstrip">' + (D.sources || []).slice(0, 12).map(function (s) {
            var cls = C.srcCls(s.status);
            return '<span class="chip ' + cls + '"><i></i>' + esc(s.source_name || '?') + '</span>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Ask distribution</h2><p class="panel__hint">$250 buckets</p></div>' + histHTML + '</div>' +
      '</div>' +
      '<div class="grid grid--2">' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Neighborhoods</h2><p class="panel__hint">tap to focus</p></div><div class="bars">' +
          hoodRows.map(function (h) {
            return '<button type="button" class="bar ' + (state.hoods.indexOf(h.name) > -1 ? 'is-on' : '') + '" data-hoodbar="' + esc(h.name) + '">' +
              '<span class="bar__name">' + esc(h.name) + '</span>' +
              '<span class="bar__track"><span class="bar__fill" style="width:' + (h.n / mxH) * 100 + '%"></span></span>' +
              '<span class="bar__val">' + h.n + ' · ' + (h.med ? money(h.med) : '—') + '</span></button>';
          }).join('') + '</div></div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Last sweep</h2><p class="panel__hint">' + esc((D.daily_changes || {}).date || '') + '</p></div><div class="feed">' +
          (feed.length ? feed.map(function (x) {
            return '<div class="feed__row"><span class="feed__badge feed__badge--' + x.b + '">' + x.b.toUpperCase() + '</span><span class="feed__what">' + esc(x.t) + (x.hood ? ' · ' + esc(x.hood) : '') + '</span><span class="feed__num">' + x.n + '</span></div>';
          }).join('') : '<p class="lane__empty">A quiet night — nothing new, nothing lost.</p>') +
        '</div></div>' +
      '</div>';

    page.classList.add('is-entered');
    countUps(page);
  }

  function kpi(label, value, note, cls, click) {
    return '<div class="kpi ' + (cls || '') + (click ? ' kpi--click' : '') + '" ' + (click ? 'data-kpi="' + click + '" role="button" tabindex="0"' : '') + '>' +
      '<p class="kpi__label">' + label + '</p><p class="kpi__value">' + value + '</p>' +
      (note ? '<p class="kpi__note">' + note + '</p>' : '') + '</div>';
  }

  /* ================================================================
     BROWSE — the whole table, dense and sortable.
     ================================================================ */

  var COLS = [
    { key: 'overall_score', label: 'Score', render: function (l) { return '<span class="t-score">' + (l.overall_score != null ? num(l.overall_score, 1) : '—') + '</span>'; } },
    { key: 'rent', label: 'Rent', render: function (l) { return money(l.rent); } },
    { key: 'title', label: 'Listing', render: function (l) { return '<span class="t-title">' + esc(l.title || l.address_normalized || '—') + '</span>'; } },
    { key: 'neighborhood', label: 'Hood', render: function (l) { return '<span class="t-dim">' + esc(l.neighborhood || '—') + '</span>'; } },
    { key: 'transit_mins', label: 'Subway', render: function (l) { var t = C.nearestStation(l); return t ? '<span class="t-mono">≈' + t.mins + 'm</span> ' + C.lineBullets(t.lines) : '<span class="t-dim">—</span>'; } },
    { key: 'unit_type', label: 'Unit', render: function (l) { return C.unitOf(l) === 'studio' ? 'Studio' : C.unitOf(l) === '1br' ? '1BR' : esc(l.unit_type || '—'); } },
    { key: 'likely_independent_landlord_score', label: 'Owner', render: function (l) { var o = C.ownerRead(l); return '<span class="tag ' + o.cls + '">' + o.label + '</span>'; } },
    { key: 'rent_stabilized_signal', label: 'Stab.', render: function (l) { var s = C.stabilized(l); return s ? '<span class="tag ' + s.cls + '">' + s.label + '</span>' : '<span class="t-dim">—</span>'; } },
    { key: 'hpd_risk_score', label: 'HPD', render: function (l) { return '<span class="risk ' + C.riskCls(l.hpd_risk_score) + '">' + num(l.hpd_risk_score) + '</span>'; } },
    { key: 'dob_risk_score', label: 'DOB', render: function (l) { return l.dob_risk_score != null ? '<span class="risk ' + C.riskCls(l.dob_risk_score) + '">' + num(l.dob_risk_score) + '</span>' : '<span class="t-dim">—</span>'; } },
    { key: 'listing_confidence_score', label: 'Real?', render: function (l) { var a = C.authenticity(l); return a != null ? '<span class="risk ' + (a >= 65 ? 'risk--lo' : a >= 45 ? 'risk--md' : 'risk--hi') + '">' + num(a) + '</span>' : '<span class="t-dim">—</span>'; } },
    { key: 'last_seen_at', label: 'Seen', render: function (l) { return '<span class="t-mono t-dim">' + timeago(l.last_seen_at) + '</span>'; } },
    { key: 'source_name', label: 'Source', render: function (l) { return '<span class="t-mono t-dim">' + esc(l.source_name || '—') + '</span>'; } },
  ];

  var VIEW_PILLS = [
    ['all', 'Everything'], ['fresh', 'Fresh'], ['owner', 'Owner-direct'],
    ['clean', 'Clean buildings'], ['verify', 'Needs verification'], ['scam', 'Scam wall'],
  ];

  function renderBrowse(page) {
    var f = filtered();
    page.innerHTML =
      '<header class="pagehead"><p class="kicker">Browse</p>' +
      '<h1 class="pagehead__title">Every listing in the net</h1></header>' +
      '<div class="pills">' + VIEW_PILLS.map(function (v) {
        return '<button type="button" data-view="' + v[0] + '" class="' + (state.view === v[0] ? 'is-on' : '') + '">' + v[1] + '</button>';
      }).join('') + '</div>' +
      '<div class="dtoolbar">' +
        '<input type="search" placeholder="Search title, hood, address, source…" value="' + esc(state.q) + '" data-q aria-label="Search listings">' +
        '<span class="dtoolbar__count">' + f.length + ' of ' + POOL.length + '</span>' +
        '<span class="dtoolbar__density">' +
          '<button type="button" data-density="comfortable" class="' + (state.density === 'comfortable' ? 'is-on' : '') + '">Comfortable</button>' +
          '<button type="button" data-density="compact" class="' + (state.density === 'compact' ? 'is-on' : '') + '">Compact</button>' +
        '</span>' +
      '</div>' +
      '<div class="tablewrap"><table class="dt ' + (state.density === 'compact' ? 'is-compact' : '') + '"><thead><tr>' +
        COLS.map(function (c) {
          var on = state.sort.key === c.key;
          return '<th data-sort="' + c.key + '" class="' + (on ? 'is-sort' : '') + '">' + c.label + (on ? ' <span class="dir">' + (state.sort.dir < 0 ? '▼' : '▲') + '</span>' : '') + '</th>';
        }).join('') +
      '</tr></thead><tbody>' +
        (f.length ? f.map(function (l) {
          /* tabindex reaches the row; no role="button" so the table semantics
             survive for screen readers. aria-expanded marks the open row. */
          var openUid = window.__VERAL ? window.__VERAL.openUid() : null;
          return '<tr data-open="' + esc(l.listing_uid) + '" tabindex="0" aria-expanded="' + (openUid === l.listing_uid ? 'true' : 'false') + '" class="' + (openUid === l.listing_uid ? 'is-open' : '') + '">' +
            COLS.map(function (c) { return '<td>' + c.render(l) + '</td>'; }).join('') + '</tr>';
        }).join('') : '<tr><td colspan="' + COLS.length + '" class="dt__empty">Nothing matches this lens. Widen a tier or clear a filter.</td></tr>') +
      '</tbody></table></div>';

    var qEl = $('[data-q]', page);
    qEl.addEventListener('input', function () {
      state.q = qEl.value;
      clearTimeout(qEl._t);
      qEl._t = setTimeout(function () { renderRoute(); var q2 = $('[data-q]'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } }, 160);
    });
  }

  /* ================================================================
     ATLAS — rivers, park, stations, tethers. No tiles, no libraries.
     ================================================================ */

  function renderAtlas(page) {
    var M = C.MAP;
    var f = filtered();
    var geo = f.filter(function (l) { return l.latitude != null && l.longitude != null; });
    // Only plot inside the hunt zone: out-of-zone listings project outside
    // the viewBox and would draw loose on the page (the SVG must not clip
    // its own pin halos).
    var placed = geo.filter(function (l) {
      var la = +l.latitude, ln = +l.longitude;
      return la >= M.B.s && la <= M.B.n && ln >= M.B.w && ln <= M.B.e;
    });
    var outside = geo.length - placed.length;
    var lost = f.length - geo.length;

    /* Real neighborhood polygons (NYC DCP NTA2020) when loaded; the abstract
       two-rivers silhouette stays as the no-geo fallback. */
    var geoLand = window.__VERAG && window.__VERAG.ready() ? window.__VERAG.atlasLand(M.px, M.py, M.B) : null;
    var landPath, bkPath = '', njPath = '', parkPath = '', ntaLabels = '';
    if (geoLand) {
      landPath = geoLand.polys;
      ntaLabels = geoLand.labels;
    } else {
      landPath = '<polygon class="mp-land" points="' + M.poly(M.HUDSON.concat(M.EASTRIVER.slice().reverse())) + '"/>';
      bkPath = '<polygon class="mp-land" points="' + M.poly(M.EASTRIVER.concat([[M.B.n, M.B.e], [M.B.s, M.B.e]])) + '"/>';
      njPath = '<polygon class="mp-land mp-land--far" points="' + M.poly(M.HUDSON.concat([[M.B.n, M.B.w], [M.B.s, M.B.w]])) + '"/>';
      parkPath = '<polygon class="mp-park" points="' + M.poly(M.CENTRAL_PARK) + '"/>';
    }

    var stationDots = C.STATIONS.map(function (s) {
      var first = String(s[1]).split(/\s+/)[0];
      return '<circle class="mp-stn" cx="' + M.px(s[3]).toFixed(1) + '" cy="' + M.py(s[2]).toFixed(1) + '" r="3.4" fill="' + (C.LINE_COLORS[first] || '#666') + '"><title>' + esc(s[0]) + ' · ' + esc(s[1]) + '</title></circle>';
    }).join('');

    var hoodLabels = M.HOOD_PINS.map(function (h) {
      return '<text class="mp-hood" x="' + M.px(h[2]).toFixed(1) + '" y="' + M.py(h[1]).toFixed(1) + '">' + esc(h[0]).toUpperCase() + '</text>';
    }).join('');

    var tethers = '', pins = '';
    placed.forEach(function (l, i) {
      var x = M.px(+l.longitude), y = M.py(+l.latitude);
      var t = C.nearestStation(l);
      if (t) {
        var sx = null, sy = null;
        for (var k = 0; k < C.STATIONS.length; k++) {
          if (C.STATIONS[k][0] === t.name) { sx = M.px(C.STATIONS[k][3]); sy = M.py(C.STATIONS[k][2]); break; }
        }
        if (sx != null) tethers += '<line class="mp-tether" x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + sx.toFixed(1) + '" y2="' + sy.toFixed(1) + '"/>';
      }
      var rec = C.isScam(l) ? 'bad' : C.needsVerify(l) ? 'warn' : 'good';
      var r = 9 + Math.min(11, (+l.overall_score || 0) / 8);
      pins += '<g class="mp-pin mp-pin--' + rec + '" data-open="' + esc(l.listing_uid) + '" tabindex="0" role="button" style="--d:' + (i * 55) + 'ms" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' +
        '<circle class="mp-halo" r="' + (r + 11).toFixed(1) + '"/>' +
        '<circle class="mp-dot" r="' + r.toFixed(1) + '"/>' +
        '<text class="mp-rent" y="4">' + (l.rent ? '$' + Math.round(l.rent / 100) / 10 + 'k' : '?') + '</text>' +
        '<title>' + esc(l.title || 'Listing') + ' · ' + money(l.rent) + (t ? ' · ≈' + t.mins + ' min to ' + esc(t.name) : '') + '</title></g>';
    });

    var sorted = placed.slice().sort(function (a, b) { return (a.transit_mins || 999) - (b.transit_mins || 999); });

    page.innerHTML =
      '<header class="pagehead"><p class="kicker">Atlas</p>' +
      '<h1 class="pagehead__title">The hunt zone</h1></header>' +
      '<div class="maplay">' +
        '<div class="panel mapwrap">' +
          '<div class="panel__head"><h2 class="panel__title">Rivers, trains, and ' + placed.length + ' listings</h2>' +
          '<p class="panel__hint">' + placed.length + ' plotted' +
            (outside ? ' · ' + outside + ' outside the zone' : '') +
            (lost ? ' · ' + lost + ' without coordinates' : '') + '</p></div>' +
          '<svg class="mp" viewBox="0 0 ' + M.VW + ' ' + M.VH + '" role="img" aria-label="Map of listings and subway stations">' +
            '<rect class="mp-water" x="0" y="0" width="' + M.VW + '" height="' + M.VH + '"/>' +
            njPath + bkPath + landPath + parkPath +
            '<g class="mp-stns">' + stationDots + '</g>' +
            '<g class="mp-hoods">' + (geoLand ? ntaLabels : hoodLabels) + '</g>' +
            '<g class="mp-tethers">' + tethers + '</g>' +
            '<g class="mp-pins">' + pins + '</g>' +
          '</svg>' +
          '<div class="mp-key">' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--good"></i>Clears the bar</span>' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--warn"></i>Needs verification</span>' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--bad"></i>Scam wall</span>' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--stn"></i>Subway · tethered to nearest walk</span>' +
          '</div>' +
        '</div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Closest to a train</h2><p class="panel__hint">tap to inspect</p></div>' +
          (sorted.length ? '<div class="walklist">' + sorted.map(function (l) {
            var t = C.nearestStation(l);
            return '<button type="button" class="walkrow" data-open="' + esc(l.listing_uid) + '">' +
              '<span class="walkrow__min">' + (t ? '≈' + t.mins : '—') + '<small>min</small></span>' +
              '<span class="walkrow__body"><b>' + esc(l.title || l.address_normalized || 'Listing') + '</b>' +
              '<span>' + (t ? C.lineBullets(t.lines) + ' ' + esc(t.name) : 'no station within reach') + '</span></span>' +
              '<span class="walkrow__rent">' + money(l.rent) + '</span></button>';
          }).join('') + '</div>' : '<p class="lane__empty">Nothing with coordinates under this lens yet — widen a filter.</p>') +
        '</div>' +
      '</div>';
    page.classList.add('is-entered');
  }

  /* ================================================================
     MY HUNT — the pipeline for one human.
     ================================================================ */

  function renderHunt(page) {
    var uids = Object.keys(cases);
    var byStage = {};
    STAGES.forEach(function (s) { byStage[s.id] = []; });
    uids.forEach(function (u) {
      var c = cases[u];
      if (!byStage[c.stage]) byStage[c.stage] = [];
      byStage[c.stage].push(c);
    });

    var live = uids.filter(function (u) { return cases[u].stage !== 'dead'; });
    var spend = live.reduce(function (a, u) { return a + (+cases[u].rent || 0); }, 0);
    var avg = live.length ? Math.round(spend / live.length) : 0;
    var savedFees = live.reduce(function (a, u) { return a + (+cases[u].rent || 0) * 1.5; }, 0);

    if (!uids.length) {
      page.innerHTML = '<div class="empty-hero">' +
        '<svg width="70" height="70" viewBox="0 0 24 24" aria-hidden="true" class="empty-hero__mark">' +
        '<circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".4"/>' +
        '<path d="M12 12 L12 2.75 A9.25 9.25 0 0 1 20.01 7.38 Z" fill="#4cc38a" opacity=".8"/></svg>' +
        '<h2>Your hunt starts empty. That is fine.</h2>' +
        '<p>Open any listing and hit <b>Save to hunt</b>. VERA will track it from first look to signed lease — reached out, tour booked, seen it, applied — and keep your notes and viewing checklists with it.</p>' +
        '<p class="empty-hero__fine">Everything here lives in this browser only. No account, no server, nothing uploaded.</p>' +
        '<a class="bigbtn" href="#/today">See today\'s drop ↗</a></div>';
      return;
    }

    page.innerHTML =
      '<header class="pagehead"><p class="kicker">My hunt</p>' +
      '<h1 class="pagehead__title">The case file</h1></header>' +
      '<div class="kpis">' +
        '<div class="kpi"><p class="kpi__label">In play</p><p class="kpi__value">' + cval(live.length) + '</p><p class="kpi__note">' + (byStage.dead || []).length + ' passed on</p></div>' +
        '<div class="kpi"><p class="kpi__label">Average ask</p><p class="kpi__value">' + (avg ? cmoney(avg) : '—') + '</p><p class="kpi__note">across your shortlist</p></div>' +
        '<div class="kpi kpi--good"><p class="kpi__label">Broker fees avoided</p><p class="kpi__value">' + (savedFees ? cmoney(Math.round(savedFees)) : '$0') + '</p><p class="kpi__note">if every one had a fee</p></div>' +
        '<div class="kpi"><p class="kpi__label">Furthest stage</p><p class="kpi__value kpi__value--word">' + esc((STAGES.filter(function (s) { return (byStage[s.id] || []).length && s.id !== 'dead'; }).pop() || { label: '—' }).label) + '</p><p class="kpi__note">keep going</p></div>' +
      '</div>' +
      '<div class="board">' + STAGES.map(function (s) {
        var items = byStage[s.id] || [];
        return '<div class="col' + (s.id === 'dead' ? ' col--dead' : '') + '">' +
          '<p class="col__head">' + s.label + ' <b>' + items.length + '</b></p>' +
          '<p class="col__hint">' + s.hint + '</p>' +
          (items.length ? items.map(function (c) {
            var gone = !byUid(c.uid);
            return '<div class="ccard' + (gone ? ' ccard--gone' : '') + '"><button type="button" class="ccard__open" data-open="' + esc(c.uid) + '">' +
              '<b>' + esc(c.title || c.uid) + '</b>' +
              (gone ? '<span class="ccard__gone">No longer listed</span>' : '') +
              '<span>' + (c.rent ? money(c.rent) : '—') + (c.hood ? ' · ' + esc(c.hood) : '') + '</span>' +
              (c.notes ? '<em>“' + esc(c.notes.slice(0, 70)) + (c.notes.length > 70 ? '…' : '') + '”</em>' : '') +
              '</button><div class="ccard__moves">' +
              STAGES.filter(function (x) { return x.id !== c.stage; }).slice(0, 3).map(function (x) {
                return '<button type="button" data-stage="' + x.id + '" data-uid="' + esc(c.uid) + '" title="Move to ' + x.label + '">' + x.label + '</button>';
              }).join('') +
              '<button type="button" class="ccard__drop" data-drop="' + esc(c.uid) + '" title="Remove">×</button>' +
              '</div></div>';
          }).join('') : '<p class="col__empty">—</p>') +
        '</div>';
      }).join('') + '</div>';
    page.classList.add('is-entered');
    countUps(page);
  }

  /* ================================================================
     FIELD MANUAL — money law, scam school, the viewing checklist.
     ================================================================ */

  var toolRent = 2400;
  var toolIncome = 0;

  function renderManual(page) {
    var r = toolRent;
    var deposit = r * C.LAW.depositMaxMonths;
    var total = r + deposit + C.LAW.appFeeMax;
    var need = r * C.LAW.incomeRuleX;
    var guarNeed = r * C.LAW.guarantorRuleX;
    var qualifies = toolIncome >= need;
    var guarantorPath = toolIncome > 0 && !qualifies;

    page.innerHTML =
      '<header class="pagehead"><p class="kicker">Field manual</p>' +
      '<h1 class="pagehead__title">Know more than the other side</h1>' +
      '<p class="pagehead__lede">New York rent law hands tenants hard numbers. Scammers hand them scripts. Both are learnable in one sitting.</p></header>' +

      '<div class="grid grid--2">' +
        '<div class="panel tool"><div class="panel__head"><h2 class="panel__title">What it really costs to move in</h2><p class="panel__hint">NY law, not vibes</p></div>' +
          '<label class="slider"><span>Monthly rent <b data-tool-rent-label>' + money(r) + '</b></span>' +
          '<input type="range" min="1200" max="3000" step="50" value="' + r + '" data-tool-rent></label>' +
          '<div class="ledger">' +
            '<div class="ledger__row"><span>First month</span><b data-tr-first>' + money(r) + '</b></div>' +
            '<div class="ledger__row"><span>Security <em>1 month max, by law</em></span><b data-tr-dep>' + money(deposit) + '</b></div>' +
            '<div class="ledger__row"><span>Application <em>$20 max, by law</em></span><b>$' + C.LAW.appFeeMax + '</b></div>' +
            '<div class="ledger__row ledger__row--zero"><span>Broker fee <em>owner-direct</em></span><b>$0</b></div>' +
            '<div class="ledger__row ledger__row--total"><span>Total to keys</span><b data-tr-total>' + money(total) + '</b></div>' +
          '</div>' +
          '<p class="insp-fine">Since the FARE Act (' + C.LAW.fareActFrom + ', upheld on appeal July 2026) whoever hires the broker pays the broker. Watch the workaround: a first month priced above every later month is a fee wearing a disguise.</p>' +
        '</div>' +
        '<div class="panel tool"><div class="panel__head"><h2 class="panel__title">Will the paperwork clear you</h2><p class="panel__hint">the 40× convention</p></div>' +
          '<label class="slider"><span>Your annual income <b data-tool-inc-label>' + (toolIncome ? money(toolIncome) : 'drag me') + '</b></span>' +
          '<input type="range" min="0" max="200000" step="5000" value="' + toolIncome + '" data-tool-income></label>' +
          '<div data-tool-verdict>' +
            (toolIncome === 0 ? '<p class="insp-fine">Set your income and VERA does the landlord math landlords do.</p>'
              : qualifies ? '<p class="verdict verdict--good">Clears the 40× bar for ' + money(r) + ' — you can walk in without a guarantor.</p>'
              : '<p class="verdict verdict--warn">Short of the 40× bar (' + money(need) + ' needed). A guarantor showing ' + money(guarNeed) + ', or an institutional guarantor for roughly ' + money(Math.round(r * C.LAW.guarantorTypicalPct)) + ' once, closes the gap.</p>') +
          '</div>' +
          '<p class="insp-fine">Income multiples are convention, not law — private landlords bend them, corporate portfolios never do. Which is one more reason VERA hunts private.</p>' +
        '</div>' +
      '</div>' +

      '<section class="manual-sec"><h2 class="manual-sec__title">Scam school</h2>' +
      '<p class="manual-sec__lede">Sixteen tells, learned from other people\'s worst weeks. Flip through them once and the scripts stop working on you.</p>' +
      '<div class="telldeck">' + C.TELLS.map(function (t, i) {
        return '<button type="button" class="tell" data-tell="' + i + '" aria-expanded="false"><b>' + esc(t.t) + '</b><span class="tell__body" hidden>' + esc(t.d) + '</span></button>';
      }).join('') + '</div></section>' +

      '<section class="manual-sec"><h2 class="manual-sec__title">The viewing checklist</h2>' +
      '<p class="manual-sec__lede">' + C.CHECKS.length + ' things to check standing in the apartment. Save a listing to your hunt and this list becomes tickable, per listing, remembered.</p>' +
      C.checkGroups().map(function (g) {
        return '<div class="cgroup"><h3>' + esc(g) + '</h3><ul>' + C.CHECKS.filter(function (x) { return x.group === g; }).map(function (x) {
          return '<li><b>' + esc(x.label) + '</b><em>' + esc(x.why) + '</em></li>';
        }).join('') + '</ul></div>';
      }).join('') + '</section>' +

      '<section class="manual-sec"><h2 class="manual-sec__title">Verify it yourself</h2>' +
      '<p class="manual-sec__lede">The chain of proof runs deed → registration → licence → portfolio. Every link is public and free.</p>' +
      '<div class="vtools">' + C.VERIFY_TOOLS.map(function (v) {
        return '<a class="vtool" href="' + v[1] + '" target="_blank" rel="noopener noreferrer"><b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>';
      }).join('') + '</div></section>';

    page.classList.add('is-entered');

    /* Sliders update in place on input — a re-render mid-drag destroys the
       input under the pointer and turns the drag into one step per press. */
    var rentEl = $('[data-tool-rent]', page);
    rentEl.addEventListener('input', function () {
      toolRent = +rentEl.value;
      $('[data-tool-rent-label]').textContent = money(toolRent);
      $('[data-tr-first]').textContent = money(toolRent);
      $('[data-tr-dep]').textContent = money(toolRent * C.LAW.depositMaxMonths);
      $('[data-tr-total]').textContent = money(toolRent + toolRent * C.LAW.depositMaxMonths + C.LAW.appFeeMax);
    });
    rentEl.addEventListener('change', function () { renderRoute(); });
    var incEl = $('[data-tool-income]', page);
    incEl.addEventListener('input', function () {
      toolIncome = +incEl.value;
      $('[data-tool-inc-label]').textContent = toolIncome ? money(toolIncome) : 'drag me';
    });
    incEl.addEventListener('change', function () { renderRoute(); });
  }

  /* ================================================================
     SYSTEM — the machine, its sources, and its ethics.
     ================================================================ */

  function renderSystem(page) {
    var order = ['discover', 'normalize', 'dedupe', 'enrich', 'score', 'publish'];
    var stages = D.stages || {};
    var trends = (D.run_trends || []).slice(-14);
    var rel = trends.map(function (t) { return +t.avg_reliability || 0; });
    var srcs = D.sources || [];
    var run = D.run || {};

    page.innerHTML =
      '<header class="pagehead"><p class="kicker">System</p>' +
      '<h1 class="pagehead__title">The machine behind the drop</h1>' +
      '<p class="pagehead__lede">VERA sweeps nightly, reads public records, scores what it finds, and publishes this sanitized public lens. It never contacts landlords, never files anything, never pretends a gap is a fact.</p></header>' +
      '<div class="stages">' + order.map(function (name) {
        var st = stages[name] || {};
        var cls = st.status === 'success' ? 'is-ok' : st.status === 'running' ? 'is-run' : st.status ? 'is-bad' : '';
        return '<div class="stage ' + cls + '"><p class="stage__name"><i></i>' + name + '</p>' +
          '<p class="stage__nums">' + (st.records_out != null ? st.records_out : '—') + ' <small>out · ' + (st.records_in != null ? st.records_in : '—') + ' in</small></p></div>';
      }).join('') + '</div>' +
      '<div class="grid grid--2">' +
        '<div class="panel chart"><div class="panel__head"><h2 class="panel__title">Source reliability</h2><p class="panel__hint">avg per run</p></div>' +
          (rel.length ? sparkline(rel, 560, 170, '#c8a468') : '<p class="lane__empty">History arrives with the next publishes.</p>') + '</div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Run</h2><p class="panel__hint">' + esc(run.run_id || '') + '</p></div>' +
          '<dl class="kv">' +
            '<dt>Generated</dt><dd>' + esc(D.generated_at || '—') + '</dd>' +
            '<dt>Cadence</dt><dd>' + esc(run.cadence || 'nightly') + '</dd>' +
            '<dt>Pool</dt><dd>' + POOL.length + ' listings</dd>' +
            '<dt>Lens</dt><dd>public — contacts, notes, and drafts stripped at source</dd>' +
          '</dl></div>' +
      '</div>' +
      '<div class="panel"><div class="panel__head"><h2 class="panel__title">Sources</h2><p class="panel__hint">' + srcs.length + ' configured</p></div>' +
        '<div class="srcgrid">' + srcs.map(function (s) {
          return '<div class="src ' + C.srcCls(s.status) + '"><i></i><b>' + esc(s.source_name || '?') + '</b>' +
            '<span>' + esc(String(s.status || '—')) + (s.record_count != null ? ' · ' + s.record_count : '') + '</span></div>';
        }).join('') + '</div></div>' +
      '<section class="ethos"><h2>What VERA is</h2>' +
        '<p>Verified Evaluation for Rental Analysis — a personal apartment-search engine for one hunt: privately-owned rentals, under ' + money(C.FIT.maxRent) + ', in the neighborhoods that fit one life. It watches the fragmented channels where small landlords actually post, joins every listing to the city\'s own records, and refuses to show what it cannot stand behind.</p>' +
        '<p>Read-only by principle: VERA never messages a landlord, never floods an inbox, never squats a viewing slot. It makes one human faster, not the market worse.</p>' +
        '<p class="ethos__credit">A <a href="https://littlefightnyc.com/" rel="noopener">Little Fight NYC</a> system · <a href="/vera/brand/">brand</a> · <a href="/vera/terms/">terms</a> · <a href="/vera/privacy/">privacy</a></p>' +
      '</section>';
    page.classList.add('is-entered');
  }

  /* ---------- router ---------- */

  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '') || 'today';
    h = h.split('?')[0];
    if (LEGACY[h]) h = LEGACY[h];
    if (ROUTES.indexOf(h) === -1) h = 'today';
    state.route = h;
    $$('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === h;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    renderFilters();
    renderRoute();
    var main = $('#main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  function renderRoute() {
    if (!D) return;
    var page = $('#main [data-page]');
    if (!page) return;
    clearInterval(countdownT);
    page.setAttribute('data-page', state.route);
    page.className = 'page';
    if (state.route === 'today') renderToday(page);
    else if (state.route === 'market') renderMarket(page);
    else if (state.route === 'browse') renderBrowse(page);
    else if (state.route === 'atlas') renderAtlas(page);
    else if (state.route === 'hunt') renderHunt(page);
    else if (state.route === 'manual') renderManual(page);
    else renderSystem(page);
  }

  /* ---------- one delegated click handler ---------- */

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-open],[data-bracket],[data-brtile],[data-unit],[data-transit],[data-lens],[data-view],[data-area],[data-hoodbar],[data-kpi],[data-clear],[data-density],[data-sort],[data-stage],[data-drop],[data-tell],[data-insp-close],[data-scrim],[data-tab]') : null;
    if (!t) return;

    if (t.hasAttribute('data-open')) { if (window.__VERAL) window.__VERAL.open(t.getAttribute('data-open')); return; }
    if (t.hasAttribute('data-insp-close') || t.hasAttribute('data-scrim')) { if (window.__VERAL) window.__VERAL.close(); return; }
    if (t.hasAttribute('data-tab')) { if (window.__VERAL) window.__VERAL.setTab(t.getAttribute('data-tab')); return; }
    if (t.hasAttribute('data-stage')) { setStage(t.getAttribute('data-uid'), t.getAttribute('data-stage')); if (window.__VERAL && window.__VERAL.openUid()) window.__VERAL.rerender(); else renderRoute(); return; }
    if (t.hasAttribute('data-drop')) { dropCase(t.getAttribute('data-drop')); renderRoute(); return; }
    if (t.hasAttribute('data-tell')) {
      var body = t.querySelector('.tell__body');
      var open = t.getAttribute('aria-expanded') === 'true';
      t.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (body) body.hidden = open;
      t.classList.toggle('is-open', !open);
      return;
    }
    if (t.hasAttribute('data-bracket')) { state.bracket = t.getAttribute('data-bracket'); refresh(); return; }
    if (t.hasAttribute('data-brtile')) { var id = t.getAttribute('data-brtile'); state.bracket = state.bracket === id ? 'all' : id; refresh(); return; }
    if (t.hasAttribute('data-unit')) { state.unit = t.getAttribute('data-unit'); refresh(); return; }
    if (t.hasAttribute('data-transit')) { var v = +t.getAttribute('data-transit'); state.transit = state.transit === v ? 0 : v; refresh(); return; }
    if (t.hasAttribute('data-lens')) { var k = t.getAttribute('data-lens'); state.lens[k] = !state.lens[k]; refresh(); return; }
    if (t.hasAttribute('data-view')) { state.view = t.getAttribute('data-view'); refresh(); return; }
    if (t.hasAttribute('data-area')) {
      var a = t.getAttribute('data-area');
      var i = state.areas.indexOf(a);
      if (i > -1) state.areas.splice(i, 1); else state.areas.push(a);
      refresh(); return;
    }
    if (t.hasAttribute('data-hoodbar')) {
      var hd = t.getAttribute('data-hoodbar');
      var j = state.hoods.indexOf(hd);
      if (j > -1) state.hoods.splice(j, 1); else state.hoods.push(hd);
      refresh(); return;
    }
    if (t.hasAttribute('data-kpi')) {
      var view = t.getAttribute('data-kpi');
      if (view === 'browse') { location.hash = '#/browse'; return; }
      state.view = view;
      location.hash = '#/browse';
      return;
    }
    if (t.hasAttribute('data-clear')) {
      state.bracket = 'all'; state.unit = 'all'; state.hoods = []; state.areas = []; state.transit = 0;
      state.lens = { noBrokers: false, noMgmt: false, privateFirst: false }; state.view = 'all'; state.q = '';
      refresh(); return;
    }
    if (t.hasAttribute('data-density')) { state.density = t.getAttribute('data-density'); refresh(); return; }
    if (t.hasAttribute('data-sort')) {
      var key = t.getAttribute('data-sort');
      if (state.sort.key === key) state.sort.dir = -state.sort.dir;
      else state.sort = { key: key, dir: -1 };
      renderRoute(); return;
    }
  });

  /* keyboard: rows + kpis act on Enter/Space; Escape closes the ledger */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && window.__VERAL && window.__VERAL.openUid()) { window.__VERAL.close(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && (e.target.hasAttribute('data-open') || e.target.hasAttribute('data-kpi'))) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* checklist + notes (inside the ledger) */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-check')) {
      var uid = t.getAttribute('data-uid');
      var c = caseOf(uid);
      if (c) {
        c.checks = c.checks || {};
        c.checks[t.getAttribute('data-check')] = t.checked;
        saveCases();
        if (window.__VERAL) window.__VERAL.rerender();
      }
    }
  });
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-note')) {
      var c = caseOf(t.getAttribute('data-note'));
      if (c) { c.notes = t.value; clearTimeout(t._t); t._t = setTimeout(saveCases, 400); }
    }
  });

  /* Route changes ride the View Transitions API where it exists — the
     buttery cross-fade costs nothing and respects reduced motion. */
  function routeSmooth() {
    if (!RM && document.startViewTransition) document.startViewTransition(function () { route(); });
    else route();
  }
  window.addEventListener('hashchange', routeSmooth);

  /* Minimaps and place-truth arrive when the neighborhood polygons land. */
  document.addEventListener('vera:geo', function () { if (D) renderRoute(); });

  /* ---------- boot ---------- */

  function adopt(data) {
    D = data;
    if (Array.isArray(D.pool) && D.pool.length) {
      POOL = D.pool.slice();
    } else {
      usedFallbackPool = true;
      var seen = {};
      POOL = [];
      (D.shortlist || []).concat(D.manual_review || []).forEach(function (l) {
        if (l && l.listing_uid && !seen[l.listing_uid]) { seen[l.listing_uid] = 1; POOL.push(l); }
      });
    }
    POOL.forEach(function (l) {
      if (l && l.title) { l.title_raw = l.title; l.title = tidyTitle(l.title); }
    });
    POOL.forEach(function (l) {
      var t = C.nearestStation(l);
      l.transit_mins = t ? t.mins : 9999;
    });
    var hc = {};
    POOL.forEach(function (l) { var h = l.neighborhood || 'Unknown'; hc[h] = (hc[h] || 0) + 1; });
    HOODS = Object.keys(hc).map(function (h) { return { name: h, count: hc[h] }; }).sort(function (a, b) { return b.count - a.count; });
    state.hoods = state.hoods.filter(function (h) { return hc[h]; });

    var loader = $('[data-loading]');
    if (loader) loader.remove();
    renderChrome();
    renderFilters();
    saveCases();
    route();
    if (TESTMODE && window.__VERAT) window.__VERAT.run();
  }

  function boot(i) {
    i = i || 0;
    if (i >= FEEDS.length) {
      var out = $('[data-loading]');
      if (out) out.innerHTML = '<p>Could not reach the VERA feed. It publishes nightly — try again shortly.</p>';
      return;
    }
    fetch(FEEDS[i], { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        // A render error is not a feed error: catching them together used to
        // refetch the fallback origin and re-run the same broken render.
        try {
          adopt(data);
        } catch (err) {
          if (window.console && console.error) console.error('VERA could not render the feed', err);
          var box = $('[data-loading]');
          if (box) box.innerHTML = '<p>VERA reached the feed but could not draw it. Reload to try again.</p>';
        }
      }, function () {
        boot(i + 1);
      });
  }

  window.__VERA_APP = {
    state: state, POOL: function () { return POOL; }, D: function () { return D; },
    byUid: byUid, caseOf: caseOf, setStage: setStage, dropCase: dropCase, saveCases: saveCases,
    cases: function () { return cases; }, STAGES: STAGES, toast: toast, photoLayer: photoLayer,
    filtered: filtered, renderRoute: renderRoute, tidyTitle: tidyTitle, route: route,
    addressOf: addressOf, gallery: gallery,
  };

  window.__vera = {
    state: state,
    pool: function () { return POOL; },
    filtered: filtered,
    open: function (uid) { if (window.__VERAL) window.__VERAL.open(uid); },
    info: function () {
      return {
        loaded: !!D, pool: POOL.length, filtered: filtered().length, hoods: HOODS.length,
        route: state.route, view: state.view, fallbackPool: usedFallbackPool,
        generated: D && D.generated_at,
      };
    },
  };

  boot();
})();
