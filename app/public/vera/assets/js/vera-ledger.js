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
  function trustedURL(value, kind) { return C.trustedURL ? C.trustedURL(value, kind) : null; }

  var openUid = null;
  var inspTab = 'overview';
  var inspReturnFocus = null;
  var inspOriginHash = '#/today';
  var inspOwnsHistoryEntry = false;
  var inspOriginScroll = { x: 0, y: 0, main: 0 };
  var closeTimer = null;
  var openFrame = null;
  var transitionSerial = 0;
  var backgroundState = null;
  var scrollLockState = null;
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

  function reducedMotion() { return !!(motionQuery && motionQuery.matches); }

  function isVisible(el) {
    if (!el || el.hidden) return false;
    if (el.offsetWidth > 0 || el.offsetHeight > 0) return true;
    return !!(el.getClientRects && el.getClientRects().length);
  }

  function setBackgroundBlocked(blocked) {
    document.documentElement.classList.toggle('vera-inspector-open', blocked);
    if (blocked) {
      if (!backgroundState) {
        backgroundState = $$('.masthead,[data-filters],.filter-dock,[data-route-announce],[data-main],.deckfoot').map(function (el) {
          return { el: el, inert: !!el.inert, ariaHidden: el.getAttribute('aria-hidden') };
        });
        backgroundState.forEach(function (item) {
          item.el.inert = true;
          item.el.setAttribute('aria-hidden', 'true');
        });
      }
      if (!scrollLockState) {
        scrollLockState = {
          html: document.documentElement.style.overflow,
          body: document.body.style.overflow,
        };
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
      }
      return;
    }
    if (backgroundState) {
      backgroundState.forEach(function (item) {
        item.el.inert = item.inert;
        if (item.ariaHidden == null) item.el.removeAttribute('aria-hidden');
        else item.el.setAttribute('aria-hidden', item.ariaHidden);
      });
      backgroundState = null;
    }
    if (scrollLockState) {
      document.documentElement.style.overflow = scrollLockState.html;
      document.body.style.overflow = scrollLockState.body;
      scrollLockState = null;
    }
  }

  function originScroll() {
    var main = $('[data-main]');
    return {
      x: window.scrollX || window.pageXOffset || 0,
      y: window.scrollY || window.pageYOffset || 0,
      main: main ? main.scrollTop : 0,
    };
  }

  function originTarget(uid, preferred) {
    /* Safari does not consistently focus a button when it is clicked. Resolve
       the stable listing opener first instead of restoring BODY (or whatever
       control happened to retain focus before the click). */
    var candidates = $$('[data-open]');
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].getAttribute('data-open') === uid && isVisible(candidates[i])) return candidates[i];
    }
    if (preferred && preferred !== document.body && preferred !== document.documentElement && document.contains(preferred)) return preferred;
    return $('[data-main]');
  }

  function restoreOriginContext(closeId, uid, preferred, scroll) {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (closeId !== transitionSerial || openUid) return;
        var main = $('[data-main]');
        window.scrollTo(scroll.x, scroll.y);
        if (main) main.scrollTop = scroll.main;
        var target = originTarget(uid, preferred);
        if (target && target.focus) {
          try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
        }
        /* Safari may scroll a newly focused row despite preventScroll. The
           saved route position remains authoritative. */
        window.scrollTo(scroll.x, scroll.y);
        if (main) main.scrollTop = scroll.main;
      });
    });
  }

  function inspFocusables() {
    var panel = $('[data-inspector]');
    if (!panel) return [];
    return $$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])', panel)
      .filter(isVisible);
  }

  /* keep Tab inside the dialog while it is open */
  document.addEventListener('keydown', function (e) {
    if (openUid && e.target && e.target.getAttribute && e.target.getAttribute('role') === 'tab' && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(e.key) > -1) {
      /* Responsive CSS hides secondary tabs behind More. Keep roving focus on
         the tabs that are actually present in this layout. */
      var tabs = $$('[data-insp-tabs] [role="tab"]').filter(isVisible);
      if (!tabs.length) return;
      var index = tabs.indexOf(e.target);
      if (index < 0) index = 0;
      if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = tabs.length - 1;
      else index = (index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      e.preventDefault();
      setTab(tabs[index].getAttribute('data-tab'));
      tabs[index].focus();
      return;
    }
    if (e.key !== 'Tab' || !openUid) return;
    var els = inspFocusables();
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  var TESTMODE = /(^|[?&])test=1/.test(location.search);

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
    var wasOpen = !!openUid;
    if (!wasOpen) {
      inspReturnFocus = document.activeElement;
      inspOriginScroll = originScroll();
      inspOriginHash = (location.hash || '').indexOf('#/listing/') === 0
        ? '#/' + ((app.state && app.state.route) || 'today')
        : (location.hash || '#/today');
      inspOwnsHistoryEntry = false;
    }
    openUid = uid;
    inspTab = 'overview';
    var openId = ++transitionSerial;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (openFrame) { cancelAnimationFrame(openFrame); openFrame = null; }
    /* the URL knows which ledger is open — back closes it (2.3) */
    if ((location.hash || '') !== '#/listing/' + uid) {
      try {
        if (wasOpen && inspOwnsHistoryEntry) history.replaceState({ veraListing: uid }, '', '#/listing/' + uid);
        else {
          history.pushState({ veraListing: uid }, '', '#/listing/' + uid);
          inspOwnsHistoryEntry = true;
        }
      } catch (e) {}
    }

    /* shared-element flight: the card's media flies into the ledger (2.2) */
    var srcOpener = document.querySelector('[data-open="' + uid + '"]');
    var srcCard = srcOpener && srcOpener.closest ? srcOpener.closest('.dropcard__hit') : null;
    var srcMedia = srcCard ? $('.dropcard__media', srcCard) : null;
    function mount() {
      if (openId !== transitionSerial || openUid !== uid) return;
      var panel = $('[data-inspector]');
      var scrim = $('[data-scrim]');
      if (!panel || !scrim) return;
      panel.hidden = false;
      scrim.hidden = false;
      render(l);
      finishOpen(uid);
      setBackgroundBlocked(true);
      openFrame = requestAnimationFrame(function () {
        openFrame = null;
        if (openId === transitionSerial && openUid === uid) panel.classList.add('is-open');
      });
      var dst = $('.insp-port__frame');
      if (dst) dst.style.viewTransitionName = 'vera-hero';
    }
    if (!TESTMODE && !reducedMotion() && document.startViewTransition && srcMedia) {
      srcMedia.style.viewTransitionName = 'vera-hero';
      var vt = document.startViewTransition(function () {
        srcMedia.style.viewTransitionName = '';
        mount();
      });
      /* Skipped shared-element transitions are expected when the operator
         moves quickly. Observe every promise so the browser does not surface
         an unhandled AbortError while `finished` still owns cleanup. */
      if (vt.ready) vt.ready.catch(function () {});
      if (vt.updateCallbackDone) vt.updateCallbackDone.catch(function () {});
      vt.finished.then(function () {
        var dst = $('.insp-port__frame');
        if (dst) dst.style.viewTransitionName = '';
      }).catch(function () {});
      return true;
    }
    mount();
    return true;
  }

  function finishOpen(uid) {
    if (openUid !== uid) return;
    $$('#main tr.is-open, #main .card.is-open').forEach(function (el) { el.classList.remove('is-open'); });
    var opener = $('[data-open="' + uid + '"]');
    var row = opener && opener.closest ? opener.closest('tr') : null;
    if (row) row.classList.add('is-open');
    var firstStop = $('[data-insp-close]') || $('[data-inspector]');
    if (firstStop) firstStop.focus();
  }

  function close() {
    var wasUid = openUid;
    var originHash = inspOriginHash || '#/today';
    var ownsHistoryEntry = inspOwnsHistoryEntry;
    var savedScroll = inspOriginScroll;
    var closeId = ++transitionSerial;
    openUid = null;
    inspOwnsHistoryEntry = false;
    inspOriginHash = '#/today';
    inspOriginScroll = { x: 0, y: 0, main: 0 };
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (openFrame) { cancelAnimationFrame(openFrame); openFrame = null; }
    var back = inspReturnFocus;
    inspReturnFocus = null;
    if (back && !document.contains(back)) back = null;
    setBackgroundBlocked(false);
    $$('#main tr.is-open, #main .card.is-open').forEach(function (el) { el.classList.remove('is-open'); });
    var panel = $('[data-inspector]');
    var scrim = $('[data-scrim]');
    if (panel) panel.classList.remove('is-open');
    if (scrim) scrim.hidden = true;
    closeTimer = setTimeout(function () {
      closeTimer = null;
      if (closeId === transitionSerial && !openUid && panel) panel.hidden = true;
    }, reducedMotion() ? 0 : 280);

    /* A ledger opened from a route owns one history entry, so browser Back and
       the visible close controls both return to that exact route. A direct
       listing URL has no in-app origin entry and falls back to Today. */
    var stepsBack = wasUid && (location.hash || '') === '#/listing/' + wasUid && ownsHistoryEntry && !TESTMODE;
    if (stepsBack) {
      window.addEventListener('hashchange', function () {
        restoreOriginContext(closeId, wasUid, back, savedScroll);
      }, { once: true });
    } else {
      restoreOriginContext(closeId, wasUid, back, savedScroll);
    }
    if (wasUid && (location.hash || '') === '#/listing/' + wasUid) {
      try {
        if (stepsBack) history.back();
        else history.replaceState(null, '', originHash);
      } catch (e) {}
    }
  }

  function setTab(t) {
    inspTab = t;
    var sheet = $('[data-tab-sheet]');
    var focusCameFromSheet = !!(sheet && sheet.contains(document.activeElement));
    if (sheet) sheet.hidden = true;
    var more = $('[data-tab-more]');
    if (more) more.setAttribute('aria-expanded', 'false');
    var l = A().byUid(openUid);
    if (l) render(l);
    var active = $('[data-insp-tabs] [data-tab="' + t + '"]');
    if (active && isVisible(active) && active.scrollIntoView) {
      active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
    if (focusCameFromSheet && more) requestAnimationFrame(function () { if (openUid) more.focus(); });
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
      if (!b.hasAttribute('data-tab')) return; /* the More button is chrome, not a tab */
      var on = b.getAttribute('data-tab') === inspTab;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    /* phone overflow mirrors the active tab and lights its More button (C3) */
    $$('[data-tab-sheet] [data-tab]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-tab') === inspTab);
    });
    var tabMore = $('[data-tab-more]');
    if (tabMore) tabMore.classList.toggle('is-on', ['money', 'owner', 'score', 'visit'].indexOf(inspTab) > -1);

    var c = app.caseOf(l.listing_uid);
    var sourceURL = trustedURL(l.source_url, 'listing');
    $('[data-insp-actions]').innerHTML = c
      ? '<div class="stagepick">' + app.STAGES.map(function (s) {
          return '<button type="button" data-stage="' + s.id + '" data-uid="' + esc(l.listing_uid) + '" class="' + (c.stage === s.id ? 'is-on' : '') + '">' + s.label + '</button>';
        }).join('') + '</div>'
      : '<button type="button" class="bigbtn bigbtn--save" data-stage="saved" data-uid="' + esc(l.listing_uid) + '">＋ Save to my hunt</button>' +
        (sourceURL ? '<a class="ghostbtn" href="' + esc(sourceURL) + '" target="_blank" rel="noopener noreferrer">Original ↗</a>' : '');
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
          var exact = !!app.addressOf(l);
          html += '<div class="insp-sec"><h3>' + (exact ? 'Exactly here' : 'Approximate area') + '</h3><button type="button" class="insp-map insp-map--open" data-atlas-focus="' + esc(l.listing_uid) + '" aria-label="Show this listing on the Atlas map">' + mini + '<span class="dropcard__mapaction">View in Atlas <span aria-hidden="true">↗</span></span></button>' +
            (!exact ? '<p class="insp-fine">This post does not carry a complete street address. Its map pin can place the neighborhood, but VERA will not use that pin to name or grade a building.</p>' : '') +
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
      if (sourceURL) html += '<a class="insp-link" href="' + esc(sourceURL) + '" target="_blank" rel="noopener noreferrer">Open the original listing ↗</a>';

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
        var col = move > 0 ? '#cf7352' : '#4cc38a';
        /* pathLength=100 normalizes the draw: CSS animates dashoffset
           100 → 0 so the price path draws itself on tab open. */
        html += '<div class="insp-sec"><h3>Price memory' + (l.days_seen != null ? ' · seen ' + l.days_seen + ' day' + (l.days_seen === 1 ? '' : 's') : '') + '</h3>' +
          '<svg class="pricepath" viewBox="0 0 ' + w + ' ' + hgt + '" role="img" aria-label="Asking-price history">' +
          '<polyline fill="none" stroke="' + col + '" stroke-width="2" stroke-linecap="round" pathLength="100" points="' + pts.join(',') + '"/>' +
          pts.map(function (p, i) {
            if (i !== 0 && i !== pts.length - 1) return '';
            var xy = p.split(' ');
            return '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="' + (i === pts.length - 1 ? 3.4 : 2.4) + '" fill="' + col + '"/>';
          }).join('') +
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
          '<div class="ledger__row"><span>Screening <em>actual cost or $20, whichever is less</em></span><b>up to ' + money(m.appFee) + '</b></div>' +
          '<div class="ledger__row ledger__row--zero"><span>Broker fee</span><b>$0</b></div>' +
          '<div class="ledger__row ledger__row--total"><span>Total <em>using the $20 maximum</em></span><b>' + money(m.total) + '</b></div>' +
          '</div><p class="insp-save">You keep roughly <b>' + money(m.saved) + '</b> that a 15% broker fee would have taken.</p></div>' +
          '<div class="insp-sec"><h3>What a landlord will ask you to prove</h3>' +
          '<p>Annual income of about <b>' + money(m.annualIncomeNeeded) + '</b> (the 40× convention). Short of that, a guarantor is usually asked to show <b>' + money(m.guarantorIncomeNeeded) + '</b>, or an institutional guarantor will stand in for roughly <b>' + money(m.guarantorCost) + '</b> once.</p>' +
          '<p class="insp-fine">Income multiples are landlord convention, not law. Private landlords bend them. Corporate portfolios almost never do — which is exactly why VERA points you at the former.</p></div>' +
          '<div class="insp-sec"><h3>Illegal to ask you for</h3><ul class="bad">' +
          '<li>More than ' + money(m.deposit) + ' in security or prepaid rent</li>' +
          '<li>A screening charge above the actual cost or $' + C.LAW.appFeeMax + ' — waived if you bring a qualifying credit or background report from the last 30 days</li>' +
          '<li>A broker fee, if the landlord hired the broker (FARE Act, since ' + C.LAW.fareActFrom + ')</li>' +
          '<li>An extra "good faith," holding, reservation, or key fee before or at the beginning of the tenancy</li>' +
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
          '<textarea class="notes" name="vera-tour-notes" autocomplete="off" data-note="' + esc(l.listing_uid) + '" aria-label="Private tour notes" placeholder="e.g. Radiator has a valve; neighbor says the super is quick…">' + esc(cs.notes || '') + '</textarea></div>' +
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
        (stw.failures.length ? '<span class="steward__line steward__line--bad">' + stw.failures.map(function (f) { var url = trustedURL(f.url, 'citation'); return esc(f.t) + (url ? ' <a class="citelink" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">[' + esc(f.src) + ']</a>' : ''); }).join('; ') + '</span>' : '') +
        (stw.strengths.length ? '<span class="steward__line steward__line--good">' + stw.strengths.map(function (f) { var url = trustedURL(f.url, 'citation'); return esc(f.t) + (url ? ' <a class="citelink" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">[' + esc(f.src) + ']</a>' : ''); }).join('; ') + '</span>' : '') +
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
          var url = trustedURL(v[1], 'citation');
          return url ? '<a class="vtool" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>' : '';
        }).join('') + '</div></div>';
      /* The portfolio: what this owner does to their OTHER tenants. A
         building's own file says how this address is kept; this says who
         keeps it, and how they behave everywhere else they hold. */
      var pf = l.landlord_portfolio;
      if (pf && pf.bldgs) {
        var portfolioURL = trustedURL('https://whoownswhat.justfix.org/', 'citation');
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
          (portfolioURL ? '<a href="' + esc(portfolioURL) + '" target="_blank" rel="noopener noreferrer">JustFix\'s Who Owns What</a>' : 'JustFix\'s Who Owns What') + '. ' +
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

      /* Machine-run tells from the engine's forensics pass, in the two
         tiers David ruled on (2026-08-05): hard fraud evidence is flagged
         loudly, every time; signals a small landlord could produce by
         sheer laziness get a quiet sticker and never move the score. */
      var hardTells = [];
      if (l.contact_reuse_count) hardTells.push('The contact behind this post appears on ' + l.contact_reuse_count + ' listings in the net (Scam School: "One phone number, thirty listings").');
      if (l.photo_clone_suspect) hardTells.push('The lead photo also appears on a listing at a different address — treat every photo here as unproven.');
      if (l.photo_declares_ai) hardTells.push('The photo file declares itself AI-generated' + (typeof l.photo_declares_ai === 'string' ? ' (' + l.photo_declares_ai + ')' : '') + ' — this is the image’s own embedded credential, not a guess. Ask for a photo taken on a phone, and see the unit before any money moves.');
      if (hardTells.length) {
        html += '<div class="insp-sec insp-sec--flag" data-tells="hard"><h3>Flagged as suspected fraud — the evidence</h3><ul class="bad">' +
          hardTells.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
      }
      /* probabilistic — neither hard evidence nor laziness, keeps its hedge */
      if (l.ai_photo_suspect) {
        html += '<div class="insp-sec"><h3>A signal, not a verdict</h3><ul class="bad"><li>' +
          esc('The lead photo reads as AI-generated (' + (l.ai_photo_probability ? Math.round(l.ai_photo_probability * 100) + '% classifier confidence' : 'high classifier confidence') + ') — probabilistic, not proof; disclosure of AI-altered photos is a pending NYC rule VERA applies early.') +
          '</li></ul></div>';
      }
      var softTells = [];
      if (l.relist_suspect) softTells.push('Relisted after disappearing — the days-on-market counter was reset' + (l.true_days_on_market != null ? '; this address has really been advertising for ' + l.true_days_on_market + ' days' : '') + ' (Scam School: "Days on market reset to three").');
      if (l.desc_clone_of) softTells.push('The description is a near-verbatim template of another listing at a different address.');
      if (softTells.length) {
        html += '<div class="insp-sec" data-tells="soft"><h3>Could be laziness, could be worse</h3><ul class="soft">' +
          softTells.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
          '<p class="insp-fine">Small landlords reuse copy and repost quiet listings all the time — these alone prove nothing and never move the score. They matter only when they stack with the flags above.</p></div>';
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
      if (sourceURL) html += '<a class="insp-link" href="' + esc(sourceURL) + '" target="_blank" rel="noopener noreferrer">Cross-check the source listing ↗</a>';

      /* Hand the check over when VERA could not make it.
         Verification needs a house number, and 87% of the net does not
         publish one — those listings were getting four lines of generic
         advice and a link back to the post, while a verified listing got
         a full building record. The renter WILL have the address at the
         viewing, which is the moment these tools are worth most, so the
         same ones VERA uses are offered outright rather than kept for the
         listings that happened to be checkable. */
      if (C.needsVerify(l)) {
        var postedAddress = C.exactAddressText(l);
        html += '<div class="insp-sec"><h3>VERA could not identify this building yet</h3>' +
          '<p class="insp-fine">' + (postedAddress
            ? 'The post carries an address, but VERA did not get a strong enough public-record match to attach a building automatically. Confirm the address before you apply. '
            : 'The post does not carry a usable house number, so there is no building to look up yet. Ask for the exact address before you apply. ') +
          'VERA can resolve the address against NYC Planning, ' +
          'then hand you the building identifiers without changing the published listing or its score.</p>' +
          app.addressCheckMarkup(l) +
          '<h4 class="vtools__head">Or open the public records yourself</h4>' +
          '<div class="vtools">' + C.VERIFY_TOOLS.map(function (v) {
            var url = trustedURL(v[1], 'citation');
            return url ? '<a class="vtool" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
              '<b>' + esc(v[0]) + ' ↗</b><span>' + esc(v[2]) + '</span></a>' : '';
          }).join('') + '</div></div>';
      }
    }

    body.innerHTML = html || '<p class="lane__empty">Nothing recorded on this tab.</p>';
    body.setAttribute('aria-labelledby', 'vera-tab-' + inspTab);
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
        kv('Cash to keys', 'up to ' + money(m.total) + ' (first ' + money(m.rent) + ' + deposit ' + money(m.deposit) + ' + up to $' + m.appFee + ' screening)') +
        kv('Illegal to ask', 'deposit over one month · screening above actual cost or $20 · broker fee when the landlord hired them · extra holding, reservation, or key fee') +
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
      (C.hasMatchedRecord(l)
        ? ''
        : '<h2>Write the address down here</h2>' +
          '<p class="fk-chain">VERA could not identify this building' +
          (C.exactAddressText(l) ? ' strongly enough from the public-record match. ' : ' because the post carries no usable house number. ') +
          'Confirm the exact address and run it through the six above before you hand over anything.</p>' +
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
    _render: render, /* acceptance-suite hook: render a fixture listing */
  };
})();
