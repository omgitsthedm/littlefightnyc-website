// Platform + connection classes applied before first paint so CSS can tailor
// the experience per engine, form-factor, and network quality without waiting
// for React. Served from same-origin so it satisfies `script-src 'self'`
// (inline scripts are blocked by the site CSP).
(function () {
  const ua = navigator.userAgent;
  const html = document.documentElement;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isIPad = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg/.test(ua);
  const isChrome = /Chrome|Chromium|CriOS/.test(ua) && !/Edg/.test(ua);
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator.standalone === true);

  const classes = [];
  if (isIOS) classes.push("is-ios");
  if (isIPad) classes.push("is-ipad");
  if (isAndroid) classes.push("is-android");
  if (isSafari) classes.push("is-safari");
  if (isChrome) classes.push("is-chrome");
  if (isStandalone) classes.push("is-standalone");

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    const ect = conn.effectiveType;
    const saveData = conn.saveData;
    if (saveData || ect === "slow-2g" || ect === "2g" || ect === "3g") {
      classes.push("is-slow-connection");
    }
    if (saveData) classes.push("is-save-data");
    if (ect) classes.push("is-ect-" + ect);
  }

  if (classes.length) html.classList.add(...classes);
})();
