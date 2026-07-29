/* VERA — command center. One investigation workspace: filters travel
   across Command, Discover, and the inspector. Public lens only — this
   app fetches the sanitized public.json and nothing else. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var FEEDS = ['./data/public.json', 'https://vera-pipeline.netlify.app/data/public.json'];
  var TESTMODE = /(^|[?&])test=1/.test(location.search);

  var D = null;            /* the payload */
  var POOL = [];           /* all listings */
  var HOODS = [];
  var usedFallbackPool = false;

  var state = {
    bracket: 'all', unit: 'all', hoods: [], areas: [], transit: 0,
    lens: { noBrokers: false, noMgmt: false, privateFirst: false },
    view: 'all', q: '', sort: { key: 'overall_score', dir: -1 }, density: 'comfortable', route: 'command',
  };

  try {
    var saved = JSON.parse(localStorage.getItem('vera-workspace') || 'null');
    if (saved) { ['bracket', 'unit', 'hoods', 'areas', 'transit', 'lens', 'view', 'density'].forEach(function (k) { if (saved[k] !== undefined) state[k] = saved[k]; }); }
  } catch (e) {}

  function persist() {
    try { localStorage.setItem('vera-workspace', JSON.stringify({ bracket: state.bracket, unit: state.unit, hoods: state.hoods, areas: state.areas, transit: state.transit, lens: state.lens, view: state.view, density: state.density })); } catch (e) {}
  }

  /* ---------- tiny utils ---------- */

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return n == null || isNaN(n) ? '—' : '$' + Math.round(+n).toLocaleString('en-US'); }
  function num(n, d) { return n == null || isNaN(n) ? '—' : (+n).toFixed(d == null ? 0 : d); }
  function median(a) { if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function timeago(iso) {
    if (!iso) return '—';
    var ms = Date.now() - new Date(iso).getTime();
    if (isNaN(ms)) return '—';
    var h = ms / 3.6e6;
    if (h < 1) return Math.max(1, Math.round(h * 60)) + 'm ago';
    if (h < 48) return Math.round(h) + 'h ago';
    return Math.round(h / 24) + 'd ago';
  }
  function pct(x) { return Math.max(0, Math.min(100, +x || 0)); }

  /* ---------- price brackets (the hunt's three lanes) ---------- */

  var BRACKETS = [
    { id: 'b1', label: '≤ $2,000', lo: 0, hi: 2000 },
    { id: 'b2', label: '$2,001–2,500', lo: 2001, hi: 2500 },
    { id: 'b3', label: '$2,501–3,000', lo: 2501, hi: 3000 },
  ];

  function bracketOf(rent) {
    var r = +rent || 0;
    if (!r) return null;
    for (var i = 0; i < BRACKETS.length; i++) if (r >= BRACKETS[i].lo && r <= BRACKETS[i].hi) return BRACKETS[i].id;
    return 'out';
  }

  /* ---------- focus areas (grouped neighborhoods) ---------- */

  var AREAS = [
    { id: 'dtm', label: 'Downtown MHTN', match: ['lower east side', 'east village', 'alphabet city', 'greenwich village', 'west village', 'soho', 'noho', 'nolita', 'little italy', 'chinatown', 'two bridges', 'tribeca', 'financial district', 'fidi', 'bowery', 'civic center', 'battery park', 'stuyvesant town', 'stuytown', 'gramercy', 'union square', 'flatiron', 'kips bay', 'murray hill'] },
    { id: 'chelsea', label: 'Chelsea', match: ['chelsea', 'hudson yards', 'meatpacking'] },
    { id: 'ues', label: 'Upper East Side', match: ['upper east side', 'yorkville', 'lenox hill', 'carnegie hill'] },
    { id: 'uws', label: 'Upper West Side', match: ['upper west side', 'manhattan valley', 'lincoln square'] },
    { id: 'harlem', label: 'Harlem', match: ['harlem', 'east harlem', 'spanish harlem', 'south harlem', 'central harlem', 'west harlem', 'manhattanville', 'hamilton heights', 'sugar hill'] },
    { id: 'gpt', label: 'Greenpoint', match: ['greenpoint'] },
    { id: 'wburg', label: 'Williamsburg', match: ['williamsburg'] },
    { id: 'ewburg', label: 'E Williamsburg', match: ['east williamsburg', 'bushwick border'] },
  ];

  function areaOf(l) {
    var h = String(l.neighborhood || '').toLowerCase();
    if (!h) return null;
    /* East Williamsburg must win before Williamsburg's substring does */
    if (h.indexOf('east williamsburg') > -1) return 'ewburg';
    for (var i = 0; i < AREAS.length; i++) {
      for (var j = 0; j < AREAS[i].match.length; j++) {
        if (h.indexOf(AREAS[i].match[j]) > -1) return AREAS[i].id;
      }
    }
    return null;
  }

  /* ---------- subway proximity (computed; distances are ≈) ----------
     Station coordinates for the focus areas, embedded so proximity works
     entirely client-side from each listing's lat/lng. Walking pace 80m/min. */

  var LINE_COLORS = { '1': '#EE352E', '2': '#EE352E', '3': '#EE352E', '4': '#00933C', '5': '#00933C', '6': '#00933C', '7': '#B933AD', 'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6', 'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319', 'G': '#6CBE45', 'J': '#996633', 'Z': '#996633', 'L': '#A7A9AC', 'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A', 'S': '#808183' };

  var STATIONS = [
    /* downtown manhattan */
    ['Delancey–Essex', 'F J M Z', 40.7183, -73.9881], ['2 Av', 'F', 40.7231, -73.9899], ['Bowery', 'J Z', 40.7203, -73.9939],
    ['Grand St', 'B D', 40.7182, -73.9937], ['East Broadway', 'F', 40.7139, -73.9902], ['Canal St', 'N Q R W J Z 6', 40.7185, -74.0009],
    ['Spring St', '6', 40.7223, -73.9973], ['Prince St', 'N R W', 40.7243, -73.9977], ['Broadway–Lafayette', 'B D F M 6', 40.7254, -73.9962],
    ['Astor Pl', '6', 40.7300, -73.9911], ['8 St–NYU', 'N R W', 40.7303, -73.9926], ['W 4 St', 'A C E B D F M', 40.7323, -74.0003],
    ['Christopher St', '1', 40.7334, -74.0029], ['Houston St', '1', 40.7284, -74.0054], ['Union Sq', '4 5 6 N Q R W L', 40.7359, -73.9906],
    ['1 Av', 'L', 40.7308, -73.9817], ['3 Av', 'L', 40.7326, -73.9860], ['Chambers St', '1 2 3 A C', 40.7150, -74.0093],
    ['Fulton St', '2 3 4 5 A C J Z', 40.7101, -74.0080], ['Wall St', '4 5 2 3', 40.7069, -74.0091], ['City Hall', 'R W', 40.7133, -74.0067],
    ['Franklin St', '1', 40.7192, -74.0067], ['23 St', '6', 40.7398, -73.9866], ['28 St', '6', 40.7434, -73.9841], ['33 St', '6', 40.7461, -73.9820],
    /* chelsea */
    ['14 St', 'A C E L', 40.7402, -74.0019], ['14 St', '1 2 3', 40.7378, -73.9968], ['18 St', '1', 40.7410, -73.9979],
    ['23 St', '1', 40.7440, -73.9955], ['23 St', 'C E', 40.7458, -73.9982], ['23 St', 'F M', 40.7429, -73.9928],
    ['28 St', '1', 40.7471, -73.9934], ['34 St–Penn', '1 2 3 A C E', 40.7513, -73.9917],
    /* upper east side */
    ['59 St–Lex', '4 5 6 N R W', 40.7626, -73.9675], ['68 St–Hunter', '6', 40.7682, -73.9640], ['77 St', '6', 40.7736, -73.9600],
    ['86 St', '4 5 6', 40.7794, -73.9559], ['96 St', '6', 40.7852, -73.9510], ['103 St', '6', 40.7906, -73.9474],
    ['110 St', '6', 40.7952, -73.9440], ['72 St', 'Q', 40.7688, -73.9585], ['86 St', 'Q', 40.7779, -73.9519],
    ['96 St', 'Q', 40.7841, -73.9473], ['63 St–Lex', 'F Q', 40.7645, -73.9660],
    /* upper west side */
    ['59 St–Columbus', '1 A B C D', 40.7682, -73.9819], ['66 St–Lincoln', '1', 40.7736, -73.9822], ['72 St', '1 2 3', 40.7787, -73.9820],
    ['79 St', '1', 40.7839, -73.9799], ['86 St', '1', 40.7886, -73.9761], ['96 St', '1 2 3', 40.7937, -73.9722],
    ['103 St', '1', 40.7994, -73.9683], ['110 St–Cathedral', '1', 40.8039, -73.9666], ['72 St', 'B C', 40.7756, -73.9760],
    ['81 St–Museum', 'B C', 40.7813, -73.9722], ['86 St', 'B C', 40.7859, -73.9690], ['96 St', 'B C', 40.7917, -73.9646],
    ['103 St', 'B C', 40.7963, -73.9613], ['110 St–CPN', 'B C', 40.8001, -73.9583],
    /* harlem */
    ['110 St–CPN', '2 3', 40.7990, -73.9520], ['116 St', '2 3', 40.8020, -73.9497], ['125 St', '2 3', 40.8076, -73.9455],
    ['135 St', '2 3', 40.8140, -73.9407], ['116 St', '6', 40.7986, -73.9418], ['125 St', '4 5 6', 40.8045, -73.9375],
    ['116 St', 'B C', 40.8051, -73.9546], ['125 St', 'A B C D', 40.8111, -73.9525], ['135 St', 'B C', 40.8179, -73.9476],
    ['125 St', '1', 40.8151, -73.9585], ['137 St–City College', '1', 40.8220, -73.9536], ['145 St', 'A B C D', 40.8245, -73.9444],
    /* greenpoint */
    ['Greenpoint Av', 'G', 40.7313, -73.9542], ['Nassau Av', 'G', 40.7245, -73.9513],
    /* williamsburg */
    ['Bedford Av', 'L', 40.7172, -73.9567], ['Lorimer St', 'L', 40.7141, -73.9502], ['Metropolitan Av', 'G', 40.7127, -73.9512],
    ['Graham Av', 'L', 40.7146, -73.9440], ['Marcy Av', 'J M Z', 40.7083, -73.9579], ['Hewes St', 'J M', 40.7069, -73.9534],
    ['Broadway', 'G', 40.7061, -73.9503], ['Flushing Av', 'J M', 40.7003, -73.9412],
    /* east williamsburg */
    ['Grand St', 'L', 40.7118, -73.9403], ['Montrose Av', 'L', 40.7074, -73.9397], ['Morgan Av', 'L', 40.7062, -73.9331],
    ['Jefferson St', 'L', 40.7066, -73.9229], ['DeKalb Av', 'L', 40.7037, -73.9181],
  ];

  var transitCache = {};

  function nearestStation(l) {
    if (!l || l.latitude == null || l.longitude == null) return null;
    var key = l.listing_uid || (l.latitude + ',' + l.longitude);
    if (transitCache[key] !== undefined) return transitCache[key];
    var lat = +l.latitude, lng = +l.longitude;
    var cosLat = Math.cos(lat * Math.PI / 180);
    var best = null, bestD = Infinity;
    for (var i = 0; i < STATIONS.length; i++) {
      var s = STATIONS[i];
      var dy = (lat - s[2]) * 111320;
      var dx = (lng - s[3]) * 111320 * cosLat;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < bestD) { bestD = d; best = s; }
    }
    var out = best && bestD < 3200 ? { name: best[0], lines: best[1], meters: Math.round(bestD), mins: Math.max(1, Math.round(bestD / 80)) } : null;
    transitCache[key] = out;
    return out;
  }

  function lineBullets(lines) {
    return String(lines || '').split(/\s+/).filter(Boolean).slice(0, 6).map(function (ln) {
      return '<i class="bul" style="background:' + (LINE_COLORS[ln] || '#555') + '">' + ln + '</i>';
    }).join('');
  }

  function transitTag(l) {
    var t = nearestStation(l);
    if (!t) return '';
    var cls = t.mins <= 5 ? 'tag--green' : t.mins <= 10 ? 'tag--blue' : '';
    return '<span class="tag ' + cls + ' tag--transit">≈' + t.mins + ' min ' + lineBullets(t.lines) + ' ' + esc(t.name) + '</span>';
  }

  /* ---------- count-up: numbers that arrive, not appear ---------- */

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- listing lenses ---------- */

  function ownerRead(l) {
    if (l.by_owner_signal || l.likely_landlord_type === 'independent' || (l.likely_independent_landlord_score || 0) >= 70) return { label: 'Private', cls: 'tag--green' };
    if (l.broker_name || l.fee_status === 'broker_fee' || l.likely_landlord_type === 'broker') return { label: 'Broker', cls: 'tag--red' };
    if (l.management_company_signal || l.likely_landlord_type === 'management_company' || l.owner_type === 'llc') return { label: 'Corporate', cls: 'tag--amber' };
    return { label: 'Unclear', cls: '' };
  }

  function authenticity(l) {
    var v = l.listing_confidence_score;
    if (v == null) v = l.listing_authenticity_confidence;
    return v == null ? null : +v;
  }

  function isScam(l) {
    var a = authenticity(l);
    return (l.listing_confidence_band === 'low') || (a != null && a < 45);
  }

  function needsVerify(l) {
    return !isScam(l) && String(l.verification_status || '').indexOf('verified') !== 0;
  }

  // The engine publishes "ok"; only "healthy" was accepted, so a fully green
  // pipeline rendered every source red right next to a green health pulse.
  function srcCls(status) {
    var s = String(status || '').toLowerCase();
    if (s === 'ok' || s === 'healthy') return 'is-ok';
    if (s === 'partial' || s === 'degraded') return 'is-warn';
    if (s === 'disabled' || s === 'not_scheduled' || s === 'skipped') return 'is-off';
    return 'is-bad';
  }

  function isFresh(l) {
    if (l.change_badge === 'new') return true;
    if (!l.first_seen_at) return false;
    return (Date.now() - new Date(l.first_seen_at).getTime()) < 36 * 3.6e6;
  }

  function stabilized(l) {
    if (l.official_rent_stabilized_list_hit) return { label: 'Stabilized ✓', cls: 'tag--green' };
    var s = String(l.rent_stabilized_signal || '').toLowerCase();
    if (s === 'likely' || s === 'yes') return { label: 'Stab. likely', cls: 'tag--blue' };
    return null;
  }

  function riskCls(v) { v = +v || 0; return v < 40 ? 'risk--lo' : v < 65 ? 'risk--md' : 'risk--hi'; }

  function unitOf(l) {
    // +null is 0, which quietly filed every bedroom-less record as a studio.
    var beds = l.beds == null || l.beds === '' ? null : +l.beds;
    if (String(l.unit_type || '').toLowerCase() === 'studio' || beds === 0) return 'studio';
    if (beds === 1) return '1br';
    return 'other';
  }

  var VIEWS = {
    all: function () { return true; },
    fresh: isFresh,
    owner: function (l) { return ownerRead(l).label === 'Private'; },
    clean: function (l) { return (+l.hpd_risk_score || 0) < 40 && !(+l.serious_open_violations); },
    verify: needsVerify,
    scam: isScam,
  };

  function filtered() {
    var q = state.q.trim().toLowerCase();
    var out = POOL.filter(function (l) {
      if (state.bracket !== 'all' && bracketOf(l.rent) !== state.bracket) return false;
      if (state.unit !== 'all' && unitOf(l) !== state.unit) return false;
      if (state.areas.length && state.areas.indexOf(areaOf(l)) === -1) return false;
      if (state.hoods.length && state.hoods.indexOf(l.neighborhood || 'Unknown') === -1) return false;
      if (state.transit) {
        var t = nearestStation(l);
        if (!t || t.mins > state.transit) return false;
      }
      if (state.lens.noBrokers && ownerRead(l).label === 'Broker') return false;
      if (state.lens.noMgmt && ownerRead(l).label === 'Corporate') return false;
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
        var pa = ownerRead(a).label === 'Private' ? 1 : 0, pb = ownerRead(b).label === 'Private' ? 1 : 0;
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
    var span = (mx - mn) || 1;
    var pts = series.map(function (v, i) {
      var x = series.length === 1 ? w / 2 : (i / (series.length - 1)) * (w - 8) + 4;
      var y = h - 6 - ((v - mn) / span) * (h - 16);
      return [x, y];
    });
    var path = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = path + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (h - 4) + ' L' + pts[0][0].toFixed(1) + ' ' + (h - 4) + ' Z';
    var dots = pts.map(function (p, i) { return i === pts.length - 1 ? '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3" fill="' + color + '"/>' : ''; }).join('');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img">' +
      '<path d="' + area + '" fill="' + color + '" opacity="0.12"/>' +
      '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round"/>' + dots + '</svg>';
  }

  /* ================================================================
     THE MONEY ENGINE
     NYC rent law gives tenants hard numbers. VERA knows them, so it
     can price a move honestly AND flag demands that are illegal.
       · Security deposit: capped at 1 month (HSTPA, 2019)
       · Application fee: capped at $20, or actual screening cost
       · Broker fee: whoever HIRES the broker pays (FARE Act, in effect
         since 11 Jun 2025). A landlord-hired broker cannot bill you.
     ================================================================ */

  var LAW = {
    depositMaxMonths: 1,
    appFeeMax: 20,
    depositReturnDays: 14,
    fareActFrom: 'June 11, 2025',
    guarantorTypicalPct: 0.9,   /* institutional guarantor ≈ 90% of one month */
    incomeRuleX: 40,            /* the 40x annual-income convention */
    guarantorRuleX: 80,
  };

  function moveInMath(l) {
    var rent = +l.rent || 0;
    var deposit = rent * LAW.depositMaxMonths;
    var vera = rent + deposit;              /* no broker fee, by construction */
    var brokerWorld = rent * 1.5;           /* the fee a broker would historically ask */
    return {
      rent: rent,
      deposit: deposit,
      appFee: rent ? LAW.appFeeMax : 0,
      total: vera + (rent ? LAW.appFeeMax : 0),
      brokerWorld: brokerWorld,
      saved: brokerWorld,
      incomeNeeded: rent * 12 * (1 / 12) * LAW.incomeRuleX / 1,
      annualIncomeNeeded: rent * LAW.incomeRuleX,
      guarantorIncomeNeeded: rent * LAW.guarantorRuleX,
      guarantorCost: Math.round(rent * LAW.guarantorTypicalPct),
    };
  }

  /* ================================================================
     MY HUNT — the case file. Local to this browser, never uploaded.
     ================================================================ */

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

  /* ================================================================
     THE VIEWING CHECKLIST — what people wish they'd checked.
     Saved per listing so you can run it standing in the apartment.
     ================================================================ */

  var CHECKS = [
    { id: 'water', group: 'Systems', label: 'Run the shower AND the sink together', why: 'Pressure dies in old buildings when two fixtures compete.' },
    { id: 'hotwater', group: 'Systems', label: 'Time the hot water', why: 'Over a minute to warm up is a boiler that will fail you in February.' },
    { id: 'heat', group: 'Systems', label: 'Find the radiator valve', why: 'Steam heat with no working valve means a 85° apartment all winter with the windows open.' },
    { id: 'ac', group: 'Systems', label: 'Check for an AC sleeve or window that fits a unit', why: 'Some leases and some windows make a summer unit impossible.' },
    { id: 'outlets', group: 'Systems', label: 'Count outlets in every room', why: 'Two outlets per room means extension cords forever.' },
    { id: 'ceiling', group: 'Damage', label: 'Look up — ceiling stains or fresh paint patches', why: 'A fresh white square on an old ceiling is a leak someone painted over.' },
    { id: 'undersink', group: 'Damage', label: 'Open the cabinet under the sink', why: 'Roach traps, droppings, and water damage all live under there.' },
    { id: 'corners', group: 'Damage', label: 'Check corners and baseboards for gaps', why: 'Gaps are mouse highways. Steel wool is a tell someone already fought this.' },
    { id: 'floor', group: 'Damage', label: 'Set a pen on the floor', why: 'If it rolls, the building has settled — check the walls for cracks too.' },
    { id: 'windowview', group: 'Light + air', label: 'What is actually outside each window', why: 'Airshaft and brick-wall views are legal and soul-crushing.' },
    { id: 'direction', group: 'Light + air', label: 'Which way do the windows face', why: 'North-facing means no direct sun, ever.' },
    { id: 'windowop', group: 'Light + air', label: 'Open and lock every window', why: 'Painted-shut windows are both a comfort and a fire-safety problem.' },
    { id: 'noise', group: 'Life', label: 'Stand still and listen for 60 seconds', why: 'Bar, bus line, elevated train, upstairs dog — all invisible at 2pm on a Tuesday.' },
    { id: 'cell', group: 'Life', label: 'Check phone bars in the back room', why: 'Thick pre-war walls kill signal. Ask if the wifi provider is a monopoly here.' },
    { id: 'packages', group: 'Life', label: 'Ask where packages land', why: 'No mailroom and a street-level door means porch piracy every week.' },
    { id: 'laundry', group: 'Life', label: 'Laundry in the building? Where is the nearest one?', why: 'A five-block laundromat walk is a real weekly tax.' },
    { id: 'trash', group: 'Life', label: 'Find the trash area and smell it', why: 'You will be walking past it every day.' },
    { id: 'neighbor', group: 'People', label: 'Knock on a neighbor door and ask about the landlord', why: 'Thirty seconds with a neighbor beats any listing description.' },
    { id: 'super', group: 'People', label: 'Ask if there is a super and how fast they answer', why: 'The difference between a same-day fix and a three-week outage.' },
    { id: 'unit', group: 'Paper', label: 'Confirm this is THE unit, not "a similar one"', why: 'Bait-and-switch is the oldest move in the book.' },
    { id: 'legal', group: 'Paper', label: 'Is it a legal unit? (basement/cellar especially)', why: 'Illegal conversions have no protection and can be vacated by the city.' },
    { id: 'rider', group: 'Paper', label: 'If stabilized, look for the rent-stabilization rider on the lease', why: 'Every stabilized lease must carry a long state-issued rider saying so. A lease handed to you without one is the single red flag you can catch before signing.' },
    { id: 'stab', group: 'Paper', label: 'Ask the outgoing tenant to pull the rent history', why: 'State records only go to the current tenant or the owner, and get mailed to the apartment — so you cannot request it yourself before signing. The tenant leaving can, in about a week. Otherwise, request it the day you move in.' },
    { id: 'oddrent', group: 'Paper', label: 'Notice if the rent is an odd number', why: 'A rent like $1,187.59 rather than a round $1,200 is a classic sign of a regulated increase calculated off a legal rent.' },
    { id: 'lease', group: 'Paper', label: 'Read who pays the broker, in writing', why: 'Under the FARE Act, a landlord-hired broker cannot bill you a fee. Keep the fee conversation in text or email — a sudden insistence on a phone call is about the paper trail.' },
  ];

  function checkGroups() {
    var g = [], seen = {};
    CHECKS.forEach(function (c) { if (!seen[c.group]) { seen[c.group] = 1; g.push(c.group); } });
    return g;
  }

  /* ================================================================
     SCAM SCHOOL — the tells, as a deck you can flip.
     ================================================================ */

  var TELLS = [
    { t: 'The price is good but not absurd', d: 'The professional version never uses a $1,400 West Village one-bedroom. It shaves 15% off market — cheap enough to move fast, plausible enough to survive a gut check. Compare against the building\'s own last-rented price, not your hopes.', k: 'price' },
    { t: 'Nobody has proven they own it', d: 'The most expensive scams in this city all collapse to one unanswered question: is this person the owner, the managing agent, or a stranger with a set of keys? A real tour and a real-looking lease prove neither. Look the owner up before you look at the apartment.', k: 'who' },
    { t: 'One phone number, thirty listings', d: 'Search the phone number and the email. Scaled operations reuse contact details across dozens of listings under different names in different neighborhoods. One search ends it.', k: 'who' },
    { t: 'A lease that looks completely legitimate', d: 'A DocuSign lease requires no verification of the sender. Renters have signed real-looking leases, wired real money, and arrived to find twenty other people with the same lease for the same unit.', k: 'paper' },
    { t: '"I am out of the country"', d: 'Missionary, oil rig, deployment, sick relative abroad. Same script for a decade, usually paired with "view it through the windows and we will mail the keys."', k: 'story' },
    { t: 'Money before keys', d: 'Good-faith deposit, holding fee, key fee, "just to take it off the market." All of it illegal in New York before a signed lease. Nothing should leave your hand until the lease is signed and the keys are in the other one.', k: 'law' },
    { t: 'Zelle, Venmo, wire, gift cards', d: 'Irreversible by design — that is the entire reason they were requested. A real landlord takes a check or an ACH transfer against a signed lease.', k: 'money' },
    { t: '"You hired me by emailing me"', d: 'The most common FARE Act dodge. It does not work: publishing a listing creates a legal presumption the landlord authorised the broker, and conditioning a rental on engaging an agent is barred outright.', k: 'law' },
    { t: 'A cheaper rent with a bigger fee', d: 'Offered a choice between $4,250 rent with a $3,600 fee, or $3,800 rent with a $6,840 fee? That is not a favour, it is fee laundering — and the owner often has no idea their rent is being quoted high.', k: 'law' },
    { t: 'An application fee over $20', d: 'Capped at $20 statewide — or the actual cost of the credit and background check, whichever is less. Bring your own report from the last 30 days and it can be waived entirely. A "$500 processing fee" is not a red flag, it is illegal.', k: 'law' },
    { t: 'A tip for the super', d: 'Key money by another name. A demand for a few hundred dollars "for the super" before move-in is illegal, and brokers who ask for it know exactly what they are doing.', k: 'law' },
    { t: '"Let us just talk on the phone"', d: 'Insisting on a call after you asked in writing is a paper-trail problem, not a friendliness problem. Keep every fee conversation in text or email.', k: 'paper' },
    { t: 'Days on market reset to three', d: 'The same tired unit gets relisted — sometimes with the unit number flipped from #A1 to #1A — to wipe the counter. Four months of sitting reappears as brand new inventory.', k: 'dupe' },
    { t: 'The listing is already rented', d: 'Plenty of live listings are pure lead bait. "Oh, that one is gone, but I have something similar" is a sales funnel, not an accident.', k: 'dupe' },
    { t: 'A virtual doorman is not a doorman', d: 'Neither is a shared courtyard a "private outdoor space." Amenity checkboxes are filled in to win filters, not to describe the apartment.', k: 'photos' },
    { t: 'Net effective rent', d: 'The advertised number is often after a free month. Judge the lease on gross rent — the net figure is mostly a promise to raise your rent at renewal.', k: 'money' },
  ];

  /* ================================================================
     LEGAL PROTECTION DISCLOSURE
     Nobody else does this, and it is the honest cost of hunting
     owner-direct: the smallest landlords sit outside the three
     protections that matter most. VERA says so out loud.
     ================================================================ */

  function protections(l) {
    var units = +l.unit_count || null;
    var stab = !!l.official_rent_stabilized_list_hit || String(l.rent_stabilized_signal || '').toLowerCase() === 'likely';
    var out = [];

    out.push({
      name: 'Good Cause Eviction',
      gives: 'a right to renew, a cap on increases, and no no-cause non-renewal',
      state: units == null ? 'unknown' : units <= 10 ? 'likely out' : 'likely in',
      why: units == null
        ? 'Turns on whether the owner holds more than ten units statewide — not how big this building is. VERA cannot confirm the portfolio from this listing alone.'
        : units <= 10
          ? 'Owners of ten or fewer units statewide are exempt. A small owner-direct building is very often exactly that.'
          : 'Buildings this size usually sit inside coverage, unless the owner qualifies some other way.',
    });

    out.push({
      name: 'Rent stabilization',
      gives: 'a registered legal rent, guaranteed renewals, and board-set increases',
      state: stab ? 'likely in' : units != null && units < 6 ? 'likely out' : 'unknown',
      why: stab
        ? 'Signals point to a stabilized unit — which is the prize. Note that the state will only release the rent history to the current tenant or the owner, and mails it to the apartment, so ask the outgoing tenant to pull it or request it the day you move in. Check the lease for the required stabilization rider before you sign.'
        : units != null && units < 6
          ? 'Stabilization generally needs six or more units, so a building this small is usually deregulated.'
          : 'Unit count is unconfirmed, so stabilization cannot be ruled in or out from the listing.',
    });

    out.push({
      name: 'Source-of-income protection',
      gives: 'the right not to be refused for using a voucher',
      state: units == null ? 'unknown' : units <= 5 ? 'likely out' : 'likely in',
      why: units == null
        ? 'Coverage depends on the size of the accommodation, which this listing does not state.'
        : units <= 5
          ? 'The city human-rights law carves out accommodations of five units or fewer.'
          : 'Buildings above the carve-out are covered.',
    });

    return out;
  }

  /* ================================================================
     VERIFY IT YOURSELF — the public tools, one click away
     ================================================================ */

  var VERIFY_TOOLS = [
    ['Who Owns What', 'https://whoownswhat.justfix.org/', 'See every other building the same owner controls. Free, open source, and the tool New Yorkers recommend to each other most.'],
    ['HPD Online', 'https://hpdonline.nyc.gov/', 'Violations by class, complaints, and the registered owner. Class C means immediately hazardous.'],
    ['ACRIS', 'https://a836-acris.nyc.gov/', 'The deed and the mortgage. Confirms who actually owns the building — and whether the asking rent could plausibly carry it.'],
    ['DOB Building Information', 'https://a810-bisweb.nyc.gov/', 'Permits, complaints, and the Certificate of Occupancy that tells you whether the unit is even legal.'],
    ['NY licence check', 'https://appext20.dos.ny.gov/nydos/selSearchType.do', 'Every real broker holds a licence. Search the name before you send anything.'],
    ['311 complaint history', 'https://portal.311.nyc.gov/', 'Heat and hot water outages by date. A building that lost heat five times last winter will do it again.'],
  ];

  /* Market context — published figures, cited so they can be checked. */
  var MARKET = {
    asOf: 'June 2026',
    manhattanMedian: 5295,
    brooklynMedian: 4350,
    cityMedianAsk: 4199,
    manhattanDom: 36,
    brooklynDom: 37,
    vacancy: 1.4,
    perDay: 1100,
    seasonalGap: 1.4,
    leadDays: 45,
  };

  /* ================================================================
     BUILDING PORTRAITS
     The floor under every listing image. Drawn deterministically from the
     listing's own identity and record, so the same listing gets the same
     portrait forever. Where the post carries real photography it is layered
     on top (see photoLayer); the portrait is what remains when a post has
     no photo, or when the host refuses to serve it.
     ================================================================ */

  var BRICK = [
    ['#7d4436', '#8d5140'], ['#6b5445', '#7c6352'], ['#8a5a43', '#9a6a51'],
    ['#5f5a52', '#6e6960'], ['#a06a4e', '#b07a5c'], ['#6a4a52', '#7a5860'],
  ];

  function hashOf(s) {
    var h = 2166136261;
    for (var i = 0; i < String(s).length; i++) { h ^= String(s).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function portrait(l, w, h) {
    var seed = hashOf(l.listing_uid || l.title || 'x');
    var s = seed;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }

    var pal = BRICK[seed % BRICK.length];
    var floors = 4 + Math.floor(rnd() * 4);
    var bays = 3 + Math.floor(rnd() * 2);
    var preWar = rnd() > 0.42;
    var risk = +l.hpd_risk_score || 0;
    var lit = isScam(l) ? 0.12 : needsVerify(l) ? 0.4 : 0.62;

    var bw = w * 0.74, bx = (w - bw) / 2;
    var by = h * 0.12, bh = h - by - h * 0.1;
    var fh = bh / floors;
    var g = '';

    /* sky */
    g += '<defs><linearGradient id="sky' + seed + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#141b22"/><stop offset="1" stop-color="#1d2129"/></linearGradient></defs>';
    g += '<rect width="' + w + '" height="' + h + '" fill="url(#sky' + seed + ')"/>';

    /* a neighbour on each side, cropped — the block, not a lonely box */
    g += '<rect x="0" y="' + (by + fh * 0.6) + '" width="' + (bx - 3) + '" height="' + (h - by - fh * 0.6) + '" fill="#191d22"/>';
    g += '<rect x="' + (bx + bw + 3) + '" y="' + (by + fh * 0.9) + '" width="' + (w - bx - bw - 3) + '" height="' + (h - by - fh * 0.9) + '" fill="#171b20"/>';

    /* facade */
    g += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="' + pal[0] + '"/>';
    g += '<rect x="' + bx + '" y="' + by + '" width="' + (bw * 0.5) + '" height="' + bh + '" fill="' + pal[1] + '" opacity="0.45"/>';
    /* cornice */
    g += '<rect x="' + (bx - 4) + '" y="' + (by - 6) + '" width="' + (bw + 8) + '" height="8" rx="2" fill="' + pal[1] + '"/>';

    /* windows */
    var mw = bw / (bays + 1) * 0.52, mh = fh * 0.46;
    for (var r = 0; r < floors; r++) {
      for (var c = 0; c < bays; c++) {
        var wx = bx + bw * ((c + 1) / (bays + 1)) - mw / 2;
        var wy = by + fh * r + fh * 0.28;
        var on = rnd() < lit && r > 0;
        g += '<rect x="' + wx.toFixed(1) + '" y="' + wy.toFixed(1) + '" width="' + mw.toFixed(1) + '" height="' + mh.toFixed(1) + '" rx="1.5" fill="' + (on ? '#ffcf7a' : '#20242b') + '"' + (on ? ' opacity="' + (0.55 + rnd() * 0.45).toFixed(2) + '"' : '') + '/>';
        if (on && rnd() > 0.72) {
          g += '<rect x="' + (wx + mw * 0.18).toFixed(1) + '" y="' + (wy + mh * 0.3).toFixed(1) + '" width="' + (mw * 0.3).toFixed(1) + '" height="' + (mh * 0.7).toFixed(1) + '" fill="#8a5a2a" opacity="0.55"/>';
        }
      }
    }

    /* fire escape — the pre-war tell */
    if (preWar) {
      var fx = bx + bw * 0.5;
      for (var r2 = 1; r2 < floors; r2++) {
        var ly = by + fh * r2 + fh * 0.12;
        g += '<rect x="' + (fx - mw * 0.95) + '" y="' + ly + '" width="' + (mw * 1.9) + '" height="2.5" fill="#2f3a33"/>';
        g += '<path d="M' + (fx - mw * 0.8) + ' ' + ly + ' L' + (fx + mw * 0.8) + ' ' + (ly + fh * 0.7) + '" stroke="#2f3a33" stroke-width="1.6" fill="none" opacity="0.8"/>';
      }
    }

    /* stoop + door */
    var dw = bw * 0.17, dx = bx + bw * 0.5 - dw / 2, dy = by + bh - fh * 0.62;
    g += '<rect x="' + dx + '" y="' + dy + '" width="' + dw + '" height="' + (fh * 0.62) + '" rx="2" fill="#241c18"/>';
    g += '<rect x="' + (dx + dw * 0.15) + '" y="' + (dy + fh * 0.1) + '" width="' + (dw * 0.7) + '" height="' + (fh * 0.28) + '" fill="#ffcf7a" opacity="0.5"/>';
    /* sidewalk */
    g += '<rect x="0" y="' + (by + bh) + '" width="' + w + '" height="' + (h - by - bh) + '" fill="#101418"/>';
    g += '<rect x="0" y="' + (by + bh) + '" width="' + w + '" height="2" fill="#262b25"/>';

    /* record tint — a building with a bad file reads colder */
    if (risk >= 65) g += '<rect width="' + w + '" height="' + h + '" fill="#e06a70" opacity="0.09"/>';
    else if (risk >= 45) g += '<rect width="' + w + '" height="' + h + '" fill="#e3b567" opacity="0.05"/>';

    return '<svg class="port" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Illustrated building portrait, drawn from this listing\'s record — not a photograph">' + g + '</svg>';
  }

  /* ---------- shell chrome ---------- */

  function renderChrome() {
    var run = (D && D.run) || {};
    var sh = (D && D.source_health) || {};
    var snapLine = 'Snapshot ' + timeago(D && D.generated_at) + ' · ' + (run.run_id || 'run unknown') + ' · ' + (run.cadence || '');
    $('[data-snapshot-line]').textContent = snapLine;
    var pulse = $('[data-pulse]');
    pulse.className = 'pulse';
    if ((sh.broken || 0) > (sh.healthy || 0)) pulse.classList.add('is-bad');
    else if ((sh.broken || 0) > 0) pulse.classList.add('is-warn');
    $('[data-rail-status]').textContent =
      'sources ' + (sh.healthy || 0) + '/' + (sh.active || 0) + ' healthy\n' +
      'pool ' + POOL.length + ' listings\n' +
      'lens: public';
  }

  function renderFilters() {
    $$('[data-bracket]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-bracket') === state.bracket); });
    $$('[data-unit]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-unit') === state.unit); });
    $$('[data-transit]').forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-transit') === state.transit); });
    $$('[data-lens]').forEach(function (b) { b.classList.toggle('is-on', !!state.lens[b.getAttribute('data-lens')]); });
    $$('[data-view]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-view') === state.view); });
    var counts = {};
    POOL.forEach(function (l) { var a = areaOf(l); if (a) counts[a] = (counts[a] || 0) + 1; });
    var box = $('[data-areas]');
    box.innerHTML = AREAS.map(function (a) {
      return '<button type="button" data-area="' + a.id + '" class="' + (state.areas.indexOf(a.id) > -1 ? 'is-on' : '') + '">' + esc(a.label) + ' <span style="opacity:.55">' + (counts[a.id] || 0) + '</span></button>';
    }).join('');
    var dirty = state.bracket !== 'all' || state.unit !== 'all' || state.hoods.length || state.areas.length || state.transit || state.lens.noBrokers || state.lens.noMgmt || state.lens.privateFirst || state.view !== 'all' || state.q;
    $('[data-clear]').hidden = !dirty;
  }

  function refresh() {
    persist();
    renderFilters();
    renderRoute();
  }

  /* ---------- command page ---------- */

  function kpi(label, value, note, cls, click) {
    return '<div class="kpi ' + (cls || '') + (click ? ' kpi--click' : '') + '" ' + (click ? 'data-kpi="' + click + '" role="button" tabindex="0"' : '') + '>' +
      '<p class="kpi__label">' + label + '</p><p class="kpi__value">' + value + '</p>' +
      (note ? '<p class="kpi__note">' + note + '</p>' : '') + '</div>';
  }

  // Real listing photography. The drawn portrait stays in the DOM underneath
  // every photo, so a dead, blocked, or hotlink-refused image degrades to the
  // illustration instead of leaving a hole. Feeds carry a few relative paths
  // that only resolve on the source site, so absolute https is the bar.
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

  // Image error events do not bubble, so they have to be caught on the way down.
  // An inline onerror would be dropped by the site CSP (script-src 'self').
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.className === 'shot') {
      var n = t.parentNode && t.parentNode.querySelector('.shot__n');
      if (n) n.parentNode.removeChild(n);
      t.parentNode.removeChild(t);
    }
  }, true);

  function listingCard(l, kind) {
    var o = ownerRead(l);
    var st = stabilized(l);
    var score = l.overall_score != null ? num(l.overall_score, 1) : '—';
    var pro = (l.trust_strengths || [])[0];
    var con = (l.trust_caveats || [])[0];
    var extra = '';
    if (kind === 'verify') extra = '<p class="card__line is-con"><b>Verify:</b> ' + esc(((l.what_to_verify_before_applying || [])[0]) || l.verification_status || 'needs a records pass') + '</p>';
    else if (kind === 'scam') extra = '<p class="card__line is-con"><b>Flag:</b> ' + esc(l.listing_confidence_band === 'low' ? 'low authenticity confidence (' + num(authenticity(l)) + ')' : 'weak authenticity signals') + '</p>';
    else {
      if (pro) extra += '<p class="card__line is-pro"><b>Pro:</b> ' + esc(pro) + '</p>';
      if (con) extra += '<p class="card__line is-con"><b>Con:</b> ' + esc(con) + '</p>';
    }
    return '<button type="button" class="card card--' + kind + '" data-open="' + esc(l.listing_uid) + '">' +
      '<span class="card__port">' + portrait(l, 300, 132) + photoLayer(l) + '</span>' +
      '<span class="card__top"><span class="card__score">' + score + '</span><span class="card__rent">' + money(l.rent) + '</span></span>' +
      '<h3 class="card__title">' + esc(l.title || l.address_normalized || 'Untitled listing') + '</h3>' +
      '<span class="card__meta">' +
        '<span class="tag ' + o.cls + '">' + o.label + '</span>' +
        '<span class="tag">' + esc(l.neighborhood || '—') + '</span>' +
        '<span class="tag">' + (unitOf(l) === 'studio' ? 'Studio' : unitOf(l) === '1br' ? '1BR' : esc(l.unit_type || '?')) + '</span>' +
        (st ? '<span class="tag ' + st.cls + '">' + st.label + '</span>' : '') +
        transitTag(l) +
      '</span>' + extra + '</button>';
  }

  function renderCommand(page) {
    var f = filtered();
    var rents = f.map(function (l) { return +l.rent; }).filter(function (n) { return n > 0; });
    var privates = f.filter(function (l) { return ownerRead(l).label === 'Private'; });
    var scams = f.filter(isScam);
    var verify = f.filter(needsVerify);
    var fresh = f.filter(isFresh);
    var sm = (D.summary || {});
    var dc = ((D.daily_changes || {}).counts || {});

    var fits = f.filter(function (l) { return !isScam(l); }).slice().sort(function (a, b) { return (+b.overall_score || 0) - (+a.overall_score || 0); }).slice(0, 4);

    // Almost nothing in the feed reads as "verified", so the verification lane
    // and the best-fit lane resolved to the same four listings. Best fit wins
    // the duplicate; verification shows what is actually behind it.
    var inFit = {};
    fits.forEach(function (l) { inFit[l.listing_uid] = 1; });
    verify = verify.filter(function (l) { return !inFit[l.listing_uid]; });

    /* rent histogram buckets */
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

    /* hood bars over current lens (minus hood filter itself, so it's navigational) */
    var hoodCounts = {};
    POOL.forEach(function (l) {
      if (state.bracket !== 'all' && bracketOf(l.rent) !== state.bracket) return;
      if (state.unit !== 'all' && unitOf(l) !== state.unit) return;
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

    // data-count-final is what the reduced-motion path reads; without it every
    // counter rendered blank instead of jumping straight to its value.
    function cval(n) { var v = +n || 0; return '<span data-count-to="' + v + '" data-count-final="' + v + '">0</span>'; }
    function cmoney(m) { return m == null ? '—' : '<span data-count-to="' + Math.round(m) + '" data-count-prefix="$" data-count-final="' + money(m) + '">$0</span>'; }

    /* the three bracket lanes — the hunt's price story at a glance */
    var brTiles = BRACKETS.map(function (br) {
      var inBr = POOL.filter(function (l) {
        if (bracketOf(l.rent) !== br.id) return false;
        if (state.unit !== 'all' && unitOf(l) !== state.unit) return false;
        if (state.areas.length && state.areas.indexOf(areaOf(l)) === -1) return false;
        return true;
      });
      var med = median(inBr.map(function (l) { return +l.rent; }).filter(Boolean));
      var priv = inBr.filter(function (l) { return ownerRead(l).label === 'Private'; }).length;
      var on = state.bracket === br.id;
      return '<button type="button" class="brtile ' + (on ? 'is-on' : '') + '" data-brtile="' + br.id + '">' +
        '<span class="brtile__label">' + br.label + '</span>' +
        '<span class="brtile__n">' + cval(inBr.length) + '</span>' +
        '<span class="brtile__meta">' + (med ? 'median ' + money(med) : 'no priced listings') + (priv ? ' · ' + priv + ' private' : '') + '</span>' +
        '<span class="brtile__spark">' + '▮'.repeat(Math.min(24, inBr.length)) + '</span>' +
      '</button>';
    }).join('');

    page.innerHTML =
      (usedFallbackPool ? '<p class="notice">Feed is serving the pre-overhaul contract — pool view is limited to curated lanes until tonight\'s publish.</p>' : '') +
      '<div class="kpis">' +
        kpi('In the net', cval(f.length) + '<small>/' + POOL.length + '</small>', 'under current lens', '', 'discover') +
        kpi('New tonight', cval(sm.new_today != null ? sm.new_today : fresh.length), (dc.gone || 0) + ' gone · ' + (dc.back || 0) + ' back', 'kpi--good', 'fresh') +
        kpi('Median ask', rents.length ? cmoney(median(rents)) : '—', rents.length + ' priced', '') +
        kpi('Price drops', cval(sm.price_drops || dc.price_drop || 0), (sm.price_hikes || dc.price_hike || 0) + ' hikes', (sm.price_drops || dc.price_drop) ? 'kpi--good' : '') +
        kpi('Private landlords', cval(privates.length), 'no broker, no corp', 'kpi--good', 'owner') +
        kpi('Needs verify', cval(verify.length), 'records pass pending', verify.length ? 'kpi--warn' : '', 'verify') +
        kpi('Scam wall', cval(scams.length), 'low authenticity', scams.length ? 'kpi--bad' : '', 'scam') +
      '</div>' +
      '<div class="brackets">' + brTiles + '</div>' +

      '<div class="grid grid--2">' +
        '<div class="panel chart"><div class="panel__head"><h2 class="panel__title">Market pulse — records discovered per run</h2><p class="panel__hint">' + trends.length + ' runs</p></div>' +
          (discovered.length ? sparkline(discovered, 560, 190, '#4cc38a') : '<p class="lane__empty">Trend history arrives with the next publishes.</p>') +
          '<div class="strip" style="margin-top:12px">' + (D.sources || []).slice(0, 12).map(function (s) {
            var cls = srcCls(s.status);
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
      '</div>' +

      '<div class="grid grid--3">' +
        '<div class="lane lane--fit"><h2 class="lane__title">Best fit right now</h2>' + (fits.length ? fits.map(function (l) { return listingCard(l, 'fit'); }).join('') : '<p class="lane__empty">Nothing clears the bar under this lens. Loosen a filter, or trust the empty state — it means VERA isn\'t pretending.</p>') + '</div>' +
        '<div class="lane lane--verify"><h2 class="lane__title">Needs verification</h2>' + (verify.length ? verify.slice(0, 4).map(function (l) { return listingCard(l, 'verify'); }).join('') : '<p class="lane__empty">Verification queue is clear.</p>') + '</div>' +
        '<div class="lane lane--scam"><h2 class="lane__title">Scam wall</h2>' + (scams.length ? scams.slice(0, 4).map(function (l) { return listingCard(l, 'scam'); }).join('') : '<p class="lane__empty">No low-authenticity listings under this lens.</p>') + '</div>' +
      '</div>';

    page.classList.add('is-entered');
    countUps(page);
  }

  /* ---------- discover page ---------- */

  var COLS = [
    { key: 'overall_score', label: 'Score', render: function (l) { return '<span class="t-score">' + (l.overall_score != null ? num(l.overall_score, 1) : '—') + '</span>'; } },
    { key: 'rent', label: 'Rent', render: function (l) { return money(l.rent); } },
    { key: 'title', label: 'Listing', render: function (l) { return '<span class="t-title">' + esc(l.title || l.address_normalized || '—') + '</span>'; } },
    { key: 'neighborhood', label: 'Hood', render: function (l) { return '<span class="t-dim">' + esc(l.neighborhood || '—') + '</span>'; } },
    { key: 'transit_mins', label: 'Subway', render: function (l) { var t = nearestStation(l); return t ? '<span class="t-mono">≈' + t.mins + 'm</span> ' + lineBullets(t.lines) : '<span class="t-dim">—</span>'; } },
    { key: 'unit_type', label: 'Unit', render: function (l) { return unitOf(l) === 'studio' ? 'Studio' : unitOf(l) === '1br' ? '1BR' : esc(l.unit_type || '—'); } },
    { key: 'likely_independent_landlord_score', label: 'Owner', render: function (l) { var o = ownerRead(l); return '<span class="tag ' + o.cls + '">' + o.label + '</span>'; } },
    { key: 'rent_stabilized_signal', label: 'Stab.', render: function (l) { var s = stabilized(l); return s ? '<span class="tag ' + s.cls + '">' + s.label + '</span>' : '<span class="t-dim">—</span>'; } },
    { key: 'hpd_risk_score', label: 'HPD', render: function (l) { return '<span class="risk ' + riskCls(l.hpd_risk_score) + '">' + num(l.hpd_risk_score) + '</span>'; } },
    { key: 'dob_risk_score', label: 'DOB', render: function (l) { return l.dob_risk_score != null ? '<span class="risk ' + riskCls(l.dob_risk_score) + '">' + num(l.dob_risk_score) + '</span>' : '<span class="t-dim">—</span>'; } },
    { key: 'listing_confidence_score', label: 'Real?', render: function (l) { var a = authenticity(l); return a != null ? '<span class="risk ' + (a >= 65 ? 'risk--lo' : a >= 45 ? 'risk--md' : 'risk--hi') + '">' + num(a) + '</span>' : '<span class="t-dim">—</span>'; } },
    { key: 'verification_status', label: 'Verified', render: function (l) { return '<span class="t-mono t-dim">' + esc(String(l.verification_status || '—').replace(/_/g, ' ')) + '</span>'; } },
    { key: 'last_seen_at', label: 'Seen', render: function (l) { return '<span class="t-mono t-dim">' + timeago(l.last_seen_at) + '</span>'; } },
    { key: 'source_name', label: 'Source', render: function (l) { return '<span class="t-mono t-dim">' + esc(l.source_name || '—') + '</span>'; } },
  ];

  function renderDiscover(page) {
    var f = filtered();
    page.innerHTML =
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
          return '<tr data-open="' + esc(l.listing_uid) + '" class="' + (openUid === l.listing_uid ? 'is-open' : '') + '">' +
            COLS.map(function (c) { return '<td>' + c.render(l) + '</td>'; }).join('') + '</tr>';
        }).join('') : '<tr><td colspan="' + COLS.length + '" style="padding:26px;color:var(--mute)">Nothing matches this lens. Widen a tier or clear a filter.</td></tr>') +
      '</tbody></table></div>';

    var qEl = $('[data-q]', page);
    qEl.addEventListener('input', function () {
      state.q = qEl.value;
      /* re-render only table body for keystroke smoothness */
      clearTimeout(qEl._t);
      qEl._t = setTimeout(function () { renderRoute(); var q2 = $('[data-q]'); if (q2) { q2.focus(); q2.setSelectionRange(q2.value.length, q2.value.length); } }, 160);
    });
  }

  /* ---------- pipeline page ---------- */

  function renderPipeline(page) {
    var order = ['discover', 'normalize', 'dedupe', 'enrich', 'score', 'publish'];
    var stages = D.stages || {};
    var trends = (D.run_trends || []).slice(-14);
    var rel = trends.map(function (t) { return +t.avg_reliability || 0; });
    var srcs = D.sources || [];
    var run = D.run || {};

    page.innerHTML =
      '<div class="stages">' + order.map(function (name) {
        var st = stages[name] || {};
        var cls = st.status === 'success' ? 'is-ok' : st.status === 'running' ? 'is-run' : st.status ? 'is-bad' : '';
        return '<div class="stage ' + cls + '"><p class="stage__name"><i></i>' + name + '</p>' +
          '<p class="stage__nums">' + (st.records_out != null ? st.records_out : '—') + ' <small>out · ' + (st.records_in != null ? st.records_in : '—') + ' in</small></p></div>';
      }).join('') + '</div>' +

      '<div class="grid grid--2">' +
        '<div class="panel chart"><div class="panel__head"><h2 class="panel__title">Source reliability trend</h2><p class="panel__hint">avg across sweeps</p></div>' +
          (rel.length ? sparkline(rel, 560, 170, '#74a9d8') : '<p class="lane__empty">Awaiting more runs.</p>') + '</div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Run</h2></div><dl class="kv">' +
          '<dt>Run id</dt><dd class="t-mono">' + esc(run.run_id || '—') + '</dd>' +
          '<dt>Cadence</dt><dd>' + esc(run.cadence || '—') + '</dd>' +
          '<dt>Status</dt><dd>' + esc(run.status || '—') + '</dd>' +
          '<dt>Snapshot</dt><dd>' + timeago(D.generated_at) + '</dd>' +
          '<dt>Lens</dt><dd>public — personal layer stripped at the source</dd>' +
        '</dl></div>' +
      '</div>' +

      '<div class="panel"><div class="panel__head"><h2 class="panel__title">Sources</h2><p class="panel__hint">' + srcs.length + ' registered</p></div>' +
      '<div style="overflow:auto"><table class="srctable"><thead><tr><th>Source</th><th>Status</th><th>Tier</th><th>Reliability</th><th>Last success</th></tr></thead><tbody>' +
        srcs.map(function (s) {
          var cls = srcCls(s.status);
          return '<tr><td>' + esc(s.source_name || '—') + '</td>' +
            '<td><span class="chip ' + cls + '"><i></i>' + esc(s.status || '—') + '</span></td>' +
            '<td class="t-mono">' + esc(s.tier != null ? s.tier : '—') + '</td>' +
            '<td class="t-mono">' + (s.reliability_score != null ? num(s.reliability_score) : '—') + '</td>' +
            '<td class="t-mono">' + timeago(s.last_success_at) + '</td></tr>';
        }).join('') +
      '</tbody></table></div></div>';
  }

  /* ---------- about page ---------- */

  function renderAbout(page) {
    page.innerHTML = '<div class="about">' +
      '<h1>Apartment hunting is a rigged information game. This levels it.</h1>' +
      '<p style="font-size:17.5px;color:var(--ink)">The average New Yorker used to hand over about <b>$13,000</b> before getting a key. Most of what they were told along the way could not be checked. VERA exists because every fact that would have protected them is already public — scattered across six city systems nobody has time to read.</p>' +
      '<h2>What it refuses to do</h2>' +
      '<ul><li><b>No brokers.</b> Listings that come with a broker attached are filtered or flagged, never quietly passed along.</li>' +
      '<li><b>No corporate portfolios.</b> The lens defaults to individual owners — the ones who can still make their own call on a person rather than a credit threshold.</li>' +
      '<li><b>No lead generation.</b> Your details are never collected, so they can never be sold. There is no account to make.</li>' +
      '<li><b>No pretending.</b> When VERA cannot verify something, it says so instead of scoring around it.</li></ul>' +
      '<h2>And the part nobody else tells you</h2>' +
      '<p>Hunting owner-direct has a cost, and burying it would make this just another sales pitch. The smallest landlords often sit <b>outside</b> Good Cause eviction protection, outside rent stabilization, and outside the source-of-income rules that make a voucher usable. That is a real trade for a fairer price and a human on the other end — so VERA shows you the trade on every listing rather than selling you the upside alone.</p>' +
      '<h1 style="font-size:clamp(24px,3vw,34px);margin-top:30px">The hunt, verified.</h1>' +
      '<p><b>VERA</b> — Verified Evaluation for Rental Analysis — is a rental-intelligence system built for one job: finding an honest studio or one-bedroom in New York without wading through brokers, shell companies, and bait listings.</p>' +
      '<h2>What it does every night</h2>' +
      '<p>Six stages: <b>discover</b> sweeps the listing sources · <b>normalize</b> makes them comparable · <b>dedupe</b> collapses the reposts · <b>enrich</b> pulls the building\'s public record — HPD violations, DOB history, litigation, rent-stabilization lists · <b>score</b> weighs it all and writes its reasoning down · <b>publish</b> puts the sanitized result here.</p>' +
      '<h2>The rules it hunts by</h2>' +
      '<ul><li><b>Private landlords first.</b> Broker fees and management-company portfolios get filtered or flagged, never hidden behind euphemism.</li>' +
      '<li><b>Public records over vibes.</b> Every building candidate is run against city data before it earns a recommendation.</li>' +
      '<li><b>Scams get a wall, not a chance.</b> Low-authenticity listings are quarantined and shown with their evidence.</li>' +
      '<li><b>Read-only ethics.</b> VERA never messages landlords, never applies, never scrapes what it shouldn\'t. It evaluates.</li></ul>' +
      '<h2>What you\'re looking at</h2>' +
      '<p>The public lens. Real listings, real scores, real building records — with the owner\'s personal layer (contacts, notes, watchlists) stripped at the source before anything reaches the internet.</p>' +
      '<p style="margin-top:10px">Built and run by <b>Little Fight NYC</b>. The same system design — sweep, verify, score, explain — is how we build business intelligence for clients.</p>' +
      '</div>';
  }

  /* ---------- inspector ---------- */

  var openUid = null;
  var inspTab = 'overview';

  function byUid(uid) { for (var i = 0; i < POOL.length; i++) if (POOL[i].listing_uid === uid) return POOL[i]; return null; }

  function inspOpen(uid) {
    var l = byUid(uid);
    if (!l) return;
    openUid = uid;
    inspTab = 'overview';
    $('[data-inspector]').hidden = false;
    $('[data-scrim]').hidden = false;
    requestAnimationFrame(function () { $('[data-inspector]').classList.add('is-open'); });
    renderInspector(l);
    $$('#main tr.is-open, #main .card.is-open').forEach(function (el) { el.classList.remove('is-open'); });
    var row = $('[data-open="' + uid + '"]');
    if (row && row.tagName === 'TR') row.classList.add('is-open');
  }

  function inspClose() {
    openUid = null;
    $('[data-inspector]').classList.remove('is-open');
    $('[data-scrim]').hidden = true;
    setTimeout(function () { $('[data-inspector]').hidden = true; }, 280);
  }

  function kvRow(k, v) { return v == null || v === '' ? '' : '<dt>' + k + '</dt><dd>' + v + '</dd>'; }

  function renderInspector(l) {
    var o = ownerRead(l);
    $('[data-insp-kicker]').textContent = (l.recommendation || 'unrated').toUpperCase() + ' · score ' + (l.overall_score != null ? num(l.overall_score, 1) : '—');
    $('[data-insp-title]').textContent = l.title || l.address_normalized || 'Listing';
    $('[data-insp-sub]').textContent = [money(l.rent), l.neighborhood, (unitOf(l) === 'studio' ? 'Studio' : unitOf(l) === '1br' ? '1BR' : l.unit_type)].filter(Boolean).join(' · ');
    $$('[data-insp-tabs] button').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-tab') === inspTab); });

    /* action bar — put the listing into the hunt */
    var c = caseOf(l.listing_uid);
    $('[data-insp-actions]').innerHTML = c
      ? '<div class="stagepick">' + STAGES.map(function (s) {
          return '<button type="button" data-stage="' + s.id + '" data-uid="' + esc(l.listing_uid) + '" class="' + (c.stage === s.id ? 'is-on' : '') + '">' + s.label + '</button>';
        }).join('') + '</div>'
      : '<button type="button" class="bigbtn bigbtn--save" data-stage="saved" data-uid="' + esc(l.listing_uid) + '">＋ Save to my hunt</button>' +
        (l.source_url ? '<a class="ghostbtn" href="' + esc(l.source_url) + '" target="_blank" rel="noopener noreferrer">Original ↗</a>' : '');

    var body = $('[data-insp-body]');
    var html = '';

    if (inspTab === 'overview') {
      var shot = photoLayer(l);
      html += '<div class="insp-port"><span class="insp-port__frame">' + portrait(l, 440, 190) + shot + '</span>' +
        '<span class="insp-port__cap">' + (shot
          ? 'Listing photo, straight from the source post. Photos get staged, reused, and stolen — treat it as a claim to check in person, not proof.'
          : 'No photo on this post, so VERA drew the building from the record — floors, era, and lit windows follow this building\'s own data.') +
        '</span></div>';
      html += l.why_this_listing ? '<div class="insp-sec"><h3>Why this listing</h3><p>' + esc(l.why_this_listing) + '</p></div>' : '';
      html += l.next_move ? '<div class="insp-sec"><h3>Next move</h3><p>' + esc(l.next_move) + '</p></div>' : '';
      var pros = l.trust_strengths || [], cons = l.trust_caveats || [];
      if (pros.length) html += '<div class="insp-sec"><h3>Working for it</h3><ul class="good">' + pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      if (cons.length) html += '<div class="insp-sec"><h3>Working against it</h3><ul class="bad">' + cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      var tt = nearestStation(l);
      html += '<dl class="kv">' +
        kvRow('Subway', tt ? '≈' + tt.mins + ' min walk · ' + lineBullets(tt.lines) + ' ' + esc(tt.name) : null) +
        kvRow('First seen', timeago(l.first_seen_at)) + kvRow('Last seen', timeago(l.last_seen_at)) +
        kvRow('Move-in cash', l.estimated_move_in_cash != null ? money(l.estimated_move_in_cash) : null) +
        kvRow('Fee status', esc(l.fee_status)) + kvRow('Sq ft', l.square_feet ? num(l.square_feet) : null) +
        kvRow('Source', esc(l.source_name)) + '</dl>';
      if (l.source_url) html += '<a class="insp-link" href="' + esc(l.source_url) + '" target="_blank" rel="noopener noreferrer">Open the original listing ↗</a>';
    } else if (inspTab === 'money') {
      var m = moveInMath(l);
      if (!m.rent) {
        html += '<div class="insp-sec"><p>No rent published on this listing yet, so VERA will not guess at the money. That absence is itself a signal — a real listing leads with its price.</p></div>';
      } else {
        html += '<div class="insp-sec"><h3>Cash to move in</h3><div class="ledger ledger--tight">' +
          '<div class="ledger__row"><span>First month</span><b>' + money(m.rent) + '</b></div>' +
          '<div class="ledger__row"><span>Security <em>1 month max, by law</em></span><b>' + money(m.deposit) + '</b></div>' +
          '<div class="ledger__row"><span>Application <em>$20 max, by law</em></span><b>' + money(m.appFee) + '</b></div>' +
          '<div class="ledger__row ledger__row--zero"><span>Broker fee</span><b>$0</b></div>' +
          '<div class="ledger__row ledger__row--total"><span>Total</span><b>' + money(m.total) + '</b></div>' +
          '</div><p class="insp-save">You keep roughly <b>' + money(m.saved) + '</b> that a 15% broker fee would have taken.</p></div>' +
          '<div class="insp-sec"><h3>What a landlord will ask you to prove</h3>' +
          '<p>Annual income of about <b>' + money(m.annualIncomeNeeded) + '</b> (the 40× convention). Short of that, a guarantor is usually asked to show <b>' + money(m.guarantorIncomeNeeded) + '</b>, or an institutional guarantor will stand in for roughly <b>' + money(m.guarantorCost) + '</b> once.</p>' +
          '<p class="insp-fine">Income multiples are landlord convention, not law. Private landlords bend them. Corporate portfolios almost never do — which is exactly why VERA points you at the former.</p></div>' +
          '<div class="insp-sec"><h3>Illegal to ask you for</h3><ul class="bad">' +
          '<li>More than ' + money(m.deposit) + ' in security or prepaid rent</li>' +
          '<li>An application fee over $' + LAW.appFeeMax + ' — waived entirely if you bring your own credit and background report from the last 30 days</li>' +
          '<li>A broker fee, if the landlord hired the broker (FARE Act, since ' + LAW.fareActFrom + ')</li>' +
          '<li>A "good faith" or holding deposit before the lease is signed</li>' +
          '<li>Key money, or a "tip for the super" to get the keys</li>' +
          '</ul><p class="insp-fine">Screenshot the ask and report it to DCWP through 311. Your deposit is also due back within ' + LAW.depositReturnDays + ' days of move-out with an itemized list of any deductions. Watch for the quiet workaround too: a first month priced higher than every month after it is a broker fee wearing a disguise.</p></div>';
      }

      /* the disclosure nobody else makes */
      html += '<div class="insp-sec"><h3>What you give up here</h3>' +
        '<p class="insp-fine">Owner-direct is where the fair deals and the human negotiation live. It is also, often, where the least legal protection lives. VERA would rather you knew.</p>' +
        protections(l).map(function (p) {
          var cls = p.state === 'likely in' ? 'is-good' : p.state === 'likely out' ? 'is-bad' : 'is-unk';
          return '<div class="prot ' + cls + '"><span class="prot__state">' + p.state + '</span>' +
            '<b>' + esc(p.name) + '</b><span class="prot__gives">' + esc(p.gives) + '</span>' +
            '<span class="prot__why">' + esc(p.why) + '</span></div>';
        }).join('') + '</div>';

      html += '<div class="insp-sec"><h3>Verify it yourself</h3>' +
        '<p class="insp-fine">VERA reads the same public records you can. Before money moves, confirm who owns this building — the most expensive scams in this city all come down to that one question.</p>' +
        '<div class="vtools">' + VERIFY_TOOLS.map(function (v) {
          return '<a class="vtool" href="' + v[1] + '" target="_blank" rel="noopener noreferrer"><b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>';
        }).join('') + '</div></div>';
    } else if (inspTab === 'visit') {
      var cs = caseOf(l.listing_uid);
      if (!cs) {
        html += '<div class="insp-sec"><p>Save this listing to your hunt and the viewing checklist becomes yours — ' + CHECKS.length + ' things to check while you are standing in the apartment, ticked off and remembered per listing.</p>' +
          '<button type="button" class="bigbtn" data-stage="saved" data-uid="' + esc(l.listing_uid) + '">＋ Save to my hunt</button></div>';
      } else {
        var done = Object.keys(cs.checks || {}).filter(function (k) { return cs.checks[k]; }).length;
        html += '<div class="insp-sec"><h3>Your notes</h3>' +
          '<textarea class="notes" data-note="' + esc(l.listing_uid) + '" placeholder="Smelled fine. Radiator has a valve. Neighbor says the super is quick.">' + esc(cs.notes || '') + '</textarea></div>' +
          '<div class="insp-sec"><h3>Checklist <span class="cprog">' + done + ' / ' + CHECKS.length + '</span></h3>' +
          '<div class="cbar"><span style="width:' + Math.round(done / CHECKS.length * 100) + '%"></span></div>' +
          checkGroups().map(function (g) {
            return '<p class="cgh">' + esc(g) + '</p>' + CHECKS.filter(function (x) { return x.group === g; }).map(function (x) {
              var on = !!(cs.checks || {})[x.id];
              return '<label class="ck ' + (on ? 'is-on' : '') + '"><input type="checkbox" data-check="' + x.id + '" data-uid="' + esc(l.listing_uid) + '"' + (on ? ' checked' : '') + '>' +
                '<span><b>' + esc(x.label) + '</b><em>' + esc(x.why) + '</em></span></label>';
            }).join('');
          }).join('') + '</div>';
      }
    } else if (inspTab === 'records') {
      html += '<dl class="kv">' +
        kvRow('BBL', esc(l.bbl)) + kvRow('BIN', esc(l.bin)) +
        kvRow('HPD risk', '<span class="risk ' + riskCls(l.hpd_risk_score) + '">' + num(l.hpd_risk_score) + '</span>') +
        kvRow('DOB risk', l.dob_risk_score != null ? '<span class="risk ' + riskCls(l.dob_risk_score) + '">' + num(l.dob_risk_score) + '</span>' : null) +
        kvRow('Serious open violations', l.serious_open_violations != null ? String(l.serious_open_violations) : null) +
        kvRow('Serious violations · 3y', l.serious_violations_3y != null ? String(l.serious_violations_3y) : null) +
        kvRow('Heat/hot-water complaints · 3y', l.heat_hot_water_complaints_3y != null ? String(l.heat_hot_water_complaints_3y) : null) +
        kvRow('Bedbug reports · 3y', l.bedbug_reports_3y != null ? String(l.bedbug_reports_3y) : null) +
        kvRow('Litigation · 3y', l.litigation_count_3y != null ? String(l.litigation_count_3y) : null) +
        kvRow('Court signal', esc(l.court_signal)) +
        kvRow('Registration', esc(l.registration_signal)) +
        kvRow('Stabilized list', l.official_rent_stabilized_list_hit ? 'On the official list ✓' : esc(l.rent_stabilized_signal)) +
        kvRow('Lookup', esc(l.public_record_lookup_status)) +
        kvRow('Lookup source', esc(l.public_record_lookup_source)) + '</dl>';
      if (l.rent_stabilized_notes) html += '<div class="insp-sec"><h3>Stabilization notes</h3><p>' + esc(l.rent_stabilized_notes) + '</p></div>';
      if (l.public_record_notes) html += '<div class="insp-sec"><h3>Record notes</h3><p>' + esc(l.public_record_notes) + '</p></div>';
    } else if (inspTab === 'owner') {
      html += '<div class="insp-sec"><h3>Read</h3><p><span class="tag ' + o.cls + '">' + o.label + '</span></p>' +
        (l.owner_read ? '<p>' + esc(l.owner_read) + '</p>' : '') +
        (l.landlord_reason_summary ? '<p>' + esc(l.landlord_reason_summary) + '</p>' : '') + '</div>' +
        '<dl class="kv">' +
        kvRow('Owner name', esc(l.owner_name)) +
        kvRow('Owner type', esc(l.owner_type)) +
        kvRow('Likely landlord type', esc(String(l.likely_landlord_type || '').replace(/_/g, ' '))) +
        kvRow('Independent score', l.likely_independent_landlord_score != null ? num(l.likely_independent_landlord_score) + ' / 100' : null) +
        kvRow('By-owner signal', l.by_owner_signal ? 'yes' : 'no') +
        kvRow('Mgmt-co signal', l.management_company_signal ? 'yes' : 'no') +
        kvRow('Broker', esc(l.broker_name)) + '</dl>';
    } else if (inspTab === 'score') {
      var comp = l.component_scores || {};
      var keys = Object.keys(comp);
      if (keys.length) {
        html += '<div class="insp-sec"><h3>Components</h3>' + keys.map(function (k) {
          var v = +comp[k] || 0;
          return '<div class="scorebar"><span>' + esc(k.replace(/_/g, ' ')) + '</span><span class="scorebar__track"><span class="scorebar__fill" style="width:' + pct(v) + '%"></span></span><span class="scorebar__num">' + num(v, 1) + '</span></div>';
        }).join('') + '</div>';
      }
      var lines = l.score_explanation_lines || [];
      if (lines.length) html += '<div class="insp-sec"><h3>VERA\'s reasoning</h3><ul>' + lines.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      html += '<dl class="kv">' +
        kvRow('Overall', l.overall_score != null ? num(l.overall_score, 1) : null) +
        kvRow('Recommendation', esc(l.recommendation)) +
        kvRow('Authenticity', authenticity(l) != null ? num(authenticity(l)) + ' / 100 (' + esc(l.listing_confidence_band || '—') + ')' : null) +
        kvRow('State bucket', esc(String(l.state_bucket || '').replace(/_/g, ' '))) + '</dl>';
    } else if (inspTab === 'verify') {
      var items = l.what_to_verify_before_applying || [];
      html += items.length
        ? '<div class="insp-sec"><h3>Before applying, verify</h3><ul>' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>'
        : '<div class="insp-sec"><p>No open checklist — VERA considers the paper trail here as clean as public data allows.</p></div>';
      html += '<dl class="kv">' +
        kvRow('Verification status', esc(String(l.verification_status || '').replace(/_/g, ' '))) +
        kvRow('Verification confidence', l.verification_confidence != null ? num(l.verification_confidence) : null) +
        kvRow('Address confidence', l.address_confidence != null ? num(l.address_confidence) : null) +
        kvRow('Duplicates seen', l.duplicate_count != null ? String(l.duplicate_count) : null) + '</dl>';
      if (l.source_url) html += '<a class="insp-link" href="' + esc(l.source_url) + '" target="_blank" rel="noopener noreferrer">Cross-check the source listing ↗</a>';
    }

    body.innerHTML = html || '<p style="color:var(--mute)">Nothing recorded on this tab.</p>';
    body.scrollTop = 0;
  }

  /* ================================================================
     THE MAP — drawn from real coordinates, no tiles, no libraries.
     A New Yorker navigates by trains and rivers, so that is the map:
     the two rivers, the park, every station in the hunt zone, and a
     tether from each listing to the train it actually walks to.
     ================================================================ */

  var B = { s: 40.688, n: 40.834, w: -74.028, e: -73.893 };
  var VW = 1000, VH = 1470;

  function px(lng) { return (lng - B.w) / (B.e - B.w) * VW; }
  function py(lat) { return (B.n - lat) / (B.n - B.s) * VH; }
  function pt(lat, lng) { return px(lng).toFixed(1) + ',' + py(lat).toFixed(1); }

  var HUDSON = [[40.7020, -74.0175], [40.7100, -74.0155], [40.7250, -74.0125], [40.7400, -74.0105],
    [40.7550, -74.0080], [40.7700, -73.9985], [40.7850, -73.9860], [40.8000, -73.9730],
    [40.8150, -73.9620], [40.8340, -73.9530]];

  var EASTRIVER = [[40.7020, -74.0140], [40.7070, -74.0010], [40.7110, -73.9760], [40.7190, -73.9720],
    [40.7280, -73.9700], [40.7370, -73.9680], [40.7460, -73.9660], [40.7550, -73.9585],
    [40.7650, -73.9430], [40.7760, -73.9375], [40.7880, -73.9310], [40.8000, -73.9250],
    [40.8150, -73.9330], [40.8340, -73.9340]];

  var CENTRAL_PARK = [[40.7681, -73.9819], [40.7644, -73.9732], [40.7969, -73.9496], [40.8005, -73.9580]];

  var HOOD_PINS = [
    ['Harlem', 40.8116, -73.9465], ['Upper West Side', 40.7870, -73.9754], ['Upper East Side', 40.7736, -73.9566],
    ['Chelsea', 40.7465, -74.0014], ['Gramercy', 40.7368, -73.9845], ['West Village', 40.7358, -74.0036],
    ['East Village', 40.7265, -73.9815], ['Soho', 40.7233, -74.0030], ['Lower East Side', 40.7150, -73.9843],
    ['FiDi', 40.7075, -74.0100], ['Greenpoint', 40.7304, -73.9540], ['Williamsburg', 40.7143, -73.9520],
    ['E Williamsburg', 40.7095, -73.9330],
  ];

  function poly(points) { return points.map(function (p) { return pt(p[0], p[1]); }).join(' '); }

  function renderMap(page) {
    var f = filtered();
    var geo = f.filter(function (l) { return l.latitude != null && l.longitude != null; });
    // Only plot what actually falls inside the hunt zone. A listing in the far
    // Bronx projects to coordinates outside the viewBox and, because the SVG
    // must not clip its own pin halos, would otherwise draw loose on the page.
    var placed = geo.filter(function (l) {
      var la = +l.latitude, ln = +l.longitude;
      return la >= B.s && la <= B.n && ln >= B.w && ln <= B.e;
    });
    var outside = geo.length - placed.length;
    var lost = f.length - geo.length;

    var landPath = '<polygon class="mp-land" points="' + poly(HUDSON.concat(EASTRIVER.slice().reverse())) + '"/>';
    var bkPath = '<polygon class="mp-land" points="' + poly(EASTRIVER.concat([[B.n, B.e], [B.s, B.e]])) + '"/>';
    var njPath = '<polygon class="mp-land mp-land--far" points="' + poly(HUDSON.concat([[B.n, B.w], [B.s, B.w]])) + '"/>';
    var parkPath = '<polygon class="mp-park" points="' + poly(CENTRAL_PARK) + '"/>';

    var stationDots = STATIONS.map(function (s) {
      var first = String(s[1]).split(/\s+/)[0];
      return '<circle class="mp-stn" cx="' + px(s[3]).toFixed(1) + '" cy="' + py(s[2]).toFixed(1) + '" r="3.4" fill="' + (LINE_COLORS[first] || '#666') + '"><title>' + esc(s[0]) + ' · ' + esc(s[1]) + '</title></circle>';
    }).join('');

    var hoodLabels = HOOD_PINS.map(function (h) {
      return '<text class="mp-hood" x="' + px(h[2]).toFixed(1) + '" y="' + py(h[1]).toFixed(1) + '">' + esc(h[0]).toUpperCase() + '</text>';
    }).join('');

    var tethers = '', pins = '';
    placed.forEach(function (l, i) {
      var x = px(+l.longitude), y = py(+l.latitude);
      var t = nearestStation(l);
      if (t) {
        var sx = null, sy = null;
        for (var k = 0; k < STATIONS.length; k++) {
          if (STATIONS[k][0] === t.name) { sx = px(STATIONS[k][3]); sy = py(STATIONS[k][2]); break; }
        }
        if (sx != null) tethers += '<line class="mp-tether" x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + sx.toFixed(1) + '" y2="' + sy.toFixed(1) + '"/>';
      }
      var rec = isScam(l) ? 'bad' : needsVerify(l) ? 'warn' : 'good';
      var r = 9 + Math.min(11, (+l.overall_score || 0) / 8);
      pins += '<g class="mp-pin mp-pin--' + rec + '" data-open="' + esc(l.listing_uid) + '" tabindex="0" role="button" style="--d:' + (i * 55) + 'ms" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')">' +
        '<circle class="mp-halo" r="' + (r + 11).toFixed(1) + '"/>' +
        '<circle class="mp-dot" r="' + r.toFixed(1) + '"/>' +
        '<text class="mp-rent" y="4">' + (l.rent ? '$' + Math.round(l.rent / 100) / 10 + 'k' : '?') + '</text>' +
        '<title>' + esc(l.title || 'Listing') + ' · ' + money(l.rent) + (t ? ' · ≈' + t.mins + ' min to ' + esc(t.name) : '') + '</title></g>';
    });

    var sorted = placed.slice().sort(function (a, b) { return (a.transit_mins || 999) - (b.transit_mins || 999); });

    page.innerHTML =
      '<div class="maplay">' +
        '<div class="panel mapwrap">' +
          '<div class="panel__head"><h2 class="panel__title">The hunt zone</h2>' +
          '<p class="panel__hint">' + placed.length + ' plotted' +
            (outside ? ' · ' + outside + ' outside the zone' : '') +
            (lost ? ' · ' + lost + ' without coordinates' : '') + '</p></div>' +
          '<svg class="mp" viewBox="0 0 ' + VW + ' ' + VH + '" role="img" aria-label="Map of listings and subway stations">' +
            '<rect class="mp-water" x="0" y="0" width="' + VW + '" height="' + VH + '"/>' +
            njPath + bkPath + landPath + parkPath +
            '<g class="mp-stns">' + stationDots + '</g>' +
            '<g class="mp-hoods">' + hoodLabels + '</g>' +
            '<g class="mp-tethers">' + tethers + '</g>' +
            '<g class="mp-pins">' + pins + '</g>' +
          '</svg>' +
          '<div class="mp-key">' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--good"></i>Clears the bar</span>' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--warn"></i>Needs verification</span>' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--bad"></i>Scam wall</span>' +
            '<span class="mp-key__i"><i class="mp-swatch mp-swatch--stn"></i>Subway · line tethered to nearest walk</span>' +
          '</div>' +
        '</div>' +
        '<div class="panel"><div class="panel__head"><h2 class="panel__title">Closest to a train</h2><p class="panel__hint">tap to inspect</p></div>' +
          (sorted.length ? '<div class="walklist">' + sorted.map(function (l) {
            var t = nearestStation(l);
            return '<button type="button" class="walkrow" data-open="' + esc(l.listing_uid) + '">' +
              '<span class="walkrow__min">' + (t ? '≈' + t.mins : '—') + '<small>min</small></span>' +
              '<span class="walkrow__body"><b>' + esc(l.title || l.address_normalized || 'Listing') + '</b>' +
              '<span>' + (t ? lineBullets(t.lines) + ' ' + esc(t.name) : 'no station within reach') + '</span></span>' +
              '<span class="walkrow__rent">' + money(l.rent) + '</span></button>';
          }).join('') + '</div>' : '<p class="lane__empty">Nothing with coordinates under this lens yet. Widen a filter — or watch the Pipeline page, geocoding is where thin nights show up first.</p>') +
        '</div>' +
      '</div>';
    page.classList.add('is-entered');
  }

  /* ================================================================
     MY HUNT — the pipeline for one human, not for the data
     ================================================================ */

  function renderCases(page) {
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
        '<a class="bigbtn" href="#/discover">Go find something ↗</a></div>';
      return;
    }

    page.innerHTML =
      '<div class="kpis">' +
        '<div class="kpi"><p class="kpi__label">In play</p><p class="kpi__value"><span data-count-to="' + live.length + '">0</span></p><p class="kpi__note">' + (byStage.dead || []).length + ' passed on</p></div>' +
        '<div class="kpi"><p class="kpi__label">Average ask</p><p class="kpi__value">' + (avg ? '<span data-count-to="' + avg + '" data-count-prefix="$" data-count-final="' + money(avg) + '">$0</span>' : '—') + '</p><p class="kpi__note">across your shortlist</p></div>' +
        '<div class="kpi kpi--good"><p class="kpi__label">Broker fees avoided</p><p class="kpi__value">' + (savedFees ? '<span data-count-to="' + Math.round(savedFees) + '" data-count-prefix="$" data-count-final="' + money(savedFees) + '">$0</span>' : '$0') + '</p><p class="kpi__note">if every one had a fee</p></div>' +
        '<div class="kpi"><p class="kpi__label">Furthest stage</p><p class="kpi__value" style="font-size:30px">' + esc((STAGES.filter(function (s) { return (byStage[s.id] || []).length && s.id !== 'dead'; }).pop() || { label: '—' }).label) + '</p><p class="kpi__note">keep going</p></div>' +
      '</div>' +
      '<div class="board">' + STAGES.map(function (s) {
        var items = byStage[s.id] || [];
        return '<div class="col' + (s.id === 'dead' ? ' col--dead' : '') + '">' +
          '<p class="col__head">' + s.label + ' <b>' + items.length + '</b></p>' +
          '<p class="col__hint">' + s.hint + '</p>' +
          (items.length ? items.map(function (c) {
            return '<div class="ccard"><button type="button" class="ccard__open" data-open="' + esc(c.uid) + '">' +
              '<b>' + esc(c.title || c.uid) + '</b>' +
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
     TOOLKIT — the calculators and the field manual
     ================================================================ */

  var toolRent = 2400;
  var toolIncome = 0;

  function renderToolkit(page) {
    var r = toolRent;
    var deposit = r * LAW.depositMaxMonths;
    var total = r + deposit + LAW.appFeeMax;
    var brokerTotal = total + r * 1.5;
    var need = r * LAW.incomeRuleX;
    var guarNeed = r * LAW.guarantorRuleX;
    var qualifies = toolIncome >= need;
    var guarantorPath = toolIncome > 0 && !qualifies;

    page.innerHTML =
      '<div class="grid grid--2">' +
        '<div class="panel tool"><div class="panel__head"><h2 class="panel__title">What it really costs to move in</h2><p class="panel__hint">NY law, not vibes</p></div>' +
          '<label class="slider"><span>Monthly rent <b>' + money(r) + '</b></span>' +
          '<input type="range" min="1200" max="4000" step="25" value="' + r + '" data-toolrent aria-label="Monthly rent"></label>' +
          '<div class="ledger">' +
            '<div class="ledger__row"><span>First month\'s rent</span><b>' + money(r) + '</b></div>' +
            '<div class="ledger__row"><span>Security deposit <em>capped at one month</em></span><b>' + money(deposit) + '</b></div>' +
            '<div class="ledger__row"><span>Application fee <em>capped at $20</em></span><b>' + money(LAW.appFeeMax) + '</b></div>' +
            '<div class="ledger__row ledger__row--zero"><span>Broker fee <em>private landlord — nobody hired one</em></span><b>$0</b></div>' +
            '<div class="ledger__row ledger__row--total"><span>Cash to move in</span><b>' + money(total) + '</b></div>' +
          '</div>' +
          '<div class="compare"><div class="compare__bar"><span class="compare__vera" style="width:' + Math.round(total / brokerTotal * 100) + '%"><i>VERA ' + money(total) + '</i></span></div>' +
          '<div class="compare__bar compare__bar--ghost"><span class="compare__broker"><i>With a broker fee ' + money(brokerTotal) + '</i></span></div>' +
          '<p class="compare__note">A 15% broker fee on this rent is <b>' + money(r * 1.5) + '</b> you never spend. Since the FARE Act took effect ' + LAW.fareActFrom + ', a broker hired by the landlord cannot bill it to you at all — if one tries, that is a violation you can report to DCWP through 311.</p></div>' +
        '</div>' +

        '<div class="panel tool"><div class="panel__head"><h2 class="panel__title">Do you clear the 40× wall</h2><p class="panel__hint">the gate every New Yorker hits</p></div>' +
          '<label class="slider"><span>Your annual income <b>' + (toolIncome ? money(toolIncome) : 'not set') + '</b></span>' +
          '<input type="range" min="0" max="250000" step="2500" value="' + toolIncome + '" data-toolincome aria-label="Annual income"></label>' +
          '<div class="verdict ' + (toolIncome === 0 ? '' : qualifies ? 'is-good' : 'is-warn') + '">' +
            (toolIncome === 0
              ? '<b>Slide your income in.</b><span>Most NYC landlords want to see annual income of 40× the monthly rent. VERA will tell you exactly where you stand — and what a guarantor changes.</span>'
              : qualifies
                ? '<b>You clear it.</b><span>' + money(toolIncome) + ' is above the ' + money(need) + ' a landlord typically wants for ' + money(r) + '/month. Bring pay stubs, an offer letter, and your last two tax returns and you are the easy applicant in the room.</span>'
                : '<b>You need a guarantor — or a lower bracket.</b><span>At ' + money(r) + '/month most landlords want ' + money(need) + '. You are ' + money(need - toolIncome) + ' short. A guarantor typically needs ' + money(guarNeed) + ' in income, or an institutional guarantor service will stand in for roughly ' + money(Math.round(r * LAW.guarantorTypicalPct)) + ' one time.</span>') +
          '</div>' +
          '<div class="afford"><p class="afford__label">On ' + (toolIncome ? money(toolIncome) : 'your income') + ', the 40× rule puts you at</p>' +
          '<p class="afford__big">' + (toolIncome ? money(Math.floor(toolIncome / LAW.incomeRuleX / 25) * 25) : '—') + '<small>/month</small></p>' +
          (toolIncome ? '<div class="afford__brackets">' + BRACKETS.map(function (br) {
            var reach = toolIncome / LAW.incomeRuleX >= br.lo;
            return '<span class="' + (reach ? 'is-reach' : '') + '">' + br.label + (reach ? ' ✓' : ' ✕') + '</span>';
          }).join('') + '</div>' : '') + '</div>' +
          (guarantorPath ? '<p class="tool__fine">Worth knowing: income rules are landlord convention, not law. A private landlord — the only kind VERA surfaces — can and often does make their own call. That flexibility is the whole reason to skip the corporate portfolios.</p>' : '') +
        '</div>' +
      '</div>' +

      '<div class="panel"><div class="panel__head"><h2 class="panel__title">When to hunt</h2><p class="panel__hint">three different "best times" — they are not the same month</p></div>' +
        '<p class="tool__intro">Everyone repeats that winter is cheaper. On a like-for-like apartment it is worth about two percent — the big winter "discount" is mostly a change in what is being listed, not a change in price. What genuinely moves is <b>selection</b> and <b>your leverage</b>, and those peak in opposite seasons.</p>' +
        '<div class="seasons">' +
          '<div class="season season--sel"><span class="season__when">June – August</span><b>Most to choose from</b>' +
          '<span class="season__n">peak inventory</span>' +
          '<p>Roughly a fifth more listings than the winter floor. It is also when apartments move fastest — about ' + MARKET.manhattanDom + ' days to rent in Manhattan, against 55–60 in deep winter. Bring your paperwork.</p></div>' +
          '<div class="season season--cheap"><span class="season__when">December – February</span><b>Lowest asking rents</b>' +
          '<span class="season__n">the trough</span>' +
          '<p>Median asking rent bottoms out here — but a chunk of that is smaller, plainer inventory rather than a true discount. Less to see, more time to see it.</p></div>' +
          '<div class="season season--lev"><span class="season__when">September – November</span><b>Most negotiating room</b>' +
          '<span class="season__n">peak price cuts</span>' +
          '<p>The share of listings taking a price cut roughly doubles versus spring, peaking in October as landlords clear summer leftovers into thin demand. The best month to ask is not the cheapest month to look.</p></div>' +
        '</div>' +
        '<p class="tool__fine">Start about <b>' + MARKET.leadDays + ' days</b> before you need to move. Earlier and most of what you see will be gone by your date; later and you are choosing under pressure. Figures reflect published New York City market data through ' + MARKET.asOf + '.</p>' +
      '</div>' +

      '<div class="panel"><div class="panel__head"><h2 class="panel__title">Scam school</h2><p class="panel__hint">tap a card — the tells, learned the hard way</p></div>' +
        '<div class="telldeck">' + TELLS.map(function (t, i) {
          return '<button type="button" class="tell tell--' + t.k + '" data-tell style="--d:' + (i * 40) + 'ms">' +
            '<span class="tell__front"><b>' + esc(t.t) + '</b><em>tap</em></span>' +
            '<span class="tell__back">' + esc(t.d) + '</span></button>';
        }).join('') + '</div>' +
        '<p class="tool__fine">Three of those are not judgment calls — they are illegal in New York. More than one month of security, an application fee over $20, and a landlord-hired broker billing the tenant. Screenshot the ask and report it at 311.</p>' +
      '</div>' +

      '<div class="panel"><div class="panel__head"><h2 class="panel__title">The viewing checklist</h2><p class="panel__hint">' + CHECKS.length + ' things people wish they had checked</p></div>' +
        '<p class="tool__intro">Open any saved listing and run this list standing in the apartment — VERA keeps your ticks with that listing. Here it is in full, because half of hunting well is knowing what to look at.</p>' +
        checkGroups().map(function (g) {
          return '<div class="cgroup"><h3>' + esc(g) + '</h3><ul>' +
            CHECKS.filter(function (c) { return c.group === g; }).map(function (c) {
              return '<li><b>' + esc(c.label) + '</b><span>' + esc(c.why) + '</span></li>';
            }).join('') + '</ul></div>';
        }).join('') +
      '</div>';
    page.classList.add('is-entered');
  }

  /* ---------- router ---------- */

  function route() {
    var m = (location.hash || '#/command').match(/^#\/(\w+)/);
    var r = m ? m[1] : 'command';
    if (!$('[data-page="' + r + '"]')) r = 'command';
    state.route = r;
    $$('.rail__nav a').forEach(function (a) { a.classList.toggle('is-here', a.getAttribute('data-route') === r); });
    renderRoute();
  }

  function renderRoute() {
    if (!D) return;
    $$('.page').forEach(function (p) { p.hidden = p.getAttribute('data-page') !== state.route; });
    var page = $('[data-page="' + state.route + '"]');
    page.classList.remove('is-entered');
    if (state.route === 'command') renderCommand(page);
    else if (state.route === 'map') renderMap(page);
    else if (state.route === 'discover') renderDiscover(page);
    else if (state.route === 'cases') renderCases(page);
    else if (state.route === 'toolkit') renderToolkit(page);
    else if (state.route === 'pipeline') renderPipeline(page);
    else renderAbout(page);
    /* filters only steer the data views */
    var chrome = $('[data-filters]');
    if (chrome) chrome.hidden = (state.route === 'toolkit' || state.route === 'about' || state.route === 'pipeline' || state.route === 'cases');
  }

  /* ---------- events ---------- */

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-bracket],[data-brtile],[data-area],[data-transit],[data-unit],[data-lens],[data-view],[data-hood],[data-hoodbar],[data-clear],[data-open],[data-kpi],[data-sort],[data-density],[data-insp-close],[data-scrim],[data-tab],[data-stage],[data-drop],[data-tell]');
    if (!t) return;

    if (t.hasAttribute('data-stage')) {
      setStage(t.getAttribute('data-uid'), t.getAttribute('data-stage'));
      var lz = byUid(t.getAttribute('data-uid'));
      if (lz && openUid === lz.listing_uid) renderInspector(lz);
      if (state.route === 'cases') renderRoute();
      return;
    }
    if (t.hasAttribute('data-drop')) {
      dropCase(t.getAttribute('data-drop'));
      renderRoute();
      return;
    }
    if (t.hasAttribute('data-tell')) { t.classList.toggle('is-flipped'); return; }

    if (t.hasAttribute('data-bracket')) { state.bracket = t.getAttribute('data-bracket'); refresh(); }
    else if (t.hasAttribute('data-brtile')) {
      var brId = t.getAttribute('data-brtile');
      state.bracket = state.bracket === brId ? 'all' : brId;
      refresh();
    }
    else if (t.hasAttribute('data-area')) {
      var aid = t.getAttribute('data-area'); var ai = state.areas.indexOf(aid);
      if (ai > -1) state.areas.splice(ai, 1); else state.areas.push(aid);
      refresh();
    }
    else if (t.hasAttribute('data-transit')) { state.transit = +t.getAttribute('data-transit'); refresh(); }
    else if (t.hasAttribute('data-unit')) { state.unit = t.getAttribute('data-unit'); refresh(); }
    else if (t.hasAttribute('data-lens')) { var k = t.getAttribute('data-lens'); state.lens[k] = !state.lens[k]; refresh(); }
    else if (t.hasAttribute('data-view')) { state.view = t.getAttribute('data-view'); refresh(); }
    else if (t.hasAttribute('data-hood')) {
      var h = t.getAttribute('data-hood'); var i = state.hoods.indexOf(h);
      if (i > -1) state.hoods.splice(i, 1); else state.hoods.push(h);
      refresh();
    }
    else if (t.hasAttribute('data-hoodbar')) {
      var hb = t.getAttribute('data-hoodbar'); var j = state.hoods.indexOf(hb);
      if (j > -1) state.hoods.splice(j, 1); else state.hoods = [hb];
      location.hash = '#/discover';
      refresh();
    }
    else if (t.hasAttribute('data-clear')) {
      state.bracket = 'all'; state.unit = 'all'; state.hoods = []; state.areas = []; state.transit = 0; state.q = '';
      state.lens = { noBrokers: false, noMgmt: false, privateFirst: false }; state.view = 'all';
      refresh();
    }
    else if (t.hasAttribute('data-kpi')) {
      var kk = t.getAttribute('data-kpi');
      if (kk === 'discover') location.hash = '#/discover';
      else { state.view = kk; if (kk !== 'fresh') location.hash = '#/discover'; refresh(); }
    }
    else if (t.hasAttribute('data-sort')) {
      var sk = t.getAttribute('data-sort');
      if (state.sort.key === sk) state.sort.dir *= -1;
      else state.sort = { key: sk, dir: sk === 'title' || sk === 'neighborhood' || sk === 'source_name' || sk === 'transit_mins' ? 1 : -1 };
      renderRoute();
    }
    else if (t.hasAttribute('data-density')) { state.density = t.getAttribute('data-density'); persist(); renderRoute(); }
    else if (t.hasAttribute('data-open')) { inspOpen(t.getAttribute('data-open')); }
    else if (t.hasAttribute('data-insp-close') || t.hasAttribute('data-scrim')) { inspClose(); }
    else if (t.hasAttribute('data-tab')) { inspTab = t.getAttribute('data-tab'); var l = byUid(openUid); if (l) renderInspector(l); }
  });

  /* toolkit sliders, checklist ticks, notes */
  document.addEventListener('input', function (e) {
    var el = e.target;
    // A full renderRoute() on every input event replaced the very range input
    // being dragged, so the pointer capture died and the slider moved one step
    // per press. Track the value and update the read-out in place while the
    // drag is live; the page rebuilds on 'change', when the thumb is released.
    if (el.hasAttribute && el.hasAttribute('data-toolrent')) {
      toolRent = +el.value;
      var rOut = el.parentNode && el.parentNode.querySelector('b');
      if (rOut) rOut.textContent = money(toolRent);
    }
    else if (el.hasAttribute && el.hasAttribute('data-toolincome')) {
      toolIncome = +el.value;
      var iOut = el.parentNode && el.parentNode.querySelector('b');
      if (iOut) iOut.textContent = toolIncome ? money(toolIncome) : 'not set';
    }
    else if (el.hasAttribute && el.hasAttribute('data-note')) {
      var uid = el.getAttribute('data-note');
      if (cases[uid]) { cases[uid].notes = el.value; clearTimeout(el._t); el._t = setTimeout(saveCases, 400); }
    }
  });

  document.addEventListener('change', function (e) {
    var el = e.target;
    if (!el.hasAttribute) return;

    // Thumb released — now it is safe to rebuild the toolkit around the value.
    if (el.hasAttribute('data-toolrent') || el.hasAttribute('data-toolincome')) { renderRoute(); return; }

    if (!el.hasAttribute('data-check')) return;
    var uid = el.getAttribute('data-uid'), id = el.getAttribute('data-check');
    if (!cases[uid]) return;
    cases[uid].checks = cases[uid].checks || {};
    cases[uid].checks[id] = el.checked;
    saveCases();

    // Re-rendering the inspector here scrolled the body back to the top and
    // replaced the checkbox mid-tap. The checklist is meant to be worked
    // through standing in the apartment, so update the progress bar in place.
    var box = el.closest ? el.closest('.ck') : null;
    if (box) box.classList.toggle('is-on', el.checked);

    var done = 0;
    $$('[data-check][data-uid="' + uid + '"]').forEach(function (c) { if (c.checked) done++; });
    var fill = $('.cbar span');
    if (fill) fill.style.width = Math.round(done / CHECKS.length * 100) + '%';
    var prog = $('.cprog');
    if (prog) prog.textContent = done + ' / ' + CHECKS.length;
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openUid) inspClose(); });
  window.addEventListener('hashchange', route);

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
      var t = nearestStation(l);
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
    if (TESTMODE) runTests();
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
        // A render error is not a feed error. Catching both together made VERA
        // silently refetch the next origin and re-run the same broken render
        // against an already-removed loading node — blank screen, no clue why.
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

  boot();

  /* ---------- dev hooks + acceptance checks ---------- */

  window.__vera = {
    state: state,
    pool: function () { return POOL; },
    filtered: filtered,
    open: inspOpen,
    info: function () {
      return {
        loaded: !!D, pool: POOL.length, filtered: filtered().length, hoods: HOODS.length,
        route: state.route, view: state.view, fallbackPool: usedFallbackPool,
        generated: D && D.generated_at,
      };
    },
  };

  function runTests() {
    var results = [];
    function check(name, ok, detail) { results.push({ name: name, ok: !!ok, detail: String(detail == null ? '' : detail) }); }
    setTimeout(function () {
      check('feed loaded', !!D, D && D.generated_at);
      check('pool populated', POOL.length > 0, POOL.length);
      check('kpi band renders', $$('[data-page="command"] .kpi').length >= 6, $$('.kpi').length);

      var before = filtered().length;
      state.bracket = 'b1';
      var b1ok = filtered().every(function (l) { return bracketOf(l.rent) === 'b1'; });
      check('bracket lane isolates ≤$2,000', b1ok, filtered().length + ' of ' + before);
      state.bracket = 'all';

      var withCoords = POOL.filter(function (l) { return l.latitude != null; });
      var computed = withCoords.filter(function (l) { return nearestStation(l); });
      check('subway proximity computed', withCoords.length === 0 || computed.length > 0, computed.length + '/' + withCoords.length + ' within reach');

      state.areas = ['dtm'];
      var areaOk = filtered().every(function (l) { return areaOf(l) === 'dtm'; });
      check('focus area filter scopes downtown', areaOk, filtered().length + ' listings');
      state.areas = [];

      state.lens.noBrokers = true; state.lens.noMgmt = true;
      var lensed = filtered();
      var dirty = lensed.filter(function (l) { var o = ownerRead(l).label; return o === 'Broker' || o === 'Corporate'; }).length;
      check('owner lens excludes brokers + corps', dirty === 0, 'violations=' + dirty);
      state.lens.noBrokers = false; state.lens.noMgmt = false;

      state.view = 'scam';
      var scv = filtered().every(isScam);
      check('scam wall view isolates low authenticity', scv, filtered().length + ' flagged');
      state.view = 'all';

      location.hash = '#/discover'; route();
      check('discover table renders', $$('.dt tbody tr').length > 0, $$('.dt tbody tr').length + ' rows');
      var th = $('.dt thead th[data-sort="rent"]');
      th.click(); th.click();
      var rents = filtered().map(function (l) { return +l.rent || 0; });
      var sortedOk = rents.every(function (v, i) { return i === 0 || rents[i - 1] >= v || state.sort.key !== 'rent'; });
      check('column sort works', state.sort.key === 'rent' && sortedOk, state.sort.key + ' dir=' + state.sort.dir);

      var first = $$('.dt tbody tr[data-open]')[0];
      if (first) {
        first.click();
        check('inspector opens', !$('[data-inspector]').hidden, '');
        $('[data-insp-tabs] [data-tab="records"]').click();
        check('records tab renders public data', $('[data-insp-body]').textContent.length > 20, '');
        inspClose();
      } else {
        check('inspector opens', false, 'no rows');
      }

      check('no private feed touched', FEEDS.every(function (u) { return u.indexOf('hunt') === -1 && u.indexOf('dashboard.json') === -1; }), FEEDS.join(' '));
      check('brand present', $('.brand__name').textContent === 'VERA', '');

      /* ---- platform: map ---- */
      location.hash = '#/map'; route();
      check('map draws land, stations, and pins', $$('.mp-land').length >= 2 && $$('.mp-stn').length > 40 && !!$('.mp'), $$('.mp-stn').length + ' stations');

      /* ---- platform: money engine obeys NY law ---- */
      var mm = moveInMath({ rent: 2400 });
      check('deposit capped at one month', mm.deposit === 2400, '$' + mm.deposit);
      check('application fee capped at $20', mm.appFee === 20, '$' + mm.appFee);
      check('move-in total carries no broker fee', mm.total === 2400 + 2400 + 20, '$' + mm.total);
      check('40x income rule surfaced', mm.annualIncomeNeeded === 96000, '$' + mm.annualIncomeNeeded);

      /* ---- platform: the hunt workspace ---- */
      var probe = POOL[0] && POOL[0].listing_uid;
      var hadCase = !!caseOf(probe);
      if (probe && !hadCase) {
        setStage(probe, 'saved');
        check('listing saves into the hunt', !!caseOf(probe) && caseOf(probe).stage === 'saved', '');
        cases[probe].checks = { water: true };
        saveCases();
        check('viewing checklist persists per listing', caseOf(probe).checks.water === true, '');
        location.hash = '#/cases'; route();
        check('hunt board renders stage columns', $$('.board .col').length === STAGES.length, $$('.board .col').length + ' columns');
        dropCase(probe);
        check('case can be removed', !caseOf(probe), '');
      } else {
        check('listing saves into the hunt', true, 'skipped — existing case');
      }

      /* ---- platform: toolkit ---- */
      location.hash = '#/toolkit'; route();
      check('toolkit renders both calculators', $$('.tool').length === 2, $$('.tool').length);
      check('scam school deck present', $$('.tell').length === TELLS.length, $$('.tell').length + ' tells');
      check('viewing checklist published in full', $$('.cgroup li').length === CHECKS.length, $$('.cgroup li').length + ' checks');
      check('filters hidden on non-data pages', $('[data-filters]').hidden === true, '');

      location.hash = '#/command'; route();
      window.__testResults = { pass: results.every(function (r) { return r.ok; }), results: results };
      console.log('[VERA TESTS]', JSON.stringify(window.__testResults, null, 1));
    }, 600);
  }
})();
