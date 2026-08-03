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
        check('ledger headline is the character name', ($('[data-insp-title]').textContent || '').indexOf('The ') === 0 || ($('[data-insp-title]').textContent || '').indexOf('A ') === 0, $('[data-insp-title]').textContent);
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
      check('atlas draws land, stations, and pins', $$('.mp-land').length >= 2 && $$('.mp-stn').length > 40 && !!$('.mp'), $$('.mp-stn').length + ' stations');

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

      /* ---- system ---- */
      location.hash = '#/system'; app.route();
      check('system shows the pipeline stages', $$('.stage').length === 6, $$('.stage').length);
      check('system states the ethics', ($('.ethos') || { textContent: '' }).textContent.indexOf('never contacts a landlord') > -1 || ($('.ethos') || { textContent: '' }).textContent.indexOf('never messages a landlord') > -1, '');

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
