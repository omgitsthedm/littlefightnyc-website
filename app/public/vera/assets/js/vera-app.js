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

  /* One first-party contract: visitors fetch VERA only through Little Fight.
     Netlify resolves this path to the sanitized nightly cloud publication;
     the private engine and its publication origin never enter browser code. */
  var FEEDS = [
    { url: './data/public.json', label: 'site' },
  ];
  var FEED_SOFT_TIMEOUT_MS = 3500;
  /* The public drop is roughly 1.7 MB. Twelve seconds is a useful status
     checkpoint, not a valid reason to kill a slow but healthy mobile request.
     A 45-second per-attempt ceiling catches truly stalled connections; two
     short, bounded retries cover temporary edge/origin revalidation failures. */
  var FEED_ATTEMPT_TIMEOUT_MS = 45000;
  var FEED_RETRY_DELAYS_MS = [750, 2250];
  var FEED_MAX_RETRY_AFTER_MS = 10000;
  var ARCHIVE_TIMEOUT_MS = 12000;
  var TESTMODE = /(^|[?&])test=1/.test(location.search);
  var ADDRESS_CHECK_TIMEOUT_MS = TESTMODE ? 250 : 9000;
  /* Today, Browse, Atlas, and My Hunt are the primary workspaces on every
     device. Context, receipts, and operating detail sit one level deeper. */
  var NAV_SECONDARY = ['market', 'manual', 'archive', 'system'];
  var RM_QUERY = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var FILTER_SHEET_QUERY = window.matchMedia ? window.matchMedia('(max-width: 760px)') : null;
  var RM = !!(RM_QUERY && RM_QUERY.matches);
  if (RM_QUERY) {
    var onMotionPreference = function (event) {
      RM = !!event.matches;
      document.documentElement.classList.toggle('vera-reduced-motion', RM);
    };
    if (RM_QUERY.addEventListener) RM_QUERY.addEventListener('change', onMotionPreference);
    else if (RM_QUERY.addListener) RM_QUERY.addListener(onMotionPreference);
  }
  document.documentElement.classList.toggle('vera-reduced-motion', RM);
  if (FILTER_SHEET_QUERY) {
    var onFilterLayout = function () { if (D) renderFilters(); };
    if (FILTER_SHEET_QUERY.addEventListener) FILTER_SHEET_QUERY.addEventListener('change', onFilterLayout);
    else if (FILTER_SHEET_QUERY.addListener) FILTER_SHEET_QUERY.addListener(onFilterLayout);
  }

  /* The public acceptance harness deliberately exercises every workspace
     control. In test mode it must start empty and stay memory-only so a
     curious visitor cannot lose a real Hunt, address, anchor, or profile. */
  function localRead(key) {
    if (TESTMODE) return null;
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function localWrite(key, value) {
    if (TESTMODE) return;
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  var VERA_STORAGE_PREFIX = 'vera-';

  function eraseVeraWorkspace() {
    if (TESTMODE) return;
    try {
      /* VERA owns this namespaced storage only. Reverse iteration stays safe
         while entries are removed and leaves every non-VERA site key alone. */
      for (var i = localStorage.length - 1; i >= 0; i--) {
        var key = localStorage.key(i);
        if (key && key.indexOf(VERA_STORAGE_PREFIX) === 0) localStorage.removeItem(key);
      }
    } catch (e) {}
  }

  function trustedURL(value, kind) { return C.trustedURL ? C.trustedURL(value, kind) : null; }

  /* Public feeds sometimes carry coordinates as numeric strings. Accept those
     without letting null, blank, boolean, or object values collapse to 0,0. */
  function coordinateNumber(value) {
    if (value == null) return null;
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    if (typeof value === 'string' && !value.trim()) return null;
    var number = +value;
    return isFinite(number) ? number : null;
  }

  function hasValidLngLat(listing) {
    if (!listing) return false;
    var lat = coordinateNumber(listing.latitude), lng = coordinateNumber(listing.longitude);
    return lat != null && lng != null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  var D = null;
  var POOL = [];
  var HOODS = [];
  var usedFallbackPool = false;

  var ROUTES = ['today', 'market', 'browse', 'atlas', 'hunt', 'manual', 'archive', 'system'];
  var LEGACY = { command: 'market', discover: 'browse', map: 'atlas', cases: 'hunt', toolkit: 'manual', pipeline: 'system', about: 'system' };
  var DATA_ROUTES = { market: 1, browse: 1, atlas: 1 };

  var state = {
    bracket: 'all', unit: 'all', hoods: [], areas: [], transit: 0,
    lens: { noBrokers: false, noMgmt: false, privateFirst: false },
    view: 'all', q: '', sort: { key: 'overall_score', dir: -1 }, density: 'comfortable', route: 'today',
    huntSelected: '', filtersOpen: false, atlasMode: 'map',
  };

  try {
    var saved = JSON.parse(localRead('vera-workspace') || 'null');
    if (saved) { ['bracket', 'unit', 'hoods', 'areas', 'transit', 'lens', 'view', 'density', 'atlasMode'].forEach(function (k) { if (saved[k] !== undefined) state[k] = saved[k]; }); }
  } catch (e) {}

  function persist() {
    localWrite('vera-workspace', JSON.stringify({ bracket: state.bracket, unit: state.unit, hoods: state.hoods, areas: state.areas, transit: state.transit, lens: state.lens, view: state.view, density: state.density, atlasMode: state.atlasMode }));
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

  /* ---------- metrics ----------
     A work surface should never make the user wait for a number it already
     knows. Metrics render at their final value; motion is reserved for state
     changes that explain where something went. */

  function settleCounters(root) {
    $$('[data-count-to]', root).forEach(function (el) { el.textContent = el.getAttribute('data-count-final'); });
  }

  /* The counters render "0" and tick up to the real figure once the page
     paints — the number earns its own weight instead of teleporting in.
     Reduced motion (or no rAF) keeps the old jump-straight-to-final path. */
  function countUps(root) {
    var els = $$('[data-count-to]', root);
    if (!els.length) return;
    if (RM || !window.requestAnimationFrame) { settleCounters(root); return; }
    els.forEach(function (el) {
      var to = +el.getAttribute('data-count-to') || 0;
      var from = +(el.getAttribute('data-count-from') || 0);
      var prefix = el.getAttribute('data-count-prefix') || '';
      var finalText = el.getAttribute('data-count-final') || '';
      if (!to) { el.textContent = finalText; return; }
      var commas = finalText.indexOf(',') > -1;
      var t0 = null;
      var step = function (now) {
        if (t0 == null) t0 = now;
        var t = Math.min(1, (now - t0) / 720);
        var e = 1 - Math.pow(1 - t, 3);
        if (t >= 1) { el.textContent = finalText; return; }
        var v = Math.round(from + e * (to - from));
        el.textContent = prefix + (commas ? v.toLocaleString('en-US') : String(v));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // data-count-final is what the reduced-motion path reads; without it every
  // counter rendered blank instead of jumping straight to its value.
  function cval(n) { var v = +n || 0; return '<span data-count-to="' + v + '" data-count-final="' + v + '">0</span>'; }
  function cmoney(m) { return m == null ? '—' : '<span data-count-to="' + Math.round(m) + '" data-count-prefix="$" data-count-final="' + money(m) + '">$0</span>'; }

  /* The overall score as an instrument, not a tag: the ring sweeps to the
     real value on insertion (vera-ringdraw starts from --ring-c), the number
     stays real text. The span carries the accessible score; svg is paint. */
  function scoreRing(score) {
    if (score == null) return '';
    var v = Math.max(0, Math.min(100, +score));
    var c = +(2 * Math.PI * 15).toFixed(1);
    var off = +(c * (1 - v / 100)).toFixed(1);
    return '<span class="scorering" role="img" aria-label="VERA score ' + Math.round(v) + ' out of 100" style="--ring-c:' + c + '">' +
      '<svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
      '<circle class="scorering__track" cx="18" cy="18" r="15"/>' +
      '<circle class="scorering__arc" cx="18" cy="18" r="15" stroke-dasharray="' + c + '" stroke-dashoffset="' + off + '" transform="rotate(-90 18 18)"/>' +
      '</svg><b aria-hidden="true">' + Math.round(v) + '</b></span>';
  }

  /* ---------- photos over portraits ---------- */

  function photoOf(l) {
    var urls = l && l.image_urls;
    if (!urls || !urls.length) return null;
    for (var i = 0; i < urls.length; i++) {
      var safe = trustedURL(urls[i], 'image');
      if (safe) return safe;
    }
    return null;
  }

  function photoLayer(l) {
    var src = photoOf(l);
    if (!src) return '';
    var n = (l.image_urls || []).map(function (url) { return trustedURL(url, 'image'); }).filter(Boolean).length;
    var where = l.title || l.address_normalized || 'this listing';
    return '<img class="shot" src="' + esc(src) + '" width="640" height="400" loading="lazy" decoding="async" referrerpolicy="no-referrer" ' +
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
      return;
    }
    if (t && t.tagName === 'IMG' && t.classList.contains('gal__shot')) {
      var slide = t.closest('[data-gal-shot]');
      var galleryRoot = slide && slide.closest('[data-gal]');
      if (!slide || !galleryRoot) return;
      slide.remove();
      var remaining = $$('[data-gal-shot]', galleryRoot);
      remaining.forEach(function (item, index) {
        item.setAttribute('data-gal-shot', index);
        item.setAttribute('aria-label', 'Open photo ' + (index + 1) + ' of ' + remaining.length + ' for ' + (galleryRoot.getAttribute('data-gal-where') || 'this listing') + ' full screen');
      });
      galleryRoot.setAttribute('data-gal-count', remaining.length);
      galleryRoot.setAttribute('aria-label', 'Photo gallery for ' + (galleryRoot.getAttribute('data-gal-where') || 'this listing') + ', ' + remaining.length + ' photo' + (remaining.length === 1 ? '' : 's') + '. Use the left and right arrow keys or the previous and next buttons to move; open a photo to view it full screen.');
      var host = galleryRoot.parentNode;
      var status = host && $('[data-gal-status]', host);
      var dots = host && $('.gal__dots', host);
      if (dots) dots.innerHTML = remaining.map(function (_, index) { return '<span class="gal__dot' + (index === 0 ? ' is-on' : '') + '"></span>'; }).join('');
      if (status) status.textContent = remaining.length ? 'Photo 1 of ' + remaining.length + ' · use arrow keys' : 'Listing photos could not be loaded.';
      if (remaining.length < 2 && host) {
        $$('.gal__btn,.gal__dots,[data-gal-status]', host).forEach(function (control) { control.remove(); });
      }
      if (!remaining.length) galleryRoot.remove();
      return;
    }
    if (t && t.tagName === 'IMG' && t.hasAttribute('data-lb-img') && lbIsOpen()) {
      if (lb.urls.length > 1) {
        lb.urls.splice(lb.idx, 1);
        lb.idx = Math.min(lb.idx, lb.urls.length - 1);
        lbRender();
      } else {
        closeLightbox();
        toast('That listing photo could not be loaded.');
      }
    }
  }, true);

  /* ---------- the hunt (cases, localStorage only) ---------- */

  var STAGES = [
    { id: 'saved', label: 'Saved', hint: 'worth a look' },
    { id: 'contacted', label: 'Reached out', hint: 'message sent' },
    { id: 'touring', label: 'Tour booked', hint: 'going to see it' },
    { id: 'toured', label: 'Seen it', hint: 'walked the unit' },
    { id: 'applied', label: 'Applied', hint: 'paperwork in' },
    { id: 'signed', label: 'Signed', hint: 'lease in hand' },
    { id: 'dead', label: 'Passed', hint: 'not the one' },
  ];

  var cases = {};
  try { cases = JSON.parse(localRead('vera-cases') || '{}') || {}; } catch (e) { cases = {}; }
  var eraseNotice = '';

  function saveCases() {
    localWrite('vera-cases', JSON.stringify(cases));
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
    /* the second half of tenant law starts at the signature */
    if (stage === 'signed' && !cases[uid].signedAt) {
      cases[uid].signedAt = new Date().toISOString().slice(0, 10);
    }
    saveCases();
    toast(stage === 'dead' ? 'Passed — VERA will stop suggesting it.' : 'Moved to ' + (STAGES.filter(function (s) { return s.id === stage; })[0] || {}).label);
  }

  function dropCase(uid) { delete cases[uid]; saveCases(); toast('Removed from your hunt.'); }

  function confirmEraseVeraWorkspace() {
    eraseVeraWorkspace();
    cases = {};
    addressResolutions = {};
    pendingAddressCandidates = {};
    replacingAddress = {};
    anchors = [];
    profile = {};
    toolIncome = 0;
    archiveCache = null;
    sinceLastVisit = null;
    state.bracket = 'all'; state.unit = 'all'; state.hoods = []; state.areas = []; state.transit = 0;
    state.lens = { noBrokers: false, noMgmt: false, privateFirst: false }; state.view = 'all'; state.q = '';
    state.density = 'comfortable'; state.huntSelected = ''; state.atlasMode = 'map';
    eraseNotice = 'Your VERA workspace was erased from this browser. The public feed remains available.';
    renderRoute();
    requestAnimationFrame(function () {
      var status = $('[data-erase-vera-status]');
      if (status) status.focus();
    });
  }

  /* ---------- exact-address handoff (localStorage only) ---------- */

  var addressResolutions = {};
  var pendingAddressCandidates = {};
  var replacingAddress = {};
  try { addressResolutions = JSON.parse(localRead('vera-address-resolutions-v1') || '{}') || {}; } catch (e) { addressResolutions = {}; }

  function saveAddressResolutions() {
    localWrite('vera-address-resolutions-v1', JSON.stringify(addressResolutions));
  }

  function addressResolutionOf(uid) { return addressResolutions[uid] || null; }

  function zolaUrl(bbl) {
    var digits = String(bbl || '').replace(/\D/g, '');
    if (digits.length !== 10) return null;
    return trustedURL('https://zola.planning.nyc.gov/l/lot/' + (+digits.slice(0, 1)) + '/' + (+digits.slice(1, 6)) + '/' + (+digits.slice(6)), 'citation');
  }

  function addressResolutionMarkup(l) {
    var uid = l && l.listing_uid;
    var saved = addressResolutionOf(uid);
    if (!saved) return '';
    var links = [];
    var lotUrl = zolaUrl(saved.bbl);
    if (lotUrl) links.push('<a href="' + lotUrl + '" target="_blank" rel="noopener noreferrer">Open the official ZoLa lot ↗</a>');
    var dobUrl = saved.bin ? trustedURL('https://a810-bisweb.nyc.gov/bisweb/PropertyProfileOverviewServlet?bin=' + encodeURIComponent(String(saved.bin)), 'citation') : null;
    if (dobUrl) links.push('<a href="' + esc(dobUrl) + '" target="_blank" rel="noopener noreferrer">Open the DOB building record ↗</a>');
    return '<div class="address-proof" data-address-proof tabindex="-1">' +
      '<p class="address-proof__eyebrow">Resolved from the address you supplied</p>' +
      '<h4>' + esc(saved.label) + '</h4>' +
      '<dl class="kv">' +
        (saved.bbl ? '<dt>BBL</dt><dd>' + esc(saved.bbl) + '</dd>' : '') +
        (saved.bin ? '<dt>BIN</dt><dd>' + esc(saved.bin) + '</dd>' : '') +
        '<dt>Match</dt><dd>' + Math.round((+saved.confidence || 0) * 100) + '% · NYC Planning GeoSearch</dd>' +
      '</dl>' +
      (links.length ? '<div class="address-proof__links">' + links.join('') + '</div>' : '') +
      '<p class="insp-fine">This confirmation stays in this browser. It does not change VERA’s score, ranking, owner grade, or shared feed.</p>' +
      '<div class="address-proof__actions">' +
        '<button type="button" class="ghostbtn" data-address-replace="' + esc(uid) + '">Check a different address</button>' +
        '<button type="button" class="ghostbtn" data-address-forget="' + esc(uid) + '">Forget this address</button>' +
      '</div>' +
    '</div>';
  }

  function addressCheckMarkup(l) {
    var uid = l && l.listing_uid;
    var saved = addressResolutionOf(uid);
    if (saved && !replacingAddress[uid]) return addressResolutionMarkup(l);
    return (saved ? addressResolutionMarkup(l) : '') +
      '<form class="address-check" data-address-check data-uid="' + esc(uid) + '" novalidate>' +
        '<label for="vera-address-' + esc(uid) + '"><b>Enter the exact address you were given</b><span>House number and street are required. Unit is optional.</span></label>' +
        '<div class="address-check__row">' +
          '<input id="vera-address-' + esc(uid) + '" name="vera-address" type="search" autocomplete="street-address" maxlength="160" placeholder="e.g. 120 Broadway, Manhattan…" required>' +
          '<button type="submit" class="bigbtn">Check with NYC Planning</button>' +
        '</div>' +
        '<p class="insp-fine">Submitting sends this address directly to NYC Planning’s free GeoSearch service. VERA does not upload it to Little Fight NYC or change the published listing.</p>' +
        '<div class="address-check__result" data-address-result role="status" aria-live="polite"></div>' +
      '</form>';
  }

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
    // The drop shows the eight strongest. Before the sourcing fixes of
    // 2026-08-04 that cap never bit, because two or three cleared on a good
    // day. Twenty-one cleared the first night it did, and thirteen of them
    // had nowhere to be seen — so "cleared" is a view of its own now.
    cleared: C.isFullFit,
    fresh: C.isFresh,
    owner: C.isSmallOwner,
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
        var pa = C.isSmallOwner(a) ? 1 : 0, pb = C.isSmallOwner(b) ? 1 : 0;
        if (pa !== pb) return pb - pa;
      }
      var va = a[k], vb = b[k];
      if (typeof va === 'string' || typeof vb === 'string') return String(va || '').localeCompare(String(vb || '')) * dir;
      return ((+va || 0) - (+vb || 0)) * dir;
    });
    return out;
  }

  /* ---------- charts (hand-rolled svg) ---------- */

  function sparkline(series, w, h, color, label) {
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
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="' + esc(label || 'Trend chart') + '">' +
      '<path d="' + area + '" fill="' + color + '" opacity="0.12"/>' +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round"/>' + dots + '</svg>';
  }

  /* ---------- chrome ---------- */

  function renderChrome() {
    var sh = (D && D.source_health) || {};
    $('[data-snapshot-line]').textContent = 'Data ' + timeago(D && D.generated_at) + ' · ' + POOL.length + ' net' +
      (servedFromCache ? ' · offline copy ' + timeago(servedFromCache) : '');
    var pulse = $('[data-pulse]');
    if (pulse) {
      pulse.className = 'pulse';
      if ((sh.broken || 0) > (sh.healthy || 0)) pulse.classList.add('is-bad');
      else if ((sh.broken || 0) > 0) pulse.classList.add('is-warn');
    }
  }

  function syncPressed(root) {
    $$('[data-bracket],[data-unit],[data-transit],[data-lens],[data-view],[data-area],[data-brtile],[data-hoodbar],[data-density]', root || document)
      .forEach(function (button) {
        button.setAttribute('aria-pressed', button.classList.contains('is-on') ? 'true' : 'false');
      });
  }

  function syncFilterOverflowCue() {
    var deck = $('[data-filters]');
    var cue = $('[data-filter-scroll]');
    if (!deck || !cue) return;
    var desktopRail = window.matchMedia && window.matchMedia('(min-width: 1180px)').matches;
    var overflowing = !deck.hidden && desktopRail && deck.scrollWidth > deck.clientWidth + 8;
    cue.hidden = !overflowing;
    if (!overflowing) return;
    var atEnd = deck.scrollLeft >= deck.scrollWidth - deck.clientWidth - 8;
    cue.setAttribute('data-filter-scroll', atEnd ? 'start' : 'end');
    cue.innerHTML = atEnd
      ? 'Earlier filters <span aria-hidden="true">←</span>'
      : 'More filters <span aria-hidden="true">→</span>';
  }

  var filterSheetOrigin = null;
  var filterSheetWasOpen = false;

  function lockFilterSheetBackground(locked) {
    ['.masthead', '[data-filter-scroll]', '.filter-dock', '[data-route-announce]', '[data-main]', '.deckfoot'].forEach(function (selector) {
      var element = $(selector);
      if (!element) return;
      element.inert = locked;
      if (locked) element.setAttribute('aria-hidden', 'true');
      else element.removeAttribute('aria-hidden');
    });
    document.documentElement.classList.toggle('vera-filters-open', locked);
  }

  function renderFilters() {
    var deck = $('[data-filters]');
    deck.hidden = !DATA_ROUTES[state.route];
    if (deck.hidden) state.filtersOpen = false;
    deck.classList.toggle('is-open', !deck.hidden && state.filtersOpen);
    var mobileSheet = !!(FILTER_SHEET_QUERY && FILTER_SHEET_QUERY.matches);
    var mobileOpen = !deck.hidden && mobileSheet && state.filtersOpen;
    var concealed = deck.hidden || (mobileSheet && !state.filtersOpen);
    deck.setAttribute('aria-hidden', concealed ? 'true' : 'false');
    deck.inert = concealed;
    if (mobileSheet) {
      deck.setAttribute('role', 'dialog');
      deck.setAttribute('aria-modal', 'true');
      deck.setAttribute('aria-labelledby', 'vera-filter-title');
    } else {
      deck.removeAttribute('role');
      deck.removeAttribute('aria-modal');
      deck.removeAttribute('aria-labelledby');
    }
    if (mobileOpen && !filterSheetWasOpen) {
      filterSheetOrigin = $$('[data-filter-toggle]').filter(function (button) {
        return !button.hidden;
      })[0] || document.activeElement;
      lockFilterSheetBackground(true);
      requestAnimationFrame(function () {
        var done = $('[data-filter-close]', deck);
        if (done) done.focus();
      });
    } else if (!mobileOpen && filterSheetWasOpen) {
      lockFilterSheetBackground(false);
      var origin = filterSheetOrigin;
      filterSheetOrigin = null;
      var restoreFilterFocus = function () {
        var active = document.activeElement;
        if (active && active !== document.body && !deck.contains(active)) return;
        var target = (origin && origin.isConnected) ? origin : $('.filter-dock');
        if (target && target.focus) target.focus({ preventScroll: true });
      };
      requestAnimationFrame(function () { requestAnimationFrame(restoreFilterFocus); });
      setTimeout(restoreFilterFocus, 50);
    } else {
      lockFilterSheetBackground(mobileOpen);
    }
    filterSheetWasOpen = mobileOpen;
    if (deck.hidden) {
      $$('[data-filter-toggle]').forEach(function (button) { button.hidden = true; button.setAttribute('aria-expanded', 'false'); });
      syncPressed(deck);
      syncFilterOverflowCue();
      return;
    }
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
    var filterCount = (state.bracket !== 'all' ? 1 : 0) + (state.unit !== 'all' ? 1 : 0) +
      state.hoods.length + state.areas.length + (state.transit ? 1 : 0) +
      (state.lens.noBrokers ? 1 : 0) + (state.lens.noMgmt ? 1 : 0) + (state.lens.privateFirst ? 1 : 0);
    var dirty = filterCount || state.view !== 'all' || state.q;
    $('[data-clear]').hidden = !dirty;
    $$('[data-filter-toggle]').forEach(function (button) {
      button.hidden = false;
      button.setAttribute('aria-expanded', state.filtersOpen ? 'true' : 'false');
      var count = button.querySelector('[data-filter-count]');
      if (count) { count.hidden = !filterCount; count.textContent = filterCount; }
    });
    syncPressed(deck);
    requestAnimationFrame(syncFilterOverflowCue);
  }

  var filterDeck = $('[data-filters]');
  if (filterDeck) filterDeck.addEventListener('scroll', syncFilterOverflowCue, { passive: true });
  window.addEventListener('resize', syncFilterOverflowCue, { passive: true });

  function refresh() {
    persist();
    renderFilters();
    /* Filters should update the live Atlas source and its evidence list, not
       tear down WebGL, refetch the style, and reset the visitor's camera. */
    if (state.route === 'atlas' && state.atlasMode === 'map' && refreshAtlasMap()) return;
    renderRoute();
  }

  /* ================================================================
     TODAY — the drop. Few things, deeply vetted, honestly told.
     No filters here on purpose: this page is VERA's opinion.
     ================================================================ */

  var countdownT = 0;

  function nextSweepUTC() {
    var now = new Date();
    var next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 5, 30, 0));
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
    function tick() {
      var el2 = $('[data-countdown]');
      if (!el2) { clearInterval(countdownT); return; }
      var ms = nextSweepUTC() - new Date();
      var minutes = Math.max(0, Math.ceil(ms / 60000));
      var hours = Math.floor(minutes / 60);
      var remainder = minutes % 60;
      el2.textContent = hours ? hours + 'h ' + remainder + 'm' : remainder + 'm';
      document.documentElement.classList.toggle('is-sweep-near', ms < 30 * 60000);
    }
    tick();
    countdownT = setInterval(tick, 60000);
  }

  function provenance(l) {
    var a = C.authenticity(l);
    var bits = [];
    bits.push('<span class="prov__i" title="When VERA first saw this listing">seen ' + timeago(l.first_seen_at || l.last_seen_at) + '</span>');
    if (l.source_name) bits.push('<span class="prov__i">' + esc(l.source_name) + '</span>');
    if (a != null) bits.push('<span class="prov__i" title="Authenticity confidence, 0–100">real ' + num(a) + '</span>');
    bits.push('<span class="prov__i" title="HPD building-risk score — lower is cleaner">HPD ' + num(l.hpd_risk_score) + '</span>');
    if (l.duplicate_count) bits.push('<span class="prov__i">' + l.duplicate_count + '× reposted</span>');
    if (l.neighborhood_resolved_from_coords && l.neighborhood_source) {
      bits.push('<span class="prov__i" title="The post said only the borough; VERA placed it by its coordinates against the city\u2019s own neighborhood boundaries">posted as ' + esc(l.neighborhood_source) + ' \u2192 placed by coordinates</span>');
    }
    if (l.relist_suspect) bits.push('<span class="prov__i prov__i--warn" title="A fresh posting at an address that already advertised — the days-on-market counter was reset">relisted · truly ' + (l.true_days_on_market != null ? l.true_days_on_market + 'd on market' : 'older than it looks') + '</span>');
    if (l.contact_reuse_count) bits.push('<span class="prov__i prov__i--warn">contact on ' + l.contact_reuse_count + ' listings</span>');
    if (l.photo_clone_suspect) bits.push('<span class="prov__i prov__i--warn" title="The lead photo also appears on a listing at a different address — hard fraud evidence">photos unproven</span>');
    /* Two tiers, David's ruling: fraud evidence warns; laziness-shaped
       signals get a quiet sticker that never moves the score. */
    if (l.desc_clone_of) bits.push('<span class="prov__i prov__i--soft" title="The description is a template of another listing — small landlords reuse copy all the time, so this alone proves nothing">template copy</span>');
    return '<div class="prov">' + bits.join('<span class="prov__dot">·</span>') + '</div>';
  }

  function addressOf(l) {
    var a = C.exactAddressText(l);
    if (!a) return null;
    a = a.replace(/\b(apt|unit)\b/gi, '#').replace(/#\s+/g, '#');
    return C.titleCase(a).replace(/\bE\b/g, 'E').replace(/\bW\b/g, 'W').replace(/#([a-z0-9]+)/gi, function (m, u) { return '#' + u.toUpperCase(); });
  }

  /* the hour the sweep ran, in NY local terms — the portraits' sun */
  function sweepHour() {
    if (!D || !D.generated_at) return null;
    var d = new Date(D.generated_at);
    return isNaN(d.getTime()) ? null : (d.getUTCHours() + 20) % 24;
  }

  function gallery(l) {
    var sourceCount = (l.image_urls || []).length;
    var urls = (l.image_urls || []).map(function (u) { return trustedURL(u, 'image'); }).filter(Boolean).slice(0, 6);
    if (!urls.length) return C.portrait(l, 640, 340, sweepHour());
    var where = addressOf(l) || C.charName(l);
    var multi = urls.length > 1;
    return C.portrait(l, 640, 340, sweepHour()) +
      '<span class="gal" data-gal data-gal-count="' + urls.length + '" data-gal-source-count="' + sourceCount + '" data-gal-where="' + esc(where) + '" role="region" tabindex="0" aria-label="Photo gallery for ' + esc(where) + ', showing ' + urls.length + (sourceCount > urls.length ? ' of ' + sourceCount : '') + ' photo' + (urls.length === 1 ? '' : 's') + '. Use the left and right arrow keys or the previous and next buttons to move; open a photo to view it full screen.">' + urls.map(function (u, i) {
        return '<button type="button" class="gal__slide" data-gal-shot="' + i + '" aria-label="Open photo ' + (i + 1) + ' of ' + urls.length + ' for ' + esc(where) + ' full screen"><img class="gal__shot" src="' + esc(u) + '" width="960" height="600" loading="' + (i ? 'lazy' : 'eager') + '" decoding="async" referrerpolicy="no-referrer" alt=""></button>';
      }).join('') + '</span>' +
      (multi ? '<button type="button" class="gal__btn gal__btn--prev" data-gal-step="-1" aria-label="Previous photo">‹</button>' +
        '<button type="button" class="gal__btn gal__btn--next" data-gal-step="1" aria-label="Next photo">›</button>' +
        '<span class="gal__dots" aria-hidden="true">' + urls.map(function (u, i) {
          return '<span class="gal__dot' + (i === 0 ? ' is-on' : '') + '"></span>';
        }).join('') + '</span><span class="gal__n" data-gal-status role="status" aria-live="polite">Photo 1 of ' + urls.length + (sourceCount > urls.length ? ' · showing ' + urls.length + ' of ' + sourceCount : '') + ' · use arrow keys</span>' : '');
  }

  /* ---------- full-screen photo viewer (shared by every gallery) ---------- */

  var lb = { urls: [], idx: 0, where: '', lastFocus: null, background: null };

  function lbRoot() { return $('[data-lb]'); }

  function lbIsOpen() { var root = lbRoot(); return !!(root && !root.hidden); }

  function lbRender() {
    var root = lbRoot();
    if (!root || root.hidden) return;
    var img = root.querySelector('[data-lb-img]');
    var status = root.querySelector('[data-lb-status]');
    var url = lb.urls[lb.idx];
    if (img) {
      img.src = url;
      img.alt = 'Photo ' + (lb.idx + 1) + ' of ' + lb.urls.length + ' for ' + lb.where;
    }
    if (status) status.textContent = 'Photo ' + (lb.idx + 1) + ' of ' + lb.urls.length + ' — ' + lb.where;
    root.querySelectorAll('[data-lb-step]').forEach(function (b) {
      b.hidden = lb.urls.length < 2;
    });
  }

  function openLightbox(strip, idx) {
    var root = lbRoot();
    if (!root || !strip) return;
    var shots = strip.querySelectorAll('[data-gal-shot]');
    if (!shots.length) return;
    lb.urls = Array.prototype.map.call(shots, function (shot) {
      var image = shot.querySelector('.gal__shot');
      return image && (image.currentSrc || image.src);
    }).filter(Boolean);
    if (!lb.urls.length) return;
    lb.idx = Math.min(lb.urls.length - 1, Math.max(0, idx || 0));
    lb.where = strip.getAttribute('data-gal-where') || 'this listing';
    lb.lastFocus = shots[lb.idx] || document.activeElement;
    lb.background = $$('.skip-link,.grain,body > noscript,.shell > *').filter(function (el) { return el !== root; }).map(function (el) {
      return { el: el, inert: !!el.inert, ariaHidden: el.getAttribute('aria-hidden') };
    });
    lb.background.forEach(function (item) {
      item.el.inert = true;
      item.el.setAttribute('aria-hidden', 'true');
    });
    root.hidden = false;
    document.body.classList.add('lb-open');
    lbRender();
    var close = root.querySelector('[data-lb-close]');
    if (close) close.focus();
  }

  function closeLightbox() {
    var root = lbRoot();
    if (!root || root.hidden) return;
    root.hidden = true;
    document.body.classList.remove('lb-open');
    if (lb.background) lb.background.forEach(function (item) {
      item.el.inert = item.inert;
      if (item.ariaHidden == null) item.el.removeAttribute('aria-hidden');
      else item.el.setAttribute('aria-hidden', item.ariaHidden);
    });
    lb.background = null;
    if (lb.lastFocus && lb.lastFocus.isConnected && lb.lastFocus.focus) lb.lastFocus.focus();
    else {
      var main = document.getElementById('main');
      if (main) main.focus();
    }
    lb.lastFocus = null;
  }

  function stepLightbox(n) {
    if (!lb.urls.length) return;
    lb.idx = (lb.idx + n + lb.urls.length) % lb.urls.length;
    lbRender();
  }

  /* ---------- commute anchors: the #1 community ask, honestly ----------
     The user picks up to two stations that anchor their life (work, a
     person). VERA prints per listing: the walk to its own station, whether
     that station shares a line with the anchor, and the straight-line
     distance — all marked ≈. No fake routing minutes, ever. */

  var anchors = [];
  try { anchors = JSON.parse(localRead('vera-anchors') || '[]') || []; } catch (e) { anchors = []; }

  function saveAnchors() {
    localWrite('vera-anchors', JSON.stringify(anchors));
  }

  function stationByName(name) {
    for (var i = 0; i < C.STATIONS.length; i++) if (C.STATIONS[i][0] === name) return C.STATIONS[i];
    return null;
  }

  function stationMatch(seqName, name) {
    var a = seqName.toLowerCase(), b = name.toLowerCase();
    return a === b || a.indexOf(b) > -1 || b.indexOf(a) > -1;
  }

  function scheduledRide(line, fromName, toName) {
    var tables = D && D.transit_tables;
    var seq = tables && tables[line];
    if (!seq) return null;
    var a = null, b = null;
    for (var i = 0; i < seq.length; i++) {
      if (a == null && stationMatch(seq[i][0], fromName)) a = seq[i][1];
      if (b == null && stationMatch(seq[i][0], toName)) b = seq[i][1];
    }
    if (a == null || b == null || a === b) return null;
    return Math.max(1, Math.round(Math.abs(a - b) / 60));
  }

  function commuteRead(l, anchorName) {
    var t = C.nearestStation(l);
    var a = stationByName(anchorName);
    if (!t || !a || !hasValidLngLat(l)) return null;
    var mine = String(t.lines).split(/\s+/);
    var theirs = String(a[1]).split(/\s+/);
    var shared = mine.filter(function (x) { return theirs.indexOf(x) > -1; });
    var dy = (+l.latitude - a[2]) * 111.32;
    var dx = (+l.longitude - a[3]) * 111.32 * Math.cos(a[2] * Math.PI / 180);
    var km = Math.sqrt(dx * dx + dy * dy);
    if (km < 0.9) return { label: 'to ' + anchorName + ': ≈' + Math.max(2, Math.round(km * 12.5)) + ' min on foot', good: true };
    if (shared.length) {
      /* the timetable itself, when the feed carries it: scheduled minutes
         between the two stops on the shared line — quoted, never invented */
      var ride = scheduledRide(shared[0], t.name, anchorName);
      if (ride != null) return { label: 'to ' + anchorName + ': ≈' + t.mins + ' min walk + ' + shared[0] + ' ≈' + ride + ' min scheduled', good: true, line: shared[0] };
      return { label: 'to ' + anchorName + ': ≈' + t.mins + ' min walk, then ' + shared[0] + ' direct', good: true, line: shared[0] };
    }
    return { label: 'to ' + anchorName + ': ≈' + km.toFixed(1) + ' km · likely a transfer', good: false };
  }

  function commuteLines(l) {
    if (!anchors.length) return '';
    var reads = anchors.map(function (a) { return commuteRead(l, a); }).filter(Boolean);
    if (!reads.length) return '';
    return '<span class="dropcard__commute">' + reads.map(function (r) {
      return '<span class="commute ' + (r.good ? 'commute--good' : '') + '">' + (r.line ? C.lineBullets(r.line) + ' ' : '') + esc(r.label) + '</span>';
    }).join('') + '</span>';
  }

  function anchorPanel() {
    var opts = C.STATIONS.map(function (s) { return s[0] + ' (' + s[1] + ')'; });
    var uniq = [];
    var seenN = {};
    C.STATIONS.forEach(function (s) { var k = s[0] + '|' + s[1]; if (!seenN[k]) { seenN[k] = 1; uniq.push(s); } });
    function sel(idx) {
      return '<select name="vera-anchor-' + (idx + 1) + '" autocomplete="off" data-anchor-sel="' + idx + '" aria-label="Anchor station ' + (idx + 1) + '">' +
        '<option value="">' + (idx ? 'second anchor (optional)' : 'pick a station you live around') + '</option>' +
        uniq.map(function (s) {
          var on = anchors[idx] === s[0] ? ' selected' : '';
          return '<option value="' + esc(s[0]) + '"' + on + '>' + esc(s[0]) + ' · ' + esc(s[1]) + '</option>';
        }).join('') + '</select>';
    }
    return '<div class="anchorbar"><span class="anchorbar__label">Commute anchors</span>' + sel(0) + sel(1) +
      '<span class="anchorbar__label">Income</span>' +
      '<input type="number" name="vera-income" autocomplete="off" inputmode="numeric" min="0" step="5000" placeholder="e.g. 85000…" value="' + (+profile.income || '') + '" data-profile-income aria-label="Annual income — stored locally only">' +
      '<span class="anchorbar__hint">' + (anchors.length || profile.income ? 'printed on every card, marked ≈ — VERA never invents routing minutes; your income never leaves this browser' : 'work, a person, your income — VERA personalizes every card, all of it local-only') + '</span></div>';
  }

  /* ---------- value math: is THIS cheap for THIS block ----------
     Exact-hood match against the official StreetEasy series (≥12 months
     of data required), else the net's own per-hood median (≥5 priced
     peers, provenance stated), else nothing. Never interpolate across
     neighborhoods. */

  function valueRead(l) {
    var rent = +l.rent;
    var hood = l.neighborhood;
    if (!rent || !hood) return null;
    var mc = D && D.market_context;
    if (mc && mc.series && mc.series[hood]) {
      var s = mc.series[hood];
      var vals = (s.median_asking_rent || []).filter(function (v) { return v != null; });
      if (vals.length >= 12 && s.median_asking_rent_latest) {
        var med = s.median_asking_rent_latest;
        var d = Math.round((med - rent) / med * 100);
        if (d === 0) return null;
        return { pct: Math.abs(d), under: d > 0, label: Math.abs(d) + '% ' + (d > 0 ? 'under' : 'over') + ' the ' + hood + ' median', src: 'StreetEasy series' };
      }
    }
    var peers = POOL.filter(function (x) { return x.neighborhood === hood && +x.rent > 0; }).map(function (x) { return +x.rent; });
    if (peers.length >= 5) {
      var m2 = median(peers);
      var d2 = Math.round((m2 - rent) / m2 * 100);
      if (d2 === 0) return null;
      return { pct: Math.abs(d2), under: d2 > 0, label: Math.abs(d2) + '% ' + (d2 > 0 ? 'under' : 'over') + ' others in the net (' + hood + ')', src: 'net-internal' };
    }
    return null;
  }

  function valueChip(l) {
    var v = valueRead(l);
    if (!v) return '';
    /* The market-position meter: center tick is the median, the marker sits
       where THIS rent lands against it (±50% clamp on a 90px scale), sliding
       out from center on insertion. The label stays the honest text. */
    var off = (v.under ? -1 : 1) * Math.min(50, v.pct) * 0.9;
    return '<span class="deal deal--' + (v.under ? 'under' : 'over') + '" title="' + esc(v.src) + '">' +
      '<span class="deal__scale" aria-hidden="true"><span class="deal__median"></span>' +
      '<span class="deal__marker" style="transform:translateX(' + off.toFixed(1) + 'px)"></span></span>' +
      '<span class="deal__label">' + esc(v.label) + '</span></span>';
  }

  /* Price memory at a glance: the last recorded move on VERA's own watch,
     from the feed's price_history — never inferred, never estimated. */
  function priceMove(l) {
    var ph = l.price_history;
    if (!ph || ph.length < 2) return null;
    var d = +ph[ph.length - 1][1] - +ph[ph.length - 2][1];
    if (!d) return null;
    return { amt: Math.abs(d), down: d < 0 };
  }

  function priceMoveTag(l) {
    var pm = priceMove(l);
    if (!pm) return '';
    return '<span class="tag ' + (pm.down ? 'tag--green' : 'tag--amber') + '">' +
      (pm.down ? '▼' : '▲') + ' ' + money(pm.amt) + ' on VERA\'s watch</span>';
  }

  /* ---------- personal qualification: the 40× bar, yours ---------- */

  var profile = {};
  try { profile = JSON.parse(localRead('vera-profile') || '{}') || {}; } catch (e) { profile = {}; }

  function saveProfile() {
    localWrite('vera-profile', JSON.stringify(profile));
  }

  function qualifyLine(l) {
    var inc = +profile.income || 0;
    var rent = +l.rent || 0;
    if (!inc || !rent) return '';
    var need = rent * C.LAW.incomeRuleX;
    return inc >= need
      ? '<p class="qualify qualify--good">Clears your 40× bar at ' + money(inc) + '</p>'
      : '<p class="qualify qualify--warn">Needs a guarantor at your income — the bar here is ' + money(need) + '</p>';
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
    var bearing = '';
    if (hasValidLngLat(l)) {
      var Mb = C.MAP.B;
      var ang = Math.atan2(+l.longitude - (Mb.w + Mb.e) / 2, +l.latitude - (Mb.s + Mb.n) / 2) * 180 / Math.PI;
      bearing = ' data-bearing="' + Math.round((ang + 360) % 360) + '"';
    }
    return '<article class="dropcard"' + bearing + ' style="--i:' + i + '">' +
      '<div class="dropcard__hit">' +
        '<span class="dropcard__media">' + gallery(l) +
          '<span class="dropcard__rent">' + money(l.rent) + '<small>/mo</small></span>' + freshBadge +
          '<span class="dropcard__no">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span></span>' +
        '<div class="dropcard__body">' +
          '<div class="dropcard__main">' +
            '<span class="dropcard__hood">' + hoodLine + ' · ' + unit + (t ? ' · <span class="nowrap">≈' + t.mins + ' min walk ' + C.lineBullets(t.lines) + ' ' + esc(t.name) + '</span>' : '') + '</span>' +
            commuteLines(l) +
            '<h2 class="dropcard__name">' + esc(addr || C.charName(l)) + '</h2>' +
            (addr ? '<p class="dropcard__flavor">' + esc(C.charName(l)) + '</p>' : '') +
            ownerLine(l) +
            '<span class="steward steward--' + stew.grade + '">' +
              '<b class="steward__grade">' + stew.grade + '</b>' +
              '<span class="steward__body"><span class="steward__word">Stewardship: ' + esc(stew.word) + (stew.score != null ? ' · ' + stew.score + '/100' : '') + '</span>' +
              (stew.failures.length ? '<span class="steward__line steward__line--bad">' + esc(C.stewardText(stew.failures)) + '</span>'
                : stew.strengths.length ? '<span class="steward__line steward__line--good">' + esc(C.stewardText(stew.strengths)) + '</span>'
                : '<span class="steward__line">city record too thin to judge — verify in person</span>') + '</span>' +
            '</span>' +
            '<p class="dropcard__why">' + esc(why) + '</p>' +
            (spatial ? '<p class="dropcard__spatial">' + esc(spatial) + ' · no floor plan published</p>' : '') +
            (flaw ? '<p class="dropcard__flaw">Eyes open: ' + esc(flaw) + '</p>' : '') +
            qualifyLine(l) +
            '<span class="dropcard__chips">' +
              valueChip(l) +
              priceMoveTag(l) +
              (l.voucher_signal ? '<span class="tag tag--blue" title="The listing text states this explicitly — VERA never infers it">vouchers welcomed (stated)</span>' : '') +
              (st ? '<span class="tag ' + st.cls + '">' + st.label + '</span>' : '') +
              '<span class="tag">move-in ≈ ' + money(m.total) + '</span>' +
              scoreRing(l.overall_score) +
            '</span>' +
            provenance(l) +
            '<button type="button" class="dropcard__open" data-open="' + esc(l.listing_uid) + '" aria-label="Open the ledger for ' + esc(addr || C.charName(l)) + '">Open full ledger <span aria-hidden="true">→</span></button>' +
          '</div>' +
          (mini ? '<button type="button" class="dropcard__map" data-atlas-focus="' + esc(l.listing_uid) + '" aria-label="Show ' + esc(addr || C.charName(l)) + ' on the Atlas map">' + mini + '<span class="dropcard__mapaction">View in Atlas <span aria-hidden="true">↗</span></span></button>' : '') +
        '</div>' +
      '</div></article>';
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
    var nearMiss = POOL.filter(function (l) {
      if (inDrop[l.listing_uid] || C.isScam(l)) return false;
      var rec = String(l.recommendation || '').toLowerCase();
      return rec === 'pursue cautiously' || rec === 'manual review';
    }).sort(function (a, b) { return (+b.overall_score || 0) - (+a.overall_score || 0); });
    var bubble = nearMiss.slice(0, 4);
    // How many missed by less than a point. On 2026-08-04 thirteen listings
    // scored 59.6-59.9 against a 60.0 bar — low HPD risk, confidence 78,
    // under the ceiling — and the page showed four of them with no hint the
    // other nine existed. The published gate is not the page's to move; what
    // the page owes is an honest count of who is standing at it.
    var whisker = nearMiss.filter(function (l) {
      return (+l.overall_score || 0) >= C.FIT.minScore - 1;
    }).length;

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
    // Count what CLEARED, not what fitted on the page. The lede read
    // "8 clear every gate" out of 270 on the night 21 did, and "we passed on
    // 262" when the true figure was 249 — both understating VERA's own
    // result and, worse, stating a number that was not true. The cap is
    // editorial; the count is a fact, and they are not the same thing.
    var clearedCount = fits.length;
    var beyondDrop = Math.max(0, clearedCount - drop.length);
    var passedCount = POOL.length - clearedCount;

    page.innerHTML =
      (usedFallbackPool ? '<p class="notice">Feed is serving the pre-overhaul contract — the drop is limited to curated lanes until tonight\'s publish.</p>' : '') +
      '<header class="drophead">' +
        '<p class="kicker">The drop · sweep ' + timeago(D && D.generated_at) + '</p>' +
        '<h1 class="drophead__title">' + esc(dateStr) + '</h1>' +
        '<p class="drophead__lede">' +
          (drop.length
            ? 'Out of <b>' + POOL.length + '</b> listings across the four-borough net, <b>' + clearedCount + '</b> clear' + (clearedCount === 1 ? 's' : '') + ' every gate — price, papers, building record, and an owner worth talking to.' +
              (beyondDrop ? ' The <b>' + drop.length + '</b> strongest are below; <a href="#/browse" data-view-jump="cleared">the other ' + beyondDrop + ' are here ↗</a>' : '')
            : 'Nothing met the bar today — out of ' + POOL.length + ' swept, none cleared every gate. That is not a bug. The net stays out and tomorrow sweeps again.') +
        '</p>' +
        '<p class="drophead__trust">We passed on ' + passedCount + ': ' + esc(reasonBits || 'nothing else in the net') + '. <a href="#/browse">Every listing is still inspectable ↗</a></p>' +
        '<p class="drophead__next">next scheduled sweep <span class="mono" data-countdown>—</span></p>' +
        (sinceLastVisit ? '<p class="drophead__since">' + sinceLastVisit + ' new in the net since your last visit</p>' : '') +
        anchorPanel() +
      '</header>' +
      (drop.length ? '<div class="dropgrid">' + drop.map(dropCard).join('') + '</div>'
        : '<div class="dropempty">' +
            '<svg width="86" height="86" viewBox="0 0 24 24" aria-hidden="true" class="dropempty__mark"><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".35"/><path d="M12 12 L12 2.75 A9.25 9.25 0 0 1 20.01 7.38 Z" fill="#4cc38a" opacity=".75"/></svg>' +
            '<h2>Nothing cleared the bar today</h2>' +
            '<p>VERA does not pad the feed. Rather than eight compromises, here is exactly where tonight’s sweep narrowed — every number below is a count, not an estimate.</p>' +
            funnel() +
            '<p class="dropempty__close">The bar does not move on a slow day. <a href="#/market">See what the market is doing ↗</a></p>' +
          '</div>') +
      recordsWarning() +
      memorialLine() +
      (bubble.length ?
        '<section class="bubble"><h2 class="bubble__title">On the bubble</h2>' +
        '<p class="bubble__hint">Strong records that failed exactly one gate — usually verification. Worth a look with your eyes open, not your deposit.' +
          (whisker > bubble.length
            ? ' <b>' + whisker + '</b> of tonight’s came within a point of clearing; the ' + bubble.length + ' strongest are here.'
            : '') +
        '</p>' +
        '<div class="bubblegrid">' + bubble.map(function (l) {
          var o = C.ownerRead(l);
          return '<button type="button" class="bubcard" data-open="' + esc(l.listing_uid) + '">' +
            '<span class="bubcard__port">' + C.portrait(l, 300, 132, sweepHour()) + photoLayer(l) + '</span>' +
            '<span class="bubcard__body"><b>' + esc(C.charName(l)) + '</b>' +
            '<span>' + money(l.rent) + ' · ' + esc(l.neighborhood || '—') + '</span>' +
            '<span class="bubcard__why">' + esc(C.whyPassed(l)) + '</span>' +
            '<span class="tag ' + o.cls + '">' + o.label + '</span></span></button>';
        }).join('') + '</div></section>' : '') +
      '<section class="wire"><div class="wire__card">' +
        '<h2>The next drop</h2>' +
        '<p>VERA refreshes this page after every completed sweep. A listing appears here only after it clears the same published gates you can inspect in its ledger.</p>' +
        '<p class="wire__fine">No automated landlord contact, no manufactured urgency, and no alert claim the system cannot prove.</p>' +
      '</div></section>';

    page.classList.add('is-entered');
    startCountdown();
  }

  /* When the city's endpoints fail, every lookup errors, nothing earns a
     BBL, and the scorer correctly recommends nothing — which looks exactly
     like an ordinary quiet day. It isn't. Say which one happened. */
  function recordsWarning() {
    var rh = D && D.records_health;
    if (!rh || !rh.degraded) return '';
    return '<div class="recwarn"><b>The city\u2019s records service was unavailable during this sweep.</b> ' +
      rh.errors + ' building lookup' + (rh.errors === 1 ? '' : 's') + ' failed and none succeeded, so no listing could be ' +
      'checked against HPD, DOB, or 311 this run. Nothing is being recommended, and the steward grades below are ' +
      'unverified \u2014 not because the buildings are clean, but because VERA could not read the record. ' +
      'The next sweep retries automatically.</div>';
  }

  /* The funnel: on a day with no drop, the useful thing is not an
     apology — it is showing exactly where the net narrowed, so the
     reader can judge whether the bar or the market is the problem. */
  function funnel() {
    var pool = POOL.length;
    if (!pool) return '';
    var priced = POOL.filter(function (l) { return +l.rent > 0 && +l.rent <= C.FIT.maxRent; }).length;
    var verified = POOL.filter(function (l) { return l.bbl || C.hasMatchedRecord(l); }).length;
    var reviewed = POOL.filter(function (l) { return String(l.recommendation || '').toLowerCase() === 'manual review'; }).length;
    var rows = [
      { n: pool, label: 'listings swept from every source VERA watches' },
      { n: priced, label: 'at or under ' + money(C.FIT.maxRent) },
      { n: verified, label: 'matched to a building in the city’s records' },
      { n: reviewed, label: 'strong enough to need a human read' },
      { n: 0, label: 'cleared every gate', last: true },
    ];
    var max = pool || 1;
    return '<ol class="funnel">' + rows.map(function (r) {
      var pct = Math.max(2, Math.round((r.n / max) * 100));
      return '<li class="funnel__row' + (r.last ? ' is-last' : '') + '">' +
        '<span class="funnel__n">' + r.n + '</span>' +
        '<span class="funnel__bar"><i style="width:' + pct + '%"></i></span>' +
        '<span class="funnel__l">' + r.label + '</span></li>';
    }).join('') + '</ol>' +
    (verified === 0 && pool > 0
      ? '<p class="funnel__note">Nothing reached the records check tonight, which is a VERA problem rather than a market one — the city’s data service or the address match failed. It retries on the next sweep.</p>'
      : reviewed > 0
        ? '<p class="funnel__note">' + reviewed + ' listing' + (reviewed === 1 ? '' : 's') + ' stopped one step short. They are below, on the bubble — worth your eyes, not your deposit.</p>'
        : '');
  }

  /* The one that got away — real urgency from a real outcome, reported
     in the past tense. Never a countdown, never "only one left." */
  function memorialLine() {
    var changes = (D && D.daily_changes) || {};
    var goneDate = changes.date ? new Date(changes.date + 'T12:00:00Z') : null;
    var best = null;
    (changes.gone_listings || []).forEach(function (c) {
      var d = c.change_detail || c;
      if (!d.first_seen_at || !goneDate) return;
      var hours = Math.round((goneDate - new Date(d.first_seen_at)) / 3.6e6);
      if (hours > 0 && hours <= 96 && (!best || hours < best.hours)) {
        best = { hours: hours, title: d.title || c.title, rent: d.last_rent != null ? d.last_rent : d.rent, hood: d.neighborhood || c.neighborhood };
      }
    });
    if (!best) return '';
    return '<p class="memorial">' + esc(tidyTitle(String(best.title || 'A listing'))) +
      (best.hood ? ' in ' + esc(best.hood) : '') + ' went in ' +
      (best.hours < 48 ? best.hours + ' hours' : Math.round(best.hours / 24) + ' days') +
      (best.rent ? ' at ' + money(best.rent) : '') + '. The good ones move.</p>';
  }

  /* ================================================================
     MARKET — the wide net, honestly framed.
     ================================================================ */

  function renderMarket(page) {
    var f = filtered();
    var rents = f.map(function (l) { return +l.rent; }).filter(function (n) { return n > 0; });
    var privates = f.filter(C.isSmallOwner);
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
    (changes.price_changes || []).slice(0, 4).forEach(function (c) {
      var rent = +c.rent || 0;
      var delta = +c.price_change || 0;
      var old = rent - delta;
      /* The number travels old → new: the badge names the direction, the
         tween makes the move itself visible. */
      feed.push({
        b: delta < 0 ? 'drop' : 'hike',
        t: c.title || c.listing_uid,
        n: rent && old > 0 && delta
          ? '<span data-count-to="' + Math.round(rent) + '" data-count-from="' + Math.round(old) + '" data-count-prefix="$" data-count-final="' + money(rent) + '">' + money(old) + '</span>'
          : money(c.rent),
        hood: c.neighborhood,
      });
    });
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
      var priv = inBr.filter(C.isSmallOwner).length;
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
        return s.length ? '<div class="mctx__lane"><span class="mctx__who"><i style="background:' + ln[1] + '"></i>' + ln[0] + ' <b>' + money(latestOf(ln[0])) + '</b></span>' + sparkline(s, 260, 64, ln[1], ln[0] + ' median asking rent trend over 36 months') + '</div>' : '';
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
      '<header class="pagehead"><p class="kicker">Four-borough market</p>' +
      '<h1 class="pagehead__title">The market, whole</h1>' +
      '<p class="pagehead__lede">Everything VERA is watching across Manhattan, Brooklyn, Queens, and the Bronx under ' + money(C.FIT.maxRent) + ' — not just what cleared. The published market medians sit at ' + money(mk.manhattanMedian) + ' Manhattan / ' + money(mk.brooklynMedian) + ' Brooklyn (' + esc(mk.asOf) + '); this net hunts the floor beneath them.</p></header>' +
      '<div class="kpis">' +
        kpi('In the net', cval(f.length) + '<small>/' + POOL.length + '</small>', 'under current lens', '', 'browse') +
        newTonightKPI(sm, dc, fresh) +
        kpi('Median ask', rents.length ? cmoney(ourMedian) : '—', 'vs ' + money(mk.cityMedianAsk) + ' citywide', '') +
        kpi('Price drops', cval(sm.price_drops || dc.price_drop || 0), (sm.price_hikes || dc.price_hike || 0) + ' hikes', (sm.price_drops || dc.price_drop) ? 'kpi--good' : '') +
        kpi('Private landlords', cval(privates.length), 'no broker, no corp', 'kpi--good', 'owner') +
        kpi('Scam wall', cval(scams.length), 'kept out of the drop', scams.length ? 'kpi--bad' : '', 'scam') +
      '</div>' +
      mcHTML +
      '<div class="brackets">' + brTiles + '</div>' +
      '<div class="grid grid--2">' +
        '<div class="panel chart"><div class="panel__head"><h2 class="panel__title">Sweep pulse — records discovered per run</h2><p class="panel__hint">' + trends.length + ' runs</p></div>' +
          (discovered.length ? sparkline(discovered, 560, 190, '#4cc38a', 'Records discovered per VERA run') : '<p class="lane__empty">Trend history arrives with the next publishes.</p>') +
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

  function browseTrustLine(l) {
    var status = C.isScam(l) ? 'Scam signals' : C.needsVerify(l) ? 'Needs verification' : 'Clears the bar';
    var cls = C.isScam(l) ? 'is-bad' : C.needsVerify(l) ? '' : 'is-good';
    var owner = C.ownerRead(l);
    var hpd = l.hpd_risk_score == null ? 'HPD not matched' : 'HPD ' + num(l.hpd_risk_score);
    return '<span class="browse-mobile-trust ' + cls + '" data-browse-trust>' +
      '<strong>' + status + '</strong><span aria-hidden="true">·</span>' +
      '<span>' + esc(owner.label) + ' · ' + esc(hpd) + '</span></span>';
  }

  var COLS = [
    { key: 'overall_score', label: 'Score', render: function (l) {
      if (l.overall_score == null) return '<span class="t-score">—</span>';
      var v = Math.max(0, Math.min(100, +l.overall_score));
      return '<span class="t-score"><b>' + num(v, 1) + '</b><span class="t-score__track" aria-hidden="true"><span class="t-score__fill" style="width:' + v + '%"></span></span></span>';
    } },
    { key: 'rent', label: 'Rent', render: function (l) {
      var pm = priceMove(l);
      return money(l.rent) + (pm ? ' <span class="t-delta t-delta--' + (pm.down ? 'down' : 'up') + '">' + (pm.down ? '▼' : '▲') + ' ' + money(pm.amt) + '</span>' : '');
    } },
    { key: 'value_delta', label: 'Value', render: function (l) { return l.value_delta == null ? '<span class="t-dim">—</span>' : l.value_delta > 0 ? '<span class="t-under">' + l.value_delta + '% under</span>' : '<span class="t-over">' + (-l.value_delta) + '% over</span>'; } },
    { key: 'title', label: 'Listing', render: function (l) {
      var title = l.title || l.address_normalized || 'Listing';
      return '<button type="button" class="t-title" data-open="' + esc(l.listing_uid) + '" aria-label="Open ledger for ' + esc(title) + '">' +
        '<span class="t-title__name">' + esc(title) + '</span><span class="t-title__action" aria-hidden="true">Open ledger</span></button>' +
        browseTrustLine(l);
    } },
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
    ['all', 'Everything'], ['cleared', 'Cleared every gate'], ['fresh', 'Fresh'], ['owner', 'Owner-direct'],
    ['clean', 'Clean buildings'], ['verify', 'Needs verification'], ['scam', 'Scam wall'],
  ];

  var BROWSE_BATCH = 50;

  function browseRow(l, openUid) {
    /* The row stays a row. Its Listing cell owns the native ledger button,
       which is the one sequential keyboard stop for this result. */
    return '<tr data-listing-row="' + esc(l.listing_uid) + '" class="' + (openUid === l.listing_uid ? 'is-open' : '') + '">' +
      COLS.map(function (c) { return '<td>' + c.render(l) + '</td>'; }).join('') + '</tr>';
  }

  function browseRows(listings, openUid) {
    return listings.map(function (listing) { return browseRow(listing, openUid); }).join('');
  }

  function browseLoadedText(rendered, total) {
    if (rendered >= total) return 'All ' + total + ' matching listing' + (total === 1 ? '' : 's') + ' loaded.';
    return rendered + ' of ' + total + ' matching listings loaded.';
  }

  function browseMoreText(rendered, total) {
    var next = Math.min(BROWSE_BATCH, total - rendered);
    return 'Show next ' + next + ' listing' + (next === 1 ? '' : 's');
  }

  function renderBrowse(page) {
    var f = filtered();
    var clearCount = POOL.filter(C.isFullFit).length;
    var mappedCount = POOL.filter(hasValidLngLat).length;
    var renderedCount = Math.min(BROWSE_BATCH, f.length);
    var openUid = window.__VERAL ? window.__VERAL.openUid() : null;
    page.innerHTML =
      '<section class="workspace workspace--browse" data-workspace="browse">' +
        '<header class="workspacehead">' +
          '<div><p class="kicker">Signal desk</p><h1 class="workspacehead__title">Every listing in the four-borough net</h1>' +
          '<p class="workspacehead__lede">Search once, compare the evidence, keep the city record beside the listing.</p></div>' +
          '<dl class="workspace-metrics" aria-label="Current VERA publication">' +
            '<div><dt>Net</dt><dd>' + POOL.length + '</dd></div>' +
            '<div><dt>Filtered</dt><dd>' + f.length + '</dd></div>' +
            '<div><dt>Clear</dt><dd>' + clearCount + '</dd></div>' +
            '<div><dt>Mapped</dt><dd>' + mappedCount + '</dd></div>' +
          '</dl>' +
        '</header>' +
        '<div class="signalbar">' +
          '<div class="pills" aria-label="Listing lenses">' + VIEW_PILLS.map(function (v) {
            return '<button type="button" data-view="' + v[0] + '" class="' + (state.view === v[0] ? 'is-on' : '') + '">' + v[1] + '</button>';
          }).join('') + '</div>' +
        '</div>' +
        '<div class="dtoolbar" role="search">' +
          '<label class="command-search"><span class="sr-only">Search listings</span>' +
            '<input type="search" name="vera-search" autocomplete="off" placeholder="Search the four-borough net by listing, neighborhood, address, or source…" value="' + esc(state.q) + '" data-q aria-label="Search listings" aria-keyshortcuts="Meta+K Control+K">' +
            '<kbd aria-hidden="true">⌘K</kbd></label>' +
          '<span class="dtoolbar__count" data-browse-count aria-live="polite">' + f.length + ' matches · ' + renderedCount + ' loaded</span>' +
          '<span class="dtoolbar__density" aria-label="Result density">' +
            '<button type="button" data-density="comfortable" class="' + (state.density === 'comfortable' ? 'is-on' : '') + '">Roomy</button>' +
            '<button type="button" data-density="compact" class="' + (state.density === 'compact' ? 'is-on' : '') + '">Dense</button>' +
          '</span>' +
        '</div>' +
      '<div class="tablewrap"><table class="dt ' + (state.density === 'compact' ? 'is-compact' : '') + '" aria-rowcount="' + (f.length + 1) + '">' +
        '<caption class="sr-only" data-browse-caption>' + browseLoadedText(renderedCount, f.length) + (renderedCount < f.length ? ' Use the control after the table to load more.' : '') + '</caption>' +
        '<thead><tr>' +
        COLS.map(function (c) {
          var on = state.sort.key === c.key;
          return '<th class="' + (on ? 'is-sort' : '') + '"' + (on ? ' aria-sort="' + (state.sort.dir < 0 ? 'descending' : 'ascending') + '"' : '') + '>' +
            '<button type="button" data-sort="' + c.key + '">' + c.label +
              (on ? ' <span class="dir" aria-hidden="true">' + (state.sort.dir < 0 ? '▼' : '▲') + '</span>' : '') +
            '</button></th>';
        }).join('') +
      '</tr></thead><tbody data-browse-body>' +
        (f.length ? browseRows(f.slice(0, renderedCount), openUid) : '<tr><td colspan="' + COLS.length + '" class="dt__empty">Nothing matches this lens. Widen a tier or clear a filter.</td></tr>') +
      '</tbody></table></div>' +
      (renderedCount < f.length ? '<div class="browse-more"><p data-browse-progress aria-live="polite" aria-atomic="true">' + browseLoadedText(renderedCount, f.length) + '</p>' +
        '<button type="button" data-browse-more>' + browseMoreText(renderedCount, f.length) + '</button></div>' : '') +
      '</section>';

    var qEl = $('[data-q]', page);
    qEl.addEventListener('input', function () {
      state.q = qEl.value;
      clearTimeout(qEl._t);
      qEl._t = setTimeout(function () { renderRoute(); var q2 = $('[data-q]'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } }, 160);
    });
    var more = $('[data-browse-more]', page);
    if (more) more.addEventListener('click', function () {
      var start = renderedCount;
      var end = Math.min(start + BROWSE_BATCH, f.length);
      var body = $('[data-browse-body]', page);
      if (!body || end <= start) return;
      body.insertAdjacentHTML('beforeend', browseRows(f.slice(start, end), openUid));
      renderedCount = end;
      var count = $('[data-browse-count]', page);
      if (count) count.textContent = f.length + ' matches · ' + renderedCount + ' loaded';
      var caption = $('[data-browse-caption]', page);
      if (caption) caption.textContent = browseLoadedText(renderedCount, f.length) + (renderedCount < f.length ? ' Use the control after the table to load more.' : '');
      var progress = $('[data-browse-progress]', page);
      if (progress) progress.textContent = browseLoadedText(renderedCount, f.length);
      if (renderedCount >= f.length) {
        more.hidden = true;
      } else {
        more.textContent = browseMoreText(renderedCount, f.length);
      }
      var firstNewOpen = $$('tr[data-listing-row] .t-title[data-open]', body)[start];
      if (firstNewOpen) firstNewOpen.focus();
    });
    renderFilters();
  }

  /* ================================================================
     ATLAS — lazy street/building map with an honest drawn-city fallback.
     ================================================================ */

  function loadScript(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { res(); };
      s.onerror = function () { rej(new Error('failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  /* The map engine is a megabyte of WebGL the Today page never uses. It
     loads the first time Atlas opens, exactly once; if the load itself
     fails, the drawn-city fallback takes over and stays honest about it. */
  var mapAssetState = 'idle'; /* idle → loading → ready | failed */
  var mapAssetPromise = null;
  /* The map style, glyphs, and sprites are vendored locally so the Atlas never
     hangs on an external style fetch; only the vector tiles themselves still
     stream from the OpenFreeMap data CDN. */
  var mapStyleURL = './assets/vendor/maplibre/style/liberty-local.json';
  function absoluteMapAssetURL(value) {
    if (!value || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.indexOf('//') === 0) return value;
    /* URL() encodes the MapLibre {fontstack}/{range} placeholders. Keep local
       style templates byte-for-byte while making their base unambiguous. */
    if (value.charAt(0) === '/') return window.location.origin + value;
    var openToken = '__vera_open_brace__';
    var closeToken = '__vera_close_brace__';
    return new URL(value.replace(/\{/g, openToken).replace(/\}/g, closeToken), window.location.href).href
      .replace(new RegExp(openToken, 'g'), '{')
      .replace(new RegExp(closeToken, 'g'), '}');
  }
  function loadMapAssets() {
    if (mapAssetState === 'failed') return Promise.reject(new Error('map assets failed'));
    if (window.maplibregl && window.__VERA_MAP_STYLE__) { mapAssetState = 'ready'; return Promise.resolve(); }
    if (mapAssetState === 'loading') return mapAssetPromise;
    mapAssetState = 'loading';
    /* Establish the tile connection only after the visitor opens Atlas. This
       overlaps it with the local MapLibre download without contacting the map
       host from Today, Browse, or any other route that never uses the map. */
    if (!document.querySelector('link[data-vera-map-origin]')) {
      var origin = document.createElement('link');
      origin.rel = 'preconnect';
      origin.href = 'https://tiles.openfreemap.org';
      origin.crossOrigin = 'anonymous';
      origin.setAttribute('data-vera-map-origin', '');
      document.head.appendChild(origin);
    }
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = './assets/vendor/maplibre/maplibre-gl.css';
    document.head.appendChild(css);
    var stylePromise = fetch(mapStyleURL, { mode: 'cors', credentials: 'omit' }).then(function (response) {
      if (!response.ok) throw new Error('failed to load the vendored map style');
      return response.json();
    }).then(function (style) {
      /* MapLibre resolves root-relative glyph URLs from an inline style, but
         its sprite loader needs a fully qualified base when the style arrives
         as an object instead of a URL. Normalize both local templates so the
         vendored assets follow one explicit same-origin path. */
      if (typeof style.sprite === 'string') style.sprite = absoluteMapAssetURL(style.sprite);
      else if (Array.isArray(style.sprite)) style.sprite.forEach(function (entry) {
        if (entry && entry.url) entry.url = absoluteMapAssetURL(entry.url);
      });
      if (style.glyphs) style.glyphs = absoluteMapAssetURL(style.glyphs);
      window.__VERA_MAP_STYLE__ = style;
    });
    mapAssetPromise = Promise.all([
      window.maplibregl ? Promise.resolve() : loadScript('./assets/vendor/maplibre/maplibre-gl.js'),
      stylePromise,
    ]).then(function () {
      mapAssetState = 'ready';
    }, function (e) {
      mapAssetState = 'failed';
      throw e;
    });
    return mapAssetPromise;
  }

  function atlasHeader(mapped, total) {
    return '<header class="workspacehead workspacehead--atlas">' +
      '<div><p class="kicker">Four-borough lens</p><h1 class="workspacehead__title">Atlas</h1>' +
      '<p class="workspacehead__lede">Open near downtown Manhattan, then move through Manhattan, Brooklyn, Queens and the Bronx. Switch to the evidence list at any time.</p></div>' +
      '<div class="workspacehead__actions"><span class="workspace-count"><b>' + mapped + '</b> mapped · ' + total + ' in scope</span>' +
      '<div class="atlas-mode" role="group" aria-label="Atlas view"><button type="button" data-atlas-mode="map" aria-pressed="' + (state.atlasMode === 'map' ? 'true' : 'false') + '" class="' + (state.atlasMode === 'map' ? 'is-on' : '') + '">Map</button>' +
      '<button type="button" data-atlas-mode="list" aria-pressed="' + (state.atlasMode === 'list' ? 'true' : 'false') + '" class="' + (state.atlasMode === 'list' ? 'is-on' : '') + '">List</button></div></div>' +
    '</header>';
  }

  var ATLAS_BOROUGHS = { manhattan: 1, brooklyn: 1, queens: 1, bronx: 1 };

  function atlasScope(listings) {
    return listings.filter(function (listing) {
      if (!ATLAS_BOROUGHS[String(listing.borough || '').trim().toLowerCase()]) return false;
      if (!hasValidLngLat(listing)) return true;
      return !!(window.__VERAG && window.__VERAG.ready && window.__VERAG.ready() && window.__VERAG.withinAtlasBoroughs && window.__VERAG.withinAtlasBoroughs(listing));
    });
  }

  function atlasListContents(listings) {
    var sorted = listings.slice().sort(function (a, b) { return (a.transit_mins || 999) - (b.transit_mins || 999); });
    return '<div class="panel__head"><h2 class="panel__title">Closest to a train</h2><p class="panel__hint">' + (state.atlasMode === 'map' ? 'tap to focus' : 'tap to inspect') + '</p></div>' +
      (sorted.length ? '<div class="walklist">' + sorted.map(function (l) {
        var t = C.nearestStation(l);
        var title = l.title || l.address_normalized || 'listing';
        var action = state.atlasMode === 'map'
          ? ' data-atlas-focus="' + esc(l.listing_uid) + '" aria-label="Focus ' + esc(title) + ' on the Atlas map"'
          : ' data-open="' + esc(l.listing_uid) + '" aria-label="Open ledger for ' + esc(title) + '"';
        return '<button type="button" class="walkrow"' + action + '>' +
          '<span class="walkrow__min">' + (t ? '≈' + t.mins : '—') + '<small>min</small></span>' +
          '<span class="walkrow__body"><b>' + esc(title) + '</b>' +
          '<span>' + (t ? C.lineBullets(t.lines) + ' ' + esc(t.name) : 'no station within reach') + '</span></span>' +
          '<span class="walkrow__rent">' + money(l.rent) + '</span></button>';
      }).join('') + '</div>' : '<p class="lane__empty">Nothing with coordinates under this lens yet.</p>');
  }

  function atlasListPane(listings) {
    return '<div class="panel atlas-list-pane">' + atlasListContents(listings) + '</div>';
  }

  function refreshAtlasMap() {
    var page = $('#main [data-page="atlas"]');
    var map = page && $('[data-veramap]', page);
    if (!map || !window.__VERAM || !window.__VERAM.update) return false;
    var all = atlasScope(filtered());
    var mapped = all.filter(hasValidLngLat);
    window.__VERAM.update(mapped);
    var count = $('.workspace-count', page);
    if (count) count.innerHTML = '<b>' + mapped.length + '</b> mapped · ' + all.length + ' in scope';
    var list = $('.atlas-list-pane', page);
    if (list) list.innerHTML = atlasListContents(mapped);
    syncPressed(page);
    announceRoute();
    return true;
  }

  function renderAtlas(page) {
    var f0 = atlasScope(filtered());
    var geo0 = f0.filter(hasValidLngLat);
    /* List is a complete, keyboard-native Atlas view. Do not allocate a
       hidden canvas or contact the tile host until the visitor chooses Map. */
    if (state.atlasMode === 'list') {
      if (window.__VERAM) window.__VERAM.destroy();
      page.innerHTML =
        '<section class="workspace workspace--atlas" data-workspace="atlas">' + atlasHeader(geo0.length, f0.length) +
        '<div class="maplay atlas-layout atlas-layout--list">' + atlasListPane(geo0) + '</div></section>';
      page.classList.add('is-entered');
      renderFilters();
      return;
    }
    if (!window.maplibregl && mapAssetState !== 'failed') {
      page.innerHTML =
        '<section class="workspace workspace--atlas" data-workspace="atlas">' + atlasHeader(geo0.length, f0.length) +
        '<div class="panel mapwrap maploader" data-map-loading role="region" aria-label="Atlas street map loading"><span class="maploader__mark" aria-hidden="true"></span>' +
          '<p role="status"><strong>Opening the city.</strong><br>The evidence list is ready while live streets and buildings load.</p>' +
          '<button type="button" class="ghostbtn" data-atlas-mode="list">Open evidence list</button></div>';
      page.innerHTML += '</section>';
      page.classList.add('is-entered');
      renderFilters();
      var redrawAfterMapAssets = function () {
        if (state.route !== 'atlas') return;
        var active = document.activeElement;
        var restoreModeFocus = !!(active && active.hasAttribute && active.hasAttribute('data-atlas-mode'));
        renderRoute();
        if (restoreModeFocus) requestAnimationFrame(function () {
          var selectedMode = $('[data-atlas-mode="' + state.atlasMode + '"]');
          if (selectedMode) selectedMode.focus();
        });
      };
      loadMapAssets().then(redrawAfterMapAssets, redrawAfterMapAssets);
      return;
    }
    if (window.__VERAM && window.__VERAM.available()) {
      page.innerHTML =
        '<section class="workspace workspace--atlas" data-workspace="atlas">' + atlasHeader(geo0.length, f0.length) +
        '<div class="maplay maplay--vector atlas-layout atlas-layout--' + state.atlasMode + '">' +
          '<div class="panel mapwrap atlas-map-pane"><div class="veramap" data-veramap role="region" aria-label="Interactive street and building map of listings. Use List view for a text alternative." aria-describedby="vera-atlas-map-note"></div>' +
            '<p class="atlas-map-note" id="vera-atlas-map-note"><strong>Street + building context.</strong> Atlas excludes Staten Island, New Jersey, and Nassau/Suffolk listings. Pins reflect feed coordinates; footprints are context, not a verified unit match. Some listings share one coordinate; List shows every record.</p>' +
            '<div class="mp-key">' +
              '<span class="mp-key__i"><i class="mp-swatch mp-swatch--point"></i>Listing coordinate</span>' +
              '<span class="mp-key__i"><i class="mp-swatch mp-swatch--good"></i>Clears the bar</span>' +
              '<span class="mp-key__i"><i class="mp-swatch mp-swatch--warn"></i>Needs verification</span>' +
              '<span class="mp-key__i"><i class="mp-swatch mp-swatch--bad"></i>Scam wall</span>' +
              '<span class="mp-key__i">tiles © OpenFreeMap · OpenMapTiles · OpenStreetMap contributors</span>' +
            '</div></div>' +
          atlasListPane(geo0) + '</div></section>';
      page.classList.add('is-entered');
      renderFilters();
      var mapContainer = page.querySelector('[data-veramap]');
      /* `renderAtlas` can run inside startViewTransition's synchronous DOM
         callback. Construct MapLibre on the next layout frame instead: a
         remounted canvas otherwise can retain the outgoing route snapshot,
         leaving controls visible but the city and listing layers blank. */
      window.requestAnimationFrame(function () {
        if (state.route !== 'atlas' || state.atlasMode !== 'map' || !page.isConnected || !mapContainer || !mapContainer.isConnected) return;
        var mounted = window.__VERAM.mount(mapContainer, geo0, function (uid) {
          if (window.__VERAL) window.__VERAL.open(uid);
        }, function (failure) {
          if (state.route !== 'atlas' || state.atlasMode !== 'map' || !page.isConnected) return;
          renderAtlasFailure(page, failure, f0, geo0);
        });
        if (mounted) {
          var pendingAtlasUid = localRead('vera-atlas-focus');
          if (pendingAtlasUid) {
            localWrite('vera-atlas-focus', '');
            var focusPendingListing = function () {
              if (state.route === 'atlas' && window.__VERAM && window.__VERAM.flyTo) window.__VERAM.flyTo(pendingAtlasUid);
            };
            window.setTimeout(focusPendingListing, 700);
          }
          return;
        }
        /* WebGL or tiles refused — fall through to the drawn city. */
        renderAtlasFallback(page);
      });
      return;
    }
    renderAtlasFallback(page);
  }

  function renderAtlasFailure(page, failure, scoped, mapped) {
    var failureDetail = failure && failure.errors ? failure.errors.join(' | ') : '';
    page.innerHTML =
      '<section class="workspace workspace--atlas" data-workspace="atlas">' + atlasHeader(mapped.length, scoped.length) +
      '<div class="panel mapfailure" role="alert" data-map-errors="' + esc(failureDetail) + '"><p class="kicker">Atlas connection paused</p>' +
      '<h2>The city did not finish drawing.</h2><p>The local map design loaded, but live street tiles did not arrive. Your listing evidence is still available in List view, and the drawn-city backup remains here.</p>' +
      '<div class="mapfailure__actions"><button type="button" class="bigbtn" data-map-retry>Try the map again</button><button type="button" class="ghostbtn" data-atlas-mode="list">Open evidence list</button></div></div>' +
      '<div data-atlas-fallback></div></section>';
    var fallback = $('[data-atlas-fallback]', page);
    if (fallback) renderAtlasFallback(fallback, true);
    var retryButton = $('[data-map-retry]', page);
    if (retryButton) retryButton.addEventListener('click', function () {
      mapAssetState = 'idle'; mapAssetPromise = null; renderRoute();
    });
    page.classList.add('is-entered');
  }

  function renderAtlasFallback(page, embedded) {
    var M = C.MAP;
    var f = atlasScope(filtered());
    var geo = f.filter(hasValidLngLat);
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
      (embedded ? '' : '<section class="workspace workspace--atlas" data-workspace="atlas">' + atlasHeader(placed.length, f.length)) +
      '<div class="maplay atlas-layout atlas-layout--' + state.atlasMode + '">' +
        '<div class="panel mapwrap atlas-map-pane">' +
          '<div class="panel__head"><h2 class="panel__title">Rivers, trains, and ' + placed.length + ' listings</h2>' +
          '<p class="panel__hint">' + placed.length + ' plotted' +
            (outside ? ' · ' + outside + ' outside the zone' : '') +
            (lost ? ' · ' + lost + ' without coordinates' : '') + '</p></div>' +
          '<svg class="mp" data-sky="' + C.skyOf(sweepHour()) + '" viewBox="0 0 ' + M.VW + ' ' + M.VH + '" role="img" aria-label="Map of listings and subway stations">' +
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
        '<div class="panel atlas-list-pane"><div class="panel__head"><h2 class="panel__title">Closest to a train</h2><p class="panel__hint">tap to inspect</p></div>' +
          (sorted.length ? '<div class="walklist">' + sorted.map(function (l) {
            var t = C.nearestStation(l);
            return '<button type="button" class="walkrow" data-open="' + esc(l.listing_uid) + '">' +
              '<span class="walkrow__min">' + (t ? '≈' + t.mins : '—') + '<small>min</small></span>' +
              '<span class="walkrow__body"><b>' + esc(l.title || l.address_normalized || 'Listing') + '</b>' +
              '<span>' + (t ? C.lineBullets(t.lines) + ' ' + esc(t.name) : 'no station within reach') + '</span></span>' +
              '<span class="walkrow__rent">' + money(l.rent) + '</span></button>';
          }).join('') + '</div>' : '<p class="lane__empty">Nothing with coordinates under this lens yet — widen a filter.</p>') +
        '</div>' +
      '</div>' + (embedded ? '' : '</section>');
    page.classList.add('is-entered');
    renderFilters();
  }

  /* ================================================================
     MY HUNT — a renter-controlled local pipeline.
     ================================================================ */

  function renderHunt(page) {
    var uids = Object.keys(cases);
    var liveUids = uids.filter(function (uid) { return cases[uid].stage !== 'dead' && byUid(uid); });
    var demoMode = !liveUids.length;
    var records = demoMode
      ? POOL.filter(C.isFullFit).sort(function (a, b) { return (+b.overall_score || 0) - (+a.overall_score || 0); }).slice(0, 5)
      : liveUids.map(byUid).filter(Boolean);
    if (!records.length) records = POOL.slice().sort(function (a, b) { return (+b.overall_score || 0) - (+a.overall_score || 0); }).slice(0, 5);

    if (!records.length) {
      page.innerHTML = '<div class="empty-hero"><h1>The decision room is waiting for tonight\'s publication.</h1>' +
        '<p>VERA will place the strongest current records here as soon as the public feed is available.</p></div>';
      return;
    }

    var selected = byUid(state.huntSelected);
    if (!selected || records.indexOf(selected) === -1) selected = records[0];
    state.huntSelected = selected.listing_uid;
    var selectedCase = caseOf(selected.listing_uid);
    var selectedStage = selectedCase ? selectedCase.stage : 'saved';
    var activeStageIndex = Math.max(0, STAGES.filter(function (stage) { return stage.id !== 'dead'; }).map(function (stage) { return stage.id; }).indexOf(selectedStage));
    var clearCount = POOL.filter(C.isFullFit).length;
    var selectedTransit = C.nearestStation(selected);
    var selectedMoveIn = C.moveInMath(selected);
    var selectedOwner = C.ownerRead(selected);
    var selectedValue = valueRead(selected);
    var selectedAuth = C.authenticity(selected);
    var strengths = (selected.trust_strengths || []).slice(0, 3);
    var caveats = (selected.trust_caveats || selected.what_to_verify_before_applying || []).slice(0, 3);
    var stageFlow = STAGES.filter(function (stage) { return stage.id !== 'dead'; });
    var moveInWatch = '';
    if (selectedCase && selectedCase.stage === 'signed' && selectedCase.signedAt) {
      var daysSinceSigning = Math.floor((Date.now() - new Date(selectedCase.signedAt + 'T12:00:00Z')) / 864e5);
      var daysToRenewalWatch = 300 - daysSinceSigning;
      moveInWatch = '<aside class="movein-watch" aria-label="Move-in law watch"><b>Signed ' + esc(selectedCase.signedAt) + '</b>' +
        (daysSinceSigning < 7 ? '<span>Day one: request the rent history; New York State mails it to the apartment.</span>' : '') +
        '<span>' + (daysToRenewalWatch > 0 ? 'Renewal watch in ' + daysToRenewalWatch + ' days.' : 'Renewal window: start the conversation.') + '</span>' +
        '<span>At move-out: deposit back in ' + C.LAW.depositReturnDays + ' days, itemized, by law.</span></aside>';
    }

    page.innerHTML =
      '<section class="workspace workspace--hunt" data-workspace="hunt">' +
        '<header class="workspacehead">' +
          '<div><p class="kicker">Decision room</p><h1 class="workspacehead__title">My Hunt</h1>' +
          '<p class="workspacehead__lede">Compare the shortlist, inspect the record, and move one decision forward.</p></div>' +
          '<div class="hunt-privacy"><b>' + (demoMode ? 'VERA\'s suggested shortlist' : liveUids.length + ' saved locally') + '</b>' +
          '<span>' + (demoMode ? clearCount + ' listings currently clear every published gate' : 'No account · nothing uploaded') + '</span></div>' +
        '</header>' +
        '<div class="decision-layout">' +
          '<aside class="shortlist" aria-label="' + (demoMode ? 'Suggested shortlist' : 'Your shortlist') + '">' +
            '<div class="shortlist__head"><div><h2>Shortlist</h2><p>' + records.length + ' of ' + Math.max(clearCount, records.length) + ' clear</p></div>' +
            '<a href="#/browse">Compare all</a></div>' +
            '<div class="shortlist__list">' + records.map(function (listing, index) {
              var recordCase = caseOf(listing.listing_uid);
              var name = addressOf(listing) || C.charName(listing);
              return '<button type="button" class="shortlist-row' + (listing === selected ? ' is-selected' : '') + '" data-hunt-select="' + esc(listing.listing_uid) + '" aria-pressed="' + (listing === selected ? 'true' : 'false') + '">' +
                '<span class="shortlist-row__index">' + String(index + 1).padStart(2, '0') + '</span>' +
                '<span class="shortlist-row__body"><b>' + esc(name) + '</b><span>' + money(listing.rent) + ' · ' + esc(listing.neighborhood || 'NYC') + '</span>' +
                '<small>' + (recordCase ? esc((STAGES.filter(function (stage) { return stage.id === recordCase.stage; })[0] || { label: 'Saved' }).label) : esc(listing.source_name || 'public listing')) + '</small></span>' +
                '<span class="shortlist-row__score">' + (listing.overall_score != null ? num(listing.overall_score, 1) : '—') + '</span>' +
              '</button>';
            }).join('') + '</div>' +
            (demoMode ? '<p class="shortlist__note">This is a live-data preview. Saving a listing creates your private, browser-only hunt.</p>' : '') +
          '</aside>' +
          '<article class="casebook" aria-labelledby="casebook-title">' +
            '<header class="casebook__head"><div><p class="kicker">Selected listing</p><h2 id="casebook-title">' + esc(addressOf(selected) || C.charName(selected)) + '</h2>' +
              '<p>' + money(selected.rent) + ' · ' + esc(selected.neighborhood || 'NYC') + ' · ' + esc(selected.source_name || 'public listing') + '</p></div>' +
              '<div class="casebook-score"><span>VERA score</span><b>' + (selected.overall_score != null ? num(selected.overall_score, 1) : '—') + '</b><em>' + esc(selected.recommendation || 'Review') + '</em></div></header>' +
            '<div class="casebook__tabs" aria-label="Casebook actions"><span class="casebook__current" aria-current="page">Casebook</span>' +
              '<button type="button" data-open="' + esc(selected.listing_uid) + '">Open full ledger</button></div>' +
            moveInWatch +
            '<div class="evidence-grid">' +
              '<section class="evidence-card evidence-card--facts"><h3>Record</h3><dl>' +
                '<div><dt>Unit</dt><dd>' + esc(C.unitOf(selected) === 'studio' ? 'Studio' : C.unitOf(selected) === '1br' ? 'One bedroom' : selected.unit_type || 'Unconfirmed') + '</dd></div>' +
                '<div><dt>Source</dt><dd>' + esc(selected.source_name || '—') + '</dd></div>' +
                '<div><dt>Last seen</dt><dd>' + timeago(selected.last_seen_at) + '</dd></div>' +
                '<div><dt>Owner read</dt><dd>' + esc(selectedOwner.label) + '</dd></div>' +
                '<div><dt>Authenticity</dt><dd>' + (selectedAuth != null ? num(selectedAuth) + '/100' : 'Unproven') + '</dd></div>' +
                '<div><dt>Move-in</dt><dd>' + (selectedMoveIn && selectedMoveIn.total ? money(selectedMoveIn.total) : 'Verify') + '</dd></div>' +
              '</dl></section>' +
              '<section class="evidence-card evidence-card--score"><h3>Why it scored this way</h3>' +
                (strengths.length ? '<ul class="evidence-list evidence-list--good">' + strengths.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') + '</ul>' : '<p class="evidence-empty">No positive claim is inferred beyond the published record.</p>') +
                (caveats.length ? '<ul class="evidence-list evidence-list--warn">' + caveats.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') + '</ul>' : '<p class="evidence-empty">No material caveat in the current public record.</p>') +
              '</section>' +
              '<section class="evidence-card"><h3>Commute</h3><p class="evidence-big">' + (selectedTransit ? '≈' + selectedTransit.mins + ' min' : 'Not mapped') + '</p><p>' + (selectedTransit ? C.lineBullets(selectedTransit.lines) + ' ' + esc(selectedTransit.name) : 'No reliable station walk yet') + '</p></section>' +
              '<section class="evidence-card"><h3>Risks</h3><dl class="signal-list"><div><dt>HPD risk</dt><dd>' + num(selected.hpd_risk_score) + '</dd></div><div><dt>DOB risk</dt><dd>' + (selected.dob_risk_score != null ? num(selected.dob_risk_score) : '—') + '</dd></div><div><dt>Verification</dt><dd>' + (C.needsVerify(selected) ? 'Needed' : 'Clear') + '</dd></div></dl></section>' +
              '<section class="evidence-card"><h3>Signals</h3><dl class="signal-list"><div><dt>Days on market</dt><dd>' + (selected.true_days_on_market != null ? selected.true_days_on_market + 'd' : '—') + '</dd></div><div><dt>Area value</dt><dd>' + (selectedValue ? esc(selectedValue.label) : 'No reliable peer set') + '</dd></div><div><dt>Rent-stabilized</dt><dd>' + (C.stabilized(selected) ? esc(C.stabilized(selected).label) : 'No signal') + '</dd></div></dl></section>' +
            '</div>' +
            '<section class="decision-timeline"><div class="decision-timeline__head"><div><h3>Decision timeline</h3><p>' + (selectedCase ? 'Stored only in this browser.' : 'Preview the path, then save when it earns a place.') + '</p></div>' +
              (selectedCase ? '<button type="button" class="ghostbtn" data-open="' + esc(selected.listing_uid) + '">Open notes</button>' : '<button type="button" class="bigbtn" data-stage="saved" data-uid="' + esc(selected.listing_uid) + '">Save decision</button>') + '</div>' +
              '<ol>' + stageFlow.map(function (stage, index) {
                var done = selectedCase && index <= activeStageIndex;
                var stateClass = done ? 'is-done' : index === activeStageIndex + 1 ? 'is-next' : '';
                return '<li class="' + stateClass + '">' +
                  (selectedCase
                    ? '<button type="button" data-stage="' + stage.id + '" data-uid="' + esc(selected.listing_uid) + '"' + (stage.id === selectedStage ? ' disabled aria-current="step"' : '') + '>'
                    : '<span class="decision-step">') +
                  '<span aria-hidden="true"></span><b>' + esc(stage.label) + '</b><small>' + esc(stage.hint) + '</small>' +
                  (selectedCase ? '</button>' : '</span>') + '</li>';
              }).join('') + '</ol></section>' +
          '</article>' +
        '</div>' +
        '<section class="hunt-erase" aria-labelledby="erase-vera-title">' +
          '<div><p class="kicker">Local privacy</p><h2 id="erase-vera-title">Erase my VERA workspace</h2>' +
          '<p>Your saved listings, notes, filters, address checks, and local preferences stay in this browser. This removes every VERA local-storage entry and nothing else on Little Fight.</p></div>' +
          '<button type="button" class="ghostbtn" data-erase-vera aria-expanded="false" aria-controls="erase-vera-confirm">Erase my VERA workspace…</button>' +
          '<div id="erase-vera-confirm" class="hunt-erase__confirm" hidden>' +
            '<p>This cannot be undone. The shared public feed will not change.</p>' +
            '<div class="hunt-erase__actions"><button type="button" class="ghostbtn" data-erase-vera-cancel>Keep my workspace</button><button type="button" class="ghostbtn hunt-erase__confirm-button" data-erase-vera-confirm>Erase workspace now</button></div>' +
          '</div>' +
          '<p class="hunt-erase__status" data-erase-vera-status role="status" aria-live="polite" tabindex="-1">' + esc(eraseNotice) + '</p>' +
        '</section>' +
      '</section>';
    page.classList.add('is-entered');
    countUps(page);
  }

  /* ================================================================
     FIELD MANUAL — money law, scam school, the viewing checklist.
     ================================================================ */

  var toolRent = 2400;
  var toolIncome = +((typeof profile !== 'undefined' && profile.income) || 0);

  function manualVerdict(rent, income) {
    var need = rent * C.LAW.incomeRuleX;
    var guarNeed = rent * C.LAW.guarantorRuleX;
    if (!income) return '<p class="insp-fine">Set your income and VERA does the landlord math landlords do.</p>';
    if (income >= need) return '<p class="verdict verdict--good">Clears the 40× bar for ' + money(rent) + ' — you can walk in without a guarantor.</p>';
    return '<p class="verdict verdict--warn">Short of the 40× bar (' + money(need) + ' needed). A guarantor showing ' + money(guarNeed) + ', or an institutional guarantor for roughly ' + money(Math.round(rent * C.LAW.guarantorTypicalPct)) + ' once, closes the gap.</p>';
  }

  function updateManualTools(page) {
    $('[data-tool-rent-label]', page).textContent = money(toolRent);
    $('[data-tr-first]', page).textContent = money(toolRent);
    $('[data-tr-dep]', page).textContent = money(toolRent * C.LAW.depositMaxMonths);
    $('[data-tr-total]', page).textContent = money(toolRent + toolRent * C.LAW.depositMaxMonths + C.LAW.appFeeMax);
    $('[data-tool-inc-label]', page).textContent = toolIncome ? money(toolIncome) : 'drag me';
    $('[data-tool-verdict]', page).innerHTML = manualVerdict(toolRent, toolIncome);
  }

  function renderManual(page) {
    var r = toolRent;
    var deposit = r * C.LAW.depositMaxMonths;
    var total = r + deposit + C.LAW.appFeeMax;

    page.innerHTML =
      '<header class="pagehead"><p class="kicker">Field manual</p>' +
      '<h1 class="pagehead__title">Know more than the other side</h1>' +
      '<p class="pagehead__lede">New York rent law hands tenants hard numbers. Scammers hand them scripts. Both are learnable in one sitting.</p></header>' +

      '<div class="grid grid--2">' +
        '<div class="panel tool"><div class="panel__head"><h2 class="panel__title">What it really costs to move in</h2><p class="panel__hint">NY law, not vibes</p></div>' +
          '<label class="slider"><span>Monthly rent <b data-tool-rent-label>' + money(r) + '</b></span>' +
          '<input type="range" name="vera-tool-rent" min="1200" max="3000" step="50" value="' + r + '" data-tool-rent></label>' +
          '<div class="ledger">' +
            '<div class="ledger__row"><span>First month</span><b data-tr-first>' + money(r) + '</b></div>' +
            '<div class="ledger__row"><span>Security <em>1 month max, by law</em></span><b data-tr-dep>' + money(deposit) + '</b></div>' +
            '<div class="ledger__row"><span>Screening <em>actual cost or $20, whichever is less</em></span><b>up to $' + C.LAW.appFeeMax + '</b></div>' +
            '<div class="ledger__row ledger__row--zero"><span>Broker fee <em>owner-direct</em></span><b>$0</b></div>' +
            '<div class="ledger__row ledger__row--total"><span>Total to keys <em>using the $20 maximum</em></span><b data-tr-total>' + money(total) + '</b></div>' +
          '</div>' +
          '<p class="insp-fine">The FARE Act has applied since ' + C.LAW.fareActFrom + ': a broker representing the landlord, or publishing their listing with permission, cannot charge you. A broker you independently hire can. Get every amount due itemized in writing before signing.</p>' +
          /* VERA scans every listing for these five demands; the manual has
             to teach all five or the app knows something it never told you. */
          '<h3 class="unlawful__h">Five demands that are simply unlawful</h3>' +
          '<ul class="unlawful">' +
            '<li><b>More than one month\'s security.</b> "First, last and one month" is three months of your money and two months more than the law allows. <i>HSTPA, 2019.</i></li>' +
            '<li><b>A screening charge above the actual cost or $' + C.LAW.appFeeMax + '.</b> A qualifying credit or background report from the last 30 days waives it. <i>NYS Real Property Law §238-a.</i></li>' +
            '<li><b>An extra holding, "good-faith," reservation, or key fee.</b> For a standard residential rental, a landlord cannot demand that extra payment before or at the beginning of the tenancy. Lawful rent and up to one month of security may still be due under the lease. <i>NYS Real Property Law §238-a.</i></li>' +
            '<li><b>Key money, or a tip for the super.</b> A payment to get the keys or move up the list is illegal however it is phrased. <i>Illegal in New York.</i></li>' +
            '<li><b>A broker fee when the landlord hired the broker.</b> If they found the agent, they pay the agent. <i>FARE Act, ' + C.LAW.fareActFrom + '.</i></li>' +
          '</ul>' +
          '<p class="insp-fine">VERA reads every listing against these five and says so on the listing itself when one appears. Plenty of small owners ask out of habit rather than malice — you still do not have to pay it, and asking them to put the demand in writing usually ends it.</p>' +
        '</div>' +
        '<div class="panel tool"><div class="panel__head"><h2 class="panel__title">Will the paperwork clear you</h2><p class="panel__hint">the 40× convention</p></div>' +
          '<label class="slider"><span>Your annual income <b data-tool-inc-label>' + (toolIncome ? money(toolIncome) : 'drag me') + '</b></span>' +
          '<input type="range" name="vera-tool-income" min="0" max="200000" step="5000" value="' + toolIncome + '" data-tool-income></label>' +
          '<div data-tool-verdict>' + manualVerdict(r, toolIncome) + '</div>' +
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
        var url = trustedURL(v[1], 'citation');
        return url ? '<a class="vtool" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>' : '';
      }).join('') + '</div></section>' +

      '<section class="manual-sec"><h2 class="manual-sec__title">Read the law itself</h2>' +
      '<p class="manual-sec__lede">These are the public sources behind the Field Manual. They are a starting point, not legal advice for a specific lease.</p>' +
      '<div class="vtools" data-legal-sources>' + C.LAW_SOURCES.map(function (source) {
        var url = trustedURL(source[1], 'citation');
        return url ? '<a class="vtool" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(source[0]) + ' ↗</b><span>' + esc(source[2]) + '</span></a>' : '';
      }).join('') + '</div></section>';

    page.classList.add('is-entered');

    /* Sliders update in place on input — a re-render mid-drag destroys the
       input under the pointer and turns the drag into one step per press. */
    var rentEl = $('[data-tool-rent]', page);
    rentEl.addEventListener('input', function () {
      toolRent = +rentEl.value;
      updateManualTools(page);
    });
    var incEl = $('[data-tool-income]', page);
    incEl.addEventListener('input', function () {
      toolIncome = +incEl.value;
      updateManualTools(page);
    });
    /* the manual's slider and the card qualification share one profile */
    incEl.addEventListener('change', function () { profile.income = toolIncome; saveProfile(); });
  }

  /* ================================================================
     SYSTEM — the machine, its sources, and its ethics.
     ================================================================ */

  /* Keep the serving contract visible beside the feed age. */
  var ORIGIN_NOTE = {
    site: 'Little Fight NYC’s live VERA feed',
  };

  /* "New tonight" is a comparison, and a comparison needs something to
     compare against. The engine keeps that history outside its checkout, so
     a run on a fresh machine — every cloud run before the memory was wired
     up — sees every listing for the first time and reports the entire pool
     as new. The Market page duly announced "231 new tonight" out of 231.

     No rental market turns over completely in a day. When the count is the
     whole pool it is not a market event, it is a missing memory, and saying
     so is the only honest read. */
  function newTonightKPI(sm, dc, fresh) {
    var n = sm.new_today != null ? sm.new_today : fresh.length;
    if (POOL.length && n >= POOL.length) {
      return kpi('New tonight', '—', 'first sweep with no prior night to compare', 'kpi--warn');
    }
    return kpi('New tonight', cval(n), (dc.gone || 0) + ' gone', 'kpi--good', 'fresh');
  }

  /* Derive receipts from the same first-party contract so the two endpoints
     cannot drift into different hosting paths. */
  function archiveOrigins() {
    return FEEDS.map(function (f) {
      return { url: f.url.replace(/public\.json(\?.*)?$/, 'archive.json'), label: f.label };
    });
  }

  function feedAge() {
    var t = Date.parse((D && D.generated_at) || '');
    if (!t) return '';
    var hours = (Date.now() - t) / 36e5;
    // The sweep is nightly, so a day and a half without one is a real fact
    // about the data, not a detail to bury.
    if (hours < 36) return '';
    var days = Math.floor(hours / 24);
    return ' <b class="warn">· ' + days + ' day' + (days === 1 ? '' : 's') + ' old — the last sweep did not land</b>';
  }

  /* The limitation VERA has to say out loud.

     Verification needs a street-number address, and the sources where
     small landlords actually post mostly do not carry one — 177 of 223
     craigslist records on 2026-08-04 had no house number, and checking
     the post body recovered three. So the slice VERA can check against
     city records skews hard toward buildings that are indexed BY
     address, which means bigger owners: on that day 32 of 33 verified
     listings belonged to landlords holding ten or more buildings.

     A product that grades landlords owes the reader the shape of its own
     blind spot. Computed from the live feed, so it cannot drift into a
     comforting fiction. */
  function verificationReach() {
    var pool = POOL.length;
    if (!pool) return '';
    var matched = POOL.filter(C.hasMatchedRecord);
    var withPf = matched.filter(function (l) { return (l.landlord_portfolio || {}).bldgs; });
    var big = withPf.filter(function (l) { return +l.landlord_portfolio.bldgs >= 10; }).length;
    var pct = Math.round(100 * matched.length / pool);
    return '<p>Of the <b>' + pool + '</b> listings in tonight\'s net, VERA could match <b>' +
      matched.length + '</b> — about <b>' + pct + '%</b> — to a building in the city\'s records. ' +
      'The rest are not hidden from you; they are in Browse. Most do not carry a usable house number, ' +
      'and others did not resolve strongly enough to a public record. Without a strong BBL match, ' +
      'VERA will not attach a building or landlord record.</p>' +
      (withPf.length
        ? '<p>That has a bias worth knowing before you read any grade here. Buildings are indexed ' +
          'by address, so the listings VERA <i>can</i> verify lean toward owners who post one — ' +
          'tonight <b>' + big + ' of ' + withPf.length + '</b> verified listings belonged to a landlord ' +
          'holding ten or more buildings. The small owner renting out two floors of their own house ' +
          'is the hardest to verify and the whole reason this exists. VERA is honest about not ' +
          'having found many of them yet.</p>'
        : '');
  }

  function renderSystem(page) {
    var order = ['discover', 'normalize', 'dedupe', 'enrich', 'score', 'publish'];
    var stages = D.stages || {};
    var trends = (D.run_trends || []).slice(-14);
    var rel = trends.map(function (t) { return +t.avg_reliability || 0; });
    var srcs = (D.sources || []).filter(function (s) { return s.source_name !== 'email_alerts'; });
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
          (rel.length ? sparkline(rel, 560, 170, '#c8a468', 'Average source reliability by VERA run') : '<p class="lane__empty">History arrives with the next publishes.</p>') + '</div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Run</h2><p class="panel__hint">' + esc(run.run_id || 'latest sweep') + '</p></div>' +
          '<dl class="kv">' +
            '<dt>Generated</dt><dd>' + esc(D.generated_at || '—') + feedAge() + '</dd>' +
            '<dt>Cadence</dt><dd>' + esc(run.cadence || 'nightly') + '</dd>' +
            '<dt>Served by</dt><dd>' + esc(ORIGIN_NOTE[feedOrigin] || 'unknown origin') + '</dd>' +
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
        '<p>Verified Evaluation for Rental Analysis is a Little Fight Lab system for NYC renters. It watches fragmented rental channels, joins the addresses it can resolve to public records, and labels every gap it cannot close.</p>' +
        '<p>Fairness on the record: every steward grade is computed from cited public records — never from any protected characteristic — and owners have a standing <a href="/vera/corrections/">correction channel</a>.</p>' +
        '<p>Read-only by principle: VERA never messages a landlord, never floods an inbox, never squats a viewing slot. It makes each renter better informed without making the market worse.</p>' +
        '<h3 class="ethos__h">What VERA cannot see</h3>' + verificationReach() +
        '<h3 class="ethos__h">What VERA is built on</h3>' +
        '<p>VERA separates public evidence from its own analysis. These are the foundations:</p>' +
        '<ul class="credits">' +
          '<li><b>NYC Open Data</b> — HPD violations, complaints and registrations; DOB records; 311; PLUTO; ACRIS.</li>' +
          '<li><b>NYC Dept. of City Planning</b> — NTA2020 neighborhood boundaries and the <a href="https://geosearch.planninglabs.nyc/" target="_blank" rel="noopener noreferrer">GeoSearch</a> geocoder.</li>' +
          '<li><b>MTA</b> — GTFS static schedules, which is why the commute minutes here are quoted rather than invented.</li>' +
          '<li><b><a href="https://whoownswhat.justfix.org/" target="_blank" rel="noopener noreferrer">JustFix — Who Owns What</a></b> — links buildings into landlord portfolios through HPD registration contacts.</li>' +
          '<li><b>AI-photo detection</b> — <a href="https://huggingface.co/umm-maybe/AI-image-detector" target="_blank" rel="noopener noreferrer">umm-maybe/AI-image-detector</a>, licensed CC BY 4.0; a probabilistic warning layer, never proof.</li>' +
          '<li><b>Open map data</b> — neighborhood context and map tiles derived from public OpenStreetMap data.</li>' +
        '</ul>' +
        '<aside class="lab-callout"><p class="kicker">Little Fight Lab</p><h3>Focused software, built around the decision.</h3><p>VERA is proof that a small, owner-controlled system can replace tabs, spreadsheets, and guesswork without another subscription.</p><a class="bigbtn" href="/services/business-systems/">See what Little Fight builds ↗</a></aside>' +
        '<p class="ethos__credit">A <a href="https://littlefightnyc.com/" rel="noopener">Little Fight NYC</a> system · <a href="/vera/brand/">brand</a> · <a href="/vera/terms/">terms</a> · <a href="/vera/privacy/">privacy</a></p>' +
      '</section>';
    page.classList.add('is-entered');
  }

  /* ---------- router ---------- */

  var pendingListing = null;

  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '') || 'today';
    h = h.split('?')[0];
    /* deep link: #/listing/<uid> renders Today underneath and opens the
       ledger over it; leaving the hash (incl. the back button) closes it */
    if (h.indexOf('listing/') === 0) {
      pendingListing = h.slice(8);
      h = 'today';
    } else {
      pendingListing = null;
      if (window.__VERAL && window.__VERAL.openUid()) window.__VERAL.close();
    }
    if (LEGACY[h]) h = LEGACY[h];
    if (ROUTES.indexOf(h) === -1) h = 'today';
    state.route = h;
    $$('[data-nav]').forEach(function (a) {
      var on = a.getAttribute('data-nav') === h;
      a.classList.toggle('is-on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    /* the More button wears the underline when a secondary section is
       active, and routing always closes the overflow sheet (C2) */
    var moreBtn = $('[data-nav-more]');
    if (moreBtn) {
      moreBtn.classList.toggle('is-on', NAV_SECONDARY.indexOf(h) > -1);
      moreBtn.setAttribute('aria-expanded', 'false');
    }
    var navSheet = $('[data-nav-sheet]');
    if (navSheet) navSheet.hidden = true;
    state.filtersOpen = false;
    var activeNav = $('[data-nav="' + h + '"]');
    if (activeNav && activeNav.scrollIntoView) requestAnimationFrame(function () {
      activeNav.scrollIntoView({ block: 'nearest', inline: 'center', behavior: RM ? 'auto' : 'smooth' });
    });
    renderFilters();
    renderRoute();
    var main = $('#main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
    if (pendingListing && window.__VERAL && window.__VERAL.openUid() !== pendingListing) {
      window.__VERAL.open(pendingListing);
    }
    announceRoute();
  }

  /* Tell a screen reader where it just landed, and what is there. Polite,
     so it waits for a pause rather than interrupting. */
  var ROUTE_NAMES = {
    today: 'Today, the daily drop', market: 'Market, the four-borough net',
    browse: 'Browse, every four-borough listing', atlas: 'Atlas, the map',
    hunt: 'My hunt', manual: 'Field manual', archive: 'Receipts', system: 'System',
  };

  function announceRoute() {
    var el = $('[data-route-announce]');
    if (!el) return;
    var name = ROUTE_NAMES[state.route] || state.route;
    var count = '';
    if (state.route === 'today') {
      var n = $$('.dropcard').length;
      count = n ? ', ' + n + ' listing' + (n === 1 ? '' : 's') + ' in the drop' : ', nothing cleared the bar today';
    } else if (state.route === 'atlas') {
      count = ', ' + atlasScope(filtered()).length + ' listings in the four-borough scope';
    } else if (state.route === 'browse' || state.route === 'market') {
      count = ', ' + filtered().length + ' listings under the current filters';
    }
    el.textContent = name + count + '.';
  }

  /* Every workspace is complete on first paint. Route transitions may soften
     the swap, but content never waits below the fold for a reveal observer. */
  function applyReveals() {}

  function renderRoute() {
    if (!D) return;
    var main = $('[data-main]');
    if (main) main.setAttribute('tabindex', state.route === 'archive' ? '0' : '-1');
    var page = $('#main [data-page]');
    if (!page) return;
    clearInterval(countdownT);
    if (window.__VERAM && state.route !== 'atlas') window.__VERAM.destroy();
    page.setAttribute('data-page', state.route);
    page.className = 'page';
    if (state.route === 'today') renderToday(page);
    else if (state.route === 'market') renderMarket(page);
    else if (state.route === 'browse') renderBrowse(page);
    else if (state.route === 'atlas') renderAtlas(page);
    else if (state.route === 'hunt') renderHunt(page);
    else if (state.route === 'manual') renderManual(page);
    else if (state.route === 'archive') renderArchive(page);
    else renderSystem(page);
    syncPressed(page);
    applyReveals(page);
  }

  /* ================================================================
     THE RECEIPTS — every drop, archived, with what happened next.
     The only marketing a verification product needs.
     ================================================================ */

  var archiveCache = null;

  function renderArchive(page) {
    function paint(arch) {
      var head =
        '<header class="pagehead"><p class="kicker">Receipts</p>' +
        '<h1 class="pagehead__title">Every drop, on the record</h1>';
      if (!arch || !arch.length) {
        page.innerHTML = head +
          '<p class="pagehead__lede">The archive begins with the next publish cycle. Nothing is backfilled and nothing will ever be edited — one entry per day, what we showed and what happened to it.</p></header>';
        page.classList.add('is-entered');
        return;
      }
      var shown = 0, gone = 0;
      arch.forEach(function (e) {
        (e.listings || []).forEach(function (r) {
          shown++;
          if (!byUid(r.listing_uid)) gone++;
        });
      });
      var lede = 'Since ' + esc(arch[arch.length - 1].date) + ': <b>' + arch.length + '</b> drop' + (arch.length === 1 ? '' : 's') + ', <b>' + shown + '</b> listings shown, <b>' + gone + '</b> no longer listed. Nothing here is edited after the fact.';
      page.innerHTML = head + '<p class="pagehead__lede">' + lede + '</p></header>' +
        arch.map(function (e) {
          return '<section class="arcday"><h2 class="arcday__date">' + esc(e.date) + '</h2><div class="arcrows">' +
            ((e.listings || []).length ? e.listings.map(function (r) {
              var live = byUid(r.listing_uid);
              var badge, cls;
              if (!live) { badge = 'no longer listed'; cls = 'is-gone'; }
              else if (+live.rent && +r.rent && +live.rent < +r.rent) { badge = 'price dropped to ' + money(live.rent); cls = 'is-drop'; }
              else { badge = 'still listed'; cls = 'is-live'; }
              var tag = live ? 'button type="button"' : 'div';
              var attrs = live ? ' data-open="' + esc(r.listing_uid) + '" aria-label="Open ledger for ' + esc(r.address_normalized || r.title || 'listing') + '"' : '';
              return '<' + tag + ' class="arcrow' + (live ? '"' : ' arcrow--dead"') + attrs + '>' +
                '<b>' + esc(C.titleCase(String(r.address_normalized || r.title || 'listing').toLowerCase())) + '</b>' +
                '<span>' + money(r.rent) + ' · ' + esc(r.neighborhood || '—') + '</span>' +
                '<span class="arcrow__badge ' + cls + '">' + badge + '</span></' + (live ? 'button' : 'div') + '>';
            }).join('') : '<p class="lane__empty">Nothing cleared the bar that day — and the page said so.</p>') +
          '</div></section>';
        }).join('');
      page.classList.add('is-entered');
    }
    if (archiveCache) { paint(archiveCache); return; }
    page.innerHTML = '<header class="pagehead"><p class="kicker">Receipts</p><h1 class="pagehead__title">Every drop, on the record</h1></header>';

    /* Receipts use the companion first-party endpoint. A failed request must
       still read as a connection problem, never as an empty historical record. */
    var archives = archiveOrigins();
    var got = [], left = archives.length, settled = false;

    function decide() {
      if (settled) return;
      settled = true;
      if (state.route !== 'archive') return;
      if (!got.length) {
        page.innerHTML = '<header class="pagehead"><p class="kicker">Receipts</p>' +
          '<h1 class="pagehead__title">Every drop, on the record</h1>' +
          '<p class="pagehead__lede">The receipts could not be reached just now — this is a connection problem, not an empty archive. Reload in a moment.</p></header>';
        page.classList.add('is-entered');
        return;
      }
      // Defensive even with one origin: keep the fullest valid response.
      got.sort(function (a, b) { return b.length - a.length; });
      archiveCache = got[0];
      paint(archiveCache);
    }

    archives.forEach(function (a) {
      fetch(a.url, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (d) {
          if (Array.isArray(d)) got.push(d);
          if (--left <= 0) decide();
        }, function () { if (--left <= 0) decide(); });
    });
    setTimeout(decide, ARCHIVE_TIMEOUT_MS);
  }

  function runAddressCheck(form) {
    var uid = form.getAttribute('data-uid');
    var input = $('input[name="vera-address"]', form);
    var button = $('button[type="submit"]', form);
    var result = $('[data-address-result]', form);
    var address = String((input && input.value) || '').replace(/\s+/g, ' ').trim();
    var streetQuery = address.split(',')[0].trim();
    if (!C.exactAddressText({ address_normalized: streetQuery })) {
      result.className = 'address-check__result is-error';
      result.textContent = 'Enter a house number and street, such as 120 Broadway.';
      if (input) input.focus();
      return;
    }
    if (form.getAttribute('data-address-pending') === 'true') return;

    form.setAttribute('data-address-pending', 'true');
    button.disabled = true;
    button.textContent = 'Checking…';
    result.className = 'address-check__result';
    result.textContent = 'Checking NYC Planning’s address directory…';
    var url = 'https://geosearch.planninglabs.nyc/v2/search?text=' + encodeURIComponent(address + ', New York NY') + '&size=3';
    var controller = ('AbortController' in window) ? new AbortController() : null;
    var timedOut = false;
    var timeoutId = 0;
    var request = fetch(url, {
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer',
      signal: controller ? controller.signal : undefined,
    });
    var timeout = new Promise(function (resolve, reject) {
      timeoutId = setTimeout(function () {
        timedOut = true;
        if (controller) controller.abort();
        var error = new Error('Address check timed out');
        error.name = 'TimeoutError';
        reject(error);
      }, ADDRESS_CHECK_TIMEOUT_MS);
    });
    Promise.race([request, timeout])
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (payload) {
        if (!document.contains(form)) return;
        var candidates = ((payload && payload.features) || []).map(C.addressCandidate).filter(Boolean).slice(0, 3);
        pendingAddressCandidates[uid] = candidates;
        if (!candidates.length) {
          result.className = 'address-check__result is-error';
          result.textContent = 'NYC Planning did not return a strong building match with a BBL or BIN. Check the number, street, and borough, then try again.';
          return;
        }
        result.className = 'address-check__result is-ready';
        result.innerHTML = '<p><b>Confirm the building you meant.</b> Nothing is saved until you choose one.</p><div class="address-candidates">' +
          candidates.map(function (candidate, index) {
            return '<button type="button" data-address-candidate="' + index + '" data-uid="' + esc(uid) + '">' +
              '<b>' + esc(candidate.label) + '</b><span>' + Math.round(candidate.confidence * 100) + '% match' +
              (candidate.bbl ? ' · BBL ' + esc(candidate.bbl) : '') + (candidate.bin ? ' · BIN ' + esc(candidate.bin) : '') + '</span></button>';
          }).join('') + '</div>';
      })
      .catch(function (error) {
        if (!document.contains(form)) return;
        result.className = 'address-check__result is-error';
        result.textContent = timedOut || (error && error.name === 'TimeoutError')
          ? 'NYC Planning took too long to respond. No address was saved. Check your connection and try again.'
          : 'NYC Planning could not be reached. No address was saved. Check your connection and try again.';
      })
      .then(function () {
        clearTimeout(timeoutId);
        form.removeAttribute('data-address-pending');
        if (!document.contains(form)) return;
        button.disabled = false;
        button.textContent = 'Check with NYC Planning';
      });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target && e.target.closest ? e.target.closest('[data-address-check]') : null;
    if (!form) return;
    e.preventDefault();
    runAddressCheck(form);
  });

  /* ---------- one delegated click handler ---------- */

  /* Overflow sheets close on outside click or Escape (C2/C3). */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-nav-sheet],[data-tab-sheet],[data-nav-more],[data-tab-more]')) return;
    $$('[data-nav-sheet],[data-tab-sheet]').forEach(function (s) { s.hidden = true; });
    $$('[data-nav-more],[data-tab-more]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (!(e.target.closest && e.target.closest('[data-filters],[data-filter-toggle],[data-filter-close]')) && state.filtersOpen) {
      state.filtersOpen = false;
      renderFilters();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('[data-nav-sheet],[data-tab-sheet]').forEach(function (s) { s.hidden = true; });
    $$('[data-nav-more],[data-tab-more]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (state.filtersOpen) { state.filtersOpen = false; renderFilters(); }
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-open],[data-view-jump],[data-bracket],[data-brtile],[data-unit],[data-transit],[data-lens],[data-view],[data-area],[data-hoodbar],[data-kpi],[data-clear],[data-density],[data-sort],[data-stage],[data-outcome],[data-drop],[data-tell],[data-insp-close],[data-scrim],[data-tab],[data-address-candidate],[data-address-replace],[data-address-forget],[data-nav-more],[data-tab-more],[data-filter-toggle],[data-filter-close],[data-filter-scroll],[data-hunt-select],[data-atlas-mode],[data-atlas-focus],[data-erase-vera],[data-erase-vera-cancel],[data-erase-vera-confirm],[data-gal-step],[data-gal-shot],[data-lb-close],[data-lb-step]') : null;
    if (!t) return;

    if (t.hasAttribute('data-filter-toggle')) {
      state.filtersOpen = !state.filtersOpen;
      renderFilters();
      return;
    }

    if (t.hasAttribute('data-filter-close')) {
      state.filtersOpen = false;
      renderFilters();
      return;
    }

    if (t.hasAttribute('data-filter-scroll')) {
      var deck = $('[data-filters]');
      if (!deck) return;
      var towardEnd = t.getAttribute('data-filter-scroll') !== 'start';
      /* This is a two-state overflow affordance, not a scrollbar stepper.
         Jump to the concealed end (or back to the beginning) so Safari and
         rapid keyboard activation cannot repeatedly target a stale offset. */
      deck.scrollLeft = towardEnd ? deck.scrollWidth - deck.clientWidth : 0;
      syncFilterOverflowCue();
      requestAnimationFrame(syncFilterOverflowCue);
      return;
    }

    if (t.hasAttribute('data-atlas-mode')) {
      state.atlasMode = t.getAttribute('data-atlas-mode') === 'list' ? 'list' : 'map';
      renderRoute();
      requestAnimationFrame(function () {
        var selectedMode = $('[data-atlas-mode="' + state.atlasMode + '"]');
        if (selectedMode) selectedMode.focus();
      });
      return;
    }

    if (t.hasAttribute('data-atlas-focus')) {
      var atlasUid = t.getAttribute('data-atlas-focus');
      localWrite('vera-atlas-focus', atlasUid);
      state.atlasMode = 'map';
      persist();
      if (state.route === 'atlas' && window.__VERAM && window.__VERAM.flyTo) {
        window.__VERAM.flyTo(atlasUid);
      } else {
        location.hash = '#/atlas';
      }
      return;
    }

    if (t.hasAttribute('data-hunt-select')) {
      state.huntSelected = t.getAttribute('data-hunt-select');
      renderRoute();
      return;
    }

    if (t.hasAttribute('data-erase-vera')) {
      var confirm = $('[data-erase-vera-confirm]') && $('[data-erase-vera-confirm]').closest('.hunt-erase__confirm');
      if (confirm) confirm.hidden = false;
      t.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () {
        var approve = $('[data-erase-vera-confirm]');
        if (approve) approve.focus();
      });
      return;
    }
    if (t.hasAttribute('data-erase-vera-cancel')) {
      var panel = t.closest('.hunt-erase__confirm');
      if (panel) panel.hidden = true;
      var erase = $('[data-erase-vera]');
      if (erase) { erase.setAttribute('aria-expanded', 'false'); erase.focus(); }
      return;
    }
    if (t.hasAttribute('data-erase-vera-confirm')) { confirmEraseVeraWorkspace(); return; }

    /* overflow sheets (C2/C3): phone collapses secondary sections behind
       More — the button toggles its sheet and closes the other one */
    if (t.hasAttribute('data-nav-more') || t.hasAttribute('data-tab-more')) {
      var sel = t.hasAttribute('data-nav-more') ? '[data-nav-sheet]' : '[data-tab-sheet]';
      var oth = $(t.hasAttribute('data-nav-more') ? '[data-tab-sheet]' : '[data-nav-sheet]');
      if (oth) oth.hidden = true;
      var sheet = $(sel);
      if (sheet) {
        sheet.hidden = !sheet.hidden;
        t.setAttribute('aria-expanded', sheet.hidden ? 'false' : 'true');
      }
      return;
    }

    if (t.hasAttribute('data-address-candidate')) {
      var addressUid = t.getAttribute('data-uid');
      var addressIndex = +t.getAttribute('data-address-candidate');
      var candidate = (pendingAddressCandidates[addressUid] || [])[addressIndex];
      if (!candidate) return;
      addressResolutions[addressUid] = {
        label: candidate.label, confidence: candidate.confidence, matchType: candidate.matchType,
        bbl: candidate.bbl, bin: candidate.bin, provenance: 'user_supplied', confirmedAt: new Date().toISOString(),
      };
      saveAddressResolutions();
      replacingAddress[addressUid] = false;
      delete pendingAddressCandidates[addressUid];
      toast('Address confirmed locally — the shared listing and score did not change.');
      if (window.__VERAL) window.__VERAL.rerender();
      requestAnimationFrame(function () {
        var proof = $('[data-address-proof]');
        if (proof) proof.focus();
      });
      return;
    }
    if (t.hasAttribute('data-address-replace')) {
      replacingAddress[t.getAttribute('data-address-replace')] = true;
      if (window.__VERAL) window.__VERAL.rerender();
      requestAnimationFrame(function () {
        var addressInput = $('[data-address-check] input[name="vera-address"]');
        if (addressInput) addressInput.focus();
      });
      return;
    }
    if (t.hasAttribute('data-address-forget')) {
      var forgetUid = t.getAttribute('data-address-forget');
      delete addressResolutions[forgetUid];
      delete pendingAddressCandidates[forgetUid];
      delete replacingAddress[forgetUid];
      saveAddressResolutions();
      toast('Address removed from this browser.');
      if (window.__VERAL) window.__VERAL.rerender();
      requestAnimationFrame(function () {
        var emptyAddressInput = $('[data-address-check] input[name="vera-address"]');
        if (emptyAddressInput) emptyAddressInput.focus();
      });
      return;
    }
    if (t.hasAttribute('data-view-jump')) {
      // The link already carries href="#/browse"; this just makes it land on
      // the right pill instead of dumping the reader into all 270.
      state.view = t.getAttribute('data-view-jump');
      persist();
      return;
    }
    if (t.hasAttribute('data-gal-step')) {
      var galStrip = t.parentNode ? t.parentNode.querySelector('[data-gal]') : null;
      if (galStrip) {
        var galDir = +t.getAttribute('data-gal-step') || 1;
        if (galStrip.scrollBy) galStrip.scrollBy({ left: galStrip.clientWidth * galDir, behavior: RM ? 'auto' : 'smooth' });
        else galStrip.scrollLeft += galStrip.clientWidth * galDir;
      }
      return;
    }
    if (t.hasAttribute('data-gal-shot')) {
      openLightbox(t.closest('[data-gal]'), +t.getAttribute('data-gal-shot') || 0);
      return;
    }
    if (t.hasAttribute('data-lb-close')) { closeLightbox(); return; }
    if (t.hasAttribute('data-lb-step')) { stepLightbox(+t.getAttribute('data-lb-step') || 1); return; }
    if (t.hasAttribute('data-open')) { if (window.__VERAL) window.__VERAL.open(t.getAttribute('data-open')); return; }
    if (t.hasAttribute('data-insp-close') || t.hasAttribute('data-scrim')) { if (window.__VERAL) window.__VERAL.close(); return; }
    if (t.hasAttribute('data-tab')) { if (window.__VERAL) window.__VERAL.setTab(t.getAttribute('data-tab')); return; }
    if (t.hasAttribute('data-stage')) { setStage(t.getAttribute('data-uid'), t.getAttribute('data-stage')); if (window.__VERAL && window.__VERAL.openUid()) window.__VERAL.rerender(); else renderRoute(); return; }
    if (t.hasAttribute('data-outcome')) {
      var oc = caseOf(t.getAttribute('data-uid'));
      if (oc) { oc.outcome = t.getAttribute('data-outcome'); saveCases(); toast('Noted — outcomes sharpen the next drop.'); if (window.__VERAL && window.__VERAL.openUid()) window.__VERAL.rerender(); else renderRoute(); }
      return;
    }
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

  /* Lightbox backdrop: only a direct hit on the dimmed stage surround closes —
     clicks on the photo, caption, or controls keep browsing. */
  document.addEventListener('click', function (e) {
    var root = lbRoot();
    if (!root || root.hidden) return;
    if (e.target === root || e.target.classList.contains('lb__stage')) closeLightbox();
  });

  /* keyboard: photo strips move by frame; rows + kpis act on Enter/Space;
     Escape closes the ledger. */
  document.addEventListener('keydown', function (e) {
    /* Chromium can enter the dynamically rendered command rail before the
       document-root skip link. Preserve the first keyboard stop explicitly. */
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
      var skip = $('.skip-link');
      if (skip && !skip.inert) { e.preventDefault(); skip.focus(); return; }
    }
    if (lbIsOpen()) {
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); stepLightbox(e.key === 'ArrowLeft' ? -1 : 1); return; }
      if (e.key === 'Tab') {
        var root = lbRoot();
        var focusables = root ? Array.prototype.filter.call(root.querySelectorAll('button'), function (b) { return !b.hidden; }) : [];
        if (focusables.length) {
          var first = focusables[0], last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      return;
    }
    var galleryStrip = e.target && e.target.closest ? e.target.closest('[data-gal]') : null;
    if (galleryStrip && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      var distance = galleryStrip.clientWidth * (e.key === 'ArrowLeft' ? -1 : 1);
      if (galleryStrip.scrollBy) galleryStrip.scrollBy({ left: distance, behavior: RM ? 'auto' : 'smooth' });
      else galleryStrip.scrollLeft += distance;
      return;
    }
    if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 'k') {
      e.preventDefault();
      if (state.route !== 'browse') location.hash = '#/browse';
      requestAnimationFrame(function () {
        var search = $('[data-q]');
        if (search) { search.focus(); search.select(); }
      });
      return;
    }
    if (e.key === 'Escape' && window.__VERAL && window.__VERAL.openUid()) { window.__VERAL.close(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && (e.target.hasAttribute('data-open') || e.target.hasAttribute('data-kpi'))) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* checklist + notes (inside the ledger) + anchor picks */
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-anchor-sel')) {
      var idx = +t.getAttribute('data-anchor-sel');
      if (t.value) anchors[idx] = t.value; else anchors.splice(idx, 1);
      anchors = anchors.filter(Boolean).slice(0, 2);
      saveAnchors();
      renderRoute();
      return;
    }
    if (t.hasAttribute && t.hasAttribute('data-profile-income')) {
      profile.income = +t.value || 0;
      saveProfile();
      renderRoute();
      return;
    }
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
  function observeRouteTransition(transition, renderNow) {
    function report(err) {
      /* Chromium can abort a transition's DOM update after it has started.
         The route callback remains the source of truth, so make sure the
         destination has painted and do not turn an animation hiccup into a
         user-visible error state. */
      if (err && err.name === 'TimeoutError') {
        renderNow();
        return;
      }
      if (err && err.name !== 'AbortError' && window.console && console.error) {
        console.error('VERA route transition failed', err);
      }
    }
    /* A rapid route change intentionally skips the previous transition. Each
       ViewTransition promise can reject independently, so observing only
       `finished` still leaves a noisy, unhandled `ready` rejection. */
    if (transition && transition.ready) transition.ready.catch(report);
    if (transition && transition.updateCallbackDone) transition.updateCallbackDone.catch(report);
    if (transition && transition.finished) transition.finished.catch(report);
  }

  function routeSmooth() {
    if (!TESTMODE && !RM && document.startViewTransition) {
      var didRender = false;
      function renderNow() {
        if (didRender) return;
        didRender = true;
        route();
      }
      try {
        var transition = document.startViewTransition(renderNow);
        observeRouteTransition(transition, renderNow);
      } catch (err) {
        renderNow();
        if (err && err.name !== 'AbortError' && err.name !== 'TimeoutError' && window.console && console.error) console.error('VERA route transition failed', err);
      }
    } else route();
  }
  document.addEventListener('scroll', function (e) {
    var gal = e.target;
    if (!gal.classList || !gal.classList.contains('gal')) return;
    var dots = gal.parentNode.querySelectorAll('.gal__dot');
    if (!dots.length) return;
    var idx = Math.round(gal.scrollLeft / gal.clientWidth);
    dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
    var status = gal.parentNode.querySelector('[data-gal-status]');
    var count = +gal.getAttribute('data-gal-count') || dots.length;
    var sourceCount = +gal.getAttribute('data-gal-source-count') || count;
    if (status) status.textContent = 'Photo ' + Math.min(count, Math.max(1, idx + 1)) + ' of ' + count + (sourceCount > count ? ' · showing ' + count + ' of ' + sourceCount : '') + ' · use arrow keys';
  }, true);

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
    /* value deltas precomputed so the browse column can sort on them */
    POOL.forEach(function (l) {
      var v = valueRead(l);
      l.value_delta = v ? (v.under ? v.pct : -v.pct) : null;
    });
    var hc = {};
    POOL.forEach(function (l) { var h = l.neighborhood || 'Unknown'; hc[h] = (hc[h] || 0) + 1; });
    HOODS = Object.keys(hc).map(function (h) { return { name: h, count: hc[h] }; }).sort(function (a, b) { return b.count - a.count; });
    state.hoods = state.hoods.filter(function (h) { return hc[h]; });

    /* D4 — the quiet provenance diff: what entered the net since the last
       sweep THIS browser saw. It reports the past; it never pressures the
       present. In test mode localRead is null, so the line stays off and
       no state is ever written. */
    var prevSweep = localRead('vera-last-sweep');
    sinceLastVisit = null;
    if (prevSweep && D.generated_at && prevSweep !== D.generated_at) {
      var prevAt = Date.parse(prevSweep) || 0;
      sinceLastVisit = POOL.filter(function (l) { return (Date.parse(l.first_seen_at) || 0) > prevAt; }).length;
    }
    if (D.generated_at) localWrite('vera-last-sweep', D.generated_at);

    var loader = $('[data-loading]');
    if (loader) loader.remove();
    /* the whole page keeps the sweep's time of day (D2) — portraits
       already did; now the ground beneath them agrees */
    document.documentElement.setAttribute('data-sky', C.skyOf(sweepHour()));
    renderChrome();
    renderFilters();
    saveCases();
    route();
    /* The acceptance suite (44K) is a developer tool, not a visitor asset:
       it is no longer shipped in index.html and arrives only under ?test=1. */
    if (TESTMODE) {
      if (window.__VERAT) window.__VERAT.run();
      else loadScript('./assets/js/vera-tests.js?v=57').then(function () {
        if (window.__VERAT) window.__VERAT.run();
      }, function () {
        window.__testResults = { pass: false, results: [{ name: 'test suite loads on demand', ok: false, detail: 'vera-tests.js failed to load' }] };
      });
    }
  }

  /* the installable ritual: shell + last sweep cached, staleness never hidden */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(function () {});
  }

  var servedFromCache = null;
  var feedOrigin = null;
  var sinceLastVisit = null; /* D4 — listings new since this browser's last sweep */
  var feedBootGeneration = 0;
  var activeFeedController = null;

  function boundedRetryAfter(value) {
    if (!value) return 0;
    var seconds = Number(value);
    var delay = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(value) - Date.now();
    if (!Number.isFinite(delay) || delay <= 0) return 0;
    return Math.min(delay, FEED_MAX_RETRY_AFTER_MS);
  }

  /* Load the one Little Fight feed contract. The bounded result plumbing keeps
     a hanging request from blocking first paint and keeps feed failures
     separate from render failures. */
  function boot() {
    /* A deliberate retry owns the session from this point forward. Abort the
       prior transport when the platform honors it; generation checks below
       still reject a late resolution from transports that do not. */
    if (activeFeedController) { try { activeFeedController.abort(); } catch (e) {} }
    var bootGeneration = ++feedBootGeneration;
    var attempt = 0;
    var done = false;
    var softTimer = 0;
    var retryTimer = 0;
    var attemptTimer = 0;
    var currentController = null;

    function ownsAttempt() { return bootGeneration === feedBootGeneration; }
    function clearTimers() {
      clearTimeout(softTimer);
      clearTimeout(retryTimer);
      clearTimeout(attemptTimer);
    }
    function setLoading(message) {
      if (!ownsAttempt()) return;
      var out = $('[data-loading]');
      if (out) out.innerHTML = '<p>' + message + '</p>';
    }

    function showRetry() {
      if (!ownsAttempt()) return;
      var out = $('[data-loading]');
      if (!out) return;
      out.innerHTML = '<p>VERA could not reach the current publication after three tries. Your saved workspace is still here.</p><button type="button" class="ghostbtn" data-feed-retry>Try again</button>';
      var retry = $('[data-feed-retry]', out);
      if (retry) retry.addEventListener('click', function () {
        out.innerHTML = '<p>Loading the current VERA publication…</p>';
        boot();
      }, { once: true });
    }

    function finish(abortTransport) {
      if (done || !ownsAttempt()) return;
      done = true;
      clearTimers();
      if (abortTransport && currentController) { try { currentController.abort(); } catch (e) {} }
      if (activeFeedController === currentController) activeFeedController = null;
    }

    function adoptCurrent(result) {
      if (done || !ownsAttempt()) return;
      finish(false);
      feedOrigin = result.label;
      servedFromCache = result.cache;
      try {
        adopt(result.data);
      } catch (err) {
        // A render error is not a feed error: catching them together used to
        // refetch the fallback origin and re-run the same broken render.
        if (window.console && console.error) console.error('VERA could not render the feed', err);
        var box = $('[data-loading]');
        if (box) box.innerHTML = '<p>VERA reached the feed but could not draw it. Reload to try again.</p>';
      }
    }

    function scheduleRetry(retryAfterMs) {
      if (done || !ownsAttempt()) return;
      if (attempt > FEED_RETRY_DELAYS_MS.length) {
        finish(true);
        showRetry();
        return;
      }
      var delay = Math.max(FEED_RETRY_DELAYS_MS[attempt - 1], retryAfterMs || 0);
      setLoading('The current VERA publication is taking a moment. Retrying automatically (' + (attempt + 1) + ' of ' + (FEED_RETRY_DELAYS_MS.length + 1) + ')…');
      retryTimer = setTimeout(requestCurrentPublication, delay);
    }

    function requestCurrentPublication() {
      if (done || !ownsAttempt()) return;
      attempt += 1;
      var feed = FEEDS[0];
      var cache = null;
      var retryAfterMs = 0;
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      currentController = ctrl;
      activeFeedController = ctrl;
      var requestGeneration = bootGeneration;
      var requestAttempt = attempt;
      attemptTimer = setTimeout(function () {
        if (done || !ownsAttempt() || requestGeneration !== feedBootGeneration || requestAttempt !== attempt) return;
        if (ctrl) { try { ctrl.abort(); } catch (e) {} }
      }, FEED_ATTEMPT_TIMEOUT_MS);
      fetch(feed.url, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) {
          if (!r.ok) {
            retryAfterMs = boundedRetryAfter(r.headers.get('Retry-After'));
            throw new Error('HTTP ' + r.status);
          }
          cache = r.headers.get('X-Vera-Cache');
          return r.json();
        })
        .then(function (data) {
          if (done || !ownsAttempt() || requestGeneration !== feedBootGeneration || requestAttempt !== attempt) return;
          if (!data || typeof data !== 'object' || !Array.isArray(data.pool) || !Array.isArray(data.shortlist) || typeof data.generated_at !== 'string') {
            throw new Error('Invalid VERA publication contract');
          }
          clearTimeout(attemptTimer);
          // An unparseable date is still valid; it simply receives the oldest
          // sort key rather than pretending to be newer than a dated drop.
          var at = Date.parse((data && data.generated_at) || '') || 0;
          adoptCurrent({ data: data, at: at, label: feed.label, cache: cache });
        })
        .catch(function () {
          if (done || !ownsAttempt() || requestGeneration !== feedBootGeneration || requestAttempt !== attempt) return;
          clearTimeout(attemptTimer);
          if (activeFeedController === ctrl) activeFeedController = null;
          scheduleRetry(retryAfterMs);
        });
    }

    if (bootGeneration > 1) setLoading('Loading the current VERA publication…');
    softTimer = setTimeout(function () {
      if (done || !ownsAttempt()) return;
      setLoading('Still loading the current VERA publication. The connection is taking longer than usual.');
    }, FEED_SOFT_TIMEOUT_MS);
    requestCurrentPublication();
  }

  window.__VERA_APP = {
    state: state, POOL: function () { return POOL; }, D: function () { return D; },
    byUid: byUid, caseOf: caseOf, setStage: setStage, dropCase: dropCase, saveCases: saveCases,
    cases: function () { return cases; }, STAGES: STAGES, toast: toast, photoLayer: photoLayer,
    filtered: filtered, renderRoute: renderRoute, tidyTitle: tidyTitle, route: route,
    addressOf: addressOf, gallery: gallery, valueRead: valueRead, profile: function () { return profile; },
    commuteRead: commuteRead, hasValidLngLat: hasValidLngLat,
    addressResolutionOf: addressResolutionOf, addressCheckMarkup: addressCheckMarkup, syncPressed: syncPressed,
    FEEDS: FEEDS, feedOrigin: function () { return feedOrigin; },
    archiveOrigins: archiveOrigins,
    sinceLastVisit: function () { return sinceLastVisit; },
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

  /* WebKit can resume an interrupted same-tab session with either bfcache's
     `pageshow` or only a visible lifecycle event. If no publication has been
     adopted, start a fresh owned attempt; generation guards make any resumed
     older transport harmless. */
  function recoverPublicationOnResume() {
    if (D || document.visibilityState !== 'visible') return;
    boot();
  }
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) recoverPublicationOnResume();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && !D) recoverPublicationOnResume();
  });

  /* Warm the Atlas engine and the vendored style while the browser is idle,
     so the first Atlas open draws streets immediately instead of spending its
     first seconds on downloads. The map itself still boots only on open; a
     failed warm-up resets to idle so a real Atlas visit retries cleanly. */
  var idleFn = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1500); };
  idleFn(function () {
    loadMapAssets().catch(function () { mapAssetState = 'idle'; mapAssetPromise = null; });
  });
})();
