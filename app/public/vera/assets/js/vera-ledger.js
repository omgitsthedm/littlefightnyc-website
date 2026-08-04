/* VERA ledger — the per-listing flyout. Seven tabs of verification theater:
   what it is, what it costs, what to check standing in it, what the city
   knows about the building, who is really behind it, how VERA scored it,
   and what to prove before money moves. */
(function () {
  'use strict';

  var C = window.__VERAC;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = C.esc, money = C.money, num = C.num, timeago = C.timeago;
  function pct(x) { return Math.max(0, Math.min(100, +x || 0)); }
  function A() { return window.__VERA_APP; }

  var openUid = null;
  var inspTab = 'overview';
  var inspReturnFocus = null;

  function inspFocusables() {
    var panel = $('[data-inspector]');
    if (!panel) return [];
    return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', panel)
      .filter(function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0; });
  }

  /* keep Tab inside the dialog while it is open */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !openUid) return;
    var els = inspFocusables();
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function open(uid) {
    var app = A();
    var l = app.byUid(uid);
    /* A saved case outlives its listing: say what happened instead of the
       silent nothing a broken button gives. */
    if (!l) {
      var c = app.caseOf(uid);
      var what = c && c.title ? app.tidyTitle(c.title) : 'That listing';
      app.toast(what + ' is no longer in the feed — it was rented or taken down. Your notes are kept.');
      /* a dead deep link should not strand the hash */
      if ((location.hash || '').indexOf('#/listing/') === 0) location.hash = '#/today';
      return;
    }
    inspReturnFocus = document.activeElement;
    openUid = uid;
    inspTab = 'overview';
    /* the URL knows which ledger is open — back closes it (2.3) */
    if ((location.hash || '') !== '#/listing/' + uid) {
      try { history.pushState(null, '', '#/listing/' + uid); } catch (e) {}
    }

    /* shared-element flight: the card's media flies into the ledger (2.2) */
    var srcMedia = document.querySelector('[data-open="' + uid + '"] .dropcard__media');
    function mount() {
      $('[data-inspector]').hidden = false;
      $('[data-scrim]').hidden = false;
      requestAnimationFrame(function () { $('[data-inspector]').classList.add('is-open'); });
      render(l);
      var dst = $('.insp-port__frame');
      if (dst) dst.style.viewTransitionName = 'vera-hero';
    }
    if (!RM && document.startViewTransition && srcMedia) {
      srcMedia.style.viewTransitionName = 'vera-hero';
      var vt = document.startViewTransition(function () {
        srcMedia.style.viewTransitionName = '';
        mount();
      });
      vt.finished.then(function () {
        var dst = $('.insp-port__frame');
        if (dst) dst.style.viewTransitionName = '';
      }).catch(function () {});
      return finishOpen(uid);
    }
    mount();
    return finishOpen(uid);
  }

  function finishOpen(uid) {
    $$('#main tr.is-open, #main .card.is-open').forEach(function (el) { el.classList.remove('is-open'); });
    $$('#main tr[data-open][aria-expanded="true"]').forEach(function (el) { el.setAttribute('aria-expanded', 'false'); });
    var row = $('[data-open="' + uid + '"]');
    if (row && row.tagName === 'TR') { row.classList.add('is-open'); row.setAttribute('aria-expanded', 'true'); }
    var firstStop = $('[data-insp-close]') || $('[data-inspector]');
    if (firstStop) firstStop.focus();
  }

  function close() {
    var wasUid = openUid;
    openUid = null;
    /* if the URL still names this ledger, step the hash back out */
    if (wasUid && (location.hash || '') === '#/listing/' + wasUid) {
      try { history.replaceState(null, '', '#/today'); } catch (e) {}
    }
    var back = inspReturnFocus;
    inspReturnFocus = null;
    if (back && !document.contains(back)) back = null;
    if (back && back.focus) setTimeout(function () { back.focus(); }, 0);
    $$('#main tr[data-open][aria-expanded="true"]').forEach(function (el) { el.setAttribute('aria-expanded', 'false'); });
    $('[data-inspector]').classList.remove('is-open');
    $('[data-scrim]').hidden = true;
    setTimeout(function () { $('[data-inspector]').hidden = true; }, 280);
  }

  function setTab(t) {
    inspTab = t;
    var l = A().byUid(openUid);
    if (l) render(l);
  }

  function rerender() {
    var l = A().byUid(openUid);
    if (l) render(l);
  }

  function kvRow(k, v) { return v == null || v === '' ? '' : '<dt>' + k + '</dt><dd>' + v + '</dd>'; }

  function render(l) {
    var app = A();
    var o = C.ownerRead(l);
    $('[data-insp-kicker]').textContent = (l.recommendation || 'unrated').toUpperCase() + ' · score ' + (l.overall_score != null ? num(l.overall_score, 1) : '—');
    $('[data-insp-title]').textContent = app.addressOf(l) || C.charName(l);
    $('[data-insp-sub]').textContent = [money(l.rent), l.neighborhood, C.charName(l)].filter(Boolean).join(' · ');
    $$('[data-insp-tabs] button').forEach(function (b) {
      var on = b.getAttribute('data-tab') === inspTab;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });

    var c = app.caseOf(l.listing_uid);
    $('[data-insp-actions]').innerHTML = c
      ? '<div class="stagepick">' + app.STAGES.map(function (s) {
          return '<button type="button" data-stage="' + s.id + '" data-uid="' + esc(l.listing_uid) + '" class="' + (c.stage === s.id ? 'is-on' : '') + '">' + s.label + '</button>';
        }).join('') + '</div>'
      : '<button type="button" class="bigbtn bigbtn--save" data-stage="saved" data-uid="' + esc(l.listing_uid) + '">＋ Save to my hunt</button>' +
        (l.source_url ? '<a class="ghostbtn" href="' + esc(l.source_url) + '" target="_blank" rel="noopener noreferrer">Original ↗</a>' : '');
    $('[data-insp-actions]').innerHTML += '<button type="button" class="ghostbtn" data-fieldkit="' + esc(l.listing_uid) + '">Field kit ⎙</button>';

    var body = $('[data-insp-body]');
    var html = '';

    if (inspTab === 'overview') {
      var shot = app.photoLayer(l);
      html += '<div class="insp-port"><span class="insp-port__frame insp-port__frame--gal">' + app.gallery(l) + '</span>' +
        '<span class="insp-port__cap">' + (shot
          ? 'Listing photos, straight from the source post. Photos get staged, reused, and stolen — treat them as claims to check in person, not proof.'
          : 'No photo on this post, so VERA drew the building from the record — floors, era, and lit windows follow this building\'s own data.') +
        '</span></div>';
      if (window.__VERAG && window.__VERAG.ready()) {
        var mini = window.__VERAG.minimap(l, 440, 260);
        if (mini) {
          var pr = window.__VERAG.placeRead(l);
          html += '<div class="insp-sec"><h3>Exactly here</h3><div class="insp-map">' + mini + '</div>' +
            (pr && !pr.agrees ? '<p class="insp-fine">The post says ' + esc(l.neighborhood || '?') + '; the coordinates sit in <b>' + esc(pr.name) + '</b>. Small gaps are normal at borders — big ones are a tell.</p>' : '') +
            '</div>';
        }
      }
      html += l.why_this_listing ? '<div class="insp-sec"><h3>Why this listing</h3><p>' + esc(l.why_this_listing) + '</p></div>' : '';
      html += l.next_move ? '<div class="insp-sec"><h3>Next move</h3><p>' + esc(l.next_move) + '</p></div>' : '';
      var pros = l.trust_strengths || [], cons = l.trust_caveats || [];
      if (pros.length) html += '<div class="insp-sec"><h3>Working for it</h3><ul class="good">' + pros.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      if (cons.length) html += '<div class="insp-sec"><h3>Working against it</h3><ul class="bad">' + cons.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      var tt = C.nearestStation(l);
      var vr = app.valueRead ? app.valueRead(l) : null;
      html += '<dl class="kv">' +
        kvRow('Value', vr ? '<span class="' + (vr.under ? 't-under' : 't-over') + '">' + esc(vr.label) + '</span> <span class="t-dim">(' + esc(vr.src) + ')</span>' : null) +
        kvRow('Neighborhood', l.neighborhood
          ? esc(l.neighborhood) + (l.neighborhood_resolved_from_coords && l.neighborhood_source
              ? ' <span class="t-dim">— posted as ' + esc(l.neighborhood_source) + ', placed by coordinates against the city’s boundaries</span>'
              : '')
          : null) +
        kvRow('Subway', tt ? '≈' + tt.mins + ' min walk · ' + C.lineBullets(tt.lines) + ' ' + esc(tt.name) : null) +
        kvRow('First seen', timeago(l.first_seen_at)) + kvRow('Last seen', timeago(l.last_seen_at)) +
        kvRow('Move-in cash', l.estimated_move_in_cash != null ? money(l.estimated_move_in_cash) : null) +
        kvRow('Fee status', esc(l.fee_status)) + kvRow('Sq ft', l.square_feet ? num(l.square_feet) : null) +
        kvRow('Source', esc(l.source_name)) + '</dl>';
      if (l.source_url) html += '<a class="insp-link" href="' + esc(l.source_url) + '" target="_blank" rel="noopener noreferrer">Open the original listing ↗</a>';

      /* Price memory — VERA's own days-on-market and price path. StreetEasy
         retired its counter; this one cannot be reset by a relist. */
      var ph = l.price_history;
      if (ph && ph.length) {
        var vals = ph.map(function (p) { return +p[1]; });
        var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
        var span = (mx - mn) || 1;
        var w = 380, hgt = 56;
        var pts = vals.map(function (v, i) {
          var x = vals.length === 1 ? w / 2 : (i / (vals.length - 1)) * (w - 12) + 6;
          var y = mx === mn ? hgt / 2 : hgt - 8 - ((v - mn) / span) * (hgt - 18);
          return x.toFixed(1) + ' ' + y.toFixed(1);
        });
        var move = vals[vals.length - 1] - vals[0];
        html += '<div class="insp-sec"><h3>Price memory' + (l.days_seen != null ? ' · seen ' + l.days_seen + ' day' + (l.days_seen === 1 ? '' : 's') : '') + '</h3>' +
          '<svg class="pricepath" viewBox="0 0 ' + w + ' ' + hgt + '" role="img" aria-label="Asking-price history">' +
          '<polyline fill="none" stroke="' + (move > 0 ? '#cf7352' : '#4cc38a') + '" stroke-width="2" stroke-linecap="round" points="' + pts.join(',') + '"/>' +
          '</svg>' +
          '<p class="insp-fine">' + (ph.length === 1
            ? 'Asking ' + money(vals[0]) + ' since ' + esc(ph[0][0]) + ' — no moves while VERA has watched.'
            : 'From ' + money(vals[0]) + ' (' + esc(ph[0][0]) + ') to ' + money(vals[vals.length - 1]) + ' — ' + (move > 0 ? 'up ' : 'down ') + money(Math.abs(move)) + ' across ' + ph.length + ' recorded asks.') + '</p></div>';
      }
    } else if (inspTab === 'money') {
      var m = C.moveInMath(l);
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
          '<li>An application fee over $' + C.LAW.appFeeMax + ' — waived entirely if you bring your own credit and background report from the last 30 days</li>' +
          '<li>A broker fee, if the landlord hired the broker (FARE Act, since ' + C.LAW.fareActFrom + ')</li>' +
          '<li>A "good faith" or holding deposit before the lease is signed</li>' +
          '<li>Key money, or a "tip for the super" to get the keys</li>' +
          '</ul><p class="insp-fine">Screenshot the ask and report it to DCWP through 311. Your deposit is also due back within ' + C.LAW.depositReturnDays + ' days of move-out with an itemized list of any deductions. Watch the quiet workaround too: a first month priced higher than every month after it is a broker fee wearing a disguise.</p></div>';
      }
      html += '<div class="insp-sec"><h3>What you give up here</h3>' +
        '<p class="insp-fine">Owner-direct is where the fair deals and the human negotiation live. It is also, often, where the least legal protection lives. VERA would rather you knew.</p>' +
        C.protections(l).map(function (p) {
          var cls = p.state === 'likely in' ? 'is-good' : p.state === 'likely out' ? 'is-bad' : 'is-unk';
          return '<div class="prot ' + cls + '"><span class="prot__state">' + p.state + '</span>' +
            '<b>' + esc(p.name) + '</b><span class="prot__gives">' + esc(p.gives) + '</span>' +
            '<span class="prot__why">' + esc(p.why) + '</span></div>';
        }).join('') + '</div>';
    } else if (inspTab === 'visit') {
      var cs = app.caseOf(l.listing_uid);
      if (!cs) {
        html += '<div class="insp-sec"><p>Save this listing to your hunt and the viewing checklist becomes yours — ' + C.CHECKS.length + ' things to check while you are standing in the apartment, ticked off and remembered per listing.</p>' +
          '<button type="button" class="bigbtn" data-stage="saved" data-uid="' + esc(l.listing_uid) + '">＋ Save to my hunt</button></div>';
      } else {
        var done = Object.keys(cs.checks || {}).filter(function (k) { return cs.checks[k]; }).length;
        /* the learning loop: after seeing it (or passing), one question */
        if (cs.stage === 'toured' || cs.stage === 'dead' || cs.stage === 'applied') {
          html += '<div class="insp-sec"><h3>Was it as advertised?</h3><div class="outcomes">' +
            ['yes', 'roughly', 'no'].map(function (o) {
              return '<button type="button" data-outcome="' + o + '" data-uid="' + esc(l.listing_uid) + '" class="' + (cs.outcome === o ? 'is-on' : '') + '">' + o + '</button>';
            }).join('') + '</div>' +
            (cs.outcome ? '<p class="insp-fine">Recorded. Outcomes stay in this browser and sharpen your own read of the sources.</p>' : '') + '</div>';
        }
        html += '<div class="insp-sec"><h3>Your notes</h3>' +
          '<textarea class="notes" data-note="' + esc(l.listing_uid) + '" placeholder="Smelled fine. Radiator has a valve. Neighbor says the super is quick.">' + esc(cs.notes || '') + '</textarea></div>' +
          '<div class="insp-sec"><h3>Checklist <span class="cprog">' + done + ' / ' + C.CHECKS.length + '</span></h3>' +
          '<div class="cbar"><span style="width:' + Math.round(done / C.CHECKS.length * 100) + '%"></span></div>' +
          C.checkGroups().map(function (g) {
            return '<p class="cgh">' + esc(g) + '</p>' + C.CHECKS.filter(function (x) { return x.group === g; }).map(function (x) {
              var on = !!(cs.checks || {})[x.id];
              return '<label class="ck ' + (on ? 'is-on' : '') + '"><input type="checkbox" data-check="' + x.id + '" data-uid="' + esc(l.listing_uid) + '"' + (on ? ' checked' : '') + '>' +
                '<span><b>' + esc(x.label) + '</b><em>' + esc(x.why) + '</em></span></label>';
            }).join('');
          }).join('') + '</div>';
      }
    } else if (inspTab === 'records') {
      var stw = C.stewardOf(l);
      html += '<div class="steward steward--big steward--' + stw.grade + '"><b class="steward__grade">' + stw.grade + '</b>' +
        '<span class="steward__body"><span class="steward__word">Stewardship: ' + esc(stw.word) + (stw.score != null ? ' · ' + stw.score + '/100 from ' + stw.known + ' city records (' + (stw.sources || []).join(' · ') + ')' : '') + '</span>' +
        (stw.failures.length ? '<span class="steward__line steward__line--bad">' + stw.failures.map(function (f) { return esc(f.t) + ' <a class="citelink" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">[' + esc(f.src) + ']</a>'; }).join('; ') + '</span>' : '') +
        (stw.strengths.length ? '<span class="steward__line steward__line--good">' + stw.strengths.map(function (f) { return esc(f.t) + ' <a class="citelink" href="' + esc(f.url) + '" target="_blank" rel="noopener noreferrer">[' + esc(f.src) + ']</a>'; }).join('; ') + '</span>' : '') +
        '</span></div>';
      /* Counts without a denominator mislead. Seven violations across 799
         apartments is a very different building from three across 89, and
         the raw numbers above cannot show that. This changes no score — it
         gives the reader the denominator the numbers deserve. */
      var units = +l.unit_count || 0;
      if (units > 0) {
        var sOpen = +l.serious_open_violations || 0;
        var heat3 = +l.heat_hot_water_complaints_3y || 0;
        var per = function (n) { return n === 0 ? 'none' : (n / units).toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + ' per apartment'; };
        html += '<p class="perunit"><b>' + units.toLocaleString() + ' apartments</b> in this building — ' +
          'serious open violations ' + esc(per(sOpen)) + ', heat and hot-water complaints ' + esc(per(heat3)) + ' over three years. ' +
          '<span class="t-dim">A large building carries more of everything; the rate is the fairer read.</span></p>';
      }

      html += '<p class="insp-fine">Landlord? Think a record here is wrong? <a href="/vera/corrections/">How corrections work ↗</a></p>';
      html += '<dl class="kv">' +
        kvRow('BBL', esc(l.bbl)) + kvRow('BIN', esc(l.bin)) +
        kvRow('HPD risk', '<span class="risk ' + C.riskCls(l.hpd_risk_score) + '">' + num(l.hpd_risk_score) + '</span>') +
        kvRow('DOB risk', l.dob_risk_score != null ? '<span class="risk ' + C.riskCls(l.dob_risk_score) + '">' + num(l.dob_risk_score) + '</span>' : null) +
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
      /* the chain of proof — deed → registration → licence → portfolio */
      html += '<div class="insp-sec"><h3>The read</h3><p><span class="tag ' + o.cls + '">' + o.label + '</span></p>' +
        (l.owner_read ? '<p>' + esc(l.owner_read) + '</p>' : '') +
        (l.landlord_reason_summary ? '<p>' + esc(l.landlord_reason_summary) + '</p>' : '') + '</div>' +
        '<dl class="kv">' +
        kvRow('Owner name', esc(l.owner_name)) +
        kvRow('Owner type', esc(l.owner_type)) +
        kvRow('Likely landlord type', esc(String(l.likely_landlord_type || '').replace(/_/g, ' '))) +
        kvRow('Independent score', l.likely_independent_landlord_score != null ? num(l.likely_independent_landlord_score) + ' / 100' : null) +
        kvRow('By-owner signal', l.by_owner_signal ? 'yes' : 'no') +
        kvRow('Mgmt-co signal', l.management_company_signal ? 'yes' : 'no') +
        kvRow('Broker', esc(l.broker_name)) + '</dl>' +
        '<div class="insp-sec"><h3>The chain of proof</h3>' +
        '<p class="insp-fine">Whoever collects your deposit should appear somewhere on this chain. A property manager acting for the owner is normal; a name that matches nothing is not. Mismatch means "ask for proof of authority" — not necessarily scam.</p>' +
        '<ol class="chain">' +
          '<li><b>Deed</b> — ACRIS names the legal owner of record.</li>' +
          '<li><b>Registration</b> — HPD lists the head officer, managing agent, and site contact. Real people, by law.</li>' +
          '<li><b>Entity</b> — an LLC on the deed resolves at the NYS DOS entity search; the mortgage signature page often names the human who signed.</li>' +
          '<li><b>Portfolio</b> — Who Owns What links every building sharing those contacts. Over ten units statewide changes your legal protections above.</li>' +
        '</ol>' +
        '<div class="vtools">' + C.VERIFY_TOOLS.slice(0, 4).map(function (v) {
          return '<a class="vtool" href="' + v[1] + '" target="_blank" rel="noopener noreferrer"><b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>';
        }).join('') + '</div></div>';
      /* The portfolio: what this owner does to their OTHER tenants. A
         building's own file says how this address is kept; this says who
         keeps it, and how they behave everywhere else they hold. */
      var pf = l.landlord_portfolio;
      if (pf && pf.bldgs) {
        var evict = +pf.totalevictions || 0;
        var vpu = +pf.openviolationsperresunit || 0;
        var rsLost = +pf.totalrsdiff || 0;
        var tone = (evict >= 5 || vpu >= 2) ? 'bad' : (evict > 0 || vpu >= 0.5) ? 'warn' : 'good';
        html += '<div class="insp-sec"><h3>The owner\'s wider record</h3>' +
          '<p class="pf-head pf-head--' + tone + '">' + esc(pf.topcorp || 'This portfolio') +
          ' holds <b>' + pf.bldgs + '</b> building' + (pf.bldgs === 1 ? '' : 's') +
          (pf.units ? ' · ' + pf.units + ' units' : '') + '</p>' +
          '<dl class="kv">' +
            kvRow('Evictions filed', evict ? evict + ' across the portfolio' + (pf.avgevictions ? ' (avg ' + pf.avgevictions + ' per building)' : '') : 'none on record') +
            kvRow('Open violations', vpu ? vpu + ' per apartment' + (pf.totalopenviolations ? ' · ' + pf.totalopenviolations + ' total' : '') : 'none open') +
            kvRow('Rent-stabilized units', rsLost < 0 ? '<span class="t-over">' + Math.abs(rsLost) + ' lost from this portfolio</span>' : (rsLost > 0 ? '+' + rsLost : null)) +
            kvRow('Officers on file', (pf.topowners || []).length ? esc((pf.topowners || []).slice(0, 4).join(' · ')) : null) +
          '</dl>' +
          '<p class="insp-fine">Portfolio linked through HPD registration contacts and shared business addresses by ' +
          '<a href="https://whoownswhat.justfix.org/" target="_blank" rel="noopener noreferrer">JustFix\'s Who Owns What</a>. ' +
          'Every figure is a public record, not an opinion — and a large portfolio is not itself a fault.</p></div>';
      }
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
      var fnotes = l.listing_confidence_notes || [];
      if (fnotes.length) html += '<div class="insp-sec"><h3>Forensic deductions</h3><ul class="bad">' + fnotes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      html += '<dl class="kv">' +
        kvRow('Overall', l.overall_score != null ? num(l.overall_score, 1) : null) +
        kvRow('Recommendation', esc(l.recommendation)) +
        kvRow('Authenticity', C.authenticity(l) != null ? num(C.authenticity(l)) + ' / 100 (' + esc(l.listing_confidence_band || '—') + ')' : null) +
        kvRow('State bucket', esc(String(l.state_bucket || '').replace(/_/g, ' '))) + '</dl>';
    } else if (inspTab === 'verify') {
      /* What the post asks for that New York law forbids. This is not a
         guess about intent — it is the listing's own words against the
         statute, so it leads, and it quotes itself. */
      var illegal = l.illegal_demands || [];
      if (illegal.length) {
        html += '<div class="insp-sec"><h3>This listing asks for something the law forbids</h3><ul class="illegal">' +
          illegal.map(function (d) {
            return '<li><b>' + esc(d.says) + '</b>' +
              (d.quote ? '<span class="illegal__q">“' + esc(d.quote) + '”</span>' : '') +
              '<span class="illegal__law">' + esc(d.law) + '</span></li>';
          }).join('') + '</ul>' +
          '<p class="insp-fine">An unlawful demand is not proof of a bad landlord — plenty of small owners are simply working from an old lease template. But you do not have to pay it, and a landlord who insists after being shown the statute has told you who they are.</p></div>';
      }

      var cuesFound = l.scam_cues_found || [];
      if (cuesFound.length) {
        html += '<div class="insp-sec"><h3>Language that runs with fraud</h3><ul class="bad">' +
          cuesFound.map(function (c) {
            return '<li>' + esc(c.says) + (c.quote ? ' <span class="illegal__q">“' + esc(c.quote) + '”</span>' : '') + '</li>';
          }).join('') + '</ul>' +
          '<p class="insp-fine">These correlate with rental fraud; they are not proof of it. Read them as reasons to insist on seeing the apartment and signing before any money moves.</p></div>';
      }

      /* machine-run tells from the engine's forensics pass */
      var tells = [];
      if (l.relist_suspect) tells.push('Relisted after disappearing — the days-on-market counter was reset' + (l.true_days_on_market != null ? '; this address has really been advertising for ' + l.true_days_on_market + ' days' : '') + ' (Scam School: "Days on market reset to three").');
      if (l.contact_reuse_count) tells.push('The contact behind this post appears on ' + l.contact_reuse_count + ' listings in the net (Scam School: "One phone number, thirty listings").');
      if (l.desc_clone_of) tells.push('The description is a near-verbatim template of another listing at a different address — classic template scam fingerprint.');
      if (l.photo_clone_suspect) tells.push('The lead photo also appears on a listing at a different address — treat every photo here as unproven.');
      if (l.photo_declares_ai) tells.push('The photo file declares itself AI-generated' + (typeof l.photo_declares_ai === 'string' ? ' (' + l.photo_declares_ai + ')' : '') + ' — this is the image’s own embedded credential, not a guess. Ask for a photo taken on a phone, and see the unit before any money moves.');
      if (l.ai_photo_suspect) tells.push('The lead photo reads as AI-generated (' + (l.ai_photo_probability ? Math.round(l.ai_photo_probability * 100) + '% classifier confidence' : 'high classifier confidence') + ') — probabilistic, not proof; disclosure of AI-altered photos is a pending NYC rule VERA applies early.');
      if (tells.length) {
        html += '<div class="insp-sec"><h3>Computed tells</h3><ul class="bad">' + tells.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      }
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

      /* Hand the check over when VERA could not make it.
         Verification needs a house number, and 87% of the net does not
         publish one — those listings were getting four lines of generic
         advice and a link back to the post, while a verified listing got
         a full building record. The renter WILL have the address at the
         viewing, which is the moment these tools are worth most, so the
         same ones VERA uses are offered outright rather than kept for the
         listings that happened to be checkable. */
      if (!/^matched/.test(String(l.verification_status || ''))) {
        html += '<div class="insp-sec"><h3>VERA could not check this one — here is how you do it</h3>' +
          '<p class="insp-fine">No house number in the post, so there is no building to look up yet. ' +
          'Ask for the exact address before you apply, then run it through the same public records ' +
          'VERA uses. It takes about a minute and it is the difference between a stranger\'s word and ' +
          'the city\'s.</p>' +
          '<div class="vtools">' + C.VERIFY_TOOLS.map(function (v) {
            return '<a class="vtool" href="' + v[1] + '" target="_blank" rel="noopener noreferrer">' +
              '<b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>';
          }).join('') + '</div></div>';
      }
    }

    body.innerHTML = html || '<p class="lane__empty">Nothing recorded on this tab.</p>';
    body.scrollTop = 0;
  }

  /* ================================================================
     THE FIELD KIT — one printed page to carry into the viewing.
     ================================================================ */

  var FIVE_QUESTIONS = [
    'Who exactly is on the deed — and are you them, their agent, or their manager?',
    'What is the total move-in amount, itemized, in writing?',
    'When was the last heat or hot-water outage, and how fast was it fixed?',
    'Is this unit rent-stabilized — and will the lease carry the state rider?',
    'Who do I call at 2am when something breaks, and how fast do they answer?',
  ];

  function buildFieldKit(l) {
    var app = A();
    var stw = C.stewardOf(l);
    var m = C.moveInMath(l);
    var host = document.getElementById('fieldkit') || document.createElement('div');
    host.id = 'fieldkit';
    /* The printed sheet is its own document and rightly carries an <h1>, but
       this node lives in the DOM permanently. Left visible to assistive tech
       it becomes a second h1 competing with the page's own. `hidden` removes
       it from the accessibility tree; the print stylesheet overrides it. */
    host.hidden = true;
    host.setAttribute('aria-hidden', 'true');
    var kv = function (k, v) { return v == null || v === '' ? '' : '<tr><th>' + k + '</th><td>' + v + '</td></tr>'; };
    host.innerHTML =
      '<h1>' + esc(app.addressOf(l) || C.charName(l)) + '</h1>' +
      '<p class="fk-sub">' + esc(money(l.rent)) + ' · ' + esc(l.neighborhood || '') + ' · steward grade ' + esc(stw.grade) + ' (' + esc(stw.word) + ')' + '</p>' +
      '<p class="fk-link">littlefightnyc.com/vera/#/listing/' + esc(l.listing_uid) + '</p>' +
      (stw.failures.length ? '<p class="fk-warn">On the record: ' + esc(C.stewardText(stw.failures)) + '</p>' : '') +
      /* If the post itself demanded something unlawful, it belongs on the
         sheet you carry in — quoted, with the statute, so you can hold it
         up in the room rather than try to remember it. */
      ((l.illegal_demands || []).length
        ? '<div class="fk-illegal"><h2>This listing asked for something the law forbids</h2><ul>' +
          l.illegal_demands.map(function (d) {
            return '<li><b>' + esc(d.says) + '</b> — “' + esc(d.quote || '') + '”<br><i>' + esc(d.law) + '</i></li>';
          }).join('') + '</ul>' +
          '<p>You do not have to pay it. Ask them to put the demand in writing.</p></div>'
        : '') +
      ((l.scam_cues_found || []).length
        ? '<p class="fk-cues"><b>Caution:</b> ' + esc(l.scam_cues_found.map(function (c) { return c.says; }).join('; ')) + '</p>'
        : '') +
      '<table>' +
        kv('Cash to keys', money(m.total) + ' (first ' + money(m.rent) + ' + deposit ' + money(m.deposit) + ' + $' + m.appFee + ' application)') +
        kv('Illegal to ask', 'deposit over one month · application over $20 · broker fee when the landlord hired them · any money before lease signing') +
        kv('HPD / DOB risk', C.num(l.hpd_risk_score) + ' / ' + C.num(l.dob_risk_score)) +
        kv('Heat complaints 3y', l.heat_hot_water_complaints_3y) +
        kv('Bedbugs 3y', l.bedbug_reports_3y) +
        kv('Litigation 3y', l.litigation_count_3y) +
        kv('Stabilization', l.official_rent_stabilized_list_hit ? 'on the official list' : (l.rent_stabilized_signal || 'unknown')) +
      '</table>' +
      '<h2>Five questions to ask out loud</h2><ol>' +
        FIVE_QUESTIONS.map(function (q) { return '<li>' + esc(q) + '</li>'; }).join('') + '</ol>' +
      '<h2>The viewing checklist</h2><ul class="fk-checks">' +
        C.CHECKS.map(function (c) { return '<li>☐ ' + esc(c.label) + '</li>'; }).join('') + '</ul>' +
      '<h2>Verify the counterparty</h2><p class="fk-chain">Deed: a836-acris.nyc.gov · Registration: hpdonline.nyc.gov · Portfolio: whoownswhat.justfix.org · Licence: dos.ny.gov · Heat outages: portal.311.nyc.gov · Legal unit: a810-bisweb.nyc.gov</p>' +
      /* The page is carried to the viewing, which is where an unverified
         listing finally gets an address. Telling someone to look up six
         records and giving them nowhere to write the one thing they need
         to look them up with is most of the way to being no help at all. */
      (/^matched/.test(String(l.verification_status || ''))
        ? ''
        : '<h2>Write the address down here</h2>' +
          '<p class="fk-chain">VERA could not identify this building — the post carries no house number. ' +
          'Get the exact address at the door and run it through the six above before you hand over anything.</p>' +
          '<p class="fk-write">Address: ________________________________________________<br><br>' +
          'Who showed it, and in what capacity: ______________________________<br><br>' +
          'Name on the deed (ACRIS): _________________________________________</p>') +
      '<p class="fk-foot">VERA field kit · every number above is computed from a cited public record or marked ≈ · printed ' + esc(new Date().toISOString().slice(0, 10)) + '</p>';
    if (!host.parentNode) document.body.appendChild(host);
    return host;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-fieldkit]') : null;
    if (!t) return;
    var l = A().byUid(t.getAttribute('data-fieldkit'));
    if (!l) return;
    buildFieldKit(l);
    window.print();
  });

  window.__VERAL = {
    open: open, close: close, setTab: setTab, rerender: rerender,
    openUid: function () { return openUid; },
    buildFieldKit: buildFieldKit,
  };
})();
