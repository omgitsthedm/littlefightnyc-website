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
    rent: 0, unit: 'all', hoods: [], lens: { noBrokers: false, noMgmt: false, privateFirst: false },
    view: 'all', q: '', sort: { key: 'overall_score', dir: -1 }, density: 'comfortable', route: 'command',
  };

  try {
    var saved = JSON.parse(localStorage.getItem('vera-workspace') || 'null');
    if (saved) { ['rent', 'unit', 'hoods', 'lens', 'view', 'density'].forEach(function (k) { if (saved[k] !== undefined) state[k] = saved[k]; }); }
  } catch (e) {}

  function persist() {
    try { localStorage.setItem('vera-workspace', JSON.stringify({ rent: state.rent, unit: state.unit, hoods: state.hoods, lens: state.lens, view: state.view, density: state.density })); } catch (e) {}
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
    if (String(l.unit_type || '').toLowerCase() === 'studio' || +l.beds === 0) return 'studio';
    if (+l.beds === 1) return '1br';
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
      if (state.rent && (+l.rent || 0) > state.rent) return false;
      if (state.unit !== 'all' && unitOf(l) !== state.unit) return false;
      if (state.hoods.length && state.hoods.indexOf(l.neighborhood || 'Unknown') === -1) return false;
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
    $$('[data-rent]').forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-rent') === state.rent); });
    $$('[data-unit]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-unit') === state.unit); });
    $$('[data-lens]').forEach(function (b) { b.classList.toggle('is-on', !!state.lens[b.getAttribute('data-lens')]); });
    $$('[data-view]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-view') === state.view); });
    var box = $('[data-hoods]');
    box.innerHTML = HOODS.map(function (h) {
      return '<button type="button" data-hood="' + esc(h.name) + '" class="' + (state.hoods.indexOf(h.name) > -1 ? 'is-on' : '') + '">' + esc(h.name) + ' <span style="opacity:.55">' + h.count + '</span></button>';
    }).join('');
    var dirty = state.rent || state.unit !== 'all' || state.hoods.length || state.lens.noBrokers || state.lens.noMgmt || state.lens.privateFirst || state.view !== 'all' || state.q;
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
      '<span class="card__top"><span class="card__score">' + score + '</span><span class="card__rent">' + money(l.rent) + '</span></span>' +
      '<h3 class="card__title">' + esc(l.title || l.address_normalized || 'Untitled listing') + '</h3>' +
      '<span class="card__meta">' +
        '<span class="tag ' + o.cls + '">' + o.label + '</span>' +
        '<span class="tag">' + esc(l.neighborhood || '—') + '</span>' +
        '<span class="tag">' + (unitOf(l) === 'studio' ? 'Studio' : unitOf(l) === '1br' ? '1BR' : esc(l.unit_type || '?')) + '</span>' +
        (st ? '<span class="tag ' + st.cls + '">' + st.label + '</span>' : '') +
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
      if (state.rent && (+l.rent || 0) > state.rent) return;
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
    (changes.gone_listings || []).slice(0, 3).forEach(function (c) { feed.push({ b: 'gone', t: c.title || c.listing_uid, n: money(c.rent), hood: c.neighborhood }); });

    page.innerHTML =
      (usedFallbackPool ? '<p class="notice">Feed is serving the pre-overhaul contract — pool view is limited to curated lanes until tonight\'s publish.</p>' : '') +
      '<div class="kpis">' +
        kpi('In pool', f.length + '<small>/' + POOL.length + '</small>', 'under current lens', '', 'discover') +
        kpi('New tonight', String(sm.new_today != null ? sm.new_today : fresh.length), (dc.gone || 0) + ' gone · ' + (dc.back || 0) + ' back', 'kpi--good', 'fresh') +
        kpi('Median ask', rents.length ? money(median(rents)) : '—', rents.length + ' priced', '') +
        kpi('Price drops', String(sm.price_drops || dc.price_drop || 0), (sm.price_hikes || dc.price_hike || 0) + ' hikes', (sm.price_drops || dc.price_drop) ? 'kpi--good' : '') +
        kpi('Private landlords', String(privates.length), 'no broker, no corp', 'kpi--good', 'owner') +
        kpi('Needs verification', String(verify.length), 'records pass pending', verify.length ? 'kpi--warn' : '', 'verify') +
        kpi('Scam wall', String(scams.length), 'low authenticity', scams.length ? 'kpi--bad' : '', 'scam') +
      '</div>' +

      '<div class="grid grid--2">' +
        '<div class="panel chart"><div class="panel__head"><h2 class="panel__title">Market pulse — records discovered per run</h2><p class="panel__hint">' + trends.length + ' runs</p></div>' +
          (discovered.length ? sparkline(discovered, 560, 130, '#4cc38a') : '<p class="lane__empty">Trend history arrives with the next publishes.</p>') +
          '<div class="strip" style="margin-top:12px">' + (D.sources || []).slice(0, 12).map(function (s) {
            var cls = s.status === 'healthy' ? 'is-ok' : s.status === 'partial' ? 'is-warn' : 'is-bad';
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
  }

  /* ---------- discover page ---------- */

  var COLS = [
    { key: 'overall_score', label: 'Score', render: function (l) { return '<span class="t-score">' + (l.overall_score != null ? num(l.overall_score, 1) : '—') + '</span>'; } },
    { key: 'rent', label: 'Rent', render: function (l) { return money(l.rent); } },
    { key: 'title', label: 'Listing', render: function (l) { return '<span class="t-title">' + esc(l.title || l.address_normalized || '—') + '</span>'; } },
    { key: 'neighborhood', label: 'Hood', render: function (l) { return '<span class="t-dim">' + esc(l.neighborhood || '—') + '</span>'; } },
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
          (rel.length ? sparkline(rel, 560, 120, '#74a9d8') : '<p class="lane__empty">Awaiting more runs.</p>') + '</div>' +
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
          var cls = s.status === 'healthy' ? 'is-ok' : s.status === 'partial' ? 'is-warn' : 'is-bad';
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
      '<h1>The hunt, verified.</h1>' +
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

    var body = $('[data-insp-body]');
    var html = '';

    if (inspTab === 'overview') {
      html += l.why_this_listing ? '<div class="insp-sec"><h3>Why this listing</h3><p>' + esc(l.why_this_listing) + '</p></div>' : '';
      html += l.next_move ? '<div class="insp-sec"><h3>Next move</h3><p>' + esc(l.next_move) + '</p></div>' : '';
      var pros = l.trust_strengths || [], cons = l.trust_caveats || [];
      if (pros.length) html += '<div class="insp-sec"><h3>Working for it</h3><ul class="good">' + pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      if (cons.length) html += '<div class="insp-sec"><h3>Working against it</h3><ul class="bad">' + cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      html += '<dl class="kv">' +
        kvRow('First seen', timeago(l.first_seen_at)) + kvRow('Last seen', timeago(l.last_seen_at)) +
        kvRow('Move-in cash', l.estimated_move_in_cash != null ? money(l.estimated_move_in_cash) : null) +
        kvRow('Fee status', esc(l.fee_status)) + kvRow('Sq ft', l.square_feet ? num(l.square_feet) : null) +
        kvRow('Source', esc(l.source_name)) + '</dl>';
      if (l.source_url) html += '<a class="insp-link" href="' + esc(l.source_url) + '" target="_blank" rel="noopener noreferrer">Open the original listing ↗</a>';
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
    if (state.route === 'command') renderCommand(page);
    else if (state.route === 'discover') renderDiscover(page);
    else if (state.route === 'pipeline') renderPipeline(page);
    else renderAbout(page);
  }

  /* ---------- events ---------- */

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-rent],[data-unit],[data-lens],[data-view],[data-hood],[data-hoodbar],[data-clear],[data-open],[data-kpi],[data-sort],[data-density],[data-insp-close],[data-scrim],[data-tab]');
    if (!t) return;

    if (t.hasAttribute('data-rent')) { state.rent = +t.getAttribute('data-rent'); refresh(); }
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
      state.rent = 0; state.unit = 'all'; state.hoods = []; state.q = '';
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
      else state.sort = { key: sk, dir: sk === 'title' || sk === 'neighborhood' || sk === 'source_name' ? 1 : -1 };
      renderRoute();
    }
    else if (t.hasAttribute('data-density')) { state.density = t.getAttribute('data-density'); persist(); renderRoute(); }
    else if (t.hasAttribute('data-open')) { inspOpen(t.getAttribute('data-open')); }
    else if (t.hasAttribute('data-insp-close') || t.hasAttribute('data-scrim')) { inspClose(); }
    else if (t.hasAttribute('data-tab')) { inspTab = t.getAttribute('data-tab'); var l = byUid(openUid); if (l) renderInspector(l); }
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
    var hc = {};
    POOL.forEach(function (l) { var h = l.neighborhood || 'Unknown'; hc[h] = (hc[h] || 0) + 1; });
    HOODS = Object.keys(hc).map(function (h) { return { name: h, count: hc[h] }; }).sort(function (a, b) { return b.count - a.count; });
    state.hoods = state.hoods.filter(function (h) { return hc[h]; });

    $('[data-loading]').remove();
    renderChrome();
    renderFilters();
    route();
    if (TESTMODE) runTests();
  }

  function boot(i) {
    i = i || 0;
    if (i >= FEEDS.length) {
      $('[data-loading]').innerHTML = '<p>Could not reach the VERA feed. It publishes nightly — try again shortly.</p>';
      return;
    }
    fetch(FEEDS[i], { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(adopt)
      .catch(function () { boot(i + 1); });
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
      state.rent = 2400; var afterRent = filtered().length;
      check('rent tier filters', afterRent <= before, before + ' -> ' + afterRent);
      state.rent = 0;

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

      location.hash = '#/command'; route();
      window.__testResults = { pass: results.every(function (r) { return r.ok; }), results: results };
      console.log('[VERA TESTS]', JSON.stringify(window.__testResults, null, 1));
    }, 600);
  }
})();
