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

      /* ---- load path discipline ---- */
      /* The map engine (~1MB) must not be in the initial document; it is
         injected by vera-app.js the first time Atlas opens (below). */
      check('map engine is not shipped to every visitor', !document.querySelector('script[src*="maplibre-gl"]'), '');
      /* This file itself must not be a static script tag in index.html —
         the fact that it is running proves the on-demand loader worked. */
      check('test suite arrived on demand, not in the page', !document.querySelector('script[src*="vera-tests"][defer]'), '');

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

      /* ---- verification and exact-address truth ---- */
      check('matched public records never enter needs-verification',
        C.needsVerify({ verification_status: 'matched_public_records', listing_confidence_score: 78 }) === false &&
        C.needsVerify({ verification_status: 'verified_public_records', listing_confidence_score: 78 }) === false &&
        C.needsVerify({ verification_status: 'not_qualified_for_enrichment', listing_confidence_score: 66 }) === true,
        'matched + verified stay out; unresolved stays in');
      check('numeric address fragments are not presented as exact addresses',
        C.exactAddressText({ address_normalized: '2461', address_raw: '2461' }) === null &&
        app.addressOf({ address_normalized: '2461', address_raw: '2461' }) === null &&
        C.exactAddressText({ address_normalized: '17th Street' }) === null &&
        C.exactAddressText({ address_normalized: '2461 W' }) === null,
        '2461 · 17th Street · 2461 W');
      check('a numbered street remains an exact address',
        C.exactAddressText({ address_normalized: '120 broadway apt 4' }) === '120 broadway apt 4' &&
        C.exactAddressText({ address_normalized: '12-34 31st ave' }) === '12-34 31st ave' &&
        app.addressOf({ address_normalized: '120 broadway apt 4' }) === '120 Broadway #4',
        app.addressOf({ address_normalized: '120 broadway apt 4' }));

      var geoCandidate = C.addressCandidate({ properties: {
        label: '120 Broadway, Manhattan, NY', confidence: 0.97, match_type: 'exact',
        addendum: { pad: { bbl: '1-00047-7501', bin: '1,001,026' } },
      } });
      check('GeoSearch accepts a strong labelled PAD building candidate',
        !!geoCandidate && geoCandidate.bbl === '1000477501' && geoCandidate.bin === '1001026' && geoCandidate.confidence === 0.97,
        JSON.stringify(geoCandidate));
      check('GeoSearch rejects weak, anonymous, and unidentifiable candidates',
        C.addressCandidate({ properties: { label: '120 Broadway', confidence: 0.79, addendum: { pad: { bbl: '1000477501' } } } }) === null &&
        C.addressCandidate({ properties: { label: '120 Broadway', confidence: 1.01, addendum: { pad: { bbl: '1000477501' } } } }) === null &&
        C.addressCandidate({ properties: { label: '', confidence: 0.99, addendum: { pad: { bbl: '1000477501' } } } }) === null &&
        C.addressCandidate({ properties: { label: '120 Broadway', confidence: 0.99, addendum: { pad: {} } } }) === null,
        'all rejected');

      /* ---- market ---- */
      location.hash = '#/market'; app.route();
      check('market shows the whole net', $$('.kpi').length >= 6, $$('.kpi').length + ' KPIs');
      check('market cites the published medians', ($('.pagehead__lede') || { textContent: '' }).textContent.indexOf('Manhattan') > -1, '');
      check('bracket tiles render', $$('.brtile').length === C.BRACKETS.length, $$('.brtile').length);
      check('filters visible on market', $('[data-filters]').hidden === false, '');

      var toggleSelector = '[data-bracket],[data-unit],[data-transit],[data-lens],[data-view],[data-area],[data-brtile],[data-hoodbar],[data-density]';
      var actualToggles = $$(toggleSelector);
      check('actual filter controls expose their pressed state',
        actualToggles.length > 0 && actualToggles.every(function (button) {
          return button.getAttribute('aria-pressed') === (button.classList.contains('is-on') ? 'true' : 'false');
        }),
        actualToggles.length + ' controls');

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
      var sortButton = $('.dt thead button[data-sort="rent"]');
      check('sortable columns use keyboard-native buttons', !!sortButton && sortButton.tagName === 'BUTTON', sortButton && sortButton.tagName);
      sortButton.click();
      sortButton = $('.dt thead button[data-sort="rent"]');
      var rents = app.filtered().map(function (l) { return +l.rent || 0; });
      var sortedOk = rents.every(function (v, i) { return i === 0 || rents[i - 1] >= v || state.sort.key !== 'rent'; });
      check('column sort works', state.sort.key === 'rent' && sortedOk, state.sort.key + ' dir=' + state.sort.dir);
      check('sorted column exposes its direction on the table header',
        $('.dt thead button[data-sort="rent"]').closest('th').getAttribute('aria-sort') === 'descending',
        $('.dt thead button[data-sort="rent"]').closest('th').getAttribute('aria-sort'));

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

      /* ---- two-tier forensics (David's ruling 2026-08-05) ---- */
      var rowB = $$('.dt tbody tr[data-open]')[0];
      if (rowB) {
        rowB.click();
        L.setTab('verify');
        L._render({ listing_uid: 'fx-hard', title: 'Fixture', rent: 2400, contact_reuse_count: 7, photo_clone_suspect: true });
        var hardSec = $('[data-tells="hard"]');
        check('fraud evidence is flagged hard, every time',
          !!hardSec && /suspected fraud/.test(hardSec.textContent) && /7 listings/.test(hardSec.textContent) && /unproven/.test(hardSec.textContent),
          hardSec ? hardSec.textContent.slice(0, 80) : 'no hard section');
        check('a hard-flagged listing does not also cry laziness', !$('[data-tells="soft"]'), '');
        L._render({ listing_uid: 'fx-soft', title: 'Fixture', rent: 2400, desc_clone_of: 'fx-other', relist_suspect: true, true_days_on_market: 44 });
        var softSec = $('[data-tells="soft"]');
        check('laziness-shaped signals get a sticker, not a flag',
          !!softSec && /laziness/.test(softSec.textContent) && /44 days/.test(softSec.textContent) && !$('[data-tells="hard"]'),
          softSec ? softSec.textContent.slice(0, 80) : 'no soft section');
        check('the sticker swears off score punishment', !!softSec && /never move the score/.test(softSec.textContent), '');
        L._render({ listing_uid: 'fx-clean', title: 'Fixture', rent: 2400 });
        check('a clean listing shows neither tier', !$('[data-tells="hard"]') && !$('[data-tells="soft"]'), '');
        L.close();
      } else {
        check('fraud evidence is flagged hard, every time', false, 'no rows to host the fixture');
      }

      /* ---- phone overflow sheets (C2/C3) ---- */
      check('nav declares five secondary sections', $$('.mastnav__2nd').length === 5, $$('.mastnav__2nd').length);
      $('[data-nav-more]').click();
      var navSheetOpen = !$('[data-nav-sheet]').hidden;
      $('[data-nav-sheet] [data-nav="system"]').click();
      app.route();
      check('nav More sheet opens, routes, and closes itself',
        navSheetOpen && state.route === 'system' && $('[data-nav-sheet]').hidden, state.route);
      check('More wears the active state on a secondary route', $('[data-nav-more]').classList.contains('is-on'), '');
      location.hash = '#/browse'; app.route();
      var rowC = $$('.dt tbody tr[data-open]')[0];
      if (rowC) {
        rowC.click();
        $('[data-tab-more]').click();
        var tabSheetOpen = !$('[data-tab-sheet]').hidden;
        $$('[data-tab-sheet] [data-tab="money"]')[0].click();
        check('ledger More sheet opens, switches tabs, and closes itself',
          tabSheetOpen && $('[data-tab-sheet]').hidden && $('[data-insp-body]').textContent.length > 20, '');
        check('ledger More lights while a secondary tab is active', $('[data-tab-more]').classList.contains('is-on'), '');
        L.setTab('overview');
        L.close();
      } else {
        check('ledger More sheet opens, switches tabs, and closes itself', false, 'no rows');
      }
      location.hash = '#/today'; app.route();

      /* ---- atlas ---- */
      location.hash = '#/atlas'; app.route();
      var geoReady = window.__VERAG && window.__VERAG.ready();
      var vectorUp = !!document.querySelector('[data-veramap]');
      var mapLoading = !!document.querySelector('[data-map-loading]');
      check('atlas mounts the real map, the drawn fallback, or the first-load state',
        vectorUp || mapLoading || ((geoReady ? $$('.mp-nta').length > 30 : $$('.mp-land').length >= 2) && $$('.mp-stn').length > 40 && !!$('.mp')),
        vectorUp ? 'vector map container mounted' : (mapLoading ? 'map engine loading on demand' : 'SVG fallback path'));

      /* ---- the real city (round 7) ---- */
      if (geoReady) {
        var hood = window.__VERAG.hoodAt(40.7265, -73.9815);
        check('point-in-polygon finds the East Village', !!hood && /East Village/i.test(hood.n), hood && hood.n);
        location.hash = '#/today'; app.route();
        check('drop cards carry a neighborhood minimap', $$('.dropcard__map .gm').length > 0 || $$('.dropcard').length === 0, $$('.dropcard__map .gm').length + ' maps');
        /* an empty drop is an honest state, not a failure — the suite must
           not cry wolf on the nights when nothing clears every gate */
        check('drop headline is the address, big',
          $$('.dropcard').length === 0 || ($$('.dropcard__name')[0] || { textContent: '' }).textContent.length > 8,
          $$('.dropcard').length === 0 ? 'empty drop — honest state' : ($$('.dropcard__name')[0] || {}).textContent);
        check('an empty drop still says so plainly',
          $$('.dropcard').length > 0 || !!$('.dropempty'),
          $$('.dropcard').length + ' cards');
        check('an empty drop shows where the net actually narrowed',
          $$('.dropcard').length > 0 || ($$('.funnel__row').length === 5 && $('.funnel__n').textContent === String(POOL.length)),
          $$('.funnel__row').length + ' funnel rows');
        check('landlord identity on the card', $$('.dropcard__owner').length === $$('.dropcard').length, $$('.dropcard__owner').length);
        check('photo gallery renders', $$('.gal').length > 0 || $$('.dropcard').length === 0, $$('.gal').length + ' galleries');
        check('steward grade on every card', $$('.steward').length >= $$('.dropcard').length, $$('.steward').length + ' grades');
        var stTest = C.stewardOf({ hpd_risk_score: 10, serious_open_violations: 0, heat_hot_water_complaints_3y: 0, bedbug_reports_3y: 0, litigation_count_3y: 0, dob_risk_score: 0 });
        check('clean record grades A', stTest.grade === 'A', stTest.grade + ' ' + stTest.score);
        var stBad = C.stewardOf({ hpd_risk_score: 90, serious_open_violations: 3, heat_hot_water_complaints_3y: 6, bedbug_reports_3y: 2, litigation_count_3y: 2, dob_risk_score: 70 });
        check('rot grades E with named failures', stBad.grade === 'E' && stBad.failures.length >= 3, stBad.grade + ': ' + stBad.failures.join('|'));
        var stUnk = C.stewardOf({});
        check('no data is honestly unproven, not an A', stUnk.grade === '?' && stUnk.score === null, stUnk.grade);
        /* phase 4: every named failure carries its citation */
        var stCite = C.stewardOf({ hpd_risk_score: 90, heat_hot_water_complaints_3y: 5, dob_risk_score: 80, bin: '1001234' });
        var cited = stCite.failures.every(function (f) { return f.t && f.src && f.url && f.url.indexOf('https://') === 0; });
        check('every steward failure is cited to its record', cited && stCite.sources.length >= 2, JSON.stringify(stCite.sources));
        var dobF = stCite.failures.filter(function (f) { return f.src === 'DOB'; })[0];
        check('DOB citations deep-link the BIN', !!dobF && dobF.url.indexOf('bin=1001234') > -1, dobF && dobF.url);
        /* phase 4: voucher chip renders only on explicit signal */
        var vFix = POOL.filter(C.isFullFit)[0];
        if (vFix) {
          vFix.voucher_signal = true;
          location.hash = '#/today'; app.route();
          check('voucher chip appears on stated signal', document.body.textContent.indexOf('vouchers welcomed (stated)') > -1, '');
          delete vFix.voucher_signal;
          app.route();
          check('voucher chip absent without the signal', document.body.textContent.indexOf('vouchers welcomed') === -1, '');
        } else {
          check('voucher chip appears on stated signal', true, 'skipped — no fits in feed');
        }
        check('anchor picker present on the drop', $$('.anchorbar select').length === 2, $$('.anchorbar select').length + ' selects');
        var selA = $('[data-anchor-sel="0"]');
        if (selA && $$('.dropcard').length) {
          selA.value = 'Union Sq';
          selA.dispatchEvent(new Event('change', { bubbles: true }));
          check('commute read prints on cards after picking an anchor', $$('.dropcard__commute').length > 0, $$('.dropcard__commute').length + ' cards');
          var honest = $$('.commute').every(function (el) { return el.textContent.indexOf('≈') > -1; });
          check('every commute figure is marked approximate', honest, '');
          /* 1.4b: with timetable tables in the feed, the ride is QUOTED */
          var D2 = app.D();
          var hadTT = D2.transit_tables;
          D2.transit_tables = { 'L': [['Canarsie-Rockaway Pkwy', 0], ['Bedford Av', 2100], ['Union Sq-14 St', 2640]] };
          var cr = app.commuteRead({ transit: { station: 'Bedford Av', walk_mins: 8, lines: ['L'] }, latitude: 40.7172, longitude: -73.9567 }, 'Union Sq');
          check('scheduled ride minutes quoted from the timetable', !!cr && cr.label.indexOf('≈9 min scheduled') > -1, cr && cr.label);
          /* Test the no-timetable path with the timetables actually GONE.
             This previously restored the real tables first and then asserted
             the fallback, so it only passed while the live feed happened to
             lack a matching route — luck, not coverage. */
          D2.transit_tables = null;
          var crNo = app.commuteRead({ transit: { station: 'Bedford Av', walk_mins: 8, lines: ['L'] }, latitude: 40.7172, longitude: -73.9567 }, 'Union Sq');
          check('without tables the honest direct-line fallback holds', !!crNo && crNo.label.indexOf('direct') > -1 && crNo.label.indexOf('scheduled') === -1, crNo && crNo.label);
          D2.transit_tables = hadTT;
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
      var liveCases = app.cases();
      var caseBackup = JSON.parse(JSON.stringify(liveCases));
      Object.keys(liveCases).forEach(function (uid) { delete liveCases[uid]; });
      app.saveCases();
      location.hash = '#/hunt'; app.route();
      var emptyHuntH1 = $$('h1').filter(function (heading) {
        return !heading.closest('[hidden], [aria-hidden="true"]');
      });
      check('an empty Hunt still exposes one h1',
        emptyHuntH1.length === 1 && emptyHuntH1[0].textContent.indexOf('starts empty') > -1,
        emptyHuntH1.map(function (heading) { return heading.textContent; }).join(' | '));
      Object.keys(liveCases).forEach(function (uid) { delete liveCases[uid]; });
      Object.keys(caseBackup).forEach(function (uid) { liveCases[uid] = caseBackup[uid]; });
      app.saveCases();

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

      var rentSlider = $('[data-tool-rent]');
      var rentSliderStart = rentSlider.value;
      rentSlider.focus();
      rentSlider.value = String(+rentSliderStart + (+rentSlider.step || 50));
      rentSlider.dispatchEvent(new Event('input', { bubbles: true }));
      check('manual slider updates without replacing the focused control',
        $('[data-tool-rent]') === rentSlider && document.activeElement === rentSlider,
        document.activeElement && document.activeElement.tagName);
      rentSlider.value = rentSliderStart;
      rentSlider.dispatchEvent(new Event('input', { bubbles: true }));

      /* ---- phase 1: personal value math ---- */
      var valueData = app.D();
      var hadMarketContext = valueData.market_context;
      valueData.market_context = { series: { 'East Village': {
        median_asking_rent: [2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500, 2500],
        median_asking_rent_latest: 2500,
      } } };
      var evMed = 2500;
      var vr = app.valueRead({ rent: Math.round(evMed * 0.9), neighborhood: 'East Village' });
      check('value math: 10% under the exact-hood median', !!vr && vr.under && vr.pct === 10 && vr.label.indexOf('East Village median') > -1, vr && vr.label);
      var vrOver = app.valueRead({ rent: Math.round(evMed * 1.08), neighborhood: 'East Village' });
      check('value math: over-median reads amber side', !!vrOver && !vrOver.under, vrOver && vrOver.label);
      valueData.market_context = hadMarketContext;
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
        probe3.ai_photo_suspect = true; probe3.ai_photo_probability = 0.91;
        L.setTab('verify');
        var aiTxt = ($('[data-insp-body]') || { textContent: '' }).textContent;
        check('AI-photo tell is probabilistic on its face', aiTxt.indexOf('91% classifier confidence') > -1 && aiTxt.indexOf('not proof') > -1, '');
        delete probe3.ai_photo_suspect; delete probe3.ai_photo_probability;
        L.close();
        delete probe3.relist_suspect; delete probe3.true_days_on_market; delete probe3.contact_reuse_count;
      }

      /* ---- system ---- */
      location.hash = '#/system'; app.route();
      check('system shows the pipeline stages', $$('.stage').length === 6, $$('.stage').length);
      check('system states the ethics', ($('.ethos') || { textContent: '' }).textContent.indexOf('never contacts a landlord') > -1 || ($('.ethos') || { textContent: '' }).textContent.indexOf('never messages a landlord') > -1, '');

      /* ---- phase 2: deep links, portraits, hero, PWA ---- */
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
        var fkL = app.byUid(fkUid);
        var fkHadIll = fkL.illegal_demands;
        fkL.illegal_demands = [{ id: 'key_money', says: 'asks for key money',
          law: 'Key money is illegal in New York', quote: 'super tip of $300' }];
        var host = L.buildFieldKit(fkL);
        var fkTxt = host.textContent;
        check('field kit carries grade, money, checklist, and chain', fkTxt.indexOf('steward grade') > -1 && fkTxt.indexOf('Cash to keys') > -1 && fkTxt.indexOf('☐') > -1 && fkTxt.indexOf('acris') > -1, '');
        check('field kit hidden on screen', getComputedStyle(host).display === 'none', getComputedStyle(host).display);
        check('field kit carries the unlawful demand into the room',
          host.textContent.indexOf('asks for key money') > -1 &&
          host.textContent.indexOf('super tip of $300') > -1 &&
          host.textContent.indexOf('Key money is illegal') > -1 &&
          host.textContent.indexOf('do not have to pay it') > -1, '');
        fkL.illegal_demands = fkHadIll;
        L.open(fkUid);
        check('field kit action present in the ledger', !!$('[data-fieldkit]'), '');
        L.close();
      }

      /* ---- phase 5: the move-in ledger ---- */
      var probeS = POOL[4] && POOL[4].listing_uid;
      if (probeS && !app.caseOf(probeS)) {
        app.setStage(probeS, 'signed');
        check('signing stamps the date', !!app.caseOf(probeS).signedAt, app.caseOf(probeS).signedAt);
        location.hash = '#/hunt'; app.route();
        var mv = ($('.ccard__movein') || { textContent: '' }).textContent;
        check('move-in ledger renders law countdowns', mv.indexOf('renewal watch') > -1 && mv.indexOf('deposit back in 14 days') > -1, mv.slice(0, 80));
        check('hunt board grew a Signed column', $$('.board .col').length === app.STAGES.length, $$('.board .col').length + ' cols for ' + app.STAGES.length + ' stages');
        app.dropCase(probeS);
      } else {
        check('signing stamps the date', true, 'skipped — no free probe');
      }
      check('the hunt now runs first-look to signed lease', app.STAGES.length === 7 && app.STAGES.filter(function (s) { return s.id === 'signed'; }).length === 1, app.STAGES.map(function (s) { return s.id; }).join(','));

      /* ---- neighborhood resolution is disclosed, not silent ---- */
      var nrProbe = POOL[0];
      var hadNR = nrProbe.neighborhood_resolved_from_coords, hadNS = nrProbe.neighborhood_source;
      nrProbe.neighborhood_resolved_from_coords = true; nrProbe.neighborhood_source = 'Brooklyn';
      L.open(nrProbe.listing_uid);
      var disclosed = document.body.textContent.indexOf('placed by coordinates') > -1;
      var srcNamed = document.body.textContent.indexOf('posted as Brooklyn') > -1;
      L.close();
      check('a corrected neighborhood says so, naming the source value', disclosed && srcNamed, disclosed ? 'disclosed' : 'NOT disclosed');
      nrProbe.neighborhood_resolved_from_coords = hadNR; nrProbe.neighborhood_source = hadNS;

      /* ---- confidence must never read as good-enough when unknown ---- */
      check('a word grade maps to a number, not NaN',
        C.authenticity({ listing_authenticity_confidence: 'high' }) === 80 &&
        C.authenticity({ listing_authenticity_confidence: 'low' }) === 30, '');
      check('no confidence at all reads as unknown',
        C.authenticity({}) === null && C.authenticity({ listing_confidence_score: null }) === null, '');
      check('unknown confidence cannot clear the full-fit gate',
        C.isFullFit({ recommendation: 'pursue', overall_score: 99, rent: 2000, hpd_risk_score: 0, dob_risk_score: 0 }) === false,
        'a listing with no confidence must not appear in the drop');
      check('numeric confidence still wins over the word',
        C.authenticity({ listing_confidence_score: 71, listing_authenticity_confidence: 'low' }) === 71, '');

      /* ---- the owner's wider record ---- */
      var pfProbe = POOL[1];
      var hadPF = pfProbe.landlord_portfolio;
      pfProbe.landlord_portfolio = { bldgs: 10, units: 197, topcorp: 'HAVILAND 18 LLC',
        totalevictions: 47, avgevictions: 4.7, openviolationsperresunit: 3.6,
        totalopenviolations: 712, totalrsdiff: -170, topowners: ['ISSAKA MAIGUZO', 'FRANKLIN RODRIGUEZ'] };
      L.open(pfProbe.listing_uid);
      // The owner tab, not records: this is what the landlord does across
      // their whole portfolio, not what is on file for this building.
      $('[data-insp-tabs] [data-tab="owner"]').click();
      var pfTxt = ($('[data-insp-body]') || { textContent: '' }).textContent;
      check('portfolio names the owner and their wider record',
        pfTxt.indexOf('HAVILAND 18 LLC') > -1 && pfTxt.indexOf('10 buildings') > -1 &&
        pfTxt.indexOf('47 across the portfolio') > -1 && pfTxt.indexOf('170 lost') > -1,
        'portfolio block');
      check('a heavy portfolio reads as heavy', !!$('.pf-head--bad'), '');
      $('[data-insp-tabs] [data-tab="records"]').click();
      check('and it lives on the owner tab, not the building records tab',
        (($('[data-insp-body]') || { textContent: '' }).textContent).indexOf('wider record') === -1,
        'a renter looking up their landlord should not have to find it under Records');
      $('[data-insp-tabs] [data-tab="owner"]').click();
      L.close();
      pfProbe.landlord_portfolio = { bldgs: 2, units: 8, topcorp: 'SMALL OWNER LLC', totalevictions: 0, openviolationsperresunit: 0 };
      L.open(pfProbe.listing_uid);
      $('[data-insp-tabs] [data-tab="owner"]').click();
      check('a clean small portfolio reads as clean', !!$('.pf-head--good'), '');
      L.close();
      pfProbe.landlord_portfolio = hadPF;

      /* ---- the law, read against the listing ---- */
      var lawProbe = POOL[2];
      var hadIll = lawProbe.illegal_demands, hadCue = lawProbe.scam_cues_found;
      lawProbe.illegal_demands = [{ id: 'deposit_over_one_month', says: 'asks for more than one month\u2019s security',
        law: 'HSTPA 2019 caps security at one month\u2019s rent', quote: 'first, last and one month security' }];
      lawProbe.scam_cues_found = [{ id: 'wire_payment', says: 'asks to be paid by wire', quote: 'wire transfer' }];
      L.open(lawProbe.listing_uid);
      $('[data-insp-tabs] [data-tab="verify"]').click();
      var lawTxt = ($('[data-insp-body]') || { textContent: '' }).textContent;
      check('an unlawful demand leads, quoting the listing and naming the statute',
        lawTxt.indexOf('asks for something the law forbids') > -1 &&
        lawTxt.indexOf('HSTPA') > -1 && lawTxt.indexOf('first, last and one month security') > -1, '');
      check('scam cues stay separate from unlawful demands',
        lawTxt.indexOf('Language that runs with fraud') > -1 &&
        lawTxt.indexOf('not proof of it') > -1, '');
      check('an unlawful demand does not accuse the landlord',
        lawTxt.indexOf('not proof of a bad landlord') > -1, '');
      L.close();
      lawProbe.illegal_demands = hadIll; lawProbe.scam_cues_found = hadCue;

      /* ---- the manual teaches everything the engine detects ---- */
      location.hash = '#/manual'; app.route();
      var manTxt = document.body.textContent;
      check('the manual teaches all five unlawful demands',
        $$('.unlawful li').length === 5 &&
        /[“"]good-faith[”"] deposit/.test(manTxt) &&
        manTxt.indexOf('Key money') > -1, $$('.unlawful li').length + ' listed');

      /* ---- attribution the licences actually require ---- */
      location.hash = '#/system'; app.route();
      var credTxt = document.body.textContent;
      check('the app credits every source it leans on',
        $$('.credits li').length >= 6 &&
        credTxt.indexOf('NYC Dept. of City Planning') > -1 &&
        credTxt.indexOf('MTA') > -1 &&
        credTxt.indexOf('umm-maybe/AI-image-detector') > -1 &&
        credTxt.indexOf('CC BY 4.0') > -1 &&
        credTxt.indexOf('Open map data') > -1 &&
        credTxt.indexOf('Who Owns What') > -1, $$('.credits li').length + ' credits');

      /* ---- counts get a denominator ---- */
      var puProbe = POOL[0];
      var hadU = puProbe.unit_count, hadS = puProbe.serious_open_violations, hadH = puProbe.heat_hot_water_complaints_3y;
      puProbe.unit_count = 799; puProbe.serious_open_violations = 7; puProbe.heat_hot_water_complaints_3y = 14;
      L.open(puProbe.listing_uid);
      $('[data-insp-tabs] [data-tab="records"]').click();
      var puTxt = ($('[data-insp-body]') || { textContent: '' }).textContent;
      check('violation counts are shown per apartment, not raw',
        puTxt.indexOf('799 apartments') > -1 && puTxt.indexOf('per apartment') > -1 &&
        puTxt.indexOf('the rate is the fairer read') > -1, '');
      L.close();
      puProbe.unit_count = 0;
      L.open(puProbe.listing_uid);
      $('[data-insp-tabs] [data-tab="records"]').click();
      check('no unit count means no invented rate', !$('.perunit'), '');
      L.close();
      puProbe.unit_count = hadU; puProbe.serious_open_violations = hadS; puProbe.heat_hot_water_complaints_3y = hadH;

      /* ---- accessibility floor ---- */
      location.hash = '#/today'; app.route();
      /* Count only what assistive tech is actually exposed to: a subtree
         behind [hidden] or aria-hidden is out of the accessibility tree,
         so the print-only field kit's own <h1> is correctly invisible here. */
      function exposed(el) { return !el.closest('[hidden], [aria-hidden="true"]'); }
      var lv = $$('h1,h2,h3,h4').filter(exposed).map(function (h) { return +h.tagName[1]; });
      var skips = [];
      for (var hi = 1; hi < lv.length; hi++) if (lv[hi] - lv[hi - 1] > 1) skips.push(lv[hi - 1] + '->' + lv[hi]);
      check('heading levels never skip a rung', skips.length === 0, skips.join(', ') || 'clean');
      check('exactly one h1 exposed to assistive tech', $$('h1').filter(exposed).length === 1, $$('h1').filter(exposed).length);
      var noAlt = $$('img').filter(exposed).filter(function (i) { return !i.hasAttribute('alt'); });
      check('every image carries alt text', noAlt.length === 0, noAlt.length + ' missing');
      var muteRatio = (function () {
        var v = getComputedStyle(document.documentElement).getPropertyValue('--mute').trim().replace('#', '');
        var rgb = [0, 2, 4].map(function (i) { return parseInt(v.substr(i, 2), 16); });
        function L(c) { var a = c.map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
        var lf = L(rgb), lb = L([11, 13, 12]);
        return (Math.max(lf, lb) + 0.05) / (Math.min(lf, lb) + 0.05);
      })();
      check('the dimmest text token clears WCAG AA', muteRatio >= 4.5, muteRatio.toFixed(2) + ':1');
      var ann = $('[data-route-announce]');
      check('route changes are announced politely', !!ann && ann.getAttribute('aria-live') === 'polite', ann ? 'live region present' : 'MISSING');
      location.hash = '#/market'; app.route();
      check('the announcement names the view and its size',
        !!ann && ann.textContent.indexOf('Market') > -1 && /\d+ listings/.test(ann.textContent), ann && ann.textContent);
      location.hash = '#/today'; app.route();
      check('the announcement follows you between views',
        !!ann && ann.textContent.indexOf('Today') > -1, ann && ann.textContent);

      /* ---- records-layer honesty ---- */
      var Dh = app.D();
      var hadRH = Dh.records_health;
      Dh.records_health = { matched: 0, errors: 18, skipped: 150, total: 168, degraded: true };
      location.hash = '#/today'; app.route();
      var rw = $('.recwarn');
      check('a failed records layer says so, loudly',
        !!rw && rw.textContent.indexOf('could not read the record') > -1 && rw.textContent.indexOf('18 building lookups failed') > -1,
        rw ? 'banner shown' : 'MISSING');
      Dh.records_health = { matched: 17, errors: 0, skipped: 149, total: 166, degraded: false };
      app.route();
      check('a healthy records layer shows no warning', !$('.recwarn'), '');
      Dh.records_health = hadRH;

      /* ---- the 87% VERA cannot verify still get a way to check ----
         An unverified listing used to get four generic lines and a link
         back to the source, while a verified one got a full building
         record. The tools are the same either way. */
      var _unver = POOL.filter(C.needsVerify)[0];
      var _ver = POOL.filter(C.hasMatchedRecord)[0];
      if (_unver) {
        L.open(_unver.listing_uid);
        $('[data-insp-tabs] [data-tab="verify"]').click();
        var _vt = $('[data-insp-body]');
        check('an unverified listing is handed the public-record tools',
          $$('.vtool', _vt).length >= 5, $$('.vtool', _vt).length + ' tools');
        check('and is told plainly why VERA could not do it',
          /could not identify this building yet/i.test(_vt.textContent), '');
        L.close();
      }
      if (_ver) {
        L.open(_ver.listing_uid);
        $('[data-insp-tabs] [data-tab="verify"]').click();
        check('a verified listing is not handed the self-check block',
          !$('.address-check', $('[data-insp-body]')) &&
          !/could not identify this building yet/i.test($('[data-insp-body]').textContent),
          'it already has the record');
        L.close();
      }

      /* ---- the drop's "see the rest" jump ----
         This link only renders on a night when more than eight listings
         clear every gate, which is rare — so it would rot unnoticed. The
         handler is exercised directly instead of waiting for such a night. */
      location.hash = '#/today'; app.route();
      var _viewWas = state.view;
      var _probe = document.createElement('a');
      _probe.href = '#/browse';
      _probe.setAttribute('data-view-jump', 'cleared');
      (($('.drophead') || document.body)).appendChild(_probe);
      _probe.click();
      check('the drop\'s "see the rest" link lands on the cleared set',
        state.view === 'cleared', state.view);
      _probe.remove();
      state.view = _viewWas;

      /* ---- no horizontal overflow, at whatever width this is running ----
         A 375px regression shipped once before, so this is checked rather
         than assumed. It runs at the current viewport, so opening ?test=1
         on a phone or a narrow window is a real check; on a desktop it is
         a cheap no-op. Measured on the document, not on element rects —
         an SVG path inside a clipped minimap legitimately reports bounds
         past the viewport and is not overflow. */
      var _de = document.documentElement;
      // A hidden or detached pane reports clientWidth 0, which would fail
      // every route on a measurement that never happened. A check that
      // cannot measure has to say so rather than cry wolf.
      if (_de.clientWidth < 200) {
        check('viewport too small to measure overflow — skipped, not failed',
          true, _de.clientWidth + 'px (pane hidden or detached)');
      } else {
        ['today', 'market', 'browse', 'atlas', 'hunt', 'manual', 'archive', 'system'].forEach(function (r) {
          location.hash = '#/' + r; app.route();
          check('no sideways scroll on ' + r + ' at ' + _de.clientWidth + 'px',
            _de.scrollWidth <= _de.clientWidth + 1,
            _de.scrollWidth + ' vs ' + _de.clientWidth);
        });
      }
      location.hash = '#/today'; app.route();

      /* ---- hygiene ---- */
      // Reads the LIVE feed list, not a copy of it. The copy this replaced
      // asserted a hardcoded pair, so it would have gone on passing no
      // matter what origin was actually added.
      var feeds = (app.FEEDS || []).map(function (f) { return typeof f === 'string' ? f : f.url; });
      check('every feed origin is declared', feeds.length >= 2, feeds.length + ' origins');
      check('no private feed touched', feeds.length > 0 && feeds.every(function (u) { return u.indexOf('hunt') === -1 && u.indexOf('dashboard.json') === -1; }), feeds.join(' '));
      check('every feed reads public.json only', feeds.every(function (u) { return /public\.json$/.test(u); }), '');
      // The receipts used to be one hardcoded same-origin fetch whose failure
      // handler painted an EMPTY archive — a network error read as "nothing
      // ever cleared the bar" on the page that exists to prove otherwise.
      var arcs = (app.archiveOrigins ? app.archiveOrigins() : []).map(function (a) { return a.url; });
      check('receipts read every origin the feed does', arcs.length === feeds.length, arcs.length + ' vs ' + feeds.length);
      check('and each one points at archive.json', arcs.length > 0 && arcs.every(function (u) { return /archive\.json$/.test(u); }), arcs.join(' '));
      check('brand present', ($('.brand__name') || { textContent: '' }).textContent === 'VERA', '');
      check('legacy routes redirect', (function () { location.hash = '#/command'; app.route(); return state.route === 'market'; })(), state.route);

      location.hash = '#/today'; app.route();
      window.__testResults = { pass: results.every(function (r) { return r.ok; }), results: results };
      console.log('[VERA TESTS]', JSON.stringify(window.__testResults, null, 1));
    }, 700);
  }

  window.__VERAT = { run: run };
})();
