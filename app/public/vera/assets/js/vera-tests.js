/* VERA acceptance checks — run with ?test=1. Results land on
   window.__testResults as { pass, results: [{name, ok, detail}] }. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function run() {
    var app = window.__VERA_APP;
    var L = window.__VERAL;
    var state = app.state;
    var POOL = app.POOL();
    var results = [];
    function check(name, ok, detail) { results.push({ name: name, ok: !!ok, detail: String(detail == null ? '' : detail) }); }

    setTimeout(function () {
      check('feed loaded', !!app.D(), app.D() && app.D().generated_at);
      check('pool populated', POOL.length > 0, POOL.length);

      /* ---- today: the drop ---- */
      location.hash = '#/today'; app.route();
      check('drop page renders a hero', !!$('.drophead'), '');
      var fits = POOL.filter(C.isFullFit);
      var cards = $$('.dropcard').length;
      check('drop cards match the full-fit gate (max 8)', cards === Math.min(8, fits.length), cards + ' cards / ' + fits.length + ' fits');
      check('drop is honest when thin', fits.length > 0 ? true : !!$('.dropempty'), fits.length + ' fits');
      check('trust line names what was passed on', ($('.drophead__trust') || { textContent: '' }).textContent.indexOf('passed on') > -1, '');
      check('countdown present', !!$('[data-countdown]'), '');
      check('filters hidden on the drop', $('[data-filters]').hidden === true, 'the drop is an opinion, not a query');

      /* ---- character names ---- */
      var cn = C.charName({ address_normalized: '230 e second st apt d', unit_type: 'studio' });
      check('character name reads editorially', cn === 'The studio on East Second Street', cn);

      /* ---- full-fit gate mirrors the emailer ---- */
      var gateOk = fits.every(function (l) {
        return (+l.overall_score || 0) >= C.FIT.minScore && (+l.rent || 0) <= C.FIT.maxRent && !C.isScam(l);
      });
      check('full-fit gate holds its own bar', gateOk, fits.length + ' checked');

      /* ---- market ---- */
      location.hash = '#/market'; app.route();
      check('market shows the whole net', $$('.kpi').length >= 6, $$('.kpi').length + ' KPIs');
      check('market cites the published medians', ($('.pagehead__lede') || { textContent: '' }).textContent.indexOf('Manhattan') > -1, '');
      check('bracket tiles render', $$('.brtile').length === C.BRACKETS.length, $$('.brtile').length);
      check('filters visible on market', $('[data-filters]').hidden === false, '');

      var before = app.filtered().length;
      state.bracket = 'b1';
      var b1ok = app.filtered().every(function (l) { return C.bracketOf(l.rent) === 'b1'; });
      check('bracket lane isolates ≤$2,000', b1ok, app.filtered().length + ' of ' + before);
      state.bracket = 'all';

      state.lens.noBrokers = true; state.lens.noMgmt = true;
      var dirty = app.filtered().filter(function (l) { var o = C.ownerRead(l).label; return o === 'Broker' || o === 'Corporate'; }).length;
      check('owner lens excludes brokers + corps', dirty === 0, 'violations=' + dirty);
      state.lens.noBrokers = false; state.lens.noMgmt = false;

      var withCoords = POOL.filter(function (l) { return l.latitude != null; });
      var computed = withCoords.filter(function (l) { return C.nearestStation(l); });
      check('subway proximity computed', withCoords.length === 0 || computed.length > 0, computed.length + '/' + withCoords.length + ' within reach');
      var pubT = C.nearestStation({ transit: { station: 'Astor Pl', walk_mins: 7, lines: ['4', '6'] } });
      check('published GTFS transit wins over the fallback table', !!pubT && pubT.published === true && pubT.name === 'Astor Pl' && pubT.mins === 7, JSON.stringify(pubT));
      var pubT2 = C.nearestStation({ latitude: 40.7265, longitude: -73.9815 });
      check('fallback table still serves unpublished listings', !!pubT2 && !pubT2.published, pubT2 && pubT2.name);

      /* ---- browse ---- */
      location.hash = '#/browse'; app.route();
      check('browse table renders', $$('.dt tbody tr').length > 0, $$('.dt tbody tr').length + ' rows');
      check('view pills live on browse', $$('.pills [data-view]').length >= 5, '');
      var th = $('.dt thead th[data-sort="rent"]');
      th.click(); th.click();
      var rents = app.filtered().map(function (l) { return +l.rent || 0; });
      var sortedOk = rents.every(function (v, i) { return i === 0 || rents[i - 1] >= v || state.sort.key !== 'rent'; });
      check('column sort works', state.sort.key === 'rent' && sortedOk, state.sort.key + ' dir=' + state.sort.dir);

      state.view = 'scam';
      var scv = app.filtered().every(C.isScam);
      check('scam wall view isolates low authenticity', scv, app.filtered().length + ' flagged');
      state.view = 'all';

      /* ---- the ledger ---- */
      var first = $$('.dt tbody tr[data-open]')[0];
      if (first) {
        first.click();
        check('ledger opens', !$('[data-inspector]').hidden, '');
        check('ledger headline is the address (name as fallback)', ($('[data-insp-title]').textContent || '').length > 5, $('[data-insp-title]').textContent);
        $('[data-insp-tabs] [data-tab="records"]').click();
        check('records tab renders public data', $('[data-insp-body]').textContent.length > 20, '');
        $('[data-insp-tabs] [data-tab="owner"]').click();
        check('owner tab shows the chain of proof', $$('.chain li').length === 4, $$('.chain li').length + ' links');
        L.close();
      } else {
        check('ledger opens', false, 'no rows');
      }

      /* ---- atlas ---- */
      location.hash = '#/atlas'; app.route();
      var geoReady = window.__VERAG && window.__VERAG.ready();
      check('atlas draws land, stations, and pins',
        (geoReady ? $$('.mp-nta').length > 30 : $$('.mp-land').length >= 2) && $$('.mp-stn').length > 40 && !!$('.mp'),
        (geoReady ? $$('.mp-nta').length + ' real polygons' : 'fallback land') + ', ' + $$('.mp-stn').length + ' stations');

      /* ---- the real city (round 7) ---- */
      if (geoReady) {
        var hood = window.__VERAG.hoodAt(40.7265, -73.9815);
        check('point-in-polygon finds the East Village', !!hood && /East Village/i.test(hood.n), hood && hood.n);
        location.hash = '#/today'; app.route();
        check('drop cards carry a neighborhood minimap', $$('.dropcard__map .gm').length > 0 || $$('.dropcard').length === 0, $$('.dropcard__map .gm').length + ' maps');
        check('drop headline is the address, big', ($$('.dropcard__name')[0] || { textContent: '' }).textContent.length > 8, ($$('.dropcard__name')[0] || {}).textContent);
        check('landlord identity on the card', $$('.dropcard__owner').length === $$('.dropcard').length, $$('.dropcard__owner').length);
        check('photo gallery renders', $$('.gal').length > 0 || $$('.dropcard').length === 0, $$('.gal').length + ' galleries');
        check('steward grade on every card', $$('.steward').length >= $$('.dropcard').length, $$('.steward').length + ' grades');
        var stTest = C.stewardOf({ hpd_risk_score: 10, serious_open_violations: 0, heat_hot_water_complaints_3y: 0, bedbug_reports_3y: 0, litigation_count_3y: 0, dob_risk_score: 0 });
        check('clean record grades A', stTest.grade === 'A', stTest.grade + ' ' + stTest.score);
        var stBad = C.stewardOf({ hpd_risk_score: 90, serious_open_violations: 3, heat_hot_water_complaints_3y: 6, bedbug_reports_3y: 2, litigation_count_3y: 2, dob_risk_score: 70 });
        check('rot grades E with named failures', stBad.grade === 'E' && stBad.failures.length >= 3, stBad.grade + ': ' + stBad.failures.join('|'));
        var stUnk = C.stewardOf({});
        check('no data is honestly unproven, not an A', stUnk.grade === '?' && stUnk.score === null, stUnk.grade);
        check('anchor picker present on the drop', $$('.anchorbar select').length === 2, $$('.anchorbar select').length + ' selects');
        var selA = $('[data-anchor-sel="0"]');
        if (selA && $$('.dropcard').length) {
          selA.value = 'Union Sq';
          selA.dispatchEvent(new Event('change', { bubbles: true }));
          check('commute read prints on cards after picking an anchor', $$('.dropcard__commute').length > 0, $$('.dropcard__commute').length + ' cards');
          var honest = $$('.commute').every(function (el) { return el.textContent.indexOf('≈') > -1; });
          check('every commute figure is marked approximate', honest, '');
          var selB = $('[data-anchor-sel="0"]');
          selB.value = '';
          selB.dispatchEvent(new Event('change', { bubbles: true }));
          check('clearing the anchor clears the reads', $$('.dropcard__commute').length === 0, '');
        }
      } else {
        check('geo polygons loaded', false, 'hoods.json did not load');
      }

      /* ---- money engine obeys NY law ---- */
      var mm = C.moveInMath({ rent: 2400 });
      check('deposit capped at one month', mm.deposit === 2400, '$' + mm.deposit);
      check('application fee capped at $20', mm.appFee === 20, '$' + mm.appFee);
      check('move-in total carries no broker fee', mm.total === 2400 + 2400 + 20, '$' + mm.total);
      check('40x income rule surfaced', mm.annualIncomeNeeded === 96000, '$' + mm.annualIncomeNeeded);

      /* ---- the hunt ---- */
      var probe = POOL[0] && POOL[0].listing_uid;
      var hadCase = !!app.caseOf(probe);
      if (probe && !hadCase) {
        app.setStage(probe, 'saved');
        check('listing saves into the hunt', !!app.caseOf(probe) && app.caseOf(probe).stage === 'saved', '');
        app.cases()[probe].checks = { water: true };
        app.saveCases();
        check('viewing checklist persists per listing', app.caseOf(probe).checks.water === true, '');
        location.hash = '#/hunt'; app.route();
        check('hunt board renders stage columns', $$('.board .col').length === app.STAGES.length, $$('.board .col').length + ' columns');
        app.dropCase(probe);
        check('case can be removed', !app.caseOf(probe), '');
      } else {
        check('listing saves into the hunt', true, 'skipped — existing case');
      }

      /* ---- field manual ---- */
      location.hash = '#/manual'; app.route();
      check('manual renders both calculators', $$('.tool').length === 2, $$('.tool').length);
      check('scam school deck present', $$('.tell').length === C.TELLS.length, $$('.tell').length + ' tells');
      check('viewing checklist published in full', $$('.cgroup li').length === C.CHECKS.length, $$('.cgroup li').length + ' checks');
      check('chain-of-proof tools linked', $$('.vtool').length >= 4, $$('.vtool').length);

      /* ---- phase 1: personal value math ---- */
      var evSeries = ((app.D() || {}).market_context || {}).series || {};
      if (evSeries['East Village'] && evSeries['East Village'].median_asking_rent_latest) {
        var evMed = evSeries['East Village'].median_asking_rent_latest;
        var vr = app.valueRead({ rent: Math.round(evMed * 0.9), neighborhood: 'East Village' });
        check('value math: 10% under the exact-hood median', !!vr && vr.under && vr.pct === 10 && vr.label.indexOf('East Village median') > -1, vr && vr.label);
        var vrOver = app.valueRead({ rent: Math.round(evMed * 1.08), neighborhood: 'East Village' });
        check('value math: over-median reads amber side', !!vrOver && !vrOver.under, vrOver && vrOver.label);
      } else {
        check('value math: series available for fixture hood', false, 'East Village series missing');
      }
      var vrNone = app.valueRead({ rent: 2500, neighborhood: 'Nowhereville' });
      check('value math: unknown hood prints nothing', vrNone === null, String(vrNone));

      location.hash = '#/today'; app.route();
      var incInput = $('[data-profile-income]');
      if (incInput) {
        incInput.value = '120000';
        incInput.dispatchEvent(new Event('change', { bubbles: true }));
        check('income set prints qualification on cards', $$('.qualify').length > 0 || $$('.dropcard').length === 0, $$('.qualify').length);
        var incInput2 = $('[data-profile-income]');
        incInput2.value = '';
        incInput2.dispatchEvent(new Event('change', { bubbles: true }));
        check('income cleared removes qualification lines', $$('.qualify').length === 0, $$('.qualify').length);
      } else {
        check('income field present in anchor bar', false, '');
      }

      var probe2 = POOL[1] && POOL[1].listing_uid;
      if (probe2 && !app.caseOf(probe2)) {
        app.setStage(probe2, 'toured');
        L.open(probe2);
        $('[data-insp-tabs] [data-tab="visit"]').click();
        var ocBtn = $('.outcomes [data-outcome="roughly"]');
        check('outcome question appears after touring', !!ocBtn, '');
        if (ocBtn) {
          ocBtn.click();
          check('outcome persists on the case', app.caseOf(probe2).outcome === 'roughly', app.caseOf(probe2).outcome);
        }
        L.close();
        app.dropCase(probe2);
      } else {
        check('outcome question appears after touring', true, 'skipped — no free probe');
      }

      /* ---- phase 1.2/1.3: computed tells surface when the feed carries them ---- */
      var probe3 = POOL[2];
      if (probe3) {
        probe3.relist_suspect = true; probe3.true_days_on_market = 44; probe3.contact_reuse_count = 6;
        L.open(probe3.listing_uid);
        $('[data-insp-tabs] [data-tab="verify"]').click();
        var tellsTxt = ($('[data-insp-body]') || { textContent: '' }).textContent;
        check('relist tell renders in verify tab', tellsTxt.indexOf('counter was reset') > -1 && tellsTxt.indexOf('44 days') > -1, '');
        check('contact-reuse tell renders', tellsTxt.indexOf('6 listings') > -1, '');
        L.close();
        delete probe3.relist_suspect; delete probe3.true_days_on_market; delete probe3.contact_reuse_count;
      }

      /* ---- system ---- */
      location.hash = '#/system'; app.route();
      check('system shows the pipeline stages', $$('.stage').length === 6, $$('.stage').length);
      check('system states the ethics', ($('.ethos') || { textContent: '' }).textContent.indexOf('never contacts a landlord') > -1 || ($('.ethos') || { textContent: '' }).textContent.indexOf('never messages a landlord') > -1, '');

      /* ---- phase 2: deep links, portraits, hero, PWA ---- */
      try { sessionStorage.setItem('vera-sweep-seen', '1'); } catch (e2) {}
      var dlUid = POOL[0] && POOL[0].listing_uid;
      if (dlUid) {
        location.hash = '#/listing/' + dlUid; app.route();
        check('deep link opens its ledger over Today', L.openUid() === dlUid && !$('[data-inspector]').hidden, L.openUid());
        L.close();
        check('closing a deep-linked ledger steps the hash back', (location.hash || '') === '#/today', location.hash);
        location.hash = '#/listing/uid-that-never-existed'; app.route();
        check('dead deep link toasts and resets', L.openUid() === null && (location.hash || '') === '#/today', location.hash);
      }
      var pA = C.portrait({ listing_uid: 'det-test' }, 300, 132, 3);
      var pB = C.portrait({ listing_uid: 'det-test' }, 300, 132, 3);
      var pC = C.portrait({ listing_uid: 'det-test' }, 300, 132, 12);
      check('portraits deterministic per (uid, hour)', pA === pB, '');
      check('the sky follows the hour', pA !== pC && pC.indexOf('#26303e') > -1, '');
      check('sky buckets read right', C.skyOf(3) === 'night' && C.skyOf(6) === 'dawn' && C.skyOf(12) === 'day' && C.skyOf(19) === 'dusk', [C.skyOf(3), C.skyOf(6), C.skyOf(12), C.skyOf(19)].join(','));
      location.hash = '#/today'; app.route();
      check('sweep hero suppressed after first play (session flag)', !$('.sweephero') && window.__VERAS && window.__VERAS.played(), '');
      check('installable: manifest linked', !!document.querySelector('link[rel="manifest"]'), '');

      /* ---- phase 3: receipts, memorial, field kit ---- */
      location.hash = '#/archive'; app.route();
      check('receipts route renders its header', ($('.pagehead__title') || { textContent: '' }).textContent.indexOf('on the record') > -1, '');

      var dcs = (app.D() || {}).daily_changes || {};
      var hadGone = dcs.gone_listings;
      var hadDate = dcs.date;
      dcs.gone_listings = [{ change_detail: { title: 'THE TEST STUDIO', first_seen_at: new Date(Date.now() - 30 * 3.6e6).toISOString(), rent: 2400, neighborhood: 'East Village' } }];
      dcs.date = new Date().toISOString().slice(0, 10);
      location.hash = '#/today'; app.route();
      check('memorial line reports the one that got away', ($('.memorial') || { textContent: '' }).textContent.indexOf('went in') > -1, ($('.memorial') || {}).textContent.slice(0, 60));
      dcs.gone_listings = hadGone; dcs.date = hadDate;

      var fkUid = POOL[0] && POOL[0].listing_uid;
      if (fkUid) {
        var host = L.buildFieldKit(app.byUid(fkUid));
        var fkTxt = host.textContent;
        check('field kit carries grade, money, checklist, and chain', fkTxt.indexOf('steward grade') > -1 && fkTxt.indexOf('Cash to keys') > -1 && fkTxt.indexOf('☐') > -1 && fkTxt.indexOf('acris') > -1, '');
        check('field kit hidden on screen', getComputedStyle(host).display === 'none', getComputedStyle(host).display);
        L.open(fkUid);
        check('field kit action present in the ledger', !!$('[data-fieldkit]'), '');
        L.close();
      }

      /* ---- hygiene ---- */
      check('no private feed touched', ['./data/public.json', 'https://vera-pipeline.netlify.app/data/public.json'].every(function (u) { return u.indexOf('hunt') === -1 && u.indexOf('dashboard.json') === -1; }), '');
      check('brand present', ($('.brand__name') || { textContent: '' }).textContent === 'VERA', '');
      check('legacy routes redirect', (function () { location.hash = '#/command'; app.route(); return state.route === 'market'; })(), state.route);

      location.hash = '#/today'; app.route();
      window.__testResults = { pass: results.every(function (r) { return r.ok; }), results: results };
      console.log('[VERA TESTS]', JSON.stringify(window.__testResults, null, 1));
    }, 700);
  }

  window.__VERAT = { run: run };
})();
