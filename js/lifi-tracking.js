(() => {
  const script = document.currentScript;
  const ga4Id = script?.dataset.ga4Id || "G-0Q1TGWH0HL";
  const gtmId = script?.dataset.gtmId || "";
  const consentKey = "lifi_consent_v1";
  const sessionKey = "lifi_campaign_v1";
  const campaignKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "gbraid",
    "wbraid",
  ];
  const interactions = ["pointerdown", "keydown", "touchstart"];

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });

  const read = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const write = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return null;
    }
    return value;
  };

  const readSession = (key) => {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const writeSession = (key, value) => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      return null;
    }
    return value;
  };

  const captureCampaign = () => {
    const params = new URLSearchParams(window.location.search);
    const current = readSession(sessionKey);
    let changed = false;

    campaignKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        current[key] = value.slice(0, 220);
        changed = true;
      }
    });

    if (!current.landing_page) {
      current.landing_page = window.location.href;
      changed = true;
    }

    if (!current.referrer && document.referrer) {
      current.referrer = document.referrer.slice(0, 320);
      changed = true;
    }

    if (changed) writeSession(sessionKey, current);
    return current;
  };

  const fillCampaignFields = () => {
    const campaign = captureCampaign();
    document.querySelectorAll("form").forEach((form) => {
      Object.entries(campaign).forEach(([name, value]) => {
        const field = form.querySelector(`[name="${CSS.escape(name)}"]`);
        if (field && !field.value) field.value = value;
      });
    });
  };

  const schedule = (callback) => {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      callback();
      interactions.forEach((eventName) => {
        window.removeEventListener(eventName, run);
      });
    };

    interactions.forEach((eventName) => {
      window.addEventListener(eventName, run, { once: true, passive: true });
    });

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(run, { timeout: 2800 });
    } else {
      window.setTimeout(run, 1800);
    }
  };

  const loadScript = (src) => {
    if (document.querySelector(`script[src="${src}"]`)) return;
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = src;
    document.head.appendChild(tag);
  };

  const loadTracking = () => {
    if (window.__littleFightTrackingLoaded) return;
    window.__littleFightTrackingLoaded = true;

    window.gtag("consent", "update", {
      ad_storage: "granted",
      analytics_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });

    if (gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
    }

    if (ga4Id) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`);
      window.gtag("js", new Date());
      window.gtag("config", ga4Id, { anonymize_ip: true });
    }
  };

  const setConsent = (value) => {
    write(consentKey, value);
    document.documentElement.dataset.consent = value;
    document.querySelector(".lifi-consent")?.remove();
    if (value === "granted") schedule(loadTracking);
  };

  const showConsentBanner = () => {
    if (document.querySelector(".lifi-consent")) return;

    const banner = document.createElement("section");
    banner.className = "lifi-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Privacy preferences");
    banner.innerHTML = `
      <p><strong>Privacy check.</strong> We use analytics only after you say yes, so we can see what is working and keep the site useful.</p>
      <div class="lifi-consent__actions">
        <button type="button" class="lifi-consent__accept">Accept analytics</button>
        <button type="button" class="lifi-consent__decline">Decline</button>
      </div>
    `;

    banner.querySelector(".lifi-consent__accept")?.addEventListener("click", () => {
      setConsent("granted");
    });
    banner.querySelector(".lifi-consent__decline")?.addEventListener("click", () => {
      setConsent("denied");
    });

    document.body.appendChild(banner);
  };

  const boot = () => {
    fillCampaignFields();

    if (navigator.webdriver) return;

    const consent = read(consentKey);
    if (consent === "granted") {
      document.documentElement.dataset.consent = "granted";
      schedule(loadTracking);
    } else if (consent === "denied") {
      document.documentElement.dataset.consent = "denied";
    } else {
      showConsentBanner();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
