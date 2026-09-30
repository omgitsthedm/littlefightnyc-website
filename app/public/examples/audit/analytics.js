(function installAuditAnalytics(global) {
  "use strict";

  var CONSENT_KEY = "lf_analytics_consent_v1";
  var MEASUREMENT_TEST_KEY = "lfnyc_measurement_test";
  var MEASUREMENT_TEST_QUERY_KEY = "qa";
  var GA_MEASUREMENT_ID = "G-0Q1TGWH0HL";
  var GA_DISABLE_KEY = "ga-disable-" + GA_MEASUREMENT_ID;
  var GA_SRC = "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(GA_MEASUREMENT_ID);
  var ALLOWED_EVENTS = {
    page_view: true,
    audit_scan_started: true,
    audit_scan_accepted: true,
    generate_lead: true,
    audit_report_ready: true,
    audit_scan_failed: true,
    website_check_started: true,
    website_check_ready: true,
    report_opened: true,
    human_review_requested: true,
    booking_started: true,
    service_inquiry: true
  };
  var SAFE_PARAMETER_KEYS = {
    failure_category: true,
    funnel_stage: true,
    page_path: true,
    placement: true,
    response_status: true,
    entry_source: true
  };
  var GA_COOKIE_PREFIXES = ["_ga", "_gid", "_gat"];
  var booted = false;
  var pageViewTracked = false;

  function hasConsent() {
    try {
      return global.localStorage.getItem(CONSENT_KEY) === "granted";
    } catch (_) {
      return false;
    }
  }

  function measurementTestMode() {
    var requested;
    try {
      requested = new URLSearchParams(global.location.search).get(MEASUREMENT_TEST_QUERY_KEY);
      // The Audit Lab scrubs incoming form fields from history before deferred
      // scripts run. Navigation Timing retains the original URL long enough
      // to establish this tab-only QA mode without retaining visitor input.
      if (!requested && global.performance && global.performance.getEntriesByType) {
        var navigation = global.performance.getEntriesByType("navigation")[0];
        if (navigation && navigation.name) {
          requested = new URL(navigation.name, global.location.origin)
            .searchParams.get(MEASUREMENT_TEST_QUERY_KEY);
        }
      }
    } catch (_) {
      requested = null;
    }
    var requestedMode = requested === "diagnostic" ? "diagnostic" : requested === "1" ? "qa" : null;
    try {
      if (requestedMode) {
        global.sessionStorage.setItem(MEASUREMENT_TEST_KEY, requestedMode);
        return requestedMode;
      }
      var stored = global.sessionStorage.getItem(MEASUREMENT_TEST_KEY);
      // Preserve legacy `1` as ordinary QA; only the exact URL can enable
      // diagnostic collection.
      return stored === "diagnostic" ? "diagnostic" : stored === "qa" || stored === "1" ? "qa" : null;
    } catch (_) {
      return requestedMode;
    }
  }

  function isCanonicalHost() {
    return global.location.hostname === "littlefightnyc.com" ||
      global.location.hostname === "www.littlefightnyc.com";
  }

  function ensureGtag() {
    global.dataLayer = global.dataLayer || [];
    global.gtag = global.gtag || function gtag() {
      global.dataLayer.push(arguments);
    };
  }

  function updateGoogleConsent(value) {
    ensureGtag();
    global.gtag("consent", "update", {
      ad_storage: "denied",
      analytics_storage: value,
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function clearGaCookies() {
    var host = global.location.hostname;
    var bare = host.replace(/^www\./, "");
    var domains = ["", host, "." + host, bare, "." + bare];
    var paths = ["/", global.location.pathname];
    var names = document.cookie
      .split(";")
      .map(function (pair) { return pair.split("=")[0].trim(); })
      .filter(Boolean);

    Array.from(new Set(names)).forEach(function (name) {
      if (!GA_COOKIE_PREFIXES.some(function (prefix) {
        return name === prefix || name.indexOf(prefix) === 0;
      })) return;

      Array.from(new Set(domains)).forEach(function (domain) {
        Array.from(new Set(paths)).forEach(function (path) {
          document.cookie = name +
            "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + path +
            (domain ? "; domain=" + domain : "") +
            "; SameSite=Lax";
        });
      });
    });
  }

  function revoke() {
    global[GA_DISABLE_KEY] = true;
    updateGoogleConsent("denied");
    /* Remove either the current direct tag or a retired container left by a
       cached page. The denied Consent Mode update above lands first. */
    document.querySelectorAll("script[src]").forEach(function (script) {
      try {
        var source = new URL(script.src, global.location.href);
        if (source.hostname === "www.googletagmanager.com" &&
          (source.pathname === "/gtm.js" || source.pathname === "/gtag/js")) {
          script.remove();
        }
      } catch (_) {}
    });
    clearGaCookies();
    booted = false;
    pageViewTracked = false;
  }

  function boot() {
    if (booted || !hasConsent() || !isCanonicalHost() || measurementTestMode() === "qa") return;
    global[GA_DISABLE_KEY] = false;
    updateGoogleConsent("granted");
    global.gtag("js", new Date());
    global.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    if (!document.querySelector('script[src="' + GA_SRC + '"]')) {
      var script = document.createElement("script");
      script.async = true;
      script.src = GA_SRC;
      document.head.appendChild(script);
    }
    booted = true;
  }

  function safeParameters(parameters) {
    var safe = {};
    Object.keys(parameters || {}).forEach(function (key) {
      if (SAFE_PARAMETER_KEYS[key]) safe[key] = parameters[key];
    });
    safe.page_path = global.location.pathname;
    safe.entry_source = "audit_lab";
    safe.placement = safe.placement ||
      (global.location.pathname.indexOf("/report/") !== -1 ? "audit_report" : "audit_lab");
    return safe;
  }

  function track(eventName, parameters) {
    if (!ALLOWED_EVENTS[eventName] || !hasConsent()) return;
    var safe = safeParameters(parameters);
    var testMode = measurementTestMode();

    // A local event makes the privacy boundary testable without contacting a
    // vendor from localhost or a deploy preview. It contains no submitted URL,
    // email address, audit ID, report URL, or provider error text.
    global.dispatchEvent(new CustomEvent("lf:audit-analytics", {
      detail: {
        eventName: eventName,
        parameters: testMode ? Object.assign({}, safe, { measurement_test: testMode }) : safe
      }
    }));

    if (!isCanonicalHost() || testMode === "qa") return;
    boot();
    global.gtag("event", eventName,
      testMode === "diagnostic"
        ? Object.assign({}, safe, { debug_mode: true, traffic_type: "internal" })
        : safe);
  }

  function syncConsent() {
    if (!hasConsent()) {
      revoke();
      return;
    }
    var testMode = measurementTestMode();
    if (testMode === "qa") {
      revoke();
      if (!pageViewTracked) {
        pageViewTracked = true;
        track("page_view", { funnel_stage: "awareness" });
      }
      return;
    }
    if (!isCanonicalHost()) return;

    boot();
    if (!pageViewTracked) {
      pageViewTracked = true;
      track("page_view", { funnel_stage: "awareness" });
    }
  }

  global.LittleFightAuditAnalytics = Object.freeze({ track: track });

  ensureGtag();
  global.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  syncConsent();

  global.addEventListener("storage", function (event) {
    if (event.key === CONSENT_KEY) syncConsent();
  });
  global.addEventListener("pageshow", syncConsent);
  global.addEventListener("lf:analytics-consent", syncConsent);
})(window);
