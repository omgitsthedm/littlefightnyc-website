/* VERA core — the engine room. Pure data + functions, no DOM.
   Everything here is shared by the app shell and the ledger via window.__VERAC.
   Public lens only: nothing in this file fetches anything. */
(function () {
  'use strict';

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

  /* ---------- focus areas ---------- */

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

  /* ---------- subway proximity (client-side; distances are ≈) ---------- */

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

  // The engine publishes "ok"; only "healthy" was accepted once, so a fully
  // green pipeline rendered every source red beside a green health pulse.
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

  /* ---------- the full-fit gate (mirrors scripts/send_alerts.py) ---------- */

  var FIT = { minScore: 60, minConfidence: 60, maxHpd: 65, maxDob: 65, maxRent: 3000 };

  function isFullFit(l) {
    var rec = String(l.recommendation || '').toLowerCase();
    if (rec !== 'pursue' && rec !== 'pursue cautiously') return false;
    if ((+l.overall_score || 0) < FIT.minScore) return false;
    var a = authenticity(l);
    if (a == null || a < FIT.minConfidence) return false;
    if ((+l.hpd_risk_score || 0) >= FIT.maxHpd) return false;
    if ((+l.dob_risk_score || 0) >= FIT.maxDob) return false;
    var r = +l.rent || 0;
    return r > 0 && r <= FIT.maxRent;
  }

  /* Why a listing did NOT clear the gate — the honesty engine behind
     "what didn't make it". First reason wins; order mirrors the gate. */
  function whyPassed(l) {
    if (isScam(l)) return 'low-confidence';
    var rec = String(l.recommendation || '').toLowerCase();
    if (rec === 'skip') return 'skipped by the engine';
    if (rec === 'manual review') return 'needs a human read';
    if ((+l.rent || 0) > FIT.maxRent) return 'over budget';
    if (!(+l.rent)) return 'no honest price';
    if ((+l.hpd_risk_score || 0) >= FIT.maxHpd || (+l.dob_risk_score || 0) >= FIT.maxDob) return 'building record';
    if ((authenticity(l) || 0) < FIT.minConfidence) return 'unverified';
    if ((+l.overall_score || 0) < FIT.minScore) return 'below the bar';
    return 'edge case';
  }

  /* ================================================================
     THE STEWARD GRADE — the question that matters most for a decade
     in one apartment: does this owner FIX things? Composed from the
     city's own record of what got fixed and what got ignored: housing
     violations, heat and hot-water complaints, bedbugs, buildings
     litigation, DOB risk. Honest about unknowns: no data ≠ an A.
     ================================================================ */

  function stewardOf(l) {
    var known = 0;
    var score = 100;
    var failures = [];
    var strengths = [];

    var hpd = l.hpd_risk_score;
    if (hpd != null) {
      known++;
      score -= Math.min(45, (+hpd) * 0.45);
      if (+hpd >= 65) failures.push('a heavy open-violation file');
      else if (+hpd < 25) strengths.push('a clean violation record');
    }
    var sv = +l.serious_open_violations || 0;
    if (l.serious_open_violations != null) {
      known++;
      if (sv > 0) { score -= Math.min(20, sv * 7); failures.push(sv + ' serious violation' + (sv > 1 ? 's' : '') + ' open right now'); }
    }
    var heat = +l.heat_hot_water_complaints_3y || 0;
    if (l.heat_hot_water_complaints_3y != null) {
      known++;
      if (heat >= 3) { score -= Math.min(18, heat * 3); failures.push(heat + ' heat or hot-water complaints in 3 years'); }
      else if (heat === 0) strengths.push('no heat complaints in 3 years');
    }
    var bb = +l.bedbug_reports_3y || 0;
    if (l.bedbug_reports_3y != null) {
      known++;
      if (bb > 0) { score -= Math.min(14, bb * 7); failures.push(bb + ' bedbug filing' + (bb > 1 ? 's' : '')); }
    }
    var lit = +l.litigation_count_3y || 0;
    if (l.litigation_count_3y != null) {
      known++;
      if (lit > 0) { score -= Math.min(16, lit * 8); failures.push('taken to housing court ' + lit + '×'); }
    }
    var dob = l.dob_risk_score;
    if (dob != null) {
      known++;
      score -= Math.min(12, (+dob) * 0.12);
      if (+dob >= 65) failures.push('an ugly DOB complaint file');
    }

    if (!known) return { grade: '?', word: 'unproven', score: null, failures: [], strengths: [], known: 0 };
    score = Math.max(0, Math.round(score));
    var grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : score >= 40 ? 'D' : 'E';
    var word = grade === 'A' ? 'a keeper' : grade === 'B' ? 'looked after' : grade === 'C' ? 'middling care' : grade === 'D' ? 'neglect showing' : 'they let it rot';
    return { grade: grade, word: word, score: score, failures: failures.slice(0, 3), strengths: strengths.slice(0, 2), known: known };
  }

  /* Spatial facts — never invent; parse only what the record states. */
  function spatialLine(l) {
    var bits = [];
    if (l.square_feet) bits.push(Math.round(+l.square_feet) + ' sq ft');
    var unit = String(l.address_normalized || '').match(/(?:apt|unit|#)\s*([0-9]{1,2})[a-z]?\b/i);
    if (unit) {
      var fl = +unit[1];
      if (fl >= 1 && fl <= 30) bits.push('floor ' + fl + (fl >= 4 ? ' — ask about the elevator' : ''));
    }
    return bits.join(' · ');
  }

  /* ---------- the character name (editorial headline) ---------- */

  var ORDINALS = { '1': 'First', '2': 'Second', '3': 'Third', '4': 'Fourth', '5': 'Fifth', '6': 'Sixth', '7': 'Seventh', '8': 'Eighth', '9': 'Ninth', '10': 'Tenth', '11': 'Eleventh', '12': 'Twelfth', '13': 'Thirteenth', '14': 'Fourteenth' };

  function titleCase(s) {
    return String(s || '').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }

  function streetOf(l) {
    var a = String(l.address_normalized || '').toLowerCase();
    if (!a) return null;
    /* "230 e second st apt d" → "East Second Street" */
    a = a.replace(/\b(apt|unit|#|fl|floor|ste)\b.*$/, '').trim();
    a = a.replace(/^\d+[\s-]*/, '');
    a = a.replace(/\be\b/g, 'east').replace(/\bw\b/g, 'west').replace(/\bn\b/g, 'north').replace(/\bs\b/g, 'south');
    a = a.replace(/\bst\b/g, 'street').replace(/\bave?\b/g, 'avenue').replace(/\bblvd\b/g, 'boulevard').replace(/\brd\b/g, 'road').replace(/\bpl\b/g, 'place');
    a = a.replace(/\b(\d+)(st|nd|rd|th)?\b/g, function (m, d) { return ORDINALS[d] || m; });
    a = a.trim();
    return a ? titleCase(a) : null;
  }

  function charName(l) {
    var unit = unitOf(l) === 'studio' ? 'studio' : unitOf(l) === '1br' ? 'one-bedroom' : 'apartment';
    var street = streetOf(l);
    if (street) return 'The ' + unit + ' on ' + street;
    var hood = l.neighborhood ? titleCase(String(l.neighborhood).toLowerCase()) : null;
    if (hood) return 'A ' + hood + ' ' + unit;
    return 'The unnamed ' + unit;
  }

  /* ================================================================
     THE MONEY ENGINE — NY law gives tenants hard numbers.
       · Security deposit: capped at 1 month (HSTPA, 2019)
       · Application fee: capped at $20, or actual screening cost
       · Broker fee: whoever HIRES the broker pays (FARE Act, in effect
         since 11 Jun 2025; upheld on appeal July 2026).
     ================================================================ */

  var LAW = {
    depositMaxMonths: 1,
    appFeeMax: 20,
    depositReturnDays: 14,
    fareActFrom: 'June 11, 2025',
    guarantorTypicalPct: 0.9,
    incomeRuleX: 40,
    guarantorRuleX: 80,
  };

  function moveInMath(l) {
    var rent = +l.rent || 0;
    var deposit = rent * LAW.depositMaxMonths;
    var vera = rent + deposit;              /* no broker fee, by construction */
    var brokerWorld = rent * 1.5;
    return {
      rent: rent,
      deposit: deposit,
      appFee: rent ? LAW.appFeeMax : 0,
      total: vera + (rent ? LAW.appFeeMax : 0),
      brokerWorld: brokerWorld,
      saved: brokerWorld,
      annualIncomeNeeded: rent * LAW.incomeRuleX,
      guarantorIncomeNeeded: rent * LAW.guarantorRuleX,
      guarantorCost: Math.round(rent * LAW.guarantorTypicalPct),
    };
  }

  /* ================================================================
     THE VIEWING CHECKLIST — what people wish they'd checked.
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
     LEGAL PROTECTION DISCLOSURE — the honest cost of hunting
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
     VERIFY IT YOURSELF — the public tools, one click away.
     The chain of proof runs deed → registration → entity → portfolio.
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
     BUILDING PORTRAITS — deterministic facade, the floor under every
     listing image. Same listing, same portrait, forever.
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

    g += '<defs><linearGradient id="sky' + seed + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#141b22"/><stop offset="1" stop-color="#1d2129"/></linearGradient></defs>';
    g += '<rect width="' + w + '" height="' + h + '" fill="url(#sky' + seed + ')"/>';

    /* a neighbour on each side, cropped — the block, not a lonely box */
    g += '<rect x="0" y="' + (by + fh * 0.6) + '" width="' + (bx - 3) + '" height="' + (h - by - fh * 0.6) + '" fill="#191d22"/>';
    g += '<rect x="' + (bx + bw + 3) + '" y="' + (by + fh * 0.9) + '" width="' + (w - bx - bw - 3) + '" height="' + (h - by - fh * 0.9) + '" fill="#171b20"/>';

    g += '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + bh + '" fill="' + pal[0] + '"/>';
    g += '<rect x="' + bx + '" y="' + by + '" width="' + (bw * 0.5) + '" height="' + bh + '" fill="' + pal[1] + '" opacity="0.45"/>';
    g += '<rect x="' + (bx - 4) + '" y="' + (by - 6) + '" width="' + (bw + 8) + '" height="8" rx="2" fill="' + pal[1] + '"/>';

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

    if (preWar) {
      var fx = bx + bw * 0.5;
      for (var r2 = 1; r2 < floors; r2++) {
        var ly = by + fh * r2 + fh * 0.12;
        g += '<rect x="' + (fx - mw * 0.95) + '" y="' + ly + '" width="' + (mw * 1.9) + '" height="2.5" fill="#2f3a33"/>';
        g += '<path d="M' + (fx - mw * 0.8) + ' ' + ly + ' L' + (fx + mw * 0.8) + ' ' + (ly + fh * 0.7) + '" stroke="#2f3a33" stroke-width="1.6" fill="none" opacity="0.8"/>';
      }
    }

    var dw = bw * 0.17, dx = bx + bw * 0.5 - dw / 2, dy = by + bh - fh * 0.62;
    g += '<rect x="' + dx + '" y="' + dy + '" width="' + dw + '" height="' + (fh * 0.62) + '" rx="2" fill="#241c18"/>';
    g += '<rect x="' + (dx + dw * 0.15) + '" y="' + (dy + fh * 0.1) + '" width="' + (dw * 0.7) + '" height="' + (fh * 0.28) + '" fill="#ffcf7a" opacity="0.5"/>';
    g += '<rect x="0" y="' + (by + bh) + '" width="' + w + '" height="' + (h - by - bh) + '" fill="#101418"/>';
    g += '<rect x="0" y="' + (by + bh) + '" width="' + w + '" height="2" fill="#262b25"/>';

    if (risk >= 65) g += '<rect width="' + w + '" height="' + h + '" fill="#e06a70" opacity="0.09"/>';
    else if (risk >= 45) g += '<rect width="' + w + '" height="' + h + '" fill="#e3b567" opacity="0.05"/>';

    return '<svg class="port" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Illustrated building portrait, drawn from this listing\'s record — not a photograph">' + g + '</svg>';
  }

  /* ---------- the hunt-zone map projection ---------- */

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

  window.__VERAC = {
    esc: esc, money: money, num: num, median: median, timeago: timeago,
    BRACKETS: BRACKETS, bracketOf: bracketOf, AREAS: AREAS, areaOf: areaOf,
    LINE_COLORS: LINE_COLORS, STATIONS: STATIONS, nearestStation: nearestStation, lineBullets: lineBullets,
    ownerRead: ownerRead, authenticity: authenticity, isScam: isScam, needsVerify: needsVerify,
    srcCls: srcCls, isFresh: isFresh, stabilized: stabilized, riskCls: riskCls, unitOf: unitOf,
    FIT: FIT, isFullFit: isFullFit, whyPassed: whyPassed, charName: charName, streetOf: streetOf, titleCase: titleCase,
    stewardOf: stewardOf, spatialLine: spatialLine,
    LAW: LAW, moveInMath: moveInMath, CHECKS: CHECKS, checkGroups: checkGroups, TELLS: TELLS,
    protections: protections, VERIFY_TOOLS: VERIFY_TOOLS, MARKET: MARKET,
    portrait: portrait, hashOf: hashOf,
    MAP: { B: B, VW: VW, VH: VH, px: px, py: py, pt: pt, poly: poly, HUDSON: HUDSON, EASTRIVER: EASTRIVER, CENTRAL_PARK: CENTRAL_PARK, HOOD_PINS: HOOD_PINS },
  };
})();
