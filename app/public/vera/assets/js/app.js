/* VERA — vanilla JS, no build step, hash-routed (works at root or /vera/).
   Public lens (default): ./data/public.json — real listings, personal layer stripped.
   Private lens (?full=1): ./data/hunt.json — the owner's full payload.
   Ops telemetry lazy-fetches ./data/dashboard.json on first open. */
(() => {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const els = {
    boot: $('#boot'),
    errorPanel: $('#error-panel'),
    errorDetail: $('#error-detail'),
    errorRetry: $('#error-retry'),
    content: $('#content'),
    main: $('#main'),
  };

  const state = {
    lens: 'public',
    data: null,
    ops: null,
    opsLoading: false,
    map: null,
    route: null,
    booted: false,
    lensCtl: null,
    lensDefaults: null,
  };

  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- formatting ---------- */

  const esc = (value) =>
    String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const money = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? '$' + Math.round(n).toLocaleString('en-US') : '—';
  };

  const numOrNull = (value) => {
    if (value == null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const parseDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const relTime = (iso) => {
    const d = parseDate(iso);
    if (!d) return null;
    const s = Math.round((Date.now() - d.getTime()) / 1000);
    if (s < 0) return 'just now';
    if (s < 60) return s + 's ago';
    const m = Math.round(s / 60);
    if (m < 60) return m + 'm ago';
    const h = Math.round(m / 60);
    if (h < 48) return h + 'h ago';
    return Math.round(h / 24) + 'd ago';
  };

  const shortDate = (iso) => {
    const d = parseDate(iso);
    return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null;
  };

  const duration = (startIso, endIso) => {
    const a = parseDate(startIso);
    const b = parseDate(endIso);
    if (!a || !b) return null;
    const s = Math.round((b.getTime() - a.getTime()) / 1000);
    if (s < 0) return null;
    if (s < 1) return '<1s';
    if (s < 90) return s + 's';
    return Math.floor(s / 60) + 'm ' + String(s % 60).padStart(2, '0') + 's';
  };

  const titleCase = (value) => String(value || '').replace(/[_-]+/g, ' ').trim();

  const SPINNER =
    '<svg class="insignia insignia--live" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<circle class="ring" cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    '<path class="sweep" d="M12 12 L12 2.75 A9.25 9.25 0 0 1 20.01 7.38 Z"/>' +
    '<circle class="core" cx="12" cy="12" r="1.7"/></svg>';

  /* ---------- lens + data age indicators ---------- */

  const FRESH_HOURS = 30;

  function renderAge() {
    const iso = state.data && state.data.generated_at;
    const d = parseDate(iso);
    $$('.age').forEach((el) => {
      const text = $('.age__text', el);
      if (!d) {
        el.className = el.className.replace(/ age--\w+/g, '');
        if (text) text.textContent = 'no data';
        return;
      }
      const fresh = (Date.now() - d.getTime()) / 3600000 < FRESH_HOURS;
      el.classList.remove('age--fresh', 'age--stale');
      el.classList.add(fresh ? 'age--fresh' : 'age--stale');
      el.title = 'Data generated ' + d.toLocaleString();
      if (text) text.textContent = (fresh ? 'synced ' : 'last run ') + relTime(iso);
    });
  }

  function renderLensFlags() {
    $$('.lens-flag').forEach((el) => {
      el.hidden = false;
      el.classList.toggle('lens-flag--private', state.lens === 'full');
      el.innerHTML =
        state.lens === 'full'
          ? '<b>Private lens</b><span>full personal payload</span>'
          : '<b>Live system</b><span>VERA works for David — you’re riding along.</span>';
    });
  }

  /* ---------- shared listing pieces ---------- */

  const entryUid = (entry, fallback) =>
    String(entry.listing_uid || entry.source_listing_id || fallback || '');

  function findEntry(uid) {
    const pools = [state.data.shortlist || [], state.data.manual_review || []];
    for (const pool of pools) {
      for (let i = 0; i < pool.length; i++) {
        if (entryUid(pool[i], 'i' + i) === uid) return { entry: pool[i], mr: pool === pools[1] };
      }
    }
    return null;
  }

  const dossierHref = (entry, fallback) => '#/listing/' + encodeURIComponent(entryUid(entry, fallback));

  function changeBadge(entry) {
    const raw = String(entry.change_badge || '').toLowerCase();
    if (!raw) return '';
    const map = {
      new: ['NEW', 'new'],
      price_drop: ['PRICE DROP', 'drop'],
      back: ['BACK', 'back'],
      back_again: ['BACK', 'back'],
      price_hike: ['PRICE HIKE', 'hike'],
      gone: ['GONE', 'gone'],
      stale: ['STALE', 'stale'],
    };
    const pair = map[raw] || [raw.toUpperCase(), 'stale'];
    return '<span class="card__badge card__badge--' + pair[1] + '">' + esc(pair[0]) + '</span>';
  }

  const isCoop = (entry) =>
    entry.is_coop === true || String(entry.owner_type || '').toLowerCase() === 'coop_hdfc';

  function ownerBadgeInfo(entry) {
    const ownerType = String(entry.owner_type || '').toLowerCase();
    const coopClass = String(entry.coop_class || '').toLowerCase();
    const likely = String(entry.likely_landlord_type || '').toLowerCase();
    if (entry.is_coop && coopClass.indexOf('hdfc') !== -1) return ['owner-badge--coop', 'HDFC co-op'];
    if (isCoop(entry)) return ['owner-badge--coop', 'Co-op'];
    if (ownerType === 'individual') return ['owner-badge--private', 'Private landlord'];
    if (ownerType === 'llc') return ['', 'Mgmt / LLC'];
    if (likely === 'independent') return ['owner-badge--private', 'Likely private landlord'];
    if (likely) return ['', 'Likely ' + titleCase(likely)];
    return ['owner-badge--unknown', 'Owner unknown'];
  }

  function ownerRow(entry) {
    const info = ownerBadgeInfo(entry);
    const bits = ['<span class="owner-badge ' + info[0] + '">' + esc(info[1]) + '</span>'];
    if (entry.owner_name) bits.push('<span>' + esc(entry.owner_name) + '</span>');
    const portfolio = entry.owner_portfolio_estimate;
    if (portfolio != null && portfolio !== '') {
      const n = numOrNull(portfolio);
      bits.push('<span class="num">' + (n != null ? 'portfolio ≈ ' + n + (n === 1 ? ' building' : ' buildings') : esc(portfolio)) + '</span>');
    }
    const signal = numOrNull(
      entry.private_landlord_likelihood_score != null
        ? entry.private_landlord_likelihood_score
        : entry.likely_independent_landlord_score
    );
    if (!entry.owner_type && signal != null) {
      bits.push('<span class="num">' + Math.round(signal) + '/100 independent signal</span>');
    }
    return '<div class="owner-row">' + bits.join('') + '</div>';
  }

  function chip(label, value, severity) {
    if (value == null) {
      return '<span class="chip chip--nodata">' + esc(label) + ' <span class="chip__val">no data</span></span>';
    }
    return '<span class="chip chip--' + severity + '"><span class="chip__val">' + esc(value) + '</span> ' + esc(label) + '</span>';
  }

  const sevCount = (n, warnAt, badAt) => (n >= badAt ? 'bad' : n >= warnAt ? 'warn' : 'good');

  const RECORD_SIGNALS = [
    ['serious_open_violations', 'open serious violations', 1, 3],
    ['bedbug_reports_3y', 'bedbug reports · 3y', 1, 2],
    ['litigation_count_3y', 'litigation · 3y', 1, 3],
    ['heat_hot_water_complaints_3y', 'heat complaints · 3y', 1, 4],
  ];

  function rsChip(entry) {
    if (entry.official_rent_stabilized_list_hit === true) {
      return '<span class="chip chip--good"><span class="chip__val">on official rent-stabilized list</span></span>';
    }
    const rs = String(entry.rent_stabilized_signal || '').toLowerCase();
    if (!rs || rs === 'not indicated' || rs === 'none') {
      return '<span class="chip chip--nodata">rent stabilization <span class="chip__val">not indicated</span></span>';
    }
    return '<span class="chip chip--good">rent stabilization <span class="chip__val">' + esc(titleCase(rs)) + '</span></span>';
  }

  function dossierChips(entry) {
    const chips = RECORD_SIGNALS.map(([field, label, warnAt, badAt]) => {
      const v = numOrNull(entry[field]);
      return v == null ? chip(label, null) : chip(label, v, sevCount(v, warnAt, badAt));
    });
    chips.push(rsChip(entry));
    let note = '';
    if (String(entry.review_out_reason_code || '') === 'unverified_risk_data') {
      note = '<span class="chips__note">risk data synthetic — not yet verified against HPD/DOB</span>';
    }
    return '<div class="chips">' + chips.join('') + note + '</div>';
  }

  function listHtml(items, cls) {
    const rows = (items || []).filter(Boolean).map((t) => '<li>' + esc(t) + '</li>').join('');
    return rows ? '<ul' + (cls ? ' class="' + cls + '"' : '') + '>' + rows + '</ul>' : '';
  }

  function contactFoot(entry, fallbackUid) {
    const bits = [];
    bits.push('<a href="' + dossierHref(entry, fallbackUid) + '">Dossier →</a>');
    if (entry.contact_phone) {
      const tel = String(entry.contact_phone).replace(/[^+\d]/g, '');
      bits.push('<a href="tel:' + esc(tel) + '">' + esc(entry.contact_phone) + '</a>');
    }
    if (entry.contact_email) bits.push('<a href="mailto:' + esc(entry.contact_email) + '">' + esc(entry.contact_email) + '</a>');
    if (entry.source_url) {
      bits.push('<a href="' + esc(entry.source_url) + '" target="_blank" rel="noopener">' + esc(entry.source_name || 'source') + ' ↗</a>');
    } else if (entry.source_name) {
      bits.push('<span>' + esc(entry.source_name) + '</span>');
    }
    const first = shortDate(entry.first_seen_at);
    const last = shortDate(entry.last_seen_at);
    if (first || last) bits.push('<span class="seen">seen ' + esc(first || '?') + ' → ' + esc(last || '?') + '</span>');
    return '<div class="card__foot">' + bits.join('') + '</div>';
  }

  function metaLine(entry) {
    const beds = numOrNull(entry.beds);
    const baths = numOrNull(entry.baths);
    const bits = [];
    if (beds != null) bits.push(beds + ' bd');
    if (baths != null) bits.push(baths + ' ba');
    const sqft = numOrNull(entry.square_feet);
    if (sqft) bits.push(sqft.toLocaleString('en-US') + ' sqft');
    const place = [entry.neighborhood, entry.borough].filter(Boolean).join(', ');
    return [bits.join(' · '), place].filter(Boolean).join('<span class="sep">·</span>');
  }

  function listingCard(entry, index, kind, lensInfo) {
    const uid = entryUid(entry, kind + index);
    const score = numOrNull(entry.overall_score);
    const rec = String(entry.recommendation || '').toLowerCase();
    const recLabel = kind === 'mr' ? 'manual review' : rec || '—';
    const verify = entry.what_to_verify_before_applying || [];
    const scoreLines = entry.score_explanation_lines || [];
    const strengths = entry.trust_strengths || [];
    const caveats = entry.trust_caveats || [];
    const meta = metaLine(entry);

    let scorebox = '';
    if (lensInfo && lensInfo.active) {
      scorebox =
        '<p class="card__score card__score--lens">' + lensInfo.score.toFixed(1) + '<span class="of">/100</span></p>' +
        '<div class="scorebar" aria-hidden="true"><i style="width:' + Math.max(0, Math.min(100, lensInfo.score)) + '%"></i></div>' +
        '<p class="microlabel">your lens</p>' +
        (score != null ? '<p class="card__verascore">VERA ' + score.toFixed(1) + ' · ' + esc(recLabel) + '</p>' : '');
    } else {
      scorebox =
        (score != null
          ? '<p class="card__score">' + score.toFixed(1) + '<span class="of">/100</span></p>' +
            '<div class="scorebar" aria-hidden="true"><i style="width:' + Math.max(0, Math.min(100, score)) + '%"></i></div>'
          : '') +
        '<p class="microlabel">' + esc(recLabel) + '</p>';
    }

    let trust = '';
    if (strengths.length || caveats.length) {
      trust =
        '<div class="trust-cols">' +
        (strengths.length ? '<div class="t-good"><h4>Trust strengths</h4>' + listHtml(strengths, '') + '</div>' : '') +
        (caveats.length ? '<div class="t-bad"><h4>Trust caveats</h4>' + listHtml(caveats, '') + '</div>' : '') +
        '</div>';
    }

    const landlordWhy = Array.isArray(entry.landlord_reason_summary) && entry.landlord_reason_summary.length
      ? '<p class="card__reason">Landlord read: ' + esc(entry.landlord_reason_summary.join(' · ')) + '</p>'
      : '';

    return (
      '<article class="card" style="--i:' + Math.min(index, 8) + '" aria-label="' + esc(entry.address_raw || entry.title || 'listing') + '">' +
      changeBadge(entry) +
      '<div class="card__head">' +
        '<p class="card__price"><span class="card__rent">' + money(entry.rent) + '</span><span class="card__permo">/mo</span></p>' +
        '<div class="card__title">' +
          '<h3 class="card__addr"><a href="' + dossierHref(entry, kind + index) + '">' + esc(entry.address_raw || entry.address_normalized || entry.title || 'Address unknown') + '</a></h3>' +
          (meta ? '<p class="card__meta">' + meta + '</p>' : '') +
        '</div>' +
        '<div class="card__scorebox">' + scorebox + '</div>' +
      '</div>' +
      (kind === 'mr' && entry.review_out_reason ? '<p class="review-reason">' + esc(entry.review_out_reason) + '</p>' : '') +
      ownerRow(entry) +
      '<div class="card__why">' +
        (entry.why_it_made_the_cut ? '<p class="card__cut">' + esc(entry.why_it_made_the_cut) + '</p>' : '') +
        (entry.why_this_listing ? '<p class="card__reason">' + esc(entry.why_this_listing) + '</p>' : '') +
        landlordWhy +
      '</div>' +
      dossierChips(entry) +
      (entry.estimated_move_in_cash != null
        ? '<div class="cash-row">Move-in cash · <span class="num">' + money(entry.estimated_move_in_cash) + '</span>' +
          (entry.estimated_move_in_cash_note ? '<p class="cash-row__note">' + esc(entry.estimated_move_in_cash_note) + '</p>' : '') +
          '</div>'
        : '') +
      (entry.next_move ? '<p class="card__next"><b>Next move</b> — ' + esc(entry.next_move) + '</p>' : '') +
      (verify.length
        ? '<details><summary>Verify before applying <span class="num">(' + verify.length + ')</span></summary><div>' + listHtml(verify, 'checklist') + '</div></details>'
        : '') +
      (scoreLines.length || trust
        ? '<details><summary>Score breakdown & trust</summary><div>' + listHtml(scoreLines, 'scorelines') + trust + '</div></details>'
        : '') +
      contactFoot(entry, kind + index) +
      '</article>'
    );
  }

  /* ---------- lens engine (test-drive controls) ---------- */

  function computeLensDefaults() {
    const list = state.data.shortlist || [];
    const rents = list.map((e) => numOrNull(e.rent)).filter((n) => n != null);
    const minRent = rents.length ? Math.floor(Math.min.apply(null, rents) / 50) * 50 : 1000;
    let maxRent = rents.length ? Math.ceil(Math.max.apply(null, rents) / 50) * 50 : 4000;
    if (maxRent <= minRent) maxRent = minRent + 100;
    const boroughs = [];
    list.forEach((e) => {
      if (e.borough && boroughs.indexOf(e.borough) === -1) boroughs.push(e.borough);
    });
    boroughs.sort();
    state.lensDefaults = { minRent, maxRent, boroughs };
    state.lensCtl = { maxRent, boroughs: boroughs.slice(), strict: 1, coops: true, minClean: 0 };
  }

  const lensActive = () => {
    const c = state.lensCtl;
    const d = state.lensDefaults;
    return (
      c.maxRent < d.maxRent ||
      c.boroughs.length < d.boroughs.length ||
      c.strict !== 1 ||
      !c.coops ||
      c.minClean > 0
    );
  };

  function lensScore(entry) {
    const base = numOrNull(entry.overall_score) || 0;
    const cs = entry.component_scores;
    const ilf = cs && numOrNull(cs.independent_landlord_fit);
    if (ilf != null && state.lensCtl.strict !== 1) {
      return Math.max(0, Math.min(100, base + ilf * (state.lensCtl.strict - 1)));
    }
    return base;
  }

  function passesLens(entry) {
    const c = state.lensCtl;
    const rent = numOrNull(entry.rent);
    if (rent != null && rent > c.maxRent) return false;
    if (entry.borough && c.boroughs.indexOf(entry.borough) === -1) return false;
    if (!c.coops && isCoop(entry)) return false;
    const val = (f) => numOrNull(entry[f]) || 0;
    if (c.minClean >= 1 && val('serious_open_violations') > 0) return false;
    if (c.minClean >= 2 && val('bedbug_reports_3y') > 0) return false;
    if (c.minClean >= 3 && (val('litigation_count_3y') > 0 || val('heat_hot_water_complaints_3y') > 0)) return false;
    return true;
  }

  const recRank = (e) => {
    const r = String(e.recommendation || '').toLowerCase();
    if (r === 'pursue') return 0;
    if (r.indexOf('cautious') !== -1) return 1;
    return 2;
  };

  function applyLens() {
    const list = (state.data.shortlist || []).slice();
    const active = lensActive();
    const kept = list.filter(passesLens);
    if (active) {
      kept.sort((a, b) => lensScore(b) - lensScore(a));
    } else {
      kept.sort((a, b) => recRank(a) - recRank(b) || (numOrNull(b.overall_score) || 0) - (numOrNull(a.overall_score) || 0));
    }
    return { entries: kept, hidden: list.length - kept.length, total: list.length, active };
  }

  const CLEAN_LEVELS = [
    'Any building record',
    'No open serious violations',
    '…and no bedbug reports (3y)',
    '…and no litigation or heat complaints',
  ];

  function lensPanelHtml() {
    const c = state.lensCtl;
    const d = state.lensDefaults;
    const boroChecks = d.boroughs
      .map(
        (b) =>
          '<label><input type="checkbox" class="lens-boro" value="' + esc(b) + '"' +
          (c.boroughs.indexOf(b) !== -1 ? ' checked' : '') + '>' + esc(b) + '</label>'
      )
      .join('');
    const cleanOpts = CLEAN_LEVELS.map(
      (label, i) => '<option value="' + i + '"' + (c.minClean === i ? ' selected' : '') + '>' + esc(label) + '</option>'
    ).join('');
    return (
      '<div class="lens-panel reveal">' +
      '<div class="lens-panel__head"><h2>Drive the lens</h2>' +
      '<span class="microlabel">re-rank VERA’s live shortlist with your own weights</span>' +
      '<button class="btn btn--ghost reset" id="lens-reset" type="button"' + (lensActive() ? '' : ' hidden') + '>Reset to VERA</button></div>' +
      '<div class="lens-grid">' +
      '<div class="lens-ctl"><label for="lens-rent">Max rent <output id="lens-rent-out">' + money(c.maxRent) + '</output></label>' +
      '<input type="range" id="lens-rent" min="' + d.minRent + '" max="' + d.maxRent + '" step="50" value="' + c.maxRent + '"></div>' +
      '<div class="lens-ctl"><label for="lens-strict">Private-landlord strictness <output id="lens-strict-out">×' + c.strict.toFixed(2) + '</output></label>' +
      '<input type="range" id="lens-strict" min="0" max="2" step="0.25" value="' + c.strict + '" aria-describedby="lens-strict-help">' +
      '<span class="microlabel" id="lens-strict-help">weight on the independent-landlord component</span></div>' +
      '<div class="lens-ctl"><label for="lens-clean">Building record</label><select id="lens-clean">' + cleanOpts + '</select></div>' +
      '<div class="lens-ctl"><span class="lens-ctl__label" id="lens-boro-label">Boroughs</span><div class="check-row" role="group" aria-labelledby="lens-boro-label">' + boroChecks + '</div></div>' +
      '<div class="lens-ctl"><span class="lens-ctl__label" id="lens-coop-label">Ownership</span><div class="check-row" role="group" aria-labelledby="lens-coop-label">' +
      '<label><input type="checkbox" id="lens-coops"' + (c.coops ? ' checked' : '') + '>Include co-ops / HDFC</label></div></div>' +
      '</div>' +
      '<p class="lens-status" id="lens-status" aria-live="polite"></p>' +
      '</div>'
    );
  }

  function renderLensCards() {
    const result = applyLens();
    const wrap = $('#lens-cards');
    if (!wrap) return;
    wrap.innerHTML = result.entries
      .map((e, i) => listingCard(e, i, 'sl', { active: result.active, score: lensScore(e) }))
      .join('');
    const status = $('#lens-status');
    if (status) {
      status.innerHTML = result.active
        ? '<span class="microlabel">your lens</span><b>' + result.entries.length + ' of ' + result.total + ' shown</b>' +
          (result.hidden ? '<span>' + result.hidden + ' hidden by your filters</span>' : '') +
          '<span>ranked by your weights — VERA’s call stays on every card</span>'
        : '<span class="microlabel">VERA’s call</span><b>canonical ranking</b><span>adjust the dials to re-rank with your own weights</span>';
    }
    const reset = $('#lens-reset');
    if (reset) reset.hidden = !result.active;
    const count = $('#shortlist-count');
    if (count) count.textContent = String(result.entries.length);
  }

  function wireLensControls() {
    const rent = $('#lens-rent');
    if (rent) {
      rent.addEventListener('input', () => {
        state.lensCtl.maxRent = Number(rent.value);
        const out = $('#lens-rent-out');
        if (out) out.textContent = money(rent.value);
        renderLensCards();
      });
    }
    const strict = $('#lens-strict');
    if (strict) {
      strict.addEventListener('input', () => {
        state.lensCtl.strict = Number(strict.value);
        const out = $('#lens-strict-out');
        if (out) out.textContent = '×' + Number(strict.value).toFixed(2);
        renderLensCards();
      });
    }
    $$('.lens-boro').forEach((box) => {
      box.addEventListener('change', () => {
        state.lensCtl.boroughs = $$('.lens-boro').filter((b) => b.checked).map((b) => b.value);
        renderLensCards();
      });
    });
    const coops = $('#lens-coops');
    if (coops) {
      coops.addEventListener('change', () => {
        state.lensCtl.coops = coops.checked;
        renderLensCards();
      });
    }
    const clean = $('#lens-clean');
    if (clean) {
      clean.addEventListener('change', () => {
        state.lensCtl.minClean = Number(clean.value);
        renderLensCards();
      });
    }
    const reset = $('#lens-reset');
    if (reset) {
      reset.addEventListener('click', () => {
        computeLensDefaults();
        renderShortlist();
      });
    }
  }

  /* ---------- sections ---------- */

  function todayStrip(summary) {
    const s = summary || {};
    const chips = [
      ['new today', s.new_today, 'up'],
      ['price drops', s.price_drops, 'up'],
      ['gone', s.gone, 'down'],
      ['back again', s.back_again, 'up'],
    ]
      .map(([label, value, dir]) => {
        const n = numOrNull(value) || 0;
        return '<span class="today__chip' + (n > 0 ? ' today__chip--' + dir : '') + '"><b>' + n + '</b>' + esc(label) + '</span>';
      })
      .join('');
    return '<div class="today"><span class="microlabel">Today</span>' + chips + '</div>';
  }

  function renderOverview() {
    const d = state.data;
    const s = d.summary || {};
    const shortlist = (d.shortlist || []).slice().sort((a, b) => (numOrNull(b.overall_score) || 0) - (numOrNull(a.overall_score) || 0));
    const leads = shortlist.slice(0, 3);

    const leadRows = leads
      .map(
        (e, i) =>
          '<div class="lead"><span class="lead__rent">' + money(e.rent) + '</span>' +
          '<span class="lead__addr"><a href="' + dossierHref(e, 'sl' + i) + '">' + esc(e.address_raw || 'Listing') + '</a>' +
          '<span class="place">' + esc([e.neighborhood, e.borough].filter(Boolean).join(', ')) + '</span></span>' +
          '<span class="lead__score">' + (numOrNull(e.overall_score) != null ? numOrNull(e.overall_score).toFixed(1) : '—') + '</span></div>'
      )
      .join('');

    const vera = d.vera || {};
    const run = d.run || {};
    const health = d.source_health || {};
    const statusCls = String(vera.status || '').toLowerCase() === 'healthy' ? 'ok' : 'warn';

    const counts =
      '<b class="num">' + (numOrNull(s.pursue_count) || 0) + '</b> pursue · <b class="num">' + (numOrNull(s.cautious_count) || 0) +
      '</b> cautious · <b class="num">' + (numOrNull(s.manual_review_count) || 0) + '</b> manual review · <b class="num">' +
      (numOrNull(s.skip_count) || 0) + '</b> filtered out';

    els.content.innerHTML =
      '<section class="mission reveal">' +
      (s.hero_summary ? '<p class="mission__lede">' + esc(s.hero_summary) + '</p>' : '<p class="mission__lede">VERA is scanning the market.</p>') +
      todayStrip(s) +
      '</section>' +
      '<div class="overview-grid">' +
      '<section class="leads reveal">' +
      '<h2>Top leads</h2>' +
      (leadRows || '<p class="dim">No listings made the shortlist in this run — the wide net is still out. See why in the shortlist view.</p>') +
      '<p class="leads__more"><a href="#/shortlist">Full shortlist with decision dossiers →</a></p>' +
      '</section>' +
      '<section class="sysline reveal">' +
      '<h2>System</h2>' +
      '<div class="row"><p><span class="status-dot status-dot--' + statusCls + '"></span>' + esc(titleCase(vera.status || 'unknown')) +
      (run.finished_at ? ' · run finished ' + esc(relTime(run.finished_at)) : '') +
      (run.cadence ? ' · ' + esc(run.cadence) + ' cadence' : '') + '</p>' +
      (health.active != null ? '<p>' + (health.healthy || 0) + '/' + health.active + ' sources healthy</p>' : '') +
      '<p><a href="#/ops">Pipeline telemetry →</a></p></div>' +
      '<div class="row"><p>' + counts + '</p><p><a href="#/map">See the field on the map →</a></p></div>' +
      '</section>' +
      '</div>';
  }

  function skipDetailsHtml() {
    const d = state.data;
    const skipCount = numOrNull(d.summary && d.summary.skip_count) || 0;
    const insights = d.skip_insights || {};
    const reasons = insights.reasons || [];
    if (!skipCount && !reasons.length) return '';
    const max = reasons.reduce((m, r) => Math.max(m, r.count || 0), 1);
    const rows = reasons
      .map(
        (r) =>
          '<div class="reason-row"><span class="n">' + (r.count || 0) + '</span>' +
          '<div><div class="bar-label">' + esc(r.label) + '</div>' +
          '<div class="bar" aria-hidden="true"><i style="width:' + Math.round(((r.count || 0) / max) * 100) + '%"></i></div></div></div>'
      )
      .join('');
    const sampled = numOrNull(insights.total);
    return (
      '<details class="skips"><summary>Filtered out — <span class="num">' + skipCount + '</span> listings · why</summary>' +
      '<div class="skips__body">' +
      (sampled != null && sampled < skipCount
        ? '<p>Reasons below cover the ' + sampled + ' most recent rejections carried in this snapshot.</p>'
        : '') +
      rows + '</div></details>'
    );
  }

  function renderShortlist() {
    const d = state.data;
    const manualReview = d.manual_review || [];
    const mrCards = manualReview.map((e, i) => listingCard(e, i, 'mr', null)).join('');
    const hasShortlist = (d.shortlist || []).length > 0;

    els.content.innerHTML =
      '<section class="reveal"><h1 class="section-title">Shortlist</h1>' +
      '<p class="section-sub">Every card is a decision dossier: the score, the owner read, the building’s city-record history, and what to verify before applying.</p></section>' +
      (hasShortlist ? lensPanelHtml() : '') +
      (hasShortlist
        ? '<section class="list-section"><h2>Listings <span class="count" id="shortlist-count"></span></h2><div class="cards" id="lens-cards"></div></section>'
        : '<div class="empty-state reveal"><h2>Nothing made the cut in this run.</h2>' +
          '<p>VERA reviewed the market and filtered out <span class="num">' + (numOrNull((d.summary || {}).skip_count) || 0) +
          '</span> listings that failed budget, geography, trust, or building-record checks.</p>' +
          '<p>Rejection reasons are below; source and pipeline health live in <a href="#/ops">Ops</a>.</p></div>') +
      (manualReview.length
        ? '<section class="list-section"><details class="mr-group"><summary>Manual review <span class="count">' + manualReview.length +
          '</span><span class="hint">expand</span></summary><div class="cards">' + mrCards + '</div></details></section>'
        : '') +
      skipDetailsHtml();

    if (hasShortlist) {
      renderLensCards();
      wireLensControls();
    }
  }

  /* ---------- map ---------- */

  function disposeMap() {
    if (state.map) {
      state.map.remove();
      state.map = null;
    }
  }

  function renderMapSection() {
    const d = state.data;
    const entries = (d.shortlist || []).map((e, i) => ({ e, kind: 'sl', i }))
      .concat((d.manual_review || []).map((e, i) => ({ e, kind: 'mr', i })));
    const withCoords = entries.filter(({ e }) => numOrNull(e.latitude) != null && numOrNull(e.longitude) != null);

    els.content.innerHTML =
      '<section class="map-page reveal"><h1 class="section-title">Map</h1>' +
      '<p class="section-sub">The whole field at once — every pin is a monthly rent. Click one to open its dossier.</p>' +
      (withCoords.length
        ? '<div id="map" tabindex="0" aria-label="Map of shortlisted listings"></div>' +
          '<p class="map-legend"><span class="k">green</span> pursue · <span class="k k--warn">amber</span> pursue cautiously · gray manual review</p>'
        : '<div class="empty-state"><h2>No mappable listings.</h2><p>This snapshot has no coordinates to plot — the <a href="#/shortlist">shortlist</a> still has every dossier.</p></div>') +
      '</section>';

    if (!withCoords.length) return;

    const mapEl = $('#map');
    if (typeof L === 'undefined') {
      mapEl.innerHTML = '<div class="map-fallback"><p>Map library failed to load. The <a href="#/shortlist">shortlist</a> still has everything.</p></div>';
      return;
    }

    const map = L.map(mapEl, { scrollWheelZoom: false });
    state.map = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const pinClass = (entry, kind) => {
      if (kind === 'mr') return 'pin--review';
      const r = String(entry.recommendation || '').toLowerCase();
      if (r === 'pursue') return 'pin--pursue';
      if (r.indexOf('cautious') !== -1) return 'pin--cautious';
      return 'pin--review';
    };

    const bounds = [];
    withCoords.forEach(({ e, kind, i }) => {
      const lat = numOrNull(e.latitude);
      const lng = numOrNull(e.longitude);
      bounds.push([lat, lng]);
      const label = money(e.rent);
      const href = dossierHref(e, kind + i);
      const marker = L.marker([lat, lng], {
        keyboard: true,
        title: (e.address_raw || '') + ' — ' + label,
        icon: L.divIcon({
          className: '',
          html: '<span class="pin ' + pinClass(e, kind) + '">' + esc(label) + '</span>',
          iconSize: [0, 0],
        }),
      }).addTo(map);
      const open = () => { location.hash = href.slice(1); };
      marker.on('click', open);
      marker.on('keypress', (ev) => {
        if (ev.originalEvent && (ev.originalEvent.key === 'Enter' || ev.originalEvent.key === ' ')) open();
      });
      const el = marker.getElement();
      if (el) {
        el.setAttribute('role', 'link');
        el.setAttribute('aria-label', 'Open dossier: ' + (e.address_raw || 'listing') + ', ' + label);
      }
    });

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }

  /* ---------- dossier ---------- */

  function meterHtml(label, value, invert) {
    const v = numOrNull(value);
    if (v == null) return '';
    const cls = invert ? (v < 34 ? 'meter--good' : v < 67 ? 'meter--warn' : 'meter--bad') : 'meter--good';
    return (
      '<div class="meter ' + cls + '"><span class="meter__label">' + esc(label) + '</span>' +
      '<span class="meter__val">' + v.toFixed(1) + '/100</span>' +
      '<div class="meter__bar" aria-hidden="true"><i style="width:' + Math.max(0, Math.min(100, v)) + '%"></i></div></div>'
    );
  }

  function recRowHtml(label, value, warnAt, badAt) {
    const v = numOrNull(value);
    if (v == null) {
      return '<div class="rec-row rec-row--nodata"><span class="rec-row__label">' + esc(label) + '</span><span class="rec-row__val">no data</span><span class="rec-row__tag">—</span></div>';
    }
    const sev = sevCount(v, warnAt, badAt);
    const tag = sev === 'good' ? 'clear' : sev === 'warn' ? 'check' : 'red flag';
    return (
      '<div class="rec-row rec-row--' + sev + '"><span class="rec-row__label">' + esc(label) + '</span>' +
      '<span class="rec-row__val">' + v + '</span><span class="rec-row__tag">' + tag + '</span></div>'
    );
  }

  const COMPONENT_LABELS = {
    search_fit: 'Search fit',
    independent_landlord_fit: 'Independent-landlord fit',
    building_landlord_safety: 'Building & landlord safety',
    rent_stability_upside: 'Rent-stability upside',
    listing_quality: 'Listing quality',
    authenticity_adjustment: 'Authenticity adjustment',
    geography_adjustment: 'Geography adjustment',
  };

  function anatomyHtml(entry) {
    const cs = entry.component_scores;
    if (!cs || typeof cs !== 'object') return '';
    const keys = Object.keys(COMPONENT_LABELS).filter((k) => k in cs)
      .concat(Object.keys(cs).filter((k) => !(k in COMPONENT_LABELS)));
    const values = keys.map((k) => numOrNull(cs[k]) || 0);
    const maxAbs = Math.max.apply(null, values.map(Math.abs).concat([1]));
    const rows = keys
      .map((k, i) => {
        const v = values[i];
        return (
          '<div class="anatomy__row' + (v < 0 ? ' neg' : '') + '">' +
          '<span class="anatomy__label">' + esc(COMPONENT_LABELS[k] || titleCase(k)) + '</span>' +
          '<span class="anatomy__val">' + (v > 0 ? '+' : '') + v.toFixed(1) + '</span>' +
          '<div class="bar" aria-hidden="true"><i style="width:' + Math.round((Math.abs(v) / maxAbs) * 100) + '%"></i></div>' +
          '</div>'
        );
      })
      .join('');
    const overall = numOrNull(entry.overall_score);
    return (
      '<div class="anatomy">' + rows +
      (overall != null ? '<div class="anatomy__total"><span>Overall</span><span class="num">' + overall.toFixed(1) + '/100</span></div>' : '') +
      '</div>'
    );
  }

  function renderDossier(uid) {
    const found = findEntry(uid);
    if (!found) {
      els.content.innerHTML =
        '<a class="backlink" href="#/shortlist">← Shortlist</a>' +
        '<div class="error-panel" role="alert"><h2>Listing not in the current snapshot</h2>' +
        '<p>It may have aged out on the last run — the pipeline republishes twice a day.</p></div>';
      return;
    }
    const e = found.entry;
    const rec = found.mr ? 'manual review' : String(e.recommendation || '').toLowerCase();
    const recTag = rec === 'pursue' ? 'tag--go' : rec.indexOf('cautious') !== -1 ? 'tag--warn' : '';
    const score = numOrNull(e.overall_score);
    const info = ownerBadgeInfo(e);
    const verify = e.what_to_verify_before_applying || [];
    const photos = Array.isArray(e.image_urls) ? e.image_urls.filter(Boolean) : [];

    const logistics = [];
    if (e.estimated_move_in_cash != null) logistics.push(['Move-in cash', money(e.estimated_move_in_cash)]);
    if (e.fee_status) logistics.push(['Fee status', titleCase(e.fee_status)]);
    if (e.first_seen_at) logistics.push(['First seen', shortDate(e.first_seen_at)]);
    if (e.last_seen_at) logistics.push(['Last seen', shortDate(e.last_seen_at)]);
    if (e.source_name) logistics.push(['Source', e.source_name]);
    if (e.contact_phone) logistics.push(['Phone', e.contact_phone]);
    if (e.contact_email) logistics.push(['Email', e.contact_email]);
    if (e.contact_name) logistics.push(['Contact', e.contact_name]);

    const logisticsRows = logistics
      .map((pair) => '<div class="row"><span>' + esc(pair[0]) + '</span><span>' + esc(pair[1]) + '</span></div>')
      .join('');

    const stabilization =
      e.official_rent_stabilized_list_hit === true
        ? '<p class="strong">On the official rent-stabilized building list.</p>'
        : e.rent_stabilized_notes
          ? '<p>' + esc(e.rent_stabilized_notes) + '</p>'
          : '';

    els.content.innerHTML =
      '<div class="dossier">' +
      '<a class="backlink reveal" href="#/shortlist">← Shortlist</a>' +
      '<header class="dossier__head reveal">' +
      '<div class="dossier__badges">' +
      (rec ? '<span class="tag ' + recTag + '">' + esc(rec) + '</span>' : '') +
      (e.change_badge ? '<span class="tag">' + esc(String(e.change_badge).replace(/_/g, ' ')) + '</span>' : '') +
      '<span class="owner-badge ' + info[0] + '">' + esc(info[1]) + '</span>' +
      '</div>' +
      '<div class="dossier__title"><span class="card__rent">' + money(e.rent) + '</span><span class="card__permo">/mo</span>' +
      '<h1>' + esc(e.address_raw || e.title || 'Listing') + '</h1></div>' +
      (metaLine(e) ? '<p class="dossier__meta">' + metaLine(e) + '</p>' : '') +
      (found.mr && e.review_out_reason ? '<p class="review-reason">' + esc(e.review_out_reason) + '</p>' : '') +
      (e.why_it_made_the_cut ? '<p class="card__cut">' + esc(e.why_it_made_the_cut) + '</p>' : '') +
      (e.why_this_listing ? '<p class="card__reason">' + esc(e.why_this_listing) + '</p>' : '') +
      '</header>' +
      '<div class="dossier-grid">' +

      '<section class="panel reveal"><h2>Ownership</h2>' +
      (e.owner_name ? '<p class="strong">' + esc(e.owner_name) + '</p>' : '<p class="dim">Owner name not yet resolved from city records.</p>') +
      (e.owner_portfolio_estimate != null && e.owner_portfolio_estimate !== ''
        ? '<p>Estimated portfolio: <span class="num">' + esc(e.owner_portfolio_estimate) + '</span> buildings</p>' : '') +
      (e.coop_class ? '<p>Co-op class: ' + esc(e.coop_class) + '</p>' : '') +
      (e.owner_read ? '<p class="strong">' + esc(e.owner_read) + '</p>' : '') +
      (Array.isArray(e.landlord_reason_summary) && e.landlord_reason_summary.length ? listHtml(e.landlord_reason_summary, '') : '') +
      meterHtml('Independent-landlord signal', e.private_landlord_likelihood_score != null ? e.private_landlord_likelihood_score : e.likely_independent_landlord_score, false) +
      '</section>' +

      '<section class="panel reveal"><h2>Building record <span class="dim">(NYC public data)</span></h2>' +
      RECORD_SIGNALS.map(([field, label, warnAt, badAt]) => recRowHtml(label, e[field], warnAt, badAt)).join('') +
      meterHtml('HPD risk', e.hpd_risk_score, true) +
      meterHtml('DOB risk', e.dob_risk_score, true) +
      stabilization +
      (String(e.review_out_reason_code || '') === 'unverified_risk_data'
        ? '<p class="dim">Risk data synthetic — not yet verified against HPD/DOB.</p>' : '') +
      '</section>' +

      '<section class="panel reveal span2"><h2>Score anatomy</h2>' +
      (anatomyHtml(e) || '<p class="dim">Component scores not available for this listing.</p>') +
      listHtml(e.score_explanation_lines, 'scorelines') +
      '</section>' +

      (verify.length
        ? '<section class="panel reveal"><h2>Verify before applying</h2>' + listHtml(verify, 'checklist') + '</section>'
        : '') +

      ((e.trust_strengths || []).length || (e.trust_caveats || []).length
        ? '<section class="panel reveal"><h2>Trust read</h2><div class="trust-cols">' +
          ((e.trust_strengths || []).length ? '<div class="t-good"><h4>Strengths</h4>' + listHtml(e.trust_strengths, '') + '</div>' : '') +
          ((e.trust_caveats || []).length ? '<div class="t-bad"><h4>Caveats</h4>' + listHtml(e.trust_caveats, '') + '</div>' : '') +
          '</div></section>'
        : '') +

      '<section class="panel reveal"><h2>Logistics & contact</h2>' +
      (e.next_move ? '<p class="strong">' + esc(e.next_move) + '</p>' : '') +
      (e.estimated_move_in_cash_note ? '<p class="dim">' + esc(e.estimated_move_in_cash_note) + '</p>' : '') +
      '<div class="kv-inline">' + logisticsRows + '</div>' +
      (e.source_url
        ? '<p><a href="' + esc(e.source_url) + '" target="_blank" rel="noopener">Open the original listing ↗</a></p>'
        : '<p class="dim">Original listing link available in the owner’s private lens.</p>') +
      '</section>' +

      (photos.length
        ? '<section class="panel reveal span2"><h2>Photos</h2><div class="photo-grid">' +
          photos.slice(0, 8).map((u) => '<img src="' + esc(u) + '" alt="Listing photo" loading="lazy">').join('') +
          '</div></section>'
        : '') +

      '</div></div>';
  }

  /* ---------- intel ---------- */

  function renderIntel() {
    const d = state.data;
    const risk = Array.isArray(d.risk_watch) ? d.risk_watch : [];
    const mi = d.market_intelligence;
    const parts = [];

    if (risk.length) {
      const rows = risk
        .map(
          (r) =>
            '<tr><td>' + esc(r.title || 'Listing') + '</td>' +
            '<td>' + esc(r.neighborhood || '—') + '</td>' +
            '<td class="cell-num">' + (numOrNull(r.rent) != null ? money(r.rent) : '—') + '</td>' +
            '<td class="src-note">' + esc(r.flag_summary || '') + '</td>' +
            '<td><span class="tag' + (String(r.recommendation || '').toLowerCase() === 'skip' ? ' tag--bad' : '') + '">' + esc(r.recommendation || '—') + '</span></td></tr>'
        )
        .join('');
      parts.push(
        '<section class="reveal"><h2>Risk watch</h2>' +
        '<p class="section-sub">Listings VERA flagged and refused to shortlist — kept visible so the filter earns trust.</p>' +
        '<div class="table-wrap"><table><thead><tr><th scope="col">Listing</th><th scope="col">Neighborhood</th>' +
        '<th scope="col" class="cell-num">Rent</th><th scope="col">Flag</th><th scope="col">Call</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div></section>'
      );
    }

    if (mi && typeof mi === 'object') {
      const blocks = [];
      Object.keys(mi).forEach((key) => {
        const value = mi[key];
        if (typeof value === 'string' || typeof value === 'number') {
          blocks.push('<div class="row"><span>' + esc(titleCase(key)) + '</span><b>' + esc(value) + '</b></div>');
        } else if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
          blocks.push('<div class="row"><span>' + esc(titleCase(key)) + '</span><b>' + esc(value.join(' · ')) + '</b></div>');
        }
      });
      if (blocks.length) {
        parts.push('<section class="reveal"><h2>Market intelligence</h2><div class="stats-grid">' + blocks.join('') + '</div></section>');
      }
    }

    els.content.innerHTML =
      '<section class="reveal"><h1 class="section-title">Intel</h1>' +
      '<p class="section-sub">What the wide net dragged in besides the shortlist — flags, refusals, and market signals.</p></section>' +
      '<div class="intel">' +
      (parts.length
        ? parts.join('')
        : '<div class="empty-state"><h2>No intel sections in this snapshot.</h2><p>Risk-watch and market-intelligence blocks appear here when a run produces them.</p></div>') +
      '</div>';
  }

  /* ---------- how it works ---------- */

  function renderHow() {
    const glyph = (paths) =>
      '<span class="step__glyph" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg></span>';

    els.content.innerHTML =
      '<div class="how">' +
      '<section class="reveal"><h1 class="section-title">How VERA works</h1>' +
      '<p class="how__intro">Apartment hunting in New York is a bullshit-filtering problem. <b>VERA is one person’s answer</b> — a private system that reads the market twice a day and only surfaces what survives verification.</p></section>' +

      '<section class="step reveal">' + glyph('<circle cx="6" cy="7" r="2.6"/><circle cx="17" cy="5.5" r="2.1"/><circle cx="12" cy="13" r="2.4"/><circle cx="18.5" cy="15.5" r="1.9"/><circle cx="7" cy="18" r="2.1"/>') +
      '<h2><span class="n">01</span>Cast a wide net</h2>' +
      '<p>Every run sweeps <b>~20 listing sources</b> — the big boards, fee-free boards, affordable-housing re-rentals, and the weird corners. Each source has its own parser and a reliability score, so a broken scraper never poisons the data silently.</p></section>' +

      '<section class="step reveal">' + glyph('<path d="M4 21h16M6 21V9l6-5 6 5v12M10 21v-4h4v4M10 12h.01M14 12h.01"/>') +
      '<h2><span class="n">02</span>Check the city’s records</h2>' +
      '<p>Every candidate address is matched to NYC public records by <b>BBL/BIN</b>: open HPD violations, bedbug filings, heat and hot-water complaints, landlord litigation, DOB history. The building’s past is part of the listing.</p></section>' +

      '<section class="step reveal">' + glyph('<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 20c.8-3.4 3-5.2 5.5-5.2s4.7 1.8 5.5 5.2M15.5 8h5M18 5.5v5"/>') +
      '<h2><span class="n">03</span>Identify the owner</h2>' +
      '<p>Registration data reveals who is actually behind the door: a <b>private landlord</b>, a co-op or HDFC building, or a management LLC with a large portfolio. VERA’s owner prefers humans over holding companies — so the system reads ownership before he does.</p></section>' +

      '<section class="step reveal">' + glyph('<path d="M4 18v-6M9 18V7M14 18v-9M19 18v-4M3 21h18"/>') +
      '<h2><span class="n">04</span>Score what matters</h2>' +
      '<p>Each survivor gets a <b>0–100 score</b> built from named components — search fit, independent-landlord fit, building safety, rent-stabilization upside, listing quality — plus a written explanation. No black box: every card shows its arithmetic.</p></section>' +

      '<section class="step reveal">' + glyph('<path d="M12 19v-7M8.5 8.5a5 5 0 0 1 7 0M5.7 5.7a9 9 0 0 1 12.6 0"/><circle cx="12" cy="19" r="1.6"/>') +
      '<h2><span class="n">05</span>Publish — guarded</h2>' +
      '<p>A publish guard compares every run against the last known-good snapshot; if discovery looks broken, <b>nothing ships</b> and the dashboard says so honestly. When it’s clean, the dashboard updates and the phone gets pinged.</p></section>' +

      '<p class="how__outro reveal">VERA is personalized software — a one-off system built around one person’s exact problem, running on its owner’s hardware. Built by Little Fight NYC.</p>' +
      '</div>';
  }

  /* ---------- ops ---------- */

  function kvItem(label, value, dim) {
    return '<div><dt>' + esc(label) + '</dt><dd>' + value + (dim ? '<br><span class="dim">' + esc(dim) + '</span>' : '') + '</dd></div>';
  }

  const STATUS_DOT = (status) => {
    const s = String(status || '').toLowerCase();
    const cls = ['success', 'healthy', 'ok', 'live', 'passed'].indexOf(s) !== -1
      ? 'ok'
      : ['running', 'pending', 'partial', 'degraded', 'stale', 'warn'].indexOf(s) !== -1
        ? 'warn'
        : ['failed', 'error', 'broken', 'blocked'].indexOf(s) !== -1
          ? 'bad'
          : '';
    return '<span class="status-dot' + (cls ? ' status-dot--' + cls : '') + '" aria-hidden="true"></span>';
  };

  function opsStatusSection(d) {
    const vera = d.vera || {};
    const run = d.run || {};
    const pipeline = d.pipeline || {};
    const publish = d.publish || {};
    const finished = parseDate(run.finished_at);
    const items = [
      kvItem('VERA status', STATUS_DOT(vera.status) + esc(vera.status || 'unknown'), vera.status_note),
      kvItem('Run', '<span class="num">' + esc(run.run_id || '—') + '</span>', [run.cadence, run.status].filter(Boolean).join(' · ')),
      kvItem('Finished', esc(relTime(run.finished_at) || '—'), finished ? finished.toLocaleString() : null),
      kvItem('Discovery mode', esc(pipeline.discovery_mode || '—'), pipeline.discovery_note),
      kvItem('Snapshot source', esc(publish.snapshot_source || '—'), publish.publish_state_label),
      kvItem('Last deploy', esc(relTime(publish.last_deployed_at) || 'never'), publish.last_deploy_result),
      kvItem('Last skip reason', esc(publish.last_skip_reason || '—')),
      kvItem('Last good snapshot', esc(relTime(publish.last_successful_snapshot_at) || '—')),
    ];
    return '<section><h2>Run status</h2><dl class="kv">' + items.join('') + '</dl></section>';
  }

  function publishGuardSection(d) {
    const guard = d.publish_guard;
    if (!guard || typeof guard !== 'object') return '';
    const decision = String(guard.decision || 'unknown');
    const ok = ['publish', 'allow', 'allowed', 'pass', 'ok'].indexOf(decision.toLowerCase()) !== -1;
    const reasons = Array.isArray(guard.reasons) ? guard.reasons : [];
    return (
      '<section><h2>Publish guard</h2><div class="guard' + (ok ? '' : ' guard--blocked') + '">' +
      '<p class="guard__decision">' + STATUS_DOT(ok ? 'ok' : 'blocked') + 'Decision: ' + esc(decision) + '</p>' +
      (reasons.length ? '<ul>' + reasons.map((r) => '<li>' + esc(r) + '</li>').join('') + '</ul>' : '') +
      '</div></section>'
    );
  }

  const STAGE_ORDER = ['discover', 'normalize', 'dedupe', 'enrich', 'score', 'publish'];

  function stagesSection(d) {
    const stages = d.stages || {};
    const cells = STAGE_ORDER.filter((name) => stages[name]).map((name) => {
      const s = stages[name] || {};
      const status = String(s.status || 'unknown');
      const failed = ['failed', 'error'].indexOf(status.toLowerCase()) !== -1;
      const cls = failed ? ' stage--failed' : s.blocked_reason ? ' stage--blocked' : '';
      const recIn = numOrNull(s.records_in);
      const recOut = numOrNull(s.records_out);
      const dur = duration(s.started_at, s.finished_at);
      const errors = Array.isArray(s.errors) ? s.errors.filter(Boolean) : [];
      return (
        '<div class="stage' + cls + '">' +
        '<p class="stage__name">' + esc(name) + '</p>' +
        '<p class="stage__status">' + STATUS_DOT(status) + esc(status) + '</p>' +
        (recIn != null || recOut != null
          ? '<p class="stage__nums">' + (recIn != null ? recIn : '—') + ' <span class="arrow">→</span> ' + (recOut != null ? recOut : '—') + '</p>'
          : '') +
        (dur ? '<p class="stage__dur">' + esc(dur) + '</p>' : '') +
        (s.blocked_reason ? '<p class="stage__blocked">blocked: ' + esc(s.blocked_reason) + '</p>' : '') +
        (errors.length ? '<p class="stage__errors">' + errors.map(esc).join('<br>') + '</p>' : '') +
        '</div>'
      );
    });
    return cells.length ? '<section><h2>Pipeline stages</h2><div class="stages">' + cells.join('') + '</div></section>' : '';
  }

  function sourcesSection(d) {
    const health = d.source_health || {};
    const sources = Array.isArray(health.sources) ? health.sources.slice() : [];
    if (!sources.length) return '';
    const statusRank = { broken: 0, partial: 1, healthy: 2 };
    sources.sort((a, b) => {
      const ra = statusRank[String(a.status || '').toLowerCase()];
      const rb = statusRank[String(b.status || '').toLowerCase()];
      return (ra == null ? 3 : ra) - (rb == null ? 3 : rb) || String(a.name).localeCompare(String(b.name));
    });
    const rows = sources
      .map((s) => {
        const rel = numOrNull(s.reliability_score);
        const relCls = rel == null ? '' : rel >= 75 ? 'relbar--good' : rel >= 55 ? 'relbar--warn' : 'relbar--bad';
        const note = s.anomaly_reason || (Array.isArray(s.recommended_actions) && s.recommended_actions[0]) || '';
        const status = String(s.status || 'unknown').toLowerCase();
        const records = numOrNull(s.records_found);
        return (
          '<tr><td>' + esc(s.name || '—') + '</td>' +
          '<td>' + esc(s.source_class || '—') + '</td>' +
          '<td class="src-status src-status--' + esc(status) + '">' + STATUS_DOT(status) + esc(status) + '</td>' +
          '<td class="cell-num">' + (records != null ? records : '—') + '</td>' +
          '<td class="cell-num">' + (rel != null
            ? rel + '<span class="relbar ' + relCls + '" aria-hidden="true"><i style="width:' + Math.max(0, Math.min(100, rel)) + '%"></i></span>'
            : '—') + '</td>' +
          '<td class="cell-num">' + esc(relTime(s.last_attempted_at) || '—') + '</td>' +
          '<td class="src-note">' + esc(note) + '</td></tr>'
        );
      })
      .join('');
    const metaBits = [];
    if (health.active != null) metaBits.push(health.active + ' active');
    if (health.healthy != null) metaBits.push(health.healthy + ' healthy');
    if (health.partial) metaBits.push(health.partial + ' partial');
    if (health.broken != null) metaBits.push(health.broken + ' broken');
    return (
      '<section><h2>Source health</h2>' +
      (metaBits.length ? '<p class="microlabel" style="margin-bottom:10px">' + esc(metaBits.join(' · ')) + '</p>' : '') +
      '<div class="table-wrap"><table>' +
      '<thead><tr><th scope="col">Source</th><th scope="col">Class</th><th scope="col">Status</th>' +
      '<th scope="col" class="cell-num">Records</th><th scope="col" class="cell-num">Reliability</th>' +
      '<th scope="col" class="cell-num">Last attempt</th><th scope="col">Note</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></section>'
    );
  }

  function trendsSection(d) {
    const trends = Array.isArray(d.run_trends) ? d.run_trends.filter((t) => numOrNull(t.records_discovered) != null) : [];
    if (trends.length < 2) return '';
    const values = trends.map((t) => numOrNull(t.records_discovered) || 0);
    const max = Math.max.apply(null, values.concat([1]));
    const W = 560, H = 120, padL = 40, padR = 14, padT = 16, padB = 26;
    const x = (i) => padL + (i * (W - padL - padR)) / (values.length - 1);
    const y = (v) => padT + (1 - v / max) * (H - padT - padB);
    const pts = values.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ');
    const dots = values
      .map((v, i) => '<circle class="dot" cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="' + (i === values.length - 1 ? 3.4 : 2.2) + '"></circle>')
      .join('');
    const firstDate = shortDate(trends[0].timestamp) || '';
    const lastDate = shortDate(trends[trends.length - 1].timestamp) || '';
    const last = values[values.length - 1];
    return (
      '<section><h2>Run trends</h2><div class="spark-wrap">' +
      '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Records discovered per run, last ' + values.length + ' runs. Latest: ' + last + '.">' +
      '<line class="grid" x1="' + padL + '" y1="' + y(0) + '" x2="' + (W - padR) + '" y2="' + y(0) + '"></line>' +
      '<line class="grid" x1="' + padL + '" y1="' + y(max) + '" x2="' + (W - padR) + '" y2="' + y(max) + '"></line>' +
      '<text x="' + (padL - 6) + '" y="' + (y(max) + 4) + '" text-anchor="end">' + max + '</text>' +
      '<text x="' + (padL - 6) + '" y="' + (y(0) + 4) + '" text-anchor="end">0</text>' +
      '<text x="' + padL + '" y="' + (H - 6) + '">' + esc(firstDate) + '</text>' +
      '<text x="' + (W - padR) + '" y="' + (H - 6) + '" text-anchor="end">' + esc(lastDate) + '</text>' +
      '<polyline class="line" points="' + pts + '"></polyline>' + dots +
      '</svg>' +
      '<p class="spark-cap">Records discovered per run · last ' + values.length + ' runs · latest <span class="num">' + last + '</span></p>' +
      '</div></section>'
    );
  }

  function readinessSection(d) {
    const mr = d.morning_readiness;
    if (!mr) return '';
    let checks = [];
    if (Array.isArray(mr)) checks = mr;
    else if (Array.isArray(mr.checks)) checks = mr.checks;
    else if (typeof mr === 'object') checks = Object.keys(mr).map((k) => ({ name: k, status: mr[k] }));
    if (!checks.length) return '';
    const rows = checks
      .map((c) => {
        const name = c.name || c.label || c.check || 'check';
        const status = c.status != null ? c.status : c.ok != null ? (c.ok ? 'ok' : 'failed') : c.passed != null ? (c.passed ? 'ok' : 'failed') : '';
        const ok = ['ok', 'pass', 'passed', 'ready', 'true', 'success', 'yes'].indexOf(String(status).toLowerCase()) !== -1;
        const note = c.note || c.detail || c.message || '';
        return '<li><span class="' + (ok ? 'ok' : 'fail') + '" aria-hidden="true">' + (ok ? '✓' : '✕') + '</span><span>' + esc(titleCase(String(name))) +
          (status !== '' && typeof status !== 'boolean' ? ' — ' + esc(String(status)) : '') +
          (note ? ' <span class="dim">(' + esc(note) + ')</span>' : '') + '</span></li>';
      })
      .join('');
    return '<section><h2>Morning readiness</h2><ul class="checks">' + rows + '</ul></section>';
  }

  function advisoriesSection(d) {
    const recs = Array.isArray(d.recommendations) ? d.recommendations : [];
    const msgs = Array.isArray(d.messages) ? d.messages : [];
    if (!recs.length && !msgs.length) return '';
    const items = recs
      .map((r) => {
        const sev = String(r.severity || 'info').toLowerCase();
        const cls = sev === 'warn' || sev === 'warning' ? 'sev--warn' : sev === 'error' || sev === 'critical' ? 'sev--bad' : 'sev--info';
        return '<li><span class="sev ' + cls + '">' + esc(sev) + '</span><span>' + esc(r.text || '') + '</span></li>';
      })
      .concat(msgs.map((m) => '<li><span class="sev sev--info">' + esc(m.label || m.kind || 'note') + '</span><span>' + esc(m.text || '') + '</span></li>'))
      .join('');
    return '<section><h2>Advisories</h2><ul class="advisories">' + items + '</ul></section>';
  }

  function qualitySection(d) {
    const parts = [];
    const dist = d.listing_confidence && d.listing_confidence.distribution;
    if (dist) {
      const order = [
        ['high', 'd-high', 'High'],
        ['medium', 'd-medium', 'Medium'],
        ['low', 'd-low', 'Low'],
        ['needs_review', 'd-review', 'Needs review'],
      ];
      const total = order.reduce((sum, pair) => sum + (numOrNull(dist[pair[0]]) || 0), 0);
      if (total > 0) {
        const segs = order
          .map((pair) => '<i class="' + pair[1] + '" style="width:' + (((numOrNull(dist[pair[0]]) || 0) / total) * 100).toFixed(1) + '%"></i>')
          .join('');
        const legend = order
          .map((pair) => '<span><span class="swatch ' + pair[1] + '"></span>' + pair[2] + ' <b class="num">' + (numOrNull(dist[pair[0]]) || 0) + '</b></span>')
          .join('');
        parts.push('<div class="dist"><div class="dist__bar">' + segs + '</div><div class="dist__legend">' + legend + '</div></div>');
      }
    }
    const dc = d.daily_changes && d.daily_changes.counts;
    if (dc) {
      const line = ['new', 'price_drop', 'price_hike', 'back', 'stale', 'gone', 'unchanged']
        .filter((k) => dc[k] != null)
        .map((k) => '<b class="num">' + dc[k] + '</b> ' + esc(titleCase(k)))
        .join(' · ');
      if (line) parts.push('<p class="diff-line">Today’s diff: ' + line + '</p>');
    }
    const stats = Array.isArray(d.stats) ? d.stats : [];
    if (stats.length) {
      const rows = stats.map((s) => '<div class="row"><span>' + esc(s.label) + '</span><b>' + esc(s.value) + '</b></div>').join('');
      parts.push('<div class="stats-grid">' + rows + '</div>');
    }
    return parts.length ? '<section><h2>Data quality</h2><div class="quality-stack">' + parts.join('') + '</div></section>' : '';
  }

  function opsHtml(d) {
    return (
      '<section class="reveal"><h1 class="section-title">Ops</h1>' +
      '<p class="section-sub">The machine, unvarnished: run state, every pipeline stage, per-source health, and the guard that decides whether a run is fit to publish.</p></section>' +
      '<div class="ops reveal">' +
      opsStatusSection(d) +
      publishGuardSection(d) +
      stagesSection(d) +
      sourcesSection(d) +
      trendsSection(d) +
      readinessSection(d) +
      advisoriesSection(d) +
      qualitySection(d) +
      '</div>'
    );
  }

  function renderOps() {
    if (state.ops) {
      els.content.innerHTML = opsHtml(state.ops);
      return;
    }
    els.content.innerHTML = '<div class="ops-loading">' + SPINNER + '<span>Loading pipeline telemetry…</span></div>';
    if (state.opsLoading) return;
    state.opsLoading = true;
    fetch('./data/dashboard.json', { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching dashboard.json');
        return res.json();
      })
      .then((data) => {
        state.ops = data;
        if (state.route && state.route.name === 'ops') els.content.innerHTML = opsHtml(data);
      })
      .catch((err) => {
        if (state.route && state.route.name === 'ops') {
          els.content.innerHTML =
            '<div class="error-panel" role="alert"><h2>Ops telemetry unavailable</h2>' +
            '<p>' + esc(err && err.message ? err.message : String(err)) + '</p>' +
            '<button class="btn" id="ops-retry" type="button">Retry</button></div>';
          const retry = $('#ops-retry');
          if (retry) retry.addEventListener('click', renderOps);
        }
      })
      .finally(() => {
        state.opsLoading = false;
      });
  }

  /* ---------- router ---------- */

  const ROUTES = {
    overview: { render: renderOverview, title: 'Overview' },
    shortlist: { render: renderShortlist, title: 'Shortlist' },
    map: { render: renderMapSection, title: 'Map' },
    intel: { render: renderIntel, title: 'Intel' },
    how: { render: renderHow, title: 'How VERA works' },
    ops: { render: renderOps, title: 'Ops' },
  };

  function parseRoute() {
    let h = location.hash || '';
    if (h === '#ops') h = '#/ops';
    const listing = h.match(/^#\/listing\/(.+)$/);
    if (listing) return { name: 'listing', uid: decodeURIComponent(listing[1]) };
    const m = h.match(/^#\/([a-z-]+)/);
    const name = m && ROUTES[m[1]] ? m[1] : 'overview';
    return { name };
  }

  function setNavActive(routeName) {
    const navName = routeName === 'listing' ? 'shortlist' : routeName;
    $$('a[data-route]').forEach((a) => {
      const active = a.getAttribute('data-route') === navName;
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function render(route) {
    disposeMap();
    state.route = route;
    setNavActive(route.name);
    if (route.name === 'listing') {
      renderDossier(route.uid);
      document.title = 'Dossier — VERA';
      const found = findEntry(route.uid);
      if (found && found.entry.address_raw) document.title = found.entry.address_raw + ' — VERA';
    } else {
      ROUTES[route.name].render();
      document.title = ROUTES[route.name].title + ' — VERA';
    }
    if (state.booted) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      els.main.focus({ preventScroll: true });
    }
  }

  window.addEventListener('hashchange', () => {
    if (state.data) render(parseRoute());
  });

  /* ---------- boot ---------- */

  function showError(message) {
    els.boot.hidden = true;
    els.errorDetail.textContent = message;
    els.errorPanel.hidden = false;
  }

  function detectLens() {
    if (location.hash === '#full') {
      history.replaceState(null, '', location.pathname + '?full=1#/overview');
    }
    const params = new URLSearchParams(location.search);
    state.lens = params.get('full') === '1' ? 'full' : 'public';
  }

  function boot() {
    els.errorPanel.hidden = true;
    els.boot.hidden = false;
    detectLens();
    renderLensFlags();
    const url = state.lens === 'full' ? './data/hunt.json' : './data/public.json';
    fetch(url, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' fetching ' + url.split('/').pop());
        return res.json();
      })
      .then((data) => {
        state.data = data;
        els.boot.hidden = true;
        computeLensDefaults();
        renderAge();
        render(parseRoute());
        state.booted = true;
      })
      .catch((err) => {
        showError(err && err.message ? err.message : String(err));
      });
  }

  els.errorRetry.addEventListener('click', boot);
  window.setInterval(renderAge, 60000);
  boot();
})();
